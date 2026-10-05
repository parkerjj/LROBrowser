// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLastroMovementInput, patchRuntimeMovementInput, refreshLastroGroundInput } from '../scripts/lastro-movement-input.mjs';
import { patchRuntimeFrameTiming } from '../scripts/lastro-frame-timing.mjs';
import { findLastroPredictedServerPath } from '../scripts/lastro-walk-prediction.mjs';
import { patchRuntimeEntitySync } from '../scripts/lastro-entity-sync.mjs';
import { patchRuntimeMovementSync } from '../scripts/lastro-movement-sync.mjs';
import { patchRuntimeMovementPrediction } from '../scripts/lastro-movement-prediction.mjs';

const dispose: (() => void)[] = [];
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(0); });
afterEach(() => { dispose.splice(0).forEach(fn => fn()); vi.useRealTimers(); vi.restoreAllMocks(); document.body.replaceChildren(); });
const clock = { setTimeout: (callback: () => void, ms: number) => setTimeout(callback, ms),
  clearTimeout: (id: unknown) => clearTimeout(id as ReturnType<typeof setTimeout>) };
function inputFixture(retargetInterval?: number) {
  const state = { target: { x: 10, y: 20 }, map: 'prontera', player: {}, ready: true,
    approved: null as { x: number; y: number } | null };
  const send = vi.fn<(target: { x: number; y: number }) => boolean>(() => true), cancelNavigation = vi.fn(), error = vi.fn();
  const input = createLastroMovementInput({ getTarget: () => state.target, getContext: () => ({ map: state.map, player: state.player }),
    canMove: () => state.ready, sendMove: send, getApprovedTarget: () => state.approved,
    onManualMove: cancelNavigation, onError: error, retargetInterval, clock, now: () => Date.now() });
  return { input, state, send, cancelNavigation, error };
}

describe('manual movement input scheduler', () => {
  it('accepts the first click at time zero and retains a quick second click after release', () => {
    const f = inputFixture(); expect(f.input.request()).toBe(true); f.input.stop();
    vi.advanceTimersByTime(100); f.state.target = { x: 30, y: 40 }; f.input.request(); f.input.stop();
    f.state.target = { x: 90, y: 90 }; vi.advanceTimersByTime(99); expect(f.send).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1); expect(f.send.mock.calls.map(call => call[0])).toEqual([{ x: 10, y: 20 }, { x: 30, y: 40 }]);
    vi.advanceTimersByTime(1000); expect(f.send).toHaveBeenCalledTimes(2);
  });
  it('coalesces rapid clicks to the latest valid destination while retaining 200ms packet spacing', () => {
    const f = inputFixture(); f.input.request(); f.input.stop();
    for (const x of [20, 30, 40]) { vi.advanceTimersByTime(50); f.state.target = { x, y: 5 }; f.input.request(); f.input.stop(); }
    vi.advanceTimersByTime(50); expect(f.send.mock.calls.map(call => call[0])).toEqual([{ x: 10, y: 20 }, { x: 40, y: 5 }]);
    expect(f.cancelNavigation).toHaveBeenCalledTimes(4);
  });
  it('does not replace a queued valid click with an invalid picker result', () => {
    const f = inputFixture(); f.input.request(); f.input.stop(); vi.advanceTimersByTime(50);
    f.state.target = { x: 30, y: 40 }; f.input.request(); f.input.stop(); f.state.target = { x: -1, y: -1 };
    expect(f.input.request()).toBe(false); vi.advanceTimersByTime(150);
    expect(f.send).toHaveBeenLastCalledWith({ x: 30, y: 40 });
  });
  it('preserves the native 500ms held-button repeat and stops repetition on release', () => {
    const f = inputFixture(); f.input.request(); f.state.target = { x: 30, y: 40 };
    vi.advanceTimersByTime(499); expect(f.send).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1);
    expect(f.send).toHaveBeenLastCalledWith({ x: 30, y: 40 }); f.input.stop(); vi.advanceTimersByTime(2000);
    expect(f.send).toHaveBeenCalledTimes(2);
  });
  it.each(['map', 'player', 'freeze', 'cancel'])('cancels pending input after %s changes', change => {
    const f = inputFixture(); f.input.request(); f.input.stop(); vi.advanceTimersByTime(50); f.state.target.x = 30; f.input.request();
    if (change === 'map') f.state.map = 'geffen';
    if (change === 'player') f.state.player = {};
    if (change === 'freeze') f.state.ready = false;
    if (change === 'cancel') f.input.cancel();
    vi.advanceTimersByTime(1000); expect(f.send).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it('recovers errors without leaving a held repeat or sending a later stale request', () => {
    const f = inputFixture(); f.send.mockImplementation(() => { throw new Error('offline socket is closed'); });
    expect(f.input.request()).toBe(false); expect(f.error).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1000); expect(f.send).toHaveBeenCalledOnce();
  });
  it('does not depend on renderer/server time for click throttling', () => {
    const f = inputFixture(); f.input.request(); f.input.stop(); vi.advanceTimersByTime(100); f.state.target.x = 30; f.input.request(); f.input.stop();
    vi.advanceTimersByTime(100); expect(f.send).toHaveBeenCalledTimes(2);
  });
  it('coalesces changed LastRO destinations to the latest click at 100ms while keeping same targets at 200ms', () => {
    const f = inputFixture(100); f.input.request(); f.input.stop();
    for (const x of [20, 30, 40]) {
      vi.advanceTimersByTime(25); f.state.target = { x, y: 5 }; f.input.request(); f.input.stop();
    }
    vi.advanceTimersByTime(24); expect(f.send).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1);
    expect(f.send.mock.calls.map(call => call[0])).toEqual([{ x: 10, y: 20 }, { x: 40, y: 5 }]);
    vi.advanceTimersByTime(25); f.input.request(); f.input.stop();
    vi.advanceTimersByTime(174); expect(f.send).toHaveBeenCalledTimes(2); vi.advanceTimersByTime(1);
    expect(f.send).toHaveBeenCalledTimes(3); expect(f.send).toHaveBeenLastCalledWith({ x: 40, y: 5 });
  });
  it('lets a newer changed target supersede a queued same-target request using the shorter interval', () => {
    const f = inputFixture(100); f.input.request(); f.input.stop();
    vi.advanceTimersByTime(25); f.input.request(); f.input.stop();
    vi.advanceTimersByTime(25); f.state.target = { x: 30, y: 40 }; f.input.request(); f.input.stop();
    vi.advanceTimersByTime(50); expect(f.send.mock.calls.map(call => call[0])).toEqual([{ x: 10, y: 20 }, { x: 30, y: 40 }]);
    vi.advanceTimersByTime(1000); expect(f.send).toHaveBeenCalledTimes(2);
  });
  it('limits repeated retargeting to ten successful sends per second', () => {
    const f = inputFixture(100), sentAt: number[] = [];
    f.send.mockImplementation(() => { sentAt.push(Date.now()); return true; });
    f.input.request(); f.input.stop();
    for (let tick = 1; tick <= 1000; tick++) {
      vi.advanceTimersByTime(1); f.state.target = { x: tick, y: 5 }; f.input.request(); f.input.stop();
    }
    expect(sentAt.filter(tick => tick < 1000)).toHaveLength(10);
    for (let index = 1; index < sentAt.length; index++) expect(sentAt[index]! - sentAt[index - 1]!).toBeGreaterThanOrEqual(100);
  });
  it.each(['map', 'player'])('starts fresh after a %s context change while retaining the absolute send flood limit', change => {
    const f = inputFixture(100); f.input.request(); f.input.stop();
    vi.advanceTimersByTime(25);
    if (change === 'map') f.state.map = 'geffen'; else f.state.player = {};
    f.input.request(); f.input.stop();
    vi.advanceTimersByTime(74); expect(f.send).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1);
    expect(f.send).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(100); f.input.request(); f.input.stop();
    expect(f.send).toHaveBeenCalledTimes(2); vi.advanceTimersByTime(100); expect(f.send).toHaveBeenCalledTimes(3);
  });
  it('does not charge failed sends against destination or context throttling', () => {
    const f = inputFixture(100); f.send.mockReturnValueOnce(false);
    f.input.request(); f.input.stop();
    vi.advanceTimersByTime(25); f.input.request(); f.input.stop();
    expect(f.send).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(25); f.state.target = { x: 30, y: 40 }; f.input.request(); f.input.stop();
    vi.advanceTimersByTime(74); expect(f.send).toHaveBeenCalledTimes(2); vi.advanceTimersByTime(1);
    expect(f.send).toHaveBeenCalledTimes(3);
  });
  it('avoids resending an approved destination on click but retains the 500ms held retry', () => {
    const f = inputFixture(100); f.state.approved = { ...f.state.target };
    expect(f.input.request()).toBe(true); expect(f.send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(499); expect(f.send).not.toHaveBeenCalled(); vi.advanceTimersByTime(1);
    expect(f.send).toHaveBeenCalledOnce(); f.input.stop(); vi.advanceTimersByTime(1000);
    expect(f.send).toHaveBeenCalledOnce();
  });
  it('deduplicates a queued same-target resend that the server has approved before its scheduled send', () => {
    const f = inputFixture(100); f.input.request(); f.input.stop();
    vi.advanceTimersByTime(25); f.input.request(); f.input.stop();
    f.state.approved = { ...f.state.target }; vi.advanceTimersByTime(1000);
    expect(f.send).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it.each([false, true])('sends a click back to the old approved target after a newer successful send, with in-flight ACK=%s', acknowledgeNewer => {
    const f = inputFixture(100), oldTarget = { ...f.state.target }, newerTarget = { x: 30, y: 40 }, sentAt: number[] = [];
    f.send.mockImplementation(() => { sentAt.push(Date.now()); return true; });
    f.state.approved = oldTarget; f.input.request(); f.input.stop(); expect(f.send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000); f.state.target = newerTarget; f.input.request(); f.input.stop();
    vi.advanceTimersByTime(50); f.state.target = oldTarget; f.input.request(); f.input.stop();
    vi.advanceTimersByTime(25); if (acknowledgeNewer) f.state.approved = newerTarget;
    vi.advanceTimersByTime(24); expect(f.send).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1);
    expect(f.send.mock.calls.map(call => call[0])).toEqual([newerTarget, oldTarget]); expect(sentAt).toEqual([1000, 1100]);
    f.state.approved = oldTarget; f.input.request(); f.input.stop(); vi.advanceTimersByTime(1000);
    expect(f.send).toHaveBeenCalledTimes(2);
  });
  it('does not treat a failed newer send as a command that must supersede an already approved target', () => {
    const f = inputFixture(100), oldTarget = { ...f.state.target };
    f.state.approved = oldTarget; f.input.request(); f.input.stop();
    vi.advanceTimersByTime(1000); f.state.target = { x: 30, y: 40 }; f.send.mockReturnValueOnce(false); f.input.request(); f.input.stop();
    vi.advanceTimersByTime(50); f.state.target = oldTarget; f.input.request(); f.input.stop();
    expect(f.send).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
    f.state.target = { x: 40, y: 50 }; f.input.request(); f.input.stop(); expect(f.send).toHaveBeenCalledTimes(2);
  });
});

