/**
 * Transpile the host half from TypeScript to the JavaScript the package ships.
 *
 * Shared by `tools/build-host.mjs` (which writes `lib/`) and
 * `test/build-artifacts.test.mjs` (which fails when the committed artifacts no
 * longer match `src/`), so both agree on exactly one transform:
 *
 *   strip the types -> point relative `.ts` imports at the emitted `.js`
 *
 * `stripTypeScriptTypes` does not rewrite import specifiers and does not check
 * types. The host half is written in erasable syntax only (see
 * docs/ARCHITECTURE.md), so stripping is all that is needed.
 */
import { readdir } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { join, relative, sep } from 'node:path'

/** Directories under `src/` that ship to the host runtime. */
export const HOST_ROOTS = ['host', 'shared']

/** A relative import ending in `.ts`; rewritten to `.js` in the output. */
const TS_SPECIFIER = /(['"])(\.{1,2}\/[^'"]+?)\.ts(['"])/g

/** Every `.ts` file under `dir`, recursively, in a stable order. */
async function* walkTs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkTs(path)
    else if (entry.isFile() && entry.name.endsWith('.ts')) yield path
  }
}

/** Absolute paths of every host source under `srcDir`, sorted. */
export async function listHostSources(srcDir) {
  const files = []
  for (const root of HOST_ROOTS) {
    for await (const file of walkTs(join(srcDir, root))) files.push(file)
  }
  return files.sort()
}

/**
 * The `lib/` path a source maps to, relative to `lib/`:
 * `src/host/index.ts` -> `host/index.js`.
 */
export function hostOutputPath(sourceFile, srcDir) {
  return relative(srcDir, sourceFile).split(sep).join('/').replace(/\.ts$/, '.js')
}

/**
 * The shipped JavaScript for one host source file. Throws when the source still
 * contains a relative `.ts` import after rewriting — importing `.ts` from
 * inside a profile's `node_modules` is exactly the failure this build exists to
 * prevent.
 */
export function transpileHost(source, sourceFile) {
  const stripped = stripTypeScriptTypes(source, { mode: 'strip', sourceUrl: sourceFile })
  const js = stripped.replace(TS_SPECIFIER, '$1$2.js$3')
  const leftover = js.match(/['"]\.{1,2}\/[^'"]+\.ts['"]/)
  if (leftover !== null) {
    throw new Error(`${sourceFile}: still imports ${leftover[0]} after type stripping`)
  }
  return js
}
