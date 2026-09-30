/** Browser-side calls into the Host picker routes (document-relative by convention). */
import {
  PICKER_AUTH_QR_ROUTE, PICKER_AUTH_START_ROUTE, PICKER_FILES_ROUTE, PICKER_STATUS_ROUTE,
  type PickerAuthState, type PickerFilesResponse, type PickerStatusPayload,
} from '../../shared/protocol.ts'

/** One page of entries per request. */
const PAGE_SIZE = 30

/** A refusal the host classified, which the caller decides what to do with. */
function isRefusal(payload: unknown): boolean {
  return typeof payload === 'object' && payload !== null && 'state' in payload
}

/**
 * One JSON route call.
 *
 * The host answers a *classified* refusal with a non-2xx status (a missing
 * `wecom-cli` is 503) yet the body is what the picker needs in order to choose
 * the official-selector fallback. Such a body is returned to the caller; only a
 * bodyless failure is a transport error.
 */
async function requestJson<T>(route: string, init: RequestInit, signal?: AbortSignal): Promise<T> {
  const response = await fetch(route, {
    ...init,
    ...(signal === undefined ? {} : { signal }),
    headers: { accept: 'application/json' },
  })
  if (response.ok) return await response.json() as T
  const payload: unknown = await response.json().catch(() => undefined)
  if (isRefusal(payload)) return payload as T
  throw new Error(`${route} → HTTP ${String(response.status)}`)
}

/** Authorization state, CLI version, and the current login attempt. */
export function fetchPickerStatus(signal?: AbortSignal): Promise<PickerStatusPayload> {
  return requestJson<PickerStatusPayload>(PICKER_STATUS_ROUTE, { method: 'GET' }, signal)
}

/** Recently browsed files, or keyword search results for a non-empty query. */
export function fetchPickerFiles(
  params: { readonly query: string; readonly cursor?: string | undefined; readonly signal?: AbortSignal | undefined },
): Promise<PickerFilesResponse> {
  const search = new URLSearchParams()
  const keyword = params.query.trim()
  if (keyword !== '') search.set('q', keyword)
  if (params.cursor !== undefined && params.cursor !== '') search.set('cursor', params.cursor)
  search.set('limit', String(PAGE_SIZE))
  return requestJson<PickerFilesResponse>(`${PICKER_FILES_ROUTE}?${search.toString()}`, { method: 'GET' }, params.signal)
}

/** Start one `wecom-cli auth init` QR login on the host. */
export function startPickerAuth(signal?: AbortSignal): Promise<PickerAuthState> {
  return requestJson<PickerAuthState>(PICKER_AUTH_START_ROUTE, { method: 'POST' }, signal)
}

/** Cache-busted QR image reference for the running login attempt. */
export function pickerAuthQrUrl(stamp: number): string {
  return `${PICKER_AUTH_QR_ROUTE}?t=${String(stamp)}`
}
