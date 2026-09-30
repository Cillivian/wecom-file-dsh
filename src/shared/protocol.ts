/**
 * Wire contract of the host-side WeDrive picker, shared verbatim by the Host
 * routes and the browser half.
 *
 * Every read goes through the already authorized `wecom-cli`, so the browser
 * never needs a WeCom web session: no iframe, no third-party cookies, no
 * top-level navigation, and no external-browser login hop.
 *
 * Browser references are document-relative (`*_ROUTE`); server route keys stay
 * absolute pathnames (`*_PATH`), per the web app-owned route convention.
 */

/** GET: authorization state, CLI version, and any in-flight login attempt. */
export const PICKER_STATUS_PATH = '/wecom-picker/status'

/** Browser-relative form of {@link PICKER_STATUS_PATH}. */
export const PICKER_STATUS_ROUTE = PICKER_STATUS_PATH.slice(1)

/** GET: recently browsed files, or keyword search results when `q` is present. */
export const PICKER_FILES_PATH = '/wecom-picker/files'

/** Browser-relative form of {@link PICKER_FILES_PATH}. */
export const PICKER_FILES_ROUTE = PICKER_FILES_PATH.slice(1)

/** POST: start one `wecom-cli auth init` QR login, waiting for a scan. */
export const PICKER_AUTH_START_PATH = '/wecom-picker/auth/start'

/** Browser-relative form of {@link PICKER_AUTH_START_PATH}. */
export const PICKER_AUTH_START_ROUTE = PICKER_AUTH_START_PATH.slice(1)

/** GET: the QR image written by the running login attempt. */
export const PICKER_AUTH_QR_PATH = '/wecom-picker/auth/qr.png'

/** Browser-relative form of {@link PICKER_AUTH_QR_PATH}. */
export const PICKER_AUTH_QR_ROUTE = PICKER_AUTH_QR_PATH.slice(1)

/** GET: how the composer exposes the picker. */
export const PICKER_CONFIG_PATH = '/wecom-picker/config'

/** Browser-relative form of {@link PICKER_CONFIG_PATH}. */
export const PICKER_CONFIG_ROUTE = PICKER_CONFIG_PATH.slice(1)

/** Where the picker appears in the composer. */
export type PickerPlacement = 'standalone' | 'plusMenu' | 'both'

/** GET {@link PICKER_CONFIG_PATH} response. */
export interface PickerConfigPayload {
  readonly placement: PickerPlacement
}

/** Chip payload cap, matching the official selector's `selectFileMaxlength`. */
export const PICKER_MAX_SELECTION = 10

/** Chip identity source, mirroring the official selector's `doc_id` / entry id split. */
export type PickerIdKind = 'file' | 'doc'

/** One pickable WeDrive entry. */
export interface PickerItem {
  /** Chip id: `docid` (`a1_` / `s3_` / `d3_` …) for documents, else the entry id (`s.xxx` / `i.xxx`). */
  readonly id: string
  /** Which CLI field produced {@link PickerItem.id}. */
  readonly idKind: PickerIdKind
  /** Display name. */
  readonly name: string
  /** Folders and spaces take a trailing slash in the model text. */
  readonly kind: 'file' | 'folder'
  /** Raw `wecom-cli` type (`file` / `folder` / `space` / `sheet` / `word` …). */
  readonly type?: string
  /** Online-document open URL, when the CLI reports one. */
  readonly url?: string
  /** Human-readable location: `空间 / 父文件夹`, else the reported path. */
  readonly path?: string
  /** Last update time, as reported. */
  readonly updatedAt?: string
  /** Size in bytes, when the CLI reports one (ordinary files only). */
  readonly size?: number
  /** Containing space id, for the column view's first level. */
  readonly spaceId?: string
  /** Containing space name. */
  readonly spaceName?: string
  /** Containing folder id, for the column view's second level. */
  readonly folderId?: string
  /** Containing folder name. */
  readonly folderName?: string
}

/** Progress of the in-app `wecom-cli auth init` attempt. */
export type PickerAuthPhase = 'idle' | 'starting' | 'waiting' | 'failed'

/** Login-attempt observation surfaced beside the QR image. */
export interface PickerAuthState {
  readonly phase: PickerAuthPhase
  /** Authorization link printed by the CLI, when one was observed. */
  readonly link?: string
  /** Failure detail for {@link PickerAuthPhase} `failed`. */
  readonly message?: string
}

/** Why the picker cannot list right now. */
export type PickerBlockCode = 'missing' | 'unauthorized' | 'error'

/** GET {@link PICKER_STATUS_PATH} response. */
export interface PickerStatusPayload {
  /** `missing` when `wecom-cli` is not installed; `unauthorized` until a bot authorization exists. */
  readonly state: 'authorized' | PickerBlockCode
  /** `wecom-cli --version` output, when the binary resolves. */
  readonly version?: string
  /** Diagnostic text for a non-`authorized` state. */
  readonly message?: string
  /** Current login attempt, `idle` when none was started. */
  readonly auth: PickerAuthState
}

/** GET {@link PICKER_FILES_PATH} success response. */
export interface PickerFilesPayload {
  readonly ok: true
  readonly items: readonly PickerItem[]
  /** More pages exist past {@link PickerFilesPayload.nextCursor}. */
  readonly hasMore: boolean
  readonly nextCursor?: string
}

/** GET {@link PICKER_FILES_PATH} refusal. */
export interface PickerFailurePayload {
  readonly ok: false
  readonly state: PickerBlockCode
  readonly message: string
}

/** GET {@link PICKER_FILES_PATH} response. */
export type PickerFilesResponse = PickerFilesPayload | PickerFailurePayload
