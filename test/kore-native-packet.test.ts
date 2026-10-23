/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from 'node:fs/promises';
import { expect, test, vi } from 'vitest';
import { sendKoreNativePacket } from '../src/kore/kore-integration.mjs';
import { extractRuntimeNode } from './helpers/vendor-runtime';

class PACKET_CZ_REQUEST_MOVE2 {
  dest = [237, 222];

  getPacketVersion() { return [20211103, 0x035f, 5, 2]; }

  build() {
    const buffer = Uint8Array.from([0x5f, 0x03, 0x01, 0x02, 0x03]).buffer;
    return { buffer, view: new DataView(buffer) };
  }
}

function runtimePage(sentBytes = 91): any {
  return {
    console: { log: vi.fn() },
    KoreEngine: { state: { sentBytes } },
  };
}

test('native KE packet send does not write to the Chrome console', () => {
  const page = runtimePage();
  const packet = new PACKET_CZ_REQUEST_MOVE2();
  const sendPacket = vi.fn();

  const sent = sendKoreNativePacket({ type: 'MoveTo', x: 237, y: 222 }, packet, { sendPacket });

  expect(sent).toBe(true);
  expect(sendPacket).toHaveBeenCalledOnce();
  expect(page.console.log).not.toHaveBeenCalled();
});

test('patched MoveTo sender preserves the native network path', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, {
    kind: 'assignment', name: 'globalThis.KoreEngineNativeAction',
  });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  const page = runtimePage();
  const Packet = PACKET_CZ_REQUEST_MOVE2;
  const socket = { connected: true, isZone: true, readyState: 1 };
  const Network = {
    sendPacket: vi.fn((packet: PACKET_CZ_REQUEST_MOVE2) => {
      const encoded = packet.build();
      page.KoreEngine.state.sentBytes += encoded.buffer.byteLength;
    }),
  };
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(page, sendKoreNativePacket, Network,
    { value: 20211103 }, { CZ: { REQUEST_MOVE2: Packet, REQUEST_MOVE: Packet } }, {},
    socket, () => false, () => false);

  const sent = nativeAction({ type: 'MoveTo', x: 237, y: 222 });

  expect(sent).toBe(true);
  expect(Network.sendPacket).toHaveBeenCalledOnce();
  expect(page.console.log).not.toHaveBeenCalled();
});

test('self-cast skills target the map actor id (AID), not the character-server CID', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, { kind: 'assignment', name: 'globalThis.KoreEngineNativeAction' });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeUseSkill { SKID = 0; selectedLevel = 0; targetID = -1; build() { return new Uint8Array(10); } }
  const sent: FakeUseSkill[] = [];
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(runtimePage(), (_action: unknown, packet: FakeUseSkill) => { sent.push(packet); return true; },
    { sendPacket() {} }, { value: 20211103 }, { CZ: { USE_SKILL2: FakeUseSkill, USE_SKILL: FakeUseSkill } },
    { AID: 2010367, GID: 194237 }, null, () => false, () => false);

  expect(nativeAction({ type: 'UseSkillSelf', skillId: 28, level: 3 })).toBe(true);
  expect(nativeAction({ type: 'UseSkillOnTarget', skillId: 20, level: 3, targetGid: 110031484 })).toBe(true);
  expect(sent.map(packet => [packet.SKID, packet.selectedLevel, packet.targetID])).toEqual([[28, 3, 2010367], [20, 3, 110031484]]);
});

test('normal attacks request continuous attack mode 7', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, {
    kind: 'assignment', name: 'globalThis.KoreEngineNativeAction',
  });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeAttack {
    targetGID = 0;
    action = -1;
    build() { return new Uint8Array(7); }
  }
  const sent: FakeAttack[] = [];
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(
    runtimePage(),
    (_action: unknown, packet: FakeAttack) => { sent.push(packet); return true; },
    { sendPacket() {} },
    { value: 20211103 },
    { CZ: { REQUEST_ACT2: FakeAttack, REQUEST_ACT: FakeAttack } },
    {},
    null,
    () => false,
    () => false,
  );

  expect(nativeAction({ type: 'Attack', targetGid: 110031484 })).toBe(true);
  expect(sent).toHaveLength(1);
  expect(sent.at(0)).toMatchObject({ targetGID: 110031484, action: 7 });
});

test('native KE packet send reports a refused or missing sender as not sent', () => {
  const packet = new PACKET_CZ_REQUEST_MOVE2();
  const build = vi.spyOn(packet, 'build');

  expect(sendKoreNativePacket({ type: 'MoveTo', x: 237, y: 222 }, packet, { sendPacket: () => false })).toBe(false);
  expect(sendKoreNativePacket({ type: 'MoveTo', x: 237, y: 222 }, null, { sendPacket: vi.fn() })).toBe(false);
  expect(build).not.toHaveBeenCalled();
});

