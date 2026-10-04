// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import ts from 'typescript';
import { createLastroPartyState, patchRuntimePartyState } from '../scripts/lastro-party-state.mjs';

const paths = ['src/Engine/MapEngine/Group.js', 'src/UI/Components/MiniMap/MiniMapCommon.js'];
const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
function region(source: string, path: string) {
  const start = source.indexOf('//#region ' + path), end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing native region: ' + path);
  return source.slice(start, end + '//#endregion'.length);
}
// One transformation of the real bundle; repeated strict-anchor cases use the small fixture below.
const actualPatched = patchRuntimePartyState(vendor);
const group = region(actualPatched, paths[0]!), mini = region(actualPatched, paths[1]!);

function nativeDependencyPrefix(path: string, name: string, stopAfter: string) {
  const file = ts.createSourceFile(path, region(vendor, path), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let body: ts.Block | undefined;
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === name && node.initializer
      && ts.isCallExpression(node.initializer)) {
      const callback = node.initializer.arguments[0];
      if (callback && ts.isArrowFunction(callback) && ts.isBlock(callback.body)) body = callback.body;
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!body) throw new Error('Missing native initializer: ' + name);
  const statements: string[] = [];
  for (const statement of body.statements) {
    const value = statement.getText(file); statements.push(value);
    if (value === stopAfter) return statements.join('\n');
  }
  throw new Error('Missing native dependency: ' + name + ': ' + stopAfter);
}

it('survives the real EntityManager/Entity/EntityControl/Group initialization cycle before installing once at engine startup', () => {
  const esm = vendor.match(/var __esmMin = [\s\S]+?\n};/)?.[0];
  if (!esm) throw new Error('Missing native once-only module initializer');
  const managerPrefix = nativeDependencyPrefix('src/Renderer/EntityManager.js', 'init_EntityManager', 'init_Entity$1();');
  const entityPrefix = nativeDependencyPrefix('src/Renderer/Entity/Entity.js', 'init_Entity$1', 'init_EntityControl();');
  const controlPrefix = nativeDependencyPrefix('src/Controls/EntityControl.js', 'init_EntityControl', 'init_Group();');
  const upstream = region(vendor, paths[0]!);
  const previous = 'var _lastroPartyState;\n' + upstream.replace('_partyName = "";', `_partyName = "";
    _lastroPartyState = (${createLastroPartyState.toString()})({
      session: SessionStorage_default, entityManager: EntityManager,
      getMiniMaps: () => [MiniMap_default, MiniMapV2_default], worldMap: WorldMap_default
    });`);
  function boot(selectedGroup: string) {
    const trace: string[] = [], hooks: unknown[] = [];
    const packetTypes: Record<string, Record<string, unknown>> = { ZC: {}, CZ: {} };
    for (const match of selectedGroup.matchAll(/PACKET\.(ZC|CZ)\.([A-Z0-9_]+)/g)) packetTypes[match[1]!]![match[2]!] = class {};
    const maps = [0, 1].map(() => ({ clearPartyMemberMarks: vi.fn(), removePartyMemberMark: vi.fn() }));
    const context = vm.createContext({ trace,
      SessionStorage_default: { AID: 10, GID: 9000, Entity: null, hasParty: false, isPartyLeader: false },
      WorldMap_default: { updatePartyMembers: () => { trace.push('clear-worldmap'); } },
      MiniMap_default: maps[0], MiniMapV2_default: maps[1], Controller$5: { getUI: () => maps[1] },
      controller: { getUI: () => ({}) }, PACKET: packetTypes,
      Network: { hookPacket: (packet: unknown, handler: unknown) => { hooks.push({ packet, handler }); trace.push('register-handler'); } },
    });
    for (const match of (managerPrefix + entityPrefix + controlPrefix + selectedGroup).matchAll(/\b(init_[A-Za-z0-9_$]+)\(\)/g)) context[match[1]!] = () => {};
    vm.runInContext(`${esm}
      var EntityManager;
      var init_EntityManager = __esmMin(() => { ${managerPrefix}
        EntityManager = { get() {}, getLife() {}, storeLife() {}, removeLife() {} }; trace.push('manager-ready'); });
      var init_Entity$1 = __esmMin(() => { ${entityPrefix} });
      var init_EntityControl = __esmMin(() => { ${controlPrefix} });
      ${selectedGroup}
      init_EntityManager();`, context);
    return { context, trace, hooks, maps };
  }
  expect(() => boot(previous)).toThrow(/reading 'storeLife'/);
  for (const selected of [upstream, group]) {
    const f = boot(selected);
    expect(f.hooks).toHaveLength(0); expect(f.trace).toEqual(['manager-ready']);
    const nativeStoreLife = f.context.EntityManager.storeLife;
    f.context.GroupEngine.init(); expect(f.hooks).toHaveLength(20);
    if (selected === group) {
      const installed = f.context.EntityManager.storeLife;
      expect(installed).not.toBe(nativeStoreLife);
      expect(f.trace.indexOf('clear-worldmap')).toBeLessThan(f.trace.indexOf('register-handler'));
      f.context.GroupEngine.init(); expect(f.context.EntityManager.storeLife).toBe(installed);
      for (const map of f.maps) expect(map.clearPartyMemberMarks).toHaveBeenCalledTimes(2);
    }
  }
});

