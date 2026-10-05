import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const vendor = readVendorSource();
function region(name: string, source = vendor) {
  return extractVendorRegion(name, source);
}
const runtime = [
  'src/Renderer/Entity/EntityWalk.js', 'src/Engine/MapEngine/Entity.js',
  'src/Engine/MapEngine/Main.js', 'src/Engine/MapEngine.js', 'src/Network/NetworkManager.js',
  'src/Renderer/Entity/EntityState.js',
].map(name => region(name)).join('\n');
function declaration(source: string, name: string) {
  const file = ts.createSourceFile('native.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const nodes = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (nodes.length !== 1) throw new Error(name);
  return nodes[0]!.getText(file);
}

const statusConstants = vm.runInNewContext([
  region('src/DB/Status/StatusConst.js'), region('src/DB/Status/StatusState.js'),
  'init_StatusState(); ({ statuses: StatusConst_default, states: StatusState_default });',
].join('\n'), { __esmMin: (callback: () => void) => callback }) as {
  statuses: Record<string, number>;
  states: { BodyState: Record<string, number>; HealthState: Record<string, number>;
    EffectState: Record<string, number>; OPT3: Record<string, number>; Status: Record<string, number> };
};

interface Walk {
  speed: number; tick: number; prevTick: number; dist: number; index: number; total: number;
  pos: Float32Array; lastPos: Float32Array; path: Int16Array; onEnd: (() => void) | null;
}
interface ActionOptions {
  action: number; frame?: number; repeat?: boolean; play?: boolean; next?: ActionOptions | false; delay?: number;
}
interface Entity {
  GID: number; objecttype: number; ACTION: Record<string, number>; action: number; display?: { name: string };
  position: Float32Array; walk: Walk; _lastroMovementEpoch?: number; _lastroApprovedRoute?: unknown;
  animation: { next: ActionOptions | false; save: ActionOptions | false; repeat: boolean; delay: number };
  _deathSyncTick: number;
  onWalkEnd: () => void;
  walkTo(x0: number, y0: number, x1: number, y1: number, range?: number, start?: number): void;
  walkProcess(): void; resetRoute(keepDistance?: boolean): void;
  setAction(options: ActionOptions): void;
  set(options: { PosDir: number[]; GID: number }): void;
}
interface HitPacket {
  damage: number; leftDamage?: number; count?: number; action: number; attackMT: number; attackedMT: number;
  startTime?: unknown;
}
interface MovePacket { MoveData: number[]; moveStartTime: number; }

function fixture(source = runtime) {
  let now = 10000, dueTick: number | undefined;
  const SessionStorage_default = {
    serverTick: 10000, Entity: null as Entity | null, AID: 123, Playing: true,
    FreezeUI: false, ping: {
      returned: true, pingTime: 0, pongTime: 10000, lastroSentAt: 10000,
      _lastroUnansweredSince: undefined as number | undefined,
    },
  };
  const Renderer = { tick: now };
  const cells = new Uint8Array(24 * 24).fill(10);
  const Altitude = {
    width: 24, height: 24, cells, types: { NONE: 1, WALKABLE: 2, WATER: 4, SNIPABLE: 8 },
    TYPE: { NONE: 1, WALKABLE: 2, WATER: 4, SNIPABLE: 8 },
    getCellHeight: vi.fn((x: number, y: number) => x + y),
    getCellType: vi.fn((x: number, y: number): number | undefined => Altitude.cells[x + y * Altitude.width]),
  };
  const timers: { id: number; callback: () => void; due: number }[] = [];
  let timerId = 0;
  const Events = {
    setTimeout: vi.fn((callback: () => void, delay: number) => {
      const id = timerId++;
      timers.push({ id, callback, due: now + delay });
      return id;
    }),
    clearTimeout: vi.fn((id: number) => {
      const index = timers.findIndex(timer => timer.id === id);
      if (index >= 0) timers.splice(index, 1);
    }),
  };
  const entries = new Map<number, Entity>();
  const EntityManager = {
    get: (id: number) => entries.get(id), getFocusEntity: () => SessionStorage_default.Entity,
    removeGID: vi.fn((id: number) => entries.delete(id)), removeLife: vi.fn(), add: vi.fn(),
  };
  const constants = {
    TYPE_PC: 0, TYPE_DISGUISED: 1, TYPE_MOB: 5, TYPE_NPC: 6, TYPE_PET: 7, TYPE_HOM: 8,
    TYPE_MERC: 9, TYPE_ELEM: 10, TYPE_NPC2: 12, TYPE_NPC_ABR: 13, TYPE_NPC_BIONIC: 14,
    TYPE_FALCON: 15, TYPE_WUG: 16, TYPE_WARP: -1,
    VT: { OUTOFSIGHT: 0, DEAD: 1, EXIT: 2, TELEPORT: 3 },
  };
  const MapRenderer = { loading: false, currentMap: 'prontera', onLoad: () => {}, setMap: vi.fn() };
  const MapControl = { _lastroMovementInput: { cancel: vi.fn() } };
  const Network = { sendPacket: vi.fn() };
  const context = vm.createContext({
    Date: { now: () => now }, performance: { now: () => now },
    console: { warn: vi.fn(), trace: vi.fn(), error: vi.fn(), log: vi.fn() },
    Float32Array, Int16Array, Uint32Array, Uint16Array, Uint8Array, ArrayBuffer, DataView,
    __esmMin: (init: () => void) => { let loaded = false; return () => { if (!loaded) { loaded = true; init(); } }; },
    init_PathFinding: () => {}, init_Altitude: () => {}, init_SessionStorage: () => {}, init_DBManager: () => {},
    SessionStorage_default, Renderer, Events, EntityManager, Altitude, Entity: constants, MapRenderer, MapControl, Network,
    LastROEventDueTick: () => dueTick,
    Configs: { get: (name: string, fallback: unknown) => name === 'lastroProtocol' ? true : fallback },
    DB: { getWeaponAction: () => 0 },
    EffectManager: { remove: vi.fn(), spam: vi.fn() },
    StatusState_default: statusConstants.states, StatusConst_default: statusConstants.statuses,
    EffectConst_default: { EF_DEVIL: 1 },
    StatusProperty_default: { SPEED: 0 },
    HomunInformations_default: { stopAI: vi.fn() }, MercenaryInformations_default: { stopAI: vi.fn() },
    Escape_default: { showDeathMenu: vi.fn() }, haveSiegfriedItem: () => false,
    WhisperBox: { clearAll: vi.fn() },
    BasicInfoController: {}, PlayerViewEquipController: {}, StatusIcons_default: {}, ChatBox_default: {},
    ShortCut_default: {}, Controller$3: {}, controller: {}, CashShop_default: {},
    PacketCrypt_default: { process: vi.fn() }, isObserverMode: () => false,
    C_DEATH_SYNC_OFFSET: 200, C_MULTIHIT_DELAY: 200,
  });
  const rendererRegion = region('src/Renderer/Renderer.js');
  const clockSource = rendererRegion.slice(rendererRegion.indexOf('let lastroServerClockMark'), rendererRegion.indexOf('var mat4$9'));
  vm.runInContext(clockSource, context);
  vm.runInContext(region('src/Utils/PathFinding.js'), context);
  vm.runInContext('init_PathFinding(); PathFinding_default.setGat(Altitude);', context);
  const action = region('src/Renderer/Entity/EntityAction.js');
  vm.runInContext([
    declaration(action, 'Action'), declaration(action, 'Animation'), declaration(action, 'setAction'), declaration(action, 'Init$10'),
    source.replaceAll('import.meta.url', '"file:///native.js"'), 'init_EntityWalk();',
  ].join('\n'), context);
  const socket = {
    connected: true, isZone: true, handoffPending: false, _lastroMovementPacketAt: 10000, send: vi.fn(),
  };
  context._socket = socket;
  context._sockets = [socket];
  context._onDisconnect = vi.fn();
  const functions = vm.runInContext(`({
    action: Init$10, walk: Init$4, hit: onEntityWillBeHitSub,
    playerMove: onPlayerMove, move: onEntityMove, stop: onEntityStopMove,
    jump: onEntityJump, fastMove: onEntityFastMove,
    mapChange: onMapChange, mapEntry: resetEntityForMapEntry, cleanup: cleanGameUI,
    pong: onPong, sendPacket, closeEvent: onClose$9, parameter: onParameterChange$1,
  })`, context) as {
    action(this: Entity): void; walk(this: Entity): void; hit(pkt: HitPacket, entity: Entity): void;
    playerMove(pkt: MovePacket): void; move(pkt: MovePacket & { GID: number }): void;
    stop(pkt: { AID: number; xPos: number; yPos: number }): void;
    jump(pkt: { AID: number; xPos: number; yPos: number }): void;
    fastMove(pkt: { AID: number; targetXpos: number; targetYpos: number }): void;
    mapChange(pkt: { mapName: string; xPos: number; yPos: number }): void;
    mapEntry(entity: Entity, pkt: { xPos: number; yPos: number }, gid: number): void;
    cleanup(): void;
    pong(pkt: { time: number }): void;
    sendPacket(pkt: { constructor: { name: string }; build(): { buffer: ArrayBuffer; view: DataView } }): void;
    closeEvent(this: typeof socket, event: { code: number; wasClean: boolean }): void;
    parameter(pkt: { varID: number; amount: number }): void;
  };
  const entity = {
    constructor: constants, GID: 123, objecttype: constants.TYPE_PC, position: new Float32Array([1, 1, 2]),
    sound: { free: () => {} }, _job: 4010, _sex: 1, weapon: 0, _deathSyncTick: 0,
    set(this: Entity, options: { PosDir: number[]; GID: number }) {
      this.GID = options.GID;
      this.position.set([options.PosDir[0]!, options.PosDir[1]!, Altitude.getCellHeight(options.PosDir[0]!, options.PosDir[1]!)]);
    },
  } as unknown as Entity;
  functions.action.call(entity);
  functions.walk.call(entity);
  entity.setAction({ action: entity.ACTION.IDLE!, repeat: true, play: true });
  entries.set(entity.GID, entity);
  SessionStorage_default.Entity = entity;
  return {
    context, entity, functions, SessionStorage_default, Renderer, Events, timers, entries, cells,
    EntityManager, Altitude, MapRenderer, MapControl, Network, socket,
    setNow(value: number) { now = value; Renderer.tick = value; },
    flush(value: number) {
      now = value; Renderer.tick = value;
      const due = timers.filter(timer => timer.due <= now).sort((a, b) => a.due - b.due);
      for (const timer of due) {
        const index = timers.indexOf(timer);
        if (index < 0) continue;
        timers.splice(index, 1);
        dueTick = timer.due;
        try { timer.callback(); } finally { dueTick = undefined; }
      }
    },
  };
}

const normalHit: HitPacket = { damage: 10, count: 1, action: 0, attackMT: 150, attackedMT: 300 };
function beginWalk(f: ReturnType<typeof fixture>, speed = 150) {
  f.entity.walk.speed = speed;
  f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10000 });
}

