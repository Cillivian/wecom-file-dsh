/**
 * One tiny store connecting the `+` menu entry to the mounted picker slot.
 *
 * A command contribution's `run(session)` is plain code with no React context,
 * while the modal, its composer input snapshot, and chip insertion live in the
 * slot component. The store carries only the request: "open for this session".
 */

/** Listener notified with the session a picker should open for. */
export type PickerOpenListener = (sessionId: string) => void

/** Handoff between the menu entry and the slot component. */
export interface PickerStore {
  /** Ask the slot bound to `sessionId` to open its modal. */
  open(sessionId: string): void
  /** @returns unsubscribe. */
  subscribe(listener: PickerOpenListener): () => void
}

/** Create the handoff store for one client root. */
export function createPickerStore(): PickerStore {
  const listeners = new Set<PickerOpenListener>()
  return {
    open(sessionId) {
      for (const listener of [...listeners]) listener(sessionId)
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}
