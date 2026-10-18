import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, packageFixture, TestWorkerStub as WorkerStub } from './kore-fixture';

async function harness() {
  const fixture = packageFixture('lastro-20211103', {}, 2); const worker = new WorkerStub();
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    indexedDB: new IDBFactory(), performance: { now: () => 1 }, crypto: globalThis.crypto });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker }); await host.start();
  const init = worker.messages[0]!; worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  host.beginGameSession(7, 'prontera.gat', { aid: 11, cid: 22 }); host.beginMapConnection();
  return { host, worker, page, fixture };
}

test('raw configuration documents remain available through the Host store', async () => {
  const { host } = await harness();
  const identity = { profile: 'lastro-20211103', aid: 11, cid: 22 };
  await host.saveConfigDocument({ ...identity, fileName: 'config.txt', rawText: 'attackAuto 2\n' });
  await host.saveConfigDocument({ ...identity, fileName: 'timeouts.txt', rawText: 'ai_move_giveup 1\n' });
  const documents = await host.getConfigDocuments(identity) as Array<{ fileName: string; rawText: string }>;
  expect(documents.map(document => document.fileName).sort()).toEqual(['config.txt', 'timeouts.txt']);
  expect(documents.find(document => document.fileName === 'config.txt')?.rawText).toBe('attackAuto 2\n');
});

test('reload command is passed as text to Rust and Host does not parse its target', async () => {
  const { host, worker } = await harness();
  await host.saveConfigDocument({ profile: 'lastro-20211103', aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto 2\n' });
  expect(host.reloadConfig('all')).toBe(true);
  await vi.waitFor(() => expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toBe(true));
  const command = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')!;
  expect(bridgeRecord(command).command).toBe('reload all');
  expect(bridgeRecord(command).target).toBeUndefined();
  expect(bridgeRecord(command).documents).toEqual(expect.arrayContaining([expect.objectContaining({ fileName: 'config.txt', rawText: 'attackAuto 2\n' })]));
  expect(bridgeRecord(command).profile).toBe('lastro-20211103');
  expect(bridgeRecord(command).aid).toBe(11);
  expect(bridgeRecord(command).cid).toBe(22);
});

test('pending reload documents are discarded after the active character changes', async () => {
  const { host, worker } = await harness();
  let resolveDocuments: (documents: unknown[]) => void = () => {};
  const pendingDocuments = new Promise<unknown[]>(resolve => { resolveDocuments = resolve; });
  vi.spyOn(host, 'getConfigDocuments').mockReturnValue(pendingDocuments);
  const oldGameSessionId = host.state.gameSessionId;
  expect(host.reloadConfig('config.txt')).toBe(true);
  expect(host.endGameSession()).toBe(true);
  host.beginGameSession(8, 'geffen.gat', { aid: 33, cid: 44 });
  resolveDocuments([{ fileName: 'config.txt', rawText: 'old character config\n' }]);
  await pendingDocuments;
  await Promise.resolve();
  expect(host.state.gameSessionId).not.toBe(oldGameSessionId);
  expect(worker.messages.some(message => message.type === 'queue' && bridgeRecord(message).kind === 'command')).toBe(false);
});

test('configuration store does not expose route or AI controller methods', async () => {
  const { host } = await harness();
  expect('debugRouteGo' in host).toBe(false); expect('debugRoutePreview' in host).toBe(false); expect('aiPermit' in host).toBe(false);
});
