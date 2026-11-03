/**
 * Auth-panel decisions. Pure: no DOM, no React — the panel's rules are checked
 * directly, including the states the UI must keep clickable after a failure.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { authPanel, pollsAuth } from '../src/client/cli/auth.ts'

/** A waiting attempt, as reported beside a QR image. */
const WAITING = { phase: 'waiting', link: 'https://example.test/auth?code=1' }

test('an expired token offers re-authorize when no attempt is running', () => {
  const panel = authPanel('unauthorized', { phase: 'idle' })
  assert.equal(panel.reauthorize, true)
  assert.equal(panel.qr, false)
  assert.equal(panel.retry, false)
  assert.equal(panel.poll, false)
  assert.equal(panel.failure, undefined)
})

test('a failed attempt stays clickable and shows the failure detail', () => {
  // This is the case the issue is about: the attempt ended, and the only way
  // forward is a fresh authorization.
  const panel = authPanel('unauthorized', { phase: 'failed', message: '二维码已过期' })
  assert.equal(panel.reauthorize, true)
  assert.equal(panel.qr, false)
  assert.equal(panel.failure, '二维码已过期')
})

test('a failure without a message still names the failure', () => {
  assert.equal(authPanel('unauthorized', { phase: 'failed' }).failure, '')
})

test('a waiting attempt shows its QR, polls, and can still be restarted', () => {
  const panel = authPanel('unauthorized', WAITING)
  assert.equal(panel.qr, true)
  assert.equal(panel.poll, true)
  assert.equal(pollsAuth('unauthorized', WAITING), true)
  // A QR code cannot be refreshed in place, so the button must remain available
  // to retire the attempt and start a new login.
  assert.equal(panel.reauthorize, true)
})

test('a generic read error still offers re-authorize', () => {
  // An authorization failure can be classified as a plain error; leaving the
  // user without a login action would be a dead end.
  const panel = authPanel('error', { phase: 'idle' })
  assert.equal(panel.reauthorize, true)
  assert.equal(panel.retry, true)
  assert.equal(panel.qr, false)
})

test('a missing CLI has no login to start', () => {
  const panel = authPanel('missing', { phase: 'idle' })
  assert.equal(panel.reauthorize, false)
  assert.equal(panel.retry, true)
})

test('polling only makes sense for a running attempt', () => {
  assert.equal(pollsAuth(undefined, WAITING), false)
  assert.equal(pollsAuth('error', WAITING), false)
  assert.equal(pollsAuth('unauthorized', { phase: 'idle' }), false)
  assert.equal(pollsAuth('unauthorized', { phase: 'failed' }), false)
})