interface Packet { [key: string]: unknown; }
interface Member { AID: number; characterName: string; state: number; mapName: string; }
interface LifeData { hp?: number; hp_max?: number; sp?: number; sp_max?: number; }
interface Life extends LifeData { hp: number; hp_max: number; display: boolean; canvas: HTMLCanvasElement; remove: Mock<() => void>; update(): void; }
interface Actor { GID: number; AID: number; objecttype: number; constructor: { TYPE_PC: number; TYPE_DISGUISED: number }; display: { name: string; lvl: number }; life: Life; job: number; }
interface Mark { key: number; x: number; y: number; }
interface MiniMap {
  addPartyMemberMark(aid: number, x: number, y: number): void; removePartyMemberMark(aid: number): void; clearPartyMemberMarks(): void;
  addGuildMemberMark(aid: number, x: number, y: number): void; addNpcMark(id: number, x: number, y: number, color: number, time: number): void;
  _testSnapshot(): { party: Mark[]; guild: Mark[]; markers: Mark[] };
}
const member = (aid: number, map = 'prontera.gat'): Member => ({ AID: aid, characterName: '玩家' + aid, state: 0, mapName: map });

function fixture(patched = true) {
  const actors = new Map<number, Actor>(), cache = new Map<number, LifeData>(), hooked = new Map<unknown, (packet: Packet) => void>();
  const overlay = document.createElement('div'); document.body.appendChild(overlay);
  function spawn(aid: number) {
    const canvas = document.createElement('canvas');
    const life: Life = { hp: -1, hp_max: -1, display: false, canvas,
      remove: vi.fn(() => { life.display = false; canvas.remove(); }),
      update() { if (life.hp < 0 || life.hp_max < 0) life.remove(); else { life.display = true; overlay.appendChild(canvas); } },
    };
    const actor: Actor = { GID: aid, AID: 10000 + aid, objecttype: 0, constructor: { TYPE_PC: 0, TYPE_DISGUISED: 1 },
      display: { name: '玩家' + aid, lvl: 20 }, life, job: 1 };
    actors.set(aid, actor); return actor;
  }
  const self = spawn(10), teammate = spawn(20), other = spawn(30);
  self.life.hp = 90; self.life.hp_max = 100; self.life.update();
  const session = { AID: 10, GID: 9000, Entity: self, hasParty: false, isPartyLeader: false };
  const ui = { setParty: vi.fn(), addPartyMember: vi.fn(), removePartyMember: vi.fn(), updateMemberLife: vi.fn(), updateMemberDead: vi.fn(), setOptions: vi.fn() };
  const worldMap = { updatePartyMembers: vi.fn<(packet: { groupInfo: Member[] }) => void>() };
  const manager = { get: vi.fn((aid: number) => actors.get(aid)), getLife: vi.fn((aid: number) => cache.get(aid)),
    storeLife: vi.fn((aid: number, data: LifeData) => { cache.set(aid, Object.assign(cache.get(aid) ?? {}, data)); }),
    removeLife: vi.fn((aid: number) => { cache.delete(aid); }),
  };
  const selectedGroup = patched ? group : region(vendor, paths[0]!);
  const selectedMini = patched ? mini : region(vendor, paths[1]!);
  // Read-only snapshots of the real factory's private arrays, without changing its production methods.
  const inspectedMini = selectedMini.replace('return UIManager.addComponent(MiniMap);',
    'MiniMap._testSnapshot = () => ({ party: _party.map(value => ({ ...value })), guild: _guild.map(value => ({ ...value })), markers: _markers.map(value => ({ ...value })) });\n  return UIManager.addComponent(MiniMap);');
  const packetTypes: Record<string, Record<string, new () => Packet>> = { ZC: {}, CZ: {} };
  for (const match of selectedGroup.matchAll(/PACKET\.(ZC|CZ)\.([A-Z0-9_]+)/g)) packetTypes[match[1]!]![match[2]!] = class { [key: string]: unknown; };
  class GUIComponent { static MouseMode = { STOP: 1 }; constructor(public name: string, public css: string) {} }
  const send = vi.fn(), messages = vi.fn();
  const context = vm.createContext({ document, window, Image, console, GUIComponent,
    __esmMin: (callback: () => void) => callback,
    SessionStorage_default: session, EntityManager: manager, WorldMap_default: worldMap,
    controller: { getUI: () => ui },
    Network: { hookPacket: (type: unknown, handler: (packet: Packet) => void) => { hooked.set(type, handler); }, sendPacket: send },
    PACKET: packetTypes, PacketVerManager_default: { value: 20200101 }, MapRenderer: { currentMap: 'prontera.gat' },
    DB: { INTERFACE_PATH: '', getMessage: (id: number) => 'message:' + id },
    ChatBox_default: { addText: messages, TYPE: { BLUE: 'blue', ERROR: 'error', PARTY: 'party', PRIVATE: 'private', INFO: 'info' }, FILTER: { PARTY_SETUP: 1, PARTY: 2 } },
    Preferences: { get: (_name: string, defaults: object) => ({ ...defaults, save() {} }) },
    UIManager: { addComponent: (component: MiniMap) => component, showPromptBox: vi.fn() },
    Client: { loadFile: vi.fn() }, Renderer: { tick: 1000 },
  });
  for (const match of (selectedGroup + selectedMini).matchAll(/\b(init_[A-Za-z0-9_$]+)\(\)/g)) context[match[1]!] = () => {};
  vm.runInContext(inspectedMini, context);
  const create = context.createMiniMap as (options: { name: string; htmlText: string; cssText: string }) => MiniMap;
  const maps = [create({ name: 'MiniMap', htmlText: '', cssText: '' }), create({ name: 'MiniMapV2', htmlText: '', cssText: '' })];
  context.MiniMap_default = maps[0]; context.MiniMapV2_default = maps[1]; context.Controller$5 = { getUI: () => maps[1] };
  vm.runInContext(selectedGroup + '\ninit_Group(); GroupEngine.init();', context);
  const engine = context.GroupEngine as { init(): void; onRequestLeave(): void; onRequestCreationEasy(name: string): void };
  function fire(name: string, packet: Packet) {
    const handler = hooked.get(packetTypes.ZC![name]);
    if (!handler) throw new Error('Native party packet is not connected: ' + name);
    handler(packet);
  }
  function establish() {
    fire('GROUP_LIST', { groupName: '测试队伍', groupInfo: [member(10), member(20), member(30, 'izlude.gat')] });
    fire('NOTIFY_HP_TO_GROUPM', { AID: 20, hp: 50, maxhp: 100 });
    fire('NOTIFY_HP_TO_GROUPM_R2', { AID: 30, hp: 60, maxhp: 120 });
    fire('NOTIFY_POSITION_TO_GROUPM', { AID: 20, xPos: 20, yPos: 21 });
    fire('NOTIFY_POSITION_TO_GROUPM', { AID: 30, xPos: 30, yPos: 31 });
    maps[0]!.addPartyMemberMark(20, 20, 21); maps[0]!.addPartyMemberMark(30, 30, 31);
    for (const map of maps) { map.addGuildMemberMark(77, 7, 7); map.addNpcMark(88, 8, 8, 0xffffff, 5000); }
  }
  return { actors, cache, self, teammate, other, session, ui, manager, worldMap, maps, fire, establish, engine, send, messages };
}

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('native party packet wiring and real minimap cleanup', () => {
  it('reproduces upstream lingering marks and bars, then cleans them through the same successful native self-leave packet', () => {
    const original = fixture(false); original.establish(); original.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result: 0 });
    expect(original.teammate.life.canvas.isConnected).toBe(true); expect(original.cache.has(20)).toBe(true);
    expect(original.maps[1]!._testSnapshot().party.map(value => value.key)).toEqual([20, 30]);
    const f = fixture(); f.establish(); f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result: 0 });
    expect(f.teammate.life.canvas.isConnected).toBe(false); expect(f.other.life.canvas.isConnected).toBe(false); expect(f.cache.size).toBe(0);
    expect(f.self.life.canvas.isConnected).toBe(true); expect(f.session.hasParty).toBe(false);
    for (const map of f.maps) { const snapshot = map._testSnapshot(); expect(snapshot.party).toEqual([]); expect(snapshot.guild).toHaveLength(1); expect(snapshot.markers).toHaveLength(1); }
    expect(f.ui.removePartyMember).toHaveBeenLastCalledWith(10, '玩家10'); expect(f.worldMap.updatePartyMembers).toHaveBeenLastCalledWith({ groupInfo: [] });
  });

  it('clears a successful expulsion only for the named departing member', () => {
    const f = fixture(); f.establish(); f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 20, characterName: '玩家20', result: 1 });
    expect(f.teammate.life.canvas.isConnected).toBe(false); expect(f.other.life.canvas.isConnected).toBe(true);
    for (const map of f.maps) expect(map._testSnapshot().party.map(value => value.key)).toEqual([30]);
    expect(f.session.hasParty).toBe(true); expect(f.ui.removePartyMember).toHaveBeenLastCalledWith(20, '玩家20');
  });

  it.each([2, 3])('keeps markers, HP and roster after native leave rejection %s', result => {
    const f = fixture(); f.establish(); f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result });
    expect(f.session.hasParty).toBe(true); expect(f.teammate.life.canvas.isConnected).toBe(true); expect(f.cache.has(20)).toBe(true);
    expect(f.ui.removePartyMember).not.toHaveBeenCalled(); expect(f.messages).toHaveBeenCalled();
    for (const map of f.maps) expect(map._testSnapshot().party.map(value => value.key)).toEqual([20, 30]);
  });

  it('ignores unknown leave result values instead of treating them as success', () => {
    const f = fixture(); f.establish(); f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result: 255 });
    expect(f.session.hasParty).toBe(true); expect(f.ui.removePartyMember).not.toHaveBeenCalled(); expect(f.teammate.life.canvas.isConnected).toBe(true);
    for (const map of f.maps) expect(map._testSnapshot().party).toHaveLength(2);
  });

  it('waits for a successful server leave acknowledgement before removing party visuals', () => {
    const f = fixture(); f.establish(); f.engine.onRequestLeave();
    expect(f.send).toHaveBeenCalledTimes(1); expect(f.teammate.life.canvas.isConnected).toBe(true); expect(f.ui.removePartyMember).not.toHaveBeenCalled();
    f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result: 0 }); expect(f.teammate.life.canvas.isConnected).toBe(false);
  });

  it('clears an empty full roster and resets the native party window instead of retaining its old rows', () => {
    const f = fixture(); f.establish(); f.fire('GROUP_LIST3', { groupName: '', groupInfo: [] });
    expect(f.session.hasParty).toBe(false); expect(f.teammate.life.canvas.isConnected).toBe(false); expect(f.cache.size).toBe(0);
    expect(f.ui.removePartyMember).toHaveBeenLastCalledWith(10, '玩家10'); expect(f.ui.setParty).toHaveBeenCalledTimes(1);
    for (const map of f.maps) expect(map._testSnapshot().party).toEqual([]);
  });

  it('updates a replacement native roster without leaving the omitted member marker or life cache', () => {
    const f = fixture(); f.establish(); f.fire('GROUP_LIST2', { groupName: '测试队伍', groupInfo: [member(10), member(30, 'payon.gat')] });
    expect(f.teammate.life.canvas.isConnected).toBe(false); expect(f.cache.has(20)).toBe(false); expect(f.other.life.canvas.isConnected).toBe(true);
    expect(f.worldMap.updatePartyMembers.mock.lastCall?.[0].groupInfo.map(value => value.AID)).toEqual([10, 30]);
    for (const map of f.maps) expect(map._testSnapshot().party.map(value => value.key)).toEqual([30]);
  });

  it('rejects late native HP, movement and alive notifications after a self leave', () => {
    const f = fixture(); f.establish(); f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result: 0 });
    f.ui.updateMemberLife.mockClear(); f.ui.updateMemberDead.mockClear();
    f.fire('NOTIFY_HP_TO_GROUPM', { AID: 20, hp: 90, maxhp: 100 });
    f.fire('NOTIFY_HP_TO_GROUPM_R2', { AID: 30, hp: 80, maxhp: 120 });
    f.fire('NOTIFY_POSITION_TO_GROUPM', { AID: 20, xPos: 99, yPos: 100 }); f.fire('GROUP_ISALIVE', { AID: 20, isDead: 1 });
    expect(f.cache.size).toBe(0); expect(f.teammate.life.canvas.isConnected).toBe(false);
    expect(f.ui.updateMemberLife).not.toHaveBeenCalled(); expect(f.ui.updateMemberDead).not.toHaveBeenCalled();
    for (const map of f.maps) expect(map._testSnapshot().party).toEqual([]);
  });

  it('removes negative-position marks for an existing member and permits its later valid position update', () => {
    const f = fixture(); f.establish(); f.fire('NOTIFY_POSITION_TO_GROUPM', { AID: 20, xPos: -1, yPos: -1 });
    expect(f.maps[1]!._testSnapshot().party.map(value => value.key)).toEqual([30]);
    f.fire('NOTIFY_POSITION_TO_GROUPM', { AID: 20, xPos: 50, yPos: 51 });
    expect(f.maps[1]!._testSnapshot().party.find(value => value.key === 20)).toEqual(expect.objectContaining({ x: 50, y: 51 }));
  });

  it('connects successful native party creation to the guarded update roster', () => {
    const f = fixture(); f.engine.onRequestCreationEasy('新队伍'); f.fire('ACK_MAKE_GROUP', { result: 0 });
    expect(f.session.hasParty).toBe(true); expect(f.ui.setParty).toHaveBeenLastCalledWith('新队伍', [expect.objectContaining({ AID: 10, characterName: '玩家10' })]);
    f.fire('GROUP_ISALIVE', { AID: 10, isDead: 0 }); expect(f.ui.updateMemberDead).toHaveBeenLastCalledWith(10, 0);
    f.fire('GROUP_ISALIVE', { AID: 20, isDead: 0 }); expect(f.ui.updateMemberDead).toHaveBeenCalledTimes(1);
  });

  it('connects native self join, subsequent member join and late join rejection after leaving', () => {
    const f = fixture(); f.fire('ADD_MEMBER_TO_GROUP4', { ...member(10), expOption: 0, ItemPickupRule: 0, ItemDivisionRule: 0 });
    f.fire('ADD_MEMBER_TO_GROUP2', { ...member(20), expOption: 0, ItemPickupRule: 0, ItemDivisionRule: 0 });
    f.fire('NOTIFY_HP_TO_GROUPM', { AID: 20, hp: 70, maxhp: 140 }); expect(f.teammate.life.canvas.isConnected).toBe(true);
    expect(f.ui.addPartyMember).toHaveBeenCalledTimes(2);
    f.fire('DELETE_MEMBER_FROM_GROUP', { AID: 10, characterName: '玩家10', result: 0 });
    f.fire('ADD_MEMBER_TO_GROUP3', { ...member(30), expOption: 0 }); expect(f.ui.addPartyMember).toHaveBeenCalledTimes(2);
  });

  it('clears stale party visuals on native engine reinitialization while retaining unrelated minimap markers', () => {
    const f = fixture(); f.establish(); f.engine.init();
    expect(f.session.hasParty).toBe(false); expect(f.teammate.life.canvas.isConnected).toBe(false); expect(f.cache.size).toBe(0);
    for (const map of f.maps) { const snapshot = map._testSnapshot(); expect(snapshot.party).toEqual([]); expect(snapshot.guild).toHaveLength(1); expect(snapshot.markers).toHaveLength(1); }
  });

  it('real shared MiniMap factory clears only its own private party array for each independent version', () => {
    const f = fixture(); f.establish(); f.maps[0]!.clearPartyMemberMarks();
    expect(f.maps[0]!._testSnapshot().party).toEqual([]); expect(f.maps[1]!._testSnapshot().party).toHaveLength(2);
    expect(f.maps[0]!._testSnapshot().guild).toHaveLength(1); expect(f.maps[0]!._testSnapshot().markers).toHaveLength(1);
    f.maps[0]!.addPartyMemberMark(40, 4, 5); expect(f.maps[0]!._testSnapshot().party).toHaveLength(1);
  });
});

