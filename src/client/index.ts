/** Browser half: WeCom WeDrive iframe picker on the composer tool row. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { registerWedriveSource } from './chips.ts'
import { createWecomPicker } from './WecomPickerButton.tsx'
import { en, NS, zh, type WecomPickerKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Scratch WeCom file-picker copy. */
    'wecom.picker': WecomPickerKey
  }
}

/** Locale dictionaries, trigger codec, and the conversation slot tree. */
export const inject = ['slots', 'locale', 'inputTriggers', 'sessions']

/** Register the WeCom picker on the composer left tool row. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'scratch-wecom: dictionaries')
  ctx.effect(() => registerWedriveSource(ctx), 'scratch-wecom: wedrive source')
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'wecom-picker',
    order: 20,
    locale: NS,
  }, createWecomPicker(ctx)))
}
