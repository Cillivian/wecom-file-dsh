/**
 * Composer-left WeCom picker slot: the launcher, and the modal that hosts one
 * of the two pickers.
 *
 * Routing is CLI first: the `wecom-cli` picker opens by default because it
 * needs no browser session and works identically in the desktop app and in
 * `dsh web`. The official iframe selector is the fallback — entered
 * automatically when the host reports no CLI at all, and by explicit choice
 * from the CLI picker's refusal states. Closing always returns to the default,
 * so the next open tries the CLI again.
 *
 * Placement is configurable (`placement` on the plugin's Loader row): this
 * component renders the composer tool-row button unless the placement is
 * `plusMenu`, and in every placement it stays mounted as the modal host that
 * the `+` menu entry opens through {@link PickerStore}.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { Wedrive16 } from './assets/WedriveIcon.tsx'
import { insertWedriveChips } from './chips.ts'
import { PickerWindow } from './cli/CliPicker.tsx'
import { LAUNCH_STYLE } from './glass.ts'
import { loadPlacement } from './config.ts'
import { IframePicker } from './iframe/IframePicker.tsx'
import type { WecomSelectedFile } from './iframe/selector.ts'
import { NS } from './locales.ts'
import { showsToolRow } from './placement.ts'
import type { PickerStore } from './picker-store.ts'
import type { PickerPlacement } from '../shared/protocol.ts'

/** Composer-left WeCom picker: a launcher plus whichever picker is active. */
export type WecomPickerButtonProps
  = PropsRuntime<'conversation.input.left'> & PropsLocale<typeof NS>

/** Which picker the modal currently hosts. */
type PickerMode = 'cli' | 'iframe'

/**
 * Bind the picker to one client root so confirmed files become WeDrive chips.
 * @param ctx - client root (sessions + input-trigger registry).
 * @returns the conversation.input.left slot component.
 */
export function createWecomPicker(ctx: ClientContext, store: PickerStore) {
  return function WecomPickerButton(props: WecomPickerButtonProps) {
    return <WecomPickerButtonView {...props} ctx={ctx} store={store} />
  }
}

/** Launcher plus the picker it opens. */
function WecomPickerButtonView({
  useInput, sessionId, t, ctx, store,
}: WecomPickerButtonProps & { readonly ctx: ClientContext; readonly store: PickerStore }) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<PickerPlacement | undefined>(undefined)
  const [mode, setMode] = useState<PickerMode>('cli')
  const [cliMissing, setCliMissing] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const input = useInput(s => s)

  // Placement comes from the plugin's config; until it arrives nothing is
  // drawn, so a `plusMenu` install never flashes a button it will not keep.
  useEffect(() => {
    let alive = true
    void loadPlacement().then((value) => { if (alive) setPlacement(value) })
    return () => { alive = false }
  }, [])

  // The `+` menu entry opens this session's modal without touching the button.
  useEffect(() => store.subscribe((requested) => {
    if (requested === String(sessionId)) setOpen(true)
  }), [sessionId, store])

  /** Focus returns to the launcher, so the composer keyboard path never breaks. */
  const close = useCallback(() => {
    setOpen(false)
    setMode('cli')
    setCliMissing(false)
    launcher.current?.focus()
  }, [])

  /** Enter the official selector; `missing` suppresses the way back. */
  const useIframe = useCallback((missing: boolean) => {
    setCliMissing(missing)
    setMode('iframe')
  }, [])

  const useCli = useCallback(() => { setMode('cli') }, [])

  const confirm = useCallback((files: readonly WecomSelectedFile[]) => {
    insertWedriveChips(ctx, sessionId, files, input)
    close()
  }, [close, ctx, input, sessionId])

  return (
    <>
      <style>{LAUNCH_STYLE}</style>
      {placement === undefined || !showsToolRow(placement)
        ? null
        : (
          <Tooltip label={t('button.label')} side="top" delayMs={500}>
            <button
              ref={launcher}
              type="button"
              className="wcp-launch"
              aria-label={t('button.label')}
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => { setOpen(true) }}
            >
              <Wedrive16 />
            </button>
          </Tooltip>
        )}
      {open
        ? createPortal(
          mode === 'cli'
            ? <PickerWindow onConfirm={confirm} onClose={close} onUseIframe={useIframe} t={t} />
            : <IframePicker onConfirm={confirm} onClose={close} onUseCli={cliMissing ? undefined : useCli} t={t} />,
          document.body,
        )
        : null}
    </>
  )
}