const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
function region(path: string) {
  const start = vendor.indexOf('//#region ' + path); expect(start).toBeGreaterThan(-1);
  return vendor.slice(start, vendor.indexOf('//#endregion', start) + '//#endregion'.length);
}
const native = ['src/Engine/MapEngine.js', 'src/Controls/MapControl.js', 'src/Renderer/MapRenderer.js'].map(region).join('\n');
const patched = patchRuntimeMovementInput(native);
interface NativeParts { functions: Map<string, string>; factory: string; init: string; hover: string; setMap: string; navigate: string; }
function extract(source: string): NativeParts {
  const file = ts.createSourceFile('Native.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS), functions = new Map<string, string>();
  let factory = '', init = '', hover = '', setMap = '', navigate = '';
  const names = new Set(['onRequestWalk', 'onRequestStopWalk', 'walkIntervalProcess', 'checkFreeCell', 'isFreeCell', 'selectLastroMovementTarget', 'onMouseDown', 'onMouseUp', 'onMouseUpCapture', 'onMapChange', 'cleanGameUI']);
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && names.has(node.name?.text || '')) functions.set(node.name!.text, node.getText(file));
    if (ts.isVariableStatement(node) && node.declarationList.declarations.some(decl => decl.name.getText(file) === 'refreshLastroGroundInput')) functions.set('ground', node.getText(file));
    if (ts.isBinaryExpression(node) && node.left.getText(file) === 'MapControl._lastroMovementInput') factory = node.getText(file) + ';';
    if (ts.isBinaryExpression(node) && node.left.getText(file) === 'Navigation.navigateTo') navigate = node.getText(file) + ';';
    if (ts.isMethodDeclaration(node)) {
      if (node.name.getText(file) === 'init' && node.body?.getText(file).includes('Mobile.init')) init = 'MapControl.init = function() ' + node.body.getText(file) + ';';
      if (node.name.getText(file) === '_setupMouseMode') hover = 'component._setupMouseMode = function() ' + node.body!.getText(file) + ';';
      if (node.name.getText(file) === 'setMap') setMap = 'MapRenderer.setMap = function(mapname) ' + node.body!.getText(file) + ';';
    }
    ts.forEachChild(node, visit);
  }
  visit(file); return { functions, factory, init, hover, setMap, navigate };
}
const baselineParts = extract(native), parts = extract(patched);
const skillNetworkRuntime = patchRuntimeMovementPrediction(patchRuntimeMovementSync(patchRuntimeEntitySync([
  'src/Renderer/Entity/EntityWalk.js', 'src/Engine/MapEngine/Entity.js', 'src/Engine/MapEngine.js',
  'src/Network/NetworkManager.js', 'src/Renderer/Entity/EntityState.js',
].map(region).join('\n'))));
const skillNetworkFile = ts.createSourceFile('skill-network.js', skillNetworkRuntime, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const skillGatewayNames = ['sendPacket', 'send', 'lastroMovementClock', 'lastroMovementViewState',
  'lastroRetireMovementPrediction',
  'lastroPredictSentMovement', 'lastroFailedMovementSend', 'lastroCancelApprovedMovement',
  'createLastroPositionReconciler', 'findLastroServerWalkPath'];
const skillGatewayDeclarations = skillGatewayNames.map(name => {
  const functions = skillNetworkFile.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (functions.length !== 1) throw new Error('skill network declaration: ' + name);
  return functions[0]!.getText(skillNetworkFile);
}).join('\n');
const hoverParts = extract(region('src/UI/GUIComponent.js'));
const navigationParts = extract(patchRuntimeMovementInput(region('src/UI/Components/Navigation/Navigation.js')));
const eventsRuntime = patchRuntimeFrameTiming(region('src/Core/Events.js').replace(/\r\n/g, '\n'));
const managerFile = ts.createSourceFile('EntityManager.js', region('src/Renderer/EntityManager.js'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const managerForEach = managerFile.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'forEach')!.getText(managerFile);
const managerPicker = managerFile.statements.filter(node => ts.isFunctionDeclaration(node) && ['intersect', 'sortByPriority'].includes(node.name?.text || '')).map(node => node.getText(managerFile)).join('\n');
const entityControlSource = region('src/Controls/EntityControl.js');
const patchedEntityControl = patchRuntimeMovementInput(entityControlSource);
function entityControlMethods(source: string): Record<string, string> {
  const file = ts.createSourceFile('EntityControl.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const methods: Record<string, string> = {};
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node)) methods[node.name.getText(file)] = 'function() ' + node.body!.getText(file);
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'lastroCanPassPlayerClick') methods.lastroCanPassPlayerClick = node.getText(file);
    ts.forEachChild(node, visit);
  }
  visit(file); return methods;
}
const pcMethods = entityControlMethods(patchedEntityControl), baselinePCMethods = entityControlMethods(entityControlSource);
const pcMouseDown = pcMethods.onMouseDown!;
interface OccupancyEntity { objecttype: number; position: number[]; constructor: { TYPE_EFFECT: number; TYPE_UNIT: number; TYPE_TRAP: number }; }
function occupant(x: number, y: number, objecttype = 0): OccupancyEntity {
  return { objecttype, position: [x, y], constructor: { TYPE_EFFECT: 9, TYPE_UNIT: 10, TYPE_TRAP: 11 } };
}

