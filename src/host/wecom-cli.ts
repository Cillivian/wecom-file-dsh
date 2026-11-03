/**
 * Host side of the WeDrive picker: every listing goes through the machine's
 * already authorized `wecom-cli`, so the browser never needs a WeCom web
 * session.
 *
 * This module owns the CLI invocation (executable resolution, bounded output,
 * deadlines), the mapping from CLI entries onto chip payloads, and the
 * interactive `auth init` QR relay. The HTTP surface that exposes it lives in
 * `./routes.ts`. The subprocess seam is typed locally, so the package needs no
 * extra runtime dependency.
 */
import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  type PickerAuthState, type PickerBlockCode, type PickerFilesResponse, type PickerItem,
  type PickerStatusPayload,
} from '../shared/protocol.ts'

/** CLI executable name resolved through the composition's subprocess seam. */
const CLI_NAME = 'wecom-cli'

/** File the running login attempt writes its QR image to, relative to the state directory. */
const QR_FILE = 'qr.png'

/** Cap on one listing call; WeDrive search answers well inside this. */
const LIST_TIMEOUT_MS = 20_000

/** Cap on one `-V` / `auth show --status` probe. */
const PROBE_TIMEOUT_MS = 15_000

/** One login attempt may wait for a human scan for a long time. */
const AUTH_TIMEOUT_MS = 10 * 60_000

/** Grace handed to the provider's termination procedure. */
const TERMINATION_GRACE_MS = 3_000

/** In-memory stdout tail for one collected call. */
const MAX_STDOUT_BYTES = 2 * 1024 * 1024

/** In-memory stderr tail for one collected call. */
const MAX_STDERR_BYTES = 64 * 1024

/** Default page size; the CLI caps `limit` at 100. */
const DEFAULT_PAGE_SIZE = 30

/** Largest page the CLI accepts. */
const MAX_PAGE_SIZE = 100

/** Ceiling for the QR image the CLI writes; anything larger is not one. */
const MAX_QR_BYTES = 1024 * 1024

/** One offset-based collected stream. */
interface CollectedStream {
  readFrom(fromByte: number): { readonly text: string; readonly nextOffset: number }
}

/** The subprocess-service surface this module consumes. */
export interface PickerSubprocess {
  resolveExecutable(
    command: string,
    env?: Readonly<Record<string, string>>,
    signal?: AbortSignal,
  ): Promise<string>
  spawn(spec: {
    argv: readonly string[]
    cwd: string
    stdio: {
      stdin: 'ignore'
      stdout: { maxBytes: number }
      stderr: { maxBytes: number }
    }
    graceMs: number
    signal?: AbortSignal
  }): PickerProcess
}

/** One managed child process. */
interface PickerProcess {
  readonly collected: { readonly stdout?: CollectedStream; readonly stderr?: CollectedStream }
  readonly done: Promise<{ readonly exitCode: number | null; readonly signal: string | null }>
  terminate(): void
}

/** One `wecom-cli` invocation result. */
interface CliCall {
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: number | null
}

/** Classified picker failure, rendered as a refusal payload. */
export class PickerError extends Error {
  /** Which refusal the browser sees. */
  readonly code: PickerBlockCode

  /**
   * @param code - which refusal the browser sees.
   * @param message - operator-facing detail.
   */
  constructor(code: PickerBlockCode, message: string) {
    super(message)
    this.name = 'PickerError'
    this.code = code
  }
}

/** Runtime state of one login attempt. */
interface AuthAttempt {
  readonly handle: PickerProcess
  readonly timer: NodeJS.Timeout
  offset: number
  link?: string
  exitCode?: number | null
  stderr?: string
}

/** Read a non-empty trimmed string field. */
function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/** Read an integer field from a JSON-ish value. */
function integer(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^\d+$/u.test(value.trim())) return Number(value)
  return undefined
}

/**
 * First JSON object in one CLI stdout stream.
 *
 * The CLI prints a single pretty-printed document; the scan tolerates a leading
 * banner line without pretending to be a general parser.
 */
function firstJson(stdout: string): Record<string, unknown> | undefined {
  const start = stdout.indexOf('{')
  if (start === -1) return undefined
  const end = stdout.lastIndexOf('}')
  if (end <= start) return undefined
  try {
    const parsed = JSON.parse(stdout.slice(start, end + 1)) as unknown
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined
  } catch {
    // A truncated or non-JSON body is exactly the "no payload" case.
    return undefined
  }
}

/**
 * Business error codes that mean the bot must authorize again: an expired CLI
 * token, a missing or invalid access token, or an invalid credential.
 */
const AUTH_ERROR_CODES: ReadonlySet<number> = new Set([
  853004, // cli token expired
  40001, // invalid credential (access token)
  40014, // invalid access token
  42001, // access token expired
])