function largerGat(f: ReturnType<typeof fixture>, size = 64) {
  f.Altitude.width = f.Altitude.height = size;
  f.Altitude.cells = new Uint8Array(size * size).fill(10);
  vm.runInContext('PathFinding_default.setGat(Altitude);', f.context);
}

function fastMovePacket(f: ReturnType<typeof fixture>, x: number, y: number, aid = 123) {
  const start = vendor.indexOf('  PACKET.ZC.FASTMOVE = function');
  const end = vendor.indexOf('  PACKET.ZC.FASTMOVE.size = 10;', start) + '  PACKET.ZC.FASTMOVE.size = 10;'.length;
  if (start < 0 || end < start) throw new Error('Missing FASTMOVE packet declaration');
  f.context.window = {};
  f.context.init_Struct = () => {};
  f.context.init_CodepageManager = () => {};
  vm.runInContext(region('src/Utils/BinaryReader.js') + '\ninit_BinaryReader(); var FAST_PACKET={ZC:{}};'
    + vendor.slice(start, end).replaceAll('PACKET.ZC', 'FAST_PACKET.ZC'), f.context);
  const bytes = new Uint8Array(10), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x08d2, true); view.setUint32(2, aid, true);
  view.setInt16(6, x, true); view.setInt16(8, y, true);
  f.context.fastPacketBytes = bytes;
  return vm.runInContext(`(() => {
    const fp = new BinaryReader(fastPacketBytes);
    if (fp.readUShort() !== 0x08d2) throw new Error('Wrong packet id');
    return new FAST_PACKET.ZC.FASTMOVE(fp, fastPacketBytes.length);
  })()`, f.context) as { AID: number; targetXpos: number; targetYpos: number };
}


