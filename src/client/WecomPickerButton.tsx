import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { Wedrive16 } from '@tencent/wedocs-icons/esm/components/wedrive-16.js'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { InputState } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { insertWedriveChips } from './chips.ts'
import { NS } from './locales.ts'
import {
  parseWecomSelectorMessage, WECOM_SELECTOR_ORIGIN, WECOM_SELECTOR_URL,
  type WecomSelectedFile,
} from './selector.ts'

/** Composer-left WeCom picker: mask plus a chrome-free iframe. */
export type WecomPickerButtonProps
  = PropsRuntime<'conversation.input.left'> & PropsLocale<typeof NS>

/**
 * Bind the picker to one client root so confirmed files become WeDrive chips.
 * @param ctx - client root (sessions + input-trigger registry).
 * @returns the conversation.input.left slot component.
 */
export function createWecomPicker(ctx: ClientContext) {
  return function WecomPickerButton(props: WecomPickerButtonProps) {
    return <WecomPickerButtonView {...props} ctx={ctx} />
  }
}

/** Open the WeDrive selector and insert confirmed files as composer chips. */
function WecomPickerButtonView({
  useInput, sessionId, t, ctx,
}: WecomPickerButtonProps & { readonly ctx: ClientContext }) {
  const [open, setOpen] = useState(false)
  const input = useInput(s => s)
  const onConfirm = useCallback((files: readonly WecomSelectedFile[], next: InputState) => {
    insertWedriveChips(ctx, sessionId, files, next)
  }, [ctx, sessionId])

  useEffect(() => {
    if (!open) return
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== WECOM_SELECTOR_ORIGIN) return
      const parsed = parseWecomSelectorMessage(event.data)
      if (parsed === undefined) return
      if (parsed.kind === 'confirm') onConfirm(parsed.files, input)
      setOpen(false)
    }
    window.addEventListener('message', onMessage)
    return () => { window.removeEventListener('message', onMessage) }
  }, [input, onConfirm, open])

  return (
    <>
      <style>
        {'.scratch-wecom-button:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}'}
      </style>
      <Tooltip label={t('button.label')} side="top" delayMs={500}>
        <button
          type="button"
          className="scratch-wecom-button"
          aria-label={t('button.label')}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => { setOpen(true) }}
          style={{
            display: 'grid',
            placeItems: 'center',
            flex: 'none',
            width: 28,
            cornerShape: 'round',
            height: 28,
            border: 'none',
            borderRadius: 999,
            background: 'var(--dsw-specific-selector)',
            color: 'var(--dsw-alias-label-primary)',
            cursor: 'pointer',
          }}
        >
          <Wedrive16 />
        </button>
      </Tooltip>
      {open
        ? createPortal((
          <div
            role="presentation"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <div
              aria-hidden="true"
              onClick={() => { setOpen(false) }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--dsw-alias-bg-mask-1)',
                backdropFilter: 'var(--dsw-mask-blur)',
              }}
            />
            <iframe
              title={t('iframe.title')}
              src={WECOM_SELECTOR_URL}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'block',
                width: 'min(720px, 100%)',
                height: 'min(540px, 70vh)',
                border: 0,
                borderRadius: 12,
                overflow: 'hidden',
                background: 'transparent',
              }}
            />
          </div>
        ), document.body)
        : null}
    </>
  )
}