test('drop item actions use PACKET_CZ_ITEM_THROW2 Index/count', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, {
    kind: 'assignment', name: 'globalThis.KoreEngineNativeAction',
  });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeItemThrow {
    Index = 0;
    count = 0;
    build() { return new Uint8Array(6); }
  }
  const sent: FakeItemThrow[] = [];
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(runtimePage(), (_action: unknown, packet: FakeItemThrow) => {
    sent.push(packet);
    return true;
  }, { sendPacket() {} }, { value: 20211103 },
  { CZ: { ITEM_THROW2: FakeItemThrow, ITEM_THROW: FakeItemThrow } }, {}, null,
  () => false, () => false);

  expect(nativeAction({ type: 'DropItem', inventoryIndex: 5, amount: 2 })).toBe(true);
  expect(sent).toHaveLength(1);
  expect({ index: sent[0]!.Index, count: sent[0]!.count }).toEqual({ index: 5, count: 2 });
});

test('storage close actions send PACKET_CZ_CLOSE_STORE', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, {
    kind: 'assignment', name: 'globalThis.KoreEngineNativeAction',
  });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeCloseStore {
    build() { return new Uint8Array(2); }
  }
  const sent: FakeCloseStore[] = [];
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(runtimePage(), (_action: unknown, packet: FakeCloseStore) => {
    sent.push(packet);
    return true;
  }, { sendPacket() {} }, { value: 20211103 },
  { CZ: { CLOSE_STORE: FakeCloseStore } }, {}, null,
  () => false, () => false);

  expect(nativeAction({ type: 'StorageClose' })).toBe(true);
  expect(sent).toHaveLength(1);
  expect(sent[0]).toBeInstanceOf(FakeCloseStore);
});

test('ToggleServerAutoFight and ToggleServerFollow are encoded like the toolbox switches for each nid', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, { kind: 'assignment', name: 'globalThis.KoreEngineNativeAction' });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  // @ts-expect-error The vendored runtime module intentionally has no declaration file.
  const { buildAutoToggleRequest, mapScalarUpdate } = await import('../vendor/v2/lastro-v1-migration.mjs');
  class FakeWhisper { receiver = ''; msg = ''; build() { return new Uint8Array(2); } }
  class FakeUpdateInfo { id = 0; value = 0; build() { return new Uint8Array(7); } }
  const send = (nid: number, packets: Record<string, unknown> = { WHISPER: FakeWhisper, NOTIFY_UPDATEINFO: FakeUpdateInfo }, type = 'ToggleServerAutoFight') => {
    const sent: unknown[] = [];
    const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
      'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
      'lastroVendingShoppingActive', 'lastroMovementUnavailable', 'Configs', 'buildAutoToggleRequest', 'mapScalarUpdate',
      `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
    const nativeAction = createSender(runtimePage(), (_action: unknown, packet: unknown) => { sent.push(packet); return true; },
      { sendPacket() {} }, { value: 20211103 }, { CZ: packets }, {}, null, () => false, () => false,
      { get: () => nid }, buildAutoToggleRequest, mapScalarUpdate);
    return { result: nativeAction({ type }), sent };
  };

  const whisper = send(3);
  expect(whisper.result).toBe(true);
  expect(whisper.sent).toHaveLength(1);
  expect(whisper.sent[0]).toBeInstanceOf(FakeWhisper);
  expect(whisper.sent[0]).toMatchObject({ receiver: 'NPC:setautoattack', msg: '0' });

  for (const nid of [5, 6]) {
    const update = send(nid);
    expect(update.result).toBe(true);
    expect(update.sent).toHaveLength(1);
    expect(update.sent[0]).toBeInstanceOf(FakeUpdateInfo);
    expect(update.sent[0]).toMatchObject({ id: 34, value: 1 });
  }

  // 自动跟随是同一组切换开关：nid 3 私聊 NPC:setfollow，nid 5/6 发 id 37。
  const followWhisper = send(3, undefined, 'ToggleServerFollow');
  expect(followWhisper.result).toBe(true);
  expect(followWhisper.sent).toHaveLength(1);
  expect(followWhisper.sent[0]).toBeInstanceOf(FakeWhisper);
  expect(followWhisper.sent[0]).toMatchObject({ receiver: 'NPC:setfollow', msg: '0' });
  for (const nid of [5, 6]) {
    const update = send(nid, undefined, 'ToggleServerFollow');
    expect(update.result).toBe(true);
    expect(update.sent).toHaveLength(1);
    expect(update.sent[0]).toBeInstanceOf(FakeUpdateInfo);
    expect(update.sent[0]).toMatchObject({ id: 37, value: 1 });
  }

  // 封包类缺失时不发，Host 如实返回失败。
  expect(send(3, {}).result).toBe(false);
  expect(send(5, {}).result).toBe(false);
  expect(send(3, {}, 'ToggleServerFollow').result).toBe(false);
});

test('RequestServerSettings asks the server for the settings snapshot with the 2-byte LOADINFO packet', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, { kind: 'assignment', name: 'globalThis.KoreEngineNativeAction' });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeLoadInfo { build() { return new Uint8Array([0xff, 0x0a]); } }
  const send = (packets: Record<string, unknown>) => {
    const sent: unknown[] = [];
    const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
      'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
      'lastroVendingShoppingActive', 'lastroMovementUnavailable',
      `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
    const nativeAction = createSender(runtimePage(), (_action: unknown, packet: unknown) => { sent.push(packet); return true; },
      { sendPacket() {} }, { value: 20211103 }, { CZ: packets }, {}, null, () => false, () => false);
    return { result: nativeAction({ type: 'RequestServerSettings' }), sent };
  };

  const ok = send({ NOTIFY_LOADINFO: FakeLoadInfo });
  expect(ok.result).toBe(true);
  expect(ok.sent).toHaveLength(1);
  expect(ok.sent[0]).toBeInstanceOf(FakeLoadInfo);
  // 封包类缺失时不发，Host 如实返回失败。
  expect(send({}).result).toBe(false);
});

