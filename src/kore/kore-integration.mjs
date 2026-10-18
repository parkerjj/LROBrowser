// Public, optional host. Only the passive inbound map stream crosses this boundary.
import { createMapResourceProvider } from './map-resource-provider.mjs';
import { createKoreConfigStore } from './kore-config-store.mjs';
export const KORE_PROTOCOL_PROFILE = 'lastro-20211103';
const compatibleProfiles = new Set([KORE_PROTOCOL_PROFILE, 'lastro-2x']);
const idPattern = /^[a-f0-9]{64}$/;
const metadataFields = ['schemaVersion', 'engineVersion', 'bridgeApiVersion', 'schedulerCapabilities', 'packetver', 'profile', 'commitSha', 'sourceDirty', 'mode', 'toolVersions', 'files'];
const schedulerCapabilities = ['fourQueues', 'oneShotDeadline', 'residentExecutor'];
const MAX_PENDING_GAME_CHUNKS = 512;
const MAX_PENDING_GAME_BYTES = 2 * 1024 * 1024;
const MAX_RESIDENT_IN_FLIGHT_EVENTS = 256;
const MAX_RESIDENT_BUFFERED_EVENTS = 768;
const RESIDENT_PRIORITY_EVENTS = new Set([
  'gameSessionStarted', 'mapConnectionStarted', 'connectionDegraded', 'gameSessionEnded', 'mapResource', 'actionResult',
]);
const HEARTBEAT_INTERVAL_MS = 1000;
const validU8 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xff;
const validU16 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffff;
const validU32 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffffffff;
const validMapCoordinate = value => Number.isSafeInteger(value) && value >= 0 && value <= 1023;
const M4_CONFIG_FILES = new Set(['config.txt', 'mon_control.txt', 'timeouts.txt', 'pickupitems.txt', 'items_control.txt']);
function koreConsoleLog(page, label, details) {
  const target = page?.console ?? globalThis.console;
  try { target?.log?.(label, details); } catch { /* Diagnostics must not affect client networking. */ }
  // 浏览器保存的控制台日志会把对象折叠成 `…`，额外输出一行可直接阅读的 JSON 文本。
  let json;
  try {
    json = JSON.stringify(details, (_key, item) => typeof item === 'bigint' ? item.toString()
      : item instanceof Map ? Object.fromEntries(item) : item);
  } catch (error) { json = JSON.stringify({ unserializable: String(error?.message ?? error) }); }
  try { target?.log?.(`${label} json`, json); } catch { /* Diagnostics must not affect client networking. */ }
}

