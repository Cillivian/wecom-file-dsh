/**
 * WeDocs file-type glyphs, vendored from `@tencent/wedocs-icons-svg@0.3.26092900`
 * (`package/src/<name>.svg`), produced by a one-shot converter that keeps every
 * path and attribute verbatim.
 *
 * Two canvases are in play by design: the 20px `file-t<type>-20` /
 * `file-smartdoc-20` glyphs for online documents, and the 16px
 * `file-<ext>-default-inline` glyphs for files on the WeDrive. Both are flat,
 * coloured artwork with their own fills, so they render as-is rather than being
 * tinted by CSS.
 *
 * Upstream namespaces every clip path and gradient per glyph, so repeated
 * instances share one definition exactly as the package intends.
 */
import type { ReactElement } from 'react'
import type { WedocsIconKey } from '../cli/model.ts'

/** Every glyph takes one size in pixels. */
export interface FileIconProps {
  readonly size?: number
}

/** file-tdoc-20.svg */
function Tdoc20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-tdoc-20_clip0_17_21832)"><path fill="#2272DB" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#4B95F3" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#fff" d="M13.5 11v1.8h-10V11h10z"></path><path fill="#fff" d="M13.5 14.2V16h-10v-1.8h10z" opacity="0.75"></path></g><defs><clipPath id="file-tdoc-20_clip0_17_21832"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tsheet-20.svg */
function Tsheet20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g fillRule="evenodd" clipPath="url(#file-tsheet-20_clip0_17_21922)" clipRule="evenodd"><path fill="#1BAB3D" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z"></path><path fill="#44C966" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z"></path><path fill="#fff" d="M7.5 16v-1.8h-4V16h4zm6 0v-1.8h-4V16h4z" opacity="0.75"></path><path fill="#fff" d="M7.5 12.8V11h-4v1.8h4zm6 0V11h-4v1.8h4z"></path></g><defs><clipPath id="file-tsheet-20_clip0_17_21922"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tslide-20.svg */
function Tslide20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g fillRule="evenodd" clipPath="url(#file-tslide-20_clip0_17_21946)" clipRule="evenodd"><path fill="#E7552B" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z"></path><path fill="#FF7A56" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z"></path><path fill="#fff" d="M8 7.53a4.5 4.5 0 104.97 4.97H8V7.53z" opacity="0.75"></path><path fill="#fff" d="M12.97 11.5A4.5 4.5 0 009 7.53v3.97h3.97z"></path></g><defs><clipPath id="file-tslide-20_clip0_17_21946"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tsmartsheet-20.svg */
function Tsmartsheet20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <path fill="#00A691" d="M5 5h13.33c.92 0 1.67.75 1.67 1.67v11.66c0 .92-.75 1.67-1.67 1.67H5V5z"></path><path fill="#15CFB0" d="M1.67 0C.75 0 0 .75 0 1.67v16.66C0 19.25.75 20 1.67 20h16.65c-.91 0-1.64-.74-1.65-1.65V1.67C16.67.75 15.92 0 15 0H1.67z" fillRule="evenodd" clipRule="evenodd"></path><path stroke="#fff" d="M7.08 11.08L4.72 8.91M9.5 11.08l2.36-2.17" strokeWidth="2.08"></path><path stroke="#fff" d="M9.5 13.56l2.36 2.17M7.08 13.56l-2.36 2.17" strokeOpacity="0.75" strokeWidth="2.08"></path>
    </svg>
  )
}

