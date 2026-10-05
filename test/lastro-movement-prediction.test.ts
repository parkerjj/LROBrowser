import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeEntitySync } from '../scripts/lastro-entity-sync.mjs';
import { patchRuntimeMovementSync } from '../scripts/lastro-movement-sync.mjs';
import { patchRuntimeMovementPrediction as patchViteRuntimeMovementPrediction } from '../scripts/lastro-movement-prediction.mjs';
import type { LastroPositionReconciler } from '../scripts/lastro-position-reconciliation.mjs';
// Load the actual Node module: Vite import rewriting must not leak into embedded function sources.
const nativeRequire = process.getBuiltinModule('module').createRequire(import.meta.url);
const { patchRuntimeMovementPrediction, patchRuntimeMovementFrameClock } = nativeRequire('../scripts/lastro-movement-prediction.mjs') as {
  patchRuntimeMovementPrediction(source: string): string; patchRuntimeMovementFrameClock(source: string): string;
};
const vendor = readFileSync(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
function region(name: string, source = vendor) {
  const start = source.indexOf(`//#region ${name}`);
  if (start < 0) throw new Error(name);
  const end = source.indexOf('//#endregion', start) + '//#endregion'.length;
  return source.slice(start, end);
}
const base = [
  'src/Renderer/Entity/EntityWalk.js', 'src/Engine/MapEngine/Entity.js',
  'src/Engine/MapEngine/Main.js', 'src/Engine/MapEngine/Skill.js', 'src/Engine/MapEngine.js', 'src/Network/NetworkManager.js',
  'src/Renderer/Entity/EntityState.js',
  'src/Renderer/Entity/EntityRender.js', 'src/Renderer/Camera.js', 'src/Renderer/GR2/GR2ModelRenderer.js',
  'src/Renderer/Entity/EntityAttachments.js', 'src/Renderer/Effects/Damage.js',
  'src/Renderer/MapRenderer.js',
].map(name => region(name)).join('\n');
const synchronized = patchRuntimeEntitySync(base);
const patched = patchRuntimeMovementFrameClock(patchRuntimeMovementPrediction(patchRuntimeMovementSync(synchronized)));
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
  GID: number; objecttype: number; ACTION: Record<string, number>; action: number; direction: number; display?: { name: string };
  position: Float32Array; walk: Walk; _lastroMovementEpoch?: number; _lastroApprovedRoute?: unknown;
  animation: { next: ActionOptions | false; save: ActionOptions | false; repeat: boolean; delay: number };
  _deathSyncTick: number;
  _lastroMotion?: { view: LastroPositionReconciler; latency: null | { count: number; mean: number; deviation: number };
    ackOutstanding: boolean; ackFenced: boolean; predictionBlockedUntil?: number;
    approvedContinuation: null | { epoch: number };
    pending: null | { deadline: number; limitTick: number; expired: boolean; offsetX: number; offsetY: number; ackAmbiguous: boolean;
      route: { segments: { x0: number; y0: number; x1: number; y1: number; start: number; end: number }[] } } };
  onWalkEnd: () => void;
  walkTo(x0: number, y0: number, x1: number, y1: number, range?: number, start?: number): void;
  walkProcess(lastroTick?: number): void; resetRoute(keepDistance?: boolean): void;
  setAction(options: ActionOptions): void;
  set(options: { PosDir: number[]; GID: number }): void;
}
interface HitPacket {
  damage: number; leftDamage?: number; count?: number; action: number; attackMT: number; attackedMT: number;
  startTime?: unknown;
}
interface MovePacket { MoveData: number[]; moveStartTime: number; }

function fixture(source = patched, globals: Record<string, unknown> = {}) {
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
  const LastROAdvanceServerTick = vi.fn(() => SessionStorage_default.serverTick);
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
    LastROAdvanceServerTick, LastROEventDueTick: () => dueTick,
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
    ...globals,
  });
  vm.runInContext(region('src/Utils/PathFinding.js'), context);
  vm.runInContext('init_PathFinding(); PathFinding_default.setGat(Altitude);', context);
  const action = region('src/Renderer/Entity/EntityAction.js');
  vm.runInContext([
    declaration(action, 'Action'), declaration(action, 'Animation'), declaration(action, 'setAction'), declaration(action, 'Init$10'),
    ['src/Renderer/Entity/EntityWalk.js', 'src/Engine/MapEngine/Entity.js',
      'src/Engine/MapEngine/Main.js', 'src/Engine/MapEngine/Skill.js', 'src/Engine/MapEngine.js', 'src/Network/NetworkManager.js',
      'src/Renderer/Entity/EntityState.js'].map(name => region(name, source)).join('\n').replaceAll('import.meta.url', '"file:///native.js"'), 'init_EntityWalk();',
  ].join('\n'), context);
  const socket = {
    connected: true, isZone: true, handoffPending: false, _lastroMovementPacketAt: 10000, send: vi.fn(),
  };
  context._socket = socket;
  context._sockets = [socket];
  context._onDisconnect = vi.fn();
  const functions = vm.runInContext(`({
    action: Init$10, walk: Init$4, hit: onEntityWillBeHitSub, visual: lastroMovementVisual,
    visualAction: lastroMovementVisualAction, visualDirection: lastroMovementVisualDirection, visualDistance: lastroMovementVisualDistance,
    playerMove: onPlayerMove, move: onEntityMove, stop: onEntityStopMove, skillResult: onSkillResult,
    jump: onEntityJump, fastMove: onEntityFastMove,
    mapChange: onMapChange, mapEntry: resetEntityForMapEntry, accepted: onConnectionAccepted$2, cleanup: cleanGameUI,
    pong: onPong, sendPacket, closeEvent: onClose$9, parameter: onParameterChange$1,
  })`, context) as {
    action(this: Entity): void; walk(this: Entity): void; hit(pkt: HitPacket, entity: Entity): void;
    visual(entity: Entity): Float32Array; visualAction(entity: Entity): number;
    visualDirection(entity: Entity): number; visualDistance(entity: Entity): number;
    playerMove(pkt: MovePacket): void; move(pkt: MovePacket & { GID: number }): void;
    stop(pkt: { AID: number; xPos: number; yPos: number }): void;
    skillResult(pkt: { SKID: number; NUM: number; itemId: number; result: number; cause: number }): void;
    jump(pkt: { AID: number; xPos: number; yPos: number }): void;
    fastMove(pkt: { AID: number; targetXpos: number; targetYpos: number }): void;
    mapChange(pkt: { mapName: string; xPos: number; yPos: number }): void;
    mapEntry(entity: Entity, pkt: { xPos: number; yPos: number }, gid: number): void;
    accepted(pkt: { PosDir: [number, number, number] }): void;
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


function nativeMovementPacket(f: ReturnType<typeof fixture>, name: 'NOTIFY_PLAYERMOVE' | 'NOTIFY_STANDENTRY' | 'STOPMOVE' | 'NOTIFY_ACT' | 'USESKILL_ACK' | 'ACK_TOUSESKILL' | 'STATE_CHANGE' | 'MSG_STATE_CHANGE' | 'MSG_STATE_CHANGE3' | 'MSG_STATE_CHANGE5' | 'BLADESTOP', bytes: Uint8Array) {
  const start = vendor.indexOf('  PACKET.ZC.' + name + ' = function');
  const sizeStart = vendor.indexOf('  PACKET.ZC.' + name + '.size =', start);
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

function receiveNativeStop(f: ReturnType<typeof fixture>, x: number, y: number) {
  const bytes = new Uint8Array(10), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x0088, true); view.setUint32(2, 123, true); view.setInt16(6, x, true); view.setInt16(8, y, true);
  const packet = nativeMovementPacket(f, 'STOPMOVE', bytes) as Parameters<typeof f.functions.stop>[0];
  f.functions.stop(packet);
}

function receiveNativeMove(f: ReturnType<typeof fixture>, from: [number, number], to: [number, number], start: number) {
  const bytes = new Uint8Array(12), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x0087, true); view.setUint32(2, start, true);
  bytes[6] = from[0] >> 2; bytes[7] = (from[0] & 3) << 6 | from[1] >> 4;
  bytes[8] = (from[1] & 15) << 4 | to[0] >> 6;
  bytes[9] = (to[0] & 63) << 2 | to[1] >> 8; bytes[10] = to[1];
  const packet = nativeMovementPacket(f, 'NOTIFY_PLAYERMOVE', bytes) as MovePacket;
  expect(Array.from(packet.MoveData)).toEqual([...from, ...to]);
  f.functions.playerMove(packet);
}

type NativeActionRequest = 'REQUEST_MOVE2' | 'REQUEST_ACT' | 'REQUEST_ACT2' | 'USE_SKILL' | 'USE_SKILL2'
  | 'USE_SKILL_TOGROUND' | 'USE_SKILL_TOGROUND2' | 'USE_SKILL_TOGROUND3';
function nativeActionRequest(f: ReturnType<typeof fixture>, name: NativeActionRequest) {
  const start = vendor.indexOf('  PACKET.CZ.' + name + ' = function');
  const build = vendor.indexOf('  PACKET.CZ.' + name + '.prototype.build = function', start);
  const end = vendor.indexOf('\n  PACKET.', build + 1);
  if (start < 0 || build < start || end < build) throw new Error('Missing native action request ' + name);
  f.context.init_CodepageManager = () => {};
  f.context.actionRequestName = name;
  const versions: Partial<Record<NativeActionRequest, number[]>> = {
    REQUEST_ACT: [0, 137, 7, 2, 6], USE_SKILL: [0, 275, 10, 2, 4, 6],
    USE_SKILL_TOGROUND: [0, 278, 10, 2, 4, 6, 8],
  };
  f.context.actionRequestVersion = versions[name];
  vm.runInContext(region('src/Utils/BinaryWriter.js')
    + '\ninit_BinaryWriter(); var PACKET = globalThis.PACKET || { ZC: {} }; PACKET.CZ ||= {};'
    + '\n' + vendor.slice(start, end), f.context);
  return vm.runInContext(`(() => {
    const packet = new PACKET.CZ[actionRequestName]();
    packet.getPacketVersion = () => actionRequestVersion;
    return packet;
  })()`, f.context) as Parameters<typeof f.functions.sendPacket>[0] & { SKID?: number; dest: [number, number] };
}

function sendNativeMove(f: ReturnType<typeof fixture>, dest: [number, number]) {
  const packet = nativeActionRequest(f, 'REQUEST_MOVE2'); packet.dest = dest;
  f.functions.sendPacket(packet);
}

function sendNativeSkill(f: ReturnType<typeof fixture>, name: NativeActionRequest = 'USE_SKILL2') {
  const packet = nativeActionRequest(f, name); packet.SKID = 28;
  f.functions.sendPacket(packet);
}

function receiveNativeCastSkill(f: ReturnType<typeof fixture>, target?: [number, number]) {
  f.context.SkillInfo = { 28: { ActionType: 'SKILL' } };
  f.context.SkillEffect = { 28: { hideCastBar: true, hideCastAura: true } };
  f.context.SkillNameDisplayExclude = [28]; f.context.SkillConst_default = {};
  f.context.EffectManager.spamSkillCast = vi.fn();
  Object.assign(f.entity, { cast: { set: vi.fn() }, lookTo: vi.fn() });
  if (target) {
    const source = region('src/Renderer/Entity/Entity.js');
    const file = ts.createSourceFile('entity.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const methods: ts.MethodDeclaration[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'lookTo') methods.push(node);
      ts.forEachChild(node, visit);
    };
    visit(file); const lookTo = methods[0]; if (!lookTo) throw new Error('Missing native lookTo');
    f.context.castEntity = f.entity;
    vm.runInContext('castEntity.lookTo = ({' + lookTo.getText(file) + '}).lookTo;', f.context);
  }
  const bytes = new Uint8Array(24), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x013e, true); view.setUint32(2, 123, true); view.setUint32(6, target ? 0 : 123, true);
  if (target) { view.setInt16(10, target[0], true); view.setInt16(12, target[1], true); }
  view.setUint16(14, 28, true); view.setUint32(20, 200, true);
  f.context.castSkillPacket = nativeMovementPacket(f, 'USESKILL_ACK', bytes);
  vm.runInContext('onEntityCastSkill(castSkillPacket);', f.context);
}

function receiveNativeSkillResult(f: ReturnType<typeof fixture>, skill = 28, result = 0) {
  f.context.CLASSIC = false; f.context.RENEWAL = true; f.context.PacketVerManager_default = { value: 20211103 };
  f.context.SkillConst_default = {}; f.context.DB.getMessage = () => 'skill failed';
  f.context.ChatBox_default = { TYPE: { ERROR: 0 }, FILTER: { SKILL_FAIL: 0 }, addText: vi.fn() };
  const bytes = new Uint8Array(14), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x0110, true); view.setUint16(2, skill, true);
  view.setUint8(12, result); view.setUint8(13, 1);
  const packet = nativeMovementPacket(f, 'ACK_TOUSESKILL', bytes) as Parameters<typeof f.functions.skillResult>[0];
  f.functions.skillResult(packet);
}