export function sendKoreNativePacket(action, packet, {
  page = globalThis,
  sendPacket,
  socket = null,
  refusalReason = null,
} = {}) {
  const packetClass = packet?.constructor?.name ?? null;
  let packetId = null;
  let encodedBytes = 0;
  let encodedPacketHex = null;
  let networkResult;
  let thrown = null;
  let didCallNetwork = false;
  const currentSentBytes = () => Number.isSafeInteger(page?.KoreEngine?.state?.sentBytes)
    ? page.KoreEngine.state.sentBytes : null;
  const sentBytesBefore = currentSentBytes();
  try {
    const version = packet?.getPacketVersion?.();
    const fallbackPacketId = Array.isArray(version) ? version[1] : packet?.constructor?.id;
    if (Number.isSafeInteger(fallbackPacketId) && fallbackPacketId >= 0 && fallbackPacketId <= 0xffff) {
      packetId = `0x${fallbackPacketId.toString(16).padStart(4, '0')}`;
    }
  } catch { /* A packet may not expose version metadata before build. */ }

  const hasOwnBuild = Boolean(packet && Object.hasOwn(packet, 'build'));
  const originalBuild = packet?.build;
  try {
    if (!packet || typeof sendPacket !== 'function') {
      networkResult = false;
    } else {
      if (typeof originalBuild === 'function') {
        packet.build = function (...args) {
          const encoded = Reflect.apply(originalBuild, this, args);
          const value = encoded?.buffer ?? encoded;
          let bytes = null;
          if (value instanceof ArrayBuffer) bytes = new Uint8Array(value);
          else if (ArrayBuffer.isView(value)) bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
          if (bytes) {
            encodedBytes = bytes.byteLength;
            encodedPacketHex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
            if (bytes.byteLength >= 2) {
              packetId = `0x${(bytes[0] | (bytes[1] << 8)).toString(16).padStart(4, '0')}`;
            }
          }
          return encoded;
        };
      }
      didCallNetwork = true;
      networkResult = sendPacket(packet);
    }
  } catch (error) {
    thrown = error;
  } finally {
    if (packet && typeof originalBuild === 'function') {
      if (hasOwnBuild) packet.build = originalBuild;
      else delete packet.build;
    }
  }

  const sentBytesAfter = currentSentBytes();
  const sentBytesDelta = sentBytesBefore !== null && sentBytesAfter !== null
    ? sentBytesAfter - sentBytesBefore : null;
  const socketState = {
    present: Boolean(socket),
    connected: socket?.connected === true,
    isZone: socket?.isZone === true,
    handoffPending: socket?.handoffPending === true,
    readyState: Number.isInteger(socket?.readyState) ? socket.readyState : null,
  };
  let outcome;
  let reason = null;
  if (thrown) {
    outcome = 'threw';
    reason = String(thrown?.message ?? thrown);
  } else if (!didCallNetwork || networkResult === false) {
    outcome = 'rejected';
    reason = refusalReason ?? (!packet ? 'packet-constructor-unavailable' : 'network-send-returned-false');
  } else if (sentBytesDelta > 0) {
    outcome = 'sent';
  } else if (!socketState.present) {
    outcome = 'socket-unavailable';
    reason = 'map-socket-unavailable';
  } else if (!socketState.isZone) {
    outcome = 'non-map-socket';
    reason = 'active-socket-is-not-map-channel';
  } else if (!socketState.connected) {
    outcome = 'socket-disconnected';
    reason = 'map-socket-not-connected';
  } else if (sentBytesDelta === null) {
    outcome = 'sent-byte-counter-unavailable';
    reason = 'sent-byte-counter-unavailable';
  } else {
    outcome = 'sent-bytes-unchanged';
    reason = 'sent-byte-counter-unchanged';
  }

  koreConsoleLog(page, '[KoreEngine] native packet send', {
    action: action && typeof action === 'object' ? { ...action } : action ?? null,
    packetClass,
    packetId,
    encodedBytes,
    encodedPacketHex,
    sentBytesBefore,
    sentBytesAfter,
    sentBytesDelta,
    socket: socketState,
    networkResult: thrown ? 'threw' : networkResult,
    outcome,
    reason,
  });

  if (thrown) throw thrown;
  return didCallNetwork && networkResult !== false;
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
  if (!manifest || manifest.schemaVersion !== 1 || manifest.bridgeApiVersion !== 2 || manifest.packetver !== 20211103
    || !compatibleProfiles.has(manifest.profile) || !/^\d+\.\d+\.\d+$/.test(manifest.engineVersion)
    || !['debug', 'release'].includes(manifest.mode) || typeof manifest.sourceDirty !== 'boolean'
    || !(manifest.commitSha === null || /^[a-f0-9]{40}$/.test(manifest.commitSha))
    || manifest.toolVersions?.rust !== '1.99.0' || manifest.toolVersions?.wasmBindgen !== '0.2.129'
    || manifest.toolVersions?.binaryen !== (manifest.mode === 'release' ? '133' : null)
    || !Array.isArray(manifest.files) || !idPattern.test(manifest.packageId)) throw Error('incompatible-package');
  if (!Array.isArray(manifest.schedulerCapabilities)
    || JSON.stringify(manifest.schedulerCapabilities) !== JSON.stringify(schedulerCapabilities)) throw Error('incompatible-package');
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
    status: 'absent', packageId: null, mode: null, runtimeGeneration: 0,
    profile: KORE_PROTOCOL_PROFILE, gameSessionId: null, connectionGeneration: null,
    streamStatus: 'idle', worldReady: false, mapResourceState: 'idle',
    receivedBytes: 0, sentBytes: 0, degradedReason: null, logs: [],
    runtimeStatus: null, lastDiagnostic: null, lastCommandResult: null,
    configIdentity: null,
  };
  let worker = null;
  let session = null;
  let runtimeGeneration = 0;
  let packageInfo = null;
  let gameSession = null;
  let connection = null;
  let nextRequestId = 0;
  let bridgeSequence = 0;
  let gameSequence = 0;
  let gameByteOffset = 0;
  let residentIngressGameChunks = 0;
  let residentIngressGameBytes = 0;
  let resourceCycle = 0;
  let activeResourceRequestId = null;
  let ingressPending = [];
  const ingressInFlight = new Map();
  let heartbeatTimer = null;
  let removeWorkerListener = () => {};
  const resources = mapResourceProvider ?? createMapResourceProvider({
    page,
    fetchImpl: page.fetch?.bind(page),
    indexedDBFactory: page.indexedDB,
    databaseName: 'kore-map-resources',
  });
  const configStore = createKoreConfigStore({ page, indexedDBFactory: page.indexedDB });
  const changed = () => { try { onChange(state); } catch { /* UI must not affect transport. */ } };
  const log = (level, text) => {
    const entry = { level, text: String(text).slice(0, 1024), timestamp: Date.now() };
    state.logs.push(entry);
    if (state.logs.length > 200) state.logs.splice(0, state.logs.length - 200);
    koreConsoleLog(page, '[KoreEngine] log', entry);
    changed();
  };
  const failWorker = reason => {
    if (state.status === 'disposed' || state.status === 'failed') return;
    state.status = 'failed';
    state.worldReady = false;
    state.streamStatus = 'degraded';
    state.degradedReason = String(reason || 'worker-transport-failed');
    log('error', state.degradedReason);
  };
  const postWorker = (message, transfer = []) => {
    if (!worker || !session) return null;
    const requestId = message.requestId ?? ++nextRequestId;
    try {
      worker.postMessage({ ...message, runtimeSessionId: session, runtimeGeneration, requestId }, transfer);
      return requestId;
    } catch (error) {
      failWorker(`Worker transport failed: ${String(error?.message ?? error)}`);
      return null;
    }
  };
  const currentContext = (overrides = {}) => ({
    runtimeSessionId: session,
    gameSessionId: overrides.gameSessionId ?? gameSession?.id ?? '',
    connectionGeneration: overrides.connectionGeneration ?? connection?.generation ?? 0,
    controlGeneration: overrides.controlGeneration ?? 0,
    bridgeSequence: ++bridgeSequence,
  });
  const flushIngress = () => {
    if (!worker) return;
    while (ingressPending.length && ingressInFlight.size < MAX_RESIDENT_IN_FLIGHT_EVENTS) {
      const entry = ingressPending.shift();
      const requestId = ++nextRequestId;
      ingressInFlight.set(requestId, entry);
      if (entry.queue === 'game') {
        residentIngressGameChunks += 1;
        residentIngressGameBytes += entry.byteLength;
      }
      const record = { ...entry.event, context: entry.context, ...entry.context };
      try {
        worker.postMessage({ runtimeSessionId: session, runtimeGeneration, type: 'queue', queue: entry.queue, requestId, record });
      } catch (error) {
        ingressInFlight.delete(requestId);
        if (entry.queue === 'game') {
          residentIngressGameChunks = Math.max(0, residentIngressGameChunks - 1);
          residentIngressGameBytes = Math.max(0, residentIngressGameBytes - entry.byteLength);
        }
        failWorker(`Bridge queue failed: ${String(error?.message ?? error)}`);
        break;
      }
    }
  };
  const dropPendingGame = () => {
    const index = ingressPending.findIndex(entry => entry.queue === 'game');
    if (index < 0) return false;
    ingressPending.splice(index, 1);
    return true;
  };
  const postEvent = (kind, fields = {}, queue = 'control', overrides = {}) => {
    if (!worker || !session) return null;
    const context = currentContext(overrides);
    const bytes = fields.bytes instanceof Uint8Array ? fields.bytes.slice() : fields.bytes;
    const byteLength = bytes?.byteLength ?? 0;
    const atCapacity = ingressPending.length + ingressInFlight.size >= MAX_RESIDENT_BUFFERED_EVENTS;
    if (atCapacity && queue === 'game') return null;
    if (atCapacity && queue !== 'game' && !dropPendingGame() && !RESIDENT_PRIORITY_EVENTS.has(kind)) return null;
    if (queue === 'game' && (residentIngressGameChunks + ingressPending.filter(entry => entry.queue === 'game').length >= MAX_PENDING_GAME_CHUNKS
        || residentIngressGameBytes + ingressPending.filter(entry => entry.queue === 'game').reduce((total, entry) => total + entry.byteLength, 0) + byteLength > MAX_PENDING_GAME_BYTES)) {
      return null;
    }
    ingressPending.push({ queue, event: { kind, ...fields, ...(bytes ? { bytes } : {}) }, context, byteLength });
    flushIngress();
    return context.bridgeSequence;
  };
  const postActionResult = (action, accepted, reason) => {
    if (!Number.isSafeInteger(action?.requestId) || action.requestId <= 0) return;
    const fields = { requestId: action?.requestId ?? null, routeId: action?.routeId ?? null, accepted: accepted === true, reason: reason ?? null };
    const overrides = {
      gameSessionId: action?.gameSessionId,
      connectionGeneration: action?.connectionGeneration,
      controlGeneration: action?.controlGeneration,
    };
    postEvent('actionResult', fields, 'control', overrides);
  };
  const supportedActionTypes = new Set(['MoveTo', 'Attack', 'UseSkillOnTarget', 'UseSkillSelf', 'UseSkillAt', 'UseItem', 'Pickup',
    'StorageTransfer', 'NpcTalk', 'NpcMenu', 'NpcContinue', 'NpcShopSelect', 'ShopBuy', 'ShopSell', 'PrivateAirship']);
  const validActionPayload = action => {
    if (!supportedActionTypes.has(action.type)) return 'unsupported-action';
    const gid = value => validU32(value) && value > 0;
    const skill = value => validU32(value) && value > 0;
    const level = value => validU16(value) && value > 0;
    switch (action.type) {
      case 'MoveTo': return validMapCoordinate(action.x) && validMapCoordinate(action.y) ? null : 'malformed-action';
      case 'Attack': return gid(action.targetGid) ? null : 'malformed-action';
      case 'UseSkillOnTarget': return skill(action.skillId) && level(action.level) && gid(action.targetGid) ? null : 'malformed-action';
      case 'UseSkillSelf': return skill(action.skillId) && level(action.level) ? null : 'malformed-action';
      case 'UseSkillAt': return skill(action.skillId) && level(action.level) && validMapCoordinate(action.x) && validMapCoordinate(action.y) ? null : 'malformed-action';
      case 'UseItem': return validU16(action.inventoryIndex) && gid(action.targetGid) ? null : 'malformed-action';
      case 'Pickup': return gid(action.itemGid) ? null : 'malformed-action';
      case 'StorageTransfer': return validU16(action.inventoryIndex) && validU32(action.amount) && action.amount > 0 && typeof action.toStorage === 'boolean' ? null : 'malformed-action';
      case 'NpcTalk':
      case 'NpcContinue': return gid(action.npcGid) ? null : 'malformed-action';
      case 'NpcMenu': return gid(action.npcGid) && validU8(action.choice) ? null : 'malformed-action';
      case 'NpcShopSelect': return gid(action.npcGid) && typeof action.sell === 'boolean' ? null : 'malformed-action';
      case 'ShopBuy': return gid(action.npcGid) && gid(action.itemId) && validU32(action.amount) && action.amount > 0 ? null : 'malformed-action';
      case 'ShopSell': return gid(action.npcGid) && validU16(action.inventoryIndex) && validU32(action.amount) && action.amount > 0 ? null : 'malformed-action';
      case 'PrivateAirship': return typeof action.destinationId === 'string' && action.destinationId.length > 0
        && typeof action.expectedMap === 'string' && action.expectedMap.length > 0 ? null : 'malformed-action';
      default: return 'unsupported-action';
    }
  };
  const forwardAction = (action, { requireTaskIntentGeneration = true } = {}) => {
    const malformed = !action || typeof action !== 'object' || !Number.isSafeInteger(action.requestId) || action.requestId <= 0
      || typeof action.runtimeSessionId !== 'string' || !action.runtimeSessionId || typeof action.gameSessionId !== 'string' || !action.gameSessionId
      || !Number.isSafeInteger(action.connectionGeneration) || action.connectionGeneration < 0
      || !Number.isSafeInteger(action.controlGeneration) || action.controlGeneration < 0
      || requireTaskIntentGeneration && (!Number.isSafeInteger(action.taskIntentGeneration) || action.taskIntentGeneration < 0);
    const validationReason = malformed ? 'malformed-action' : validActionPayload(action);
    if (validationReason) {
      log('warn', 'Rejected malformed Rust action at the native transport boundary.');
      if (action && typeof action === 'object') postActionResult(action, false, validationReason);
      return;
    }
    let accepted = false;
    let reason = null;
    try {
      accepted = page.KoreEngineNativeAction?.(action) === true;
      if (!accepted) reason = 'native-action-rejected';
    } catch (error) {
      reason = String(error?.message ?? error);
    }
    postActionResult(action, accepted, reason);
  };
  const handleOutputs = outputs => {
    for (const output of Array.isArray(outputs) ? outputs : []) {
      const kind = String(output?.kind ?? '').replace(/^[A-Z]/, value => value.toLowerCase());
      if (kind === 'action') {
        const action = output.action && typeof output.action === 'object'
          ? { ...output.action, taskIntentGeneration: output.taskIntentGeneration ?? output.action.taskIntentGeneration, nextDeadlineMs: output.nextDeadlineMs ?? output.action.nextDeadlineMs }
          : output;
        forwardAction(action, { requireTaskIntentGeneration: action?.routeId == null });
      } else if (kind === 'routeAction') {
        const route = output.action && typeof output.action === 'object' ? output.action : null;
        const routeKind = route?.action && typeof route.action === 'object' ? route.action : null;
        const routeAction = route && routeKind
          ? { ...route, ...routeKind, routeId: output.routeId, nextDeadlineMs: output.nextDeadlineMs }
          : null;
        forwardAction(routeAction, { requireTaskIntentGeneration: false });
      } else if (kind === 'status') {
        state.runtimeStatus = output;
        state.worldReady = output.worldReady === true;
        if (typeof output.streamStatus === 'string') state.streamStatus = output.streamStatus;
        changed();
      } else if (kind === 'diagnostic') {
        state.lastDiagnostic = output;
        changed();
      } else if (kind === 'commandResult') {
        state.lastCommandResult = output.result ?? output;
        changed();
      } else if (kind === 'worldState') {
        // WorldState remains Rust-owned. The host intentionally does not retain it.
      } else if (kind === 'error') {
        log('error', output.message ?? output.code ?? 'Runtime error');
      }
    }
  };
  async function handleResourceRequest(message) {
    if (!session || message.runtimeSessionId !== session) return;
    activeResourceRequestId = message.requestId;
    state.mapResourceState = message.attempt > 0 ? 'retrying' : 'loading';
    changed();
    try {
      const response = await resources.handleResourceRequest(message);
      if (activeResourceRequestId !== message.requestId) return;
      const result = response.result?.kind === 'fieldMap'
        ? { ...response.result, files: response.result.files.map(file => ({ ...file, bytes: file.bytes.slice(0) })) }
        : response.result;
      const transfer = result?.kind === 'fieldMap'
        ? result.files.map(file => file.bytes).filter(bytes => bytes instanceof ArrayBuffer) : [];
      postWorker({ type: 'resourceResult', requestId: message.requestId, resourceCycle: message.resourceCycle, result }, transfer);
    } catch (error) {
      postWorker({ type: 'resourceResult', requestId: message.requestId, resourceCycle: message.resourceCycle,
        result: { kind: 'error', code: 'host-resource-error', message: String(error?.message ?? error) } });
    }
  }
  async function handleResourceValidation(message) {
    if (!session || message.runtimeSessionId !== session || activeResourceRequestId !== message.sourceRequestId) return;
    try {
      const response = await resources.handleResourceValidation(message);
      const committedFiles = Array.isArray(response.committedFiles) ? response.committedFiles : [];
      postWorker({ type: 'resourceValidationResult', resourceCycle: message.resourceCycle,
        sourceRequestId: message.sourceRequestId, committedFiles, deletedFiles: response.deletedFiles ?? [] });
      state.mapResourceState = committedFiles.includes(message.fieldRelativePath) ? 'loading' : 'retrying';
      changed();
    } catch (error) {
      state.mapResourceState = 'degraded';
      log('error', `Map resource validation failed: ${String(error?.message ?? error)}`);
    }
  }
  const handleWorkerMessage = message => {
    if (!message || message.runtimeSessionId !== session) return;
    if (message.type === 'ready') {
      state.status = 'runtime-ready';
      state.packageId = message.packageId ?? packageInfo?.manifest?.packageId ?? null;
      state.worldReady = message.worldReady === true;
      changed();
      return;
    }
    if (message.type === 'eventAccepted') {
      const entry = ingressInFlight.get(message.requestId);
      if (entry) {
        ingressInFlight.delete(message.requestId);
        if (entry.queue === 'game') {
          residentIngressGameChunks = Math.max(0, residentIngressGameChunks - 1);
          residentIngressGameBytes = Math.max(0, residentIngressGameBytes - entry.byteLength);
        }
      }
      if (message.result?.kind === 'error') log('warn', message.result.error?.message ?? 'Runtime rejected bridge event');
      flushIngress();
      return;
    }
    if (message.type === 'outputAvailable') {
      postWorker({ type: 'drainOutputs' });
      return;
    }
    if (message.type === 'outputs') {
      handleOutputs(message.outputs ?? [
        ...(message.actions ?? []).map(action => ({ kind: 'action', action })),
        ...(message.status ?? []),
      ]);
      return;
    }
    if (message.type === 'actionRequest') { forwardAction(message.action, { requireTaskIntentGeneration: message.action?.routeId == null }); return; }
    if (message.type === 'resourceRequest') { void handleResourceRequest(message); return; }
    if (message.type === 'resourceValidation') { void handleResourceValidation(message); return; }
    if (message.type === 'mapResourceReady') {
      postEvent('mapResource', { mapName: message.mapName, version: message.version, ready: true }, 'control', {
        gameSessionId: message.gameSessionId,
        connectionGeneration: message.connectionGeneration,
        controlGeneration: message.controlGeneration,
      });
      return;
    }
    if (message.type === 'mapResourceState') { state.mapResourceState = message.mapResourceState ?? 'degraded'; changed(); return; }
    if (message.type === 'commandResult') { state.lastCommandResult = message.result ?? null; changed(); return; }
    if (message.type === 'heartbeat') { state.runtimeStatus = message; changed(); return; }
    if (message.type === 'fault') { failWorker(message.message ?? 'runtime-fault'); return; }
  };
  const attachWorker = nextWorker => {
    worker = nextWorker;
    const listener = event => handleWorkerMessage(event.data);
    const transportFailure = event => failWorker(event.message ?? (event.type === 'messageerror' ? 'worker-message-error' : 'worker-error'));
    worker.addEventListener?.('message', listener);
    worker.addEventListener?.('error', transportFailure);
    worker.addEventListener?.('messageerror', transportFailure);
    worker.onmessage = listener;
    removeWorkerListener = () => {
      worker?.removeEventListener?.('message', listener);
      worker?.removeEventListener?.('error', transportFailure);
      worker?.removeEventListener?.('messageerror', transportFailure);
      if (worker?.onmessage === listener) worker.onmessage = null;
    };
  };
  const sendCommand = (command, extraFields = {}) => {
    if (typeof command !== 'string' || !command.trim() || !worker || !session) return false;
    const fields = { ...extraFields, command, hostNetworkSnapshot: { gameSessionId: gameSession?.id ?? '', bytesSent: state.sentBytes } };
    return postEvent('command', fields, 'control') !== null;
  };
  const api = {
    state,
    async start() {
      if (state.status === 'runtime-ready' || state.status === 'loading') return;
      state.status = 'loading'; changed();
      try {
        packageInfo = await loadKorePackage({ page, manifest });
        if (!packageInfo) { state.status = 'absent'; changed(); return; }
        if (packageInfo.mapResourceConfig) resources.configure?.(packageInfo.mapResourceConfig);
        session = typeof page.crypto?.randomUUID === 'function' ? page.crypto.randomUUID() : `ke-${Date.now()}-${Math.random()}`;
        runtimeGeneration += 1; state.runtimeGeneration = runtimeGeneration;
        if (page.crossOriginIsolated === false
          && !(typeof globalThis.SharedArrayBuffer === 'function' && typeof globalThis.Atomics === 'object')) {
          state.status = 'unavailable'; state.degradedReason = 'shared-array-buffer-unavailable'; log('error', state.degradedReason); return;
        }
        attachWorker(createWorker(packageInfo.workerUrl));
        postWorker({ type: 'residentInit', expectedPackageId: packageInfo.manifest.packageId,
          bridgeApiVersion: packageInfo.manifest.bridgeApiVersion, packetver: packageInfo.manifest.packetver,
          startMs: 0, executor: 'resident', runtimeGeneration });
        if (heartbeatTimer === null && page.setInterval) heartbeatTimer = page.setInterval(() => postWorker({ type: 'heartbeatRequest' }), HEARTBEAT_INTERVAL_MS);
      } catch (error) {
        state.status = 'failed'; state.degradedReason = String(error?.message ?? error); log('error', state.degradedReason);
      }
    },
    dispose() {
      if (heartbeatTimer !== null && page.clearInterval) page.clearInterval(heartbeatTimer);
      heartbeatTimer = null; removeWorkerListener();
      try { if (worker && session) worker.postMessage({ runtimeSessionId: session, type: 'dispose', requestId: ++nextRequestId }); } catch { /* best effort */ }
      try { worker?.terminate?.(); } catch { /* best effort */ }
      worker = null; session = null; ingressPending = []; ingressInFlight.clear(); residentIngressGameChunks = 0; residentIngressGameBytes = 0;
      gameSession = null; connection = null; activeResourceRequestId = null;
      void resources.close?.(); void configStore.close?.();
      state.gameSessionId = null; state.connectionGeneration = null; state.worldReady = false; state.streamStatus = 'idle'; state.mapResourceState = 'idle';
      try { onWorkerReleased(); } catch { /* best effort */ }
      state.status = 'disposed'; changed();
    },
    beginGameSession(characterGid, mapName, identity = {}) {
      if (!worker || !session || !Number.isSafeInteger(characterGid) || typeof mapName !== 'string' || !mapName) return null;
      const id = `${session}:game:${++nextRequestId}`;
      gameSession = { id, characterGid, mapName, aid: identity.aid ?? null, cid: identity.cid ?? null };
      connection = null; gameSequence = 0; gameByteOffset = 0;
      state.gameSessionId = id; state.connectionGeneration = null; state.configIdentity = identity.aid && identity.cid ? { aid: identity.aid, cid: identity.cid } : null;
      state.streamStatus = 'awaiting-connection'; state.worldReady = false;
      const fields = { characterGid, mapName, aid: gameSession.aid, cid: gameSession.cid };
      postEvent('gameSessionStarted', fields, 'control', { gameSessionId: id, connectionGeneration: 0 });
      changed(); return id;
    },
    beginMapConnection() {
      if (!worker || !session || !gameSession) return null;
      const generation = (connection?.generation ?? 0) + 1;
      connection = { generation, degraded: false }; gameSequence = 0; gameByteOffset = 0;
      state.connectionGeneration = generation; state.streamStatus = 'awaiting-sync'; state.worldReady = false;
      resourceCycle += 1; state.mapResourceState = 'loading';
      postEvent('mapConnectionStarted', { mapName: gameSession.mapName, serverFieldsFolder, resourceCycle }, 'control', { gameSessionId: gameSession.id, connectionGeneration: generation });
      changed(); return generation;
    },
    mirrorMapData(connectionGeneration, data) {
      if (!worker || !session || !gameSession || connection?.generation !== connectionGeneration || connection.degraded) return false;
      const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer, data.byteOffset ?? 0, data.byteLength ?? data.length);
      const event = { sequence: gameSequence, byteOffset: gameByteOffset, receivedAtMs: (page.performance ?? globalThis.performance).now(), bytes };
      const queued = postEvent('gameData', event, 'game', { gameSessionId: gameSession.id, connectionGeneration });
      if (queued === null) return false;
      gameSequence += 1; gameByteOffset += bytes.byteLength; state.receivedBytes += bytes.byteLength;
      changed(); return true;
    },
    mirrorSentBytes(bytes, gameSessionId = gameSession?.id) {
      if (!Number.isSafeInteger(bytes) || bytes < 0 || (gameSessionId && gameSessionId !== gameSession?.id)) return false;
      state.sentBytes += bytes; changed(); return true;
    },
    degradeConnection(reason = 'connection-degraded') {
      if (!worker || !session || !gameSession || !connection) return false;
      connection.degraded = true; state.worldReady = false; state.streamStatus = 'degraded'; state.mapResourceState = 'degraded'; state.degradedReason = String(reason);
      const queued = postEvent('connectionDegraded', { reason: String(reason) }, 'control', { gameSessionId: gameSession.id, connectionGeneration: connection.generation }) !== null;
      changed(); return queued;
    },
    endGameSession() {
      if (!worker || !session || !gameSession) return false;
      const ended = gameSession.id;
      postEvent('gameSessionEnded', {}, 'control', { gameSessionId: ended, connectionGeneration: connection?.generation ?? 0 });
      gameSession = null; connection = null; state.gameSessionId = null; state.connectionGeneration = null; state.worldReady = false; state.streamStatus = 'idle'; changed(); return true;
    },
    clearConsole() { state.logs.length = 0; changed(); },
    debugMapRetry() { if (!gameSession || !connection) return false; resourceCycle += 1; state.mapResourceState = 'loading'; postWorker({ type: 'debugMapRetry', mapName: gameSession.mapName, resourceCycle, connectionGeneration: connection.generation }); changed(); return true; },
    saveConfigDocument(document) { return configStore.saveDocument(document); },
    async getConfigDocuments(identity) {
      await configStore.ensureDefaults(identity, packageInfo?.configDefaults ?? {});
      return configStore.listDocuments(identity);
    },
    reloadConfig(target = 'config.txt') {
      const normalized = String(target).trim();
      if (!gameSession?.aid || !gameSession?.cid) return false;
      const gameSessionId = gameSession.id;
      const identity = { profile: state.profile, aid: gameSession.aid, cid: gameSession.cid };
      void api.getConfigDocuments(identity).then(documents => {
        if (gameSession?.id !== gameSessionId) return;
        const selected = documents.filter(document => M4_CONFIG_FILES.has(document.fileName));
        sendCommand(`reload ${normalized}`, { documents: selected, profile: identity.profile, aid: identity.aid, cid: identity.cid, gameSessionId });
      }).catch(error => log('error', `Configuration reload failed: ${String(error?.message ?? error)}`));
      return true;
    },
    debugCommand(command) { return sendCommand(String(command ?? '')); },
    sendCommand,
  };
  return api;
}

