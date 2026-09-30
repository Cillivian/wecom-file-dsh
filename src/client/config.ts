/**
 * Placement lookup for the browser half.
 *
 * The client boot graph carries no per-row config (rows are `id` / `inject` /
 * `immediately` only), so the placement configured on the plugin's Loader row
 * is read back over the host's config route. One memoized read per page is
 * enough: placement cannot change without a reload.
 */
import { PICKER_CONFIG_ROUTE, type PickerConfigPayload, type PickerPlacement } from '../shared/protocol.ts'

/** Placement assumed when the host half cannot answer (older host, fence refusal). */
const FALLBACK: PickerPlacement = 'standalone'

let pending: Promise<PickerPlacement> | undefined

/** Read (once) where the composer should expose the picker. */
export function loadPlacement(): Promise<PickerPlacement> {
  pending ??= (async () => {
    try {
      const response = await fetch(PICKER_CONFIG_ROUTE, { headers: { accept: 'application/json' } })
      if (!response.ok) return FALLBACK
      const payload = await response.json() as PickerConfigPayload
      return payload.placement ?? FALLBACK
    } catch {
      // A picker that renders its default button is better than one that
      // renders nothing because a config read failed.
      return FALLBACK
    }
  })()
  return pending
}