function receiveNativeDamageAction(f: ReturnType<typeof fixture>, count = 1, startTime = 10000) {
  const bytes = new Uint8Array(29), view = new DataView(bytes.buffer);
  view.setUint16(0, 0x8a, true); view.setUint32(2, 999, true); view.setUint32(6, 123, true);
  view.setUint32(10, startTime, true); view.setInt32(14, 150, true); view.setInt32(18, 300, true);
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
function controlFixture(source = patched) {
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

function moveRequest(dest: [number, number] = [12, 1]) {
  const buffer = new ArrayBuffer(5);
  return { dest, constructor: { name: 'PACKET_CZ_REQUEST_MOVE2' }, build: vi.fn(() => ({ buffer, view: new DataView(buffer) })) };
}

function display(f: ReturnType<typeof fixture>) {
  return Array.from(f.functions.visual(f.entity));
}

function expectSettledDisplay(f: ReturnType<typeof fixture>) {
  const shown = display(f), authority = Array.from(f.entity.position);
  const error = Math.hypot(shown[0]! - authority[0]!, shown[1]! - authority[1]!);
  expect(error).toBeLessThanOrEqual(0.125);
  expect(shown[2]).toBeCloseTo(shown[0]! + shown[1]!, 5);
  if (error > 0.00001) expect(f.entity._lastroMotion!.view.holdingMicroStop).toBe(true);
  const held = display(f); frame(f, f.Renderer.tick + 1000);
  expect(display(f)).toEqual(held);
  expect(Array.from(f.entity.position)).toEqual(authority);
}

function frame(f: ReturnType<typeof fixture>, now: number) {
  f.setNow(now);
  f.SessionStorage_default.serverTick = now;
  f.entity.walkProcess();
  return display(f);
}

function settle(f: ReturnType<typeof fixture>, from: number, until: number) {
  for (let now = from; now <= until; now += 25) frame(f, now);
}

describe('rendered movement reconciles without changing authoritative state', () => {
  it('applies a nearby MOVE origin immediately to authority while retaining the displayed position at receipt', () => {
    const f = fixture(); beginWalk(f);
    expect(frame(f, 10300)).toEqual([3, 1, 4]);
    const oldDisplay = display(f);
    f.functions.playerMove({ MoveData: [2, 1, 2, 1], moveStartTime: 10300 });
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    expect(display(f)).toEqual(oldDisplay);
    const midway = frame(f, 10325);
    expect(midway[0]).toBeLessThan(3); expect(midway[0]).toBeGreaterThan(2);
    settle(f, 10350, 10800);
    expectSettledDisplay(f);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
  });

  it.each([{ movement: [2, 2, 2, 10] }, { movement: [2, 1, 1, 1] }])('smooths a turn or behind correction $movement while the server route remains exact', ({ movement }) => {
    const f = fixture(); beginWalk(f); frame(f, 10300);
    const oldDisplay = display(f);
    f.functions.playerMove({ MoveData: [...movement], moveStartTime: 10300 });
    expect(Array.from(f.entity.position).slice(0, 2)).toEqual(movement.slice(0, 2));
    expect(display(f)).toEqual(oldDisplay);
    frame(f, 10325);
    expect(display(f)).not.toEqual(oldDisplay);
    settle(f, 10350, 12300);
    expect(Array.from(f.entity.position).slice(0, 2)).toEqual(movement.slice(2));
    expectSettledDisplay(f);
  });

  it('stops the authoritative route and cancels callbacks immediately while STOP converges visually', () => {
    const f = fixture(); beginWalk(f); frame(f, 10300);
    const oldDisplay = display(f), arrived = vi.fn();
    f.entity.walk.onEnd = arrived; f.entity.onWalkEnd = arrived;
    const epoch = f.entity._lastroMovementEpoch!;
    f.functions.stop({ AID: 123, xPos: 2, yPos: 1 });
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.onEnd).toBeNull();
    expect(f.entity.action).toBe(f.entity.ACTION.IDLE);
    expect(f.entity._lastroMovementEpoch).toBe(epoch + 1);
    expect(display(f)).toEqual(oldDisplay);
    settle(f, 10325, 10800);
    expectSettledDisplay(f); expect(arrived).not.toHaveBeenCalled();
  });

  it('retains the first correction deadline across repeated STOP packets', () => {
    const f = fixture(); beginWalk(f); frame(f, 10300);
    f.functions.stop({ AID: 123, xPos: 2, yPos: 1 });
    for (let now = 10325; now <= 10900; now += 25) {
      frame(f, now);
      f.functions.stop({ AID: 123, xPos: 2, yPos: 1 });
    }
    expectSettledDisplay(f);
    expect(f.entity.walk.total).toBe(0);
  });

  it('hard positions a JUMP and cancels pending speculative movement', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest()); frame(f, 10075);
    expect(display(f)[0]).toBeGreaterThan(1);
    f.functions.jump({ AID: 123, xPos: 2, yPos: 3 });
    expect(Array.from(f.entity.position)).toEqual([2, 3, 5]);
    expect(display(f)).toEqual([2, 3, 5]);
    expect(f.entity._lastroMotion!.pending).toBeNull();
  });

  it('hard positions a real FASTMOVE fallback and retains the native fast route when legal', () => {
    const f = fixture(); largerGat(f);
    f.functions.sendPacket(moveRequest()); frame(f, 10075);
    f.functions.fastMove(fastMovePacket(f, 50, 1));
    expect(Array.from(f.entity.position)).toEqual([50, 1, 51]);
    expect(display(f)).toEqual([50, 1, 51]);
    expect(f.entity._lastroMotion!.pending).toBeNull();
    f.functions.fastMove(fastMovePacket(f, 51, 1));
    expect(f.entity.walk.speed).toBe(10);
    expect(display(f)).toEqual(Array.from(f.entity.position));
    frame(f, 10085);
    expect(Array.from(f.entity.position)).toEqual([51, 1, 52]);
    expect(display(f)).toEqual([51, 1, 52]);
    expect(f.entity.walk.speed).toBe(150);
  });

  it('keeps large corrections and missing safe paths as immediate authoritative positioning', () => {
    const f = fixture(); beginWalk(f); frame(f, 10300);
    f.functions.stop({ AID: 123, xPos: 12, yPos: 1 });
    expect(display(f)).toEqual([12, 1, 13]);
    f.Altitude.getCellType.mockReturnValue(1);
    f.functions.stop({ AID: 123, xPos: 11, yPos: 1 });
    expect(display(f)).toEqual([11, 1, 12]);
  });
});

describe('late reliable native MOVE acknowledgements keep a confirmed forward render tail', () => {
  function awaiting(speed = 50, f = fixture()) {
    largerGat(f); f.entity.walk.speed = speed;
    sendNativeMove(f, [31, 1]);
    for (let now = 10016; now < 10600; now += 16) frame(f, now);
    f.setNow(10600); f.SessionStorage_default.serverTick = 10600;
    return f;
  }

  it.each([50, 25, 20])('retains the first display and bounds every subsequent frame after a 600ms ACK at %sms per cell', speed => {
    const f = awaiting(speed), before = display(f), arrived = vi.fn();
    f.entity.onWalkEnd = arrived;
    receiveNativeMove(f, [1, 1], [31, 1], 10000);
    expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(f.entity._lastroMotion!.approvedContinuation).not.toBeNull();
    expect(display(f)).toEqual(before);
    expect(f.entity.position[0]).toBeCloseTo(1 + 600 / speed);
    expect(f.entity.action).toBe(speed === 20 ? f.entity.ACTION.IDLE : f.entity.ACTION.WALK);
    expect(arrived).toHaveBeenCalledTimes(speed === 20 ? 1 : 0);
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.WALK);
    let previous = before, previousAuthority = f.entity.position[0]!;
    for (let now = 10616; now <= 12800; now += 16) {
      const shown = frame(f, now), nativeAdvance = f.entity.position[0]! - previousAuthority;
      expect(shown[0]! - previous[0]!, `confirmed frame ${now}`).toBeGreaterThanOrEqual(-0.00001);
      expect(shown[0]! - previous[0]!, `confirmed frame ${now}`)
        .toBeLessThanOrEqual(Math.max(0, nativeAdvance) + Math.min(0.45, 2 * 16 / speed) + 0.00002);
      expect(shown[1]).toBe(1); expect(shown[2]).toBeCloseTo(shown[0]! + 1, 5);
      previous = shown; previousAuthority = f.entity.position[0]!;
    }
    expect(Array.from(f.entity.position)).toEqual([31, 1, 32]);
    expect(Math.abs(display(f)[0]! - 31)).toBeLessThanOrEqual(0.125); expect(f.entity.walk.total).toBe(0);
    expect(arrived).toHaveBeenCalledOnce(); expect(f.socket.send).toHaveBeenCalledOnce();
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.IDLE);
  });

  it.each(['old', 'ambiguous', 'clock', 'expired', 'wrong-destination', 'different-route', 'wall', 'height', 'callback-epoch', 'callback-path', 'callback-skill'] as const)(
    'does not grant a forward tail for an unproved %s confirmation', reason => {
      const f = fixture(); largerGat(f); f.entity.walk.speed = reason.startsWith('callback') ? 20 : 50;
      if (reason === 'clock') f.SessionStorage_default.serverTick = 0;
      sendNativeMove(f, [31, 1]);
      if (reason === 'ambiguous') sendNativeMove(f, [31, 1]);
      for (let now = 10016; now < 10600; now += 16) frame(f, now);
      if (reason === 'wall') f.Altitude.cells[8 + 64] = 1;
      if (reason === 'height') f.Altitude.getCellHeight.mockImplementation((x, y) => x + y + 10);
      if (reason === 'callback-epoch') f.entity.onWalkEnd = () => { f.entity._lastroMovementEpoch!++; };
      if (reason === 'callback-path') f.entity.onWalkEnd = () => { f.entity.walk.path[2] = 999; };
      if (reason === 'callback-skill') f.entity.onWalkEnd = () => { sendNativeSkill(f); };
      if (reason === 'expired') frame(f, 11001);
      f.setNow(reason === 'expired' ? 11016 : 10600); f.SessionStorage_default.serverTick = reason === 'expired' ? 11016 : 10600;
      receiveNativeMove(f, reason === 'different-route' ? [2, 1] : [1, 1],
        reason === 'wrong-destination' ? [30, 1] : [31, 1], reason === 'old' ? 9999 : 10000);
      expect(f.entity._lastroMotion!.approvedContinuation).toBeNull();
      expect(f.socket.send).toHaveBeenCalledTimes(reason === 'ambiguous' || reason === 'callback-skill' ? 2 : 1);
    },
  );

  it.each(['parallel', 'lateral'] as const)('checks the actual %s inherited residual against the approved route before granting a long tail', residual => {
    const f = fixture(); largerGat(f); f.entity.walk.speed = 50;
    receiveNativeMove(f, [1, 1], residual === 'parallel' ? [31, 1] : [31, 31], 10000);
    frame(f, residual === 'parallel' ? 10105 : 10143); sendNativeSkill(f);
    const held = display(f), stopY = residual === 'parallel' ? 1 : 3;
    receiveNativeStop(f, 3, stopY); expect(display(f)).toEqual(held);
    f.setNow(10400); f.SessionStorage_default.serverTick = 10400; sendNativeMove(f, [31, stopY]);
    expect(f.entity._lastroMotion!.pending).not.toBeNull();
    for (let now = 10416; now < 11000; now += 16) frame(f, now);
    f.setNow(11000); f.SessionStorage_default.serverTick = 11000;
    const before = display(f); receiveNativeMove(f, [3, stopY], [31, stopY], 10400);
    if (residual === 'parallel') {
      expect(f.entity._lastroMotion!.approvedContinuation).not.toBeNull();
      expect(display(f)).toEqual(before); expect(frame(f, 11016)[0]! - before[0]!).toBeLessThanOrEqual(0.77 + 0.00002);
    } else expect(f.entity._lastroMotion!.approvedContinuation).toBeNull();
    expect(f.socket.send).toHaveBeenCalledTimes(2);
  });

  it('recognizes an already completed native ACK before a second initial move without fencing that request', () => {
    const f = awaiting(20); receiveNativeMove(f, [1, 1], [31, 1], 10000);
    expect(f.entity.walk.total).toBe(0); expect(f.entity._lastroMotion!.ackOutstanding).toBe(false);
    expect(f.entity._lastroMotion!.latency).toMatchObject({ count: 1, mean: 600 });
    settle(f, 10616, 12800); expect(f.entity._lastroMotion!.approvedContinuation).toBeNull();
    f.setNow(13000); f.SessionStorage_default.serverTick = 13000; sendNativeMove(f, [61, 1]);
    expect(f.entity._lastroMotion!.pending!.ackAmbiguous).toBe(false); expect(f.entity._lastroMotion!.ackFenced).toBe(false);
    for (let now = 13016; now < 13600; now += 16) frame(f, now);
    f.setNow(13600); f.SessionStorage_default.serverTick = 13600;
    const before = display(f); receiveNativeMove(f, [31, 1], [61, 1], 13000);
    expect(display(f)).toEqual(before); expect(f.entity._lastroMotion!.approvedContinuation).not.toBeNull();
    expect(f.entity._lastroMotion!.ackOutstanding).toBe(false); expect(Array.from(f.entity.position)).toEqual([61, 1, 62]);
    expect(f.entity._lastroMotion!.latency).toMatchObject({ count: 2, mean: 600 });
    expect(f.socket.send).toHaveBeenCalledTimes(2);
  });

  it('acknowledges a fully proved native arrival even when a lateral display residual rejects the long render tail', () => {
    const f = fixture(); largerGat(f); f.entity.walk.speed = 20;
    receiveNativeMove(f, [1, 1], [31, 31], 10000);
    frame(f, 10057); sendNativeSkill(f); receiveNativeStop(f, 3, 3);
    f.setNow(10400); f.SessionStorage_default.serverTick = 10400; sendNativeMove(f, [31, 3]);
    expect(Math.abs(f.entity._lastroMotion!.pending!.offsetY)).toBeGreaterThan(1 / 1024);
    for (let now = 10416; now < 11000; now += 16) frame(f, now);
    f.setNow(11000); f.SessionStorage_default.serverTick = 11000; receiveNativeMove(f, [3, 3], [31, 3], 10400);
    expect(f.entity._lastroMotion!.approvedContinuation).toBeNull();
    expect(Array.from(f.entity.position)).toEqual([31, 3, 34]);
    expect(f.entity._lastroMotion!.ackOutstanding).toBe(false);
    expect(f.entity._lastroMotion!.latency).toMatchObject({ count: 1, mean: 600 });
    settle(f, 11016, 11900); f.setNow(12000); f.SessionStorage_default.serverTick = 12000;
    sendNativeMove(f, [61, 3]);
    expect(f.entity._lastroMotion!.pending!.ackAmbiguous).toBe(false);
    expect(f.entity._lastroMotion!.ackFenced).toBe(false); expect(f.socket.send).toHaveBeenCalledTimes(3);
  });

  it.each(['hit', 'stop', 'new-request', 'new-move', 'control', 'skill', 'speed'] as const)(
    'revokes the previous route permission on %s without flashing ahead to its distant authority', reason => {
      const controlled = reason === 'control' ? controlFixture() : null;
      const f = awaiting(50, controlled || fixture()), before = display(f); receiveNativeMove(f, [1, 1], [31, 1], 10000);
      expect(display(f)).toEqual(before); expect(f.entity._lastroMotion!.approvedContinuation).not.toBeNull();
      if (reason === 'hit') receiveNativeDamageAction(f);
      else if (reason === 'stop') receiveNativeStop(f, 13, 1);
      else if (reason === 'new-request') sendNativeMove(f, [31, 2]);
      else if (reason === 'new-move') receiveNativeMove(f, [13, 1], [31, 1], 10600);
      else if (reason === 'control') controlled!.state(statusConstants.states.BodyState.STUN!);
      else if (reason === 'skill') sendNativeSkill(f);
      else f.functions.parameter({ varID: 0, amount: 75 });
      const after = display(f);
      expect(f.entity._lastroMotion!.approvedContinuation).toBeNull();
      expect(Math.hypot(after[0]! - before[0]!, after[1]! - before[1]!)).toBeLessThanOrEqual(0.45 + 0.00002);
      const next = frame(f, 10616);
      expect(Math.hypot(next[0]! - after[0]!, next[1]! - after[1]!))
        .toBeLessThanOrEqual(16 / f.entity.walk.speed + Math.min(0.45, 2 * 16 / f.entity.walk.speed) + 0.00002);
    },
  );

  it.each(['jump', 'map'] as const)('clears the confirmed route tail on a true %s relocation', reason => {
    const f = awaiting(); receiveNativeMove(f, [1, 1], [31, 1], 10000);
    if (reason === 'jump') f.functions.jump({ AID: 123, xPos: 40, yPos: 1 });
    else f.functions.mapEntry(f.entity, { xPos: 40, yPos: 1 }, 123);
    expect(f.entity._lastroMotion!.approvedContinuation).toBeNull();
    expect(display(f)).toEqual([40, 1, 41]);
  });
});