function nativeMovementPacket(f: ReturnType<typeof fixture>, name: 'NOTIFY_PLAYERMOVE' | 'NOTIFY_ACT' | 'STATE_CHANGE' | 'MSG_STATE_CHANGE' | 'MSG_STATE_CHANGE3' | 'MSG_STATE_CHANGE5' | 'BLADESTOP', bytes: Uint8Array) {
  const start = vendor.indexOf('  PACKET.ZC.' + name + ' = function');
  const sizeStart = vendor.indexOf('  PACKET.ZC.' + name + '.size = ', start);
  const end = vendor.indexOf(';', sizeStart) + 1;
  if (start < 0 || sizeStart < start) throw new Error('Missing native packet ' + name);
  f.context.window = {};
  f.context.init_Struct = () => {}; f.context.init_CodepageManager = () => {};
  vm.runInContext(region('src/Utils/BinaryReader.js')
    + '\ninit_BinaryReader(); var MOVEMENT_PACKETS = globalThis.PACKET || {ZC:{}}; globalThis.PACKET = MOVEMENT_PACKETS;'
    + '\nif (!MOVEMENT_PACKETS.ZC.' + name + ') { '
    + vendor.slice(start, end).replaceAll('PACKET.ZC', 'MOVEMENT_PACKETS.ZC') + '\n}', f.context);
  f.context.movementBytes = bytes; f.context.movementPacketName = name;
  return vm.runInContext('(() => { const fp = new BinaryReader(movementBytes); fp.readUShort(); return new MOVEMENT_PACKETS.ZC[movementPacketName](fp, movementBytes.length); })()', f.context);
}

function receiveNativeDamageAction(f: ReturnType<typeof fixture>, count = 1) {
  const bytes = new Uint8Array(29), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x8a, true); view.setUint32(2, 999, true); view.setUint32(6, 123, true);
  view.setUint32(10, 10000, true); view.setInt32(14, 150, true); view.setInt32(18, 300, true);
  view.setInt16(22, 10, true); view.setInt16(24, count, true); view.setUint8(26, 0); view.setInt16(27, 0, true);
  const packet = nativeMovementPacket(f, 'NOTIFY_ACT', bytes);
  f.context.DB.getWeaponSound = () => null; f.context.DB.getMessage = () => '%s %d';
  f.context.AE = { PROJECTILE: {}, SPAWN: {} };
  f.context.Damage = { TYPE: {}, add: vi.fn() }; f.context.MAX_ATTACKMT = 1000;
  f.context.ChatBox_default = { TYPE: { INFO: 0 }, FILTER: { BATTLE: 0 }, addText: vi.fn() };
  f.entity.display = { name: 'player' };
  f.entries.set(999, { GID: 999, objecttype: 5, job: 1002, weapon: 0, position: new Float32Array([0, 1, 1]),
    display: { name: 'monster' }, ACTION: f.entity.ACTION, lookTo() {}, setAction() {} } as unknown as Entity);
  f.context.damageActionPacket = packet;
  vm.runInContext('onEntityAction(damageActionPacket);', f.context);
  return packet;
}

interface ControlledEntity extends Entity {
  bodyState: number; healthState: number; _bodyState: number; _virtue: number;
  _lastroMovementStops?: Set<number>;
  lookTo(x: number, y: number): void;
}
function controlFixture(source = runtime) {
  const f = fixture(source);
  const readNow = (f.context.Date as { now(): number }).now;
  f.context.Date = class extends Date { static now() { return readNow(); } };
  for (const name of ['init_SoundManager', 'init_StatusState', 'init_MountTable', 'init_AllMountTable', 'init_Emotions']) {
    f.context[name] = () => {};
  }
  f.context.SoundManager = { playPosition: vi.fn(), play: vi.fn() };
  f.context.StatusIcons_default = { update: vi.fn() };
  const entity = f.entity as ControlledEntity;
  Object.assign(entity, { _bodyState: 0, _healthState: 0, _effectState: 0, _virtue: 0,
    attachments: { add: vi.fn(), remove: vi.fn() }, aura: { load: vi.fn() }, lookTo: vi.fn() });
  f.context.controlEntity = entity;
  vm.runInContext('init_EntityState(); Init$1.call(controlEntity);', f.context);
  const handlers = vm.runInContext('({ option: onEntityOptionChange, status: onEntityStatusChange, blade: onBladeStopPacket })', f.context) as {
    option(pkt: { AID: number; bodyState: number; healthState: number; effectState: number; isPKModeON: number }): void;
    status(pkt: { AID: number; index: number; state?: number; RemainMS?: number; TotalMS?: number; val?: number[] }): void;
    blade(pkt: { srcAID: number; destAID: number; flag: number }): void;
  };
  const state = (bodyState: number, healthState = 0) => {
    const bytes = new Uint8Array(13), view = new DataView(bytes.buffer);
    view.setUint16(0, 0x0119, true); view.setUint32(2, 123, true);
    view.setInt16(6, bodyState, true); view.setInt16(8, healthState, true);
    const packet = nativeMovementPacket(f, 'STATE_CHANGE', bytes) as Parameters<typeof handlers.option>[0];
    handlers.option(packet); return packet;
  };
  const status = (index: number, active: number) => {
    const bytes = new Uint8Array(9), view = new DataView(bytes.buffer);
    view.setUint16(0, 0x0196, true); view.setInt16(2, index, true);
    view.setUint32(4, 123, true); view.setUint8(8, active);
    const packet = nativeMovementPacket(f, 'MSG_STATE_CHANGE', bytes) as Parameters<typeof handlers.status>[0];
    handlers.status(packet); return packet;
  };
  const loadedStatus = (name: 'MSG_STATE_CHANGE3' | 'MSG_STATE_CHANGE5', index = statusConstants.statuses.STOP!) => {
    const extended = name === 'MSG_STATE_CHANGE5';
    const bytes = new Uint8Array(extended ? 28 : 24), view = new DataView(bytes.buffer);
    view.setUint16(0, extended ? 0x0984 : 0x08ff, true);
    view.setUint32(2, 123, true); view.setInt16(6, index, true);
    if (extended) view.setUint32(8, 10000, true);
    view.setUint32(extended ? 12 : 8, 5000, true);
    // Native loaded-status packets have no state; val[0] is data, not an on/off flag.
    const packet = nativeMovementPacket(f, name, bytes) as Parameters<typeof handlers.status>[0];
    handlers.status(packet); return packet;
  };
  const blade = (active: number) => {
    if (!f.entries.has(456)) {
      const other = { ...entity, GID: 456, position: new Float32Array([2, 1, 3]) } as ControlledEntity;
      f.functions.action.call(other); f.functions.walk.call(other);
      Object.assign(other, { _bodyState: 0, _healthState: 0, _effectState: 0, _virtue: 0 });
      f.context.controlOther = other; vm.runInContext('Init$1.call(controlOther);', f.context);
      f.entries.set(456, other);
    }
    const bytes = new Uint8Array(14), view = new DataView(bytes.buffer);
    view.setUint16(0, 0x01d1, true); view.setUint32(2, 123, true); view.setUint32(6, 456, true); view.setInt32(10, active, true);
    const packet = nativeMovementPacket(f, 'BLADESTOP', bytes) as Parameters<typeof handlers.blade>[0];
    handlers.blade(packet); return packet;
  };
  return { ...f, entity, state, status, loadedStatus, statusPacket: handlers.status, blade };
}

