/* eslint-disable @typescript-eslint/no-explicit-any */
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';

function readyWorld(runtimeSessionId: string, gameSessionId: string, connectionGeneration: number, mapName = 'prontera.gat') {
  return {
    runtimeSessionId, type: 'worldState', gameSessionId, connectionGeneration,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName,
    selfActor: { gid: 7, x: 10, y: 10, kind: 'self' },
    visibleEntities: { total: 1, players: 0, monsters: 1, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 },
  };
}

function createHarness() {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, indexedDB: new IDBFactory(),
    performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    document: Object.assign(new EventTarget(), { hidden: false }),
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker,
    mapResourceProvider: {
      handleResourceRequest: async () => ({ requestId: 1, result: { kind: 'error', code: 'unused', message: 'unused' } }),
      handleResourceValidation: async () => ({ requestId: 1, sourceRequestId: 1, committedFiles: [], deletedFiles: [] }),
      close: async () => undefined,
    } });
  return { host, worker, fixture };
}

async function startHarness(harness: ReturnType<typeof createHarness>) {
  const { host, worker, fixture } = harness;
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  return init;
}

function enterWorld(harness: ReturnType<typeof createHarness>, runtimeSessionId: string, identity: { aid: number; cid: number }, gid = 7, mapName = 'prontera.gat') {
  const { host, worker } = harness;
  const gameSessionId = host.beginGameSession(gid, mapName, identity)!;
  const connectionGeneration = host.beginMapConnection()!;
  worker.reply({ runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: mapName.replace(/\.gat$/i, '') });
  worker.reply(readyWorld(runtimeSessionId, gameSessionId, connectionGeneration, mapName));
  return gameSessionId;
}

async function waitForReload(worker: EventTarget & { messages: any[] }, startIndex: number) {
  return vi.waitFor(() => {
    const message = worker.messages.slice(startIndex).find(item => item.type === 'command' && item.command === 'reload');
    expect(message).toBeDefined();
    return message!;
  });
}

const profile = 'lastro-20211103';

