/**
 * Build script — regenerate `builtins.json` from the upstream runtime
 * catalog at `src/services/customScript/completions.js`.
 *
 * Maintainer-only. Excluded from the published .vsix via .vscodeignore.
 *
 * Usage:
 *   node scripts/build-builtins.mjs [path/to/completions.js]
 *
 * Defaults to the sibling autotrade-mrd-indicators repo. Run whenever
 * the upstream catalog gains a new builtin so the extension's hover
 * tooltips and autocomplete stay in lockstep with the runtime.
 */
import { copyFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DEFAULT_SOURCE = resolve(
  REPO_ROOT,
  '../autotrade-mrd-indicators/src/services/customScript/completions.js',
);
const sourcePath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_SOURCE;

if (!existsSync(sourcePath)) {
  console.error(`✗ Source not found: ${sourcePath}`);
  console.error('  Pass an explicit path: node scripts/build-builtins.mjs /path/to/completions.js');
  process.exit(1);
}

// The source file uses ESM syntax but its parent package.json has no
// "type":"module" field, so Node refuses to import it as ESM. Copy to
// a temp .mjs file to force the loader.
const tmpPath = join(tmpdir(), `deltadsl-completions-${Date.now()}.mjs`);
copyFileSync(sourcePath, tmpPath);

try {
  const mod = await import(tmpPath);
  if (!mod.BUILTIN_COMPLETIONS) {
    throw new Error('Source file does not export BUILTIN_COMPLETIONS');
  }
  const outputPath = join(REPO_ROOT, 'builtins.json');
  writeFileSync(outputPath, JSON.stringify(mod.BUILTIN_COMPLETIONS, null, 2));
  console.log(`✓ Wrote ${mod.BUILTIN_COMPLETIONS.length} entries to ${outputPath}`);
} finally {
  unlinkSync(tmpPath);
}