const small = `//#region src/Engine/MapEngine/Group.js
function onPartyCreate(pkt) { const memberData = {}; controller.getUI().setParty(_partyName, [memberData]); }
function onPartyList(pkt) { WorldMap_default.updatePartyMembers(pkt); }
function onPartyMemberJoin(pkt) { controller.getUI().addPartyMember(pkt); }
function onPartyMemberLeave(pkt) { controller.getUI().removePartyMember(pkt.AID, pkt.characterName); }
function onMemberLifeUpdate(pkt) { EntityManager.storeLife(pkt.AID, { hp: pkt.hp, hp_max: pkt.maxhp }); }
function onMemberMove$1(pkt) { Controller$5.getUI().addPartyMemberMark(pkt.AID, pkt.xPos, pkt.yPos); }
function onPartyIsAlive(pkt) { controller.getUI().updateMemberDead(pkt.AID, pkt.isDead); }
var _partyName, GroupEngine;
var init_Group = __esmMin(() => { _partyName = ""; GroupEngine = class GroupEngine { static init() {} }; });
//#endregion
//#region src/UI/Components/MiniMap/MiniMapCommon.js
function createMiniMap() { const MiniMap = {}, _party = []; MiniMap.removePartyMemberMark = function () {}; return MiniMap; }
//#endregion
`;