describe('authoritative control states retire old movement', () => {
  it.each(['STONE', 'FREEZE', 'STUN', 'SLEEP', 'IMPRISON'] as const)('retires a %s route at its fractional display position and accepts only a fresh route after recovery', name => {
    const f = controlFixture(); beginWalk(f); f.setNow(10100); f.entity.walkProcess();
    const position = Array.from(f.entity.position), epoch = f.entity._lastroMovementEpoch!;
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    f.state(statusConstants.states.BodyState[name]!);
    expect(f.entity._lastroMovementEpoch).toBe(epoch + 1); expect(f.entity.walk.total).toBe(0);
    expect(f.entity.walk.onEnd).toBeNull(); expect(Array.from(f.entity.position)).toEqual(position);
    f.setNow(11000); f.entity.walkProcess();
    expect(f.entity._lastroMovementEpoch).toBe(epoch + 1); expect(Array.from(f.entity.position)).toEqual(position);
    f.state(0); f.setNow(11100); f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(position);
    expect(arrived).not.toHaveBeenCalled();
    f.SessionStorage_default.serverTick = 11100;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 11100 });
    f.setNow(11400); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([2, 3, 5]); expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it('keeps freeze active when an older multi-hit HURT and recovery timer become due', () => {
    const f = controlFixture(); beginWalk(f); receiveNativeDamageAction(f, 3);
    f.setNow(10100); f.entity.walkProcess(); const position = Array.from(f.entity.position);
    f.state(statusConstants.states.BodyState.FREEZE!);
    const epoch = f.entity._lastroMovementEpoch;
    f.flush(10250); f.entity.walkProcess();
    expect(f.entity.action).toBe(f.entity.ACTION.FREEZE2); expect(Array.from(f.entity.position)).toEqual(position);
    f.flush(11200); f.entity.walkProcess();
    expect(f.entity.bodyState).toBe(statusConstants.states.BodyState.FREEZE);
    expect(f.entity.action).toBe(f.entity.ACTION.FREEZE2); expect(f.entity.walk.total).toBe(0);
    expect(f.entity._lastroMovementEpoch).toBe(epoch); expect(Array.from(f.entity.position)).toEqual(position);
    f.state(0); f.setNow(11300); f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(position);
  });

  it.each(['blade', 'stop'] as const)('preserves overlapping blade stop and explicit STOP when %s is released first', first => {
    const f = controlFixture(); beginWalk(f); f.setNow(10100); f.entity.walkProcess();
    const position = Array.from(f.entity.position);
    expect(f.blade(1)).toMatchObject({ srcAID: 123, destAID: 456, flag: 1 });
    expect(f.status(statusConstants.statuses.STOP!, 1)).toMatchObject({ index: 95, AID: 123, state: 1 });
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(position);
    if (first === 'blade') f.blade(0); else f.status(statusConstants.statuses.STOP!, 0);
    f.setNow(10200); f.SessionStorage_default.serverTick = 10200;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10200 });
    f.setNow(10500); f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(position);
    if (first === 'blade') f.status(statusConstants.statuses.STOP!, 0); else f.blade(0);
    f.setNow(10600); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual(position);
    f.SessionStorage_default.serverTick = 10600;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10600 });
    f.setNow(10900); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([2, 3, 5]);
  });

  it('retains exact authoritative STOP correction after a control cancellation', () => {
    const f = controlFixture(); beginWalk(f); f.setNow(10100); f.entity.walkProcess();
    f.state(statusConstants.states.BodyState.STUN!);
    f.functions.stop({ AID: 123, xPos: 2, yPos: 4 });
    expect(Array.from(f.entity.position)).toEqual([2, 4, 6]); expect(f.entity.walk.total).toBe(0);
    f.state(0); f.setNow(11100); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([2, 4, 6]);
  });

  it.each(['STONEWAIT', 'BURNING', 'CRYSTALIZE'] as const)('does not infer an unconditional movement stop from %s body state alone', name => {
    const f = controlFixture(); beginWalk(f); const epoch = f.entity._lastroMovementEpoch;
    f.state(statusConstants.states.BodyState[name]!); f.setNow(10300); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([3, 1, 4]); expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.entity._lastroMovementEpoch).toBe(epoch);
  });

  it('keeps poison and endure status separate from a movement stop', () => {
    const f = controlFixture(); beginWalk(f); const epoch = f.entity._lastroMovementEpoch;
    f.state(0, statusConstants.states.HealthState.POISON!); f.status(statusConstants.statuses.ENDURE!, 1);
    f.setNow(10300); f.entity.walkProcess();
    expect(f.entity.healthState).toBe(statusConstants.states.HealthState.POISON);
    expect(Array.from(f.entity.position)).toEqual([3, 1, 4]); expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.entity._lastroMovementEpoch).toBe(epoch);
  });

  it('clears a prior-session explicit STOP when the same entity enters a new map', () => {
    const f = controlFixture(); beginWalk(f); f.status(statusConstants.statuses.STOP!, 1);
    expect(f.entity.walk.total).toBe(0);
    f.functions.mapEntry(f.entity, { xPos: 8, yPos: 8 }, 123);
    expect(f.entity._lastroMovementStops).toBeUndefined();
    f.setNow(11000); f.SessionStorage_default.serverTick = 11000;
    f.functions.playerMove({ MoveData: [8, 8, 8, 12], moveStartTime: 11000 });
    f.setNow(11300); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([8, 10, 18]);
  });

  it.each(['MSG_STATE_CHANGE3', 'MSG_STATE_CHANGE5'] as const)('recognizes real loaded STOP %s without state and releases it only on an explicit off packet', name => {
    const f = controlFixture(); beginWalk(f); f.setNow(10100); f.entity.walkProcess();
    const position = Array.from(f.entity.position), epoch = f.entity._lastroMovementEpoch!;
    const packet = f.loadedStatus(name);
    expect(packet).not.toHaveProperty('state');
    expect(packet).toMatchObject({ AID: 123, index: 95, RemainMS: 5000, val: [0, 0, 0] });
    const constructors = (f.context.PACKET as { ZC: Record<string, { name: string }> }).ZC;
    expect(packet.constructor).toBe(constructors[name]);
    expect(f.entity.walk.total).toBe(0); expect(f.entity._lastroMovementEpoch).toBe(epoch + 1);
    expect(Array.from(f.entity.position)).toEqual(position);
    f.setNow(10200); f.SessionStorage_default.serverTick = 10200;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10200 });
    f.setNow(10500); f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(position);
    expect(f.status(statusConstants.statuses.STOP!, 0)).toMatchObject({ index: 95, state: 0 });
    f.setNow(10600); f.SessionStorage_default.serverTick = 10600;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10600 });
    f.setNow(10900); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([2, 3, 5]); expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it('does not treat missing state or a lookalike constructor name as a loaded STOP', () => {
    const f = controlFixture(); beginWalk(f); const epoch = f.entity._lastroMovementEpoch;
    // Register the genuine decoder constructors using a non-stopping status.
    f.loadedStatus('MSG_STATE_CHANGE3', statusConstants.statuses.ENDURE!);
    f.loadedStatus('MSG_STATE_CHANGE5', statusConstants.statuses.ENDURE!);
    f.statusPacket({ AID: 123, index: statusConstants.statuses.STOP! });
    const constructors = (f.context.PACKET as { ZC: Record<string, { name: string }> }).ZC;
    const lookalikes = [function PACKET_ZC_MSG_STATE_CHANGE3() {}, function PACKET_ZC_MSG_STATE_CHANGE5() {}];
    for (const constructor of lookalikes) {
      const name = constructor.name.replace('PACKET_ZC_', '');
      expect(constructor.name).toBe(constructors[name]!.name);
      const packet = { AID: 123, index: statusConstants.statuses.STOP!, constructor };
      f.statusPacket(packet);
    }
    expect(f.entity._lastroMovementEpoch).toBe(epoch); expect(f.entity.walk.total).toBeGreaterThan(0);
    f.setNow(10300); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([3, 1, 4]);
    f.SessionStorage_default.serverTick = 10300;
    f.functions.playerMove({ MoveData: [3, 1, 3, 12], moveStartTime: 10300 });
    f.setNow(10600); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([3, 3, 6]);
  });
});

