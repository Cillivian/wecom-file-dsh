/**
 * Scroll-triggered paging.
 *
 * A sentinel is rendered after the last row and observed with
 * `IntersectionObserver`, whose intersection already accounts for clipping by
 * the scroll container — so one hook serves the vertical list, the column
 * view's item pane, and the horizontal filmstrip without each view owning
 * scroll math.
 */
import { useEffect } from 'react'
import type { RefObject } from 'react'

/** How far before the sentinel becomes visible the next page is requested. */
const PRELOAD_MARGIN = '240px 0px'

/**
 * Call `onReach` while the sentinel is visible inside its scroller.
 *
 * The observer is rebuilt whenever `enabled` or `onReach` changes, so a page
 * that lands without pushing the sentinel out of view immediately requests the
 * next one: the list fills the pane instead of leaving a stub at the bottom.
 * @param sentinel - element rendered after the last row.
 * @param enabled - `false` while a page is in flight or the list is exhausted.
 * @param onReach - request for the next page; must be idempotent per gap.
 */
export function useEndReached(
  sentinel: RefObject<HTMLElement | null>,
  enabled: boolean,
  onReach: () => void,
): void {
  useEffect(() => {
    const node = sentinel.current
    if (node === null || !enabled) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) onReach()
    }, { rootMargin: PRELOAD_MARGIN })
    observer.observe(node)
    return () => { observer.disconnect() }
  }, [sentinel, enabled, onReach])
}
