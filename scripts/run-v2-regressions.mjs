// Run the pinned upstream regressions explicitly instead of spawning a second
// Node test runner inside every ordinary Vitest invocation.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const inventory = JSON.parse(readFileSync(new URL('../config/lastro-module-inventory.json', import.meta.url), 'utf8'));
if (!Array.isArray(inventory.regressionTests) || inventory.regressionTests.length === 0) {
  throw new Error('Missing declared V2 regression tests');
}
const tests = inventory.regressionTests.map(test => resolve(root, inventory.testRoot, test));
const result = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status || 1;