describe('session-only prediction budgets use unambiguous native MOVE acknowledgements', () => {
  function trial(f: ReturnType<typeof fixture>, sent: number, elapsed: number, dest: [number, number], serverStart = sent) {
    f.setNow(sent); f.SessionStorage_default.serverTick = serverStart;
    const from: [number, number] = [f.entity.position[0]!, f.entity.position[1]!];
    sendNativeMove(f, dest);
    const pending = f.entity._lastroMotion!.pending;
    expect(pending).not.toBeNull();
    f.setNow(sent + elapsed); f.SessionStorage_default.serverTick = (serverStart + elapsed) >>> 0;
    receiveNativeMove(f, from, dest, serverStart);
    expect(f.entity._lastroMotion!.pending).toBeNull();
    settle(f, sent + elapsed + 16, sent + 2400);
    expect(Array.from(f.entity.position).slice(0, 2)).toEqual(dest);
    return pending!;
  }

  it('keeps conservative defaults for one sample, reduces low-latency ahead and bounds a latency burst to two cells', () => {
    const f = fixture();
    const first = trial(f, 10000, 40, [12, 1]);
    expect(first.limitTick - 10000).toBe(250); expect(first.deadline - 10000).toBe(1000);
    const second = trial(f, 12500, 40, [1, 1]);
    expect(second.limitTick - 12500).toBe(250);
    expect(f.entity._lastroMotion!.latency).toMatchObject({ count: 2, mean: 40, deviation: 0 });
    const third = trial(f, 15000, 1200, [12, 1]);
    expect(third.limitTick - 15000).toBe(80); expect(third.deadline - 15000).toBe(1000);
    f.setNow(17500); f.SessionStorage_default.serverTick = 17500; sendNativeMove(f, [1, 1]);
    const burst = f.entity._lastroMotion!.pending!;
    expect(burst.deadline - 17500).toBe(1500);
    expect(burst.limitTick - 17500).toBeGreaterThan(250);
    expect(burst.limitTick - 17500).toBeLessThanOrEqual(600);
    const origin = Array.from(f.entity.position);
    const shown = frame(f, 18100);
    expect(Math.hypot(shown[0]! - origin[0]!, shown[1]! - origin[1]!)).toBeLessThanOrEqual(2.000001);
    expect(f.socket.send).toHaveBeenCalledTimes(4);
  });

  it('learns actual monotonic receipt delay across uint32 server tick wrap without using TIME RTT', () => {
    const f = fixture(); f.SessionStorage_default.ping.pingTime = 9000;
    trial(f, 10000, 40, [12, 1], 0xfffffff0);
    trial(f, 12500, 40, [1, 1], 80);
    expect(f.entity._lastroMotion!.latency).toMatchObject({ count: 2, mean: 40 });
    f.setNow(15000); f.SessionStorage_default.serverTick = 200; sendNativeMove(f, [12, 1]);
    expect(f.entity._lastroMotion!.pending!.limitTick - 15000).toBe(80);
  });

  it.each(['wrong-goal', 'old-tick', 'zero-clock', 'control'] as const)('does not train a %s acknowledgement', reason => {
    const f = controlFixture();
    if (reason === 'zero-clock') f.SessionStorage_default.serverTick = 0;
    sendNativeMove(f, [12, 1]);
    f.setNow(10040); f.SessionStorage_default.serverTick = 10040;
    if (reason === 'control') f.state(statusConstants.states.BodyState.STUN!);
    receiveNativeMove(f, [1, 1], reason === 'wrong-goal' ? [11, 1] : [12, 1], reason === 'old-tick' ? 9999 : 10000);
    expect(f.entity._lastroMotion!.latency).toBeNull();
  });

  it.each(['expired', 'skill-retire', 'hit-retire'] as const)(
    'retains the learning fence after %s when an old same-goal request starts after the retry', reason => {
      const f = fixture(); sendNativeMove(f, [12, 1]); frame(f, 10040);
      if (reason === 'expired') frame(f, 11001);
      else if (reason === 'skill-retire') sendNativeSkill(f);
      else receiveNativeDamageAction(f);
      settle(f, 11025, 12025); f.flush(12025);
      f.entity.setAction({ action: f.entity.ACTION.IDLE! });
      f.setNow(12100); f.SessionStorage_default.serverTick = 12100;
      sendNativeMove(f, [12, 1]);
      expect(f.entity._lastroMotion!.pending!.ackAmbiguous).toBe(true);
      f.setNow(12140); f.SessionStorage_default.serverTick = 12140;
      receiveNativeMove(f, [1, 1], [12, 1], 12101);
      expect(f.entity._lastroMotion!.latency).toBeNull();
      expect(f.entity._lastroMotion!.ackFenced).toBe(true);
      settle(f, 12156, 14500);
      f.setNow(14600); f.SessionStorage_default.serverTick = 14600; sendNativeMove(f, [12, 1]);
      // The first ambiguous ACK cannot prove the second request was drained.
      // A further old same-goal ACK must also be unable to train the third send.
      f.setNow(14640); f.SessionStorage_default.serverTick = 14640;
      receiveNativeMove(f, [12, 1], [12, 1], 14601);
      expect(f.entity._lastroMotion!.latency).toBeNull();
      expect(f.socket.send).toHaveBeenCalledTimes(reason === 'skill-retire' ? 4 : 3);
    },
  );

  it('fences a send made on an active approved route even when it creates no displayed prediction', () => {
    const f = fixture(); beginWalk(f); frame(f, 10100); sendNativeMove(f, [12, 1]);
    expect(f.entity._lastroMotion!.pending).toBeNull();
    settle(f, 10116, 12500); f.setNow(12600); f.SessionStorage_default.serverTick = 12600;
    sendNativeMove(f, [1, 1]);
    expect(f.entity._lastroMotion!.ackFenced).toBe(true);
    f.setNow(12640); f.SessionStorage_default.serverTick = 12640; receiveNativeMove(f, [12, 1], [1, 1], 12601);
    expect(f.entity._lastroMotion!.latency).toBeNull();
  });

  it('remembers an actual request refused by wall prediction before a later initial click', () => {
    const f = fixture(); f.cells[2 + 24] = 1; sendNativeMove(f, [12, 1]);
    expect(f.entity._lastroMotion!.pending).toBeNull(); expect(f.entity._lastroMotion!.ackOutstanding).toBe(true);
    f.cells[2 + 24] = 10; f.setNow(10050); f.SessionStorage_default.serverTick = 10050; sendNativeMove(f, [12, 1]);
    expect(f.entity._lastroMotion!.pending!.ackAmbiguous).toBe(true);
    f.setNow(10090); f.SessionStorage_default.serverTick = 10090; receiveNativeMove(f, [1, 1], [12, 1], 10051);
    expect(f.entity._lastroMotion!.latency).toBeNull(); expect(f.socket.send).toHaveBeenCalledTimes(2);
  });

  it('does not reuse an already learned server tick as a fresh same-goal sample after relocation', () => {
    const f = fixture(); trial(f, 10000, 40, [12, 1]);
    f.functions.jump({ AID: 123, xPos: 1, yPos: 1 });
    f.setNow(12500); f.SessionStorage_default.serverTick = 10000; sendNativeMove(f, [12, 1]);
    f.setNow(12540); f.SessionStorage_default.serverTick = 10040; receiveNativeMove(f, [1, 1], [12, 1], 10000);
    expect(f.entity._lastroMotion!.latency!.count).toBe(1);
    expect(f.entity._lastroMotion!.ackOutstanding).toBe(true);
  });

  it.each(['same-socket', 'new-socket'] as const)('clears learning and unconfirmed identity on same-map zone acceptance with a %s', connection => {
    const f = fixture(); trial(f, 10000, 40, [12, 1]); trial(f, 12500, 40, [1, 1]);
    f.setNow(15000); f.SessionStorage_default.serverTick = 15000; sendNativeMove(f, [12, 1]); sendNativeMove(f, [12, 1]);
    const entity = f.entity, position = entity.position;
    expect(entity._lastroMotion!.ackFenced).toBe(true);
    if (connection === 'new-socket') f.context._socket = { ...f.socket, send: vi.fn() };
    f.context.PacketVerManager_default = { value: 20190101 };
    f.context.BasicInfoController = { getUI: () => ({ update: vi.fn() }) };
    f.entity.display = { name: 'synthetic player' }; f.context._mapName = 'prontera';
    f.functions.accepted({ PosDir: [1, 1, 0] });
    expect(f.MapRenderer.loading).toBe(false); expect(f.SessionStorage_default.Entity).toBe(entity);
    expect(entity.position).toBe(position); expect(Array.from(position)).toEqual([1, 1, 2]);
    expect(entity._lastroMotion!.latency).toBeNull(); expect(entity._lastroMotion!.ackFenced).toBe(false);
    expect(entity._lastroMotion!.ackOutstanding).toBe(false); expect(entity._lastroMotion!.pending).toBeNull();
    f.functions.mapEntry(entity, { xPos: 1, yPos: 1 }, 123);
    expect(entity.position).toBe(position); expect(display(f)).toEqual([1, 1, 2]);
    sendNativeMove(f, [12, 1]); expect(entity._lastroMotion!.pending!.limitTick - 15000).toBe(250);
  });

  it('clears metadata on a same-map entry that reuses the entity and position but keeps relocation from clearing a learning fence', () => {
    const f = fixture(); sendNativeMove(f, [12, 1]); sendNativeMove(f, [12, 1]);
    expect(f.entity._lastroMotion!.ackFenced).toBe(true);
    f.functions.jump({ AID: 123, xPos: 2, yPos: 1 });
    expect(f.entity._lastroMotion!.ackFenced).toBe(true);
    expect(display(f)).toEqual([2, 1, 3]);
    const position = f.entity.position;
    f.functions.mapEntry(f.entity, { xPos: 3, yPos: 1 }, 123);
    expect(f.entity.position).toBe(position); expect(display(f)).toEqual([3, 1, 4]);
    expect(f.entity._lastroMotion!.ackFenced).toBe(false); expect(f.entity._lastroMotion!.ackOutstanding).toBe(false);
  });
});

describe('prediction hands off valid small render residuals and late native hits safely', () => {
  it.each(['skill', 'micro'] as const)('starts a new native click from a verified %s residual without moving authority or the first rendered sample', kind => {
    const f = fixture(); beginWalk(f);
    if (kind === 'skill') { frame(f, 10115); sendNativeSkill(f); }
    const shown = frame(f, kind === 'skill' ? 10195 : 10165);
    receiveNativeStop(f, 2, 1);
    expect(display(f)).toEqual(shown);
    expect(kind === 'skill' ? f.entity._lastroMotion!.view.holdingStop : f.entity._lastroMotion!.view.holdingMicroStop).toBe(true);
    f.setNow(10400); f.SessionStorage_default.serverTick = 10400; sendNativeMove(f, [12, 1]);
    expect(display(f)).toEqual(shown);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    const pending = f.entity._lastroMotion!.pending!;
    expect(pending.route.segments[0]).toMatchObject({ x0: 2, y0: 1 });
    expect(pending.offsetX).toBeCloseTo(shown[0]! - 2);
    const next = frame(f, 10416);
    expect(next[0]).toBeGreaterThan(shown[0]!); expect(next[0]! - shown[0]!).toBeLessThan(0.2);
    const end = frame(f, 10700);
    expect(Math.hypot(end[0]! - 2, end[1]! - 1)).toBeLessThanOrEqual(2.000001);
    expect(f.socket.send).toHaveBeenCalledTimes(kind === 'skill' ? 2 : 1);
  });

  it('releases a pre-existing ordinary micro hold after a successful skill request and failed send', () => {
    for (const failed of [false, true]) {
      const f = fixture(); beginWalk(f); frame(f, 10165); receiveNativeStop(f, 2, 1);
      expect(f.entity._lastroMotion!.view.holdingMicroStop).toBe(true);
      if (failed) {
        f.socket.send.mockImplementation(() => { throw new Error('socket closed'); });
        expect(() => sendNativeSkill(f)).toThrow('socket closed');
      } else sendNativeSkill(f);
      expect(f.entity._lastroMotion!.view.holdingMicroStop).toBe(false);
      settle(f, 10181, 11100); expect(display(f)).toEqual([2, 1, 3]);
    }
  });

  it('preserves a diagonal skill residual beside a blocked corner and waits for the actual server route', () => {
    const f = fixture(); f.functions.playerMove({ MoveData: [1, 1, 12, 12], moveStartTime: 10000 });
    frame(f, 10193); sendNativeSkill(f); const shown = frame(f, 10273); receiveNativeStop(f, 2, 2);
    expect(f.entity._lastroMotion!.view.holdingStop).toBe(true);
    f.cells[3 + 2 * 24] = 1;
    f.setNow(10500); f.SessionStorage_default.serverTick = 10500; sendNativeMove(f, [5, 5]);
    expect(f.entity._lastroMotion!.pending).toBeNull(); expect(display(f)).toEqual(shown);
    expect(Array.from(f.entity.position)).toEqual([2, 2, 4]);
    expect(f.socket.send).toHaveBeenCalledTimes(2);
    receiveNativeMove(f, [2, 2], [5, 5], 10500);
    let previous = shown;
    for (let now = 10516; now <= 11800; now += 16) {
      const current = frame(f, now);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThan(0.5);
      expect(f.cells[Math.round(current[0]!) + Math.round(current[1]!) * 24]! & 2).toBe(2);
      previous = current;
    }
    expect(Array.from(f.entity.position)).toEqual([5, 5, 10]);
    expectSettledDisplay(f);
  });

  it('validates the actual fractional prediction segment again if a diagonal neighboring cell becomes blocked', () => {
    const f = fixture(); f.functions.playerMove({ MoveData: [1, 1, 12, 12], moveStartTime: 10000 });
    frame(f, 10193); sendNativeSkill(f); const shown = frame(f, 10273); receiveNativeStop(f, 2, 2);
    f.setNow(10500); f.SessionStorage_default.serverTick = 10500; sendNativeMove(f, [5, 1]);
    expect(f.entity._lastroMotion!.pending).not.toBeNull(); expect(display(f)).toEqual(shown);
    f.cells[3 + 2 * 24] = 1;
    const after = frame(f, 10600);
    expect(f.entity._lastroMotion!.pending!.expired).toBe(true);
    expect(f.cells[Math.round(after[0]!) + Math.round(after[1]!) * 24]! & 2).toBe(2);
    expect(Math.hypot(after[0]! - shown[0]!, after[1]! - shown[1]!)).toBeLessThanOrEqual(0.45);
    expect(Array.from(f.entity.position)).toEqual([2, 2, 4]);
    expect(f.socket.send).toHaveBeenCalledTimes(2);
  });

  it('uses only the remaining duration of a delayed native hit plus a short timing margin', () => {
    const f = fixture(); f.setNow(10400); f.SessionStorage_default.serverTick = 10400;
    receiveNativeDamageAction(f);
    expect(f.entity._lastroMotion!.predictionBlockedUntil).toBe(10530);
    f.flush(10540); f.entity.setAction({ action: f.entity.ACTION.IDLE! });
    sendNativeMove(f, [12, 1]); expect(f.entity._lastroMotion!.pending).not.toBeNull();
  });

  it.each([{ name: 'zero clock', clock: 0, start: 10000 }, { name: 'future timestamp', clock: 10000, start: 11000 },
    { name: 'too old timestamp', clock: 10000, start: 4000 }])(
    'keeps the conservative full hit guard for a $name', ({ clock, start }) => {
      const f = fixture(); f.SessionStorage_default.serverTick = clock; receiveNativeDamageAction(f, 1, start);
      expect(f.entity._lastroMotion!.predictionBlockedUntil).toBe(10450);
      expect(f.entity._lastroMotion!.view.holdingMicroStop).toBe(false);
    },
  );

  it('keeps missing-timestamp hits conservative and releases both kinds of retained residual', () => {
    const f = fixture(); beginWalk(f); frame(f, 10165); receiveNativeStop(f, 2, 1);
    f.functions.hit(normalHit, f.entity);
    expect(f.entity._lastroMotion!.predictionBlockedUntil).toBe(10615);
    expect(f.entity._lastroMotion!.view.holdingMicroStop).toBe(false);
    settle(f, 10181, 11100); expect(display(f)).toEqual([2, 1, 3]);
  });
});

