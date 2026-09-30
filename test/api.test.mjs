/**
 * Browser-side route calls: how a classified refusal survives a non-2xx status.
 * Hermetic — `fetch` is stubbed, so no host and no network.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { fetchPickerFiles, fetchPickerStatus, pickerAuthQrUrl, startPickerAuth } from '../src/client/cli/api.ts'

/** Install one scripted fetch for the duration of `body`. */
async function withFetch(handler, body) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return handler(String(url), init)
  }
  try {
    return { result: await body(), calls }
  } finally {
    globalThis.fetch = original
  }
}

/** A fetch response stub. */
const reply = (status, payload) => ({ ok: status >= 200 && status < 300, status, json: async () => payload })

test('a 200 listing returns its payload', async () => {
  const page = { ok: true, items: [{ id: 'a', name: 'a' }], hasMore: false }
  const { result } = await withFetch(() => reply(200, page), () => fetchPickerFiles({ query: '' }))
  assert.deepEqual(result, page)
})

test('a 503 refusal body still reaches the caller', async () => {
  // This is exactly what the host answers when `wecom-cli` is not installed;
  // throwing here would make the iframe fallback unreachable.
  const refusal = { ok: false, state: 'missing', message: '未找到 wecom-cli' }
  const { result } = await withFetch(() => reply(503, refusal), () => fetchPickerFiles({ query: '' }))
  assert.deepEqual(result, refusal)
  assert.equal(result.state, 'missing')
})

test('a status refusal body still reaches the caller', async () => {
  const refusal = { state: 'unauthorized', message: 'token expired', auth: { phase: 'idle' } }
  const { result } = await withFetch(() => reply(503, refusal), () => fetchPickerStatus())
  assert.equal(result.state, 'unauthorized')
})

test('a bodyless failure stays a transport error', async () => {
  await assert.rejects(
    withFetch(() => reply(500, undefined), () => fetchPickerFiles({ query: '' })).then(r => r.result),
    /HTTP 500/,
  )
  await assert.rejects(
    withFetch(() => reply(401, undefined), () => startPickerAuth(undefined)).then(r => r.result),
    /HTTP 401/,
  )
  // A bodyless failure on a value the caller does not branch on still throws.
  await assert.rejects(
    withFetch(() => ({ ok: false, status: 502, json: async () => { throw new Error('not json') } }), () => fetchPickerStatus()).then(r => r.result),
    /HTTP 502/,
  )
})

test('queries carry only the parameters the CLI understands', async () => {
  const empty = await withFetch(() => reply(200, { ok: true, items: [] }), () => fetchPickerFiles({ query: '   ' }))
  assert.equal(empty.calls[0].url, 'wecom-picker/files?limit=30')
  const search = await withFetch(
    () => reply(200, { ok: true, items: [] }),
    () => fetchPickerFiles({ query: '周报 plan', cursor: 'c1' }),
  )
  assert.equal(search.calls[0].url, 'wecom-picker/files?q=%E5%91%A8%E6%8A%A5+plan&cursor=c1&limit=30')
})

test('auth start and the QR reference use their own routes', async () => {
  const started = await withFetch(
    () => reply(200, { phase: 'waiting' }),
    () => startPickerAuth(undefined),
  )
  assert.equal(started.calls[0].url, 'wecom-picker/auth/start')
  assert.equal(started.calls[0].init.method, 'POST')
  assert.equal(pickerAuthQrUrl(7), 'wecom-picker/auth/qr.png?t=7')
})