function nativeFixture(patch = true, actualEvents?: 'current' | 'previous', options: { lastro?: boolean; planner?: boolean } = {}) {
  const source = patch ? parts : baselineParts;
  const canvas = document.createElement('canvas'), overlay = document.createElement('div'); document.body.append(canvas, overlay);
  const calls: string[] = [], sent: { dest?: number[]; kind: string }[] = [];
  const player = { position: [1, 1], action: 0, ACTION: { SIT: 1, DIE: 2 }, headDir: 0, direction: 0,
    walk: null as { path: number[]; index: number; total: number } | null,
    lookTo: vi.fn(), constructor: { TYPE_EFFECT: 9, TYPE_UNIT: 10, TYPE_TRAP: 11 } };
  const session = { Entity: player as typeof player | null, FreezeUI: false, moveAction: null, autoFollow: false, TouchTargeting: false,
    captchaGetIdOnEntityClick: false, captchaGetIdOnFloorClick: false, mapState: { isPVP: false, isGVG: false } };
  const mouse = { screen: { x: 5, y: 5, width: 300, height: 300 }, world: { x: 10, y: 20, z: 0 }, intersect: true, state: 0, MOUSE_STATE: { NORMAL: 0, USESKILL: 2 } };
  const map = { currentMap: 'prontera.gat', loading: false, setMap: vi.fn<(name: string) => void>(), onLoad: () => {} };
  const keys = { SHIFT: false, ALT: false, CTRL: false }, renderer = { tick: 1000, canvas };
  let pickTarget: { x: number; y: number } | null = { x: 30, y: 40 }, free: ((x: number, y: number) => boolean) = () => true;
  const altitude = { width: 300, height: 300, TYPE: { WALKABLE: 1 }, getCellType: (x: number, y: number) => x >= 0 && y >= 0 && x < 300 && y < 300 && free(x, y) ? 1 : 0,
    getCellHeight: () => 2, intersect: vi.fn((_view: unknown, _projection: unknown, point: Int16Array) => {
      if (!pickTarget) return false; point[0] = pickTarget.x; point[1] = pickTarget.y; return true;
    }) };
  type MoveInput = ReturnType<typeof createLastroMovementInput>;
  const control = { onRequestWalk: () => {}, onRequestStopWalk: () => {}, _lastroMovementInput: undefined as MoveInput | undefined, init: () => {} };
  const cleanup: (() => void)[] = [];
  function listen(target: Window | Document, type: string, handler: EventListener, options?: boolean) {
    target.addEventListener(type, handler, options); cleanup.push(() => target.removeEventListener(type, handler, options));
  }
  let hidden = false;
  const camera = { modelView: [], projection: [], action: { active: false }, rotate: vi.fn() };
  let overEntity: unknown = null;
  const entityManager = { getFocusEntity: () => null, getOverEntity: () => overEntity, setFocusEntity: vi.fn(),
    setOverEntity: vi.fn((entity: unknown) => { overEntity = entity; }), intersect: vi.fn<() => unknown>(() => null), forEach: vi.fn() };
  const entities: OccupancyEntity[] = [];
  const component = { _host: overlay, mouseMode: 0, _setupShadowCursorEvents: vi.fn(), _setupMouseMode: () => {}, focus: vi.fn() };
  class Move { dest = [0, 0]; kind = 'move2'; }
  class LegacyMove extends Move { kind = 'move'; }
  class Direction { kind = 'direction'; }
  const context = vm.createContext({ document: { addEventListener: (type: string, handler: EventListener) => listen(document, type, handler), get hidden() { return hidden; } },
    window: { addEventListener: (type: string, handler: EventListener, options?: boolean) => listen(window, type, handler, options) },
    Date, performance: { now: () => Date.now() }, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    Events: clock, Mouse: mouse, MapControl: control, MapRenderer: map,
    SessionStorage_default: session, KEYS: keys, Renderer: renderer, Altitude: altitude, Camera: camera,
    Configs: { get: (name: string, fallback: unknown) => name === 'lastroProtocol' ? options.lastro === true : fallback },
    EntityManager: entityManager, Entity: { TYPE_EFFECT: 9, TYPE_TRAP: 11 }, Controls_default: { noctrl: false, noshift: false },
    Navigation_default: { clear: vi.fn(() => calls.push('navigation')) },
    LastROTools: { _lastroPanels: { cancelRoute: vi.fn(() => calls.push('tools')) }, _lastroQuestRoute: { cancel: vi.fn(() => calls.push('quest')) } },
    PacketVerManager_default: { value: 20211103 }, PACKET: { CZ: { REQUEST_MOVE: LegacyMove, REQUEST_MOVE2: Move, CHANGE_DIRECTION: Direction, CHANGE_DIRECTION2: Direction } },
    Network: { sendPacket: vi.fn((packet: Move) => { sent.push({ kind: packet.kind, dest: packet.dest ? [...packet.dest] : undefined }); calls.push('packet'); }) },
    SkillTargetSelection_default: { onMapMouseDown: vi.fn(() => true) }, Mobile: { init: vi.fn() },
    Cursor: { ACTION: { DEFAULT: 0, ROTATE: 1 }, setType: vi.fn() }, AIDriver: { setmsg: vi.fn() },
    _rightClickPosition: new Int16Array(2), _walkTimer: null, _walkLastTick: 0,
    onMouseWheel: vi.fn(), onDragOver: vi.fn(), onDrop$6: vi.fn(), onAutoFollow: vi.fn(),
    component, GUIComponent: { MouseMode: { STOP: 0, CROSS: 1 } }, _Cursor: { ACTION: { DEFAULT: 0 }, setType: vi.fn() }, _EntityManager: entityManager,
    WhisperBox: { clearAll: vi.fn() }, console: { warn: vi.fn() },
    _list: entities,
  });
  const needed = ['onRequestWalk', 'onRequestStopWalk', 'walkIntervalProcess', 'checkFreeCell', 'isFreeCell', 'selectLastroMovementTarget', 'onMouseDown', 'onMouseUp', 'onMouseUpCapture', 'ground'];
  vm.runInContext(pcMethods.lastroCanPassPlayerClick!, context);
  if (options.planner) vm.runInContext(findLastroPredictedServerPath.toString(), context);
  if (actualEvents) vm.runInContext('function __esmMin(fn) { return () => fn(); }\n' + eventsRuntime + '\ninit_Events();', context);
  const factory = actualEvents === 'previous' ? source.factory.replace('clock: globalThis', 'clock: Events') : source.factory;
  vm.runInContext(managerForEach + '\nEntityManager.forEach = forEach;\n' + needed.map(name => source.functions.get(name) || '').join('\n') + '\n' + factory
    + '\nMapControl.onRequestWalk=onRequestWalk; MapControl.onRequestStopWalk=onRequestStopWalk;\n' + source.init + '\n' + hoverParts.hover, context);
  control.init();
  dispose.push(() => { control._lastroMovementInput?.cancel(); cleanup.forEach(fn => fn()); });
  const down = (target: HTMLElement = canvas, x = 100, y = 120) => target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: x, clientY: y }));
  const up = (target: HTMLElement = canvas) => target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
  return { context, control, mouse, map, session, keys, renderer, altitude, calls, sent, component, entityManager, entities, canvas, overlay, down, up,
    setPick: (target: typeof pickTarget) => { pickTarget = target; }, setFree: (predicate: typeof free) => { free = predicate; }, setHidden: (value: boolean) => { hidden = value; } };
}