/** file-smartdoc-20.svg */
function Smartdoc20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-smartdoc-20_clip0_8074_18427)"><g clipPath="url(#file-smartdoc-20_clip1_8074_18427)"><path fill="#3999DA" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#5FB8F3" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#fff" d="M13.75 14.25v1.25H9v-1.25h4.75zm0-1.63H11v-1.24h2.75v1.24zm0-2.87H9V8.5h4.75v1.25z" opacity="0.75"></path><path fill="#fff" d="M5.51 8.54c.08-.22.4-.22.48 0l.8 2.27c.02.07.08.13.15.15l2.27.8c.22.08.22.4 0 .48l-2.27.8a.25.25 0 00-.15.15l-.8 2.27a.25.25 0 01-.48 0l-.8-2.27a.25.25 0 00-.15-.15l-2.27-.8a.25.25 0 010-.48l2.27-.8a.25.25 0 00.15-.15l.8-2.27z"></path></g></g><defs><clipPath id="file-smartdoc-20_clip0_8074_18427"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath><clipPath id="file-smartdoc-20_clip1_8074_18427"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tmindmap-20.svg */
function Tmindmap20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-tmindmap-20_clip0_17_21961)"><path fill="#9552E0" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#B478F7" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><path stroke="#fff" d="M12.25 9h-4.1a3.25 3.25 0 00-3.25 3.25v0c0 1.8 1.46 3.25 3.25 3.25h4.1" opacity="0.75" strokeWidth="2"></path><rect x="3" y="10.25" fill="#fff" rx="1.88"></rect><path fill="#fff" d="M12 7.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 14.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" fillRule="evenodd" clipRule="evenodd"></path></g><defs><clipPath id="file-tmindmap-20_clip0_17_21961"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tflowchart-20.svg */
function Tflowchart20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-tflowchart-20_clip0_17_21973)"><path fill="#4C63E9" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#7187FF" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><path stroke="#fff" d="M12 8.5H6.67c-.97 0-1.75.79-1.75 1.75v0c0 .97.78 1.75 1.75 1.75h3.58c.97 0 1.75.79 1.75 1.75v0c0 .97-.78 1.75-1.75 1.75H4.92" opacity="0.75" strokeWidth="2"></path><path fill="#fff" d="M10 8.5l1.88-1.87 1.87 1.87-1.88 1.88L10 8.5zM6 14.25H3.5v2.5H6v-2.5z"></path></g><defs><clipPath id="file-tflowchart-20_clip0_17_21973"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tform-20.svg */
function Tform20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-tform-20_clip0_17_21938)"><path fill="#E79B00" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#FFBA30" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><path stroke="#fff" d="M4.5 12l3 3L13 9.5" strokeWidth="2"></path></g><defs><clipPath id="file-tform-20_clip0_17_21938"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-treport-20.svg */
function Treport20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-treport-20_clip0_17_21984)"><path fill="#E48125" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#FC9D45" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#fff" d="M13.5 11v1.8h-10V11h10zM5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path><path fill="#fff" d="M8.5 14.2V16h-5v-1.8h5z" opacity="0.75"></path></g><defs><clipPath id="file-treport-20_clip0_17_21984"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-tpdf-20.svg */
function Tpdf20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-tpdf-20_clip0_254_304048)"><path fill="#D9443A" d="M5 6.5C5 5.67 5.67 5 6.5 5h12c.83 0 1.5.67 1.5 1.5v12c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 015 18.5v-12z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#F26A62" d="M1.5 0C.67 0 0 .67 0 1.5v17c0 .83.67 1.5 1.5 1.5h17a1.5 1.5 0 01-1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-14z" fillRule="evenodd" clipRule="evenodd"></path><g fill="#fff" opacity="0.5"><path d="M8.95 7.2l-2 .04v.04l.01.22v.2a8.85 8.85 0 01-1.76 5.17c-.6.8-1.35 1.5-2.3 2.1l.4-.23c1.35-.75 2.76-1.3 4.19-1.69a9.7 9.7 0 001.47-5.67v-.19zM2.89 14.97z"></path></g><path fill="#fff" d="M12.78 14.42l.12-2-.12-.01a18.62 18.62 0 00-9.48 2.33l-.41.23 1.02 1.73h.01a16.55 16.55 0 018.66-2.28h.2z" opacity="0.75" fillRule="evenodd" clipRule="evenodd"></path><path fill="#fff" d="M6.94 7.24a7.97 7.97 0 002.74 5.59c.6.53 2.02 1.3 2.55 1.45l.55.14.12-2A6.64 6.64 0 0111 11.3a6.01 6.01 0 01-2-3.65l-.02-.2-.02-.17v-.1l-2.02.05z" fillRule="evenodd" clipRule="evenodd"></path></g><defs><clipPath id="file-tpdf-20_clip0_254_304048"><path fill="#fff" d="M0 0h20v20H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-folder-20.svg */
function Folder20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <path fill="#64B5F9" d="M2 18a2 2 0 01-2-2V3c0-1.1.9-2 2-2h4.59a1 1 0 01.7.3l1.42 1.4a1 1 0 00.7.3H18a2 2 0 012 2v11a2 2 0 01-2 2H2z" fillRule="evenodd" clipRule="evenodd"></path><path fill="url(#file-folder-20_paint0_linear_409_96849)" d="M2 18a2 2 0 01-2-2V3c0-1.1.9-2 2-2h4.59a1 1 0 01.7.3l1.42 1.4a1 1 0 00.7.3H18a2 2 0 012 2v11a2 2 0 01-2 2H2z" fillRule="evenodd" clipRule="evenodd"></path><defs><linearGradient id="file-folder-20_paint0_linear_409_96849" x1="0" x2="15.66" y1="1" y2="21.34" gradientUnits="userSpaceOnUse"><stop stopColor="#79C8FC"></stop><stop offset="1" stopColor="#4EA2F5"></stop></linearGradient></defs>
    </svg>
  )
}

