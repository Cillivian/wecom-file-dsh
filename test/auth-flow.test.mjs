/**
 * Host-side authorization attempt lifecycle: a failed login, the re-authorize
 * click that follows it, and restarting a running (e.g. expired-QR) attempt.
 *
 * Hermetic: a fake subprocess keeps `auth init` processes pending until the
 * test settles them, so waiting / failed / restarted phases are observable
 * without the real CLI, a scan, or a browser.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { PickerError, WecomPickerHost } from '../src/host/wecom-cli.ts'

// The host writes its QR relay under `$DSH_HOME`; keep that in a throwaway dir.
const SANDBOX = mkdtempSync(join(tmpdir(), 'wecom-picker-auth-test-'))
process.env.DSH_HOME = SANDBOX
process.on('exit', () => { rmSync(SANDBOX, { recursive: true, force: true }) })

/** One collected stream holding fixed text. */
function stream(text) {
  return { readFrom: () => ({ text, nextOffset: text.length }) }
}

/** A process that has already exited. */
function exited({ stdout = '', stderr = '', exitCode = 0 }) {
  return {
    collected: { stdout: stream(stdout), stderr: stream(stderr) },
    done: Promise.resolve({ exitCode, signal: null }),
    terminate: () => undefined,
  }
}

/** A login process that stays pending until the test settles or terminates it. */
function pending({ stdout = '', stderr = '' }) {
  let resolveDone
  const done = new Promise((resolve) => { resolveDone = resolve })
  const process = {
    collected: { stdout: stream(stdout), stderr: stream(stderr) },
    done,
    terminated: false,
    terminate() {
      process.terminated = true
      resolveDone({ exitCode: null, signal: 'SIGTERM' })
    },
    settle(exitCode) {
      resolveDone({ exitCode, signal: null })
    },
  }
  return process
}

/**
 * A fake subprocess: `auth init` forks a pending login process (recorded so a
 * test can settle it), everything else answers from `probe` / `payload`.
 */
function fakeSubprocess({ probe = 'unauthorized', payload = { files: [] } } = {}) {
  const calls = []
  const logins = []
  return {
    calls,
    logins,
    resolveExecutable: () => Promise.resolve('/fake/bin/wecom-cli'),
    spawn(spec) {
      const args = spec.argv.slice(1)
      calls.push(args)
      if (args[0] === 'auth' && args[1] === 'init') {
        const login = pending({ stdout: '请打开二维码链接扫码: \nhttps://example.test/auth?code=1\n' })
        logins.push(login)
        return login
      }
      if (args[0] === 'auth') return exited({ stdout: `${probe}\n` })
      if (args[0] === '-V') return exited({ stdout: 'wecom-cli 1.2.1' })
      if (args[0] === 'disk') return exited({ stdout: JSON.stringify(payload) })
      return exited({})
    },
  }
}

/** Let the microtask queue deliver whatever the subprocess just settled. */
const tick = () => new Promise((resolve) => { setTimeout(resolve, 0) })

/** Hosts built by a test; a pending login holds a timer, so disposal is required. */
const hosts = []
function makeHost(subprocess) {
  const host = new WecomPickerHost(subprocess, { warn: () => undefined })
  hosts.push(host)
  return host
}
test.after(() => { for (const host of hosts) host.dispose() })

test('a failed login is reported, and re-authorize starts a fresh attempt', async () => {
  const subprocess = fakeSubprocess()
  const host = makeHost(subprocess)

  const idle = await host.status()
  assert.equal(idle.state, 'unauthorized')
  assert.equal(idle.auth.phase, 'idle')

  assert.deepEqual(await host.startAuth(), { phase: 'waiting' })
  assert.equal(subprocess.logins.length, 1)
  assert.equal((await host.status()).auth.phase, 'waiting')

  subprocess.logins[0].settle(2)
  await tick()
  const failed = await host.status()
  assert.equal(failed.state, 'unauthorized')
  assert.equal(failed.auth.phase, 'failed')
  assert.match(failed.auth.message, /auth init exited with 2/u)

  // The click: a second login process, and the failure no longer reported.
  assert.deepEqual(await host.startAuth(), { phase: 'waiting' })
  assert.equal(subprocess.logins.length, 2)
  // A settled attempt is simply forgotten; there is no process left to kill.
  assert.equal(subprocess.logins[0].terminated, false)
  assert.equal((await host.status()).auth.phase, 'waiting')
})

