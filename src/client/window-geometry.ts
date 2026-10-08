/**
 * Floating-window geometry for the pickers: how far the window sits from its
 * centered rest position, how far it may travel before it would leave the
 * viewport, and the position it reopens at.
 *
 * Pure math plus one `localStorage` round trip — no DOM, no React. The window
 * components own the pointer plumbing; every rule that decides *where* the
 * window ends up lives here, so it is testable without a browser.
 *
 * An offset is a translation from the overlay's flex-centered position, not an
 * absolute coordinate: an untouched window (offset `0,0`) stays centered on
 * every viewport, including the ones it is never dragged on.
 */

/** Displacement from the window's centered rest position, in px. */
export interface WecomWindowOffset {
  readonly x: number
  readonly y: number
}

/** A box's outer size in px. */
export interface WecomWindowBox {
  readonly width: number
  readonly height: number
}

/** Rest position: the overlay's own centering, i.e. no displacement at all. */
export const CENTERED: WecomWindowOffset = { x: 0, y: 0 }

/**
 * How much of the window must stay inside the viewport. The window can never be
 * dragged past this margin, so its chrome is always reachable and the window can
 * never be lost off-screen.
 */
export const WINDOW_MARGIN = 8

/** Pointer travel that separates a drag from a click, in px. */
export const DRAG_SLOP = 4

/** One arrow-key step, and its `Shift` (fine) variant, in px. */
export const NUDGE_STEP = 16
export const NUDGE_STEP_FINE = 4

/** Storage key for {@link loadWindowOffset}. */
const STORAGE_KEY = 'wecom-picker/window/v1'

/** A number that survives JSON and arithmetic, or `0`. */
function finite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? positiveZero(value) : 0
}

/**
 * Normalize `-0`. Negating a zero limit is how a pinned axis produces one, and
 * `Object.is(-0, 0)` is false — which would look like a state change to React and
 * print as `-0px` in the transform.
 */
function positiveZero(value: number): number {
  return value === 0 ? 0 : value
}

/** Furthest the window may sit from center on each axis. */
export function offsetLimit(
  size: WecomWindowBox,
  viewport: WecomWindowBox,
  margin: number = WINDOW_MARGIN,
): WecomWindowOffset {
  return {
    x: Math.max(0, (viewport.width - size.width) / 2 - margin),
    y: Math.max(0, (viewport.height - size.height) / 2 - margin),
  }
}

/**
 * Pin one offset into the reachable area.
 *
 * Returns the input unchanged when it already fits, so a caller may use the
 * result as React state without provoking a re-render on every resize tick.
 */
export function clampOffset(
  offset: WecomWindowOffset,
  size: WecomWindowBox,
  viewport: WecomWindowBox,
  margin: number = WINDOW_MARGIN,
): WecomWindowOffset {
  const limit = offsetLimit(size, viewport, margin)
  const x = positiveZero(Math.min(limit.x, Math.max(-limit.x, finite(offset.x))))
  const y = positiveZero(Math.min(limit.y, Math.max(-limit.y, finite(offset.y))))
  return x === offset.x && y === offset.y ? offset : { x, y }
}

/** Offset after a pointer released at `to` that grabbed the window at `from`. */
export function dragOffset(
  origin: WecomWindowOffset,
  from: WecomWindowOffset,
  to: WecomWindowOffset,
): WecomWindowOffset {
  return { x: origin.x + (to.x - from.x), y: origin.y + (to.y - from.y) }
}

/** Whether a displacement is far enough to count as a drag rather than a click. */
export function exceedsSlop(
  origin: WecomWindowOffset,
  moved: WecomWindowOffset,
  slop: number = DRAG_SLOP,
): boolean {
  return Math.abs(moved.x - origin.x) > slop || Math.abs(moved.y - origin.y) > slop
}

/**
 * Arrow key to the movement it asks for, in px.
 * @param key - the `KeyboardEvent.key` value.
 * @param fine - whether `Shift` asked for the small step.
 * @returns the delta, or `undefined` when the key is not one of the four arrows.
 */
export function nudgeDelta(key: string, fine = false): WecomWindowOffset | undefined {
  const step = fine ? NUDGE_STEP_FINE : NUDGE_STEP
  switch (key) {
    case 'ArrowLeft': return { x: -step, y: 0 }
    case 'ArrowRight': return { x: step, y: 0 }
    case 'ArrowUp': return { x: 0, y: -step }
    case 'ArrowDown': return { x: 0, y: step }
    default: return undefined
  }
}

/** Read the remembered position; junk, or storage the page cannot use, means centered. */
export function loadWindowOffset(): WecomWindowOffset {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (raw === null || raw === undefined) return CENTERED
    const parsed = JSON.parse(raw) as Partial<WecomWindowOffset>
    return { x: finite(parsed.x), y: finite(parsed.y) }
  } catch {
    // Private mode and a corrupt value both land here; centering is always safe.
    return CENTERED
  }
}

/** Persist the position, ignoring storage that is blocked or full. */
export function saveWindowOffset(offset: WecomWindowOffset): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(offset))
  } catch {
    // A read-only profile still gets a movable window for this session.
  }
}