describe('local route fitting for decoded authoritative movement', () => {
  it('retains a seven-cell ahead display on a fresh MOVE and fits its phase while authority stays exact', () => {
    const f = fixture(); beginWalk(f);
    const before = frame(f, 11050);
    expect(before).toEqual([8, 1, 9]);
    receiveNativeMove(f, [1, 1], [12, 1], 11050);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
    expect(display(f)).toEqual(before);
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    let previous = before;
    for (let now = 11066; now <= 13258; now += 16) {
      const shown = frame(f, now);
      expect(shown[0]!).toBeGreaterThanOrEqual(previous[0]! - 0.000001);
      expect(Math.hypot(shown[0]! - previous[0]!, shown[1]! - previous[1]!)).toBeLessThanOrEqual(0.45 + 0.000001);
      expect(shown[1]).toBe(1); expect(shown[2]).toBeCloseTo(shown[0]! + 1, 5);
      if (now < 12700) expect(arrived).not.toHaveBeenCalled();
      previous = shown;
    }
    expect(display(f)).toEqual([12, 1, 13]);
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]);
    expect(arrived).toHaveBeenCalledOnce();
  });

  it('fits an adjacent server route with fractional display positions across a render gap', () => {
    const f = fixture(); beginWalk(f);
    const before = frame(f, 11050);
    receiveNativeMove(f, [2, 2], [12, 2], 11050);
    expect(Array.from(f.entity.position)).toEqual([2, 2, 4]);
    expect(display(f)).toEqual(before);
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    let previous = before, fractional = false, previousAuthority = Array.from(f.entity.position);
    for (const now of [11350, ...Array.from({ length: 150 }, (_, index) => 11366 + index * 16)]) {
      const shown = frame(f, now);
      const nativeAdvance = Math.hypot(f.entity.position[0]! - previousAuthority[0]!, f.entity.position[1]! - previousAuthority[1]!);
      expect(Math.hypot(shown[0]! - previous[0]!, shown[1]! - previous[1]!)).toBeLessThanOrEqual(nativeAdvance + 0.45 + 0.000001);
      expect(shown[1]!).toBeGreaterThanOrEqual(1 - 0.000001);
      expect(shown[1]!).toBeLessThanOrEqual(2 + 0.000001);
      expect(shown[2]).toBeCloseTo(shown[0]! + shown[1]!, 5);
      expect(f.cells[Math.round(shown[0]!) + Math.round(shown[1]!) * 24]! & 2).toBe(2);
      if (shown[1]! > 1.0001 && shown[1]! < 1.9999) fractional = true;
      if (now < 12550) expect(arrived).not.toHaveBeenCalled();
      previous = shown; previousAuthority = Array.from(f.entity.position);
    }
    expect(fractional).toBe(true);
    expectSettledDisplay(f);
    expect(Array.from(f.entity.position)).toEqual([12, 2, 14]);
    expect(arrived).toHaveBeenCalledOnce();
  });

  it('bounds a decoded hit STOP at low frame rates and after a pause without reviving the route', () => {
    const f = fixture(); beginWalk(f);
    const before = frame(f, 10750), cancelledArrival = vi.fn();
    f.entity.walk.onEnd = cancelledArrival;
    receiveNativeDamageAction(f); receiveNativeStop(f, 1, 1);
    expect(display(f)).toEqual(before);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
    let previous = before;
    for (const now of [10800, 11000, 12000, ...Array.from({ length: 120 }, (_, index) => 12016 + index * 16)]) {
      const shown = frame(f, now);
      expect(Math.hypot(shown[0]! - previous[0]!, shown[1]! - previous[1]!)).toBeLessThanOrEqual(0.45 + 0.000001);
      expect(shown[0]!).toBeGreaterThanOrEqual(1); expect(shown[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
      expect(shown[1]).toBe(1); expect(f.entity.walk.total).toBe(0);
      expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
      previous = shown;
    }
    expect(display(f)).toEqual([1, 1, 2]);
    expect(cancelledArrival).not.toHaveBeenCalled();
  });
});

describe('sent movement has a bounded render-only prediction', () => {
  it('predicts only after native network send without mutating position, route, or arrival callbacks', () => {
    const f = fixture(), arrived = vi.fn();
    f.entity.walk.onEnd = arrived; f.entity.onWalkEnd = arrived;
    const position = Array.from(f.entity.position), path = Array.from(f.entity.walk.path);
    const total = f.entity.walk.total, epoch = f.entity._lastroMovementEpoch, action = f.entity.action;
    const packet = moveRequest(); f.functions.sendPacket(packet);
    expect(packet.build).toHaveBeenCalledOnce(); expect(f.socket.send).toHaveBeenCalledOnce();
    expect(display(f)).toEqual(position);
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.WALK);
    frame(f, 10075);
    expect(display(f)).toEqual([1.5, 1, 2.5]);
    expect(f.functions.visualDistance(f.entity)).toBeCloseTo(0.5);
    expect(Array.from(f.entity.position)).toEqual(position);
    expect(Array.from(f.entity.walk.path)).toEqual(path);
    expect(f.entity.walk.total).toBe(total); expect(f.entity.walk.onEnd).toBe(arrived);
    expect(f.entity._lastroMovementEpoch).toBe(epoch); expect(f.entity.action).toBe(action);
    expect(arrived).not.toHaveBeenCalled();
  });

  it.each([150, 50])('caps speed %sms predictions at 250ms and two cells, then holds while waiting for an acknowledgement', speed => {
    const f = fixture(); f.entity.walk.speed = speed;
    f.functions.sendPacket(moveRequest());
    const pending = f.entity._lastroMotion!.pending!;
    expect(pending.deadline).toBe(11000); expect(pending.limitTick).toBeLessThanOrEqual(10250);
    for (let now = 10025; now <= 10250; now += 25) {
      frame(f, now);
      f.functions.sendPacket(moveRequest([12, 2]));
      expect(f.entity._lastroMotion!.pending).toBe(pending);
      expect(Math.hypot(display(f)[0]! - 1, display(f)[1]! - 1)).toBeLessThanOrEqual(2.000001);
    }
    expect(f.functions.visualDistance(f.entity)).toBeLessThanOrEqual(2.000001);
    const peak = display(f);
    for (let now = 10275; now <= 11000; now += 25) {
      expect(frame(f, now)).toEqual(peak);
      f.functions.sendPacket(moveRequest([12, 2]));
      expect(f.entity._lastroMotion!.pending).toBe(pending);
      expect(pending.expired).toBe(false); expect(pending.deadline).toBe(11000);
      expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.IDLE);
    }
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]); expect(f.entity.walk.total).toBe(0);
  });

  it('expires an unanswered request after its acknowledgement wait and permits a later sent request to predict again', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest());
    const pending = f.entity._lastroMotion!.pending!;
    frame(f, 10250); const peak = display(f);
    settle(f, 10275, 11000);
    f.functions.sendPacket(moveRequest([12, 2]));
    expect(pending.deadline).toBe(11000); expect(pending.expired).toBe(false);
    expect(display(f)).toEqual(peak);
    frame(f, 11025);
    expect(f.entity._lastroMotion!.pending).toBe(pending); expect(pending.expired).toBe(true);
    settle(f, 11050, 11800);
    expect(display(f)).toEqual([1, 1, 2]);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]); expect(f.entity.walk.total).toBe(0);
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.IDLE);
    f.functions.sendPacket(moveRequest());
    const retry = f.entity._lastroMotion!.pending!;
    expect(retry).not.toBe(pending); expect(retry.expired).toBe(false);
    expect(retry.deadline).toBe(12800); expect(retry.limitTick).toBeLessThanOrEqual(12050);
    expect(frame(f, 11875)).toEqual([1.5, 1, 2.5]);
  });

  it('holds the initial prediction cap until a 500ms MOVE arrives without pulling back to the old authority', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest());
    const pending = f.entity._lastroMotion!.pending!;
    let previous = display(f), received = false;
    for (let now = 10016; now <= 11440; now += 16) {
      if (!received && now >= 10500) {
        f.setNow(10500); f.SessionStorage_default.serverTick = 10500;
        expect(display(f)[0]).toBeCloseTo(1 + 250 / 150, 5);
        f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10000 });
        expect(f.entity._lastroMotion!.pending).toBeNull();
        received = true;
      }
      const shown = frame(f, now);
      expect(shown[0]! - previous[0]!, `delayed acknowledgement frame ${now}`).toBeGreaterThanOrEqual(-0.000001);
      if (!received) {
        expect(Math.hypot(shown[0]! - 1, shown[1]! - 1)).toBeLessThanOrEqual(2.000001);
        expect(pending.expired).toBe(false);
        if (now > pending.limitTick) {
          expect(shown[0]).toBeCloseTo(1 + 250 / 150, 5);
          expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.IDLE);
        }
      }
      previous = shown;
    }
    expect(display(f)[0]).toBeCloseTo(1 + 1440 / 150, 4);
    expect(Array.from(f.entity.position)[0]).toBeCloseTo(1 + 1440 / 150, 4);
  });

  it.each(['missing', 'closed', 'handoff', 'throw'] as const)('does not start prediction when native sending is %s', state => {
    const f = fixture(), packet = moveRequest();
    if (state === 'missing') f.context._socket = null;
    if (state === 'closed') f.socket.connected = false;
    if (state === 'handoff') f.socket.handoffPending = true;
    if (state === 'throw') f.socket.send.mockImplementation(() => { throw new Error('send failed'); });
    if (state === 'throw') expect(() => f.functions.sendPacket(packet)).toThrow('send failed');
    else f.functions.sendPacket(packet);
    frame(f, 10075);
    expect(display(f)).toEqual([1, 1, 2]);
    expect(f.entity._lastroMotion?.pending ?? null).toBeNull();
    expect(f.entity.walk.total).toBe(0);
  });

  it('confirms authority without erasing the current predicted display or advancing native callbacks early', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest()); frame(f, 10075);
    const predicted = display(f);
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10075 });
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
    expect(display(f)).toEqual(predicted);
    expect(f.entity._lastroMotion!.pending).toBeNull();
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    settle(f, 10100, 10600);
    expect(arrived).not.toHaveBeenCalled();
    expect(f.entity.walk.total).toBeGreaterThan(0);
    settle(f, 10625, 12100);
    expect(Array.from(f.entity.position)).toEqual([12, 1, 13]);
    expect(display(f)).toEqual([12, 1, 13]); expect(arrived).toHaveBeenCalledOnce();
  });

  it('stops the predicted walk animation at a short destination and preserves elevation offset', () => {
    const f = fixture(); f.entity.position[2] = 7;
    f.functions.sendPacket(moveRequest([2, 1]));
    frame(f, 10075);
    expect(display(f)).toEqual([1.5, 1, 7.5]);
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.WALK);
    frame(f, 10150);
    expect(display(f)).toEqual([2, 1, 8]);
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.ACTION.IDLE);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 7]);
  });

  it('authoritative STOP reclaims a pending request regardless of its send clock', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest()); frame(f, 10075);
    const shown = display(f), arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    f.functions.stop({ AID: 123, xPos: 1, yPos: 1 });
    expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(display(f)).toEqual(shown);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.onEnd).toBeNull();
    settle(f, 10100, 10700);
    expect(display(f)).toEqual([1, 1, 2]); expect(arrived).not.toHaveBeenCalled();
  });

  it('rejects old MOVE without changing the active approved route or displayed movement', () => {
    const f = fixture(); beginWalk(f); frame(f, 10075);
    f.functions.sendPacket(moveRequest([1, 12]));
    const pending = f.entity._lastroMotion!.pending, epoch = f.entity._lastroMovementEpoch;
    expect(pending).toBeNull();
    const position = Array.from(f.entity.position), shown = display(f);
    f.functions.playerMove({ MoveData: [8, 8, 12, 8], moveStartTime: 9999 });
    expect(f.entity._lastroMotion!.pending).toBe(pending);
    expect(f.entity._lastroMovementEpoch).toBe(epoch);
    expect(Array.from(f.entity.position)).toEqual(position); expect(display(f)).toEqual(shown);
  });

  it('keeps a newer pending request when an in-flight MOVE has a start tick before that request', () => {
    const f = fixture(); beginWalk(f); frame(f, 10300);
    f.functions.stop({ AID: 123, xPos: 3, yPos: 1 });
    f.functions.sendPacket(moveRequest([1, 12]));
    const pending = f.entity._lastroMotion!.pending;
    expect(pending).not.toBeNull();
    // This is newer than the last confirmed route, but predates the request:
    // it must not be mistaken for confirmation of the new click destination.
    f.functions.playerMove({ MoveData: [2, 1, 12, 1], moveStartTime: 10200 });
    expect(f.entity._lastroMotion!.pending).toBe(pending);
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it('compares send and MOVE clocks across the unsigned server tick wrap', () => {
    const f = fixture(); f.SessionStorage_default.serverTick = 0xfffffff0;
    f.functions.sendPacket(moveRequest());
    const pending = f.entity._lastroMotion!.pending;
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 0xffffffe0 });
    expect(f.entity._lastroMotion!.pending).toBe(pending);
    f.SessionStorage_default.serverTick = 5;
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 5 });
    expect(f.entity._lastroMotion!.pending).toBeNull();
  });

  it('uses 1.4 diagonal timing in both native approved route and prediction', () => {
    const f = fixture(); f.entity.walk.speed = 151;
    f.functions.sendPacket(moveRequest([6, 6]));
    frame(f, 10105.5);
    expect(display(f)[0]).toBeCloseTo(1.5); expect(display(f)[1]).toBeCloseTo(1.5);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
    f.functions.playerMove({ MoveData: [1, 1, 6, 6], moveStartTime: 10105 });
    frame(f, 10316);
    expect(Array.from(f.entity.position).slice(0, 2)).toEqual([2, 2]);
  });

  it('applies a native speed update from the next cell while the scheduled current step retains its duration', () => {
    const f = fixture(); beginWalk(f); frame(f, 10100);
    expect(f.entity.position[0]).toBeCloseTo(1 + 100 / 150);
    f.functions.parameter({ varID: 0, amount: 75 });
    expect(f.entity.walk.speed).toBe(75);
    frame(f, 10125);
    expect(f.entity.position[0]).toBeCloseTo(1 + 125 / 150);
    frame(f, 10150);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    frame(f, 10225);
    expect(Array.from(f.entity.position)).toEqual([3, 1, 4]);
  });

  it('does not carry an ordinary segment speed cache into the native 10ms FASTMOVE route', () => {
    const f = fixture(); beginWalk(f); frame(f, 10100);
    f.functions.fastMove(fastMovePacket(f, 3, 1));
    expect(f.entity.walk.speed).toBe(10);
    frame(f, 10130);
    expect(Array.from(f.entity.position)).toEqual([3, 1, 4]);
    expect(display(f)).toEqual([3, 1, 4]);
    expect(f.entity.walk.speed).toBe(150);
  });

  it('continues the approved route until a new click is confirmed instead of predicting an overlapping reroute', () => {
    const f = fixture(); beginWalk(f); frame(f, 10075);
    const path = Array.from(f.entity.walk.path), epoch = f.entity._lastroMovementEpoch;
    const direction = f.functions.visualDirection(f.entity);
    f.functions.sendPacket(moveRequest([1, 12]));
    expect(f.socket.send).toHaveBeenCalledOnce();
    expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(f.functions.visualDirection(f.entity)).toBe(direction);
    expect(Array.from(f.entity.walk.path)).toEqual(path);
    expect(f.entity._lastroMovementEpoch).toBe(epoch);
    frame(f, 10100);
    expect(display(f)[0]).toBeCloseTo(1 + 100 / 150); expect(display(f)[1]).toBe(1);
    frame(f, 10150);
    expect(display(f)).toEqual([2, 1, 3]);
    expect(f.entity.walk.path[2]).toBe(2); expect(f.entity.walk.path[3]).toBe(1);
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: 10150 });
    expect(display(f)).toEqual([2, 1, 3]);
    frame(f, 10225);
    expect(display(f)).toEqual([2, 1.5, 3.5]);
  });

  it('retires the pending prediction when native damage interrupts its visual action', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest()); frame(f, 10075);
    receiveNativeDamageAction(f);
    f.flush(10225); display(f);
    expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
    expect(f.entity.walk.total).toBe(0);
    const other = fixture(); other.functions.sendPacket(moveRequest());
    other.functions.hit(normalHit, other.entity); other.flush(10150);
    expect(other.entity._lastroMotion!.pending).toBeNull();
  });

  it.each(['stun', 'death', 'map', 'disconnect'] as const)('clears pending prediction for %s', reason => {
    const f = controlFixture(); f.functions.sendPacket(moveRequest()); frame(f, 10075);
    if (reason === 'stun') f.state(statusConstants.states.BodyState.STUN!);
    if (reason === 'death') {
      f.context.dyingEntity = f.entity;
      f.context.haveSiegfriedItem = () => false;
      vm.runInContext('dyingEntity.remove = () => {}; onEntityVanish({ GID: 123, type: Entity.VT.DEAD });', f.context);
    }
    if (reason === 'map') {
      f.functions.mapChange({ mapName: 'geffen', xPos: 3, yPos: 3 });
      f.MapRenderer.currentMap = 'geffen'; f.functions.mapEntry(f.entity, { xPos: 3, yPos: 3 }, 123);
    }
    if (reason === 'disconnect') {
      f.socket.connected = false;
      f.functions.closeEvent.call(f.socket, { code: 0, wasClean: false });
    }
    expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(f.entity.walk.total).toBe(0);
    if (reason === 'map') expect(display(f)).toEqual([3, 3, 6]);
  });
});