test('restarting a waiting login retires the old process and reports the new attempt', async () => {
  const subprocess = fakeSubprocess()
  const host = makeHost(subprocess)
  await host.startAuth()
  await host.status()

  assert.deepEqual(await host.startAuth({ restart: true }), { phase: 'waiting' })
  assert.equal(subprocess.logins.length, 2)
  assert.equal(subprocess.logins[0].terminated, true)

  // The retired attempt settling late must not flip the new attempt's state.
  await tick()
  assert.equal((await host.status()).auth.phase, 'waiting')

  subprocess.logins[1].settle(3)
  await tick()
  assert.equal((await host.status()).auth.phase, 'failed')
})

test('starting without restart is idempotent while a login runs', async () => {
  const subprocess = fakeSubprocess()
  const host = makeHost(subprocess)
  await host.startAuth()
  // The reused attempt now also reports the link it has printed.
  assert.equal((await host.startAuth()).phase, 'waiting')
  assert.equal((await host.startAuth()).phase, 'waiting')
  assert.equal(subprocess.logins.length, 1)
})

test('a completed login is trusted only once the probe confirms authorization', async () => {
  const subprocess = fakeSubprocess({ probe: 'authorized' })
  const host = makeHost(subprocess)
  await host.startAuth()
  // While the attempt runs, the probe is deliberately skipped.
  assert.equal((await host.status()).auth.phase, 'waiting')

  subprocess.logins[0].settle(0)
  await tick()
  const status = await host.status()
  assert.equal(status.state, 'authorized')
  assert.deepEqual(status.auth, { phase: 'idle' })
})

test('disposal ends a waiting login and refuses to start another', async () => {
  const subprocess = fakeSubprocess()
  const host = makeHost(subprocess)
  await host.startAuth()
  host.dispose()
  assert.equal(subprocess.logins[0].terminated, true)
  assert.equal((await host.status()).auth.phase, 'idle')
  await assert.rejects(
    host.startAuth(),
    error => error instanceof PickerError && error.code === 'error',
  )
  assert.equal(subprocess.logins.length, 1)
})

test('authorization failures are classified as unauthorized, whatever the envelope', async () => {
  const failures = [
    // What the CLI actually prints for a missing credential (verified against
    // wecom-cli 1.2.1): the inner code lives in the message, not the envelope.
    { error: { type: 'UnknownError', code: 893999, message: 'AuthError: 该请求需要授权，请先运行 `wecom-cli auth init` 登录 [code=893201]' } },
    { error: { code: 40001, message: 'invalid credential' } },
    { error: { code: 42001, message: 'access token expired' } },
    { error: { code: 999999, message: 'endpoint requires auth but no token available' } },
    { errcode: 853004, errmsg: 'cli token expired, please re-fetch' },
  ]
  for (const payload of failures) {
    const host = makeHost(fakeSubprocess({ payload }))
    await assert.rejects(
      host.files('', undefined, undefined),
      error => error instanceof PickerError && error.code === 'unauthorized',
      JSON.stringify(payload),
    )
  }
})

test('a non-auth business error stays a generic error', async () => {
  const host = makeHost(
    fakeSubprocess({ payload: { error: { code: 500, message: 'disk not found' } } }),
  )
  await assert.rejects(
    host.files('', undefined, undefined),
    error => error instanceof PickerError && error.code === 'error',
  )
})