/**
 * Textual signatures of an authorization failure.
 *
 * The CLI wraps different layers, so the same failure can reach us as a
 * framework error (`AuthError: …`), a bare transport note (`endpoint requires
 * auth but no token available`) or a localized instruction (`请先运行
 * wecom-cli auth init 登录`). All of them are resolvable by the same QR login,
 * and a miss here would leave the panel with a dead end instead of a
 * re-authorize button.
 */
const AUTH_ERROR_TEXT = /token\s*expired|invalid\s*token|autherror|requires?\s+auth|no\s+token|not\s+authori[sz]ed|unauthorized|credential|授权|未授权|登录|扫码|auth\s+init/iu

/**
 * Normalize the failure envelope shared by the CLI's framework and business
 * layers, so an expired bot token surfaces as "re-authorize" rather than a raw
 * dump.
 */
function failureOf(payload: Record<string, unknown> | undefined, stderr: string, exitCode: number | null): PickerError {
  const business = payload?.error
  const nested = typeof business === 'object' && business !== null ? business as Record<string, unknown> : undefined
  const code = integer(payload?.errcode) ?? integer(nested?.code)
  const message = text(payload?.errmsg) ?? text(nested?.message) ?? text(stderr)
    ?? `${CLI_NAME} exited with ${String(exitCode)} and no JSON payload`
  if ((code !== undefined && AUTH_ERROR_CODES.has(code)) || AUTH_ERROR_TEXT.test(message)) {
    return new PickerError('unauthorized', message)
  }
  return new PickerError('error', message)
}

/** Project one CLI entry onto a chip payload; entries without an id are dropped. */
function itemOf(value: unknown): PickerItem | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  const docId = text(raw.docid)
  const id = docId ?? text(raw.id)
  if (id === undefined) return undefined
  const type = text(raw.type)
  const kind = type === 'folder' || type === 'space' ? 'folder' : 'file'
  const place = [text(raw.space_name), text(raw.folder_name)].filter((part): part is string => part !== undefined)
  const path = place.length > 0 ? place.join(' / ') : text(raw.path)
  const url = text(raw.doc_url)
  const updatedAt = text(raw.update_time)
  const size = integer(raw.file_size)
  const spaceId = text(raw.space_id)
  const spaceName = text(raw.space_name)
  const folderId = text(raw.folder_id)
  const folderName = text(raw.folder_name)
  return {
    id,
    idKind: docId === undefined ? 'file' : 'doc',
    name: text(raw.file_name) ?? id,
    kind,
    ...(type === undefined ? {} : { type }),
    ...(url === undefined ? {} : { url }),
    ...(path === undefined ? {} : { path }),
    ...(updatedAt === undefined ? {} : { updatedAt }),
    ...(size === undefined ? {} : { size }),
    ...(spaceId === undefined ? {} : { spaceId }),
    ...(spaceName === undefined ? {} : { spaceName }),
    ...(folderId === undefined ? {} : { folderId }),
    ...(folderName === undefined ? {} : { folderName }),
  }
}


/** Collection state directory: QR images live here and nowhere else. */
function stateDirectory(): string {
  const home = text(process.env.DSH_HOME) ?? join(tmpdir(), 'dsh-wecom-picker')
  return join(home, 'storages', 'wecom-picker')
}


/**
 * Host-side WeCom CLI carrier plus the picker's HTTP surface.
 *
 * Listing and status calls are independent, so one `wecom-cli` process is
 * spawned per request. At most one login attempt is retained, for the QR route
 * and for {@link status}.
 */
export class WecomPickerHost {
  private binary: Promise<string> | undefined
  private version: string | undefined
  private attempt: AuthAttempt | undefined
  private disposed = false
  private readonly subprocess: PickerSubprocess
  private readonly logger: { warn(value: unknown): void }

  /**
   * @param subprocess - the composition's subprocess seam.
   * @param logger - composition logger for background failures.
   */
  constructor(subprocess: PickerSubprocess, logger: { warn(value: unknown): void }) {
    this.subprocess = subprocess
    this.logger = logger
  }

  /** Resolve and cache the CLI executable; a failed lookup is retried next call. */
  private executable(): Promise<string> {
    this.binary ??= this.subprocess.resolveExecutable(CLI_NAME).catch((error: unknown) => {
      this.binary = undefined
      throw new PickerError('missing', `未找到可执行的 ${CLI_NAME}：${error instanceof Error ? error.message : String(error)}`)
    })
    return this.binary
  }

