/**
 * Inline icons for the picker.
 *
 * Hand-drawn 16px glyphs on a 1.4px stroke grid rather than an icon dependency:
 * the client bundle must stay free of runtime `require`s, and this set is small
 * enough to own outright.
 */
import type { ReactNode } from 'react'

/** Props shared by every glyph. */
export interface IconProps {
  /** Rendered square size in pixels. */
  readonly size?: number
}

/** One 16px frame; every glyph draws inside it with `currentColor`. */
function Frame({ size = 16, children }: IconProps & { readonly children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

/** Stroked line path shared by the outline glyphs. */
const line = {
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** View: rows. */
export function IconViewList(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" {...line} />
    </Frame>
  )
}

/** View: side-by-side panes. */
export function IconViewColumns(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="2.5" y="3" width="4.4" height="10" rx="1.2" {...line} />
      <rect x="9.1" y="3" width="4.4" height="10" rx="1.2" {...line} />
    </Frame>
  )
}

/** View: one large stage with a filmstrip. */
export function IconViewGallery(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="2.5" y="2.5" width="11" height="7.5" rx="1.4" {...line} />
      <path d="M4 13h2.4M9.6 13H12" {...line} />
    </Frame>
  )
}

/** Search field magnifier. */
export function IconSearch(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="7" cy="7" r="3.8" {...line} />
      <path d="M10 10l3 3" {...line} />
    </Frame>
  )
}

/** Small dismiss cross. */
export function IconClose(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" {...line} />
    </Frame>
  )
}

/** Disclosure caret. */
export function IconChevronRight(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M6.5 4l4 4-4 4" {...line} />
    </Frame>
  )
}

/** Downward caret for menus. */
export function IconChevronDown(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 6.5l4 4 4-4" {...line} />
    </Frame>
  )
}

/** Sort chevron: up for ascending, down for descending. */
export function IconSortArrow({ direction, size }: IconProps & { readonly direction: 'asc' | 'desc' }) {
  return (
    <Frame size={size}>
      {direction === 'asc' ? <path d="M8 12.5V4m0 0L5 7m3-3l3 3" {...line} /> : <path d="M8 3.5V12m0 0l3-3m-3 3l-3-3" {...line} />}
    </Frame>
  )
}

/** Neutral sort mark for the inactive facet. */
export function IconSort(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M5 3.5v9m0 0L3 10.5M5 12.5l2-2M11 12.5v-9m0 0l2 2M11 3.5l-2 2" {...line} />
    </Frame>
  )
}

/** Selection check mark. */
export function IconCheck(props: IconProps) {
  return (
    <Frame size={props.size ?? 11}>
      <path d="M3 8.4l3.2 3.2L13 4.6" {...line} strokeWidth={1.8} />
    </Frame>
  )
}
