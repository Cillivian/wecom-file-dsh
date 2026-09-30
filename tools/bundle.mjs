/**
 * Build the client half without hard-coding one machine's paths.
 *
 * `tsdown` is not a dependency of this package: the runtime DSH installation
 * already ships it. Resolution order is an explicit override, the DSH checkout
 * named by `DSH_CHECKOUT`, a sibling `deepseek-harness` checkout, then whatever
 * `tsdown` is on PATH.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

/** Candidate tsdown binaries: explicit override, nearby checkouts, then PATH. */
function candidates() {
  const found = []
  if (process.env.DSH_TSUDOWN !== undefined && process.env.DSH_TSUDOWN !== '') found.push(process.env.DSH_TSUDOWN)
  if (process.env.DSH_CHECKOUT !== undefined && process.env.DSH_CHECKOUT !== '') {
    found.push(join(process.env.DSH_CHECKOUT, 'node_modules/.bin/tsdown'))
  }
  // Walk up from this checkout: `deepseek-harness` may sit beside the repo or a
  // level or two above it.
  let dir = ROOT
  for (let depth = 0; depth < 3; depth += 1) {
    found.push(join(dir, 'node_modules/.bin/tsdown'))
    found.push(join(dir, 'deepseek-harness', 'node_modules/.bin/tsdown'))
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  found.push('tsdown')
  return found
}

const resolved = candidates().find(candidate => candidate === 'tsdown' || existsSync(candidate))
if (resolved === undefined) {
  console.error('bundle: no tsdown found. Set DSH_TSUDOWN=/path/to/tsdown, or DSH_CHECKOUT=/path/to/deepseek-harness.')
  process.exit(1)
}

const result = spawnSync(
  resolved,
  ['--config', 'tsdown.config.ts', '--root', '.', '--tsconfig', 'tsconfig.client.json'],
  { cwd: ROOT, stdio: 'inherit' },
)
if (result.error !== undefined) {
  console.error(`bundle: failed to run ${resolved}: ${result.error.message}`)
  console.error('bundle: install tsdown globally, or set DSH_TSUDOWN to its binary path.')
  process.exit(1)
}
process.exit(result.status ?? 1)