  /** Run one CLI call with bounded output and a deadline. */
  private async call(argv: readonly string[], timeoutMs: number): Promise<CliCall> {
    const binary = await this.executable()
    const directory = stateDirectory()
    await mkdir(directory, { recursive: true })
    const controller = new AbortController()
    const timer = setTimeout(() => { controller.abort() }, timeoutMs)
    try {
      const handle = this.subprocess.spawn({
        argv: [binary, ...argv],
        cwd: directory,
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: MAX_STDOUT_BYTES },
          stderr: { maxBytes: MAX_STDERR_BYTES },
        },
        graceMs: TERMINATION_GRACE_MS,
        signal: controller.signal,
      })
      let exitCode: number | null = null
      try {
        exitCode = (await handle.done).exitCode
      } catch (error) {
        throw new PickerError('error', `${CLI_NAME} 启动失败：${error instanceof Error ? error.message : String(error)}`)
      }
      if (controller.signal.aborted) {
        throw new PickerError('error', `${CLI_NAME} 超时（${String(timeoutMs)}ms）`)
      }
      return {
        stdout: handle.collected.stdout?.readFrom(0).text ?? '',
        stderr: handle.collected.stderr?.readFrom(0).text ?? '',
        exitCode,
      }
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Authorization state from `auth show --status`.
   *
   * A running login attempt short-circuits the probe: while the CLI waits for a
   * scan the account is still unauthorized, and re-probing every poll would
   * spawn needless processes.
   */
  private async authorization(): Promise<{ authorized: boolean; detail?: string }> {
    if (this.attempt !== undefined && this.attempt.exitCode === undefined) return { authorized: false }
    const { stdout, stderr, exitCode } = await this.call(['auth', 'show', '--status'], PROBE_TIMEOUT_MS)
    if (exitCode !== 0 && stdout.trim() === '') {
      return { authorized: false, detail: text(stderr) ?? `${CLI_NAME} auth show exited with ${String(exitCode)}` }
    }
    const authorized = stdout.split(/\s+/u).some(token => token.trim().toLowerCase() === 'authorized')
    return authorized ? { authorized: true } : { authorized: false, detail: text(stdout) ?? text(stderr) }
  }

  /** CLI version, probed once per plugin life. */
  private async cliVersion(): Promise<string | undefined> {
    if (this.version !== undefined) return this.version
    try {
      this.version = text((await this.call(['-V'], PROBE_TIMEOUT_MS)).stdout)
      return this.version
    } catch {
      // Version is decoration; a probe failure must not hide the real refusal.
      return undefined
    }
  }

