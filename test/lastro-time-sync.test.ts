import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeEntitySync } from '../scripts/lastro-entity-sync.mjs';
import { patchRuntimeFrameTiming } from '../scripts/lastro-frame-timing.mjs';
import { patchRuntimeMovementPrediction } from '../scripts/lastro-movement-prediction.mjs';
import { patchRuntimeMovementSync } from '../scripts/lastro-movement-sync.mjs';
import { patchRuntimeTimeSync } from '../scripts/lastro-time-sync.mjs';

const vendor = readFileSync(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
function region(source: string, name: string) {
  const start = source.indexOf(`//#region ${name}`);
  if (start < 0) throw new Error(name);
  return source.slice(start, source.indexOf('//#endregion', start) + '//#endregion'.length);
}
const base = [
  'src/Core/Events.js', 'src/Renderer/Renderer.js', 'src/Network/LastROProtocol.js',
  'src/Renderer/Entity/EntityWalk.js', 'src/Engine/MapEngine/Entity.js',
  'src/Engine/MapEngine/Main.js', 'src/Engine/MapEngine.js', 'src/Network/NetworkManager.js',
  'src/Renderer/Entity/EntityState.js',
].map(name => region(vendor, name)).join('\n');
const prepared = patchRuntimeMovementPrediction(patchRuntimeMovementSync(patchRuntimeEntitySync(patchRuntimeFrameTiming(base))));
const patched = patchRuntimeTimeSync(prepared);
const parsed = ts.createSourceFile('runtime.js', patched, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function declaration(name: string) {
  const found = parsed.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (found.length !== 1) throw new Error(name);
  return found[0]!.getText(parsed);
}
const engine = region(patched, 'src/Engine/MapEngine.js');
const setupStart = engine.indexOf('          const hbt = new PACKET.CZ.HBT();');
const setupEnd = engine.indexOf('          SessionStorage_default.Playing = true;', setupStart);
if (setupStart < 0 || setupEnd < 0) throw new Error('native time-sync setup');
const setup = engine.slice(setupStart, setupEnd + '          SessionStorage_default.Playing = true;'.length);
const accepted = declaration('onConnectionAccepted$2');
const entryPrefix = accepted.slice(0, accepted.indexOf('  SessionStorage_default.Entity.onWalkEnd = onWalkEnd;')) + '}';
const renderer = region(patched, 'src/Renderer/Renderer.js');
const clock = renderer.slice(renderer.indexOf('let lastroServerClockMark'), renderer.indexOf('var mat4$9'));

interface Packet {
  constructor: { name: string }; clientTime?: number; build(): { buffer: ArrayBuffer; view: DataView };
}
interface Ping {
  returned: boolean; pingTime: number; pongTime: number; value: number;
  lastroSentAt?: number; lastroSentMono?: number; _lastroUnansweredSince?: number;
}
interface TimeState {
  socket: Socket; ready: boolean; lastSent: number; urgentUntil: number;
}
interface Socket {
  connected: boolean; isZone: boolean; handoffPending: boolean; _lastroTimeSync?: TimeState;
}
function fixture(options: { lastro?: boolean; disabled?: boolean; heartbeat?: boolean; packetVersion?: number } = {}) {
  let now = 0;
  let timer: (() => void) | undefined;
  let failure: false | 'return' | 'throw' = false;
  const packets: { name: string; clientTime?: number; at: number }[] = [];
  const entity = { walk: { total: 0 }, _lastroMotion: { pending: null as unknown } };
  const ping: Ping = { returned: true, pingTime: 0, pongTime: 0, value: 0 };
  const session = { Entity: entity, ping, Playing: false, serverTick: 0 };
  const socket: Socket = { connected: true, isZone: true, handoffPending: false };
  const MapRenderer = { loading: false };
  const config: Record<string, unknown> = {
    lastroProtocol: options.lastro ?? true,
    disableMapTimeSync: options.disabled ?? false,
    sec_HBT: options.heartbeat ?? false,
  };
  const setPing = vi.fn((callback: () => void) => { timer = callback; });
  const network = { setPing, sendPacket: vi.fn<(packet: Packet) => boolean | undefined>() };
  const predict = vi.fn();
  const resetMovementSession = vi.fn();
  const cancelApprovedMovement = vi.fn();
  const transmit = vi.fn();
  function packet(name: string): Packet {
    return {
      constructor: { name }, clientTime: 0,
      build: () => ({ buffer: new ArrayBuffer(6), view: new DataView(new ArrayBuffer(6)) }),
    };
  }
  const context = vm.createContext({
    Date: { now: () => 1_000_000 + now }, performance: { now: () => now },
    SessionStorage_default: session, _socket: socket, MapRenderer,
    Configs: { get: (key: string, fallback: unknown) => config[key] ?? fallback },
    Network: network, PacketVerManager_default: { value: options.packetVersion ?? 20180307 },
    PACKET: { CZ: {
      HBT: function PACKET_CZ_HBT() { return packet('PACKET_CZ_HBT'); },
      REQUEST_TIME: function PACKET_CZ_REQUEST_TIME() { return packet('PACKET_CZ_REQUEST_TIME'); },
      REQUEST_TIME2: function PACKET_CZ_REQUEST_TIME2() { return packet('PACKET_CZ_REQUEST_TIME2'); },
    } },
    packetDump: false, PacketCrypt_default: { process: vi.fn() }, send: transmit,
    console: { warn: vi.fn(), info: vi.fn() }, lastroPredictSentMovement: predict,
    lastroCheckMovementConnection: () => true,
    lastroMovementViewState: (subject: unknown) => subject === entity ? entity._lastroMotion : null,
    lastroReleaseSkillStop: vi.fn(), lastroRetireMovementPrediction: vi.fn(),
    lastroResetMovementSession: resetMovementSession,
    lastroCancelApprovedMovement: cancelApprovedMovement,
  });
  vm.runInContext([
    clock,
    ...['shouldSendMapTimeSync', 'getMapTimeSyncInterval', 'lastroRunTimeSync', 'lastroStartTimeSync',
      'lastroReadyTimeSync', 'lastroNoteTimeSyncActivity', 'lastroNoteTimeSyncPacket',
      'lastroMarkMovementHit', 'onPong', 'sendPacket'].map(declaration),
    entryPrefix, 'function initializeNativeTimeSync() {\n' + setup + '\n}',
  ].join('\n'), context);
  const api = vm.runInContext('({ initialize: initializeNativeTimeSync, accepted: onConnectionAccepted$2, pong: onPong, send: sendPacket, hit: lastroMarkMovementHit, activity: lastroNoteTimeSyncActivity, advance: LastROAdvanceServerTick })', context) as {
    initialize(): void; accepted(packet: { startTime: number }): void; pong(packet: { time: number }): void;
    send(packet: Packet): void; hit(entity: unknown, packet: { attackMT: number; attackedMT: number; count: number }): void;
    activity(entity: unknown): void; advance(): number;
  };
  network.sendPacket.mockImplementation(request => {
    if (failure && /REQUEST_TIME2?$/.test(request.constructor.name)) {
      if (failure === 'throw') throw new Error('closed socket');
      return false;
    }
    packets.push({ name: request.constructor.name, clientTime: request.clientTime, at: now });
    api.send(request);
  });
  api.initialize();
  return {
    api, context, session, entity, ping, socket, MapRenderer, network, packets, transmit, predict, packet, resetMovementSession, cancelApprovedMovement,
    setNow(value: number) { now = value; },
    poll(value: number) { now = value; timer?.(); },
    accept() { api.accepted({ startTime: 10_000 }); },
    pong(value: number) { now = value; api.pong({ time: 10_000 + value }); },
    fail(value: typeof failure) { failure = value; },
  };
}

describe('native adaptive server-time synchronization', () => {
  it.each([20180307, 20170315])('waits for ACCEPT_ENTER then takes the first clock sample immediately (version %s)', packetVersion => {
    const h = fixture({ packetVersion });
    expect(h.network.setPing).toHaveBeenCalledWith(expect.any(Function), 250);
    h.poll(250);
    expect(h.packets).toEqual([]);
    h.accept();
    expect(h.resetMovementSession).toHaveBeenCalledExactlyOnceWith(h.entity, 'zone-accept');
    expect(h.packets).toEqual([{ name: packetVersion >= 20180307 ? 'PACKET_CZ_REQUEST_TIME2' : 'PACKET_CZ_REQUEST_TIME', clientTime: 250, at: 250 }]);
    expect(h.session.serverTick).toBe(10_000);
    expect(h.ping.lastroSentMono).toBe(250);
    expect(h.ping.returned).toBe(false);
  });

  it('uses a 5 second idle interval after the short entry window', () => {
    const h = fixture(); h.accept(); h.pong(100);
    h.poll(4999);
    expect(h.packets).toHaveLength(1);
    h.poll(5000);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 5000]);
  });

  it.each(['approved', 'prediction'])('samples an active %s walk every 1 second after the urgent window', mode => {
    const h = fixture(); h.accept(); h.pong(100);
    if (mode === 'approved') h.entity.walk.total = 8;
    else h.entity._lastroMotion.pending = { route: {} };
    h.poll(2000); h.pong(2100);
    h.poll(2999);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2000]);
    h.poll(3000);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2000, 3000]);
  });

  it.each(['PACKET_CZ_USE_SKILL', 'PACKET_CZ_USE_SKILL2', 'PACKET_CZ_USE_SKILL_TOGROUND', 'PACKET_CZ_USE_SKILL_TOGROUND2', 'PACKET_CZ_USE_SKILL_TOGROUND3', 'PACKET_CZ_REQUEST_ACT2'])('reacts to a sent %s with a bounded 500 ms sampling window', name => {
    const h = fixture(); h.accept(); h.pong(100); h.setNow(2500);
    h.api.send(h.packet(name));
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2500]);
    h.pong(2600); h.poll(2999);
    expect(h.packets).toHaveLength(2);
    h.poll(3000); h.pong(3100);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2500, 3000]);
    h.poll(4500);
    expect(h.packets).toHaveLength(3);
    h.poll(8000);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2500, 3000, 8000]);
  });

  it('reacts to a real self-hit hook but ignores another actor', () => {
    const h = fixture(); h.accept(); h.pong(100); h.setNow(2500);
    h.api.hit({}, { attackMT: 100, attackedMT: 150, count: 1 });
    expect(h.packets).toHaveLength(1);
    expect(h.cancelApprovedMovement).not.toHaveBeenCalled();
    h.api.hit(h.entity, { attackMT: 100, attackedMT: 150, count: 1 });
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2500]);
    expect(h.cancelApprovedMovement).toHaveBeenCalledExactlyOnceWith(h.entity);
    h.pong(2600); h.poll(3000);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 2500, 3000]);
  });

  it('only creates REQUEST_TIME packets and never resends a movement destination', () => {
    const h = fixture(); h.accept(); h.pong(100); h.setNow(2500);
    const move = h.packet('PACKET_CZ_REQUEST_MOVE2');
    h.api.send(move); h.entity.walk.total = 8;
    h.pong(2600); h.poll(3000); h.pong(3100); h.poll(4500); h.pong(4600); h.poll(5500);
    expect(h.packets.every(packet => /^PACKET_CZ_REQUEST_TIME2?$/.test(packet.name))).toBe(true);
    expect(h.predict.mock.calls.filter(([request]) => request === move)).toHaveLength(1);
    expect(h.transmit).toHaveBeenCalledTimes(h.packets.length + 1);
  });

  it('keeps one in-flight request and preserves its timestamp during activity and a missing pong', () => {
    const h = fixture(); h.accept();
    const sent = { mono: h.ping.lastroSentMono, wall: h.ping.lastroSentAt, client: h.ping.pingTime, unanswered: h.ping._lastroUnansweredSince };
    for (let tick = 250; tick <= 60_000; tick += 250) {
      h.poll(tick); h.api.activity(h.entity);
    }
    expect(h.packets).toHaveLength(1);
    expect({ mono: h.ping.lastroSentMono, wall: h.ping.lastroSentAt, client: h.ping.pingTime, unanswered: h.ping._lastroUnansweredSince }).toEqual(sent);
    h.pong(60_100);
    expect(h.ping.returned).toBe(true);
    expect(h.ping.lastroSentMono).toBeUndefined();
    h.poll(60_250);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 60_250]);
  });

  it('measures a delayed pong from its original request and releases the sample without rewinding the clock', () => {
    const h = fixture(); h.accept();
    h.poll(500); h.api.activity(h.entity); h.poll(1000);
    h.pong(1200);
    expect(h.ping.value).toBe(1200);
    expect(h.ping.returned).toBe(true);
    const before = h.session.serverTick;
    h.setNow(1216);
    expect(h.api.advance()).toBeGreaterThanOrEqual(before + 16);
    h.poll(1250);
    expect(h.packets.map(packet => packet.at)).toEqual([0, 1250]);
  });

  it('retains the security heartbeat at 15 seconds even while a pong is outstanding', () => {
    const h = fixture({ heartbeat: true }); h.accept();
    for (let tick = 250; tick <= 30_000; tick += 250) h.poll(tick);
    expect(h.packets).toEqual([
      { name: 'PACKET_CZ_REQUEST_TIME2', clientTime: 0, at: 0 },
      { name: 'PACKET_CZ_HBT', clientTime: 0, at: 15_000 },
      { name: 'PACKET_CZ_HBT', clientTime: 0, at: 30_000 },
    ]);
  });

  it.each(['old-socket', 'handoff', 'disconnected', 'login-socket', 'not-playing'])('does not send when the session is %s', state => {
    const h = fixture({ heartbeat: true }); h.accept(); h.pong(100);
    if (state === 'old-socket') h.context._socket = { connected: true, isZone: true, handoffPending: false };
    if (state === 'handoff') h.socket.handoffPending = true;
    if (state === 'disconnected') h.socket.connected = false;
    if (state === 'login-socket') h.socket.isZone = false;
    if (state === 'not-playing') h.session.Playing = false;
    h.poll(15_000); h.api.activity(h.entity);
    expect(h.packets).toHaveLength(1);
  });

  it('ignores a queued old timer after restarting synchronization on the same socket', () => {
    const h = fixture(); h.accept(); h.pong(80);
    const oldTimer = h.network.setPing.mock.calls[0]![0];
    h.api.initialize(); h.accept(); h.pong(100);
    const count = h.packets.length;
    h.setNow(6000); oldTimer();
    expect(h.packets).toHaveLength(count);
    h.poll(6000);
    expect(h.packets).toHaveLength(count + 1);
    expect(h.packets.at(-1)).toEqual({ name: 'PACKET_CZ_REQUEST_TIME2', clientTime: 5920, at: 6000 });
  });

  it('defers time queries while a map is loading and starts promptly when loading finishes', () => {
    const h = fixture({ heartbeat: true }); h.MapRenderer.loading = true; h.accept();
    h.poll(15_000);
    expect(h.packets).toEqual([{ name: 'PACKET_CZ_HBT', clientTime: 0, at: 15_000 }]);
    h.MapRenderer.loading = false; h.poll(15_250);
    expect(h.packets.at(-1)).toEqual({ name: 'PACKET_CZ_REQUEST_TIME2', clientTime: 15_250, at: 15_250 });
  });

  it.each(['return', 'throw'] as const)('rolls back an unsent in-flight sample after a send failure (%s)', failure => {
    const h = fixture(); h.fail(failure); h.accept();
    expect(h.ping.returned).toBe(true);
    expect(h.ping.lastroSentMono).toBeUndefined();
    expect(h.ping._lastroUnansweredSince).toBeUndefined();
    expect(h.packets).toEqual([]);
    h.fail(false); h.poll(499);
    expect(h.packets).toEqual([]);
    h.poll(500);
    expect(h.packets.map(packet => packet.at)).toEqual([500]);
  });

  it.each([{ lastro: false }, { disabled: true }, { disabled: true, heartbeat: true }])('preserves the ordinary or disabled schedule (%j)', options => {
    const h = fixture(options); h.accept(); h.setNow(2500); h.api.send(h.packet('PACKET_CZ_USE_SKILL'));
    h.api.hit(h.entity, { attackMT: 100, attackedMT: 150, count: 1 });
    expect(h.socket._lastroTimeSync).toBeUndefined();
    expect(h.packets).toEqual([]);
    if (!options.disabled) expect(h.network.setPing).toHaveBeenCalledWith(expect.any(Function), 10_000);
    else if (options.heartbeat) {
      expect(h.network.setPing).toHaveBeenCalledWith(expect.any(Function), 15_000);
      h.poll(15_000);
      expect(h.packets.map(packet => packet.name)).toEqual(['PACKET_CZ_HBT']);
    } else expect(h.network.setPing).not.toHaveBeenCalled();
  });

  it('rejects duplicate regions and already installed synchronization', () => {
    expect(() => patchRuntimeTimeSync(patched)).toThrow('anchor:time-sync');
    expect(() => patchRuntimeTimeSync(prepared + '\n' + region(prepared, 'src/Engine/MapEngine.js'))).toThrow('anchor:time-sync');
    expect(patchRuntimeTimeSync('unrelated fixture')).toBe('unrelated fixture');
  });

  it.each(['LF', 'CRLF', 'mixed'])('keeps hit activity without capture hooks and rejects altered anchors with %s endings', endings => {
    function lines(source: string) {
      if (endings === 'CRLF') return source.replaceAll('\n', '\r\n');
      if (endings === 'mixed') return source.split('\n').map((line, index) => line + (index % 2 ? '\r' : '')).join('\n');
      return source;
    }
    const result = patchRuntimeTimeSync(lines(prepared)).replaceAll('\r\n', '\n');
    expect(result).toBe(patched);
    expect(result).toContain('  lastroNoteTimeSyncActivity(entity);\n  const duration = packet.attackMT + packet.attackedMT');
    expect(result).not.toMatch(/lastroTraceMovementEvent|lastroMovementTrace|movement-diagnostics/);
    for (const anchor of ['            Network.setPing(\n', '  SessionStorage_default.Entity.onWalkEnd = onWalkEnd;',
      'lastroPredictSentMovement(Packet);', '  const duration = packet.attackMT + packet.attackedMT']) {
      expect(() => patchRuntimeTimeSync(lines(prepared.replace(anchor, '// changed anchor')))).toThrow('anchor:time-sync');
      expect(() => patchRuntimeTimeSync(lines(prepared.replace(anchor, anchor + anchor)))).toThrow('anchor:time-sync');
    }
  });
});
