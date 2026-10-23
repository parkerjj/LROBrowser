import { expect, test, vi } from 'vitest';
import { createKoreIntegration } from '../src/kore/kore-integration.mjs';
import { bridgeRecord, objectRecord, packageFixture, TestWorkerStub as WorkerStub } from './kore-fixture';

async function setup(native: (action: unknown) => boolean = () => true) {
  const fixture = packageFixture('lastro-20211103', {}, 2); const worker = new WorkerStub();
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    performance: { now: () => 1 }, crypto: globalThis.crypto, KoreEngineNativeAction: vi.fn(native) });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker }); await host.start();
  const init = worker.messages[0]!; worker.reply({ runtimeSessionId: init.runtimeSessionId, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false });
  const gameSessionId = host.beginGameSession(7, 'prontera.gat'); const connectionGeneration = host.beginMapConnection();
  return { host, worker, page, gameSessionId, connectionGeneration };
}

test('AI command text is sent to Rust without Host mode state', async () => {
  const { host, worker } = await setup();
  expect(host.debugCommand('ai auto')).toBe(true);
  const command = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'command');
  expect(bridgeRecord(command!).command).toBe('ai auto');
  expect('aiMode' in host.state).toBe(false);
  expect('aiPermit' in host).toBe(false);
});

test('all Rust action kinds use one opaque native adapter and preserve context', async () => {
  const { worker, page, gameSessionId, connectionGeneration } = await setup();
  const actionTypes = ['Sit', 'Stand', 'Equip', 'Unequip', 'UseItem', 'Pickup', 'StorageTransfer', 'StorageClose', 'NpcTalk', 'NpcMenu', 'NpcContinue', 'NpcNumber', 'NpcText', 'NpcShopSelect', 'ShopBuy', 'ShopSell', 'ToggleServerAutoFight'];
  const sent: unknown[] = [];
  page.KoreEngineNativeAction.mockImplementation(action => { sent.push(action); return true; });
  const fields: Record<string, Record<string, unknown>> = {
    Sit: {}, Stand: {}, Equip: { inventoryIndex: 1, position: 2 }, Unequip: { inventoryIndex: 1 },
    UseItem: { inventoryIndex: 1, targetGid: 7 }, Pickup: { itemGid: 7 }, StorageTransfer: { inventoryIndex: 1, amount: 1, toStorage: true }, StorageClose: {},
    NpcTalk: { npcGid: 7 }, NpcMenu: { npcGid: 7, choice: 1 }, NpcContinue: { npcGid: 7 }, NpcNumber: { npcGid: 7, value: 123 }, NpcText: { npcGid: 7, text: 'answer' }, NpcShopSelect: { npcGid: 7, sell: false },
    ShopBuy: { npcGid: 7, items: [{ itemId: 501, amount: 1 }] }, ShopSell: { npcGid: 7, items: [{ inventoryIndex: 1, amount: 1 }] }, ToggleServerAutoFight: {},
  };
  actionTypes.forEach((type, index) => worker.reply({ runtimeSessionId: worker.messages[0]!.runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action: {
    requestId: index + 1, runtimeSessionId: worker.messages[0]!.runtimeSessionId, gameSessionId, connectionGeneration, controlGeneration: 3, taskIntentGeneration: 1, type, ...fields[type],
  } }] }));
  expect(sent.map(action => objectRecord(action).type)).toEqual(actionTypes);
  expect(sent.every(action => objectRecord(action).gameSessionId === gameSessionId
    && objectRecord(action).connectionGeneration === connectionGeneration)).toBe(true);
});

test('native action rejection is returned as an ActionResult event', async () => {
  const { host, worker, gameSessionId, connectionGeneration } = await setup(() => false);
  const action = { requestId: 77, runtimeSessionId: worker.messages[0]!.runtimeSessionId, gameSessionId, connectionGeneration, controlGeneration: 4, taskIntentGeneration: 1, type: 'Attack', targetGid: 9001 };
  worker.reply({ runtimeSessionId: worker.messages[0]!.runtimeSessionId, type: 'outputs', outputs: [{ kind: 'action', action }] });
  const result = worker.messages.find(message => message.type === 'queue' && bridgeRecord(message).kind === 'actionResult');
  expect(bridgeRecord(result!)).toMatchObject({ requestId: 77, accepted: false, reason: 'native-action-rejected' });
  host.dispose();
});