test('reload conf loads only config.txt for the active character', async () => {
  const harness = createHarness();
  const { host, worker } = harness;
  try {
    const runtimeSessionId = (await startHarness(harness)).runtimeSessionId;
    enterWorld(harness, runtimeSessionId, { aid: 11, cid: 22 });
    const begin = worker.messages.find(message => message.type === 'beginGameSession');
    expect(begin).toMatchObject({ profile, aid: 11, cid: 22 });
    await host.saveConfigDocument({ profile, aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto 1\n' });
    await host.saveConfigDocument({ profile, aid: 11, cid: 22, fileName: 'timeouts.txt', rawText: 'ai 1\n' });
    await host.saveConfigDocument({ profile, aid: 33, cid: 44, fileName: 'config.txt', rawText: 'attackAuto 0\n' });

    const startIndex = worker.messages.length;
    expect(host.debugCommand('reload conf')).toBe(true);
    const message = await waitForReload(worker, startIndex);

    expect(message.target).toBe('conf');
    expect(message).toMatchObject({ profile, aid: 11, cid: 22 });
    expect(message.documents).toEqual([
      expect.objectContaining({ profile, aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto 1\n', revision: 1 }),
    ]);
  } finally {
    host.dispose();
  }
});

test('reload all excludes unsupported saved files and other characters', async () => {
  const harness = createHarness();
  const { host, worker } = harness;
  try {
    const runtimeSessionId = (await startHarness(harness)).runtimeSessionId;
    enterWorld(harness, runtimeSessionId, { aid: 11, cid: 22 });
    for (const fileName of ['config.txt', 'mon_control.txt', 'timeouts.txt', 'inventory.txt']) {
      await host.saveConfigDocument({ profile, aid: 11, cid: 22, fileName, rawText: '' });
    }
    await host.saveConfigDocument({ profile, aid: 33, cid: 44, fileName: 'config.txt', rawText: 'attackAuto 0\n' });

    const startIndex = worker.messages.length;
    expect(host.debugCommand('reload all')).toBe(true);
    const message = await waitForReload(worker, startIndex);

    expect(message.documents.map((document: any) => document.fileName).sort()).toEqual([
      'config.txt', 'mon_control.txt', 'timeouts.txt',
    ]);
    expect(message.documents.every((document: any) => document.aid === 11 && document.cid === 22 && document.profile === profile)).toBe(true);
  } finally {
    host.dispose();
  }
});

test('pending reload is discarded when the active character changes', async () => {
  const harness = createHarness();
  const { host, worker } = harness;
  try {
    const runtimeSessionId = (await startHarness(harness)).runtimeSessionId;
    enterWorld(harness, runtimeSessionId, { aid: 11, cid: 22 });
    await host.saveConfigDocument({ profile, aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto 1\n' });

    const startIndex = worker.messages.length;
    expect(host.debugCommand('reload conf')).toBe(true);
    const nextGameSessionId = enterWorld(harness, runtimeSessionId, { aid: 33, cid: 44 }, 8, 'izlude.gat');
    await new Promise(resolve => setTimeout(resolve, 20));

    const reloads = worker.messages.slice(startIndex).filter(message => message.type === 'command' && message.command === 'reload');
    expect(reloads).toEqual([]);
    expect(host.state.gameSessionId).toBe(nextGameSessionId);
  } finally {
    host.dispose();
  }
});

test('reload is refused while the AI action permit is active', async () => {
  const harness = createHarness();
  const { host, worker } = harness;
  try {
    const runtimeSessionId = (await startHarness(harness)).runtimeSessionId;
    enterWorld(harness, runtimeSessionId, { aid: 11, cid: 22 });
    expect(host.debugCommand('ai auto')).toBe(true);
    const before = worker.messages.length;
    expect(host.debugCommand('reload conf')).toBe(false);
    expect(worker.messages.slice(before).some(message => message.type === 'command' && message.command === 'reload')).toBe(false);
  } finally {
    host.dispose();
  }
});

test('reload rejection exposes actionable file and line diagnostics in the console state', async () => {
  const harness = createHarness();
  const { host, worker } = harness;
  try {
    const runtimeSessionId = (await startHarness(harness)).runtimeSessionId;
    enterWorld(harness, runtimeSessionId, { aid: 11, cid: 22 });
    await host.saveConfigDocument({ profile, aid: 11, cid: 22, fileName: 'config.txt', rawText: 'attackAuto invalid\n' });
    const startIndex = worker.messages.length;
    expect(host.debugCommand('reload conf')).toBe(true);
    const request = await waitForReload(worker, startIndex);
    worker.reply({ runtimeSessionId, type: 'commandResult', requestId: request.requestId,
      result: { kind: 'reload', accepted: false, target: 'config.txt', effectiveRevision: 0,
        diagnostics: [{ fileName: 'config.txt', line: 1, key: 'attackAuto', code: 'config-value-invalid', severity: 'error', message: 'invalid value' }] } });
    expect(host.state.logs.some(entry => entry.level === 'error' && entry.text.includes('config.txt')
      && entry.text.includes('1') && entry.text.includes('config-value-invalid'))).toBe(true);
  } finally {
    host.dispose();
  }
});

test('experience command results are visible in the console state', async () => {
  const harness = createHarness();
  const { host, worker } = harness;
  try {
    const runtimeSessionId = (await startHarness(harness)).runtimeSessionId;
    const gameSessionId = enterWorld(harness, runtimeSessionId, { aid: 11, cid: 22 });
    expect(host.debugCommand('exp report')).toBe(true);
    const request = worker.messages.find(message => message.type === 'command' && message.command === 'exp_report');
    const report = { summary: { gameSessionId, baseLevel: 10, baseExpGained: 25 }, itemChanges: [{ itemId: 501, name: 'Item #501', netAmount: 2 }] };
    worker.reply({ runtimeSessionId, type: 'commandResult', requestId: request.requestId,
      result: { kind: 'experienceReport', report } });
    expect(host.state.experience).toEqual(report);
    expect(host.state.logs.some(entry => entry.level === 'info' && entry.text.includes('baseExpGained')
      && entry.text.includes('Item #501'))).toBe(true);
  } finally {
    host.dispose();
  }
});
