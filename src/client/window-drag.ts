/**
 * Window dragging for the picker shells.
 *
 * A picker opens centered and can be moved: the window's chrome is a pointer
 * drag surface, its title is a keyboard handle (arrow keys nudge, activation
 * re-centers), and every resulting offset is clamped so the window can never be
 * parked outside the viewport. The position is remembered, because a window that
 * snaps back to the middle on every open is the fixed modal this replaces.
 *
 * WCAG 2.5.7: every move the pointer can make has a keyboard equivalent, so
 * dragging is never the only route to the same result.
 *
 * Geometry and storage live in `window-geometry.ts`; this hook only wires them
 * to pointer, keyboard and resize events.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent, RefObject,
} from 'react'
import {
  CENTERED, clampOffset, dragOffset, exceedsSlop, loadWindowOffset, nudgeDelta, saveWindowOffset,
  type WecomWindowBox, type WecomWindowOffset,
} from './window-geometry.ts'

/** Pointer handlers a window spreads onto its drag surface (its toolbar). */
export interface WecomWindowChromeProps {
  readonly onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  readonly onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  readonly onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  readonly onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void
}

/** Handlers for the focusable title, the window's keyboard handle. */
export interface WecomWindowHandleProps {
  readonly onClick: (event: ReactMouseEvent<HTMLElement>) => void
  readonly onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void
}

/** What a window needs to render and move itself. */
export interface WecomWindowDrag {
  /** Displacement from the overlay's centered rest position. */
  readonly offset: WecomWindowOffset
  /** Whether a pointer drag is in flight, for the chrome's own styling. */
  readonly dragging: boolean
  /** Inline style carrying the offset; positional state cannot live in a class. */
  readonly style: CSSProperties
  readonly chromeProps: WecomWindowChromeProps
  readonly handleProps: WecomWindowHandleProps
}

/** One in-flight pointer gesture. */
interface DragSession {
  readonly pointerId: number
  /** Where the pointer grabbed the window. */
  readonly from: WecomWindowOffset
  /** Offset the window had at that moment. */
  readonly origin: WecomWindowOffset
  /** Sizes frozen for the gesture; neither changes while a pointer is down. */
  readonly size: WecomWindowBox
  readonly viewport: WecomWindowBox
  /** Whether the pointer travelled far enough to call this a drag. */
  moved: boolean
}

/**
 * Chrome whose own pointer gestures a drag must not steal. The title is a
 * `<button>` as well, so {@link WINDOW_HANDLE_PROPS} exempts it from this list.
 */
const INTERACTIVE = 'button,input,textarea,select,a[href],[role="menu"],[contenteditable="true"]'

/** Marks the window's keyboard handle inside the drag surface. */
export const WINDOW_HANDLE_PROPS = { 'data-wcp-handle': '' } as const

/** Whether a press on `target` should start moving the window. */
function startsWindowDrag(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return target.closest('[data-wcp-handle]') !== null || target.closest(INTERACTIVE) === null
}

/**
 * Give a window its drag behavior.
 * @param frame - the window element the offset is applied to and measured from.
 * @returns the offset, the chrome/handle handlers, and the style carrying it.
 */
export function useWindowDrag(frame: RefObject<HTMLElement | null>): WecomWindowDrag {
  const [offset, setOffset] = useState<WecomWindowOffset>(loadWindowOffset)
  const [dragging, setDragging] = useState(false)
  const session = useRef<DragSession | undefined>(undefined)
  /**
   * Whether the gesture that just ended actually moved the window. The browser
   * fires a click after a drag too, and that click is the gesture's tail, not a
   * request to re-center.
   */
  const dragged = useRef(false)

  /** Window and viewport sizes: the two inputs every clamp needs. */
  const measure = useCallback((): { size: WecomWindowBox; viewport: WecomWindowBox } => {
    const rect = frame.current?.getBoundingClientRect()
    return {
      size: { width: rect?.width ?? 0, height: rect?.height ?? 0 },
      viewport: { width: globalThis.innerWidth, height: globalThis.innerHeight },
    }
  }, [frame])

  /** Move through `update`, then refuse anything that would leave the viewport. */
  const place = useCallback((update: (previous: WecomWindowOffset) => WecomWindowOffset) => {
    const { size, viewport } = measure()
    setOffset(previous => clampOffset(update(previous), size, viewport))
  }, [measure])

  // Runs before paint, so a position restored from a differently sized screen is
  // corrected without the window ever flashing outside the viewport.
  useLayoutEffect(() => {
    const keepVisible = (): void => { place(previous => previous) }
    keepVisible()
    globalThis.addEventListener('resize', keepVisible)
    return () => { globalThis.removeEventListener('resize', keepVisible) }
  }, [place])

  // Persist once a gesture is over; never mid-drag, or a drag would write a
  // localStorage entry per pointer event.
  useEffect(() => {
    if (dragging) return
    saveWindowOffset(offset)
  }, [dragging, offset])

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !event.isPrimary) return
    if (!startsWindowDrag(event.target)) return
    const { size, viewport } = measure()
    dragged.current = false
    session.current = {
      pointerId: event.pointerId,
      from: { x: event.clientX, y: event.clientY },
      origin: offset,
      size,
      viewport,
      moved: false,
    }
    // Capture on the chrome: the window then follows the pointer even where the
    // pointer leaves the toolbar, or crosses the fallback picker's iframe.
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }, [measure, offset])

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const active = session.current
    if (active === undefined || active.pointerId !== event.pointerId) return
    const next = dragOffset(active.origin, active.from, { x: event.clientX, y: event.clientY })
    if (exceedsSlop(active.origin, next)) active.moved = true
    setOffset(clampOffset(next, active.size, active.viewport))
  }, [])

  const endDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const active = session.current
    if (active === undefined || active.pointerId !== event.pointerId) return
    session.current = undefined
    dragged.current = active.moved
    setDragging(false)
  }, [])

  const onHandleClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (dragged.current) {
      dragged.current = false
      event.preventDefault()
      return
    }
    setOffset(CENTERED)
  }, [])

  const onHandleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    const delta = nudgeDelta(event.key, event.shiftKey)
    // Activation re-centers, and the dialog's "Enter inserts the selection"
    // shortcut must not fire from the title.
    if (delta === undefined && event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
    if (delta === undefined) {
      setOffset(CENTERED)
      return
    }
    place(previous => ({ x: previous.x + delta.x, y: previous.y + delta.y }))
  }, [place])

  const style = useMemo<CSSProperties>(
    () => ({ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }),
    [offset],
  )

  return {
    offset,
    dragging,
    style,
    chromeProps: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag },
    handleProps: { onClick: onHandleClick, onKeyDown: onHandleKeyDown },
  }
}