describe('movement rejection and hit correction remain visual-only', () => {
  it.each(['late-hit', 'stun'] as const)('smooths a seven-cell STOP rollback after %s within a bounded visual speed', reason => {
    const f = controlFixture(); f.cells.fill(1);
    for (let x = 1; x <= 12; x++) f.cells[x + 24] = 10;
    beginWalk(f); const shown = frame(f, 11200);
    expect(shown).toEqual([9, 1, 10]); expect(Array.from(f.entity.position)).toEqual(shown);
    const arrived = vi.fn(); f.entity.onWalkEnd = arrived; f.entity.walk.onEnd = arrived;
    if (reason === 'late-hit') {
      receiveNativeDamageAction(f);
      // The actual damage packet started at tick 10000. Its overdue native
      // hurt/resume timers must not revive the route after the STOP below.
      expect(f.Events.setTimeout).toHaveBeenCalled(); expect(f.timers.length).toBeGreaterThan(0);
    } else {
      f.state(statusConstants.states.BodyState.STUN!);
      expect(f.entity.walk.total).toBe(0);
    }
    receiveNativeStop(f, 2, 1);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(display(f)).toEqual(shown);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.onEnd).toBeNull();
    let previous = shown;
    for (let now = 11216; now <= 12400; now += 16) {
      f.flush(now);
      const current = frame(f, now);
      expect(current[0]!).toBeGreaterThanOrEqual(2); expect(current[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!), `frame ${now}`)
        .toBeLessThanOrEqual(2 * 16 / f.entity.walk.speed + 0.00001);
      expect(current[1]).toBe(1); expect(current[2]).toBeCloseTo(current[0]! + 1, 5);
      expect(f.cells[Math.round(current[0]!) + Math.round(current[1]!) * 24]! & 2).toBe(2);
      expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
      expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.onEnd).toBeNull();
      expect(f.entity._lastroMotion!.pending).toBeNull(); expect(arrived).not.toHaveBeenCalled();
      previous = current;
    }
    expect(display(f)).toEqual([2, 1, 3]); expect(f.timers).toHaveLength(0);
  });

  it.each([1, 3, 7])('retains a %s-cell hit STOP correction across a 300ms render gap', ahead => {
    const f = fixture(); f.cells.fill(1);
    for (let x = 1; x <= 12; x++) f.cells[x + 24] = 10;
    beginWalk(f); const stopTick = 10000 + (1 + ahead) * 150, shown = frame(f, stopTick);
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived; f.entity.onWalkEnd = arrived;
    receiveNativeDamageAction(f); receiveNativeStop(f, 2, 1);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(display(f)).toEqual(shown);
    f.flush(stopTick + 300); let previous = frame(f, stopTick + 300);
    // The resumed render uses the reconciler's bounded 50ms integration slice.
    expect(shown[0]! - previous[0]!).toBeLessThanOrEqual(2 * 50 / f.entity.walk.speed + 0.00001);
    expect(previous[0]).toBeGreaterThan(2);
    for (let now = stopTick + 316; now <= stopTick + 1500; now += 16) {
      const current = frame(f, now);
      expect(current[0]!).toBeGreaterThanOrEqual(2); expect(current[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
      expect(previous[0]! - current[0]!).toBeLessThanOrEqual(2 * 16 / f.entity.walk.speed + 0.00001);
      expect(current[1]).toBe(1); expect(current[2]).toBeCloseTo(current[0]! + 1, 5);
      expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
      expect(f.entity.walk.onEnd).toBeNull(); expect(arrived).not.toHaveBeenCalled(); previous = current;
    }
    expect(display(f)).toEqual([2, 1, 3]); expect(f.timers).toHaveLength(0);
  });

  it.each([1, 3, 5, 7])('retains a %s-cell old corridor when real hit STOP is immediately followed by an approved turn', ahead => {
    const f = fixture(); f.cells.fill(1);
    for (let x = 1; x <= 12; x++) f.cells[x + 24] = 10;
    for (let y = 1; y <= 12; y++) f.cells[2 + y * 24] = 10;
    beginWalk(f); const stopTick = 10000 + (1 + ahead) * 150, shown = frame(f, stopTick);
    const oldCallback = vi.fn(); f.entity.walk.onEnd = oldCallback;
    receiveNativeDamageAction(f); receiveNativeStop(f, 2, 1);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(display(f)).toEqual(shown);
    f.functions.playerMove({ MoveData: [2, 1, 2, 12], moveStartTime: stopTick });
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(display(f)).toEqual(shown);
    const arrived = vi.fn(); f.entity.onWalkEnd = arrived;
    let previous = shown, sawTurn = false;
    for (let now = stopTick + 16; now <= stopTick + 2496; now += 16) {
      f.flush(now); const current = frame(f, now);
      const onOldLeg = Math.abs(current[1]! - 1) <= 0.00001, onNewLeg = Math.abs(current[0]! - 2) <= 0.00001;
      expect(onOldLeg || onNewLeg, `legal approved corridor at ${now}`).toBe(true);
      if (onOldLeg && !sawTurn) expect(current[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
      if (current[1]! > 1.00001) sawTurn = true;
      if (sawTurn) { expect(onNewLeg).toBe(true); expect(current[1]!).toBeGreaterThanOrEqual(previous[1]! - 0.000001); }
      const multiplier = f.entity.walk.total > 0 ? 1.5 : 2;
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!), `frame ${now}`)
        .toBeLessThanOrEqual(multiplier * 16 / f.entity.walk.speed + 0.00001);
      expect(current[2]).toBeCloseTo(current[0]! + current[1]!, 5);
      expect(f.cells[Math.round(current[0]!) + Math.round(current[1]!) * 24]! & 2).toBe(2);
      expect(f.entity.position[0]).toBe(2); expect(f.entity._lastroMotion!.pending).toBeNull();
      expect(oldCallback).not.toHaveBeenCalled(); previous = current;
    }
    expect(sawTurn).toBe(true); expect(display(f)).toEqual([2, 12, 14]);
    expect(Array.from(f.entity.position)).toEqual([2, 12, 14]); expect(f.entity.walk.total).toBe(0);
    expect(arrived).toHaveBeenCalledOnce(); expect(f.timers).toHaveLength(0);
  });

  it.each(['stun', 'blade', 'explicit-stop'] as const)('smooths a STOP rollback under %s control without reviving the route', control => {
    const f = controlFixture(); f.cells.fill(1);
    for (let x = 1; x <= 12; x++) f.cells[x + 24] = 10;
    beginWalk(f); frame(f, 10450);
    const shown = display(f), arrived = vi.fn();
    f.entity.onWalkEnd = arrived; f.entity.walk.onEnd = arrived;
    if (control === 'stun') f.state(statusConstants.states.BodyState.STUN!);
    if (control === 'blade') f.blade(1);
    if (control === 'explicit-stop') f.status(statusConstants.statuses.STOP!, 1);
    receiveNativeStop(f, 2, 1);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
    expect(display(f)).toEqual(shown);
    expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.onEnd).toBeNull();
    let previous = shown;
    for (let now = 10466; now <= 11042; now += 16) {
      const current = frame(f, now);
      expect(current[0]!).toBeGreaterThanOrEqual(2); expect(current[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThan(0.35);
      expect(current[1]).toBe(1); expect(current[2]).toBeCloseTo(current[0]! + 1, 5);
      expect(f.cells[Math.round(current[0]!) + Math.round(current[1]!) * 24]! & 2).toBe(2);
      if ((now - 10450) % 96 === 0) {
        receiveNativeStop(f, 2, 1); expect(display(f)).toEqual(current);
      }
      if ((now - 10450) % 160 === 0) {
        f.functions.playerMove({ MoveData: [2, 1, 12, 1], moveStartTime: now });
        expect(display(f)).toEqual(current); expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
      }
      expect(f.entity.walk.total).toBe(0); expect(f.entity._lastroMotion!.pending).toBeNull();
      previous = current;
    }
    expect(display(f)).toEqual([2, 1, 3]); expect(arrived).not.toHaveBeenCalled();
    if (control === 'stun') f.state(0);
    if (control === 'blade') f.blade(0);
    if (control === 'explicit-stop') f.status(statusConstants.statuses.STOP!, 0);
    f.setNow(11058); f.SessionStorage_default.serverTick = 11058;
    f.functions.playerMove({ MoveData: [2, 1, 12, 1], moveStartTime: 11058 });
    expect(display(f)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBeGreaterThan(0);
    expect(frame(f, 11074)[0]).toBeGreaterThan(2);
  });

  it('keeps clear-floor idle prediction while waiting for a real acknowledgement', () => {
    const f = fixture(); f.functions.sendPacket(moveRequest());
    expect(f.entity._lastroMotion!.pending).not.toBeNull();
    expect(frame(f, 10075)).toEqual([1.5, 1, 2.5]);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
  });

  it.each(['detour', 'separated'] as const)('waits for an acknowledgement instead of speculating a %s across a wall', kind => {
    const f = fixture();
    for (let y = 0; y < (kind === 'detour' ? 3 : 24); y++) f.cells[2 + y * 24] = 1;
    f.functions.sendPacket(moveRequest([3, 1]));
    expect(f.socket.send).toHaveBeenCalledOnce(); expect(f.entity._lastroMotion?.pending ?? null).toBeNull();
    for (let now = 10016; now <= 11104; now += 16) {
      expect(frame(f, now)).toEqual([1, 1, 2]); expect(f.entity.walk.total).toBe(0);
    }
    if (kind === 'detour') {
      f.setNow(11120); f.SessionStorage_default.serverTick = 11120;
      f.functions.playerMove({ MoveData: [1, 1, 3, 1], moveStartTime: 11120 });
      expect(f.entity.walk.total).toBeGreaterThan(0);
      expect(frame(f, 11136)[1]).toBeGreaterThan(1);
    }
  });

  it('does not start a fresh prediction while authority is idle but display is still settling a STOP', () => {
    const f = fixture(); beginWalk(f); frame(f, 10300); receiveNativeStop(f, 2, 1);
    const shown = display(f); expect(shown[0]).toBe(3); expect(f.entity.walk.total).toBe(0);
    f.functions.sendPacket(moveRequest([2, 12]));
    expect(f.socket.send).toHaveBeenCalledOnce(); expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(display(f)).toEqual(shown);
    for (let now = 10316; now <= 10428; now += 16) {
      expect(frame(f, now)[1]).toBe(1); expect(f.entity.walk.total).toBe(0);
    }
  });

  it('does not speculate a request to the same rounded cell from a fractional idle position', () => {
    const f = fixture(); f.entity.position.set([1.2, 1, 2.2]);
    const shown = display(f); f.functions.sendPacket(moveRequest([1, 1]));
    expect(f.socket.send).toHaveBeenCalledOnce(); expect(f.entity._lastroMotion?.pending ?? null).toBeNull();
    for (let now = 10016; now <= 10256; now += 16) expect(frame(f, now)).toEqual(shown);
  });

  it('retains real native hurt processing and waits for authority after a recent hit even when action becomes idle', () => {
    const f = fixture(); receiveNativeDamageAction(f); f.flush(10225);
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    f.entity.setAction({ action: f.entity.ACTION.IDLE!, repeat: true, play: true });
    f.functions.sendPacket(moveRequest());
    expect(f.socket.send).toHaveBeenCalledOnce(); expect(f.entity._lastroMotion?.pending ?? null).toBeNull();
    expect(frame(f, 10300)).toEqual([1, 1, 2]);
  });

  it.each(['SKILL', 'ATTACK', 'READYFIGHT'] as const)('retires speculation on native %s without a visual jump or an unacknowledged restart', action => {
    const f = fixture(); f.functions.sendPacket(moveRequest());
    const shown = frame(f, 10075);
    expect(shown).toEqual([1.5, 1, 2.5]); expect(f.entity._lastroMotion!.pending).not.toBeNull();
    f.entity.setAction({ action: f.entity.ACTION[action]!, repeat: true, play: true });
    expect(display(f)).toEqual(shown); expect(f.entity._lastroMotion!.pending).toBeNull();
    expect(f.functions.visualAction(f.entity)).toBe(f.entity.action);
    let previous = shown;
    for (let now = 10091; now <= 10683; now += 16) {
      if (now === 10283) f.entity.setAction({ action: f.entity.ACTION.IDLE!, repeat: true, play: true });
      const current = frame(f, now);
      expect(current[0]!).toBeGreaterThanOrEqual(1); expect(current[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThan(0.35);
      expect(current[1]).toBe(1); expect(current[2]).toBeCloseTo(current[0]! + 1, 5);
      expect(f.entity._lastroMotion!.pending).toBeNull(); expect(f.entity.walk.total).toBe(0);
      expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
      previous = current;
    }
    expect(display(f)).toEqual([1, 1, 2]);
  });

  it.each(['REQUEST_ACT', 'REQUEST_ACT2', 'USE_SKILL', 'USE_SKILL2', 'USE_SKILL_TOGROUND', 'USE_SKILL_TOGROUND2', 'USE_SKILL_TOGROUND3'] as const)(
    'retires prediction immediately after native %s send, before the action changes, while approved walking continues', name => {
      const f = fixture(); f.functions.sendPacket(moveRequest()); const shown = frame(f, 10075);
      f.functions.sendPacket(nativeActionRequest(f, name));
      expect(f.socket.send).toHaveBeenCalledTimes(2); expect(f.entity.action).toBe(f.entity.ACTION.IDLE);
      expect(f.entity._lastroMotion!.pending).toBeNull(); expect(display(f)).toEqual(shown);
      f.functions.sendPacket(moveRequest()); expect(f.entity._lastroMotion!.pending).toBeNull();
      let previous = shown;
      for (let now = 10091; now <= 10683; now += 16) {
        const current = frame(f, now);
        expect(current[0]!).toBeGreaterThanOrEqual(1); expect(current[0]!).toBeLessThanOrEqual(previous[0]! + 0.000001);
        expect(current[1]).toBe(1); expect(current[2]).toBeCloseTo(current[0]! + 1, 5);
        expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThan(0.35);
        expect(f.entity._lastroMotion!.pending).toBeNull(); expect(f.entity.walk.total).toBe(0);
        expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
        previous = current;
      }
      expect(display(f)).toEqual([1, 1, 2]);
      const approved = fixture(); beginWalk(approved); frame(approved, 10075);
      const before = display(approved);
      approved.functions.sendPacket(nativeActionRequest(approved, name));
      expect(display(approved)).toEqual(before); expect(approved.entity.walk.total).toBeGreaterThan(0);
      expect(frame(approved, 10091)[0]).toBeCloseTo(1 + 91 / 150, 5);
    },
  );

  it('accepts approved movement normally inside the real-hit prediction guard window', () => {
    const f = fixture(); receiveNativeDamageAction(f); f.flush(10225);
    expect(f.entity.action).toBe(f.entity.ACTION.HURT);
    f.entity.setAction({ action: f.entity.ACTION.IDLE!, repeat: true, play: true });
    f.functions.sendPacket(moveRequest()); expect(f.entity._lastroMotion?.pending ?? null).toBeNull();
    f.SessionStorage_default.serverTick = 10225;
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10225 });
    expect(f.entity.walk.total).toBeGreaterThan(0); expect(display(f)).toEqual([1, 1, 2]);
    for (let now = 10241; now <= 10433; now += 16) {
      expect(frame(f, now)[0]).toBeCloseTo(1 + (now - 10225) / 150, 5);
      expect(f.entity._lastroMotion!.pending).toBeNull(); expect(f.entity.walk.total).toBeGreaterThan(0);
    }
  });
});

describe('a confirmed skill stop retains only its small residual within the same cell', () => {
  function prepare(kind: 'straight' | 'diagonal' = 'straight') {
    const f = controlFixture(), stopTick = kind === 'straight' ? 10195 : 10273;
    f.functions.playerMove({ MoveData: [1, 1, 12, kind === 'straight' ? 1 : 12], moveStartTime: 10000 });
    frame(f, stopTick - 80); sendNativeSkill(f);
    return { f, stopTick, stopY: kind === 'straight' ? 1 : 2 };
  }

  it.each(['USE_SKILL', 'USE_SKILL2', 'USE_SKILL_TOGROUND', 'USE_SKILL_TOGROUND2', 'USE_SKILL_TOGROUND3'] as const)(
    'cancels queued floor input after a successful native %s send without stopping approved movement', name => {
      const f = fixture(); beginWalk(f); const shown = frame(f, 10115);
      sendNativeSkill(f, name); expect(f.MapControl._lastroMovementInput.cancel).toHaveBeenCalledOnce();
      expect(display(f)).toEqual(shown); expect(f.entity.walk.total).toBeGreaterThan(0);
      expect(frame(f, 10131)[0]).toBeCloseTo(1 + 131 / 150, 5);
    },
  );

  it('keeps queued input when the native skill send fails', () => {
    const f = fixture(); beginWalk(f); frame(f, 10115);
    f.socket.send.mockImplementation(() => { throw new Error('socket closed'); });
    expect(() => sendNativeSkill(f)).toThrow('socket closed');
    expect(f.MapControl._lastroMovementInput.cancel).not.toHaveBeenCalled();
    expect(f.entity.walk.total).toBeGreaterThan(0);
  });

  it.each([
    ['straight', 'before'], ['straight', 'after'], ['diagonal', 'before'], ['diagonal', 'after'],
  ] as const)('holds the %s residual for 500ms with native cast acknowledgement %s STOP, then resumes forward smoothly', (kind, castOrder) => {
    const { f, stopTick, stopY } = prepare(kind);
    frame(f, stopTick - 16);
    if (castOrder === 'before') receiveNativeCastSkill(f);
    const shown = frame(f, stopTick);
    expect(shown[0]).toBeCloseTo(2.3, 5); if (kind === 'diagonal') expect(shown[1]).toBeCloseTo(2.3, 5);
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived; f.entity.onWalkEnd = arrived;
    receiveNativeStop(f, 2, stopY);
    if (castOrder === 'after') receiveNativeCastSkill(f);
    expect(Array.from(f.entity.position)).toEqual([2, stopY, 2 + stopY]); expect(display(f)).toEqual(shown);
    for (let now = stopTick + 16; now <= stopTick + 512; now += 16) {
      expect(frame(f, now)).toEqual(shown);
      if ((now - stopTick) % 96 === 0) {
        sendNativeSkill(f, 'USE_SKILL_TOGROUND3'); receiveNativeStop(f, 2, stopY);
        expect(display(f)).toEqual(shown);
      }
      expect(f.entity.walk.total).toBe(0); expect(f.entity.walk.onEnd).toBeNull();
      expect(f.entity._lastroMotion!.pending).toBeNull(); expect(arrived).not.toHaveBeenCalled();
      expect(Array.from(f.entity.position)).toEqual([2, stopY, 2 + stopY]);
    }
    const resumeTick = stopTick + 528;
    f.setNow(resumeTick); f.SessionStorage_default.serverTick = resumeTick;
    f.functions.playerMove({ MoveData: [2, stopY, 12, kind === 'straight' ? 1 : 12], moveStartTime: resumeTick });
    expect(display(f)).toEqual(shown); expect(f.entity.walk.total).toBeGreaterThan(0);
    let previous = shown;
    for (let now = resumeTick + 16; now <= resumeTick + 1024; now += 16) {
      const current = frame(f, now);
      expect(current[0]!).toBeGreaterThanOrEqual(previous[0]! - 0.000001);
      if (kind === 'diagonal') expect(current[1]!).toBeGreaterThanOrEqual(previous[1]! - 0.000001);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThan(0.25);
      expect(current[2]).toBeCloseTo(current[0]! + current[1]!, 5);
      expect(f.entity._lastroMotion!.pending).toBeNull(); previous = current;
    }
    expect(display(f)[0]).toBeCloseTo(f.entity.position[0]!, 3);
    expect(display(f)[1]).toBeCloseTo(f.entity.position[1]!, 3);
  });

  it.each(['no-skill', 'attack-only', 'hit', 'stun', 'expired', 'new-move', 'different-cell', 'behind', 'failed-send'] as const)(
    'converges to the real STOP rather than retaining a skill residual for %s', reason => {
      const f = controlFixture(); beginWalk(f); frame(f, 10115);
      if (reason === 'attack-only') f.functions.sendPacket(nativeActionRequest(f, 'REQUEST_ACT2'));
      else if (reason === 'failed-send') {
        f.socket.send.mockImplementation(() => { throw new Error('socket closed'); });
        expect(() => sendNativeSkill(f)).toThrow('socket closed'); f.socket.send.mockImplementation(() => {});
      } else if (reason !== 'no-skill') sendNativeSkill(f);
      const stopTick = reason === 'expired' ? 11395 : 10195;
      const shown = frame(f, stopTick), stopX = reason === 'expired' ? 10 : reason === 'different-cell' ? 1 : reason === 'behind' ? 3 : 2;
      if (reason === 'hit') receiveNativeDamageAction(f);
      if (reason === 'stun') f.state(statusConstants.states.BodyState.STUN!);
      if (reason === 'new-move') f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10000 });
      receiveNativeStop(f, stopX, 1);
      expect(Array.from(f.entity.position)).toEqual([stopX, 1, stopX + 1]); expect(display(f)).toEqual(shown);
      expect(Math.abs(frame(f, stopTick + 16)[0]! - shown[0]!)).toBeGreaterThan(0.000001);
      for (let now = stopTick + 32; now <= stopTick + 800; now += 16) {
        f.flush(now); frame(f, now);
        expect(Array.from(f.entity.position)).toEqual([stopX, 1, stopX + 1]); expect(f.entity.walk.total).toBe(0);
      }
      if (reason === 'no-skill') expectSettledDisplay(f);
      else expect(display(f)).toEqual([stopX, 1, stopX + 1]);
    },
  );

  it.each(['hit', 'stun'] as const)('releases an existing skill residual when a real %s supersedes it', reason => {
    const { f, stopTick } = prepare(); const shown = frame(f, stopTick); receiveNativeStop(f, 2, 1);
    expect(frame(f, stopTick + 16)).toEqual(shown);
    if (reason === 'hit') receiveNativeDamageAction(f);
    else f.state(statusConstants.states.BodyState.STUN!);
    expect(display(f)).toEqual(shown);
    expect(frame(f, stopTick + 32)[0]).toBeLessThan(shown[0]!);
    for (let now = stopTick + 48; now <= stopTick + 800; now += 16) { f.flush(now); frame(f, now); }
    expect(display(f)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
  });

  it.each(['jump', 'map', 'disconnect'] as const)('resets a held skill residual on %s', reason => {
    const { f, stopTick } = prepare(); const shown = frame(f, stopTick); receiveNativeStop(f, 2, 1);
    expect(frame(f, stopTick + 16)).toEqual(shown);
    if (reason === 'jump') f.functions.jump({ AID: 123, xPos: 8, yPos: 8 });
    if (reason === 'map') {
      f.functions.mapChange({ mapName: 'geffen', xPos: 8, yPos: 8 });
      f.MapRenderer.currentMap = 'geffen'; f.functions.mapEntry(f.entity, { xPos: 8, yPos: 8 }, 123);
    }
    if (reason === 'disconnect') {
      f.socket.connected = false; f.functions.closeEvent.call(f.socket, { code: 0, wasClean: false });
    }
    const expected = reason === 'disconnect' ? [2, 1, 3] : [8, 8, 16];
    expect(display(f)).toEqual(expected); expect(frame(f, stopTick + 32)).toEqual(expected);
    expect(f.entity.walk.total).toBe(0); expect(f.entity._lastroMotion!.pending).toBeNull();
  });

  it.each(['before-stop', 'after-stop'] as const)('releases matching failed-skill state received %s through the actual native failure handler', stage => {
    const { f, stopTick } = prepare(); const shown = frame(f, stopTick);
    if (stage === 'before-stop') receiveNativeSkillResult(f);
    receiveNativeStop(f, 2, 1); expect(display(f)).toEqual(shown);
    if (stage === 'after-stop') {
      expect(frame(f, stopTick + 16)).toEqual(shown); receiveNativeSkillResult(f);
      expect(display(f)).toEqual(shown);
    }
    expect((f.context.ChatBox_default as { addText: ReturnType<typeof vi.fn> }).addText).toHaveBeenCalledOnce();
    expect(frame(f, stopTick + 32)[0]).toBeLessThan(shown[0]!);
    for (let now = stopTick + 48; now <= stopTick + 800; now += 16) frame(f, now);
    expect(display(f)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
  });

  it.each(['different-skill', 'success'] as const)('retains the held residual for a %s result', reason => {
    const { f, stopTick } = prepare(); const shown = frame(f, stopTick); receiveNativeStop(f, 2, 1);
    expect(frame(f, stopTick + 16)).toEqual(shown);
    receiveNativeSkillResult(f, reason === 'different-skill' ? 29 : 28, reason === 'success' ? 1 : 0);
    for (let now = stopTick + 32; now <= stopTick + 544; now += 16) expect(frame(f, now)).toEqual(shown);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]);
  });

  it('renders the native cast-facing direction while a stopped residual is held', () => {
    const { f, stopTick } = prepare(); const shown = frame(f, stopTick); receiveNativeStop(f, 2, 1);
    expect(frame(f, stopTick + 16)).toEqual(shown);
    const walkingDirection = f.entity.direction;
    receiveNativeCastSkill(f, [2, 8]);
    expect(f.entity.direction).not.toBe(walkingDirection);
    expect(f.functions.visualDirection(f.entity)).toBe(f.entity.direction);
    for (let now = stopTick + 32; now <= stopTick + 544; now += 16) {
      expect(frame(f, now)).toEqual(shown); expect(f.functions.visualDirection(f.entity)).toBe(f.entity.direction);
    }
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
  });

  it.each(['hit', 'failure'] as const)('keeps same-frame visual consumers continuous when %s releases a hold after the renderer clock', reason => {
    const { f, stopTick } = prepare(); const shown = frame(f, stopTick); receiveNativeStop(f, 2, 1);
    expect(frame(f, stopTick + 16)).toEqual(shown);
    vm.runInContext('lastroMovementFrameTick = ' + (stopTick + 16) + ';', f.context);
    f.setNow(stopTick + 32);
    if (reason === 'hit') receiveNativeDamageAction(f); else receiveNativeSkillResult(f);
    for (let consumer = 0; consumer < 20; consumer++) expect(display(f)).toEqual(shown);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
    for (let now = stopTick + 48; now <= stopTick + 816; now += 16) {
      vm.runInContext('lastroMovementFrameTick = ' + now + ';', f.context);
      const current = frame(f, now);
      expect(current[0]!).toBeGreaterThanOrEqual(2); expect(current[0]!).toBeLessThan(shown[0]!);
    }
    expect(display(f)).toEqual([2, 1, 3]);
  });

  it.each(['STOP', 'MOVE'] as const)('keeps %s confirmation continuous when the renderer clock leads the packet wall clock', packet => {
    const f = fixture(); beginWalk(f); frame(f, 10195);
    vm.runInContext('lastroMovementFrameTick = 10211;', f.context);
    const shown = display(f); expect(shown[0]).toBeCloseTo(1 + 211 / 150, 5);
    f.setNow(10195);
    if (packet === 'STOP') receiveNativeStop(f, 2, 1);
    else f.functions.playerMove({ MoveData: [2, 1, 12, 1], moveStartTime: 10195 });
    expect(f.entity.position[0]!).toBeLessThan(shown[0]!);
    for (let consumer = 0; consumer < 20; consumer++) expect(display(f)).toEqual(shown);
    expect(f.entity.walk.total > 0).toBe(packet === 'MOVE');
  });

  it('holds a confirmed skill STOP when its wall clock has moved behind the last displayed frame', () => {
    const { f, stopTick } = prepare(); frame(f, stopTick);
    vm.runInContext('lastroMovementFrameTick = ' + (stopTick + 16) + ';', f.context);
    const shown = display(f); expect(shown[0]).toBeCloseTo(2 + 61 / 150, 5);
    f.setNow(stopTick - 16); receiveNativeStop(f, 2, 1);
    for (let consumer = 0; consumer < 20; consumer++) expect(display(f)).toEqual(shown);
    expect(Array.from(f.entity.position)).toEqual([2, 1, 3]); expect(f.entity.walk.total).toBe(0);
    for (let now = stopTick + 32; now <= stopTick + 544; now += 16) {
      vm.runInContext('lastroMovementFrameTick = ' + now + ';', f.context);
      expect(frame(f, now)).toEqual(shown);
    }
  });
});