type ScheduledSkillRequest = 'USE_SKILL' | 'USE_SKILL2' | 'USE_SKILL_TOGROUND' | 'USE_SKILL_TOGROUND2' | 'USE_SKILL_TOGROUND3';
function skillSchedulerFixture(lastro = true) {
  const f = nativeFixture(true, undefined, { lastro });
  const player = f.session.Entity!;
  player.position.push(2);
  player.walk = { path: [1, 1, 2, 1, 3, 1], index: 2, total: 6 };
  Object.assign(player.walk, { speed: 150, dist: 0 });
  const socket = { connected: true, isZone: true, handoffPending: false, send: vi.fn() };
  Object.assign(f.context, { _socket: socket, packetDump: false, lastroMovementFrameTick: undefined,
    PacketCrypt_default: { process: vi.fn() }, lastroCheckMovementConnection: () => true, lastroMovementBlocked: () => false,
    init_CodepageManager: () => {}, __esmMin: (callback: () => void) => callback });
  vm.runInContext(skillGatewayDeclarations + '\n' + region('src/Utils/BinaryWriter.js') + '\ninit_BinaryWriter();', f.context);
  const failedMovementSend = vi.fn(f.context.lastroFailedMovementSend as (packet: { SKID: number }) => void);
  f.context.lastroFailedMovementSend = failedMovementSend;
  function sendSkill(name: ScheduledSkillRequest = 'USE_SKILL2') {
    const start = vendor.indexOf('  PACKET.CZ.' + name + ' = function');
    const build = vendor.indexOf('  PACKET.CZ.' + name + '.prototype.build = function', start);
    const end = vendor.indexOf('\n  PACKET.', build + 1);
    if (start < 0 || build < start || end < build) throw new Error('Missing native skill request ' + name);
    const versions: Partial<Record<ScheduledSkillRequest, number[]>> = {
      USE_SKILL: [0, 275, 10, 2, 4, 6], USE_SKILL_TOGROUND: [0, 278, 10, 2, 4, 6, 8],
    };
    f.context.scheduledSkillRequestName = name; f.context.scheduledSkillVersion = versions[name];
    vm.runInContext(vendor.slice(start, end) + `\nsendPacket((() => {
      const packet = new PACKET.CZ[scheduledSkillRequestName]();
      packet.SKID = 28; packet.selectedLevel = 1;
      packet.getPacketVersion = () => scheduledSkillVersion;
      return packet;
    })());`, f.context);
  }
  return { ...f, player, socket, sendSkill, failedMovementSend };
}

describe('successful skill sending retires stale manual movement input', () => {
  it.each(['USE_SKILL', 'USE_SKILL2', 'USE_SKILL_TOGROUND', 'USE_SKILL_TOGROUND2', 'USE_SKILL_TOGROUND3'] as const)(
    'cancels the real 100ms input queue after successful native %s without cancelling the approved walk', name => {
      const f = skillSchedulerFixture(); f.down(); f.up();
      vi.advanceTimersByTime(25); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
      expect(f.sent).toHaveLength(1); expect(vi.getTimerCount()).toBe(1);
      const walk = f.player.walk, position = [...f.player.position];
      f.sendSkill(name); expect(f.socket.send).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0); vi.advanceTimersByTime(1000);
      expect(f.sent).toHaveLength(1); expect(f.player.walk).toBe(walk); expect(f.player.walk?.total).toBe(6);
      expect(f.player.position).toEqual(position);
      f.down(); f.up(); expect(f.sent).toHaveLength(2); expect(f.sent[1]!.dest).toEqual([60, 70]);
    },
  );

  it.each(['USE_SKILL', 'USE_SKILL2', 'USE_SKILL_TOGROUND', 'USE_SKILL_TOGROUND2', 'USE_SKILL_TOGROUND3'] as const)(
    'cancels the held 500ms input repeat after successful native %s', name => {
      const f = skillSchedulerFixture(); f.down(); expect(f.sent).toHaveLength(1);
      vi.advanceTimersByTime(25); f.sendSkill(name); expect(f.socket.send).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0); vi.advanceTimersByTime(2000);
      expect(f.sent).toHaveLength(1); expect(f.player.walk?.total).toBe(6);
    },
  );

  it.each(['throw', 'closed', 'handoff'] as const)('retains pending and held floor input when a native skill send is %s', failure => {
    const f = skillSchedulerFixture(); f.down(); f.up();
    vi.advanceTimersByTime(25); f.setPick({ x: 60, y: 70 }); f.down();
    if (failure === 'throw') f.socket.send.mockImplementation(() => { throw new Error('socket closed'); });
    if (failure === 'closed') f.socket.connected = false;
    if (failure === 'handoff') f.socket.handoffPending = true;
    if (failure === 'throw') expect(() => f.sendSkill()).toThrow('socket closed'); else f.sendSkill();
    if (failure === 'throw') expect(f.failedMovementSend).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ SKID: 28 }));
    else expect(f.failedMovementSend).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(1); vi.advanceTimersByTime(75);
    expect(f.sent).toHaveLength(2); vi.advanceTimersByTime(500); expect(f.sent).toHaveLength(3);
    f.up(); vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(3);
  });

  it('leaves non-LastRO manual movement scheduling unchanged after a successful skill send', () => {
    const f = skillSchedulerFixture(false); f.down(); f.up();
    vi.advanceTimersByTime(25); f.setPick({ x: 60, y: 70 }); f.down();
    f.sendSkill(); expect(f.socket.send).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(175); expect(f.sent).toHaveLength(2);
    vi.advanceTimersByTime(500); expect(f.sent).toHaveLength(3); expect(f.player.walk?.total).toBe(6);
    f.up();
  });
});

function friendlyPCFixture(baseline = false) {
  const f = nativeFixture(!baseline);
  const methods = baseline ? baselinePCMethods : pcMethods;
  const nativeControls = vm.runInContext('({' + ['onMouseDown', 'onFocus', 'canAttackEntity', 'onContextMenu']
    .map(name => name + ':' + methods[name]).join(',') + '})', f.context) as Record<string, (this: unknown) => boolean>;
  const pc = {
    ...occupant(100, 100), GID: 555, GUID: 0, display: { name: 'friend' },
    constructor: { TYPE_PC: 0, TYPE_EFFECT: 9, TYPE_UNIT: 10, TYPE_TRAP: 11 },
    onMouseDown: vi.fn((): boolean => nativeControls.onMouseDown!.call(pc)),
    onFocus: vi.fn((): boolean => nativeControls.onFocus!.call(pc)),
    canAttackEntity: vi.fn((): boolean => nativeControls.canAttackEntity!.call(pc)),
    onMouseUp: vi.fn(), onFocusEnd: vi.fn(),
    onContextMenu: vi.fn((): boolean => nativeControls.onContextMenu!.call(pc)),
  };
  const captcha = vi.fn(), floorCaptcha = vi.fn();
  Object.assign(f.context, { CaptchaSelector_default: { addPlayer: captcha, requestPlayersIds: floorCaptcha } });
  f.entityManager.intersect.mockReturnValue(pc); f.entityManager.setOverEntity(pc);
  return { ...f, pc, captcha, floorCaptcha };
}

