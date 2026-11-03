/**
 * Host-route tests. Hermetic: a fake subprocess answers canned `wecom-cli`
 * output and a fake webserver captures the handlers, so nothing here needs the
 * real CLI, network, a browser, or the private DSH packages.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { WecomPickerHost } from '../src/host/wecom-cli.ts'
import { applyPickerRoutes } from '../src/host/routes.ts'

// The host writes its QR relay under `$DSH_HOME`; point that at a throwaway
// directory so the suite never touches a real profile.
const SANDBOX = mkdtempSync(join(tmpdir(), 'wecom-picker-test-'))
process.env.DSH_HOME = SANDBOX
process.on('exit', () => { rmSync(SANDBOX, { recursive: true, force: true }) })

/** A fake subprocess service whose answers are scripted per CLI invocation. */
function fakeSubprocess(handler) {
  const calls = []
  return {
    calls,
    resolveExecutable: (command) => {
      if (command !== 'wecom-cli') throw new Error(`unexpected command ${command}`)
      return Promise.resolve('/fake/bin/wecom-cli')
    },
    spawn(spec) {
      const [, ...args] = spec.argv
      calls.push(args)
      const { stdout = '', stderr = '', exitCode = 0 } = handler(args, calls.length)
      return {
        collected: {
          stdout: { readFrom: () => ({ text: stdout, nextOffset: stdout.length }) },
          stderr: { readFrom: () => ({ text: stderr, nextOffset: stderr.length }) },
        },
        done: Promise.resolve({ exitCode, signal: null }),
        terminate: () => undefined,
        spec,
      }
    },
  }
}

/** A fake webserver capturing exact routes. */
function fakeWebServer() {
  const handlers = new Map()
  return {
    handlers,
    register(route) {
      if (handlers.has(route.path)) throw new Error(`duplicate ${route.path}`)
      handlers.set(route.path, route.handler)
      return () => handlers.delete(route.path)
    },
  }
}

/** A fake response capturing status, headers, and body. */
function fakeResponse() {
  const state = { statusCode: 200, headers: {}, body: Buffer.alloc(0) }
  state.setHeader = (name, value) => { state.headers[name] = value }
  state.end = (payload) => {
    state.body = payload === undefined ? Buffer.alloc(0) : Buffer.from(String(payload))
  }
  return state
}

/** Dispatch one request through the captured handlers. */
async function hit(surface, path, { method = 'GET', url = path } = {}) {
  const res = fakeResponse()
  await surface.webServer.handlers.get(path)({ method, url, headers: {} }, res)
  return { status: res.statusCode, headers: res.headers, body: res.body.toString('utf8') }
}

/** Build a host plus its routes over one scripted subprocess. */
function surface({
  handler, placement = 'standalone', fence = { requestRejection: () => undefined }, logger = { warn: () => undefined },
}) {
  const subprocess = fakeSubprocess(handler)
  const host = new WecomPickerHost(subprocess, logger)
  const webServer = fakeWebServer()
  const ctx = {
    get: (name) => (name === 'webServer' ? webServer : name === 'connection' ? fence : undefined),
    logger,
  }
  const dispose = applyPickerRoutes(ctx, host, { placement })
  return { host, subprocess, webServer, dispose }
}

const LIST_PAYLOAD = JSON.stringify({
  has_more: true,
  next_cursor: 'cursor-2',
  files: [
    {
      id: 'w3_doc', docid: 'w3_doc', file_name: '季度复盘', type: 'word',
      space_name: '产品空间', folder_name: '复盘', update_time: '2026-09-30 15:46:21', file_size: 11847060,
    },
    {
      id: 's.9f2a', file_name: '预算表.xlsx', type: 'file',
      path: '无权限查看文件所在路径', update_time: '2026-08-01 11:20:00', file_size: 2411724,
    },
  ],
})

test('files route normalizes CLI entries into chip payloads', async () => {
  const s = surface({ handler: () => ({ stdout: LIST_PAYLOAD }) })
  const response = await hit(s, '/wecom-picker/files', { url: '/wecom-picker/files?limit=2' })
  assert.equal(response.status, 200)
  const payload = JSON.parse(response.body)
  assert.equal(payload.ok, true)
  assert.equal(payload.hasMore, true)
  assert.equal(payload.nextCursor, 'cursor-2')
  assert.deepEqual(payload.items[0], {
    id: 'w3_doc', idKind: 'doc', name: '季度复盘', kind: 'file', type: 'word',
    path: '产品空间 / 复盘', updatedAt: '2026-09-30 15:46:21', size: 11847060,
    spaceName: '产品空间', folderName: '复盘',
  })
  // The host is a faithful wire mapping: it forwards the CLI's placeholder path
  // verbatim and leaves hiding it to the client model (see model.test.mjs).
  assert.equal(payload.items[1].path, '无权限查看文件所在路径')
  assert.equal(payload.items[1].idKind, 'file')
})

test('files route searches when a query is present and lists otherwise', async () => {
  const seen = []
  const s = surface({
    handler: (args) => {
      seen.push(args)
      return { stdout: LIST_PAYLOAD }
    },
  })
  await hit(s, '/wecom-picker/files', { url: '/wecom-picker/files' })
  await hit(s, '/wecom-picker/files', { url: '/wecom-picker/files?q=%E5%91%A8%E6%8A%A5&limit=999' })
  assert.deepEqual(seen[0].slice(0, 3), ['disk', 'files', 'list'])
  assert.deepEqual(JSON.parse(seen[0][4]), { limit: 30 })
  assert.deepEqual(seen[1].slice(0, 3), ['disk', 'files', 'search'])
  // The CLI caps `limit` at 100; the route clamps before it gets there.
  assert.deepEqual(JSON.parse(seen[1][4]), { keywords: ['周报'], limit: 100 })
})