describe('authoritative FASTMOVE Body Relocation targets', () => {
  it('applies a valid authoritative target when its local walking search fails, without leaving temporary speed', () => {
    const f = fixture(); largerGat(f);
    beginWalk(f);
    f.functions.fastMove(fastMovePacket(f, 50, 1));
    expect(Array.from(f.entity.position)).toEqual([50, 1, 51]);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.speed).toBe(150);
    expect(f.entity.walk.onEnd).toBeNull(); expect(f.entity._lastroApprovedRoute).toBeUndefined();
    f.setNow(12000); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([50, 1, 51]);
    expect(f.Network.sendPacket).not.toHaveBeenCalled();
  });

  it('retains the normal 10ms route for a legal 32-step relocation and restores speed after arrival', () => {
    const f = fixture(); largerGat(f);
    f.functions.fastMove(fastMovePacket(f, 33, 1));
    expect(f.entity.walk.total).toBe(66); expect(f.entity.walk.speed).toBe(10);
    expect(f.entity.position[0]).toBe(1);
    f.setNow(10350); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([33, 1, 34]);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.speed).toBe(150);
    expect(f.entity.walk.onEnd).toBeNull();
  });

  it('retires an old fast route for a same-position target and does not restart IDLE on repeated notifications', () => {
    const f = fixture(); f.functions.fastMove(fastMovePacket(f, 12, 1));
    expect(f.entity.walk.speed).toBe(10);
    const setAction = vi.spyOn(f.entity, 'setAction');
    f.functions.fastMove(fastMovePacket(f, 1, 1));
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.speed).toBe(150);
    expect(f.entity.walk.onEnd).toBeNull(); expect(setAction).toHaveBeenCalledOnce();
    setAction.mockClear(); f.functions.fastMove(fastMovePacket(f, 1, 1));
    expect(setAction).not.toHaveBeenCalled(); expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
  });

  it('recovers a non-finite displayed position from a valid authoritative relocation target', () => {
    const f = fixture(); f.entity.position[0] = NaN;
    f.functions.fastMove(fastMovePacket(f, 12, 1));
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.speed).toBe(150);
  });

  it.each(['loading', 'missing-gat', 'missing-cell', 'non-finite-height', 'height-error', 'negative', 'outside', 'fractional', 'missing-entity'])('leaves an active route unchanged for %s relocation input', kind => {
    const f = fixture(); beginWalk(f);
    const packet = { AID: 123, targetXpos: 12, targetYpos: 12 };
    if (kind === 'loading') f.MapRenderer.loading = true;
    if (kind === 'missing-gat') f.Altitude.width = f.Altitude.height = 0;
    if (kind === 'missing-cell') f.Altitude.getCellType.mockReturnValue(undefined);
    if (kind === 'non-finite-height') f.Altitude.getCellHeight.mockReturnValue(NaN);
    if (kind === 'height-error') f.Altitude.getCellHeight.mockImplementation(() => { throw new Error('GAT unavailable'); });
    if (kind === 'negative') packet.targetXpos = -1;
    if (kind === 'outside') packet.targetXpos = 24;
    if (kind === 'fractional') packet.targetXpos = 1.5;
    if (kind === 'missing-entity') packet.AID = 999;
    const before = {
      position: Array.from(f.entity.position), total: f.entity.walk.total, speed: f.entity.walk.speed,
      onEnd: f.entity.walk.onEnd, epoch: f.entity._lastroMovementEpoch,
    };
    f.functions.fastMove(packet);
    expect({
      position: Array.from(f.entity.position), total: f.entity.walk.total, speed: f.entity.walk.speed,
      onEnd: f.entity.walk.onEnd, epoch: f.entity._lastroMovementEpoch,
    }).toEqual(before);
  });
});