describe('approved movement remains continuous across renders and acknowledgements', () => {
  it.each([100, 200])('keeps every 16ms frame at walking speed with a consistent MOVE every %sms', interval => {
    const f = fixture(); beginWalk(f);
    let previous = display(f), nextAck = 10000 + interval;
    for (let now = 10016; now <= 11440; now += 16) {
      // Network delivery can happen between renders. Each origin and start tick
      // describes the same server trajectory at a different integer path cell.
      while (nextAck <= now) {
        f.setNow(nextAck); f.SessionStorage_default.serverTick = nextAck;
        const step = Math.floor((nextAck - 10000) / 150);
        f.functions.playerMove({ MoveData: [1 + step, 1, 12, 1], moveStartTime: 10000 + step * 150 });
        nextAck += interval;
      }
      f.setNow(now); f.SessionStorage_default.serverTick = now;
      f.entity.walkProcess();
      const shown = display(f);
      expect(shown[0]! - previous[0]!, `frame ${now}`).toBeCloseTo(16 / 150, 4);
      expect(shown[0]!, `trajectory ${now}`).toBeCloseTo(1 + (now - 10000) / 150, 4);
      expect(shown[1]).toBe(1);
      previous = shown;
    }
  });

  it('keeps moving while a small server timing discrepancy decays across repeated MOVE packets', () => {
    const f = fixture(); beginWalk(f);
    let previous = display(f), nextAck = 10200;
    for (let now = 10016; now <= 11440; now += 16) {
      while (nextAck <= now) {
        f.setNow(nextAck); f.SessionStorage_default.serverTick = nextAck;
        // The corrected server trajectory runs 60ms behind the first route.
        // Later packets describe that same trajectory, not fresh positional jumps.
        const step = Math.floor((nextAck - 10060) / 150);
        f.functions.playerMove({ MoveData: [1 + step, 1, 12, 1], moveStartTime: 10060 + step * 150 });
        nextAck += 200;
      }
      f.setNow(now); f.SessionStorage_default.serverTick = now;
      f.entity.walkProcess();
      const shown = display(f), delta = shown[0]! - previous[0]!;
      expect(delta, `moving correction ${now}`).toBeGreaterThan(0.03);
      expect(delta, `bounded correction ${now}`).toBeLessThan(0.13);
      if (now >= 11000) expect(shown[0]).toBeCloseTo(1 + (now - 10060) / 150, 4);
      expect(shown[1]).toBe(1);
      previous = shown;
    }
  });

  it('repeated click sends preserve the approved movement cadence, distance and direction', () => {
    const f = fixture(); beginWalk(f);
    const epoch = f.entity._lastroMovementEpoch, path = Array.from(f.entity.walk.path);
    const direction = f.functions.visualDirection(f.entity), arrived = vi.fn();
    f.entity.walk.onEnd = arrived;
    let previous = display(f);
    for (let now = 10016; now <= 10800; now += 16) {
      f.setNow(now); f.SessionStorage_default.serverTick = now;
      f.functions.sendPacket(moveRequest([1, 12]));
      f.functions.sendPacket(moveRequest([12, 12]));
      const shown = display(f);
      expect(shown[0]! - previous[0]!).toBeCloseTo(16 / 150, 4);
      expect(shown[1]).toBe(1);
      expect(f.functions.visualDistance(f.entity)).toBeCloseTo((now - 10000) / 150, 4);
      expect(f.functions.visualDirection(f.entity)).toBe(direction);
      expect(f.entity._lastroMotion!.pending).toBeNull();
      expect(f.entity._lastroMovementEpoch).toBe(epoch);
      expect(Array.from(f.entity.walk.path)).toEqual(path);
      previous = shown;
    }
    expect(f.socket.send).toHaveBeenCalledTimes(100);
    expect(arrived).not.toHaveBeenCalled();
  });

  it('advances the approved route before an acknowledgement received ahead of this frame rendering', () => {
    const f = fixture(); beginWalk(f);
    frame(f, 10016);
    f.setNow(10100); f.SessionStorage_default.serverTick = 10100;
    f.functions.playerMove({ MoveData: [1, 1, 12, 1], moveStartTime: 10000 });
    expect(display(f)[0]).toBeCloseTo(1 + 100 / 150, 5);
    f.setNow(10112); f.SessionStorage_default.serverTick = 10112;
    expect(display(f)[0]).toBeCloseTo(1 + 112 / 150, 5);
  });

  it('camera-first reads advance authority and agree with native render at the same frame time', () => {
    const f = fixture(); beginWalk(f);
    for (let now = 10016; now <= 11200; now += 16) {
      f.setNow(now); f.SessionStorage_default.serverTick = now;
      const cameraPosition = display(f);
      expect(cameraPosition[0]).toBeCloseTo(1 + (now - 10000) / 150, 5);
      expect(Array.from(f.entity.position)).toEqual(cameraPosition);
      f.entity.walkProcess();
      expect(display(f)).toEqual(cameraPosition);
    }
  });

  it('finishes a camera-first frame once when an arrival callback reads display coordinates again', () => {
    const f = fixture(); beginWalk(f);
    const arrived = vi.fn(() => { expect(display(f)).toEqual([12, 1, 13]); });
    f.entity.onWalkEnd = arrived;
    for (let now = 10200; now <= 11600; now += 200) frame(f, now);
    f.setNow(11650); f.SessionStorage_default.serverTick = 11650;
    expect(display(f)).toEqual([12, 1, 13]);
    for (let read = 0; read < 20; read++) {
      f.entity.walkProcess();
      expect(display(f)).toEqual([12, 1, 13]);
    }
    expect(arrived).toHaveBeenCalledOnce();
    expect(f.entity.walk.total).toBe(0);
  });

  it.each(['approved', 'prediction', 'correction'] as const)('reuses %s display coordinates for repeated reads in one frame', mode => {
    const f = fixture();
    if (mode === 'prediction') f.functions.sendPacket(moveRequest());
    else beginWalk(f);
    frame(f, 10032);
    if (mode === 'correction') f.functions.stop({ AID: 123, xPos: 1, yPos: 1 });
    f.setNow(10048); f.SessionStorage_default.serverTick = 10048;
    const first = display(f), authority = Array.from(f.entity.position);
    const cellsRead = f.Altitude.getCellType.mock.calls.length;
    const heightsRead = f.Altitude.getCellHeight.mock.calls.length;
    for (let read = 0; read < 20; read++) {
      expect(display(f)).toEqual(first);
      expect(f.functions.visualAction(f.entity)).toBeDefined();
      expect(f.functions.visualDirection(f.entity)).toBeDefined();
      expect(f.functions.visualDistance(f.entity)).toBeDefined();
    }
    expect(Array.from(f.entity.position)).toEqual(authority);
    expect(f.Altitude.getCellType.mock.calls.length).toBe(cellsRead);
    expect(f.Altitude.getCellHeight.mock.calls.length).toBe(heightsRead);
  });

  it('invalidates same-frame display caching when authority changes in place or is replaced', () => {
    const f = fixture(); expect(display(f)).toEqual([1, 1, 2]);
    f.entity.position.set([2, 1, 3]);
    expect(display(f)).toEqual([2, 1, 3]);
    f.entity.position = new Float32Array([3, 1, 4]);
    expect(display(f)).toEqual([3, 1, 4]);
    for (let read = 0; read < 20; read++) expect(display(f)).toEqual([3, 1, 4]);
  });

  it('retains a legal successful native path for an entity outside the controlled LastRO player', () => {
    const f = fixture(), expected = [1, 1, 2, 1, 2, 2];
    const nativeSearch = vi.fn((_x0: number, _y0: number, _x1: number, _y1: number, _range: number, output: Int16Array) => {
      output.set(expected); return expected.length / 2;
    });
    (f.context.PathFinding_default as { search: typeof nativeSearch }).search = nativeSearch;
    f.SessionStorage_default.Entity = null;
    f.functions.move({ GID: 123, MoveData: [1, 1, 2, 2], moveStartTime: 10000 });
    expect(nativeSearch).toHaveBeenCalledOnce();
    expect(Array.from(f.entity.walk.path).slice(0, f.entity.walk.total)).toEqual(expected);
    expect(frame(f, 10150)).toEqual([2, 1, 3]);
    expect(frame(f, 10300)).toEqual([2, 2, 4]);
  });

  it('fits the local server route to a one-cell corridor without accepting native diagonal corner cuts', () => {
    const f = fixture(); f.cells.fill(1);
    for (let cell = 1; cell <= 10; cell++) {
      f.cells[cell + 24] = 10;
      f.cells[10 + cell * 24] = 10;
    }
    f.functions.playerMove({ MoveData: [1, 1, 10, 10], moveStartTime: 10000 });
    const route = Array.from(f.entity.walk.path).slice(0, f.entity.walk.total);
    expect(route).toHaveLength(38);
    for (let index = 2; index < route.length; index += 2) {
      expect(Math.abs(route[index]! - route[index - 2]!) + Math.abs(route[index + 1]! - route[index - 1]!)).toBe(1);
    }
    // The diagonal-only native searchLong would skip this exact turning cell
    // when the next update starts at 9,1. Server movement must retain it.
    expect(frame(f, 11350)).toEqual([10, 1, 11]);
    f.functions.playerMove({ MoveData: [9, 1, 10, 10], moveStartTime: 11200 });
    expect(Array.from(f.entity.walk.path).slice(0, 6)).toEqual([9, 1, 10, 1, 10, 2]);
    expect(Array.from(f.entity.position)).toEqual([10, 1, 11]);
  });

  it.each([
    { phase: 'behind', now: 10280, moveStartTime: 10090, authorityDirection: 4, displayDirection: 6 },
    { phase: 'ahead', now: 10320, moveStartTime: 10210, authorityDirection: 6, displayDirection: 4 },
  ])('faces the actual displayed corridor segment when display is $phase the authoritative turn', state => {
    const f = fixture(); f.cells.fill(1);
    for (let cell = 1; cell <= 10; cell++) {
      f.cells[cell + 24] = 10;
      f.cells[10 + cell * 24] = 10;
    }
    f.entity.position.set([8, 1, 9]);
    f.functions.playerMove({ MoveData: [8, 1, 10, 10], moveStartTime: 10000 });
    const previous = frame(f, state.now);
    // Origin 9,1 is an integer server cell. Its departure time corrects the
    // original 10150ms phase by exactly 60ms in either direction.
    f.functions.playerMove({ MoveData: [9, 1, 10, 10], moveStartTime: state.moveStartTime });
    expect(display(f)).toEqual(previous);
    expect(f.entity.direction).toBe(state.authorityDirection);
    expect(f.functions.visualDirection(f.entity)).toBe(state.displayDirection);
    for (let read = 0; read < 20; read++) expect(f.functions.visualDirection(f.entity)).toBe(state.displayDirection);
    let northFrames = 0;
    for (let now = state.now + 16; now <= state.now + 400; now += 16) {
      const shown = frame(f, now);
      expect(shown[0] === 10 || shown[1] === 1).toBe(true);
      const expected = shown[0] === 10 ? 4 : 6;
      expect(f.functions.visualDirection(f.entity), `direction at ${now}`).toBe(expected);
      if (expected === 4) northFrames++;
    }
    expect(northFrames).toBeGreaterThan(0);
  });

  it('faces west when a new approved route reverses over its own walked prefix', () => {
    const f = fixture();
    f.functions.playerMove({ MoveData: [1, 1, 10, 1], moveStartTime: 10000 });
    frame(f, 11260);
    expect(display(f)[0]).toBeCloseTo(9.4);
    f.functions.playerMove({ MoveData: [10, 1, 1, 1], moveStartTime: 11230 });
    expect(f.entity.direction).toBe(2);
    let previous = display(f);
    for (let now = 11276; now <= 11420; now += 16) {
      const shown = frame(f, now);
      expect(shown[0]!, `westward frame ${now}`).toBeLessThan(previous[0]!);
      expect(f.functions.visualDirection(f.entity), `westward facing ${now}`).toBe(2);
      previous = shown;
    }
  });

  it.each(['arrival', 'STOP'])('keeps the current visit when a decoded MOVE returns to its old origin through %s', ending => {
    const f = fixture();
    const receive = (fromX: number, fromY: number, toX: number, toY: number, start: number) => {
      const bytes = new Uint8Array(12), view = new DataView(bytes.buffer);
      view.setUint16(0, 0x87, true); view.setUint32(2, start, true);
      bytes[6] = fromX >> 2; bytes[7] = (fromX & 3) << 6 | fromY >> 4;
      bytes[8] = (fromY & 15) << 4 | toX >> 6;
      bytes[9] = (toX & 63) << 2 | toY >> 8; bytes[10] = toY;
      const packet = nativeMovementPacket(f, 'NOTIFY_PLAYERMOVE', bytes) as MovePacket;
      expect(Array.from(packet.MoveData)).toEqual([fromX, fromY, toX, toY]);
      f.functions.playerMove(packet);
    };
    receive(1, 1, 4, 3, 10000);
    expect(Array.from(f.entity.walk.path).slice(0, f.entity.walk.total)).toEqual([1, 1, 2, 2, 3, 3, 4, 3]);
    const before = frame(f, 10070);
    // The fresh confirmation is several cells ahead while display is still
    // behind. Its endpoint revisits the old origin on a different route branch.
    receive(4, 3, 1, 1, 10070);
    expect(Array.from(f.entity.walk.path).slice(0, f.entity.walk.total)).toEqual([4, 3, 3, 2, 2, 1, 1, 1]);
    expect(display(f)).toEqual(before);
    const arrived = vi.fn(); f.entity.walk.onEnd = arrived;
    const polyline = [[1, 1], [2, 2], [3, 3], [4, 3], [3, 2], [2, 1], [1, 1]];
    let previous = before, westFrames = 0;
    const checkFrame = (now: number) => {
      const shown = frame(f, now);
      const onRoute = polyline.slice(1).some((b, index) => {
        const a = polyline[index]!, dx = b[0]! - a[0]!, dy = b[1]! - a[1]!;
        const alpha = Math.max(0, Math.min(1, ((shown[0]! - a[0]!) * dx + (shown[1]! - a[1]!) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(shown[0]! - a[0]! - alpha * dx, shown[1]! - a[1]! - alpha * dy) < 0.00001;
      });
      expect(onRoute, `cell route at ${now}`).toBe(true);
      expect(Math.hypot(shown[0]! - previous[0]!, shown[1]! - previous[1]!), `continuity at ${now}`).toBeLessThan(0.5);
      if (shown[0]! > 1.001 && shown[0]! < 2 && Math.abs(shown[1]! - 1) < 0.00001) {
        expect(f.functions.visualDirection(f.entity), `final westward segment at ${now}`).toBe(2);
        westFrames++;
      }
      previous = shown;
      return shown;
    };
    for (let now = 10086; now < 10640; now += 16) checkFrame(now);
    const endpoint = checkFrame(10640);
    expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
    expect(endpoint[0]).toBeGreaterThan(2); expect(endpoint[0]).toBeLessThan(3);
    expect(endpoint[1]).toBeCloseTo(endpoint[0]! - 1);
    expect(arrived).toHaveBeenCalledTimes(1);
    expect(f.entity.walk.total).toBe(0);
    if (ending === 'STOP') f.functions.stop({ AID: 123, xPos: 1, yPos: 1 });
    for (let now = 10656; now <= 11280; now += 16) {
      checkFrame(now);
      expect(f.entity.walk.total).toBe(0);
    }
    expectSettledDisplay(f);
    expect(westFrames).toBeGreaterThan(0);
    expect(arrived).toHaveBeenCalledTimes(1);
  });

  it.each([5, 10, 20])('keeps a one-cell corridor turn legal and continuous at %s fps', fps => {
    const f = fixture(); f.cells.fill(1);
    for (let cell = 1; cell <= 10; cell++) {
      f.cells[cell + 24] = 10;
      f.cells[10 + cell * 24] = 10;
    }
    f.functions.playerMove({ MoveData: [1, 1, 10, 1], moveStartTime: 10000 });
    let previous = display(f);
    const dt = 1000 / fps;
    let nextAck = 10100, turnSent = false;
    for (let elapsed = dt; elapsed <= 2600; elapsed += dt) {
      const now = 10000 + elapsed;
      // The server accepts the northbound turn at the eastbound destination.
      // Deliver that packet at its real time, independently of render cadence.
      // A single long destination from 9,1 permits native diagonal searchLong
      // and would describe a different trajectory from this cardinal corridor.
      while (Math.min(nextAck, turnSent ? Infinity : 11350) <= now) {
        const ack = Math.min(nextAck, turnSent ? Infinity : 11350);
        f.setNow(ack); f.SessionStorage_default.serverTick = ack;
        const step = Math.floor((ack - 10000) / 150);
        const from = step < 9 ? [1 + step, 1] : [10, 1 + step - 9];
        const dest = step < 9 ? [10, 1] : [10, 10];
        f.functions.playerMove({ MoveData: [...from, ...dest], moveStartTime: 10000 + step * 150 });
        if (ack === nextAck) nextAck += 100;
        if (ack === 11350) turnSent = true;
      }
      f.setNow(now); f.SessionStorage_default.serverTick = now;
      const shown = display(f);
      expect(shown.every(Number.isFinite)).toBe(true);
      const roundedX = Math.round(shown[0]!), roundedY = Math.round(shown[1]!);
      expect(f.cells[roundedX + roundedY * 24]! & 2).toBe(2);
      expect(shown[0] === 10 || shown[1] === 1).toBe(true);
      const distance = shown[0]! + shown[1]! - previous[0]! - previous[1]!;
      expect(distance, `frame ${now}`).toBeCloseTo(dt / 150, 4);
      expect(shown[2]).toBeCloseTo(shown[0]! + shown[1]!, 5);
      f.entity.walkProcess();
      expect(display(f)).toEqual(shown);
      previous = shown;
    }
  });
});

describe('native render frame clock', () => {
  function mapRenderFixture() {
    const f = fixture();
    const source = ts.createSourceFile('map.js', region('src/Renderer/MapRenderer.js', patched), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const methods: ts.MethodDeclaration[] = [];
    function visit(node: ts.Node) {
      if (ts.isMethodDeclaration(node) && node.name.getText(source) === 'onRender') methods.push(node);
      ts.forEachChild(node, visit);
    }
    visit(source); expect(methods).toHaveLength(1);
    Object.assign(f.MapRenderer, { fog: {}, light: {} });
    Object.assign(f.context, {
      PostProcess: { prepare: vi.fn(), render: vi.fn() }, Map_default: { fog: false },
      Mouse: { world: {}, intersect: false }, Camera: { update: vi.fn() },
      Effects_default: { spam: vi.fn() }, MemoryManager: { clean: vi.fn() },
    });
    for (const name of ['Ground_default', 'Sky_default', 'Models_default', 'AnimatedModels_default',
      'GR2ModelRenderer_default', 'ScreenEffectManager', 'Water_default', 'Damage', 'SignboardManager', 'Sounds_default']) {
      f.context[name] = { render: vi.fn() };
    }
    Object.assign(f.context.EffectManager, { render: vi.fn() });
    Object.assign(f.EntityManager, { render: vi.fn() });
    const render = vm.runInContext('(' + methods[0]!.getText(source).replace(/^static\s+onRender/, 'function onRender') + ')', f.context) as (tick: number, gl: object) => void;
    return { ...f, render };
  }

  it('pins camera and both native entity render passes to the supplied frame time despite wall-clock drift', () => {
    const f = mapRenderFixture(); beginWalk(f);
    const samples: number[][] = [];
    (f.context.Camera as { update: () => void }).update = () => { f.setNow(10101); samples.push(display(f)); };
    (f.EntityManager as typeof f.EntityManager & { render: () => void }).render = () => {
      f.setNow(10102); f.entity.walkProcess(); samples.push(display(f));
    };
    f.render(10100, {});
    expect(samples).toHaveLength(3);
    for (const sample of samples) expect(sample[0]).toBeCloseTo(1 + 100 / 150, 5);
    expect(samples[1]).toEqual(samples[0]); expect(samples[2]).toEqual(samples[0]);
    expect(vm.runInContext('lastroMovementFrameTick', f.context)).toBeUndefined();
    f.setNow(10150); f.SessionStorage_default.serverTick = 10150;
    expect(display(f)).toEqual([2, 1, 3]);
  });

  it.each([undefined, 10020])('restores previous frame clock %s when a native renderer throws', previous => {
    const f = mapRenderFixture();
    f.context.previousFrameTime = previous;
    vm.runInContext('lastroMovementFrameTick = previousFrameTime;', f.context);
    (f.context.PostProcess as { prepare: () => void }).prepare = () => { throw new Error('gl failed'); };
    expect(() => f.render(10100, {})).toThrow('gl failed');
    expect(vm.runInContext('lastroMovementFrameTick', f.context)).toBe(previous);
  });
});

describe('movement prediction patch source anchors', () => {
  const smallWalkSource = region('src/Renderer/Entity/EntityWalk.js', patchRuntimeMovementSync(synchronized));
  const smallSkillSource = `//#region src/Engine/MapEngine/Skill.js
function onSkillResult(pkt) {
  if (pkt.result) return;
  fixtureResults.push(pkt.SKID);
}
//#endregion`;

  it.each(['LF', 'CRLF', 'mixed'] as const)('normalizes the skill-failure hook with %s endings', endings => {
    let source = smallWalkSource + '\n' + smallSkillSource;
    if (endings === 'CRLF') source = source.replace(/\r?\n/g, '\r\n');
    if (endings === 'mixed') source = source.split('\n').map((line, index) => line.replace(/\r$/, '') + (index % 2 ? '\r' : '')).join('\n');
    const output = region('src/Engine/MapEngine/Skill.js', patchRuntimeMovementPrediction(source));
    expect(output).toContain('  lastroRejectMovementSkill(pkt);\n  if (pkt.result) return;');
    const fixtureResults: number[] = [], rejected: number[] = [];
    const context = vm.createContext({ fixtureResults, lastroRejectMovementSkill: (packet: { SKID: number }) => rejected.push(packet.SKID) });
    vm.runInContext(output + '\nonSkillResult({ SKID: 28, result: 0 });', context);
    expect(fixtureResults).toEqual([28]); expect(rejected).toEqual([28]);
  });

  it.each(['missing-function', 'duplicate-function', 'missing-return', 'duplicate-return', 'duplicate-region'] as const)(
    'rejects the small skill-failure source with %s', problem => {
      let source = smallSkillSource;
      if (problem === 'missing-function') source = source.replace('function onSkillResult(', 'function differentSkillResult(');
      if (problem === 'duplicate-function') source = source.replace('//#endregion', declaration(source, 'onSkillResult') + '\n//#endregion');
      if (problem === 'missing-return') source = source.replace('  if (pkt.result) return;', '  if (pkt.result) { return; }');
      if (problem === 'duplicate-return') source = source.replace('  if (pkt.result) return;', '  if (pkt.result) return;\n  if (pkt.result) return;');
      if (problem === 'duplicate-region') source += '\n' + smallSkillSource;
      expect(() => patchRuntimeMovementPrediction(smallWalkSource + '\n' + source)).toThrow('anchor:movement-prediction');
    },
  );

  it('renders sprite, camera and GR2 through display coordinates while network and game state keep authority', () => {
    for (const [name, visual] of [
      ['src/Renderer/Entity/EntityRender.js', 'lastroMovementVisual(this)'],
      ['src/Renderer/Camera.js', 'lastroMovementVisual(this.target)'],
      ['src/Renderer/GR2/GR2ModelRenderer.js', 'lastroMovementVisual(entity)'],
      ['src/Renderer/Entity/EntityAttachments.js', 'lastroMovementVisual(this.entity)'],
      ['src/Renderer/Effects/Damage.js', 'lastroMovementVisual(damage.entity)'],
    ]) {
      const output = region(name!, patched);
      expect(output).toContain(visual);
      const parsed = ts.createSourceFile(name!, output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      let invalidWrites = 0;
      function visualWrite(node: ts.Node): boolean {
        if (ts.isCallExpression(node) && node.expression.getText(parsed).startsWith('lastroMovementVisual')) return true;
        return ts.forEachChild(node, visualWrite) || false;
      }
      function inspect(node: ts.Node) {
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
          && visualWrite(node.left)) invalidWrites++;
        if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node))
          && (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)
          && visualWrite(node.operand)) invalidWrites++;
        ts.forEachChild(node, inspect);
      }
      inspect(parsed); expect(invalidWrites).toBe(0);
    }
    expect(region('src/Engine/MapEngine/Main.js', patched)).toBe(region('src/Engine/MapEngine/Main.js', patchRuntimeMovementSync(synchronized)));
    expect(patchRuntimeMovementPrediction('const unrelated = 1;')).toBe('const unrelated = 1;');
    expect(region('src/Utils/PathFinding.js', patchRuntimeMovementPrediction(patchRuntimeMovementSync(patchRuntimeEntitySync(vendor)))))
      .toBe(region('src/Utils/PathFinding.js'));
    expect(region('src/Renderer/GR2/GR2ModelRenderer.js', patched)).toContain('lastroMovementVisual(e)');
    expect(region('src/Renderer/GR2/GR2ModelRenderer.js', patched)).toContain('lastroMovementVisualDirection(e)');
  });

  it('serializes runtime helpers without importing test-runner aliases into the embedded runtime', () => {
    const output = patchViteRuntimeMovementPrediction(patchRuntimeMovementSync(synchronized));
    expect(output).not.toContain('__vite_ssr_import_');
    const f = fixture(output);
    f.functions.sendPacket(moveRequest()); frame(f, 10075);
    expect(display(f)).toEqual([1.5, 1, 2.5]);
  });

  it.each(['LF', 'CRLF', 'mixed'] as const)('patches %s endings into equivalent parsed runtime behavior', endings => {
    let source = patchRuntimeMovementSync(synchronized);
    if (endings === 'CRLF') source = source.replace(/\r?\n/g, '\r\n');
    if (endings === 'mixed') source = source.split('\n').map((line, index) => line.replace(/\r$/, '') + (index % 2 ? '\r' : '')).join('\n');
    const f = fixture(patchRuntimeMovementPrediction(source));
    f.functions.sendPacket(moveRequest()); frame(f, 10075);
    expect(display(f)).toEqual([1.5, 1, 2.5]); expect(Array.from(f.entity.position)).toEqual([1, 1, 2]);
  });

  it('rejects duplicate regions, missing required anchors and second installation', () => {
    const synchronizedMovement = patchRuntimeMovementSync(synchronized);
    expect(() => patchRuntimeMovementPrediction(synchronizedMovement + region('src/Renderer/Camera.js'))).toThrow('anchor:movement-prediction');
    expect(() => patchRuntimeMovementPrediction(synchronizedMovement.replace('function walkTo(', 'function movedWalkTo('))).toThrow('anchor:movement-prediction');
    expect(() => patchRuntimeMovementPrediction(synchronizedMovement.replace('  send(pkt.buffer);', '  sendDifferent(pkt.buffer);'))).toThrow('anchor:movement-prediction');
    expect(() => patchRuntimeMovementPrediction(synchronized)).toThrow('anchor:movement-prediction:requires-sync');
    expect(() => patchRuntimeMovementPrediction(patched)).toThrow('anchor:movement-prediction:installed');
  });
});
