/**
 * Authorization-panel decisions for the CLI picker.
 *
 * The blocked view and the background poller both need the same answer to
 * "what may the user click, and what should be observed?", so the rules live
 * here as pure functions instead of being re-derived inside two components.
 */
import type { PickerAuthState, PickerBlockCode } from '../../shared/protocol.ts'

/** The auth controls rendered beneath one refusal. */
export interface AuthPanel {
  /** Show the CLI's QR relay for a login attempt that waits for a scan. */
  readonly qr: boolean
  /** Offer a button that starts a fresh login attempt. */
  readonly reauthorize: boolean
  /** Offer "重试" next to the auth actions. */
  readonly retry: boolean
  /** Poll `/wecom-picker/status` while the attempt runs. */
  readonly poll: boolean
  /** Detail of the last failed attempt, `''` when it printed none. */
  readonly failure: string | undefined
}

/**
 * Whether a CLI login attempt is on screen and worth observing.
 *
 * A failed attempt deliberately stops the poll: its failure is authoritative
 * until the user clicks "重新授权", which starts a new attempt.
 * @param block - the active refusal, if any.
 * @param auth - the last reported login attempt.
 */
export function pollsAuth(
  block: PickerBlockCode | undefined,
  auth: PickerAuthState,
): boolean {
  return block === 'unauthorized' && auth.phase === 'waiting'
}

/**
 * What the blocked view shows for one refusal.
 *
 * Re-authorization is offered for every refusal that the CLI can resolve: an
 * expired token, and also a generic read error, because an authorization
 * failure can be classified as one. Only a missing binary has no login to
 * start. While an attempt is already waiting, the button restarts it — a QR
 * code cannot be refreshed in place, so that is the only way back from an
 * expired code or a scan that failed without a distinct failure state.
 * @param block - the active refusal.
 * @param auth - the last reported login attempt.
 */
export function authPanel(block: PickerBlockCode, auth: PickerAuthState): AuthPanel {
  const waiting = pollsAuth(block, auth)
  return {
    qr: waiting,
    reauthorize: block !== 'missing',
    retry: block !== 'unauthorized',
    poll: waiting,
    failure: auth.phase === 'failed' ? auth.message ?? '' : undefined,
  }
}
