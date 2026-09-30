/**
 * Official WeCom selector iframe contract: the picker URL, the origin that may
 * post results, and the `IWedriveFileSelectorResponse` parser.
 *
 * The panel currently lists files through `wecom-cli` (see `src/host/wecom-cli.ts`)
 * because the desktop app cannot hold a WeCom web session in a cross-site
 * iframe. This module is retained for the planned proxy phase, which serves the
 * official selector from a same-site origin; until then `WecomSelectedFile` is
 * its live consumer.
 */

/** Hard-coded WeCom WeDrive file-selector page. */
export const WECOM_SELECTOR_URL
  = 'https://doc.weixin.qq.com/webdisk/index?t=wedriveFileSelectorForWework&weworkType=-1&multiSelectable=true&selectFileMaxlength=10'

/** Origin that may post selector results. */
export const WECOM_SELECTOR_ORIGIN = 'https://doc.weixin.qq.com'

/** WeDrive directory entry (`kEntryDir`). */
const ENTRY_DIR = 1

/** One file, folder, or document chosen in the selector. */
export interface WecomSelectedFile {
  /** Entry `id` (`s.xxx` / `i.xxx`) for files and folders; `doc_id` (`a1_` / `s3_` / `d3_`) for documents. */
  readonly id: string
  /** Which WeDrive id field produced {@link WecomSelectedFile.id}. */
  readonly idKind: 'file' | 'doc'
  readonly name: string
  readonly kind: 'file' | 'folder'
  readonly url?: string
}

/** Parsed `postMessage` from the selector window. */
export type WecomSelectorMessage
  = { readonly kind: 'confirm'; readonly files: readonly WecomSelectedFile[] }
  | { readonly kind: 'cancel' }

/** Parse a JSON string; invalid text is not a selector payload. */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    // iframe posted non-JSON text, or selectedFileListJSONString was malformed
    return undefined
  }
}

/** Read a non-empty string field from a record. */
function stringField(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return undefined
}

/**
 * Resolve the clickable URL on one WeDrive fileInfo.
 * Docs use `doc_url`; journal / invite cards put the jump URL on `journalForwardInfo.url`.
 */
function fileUrl(record: Record<string, unknown>): string | undefined {
  const direct = stringField(record, 'doc_url', 'docUrl')
  if (direct !== undefined) return direct
  const journal = record.journalForwardInfo
  if (journal !== null && typeof journal === 'object') {
    const nested = stringField(journal as Record<string, unknown>, 'url')
    if (nested !== undefined) return nested
  }
  return stringField(record, 'url')
}

/** Folder when `type` is WeDrive `kEntryDir` (number or numeric string). */
function entryKind(record: Record<string, unknown>): 'file' | 'folder' {
  const type = record.type
  if (type === ENTRY_DIR || type === String(ENTRY_DIR)) return 'folder'
  return 'file'
}

/**
 * Chip identity: a document carries `doc_id` (`a1_` / `s3_` / `d3_` …);
 * files and folders use the list entry `id` (`s.xxx`). `fileId` is the
 * encrypted blob and is never the chip.
 */
function entryId(record: Record<string, unknown>): Pick<WecomSelectedFile, 'id' | 'idKind'> | undefined {
  const docId = stringField(record, 'doc_id', 'docId')
  if (docId !== undefined) return { id: docId, idKind: 'doc' }
  const id = stringField(record, 'id')
  if (id !== undefined) return { id, idKind: 'file' }
  return undefined
}

/** Project one selector list item into a chip payload. */
function fileFrom(item: unknown): WecomSelectedFile | undefined {
  if (item === null || typeof item !== 'object') return undefined
  const record = item as Record<string, unknown>
  const nested = record.fileInfo
  const body = nested !== null && typeof nested === 'object'
    ? { ...record, ...(nested as Record<string, unknown>) }
    : record
  const identity = entryId(body)
  if (identity === undefined) return undefined
  const name = stringField(body, 'showName', 'name', 'showNameWithEscape') ?? identity.id
  const url = fileUrl(body)
  return {
    ...identity,
    name,
    kind: entryKind(body),
    ...(url === undefined ? {} : { url }),
  }
}

/** Collect chip payloads from `selectedFileList` / a parsed JSON list. */
function filesFrom(value: unknown): WecomSelectedFile[] {
  if (!Array.isArray(value)) return []
  const files: WecomSelectedFile[] = []
  for (const item of value) {
    const file = fileFrom(item)
    if (file !== undefined) files.push(file)
  }
  return files
}

/** Unwrap a payload that may itself be a JSON string. */
function asRecord(data: unknown): Record<string, unknown> | undefined {
  const value = typeof data === 'string' ? parseJson(data) : data
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

/**
 * Parse a WeCom selector `postMessage` as `IWedriveFileSelectorResponse`.
 * @param data - `MessageEvent.data` from the selector.
 * @returns confirm/cancel when `action` is recognized; otherwise undefined.
 */
export function parseWecomSelectorMessage(data: unknown): WecomSelectorMessage | undefined {
  const record = asRecord(data)
  if (record === undefined) return undefined
  const inner = asRecord(record.data) ?? asRecord(record.info) ?? record
  const action = typeof inner.action === 'string' ? inner.action : ''
  if (action === 'cancel') return { kind: 'cancel' }
  if (action !== 'confirm') return undefined
  const listed = filesFrom(inner.selectedFileList)
  const encoded = typeof inner.selectedFileListJSONString === 'string'
    ? filesFrom(parseJson(inner.selectedFileListJSONString))
    : []
  const seen = new Set<string>()
  const unique = [...listed, ...encoded].filter((file) => {
    const key = `${file.idKind}:${file.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return { kind: 'confirm', files: unique }
}