/** file-space-20.svg */
function Space20({ size = 20 }: FileIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <path fill="#6CA9F7" d="M19 6.18c0-.8-.44-1.53-1.15-1.9L11.01.64A2.16 2.16 0 009 .64L2.15 4.28C1.45 4.65 1 5.38 1 6.18v7.64c0 .8.44 1.54 1.15 1.91l6.84 3.63c.63.34 1.39.34 2.02 0l6.84-3.63c.7-.37 1.15-1.1 1.15-1.9V6.17z" fillRule="evenodd" clipRule="evenodd"></path><path fill="url(#file-space-20_paint0_linear_1234_30745)" d="M19 6.18c0-.8-.44-1.53-1.15-1.9L11.01.64A2.16 2.16 0 009 .64L2.15 4.28C1.45 4.65 1 5.38 1 6.18v7.64c0 .8.44 1.54 1.15 1.91l6.84 3.63c.63.34 1.39.34 2.02 0l6.84-3.63c.7-.37 1.15-1.1 1.15-1.9V6.17z" fillRule="evenodd" clipRule="evenodd"></path><path fill="url(#file-space-20_paint1_radial_1234_30745)" d="M10.5 9.77l7.16-4.05L9.97 8.9 2.35 5.74 9.5 9.8l.5 8.23.52-8.25z" fillRule="evenodd" clipRule="evenodd"></path><defs><radialGradient id="file-space-20_paint1_radial_1234_30745" cx="0" cy="0" r="1" gradientTransform="rotate(90 .29 9.72) scale(8.59248 10.6992)" gradientUnits="userSpaceOnUse"><stop stopColor="#fff"></stop><stop offset="1" stopColor="#fff" stopOpacity="0.7"></stop></radialGradient><linearGradient id="file-space-20_paint0_linear_1234_30745" x1="1" x2="19" y1="0" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#82BEFA"></stop><stop offset="1" stopColor="#5897F5"></stop></linearGradient></defs>
    </svg>
  )
}

