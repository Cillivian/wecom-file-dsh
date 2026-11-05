/**
 * The picker's HTTP surface on the composition's `webServer`: authorization
 * state, listings, and the interactive QR login relay.
 *
 * Every route is guarded by the composition's Host/Origin trust fence, so a
 * rebound DNS name or a cross-site page cannot drive the local CLI.
 */
                                                                
                                                  
import {
  PICKER_AUTH_QR_PATH, PICKER_AUTH_START_PATH, PICKER_CONFIG_PATH, PICKER_FILES_PATH, PICKER_STATUS_PATH,
                                                                            
} from '../shared/protocol.js'
import { PickerError, WecomPickerHost } from './wecom-cli.js'

/** The webserver seam this module consumes. */
                           
                   
                 
                
                                                                                
                
 

/** The connection trust fence, when this composition provides one. */
                            
                                                                                                    
 

/** JSON response with live-fact caching disabled. */
function sendJson(res                , status        , payload         )       {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

/** Refusal payload; one shape for every classified failure. */
export function failurePayload(error         )                       {
  const failure = error instanceof PickerError
    ? error
    : new PickerError('error', error instanceof Error ? error.message : String(error))
  return { ok: false, state: failure.code, message: failure.message }
}

/** One query parameter, with the empty string normalized away. */
function queryParam(url        , name        )                     {
  try {
    const value = new URL(url, 'http://localhost').searchParams.get(name)?.trim()
    return value === undefined || value === '' ? undefined : value
  } catch {
    // An unparsable request target has no parameters; the route treats that as
    // "no filter" rather than failing the request.
    return undefined
  }
}

/**
 * Refuse an untrusted caller.
 *
 * The fence is required, not optional: without it every route — including the
 * one that spawns `wecom-cli` — would be reachable from any page the operator
 * happens to visit (DNS rebinding, cross-site form POST). A composition that
 * cannot supply the fence therefore gets a refusal rather than an open route.
 */
function fenceOff(ctx         , req                 , res                )          {
  const fence = ctx.get('connection')                                           
  const rejection = fence === undefined ? 403 : fence.requestRejection(req)
  if (rejection === undefined) return false
  res.statusCode = rejection
  res.end()
  return true
}

/**
 * Register the picker's HTTP surface on the composition's `webServer`.
 * @param ctx - host context carrying `webServer` and `subprocess`.
 * @returns disposer removing every route.
 */
export function applyPickerRoutes(
  ctx         ,
  host                 ,
  config                                         ,
)             {
  const webServer = ctx.get('webServer')                              
  if (ctx.get('connection') === undefined) {
    ctx.logger.warn('wecom-picker: no connection trust fence in this composition; every picker route will refuse')
  }
  const method = (req                 , res                , allow                )          => {
    if (req.method === allow) return false
    res.statusCode = 405
    res.setHeader('allow', allow)
    res.end()
    return true
  }
  const json = async (res                , respond                        )                => {
    try {
      sendJson(res, 200, await respond())
    } catch (error) {
      const payload = failurePayload(error)
      sendJson(res, payload.state === 'missing' ? 503 : 200, payload)
    }
  }
  const disposers = [
    webServer.register({
      kind: 'exact',
      path: PICKER_CONFIG_PATH,
      handler: async (req, res) => {
        if (fenceOff(ctx, req, res) || method(req, res, 'GET')) return
        sendJson(res, 200, { placement: config.placement }                              )
      },
    }),
    webServer.register({
      kind: 'exact',
      path: PICKER_STATUS_PATH,
      handler: async (req, res) => {
        if (fenceOff(ctx, req, res) || method(req, res, 'GET')) return
        await json(res, () => host.status())
      },
    }),
    webServer.register({
      kind: 'exact',
      path: PICKER_FILES_PATH,
      handler: async (req, res) => {
        if (fenceOff(ctx, req, res) || method(req, res, 'GET')) return
        const url = req.url ?? '/'
        // HTTP input parsing belongs here; the CLI carrier takes a page size.
        const requested = Number(queryParam(url, 'limit'))
        const limit = Number.isInteger(requested) && requested > 0 ? requested : undefined
        await json(res, () => host.files(queryParam(url, 'q') ?? '', queryParam(url, 'cursor'), limit))
      },
    }),
    webServer.register({
      kind: 'exact',
      path: PICKER_AUTH_START_PATH,
      handler: async (req, res) => {
        if (fenceOff(ctx, req, res) || method(req, res, 'POST')) return
        // `restart=1` retires a running attempt before starting a new one; the
        // browser uses it to click through an expired QR code.
        const restart = queryParam(req.url ?? '/', 'restart') === '1'
        await json(res, () => host.startAuth({ restart }))
      },
    }),
    webServer.register({
      kind: 'exact',
      path: PICKER_AUTH_QR_PATH,
      handler: async (req, res) => {
        if (fenceOff(ctx, req, res) || method(req, res, 'GET')) return
        const image = await host.qrImage()
        if (image === undefined) {
          res.statusCode = 404
          res.end()
          return
        }
        res.statusCode = 200
        res.setHeader('content-type', 'image/png')
        res.setHeader('cache-control', 'no-store')
        res.end(image)
      },
    }),
  ]
  return () => { for (const dispose of disposers) dispose() }
}



//# sourceURL=/Users/cillivian/Documents/workspace/wecom-file-dsh/src/host/routes.ts