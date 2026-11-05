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
                                                  
                                            
import z from '@deepseek-ai/schemastery'
import { applyPickerRoutes } from './routes.js'
import { WECOM_PICKER_SETUP_SKILL } from './skill-picker-setup.js'
import { WECOM_WEDRIVE_REF_SKILL } from './skill-wedrive-ref.js'
import { WecomPickerHost,                       } from './wecom-cli.js'
                                                            

export const name = 'wecom-picker'

/** Plugin configuration, settable on this package's Loader row. */
                         
     
                                                                      
                                                                    
                           
                          
     
                             
 

export const Config            = z.object({
  placement: z.union(['standalone', 'plusMenu', 'both']).default('standalone'),
})

export function apply(ctx         , config         ) {
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
      Reflect.get(scope, 'subprocess')                    ,
      scope.logger,
    )
    const placement = config?.placement ?? 'standalone'
    scope.effect(
      () => {
        const disposeRoutes = applyPickerRoutes(scope, host, { placement })
        // A login attempt may outlive the page (its process waits for a scan
        // for minutes); the composition's disposal is what ends it.
        return () => { disposeRoutes(); host.dispose() }
      },
      'wecom-picker: picker routes',
    )
  })
}


//# sourceURL=/Users/cillivian/Documents/workspace/wecom-file-dsh/src/host/index.ts