/**
 * Cordis plugin entry for the WeCom WeDrive picker.
 *
 * One package carries both halves: this host half registers the `wecom-cli`
 * HTTP routes and the runtime skills; the package's `dsh.client` declaration
 * puts the browser half (`lib/client.js`) into the client boot graph.
 *
 * The plugin declares no hard service dependency: routes wait for `webServer`
 * and `subprocess`, the skills for `skills`.
 *
 * Services are injected per capability, so a composition without a browser
 * carrier or an execution world still gets the skill half instead of failing
 * to activate.
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-skill'
import z from '@deepseek-ai/schemastery'
import { applyPickerRoutes } from './routes.ts'
import { WECOM_PICKER_SETUP_SKILL } from './skill-picker-setup.ts'
import { WECOM_WEDRIVE_REF_SKILL } from './skill-wedrive-ref.ts'
import { WecomPickerHost, type PickerSubprocess } from './wecom-cli.ts'
import type { PickerPlacement } from '../shared/protocol.ts'

export const name = 'wecom-picker'

/** Plugin configuration, settable on this package's Loader row. */
export interface Config {
  /**
   * Where the composer exposes the picker: as its own tool-row button
   * (`standalone`), as a row inside the composer's `+` command menu
   * (`plusMenu`), or both.
   * @default 'standalone'
   */
  placement?: PickerPlacement
}

export const Config: z<Config> = z.object({
  placement: z.union(['standalone', 'plusMenu', 'both']).default('standalone'),
})

export function apply(ctx: Context, config?: Config) {
  ctx.inject(['skills'], (scope) => {
    scope.effect(
      () => scope.skills.register(WECOM_WEDRIVE_REF_SKILL),
      'wecom-picker: wedrive chip skill',
    )
    scope.effect(
      () => scope.skills.register(WECOM_PICKER_SETUP_SKILL),
      'wecom-picker: setup skill',
    )
  })
  // The picker routes need a browser carrier and an execution world to run
  // `wecom-cli` in; compositions without either keep the skill half only.
  ctx.inject(['webServer', 'subprocess'], (scope) => {
    const host = new WecomPickerHost(
      Reflect.get(scope, 'subprocess') as PickerSubprocess,
      scope.logger,
    )
    const placement = config?.placement ?? 'standalone'
    scope.effect(
      () => applyPickerRoutes(scope, host, { placement }),
      'wecom-picker: picker routes',
    )
  })
}
