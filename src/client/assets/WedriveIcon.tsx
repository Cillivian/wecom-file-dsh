/**
 * Vendored `wedrive-16` glyph from `@tencent/wedocs-icons@0.3.26091100`.
 *
 * The client bundle must never `require()` the icon package at runtime: the
 * client module table materializes platform modules, not arbitrary npm
 * dependencies, so a resolved-at-build-time import silently becomes a boot
 * failure the moment the package is missing from disk. One static glyph is not
 * worth that coupling, so the exact path data lives here.
 */

/** Props accepted by the inline glyph; color follows `currentColor`. */
export interface Wedrive16Props {
  /** Square edge in px; defaults to one em so it follows the surrounding text. */
  readonly size?: number | undefined
  /** Optional extra class, so a caller can restyle the frame. */
  readonly className?: string | undefined
}

/**
 * The WeDrive cube glyph, byte-identical to the icon package's path data.
 * @param props - optional class name.
 * @returns a 16×16 current-color SVG sized to the surrounding font.
 */
export function Wedrive16({ size, className }: Wedrive16Props) {
  const edge = size === undefined ? '1em' : size
  return (
    <svg
      viewBox="0 0 16 16"
      width={edge}
      height={edge}
      fill="none"
      aria-hidden="true"
      {...(className === undefined ? {} : { className })}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 .48a2 2 0 012 0l5 2.9a2 2 0 011 1.73v5.79a2 2 0 01-1 1.73l-5 2.9a2 2 0 01-2 0l-5-2.9a2 2 0 01-1-1.73V5.1a2 2 0 011-1.72l5-2.9zm1.5.87a1 1 0 00-1 0L5 2.8l3.37 1.95a1 1 0 01.13.06l2 1.16c.31.18.5.51.5.87v1.74l3-1.73V5.1a1 1 0 00-.5-.87l-5-2.9zM14 8l-3.4 1.97a1 1 0 01-.1.06l-2 1.16a1 1 0 01-1 0L6 10.32v3.47l1.5.87a1 1 0 001 0l5-2.9a1 1 0 00.5-.86V8zm-9 5.21V6.84a1 1 0 01.5-.87l1.49-.86-3-1.73-1.5.86a1 1 0 00-.49.87v5.79a1 1 0 00.5.86L5 13.21zM7.99 5.7L6 6.84v2.32l2 1.16 1-.58 1-.58V6.84l-1-.58v.01l-1.01-.58z"
      />
    </svg>
  )
}
