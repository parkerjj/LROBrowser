import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as WorkerStub } from './kore-fixture';

async function setup() {
  const fixture = packageFixture('lastro-20211103', {}, 2); const worker = new WorkerStub();
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 1 }, crypto: globalThis.crypto, setInterval, clearInterval });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker }); await host.start();
  const init = worker.messages[0]!; worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  return { fixture, worker, page, host, runtimeSessionId: init.runtimeSessionId };
}

test('Worker transport errors mark the runtime failed without restoring Host state', async () => {
  const { host, worker } = await setup();
  const error = new Event('error');
  Object.defineProperty(error, 'message', { value: 'worker load failed' });
  worker.dispatchEvent(error);
  expect(host.state.status).toBe('failed');
  expect(host.state.degradedReason).toBe('worker load failed');
});

test('failed bridge posts mark the runtime failed', async () => {
  const { host, worker } = await setup();
  worker.postError = new Error('bridge queue unavailable');
  host.beginGameSession(7, 'prontera.gat');
  expect(host.state.status).toBe('failed');
  expect(host.state.degradedReason).toContain('bridge queue unavailable');
});

test('resident lifecycle and raw game ingress use ordered bridge records', async () => {
  const { host, worker } = await setup();
  const game = host.beginGameSession(7, 'prontera.gat'); const generation = host.beginMapConnection();
  expect(game).toBeTruthy(); expect(generation).toBe(1);
  const records = worker.messages.filter(message => message.type === 'queue').map(bridgeRecord);
  expect(records.map(record => record.kind)).toEqual(['gameSessionStarted', 'mapConnectionStarted']);
  expect(records.every(record => Number.isSafeInteger(record.bridgeSequence)
    && record.context?.bridgeSequence === record.bridgeSequence)).toBe(true);
  for (let index = 0; index < 300; index += 1) expect(host.mirrorMapData(generation!, new Uint8Array([index & 0xff]))).toBe(true);
  expect(worker.messages.filter(message => message.type === 'queue' && bridgeRecord(message).kind === 'gameData').length).toBe(254);
});

test('Host forwards action context and native send result without generation filtering', async () => {
  const { host, worker, page, runtimeSessionId } = await setup();
  const sent: unknown[] = [];
  Object.assign(page, { KoreEngineNativeAction: (action: unknown) => { sent.push(action); return false; } });
  const game = host.beginGameSession(7, 'prontera.gat'); const generation = host.beginMapConnection();
  const action = { requestId: 9, runtimeSessionId, gameSessionId: game, connectionGeneration: generation, controlGeneration: 99, type: 'Attack', targetGid: 123 };
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action, taskIntentGeneration: 12 }] });
  expect(sent).toEqual([expect.objectContaining({ requestId: 9, controlGeneration: 99, taskIntentGeneration: 12 })]);
  const result = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult');
  expect(bridgeRecord(result!)).toMatchObject({ requestId: 9, accepted: false,
    context: { controlGeneration: 99, bridgeSequence: bridgeRecord(result!).bridgeSequence } });
});

test('malformed action is rejected at the transport boundary', async () => {
  const { host, worker, runtimeSessionId } = await setup();
  host.beginGameSession(7, 'prontera.gat'); host.beginMapConnection();
  worker.reply({ runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action: { type: 'Attack' } }] });
  expect(host.state.logs.at(-1)?.text).toContain('Rejected malformed Rust action');
  expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult')).toBe(false);
});

test('source contains no Host route or recovery state owner', async () => {
  const source = await readFile(new URL('../src/kore/kore-integration.mjs', import.meta.url), 'utf8');
  for (const symbol of ['routePermit', 'routeState', 'routePreview', 'recoveryMirror', 'recoveryBarrier', 'aiPermit', 'debugRouteGo']) expect(source.includes(symbol)).toBe(false);
});
