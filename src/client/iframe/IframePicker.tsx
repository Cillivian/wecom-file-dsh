/**
 * Official WeCom selector, used as the fallback when the host cannot drive
 * `wecom-cli` (or when the user asks for it).
 *
 * The selector is the real WeDrive web app embedded in an iframe, so it brings
 * its own session requirements: it only logs in when the surrounding document
 * shares a site with `doc.weixin.qq.com`. In the desktop app (`dsh-app://app`)
 * that is never true, which is exactly why the CLI picker is primary.
 */
import { useEffect, useRef, useState } from 'react'
import { IconClose } from '../assets/UiIcons.tsx'
import type { WecomPickerKey } from '../locales.ts'
import { WINDOW_HANDLE_PROPS, useWindowDrag } from '../window-drag.ts'
import {
  parseWecomSelectorMessage, WECOM_SELECTOR_ORIGIN, WECOM_SELECTOR_URL, type WecomSelectedFile,
} from './selector.ts'

/** Locale lookup owned by the launcher. */
type T = (key: WecomPickerKey) => string

/** Everything the fallback picker needs from its launcher. */
export interface IframePickerProps {
  readonly onConfirm: (files: readonly WecomSelectedFile[]) => void
  readonly onClose: () => void
  /** Present only when the CLI picker is actually reachable, so this cannot loop. */
  readonly onUseCli?: (() => void) | undefined
  readonly t: T
}

/** Official selector in a modal frame, with the same chip contract as the CLI picker. */
export function IframePicker({ onConfirm, onClose, onUseCli, t }: IframePickerProps) {
  const [loaded, setLoaded] = useState(false)
  // Same floating window as the CLI picker: draggable, clamped, remembered.
  const frame = useRef<HTMLDivElement>(null)
  const drag = useWindowDrag(frame)

  // The selector answers with `postMessage`; only its own origin may do so.
  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== WECOM_SELECTOR_ORIGIN) return
      const parsed = parseWecomSelectorMessage(event.data)
      if (parsed === undefined) return
      if (parsed.kind === 'confirm') onConfirm(parsed.files)
      onClose()
    }
    window.addEventListener('message', onMessage)
    return () => { window.removeEventListener('message', onMessage) }
  }, [onClose, onConfirm])

  return (
    <div className="wcp-overlay" role="presentation">
      <div className="wcp-scrim" aria-hidden="true" onClick={onClose} />
      <div
        className={drag.dragging ? 'wcp-window wcp-window--dragging' : 'wcp-window'}
        role="dialog"
        aria-modal="true"
        aria-label={t('iframe.title')}
        ref={frame}
        style={drag.style}
      >
        <div className="wcp-toolbar" {...drag.chromeProps}>
          <button
            type="button"
            className="wcp-title"
            aria-label={t('panel.drag')}
            title={t('panel.drag')}
            {...WINDOW_HANDLE_PROPS}
            {...drag.handleProps}
          >
            {t('iframe.title')}
          </button>
          <span className="wcp-spacer" />
          {onUseCli === undefined
            ? null
            : (
              <button type="button" className="wcp-btn wcp-btn--quiet" onClick={onUseCli}>
                {t('iframe.useCli')}
              </button>
            )}
          <button type="button" className="wcp-iconbtn" aria-label={t('panel.close')} onClick={onClose}>
            <IconClose />
          </button>
        </div>
        <p className="wcp-iframe__hint">{t('iframe.hint')}</p>
        <div className="wcp-iframe__frame">
          {loaded
            ? null
            : (
              <div className="wcp-state" role="status">
                <span className="wcp-state__hint">{t('iframe.loading')}</span>
              </div>
            )}
          <iframe
            className="wcp-iframe"
            title={t('iframe.title')}
            src={WECOM_SELECTOR_URL}
            onLoad={() => { setLoaded(true) }}
          />
        </div>
      </div>
    </div>
  )
}