describe('LastRO runtime destination scheduling', () => {
  it.each([{ lastro: true, interval: 100 }, { lastro: false, interval: 200 }])('uses changed-target interval $interval with LastRO=$lastro and keeps same targets at 200ms', ({ lastro, interval }) => {
    const f = nativeFixture(true, undefined, { lastro }); f.down(); f.up();
    vi.advanceTimersByTime(25);
    f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    vi.advanceTimersByTime(interval - 26); expect(f.sent).toHaveLength(1);
    vi.advanceTimersByTime(1); expect(f.sent).toHaveLength(2); f.down(); f.up();
    vi.advanceTimersByTime(199); expect(f.sent).toHaveLength(2); vi.advanceTimersByTime(1); expect(f.sent).toHaveLength(3);
  });
  it('deduplicates a confirmed native walk destination while allowing its held 500ms retry', () => {
    const f = nativeFixture(true, undefined, { lastro: true });
    f.session.Entity!.walk = { path: [1, 1, 10, 1], index: 2, total: 4 };
    f.setPick({ x: 10, y: 1 }); f.down();
    expect(f.sent).toHaveLength(0); vi.advanceTimersByTime(499); expect(f.sent).toHaveLength(0);
    vi.advanceTimersByTime(1); expect(f.sent).toEqual([{ kind: 'move2', dest: [10, 1] }]);
    f.up(); vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(1);
  });
  it('does not charge a native false network result as a successful send', () => {
    const f = nativeFixture(true, undefined, { lastro: true });
    const network = f.context.Network as { sendPacket: (packet: unknown) => boolean | void };
    const send = vi.spyOn(network, 'sendPacket').mockReturnValueOnce(false);
    f.down(); f.up(); expect(f.sent).toHaveLength(0);
    vi.advanceTimersByTime(25); f.down(); f.up();
    expect(send).toHaveBeenCalledTimes(2); expect(f.sent).toHaveLength(1);
  });
  it.each([false, true])('retains a native click back to B while C is in flight, with C acknowledgement=%s', acknowledgeNewer => {
    const f = nativeFixture(true, undefined, { lastro: true });
    f.session.Entity!.walk = { path: [1, 1, 10, 1], index: 2, total: 4 };
    f.setPick({ x: 10, y: 1 }); f.down(); f.up(); expect(f.sent).toHaveLength(0);
    vi.advanceTimersByTime(1000); f.setPick({ x: 20, y: 1 }); f.down(); f.up();
    vi.advanceTimersByTime(50); f.setPick({ x: 10, y: 1 }); f.down(); f.up();
    vi.advanceTimersByTime(25);
    if (acknowledgeNewer) f.session.Entity!.walk = { path: [1, 1, 20, 1], index: 2, total: 4 };
    vi.advanceTimersByTime(24); expect(f.sent).toHaveLength(1); vi.advanceTimersByTime(1);
    expect(f.sent).toEqual([{ kind: 'move2', dest: [20, 1] }, { kind: 'move2', dest: [10, 1] }]);
    f.session.Entity!.walk = { path: [1, 1, 10, 1], index: 2, total: 4 };
    f.down(); f.up(); vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(2);
  });
  it('does not create a runtime in-flight destination when the newer native send fails', () => {
    const f = nativeFixture(true, undefined, { lastro: true });
    f.session.Entity!.walk = { path: [1, 1, 10, 1], index: 2, total: 4 };
    const network = f.context.Network as { sendPacket: (packet: unknown) => boolean | void };
    const send = vi.spyOn(network, 'sendPacket').mockReturnValueOnce(false);
    f.setPick({ x: 20, y: 1 }); f.down(); f.up();
    vi.advanceTimersByTime(50); f.setPick({ x: 10, y: 1 }); f.down(); f.up(); vi.advanceTimersByTime(1000);
    expect(send).toHaveBeenCalledOnce(); expect(f.sent).toHaveLength(0); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['map', 'player'])('does not inherit the same-target 200ms delay after a runtime %s change', change => {
    const f = nativeFixture(true, undefined, { lastro: true }); f.down(); f.up();
    vi.advanceTimersByTime(25);
    if (change === 'map') f.map.currentMap = 'geffen.gat'; else f.session.Entity = { ...f.session.Entity! };
    f.down(); f.up(); vi.advanceTimersByTime(75);
    expect(f.sent).toHaveLength(2); vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(2);
  });
});

describe('LastRO runtime reachable movement targets', () => {
  const reachableFixture = () => nativeFixture(true, undefined, { lastro: true, planner: true });
  it('does not replace a walkable unreachable click with a destination on the near side of a wall', () => {
    const lastro = reachableFixture();
    const clickAcrossWall = (f: ReturnType<typeof nativeFixture>) => {
      f.entities.push(occupant(1, 1));
      f.setFree((x, y) => y === 1 && x >= 1 && x <= 6 && x !== 5);
      f.setPick({ x: 6, y: 1 }); f.down(); f.up();
    };
    clickAcrossWall(lastro);
    expect(lastro.sent).toHaveLength(0);
    dispose.pop()?.();
    const other = nativeFixture(true, undefined, { planner: true }); clickAcrossWall(other);
    expect(other.sent).toEqual([{ kind: 'move2', dest: [6, 1] }]);
  });
  it('moves to a reachable neighbour when the clicked tile itself is solid ground', () => {
    const f = reachableFixture(); f.entities.push(occupant(1, 1));
    f.setFree((x, y) => y === 1 && x >= 1 && x <= 6 && x !== 5);
    f.setPick({ x: 5, y: 1 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [4, 1] }]);
  });
  it('does not send an unreachable diagonal through two blocked cardinal neighbours', () => {
    const f = reachableFixture(); f.entities.push(occupant(1, 1));
    f.setFree((x, y) => x === 1 && y === 1 || x === 2 && y === 2);
    f.setPick({ x: 2, y: 2 }); f.down(); f.up();
    expect(f.sent).toHaveLength(0);
  });
  it('prefers a close reachable empty landing cell with lower server path cost and scans a large crowd once', () => {
    const f = reachableFixture();
    f.entities.push(occupant(1, 1), occupant(5, 5), ...Array.from({ length: 1500 }, (_, index) => occupant(100 + index % 100, 200)));
    const scan = vi.spyOn(f.entityManager, 'forEach');
    f.setPick({ x: 5, y: 5 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [5, 4] }]);
    expect(scan).toHaveBeenCalledOnce();
  });
  it('retains an exact reachable crowded corridor target when there is no empty landing cell', () => {
    const f = reachableFixture(); f.entities.push(occupant(1, 1), occupant(2, 1));
    f.setFree((x, y) => y === 1 && (x === 1 || x === 2)); f.setPick({ x: 2, y: 1 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [2, 1] }]);
  });
  it.each([9, 10, 11])('retains the native excluded occupancy type %s for reachable exact landing cells', type => {
    const f = reachableFixture(); f.entities.push(occupant(5, 5, type));
    f.setPick({ x: 5, y: 5 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [5, 5] }]);
  });
  it('refreshes rounded actor occupancy for a later click instead of caching it across requests', () => {
    const f = reachableFixture(); f.entities.push(occupant(5.4, 5.4));
    f.setPick({ x: 5, y: 5 }); f.down(); f.up(); expect(f.sent[0]?.dest).toEqual([5, 4]);
    f.entities[0]!.position = [100, 100]; vi.advanceTimersByTime(200); f.down(); f.up();
    expect(f.sent[1]?.dest).toEqual([5, 5]);
  });
  it('checks an active walk from the scheduled next center at the 32-step range boundary', () => {
    const f = reachableFixture();
    f.session.Entity!.position = [1.2, 1]; f.session.Entity!.walk = { path: [1, 1, 2, 1, 3, 1], index: 2, total: 6 };
    const selector = vi.spyOn(f.context, 'selectLastroMovementTarget');
    f.setPick({ x: 34, y: 1 }); f.down(); f.up();
    expect(selector).toHaveBeenCalledOnce(); expect(f.sent).toEqual([{ kind: 'move2', dest: [34, 1] }]);
  });
  it('sends an active next-center destination even when it is also the rounded current position', () => {
    const f = reachableFixture();
    f.session.Entity!.position = [1.7, 1]; f.session.Entity!.walk = { path: [1, 1, 2, 1, 3, 1, 4, 1], index: 2, total: 8 };
    f.entities.push(occupant(1.7, 1));
    f.setPick({ x: 2, y: 1 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [2, 1] }]);
  });
  it('keeps distant clicks on the legacy path instead of treating a bounded planner limit as unreachable terrain', () => {
    const f = reachableFixture(), selector = vi.spyOn(f.context, 'selectLastroMovementTarget');
    f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    expect(selector).not.toHaveBeenCalled(); expect(f.sent).toEqual([{ kind: 'move2', dest: [60, 70] }]);
  });
  it('keeps legacy landing selection when a standalone input runtime has no prediction planner', () => {
    const f = nativeFixture(true, undefined, { lastro: true });
    f.setFree((x, y) => y === 1 && x >= 1 && x <= 6 && x !== 5); f.setPick({ x: 6, y: 1 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [6, 1] }]);
  });
  it('embeds a self-contained selector without Vite test-runner aliases in its serialized body', () => {
    expect(patched).not.toContain('__vite_ssr_import_');
    const f = reachableFixture(); f.setPick({ x: 5, y: 5 }); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [5, 5] }]);
  });
});

