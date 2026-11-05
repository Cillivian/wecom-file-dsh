/**
 * Build the host half: `src/host/**` + `src/shared/**` -> `lib/host/**` + `lib/shared/**`.
 *
 * Why this exists: a released bundle is installed into a profile's
 * `node_modules`, and Node refuses to strip TypeScript types for files under
 * `node_modules`:
 *
 *   Error [ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING]: Stripping types is
 *   currently unsupported for files under node_modules, for
 *   "file:///.../node_modules/wecom-dsh-plugins/src/host/index.ts"
 *
 * So the package exports plain JS (`exports["."]` -> `lib/host/index.js`) and
 * the sources stay TypeScript. This build is a pure transpile (types stripped,
 * relative `.ts` imports rewritten) — no bundling, no type checking. The
 * artifacts are committed; rerun this after changing `src/host` or `src/shared`.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HOST_ROOTS, listHostSources, hostOutputPath, transpileHost } from './host-transpile.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const OUT = join(ROOT, 'lib')

// Every previous output goes away first so a deleted source file cannot linger
// in the published tarball as a stale module.
for (const dir of HOST_ROOTS) await rm(join(OUT, dir), { recursive: true, force: true })

const written = []
for (const file of await listHostSources(SRC)) {
  const outFile = join(OUT, hostOutputPath(file, SRC))
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, transpileHost(await readFile(file, 'utf8'), file))
  written.push(relative(ROOT, outFile))
}

console.log(`build-host: ${written.length} file(s) -> ${relative(ROOT, OUT)}/`)
for (const file of written) console.log(`  ${file}`)