export function createKorePanel({ page, host }) {
  const panel = page.document.createElement('details');
  panel.id = 'kore-engine-panel'; panel.open = true;
  const setCursor = (element, value) => {
    if (typeof element.style.setProperty === 'function') element.style.setProperty('cursor', value, 'important');
    else element.style.cursor = value;
  };
  Object.assign(panel.style, {
    position: 'fixed', top: '12px', right: '12px', zIndex: '1006', boxSizing: 'border-box',
    width: 'min(420px, calc(100vw - 24px))', maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)',
    overflow: 'auto', padding: '10px', border: '1px solid #687586', borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.96)', color: '#1f2933', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
    font: '12px/1.4 system-ui, sans-serif',
  });
  setCursor(panel, 'default');
  const summary = page.document.createElement('summary'); summary.textContent = 'KoreEngine'; panel.append(summary);
  setCursor(summary, 'pointer');
  const clearButton = page.document.createElement('button'); clearButton.type = 'button'; clearButton.textContent = 'Clear console';
  clearButton.addEventListener('click', () => host.clearConsole()); panel.append(clearButton); setCursor(clearButton, 'pointer');
  const commandInput = page.document.createElement('input'); commandInput.type = 'text'; commandInput.setAttribute('aria-label', 'KoreEngine command');
  const commandButton = page.document.createElement('button'); commandButton.type = 'button'; commandButton.textContent = 'Send command';
  commandButton.addEventListener('click', () => host.debugCommand?.(commandInput.value)); setCursor(commandInput, 'text'); setCursor(commandButton, 'pointer');
  panel.append(commandInput, commandButton);
  const infoNode = page.document.createElement('textarea'); infoNode.readOnly = true; infoNode.rows = 8; infoNode.setAttribute('aria-label', 'KoreEngine status'); panel.append(infoNode); setCursor(infoNode, 'text');
  const consoleNode = page.document.createElement('textarea'); consoleNode.readOnly = true; consoleNode.rows = 10; consoleNode.setAttribute('aria-label', 'KoreEngine console'); panel.append(consoleNode); setCursor(consoleNode, 'text');
  return { panel, infoNode, consoleNode, clearButton, commandInput, commandButton, update(current) {
    infoNode.value = JSON.stringify({ status: current.status, streamStatus: current.streamStatus, worldReady: current.worldReady, mapResourceState: current.mapResourceState, runtimeStatus: current.runtimeStatus, lastDiagnostic: current.lastDiagnostic }, null, 2);
    consoleNode.value = current.logs.map(entry => `[${entry.level}] ${entry.text}`).join('\n');
  } };
}

export function startOptionalKore(options) {
  try {
    const page = globalThis;
    let panelView = null;
    const host = createKoreIntegration({ ...options, page, manifest: page.LastROExecutableManifest, onChange(current) {
      if (!page.document?.body) return;
      if (!panelView) { panelView = createKorePanel({ page, host }); page.document.body.append(panelView.panel); }
      panelView.update(current);
    } });
    page.KoreEngine = host; void host.start(); return host;
  } catch (error) { globalThis.console?.error('[KoreEngine] optional host failed', error); return null; }
}
