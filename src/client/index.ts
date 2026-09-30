/**
 * Browser half: the WeCom WeDrive picker.
 *
 * Two ways in, one modal. The composer tool-row button is the slot entry below;
 * the composer `+` menu row is a client command contribution. Both are gated by
 * the plugin's `placement` config, and both open the same component through a
 * small store — a command contribution's `run()` has no React context, so it
 * cannot own the modal itself.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'
import { Wedrive16 } from './assets/WedriveIcon.tsx'
import { registerWedriveSource } from './chips.ts'
import { loadPlacement } from './config.ts'
import { en, NS, zh, type WecomPickerKey } from './locales.ts'
import { createWecomPicker } from './PickerButton.tsx'
import { createPickerStore } from './picker-store.ts'
import { usesPlusMenu } from './placement.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Scratch WeCom file-picker copy. */
    'wecom.picker': WecomPickerKey
  }
}

/**
 * The `ctx.commandUi` face this package consumes. Declared locally (like the
 * host half's service seams) so the package needs no extra runtime dependency;
 * the surface is the frozen client command contract.
 */
interface CommandUiFace {
  register(contribution: {
    name: string
    label?(): string
    description?(): string
    icon?: (props: IconProps) => unknown
    available(session: { readonly sessionId: string }): boolean
    ui: { kind: 'action'; run(session: { readonly sessionId: string }): void }
  }): () => void
}

/** Command name of the `+` menu row; unique across contributions. */
const MENU_COMMAND = 'wecom-picker'

/** Locale dictionaries, trigger codec, and the conversation slot tree. */
export const inject = ['slots', 'locale', 'inputTriggers', 'sessions']

/** Register the picker's two entry points. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'wecom-picker: dictionaries')
  ctx.effect(() => registerWedriveSource(ctx), 'wecom-picker: wedrive source')

  const store = createPickerStore()
  // The slot stays registered in every placement: with `plusMenu` it renders no
  // button, but it remains the mounted host for the `+` menu row's modal.
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'wecom-picker',
    order: 20,
    locale: NS,
  }, createWecomPicker(ctx, store)))

  registerMenuEntry(ctx, store)
}

/**
 * Add the picker to the composer's `+` command menu when the placement asks for
 * it. Registration waits on the config read, so the menu row never appears on a
 * `standalone` install.
 */
function registerMenuEntry(ctx: ClientContext, store: ReturnType<typeof createPickerStore>): void {
  // `commandUi` is optional: a composition without it keeps the tool-row button.
  ctx.inject(['commandUi'], (scope) => {
    const t = ctx.locale.bind(NS)
    scope.effect(() => {
      let dispose: (() => void) | undefined
      let cancelled = false
      void loadPlacement().then((placement) => {
        if (cancelled || !usesPlusMenu(placement)) return
        const commandUi = scope.get('commandUi') as unknown as CommandUiFace
        dispose = commandUi.register({
          name: MENU_COMMAND,
          label: () => t('menu.label'),
          description: () => t('menu.description'),
          icon: Wedrive16,
          available: () => true,
          ui: { kind: 'action', run: (session) => { store.open(String(session.sessionId)) } },
        })
      })
      return () => { cancelled = true; dispose?.() }
    }, 'wecom-picker: plus-menu entry')
  })
}