describe('party patch exact scope and strict native anchors', () => {
  it('changes only Group.js and MiniMapCommon.js in the real production source', () => {
    const strip = (source: string) => paths.reduce((value, path) => value.replace(region(value, path), '/* target:' + path + ' */'), source);
    expect(strip(actualPatched)).toBe(strip(vendor)); expect(group).toContain('/* lastro-party-state */'); expect(mini).toContain('MiniMap.clearPartyMemberMarks');
    expect(() => new Function(group + '\n' + mini)).not.toThrow();
  });

  it.each(['LF', 'CRLF'])('accepts clean %s anchors and preserves the region newline style', style => {
    const source = style === 'CRLF' ? small.replace(/\n/g, '\r\n') : small, output = patchRuntimePartyState(source);
    expect(output).toContain('/* lastro-party-state */'); expect(output).toContain('MiniMap.clearPartyMemberMarks');
    expect(() => new Function(output)).not.toThrow();
    if (style === 'CRLF') expect(/(?<!\r)\n/.test(output)).toBe(false); else expect(output).not.toContain('\r');
  });

  it('leaves unrelated bundles unchanged', () => { expect(patchRuntimePartyState('const unrelated = 1;')).toBe('const unrelated = 1;'); });
  it.each(paths)('rejects a missing required region %s', path => { expect(() => patchRuntimePartyState(small.replace(region(small, path), ''))).toThrow(/anchor:party-state/); });
  it.each(paths)('rejects a duplicated required region %s', path => { expect(() => patchRuntimePartyState(small + region(small, path))).toThrow(/anchor:party-state/); });
  it('rejects a partial matching region name', () => { expect(() => patchRuntimePartyState(small.replace(paths[0]!, paths[0]! + '.extra'))).toThrow(/anchor:party-state/); });
  it('rejects a region without its closing marker', () => { expect(() => patchRuntimePartyState(small.replace('//#endregion', ''))).toThrow(/anchor:party-state/); });
  it('rejects mixed newline styles within a target region', () => {
    const mixed = small.replace(/\n/g, '\r\n').replace('function onPartyCreate', '\nfunction onPartyCreate');
    expect(() => patchRuntimePartyState(mixed)).toThrow(/anchor:party-state:newlines/);
  });
  it('rejects a malformed target region', () => { expect(() => patchRuntimePartyState(small.replace('const memberData = {};', 'const memberData = ;'))).toThrow(/anchor:party-state:syntax/); });
  it('rejects a changed party handler parameter', () => { expect(() => patchRuntimePartyState(small.replace('onMemberMove$1(pkt)', 'onMemberMove$1(packet)'))).toThrow(/anchor:party-state/); });
  it('rejects an ambiguous duplicate native party-life store call', () => {
    const duplicate = small.replace('EntityManager.storeLife(pkt.AID, { hp: pkt.hp, hp_max: pkt.maxhp });', 'EntityManager.storeLife(pkt.AID, {}); EntityManager.storeLife(pkt.AID, {});');
    expect(() => patchRuntimePartyState(duplicate)).toThrow(/anchor:party-state:party-life/);
  });
  it('rejects a changed private minimap party array initializer', () => { expect(() => patchRuntimePartyState(small.replace('_party = []', '_party = new Array()'))).toThrow(/anchor:party-state:minimap-array/); });
  it('rejects an already defined minimap party-clear method rather than replacing a future native implementation', () => {
    expect(() => patchRuntimePartyState(small.replace('return MiniMap;', 'MiniMap.clearPartyMemberMarks = function () {}; return MiniMap;'))).toThrow(/anchor:party-state/);
  });
  it('rejects a second application to the same source', () => { expect(() => patchRuntimePartyState(patchRuntimePartyState(small))).toThrow(/anchor:party-state:already-patched/); });
});