describe('actual MapControl and MapEngine movement', () => {
  it('reproduces the original lost second click within its 200ms throttle', () => {
    const f = nativeFixture(false); f.control.onRequestWalk(); f.control.onRequestStopWalk();
    f.renderer.tick += 100; f.mouse.world.x = 50; f.control.onRequestWalk(); f.control.onRequestStopWalk();
    vi.advanceTimersByTime(1000); expect(f.sent).toEqual([{ kind: 'move2', dest: [10, 20] }]);
  });
  it('sends the captured second click after release despite the old renderer tick moving backwards', () => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(100); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    f.renderer.tick = -100000; f.mouse.world.x = 200; f.mouse.world.y = 201; vi.advanceTimersByTime(100);
    expect(f.sent).toEqual([{ kind: 'move2', dest: [30, 40] }, { kind: 'move2', dest: [60, 70] }]);
    vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(2);
  });
  it.each(['previous', 'current'] as const)('keeps a released second ground click %s the render-event queue dependency', mode => {
    const f = nativeFixture(true, mode);
    const events = f.context.Events as { process: (tick: number) => void };
    events.process(0); f.down(); f.up(); vi.advanceTimersByTime(100);
    f.setPick({ x: 60, y: 70 }); f.down(); f.up(); vi.advanceTimersByTime(100);
    // Before the fix, browser time alone cannot deliver this pending input.
    expect(f.sent).toHaveLength(mode === 'previous' ? 1 : 2);
    events.process(200);
    expect(f.sent).toEqual([{ kind: 'move2', dest: [30, 40] }, { kind: 'move2', dest: [60, 70] }]);
    vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(2);
  });
  it.each(['previous', 'current'] as const)('preserves packet spacing with a crowded render-event backlog in the %s factory', mode => {
    const f = nativeFixture(true, mode);
    const events = f.context.Events as { setTimeout: (callback: () => void, delay: number) => void; process: (tick: number) => void };
    events.process(0); const processed = vi.fn();
    for (let index = 0; index < 1500; index++) events.setTimeout(processed, 150);
    f.down(); f.up(); vi.advanceTimersByTime(100); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    vi.advanceTimersByTime(99); expect(f.sent).toHaveLength(1); vi.advanceTimersByTime(1);
    events.process(200); expect(processed).toHaveBeenCalledTimes(256);
    expect(f.sent).toHaveLength(mode === 'previous' ? 1 : 2);
    // Native rendering keeps ownership of its own queue; input adds no queue work.
    while (processed.mock.calls.length < 1500) { vi.advanceTimersByTime(16); events.process(Date.now()); }
    expect(f.sent).toEqual([{ kind: 'move2', dest: [30, 40] }, { kind: 'move2', dest: [60, 70] }]);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('cancels both automated routes before clearing native navigation and requesting movement', () => {
    const f = nativeFixture(); f.down();
    expect(f.calls.slice(0, 3)).toEqual(['tools', 'quest', 'navigation']); expect(f.calls.at(-1)).toBe('packet');
  });
  it('uses native GAT/occupied-cell search to select a walkable neighbour and never sends a solid wall', () => {
    const f = nativeFixture(); f.setFree((x, y) => x === 29 && y === 39); f.down(); f.up();
    expect(f.sent).toEqual([{ kind: 'move2', dest: [29, 39] }]); vi.advanceTimersByTime(200);
    f.setFree(() => false); f.down(); f.up(); expect(f.sent).toHaveLength(1);
  });
  it('retains native free-cell order for crowds, rounded positions, exclusions, terrain, and map edges', () => {
    const baseline = nativeFixture(false), optimized = nativeFixture();
    const search = (fixture: ReturnType<typeof nativeFixture>, x: number, y: number, range: number) =>
      vm.runInContext(`(() => { const out = [-1, -1]; return { found: checkFreeCell(${x}, ${y}, ${range}, out), out }; })()`, fixture.context);
    for (let seed = 1; seed <= 10; seed++) for (const [x, y] of [[30, 40], [0, 0], [299, 299]] as [number, number][]) {
      const entities = Array.from({ length: 120 }, (_, index) => occupant(
        x + ((index * 7 + seed) % 19) - 9 + (index % 2 ? 0.4 : 0.6),
        y + ((index * 11 + seed) % 19) - 9 + (index % 3 ? -0.4 : -0.6),
        [0, 3, 6, 9, 10, 11][index % 6]));
      for (const fixture of [baseline, optimized]) {
        fixture.entities.splice(0, fixture.entities.length, ...entities);
        fixture.setFree((cx, cy) => (cx * 3 + cy * 7 + seed) % 5 !== 0);
      }
      for (const position of [[1, 1], [200, 200]] as [number, number][]) {
        baseline.session.Entity!.position = [...position]; optimized.session.Entity!.position = [...position];
        for (const range of [0, 1, 3, 9]) expect(search(optimized, x, y, range)).toEqual(search(baseline, x, y, range));
      }
    }
  });
  it('scans a packed crowd once instead of 1330 times while retaining the walkable target fallback', () => {
    const baseline = nativeFixture(false), optimized = nativeFixture();
    const crowd: OccupancyEntity[] = [];
    for (let x = 21; x <= 39; x++) for (let y = 31; y <= 49; y++) crowd.push(occupant(x, y));
    while (crowd.length < 1500) crowd.push(occupant(100 + crowd.length % 100, 200));
    for (const fixture of [baseline, optimized]) fixture.entities.push(...crowd);
    const oldScan = vi.spyOn(baseline.entityManager, 'forEach'), newScan = vi.spyOn(optimized.entityManager, 'forEach');
    const search = (fixture: ReturnType<typeof nativeFixture>) => vm.runInContext('checkFreeCell(30, 40, 9, [])', fixture.context);
    expect(search(baseline)).toBe(false); expect(search(optimized)).toBe(false);
    expect(oldScan).toHaveBeenCalledTimes(1330); expect(newScan).toHaveBeenCalledOnce();
    optimized.down(); optimized.up(); vi.advanceTimersByTime(1000);
    expect(optimized.sent).toEqual([{ kind: 'move2', dest: [30, 40] }]);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([20170201, 20211103])('keeps native MOVE selection at an occupied walkable corridor end for packet version %i', version => {
    const baseline = nativeFixture(false), optimized = nativeFixture();
    for (const fixture of [baseline, optimized]) {
      (fixture.context.PacketVerManager_default as { value: number }).value = version;
      // Include the current player: both usable corridor cells are occupied.
      fixture.entities.push(occupant(1, 1), occupant(2, 1));
      fixture.setFree((x, y) => y === 1 && (x === 1 || x === 2));
      fixture.mouse.world.x = 2; fixture.mouse.world.y = 1; fixture.setPick({ x: 2, y: 1 });
    }
    vm.runInContext('onMouseDown.call(MapControl,{which:1}); onMouseUp.call(MapControl,{which:1});', baseline.context);
    const nativeChoice = baseline.sent.map(packet => ({ ...packet, dest: packet.dest ? [...packet.dest] : undefined }));
    optimized.down(); optimized.up(); vi.advanceTimersByTime(1000);
    expect(optimized.sent).toEqual(nativeChoice);
    expect(nativeChoice).toEqual([{ kind: version >= 20180307 ? 'move2' : 'move', dest: [2, 1] }]);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('refreshes the crowd snapshot for each new click instead of keeping old occupied cells', () => {
    const f = nativeFixture(); f.entities.push(occupant(30, 40)); f.down(); f.up();
    expect(f.sent[0]?.dest).toEqual([31, 41]);
    f.entities[0]!.position = [100, 100]; vi.advanceTimersByTime(200); f.down(); f.up();
    expect(f.sent[1]?.dest).toEqual([30, 40]);
  });
  it('does not scan the crowd when every candidate is an unwalkable terrain cell', () => {
    const f = nativeFixture(); f.entities.push(...Array.from({ length: 1500 }, (_, index) => occupant(index % 300, 200)));
    f.setFree(() => false); const scan = vi.spyOn(f.entityManager, 'forEach'); f.down(); f.up();
    expect(scan).not.toHaveBeenCalled(); expect(f.sent).toHaveLength(0); expect(vi.getTimerCount()).toBe(0);
  });
  it('clears a stale player hover when the actual crowd picker sees empty ground, while retaining protected touch player clicks', () => {
    const f = nativeFixture();
    const onMouseDown = vm.runInContext('(' + pcMouseDown + ')', f.context) as () => boolean;
    const players = Array.from({ length: 1500 }, (_, index) => ({ ...occupant(100 + index % 100, 200),
      GID: index + 1, depth: 1, action: 0, ACTION: { DIE: 2 }, remove_tick: 0,
      constructor: { TYPE_PC: 0, TYPE_EFFECT: 9, TYPE_UNIT: 10, TYPE_TRAP: 11 },
      boundingRect: { x1: 1, y1: 1, x2: 20, y2: 20 }, onMouseDown, onFocus: vi.fn(() => false),
      onMouseUp: vi.fn(), onFocusEnd: vi.fn(),
    }));
    f.entities.push(...players); f.entityManager.setOverEntity(players[0]);
    Object.assign(f.context, { _pickSortDirty: true, _pickList: [], _lastSupportPriority: false, _supportPriority: false,
      GraphicsSettings: { performanceMode: false }, Entity: { TYPE_PC: 0, PickingPriority: { Normal: { 0: 0 }, Support: { 0: 0 } } } });
    vm.runInContext(managerPicker + '\nEntityManager.intersect = intersect;', f.context);
    f.down(f.canvas, 170, 180); f.up();
    expect(f.entityManager.getOverEntity()).toBeNull(); expect(f.sent).toEqual([{ kind: 'move2', dest: [30, 40] }]);
    f.session.TouchTargeting = true;
    vi.advanceTimersByTime(200); f.down(f.canvas, 10, 10); f.up();
    expect(f.entityManager.getOverEntity()).toBe(players[99]); expect(f.sent).toHaveLength(1);
    expect(players[99]!.GID).toBe(100); expect(players.every(player => player.onFocus.mock.calls.length === 0)).toBe(true);
  });
  it('keeps legacy packet selection and the native seated/Shift direction action', () => {
    const f = nativeFixture(); (f.context.PacketVerManager_default as { value: number }).value = 20170201; f.down(); f.up();
    expect(f.sent[0]?.kind).toBe('move'); f.keys.SHIFT = true; f.down(); f.up();
    expect(f.session.Entity?.lookTo).toHaveBeenCalledWith(30, 40); expect(f.sent.at(-1)?.kind).toBe('direction');
  });
  it.each(['loading', 'freeze', 'skill', 'dead', 'missing-player', 'bounds'])('retains the %s movement gate', mode => {
    const f = nativeFixture();
    if (mode === 'loading') f.map.loading = true;
    if (mode === 'freeze') f.session.FreezeUI = true;
    if (mode === 'skill') f.mouse.state = 2;
    if (mode === 'dead') f.session.Entity!.action = 2;
    if (mode === 'missing-player') f.session.Entity = null;
    if (mode === 'bounds') f.setPick({ x: 300, y: 40 });
    f.down(); f.up(); vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(0);
  });
  it('updates the picker with actual click coordinates before native entity/floor handling', () => {
    const f = nativeFixture(); f.down(f.canvas, 170, 180); f.up();
    expect(f.mouse.screen).toMatchObject({ x: 170, y: 180 }); expect(f.altitude.intersect).toHaveBeenCalledOnce();
    expect(f.entityManager.intersect).toHaveBeenCalledOnce(); expect(f.sent[0]?.dest).toEqual([30, 40]);
  });
  it('recovers a real GUI hover lock after hide only on a ground click, with no UI click-through', () => {
    const f = nativeFixture(); f.component._setupMouseMode(); f.overlay.dispatchEvent(new MouseEvent('mouseenter'));
    expect(f.mouse.intersect).toBe(false); f.overlay.style.display = 'none';
    f.down(f.overlay); f.up(f.overlay); expect(f.mouse.intersect).toBe(false); expect(f.sent).toHaveLength(0);
    f.down(); f.up(); expect(f.mouse.intersect).toBe(true); expect(f.sent[0]?.dest).toEqual([30, 40]);
  });
  it('does not revive a ground hover lock beneath a frozen native dialog', () => {
    const f = nativeFixture(); f.mouse.intersect = false; f.session.FreezeUI = true; f.down(); f.up();
    expect(f.mouse.intersect).toBe(false); expect(f.altitude.intersect).not.toHaveBeenCalled(); expect(f.sent).toHaveLength(0);
  });
  it('captures release even when an overlay swallows bubbling mouseup', () => {
    const f = nativeFixture(); f.down(); f.overlay.addEventListener('mouseup', event => event.stopImmediatePropagation()); f.up(f.overlay);
    vi.advanceTimersByTime(1500); expect(f.sent).toHaveLength(1);
  });
  it('sends a captured released click after merely hovering a native UI, without resuming held repeats', () => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    f.component._setupMouseMode(); f.overlay.dispatchEvent(new MouseEvent('mouseenter')); expect(f.mouse.intersect).toBe(false);
    vi.advanceTimersByTime(150); expect(f.sent).toEqual([{ kind: 'move2', dest: [30, 40] }, { kind: 'move2', dest: [60, 70] }]);
    vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(2);
  });
  it('retains the hover protection for a held-button repeat', () => {
    const f = nativeFixture(); f.down(); f.component._setupMouseMode(); f.overlay.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(1500); expect(f.sent).toHaveLength(1); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['freeze', 'skill', 'dead', 'loading'])('keeps the %s gate for a captured click even though passive hover is allowed', action => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down(); f.up(); f.mouse.intersect = false;
    if (action === 'freeze') f.session.FreezeUI = true;
    if (action === 'skill') f.mouse.state = 2;
    if (action === 'dead') f.session.Entity!.action = 2;
    if (action === 'loading') f.map.loading = true;
    vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(1); expect(vi.getTimerCount()).toBe(0);
  });
  it('cancels queued floor input at an actual new native Navigation.navigateTo request', () => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    const root = document.createElement('div'), path = vi.fn(() => []);
    Object.assign(f.context, { Navigation: { getRoot: () => root }, normalizeMapName: (map: string) => map.replace(/\.gat$/i, ''),
      _finalTargetData: null, MapPathFinder: { findPathBetweenMaps: path } });
    vm.runInContext(navigationParts.navigate + '\nNavigation.navigateTo({startMap:"prontera",startX:1,startY:1,endMap:"prontera",endX:80,endY:90,showWindow:false});', f.context);
    expect(path).toHaveBeenCalledOnce(); vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(1); expect(vi.getTimerCount()).toBe(0);
  });
  it('retires queued ground movement before native skill handling removes its selection UI and restores Mouse.state', () => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    f.mouse.state = 2;
    const skill = f.context.SkillTargetSelection_default as { onMapMouseDown: ReturnType<typeof vi.fn> };
    skill.onMapMouseDown.mockImplementation(() => { f.mouse.state = 0; f.sent.push({ kind: 'skill' }); return true; });
    f.down(); f.up(); vi.advanceTimersByTime(1000);
    expect(f.sent.map(packet => packet.kind)).toEqual(['move2', 'skill']); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['onMouseDown', 'onFocus'])('does not overwrite a newer native entity %s operation with an old queued destination', handler => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down(); f.up();
    const entity = { objecttype: 3, onMouseDown: () => false, onFocus: () => false };
    entity[handler as keyof Pick<typeof entity, 'onMouseDown' | 'onFocus'>] = () => { f.sent.push({ kind: 'entity', dest: [80, 90] }); return true; };
    f.entityManager.intersect.mockReturnValue(entity); f.down(); f.up(); vi.advanceTimersByTime(1000);
    expect(f.sent).toEqual([{ kind: 'move2', dest: [30, 40] }, { kind: 'entity', dest: [80, 90] }]); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['blur', 'hidden', 'map-change', 'logout'])('cancels pending click and repetition on %s', action => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down();
    if (action === 'blur') window.dispatchEvent(new Event('blur'));
    if (action === 'hidden') { f.setHidden(true); document.dispatchEvent(new Event('visibilitychange')); }
    if (action === 'map-change' || action === 'logout') {
      const name = action === 'map-change' ? 'onMapChange' : 'cleanGameUI';
      // Invoke the actual patched entry prologue: the remaining native body owns map/UI teardown.
      const file = ts.createSourceFile('entry.js', parts.functions.get(name)!, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      const fn = file.statements[0] as ts.FunctionDeclaration;
      vm.runInContext(fn.body!.statements[0]!.getText(file), f.context);
    }
    vi.advanceTimersByTime(1000); expect(f.sent).toHaveLength(1);
  });
  it('cancels at the actual MapRenderer.setMap entry, including before loading early-return', () => {
    const f = nativeFixture(); f.down(); f.up(); vi.advanceTimersByTime(50); f.setPick({ x: 60, y: 70 }); f.down(); f.map.loading = true;
    vm.runInContext(parts.setMap, f.context); f.map.setMap('geffen.gat'); f.map.loading = false; vi.advanceTimersByTime(1000);
    expect(f.sent).toHaveLength(1);
  });
  it('rejects duplicate patch application and unexpected movement anchors', () => {
    expect(() => patchRuntimeMovementInput(patched)).toThrow('anchor:movement-input');
    expect(() => patchRuntimeMovementInput(native.replace('_walkLastTick + 200 > Renderer.tick', 'false'))).toThrow('anchor:movement-input');
    expect(() => patchRuntimeMovementInput(native.replace('entity.constructor.TYPE_TRAP &&', 'entity.constructor.TYPE_ITEM &&'))).toThrow('anchor:movement-input');
    expect(() => patchRuntimeMovementInput(native.replace('pkt.dest[1] = Mouse.world.y;', 'pkt.dest[1] = 0;'))).toThrow('anchor:movement-input');
  });
});

describe('ordinary player click movement', () => {
  it('lets the native friendly focus branch reach walking instead of silently consuming the click', () => {
    const baseline = friendlyPCFixture(true); baseline.down(); baseline.up();
    expect(baseline.pc.onMouseDown).toHaveReturnedWith(true);
    expect(baseline.pc.onFocus).not.toHaveBeenCalled(); expect(baseline.sent).toHaveLength(0);
    const current = friendlyPCFixture(); current.down(); current.up();
    expect(current.pc.onMouseDown).toHaveReturnedWith(false);
    expect(current.pc.onFocus).toHaveReturnedWith(false);
    expect(current.pc.canAttackEntity).toHaveBeenCalledTimes(2);
    expect(current.sent).toEqual([{ kind: 'move2', dest: [30, 40] }]);
    vi.advanceTimersByTime(1000); expect(current.sent).toHaveLength(1); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['pvp', 'gvg', 'entity-captcha', 'floor-captcha', 'touch', 'shift', 'ctrl', 'alt', 'noshift', 'attackable', 'unknown-capability', 'missing-map', 'missing-capability'])(
    'keeps the native player consumption for %s interactions', mode => {
    const f = friendlyPCFixture();
    if (mode === 'pvp') f.session.mapState.isPVP = true;
    if (mode === 'gvg') f.session.mapState.isGVG = true;
    if (mode === 'entity-captcha') f.session.captchaGetIdOnEntityClick = true;
    if (mode === 'floor-captcha') f.session.captchaGetIdOnFloorClick = true;
    if (mode === 'touch') f.session.TouchTargeting = true;
    if (mode === 'shift') f.keys.SHIFT = true;
    if (mode === 'ctrl') f.keys.CTRL = true;
    if (mode === 'alt') f.keys.ALT = true;
    if (mode === 'noshift') (f.context.Controls_default as { noshift: boolean }).noshift = true;
    if (mode === 'attackable') f.pc.canAttackEntity.mockReturnValue(true);
    if (mode === 'unknown-capability') f.pc.canAttackEntity.mockReturnValue(undefined as unknown as boolean);
    if (mode === 'missing-map') (f.session as { mapState?: unknown }).mapState = undefined;
    if (mode === 'missing-capability') (f.pc as { canAttackEntity?: unknown }).canAttackEntity = undefined;
    f.down(); f.up();
    expect(f.pc.onFocus).not.toHaveBeenCalled(); expect(f.sent).toHaveLength(0);
    if (mode === 'entity-captcha') expect(f.captcha).toHaveBeenCalledWith(555);
    else expect(f.captcha).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['skill', 'frozen'])('does not bypass %s protection when the entity method is invoked directly', mode => {
    const f = friendlyPCFixture();
    if (mode === 'skill') f.mouse.state = f.mouse.MOUSE_STATE.USESKILL;
    else f.session.FreezeUI = true;
    expect(f.pc.onMouseDown()).toBe(true); expect(f.pc.onFocus).not.toHaveBeenCalled();
    expect(f.sent).toHaveLength(0);
  });
  it('keeps skill-target selection ahead of the player handler even when the selector declines the click', () => {
    const f = friendlyPCFixture(); f.mouse.state = f.mouse.MOUSE_STATE.USESKILL;
    (f.context.SkillTargetSelection_default as { onMapMouseDown: ReturnType<typeof vi.fn> }).onMapMouseDown.mockReturnValue(false);
    f.down(); f.up();
    expect(f.pc.onMouseDown).toHaveReturnedWith(true); expect(f.pc.onFocus).not.toHaveBeenCalled();
    expect(f.sent).toHaveLength(0);
  });
  it('retains the actual right-click player menu and its trade and equipment callbacks', () => {
    const f = friendlyPCFixture(), menu: { title: string; callback: () => void }[] = [];
    const exchange = vi.fn(), equipment = vi.fn();
    Object.assign(f.context, {
      ContextMenu_default: { remove: vi.fn(), append: vi.fn(), nextGroup: vi.fn(),
        addElement: (title: string, callback: () => void) => menu.push({ title, callback }) },
      DB: { getMessage: (id: number) => `${id} %s` },
      Trade_default: { reqExchange: exchange }, EquipmentController: { onCheckPlayerEquipment: equipment },
      controller: { onOpenChat1to1: vi.fn() }, FriendEngine: { isFriend: () => true },
    });
    vm.runInContext('onMouseDown.call(MapControl,{which:3});onMouseUp.call(MapControl,{which:3});', f.context);
    expect(f.pc.onContextMenu).toHaveBeenCalledOnce(); expect(menu).toHaveLength(3);
    menu.find(item => item.title.startsWith('87 '))!.callback();
    menu.find(item => item.title.startsWith('1360 '))!.callback();
    expect(exchange).toHaveBeenCalledWith(555, 'friend'); expect(equipment).toHaveBeenCalledWith(555);
    expect(f.sent).toHaveLength(0); expect(f.pc.onMouseDown).not.toHaveBeenCalled();
  });
  it.each(['\n', '\r\n'])('preserves the PC anchor and native focus methods for %j newlines', eol => {
    const input = entityControlSource.replace(/\r?\n/g, eol), output = patchRuntimeMovementInput(input);
    const parsed = ts.createSourceFile('PC.js', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS) as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] };
    expect(parsed.parseDiagnostics).toHaveLength(0);
    const methods = entityControlMethods(output);
    expect(methods.onFocus).toBe(entityControlMethods(input).onFocus);
    expect(methods.onContextMenu).toBe(entityControlMethods(input).onContextMenu);
    expect(output).toContain('if (lastroCanPassPlayerClick(this)) return false;');
    if (eol === '\r\n') expect(output.replace(/\r\n/g, '')).not.toContain('\n');
    expect(() => patchRuntimeMovementInput(output)).toThrow('anchor:movement-input');
  });
  it.each(['\n', '\r\n'])('fails closed when the PC anchor changes or duplicates with %j newlines', eol => {
    const input = entityControlSource.replace(/\r?\n/g, eol);
    for (const changed of [
      input.replace('CaptchaSelector_default.addPlayer(this.GID);', 'CaptchaSelector_default.addPlayer(0);'),
      input.replace('static onMouseDown()', 'static renamedMouseDown()'),
      input.replace('!this.canAttackEntity()', '!this.otherAttackCheck()'),
      input.replace('CaptchaSelector_default.addPlayer(this.GID);' + eol + '          return true;', 'CaptchaSelector_default.addPlayer(this.GID);' + eol + '          return false;'),
      input.replace('case Entity.TYPE_PC:' + eol + '          if (SessionStorage_default.captchaGetIdOnEntityClick)', 'case Entity.TYPE_PC:' + eol + '        case Entity.TYPE_PC:' + eol + '          if (SessionStorage_default.captchaGetIdOnEntityClick)'),
      input + eol + input,
    ]) {
      expect(changed).not.toBe(input);
      expect(() => patchRuntimeMovementInput(changed)).toThrow('anchor:movement-input');
    }
  });
});

describe('ground-picker safety', () => {
  it('does not reuse the previous cell when a fresh native raycast misses', () => {
    const canvas = document.createElement('canvas'); document.body.append(canvas);
    const mouse = { screen: { x: 0, y: 0 }, world: { x: 10, y: 20, z: 0 }, intersect: true, state: 0, MOUSE_STATE: { USESKILL: 2 } };
    const event = new MouseEvent('mousedown', { button: 0 }); Object.defineProperty(event, 'target', { value: canvas });
    expect(refreshLastroGroundInput(event, { mouse, canvas, ready: true, pick: () => false, getHeight: () => 0 })).toBe(false);
    expect(mouse.world).toEqual({ x: -1, y: -1, z: -1 });
  });
});