  /** Observation payload for one in-flight (or just finished) login attempt. */
  private attemptState(): PickerAuthState {
    const attempt = this.attempt
    if (attempt === undefined) return { phase: 'idle' }
    const stream = attempt.handle.collected.stdout
    if (stream !== undefined) {
      const read = stream.readFrom(attempt.offset)
      attempt.offset = read.nextOffset
      const link = /https?:\/\/[^\s"'<>）)]+/u.exec(read.text)?.[0]
      if (link !== undefined) attempt.link = link
    }
    if (attempt.exitCode === undefined) {
      return { phase: 'waiting', ...(attempt.link === undefined ? {} : { link: attempt.link }) }
    }
    if (attempt.exitCode === 0) return { phase: 'idle' }
    return {
      phase: 'failed',
      ...(attempt.link === undefined ? {} : { link: attempt.link }),
      message: text(attempt.stderr) ?? `${CLI_NAME} auth init exited with ${String(attempt.exitCode)}`,
    }
  }

  /** Watch one attempt for exit; its outcome is read from the collected streams. */
  private watchAttempt(attempt: AuthAttempt): void {
    const settle = (exitCode: number | null): void => {
      clearTimeout(attempt.timer)
      if (this.attempt !== attempt) return
      attempt.exitCode = exitCode
      attempt.stderr = attempt.handle.collected.stderr?.readFrom(0).text
    }
    void attempt.handle.done.then(outcome => { settle(outcome.exitCode) }).catch((error: unknown) => {
      this.logger.warn(error)
      settle(null)
    })
  }

  /**
   * Retire the current attempt: stop reporting it and make sure no login
   * process outlives it. A settled attempt is only forgotten; a running one is
   * terminated, so its late exit cannot flip a newer attempt's state.
   */
  private dropAttempt(): void {
    const attempt = this.attempt
    this.attempt = undefined
    if (attempt === undefined) return
    clearTimeout(attempt.timer)
    if (attempt.exitCode !== undefined) return
    try {
      attempt.handle.terminate()
    } catch (error) {
      this.logger.warn(error)
    }
  }

  /** GET `/wecom-picker/status`. */
  async status(): Promise<PickerStatusPayload> {
    const auth = this.attemptState()
    try {
      const version = await this.cliVersion()
      const described = version === undefined ? {} : { version }
      // A settled failure is authoritative: the bot-config probe still reports
      // "authorized" while the runtime token is stale, and losing the failure
      // would leave the panel silently re-offering the same button.
      if (auth.phase === 'failed') return { state: 'unauthorized', ...described, auth }
      const { authorized, detail } = await this.authorization()
      if (authorized) {
        this.dropAttempt()
        return { state: 'authorized', ...described, auth: { phase: 'idle' } }
      }
      return {
        state: 'unauthorized',
        ...described,
        ...(detail === undefined ? {} : { message: detail }),
        auth,
      }
    } catch (error) {
      const failure = error instanceof PickerError ? error : new PickerError('error', String(error))
      return { state: failure.code, message: failure.message, auth }
    }
  }

  /** GET `/wecom-picker/files`. */
  async files(query: string, cursor: string | undefined, limit: number | undefined): Promise<PickerFilesResponse> {
    const size = Math.min(Math.max(limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
    const keyword = query.trim()
    const body = keyword === ''
      ? { limit: size, ...(cursor === undefined ? {} : { cursor }) }
      : { keywords: [keyword], limit: size, ...(cursor === undefined ? {} : { cursor }) }
    const argv = ['disk', 'files', keyword === '' ? 'list' : 'search', '--json', JSON.stringify(body)]
    const { stdout, stderr, exitCode } = await this.call(argv, LIST_TIMEOUT_MS)
    const payload = firstJson(stdout)
    if (payload === undefined) throw failureOf(undefined, stderr, exitCode)
    if (integer(payload.errcode) !== undefined && integer(payload.errcode) !== 0) throw failureOf(payload, stderr, exitCode)
    if (payload.error !== undefined && payload.error !== null) throw failureOf(payload, stderr, exitCode)
    if (!Array.isArray(payload.files) && exitCode !== 0) throw failureOf(payload, stderr, exitCode)
    const raw = Array.isArray(payload.files) ? payload.files : []
    const items = raw.map(itemOf).filter((item): item is PickerItem => item !== undefined)
    const nextCursor = text(payload.next_cursor)
    return {
      ok: true,
      items,
      hasMore: payload.has_more === true && nextCursor !== undefined,
      ...(nextCursor === undefined ? {} : { nextCursor }),
    }
  }

  /**
   * POST `/wecom-picker/auth/start`: begin one QR login and wait in the
   * background.
   *
   * Without `restart` a running attempt is reused, so a repeated request cannot
   * spawn a second login process for the QR already on screen. With `restart`
   * the running attempt is retired first: a QR code cannot be refreshed in
   * place, so an expired code (or one whose scan failed without settling) can
   * only be recovered by starting a new login.
   */
  async startAuth(options: { readonly restart?: boolean } = {}): Promise<PickerAuthState> {
    if (this.disposed) throw new PickerError('error', '选择器已卸载，无法开始登录')
    if (options.restart !== true) {
      const current = this.attemptState()
      if (current.phase === 'waiting') return current
    }
    this.dropAttempt()
    const binary = await this.executable()
    const directory = stateDirectory()
    await mkdir(directory, { recursive: true })
    await rm(join(directory, QR_FILE), { force: true })
    const controller = new AbortController()
    const timer = setTimeout(() => { controller.abort() }, AUTH_TIMEOUT_MS)
    let handle: PickerProcess
    try {
      handle = this.subprocess.spawn({
        argv: [binary, 'auth', 'init', '--noninteractive', '--no-browser', '--output-qrcode', QR_FILE],
        cwd: directory,
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: MAX_STDOUT_BYTES },
          stderr: { maxBytes: MAX_STDERR_BYTES },
        },
        graceMs: TERMINATION_GRACE_MS,
        signal: controller.signal,
      })
    } catch (error) {
      clearTimeout(timer)
      throw new PickerError('error', `${CLI_NAME} auth init 启动失败：${error instanceof Error ? error.message : String(error)}`)
    }
    const attempt: AuthAttempt = { handle, timer, offset: 0 }
    this.attempt = attempt
    this.watchAttempt(attempt)
    // Disposal may have happened while the process was being spawned; a login
    // that nobody can observe must not keep waiting for a scan for ten minutes.
    if (this.disposed) {
      this.dropAttempt()
      throw new PickerError('error', '选择器已卸载，登录尝试已结束')
    }
    return { phase: 'waiting' }
  }

  /** GET `/wecom-picker/auth/qr.png`: the QR image of the running attempt, when written. */
  async qrImage(): Promise<Buffer | undefined> {
    try {
      const file = join(stateDirectory(), QR_FILE)
      const info = await stat(file)
      // The file is written by the CLI, not by HTTP; still bound what this
      // process pulls into memory.
      if (info.size > MAX_QR_BYTES) return undefined
      return await readFile(file)
    } catch {
      // No QR yet (or a login attempt never wrote one): the browser retries.
      return undefined
    }
  }

  /** Retire the running login attempt; the composition calls this on disposal. */
  dispose(): void {
    this.disposed = true
    this.dropAttempt()
  }
}

