import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as WorkerStub } from './kore-fixture';

test('Host route controls are removed from the bridge surface', async () => {
  const source = await readFile(new URL('../src/kore/kore-integration.mjs', import.meta.url), 'utf8');
  for (const symbol of ['debugRouteGo', 'debugRoutePreview', 'debugRouteCancel', 'routePermit', 'recoveryMirror', 'recoverySnapshot']) expect(source.includes(symbol)).toBe(false);
});

test('route-like user text remains an opaque command for Rust', async () => {
  const fixture = packageFixture('lastro-20211103', {}, 2);
  const worker = new WorkerStub();
  const page = { location: { href: 'http://localhost/' }, fetch: fixture.fetch, performance: { now: () => 1 }, crypto: globalThis.crypto };
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  host.beginGameSession(7, 'prontera.gat');
  host.beginMapConnection();
  expect(host.debugCommand('move geffen')).toBe(true);
  const command = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'command');
  expect(bridgeRecord(command!).command).toBe('move geffen');
  expect(worker.messages.some(message => /Route|route/.test(JSON.stringify(message.record ?? message)))).toBe(false);
});