describe('damage visuals on server-approved movement', () => {

  it.each([1, 3])('finishes a whole approved route after a real 0x8a damage action with %s hits and no new movement packet', count => {
    const f = fixture();
    const moveBytes = new Uint8Array(12), view = new DataView(moveBytes.buffer);
    view.setUint16(0, 0x87, true); view.setUint32(2, 10000, true);
    moveBytes.set([0, 64, 16, 80, 1, 0], 6); // [1,1] -> [20,1]
    const move = nativeMovementPacket(f, 'NOTIFY_PLAYERMOVE', moveBytes) as MovePacket;
    expect(Array.from(move.MoveData)).toEqual([1, 1, 20, 1]);
    f.functions.playerMove(move);
    const routeEnd = vi.fn(), walkEnd = vi.fn();
    f.entity.walk.onEnd = routeEnd; f.entity.onWalkEnd = walkEnd;
    f.setNow(10050); f.SessionStorage_default.serverTick = 10050;
    f.entity.walkProcess();
    const action = receiveNativeDamageAction(f, count);
    expect(action).toMatchObject({ GID: 999, targetGID: 123, startTime: 10000, damage: 10, action: 0, count });
    f.flush(10150); f.entity.walkProcess();
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    expect(f.entity.position[0]).toBe(2);
    expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.entity.walk.onEnd).toBe(routeEnd);
    f.flush(10300); f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(3);
    f.flush(13000); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([20, 1, 21]);
    expect(f.entity.walk.total).toBe(0);
    expect(routeEnd).toHaveBeenCalledOnce(); expect(walkEnd).toHaveBeenCalledOnce();
    expect(f.Network.sendPacket).not.toHaveBeenCalled();
  });

  it('schedules a late real damage visual at its impact time without rewinding the current position', () => {
    const f = fixture(); beginWalk(f);
    f.setNow(10300); f.SessionStorage_default.serverTick = 10300;
    f.entity.walkProcess(); expect(f.entity.position[0]).toBe(3);
    receiveNativeDamageAction(f);
    f.flush(10300); f.entity.walkProcess();
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    expect(f.entity.position[0]).toBe(3);
    expect(f.entity.walk.total).toBeGreaterThan(0);
    f.flush(10450);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    f.setNow(12000); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]);
  });

  it('does not let old damage recovery replace a newer attack action on a newer route', () => {
    const f = fixture(); beginWalk(f);
    f.functions.hit({ ...normalHit, count: 4 }, f.entity);
    f.flush(10150);
    f.setNow(10200); f.SessionStorage_default.serverTick = 10200;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10200 });
    f.entity.setAction({ action: f.entity.ACTION.ATTACK!, repeat: true, play: true });
    const newerAction = f.entity.action;
    expect(newerAction).toBe(f.entity.ACTION.ATTACK1);
    f.flush(11000); f.entity.walkProcess();
    expect(f.entity.action).toBe(newerAction);
    expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.entity.position[1]).toBeCloseTo(1 + 800 / 150);
  });

  it('preserves native LastRO movement during HURT and recovery of the same approved route', () => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit(normalHit, f.entity);
    f.flush(10150);
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(2);
    f.setNow(10300);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(3);
    f.flush(10450);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it.each([4, 9, 11, 14])('keeps immune or lucky-dodge action %s moving without interruption', action => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, action }, f.entity);
    f.flush(10300);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(3);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it.each([
    { damage: 0, leftDamage: 0, attackedMT: 300 },
    { damage: 10, attackedMT: 0 },
    { damage: 10, attackedMT: -1 },
  ])('does not stop non-flinching hit %j', detail => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, ...detail }, f.entity);
    f.flush(10300);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(3);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
  });

  it('lets a newer authoritative route win over an already-past attack impact received late', () => {
    const f = fixture();
    beginWalk(f);
    f.setNow(10300);
    f.SessionStorage_default.serverTick = 10300;
    f.functions.playerMove({ MoveData: [3, 1, 3, 12], moveStartTime: 10300 });
    f.functions.hit({ ...normalHit, startTime: 10000 }, f.entity);
    f.flush(10300);
    f.setNow(10600);
    f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([3, 3, 6]);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it('allows a newly confirmed server route after a real hit and rejects remaining old multihit callbacks', () => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, count: 4 }, f.entity);
    f.flush(10150);
    f.setNow(10200);
    f.SessionStorage_default.serverTick = 10200;
    f.functions.playerMove({ MoveData: [2, 1, 2, 9], moveStartTime: 10200 });
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    f.flush(10900);
    f.entity.walkProcess();
    expect(f.entity.position[1]).toBeCloseTo(1 + 700 / 150);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it('keeps a newer fast-move packet and restores normal speed if that route is later canceled', () => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, count: 3 }, f.entity);
    f.setNow(10100);
    f.functions.fastMove({ AID: 123, targetXpos: 1, targetYpos: 12 });
    expect(f.entity.walk.speed).toBe(10);
    f.flush(10800);
    f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([1, 12, 13]);
    expect(f.entity.walk.speed).toBe(150);
    expect(f.entity.action).not.toBe(f.entity.ACTION.HURT);

    f.functions.fastMove({ AID: 123, targetXpos: 12, targetYpos: 12 });
    expect(f.entity.walk.speed).toBe(10);
    f.functions.stop({ AID: 123, xPos: 2, yPos: 12 });
    expect(f.entity.walk.speed).toBe(150);
    expect(Array.from(f.entity.position)).toEqual([2, 12, 14]);
  });

  it('rejects an older movement timestamp and accepts a uint32 wrap without corrupting the newer route', () => {
    const f = fixture();
    beginWalk(f);
    f.setNow(10100);
    f.SessionStorage_default.serverTick = 10100;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10100 });
    f.functions.move({ GID: 123, MoveData: [1, 1, 12, 1], moveStartTime: 10050 });
    f.setNow(10400);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(2);
    expect(f.entity.position[1]).toBe(3);

    f.functions.mapEntry(f.entity, { xPos: 1, yPos: 1 }, 123);
    f.SessionStorage_default.serverTick = 0xfffffff0;
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 0xfffffff0 });
    f.SessionStorage_default.serverTick = 16;
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 16 });
    f.setNow(10550);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(2);
    expect(f.entity.position[1]).toBe(2);
  });

  it.each(['player', 'entity', 'zero'] as const)('lets a newer %s server correction supersede a pending hit', kind => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, count: 3 }, f.entity);
    f.setNow(10100);
    f.SessionStorage_default.serverTick = 10100;
    if (kind === 'player') f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10100 });
    else if (kind === 'entity') f.functions.move({ GID: 123, MoveData: [2, 1, 2, 12], moveStartTime: 10100 });
    else f.functions.playerMove({ MoveData: [7, 8, 7, 8], moveStartTime: 10100 });
    f.flush(10800);
    f.entity.walkProcess();
    if (kind === 'zero') expect(Array.from(f.entity.position)).toEqual([7, 8, 15]);
    else {
      expect(f.entity.position[0]).toBe(2);
      expect(f.entity.position[1]).toBeCloseTo(1 + 700 / 150);
      expect(f.entity.walk.total).toBeGreaterThan(0);
    }
    expect(f.entity.action).not.toBe(f.entity.ACTION.HURT);
  });

  it.each(['stop', 'jump'] as const)('uses authoritative %s coordinates and rejects old damage timers', kind => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, count: 3 }, f.entity);
    f.setNow(10100);
    f.functions[kind]({ AID: 123, xPos: 7, yPos: 8 });
    f.flush(10900);
    f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([7, 8, 15]);
    expect(f.entity.walk.total).toBe(0);
    expect(f.entity.action).not.toBe(f.entity.ACTION.HURT);
  });

  it('ignores delayed damage after the entity identity is removed or replaced', () => {
    for (const replace of [false, true]) {
      const f = fixture();
      beginWalk(f);
      f.functions.hit(normalHit, f.entity);
      if (replace) f.entries.set(123, { ...f.entity, position: new Float32Array([8, 8, 16]) });
      else f.entries.delete(123);
      f.flush(10450);
      expect(f.entity.action).toBe(f.entity.ACTION.WALK);
      expect(f.entity.walk.total).toBeGreaterThan(0);
    }
  });

  it('ignores delayed damage after death without resurrecting a movement animation', () => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, count: 5 }, f.entity);
    f.entity.setAction({ action: f.entity.ACTION.DIE!, repeat: true });
    f.flush(11500);
    expect(f.entity.action).toBe(f.entity.ACTION.DIE);
  });

  it.each(['mapChange', 'mapEntry', 'cleanup'] as const)('invalidates pending hits at %s even when the player entity is reused', flow => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit({ ...normalHit, count: 3 }, f.entity);
    if (flow === 'mapChange') f.functions.mapChange({ mapName: 'prt_fild01', xPos: 8, yPos: 8 });
    else if (flow === 'mapEntry') f.functions.mapEntry(f.entity, { xPos: 8, yPos: 8 }, 123);
    else f.functions.cleanup();
    f.entity.setAction({ action: f.entity.ACTION.IDLE! });
    f.flush(11200);
    expect(f.entity.action).toBe(f.entity.ACTION.IDLE);
  });

  it('keeps a legitimate pending hurt visual after route completion without restarting movement', () => {
    const f = fixture();
    f.functions.playerMove({ MoveData: [1, 1, 2, 1], moveStartTime: 10000 });
    f.functions.hit({ ...normalHit, attackMT: 300 }, f.entity);
    f.setNow(10150);
    f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0);
    f.flush(10300);
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    f.flush(11000);
    f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    expect(f.entity.walk.total).toBe(0);
  });

  it('rejects a stale delayed hit when SessionStorage switches to a different character', () => {
    const f = fixture();
    beginWalk(f);
    f.functions.hit(normalHit, f.entity);
    f.SessionStorage_default.Entity = { ...f.entity, GID: 321 };
    f.flush(10450);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
  });
});