/** file-pdf-default-inline.svg */
function LocalPdf16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-pdf-default-inline_clip0_39942_124118)"><path fill="#E63D33" d="M7.51.72c.97 0 1.38.85 1.37 2.13 0 .96-.23 2.22-.63 3.57l.06-.21c.17.3.35.6.55.89l.2.29.13.17c.36.48.75.92 1.17 1.3l.19.18a8.74 8.74 0 013.4-.06c1.05.26 1.6.98 1.21 1.92-.58 1.43-2.84.95-4.9-.7-.5.1-1.03.23-1.57.39l-.4.12-.22.07c-.7.23-1.33.44-1.91.65L6 11.5c-.8 1.3-1.63 2.38-2.39 3.04-.98.85-1.93 1.05-2.56.23-.6-.76-.38-1.59.49-2.3.67-.55 1.8-1.13 3.47-1.76l.29-.11.16-.27.67-1.28.2-.43c.26-.58.52-1.27.75-1.98l.09-.3C5.73 3.52 5.7.72 7.5.72zM4.23 12.24l.06-.08-.09.04c-.93.4-1.6.78-2 1.11-.46.38-.5.55-.33.76.16.2.48.14 1.08-.38.35-.3.74-.73 1.13-1.25l.15-.2zm9.48-2.2c-.38-.1-.9-.14-1.5-.1h-.23l-.19.02.15.09c.32.19.64.33.94.44l.18.05.17.05c.58.13.9.05.96-.11.1-.22.01-.32-.48-.45zM7.9 7.58l-.02.08-.03-.06-.03.1c-.14.39-.29.76-.43 1.1l-.12.26-.28.6-.18.35.07-.02-.02.04.54-.18.57-.19.61-.18.3-.08.34-.09-.03-.03.06-.01-.03-.03-.45-.5-.21-.26-.2-.27-.14-.18-.1-.14-.1-.14-.12-.17zm-.4-5.78c-.44 0-.51 1.14.03 2.7l.06.18.03-.13c.1-.5.16-.94.2-1.34v-.37c.01-.76-.13-1.04-.32-1.04z" fillRule="evenodd" clipRule="evenodd"></path></g><defs><clipPath id="file-pdf-default-inline_clip0_39942_124118"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-word-default-inline.svg */
function LocalWord16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-word-default-inline_clip0_39942_124126)"><path fill="#fff" d="M3.2 1.6C3.2.72 3.92 0 4.8 0h7.03c.43 0 .85.18 1.15.49l2.57 2.64c.29.3.45.7.45 1.12V14.4c0 .88-.72 1.6-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V1.6z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#060F1A" d="M11.83.4H4.8c-.66 0-1.2.54-1.2 1.2v12.8c0 .66.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2V4.25c0-.31-.12-.61-.34-.84L12.7.76a1.2 1.2 0 00-.86-.36zM4.8 0c-.88 0-1.6.72-1.6 1.6v12.8c0 .88.72 1.6 1.6 1.6h9.6c.88 0 1.6-.72 1.6-1.6V4.25c0-.42-.16-.82-.45-1.12L12.98.5A1.6 1.6 0 0011.83 0H4.8z" fillOpacity="0.1" fillRule="evenodd" clipRule="evenodd"></path><path fill="#060F1A" d="M6.4 6c0-.22.18-.4.4-.4h5.6a.4.4 0 110 .8H6.8a.4.4 0 01-.4-.4zM6.4 10.8c0-.22.18-.4.4-.4h5.6a.4.4 0 110 .8H6.8a.4.4 0 01-.4-.4zM6.8 8a.4.4 0 100 .8h5.6a.4.4 0 100-.8H6.8z" fillOpacity="0.1"></path><path fill="#185ABD" d="M0 5.2C0 4.54.54 4 1.2 4h5.6C7.46 4 8 4.54 8 5.2v5.6c0 .66-.54 1.2-1.2 1.2H1.2A1.2 1.2 0 010 10.8V5.2z"></path><path fill="#fff" d="M6.8 5.8l-1.14 4.4h-.78L4.1 7.12a2.22 2.22 0 01-.06-.43h-.01a2.2 2.2 0 01-.07.43l-.8 3.08h-.79L1.2 5.8h.75l.76 3.22c.03.14.05.28.06.43h.01c0-.1.03-.25.08-.43l.85-3.22h.71l.79 3.25c.03.1.05.24.06.39h.01c0-.1.03-.24.07-.4l.74-3.24h.7z"></path></g><defs><clipPath id="file-word-default-inline_clip0_39942_124126"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-excel-default-inline.svg */
function LocalExcel16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-excel-default-inline_clip0_39942_124125)"><path fill="#fff" d="M3.2 1.6C3.2.72 3.92 0 4.8 0h7.03c.43 0 .85.18 1.15.49l2.57 2.64c.29.3.45.7.45 1.12V14.4c0 .88-.72 1.6-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V1.6z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#060F1A" d="M11.83.4H4.8c-.66 0-1.2.54-1.2 1.2v12.8c0 .66.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2V4.25c0-.31-.12-.61-.34-.84L12.7.76a1.2 1.2 0 00-.86-.36zM4.8 0c-.88 0-1.6.72-1.6 1.6v12.8c0 .88.72 1.6 1.6 1.6h9.6c.88 0 1.6-.72 1.6-1.6V4.25c0-.42-.16-.82-.45-1.12L12.98.5A1.6 1.6 0 0011.83 0H4.8z" fillOpacity="0.1" fillRule="evenodd" clipRule="evenodd"></path><path fill="#060F1A" d="M12.8 5.97a.4.4 0 00-.4-.4h-2a.4.4 0 000 .8h2a.4.4 0 00.4-.4zM8.8 5.57a.4.4 0 010 .8H6.4v-.8h2.4zM8.8 8a.4.4 0 110 .8H6.4V8h2.4zM9.2 10.8a.4.4 0 00-.4-.4H6.4v.8h2.4a.4.4 0 00.4-.4zM12.8 10.8a.4.4 0 00-.4-.4h-2a.4.4 0 000 .8h2a.4.4 0 00.4-.4zM12.8 8.4a.4.4 0 00-.4-.4h-2a.4.4 0 000 .8h2a.4.4 0 00.4-.4z" fillOpacity="0.1"></path><path fill="#107C41" d="M0 5.2C0 4.54.54 4 1.2 4h5.6C7.46 4 8 4.54 8 5.2v5.6c0 .66-.54 1.2-1.2 1.2H1.2A1.2 1.2 0 010 10.8V5.2z"></path><path fill="#fff" d="M6 10.4h-.93l-.95-1.76a1.8 1.8 0 01-.1-.23l-.1.23-.99 1.76H2l1.53-2.41-1.4-2.39h.94l.84 1.62.15.32.17-.33.87-1.61h.87L4.54 7.98 6 10.4z"></path></g><defs><clipPath id="file-excel-default-inline_clip0_39942_124125"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-ppt-default-inline.svg */
function LocalPpt16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-ppt-default-inline_clip0_39942_124124)"><path fill="#fff" d="M3.2 1.6C3.2.72 3.92 0 4.8 0h7.03c.43 0 .85.18 1.15.49l2.57 2.64c.29.3.45.7.45 1.12V14.4c0 .88-.72 1.6-1.6 1.6H4.8a1.6 1.6 0 01-1.6-1.6V1.6z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#060F1A" d="M11.83.4H4.8c-.66 0-1.2.54-1.2 1.2v12.8c0 .66.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2V4.25c0-.31-.12-.61-.34-.84L12.7.76a1.2 1.2 0 00-.86-.36zM4.8 0c-.88 0-1.6.72-1.6 1.6v12.8c0 .88.72 1.6 1.6 1.6h9.6c.88 0 1.6-.72 1.6-1.6V4.25c0-.42-.16-.82-.45-1.12L12.98.5A1.6 1.6 0 0011.83 0H4.8z" fillOpacity="0.1" fillRule="evenodd" clipRule="evenodd"></path><path fill="#060F1A" d="M9.6 11.2a3.2 3.2 0 003.17-2.8H9.2V4.82a3.2 3.2 0 00.4 6.38z" fillOpacity="0.1"></path><path fill="#060F1A" d="M10 4.82a3.2 3.2 0 012.77 2.78H10V4.82z" fillOpacity="0.1"></path><path fill="#C43E1C" d="M0 5.2C0 4.54.54 4 1.2 4h5.6C7.46 4 8 4.54 8 5.2v5.6c0 .66-.54 1.2-1.2 1.2H1.2A1.2 1.2 0 010 10.8V5.2z"></path><path fill="#fff" d="M3.2 8.66v1.74h-.8V5.6h1.46c.55 0 .98.13 1.28.38.3.26.46.62.46 1.09 0 .47-.16.85-.48 1.14-.32.3-.74.45-1.29.45H3.2zm0-2.4V8h.51c.34 0 .6-.08.78-.24a.85.85 0 00.27-.67c0-.56-.33-.84-.99-.84H3.2z"></path></g><defs><clipPath id="file-ppt-default-inline_clip0_39942_124124"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-image-default-inline.svg */
function LocalImage16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g fill="#27ABF7" clipPath="url(#file-image-default-inline_clip0_39942_124111)"><path d="M3.22 6.01a.56.56 0 01.92-.2l7.39 7.4c.35.35.1.95-.4.95H.97a.56.56 0 01-.52-.76l2.77-7.39z" fillRule="evenodd" clipRule="evenodd"></path><path d="M8.78 7.6a.56.56 0 01.9-.15l5.76 5.75c.36.36.1.96-.4.96h-8.4a.56.56 0 01-.51-.8l2.65-5.75z" opacity="0.6" fillRule="evenodd" clipRule="evenodd"></path><circle cx="13.04" cy="4.08" r="1.68"></circle></g><defs><clipPath id="file-image-default-inline_clip0_39942_124111"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-video-default-inline.svg */
function LocalVideo16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g fill="#27A0F7" clipPath="url(#file-video-default-inline_clip0_39942_124108)"><path d="M.16 4.36c0-.77.63-1.4 1.4-1.4h8.4c.77 0 1.4.63 1.4 1.4v7.28c0 .77-.63 1.4-1.4 1.4h-8.4a1.4 1.4 0 01-1.4-1.4V4.36z"></path><path d="M12.48 6.32l1.93-1.93a.84.84 0 011.43.6V11a.84.84 0 01-1.43.6l-1.93-1.93V6.32z" opacity="0.6"></path></g><defs><clipPath id="file-video-default-inline_clip0_39942_124108"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-audio-default-inline.svg */
function LocalAudio16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-audio-default-inline_clip0_39942_124120)"><path fill="#2792F7" d="M13.04 4.59a3.21 3.21 0 00-3.8-3.16l-2.54.48a3.21 3.21 0 00-2.62 3.15v4.77a1.9 1.9 0 01-1.65 1.88 1.94 1.94 0 10.48 3.86l.33-.04A2.24 2.24 0 005.2 13.3V6.88c0-.77.55-1.43 1.31-1.58l3.51-.65a1.6 1.6 0 011.9 1.57v1.93a1.9 1.9 0 01-1.65 1.88 1.94 1.94 0 00.48 3.86l.33-.04a2.24 2.24 0 001.96-2.23V4.6z"></path></g><defs><clipPath id="file-audio-default-inline_clip0_39942_124120"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-zip-default-inline.svg */
function LocalZip16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g fill="#3084E3" clipPath="url(#file-zip-default-inline_clip0_39942_124114)"><path d="M10.24 2.68a.84.84 0 00-.84-.84H6.6a.84.84 0 000 1.68h2.8c.47 0 .84-.38.84-.84zM9.4 4.65a.84.84 0 010 1.67H6.6a.84.84 0 110-1.68h2.8z"></path><path d="M10.24 8.28a.84.84 0 00-.83-.83H6.6a.84.84 0 100 1.67h.55v1.28a2.24 2.24 0 101.68 0V9.12h.56c.47 0 .84-.37.84-.84zM8 11.92a.56.56 0 100 1.12.56.56 0 000-1.12z" fillRule="evenodd" clipRule="evenodd"></path></g><defs><clipPath id="file-zip-default-inline_clip0_39942_124114"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-text-default-inline.svg */
function LocalText16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-text-default-inline_clip0_39942_124107)"><path fill="#0B121A" d="M1.4 2.3c0-.5.4-.9.9-.9h11.4a.9.9 0 110 1.8H2.3a.9.9 0 01-.9-.9z" fillOpacity="0.6"></path><path fill="#0A111A" d="M1.4 5.9c0-.5.4-.9.9-.9h11.4a.9.9 0 110 1.8H2.3a.9.9 0 01-.9-.9z" fillOpacity="0.5"></path><path fill="#09111A" d="M1.4 9.5c0-.5.4-.9.9-.9h11.4a.9.9 0 110 1.8H2.3a.9.9 0 01-.9-.9z" fillOpacity="0.4"></path><path fill="#08101A" d="M1.4 13.1c0-.5.4-.9.9-.9h6.6a.9.9 0 010 1.8H2.3a.9.9 0 01-.9-.9z" fillOpacity="0.3"></path></g><defs><clipPath id="file-text-default-inline_clip0_39942_124107"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-sketch-default-inline.svg */
function LocalSketch16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g clipPath="url(#file-sketch-default-inline_clip0_39942_124113)"><path fill="url(#file-sketch-default-inline_paint0_linear_39942_124113)" d="M.34 6.6a.26.26 0 01-.02-.33L3.4 2.04c.13-.18.32-.3.54-.32L8 1.24l4.06.48c.22.03.41.14.54.32l3.08 4.23c.07.1.06.23-.02.33L8.2 15.06a.26.26 0 01-.39 0L.34 6.6z" fillRule="evenodd" clipRule="evenodd"></path><path fill="#fff" d="M15.73 6.44H.27c0-.06.02-.12.05-.17L3.4 2.04c.13-.18.32-.3.54-.32L8 1.24l4.06.48c.22.03.41.14.54.32l3.08 4.23c.03.05.05.11.05.17z" fillOpacity="0.25"></path><path fill="#fff" d="M12.06 1.72c.13.01.24.06.35.13l.27 4.59H3.32l.28-4.6c.1-.06.21-.1.34-.12L8 1.24l4.06.48z" fillOpacity="0.4"></path><path fill="#fff" d="M8 1.24l-4.68 5.2h9.36L8 1.24z" fillOpacity="0.5"></path><path fill="#fff" d="M8.08 15.14a.26.26 0 01-.16 0l-4.6-8.7h9.36l-4.6 8.7z" fillOpacity="0.2"></path></g><defs><linearGradient id="file-sketch-default-inline_paint0_linear_39942_124113" x1="8" x2="8" y1="1.24" y2="15.15" gradientUnits="userSpaceOnUse"><stop stopColor="#FAA700"></stop><stop offset="1" stopColor="#FA7B21"></stop></linearGradient><clipPath id="file-sketch-default-inline_clip0_39942_124113"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** file-other-default-inline.svg */
function LocalOther16({ size = 16 }: FileIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <g fill="#888B99" clipPath="url(#file-other-default-inline_clip0_39942_124104)"><path d="M3.95.98c-1.05 0-1.9.85-1.9 1.89v10.26c0 1.04.85 1.89 1.9 1.89h8.1c1.04 0 1.89-.85 1.89-1.89V6.08c0-.5-.2-.98-.55-1.33l-3.22-3.22A1.89 1.89 0 008.84.98h-4.9z" opacity="0.6" fillRule="evenodd" clipRule="evenodd"></path><path d="M9.08 1v3.76c0 .6.48 1.08 1.08 1.08h3.76c-.05-.41-.24-.8-.54-1.1l-3.2-3.2c-.3-.3-.69-.5-1.1-.54z"></path></g><defs><clipPath id="file-other-default-inline_clip0_39942_124104"><path fill="#fff" d="M0 0h16v16H0z"></path></clipPath></defs>
    </svg>
  )
}

