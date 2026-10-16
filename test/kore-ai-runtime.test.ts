/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';

function readyWorld(runtimeSessionId: string, gameSessionId: string, connectionGeneration: number) {
  return {
    runtimeSessionId, type: 'worldState', gameSessionId, connectionGeneration,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName: 'prontera.gat',
    selfActor: { gid: 7, x: 10, y: 10, kind: 'self' },
    visibleEntities: { total: 1, players: 0, monsters: 1, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 },
  };
}

test('ai commands create a permit and reject stale action requests after ai off', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeAction: (action: any) => { sent.push(action); return true; },
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
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply(readyWorld(init.runtimeSessionId, host.state.gameSessionId!, generation!));
  expect(host.debugCommand('ai auto')).toBe(true);
  const auto = worker.messages.find(message => message.type === 'command' && message.command === 'ai_auto');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'commandResult', requestId: auto.requestId, result: { kind: 'aiState', aiMode: 'auto', taskCount: 1 } });
  expect(host.state.aiState).toBe('auto');
  const oldGeneration = host.state.controlGeneration;
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'actionRequest', requestId: 700,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: oldGeneration, requestId: 1, type: 'Attack', targetGid: 1002 } });
  expect(sent).toHaveLength(1);
  expect(host.debugCommand('ai off')).toBe(true);
  expect(host.state.aiState).toBe('off');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'actionRequest', requestId: 701,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId: host.state.gameSessionId, connectionGeneration: generation,
      controlGeneration: oldGeneration, requestId: 2, type: 'Attack', targetGid: 1002 } });
  expect(sent).toHaveLength(1);
  host.dispose();
});

test('late ai command results cannot restore auto after a new map connection starts', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const firstGeneration = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId: host.state.gameSessionId,
    connectionGeneration: firstGeneration, profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true,
    mapName: 'prontera.gat', selfActor: { gid: 7, x: 10, y: 10, kind: 'self' },
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  expect(host.debugCommand('ai auto')).toBe(true);
  const auto = worker.messages.find(message => message.type === 'command' && message.command === 'ai_auto');
  expect(auto).toBeTruthy();
  host.beginMapConnection();
  expect(host.state.aiState).toBe('off');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'commandResult', requestId: auto.requestId,
    result: { kind: 'aiState', aiMode: 'auto', taskCount: 1 } });
  expect(host.state.aiState).toBe('off');
  expect(host.state.aiTaskCount).toBe(0);
  host.dispose();
});

test('degraded and ended sessions clear the AI state and task count', async () => {
  const fixture = packageFixture();
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  host.beginGameSession(7, 'prontera.gat');
  const generation = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'mapResourceState', mapResourceState: 'ready', mapName: 'prontera' });
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId: host.state.gameSessionId,
    connectionGeneration: generation, profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true,
    mapName: 'prontera.gat', selfActor: { gid: 7, x: 10, y: 10, kind: 'self' },
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  expect(host.debugCommand('ai auto')).toBe(true);
  const auto = worker.messages.find(message => message.type === 'command' && message.command === 'ai_auto');
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'commandResult', requestId: auto.requestId,
    result: { kind: 'aiState', aiMode: 'auto', taskCount: 2 } });
  expect(host.state.aiState).toBe('auto');
  expect(host.state.aiTaskCount).toBe(2);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId: host.state.gameSessionId,
    connectionGeneration: generation, profile: 'lastro-20211103', streamStatus: 'degraded', worldReady: false,
    mapName: 'prontera.gat', selfActor: null,
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 },
    degradedReason: 'parser-degraded' });
  expect(host.state.aiState).toBe('off');
  expect(host.state.aiTaskCount).toBe(0);
  host.endGameSession();
  expect(host.state.aiState).toBe('off');
  expect(host.state.aiTaskCount).toBe(0);
  host.dispose();
});

test('M4 recovery, pickup, and storage actions use the AI permit and generation checks', async () => {
  const fixture = packageFixture();
  const sent: any[] = [];
  const page = Object.assign(new EventTarget(), {
    location: { href: 'http://localhost/' }, fetch: fixture.fetch, performance: { now: () => 42 }, crypto: globalThis.crypto,
    setInterval, clearInterval, setTimeout, clearTimeout,
    KoreEngineNativeAction: (action: any) => { sent.push(action); return true; },
  });
  class Worker extends EventTarget {
    messages: any[] = [];
    postMessage(message: any) { this.messages.push(message); }
    terminate() {}
    reply(message: any) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
  }
  const worker = new Worker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  worker.reply({ ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off', capabilities: { mapStream: true },
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } });
  const gameSessionId = host.beginGameSession(7, 'prontera.gat', { aid: 11, cid: 22 });
  const connectionGeneration = host.beginMapConnection();
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'worldState', gameSessionId, connectionGeneration,
    profile: 'lastro-20211103', streamStatus: 'world-ready', worldReady: true, mapName: 'prontera.gat',
    selfActor: { gid: 7, x: 10, y: 10, kind: 'self' }, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: 1 } });
  expect(host.debugCommand('ai auto')).toBe(true);
  const generation = host.state.controlGeneration;
  for (const [requestId, action] of [
    [1, { type: 'UseItem', inventoryIndex: 3, targetGid: 7 }],
    [2, { type: 'Pickup', itemGid: 88 }],
    [3, { type: 'StorageTransfer', inventoryIndex: 3, amount: 1, toStorage: true }],
    [4, { type: 'NpcTalk', npcGid: 900 }],
    [5, { type: 'NpcMenu', npcGid: 900, choice: 2 }],
    [6, { type: 'NpcContinue', npcGid: 900 }],
    [7, { type: 'NpcShopSelect', npcGid: 900, sell: false }],
    [8, { type: 'NpcShopSelect', npcGid: 900, sell: true }],
    [9, { type: 'ShopBuy', npcGid: 900, itemId: 501, amount: 2 }],
    [10, { type: 'ShopSell', npcGid: 900, inventoryIndex: 3, amount: 1 }],
  ] as const) {
    worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'actionRequest', requestId: 700 + requestId,
      action: { runtimeSessionId: init.runtimeSessionId, gameSessionId, connectionGeneration, controlGeneration: generation, requestId, ...action } });
  }
  expect(sent.map(action => action.type)).toEqual([
    'UseItem', 'Pickup', 'StorageTransfer', 'NpcTalk', 'NpcMenu', 'NpcContinue',
    'NpcShopSelect', 'NpcShopSelect', 'ShopBuy', 'ShopSell',
  ]);
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'actionRequest', requestId: 799,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId, connectionGeneration, controlGeneration: generation,
      requestId: 11, type: 'MoveTo', x: 1024, y: 10 } });
  worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'actionRequest', requestId: 800,
    action: { runtimeSessionId: init.runtimeSessionId, gameSessionId, connectionGeneration, controlGeneration: generation,
      requestId: 12, type: 'UseSkillAt', skillId: 19, level: 1, x: 10, y: 1024 } });
  expect(sent).toHaveLength(10);
  host.dispose();
});