function moveRequest() {
  const buffer = new ArrayBuffer(5);
  return { constructor: { name: 'PACKET_CZ_REQUEST_MOVE2' }, build: vi.fn(() => ({ buffer, view: new DataView(buffer) })) };
}

describe('nearby route joins after damage notifications', () => {
  function receiveNearRoute(f: ReturnType<typeof fixture>, time = 10210) {
    const bytes = new Uint8Array(12), view = new DataView(bytes.buffer);
    view.setUint16(0, 0x87, true); view.setUint32(2, time, true);
    bytes.set([0, 128, 16, 48, 1, 0], 6); // [2,1] -> [12,1]
    const packet = nativeMovementPacket(f, 'NOTIFY_PLAYERMOVE', bytes) as MovePacket;
    expect(Array.from(packet.MoveData)).toEqual([2, 1, 12, 1]);
    f.functions.playerMove(packet);
    return packet;
  }
  function hurtRoute(count = 1) {
    const f = fixture(); beginWalk(f);
    f.setNow(10050); f.SessionStorage_default.serverTick = 10050; f.entity.walkProcess();
    receiveNativeDamageAction(f, count);
    f.SessionStorage_default.serverTick = 10210; f.flush(10210); f.entity.walkProcess();
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    expect(f.entity.position[0]).toBeCloseTo(2.4, 5);
    return f;
  }

  it.each(['player', 'entity'] as const)('keeps the shown hurt position for a real decoded MOVE via %s and rejoins the server deadline', entry => {
    const f = hurtRoute(), before = Array.from(f.entity.position);
    if (entry === 'player') receiveNearRoute(f);
    else f.functions.move({ GID: 123, MoveData: [2, 1, 12, 1], moveStartTime: 10210 });
    expect(Array.from(f.entity.position)).toEqual(before);
    f.flush(10300); f.entity.walkProcess(); expect(f.entity.position[0]).toBeCloseTo(2.76, 5);
    f.flush(10360); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([3, 1, 4]);
    f.flush(10375); f.entity.walkProcess(); expect(f.entity.position[0]).toBeCloseTo(3.1, 5);
    expect(f.Network.sendPacket).not.toHaveBeenCalled();
  });

  it('invalidates remaining old multihit animations without canceling the joined route', () => {
    const f = hurtRoute(3); receiveNearRoute(f);
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    f.flush(10560); f.entity.walkProcess(); expect(f.entity.action).toBe(f.entity.ACTION.WALK);
    expect(f.entity.position[0]).toBeCloseTo(4 + 50 / 150, 5);
    f.flush(12000); f.entity.walkProcess(); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]); expect(arrived).toHaveBeenCalledOnce();
  });

  it('rejects an older MOVE without disturbing the joined segment or its deadline', () => {
    const f = hurtRoute(); receiveNearRoute(f); const before = Array.from(f.entity.position);
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10000 });
    expect(Array.from(f.entity.position)).toEqual(before);
    f.flush(10360); f.entity.walkProcess(); expect(f.entity.position[0]).toBe(3);
  });

  it.each(['stop', 'jump'] as const)('preserves authoritative %s during a join and gives a later first route its exact server origin', kind => {
    const f = hurtRoute(); receiveNearRoute(f);
    f.setNow(10240); f.entity.walkProcess(); expect(f.entity.position[0]).toBeCloseTo(2.52, 5);
    f.functions[kind]({ AID: 123, xPos: 7, yPos: 8 });
    expect(Array.from(f.entity.position)).toEqual([7, 8, 15]); expect(f.entity.walk.total).toBe(0);
    f.flush(11000); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([7, 8, 15]);
    f.entity.position.set([7.4, 8, 15.4]); f.SessionStorage_default.serverTick = 11000;
    f.functions.playerMove({ MoveData: [7, 8, 12, 8], moveStartTime: 11000 });
    expect(Array.from(f.entity.position)).toEqual([7, 8, 15]);
  });

  it('retains FASTMOVE speed and endpoint semantics after a nearby join', () => {
    const f = hurtRoute(); receiveNearRoute(f);
    f.functions.fastMove({ AID: 123, targetXpos: 12, targetYpos: 1 });
    expect(f.entity.walk.speed).toBe(10);
    f.flush(10410); f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]);
    expect(f.entity.walk.speed).toBe(150); expect(f.entity.walk.total).toBe(0);
  });

  it('does not preserve a joined display position for a zero-distance server correction', () => {
    const f = hurtRoute(); receiveNearRoute(f);
    f.functions.playerMove({ MoveData: [2, 1, 2, 1], moveStartTime: 10210 });
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
    f.flush(11000); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
  });

  it('retires a joined route on control and requires a fresh server origin after recovery', () => {
    const f = controlFixture(); beginWalk(f);
    f.setNow(10210); f.SessionStorage_default.serverTick = 10210; f.entity.walkProcess(); receiveNearRoute(f);
    f.setNow(10270); f.entity.walkProcess(); const before = Array.from(f.entity.position);
    f.state(statusConstants.states.BodyState.STUN!);
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(before);
    f.SessionStorage_default.serverTick = 10300; f.setNow(10300); receiveNearRoute(f, 10300);
    expect(f.entity.walk.total).toBe(0); expect(Array.from(f.entity.position)).toEqual(before);
    f.state(0); f.setNow(10500); f.SessionStorage_default.serverTick = 10500; receiveNearRoute(f, 10500);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    f.setNow(10650); f.entity.walkProcess(); expect(Array.from(f.entity.position)).toEqual([3, 1, 4]);
  });
});