test('an expired CLI token is classified as unauthorized', async () => {
  const s = surface({ handler: () => ({ stdout: JSON.stringify({ errcode: 853004, errmsg: 'cli token expired, please re-fetch' }) }) })
  const response = await hit(s, '/wecom-picker/files')
  assert.equal(response.status, 200)
  const payload = JSON.parse(response.body)
  assert.equal(payload.ok, false)
  assert.equal(payload.state, 'unauthorized')
  assert.match(payload.message, /token expired/)
})

test('a missing CLI reports 503 and status reports missing', async () => {
  const s = surface({ handler: () => ({ stdout: '' }) })
  s.host = new WecomPickerHost({ resolveExecutable: () => Promise.reject(new Error('ENOENT')) }, { warn: () => undefined })
  const webServer = fakeWebServer()
  applyPickerRoutes(
    { get: (name) => (name === 'webServer' ? webServer : { requestRejection: () => undefined }), logger: { warn: () => undefined } },
    s.host,
    { placement: 'standalone' },
  )
  const response = await hit({ webServer }, '/wecom-picker/files')
  assert.equal(response.status, 503)
  assert.equal(JSON.parse(response.body).state, 'missing')
})

test('methods are guarded and unknown refusal shapes stay generic', async () => {
  const s = surface({ handler: () => ({ stdout: 'not json at all', stderr: 'boom', exitCode: 3 }) })
  assert.equal((await hit(s, '/wecom-picker/status', { method: 'POST' })).status, 405)
  assert.equal((await hit(s, '/wecom-picker/auth/start', { method: 'GET' })).status, 405)
  assert.equal((await hit(s, '/wecom-picker/auth/qr.png', { method: 'POST' })).status, 405)
  const failure = await hit(s, '/wecom-picker/files')
  assert.equal(JSON.parse(failure.body).state, 'error')
  assert.equal((await hit(s, '/wecom-picker/auth/qr.png')).status, 404)
})

test('the trust fence is required: no connection service means refusal', async () => {
  const webServer = fakeWebServer()
  const warnings = []
  const host = new WecomPickerHost(fakeSubprocess(() => ({ stdout: LIST_PAYLOAD })), { warn: () => undefined })
  applyPickerRoutes(
    { get: (name) => (name === 'webServer' ? webServer : undefined), logger: { warn: (m) => warnings.push(m) } },
    host,
    { placement: 'standalone' },
  )
  const response = await hit({ webServer }, '/wecom-picker/status')
  assert.equal(response.status, 403)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /no connection trust fence/)
})

test('a rejecting fence wins over the route', async () => {
  const s = surface({ handler: () => ({ stdout: LIST_PAYLOAD }), fence: { requestRejection: () => 401 } })
  assert.equal((await hit(s, '/wecom-picker/config')).status, 401)
  assert.equal((await hit(s, '/wecom-picker/status')).status, 401)
  assert.equal((await hit(s, '/wecom-picker/files')).status, 401)
  assert.equal((await hit(s, '/wecom-picker/auth/start', { method: 'POST' })).status, 401)
})

test('the config route reports the placement without touching the CLI', async () => {
  const s = surface({ handler: () => ({ stdout: LIST_PAYLOAD }), placement: 'plusMenu' })
  const response = await hit(s, '/wecom-picker/config')
  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(response.body), { placement: 'plusMenu' })
  assert.equal((await hit(s, '/wecom-picker/config', { method: 'POST' })).status, 405)
  assert.equal(s.subprocess.calls.length, 0)
})

test('disposal removes every route', () => {
  const s = surface({ handler: () => ({ stdout: LIST_PAYLOAD }) })
  assert.equal(s.webServer.handlers.size, 5)
  s.dispose()
  assert.equal(s.webServer.handlers.size, 0)
})

test('the auth start route forwards the restart flag to the host', async () => {
  const webServer = fakeWebServer()
  const calls = []
  const host = {
    startAuth: async (options) => {
      calls.push(options)
      return { phase: 'waiting' }
    },
  }
  applyPickerRoutes(
    { get: name => (name === 'webServer' ? webServer : { requestRejection: () => undefined }), logger: { warn: () => undefined } },
    host,
    { placement: 'standalone' },
  )
  await hit({ webServer }, '/wecom-picker/auth/start', { method: 'POST', url: '/wecom-picker/auth/start?restart=1' })
  await hit({ webServer }, '/wecom-picker/auth/start', { method: 'POST' })
  assert.deepEqual(calls, [{ restart: true }, { restart: false }])
})

test('the CLI is invoked with a fixed argv array, never a shell', async () => {
  const s = surface({ handler: () => ({ stdout: LIST_PAYLOAD }) })
  await hit(s, '/wecom-picker/files', { url: '/wecom-picker/files?q=%22%3B%20rm%20-rf%20%2F' })
  const args = s.subprocess.calls.at(-1)
  assert.deepEqual(args.slice(0, 3), ['disk', 'files', 'search'])
  // A quoting payload stays one JSON string argument.
  assert.equal(args.length, 5)
  assert.deepEqual(JSON.parse(args[4]), { keywords: ['"; rm -rf /'], limit: 30 })
})
