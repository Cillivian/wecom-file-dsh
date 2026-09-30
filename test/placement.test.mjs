/**
 * Placement matrix and menu-entry handoff. Pure: no DOM, no React.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { showsToolRow, usesPlusMenu } from '../src/client/placement.ts'
import { createPickerStore } from '../src/client/picker-store.ts'
import { zh } from '../src/client/locales.ts'

test('placement decides both entry points', () => {
  const matrix = [
    ['standalone', true, false],
    ['plusMenu', false, true],
    ['both', true, true],
  ]
  for (const [placement, toolRow, menu] of matrix) {
    assert.equal(showsToolRow(placement), toolRow, `${placement} tool row`)
    assert.equal(usesPlusMenu(placement), menu, `${placement} plus menu`)
  }
})

test('the plus-menu row carries localized copy', () => {
  assert.equal(zh['menu.label'], '企业微信-微盘')
  assert.equal(typeof zh['menu.description'], 'string')
  assert.notEqual(zh['menu.description'], '')
})

test('the store opens only the session it was asked for', () => {
  const store = createPickerStore()
  const seen = []
  const stop = store.subscribe(id => seen.push(id))
  store.open('session-a')
  assert.deepEqual(seen, ['session-a'])
  stop()
  store.open('session-b')
  assert.deepEqual(seen, ['session-a'])
})

test('every subscriber sees the request, and unsubscribing is isolated', () => {
  const store = createPickerStore()
  const first = []
  const second = []
  const stopFirst = store.subscribe(id => first.push(id))
  store.subscribe(id => second.push(id))
  store.open('s1')
  stopFirst()
  store.open('s2')
  assert.deepEqual(first, ['s1'])
  assert.deepEqual(second, ['s1', 's2'])
})
