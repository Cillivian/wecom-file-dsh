/**
 * Local HTTPS split proxy so DSH and WeDrive share https://doc.weixin.qq.com.
 *
 *   /dsh /plugins /assets /api …  →  127.0.0.1:3080
 *   everything else (e.g. /webdisk)  →  the real doc.weixin.qq.com (public DNS)
 *
 * Prefer Whistle/Whistle2 (whistle.rules) if the browser already
 * uses that proxy. Do not combine hosts + this process + Whistle — they fight.
 *
 * Setup without Whistle:
 *   1. sudo sh -c 'grep -q "doc.weixin.qq.com" /etc/hosts || echo "127.0.0.1 doc.weixin.qq.com" >> /etc/hosts'
 *   2. mkcert -install && mkdir -p certs && mkcert -cert-file certs/doc.weixin.qq.com.pem -key-file certs/doc.weixin.qq.com-key.pem doc.weixin.qq.com
 *   3. dsh web --patch "$PWD/cordis.dev.yml" --trusted-host doc.weixin.qq.com --no-open
 *   4. sudo node "$PWD/tools/dev-proxy.mjs"
 *   5. Open https://doc.weixin.qq.com/dsh/?token=… (token from the dsh web line)
 */
import { Resolver } from 'node:dns/promises'
import { readFileSync } from 'node:fs'
import { createServer as createHttpsServer } from 'node:https'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { createConnection } from 'node:net'
import { connect as tlsConnect } from 'node:tls'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const LISTEN_PORT = Number(process.env.DSH_WECOM_PROXY_PORT ?? 443)
const DSH_PORT = Number(process.env.DSH_WECOM_DSH_PORT ?? 3080)
const PUBLIC_HOST = 'doc.weixin.qq.com'
const DSH_PREFIX = '/dsh'
const DSH_EXACT = new Set(['/manifest.webmanifest', '/favicon.svg'])
const DSH_ROOTS = ['/plugins', '/assets', '/api']

const resolver = new Resolver()
resolver.setServers(['8.8.8.8', '1.1.1.1'])

/** @type {{ ip: string, expiresAt: number } | undefined} */
let upstream

/** Resolve the real WeDrive address, bypassing /etc/hosts. */
async function weixinAddress() {
  if (upstream !== undefined && upstream.expiresAt > Date.now()) return upstream.ip
  const [ip] = await resolver.resolve4(PUBLIC_HOST)
  if (ip === undefined || ip === '127.0.0.1') {
    throw new Error(`dev-proxy: public DNS for ${PUBLIC_HOST} resolved to ${String(ip)}`)
  }
  upstream = { ip, expiresAt: Date.now() + 60_000 }
  return ip
}

/** @param {string} pathname */
function isDshPath(pathname) {
  if (pathname === DSH_PREFIX || pathname.startsWith(`${DSH_PREFIX}/`)) return true
  if (DSH_EXACT.has(pathname)) return true
  return DSH_ROOTS.some(root => pathname === root || pathname.startsWith(`${root}/`))
}

/** @param {string} pathname */
function stripDshPrefix(pathname) {
  if (pathname === DSH_PREFIX) return '/'
  if (pathname.startsWith(`${DSH_PREFIX}/`)) return pathname.slice(DSH_PREFIX.length) || '/'
  return pathname
}

/** @param {string} location */
function rewriteLocation(location) {
  if (location.startsWith(DSH_PREFIX)) return location
  if (location.startsWith('/')) return `${DSH_PREFIX}${location}`
  try {
    const url = new URL(location)
    if (url.hostname === '127.0.0.1' || url.hostname === PUBLIC_HOST) {
      url.protocol = 'https:'
      url.hostname = PUBLIC_HOST
      url.port = ''
      url.pathname = url.pathname === '/' || url.pathname.startsWith(DSH_PREFIX)
        ? (url.pathname === '/' ? `${DSH_PREFIX}/` : url.pathname)
        : `${DSH_PREFIX}${url.pathname}`
      return url.href
    }
  } catch {
    // Location that is not a URL stays verbatim
  }
  return location
}

/** @param {string} html */
function rewriteHtml(html) {
  return html.replaceAll('<base href="/">', `<base href="${DSH_PREFIX}/">`)
}

const HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailers', 'transfer-encoding', 'upgrade', 'host',
])