/** Icon key to glyph. */
const GLYPHS: Readonly<Record<WedocsIconKey, (props: FileIconProps) => ReactElement>> = {
  tdoc: Tdoc20,
  tsheet: Tsheet20,
  tslide: Tslide20,
  tsmartsheet: Tsmartsheet20,
  smartdoc: Smartdoc20,
  tmindmap: Tmindmap20,
  tflowchart: Tflowchart20,
  tform: Tform20,
  treport: Treport20,
  tpdf: Tpdf20,
  folder: Folder20,
  space: Space20,
  localPdf: LocalPdf16,
  localWord: LocalWord16,
  localExcel: LocalExcel16,
  localPpt: LocalPpt16,
  localImage: LocalImage16,
  localVideo: LocalVideo16,
  localAudio: LocalAudio16,
  localZip: LocalZip16,
  localText: LocalText16,
  localSketch: LocalSketch16,
  localOther: LocalOther16,
}

/**
 * Render one file-type glyph.
 * @param props.iconKey - which glyph, from {@link WedocsIconKey}.
 * @param props.size - square size in pixels.
 */
export function WedocsFileIcon({ iconKey, size }: { readonly iconKey: WedocsIconKey; readonly size?: number }) {
  const Glyph = GLYPHS[iconKey]
  return <Glyph size={size} />
}