describe('movement while the server is silent or disconnected', () => {
  it('sends an unacknowledged move request without starting a speculative local route', () => {
    const f = fixture();
    const packet = moveRequest();
    f.functions.sendPacket(packet);
    f.setNow(13000);
    f.entity.walkProcess();
    expect(packet.build).toHaveBeenCalledOnce();
    expect(f.socket.send).toHaveBeenCalledOnce();
    expect(f.entity.walk.total).toBe(0);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
  });

  it('finishes a server-approved route without extra coordinate packets or a followup move acknowledgement', () => {
    const f = fixture();
    beginWalk(f);
    f.setNow(10300);
    f.entity.walkProcess();
    f.functions.sendPacket(moveRequest());
    f.setNow(12000);
    f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]);
    expect(f.entity.walk.total).toBe(0);
  });

  it('immediately freezes a closed zone connection and blocks further movement packets', () => {
    const f = fixture();
    beginWalk(f);
    f.setNow(10300);
    f.entity.walkProcess();
    const position = Array.from(f.entity.position);
    const arrival = vi.fn();
    f.entity.walk.onEnd = arrival;
    f.socket.connected = false;
    f.functions.closeEvent.call(f.socket, { code: 0, wasClean: false });
    expect(f.entity.walk.total).toBe(0);
    expect(f.entity.action).toBe(f.entity.ACTION.IDLE);
    expect(f.MapControl._lastroMovementInput.cancel).toHaveBeenCalled();
    f.setNow(12000);
    f.entity.walkProcess();
    const packet = moveRequest();
    f.functions.sendPacket(packet);
    expect(Array.from(f.entity.position)).toEqual(position);
    expect(arrival).not.toHaveBeenCalled();
    expect(packet.build).not.toHaveBeenCalled();
    expect(f.socket.send).not.toHaveBeenCalled();
  });

  it('does not cancel the new connection when a superseded socket closes during handoff', () => {
    const f = fixture();
    beginWalk(f);
    const old = { ...f.socket, connected: false, handoffPending: true };
    f.functions.closeEvent.call(old, { code: 0, wasClean: true });
    f.setNow(10300);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBe(3);
    expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.MapControl._lastroMovementInput.cancel).not.toHaveBeenCalled();
  });

  it('handles a login connection closing before game session state has been initialized', () => {
    const f = fixture();
    const login = { ...f.socket, connected: false, isZone: false };
    f.context._socket = login;
    f.context._sockets = [login];
    f.context.SessionStorage_default = undefined;
    expect(() => f.functions.closeEvent.call(login, { code: 0, wasClean: false })).not.toThrow();
    expect(f.MapControl._lastroMovementInput.cancel).not.toHaveBeenCalled();
  });

  it('stops the current route after a persistently unanswered heartbeat while preserving the current display position', () => {
    const f = fixture();
    beginWalk(f, 10000);
    f.SessionStorage_default.ping.returned = false;
    f.SessionStorage_default.ping._lastroUnansweredSince = 10000;
    f.setNow(54000);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBeCloseTo(5.4);
    const position = Array.from(f.entity.position);
    f.setNow(56000);
    f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0);
    expect(f.entity.action).toBe(f.entity.ACTION.IDLE);
    expect(Array.from(f.entity.position)).toEqual(position);
    const request = moveRequest();
    f.functions.sendPacket(request);
    expect(request.build).not.toHaveBeenCalled();
  });

  it('keeps an approved route moving when other valid server packets prove the connection is live', () => {
    const f = fixture();
    beginWalk(f, 10000);
    f.SessionStorage_default.ping.returned = false;
    f.SessionStorage_default.ping._lastroUnansweredSince = 10000;
    f.socket._lastroMovementPacketAt = 55000;
    f.setNow(56000);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBeCloseTo(5.6);
    expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
  });

  it('does not interpret a disabled or never-sent heartbeat as loss of movement authority', () => {
    const f = fixture();
    beginWalk(f, 10000);
    f.SessionStorage_default.ping.returned = false;
    f.SessionStorage_default.ping._lastroUnansweredSince = undefined;
    f.setNow(56000);
    f.entity.walkProcess();
    expect(f.entity.position[0]).toBeCloseTo(5.6);
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it('uses a returning heartbeat and newly approved movement to recover after a prolonged stall', () => {
    const f = fixture();
    beginWalk(f, 10000);
    f.SessionStorage_default.ping.returned = false;
    f.SessionStorage_default.ping._lastroUnansweredSince = 10000;
    f.setNow(56000);
    f.entity.walkProcess();
    expect(f.entity.walk.total).toBe(0);
    f.functions.pong({ time: 56000 });
    f.entity.walk.speed = 150;
    f.functions.playerMove({ MoveData: [4, 4, 4, 12], moveStartTime: 56000 });
    f.setNow(56300);
    f.entity.walkProcess();
    expect(Array.from(f.entity.position)).toEqual([4, 6, 10]);
    expect(f.entity.action).toBe(f.entity.ACTION.WALK);
  });
});