test('UseSkillAt is sent as the ground-skill packet for the packet version', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, { kind: 'assignment', name: 'globalThis.KoreEngineNativeAction' });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeGround { selectedLevel = 0; SKID = 0; xPos = 0; yPos = 0; build() { return new Uint8Array(10); } }
  const send = (version: number, packets: Record<string, unknown>) => {
    const sent: FakeGround[] = [];
    const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
      'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
      'lastroVendingShoppingActive', 'lastroMovementUnavailable',
      `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
    const nativeAction = createSender(runtimePage(), (_action: unknown, packet: FakeGround) => { sent.push(packet); return true; },
      { sendPacket() {} }, { value: version }, { CZ: packets }, {}, null, () => false, () => false);
    return { result: nativeAction({ type: 'UseSkillAt', skillId: 89, level: 10, x: 31, y: 42 }), sent };
  };

  // LastRO 20211103：USE_SKILL_TOGROUND3，光之障壁/暴风雪/怒雷强击这类地面技能都走它。
  const modern = send(20211103, { USE_SKILL_TOGROUND3: FakeGround, USE_SKILL_TOGROUND2: class extends FakeGround {} });
  expect(modern.result).toBe(true);
  expect(modern.sent).toHaveLength(1);
  expect(modern.sent[0]).toBeInstanceOf(FakeGround);
  expect(modern.sent[0]).toMatchObject({ selectedLevel: 10, SKID: 89, xPos: 31, yPos: 42 });

  // 封包类缺失时不发，Host 如实返回失败。
  expect(send(20211103, {}).result).toBe(false);
});

test('SelectWarpPoint is sent as the native 0x011B warp selection', async () => {
  const runtime = await readFile('generated/runtime/Online.js', 'utf8');
  const actionAssignment = extractRuntimeNode(runtime, { kind: 'assignment', name: 'globalThis.KoreEngineNativeAction' });
  const packetHelper = extractRuntimeNode(runtime, { kind: 'function', name: 'sendKoreEnginePacket' });
  class FakeWarpSelect { SKID = 0; mapName = ''; build() { return new Uint8Array(20); } }
  const sent: FakeWarpSelect[] = [];
  const createSender = new Function('globalThis', 'sendKoreNativePacket', 'Network',
    'PacketVerManager_default', 'PACKET', 'SessionStorage_default', '_socket',
    'lastroVendingShoppingActive', 'lastroMovementUnavailable',
    `${packetHelper}\n${actionAssignment}\nreturn globalThis.KoreEngineNativeAction;`);
  const nativeAction = createSender(runtimePage(), (_action: unknown, packet: FakeWarpSelect) => { sent.push(packet); return true; },
    { sendPacket() {} }, { value: 20211103 }, { CZ: { SELECT_WARPPOINT: FakeWarpSelect } },
    {}, null, () => false, () => false);

  expect(nativeAction({ type: 'SelectWarpPoint', skillId: 26, mapName: 'prontera.gat' })).toBe(true);
  expect(sent.map(packet => [packet.SKID, packet.mapName])).toEqual([[26, 'prontera.gat']]);

  const missingPacketClass = createSender(runtimePage(), () => true, { sendPacket() {} }, { value: 20211103 }, { CZ: {} },
    {}, null, () => false, () => false);
  expect(missingPacketClass({ type: 'SelectWarpPoint', skillId: 26, mapName: 'prontera.gat' })).toBe(false);
});