/** @param {import('node:http').IncomingHttpHeaders} incoming */
function copyHeaders(incoming) {
  /** @type {import('node:http').OutgoingHttpHeaders} */
  const headers = {}
  for (const [name, value] of Object.entries(incoming)) {
    if (value === undefined || HOP.has(name.toLowerCase())) continue
    headers[name] = value
  }
  return headers
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
async function handle(req, res) {
  const incoming = new URL(req.url ?? '/', `https://${PUBLIC_HOST}`)
  const toDsh = isDshPath(incoming.pathname)
  const path = `${toDsh ? stripDshPrefix(incoming.pathname) : incoming.pathname}${incoming.search}`
  const headers = copyHeaders(req.headers)
  headers.host = PUBLIC_HOST

  const backend = toDsh
    ? httpRequest({ hostname: '127.0.0.1', port: DSH_PORT, method: req.method, path, headers })
    : httpsRequest({
      hostname: await weixinAddress(),
      port: 443,
      servername: PUBLIC_HOST,
      method: req.method,
      path,
      headers,
    })

  backend.on('error', (error) => {
    if (!res.headersSent) res.writeHead(502)
    res.end(String(error))
  })
  backend.on('response', (upstreamRes) => {
    const out = { ...upstreamRes.headers }
    if (toDsh && typeof out.location === 'string') out.location = rewriteLocation(out.location)
    const type = typeof out['content-type'] === 'string' ? out['content-type'] : ''
    const rewrite = toDsh && incoming.pathname.startsWith(DSH_PREFIX) && type.includes('text/html')
    if (rewrite) {
      const chunks = []
      upstreamRes.on('data', chunk => chunks.push(chunk))
      upstreamRes.on('end', () => {
        const body = rewriteHtml(Buffer.concat(chunks).toString('utf8'))
        delete out['content-length']
        res.writeHead(upstreamRes.statusCode ?? 502, out)
        res.end(body)
      })
      return
    }
    res.writeHead(upstreamRes.statusCode ?? 502, out)
    upstreamRes.pipe(res)
  })
  req.pipe(backend)
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:stream').Duplex} socket
 * @param {Buffer} head
 */
async function handleUpgrade(req, socket, head) {
  const incoming = new URL(req.url ?? '/', `https://${PUBLIC_HOST}`)
  const toDsh = isDshPath(incoming.pathname)
  const path = `${toDsh ? stripDshPrefix(incoming.pathname) : incoming.pathname}${incoming.search}`
  const headers = [`${req.method} ${path} HTTP/1.1`, `Host: ${PUBLIC_HOST}`]
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || name.toLowerCase() === 'host') continue
    headers.push(`${name}: ${Array.isArray(value) ? value.join(', ') : value}`)
  }
  const prelude = `${headers.join('\r\n')}\r\n\r\n`

  const backend = toDsh
    ? createConnection({ host: '127.0.0.1', port: DSH_PORT })
    : tlsConnect({ host: await weixinAddress(), port: 443, servername: PUBLIC_HOST })

  backend.on('error', () => socket.destroy())
  socket.on('error', () => backend.destroy())
  const onReady = (): void => {
    backend.write(prelude)
    if (head.length > 0) backend.write(head)
    backend.pipe(socket)
    socket.pipe(backend)
  }
  if (toDsh) backend.once('connect', onReady)
  else backend.once('secureConnect', onReady)
}

const certFile = join(HERE, 'certs/doc.weixin.qq.com.pem')
const keyFile = join(HERE, 'certs/doc.weixin.qq.com-key.pem')
let cert
let key
try {
  cert = readFileSync(certFile)
  key = readFileSync(keyFile)
} catch {
  console.error(`dev-proxy: missing ${certFile} / ${keyFile}`)
  console.error('dev-proxy: mkcert -install && mkcert -cert-file certs/doc.weixin.qq.com.pem -key-file certs/doc.weixin.qq.com-key.pem doc.weixin.qq.com')
  process.exit(1)
}

const server = createHttpsServer({ cert, key }, (req, res) => {
  handle(req, res).catch((error) => {
    if (!res.headersSent) res.writeHead(502)
    res.end(String(error))
  })
})
server.on('upgrade', (req, socket, head) => {
  handleUpgrade(req, socket, head).catch(() => socket.destroy())
})
server.listen(LISTEN_PORT, '127.0.0.1', () => {
  console.log(`dev-proxy: https://${PUBLIC_HOST}/dsh/  →  127.0.0.1:${String(DSH_PORT)}`)
  console.log(`dev-proxy: https://${PUBLIC_HOST}/webdisk/…  →  real ${PUBLIC_HOST}`)
})
server.on('error', (error) => {
  if (error.code === 'EACCES') {
    console.error(`dev-proxy: port ${String(LISTEN_PORT)} needs root (sudo node ${process.argv[1] ?? 'tools/dev-proxy.mjs'})`)
  } else if (error.code === 'EADDRINUSE') {
    console.error(`dev-proxy: port ${String(LISTEN_PORT)} is already in use`)
  } else {
    console.error(error)
  }
  process.exit(1)
})
