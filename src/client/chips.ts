/** WeDrive reference chips: entry `id` / `doc_id`, filename label, file/folder icon. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { InputState } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {
  InputTriggerServiceContract, InputTriggerSource,
} from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { WecomSelectedFile } from './selector.ts'

/** Trigger-source name; also the chip `source` and serialize routing key. */
export const WEDRIVE_SOURCE = 'wedrive'

/**
 * Official `@` mention the message bubble already paints as a chip.
 * Path is `<id>/<filename>` so the last segment is the label and the model
 * still sees the WeDrive / doc id. Folders keep a trailing slash.
 * @param file - parsed selector entry.
 */
export function wedriveModelText(file: Pick<WecomSelectedFile, 'id' | 'name' | 'kind'>): string {
  const name = file.name.replace(/[\u0000-\u001f\u007f-\u009f"/]/gu, '_').trim() || file.id
  const path = file.kind === 'folder' ? `${file.id}/${name}/` : `${file.id}/${name}`
  return /\s/u.test(path) ? `@"${path}"` : `@${path}`
}

/**
 * Detect-projection length of a clipboard draft: each chip occupies one
 * U+FFFC, while `draft` stores the full clipboard form.
 */
function detectLength(draft: string, occurrences: readonly { readonly length: number }[]): number {
  let n = draft.length
  for (const occurrence of occurrences) n -= occurrence.length - 1
  return n
}

/**
 * Register the WeDrive source so submit serializes chip `ref` as an `@` mention.
 * @param ctx - client root that owns `inputTriggers`.
 * @returns disposer that unregisters the source.
 */
export function registerWedriveSource(ctx: ClientContext): () => void {
  const source: InputTriggerSource = {
    trigger: '@',
    name: WEDRIVE_SOURCE,
    showGroupTitle: false,
    order: 1000,
    candidates: async () => [],
    onPick: () => undefined,
    codec: {
      clipboardText: ref => ref,
      serialize: ref => Promise.resolve(ref),
    },
  }
  const inputTriggers = ctx.get('inputTriggers') as InputTriggerServiceContract
  return inputTriggers.registerSource(source)
}

/**
 * Append one WeDrive chip per selected file at the draft end.
 * @param ctx - client root (sessions live here).
 * @param sessionId - composer session.
 * @param files - parsed selector confirm list.
 * @param input - live input snapshot used for the first span CAS.
 */
export function insertWedriveChips(
  ctx: ClientContext,
  sessionId: SessionId,
  files: readonly WecomSelectedFile[],
  input: Pick<InputState, 'draft' | 'draftRev' | 'occurrences'>,
): void {
  if (files.length === 0) return
  const sessions = ctx.get('sessions') as ISessions
  const actx = sessions.scope(sessionId)
  if (actx === undefined) return
  let draftRev = input.draftRev
  let detectEnd = detectLength(input.draft, input.occurrences)
  for (const file of files) {
    const modelText = wedriveModelText(file)
    const ok = actx.bail(actx, 'slash/input-insert-reference', {
      reference: {
        source: WEDRIVE_SOURCE,
        ref: modelText,
        label: file.name,
        appearance: file.kind === 'folder' ? 'folder' : 'file',
        clipboardText: modelText,
      },
      span: { start: detectEnd, end: detectEnd, draftRev },
    })
    if (ok !== true) return
    draftRev += 1
    detectEnd += 2
  }
}
