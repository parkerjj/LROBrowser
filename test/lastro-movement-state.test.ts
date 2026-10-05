import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeMovementState } from '../scripts/lastro-movement-state.mjs';

const nativeRequire = process.getBuiltinModule('module').createRequire(import.meta.url);
const { patchRuntimeEntitySync } = nativeRequire('../scripts/lastro-entity-sync.mjs') as { patchRuntimeEntitySync(source: string): string };
const { patchRuntimeMovementSync } = nativeRequire('../scripts/lastro-movement-sync.mjs') as { patchRuntimeMovementSync(source: string): string };
const { patchRuntimeMovementPrediction } = nativeRequire('../scripts/lastro-movement-prediction.mjs') as { patchRuntimeMovementPrediction(source: string): string };
const vendor = readFileSync(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
function region(name: string, source = vendor) {
  const start = source.indexOf(`//#region ${name}`), end = source.indexOf('//#endregion', start);
  if (start < 0 || end < 0) throw new Error(name);
  return source.slice(start, end + '//#endregion'.length);
}
function declaration(source: string, name: string) {
  const file = ts.createSourceFile('native.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const nodes = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (nodes.length !== 1) throw new Error(name);
  return nodes[0]!.getText(file);
}
function entitySet() {
  const file = ts.createSourceFile('Entity.js', region('src/Renderer/Entity/Entity.js'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const methods: ts.MethodDeclaration[] = [];
  function inspect(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'set'
      && node.parameters.map(parameter => parameter.name.getText(file)).join(',') === 'unit') methods.push(node);
    ts.forEachChild(node, inspect);
  }
  inspect(file);
  if (methods.length !== 1) throw new Error('native Entity.set');
  return methods[0]!.getText(file);
}
const nativeEntitySet = entitySet();
const base = ['src/Renderer/Entity/EntityWalk.js', 'src/Engine/MapEngine/Entity.js',
  'src/Renderer/Entity/EntityState.js', 'src/Network/NetworkManager.js'].map(name => region(name)).join('\n');
const predicted = patchRuntimeMovementPrediction(patchRuntimeMovementSync(patchRuntimeEntitySync(base)));
const patched = patchRuntimeMovementState(predicted);
interface Entity {
  GID: number; objecttype: number; position: Float32Array; direction: number;
  ACTION: Record<string, number>; action: number; _lastroMovementEpoch?: number;
  walk: { speed: number; total: number; index: number; tick: number; prevTick: number; path: Int16Array; onEnd: (() => void) | null };
  _lastroMotion?: { view: { holdingStop: boolean }; skillStopIntent?: { epoch: number; skill: number; until: number } };
  set(packet: object): void; walkTo(x0: number, y0: number, x1: number, y1: number, range?: number, tick?: number): void;
}
interface StatePacket { GID: number; PosDir?: number[]; MoveData?: number[]; moveStartTime?: number; state?: number; bodyState?: number; constructor: unknown }
function fixture(source = patched, lastro = true) {
  let now = 10000;
  const SessionStorage_default = { Entity: null as Entity | null, serverTick: now, AdminList: [] };
  const cells = new Uint8Array(24 * 24).fill(10);
  const Altitude = { width: 24, height: 24, cells, types: { NONE: 1, WALKABLE: 2, SNIPABLE: 8 }, TYPE: { WALKABLE: 2 },
    getCellType: (x: number, y: number) => cells[x + y * 24], getCellHeight: () => 0 };
  const MapRenderer = { currentMap: 'prontera', loading: false };
  const entries = new Map<number, Entity>();
  const constants = { TYPE_PC: 0, TYPE_MOB: 5, TYPE_NPC: 6, TYPE_NPC_ABR: 13, TYPE_NPC_BIONIC: 14,
    TYPE_HOM: 8, TYPE_MERC: 9, TYPE_FALCON: 15, TYPE_WARP: -1, TYPE_DISGUISED: 1, TYPE_NPC2: 12 };
  const MockEntity = Object.assign(function MockEntity() {}, constants);
  Object.assign(MockEntity.prototype, { GID: 0, bodyState: 0, healthState: 0, effectState: 0, GUID: 0 });
  const PACKET = { ZC: {} as Record<string, unknown> };
  for (const suffix of ['', '2', '3', '4', '5', '6', '7', '10', '11']) PACKET.ZC[`NOTIFY_NEWENTRY${suffix}`] = function NativeNewEntry() {};
  const context = vm.createContext({
    Date: { now: () => now }, Float32Array, Int16Array, Uint32Array, Uint16Array, Uint8Array,
    __esmMin: (callback: () => void) => callback,
    init_PathFinding: () => {}, init_Altitude: () => {}, init_SessionStorage: () => {}, init_DBManager: () => {},
    SessionStorage_default, Altitude, MapRenderer, PACKET, Entity: MockEntity,
    Configs: { get: (key: string, fallback: unknown) => key === 'lastroProtocol' ? lastro : fallback },
    EntityManager: { get: (gid: number) => entries.get(gid), pendingTransformations: {}, add: vi.fn() },
    DB: { getWeaponAction: () => 0, getWeaponType: () => 0, getWeaponViewID: () => 0,
      isAssassin: () => false, isKatar: () => false, isShield: () => false },
    Client: { loadFile: vi.fn() }, PacketVerManager_default: { value: 20230125 },
    StatusState_default: { EffectState: { INVISIBLE: 1 }, BodyState: { STUN: 2, FREEZE: 3 }, OPT3: {} },
    StatusConst_default: {}, GuildEngine: { requestGuildEmblem: vi.fn() }, clanEmblems: {},
    EffectManager: { spam: vi.fn() }, EffectConst_default: { EF_ENTRY2: 1 },
    Renderer: { tick: now }, console,
    offsetToFloatDir: (x: number, y: number) => Math.atan2(y, x), quantizeDir: () => 4,
  });
  vm.runInContext(region('src/Utils/PathFinding.js'), context);
  vm.runInContext('init_PathFinding(); PathFinding_default.setGat(Altitude);', context);
  const action = region('src/Renderer/Entity/EntityAction.js');
  vm.runInContext(['Action', 'Animation', 'setAction', 'Init$10'].map(name => declaration(action, name)).join('\n'), context);
  vm.runInContext(region('src/Renderer/Entity/EntityWalk.js', source) + '\ninit_EntityWalk();', context);
  vm.runInContext(declaration(region('src/Engine/MapEngine/Entity.js', source), 'onEntitySpam'), context);
  if (source.includes('function lastroBeginMovementState(')) vm.runInContext([
    declaration(source, 'lastroBeginMovementState'), declaration(source, 'lastroFinishMovementState')].join('\n'), context);
  const functions = vm.runInContext(`({ action: Init$10, walk: Init$4, set: ({${nativeEntitySet}}).set,
    spam: onEntitySpam, visual: lastroMovementVisual })`, context) as {
      action(this: Entity): void; walk(this: Entity): void; set(this: Entity, packet: object): void;
      spam(packet: object): void; visual(entity: Entity, tick?: number): Float32Array;
    };
  const entity = { constructor: MockEntity, GID: 123, objecttype: 0, position: new Float32Array([1, 1, 0]),
    files: { shadow: { spr: 'shadow.spr', act: 'shadow.act' } }, _job: 4010, _sex: 1, weapon: 0,
    sound: { free: vi.fn() }, life: { hp: -1, hp_max: -1 }, aura: { load: vi.fn() },
    display: { name: '', TYPE: { NONE: 0 }, STYLE: { DEFAULT: 0 }, update: vi.fn() },
    _effectState: 0, set: functions.set } as unknown as Entity;
  functions.action.call(entity); functions.walk.call(entity);
  // Loading graphics for the native objecttype setter is unrelated to movement.
  context.Init$10 = () => {};
  entries.set(entity.GID, entity); SessionStorage_default.Entity = entity;
  context.lastroCheckMovementConnection = () => true;
  context.lastroMovementUnavailable = () => false;
  return { context, functions, entity, entries, PACKET, Altitude, MapRenderer,
    setNow(value: number) { now = value; context.Renderer.tick = value; },
    nativePacket(name: string, position = [2, 1, 0], gid = 123) {
      const start = vendor.indexOf(`PACKET.ZC.${name} =`), end = vendor.indexOf(`PACKET.ZC.${name}.size`, start);
      if (start < 0 || end < 0) throw new Error(name);
      vm.runInContext(vendor.slice(start, end), context);
      if (name === 'LASTRO_NOTIFY_STANDENTRY9') {
        const prefix = vendor.slice(vendor.indexOf('function readLastROEntity9Prefix('), vendor.indexOf('function readLastROEntity9Common('));
        vm.runInContext(declaration(prefix, 'readLastROEntity9Prefix'), context);
      }
      let longs = 0, shorts = 0;
      const fp = { readUChar: () => 0, readChar: () => 0, readULong: () => longs++ ? 0 : gid,
        readShort: () => shorts++ ? 0 : 150, readUShort: () => 0, readLong: () => 0,
        readPos: () => [...position], readPos2: () => [2, 1, 12, 1], readMoveData: () => [2, 1, 12, 1],
        readBinaryString: () => '', readString: () => '', tell: () => 0, seek: () => {} };
      const Constructor = PACKET.ZC[name] as new (fp: object, end: number) => StatePacket;
      const packet = new Constructor(fp, 100); if (packet.MoveData) packet.moveStartTime = now;
      return packet;
    },
  };
}
function moving(f: ReturnType<typeof fixture>, shown = 7) {
  f.functions.visual(f.entity);
  f.entity.walkTo(1, 1, 12, 1, undefined, 10000);
  f.setNow(10000 + (shown - 1) * 150);
  expect(f.functions.visual(f.entity)[0]).toBeCloseTo(shown);
}

describe('native existing self state entries', () => {
  it('reproduces the unsmoothed native PosDir overwrite before the wrapper', () => {
    const f = fixture(predicted); moving(f);
    const shown = f.functions.visual(f.entity)[0]!;
    f.entity.walk.total = 0;
    f.functions.spam(f.nativePacket('LASTRO_NOTIFY_STANDENTRY'));
    expect(f.entity.position[0]).toBe(2);
    expect(f.functions.visual(f.entity)[0]).toBe(2);
    expect(shown - f.functions.visual(f.entity)[0]!).toBe(5);
  });
  it.each(['NOTIFY_STANDENTRY', 'NOTIFY_STANDENTRY2', 'LASTRO_NOTIFY_STANDENTRY',
    'LASTRO_NOTIFY_STANDENTRY7', 'LASTRO_NOTIFY_STANDENTRY8', 'LASTRO_NOTIFY_STANDENTRY9'])(
    'captures and smoothly confirms actual %s PosDir through native Entity.set', name => {
      const f = fixture(); moving(f); const packet = f.nativePacket(name);
      f.functions.spam(packet);
      expect(Array.from(f.entity.position)).toEqual([2, 1, 0]);
      expect(f.entity.walk.total).toBe(0);
      expect(f.functions.visual(f.entity)[0]).toBeCloseTo(7);
      f.setNow(10916);
      const next = f.functions.visual(f.entity)[0]!;
      expect(next).toBeLessThan(7); expect(next).toBeGreaterThanOrEqual(7 - 32 / 150 - 0.00001);

    });
  it('holds only the existing small skill STOP residual and does not accumulate repeated snapshots', () => {
    const f = fixture(); moving(f, 3.4);
    f.entity._lastroMotion!.skillStopIntent = { epoch: f.entity._lastroMovementEpoch!, skill: 28, until: 11360 };
    const packet = f.nativePacket('NOTIFY_STANDENTRY', [3, 1, 0]);
    f.functions.spam(packet); expect(f.entity._lastroMotion!.view.holdingStop).toBe(true);
    f.setNow(10600); f.functions.spam(packet);
    expect(f.functions.visual(f.entity)[0]).toBeCloseTo(3.4);
    expect(Array.from(f.entity.position)).toEqual([3, 1, 0]);
  });
  it('leaves native MOVEENTRY MoveData on its existing single confirmation path', () => {
    const f = fixture(); moving(f); const packet = f.nativePacket('NOTIFY_MOVEENTRY');
    const epoch = f.entity._lastroMovementEpoch!;
    f.functions.spam(packet);
    expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.entity._lastroMovementEpoch).toBe(epoch + 1);

  });
  it.each(['NOTIFY_NEWENTRY', 'NOTIFY_ACTENTRY'])('preserves %s positional spawn reset semantics', name => {
    const f = fixture(); moving(f); f.functions.spam(f.nativePacket(name, [20, 20, 0]));
    expect(Array.from(f.entity.position)).toEqual([20, 20, 0]);
    // A genuine entry reset clears the previous smoothing corridor immediately.
    const view = vm.runInContext('SessionStorage_default.Entity._lastroMotion.view.position', f.context) as Float32Array;
    expect(Array.from(view)).toEqual([20, 20, 0]);
  });
  it.each(['other', 'non-lastro', 'loading'] as const)('keeps %s updates on the original native path', reason => {
    const f = fixture(patched, reason !== 'non-lastro');
    if (reason === 'other') f.context.SessionStorage_default.Entity = { GID: 456 };
    if (reason === 'loading') f.MapRenderer.loading = true;
    f.entity.walk.total = 8;
    f.functions.spam(f.nativePacket('NOTIFY_STANDENTRY'));
    expect(f.entity.position[0]).toBe(2); expect(f.entity.walk.total).toBe(8);

  });
  it('does not accept a forged constructor name as a registered standing packet', () => {
    const f = fixture(); moving(f);
    const packet = { GID: 123, PosDir: [2, 1, 0], constructor: { name: 'PACKET_ZC_NOTIFY_STANDENTRY' } };
    f.functions.spam(packet);
    expect(f.entity.walk.total).toBeGreaterThan(0);


  });
  it('completes native standing confirmation with the movement helpers', () => {
    const entity = { set: vi.fn() }, token = {}, begin = vi.fn(() => token), finish = vi.fn(), cancel = vi.fn();
    class NativeStand {}
    const Constructor = NativeStand, packet = Object.assign(new Constructor(), { PosDir: [2, 1, 0] });
    const context = vm.createContext({ SessionStorage_default: { Entity: entity },
      EntityManager: { get: () => entity }, Entity: function NativeEntity() {}, PACKET: { ZC: { NOTIFY_STANDENTRY: Constructor } },
      Configs: { get: () => true }, MapRenderer: { loading: false },
      Altitude: { width: 24, height: 24, getCellType: () => 10, getCellHeight: () => 0 },
      lastroBeginMovementConfirmation: begin, lastroFinishMovementConfirmation: finish,
      lastroCancelMovement: cancel, lastroResetMovementVisual: vi.fn(), packet });
    vm.runInContext(patchRuntimeMovementState(small), context);
    expect(() => vm.runInContext('onEntitySpam(packet)', context)).not.toThrow();
    expect(begin).toHaveBeenCalledWith(entity, 0, true);
    expect(finish).toHaveBeenCalledWith(entity, token); expect(cancel).toHaveBeenCalledWith(entity);
  });
  it.each(['missing-cell', 'invalid-height', 'throwing-cell'] as const)('does not smooth a %s GAT snapshot', reason => {
    const f = fixture(); f.entity.walk.total = 8;
    if (reason === 'missing-cell') f.Altitude.cells[2 + 24] = 0;
    const original = f.Altitude.getCellType;
    if (reason === 'missing-cell') f.context.Altitude.getCellType = () => undefined;
    if (reason === 'invalid-height') f.context.Altitude.getCellHeight = () => NaN;
    if (reason === 'throwing-cell') f.context.Altitude.getCellType = () => { throw new Error('GAT unavailable'); };
    expect(() => f.functions.spam(f.nativePacket('NOTIFY_STANDENTRY'))).not.toThrow();
    expect(f.entity.walk.total).toBe(8);
    f.context.Altitude.getCellType = original;
  });

  it.each([[-1, 1, 0], [24, 1, 0], [2.2, 1, 0], [2, 1, 9]].map(position => [position]))('leaves invalid PosDir %j to the native handler', position => {
    const f = fixture(); f.entity.walk.total = 8;
    f.functions.spam(f.nativePacket('NOTIFY_STANDENTRY', position));
    expect(f.entity.walk.total).toBe(8);

  });
});

const small = `//#region src/Engine/MapEngine/Entity.js\nfunction onEntitySpam(pkt) {\n  let entity = EntityManager.get(pkt.GID);\n  if (entity) entity.set(pkt);\n  else entity = new Entity();\n}\n//#endregion`;
describe('state-entry patch anchors', () => {
  it('leaves unrelated source unchanged', () => expect(patchRuntimeMovementState('const unrelated = 1;')).toBe('const unrelated = 1;'));
  it.each(['LF', 'CRLF', 'mixed'] as const)('patches %s without changing the native else branch', ending => {
    const source = ending === 'CRLF' ? small.replace(/\n/g, '\r\n') : ending === 'mixed'
      ? small.split('\n').map((line, index) => line + (index % 2 ? '\r' : '')).join('\n') : small;
    const output = patchRuntimeMovementState(source);
    expect(output).toContain('entity.set(pkt);'); expect(output).toContain('else entity = new Entity();');
    expect(ts.createSourceFile('patched.js', output, ts.ScriptTarget.Latest, true).statements.length).toBe(3);
    expect(output).not.toContain('\r');
  });
  it.each(['region', 'function', 'params', 'set', 'duplicate-set', 'duplicate-function', 'end', 'nested-region', 'installed'] as const)(
    'rejects a broken %s anchor', reason => {
      const source = reason === 'region' ? small + '\n' + small : reason === 'function' ? small.replace('onEntitySpam', 'differentSpam')
        : reason === 'params' ? small.replace('(pkt)', '(pkt,extra)') : reason === 'set' ? small.replace('entity.set(pkt);', 'entity.set(other);')
          : reason === 'duplicate-set' ? small.replace('else entity = new Entity();', 'if (entity) entity.set(pkt);')
            : reason === 'duplicate-function' ? small.replace('//#endregion', declaration(small, 'onEntitySpam') + '\n//#endregion')
              : reason === 'end' ? small.replace('//#endregion', '') : reason === 'nested-region' ? small.replace('//#endregion', '//#region nested\n//#endregion')
                : patchRuntimeMovementState(small);
      expect(() => patchRuntimeMovementState(source)).toThrow('anchor:movement-state');
    });
});
