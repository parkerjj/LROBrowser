// Public, optional host. Only the passive inbound map stream crosses this boundary.
import { createMapResourceProvider, FIELD_PACK_VERSION } from './map-resource-provider.mjs';
import { createKoreConfigStore } from './kore-config-store.mjs';
export const KORE_PROTOCOL_PROFILE = 'lastro-20211103';
const compatibleProfiles = new Set([KORE_PROTOCOL_PROFILE, 'lastro-2x']);
const idPattern = /^[a-f0-9]{64}$/;
const metadataFields = ['schemaVersion', 'engineVersion', 'bridgeApiVersion', 'schedulerCapabilities', 'packetver', 'profile', 'commitSha', 'sourceDirty', 'mode', 'toolVersions', 'files'];
const schedulerCapabilities = ['fourQueues', 'oneShotDeadline', 'recoverySnapshotV1', 'residentExecutor'];
const MAX_PENDING_GAME_CHUNKS = 512;
const MAX_PENDING_GAME_BYTES = 2 * 1024 * 1024;
const MAX_RECOVERY_GAME_CHUNKS = 1024;
const MAX_RECOVERY_GAME_BYTES = 2 * MAX_PENDING_GAME_BYTES;
const MAX_RESIDENT_IN_FLIGHT_EVENTS = 256;
const MAX_RESIDENT_BUFFERED_EVENTS = 768;
const HEARTBEAT_INTERVAL_MS = 1000;
const HEARTBEAT_TIMEOUT_MS = 5000;
const INITIALIZATION_TIMEOUT_MS = 10000;
const RESTART_BACKOFF_MS = [250, 500, 1000, 2000, 5000];
const MAX_RESTART_ATTEMPTS = RESTART_BACKOFF_MS.length;
const emptyM4Status = () => ({ hp: null, hpMax: null, sp: null, spMax: null, weight: null, weightMax: null });
const emptyM4Inventory = () => ({ ready: false, items: {}, groundItems: {}, storageReady: false, storageItems: {} });
const validU8 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xff;
const validU16 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffff;
const validU32 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffffffff;
const validMapCoordinate = value => Number.isSafeInteger(value) && value >= 0 && value <= 1023;
const M4_CONFIG_FILES = new Set(['config.txt', 'mon_control.txt', 'timeouts.txt', 'pickupitems.txt', 'items_control.txt']);
function reloadFileNames(target) {
  const normalized = String(target ?? '').trim().toLowerCase();
  if (normalized === 'conf' || normalized === 'config' || normalized === 'config.txt') return ['config.txt'];
  if (normalized === 'all') return [...M4_CONFIG_FILES];
  return M4_CONFIG_FILES.has(normalized) ? [normalized] : null;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
export async function sha256(bytes) {
  return [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
}
export function safePackagePath(value) {
  if (typeof value !== 'string' || !value || /[\\:%?#]/.test(value) || [...value].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
    || value.split('/').some(part => !part || part === '.' || part === '..')) throw Error('invalid-package-path');
  return value;
}
export function packageKind(file) {
  if (/\.(mjs|js)$/.test(file)) return 'runtime';
  if (file.endsWith('.wasm')) return 'wasm';
  if (file.endsWith('.json')) return 'data-json';
  if (file.endsWith('.txt')) return 'passive';
  throw Error('unsupported-package-file');
}
export async function validateKoreManifest(manifest) {
  if (!manifest || manifest.schemaVersion !== 1 || ![1, 2].includes(manifest.bridgeApiVersion) || manifest.packetver !== 20211103
    || !compatibleProfiles.has(manifest.profile) || !/^\d+\.\d+\.\d+$/.test(manifest.engineVersion)
    || !['debug', 'release'].includes(manifest.mode) || typeof manifest.sourceDirty !== 'boolean'
    || !(manifest.commitSha === null || /^[a-f0-9]{40}$/.test(manifest.commitSha))
    || manifest.toolVersions?.rust !== '1.99.0' || manifest.toolVersions?.wasmBindgen !== '0.2.129'
    || manifest.toolVersions?.binaryen !== (manifest.mode === 'release' ? '133' : null)
    || !Array.isArray(manifest.files) || !idPattern.test(manifest.packageId)) throw Error('incompatible-package');
  if (manifest.bridgeApiVersion === 2
    && (!Array.isArray(manifest.schedulerCapabilities)
      || JSON.stringify(manifest.schedulerCapabilities) !== JSON.stringify(schedulerCapabilities))) throw Error('incompatible-package');
  const paths = new Set();
  for (const file of manifest.files) {
    safePackagePath(file.path);
    if (file.path === 'manifest.json' || paths.has(file.path) || file.kind !== packageKind(file.path)
      || !Number.isSafeInteger(file.bytes) || file.bytes <= 0 || !idPattern.test(file.sha256)) throw Error('invalid-package-file');
    paths.add(file.path);
  }
  for (const required of ['kore-worker.mjs', 'kore_wasm.js', 'kore_wasm_bg.wasm']) {
    if (!paths.has(required)) throw Error('incomplete-package');
  }
  if (manifest.files.map(file => file.path).join('\n') !== [...paths].sort().join('\n')) throw Error('unsorted-package-files');
  const metadata = Object.fromEntries(metadataFields.map(key => [key, manifest[key]]));
  if (await sha256(new globalThis.TextEncoder().encode(JSON.stringify(canonical(metadata)))) !== manifest.packageId) throw Error('package-id-mismatch');
  return manifest;
}
export function validateKorePointer(pointer) {
  if (pointer?.schemaVersion !== 1 || !idPattern.test(pointer.packageId)
    || pointer.manifestPath !== `ke/${pointer.packageId}/manifest.json`) throw Error('invalid-package-pointer');
  return pointer;
}
export async function loadKorePackage({ page = globalThis, manifest, signal }) {
  const entries = manifest?.files ?? [];
  if (!entries.some(file => file.path === 'ke/active.json')) return null;
  const listed = new Map();
  for (const file of entries) {
    if (listed.has(file.path)) throw Error('duplicate-executable-path');
    listed.set(file.path, file);
  }
  const origin = new globalThis.URL(page.location.href).origin;
  async function read(relative, expected) {
    safePackagePath(relative);
    const entry = listed.get(relative);
    if (!entry || entry.kind !== packageKind(relative) || !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || !idPattern.test(entry.sha256)
      || (expected && (entry.bytes !== expected.bytes || entry.sha256 !== expected.sha256 || entry.kind !== expected.kind))) throw Error('executable-manifest-mismatch');
    const url = new globalThis.URL('/core/' + relative, page.location.href);
    if (url.origin !== origin) throw Error('cross-origin-package');
    const response = await page.fetch(url, { cache: 'no-store', redirect: 'error', signal });
    if (!response.ok || response.redirected || (response.url && response.url !== url.href)) throw Error('package-unavailable');
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== entry.bytes || await sha256(bytes) !== entry.sha256) throw Error('package-hash-mismatch');
    return bytes;
  }
  const json = bytes => JSON.parse(new globalThis.TextDecoder().decode(bytes));
  const pointer = validateKorePointer(json(await read('ke/active.json')));
  const packageManifest = await validateKoreManifest(json(await read(pointer.manifestPath)));
  if (packageManifest.packageId !== pointer.packageId) throw Error('pointer-package-mismatch');
  const prefix = `ke/${pointer.packageId}/`;
  const expectedPaths = new Set(['ke/active.json', pointer.manifestPath, ...packageManifest.files.map(file => prefix + file.path)]);
  if (entries.some(file => file.path.startsWith('ke/') && !expectedPaths.has(file.path))) throw Error('unexpected-package-file');
  const packageData = {};
  const configDefaults = {};
  for (const file of packageManifest.files) {
    const bytes = await read(prefix + file.path, file);
    if (file.path === 'data/maps/aliases.json' || file.path === 'data/maps/checksums.json') {
      packageData[file.path] = json(bytes);
    }
    if (file.path.startsWith('data/control/') && M4_CONFIG_FILES.has(file.path.slice('data/control/'.length))) {
      configDefaults[file.path.slice('data/control/'.length)] = new globalThis.TextDecoder('utf-8', { fatal: true }).decode(bytes);
    }
  }
  return {
    manifest: packageManifest,
    workerUrl: new globalThis.URL('/core/' + prefix + 'kore-worker.mjs', page.location.href).href,
    mapResourceConfig: { aliases: packageData['data/maps/aliases.json'] ?? {}, expectedSha256: packageData['data/maps/checksums.json'] ?? {} },
    configDefaults,
  };
}

export function createKoreIntegration({ page = globalThis, manifest, createWorker = url => new page.Worker(url, { type: 'module' }), onWorkerReleased = () => {}, onChange = () => {}, mapResourceProvider = null, serverFieldsFolder = 'EP15.1' }) {
  const state = {
    status: 'absent', packageId: null, mode: null, tickCount: 0, elapsedMs: 0, runtimeGeneration: 0,
    profile: KORE_PROTOCOL_PROFILE, gameSessionId: null, connectionGeneration: null,
    streamStatus: 'idle', mapName: null, selfActor: null,
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
    receivedBytes: 0, sentBytes: 0, degradedReason: null, worldReady: false, aiState: 'off', logs: [], mapResourceState: 'idle',
    controlGeneration: 0, aiTaskCount: 0, experience: null,
    aiDiagnostics: null,
    playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
    configIdentity: null,
    routeState: 'idle', routePreview: null,
  };
  let generation = 0, runtimeGeneration = 0, worker = null, session = null, nextId = 0, initId = 0, probe = null, discardedThrough = 0;
  let timer = null, controller = null, lastNow = 0, initAge = 0, removeListeners = () => {}, removeWorkerListeners = () => {};
  let heartbeatTimer = null, heartbeatRequest = null, lastHeartbeatAt = null;
  let restartTimer = null, restartAttempt = 0, restarting = false;
  let residentExecutor = false, outputDrainPending = false, heartbeatEnabled = false;
  let legacyExecutor = false;
  let recoveryBarrier = null, recoveryMirror = null, nextBridgeSequence = 0;
  let gameSession = null, connection = null, postedGameSessionId = null, postedConnectionGeneration = null;
  let pendingGameEvents = [], pendingGameBytes = 0, workerDegraded = false, needsMapResync = false;
  let residentIngressPending = [], residentIngressInFlight = new Map(), residentIngressGameBytes = 0;
  let mapStreamCapability = null;
  let controlGeneration = 0;
  let routePermit = null;
  let lastResidentRouteId = null;
  let aiPermit = null;
  let recoveryRestore = null;
  const pendingCommands = new Map();
  let resourceCycle = 0;
  let activeResourceRequestId = null;
  const resources = mapResourceProvider ?? createMapResourceProvider({
    page,
    fetchImpl: page.fetch?.bind(page),
    indexedDBFactory: page.indexedDB,
    databaseName: 'kore-map-resources',
  });
  const configStore = createKoreConfigStore({ page, indexedDBFactory: page.indexedDB });
  const clock = () => (page.performance ?? globalThis.performance).now();
  const timers = page.setInterval ? page : globalThis;
  const changed = () => {
    state.controlGeneration = controlGeneration;
    try { onChange(state); } catch { /* UI must not affect the client. */ }
  };
  function log(level, text) {
    state.logs.push({ level, text: String(text).slice(0, 1024), timestamp: Date.now() });
    if (state.logs.length > 200) state.logs.splice(0, state.logs.length - 200);
    changed();
  }
  function release(disposeMessage = null) {
    controller?.abort(); controller = null;
    if (timer !== null) timers.clearInterval(timer);
    if (heartbeatTimer !== null) timers.clearInterval(heartbeatTimer);
    if (restartTimer !== null) timers.clearTimeout(restartTimer);
    timer = null;
    heartbeatTimer = null;
    restartTimer = null;
    heartbeatRequest = null;
    outputDrainPending = false;
    heartbeatEnabled = false;
    restarting = false;
    clearResidentIngress();
    removeListeners(); removeListeners = () => {};
    removeWorkerListeners = () => {};
    const oldWorker = worker; worker = null; probe = null;
    pendingCommands.clear();
    lastResidentRouteId = null;
    try { onWorkerReleased(); } catch { /* Cleanup is best effort. */ }
    try { if (disposeMessage) oldWorker?.postMessage(disposeMessage); } catch { /* Already gone. */ }
    try { oldWorker?.terminate(); } catch { /* Already gone. */ }
    try { void resources.close(); } catch { /* Cache cleanup is best effort. */ }
    try { void configStore.close(); } catch { /* Config cleanup is best effort. */ }
  }
  function releaseWorker(disposeMessage = null) {
    removeWorkerListeners(); removeWorkerListeners = () => {};
    const oldWorker = worker; worker = null; probe = null;
    heartbeatRequest = null;
    outputDrainPending = false;
    try { if (disposeMessage) oldWorker?.postMessage(disposeMessage); } catch { /* Already gone. */ }
    try { oldWorker?.terminate(); } catch { /* Already gone. */ }
  }
  function fail(error) {
    routePermit = null;
    lastResidentRouteId = null;
    aiPermit = null;
    pendingCommands.clear();
    controlGeneration += 1;
    runtimeGeneration += 1;
    state.runtimeGeneration = runtimeGeneration;
    generation++;
    release();
    state.status = 'failed';
    state.aiState = 'off';
    state.aiTaskCount = 0;
    state.aiDiagnostics = null;
    log('error', error instanceof Error ? error.message : String(error));
  }
  function revokeRoutePermit() {
    routePermit = null;
    controlGeneration += 1;
    changed();
  }
  function revokeAiPermit() {
    aiPermit = null;
    controlGeneration += 1;
    changed();
  }
  function cancelWorkerRoute() {
    if (!worker || !session || state.status !== 'runtime-ready' || !routePermit) return;
    try {
      worker.postMessage({ runtimeSessionId: session, type: 'debugRouteCancel', requestId: ++nextId, routeId: routePermit.routeId });
    } catch (error) { handleWorkerFailure(error); }
  }
  function post(type, fields = {}) {
    const requestId = ++nextId;
    try { worker.postMessage({ type, runtimeSessionId: session, requestId, ...fields }); }
    catch (error) { handleWorkerFailure(error); return null; }
    return requestId;
  }
  function nextBridgeContext(overrides = {}) {
    nextBridgeSequence = Math.max(nextBridgeSequence + 1, 1);
    return {
      runtimeSessionId: session,
      gameSessionId: overrides.gameSessionId ?? gameSession?.id ?? '',
      connectionGeneration: overrides.connectionGeneration ?? connection?.generation ?? 0,
      controlGeneration: overrides.controlGeneration ?? controlGeneration,
      bridgeSequence: nextBridgeSequence,
    };
  }
  function postBridgeEvent(kind, fields = {}, queue = 'control', overrides = {}) {
    if (!worker || !session) return null;
    const byteLength = kind === 'gameData' && fields.bytes && Number.isSafeInteger(fields.bytes.byteLength)
      ? fields.bytes.byteLength : 0;
    if (residentIngressPending.length + residentIngressInFlight.size >= MAX_RESIDENT_BUFFERED_EVENTS
      || residentIngressGameBytes + byteLength > MAX_PENDING_GAME_BYTES) {
      markDegraded('worker-ingress-overflow');
      return null;
    }
    const context = nextBridgeContext(overrides);
    const record = { kind, ...fields, context };
    const requestId = ++nextId;
    residentIngressPending.push({
      kind,
      byteLength,
      message: { type: 'queue', queue, runtimeSessionId: session, runtimeGeneration, requestId, record },
    });
    residentIngressGameBytes += byteLength;
    flushResidentIngress();
    return context.bridgeSequence;
  }
  function flushResidentIngress() {
    if (!worker || !residentExecutor || state.status !== 'runtime-ready'
      || recoveryBarrier?.active && !recoveryBarrier.bootstrap) return;
    while (residentIngressPending.length && residentIngressInFlight.size < MAX_RESIDENT_IN_FLIGHT_EVENTS) {
      const entry = residentIngressPending.shift();
      residentIngressInFlight.set(entry.message.requestId, entry);
      try { worker.postMessage(entry.message); }
      catch (error) {
        residentIngressInFlight.delete(entry.message.requestId);
        residentIngressPending.unshift(entry);
        handleWorkerFailure(error);
        return;
      }
    }
  }
  function clearResidentIngress() {
    residentIngressPending = [];
    residentIngressInFlight.clear();
    residentIngressGameBytes = 0;
  }
  function preserveResidentGameIngress() {
    const queued = [...residentIngressPending, ...residentIngressInFlight.values()];
    const snapshotRevision = recoveryMirror?.snapshotRevision;
    const events = queued.filter(entry => {
      const record = entry.message.record;
      return entry.kind === 'gameData' && record.context.gameSessionId === gameSession?.id
        && record.context.connectionGeneration === connection?.generation
        && (!Number.isSafeInteger(snapshotRevision) || record.context.bridgeSequence > snapshotRevision);
    }).sort((left, right) => left.message.record.context.bridgeSequence - right.message.record.context.bridgeSequence);
    clearResidentIngress();
    const seen = new Set(pendingGameEvents.map(event => `${event.gameSessionId}:${event.connectionGeneration}:${event.sequence}`));
    for (const entry of events) {
      const record = entry.message.record;
      const key = `${record.context.gameSessionId}:${record.context.connectionGeneration}:${record.sequence}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const bytes = record.bytes instanceof Uint8Array ? record.bytes : new Uint8Array(record.bytes ?? []);
      if (pendingGameEvents.length >= MAX_RECOVERY_GAME_CHUNKS
        || bytes.byteLength > MAX_RECOVERY_GAME_BYTES - pendingGameBytes) {
        log('error', 'Map stream degraded: worker-recovery-ingress-overflow');
        return false;
      }
      pendingGameEvents.push({
        runtimeSessionId: session, type: 'gameData', gameSessionId: record.context.gameSessionId,
        connectionGeneration: record.context.connectionGeneration, sequence: record.sequence,
        byteOffset: record.byteOffset, receivedAtMs: record.receivedAtMs, bytes,
      });
      pendingGameBytes += bytes.byteLength;
    }
    pendingGameEvents.sort((left, right) => left.sequence - right.sequence);
    return true;
  }
  function handleResidentEventAccepted(message) {
    const entry = residentIngressInFlight.get(message.requestId);
    if (!entry) return;
    residentIngressInFlight.delete(message.requestId);
    residentIngressGameBytes = Math.max(0, residentIngressGameBytes - entry.byteLength);
    if (message.result?.kind === 'error') {
      const error = message.result.error ?? message.result;
      log('warn', `KoreEngine bridge event rejected: ${String(error.code ?? 'event-rejected')}`);
    }
    flushResidentIngress();
    flushPendingGameEvents();
  }
  function postGameData(message) {
    try { worker.postMessage(message, [message.bytes.buffer]); }
    catch (error) { handleWorkerFailure(error); return false; }
    return true;
  }
  function postResourceMessage(message, transfer = []) {
    try { worker.postMessage({ ...message, runtimeGeneration }, transfer); }
    catch (error) { handleWorkerFailure(error); }
  }
  function postRouteResult(fields) {
    if (residentExecutor) postBridgeEvent('routeActionResult', fields, 'control');
    else postResourceMessage({ runtimeSessionId: session, type: 'routeActionResult', requestId: ++nextId, ...fields });
  }
  function validAiAction(action) {
    if (!aiPermit || aiPermit.runtimeGeneration !== runtimeGeneration || !action || !gameSession || !connection || state.streamStatus === 'degraded') return false;
    if (action.runtimeSessionId !== session || action.gameSessionId !== gameSession.id
      || action.connectionGeneration !== connection.generation || action.controlGeneration !== controlGeneration
      || (action.runtimeGeneration !== undefined && action.runtimeGeneration !== runtimeGeneration)
      || !Number.isSafeInteger(action.requestId) || action.requestId <= 0 || aiPermit.actionIds.has(action.requestId)) return false;
    if (action.taskIntentGeneration !== undefined
      && (!Number.isSafeInteger(action.taskIntentGeneration) || action.taskIntentGeneration < aiPermit.taskIntentGeneration)) return false;
    if (action.type === 'MoveTo') return validMapCoordinate(action.x) && validMapCoordinate(action.y);
    if (action.type === 'Attack') return validU32(action.targetGid) && action.targetGid > 0;
    if (action.type === 'UseSkillOnTarget') return validU32(action.skillId) && action.skillId > 0
      && validU16(action.level) && action.level > 0
      && validU32(action.targetGid) && action.targetGid > 0;
    if (action.type === 'UseSkillSelf') return validU32(action.skillId) && action.skillId > 0
      && validU16(action.level) && action.level > 0;
    if (action.type === 'UseSkillAt') return validU32(action.skillId) && action.skillId > 0
      && validU16(action.level) && action.level > 0
      && validMapCoordinate(action.x) && validMapCoordinate(action.y);
    if (action.type === 'UseItem') return validU16(action.inventoryIndex)
      && validU32(action.targetGid) && action.targetGid > 0;
    if (action.type === 'Pickup') return validU32(action.itemGid) && action.itemGid > 0;
    if (action.type === 'StorageTransfer') return validU16(action.inventoryIndex)
      && validU16(action.amount) && action.amount > 0 && typeof action.toStorage === 'boolean';
    if (action.type === 'NpcTalk' || action.type === 'NpcContinue') return validU32(action.npcGid) && action.npcGid > 0;
    if (action.type === 'NpcMenu') return validU32(action.npcGid) && action.npcGid > 0
      && validU8(action.choice);
    if (action.type === 'NpcShopSelect') return validU32(action.npcGid) && action.npcGid > 0
      && typeof action.sell === 'boolean';
    if (action.type === 'ShopBuy') return validU32(action.npcGid) && action.npcGid > 0
      && validU32(action.itemId) && action.itemId > 0
      && validU16(action.amount) && action.amount > 0;
    if (action.type === 'ShopSell') return validU32(action.npcGid) && action.npcGid > 0
      && validU16(action.inventoryIndex)
      && validU16(action.amount) && action.amount > 0;
    if (action.type === 'PrivateAirship') return typeof action.destinationId === 'string' && action.destinationId.length > 0
      && typeof action.expectedMap === 'string' && action.expectedMap.length > 0;
    return false;
  }
  function observeTaskIntentGeneration(output) {
    const taskGeneration = output?.taskIntentGeneration;
    if (!aiPermit || aiPermit.runtimeGeneration !== runtimeGeneration
      || !Number.isSafeInteger(taskGeneration) || taskGeneration < aiPermit.taskIntentGeneration) return;
    aiPermit.taskIntentGeneration = taskGeneration;
  }
  function handleAiAction(message) {
    if (residentExecutor) {
      handleResidentAction(message, false);
      return;
    }
    const action = message.action;
    if ((message.runtimeGeneration !== undefined && message.runtimeGeneration !== runtimeGeneration)
      || !Number.isSafeInteger(message.requestId) || message.requestId <= 0 || !validAiAction(action)) {
      log('warn', `AI action rejected: ${String(action?.type ?? 'unknown')}.`);
      if (residentExecutor && action?.requestId) {
        postBridgeEvent('actionResult', { requestId: action.requestId, accepted: false, reason: 'action-rejected' });
      } else {
        postResourceMessage({ runtimeSessionId: session, type: 'actionResult', requestId: ++nextId,
          sourceRequestId: message.requestId, accepted: false, reason: 'action-rejected' });
      }
      return;
    }
    aiPermit.actionIds.add(action.requestId);
    if (Number.isSafeInteger(action.taskIntentGeneration)) aiPermit.taskIntentGeneration = action.taskIntentGeneration;
    const sent = page.KoreEngineNativeAction?.(action) === true;
    const result = { runtimeSessionId: session, type: 'actionResult', requestId: ++nextId,
      sourceRequestId: message.requestId, accepted: sent, reason: sent ? null : 'native-action-unavailable' };
    if (residentExecutor) {
      postBridgeEvent('actionResult', { requestId: action.requestId, accepted: sent, reason: result.reason });
    } else {
      postResourceMessage(result);
    }
    if (!sent) {
      log('error', `AI action was rejected by the native bridge: ${String(action.type)}.`);
      revokeAiPermit();
    }
  }

  function handleResidentAction(message, routeAction) {
    const action = message?.action;
    const valid = action && gameSession && connection
      && action.runtimeSessionId === session
      && action.gameSessionId === gameSession.id
      && action.connectionGeneration === connection.generation
      && action.controlGeneration === controlGeneration
      && Number.isSafeInteger(action.requestId) && action.requestId > 0
      && (routeAction
        ? (action.type === 'MoveTo' || action.type === 'PrivateAirship')
        : typeof action.type === 'string');
    if (!valid) {
      if (action?.requestId) {
        postBridgeEvent('actionResult', {
          requestId: action.requestId, routeId: routeAction ? action.routeId ?? null : null,
          accepted: false, reason: 'transport-action-rejected',
        }, 'control');
      }
      return;
    }
    const sender = routeAction ? page.KoreEngineNativeRouteAction : page.KoreEngineNativeAction;
    const sent = sender?.(action) === true;
    postBridgeEvent('actionResult', {
      requestId: action.requestId,
      routeId: routeAction ? action.routeId ?? null : null,
      accepted: sent,
      reason: sent ? null : 'native-action-unavailable',
    }, 'control');
  }
  function postCommand(command, fields = {}, options = {}) {
    const reason = worldUnavailableReason();
    if (reason) { log('error', `Command ${command} unavailable: ${reason}.`); return false; }
    const changesAiGeneration = command === 'ai_auto' || command === 'ai_off' || command === 'ai_clear';
    const useResidentCommand = residentExecutor && ['ai_auto', 'ai_off', 'ai_clear'].includes(command);
    if (changesAiGeneration) controlGeneration += 1;
    if (command === 'ai_off') revokeAiPermit();
    if (command === 'ai_auto') aiPermit = { actionIds: new Set(), taskIntentGeneration: 0, runtimeGeneration,
      gameSessionId: gameSession.id, connectionGeneration: connection.generation };
    if (command === 'ai_clear' && aiPermit) aiPermit.actionIds.clear();
    if (!useResidentCommand && command === 'ai_off') state.aiState = 'off';
    if (!useResidentCommand && command === 'ai_auto') state.aiState = 'auto';
    const commandContext = {
      command,
      gameSessionId: gameSession.id,
      connectionGeneration: connection.generation,
      controlGeneration,
    };
    const requestId = useResidentCommand
      ? postBridgeEvent('command', { command, nowMs: clock(), ...fields })
      : post('command', { gameSessionId: gameSession.id, controlGeneration, nowMs: clock(), ...fields, command });
    if (requestId !== null && !useResidentCommand) pendingCommands.set(requestId, {
      ...commandContext,
      recoveryRestore: options.recoveryRestore ?? null,
    });
    changed();
    return true;
  }
  function recoveryRestoreIsCurrent(restore) {
    return Boolean(restore) && recoveryRestore === restore && restore.runtimeGeneration === runtimeGeneration
      && restore.gameSessionId === gameSession?.id
      && restore.connectionGeneration === connection?.generation;
  }
  function maybeRestoreConfigAfterRecovery() {
    const restore = recoveryRestore;
    if (!restore || restore.reloadStarted || !restore.snapshotReady || workerDegraded
      || !state.worldReady || state.mapResourceState !== 'ready' || state.aiState !== 'off'
      || !gameSession?.aid || !gameSession?.cid || !connection) return;
    restore.reloadStarted = true;
    const context = {
      gameSessionId: gameSession.id,
      profile: state.profile,
      aid: gameSession.aid,
      cid: gameSession.cid,
    };
    void api.getConfigDocuments(context)
      .then(documents => {
        if (!recoveryRestoreIsCurrent(restore) || state.aiState !== 'off'
          || !state.worldReady || state.mapResourceState !== 'ready') return;
        const selected = documents.filter(document => M4_CONFIG_FILES.has(document.fileName));
        if (!postCommand('reload', { target: 'all', documents: selected, ...context }, { recoveryRestore: restore })) {
          recoveryRestore = null;
          log('error', 'Configuration restore could not be sent after Worker recovery.');
        }
      })
      .catch(error => {
        if (recoveryRestore === restore) recoveryRestore = null;
        log('error', `Configuration restore failed after Worker recovery: ${String(error?.message ?? error)}`);
      });
  }
  function residentResourceRequest() {
    if (!residentExecutor || !gameSession || !connection || !worker || !session) return;
    const mapName = state.mapName ?? gameSession.mapName;
    const request = {
      runtimeSessionId: session, requestId: ++nextId, resourceType: 'fieldMap',
      mapName, baseName: String(mapName).replace(/\.(?:gat|rsw)$/i, ''), serverFieldsFolder,
      fieldpackVersion: FIELD_PACK_VERSION, attempt: 0, cacheMode: 'prefer', includeAuxiliary: true,
      resourceCycle, connectionGeneration: connection.generation,
    };
    activeResourceRequestId = request.requestId;
    state.mapResourceState = 'loading';
    changed();
    void resources.handleResourceRequest(request).then(response => {
      if (request.runtimeSessionId !== session || activeResourceRequestId !== request.requestId
        || request.resourceCycle !== resourceCycle || request.connectionGeneration !== connection?.generation) return;
      const result = response.result?.kind === 'fieldMap'
        ? { ...response.result, files: response.result.files.map(file => ({ ...file, bytes: file.bytes.slice(0) })) }
        : response.result;
      const transfer = result?.kind === 'fieldMap'
        ? result.files.map(file => file.bytes).filter(bytes => bytes instanceof ArrayBuffer)
        : [];
      postResourceMessage({ ...request, type: 'resourceResult', result }, transfer);
    }).catch(error => {
      if (activeResourceRequestId !== request.requestId) return;
      postResourceMessage({ ...request, type: 'resourceResult',
        result: { kind: 'error', code: 'host-resource-error', message: String(error?.message ?? error) } });
    });
  }
  async function handleResourceRequest(message) {
    if (message.runtimeSessionId !== session || message.fieldpackVersion !== FIELD_PACK_VERSION
      || (message.resourceCycle !== undefined && message.resourceCycle !== resourceCycle)
      || (message.connectionGeneration !== undefined && message.connectionGeneration !== connection?.generation)) return;
    activeResourceRequestId = message.requestId;
    state.mapResourceState = message.attempt > 0 ? 'retrying' : 'loading';
    changed();
    try {
      const response = await resources.handleResourceRequest(message);
      if (message.runtimeSessionId !== session || activeResourceRequestId !== message.requestId
        || (message.resourceCycle !== undefined && message.resourceCycle !== resourceCycle)) return;
      const result = response.result?.kind === 'fieldMap'
        ? { ...response.result, files: response.result.files.map(file => ({ ...file, bytes: file.bytes.slice(0) })) }
        : response.result;
      const transfer = result?.kind === 'fieldMap'
        ? result.files.map(file => file.bytes).filter(bytes => bytes instanceof ArrayBuffer)
        : [];
      postResourceMessage({ runtimeSessionId: session, type: 'resourceResult', requestId: message.requestId,
        resourceCycle: message.resourceCycle, result }, transfer);
    } catch (error) {
      if (activeResourceRequestId !== message.requestId) return;
      postResourceMessage({ runtimeSessionId: session, type: 'resourceResult', requestId: message.requestId,
        resourceCycle: message.resourceCycle,
        result: { kind: 'error', code: 'host-resource-error', message: String(error?.message ?? error) } });
    }
  }
  async function handleResourceValidation(message) {
    if (message.runtimeSessionId !== session || activeResourceRequestId !== message.sourceRequestId
      || (message.resourceCycle !== undefined && message.resourceCycle !== resourceCycle)) return;
    try {
      const response = await resources.handleResourceValidation(message);
      const sourceRequestId = response.sourceRequestId === message.sourceRequestId
        ? response.sourceRequestId : message.sourceRequestId;
      const committedFiles = Array.isArray(response.committedFiles) ? response.committedFiles : [];
      const deletedFiles = Array.isArray(response.deletedFiles) ? response.deletedFiles : [];
      postResourceMessage({ runtimeSessionId: session, type: 'resourceValidationResult', requestId: ++nextId,
        resourceCycle: message.resourceCycle, sourceRequestId,
        committedFiles, deletedFiles });
      // Cache commit is not runtime installation: wait for the Worker ready event.
      const fieldRelativePath = typeof message.fieldRelativePath === 'string' && message.fieldRelativePath
        ? message.fieldRelativePath
        : committedFiles.find(file => typeof file === 'string' && file);
      const ready = Boolean(fieldRelativePath && committedFiles.includes(fieldRelativePath));
      state.mapResourceState = ready ? 'loading' : 'retrying';
      if (residentExecutor && ready) {
        postBridgeEvent('mapResource', {
          mapName: state.mapName ?? gameSession?.mapName ?? message.mapName,
          version: fieldRelativePath, ready: true,
        });
      }
      changed();
    } catch (error) {
      cancelWorkerRoute();
      revokeRoutePermit();
      state.routeState = 'failed';
      state.mapResourceState = 'degraded';
      log('error', `Map resource validation failed: ${String(error?.message ?? error)}`);
    }
  }
  function clearPendingGameEvents() {
    pendingGameEvents = [];
    pendingGameBytes = 0;
  }
  function sendCurrentGameContext() {
    if (state.status !== 'runtime-ready' || !gameSession || mapStreamCapability === false) return false;
    if (residentExecutor && recoveryBarrier?.active && !recoveryBarrier.bootstrap) return false;
    if (postedGameSessionId !== gameSession.id) {
      const id = residentExecutor
        ? postBridgeEvent('gameSessionStarted', {
          characterGid: gameSession.characterGid, mapName: gameSession.mapName,
          aid: gameSession.aid, cid: gameSession.cid,
        })
        : post('beginGameSession', {
          gameSessionId: gameSession.id, characterGid: gameSession.characterGid, mapName: gameSession.mapName,
          profile: state.profile, aid: gameSession.aid, cid: gameSession.cid, controlGeneration,
        });
      if (id === null) return false;
      postedGameSessionId = gameSession.id;
      postedConnectionGeneration = null;
    }
    if (connection && postedConnectionGeneration !== connection.generation) {
      const id = residentExecutor
        ? postBridgeEvent('mapConnectionStarted', {})
        : post('beginMapConnection', {
          gameSessionId: gameSession.id, connectionGeneration: connection.generation,
          serverFieldsFolder, resourceCycle, controlGeneration,
        });
      if (id === null) return false;
      postedConnectionGeneration = connection.generation;
      residentResourceRequest();
    }
    return true;
  }
  function sendDegradedState() {
    if (workerDegraded || state.status !== 'runtime-ready' || !connection || !gameSession) return;
    if (!sendCurrentGameContext()) return;
    const id = residentExecutor
      ? postBridgeEvent('connectionDegraded', { reason: state.degradedReason ?? 'stream-unavailable' })
      : post('degradeConnection', {
        gameSessionId: gameSession.id, connectionGeneration: connection.generation,
        reason: state.degradedReason ?? 'stream-unavailable',
      });
    if (id !== null) workerDegraded = true;
  }
  function markDegraded(reason) {
    if (!connection || state.streamStatus === 'degraded') return;
    clearPendingGameEvents();
    pendingCommands.clear();
    state.streamStatus = 'degraded';
    state.worldReady = false;
    state.degradedReason = String(reason).slice(0, 512);
    cancelWorkerRoute();
    revokeRoutePermit();
    revokeAiPermit();
    state.aiState = 'off';
    state.aiTaskCount = 0;
    state.aiDiagnostics = null;
    log('error', `Map stream degraded: ${state.degradedReason}`);
    sendDegradedState();
  }
  function rejectMapStreamCapability() {
    const reason = 'package-missing-m1-map-stream';
    if (state.streamStatus === 'degraded' && state.degradedReason === reason) return;
    needsMapResync ||= gameSession !== null;
    revokeRoutePermit();
    gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
    clearPendingGameEvents(); workerDegraded = false;
    Object.assign(state, {
      gameSessionId: null, connectionGeneration: null, streamStatus: 'degraded', mapName: null,
      selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
      parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
      receivedBytes: 0, degradedReason: reason, worldReady: false, routeState: 'failed', routePreview: null,
      playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
    });
    log('warn', 'This KE package does not support M1 map streaming; rebuild the local KE package.');
  }
  function validRouteAction(action) {
    if (!routePermit || routePermit.runtimeGeneration !== runtimeGeneration || routePermit.awaitingMap || state.mapResourceState !== 'ready'
      || !state.worldReady || state.streamStatus !== 'world-ready'
      || !action || !gameSession || !connection) return false;
    if (action.runtimeSessionId !== session || action.gameSessionId !== gameSession.id
      || action.connectionGeneration !== connection.generation || action.controlGeneration !== controlGeneration
      || (action.runtimeGeneration !== undefined && action.runtimeGeneration !== runtimeGeneration)
      || action.routeId !== routePermit.routeId
      || !Number.isSafeInteger(action.requestId) || action.requestId <= 0 || routePermit.actionIds.has(action.requestId)) return false;
    if (action.type !== 'MoveTo' && action.type !== 'PrivateAirship') return false;
    if (action.type === 'MoveTo' && (typeof action.expectedMap !== 'string' || !action.expectedMap.trim()
      || !Number.isSafeInteger(action.x) || !Number.isSafeInteger(action.y)
      || action.x < 0 || action.x > 1023 || action.y < 0 || action.y > 1023)) return false;
    if (action.type === 'PrivateAirship' && (typeof action.destinationId !== 'string' || !action.destinationId
      || typeof action.expectedMap !== 'string' || !action.expectedMap.trim())) return false;
    if (action.waitForMap !== null && action.waitForMap !== undefined
      && (typeof action.waitForMap !== 'string' || !action.waitForMap.trim())) return false;
    return true;
  }
  function handleRouteAction(message) {
    const action = message.action;
    if ((message.runtimeGeneration !== undefined && message.runtimeGeneration !== runtimeGeneration) || !validRouteAction(action)) {
      if (routePermit) revokeRoutePermit();
      postRouteResult({ sourceRequestId: message.requestId,
        routeId: action?.routeId, actionId: action?.requestId, accepted: false, reason: 'route-action-rejected' });
      return;
    }
    routePermit.actionIds.add(action.requestId);
    const expectedMap = String(action.expectedMap ?? '').replace(/\.(?:gat|rsw)$/i, '').toLowerCase();
    const currentMap = String(state.mapName ?? '').replace(/\.(?:gat|rsw)$/i, '').toLowerCase();
    if (action.type === 'MoveTo' && expectedMap && currentMap && expectedMap !== currentMap) {
      revokeRoutePermit();
      postRouteResult({ sourceRequestId: message.requestId,
        routeId: action.routeId, actionId: action.requestId, accepted: false, reason: 'unexpected-map' });
      return;
    }
    const permit = routePermit;
    if (action.type === 'PrivateAirship') {
      routePermit.pendingAirshipActionId = action.requestId;
      routePermit.airshipAccepted = false;
    }
    const sent = page.KoreEngineNativeRouteAction?.(action) === true;
    if (!sent) {
      routePermit.pendingAirshipActionId = null;
      revokeRoutePermit();
      postRouteResult({ sourceRequestId: message.requestId,
        routeId: action.routeId, actionId: action.requestId, accepted: false, reason: 'native-route-action-unavailable' });
      return;
    }
    if (routePermit !== permit) return;
    const waitForMap = action.waitForMap
      ? String(action.waitForMap).replace(/\.(?:gat|rsw)$/i, '').toLowerCase()
      : null;
    if (action.type === 'PrivateAirship' || waitForMap) {
      routePermit.awaitingMap = waitForMap ?? expectedMap;
      routePermit.awaitingConnectionGeneration = connection.generation;
      controlGeneration += 1;
      routePermit.controlGeneration = controlGeneration;
      state.routeState = 'awaiting-map';
    }
    postRouteResult({ sourceRequestId: message.requestId,
      routeId: action.routeId, actionId: action.requestId, accepted: true,
      awaitingMap: action.type === 'PrivateAirship' || waitForMap ? (waitForMap ?? expectedMap) : null });
  }

  function maybeConfirmRouteMap() {
    if (!routePermit?.awaitingMap || !state.worldReady || state.mapResourceState !== 'ready' || !connection) return;
    if (routePermit.pendingAirshipActionId && !routePermit.airshipAccepted) return;
    const actualMap = String(state.mapName ?? '').replace(/\.(?:gat|rsw)$/i, '').toLowerCase();
    if (connection.generation <= routePermit.awaitingConnectionGeneration) return;
    if (actualMap !== routePermit.awaitingMap) {
      cancelWorkerRoute();
      revokeRoutePermit();
      state.routeState = 'failed';
      log('error', `Route cancelled after unexpected map ${state.mapName ?? 'unknown'}.`);
      return;
    }
    routePermit.connectionGeneration = connection.generation;
    routePermit.controlGeneration = ++controlGeneration;
    const expectedMap = routePermit.awaitingMap;
    routePermit.awaitingMap = null;
    routePermit.pendingAirshipActionId = null;
    state.routeState = 'running';
    postResourceMessage({ runtimeSessionId: session, type: 'routeMapConfirmed', requestId: ++nextId,
      routeId: routePermit.routeId, expectedMap, connectionGeneration: routePermit.connectionGeneration,
      controlGeneration: routePermit.controlGeneration });
  }
  function flushPendingGameEvents() {
    if (state.status !== 'runtime-ready' || !gameSession) return;
    const snapshotBridge = residentExecutor && recoveryBarrier?.active && !recoveryBarrier.bootstrap;
    if (mapStreamCapability === false) {
      rejectMapStreamCapability();
      return;
    }
    if (!snapshotBridge && !sendCurrentGameContext()) return;
    if (state.streamStatus === 'degraded') { sendDegradedState(); return; }
    if (!pendingGameEvents.length) return;
    const events = pendingGameEvents;
    clearPendingGameEvents();
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (event.gameSessionId !== gameSession?.id || event.connectionGeneration !== connection?.generation) continue;
      if (residentExecutor) {
        if (postBridgeEvent('gameData', {
          sequence: event.sequence, byteOffset: event.byteOffset,
          receivedAtMs: event.receivedAtMs, bytes: event.bytes,
        }, 'game') === null) {
          pendingGameEvents = events.slice(index).concat(pendingGameEvents);
          pendingGameBytes = pendingGameEvents.reduce((total, item) => total + item.bytes.byteLength, 0);
          return;
        }
      } else if (!postGameData(event)) return;
    }
  }
  function receiveWorldState(message) {
    if (message.gameSessionId !== gameSession?.id || message.connectionGeneration !== connection?.generation) return;
    if (!packageInfo || !compatibleProfiles.has(message.profile)
      || !['awaiting-sync', 'world-ready', 'degraded'].includes(message.streamStatus)
      || typeof message.worldReady !== 'boolean' || message.worldReady !== (message.streamStatus === 'world-ready')
      || !(message.mapName === null || typeof message.mapName === 'string')
      || !(message.selfActor === null || (Number.isSafeInteger(message.selfActor.gid) && Number.isInteger(message.selfActor.x) && Number.isInteger(message.selfActor.y)))
      || !message.visibleEntities || !['total', 'players', 'monsters', 'other', 'unknown'].every(key => Number.isSafeInteger(message.visibleEntities[key]) && message.visibleEntities[key] >= 0)
      || !message.parserDiagnostics || !Number.isSafeInteger(message.parserDiagnostics.bufferedBytes) || message.parserDiagnostics.bufferedBytes < 0
      || !(message.parserDiagnostics.pendingPacketId === null || (Number.isSafeInteger(message.parserDiagnostics.pendingPacketId) && message.parserDiagnostics.pendingPacketId >= 0 && message.parserDiagnostics.pendingPacketId <= 0xffff))
      || !(message.parserDiagnostics.pendingRequiredBytes === null || (Number.isSafeInteger(message.parserDiagnostics.pendingRequiredBytes) && message.parserDiagnostics.pendingRequiredBytes >= 0))
      || !(message.parserDiagnostics.lastPacketId === null || (Number.isSafeInteger(message.parserDiagnostics.lastPacketId) && message.parserDiagnostics.lastPacketId >= 0 && message.parserDiagnostics.lastPacketId <= 0xffff))) {
      fail(Error('invalid-worker-world-state')); return;
    }
    const becameReady = !state.worldReady && message.worldReady;
    const becameDegraded = state.streamStatus !== 'degraded' && message.streamStatus === 'degraded';
    if (becameDegraded) {
      cancelWorkerRoute();
      revokeRoutePermit();
      revokeAiPermit();
      pendingCommands.clear();
      state.aiState = 'off';
      state.aiTaskCount = 0;
      state.aiDiagnostics = null;
      state.routeState = 'failed';
    }
    state.streamStatus = message.streamStatus;
    state.profile = message.profile;
    state.worldReady = message.worldReady;
    state.mapName = message.mapName;
    state.selfActor = message.selfActor;
    state.visibleEntities = { ...message.visibleEntities };
    state.parserDiagnostics = { ...message.parserDiagnostics };
    state.degradedReason = message.degradedReason ?? null;
    state.playerStatus = message.status && typeof message.status === 'object' ? { ...emptyM4Status(), ...message.status } : emptyM4Status();
    state.inventory = message.inventory && typeof message.inventory === 'object' ? { ...emptyM4Inventory(), ...message.inventory } : emptyM4Inventory();
    maybeConfirmRouteMap();
    if (becameReady) log('info', `World synchronized on ${message.mapName ?? 'unknown map'}.`);
    else if (becameDegraded) log('error', `Map stream degraded: ${state.degradedReason ?? 'unknown reason'}`);
    changed();
  }
  function validRecoveryMirror(snapshot) {
    const mapSyncComplete = snapshot?.mapSyncBoundary
      ? snapshot.mapSyncBoundary.started === true && snapshot.mapSyncBoundary.complete === true
      : snapshot?.mapSyncComplete === true;
    const mapResourceVersion = typeof snapshot?.mapResourceVersion === 'string'
      ? snapshot.mapResourceVersion
      : snapshot?.mapResource?.version;
    const mapResourceReady = snapshot?.mapResourceReady === true || snapshot?.mapResource?.ready === true;
    const selfActor = snapshot?.selfActor;
    const selfPosition = snapshot?.selfPosition;
    return snapshot && snapshot.schemaVersion === 1
      && typeof snapshot.runtimeSessionId === 'string' && snapshot.runtimeSessionId.length > 0
      && typeof snapshot.gameSessionId === 'string' && snapshot.gameSessionId.length > 0
      && compatibleProfiles.has(snapshot.profile)
      && Number.isSafeInteger(snapshot.connectionGeneration) && snapshot.connectionGeneration >= 0
      && Number.isSafeInteger(snapshot.controlGeneration) && snapshot.controlGeneration >= 0
      && typeof snapshot.mapName === 'string' && snapshot.mapName.length > 0
      && Number.isSafeInteger(snapshot.characterGid) && snapshot.characterGid > 0
      && Number.isSafeInteger(snapshot.snapshotRevision) && snapshot.snapshotRevision >= 0
      && Array.isArray(snapshot.entities)
      && ((selfActor && Number.isSafeInteger(selfActor.gid) && Number.isInteger(selfActor.x) && Number.isInteger(selfActor.y))
        || (selfPosition && Number.isInteger(selfPosition.x) && Number.isInteger(selfPosition.y)))
      && typeof mapResourceVersion === 'string' && mapResourceVersion.length > 0
      && mapResourceReady && mapSyncComplete;
  }
  function storeRecoveryMirror(message) {
    const snapshot = message.snapshot ?? message.recoverySnapshot;
    if (!validRecoveryMirror(snapshot)) {
      log('warn', 'Ignored an incomplete KoreEngine recovery mirror.');
      return;
    }
    if (snapshot.runtimeGeneration !== undefined && snapshot.runtimeGeneration !== runtimeGeneration) return;
    if (!gameSession || snapshot.gameSessionId !== gameSession.id
      || !connection || snapshot.connectionGeneration !== connection.generation) return;
    if (recoveryMirror && snapshot.snapshotRevision <= recoveryMirror.snapshotRevision) return;
    recoveryMirror = globalThis.structuredClone ? globalThis.structuredClone(snapshot) : JSON.parse(JSON.stringify(snapshot));
    nextBridgeSequence = Math.max(nextBridgeSequence, snapshot.snapshotRevision);
  }
  function updateResidentStatus(status) {
    if (!status || typeof status !== 'object') return;
    if (typeof status.worldReady === 'boolean') {
      state.worldReady = status.worldReady && !workerDegraded;
      if (state.worldReady) state.streamStatus = 'world-ready';
    }
    if (typeof status.aiMode === 'string' && ['off', 'auto'].includes(status.aiMode)) {
      state.aiState = status.aiMode === 'auto' && status.aiModeRestored === false ? 'off' : status.aiMode;
    }
    if (Number.isSafeInteger(status.revision) && status.revision >= 0) nextBridgeSequence = Math.max(nextBridgeSequence, status.revision);
    if (status.recoveryState === 'recovering') {
      state.worldReady = false;
      state.streamStatus = 'awaiting-sync';
    } else if (status.recoveryState === 'failed') {
      state.worldReady = false;
      state.streamStatus = 'degraded';
      state.degradedReason = String(status.reason ?? 'runtime-recovery-failed');
    }
    if (workerDegraded) {
      state.worldReady = false;
      state.streamStatus = 'degraded';
      state.degradedReason = 'worker-recovery-ingress-overflow';
    }
    if (status.worldReady === true && recoveryBarrier?.active && recoveryBarrier.bootstrap) {
      recoveryBarrier.active = false;
      recoveryBarrier.revision = Number.isSafeInteger(status.revision) ? status.revision : recoveryBarrier.revision;
      flushPendingGameEvents();
    }
    changed();
  }
  function handleRecoveryAck(message) {
    const ack = message.kind === 'recoveryAck' ? message : message.ack ?? message.result ?? message;
    if (!recoveryBarrier?.active || !Number.isSafeInteger(ack?.snapshotRevision)) return;
    if (!recoveryBarrier.bootstrap && (recoveryBarrier.gameSessionId !== (gameSession?.id ?? null)
      || recoveryBarrier.connectionGeneration !== (connection?.generation ?? null))) return;
    if (recoveryBarrier.revision !== null && ack.snapshotRevision < recoveryBarrier.revision) return;
    const bootstrap = recoveryBarrier.bootstrap === true;
    recoveryBarrier.active = false;
    recoveryBarrier.revision = ack.snapshotRevision;
    nextBridgeSequence = Math.max(nextBridgeSequence, ack.snapshotRevision);
    if (bootstrap) recoveryRestore = null;
    if (!bootstrap) {
      postedGameSessionId = gameSession?.id ?? null;
      postedConnectionGeneration = connection?.generation ?? null;
    }
    if (typeof ack.worldReady === 'boolean') state.worldReady = ack.worldReady && !workerDegraded;
    if (!bootstrap && state.worldReady && recoveryRestoreIsCurrent(recoveryRestore)) recoveryRestore.snapshotReady = true;
    if (state.worldReady) state.streamStatus = 'world-ready';
    else if (workerDegraded) {
      state.streamStatus = 'degraded';
      state.degradedReason = 'worker-recovery-ingress-overflow';
    }
    if (gameSession && recoveryMirror?.aiMode === 'auto') state.aiState = 'off';
    changed();
    flushPendingGameEvents();
    sendCurrentGameContext();
    if (!bootstrap && state.worldReady) residentResourceRequest();
    flushResidentIngress();
    maybeRestoreConfigAfterRecovery();
  }
  function handleResidentOutput(output) {
    if (!output || typeof output !== 'object') return;
    observeTaskIntentGeneration(output);
    const kind = String(output.kind ?? '').toLowerCase();
    if (kind === 'routeaction' || kind === 'route_action') {
      handleResidentAction({
        runtimeSessionId: session, runtimeGeneration,
        requestId: output.outputRequestId ?? output.requestId,
        action: { ...(output.action ?? output), routeId: output.routeId },
      }, true);
    } else if (kind === 'routestate' || kind === 'route_state') {
      if (residentExecutor || (routePermit && output.routeId === routePermit.routeId)) {
        state.routeState = output.state;
        if (residentExecutor && ['completed', 'cancelled', 'failed'].includes(output.state)) {
          lastResidentRouteId = null;
        }
        if (output.state === 'failed') log('error', `Route failed: ${String(output.reason ?? 'unknown reason')}`);
        if (['completed', 'cancelled', 'failed'].includes(output.state) && routePermit) revokeRoutePermit();
        changed();
      }
    } else if (kind === 'routepreview' || kind === 'route_preview') {
      state.routePreview = Array.isArray(output.route) ? output.route : null;
      changed();
    } else if (kind === 'action') {
      handleAiAction({ runtimeSessionId: session, runtimeGeneration, requestId: output.outputRequestId ?? output.requestId, action: output.action ?? output });
    } else if (kind === 'status') {
      updateResidentStatus(output);
    } else if (kind === 'diagnostic') {
      if (output.code === 'ai-state' || output.task !== undefined) {
        state.aiDiagnostics = {
          diagnostics: {
            mode: state.aiState, task: String(output.task ?? ''), nextAction: output.nextAction ?? null,
            reason: output.reason ?? null, targetGid: output.targetGid ?? null, targetX: null, targetY: null,
            visibleMonsters: Number.isSafeInteger(output.visibleMonsters) ? output.visibleMonsters : 0,
            eligibleMonsters: Number.isSafeInteger(output.eligibleMonsters) ? output.eligibleMonsters : 0,
            configLoaded: output.configLoaded !== false, attackAuto: Number.isSafeInteger(output.attackAuto) ? output.attackAuto : 0,
            taskIntentGeneration: Number.isSafeInteger(output.taskIntentGeneration) ? output.taskIntentGeneration : undefined,
            nextDeadlineMs: Number.isFinite(output.nextDeadlineMs) ? output.nextDeadlineMs : null,
          }, lastAction: null,
        };
        changed();
      }
    } else if (kind === 'recoveryack' || kind === 'recovery_ack') {
      handleRecoveryAck(output);
    } else if (kind === 'error') {
      log('error', `${output.code ?? 'runtime-error'}: ${output.message ?? 'KoreEngine runtime error'}`);
    } else if (kind === 'worldstate') {
      receiveWorldState({ ...output, runtimeSessionId: session });
    }
  }
  function drainResidentOutputs(message = {}) {
    outputDrainPending = false;
    const outputs = Array.isArray(message.outputs) ? message.outputs : [];
    const status = Array.isArray(message.status) ? message.status : [];
    for (const item of status) observeTaskIntentGeneration(item);
    for (const item of outputs) observeTaskIntentGeneration(item);
    if (Array.isArray(message.actions)) for (const action of message.actions) {
      if (['routeaction', 'route_action'].includes(String(action?.kind ?? '').toLowerCase())) {
        handleResidentOutput(action);
      } else {
        handleAiAction({
          runtimeSessionId: session, runtimeGeneration, requestId: action.outputRequestId ?? action.requestId,
          action: action.action ?? action,
        });
      }
    }
    for (const item of status) handleResidentOutput(item);
    for (const output of outputs) handleResidentOutput(output);
  }
  function sendRecoverySnapshot() {
    if (!worker || !session) return;
    const mirrorIsCurrent = recoveryMirror && gameSession && connection
      && recoveryMirror.gameSessionId === gameSession.id
      && recoveryMirror.connectionGeneration === connection.generation;
    if (recoveryMirror && !mirrorIsCurrent) recoveryMirror = null;
    const snapshot = mirrorIsCurrent
      ? (globalThis.structuredClone ? globalThis.structuredClone(recoveryMirror) : JSON.parse(JSON.stringify(recoveryMirror)))
      : null;
    if (recoveryBarrier?.active) {
      recoveryBarrier.bootstrap = snapshot === null;
      recoveryBarrier.gameSessionId = gameSession?.id ?? null;
      recoveryBarrier.connectionGeneration = connection?.generation ?? null;
    }
    if (snapshot) {
      snapshot.runtimeSessionId = session;
      snapshot.runtimeGeneration = runtimeGeneration;
      if (gameSession) snapshot.gameSessionId = gameSession.id;
      if (connection) snapshot.connectionGeneration = connection.generation;
      snapshot.controlGeneration = controlGeneration;
      nextBridgeSequence = Math.max(nextBridgeSequence, snapshot.snapshotRevision);
    }
    if (recoveryBarrier?.active) recoveryBarrier.snapshotSent = true;
    try {
      worker.postMessage({ type: 'recoverySnapshot', runtimeSessionId: session, runtimeGeneration, snapshot });
    } catch (error) { handleWorkerFailure(error); }
    if (!snapshot) {
      sendCurrentGameContext();
      flushPendingGameEvents();
    } else {
      flushPendingGameEvents();
    }
  }
  function receive(event) {
    const message = event.data;
    if (!message || typeof message.runtimeSessionId !== 'string' || !message.runtimeSessionId) { fail(Error('invalid-worker-response')); return; }
    if (message?.runtimeSessionId !== session) return;
    if (message.runtimeGeneration !== undefined && message.runtimeGeneration !== runtimeGeneration) return;
    if (message.type === 'heartbeat') {
      if (message.runtimeGeneration !== undefined && message.runtimeGeneration !== runtimeGeneration) return;
      lastHeartbeatAt = clock(); heartbeatRequest = null; restartAttempt = 0; changed(); return;
    }
    if (message.type === 'outputAvailable') {
      if (!outputDrainPending) {
        outputDrainPending = true;
        post('drainOutputs', { runtimeGeneration });
      }
      return;
    }
    if (message.type === 'outputs') { drainResidentOutputs(message); return; }
    if (message.type === 'eventAccepted') { handleResidentEventAccepted(message); return; }
    if (message.type === 'runReady') return;
    if (message.type === 'status' && !Object.hasOwn(message, 'requestId')) { handleResidentOutput(message); return; }
    if (message.type === 'diagnostic' && !Object.hasOwn(message, 'requestId')) { handleResidentOutput(message); return; }
    if (message.type === 'queueFault') {
      log('error', `KoreEngine ${message.queue ?? 'unknown'} queue fault: ${String(message.code ?? 'queue-fault')}`);
      if (message.queue === 'action' || message.queue === 'game') handleWorkerFailure(Error(String(message.code ?? 'queue-fault')));
      return;
    }
    if (message.type === 'recoveryMirror') { storeRecoveryMirror(message); return; }
    if (message.type === 'recoverySnapshotRequest') {
      if (message.runtimeGeneration !== undefined && message.runtimeGeneration !== runtimeGeneration) return;
      sendRecoverySnapshot();
      return;
    }
    if (message.type === 'recoverySnapshot') { storeRecoveryMirror(message); return; }
    if (message.type === 'recoverySnapshotImported') {
      if (message.result?.kind === 'recoveryAck') handleRecoveryAck(message.result);
      return;
    }
    if (message.type === 'recoverySnapshotAck') { handleRecoveryAck(message); return; }
    if (message.type === 'recoveryAck') { handleRecoveryAck(message); return; }
    if (message.type === 'heartbeatTimeout') { handleWorkerFailure(Error('heartbeat-timeout')); return; }
    if (message.type === 'aiDiagnostics' && !Object.hasOwn(message, 'requestId')) {
      const diagnostics = message.diagnostics;
      if (!diagnostics || !['off', 'auto'].includes(diagnostics.mode)
        || typeof diagnostics.task !== 'string'
        || !(diagnostics.nextAction === null || typeof diagnostics.nextAction === 'string')
        || !(diagnostics.reason === null || typeof diagnostics.reason === 'string')
        || !Number.isSafeInteger(diagnostics.visibleMonsters) || diagnostics.visibleMonsters < 0
        || !Number.isSafeInteger(diagnostics.eligibleMonsters) || diagnostics.eligibleMonsters < 0
        || typeof diagnostics.configLoaded !== 'boolean' || !Number.isInteger(diagnostics.attackAuto)) {
        fail(Error('invalid-ai-diagnostics')); return;
      }
      state.aiDiagnostics = {
        diagnostics: { ...diagnostics },
        lastAction: message.lastAction && typeof message.lastAction === 'object'
          ? { type: String(message.lastAction.type ?? ''), accepted: message.lastAction.accepted === true,
            reason: typeof message.lastAction.reason === 'string' ? message.lastAction.reason : null }
          : null,
      };
      changed();
      return;
    }
    if (message.type === 'resourceRequest') { void handleResourceRequest(message); return; }
    if (message.type === 'resourceValidation') { void handleResourceValidation(message); return; }
    if (message.type === 'actionRequest') { handleAiAction(message); return; }
    if (message.type === 'routeAction') { handleRouteAction(message); return; }
    if (message.type === 'routePreview') {
      if (message.canSend !== false || !(message.route === null || Array.isArray(message.route))) { fail(Error('invalid-route-preview')); return; }
      state.routePreview = message.route;
      if (message.error) log('error', `Route preview failed: ${String(message.error)}`);
      changed();
      return;
    }
    if (message.type === 'routeState') {
      if (!['running', 'awaiting-map', 'completed', 'cancelled', 'failed'].includes(message.state)) { fail(Error('invalid-route-state')); return; }
      if (!routePermit || message.routeId !== routePermit.routeId) return;
      state.routeState = message.state;
      if (message.state === 'failed') log('error', `Route failed: ${String(message.reason ?? 'unknown reason')}`);
      if (['completed', 'cancelled', 'failed'].includes(message.state) && routePermit) revokeRoutePermit();
      changed();
      return;
    }
    if (message.type === 'mapResourceState' && !Object.hasOwn(message, 'requestId')) {
      if (!['loading', 'retrying', 'ready', 'degraded'].includes(message.mapResourceState)
        || typeof message.mapName !== 'string') { fail(Error('invalid-map-resource-state')); return; }
      state.mapResourceState = message.mapResourceState;
      if (message.mapResourceState === 'ready') {
        maybeConfirmRouteMap();
        maybeRestoreConfigAfterRecovery();
      }
      if (message.mapResourceState === 'degraded') {
        recoveryRestore = null;
        cancelWorkerRoute();
        revokeRoutePermit();
        state.routeState = 'failed';
        log('error', `Map resource degraded: ${String(message.reason ?? 'unknown reason')}`);
      }
      changed();
      return;
    }
    if (message.type === 'worldState' && !Object.hasOwn(message, 'requestId')) {
      receiveWorldState(message);
      return;
    }
    if (message.type === 'experience' && !Object.hasOwn(message, 'requestId')) {
      state.experience = message.report ?? null;
      changed();
      return;
    }
    if (!Number.isSafeInteger(message.requestId) || message.requestId <= 0 || message.requestId > nextId) { fail(Error('invalid-worker-response')); return; }
    if (message.requestId <= discardedThrough) return;
    if (message.type === 'fault') { handleWorkerFailure(Error(String(message.message ?? 'Worker fault'))); return; }
    if (message.type === 'log') {
      if (!['info', 'warn', 'error', 'debug'].includes(message.level) || typeof message.text !== 'string') fail(Error('invalid-worker-log'));
      else log(message.level, message.text);
      return;
    }
    if (message.type === 'commandResult') {
      if (!message.result || typeof message.result.kind !== 'string') { fail(Error('invalid-command-result')); return; }
      const pending = pendingCommands.get(message.requestId);
      pendingCommands.delete(message.requestId);
      if (!pending || !gameSession || !connection
        || pending.gameSessionId !== gameSession.id
        || pending.connectionGeneration !== connection.generation
        || pending.controlGeneration !== controlGeneration) {
        if (pending?.recoveryRestore && recoveryRestore === pending.recoveryRestore) recoveryRestore = null;
        return;
      }
      const command = pending.command;
      if (message.result.kind === 'aiState') {
        state.aiState = message.result.aiMode;
        state.aiTaskCount = message.result.taskCount;
      } else if (message.result.kind === 'experienceSummary' || message.result.kind === 'experienceReport') {
        state.experience = message.result.report;
        log('info', `${message.result.kind}: ${JSON.stringify(message.result.report).slice(0, 1024)}`);
      } else if (message.result.kind === 'reload' && !message.result.accepted) {
        const diagnostics = Array.isArray(message.result.diagnostics) ? message.result.diagnostics : [];
        const detail = diagnostics.map(diagnostic => `${diagnostic.fileName}:${diagnostic.line} ${diagnostic.code} ${diagnostic.message}`).join('; ');
        log('error', `Configuration reload rejected: ${message.result.target}${detail ? `: ${detail}` : ''}`);
      } else if (message.result.kind === 'reload') {
        log('info', `Configuration reload accepted: ${message.result.target} revision ${message.result.effectiveRevision}.`);
      } else if (message.result.kind === 'error' && command === 'ai_auto') {
        revokeAiPermit();
        state.aiState = 'off';
        log('error', `AI auto rejected: ${message.result.code}`);
      } else if (message.result.kind === 'error') {
        log('error', `${message.result.code}: ${message.result.message}`);
      }
      if (pending.recoveryRestore && recoveryRestore === pending.recoveryRestore) {
        const restore = pending.recoveryRestore;
        const accepted = message.result.kind === 'reload' && message.result.accepted === true;
        recoveryRestore = null;
        if (accepted && restore.aiMode === 'auto' && restore.runtimeGeneration === runtimeGeneration
          && restore.gameSessionId === gameSession.id && restore.connectionGeneration === connection.generation) {
          postCommand('ai_auto');
        }
      }
      changed();
      return;
    }
    if (['gameSessionStarted', 'gameSessionEnded', 'connectionStarted', 'connectionDegraded'].includes(message.type)) return;
    if (message.type === 'ready' && state.status === 'loading' && message.requestId === initId) {
      const info = message.buildInfo;
      if (message.packageId !== state.packageId || message.worldReady !== false || message.aiState !== 'off'
        || info?.engineVersion !== packageInfo.manifest.engineVersion || ![1, 2].includes(info.bridgeApiVersion)
        || info.bridgeApiVersion !== packageInfo.manifest.bridgeApiVersion
        || info.packetver !== 20211103 || info.target !== 'wasm32-unknown-unknown') { fail(Error('invalid-worker-ready')); return; }
        mapStreamCapability = message.capabilities?.mapStream === true;
        if (packageInfo.manifest.bridgeApiVersion === 2
          && (message.capabilities?.residentExecutor !== true
            || message.capabilities?.oneShotDeadline !== true
            || message.capabilities?.sharedArrayBuffer !== true
            || JSON.stringify(message.capabilities?.queues) !== JSON.stringify(['game', 'control', 'action', 'status']))) {
          fail(Error('invalid-worker-ready'));
          return;
        }
        residentExecutor = message.capabilities?.residentExecutor === true
          || message.capabilities?.queues === true || message.capabilities?.oneShotDeadline === true
          || info.bridgeApiVersion >= 2;
        legacyExecutor = !residentExecutor;
        heartbeatEnabled = residentExecutor || message.capabilities?.heartbeat === true;
        lastHeartbeatAt = clock(); heartbeatRequest = null;
        if (packageInfo.manifest.profile === KORE_PROTOCOL_PROFILE && !mapStreamCapability) {
          fail(Error('invalid-worker-ready'));
          return;
        }
      state.status = 'runtime-ready'; changed();
      if (residentExecutor) {
        recoveryBarrier = {
          active: true, revision: recoveryMirror?.snapshotRevision ?? null,
          bootstrap: false, snapshotSent: false,
          gameSessionId: gameSession?.id ?? null, connectionGeneration: connection?.generation ?? null,
        };
        post('recoverySnapshotRequest', {
          runtimeGeneration,
          snapshotRevision: recoveryMirror?.snapshotRevision ?? null,
        });
      }
      flushPendingGameEvents();
      return;
    }
    if (message.type === 'tick' && state.status === 'runtime-ready' && message.requestId === probe?.id) {
      if (!Number.isSafeInteger(message.tickCount) || message.tickCount <= state.tickCount || !Number.isFinite(message.elapsedMs) || message.elapsedMs < state.elapsedMs) { fail(Error('invalid-worker-tick')); return; }
      state.tickCount = message.tickCount; state.elapsedMs = message.elapsedMs; probe = null; restartAttempt = 0; changed(); return;
    }
    fail(Error('unexpected-worker-response'));
  }
  let packageInfo = null;
  function worldUnavailableReason(requireField = false) {
    if (state.status !== 'runtime-ready') return `runtime is ${state.status}`;
    if (!gameSession) return 'game session is not established';
    if (!connection) return 'map connection is not established';
    if (!state.worldReady) return `world synchronization incomplete (${state.streamStatus}; received ${state.receivedBytes} bytes${state.degradedReason ? '; ' + state.degradedReason : ''})`;
    if (requireField && state.mapResourceState !== 'ready') return `map resource is ${state.mapResourceState}`;
    return null;
  }
  function resetRuntimeForRecovery(reason) {
    const restoreAiMode = aiPermit ? 'auto' : 'off';
    const ingressPreserved = preserveResidentGameIngress();
    routePermit = null;
    lastResidentRouteId = null;
    aiPermit = null;
    pendingCommands.clear();
    controlGeneration += 1;
    state.status = 'loading';
    state.worldReady = false;
    state.streamStatus = ingressPreserved ? (gameSession ? 'awaiting-sync' : 'idle') : 'degraded';
    state.aiState = 'off';
    state.aiTaskCount = 0;
    state.aiDiagnostics = null;
    state.routeState = 'idle';
    state.mapResourceState = gameSession ? 'loading' : 'idle';
    state.degradedReason = ingressPreserved ? null : 'worker-recovery-ingress-overflow';
    postedGameSessionId = null;
    postedConnectionGeneration = null;
    workerDegraded = !ingressPreserved;
    recoveryRestore = gameSession && connection ? {
      runtimeGeneration,
      gameSessionId: gameSession.id,
      connectionGeneration: connection.generation,
      aiMode: restoreAiMode,
      snapshotReady: false,
      reloadStarted: false,
    } : null;
    recoveryBarrier = residentExecutor
      ? {
        active: true, revision: recoveryMirror?.snapshotRevision ?? null, bootstrap: false, snapshotSent: false,
        gameSessionId: gameSession?.id ?? null, connectionGeneration: connection?.generation ?? null,
      }
      : null;
    initAge = 0;
    lastNow = clock();
    if (reason) log('warn', `KoreEngine runtime restarting: ${String(reason)}`);
    changed();
  }
  function spawnWorker() {
    if (!packageInfo || state.status === 'disposed') return;
    residentExecutor = false;
    legacyExecutor = false;
    heartbeatEnabled = false;
    outputDrainPending = false;
    worker = createWorker(packageInfo.workerUrl);
    const localWorker = worker;
    const workerError = event => {
      if (localWorker !== worker) return;
      event.preventDefault?.();
      handleWorkerFailure(Error(event.message ?? 'Worker communication failed'));
    };
    localWorker.addEventListener('message', receive);
    localWorker.addEventListener('error', workerError);
    localWorker.addEventListener('messageerror', workerError);
    removeWorkerListeners = () => {
      localWorker.removeEventListener('message', receive);
      localWorker.removeEventListener('error', workerError);
      localWorker.removeEventListener('messageerror', workerError);
    };
    initId = post('init', {
      expectedPackageId: state.packageId,
      bridgeApiVersion: packageInfo.manifest.bridgeApiVersion,
      packetver: 20211103,
      startMs: clock(),
      executor: 'resident', runtimeGeneration,
    });
  }
  function scheduleWorkerRestart(reason) {
    if (state.status === 'disposed' || !packageInfo || restartTimer !== null) return;
    if (restartAttempt >= MAX_RESTART_ATTEMPTS) {
      state.status = 'failed';
      state.aiState = 'off';
      state.aiTaskCount = 0;
      log('error', 'KE unavailable after repeated runtime recovery failures.');
      changed();
      return;
    }
    const delay = RESTART_BACKOFF_MS[restartAttempt++];
    resetRuntimeForRecovery(reason);
    restarting = true;
    restartTimer = timers.setTimeout(() => {
      restartTimer = null;
      restarting = false;
      try {
        session = (page.crypto ?? globalThis.crypto).randomUUID();
        spawnWorker();
      } catch (error) { handleWorkerFailure(error); }
    }, delay);
    changed();
  }
  function handleWorkerFailure(error) {
    if (state.status === 'disposed' || restarting && restartTimer !== null) return;
    if (legacyExecutor && state.status === 'runtime-ready') {
      fail(error);
      return;
    }
    runtimeGeneration += 1;
    state.runtimeGeneration = runtimeGeneration;
    releaseWorker();
    heartbeatRequest = null;
    heartbeatEnabled = false;
    scheduleWorkerRestart(error instanceof Error ? error.message : String(error));
  }
  function supervise() {
    let now;
    try { now = clock(); } catch { now = lastNow; }
    const delta = Math.min(Math.max(now - lastNow, 0), 2000); lastNow = now;
    if (state.status === 'loading') {
      initAge += delta;
      if (initAge >= INITIALIZATION_TIMEOUT_MS && !restarting) handleWorkerFailure(Error('initialization-timeout'));
      return;
    }
    if (state.status !== 'runtime-ready' || page.document?.hidden) return;
    if (legacyExecutor) {
      if (probe) {
        probe.age += delta;
        if (probe.age >= HEARTBEAT_TIMEOUT_MS) handleWorkerFailure(Error('tick-timeout'));
      } else {
        const id = post('tick', { nowMs: now });
        if (id !== null) probe = { id, age: 0 };
      }
      return;
    }
    if (!heartbeatEnabled) return;
    if (lastHeartbeatAt !== null && now - lastHeartbeatAt >= HEARTBEAT_TIMEOUT_MS) {
      handleWorkerFailure(Error('heartbeat-timeout'));
      return;
    }
    if (!heartbeatRequest) {
      const id = post('heartbeat', { nowMs: now, runtimeGeneration });
      if (id !== null) heartbeatRequest = id;
    }
  }
  function visibility() {
    lastNow = clock();
    if (!page.document?.hidden && probe) { discardedThrough = probe.id; probe = null; }
  }
  const api = {
    state,
    async start() {
      release();
      mapStreamCapability = null;
      const current = ++generation;
      const lostSession = gameSession !== null || needsMapResync;
      gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      needsMapResync = false;
      clearPendingGameEvents(); workerDegraded = false;
      revokeRoutePermit();
      revokeAiPermit();
      Object.assign(state, {
        status: 'absent', packageId: null, mode: null, tickCount: 0, elapsedMs: 0, runtimeGeneration: 0,
        profile: KORE_PROTOCOL_PROFILE,
        gameSessionId: null, connectionGeneration: null, streamStatus: 'idle', mapName: null,
        selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, sentBytes: 0, degradedReason: null, worldReady: false, mapResourceState: 'idle', routeState: 'idle', routePreview: null,
        aiState: 'off', aiTaskCount: 0, experience: null,
        aiDiagnostics: null,
        playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
      });
      if (!manifest?.files?.some(file => file.path === 'ke/active.json')) { changed(); return; }
      if (lostSession) log('warn', 'KoreEngine restarted; re-enter the map server to synchronize.');
      state.status = 'loading'; changed();
      initAge = 0; lastNow = clock(); nextId = 0; discardedThrough = 0;
      runtimeGeneration = 1; state.runtimeGeneration = runtimeGeneration;
      restartAttempt = 0; recoveryMirror = null; recoveryBarrier = null; nextBridgeSequence = 0;
      controller = new globalThis.AbortController();
      timer = timers.setInterval(supervise, HEARTBEAT_INTERVAL_MS);
      page.document?.addEventListener('visibilitychange', visibility);
      const unload = () => api.dispose();
      page.addEventListener?.('pagehide', unload);
      removeListeners = () => {
        page.document?.removeEventListener('visibilitychange', visibility);
        page.removeEventListener?.('pagehide', unload);
      };
      try {
        session = (page.crypto ?? globalThis.crypto).randomUUID();
        packageInfo = await loadKorePackage({ page, manifest, signal: controller.signal });
        if (current !== generation) return;
        resources.configure?.(packageInfo.mapResourceConfig);
        state.packageId = packageInfo.manifest.packageId; state.mode = packageInfo.manifest.mode;
        state.profile = packageInfo.manifest.profile;
        const previousCleanup = removeListeners;
        removeListeners = () => {
          previousCleanup();
          removeWorkerListeners(); removeWorkerListeners = () => {};
        };
        spawnWorker();
      } catch (error) { if (current === generation) fail(error); }
    },
    dispose() {
      const disposeMessage = session === null ? null : { type: 'dispose', runtimeSessionId: session, requestId: ++nextId };
      needsMapResync ||= gameSession !== null;
      generation++;
      runtimeGeneration += 1;
      recoveryRestore = null;
      revokeRoutePermit();
      revokeAiPermit();
      gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      session = null; clearPendingGameEvents(); workerDegraded = false;
      mapStreamCapability = null;
      Object.assign(state, {
        status: 'disposed', runtimeGeneration, gameSessionId: null, connectionGeneration: null,
        streamStatus: 'idle', mapName: null, selfActor: null,
        visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, sentBytes: 0, degradedReason: null, worldReady: false, mapResourceState: 'idle', routeState: 'idle', routePreview: null,
        aiState: 'off', aiTaskCount: 0, experience: null, configIdentity: null,
        aiDiagnostics: null,
        playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
      });
      changed();
      // Revoke the host synchronously; no ACK is needed to stop this runtime.
      release(disposeMessage);
    },
    debugProbe(type) {
      if (state.mode !== 'debug' || state.status !== 'runtime-ready' || !['debugTrap', 'debugCrash'].includes(type)) return false;
      return post(type) !== null;
    },
    beginGameSession(characterGid, mapName, identity = {}) {
      if (!['loading', 'runtime-ready'].includes(state.status)) return null;
      if (mapStreamCapability === false) {
        rejectMapStreamCapability();
        return null;
      }
      if (!Number.isSafeInteger(characterGid) || characterGid <= 0 || typeof mapName !== 'string' || !mapName.trim()) {
        log('error', 'KoreEngine needs a new map-server entry to establish character context.');
        return null;
      }
      if (routePermit) {
        cancelWorkerRoute();
        revokeRoutePermit();
      }
      revokeAiPermit();
      const aid = Number.isSafeInteger(identity.aid) && identity.aid > 0 ? identity.aid : null;
      const cid = Number.isSafeInteger(identity.cid) && identity.cid > 0 ? identity.cid : null;
      try {
        gameSession = { id: (page.crypto ?? globalThis.crypto).randomUUID(), characterGid, mapName: mapName.slice(0, 128), aid, cid };
      } catch (error) { log('error', `Unable to create game session: ${String(error)}`); return null; }
      recoveryRestore = null;
      connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      if (recoveryMirror?.gameSessionId !== gameSession.id) recoveryMirror = null;
      resourceCycle += 1;
      activeResourceRequestId = null;
      clearPendingGameEvents(); workerDegraded = false;
      Object.assign(state, {
        gameSessionId: gameSession.id, connectionGeneration: null, streamStatus: 'awaiting-connection',
        mapName: gameSession.mapName, selfActor: null,
        visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, sentBytes: 0, degradedReason: null, worldReady: false, mapResourceState: 'loading', routeState: 'idle', routePreview: null,
        aiState: 'off', aiTaskCount: 0, experience: null,
        aiDiagnostics: null,
        playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
        configIdentity: aid && cid ? { aid, cid } : null,
      });
      log('info', 'Game session started; waiting for a map connection and initial synchronization.');
      sendCurrentGameContext();
      return gameSession.id;
    },
    beginMapConnection() {
      if (mapStreamCapability === false) {
        rejectMapStreamCapability();
        return null;
      }
      if (!gameSession || !['loading', 'runtime-ready'].includes(state.status)) {
        if (state.status === 'runtime-ready') log('warn', 'Re-enter the map server after enabling KoreEngine to synchronize.');
        return null;
      }
      const nextGeneration = connection ? connection.generation + 1 : 0;
      if (!Number.isSafeInteger(nextGeneration)) { markDegraded('connection-generation-overflow'); return null; }
      const preservingAirshipRoute = Boolean(routePermit?.awaitingMap);
      if (routePermit && !preservingAirshipRoute) {
        cancelWorkerRoute();
        revokeRoutePermit();
        state.routeState = 'cancelled';
      }
      revokeAiPermit();
      pendingCommands.clear();
      recoveryMirror = null;
      recoveryRestore = null;
      connection = { generation: nextGeneration, sequence: 0, byteOffset: 0 };
      resourceCycle += 1;
      activeResourceRequestId = null;
      controlGeneration += 1;
      postedConnectionGeneration = null; workerDegraded = false;
      clearPendingGameEvents();
      Object.assign(state, {
        connectionGeneration: nextGeneration, streamStatus: 'awaiting-sync', worldReady: false,
        aiState: 'off',
        selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null, mapResourceState: 'loading', playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
      });
      log('info', `Map connection generation ${nextGeneration} started.`);
      sendCurrentGameContext();
      return nextGeneration;
    },
    mirrorMapData(connectionGeneration, data) {
      if (mapStreamCapability === false) {
        rejectMapStreamCapability();
        return false;
      }
      if (!gameSession || !connection || connectionGeneration !== connection.generation
        || state.streamStatus === 'degraded' || !['loading', 'runtime-ready'].includes(state.status)) return false;
      let bytes;
      try {
        const source = data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : null;
        if (!source) throw Error('unsupported-map-buffer');
        const bufferUntilRuntimeReady = state.status !== 'runtime-ready'
          || residentExecutor && recoveryBarrier?.active && !recoveryBarrier.snapshotSent;
        if (bufferUntilRuntimeReady
          && (pendingGameEvents.length >= MAX_PENDING_GAME_CHUNKS
            || source.byteLength > MAX_PENDING_GAME_BYTES - pendingGameBytes)) {
          markDegraded('worker-startup-queue-overflow');
          return false;
        }
        bytes = source.slice();
      } catch { markDegraded('map-buffer-copy-failed'); return false; }
      if (!Number.isSafeInteger(connection.sequence) || !Number.isSafeInteger(connection.byteOffset)
        || connection.byteOffset + bytes.byteLength > Number.MAX_SAFE_INTEGER) {
        markDegraded('map-stream-counter-overflow'); return false;
      }
      let receivedAtMs;
      try { receivedAtMs = clock(); } catch { receivedAtMs = Number.NaN; }
      if (!Number.isFinite(receivedAtMs) || receivedAtMs < 0) { markDegraded('invalid-receive-time'); return false; }
      const message = {
        runtimeSessionId: session, type: 'gameData', gameSessionId: gameSession.id,
        connectionGeneration: connection.generation, sequence: connection.sequence,
        byteOffset: connection.byteOffset, receivedAtMs, bytes,
      };
      connection.sequence++;
      connection.byteOffset += bytes.byteLength;
      state.receivedBytes += bytes.byteLength;
      if (state.status === 'runtime-ready') {
        if (residentExecutor) {
          if (recoveryBarrier?.active && !recoveryBarrier.snapshotSent) {
            pendingGameEvents.push(message);
            pendingGameBytes += bytes.byteLength;
            changed();
            return true;
          }
          const snapshotContext = recoveryBarrier?.active && !recoveryBarrier.bootstrap
            && recoveryBarrier.snapshotSent;
          if (!snapshotContext && !sendCurrentGameContext()) return false;
          const accepted = postBridgeEvent('gameData', {
            sequence: message.sequence, byteOffset: message.byteOffset,
            receivedAtMs: message.receivedAtMs, bytes: message.bytes,
          }, 'game') !== null;
          if (!accepted) markDegraded('worker-ingress-overflow');
          return accepted;
        }
        if (!sendCurrentGameContext()) return false;
        return postGameData(message);
      }
      pendingGameEvents.push(message);
      pendingGameBytes += bytes.byteLength;
      changed();
      return true;
    },
    mirrorSentBytes(bytes, gameSessionId = gameSession?.id) {
      if (!gameSession || gameSessionId !== gameSession.id || !state.worldReady || !Number.isSafeInteger(bytes) || bytes < 0) return false;
      state.sentBytes += bytes;
      changed();
      return true;
    },
    async saveConfigDocument(document) { return configStore.saveDocument(document); },
    async getConfigDocuments(identity) {
      await configStore.ensureDefaults(identity, packageInfo?.configDefaults ?? {});
      return configStore.listDocuments(identity);
    },
    reloadConfig(target = 'config.txt') {
      if (state.aiState !== 'off' || !gameSession || !gameSession.aid || !gameSession.cid) {
        log('error', 'Configuration reload requires verified account and character IDs while AI is off.');
        return false;
      }
      const reason = worldUnavailableReason();
      if (reason) { log('error', `Configuration reload unavailable: ${reason}.`); return false; }
      const fileNames = reloadFileNames(target);
      if (!fileNames) {
        log('error', 'Configuration reload target is unsupported.');
        return false;
      }
      const context = {
        gameSessionId: gameSession.id,
        profile: state.profile,
        aid: gameSession.aid,
        cid: gameSession.cid,
      };
      void api.getConfigDocuments(context)
        .then(documents => {
          if (!gameSession || gameSession.id !== context.gameSessionId || state.profile !== context.profile
            || gameSession.aid !== context.aid || gameSession.cid !== context.cid || state.aiState !== 'off') {
            log('warn', 'Configuration reload discarded because character or session changed.');
            return;
          }
          const selected = documents.filter(document => M4_CONFIG_FILES.has(document.fileName) && fileNames.includes(document.fileName));
          if (!postCommand('reload', { target, documents: selected, ...context })) {
            log('error', 'Configuration reload could not be sent in the current session state.');
          }
        })
        .catch(error => log('error', String(error?.message ?? error)));
      return true;
    },
    endGameSession() {
      if (!gameSession) return;
      recoveryRestore = null;
      recoveryMirror = null;
      recoveryBarrier = null;
      lastResidentRouteId = null;
      const ended = gameSession.id;
      if (routePermit) {
        cancelWorkerRoute();
        revokeRoutePermit();
      }
      revokeAiPermit();
      pendingCommands.clear();
      resourceCycle += 1;
      activeResourceRequestId = null;
      if (state.status === 'runtime-ready' && postedGameSessionId === ended) {
        if (residentExecutor) postBridgeEvent('gameSessionEnded', {}, 'control', { gameSessionId: ended });
        else post('endGameSession', { gameSessionId: ended });
      }
      gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      clearPendingGameEvents(); workerDegraded = false; needsMapResync = false;
      Object.assign(state, {
        gameSessionId: null, connectionGeneration: null, streamStatus: 'idle', mapName: null,
        selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null, worldReady: false, mapResourceState: 'idle', routeState: 'idle', routePreview: null,
        aiState: 'off', aiTaskCount: 0, configIdentity: null,
        aiDiagnostics: null,
        playerStatus: emptyM4Status(), inventory: emptyM4Inventory(),
      });
      changed();
    },
    clearConsole() { state.logs.length = 0; changed(); },
    debugRoutePreview(routeRequest) {
      const reason = worldUnavailableReason(true);
      if (reason) { log('error', `Route preview unavailable: ${reason}.`); return false; }
      state.routePreview = null;
      post('debugRoutePreview', { routeRequest });
      return true;
    },
    debugRouteGo(routeRequest) {
      const reason = worldUnavailableReason(true);
      if (reason) { log('error', `Route go unavailable: ${reason}.`); return false; }
      if (residentExecutor) {
        const routeId = ++nextId;
        lastResidentRouteId = routeId;
        state.routeState = 'running';
        try {
          worker.postMessage({ runtimeSessionId: session, type: 'debugRouteGo', requestId: ++nextId,
            routeRequest, routeId, gameSessionId: gameSession.id,
            connectionGeneration: connection.generation, controlGeneration, resourceCycle });
        } catch (error) { lastResidentRouteId = null; handleWorkerFailure(error); return false; }
        changed();
        return true;
      }
      if (routePermit) {
        cancelWorkerRoute();
        revokeRoutePermit();
      }
      controlGeneration += 1;
      routePermit = { requestId: ++nextId, routeId: ++nextId, actionIds: new Set(), runtimeGeneration,
        gameSessionId: gameSession.id,
        connectionGeneration: connection.generation, controlGeneration, awaitingMap: null,
        awaitingConnectionGeneration: connection.generation, pendingAirshipActionId: null,
        airshipAccepted: false };
      state.routeState = 'running';
      try { worker.postMessage({ runtimeSessionId: session, type: 'debugRouteGo', requestId: routePermit.requestId, routeRequest,
        routeId: routePermit.routeId, gameSessionId: gameSession.id, connectionGeneration: connection.generation,
        controlGeneration, resourceCycle }); }
      catch (error) { revokeRoutePermit(); handleWorkerFailure(error); return false; }
      return true;
    },
    debugRouteCancel() {
      if (residentExecutor) {
        if (!worker || !session || lastResidentRouteId === null) return false;
        try {
          worker.postMessage({ runtimeSessionId: session, type: 'debugRouteCancel', requestId: ++nextId,
            routeId: lastResidentRouteId });
        } catch (error) { handleWorkerFailure(error); return false; }
        state.routeState = 'cancelled';
        changed();
        return true;
      }
      if (!routePermit) return false;
      cancelWorkerRoute();
      revokeRoutePermit();
      state.routeState = 'cancelled';
      changed();
      return true;
    },
    handleAirshipResponse(response) {
      if (!routePermit || !routePermit.pendingAirshipActionId) return false;
      const actionId = routePermit.pendingAirshipActionId;
      const numericResponse = Number(response);
      postResourceMessage({ runtimeSessionId: session, type: 'routeAirshipResponse',
        routeId: routePermit.routeId, actionId, response: numericResponse });
      if (numericResponse !== 0) {
        log('error', `Airship request rejected by server (response ${numericResponse}).`);
        routePermit.pendingAirshipActionId = null;
        routePermit.airshipAccepted = false;
        revokeRoutePermit();
        state.routeState = 'failed';
        changed();
      } else {
        routePermit.airshipAccepted = true;
        maybeConfirmRouteMap();
      }
      return true;
    },
    debugMapRetry() {
      if (state.status !== 'runtime-ready' || !gameSession || !connection) return false;
      cancelWorkerRoute();
      revokeRoutePermit();
      resourceCycle += 1;
      activeResourceRequestId = null;
      state.mapResourceState = 'retrying';
      state.routeState = 'idle';
      changed();
      postResourceMessage({ runtimeSessionId: session, type: 'debugMapRetry', requestId: ++nextId,
        mapName: state.mapName ?? gameSession.mapName, serverFieldsFolder, fieldpackVersion: FIELD_PACK_VERSION,
        connectionGeneration: connection.generation, resourceCycle });
      return true;
    },
    debugCommand(command, routeRequest = {}) {
      const normalized = String(command ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (normalized === 'debug route preview') return this.debugRoutePreview(routeRequest);
      if (normalized === 'debug route go') return this.debugRouteGo(routeRequest);
      if (normalized === 'debug route cancel') return this.debugRouteCancel();
      if (normalized === 'debug map retry') return this.debugMapRetry();
      if (normalized === 'ai auto') return postCommand('ai_auto');
      if (normalized === 'ai off') return postCommand('ai_off');
      if (normalized === 'ai clear') return postCommand('ai_clear');
      if (normalized === 'exp') return postCommand('exp', { hostNetworkSnapshot: { gameSessionId: gameSession?.id, bytesSent: state.sentBytes } });
      if (normalized === 'exp report') return postCommand('exp_report', { hostNetworkSnapshot: { gameSessionId: gameSession?.id, bytesSent: state.sentBytes } });
      const reload = normalized.match(/^reload(?:\s+(.+))?$/);
      if (reload) return this.reloadConfig(reload[1] ?? 'config.txt');
      return false;
    },
  };
  return api;
}

export function createKorePanel({ page, host }) {
  const panel = page.document.createElement('details');
  panel.id = 'kore-engine-panel';
  const cursorStyle = page.document.createElement('style');
  cursorStyle.textContent = `
    #kore-engine-panel { font: 12px/1.35 Arial, sans-serif; }
    #kore-engine-panel, #kore-engine-panel * { cursor: default !important; }
    #kore-engine-panel :is(button, summary, select) { cursor: pointer !important; }
    #kore-engine-panel :is(button, input, select) { font: inherit; min-height: 26px; padding: 3px 6px; }
    #kore-engine-panel :is(input, select) { width: auto; }
    #kore-engine-panel input[type=number] { width: 72px; }
    #kore-engine-panel :is(input, textarea) { cursor: text !important; user-select: text; }
  `;
  panel.append(cursorStyle);
  Object.assign(panel.style, {
    position: 'fixed', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: '10000',
    background: '#20242c', color: '#eee', padding: '8px', boxSizing: 'border-box',
    display: 'block', width: '840px', height: '840px',
    maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100vh - 16px)', overflow: 'auto',
  });
  panel.open = true;
  panel.addEventListener('toggle', () => { panel.style.height = panel.open ? '840px' : 'auto'; });
  const title = page.document.createElement('summary'); title.textContent = 'KoreEngine M4'; panel.append(title);
  const controls = page.document.createElement('div');
  controls.style.flex = '0 0 auto';
  const clearButton = page.document.createElement('button'); clearButton.type = 'button'; clearButton.textContent = 'Clear console';
  clearButton.addEventListener('click', () => host.clearConsole()); controls.append(clearButton);
  const commandStatus = page.document.createElement('output');
  commandStatus.setAttribute('aria-live', 'polite'); commandStatus.setAttribute('aria-label', 'KoreEngine command status');
  Object.assign(commandStatus.style, { display: 'block', overflowWrap: 'anywhere', marginTop: '4px' });
  controls.append(commandStatus);
  const commandFeedback = (command, accepted) => {
    const reason = host.state?.logs?.at(-1)?.text;
    commandStatus.textContent = accepted ? `${command} queued` : (reason ?? `${command} unavailable`);
    return commandStatus.textContent;
  };
  const routeControls = page.document.createElement('div');
  routeControls.style.display = 'flex'; routeControls.style.gap = '4px'; routeControls.style.marginTop = '6px'; routeControls.style.flexWrap = 'wrap';
  const destinationInput = page.document.createElement('input');
  destinationInput.type = 'text'; destinationInput.setAttribute('aria-label', 'Route destination map'); destinationInput.placeholder = 'destination map';
  const xInput = page.document.createElement('input'); xInput.type = 'number'; xInput.value = '0'; xInput.setAttribute('aria-label', 'Route destination x');
  const yInput = page.document.createElement('input'); yInput.type = 'number'; yInput.value = '0'; yInput.setAttribute('aria-label', 'Route destination y');
  const request = () => ({ destination: { map: destinationInput.value, position: { x: Number(xInput.value), y: Number(yInput.value) } } });
  const routeButton = (label, command) => {
    const button = page.document.createElement('button'); button.type = 'button'; button.textContent = label; button.title = command;
    button.addEventListener('click', () => commandFeedback(command, host.debugCommand?.(command, request())));
    routeControls.append(button); return button;
  };
  routeControls.append(destinationInput, xInput, yInput);
  const previewButton = routeButton('Preview route', 'debug route preview');
  const goButton = routeButton('Go route', 'debug route go');
  const cancelButton = routeButton('Cancel route', 'debug route cancel');
  const retryMapButton = routeButton('Retry map', 'debug map retry');
  const configControls = page.document.createElement('div');
  configControls.style.display = 'flex'; configControls.style.gap = '4px'; configControls.style.marginTop = '6px'; configControls.style.flexWrap = 'wrap';
  const configFileSelect = page.document.createElement('select');
  for (const fileName of ['config.txt', 'mon_control.txt', 'timeouts.txt', 'pickupitems.txt', 'items_control.txt']) {
    const option = page.document.createElement('option'); option.value = fileName; option.textContent = fileName; configFileSelect.append(option);
  }
  configFileSelect.setAttribute('aria-label', 'KoreEngine configuration file');
  const configSaveButton = page.document.createElement('button'); configSaveButton.type = 'button'; configSaveButton.textContent = 'Save TXT';
  const configReloadButton = page.document.createElement('button'); configReloadButton.type = 'button'; configReloadButton.textContent = 'Reload TXT';
  const configStatus = page.document.createElement('output'); configStatus.setAttribute('aria-live', 'polite');
  configControls.append(configFileSelect, configSaveButton, configReloadButton, configStatus);
  const aiControls = page.document.createElement('div');
  aiControls.style.display = 'flex'; aiControls.style.gap = '4px'; aiControls.style.marginTop = '6px'; aiControls.style.flexWrap = 'wrap';
  for (const [label, command] of [['AI auto', 'ai auto'], ['AI off', 'ai off'], ['AI clear', 'ai clear'], ['EXP', 'exp'], ['EXP report', 'exp report']]) {
    const button = routeButton(label, command);
    aiControls.append(button);
  }
  controls.append(aiControls);
  controls.append(routeControls);
  const createTextArea = (label, rows) => {
    const node = page.document.createElement('textarea');
    node.readOnly = true; node.rows = rows; node.wrap = 'off'; node.setAttribute('aria-label', label);
    Object.assign(node.style, { display: 'block', width: '100%', boxSizing: 'border-box', marginTop: '6px', resize: 'vertical', font: '12px/1.35 monospace', whiteSpace: 'pre', overflow: 'auto' });
    return node;
  };
  const infoNode = createTextArea('KoreEngine status', 12);
  const routeNode = createTextArea('KoreEngine route preview', 4);
  const consoleNode = createTextArea('KoreEngine console', 10);
  const configNode = createTextArea('KoreEngine configuration text', 6);
  configNode.readOnly = false;
  Object.assign(consoleNode.style, { minHeight: '160px' });
  const section = (label, node) => {
    const heading = page.document.createElement('div'); heading.textContent = label;
    Object.assign(heading.style, { marginTop: '6px', fontWeight: 'bold' });
    panel.append(heading, node);
    return heading;
  };
  controls.append(configControls); panel.append(controls);
  section('Status', infoNode);
  section('Configuration TXT', configNode);
  section('Route preview', routeNode);
  const consoleHeading = section('Console (0 entries)', consoleNode);
  let currentState = null;
  let configLoadToken = 0;
  let loadedConfigKey = '';
  const loadConfig = () => {
    const identity = currentState?.configIdentity;
    if (!identity || !host.getConfigDocuments) {
      configNode.value = '';
      configStatus.textContent = 'verified character identity unavailable';
      return;
    }
    const fileName = configFileSelect.value;
    const key = `${currentState.profile}:${identity.aid}:${identity.cid}:${fileName}`;
    const token = ++configLoadToken;
    void host.getConfigDocuments({ profile: currentState.profile, aid: identity.aid, cid: identity.cid })
      .then(documents => {
        if (token !== configLoadToken || fileName !== configFileSelect.value) return;
        const document = documents.find(candidate => candidate.fileName === fileName);
        configNode.value = document?.rawText ?? '';
        configStatus.textContent = document ? `revision ${document.revision}` : 'not saved';
        loadedConfigKey = key;
      })
      .catch(error => {
        if (token === configLoadToken) configStatus.textContent = String(error?.message ?? error);
      });
  };
  configFileSelect.addEventListener('change', loadConfig);
  configSaveButton.addEventListener('click', () => {
    if (!currentState?.configIdentity || !host.saveConfigDocument) {
      configStatus.textContent = 'verified character identity unavailable';
      return;
    }
    const fileName = configFileSelect.value;
    void host.saveConfigDocument({
      profile: currentState.profile,
      aid: currentState.configIdentity.aid,
      cid: currentState.configIdentity.cid,
      fileName,
      rawText: configNode.value,
    }).then(document => {
      configStatus.textContent = `saved r${document.revision}`;
      loadedConfigKey = `${document.profile}:${document.aid}:${document.cid}:${document.fileName}`;
    })
      .catch(error => { configStatus.textContent = String(error?.message ?? error); });
  });
  configReloadButton.addEventListener('click', () => {
    if (!host.reloadConfig) return;
    const accepted = host.reloadConfig(configFileSelect.value);
    configStatus.textContent = commandFeedback('reload', accepted);
  });
  return {
    panel, infoNode, routeNode, consoleNode, configNode, clearButton, destinationInput, xInput, yInput, previewButton, goButton, cancelButton, retryMapButton,
    update(state) {
      currentState = state;
      const identity = state.configIdentity;
      const selectedConfigKey = identity
        ? `${state.profile}:${identity.aid}:${identity.cid}:${configFileSelect.value}`
        : '';
      if (selectedConfigKey && selectedConfigKey !== loadedConfigKey) loadConfig();
      const actor = state.selfActor ? `GID ${state.selfActor.gid} @ ${state.selfActor.x}, ${state.selfActor.y}` : 'waiting';
      const counts = state.visibleEntities;
      infoNode.value = [
        `KE ${state.status} / ${state.streamStatus}`,
        `profile ${state.profile} | connection ${state.connectionGeneration ?? '-'}`,
        `map ${state.mapName ?? '-'} | character ${actor}`,
        `entities ${counts.total} (players ${counts.players}, monsters ${counts.monsters}, other ${counts.other}, unknown ${counts.unknown})`,
        `received ${state.receivedBytes} / sent ${state.sentBytes} bytes | worldReady ${state.worldReady} | mapResource ${state.mapResourceState} | AI ${state.aiState}`,
        `controlGeneration ${state.controlGeneration} | AI tasks ${state.aiTaskCount}`,
        state.aiDiagnostics ? `AI task ${state.aiDiagnostics.diagnostics.task} | target ${state.aiDiagnostics.diagnostics.targetGid ?? '-'} @ ${state.aiDiagnostics.diagnostics.targetX ?? '-'},${state.aiDiagnostics.diagnostics.targetY ?? '-'} | next ${state.aiDiagnostics.diagnostics.nextAction ?? '-'} | waiting ${state.aiDiagnostics.diagnostics.reason ?? '-'} | monsters ${state.aiDiagnostics.diagnostics.visibleMonsters}/${state.aiDiagnostics.diagnostics.eligibleMonsters}${state.aiDiagnostics.lastAction ? ` | sent ${state.aiDiagnostics.lastAction.type}: ${state.aiDiagnostics.lastAction.accepted ? 'accepted' : state.aiDiagnostics.lastAction.reason ?? 'rejected'}` : ''}` : '',
        state.playerStatus ? `HP ${state.playerStatus.hp ?? '-'} / ${state.playerStatus.hpMax ?? '-'} | SP ${state.playerStatus.sp ?? '-'} / ${state.playerStatus.spMax ?? '-'} | weight ${state.playerStatus.weight ?? '-'} / ${state.playerStatus.weightMax ?? '-'}` : '',
        state.inventory ? `inventory ${Object.keys(state.inventory.items ?? {}).length} | ground ${Object.keys(state.inventory.groundItems ?? {}).length} | storage ${state.inventory.storageReady ? 'ready' : 'closed'}` : '',
        state.experience ? `experience ${JSON.stringify(state.experience).slice(0, 512)}` : '',
        `route ${state.routeState}${state.routePreview ? ` | preview ${state.routePreview.length} actions` : ''}`,
        `parser buffer ${state.parserDiagnostics.bufferedBytes} bytes | pending ${state.parserDiagnostics.pendingPacketId === null ? '-' : `0x${state.parserDiagnostics.pendingPacketId.toString(16).padStart(4, '0')}`} ${state.parserDiagnostics.pendingRequiredBytes === null ? '' : `${state.parserDiagnostics.bufferedBytes}/${state.parserDiagnostics.pendingRequiredBytes}`} | last ${state.parserDiagnostics.lastPacketId === null ? '-' : `0x${state.parserDiagnostics.lastPacketId.toString(16).padStart(4, '0')}`}`,
        state.degradedReason ? `reason ${state.degradedReason}` : '',
      ].filter(Boolean).join('\n');
      routeNode.value = state.routePreview ? JSON.stringify(state.routePreview, null, 2) : '';
      const followLogs = consoleNode.scrollHeight - consoleNode.scrollTop - consoleNode.clientHeight <= 4;
      consoleNode.value = state.logs.map(entry => `[${new Date(entry.timestamp).toLocaleTimeString()}] [${entry.level}] ${entry.text}`).join('\n');
      if (followLogs) consoleNode.scrollTop = consoleNode.scrollHeight;
      consoleHeading.textContent = `Console (${state.logs.length} entries, up to 200 retained)`;
    },
  };
}

export function startOptionalKore(options) {
  try {
    const page = globalThis;
    let panelView = null, refresh = null;
    const host = createKoreIntegration({ ...options, page, manifest: page.LastROExecutableManifest,
      onChange(state) {
        if (state.status === 'absent' || refresh !== null || !page.document?.body) return;
        refresh = page.setTimeout(() => {
          refresh = null;
          if (!panelView) { panelView = createKorePanel({ page, host }); page.document.body.append(panelView.panel); }
          panelView.update(state);
        }, 100);
      },
    });
    page.KoreEngine = host;
    void host.start();
    return host;
  } catch (error) { globalThis.console?.error('[KoreEngine] optional host failed', error); return null; }
}
