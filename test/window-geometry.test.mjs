/**
 * Window-geometry tests. Pure math plus a stubbed `localStorage`, so this runs
 * in Node with no DOM — the same way `model.test.mjs` covers the view model.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  CENTERED, DRAG_SLOP, NUDGE_STEP, NUDGE_STEP_FINE, WINDOW_MARGIN, clampOffset, dragOffset,
  exceedsSlop, loadWindowOffset, nudgeDelta, offsetLimit, saveWindowOffset,
} from '../src/client/window-geometry.ts'

/** Stored window position; the key is part of the persisted contract. */
const WINDOW_KEY = 'wecom-picker/window/v1'

const SIZE = { width: 780, height: 580 }
const VIEWPORT = { width: 1440, height: 900 }

/** A `localStorage` stand-in that only ever grows in memory. */
function memoryStorage() {
  const entries = new Map()
  return {
    entries,
    getItem: key => (entries.has(key) ? entries.get(key) : null),
    setItem: (key, value) => { entries.set(key, String(value)) },
  }
}

/** Run `body` with `localStorage` replaced, then put the global back as it was. */
function withStorage(value, body) {
  const had = Object.hasOwn(globalThis, 'localStorage')
  const previous = globalThis.localStorage
  Object.defineProperty(globalThis, 'localStorage', { value, configurable: true, writable: true })
  try {
    return body()
  } finally {
    if (had) Object.defineProperty(globalThis, 'localStorage', { value: previous, configurable: true, writable: true })
    else delete globalThis.localStorage
  }
}

test('offsetLimit leaves the configured margin on each axis', () => {
  assert.deepEqual(offsetLimit(SIZE, VIEWPORT), {
    x: (VIEWPORT.width - SIZE.width) / 2 - WINDOW_MARGIN,
    y: (VIEWPORT.height - SIZE.height) / 2 - WINDOW_MARGIN,
  })
  assert.deepEqual(offsetLimit(SIZE, VIEWPORT), { x: 322, y: 152 })
})

test('clampOffset pins a window that would leave the viewport', () => {
  assert.deepEqual(clampOffset({ x: 9999, y: -9999 }, SIZE, VIEWPORT), { x: 322, y: -152 })
})

test('clampOffset returns the input itself when the offset already fits', () => {
  const offset = { x: 40, y: -20 }
  assert.equal(clampOffset(offset, SIZE, VIEWPORT), offset)
})

test('a window as large as the viewport is pinned to the center', () => {
  const viewport = { width: 360, height: 640 }
  const size = { width: 400, height: 700 }
  assert.deepEqual(offsetLimit(size, viewport), CENTERED)
  assert.deepEqual(clampOffset({ x: 30, y: -30 }, size, viewport), CENTERED)
})

test('junk offsets fall back to the center instead of poisoning the transform', () => {
  const junk = { x: Number.NaN, y: Number.POSITIVE_INFINITY }
  assert.deepEqual(clampOffset(junk, SIZE, VIEWPORT), CENTERED)
})

test('dragOffset follows the pointer one to one', () => {
  const origin = { x: 12, y: -30 }
  assert.deepEqual(dragOffset(origin, { x: 100, y: 100 }, { x: 140, y: 60 }), { x: 52, y: -70 })
  assert.deepEqual(dragOffset(origin, { x: 5, y: 5 }, { x: 5, y: 5 }), origin)
})

test('exceedsSlop separates a drag from the click that ends it', () => {
  assert.equal(exceedsSlop(CENTERED, { x: DRAG_SLOP, y: 0 }), false)
  assert.equal(exceedsSlop(CENTERED, { x: DRAG_SLOP + 1, y: 0 }), true)
  assert.equal(exceedsSlop(CENTERED, { x: 0, y: -DRAG_SLOP - 1 }), true)
})

test('nudgeDelta maps the four arrows, with Shift asking for the fine step', () => {
  assert.deepEqual(nudgeDelta('ArrowLeft'), { x: -NUDGE_STEP, y: 0 })
  assert.deepEqual(nudgeDelta('ArrowRight'), { x: NUDGE_STEP, y: 0 })
  assert.deepEqual(nudgeDelta('ArrowUp'), { x: 0, y: -NUDGE_STEP })
  assert.deepEqual(nudgeDelta('ArrowDown'), { x: 0, y: NUDGE_STEP })
  assert.deepEqual(nudgeDelta('ArrowDown', true), { x: 0, y: NUDGE_STEP_FINE })
  assert.equal(nudgeDelta('Enter'), undefined)
  assert.equal(nudgeDelta('Tab', true), undefined)
})

test('a nudge never pushes the window past the reachable area', () => {
  const moved = nudgeDelta('ArrowRight')
  const next = { x: 9999 + moved.x, y: 0 }
  assert.deepEqual(clampOffset(next, SIZE, VIEWPORT), { x: 322, y: 0 })
})

test('the remembered position survives a reload, and junk is ignored', () => {
  const storage = memoryStorage()
  withStorage(storage, () => {
    saveWindowOffset({ x: 120, y: -64 })
    assert.equal(storage.entries.get(WINDOW_KEY), JSON.stringify({ x: 120, y: -64 }))
    assert.deepEqual(loadWindowOffset(), { x: 120, y: -64 })

    storage.setItem(WINDOW_KEY, '{ not json')
    assert.deepEqual(loadWindowOffset(), CENTERED)

    storage.setItem(WINDOW_KEY, JSON.stringify({ x: 12 }))
    assert.deepEqual(loadWindowOffset(), { x: 12, y: 0 })

    storage.setItem(WINDOW_KEY, JSON.stringify({ x: 'left', y: null }))
    assert.deepEqual(loadWindowOffset(), CENTERED)
  })
})

test('storage that refuses to be read or written never breaks the window', () => {
  const blocked = {
    getItem() { throw new Error('blocked') },
    setItem() { throw new Error('blocked') },
  }
  withStorage(blocked, () => {
    assert.deepEqual(loadWindowOffset(), CENTERED)
    assert.doesNotThrow(() => { saveWindowOffset({ x: 10, y: 10 }) })
  })
  withStorage(undefined, () => {
    assert.deepEqual(loadWindowOffset(), CENTERED)
    assert.doesNotThrow(() => { saveWindowOffset({ x: 10, y: 10 }) })
  })
})
