/**
 * Guard for the committed host artifacts.
 *
 * Released packages are installed under a profile's `node_modules`, where Node
 * will not strip TypeScript types, so `lib/host` + `lib/shared` are the files
 * DSH actually loads (see `tools/build-host.mjs`). Forgetting to rerun the
 * build after a host change would ship stale code with no test failure — this
 * file makes that failure visible.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HOST_ROOTS, listHostSources, hostOutputPath, transpileHost } from '../tools/host-transpile.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'src')
const LIB = join(ROOT, 'lib')

/** Every `.js` under `lib/<root>/`, as paths relative to `lib/`. */
async function* walkShipped(dir, prefix) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const relativePath = `${prefix}/${entry.name}`
    if (entry.isDirectory()) yield* walkShipped(join(dir, entry.name), relativePath)
    else if (entry.isFile() && entry.name.endsWith('.js')) yield relativePath
  }
}

test('committed lib/host + lib/shared match the TypeScript sources', async () => {
  const expected = new Map()
  for (const file of await listHostSources(SRC)) {
    expected.set(hostOutputPath(file, SRC), transpileHost(await readFile(file, 'utf8'), file))
  }
  assert.ok(expected.size > 0, 'no host sources found under src/')

  for (const [path, js] of expected) {
    const shipped = await readFile(join(LIB, path), 'utf8').catch(() => undefined)
    assert.notEqual(shipped, undefined, `lib/${path} is missing — run: node --run build:host`)
    assert.equal(shipped, js, `lib/${path} is out of date — run: node --run build:host`)
  }

  const shipped = []
  for (const root of HOST_ROOTS) {
    for await (const path of walkShipped(join(LIB, root), root)) shipped.push(path)
  }
  assert.deepEqual(
    shipped.sort(),
    [...expected.keys()].sort(),
    'lib/ has stale host artifacts — run: node --run build:host',
  )
})
