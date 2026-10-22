// Public, optional host. Only the passive inbound map stream crosses this boundary.
import { createMapResourceProvider } from './map-resource-provider.mjs';
import { createKoreConfigStore } from './kore-config-store.mjs';
import { createKoreLtsdClient } from './kore-ltsd-client.mjs';
import { copyText } from './kore-clipboard.mjs';
export const KORE_PROTOCOL_PROFILE = 'lastro-20211103';
const compatibleProfiles = new Set([KORE_PROTOCOL_PROFILE, 'lastro-2x']);
const idPattern = /^[a-f0-9]{64}$/;
const metadataFields = ['schemaVersion', 'engineVersion', 'bridgeApiVersion', 'schedulerCapabilities', 'packetver', 'profile', 'commitSha', 'sourceDirty', 'mode', 'toolVersions', 'buildId', 'chunks', 'files'];
const schedulerCapabilities = ['fourQueues', 'oneShotDeadline', 'residentExecutor'];
const MAX_PENDING_GAME_CHUNKS = 512;
const MAX_PENDING_GAME_BYTES = 2 * 1024 * 1024;
const MAX_RESIDENT_IN_FLIGHT_EVENTS = 256;
const MAX_RESIDENT_BUFFERED_EVENTS = 768;
const RESIDENT_PRIORITY_EVENTS = new Set([
  'gameSessionStarted', 'mapConnectionStarted', 'connectionDegraded', 'gameSessionEnded', 'mapResource', 'actionResult',
]);
const HEARTBEAT_INTERVAL_MS = 1000;
const WORKER_BUSY_MS = 300;
const validU8 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xff;
const validU16 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffff;
const validU32 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffffffff;
const validMapCoordinate = value => Number.isSafeInteger(value) && value >= 0 && value <= 1023;
const M4_CONFIG_FILES = new Set(['config.txt', 'mon_control.txt', 'timeouts.txt', 'pickupitems.txt', 'items_control.txt']);
export const KORE_CONFIG_FILES = Object.freeze([...M4_CONFIG_FILES]);
// 只负责把 Rust 动作交给客户端原生发包；不向 Chrome console 输出任何内容。
export function sendKoreNativePacket(action, packet, { sendPacket } = {}) {
  if (!packet || typeof sendPacket !== 'function') return false;
  return sendPacket(packet) !== false;
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
  if (file.endsWith('.wasm.enc')) return 'wasm-encrypted';
  if (file.endsWith('.wasm')) return 'wasm';
  if (file.endsWith('.json')) return 'data-json';
  if (file.endsWith('.txt')) return 'passive';
  throw Error('unsupported-package-file');
}
export async function validateKoreManifest(manifest) {
  if (!manifest || manifest.schemaVersion !== 2 || manifest.bridgeApiVersion !== 2 || manifest.packetver !== 20211103
    || !compatibleProfiles.has(manifest.profile) || !/^\d+\.\d+\.\d+$/.test(manifest.engineVersion)
    || !['debug', 'release'].includes(manifest.mode) || typeof manifest.sourceDirty !== 'boolean'
    || !(manifest.commitSha === null || /^[a-f0-9]{40}$/.test(manifest.commitSha))
    || manifest.toolVersions?.rust !== '1.99.0' || manifest.toolVersions?.wasmBindgen !== '0.2.129'
    || manifest.toolVersions?.binaryen !== (manifest.mode === 'release' ? '133' : null)
    || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(manifest.buildId ?? '')
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
  for (const required of ['kore-worker.mjs', 'kore_boot.js', 'kore_boot_bg.wasm', 'kore_wasm.js', 'core.wasm.enc', 'shared-queue.mjs']) {
    if (!paths.has(required)) throw Error('incomplete-package');
  }
  const boot = manifest.chunks?.boot;
  const core = manifest.chunks?.core;
  const filesByPath = new Map(manifest.files.map(file => [file.path, file]));
  if (!boot || boot.file !== 'kore_boot_bg.wasm' || boot.encrypted !== false || !idPattern.test(boot.sha256 ?? '')
    || !core || core.file !== 'core.wasm.enc' || core.encrypted !== true || !Number.isSafeInteger(core.keyVersion) || core.keyVersion < 1
    || !idPattern.test(core.sha256 ?? '')
    || filesByPath.get(boot.file)?.kind !== 'wasm' || filesByPath.get(boot.file)?.sha256 !== boot.sha256
    || filesByPath.get(core.file)?.kind !== 'wasm-encrypted' || filesByPath.get(core.file)?.sha256 !== core.sha256
    || paths.has('kore_wasm_bg.wasm')) throw Error('invalid-wasm-chunks');
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

export function createKoreIntegration({ page = globalThis, manifest, createWorker = url => new page.Worker(url, { type: 'module' }), onWorkerReleased = () => {}, onChange = () => {}, mapResourceProvider = null, ltsdClient = null, serverFieldsFolder = 'EP15.1', restartPolicy = {} }) {
  const state = {
    status: 'absent', packageId: null, mode: null, runtimeGeneration: 0,
    profile: KORE_PROTOCOL_PROFILE, gameSessionId: null, connectionGeneration: null,
    streamStatus: 'idle', worldReady: false, mapResourceState: 'idle',
    receivedBytes: 0, sentBytes: 0, degradedReason: null, logs: [],
    runtimeStatus: null, lastDiagnostic: null, lastCommandResult: null,
    configIdentity: null,
    bootSession: null,
    authorization: {
      phase: 'signed-out', user: null, userCode: null, verificationUriComplete: null,
      expiresAt: null, interval: 5, profileUpdatedAt: null, configCached: false, error: null, detail: null, stalled: false,
    },
    heartbeat: null, actions: [], diagnosticLog: [], disconnect: null,
    recovery: { restarts: 0, stage: 'idle', lastReason: null },
  };
  // 断线取证：只记发包时间/包号和最近一次收包时间，断线时汇总进 state.disconnect。
  const traffic = { sends: [], lastReceiveAt: null, connectedAt: null };
  const trafficNow = () => (page.performance ?? globalThis.performance).now();
  const TRAFFIC_WINDOW_MS = 60_000;
  const summarizeDisconnect = (reason, details) => {
    const now = trafficNow();
    const sends = traffic.sends.filter(entry => now - entry.t <= TRAFFIC_WINDOW_MS);
    const countWithin = ms => sends.filter(entry => now - entry.t <= ms).length;
    const perSecond = new Map();
    for (const entry of sends) { const bucket = Math.floor((now - entry.t) / 1000); perSecond.set(bucket, (perSecond.get(bucket) ?? 0) + 1); }
    const byPacket = new Map();
    for (const entry of sends) if (now - entry.t <= 10_000) byPacket.set(entry.id, (byPacket.get(entry.id) ?? 0) + 1);
    const ago = value => (value == null ? null : Math.round(now - value));
    return {
      at: Date.now(), reason: String(reason),
      closeCode: Number.isInteger(details?.code) ? details.code : null,
      closeReason: typeof details?.reason === 'string' ? details.reason.slice(0, 120) : null,
      wasClean: typeof details?.wasClean === 'boolean' ? details.wasClean : null,
      socketAgeMs: ago(traffic.connectedAt),
      lastSendAgoMs: ago(sends.at(-1)?.t), lastReceiveAgoMs: ago(traffic.lastReceiveAt),
      sendsLast1s: countWithin(1000), sendsLast10s: countWithin(10_000), sendsLast60s: sends.length,
      peakSendsPerSecond: Math.max(0, ...perSecond.values()),
      topPacketsLast10s: [...byPacket].sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([id, count]) => ({ id: id == null ? 'unknown' : `0x${id.toString(16).padStart(4, '0')}`, count })),
      sentBytes: state.sentBytes, receivedBytes: state.receivedBytes,
    };
  };
  // Worker 崩溃后的自动重建：窗口内最多 maxRestarts 次，按 backoffMs 递增等待；用尽后才进入 failed。
  const policy = { maxRestarts: 3, windowMs: 10 * 60_000, backoffMs: [500, 2000, 5000], resyncDelayMs: 500, resyncTimeoutMs: 30_000, ...restartPolicy };
  let restartTimes = [];
  let restartTimer = null;
  let recovery = null;
  let recoveryTimer = null;
  let lastAiMode = null;
  let worker = null;
  let session = null;
  let coreReady = false;
  let bootReady = false;
  let runtimeGeneration = 0;
  let packageInfo = null;
  const GAME_BOUND_PHASES = new Set(['ready', 'starting-license', 'loading-profile', 'loading-runtime', 'profile-missing',
    'profile-unavailable', 'cache-fallback', 'quota-exceeded', 'rebuilding-instance', 'waiting-bind', 'binding-character', 'error']);
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
  let outputsSinceHeartbeat = false;
  let outputsPendingAtHeartbeat = false;
  let lastBusyLogAt = 0;
  let removeWorkerListener = () => {};
  const resources = mapResourceProvider ?? createMapResourceProvider({
    page,
    fetchImpl: page.fetch?.bind(page),
    indexedDBFactory: page.indexedDB,
    databaseName: 'kore-map-resources',
  });
  const configStore = createKoreConfigStore({ page, indexedDBFactory: page.indexedDB });
  const ltsd = ltsdClient ?? createKoreLtsdClient({ page, fetchImpl: page.fetch?.bind(page), storage: page.localStorage });
  let devicePollTimer = null;
  const stateSubscribers = new Set();
  const changed = () => {
    try { onChange(state); } catch { /* UI must not affect transport. */ }
    for (const listener of stateSubscribers) { try { listener(state); } catch { /* UI must not affect transport. */ } }
  };
  const logEntry = entry => {
    state.logs.push(entry);
    if (state.logs.length > 1000) state.logs.splice(0, state.logs.length - 1000);
    changed();
  };
  const log = (level, text, domain = 'system') => logEntry({
    level, domain, text: String(text).slice(0, 1024), timestamp: Date.now(),
  });
  const commandOutputSubscribers = new Set();
  const pendingCommands = new Map();
  const MAX_PENDING_COMMANDS = 64;
  const notifyCommandOutput = entry => {
    for (const listener of commandOutputSubscribers) {
      try { listener({ command: entry.command, result: entry.result, silent: entry.silent }); } catch { /* UI must not affect transport. */ }
    }
  };
  const settleCommandResult = (result, { requestId = null, bridgeSequence = null } = {}) => {
    let key = bridgeSequence != null ? `bridge:${bridgeSequence}` : requestId != null ? `request:${requestId}` : null;
    let entry = key ? pendingCommands.get(key) : null;
    if (!entry && key === null && pendingCommands.size > 0) {
      // Legacy Worker commandResult messages do not always carry a usable
      // correlation id; settle the oldest pending command as a compat fallback.
      const first = pendingCommands.entries().next().value;
      if (first) [key, entry] = first;
    }
    if (entry) pendingCommands.delete(key);
    if (entry?.command === 'reload all') {
      const accepted = result?.accepted === true || result?.ok === true;
      updateAuthorization({ phase: accepted ? 'ready' : 'error', error: accepted ? null : result?.code ?? 'config-reload-rejected', detail: null });
    }
    const silent = entry?.silent === true;
    if (entry) notifyCommandOutput({ ...entry, result });
    if (!silent) {
      state.lastCommandResult = result;
      // Structured output keeps its blocks so the panel can align tables and
      // color rows by domain; other results stay one-line diagnostics.
      if (result?.kind === 'output' && Array.isArray(result.blocks)) {
        logEntry({
          level: result.ok ? 'message' : 'error', domain: 'info',
          text: formatKoreCommandResult(result), timestamp: Date.now(),
          blocks: result.blocks, command: result.command,
        });
      } else if (result?.kind !== 'reload') {
        // reload 的结果由 Rust 以 `config` 域日志给出（摘要 + 每条诊断的中文提示），
        // Host 不再自己拼英文摘要；lastCommandResult 仍保留给调试面板。
        log(result?.kind === 'error' || result?.accepted === false ? 'warn' : 'info', `< ${formatKoreCommandResult(result)}`);
      }
    }
    changed();
    return entry !== undefined;
  };
  const failWorker = (reason, { retryable = true } = {}) => {
    if (state.status === 'disposed' || state.status === 'failed' || state.status === 'restarting') return;
    if (retryable && scheduleRestart(String(reason || 'worker-transport-failed'))) return;
    state.status = 'failed';
    state.worldReady = false;
    state.streamStatus = 'degraded';
    state.degradedReason = String(reason || 'worker-transport-failed');
    pendingCommands.clear();
    log('error', state.degradedReason);
    // 授权流程中途失败时面板不能停在等待状态，必须展示原因。
    if (state.authorization.phase !== 'ready') updateAuthorization({ phase: 'error', error: state.degradedReason, detail: null });
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
    if (!worker || !coreReady) return;
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
  const ACTION_CONTEXT_KEYS = new Set(['type', 'requestId', 'routeId', 'runtimeSessionId', 'gameSessionId', 'connectionGeneration', 'controlGeneration', 'taskIntentGeneration', 'nextDeadlineMs']);
  const recordAction = (action, accepted, reason) => {
    const detail = Object.entries(action && typeof action === 'object' ? action : {})
      .filter(([key]) => !ACTION_CONTEXT_KEYS.has(key)).map(([key, value]) => `${key}=${value}`).join(' ');
    state.actions.push({ timestamp: Date.now(), requestId: action?.requestId ?? null, routeId: action?.routeId ?? null,
      type: String(action?.type ?? '?'), detail, accepted, reason: reason ?? null });
    if (state.actions.length > 50) state.actions.splice(0, state.actions.length - 50);
  };
  const supportedActionTypes = new Set(['MoveTo', 'Attack', 'Sit', 'Stand', 'Equip', 'Unequip', 'UseSkillOnTarget', 'UseSkillSelf', 'UseSkillAt', 'UseItem', 'Pickup', 'DropItem',
    'StorageTransfer', 'StorageClose', 'NpcTalk', 'NpcMenu', 'NpcContinue', 'NpcClose', 'NpcNumber', 'NpcText', 'NpcShopSelect', 'ShopBuy', 'ShopSell', 'PrivateAirship', 'SelectWarpPoint', 'Restart']);
  const validActionPayload = action => {
    if (!supportedActionTypes.has(action.type)) return 'unsupported-action';
    const gid = value => validU32(value) && value > 0;
    const skill = value => validU32(value) && value > 0;
    const level = value => validU16(value) && value > 0;
    switch (action.type) {
      case 'MoveTo': return validMapCoordinate(action.x) && validMapCoordinate(action.y) ? null : 'malformed-action';
      case 'Attack': return gid(action.targetGid) ? null : 'malformed-action';
      case 'Sit':
      case 'Stand': return null;
      case 'Equip': return validU16(action.inventoryIndex) && validU32(action.position) && action.position > 0 ? null : 'malformed-action';
      case 'Unequip': return validU16(action.inventoryIndex) ? null : 'malformed-action';
      case 'UseSkillOnTarget': return skill(action.skillId) && level(action.level) && gid(action.targetGid) ? null : 'malformed-action';
      case 'UseSkillSelf': return skill(action.skillId) && level(action.level) ? null : 'malformed-action';
      case 'UseSkillAt': return skill(action.skillId) && level(action.level) && validMapCoordinate(action.x) && validMapCoordinate(action.y) ? null : 'malformed-action';
      case 'UseItem': return validU16(action.inventoryIndex) && gid(action.targetGid) ? null : 'malformed-action';
      case 'Pickup': return gid(action.itemGid) ? null : 'malformed-action';
      case 'DropItem': return validU16(action.inventoryIndex) && validU16(action.amount) && action.amount > 0 ? null : 'malformed-action';
      case 'StorageTransfer': return validU16(action.inventoryIndex) && validU32(action.amount) && action.amount > 0 && typeof action.toStorage === 'boolean' ? null : 'malformed-action';
      case 'StorageClose': return null;
      case 'NpcTalk':
      case 'NpcContinue':
      case 'NpcClose': return gid(action.npcGid) ? null : 'malformed-action';
      case 'NpcNumber': return gid(action.npcGid) && Number.isSafeInteger(action.value) ? null : 'malformed-action';
      case 'NpcText': return gid(action.npcGid) && typeof action.text === 'string' ? null : 'malformed-action';
      case 'NpcMenu': return gid(action.npcGid) && validU8(action.choice) ? null : 'malformed-action';
      case 'NpcShopSelect': return gid(action.npcGid) && typeof action.sell === 'boolean' ? null : 'malformed-action';
      // 同一个 NPC 的所有物品合并成一个 0x00C8 封包（服务器买一次就关商店窗口）。
      case 'ShopBuy': return gid(action.npcGid) && Array.isArray(action.items) && action.items.length > 0 && action.items.length <= 64
        && action.items.every(entry => entry && gid(entry.itemId) && validU32(entry.amount) && entry.amount > 0) ? null : 'malformed-action';
      // 所有该卖的合并成一个 0x00C9 封包（OpenKore sendSellBulk）。
      case 'ShopSell': return gid(action.npcGid) && Array.isArray(action.items) && action.items.length > 0 && action.items.length <= 64
        && action.items.every(entry => entry && validU16(entry.inventoryIndex) && validU32(entry.amount) && entry.amount > 0) ? null : 'malformed-action';
      case 'PrivateAirship': {
        const hasX = action.x !== undefined;
        const hasY = action.y !== undefined;
        if (hasX !== hasY || (hasX && (!validMapCoordinate(action.x) || !validMapCoordinate(action.y)))) return 'malformed-action';
        if (action.itemId !== undefined && (!validU32(action.itemId) || action.itemId <= 0)) return 'malformed-action';
        return typeof action.destinationId === 'string' && action.destinationId.length > 0
          && typeof action.expectedMap === 'string' && action.expectedMap.length > 0 ? null : 'malformed-action';
      }
      // 0x011B 的 mapName 是 Z16：最多 15 个可见字符（含 .gat），不能为空。
      case 'SelectWarpPoint': return skill(action.skillId) && typeof action.mapName === 'string'
        && action.mapName.length > 0 && action.mapName.length <= 15 && [...action.mapName].every(char => char.charCodeAt(0) > 0x1f) ? null : 'malformed-action';
      case 'Restart': return null;
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
      recordAction(action, false, validationReason);
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
    recordAction(action, accepted, reason);
    if (!accepted) log('warn', `action rejected: ${action.type} #${action.requestId} (${reason})`);
    postActionResult(action, accepted, reason);
  };
  const recordDiagnostic = diagnostic => {
    state.lastDiagnostic = diagnostic;
    // ai-state 每个 tick 都会输出；只记录判断内容变化，避免历史被刷屏。
    const text = formatKoreDiagnosticLine(diagnostic);
    if (text !== state.diagnosticLog.at(-1)?.text) {
      state.diagnosticLog.push({ timestamp: Date.now(), text });
      if (state.diagnosticLog.length > 40) state.diagnosticLog.splice(0, state.diagnosticLog.length - 40);
    }
    changed();
  };
  const requestDisconnect = reason => {
    const text = String(reason ?? 'runtime-disconnect-intent').slice(0, 1024);
    log('warn', `Rust requested disconnect: ${text}`);
    let accepted = false;
    try {
      accepted = page.KoreEngineDisconnect?.(text) === true;
    } catch (error) {
      log('error', `disconnect hook failed: ${String(error?.message ?? error)}`);
      return;
    }
    if (!accepted) log('warn', 'disconnect intent was not accepted by the Host socket layer');
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
        // 恢复期间新 Runtime 一律汇报 off，不能覆盖崩溃前记下的 AI 模式。
        if (!recovery && typeof output.aiMode === 'string') lastAiMode = output.aiMode;
        state.worldReady = output.worldReady === true;
        advanceRecovery();
        if (typeof output.streamStatus === 'string') state.streamStatus = output.streamStatus;
        changed();
      } else if (kind === 'diagnostic') {
        recordDiagnostic(output);
      } else if (kind === 'commandResult') {
        settleCommandResult(output.result ?? output, { bridgeSequence: output.bridgeSequence ?? null });
      } else if (kind === 'log') {
        log(output.level ?? 'info', output.text ?? '', output.domain ?? 'info');
      } else if (kind === 'disconnect') {
        requestDisconnect(output.reason);
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
  // 规划路线用的目标地图 field 预载：和当前地图的加载流程互不干扰（不碰 activeResourceRequestId
  // 和 mapResourceState），只负责取文件、事后把校验过的文件写进缓存。
  async function handlePreloadRequest(message) {
    if (!session || message.runtimeSessionId !== session) return;
    try {
      const response = await resources.handleResourceRequest(message);
      const result = response.result?.kind === 'fieldMap'
        ? { ...response.result, files: response.result.files.map(file => ({ ...file, bytes: file.bytes.slice(0) })) }
        : response.result;
      const transfer = result?.kind === 'fieldMap'
        ? result.files.map(file => file.bytes).filter(bytes => bytes instanceof ArrayBuffer) : [];
      postWorker({ type: 'preloadResult', requestId: message.requestId, result }, transfer);
    } catch (error) {
      postWorker({ type: 'preloadResult', requestId: message.requestId,
        result: { kind: 'error', code: 'host-resource-error', message: String(error?.message ?? error) } });
    }
  }
  async function handlePreloadCommit(message) {
    if (!session || message.runtimeSessionId !== session) return;
    try {
      await resources.handleResourceValidation({ sourceRequestId: message.sourceRequestId,
        acceptedFiles: message.acceptedFiles, rejectedFiles: message.rejectedFiles });
    } catch (error) {
      log('warn', `Field preload cache commit failed: ${String(error?.message ?? error)}`);
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
  // 这些阶段本应在几秒内结束；超时说明某一步没有回应，需要给用户和日志明确的线索。
  const STALL_PHASES = new Set(['waiting-bind', 'binding-character', 'loading-profile', 'loading-runtime']);
  const STALL_MS = 10000;
  let stallTimer = null;
  const describeAuthorizationContext = () => {
    const character = gameSession
      ? `aid=${gameSession.aid} cid=${gameSession.cid} nid=${gameSession.nid} map=${gameSession.mapName}` : 'none';
    return `status=${state.status} worker=${Boolean(worker)} boot=${bootReady} core=${coreReady} `
      + `account=${Boolean(state.authorization.user)} character=${character}`;
  };
  const armStallWatch = () => {
    if (stallTimer !== null) page.clearTimeout?.(stallTimer);
    stallTimer = null;
    const phase = state.authorization.phase;
    if (!STALL_PHASES.has(phase) || typeof page.setTimeout !== 'function') return;
    stallTimer = page.setTimeout(() => {
      stallTimer = null;
      if (state.authorization.phase !== phase) return;
      log('warn', `authorization stalled in "${phase}" for ${STALL_MS / 1000}s: ${describeAuthorizationContext()}`);
      updateAuthorization({ stalled: true });
    }, STALL_MS);
  };
  const updateAuthorization = values => {
    const previous = state.authorization;
    const phaseChanged = values.phase !== undefined && values.phase !== previous.phase;
    state.authorization = { ...previous, ...values, ...(phaseChanged && values.stalled === undefined ? { stalled: false } : {}) };
    const { phase, error } = state.authorization;
    if (phaseChanged || (values.error !== undefined && values.error !== previous.error)) {
      log(phase === 'error' ? 'error' : error ? 'warn' : 'info',
        `authorization ${previous.phase} -> ${phase}${error ? ` (${error})` : ''}`);
    }
    if (phaseChanged) armStallWatch();
    changed();
    if (phaseChanged) advanceRecovery();
  };
  const authorizationDiagnostics = () => {
    const auth = state.authorization;
    const character = gameSession
      ? `aid=${gameSession.aid} cid=${gameSession.cid} nid=${gameSession.nid} map=${gameSession.mapName}` : '无';
    const clock = timestamp => new Date(timestamp).toISOString().slice(11, 19);
    return [
      'KoreEngine 诊断信息',
      `时间: ${new Date().toISOString()}`,
      `授权阶段: ${auth.phase}${auth.stalled ? '（长时间无响应）' : ''}`,
      `错误码: ${auth.error ?? '-'}`,
      `运行状态: ${state.status}${state.degradedReason ? ` (${state.degradedReason})` : ''}`,
      `启动层就绪: ${bootReady}  核心就绪: ${coreReady}`,
      `构建: ${state.bootSession?.buildId ?? '-'}  包: ${state.packageId ?? '-'}`,
      `实例: ${state.bootSession?.instanceId ?? '-'}`,
      `LTSD 账号: ${auth.user ? (auth.user.id ?? auth.user.user_id ?? '已登录') : '未登录'}`,
      `角色: ${character}`,
      '最近日志:',
      ...state.logs.slice(-20).map(entry => `  [${clock(entry.timestamp)}] ${entry.level} ${entry.text}`),
    ].join('\n');
  };
  function sendAuthorizationToBoot() {
    if (!bootReady || !worker || !session || !state.authorization.user) {
      log('info', `LTSD account not handed to boot yet: ${describeAuthorizationContext()}`);
      return false;
    }
    const userId = state.authorization.user.id ?? state.authorization.user.user_id;
    if (userId === null || userId === undefined || String(userId).trim() === '') {
      log('error', 'LTSD account has no usable id; cannot hand it to boot');
      return false;
    }
    return postWorker({ type: 'authorizationAvailable', userId: String(userId) }) !== null;
  }
  function sendCharacterToBoot() {
    if (!bootReady || !worker || !session || !gameSession) {
      log('info', `character not handed to boot yet: ${describeAuthorizationContext()}`);
      return false;
    }
    const { aid, cid, nid } = gameSession;
    if (![aid, cid, nid].every(Number.isSafeInteger) || !(aid > 0 && cid > 0 && nid > 0)) {
      log('warn', `character identity incomplete (aid=${aid} cid=${cid} nid=${nid}); LTSD binding cannot start`);
      updateAuthorization({ phase: 'error', error: 'character-identity-incomplete' });
      return false;
    }
    const sent = postWorker({ type: 'bindCharacter', character: {
      aid, cid, nid, name: gameSession.name ?? '', baseLevel: gameSession.baseLevel ?? null,
      jobLevel: gameSession.jobLevel ?? null, jobId: gameSession.jobId ?? null, mapName: gameSession.mapName,
    } }) !== null;
    if (sent && !state.authorization.user) updateAuthorization({ phase: 'signed-out' });
    return sent;
  }
  function stopDevicePolling() {
    if (devicePollTimer !== null) page.clearTimeout?.(devicePollTimer);
    devicePollTimer = null;
  }
  function scheduleDevicePoll(delaySeconds) {
    stopDevicePolling();
    if (typeof page.setTimeout !== 'function') return;
    devicePollTimer = page.setTimeout(() => { devicePollTimer = null; void pollDeviceAuthorization(); }, delaySeconds * 1000);
  }
  async function pollDeviceAuthorization() {
    try {
      const result = await ltsd.pollDeviceAuthorization();
      if (result.status === 'pending' || result.status === 'slow-down') {
        updateAuthorization({ phase: 'awaiting-approval', interval: result.interval });
        scheduleDevicePoll(result.interval);
        return;
      }
      if (result.status === 'expired' || result.status === 'denied') {
        updateAuthorization({ phase: result.status === 'expired' ? 'device-expired' : 'device-denied', error: null });
        return;
      }
      stopDevicePolling();
      updateAuthorization({ phase: 'checking-account', userCode: null, verificationUriComplete: null, expiresAt: null });
      const account = await ltsd.getMe();
      if (!account.ok || !account.user) {
        updateAuthorization({ phase: 'signed-out', user: null, error: account.body?.error?.code ?? 'account-check-failed' });
        return;
      }
      updateAuthorization({ phase: gameSession ? 'waiting-bind' : 'waiting-character', user: account.user, error: null });
      sendAuthorizationToBoot();
      sendCharacterToBoot();
    } catch (error) {
      stopDevicePolling();
      updateAuthorization({ phase: ltsd.hasToken() ? 'error' : 'signed-out', error: String(error?.message ?? error) });
    }
  }
  async function refreshLtsdAccount() {
    if (!ltsd.hasToken()) {
      updateAuthorization({ phase: 'signed-out', user: null, error: null });
      return;
    }
    updateAuthorization({ phase: 'checking-account', error: null });
    try {
      const account = await ltsd.getMe();
      if (account.ok && account.user) {
        updateAuthorization({ phase: gameSession ? 'waiting-bind' : 'waiting-character', user: account.user, error: null });
        sendAuthorizationToBoot();
        sendCharacterToBoot();
      } else if (account.status === 401) {
        ltsd.clearToken();
        updateAuthorization({ phase: 'signed-out', user: null, error: 'KE_AUTH_UNAUTHENTICATED' });
      } else {
        updateAuthorization({ phase: 'error', error: account.body?.error?.code ?? 'account-check-failed' });
      }
    } catch (error) {
      updateAuthorization({ phase: 'error', error: String(error?.message ?? error) });
    }
  }
  async function refreshConfiguration(requestedIdentity = null, requestedGameSessionId = gameSession?.id) {
    const current = gameSession;
    if (!current || current.id !== requestedGameSessionId) {
      log('warn', `config sync skipped: no matching game session (${describeAuthorizationContext()})`);
      return { status: 'stale-session' };
    }
    const identity = requestedIdentity ?? { profile: state.profile, aid: current.aid, cid: current.cid, nid: current.nid };
    if (identity.profile !== state.profile || identity.aid !== current.aid || identity.cid !== current.cid || identity.nid !== current.nid
      || !Number.isSafeInteger(identity.aid) || !Number.isSafeInteger(identity.cid) || !Number.isSafeInteger(identity.nid)) {
      log('error', `config sync skipped: character identity mismatch (${describeAuthorizationContext()})`);
      return { status: 'identity-mismatch' };
    }
    if (!ltsd.hasToken()) {
      updateAuthorization({ phase: 'signed-out', configCached: false, error: null });
      return { status: 'unauthorized' };
    }
    updateAuthorization({ phase: 'loading-profile', configCached: false, error: null, detail: null });
    let response = null;
    let failure = null;
    try {
      const query = new globalThis.URLSearchParams({ aid: String(identity.aid), cid: String(identity.cid), nid: String(identity.nid) });
      response = await ltsd.request('GET', `/profiles/active?${query}`);
    } catch (error) { failure = String(error?.message ?? error); }
    if (gameSession?.id !== current.id) return { status: 'stale-session' };
    if (response?.status === 401) {
      ltsd.clearToken();
      updateAuthorization({ phase: 'signed-out', user: null, configCached: false, error: 'KE_AUTH_UNAUTHENTICATED' });
      return { status: 'unauthorized' };
    }
    if (response?.status === 404 && response.body?.error?.code === 'KE_PROFILE_NOT_FOUND') {
      updateAuthorization({ phase: 'profile-missing', configCached: false, error: 'KE_PROFILE_NOT_FOUND' });
      return { status: 'profile-missing' };
    }
    let documents = null;
    let fetchedAt = null;
    let configCached = false;
    if (response?.ok && response.body?.files && typeof response.body.files === 'object' && !Array.isArray(response.body.files)
      && Object.keys(response.body.files).length === KORE_CONFIG_FILES.length
      && KORE_CONFIG_FILES.every(fileName => typeof response.body.files[fileName] === 'string')) {
      const saved = await configStore.replaceProfile(identity, response.body.files);
      documents = saved.filter(document => M4_CONFIG_FILES.has(document.fileName));
      fetchedAt = Date.now();
      failure = null;
    } else if (response?.ok) {
      failure = 'active-profile-response-invalid';
    } else if (response) {
      failure = response.body?.error?.code ?? `ltsd-http-${response.status}`;
    }
    if (!documents) {
      const rejectedRequest = response && response.status >= 400 && response.status < 500
        && ![404, 429].includes(response.status);
      if (rejectedRequest) {
        updateAuthorization({ phase: 'error', error: failure ?? response.body?.error?.code ?? 'active-profile-request-failed' });
        return { status: response.status === 401 ? 'unauthorized' : 'request-rejected' };
      }
      try {
        documents = await configStore.getProfile(identity);
      } catch (error) { failure ??= String(error?.message ?? error); }
      documents = (documents ?? []).filter(document => M4_CONFIG_FILES.has(document.fileName));
      if (documents.length !== KORE_CONFIG_FILES.length) {
        updateAuthorization({ phase: 'profile-unavailable', error: failure ?? 'active-profile-unavailable' });
        return { status: 'unavailable', error: failure };
      }
      fetchedAt = Math.max(...documents.map(document => Number(document.savedAt) || 0)) || null;
      configCached = true;
    }
    const sent = sendCommand('reload all', {
      documents,
      profile: identity.profile,
      aid: identity.aid,
      cid: identity.cid,
      nid: identity.nid,
      gameSessionId: current.id,
    });
    if (!sent) {
      updateAuthorization({ phase: 'error', configCached, profileUpdatedAt: fetchedAt, error: 'reload-all-not-sent' });
      return { status: 'reload-failed' };
    }
    updateAuthorization({
      phase: configCached ? 'cache-fallback' : 'loading-runtime',
      configCached,
      profileUpdatedAt: fetchedAt,
      error: configCached ? failure ?? 'active-profile-unavailable' : null,
    });
    return { status: 'loaded', cached: configCached, updatedAt: fetchedAt, error: configCached ? failure : null };
  }
  async function handleConfigRequest(message) {
    if (!session || message.runtimeSessionId !== session) return;
    const aid = Number.isSafeInteger(message.aid) ? message.aid : gameSession?.aid;
    const cid = Number.isSafeInteger(message.cid) ? message.cid : gameSession?.cid;
    const nid = Number.isSafeInteger(message.nid) ? message.nid : gameSession?.nid;
    if (!aid || !cid || !nid) { log('warn', 'config request ignored: no verified aid/cid/nid'); return; }
    const identity = { profile: message.profile ?? state.profile, aid, cid, nid };
    const result = await refreshConfiguration(identity, gameSession?.id);
    if (result.status !== 'loaded') log(result.status === 'profile-missing' ? 'warn' : 'error', `Config auto-load: ${result.status}${result.error ? ` (${result.error})` : ''}`);
  }
  async function handleLtsdRequest(message) {
    if (!session || message.runtimeSessionId !== session || typeof message.endpoint !== 'string'
      || !['GET', 'POST'].includes(message.method)) return;
    try {
      log('info', `LTSD ${message.method} ${message.endpoint} ...`);
      const response = await ltsd.request(message.method, message.endpoint, { body: message.body });
      const errorCode = response.ok ? null : response.body?.error?.code;
      log(response.ok ? 'info' : 'warn', `LTSD ${message.method} ${message.endpoint} -> HTTP ${response.status}${errorCode ? ` ${errorCode}` : ''}`);
      if (response.status === 401) {
        ltsd.clearToken();
        updateAuthorization({ phase: 'signed-out', user: null, configCached: false, error: 'KE_AUTH_UNAUTHENTICATED' });
        postWorker({ type: 'authorizationUnavailable' });
      }
      postWorker({ type: 'ltsdResponse', ltsdRequestId: message.ltsdRequestId, status: response.status, body: response.bodyText });
    } catch (error) {
      log('error', `LTSD ${message.method} ${message.endpoint} failed: ${String(error?.message ?? error)}`);
      postWorker({ type: 'ltsdResponse', ltsdRequestId: message.ltsdRequestId, status: 0, body: String(error?.message ?? error) });
    }
  }
  // ---- Worker 自动重建与会话恢复 ----
  // 重建后 Runtime 是全新的：世界状态（背包、技能、实体）为空，且收包流从中途开始。恢复步骤：
  //  1. 重新握手（账号、角色 id 取自 Host 已保存的 gameSession，不依赖 Worker 旧状态）；
  //  2. 在原生接收缓冲没有半个包的地方重新对齐字节流，不能从封包中间开始解析；
  //  3. 用私人飞艇换图，让服务器重新下发技能/背包/地图信息（已在 prontera 则改去 payon）；
  //  4. 世界就绪且配置加载完成后恢复崩溃前的 AI 模式。
  const timerSet = (callback, delay) => (page.setTimeout ?? globalThis.setTimeout)(callback, delay);
  const timerClear = id => (page.clearTimeout ?? globalThis.clearTimeout)(id);
  const normalizeMapName = value => String(value ?? '').trim().replace(/\.(?:gat|rsw)$/i, '').toLowerCase();
  const currentMapName = () => {
    let live = '';
    try { live = String(page.KoreEngineCurrentMap?.() ?? ''); } catch { /* 取不到就用登录时的地图 */ }
    return normalizeMapName(live) || normalizeMapName(gameSession?.mapName);
  };
  const setRecoveryStage = (stage, reason = state.recovery.lastReason) => {
    state.recovery = { restarts: state.recovery.restarts, stage, lastReason: reason };
    changed();
  };
  function finishRecovery(outcome) {
    if (recoveryTimer !== null) timerClear(recoveryTimer);
    recoveryTimer = null;
    if (!recovery) return;
    log(outcome === 'done' ? 'info' : 'warn', `会话恢复结束: ${outcome}`);
    recovery = null;
    setRecoveryStage('idle');
  }
  const teardownWorker = () => {
    removeWorkerListener(); removeWorkerListener = () => {};
    if (heartbeatTimer !== null && page.clearInterval) page.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    if (stallTimer !== null) timerClear(stallTimer);
    stallTimer = null;
    try { worker?.terminate?.(); } catch { /* best effort */ }
    worker = null; session = null; coreReady = false; bootReady = false;
    ingressPending = []; ingressInFlight.clear(); residentIngressGameChunks = 0; residentIngressGameBytes = 0;
    pendingCommands.clear(); activeResourceRequestId = null;
    outputsSinceHeartbeat = false; outputsPendingAtHeartbeat = false;
    state.bootSession = null; state.heartbeat = null; state.worldReady = false; state.runtimeStatus = null;
    state.mapResourceState = 'idle';
    try { onWorkerReleased(); } catch { /* best effort */ }
  };
  // 返回 true 表示已安排重建（调用方不要再标记 failed）。
  function scheduleRestart(reason, { manual = false } = {}) {
    if (!packageInfo || state.status === 'disposed') return false;
    const now = Date.now();
    restartTimes = restartTimes.filter(time => now - time < policy.windowMs);
    if (!manual && restartTimes.length >= policy.maxRestarts) {
      log('error', `Worker 在 ${Math.round(policy.windowMs / 60000)} 分钟内已自动重启 ${restartTimes.length} 次，不再重试；请刷新页面。最后原因: ${reason}`);
      return false;
    }
    restartTimes.push(now);
    const attempt = restartTimes.length;
    const delay = policy.backoffMs[Math.min(attempt - 1, policy.backoffMs.length - 1)] ?? 0;
    recovery = { stage: 'restarting', aiMode: recovery?.aiMode ?? lastAiMode, destination: null };
    if (recoveryTimer !== null) timerClear(recoveryTimer);
    recoveryTimer = null;
    teardownWorker();
    state.status = 'restarting'; state.degradedReason = reason; state.streamStatus = 'degraded';
    state.recovery = { restarts: state.recovery.restarts + 1, stage: 'restarting', lastReason: reason };
    updateAuthorization({ phase: gameSession ? 'waiting-bind' : state.authorization.user ? 'waiting-character' : 'signed-out', error: null, detail: null });
    log('warn', `KoreEngine Worker 异常（${reason}），${delay}ms 后自动重启（窗口内第 ${attempt} 次）`);
    if (restartTimer !== null) timerClear(restartTimer);
    restartTimer = timerSet(() => {
      restartTimer = null;
      if (state.status !== 'restarting') return;
      state.status = 'loading'; changed();
      void launchWorker({ restart: true });
    }, delay);
    changed();
    return true;
  }
  // Worker 的 core 重新就绪后：把仍然有效的游戏会话/地图连接重新告诉新 Runtime。
  const resumeAfterRestart = () => {
    if (!recovery) return;
    state.status = 'runtime-ready'; state.degradedReason = null;
    if (!gameSession) { finishRecovery('没有进行中的游戏会话，无需恢复'); return; }
    const id = `${session}:game:${++nextRequestId}`;
    gameSession.id = id; state.gameSessionId = id;
    gameSession.mapName = currentMapName() || gameSession.mapName;
    gameSequence = 0; gameByteOffset = 0;
    postEvent('gameSessionStarted', {
      characterGid: gameSession.characterGid, mapName: gameSession.mapName, aid: gameSession.aid, cid: gameSession.cid, nid: gameSession.nid,
      name: gameSession.name, baseLevel: gameSession.baseLevel, jobLevel: gameSession.jobLevel, jobId: gameSession.jobId,
    }, 'control', { gameSessionId: id, connectionGeneration: 0 });
    if (!connection || connection.degraded) { finishRecovery('地图连接已关闭，等待重新登录'); return; }
    // 原生 socket 仍是同一个连接：保持 generation 不变（Online.js 持有的就是这个值），只重置字节序号。
    connection.awaitingAlignment = true;
    state.streamStatus = 'awaiting-sync'; state.worldReady = false; resourceCycle += 1; state.mapResourceState = 'loading';
    postEvent('mapConnectionStarted', { mapName: gameSession.mapName, serverFieldsFolder, resourceCycle }, 'control',
      { gameSessionId: id, connectionGeneration: connection.generation });
    recovery.stage = 'awaiting-alignment';
    setRecoveryStage('awaiting-alignment');
    log('info', 'Worker 已重建，等待收包流对齐到完整封包边界');
  };
  const resyncAfterAlignment = () => {
    if (!recovery || recovery.stage !== 'awaiting-alignment') return;
    const here = currentMapName();
    const destination = here === 'prontera' ? 'payon' : 'prontera';
    let accepted = false;
    try {
      accepted = page.KoreEngineNativeAction?.({ type: 'PrivateAirship', destinationId: destination, expectedMap: destination, requestId: 0 }) === true;
    } catch (error) { log('error', `恢复换图失败: ${String(error?.message ?? error)}`); }
    if (!accepted) { finishRecovery(`飞艇请求未发出（当前地图 ${here || '未知'}），请手动换图以刷新数据`); return; }
    recovery.stage = 'awaiting-world'; recovery.destination = destination;
    setRecoveryStage('awaiting-world');
    log('info', `已请求飞艇前往 ${destination} 以重新同步技能/背包/地图`);
    recoveryTimer = timerSet(() => {
      recoveryTimer = null;
      finishRecovery('换图后 30 秒内世界仍未就绪，请手动换图或重新登录');
    }, policy.resyncTimeoutMs);
  };
  // 世界就绪且配置已加载，才恢复 AI；否则 `ai auto` 会在配置之前执行。
  function advanceRecovery() {
    if (!recovery || recovery.stage !== 'awaiting-world') return;
    if (!state.worldReady || state.authorization.phase !== 'ready') return;
    const mode = recovery.aiMode;
    if (mode === 'auto' || mode === 'manual') {
      const sent = sendCommandRaw(`ai ${mode}`, {}, { silent: false });
      log(sent ? 'info' : 'warn', `已${sent ? '' : '尝试'}恢复崩溃前的 AI 模式: ${mode}`);
    }
    finishRecovery('done');
  }

  const handleWorkerMessage = message => {
    if (!message || message.runtimeSessionId !== session) return;
    if (message.type === 'ready') {
      coreReady = true;
      state.status = 'runtime-ready';
      state.packageId = message.packageId ?? packageInfo?.manifest?.packageId ?? null;
      state.mode = packageInfo?.manifest?.mode ?? null;
      state.worldReady = message.worldReady === true;
      resumeAfterRestart();
      flushIngress();
      changed();
      return;
    }
    if (message.type === 'bootReady') {
      bootReady = true;
      state.bootSession = { instanceId: message.instanceId, publicKey: message.publicKey,
        buildId: message.buildId, buildHash: message.buildHash };
      sendAuthorizationToBoot();
      sendCharacterToBoot();
      if (!gameSession) updateAuthorization({ phase: state.authorization.user ? 'waiting-character' : 'signed-out' });
      return;
    }
    if (message.type === 'authorizationStatus') {
      const phase = String(message.phase ?? 'error');
      if (phase === 'signed-out') {
        ltsd.clearToken();
        updateAuthorization({ phase, user: null, error: message.error ?? 'KE_AUTH_UNAUTHENTICATED', detail: null });
      } else {
        updateAuthorization({ phase, error: message.error ?? null, detail: message.detail ?? null });
        if (phase === 'loading-profile' && gameSession) void refreshConfiguration(null, gameSession.id);
      }
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
      outputsSinceHeartbeat = true;
      handleOutputs(message.outputs ?? [
        ...(message.actions ?? []).map(action => ({ kind: 'action', action })),
        ...(message.status ?? []),
      ]);
      return;
    }
    if (message.type === 'actionRequest') { forwardAction(message.action, { requireTaskIntentGeneration: message.action?.routeId == null }); return; }
    if (message.type === 'log') { log(message.level ?? 'info', message.text ?? '', message.domain ?? 'info'); return; }
    if (message.type === 'disconnect') { requestDisconnect(message.reason); return; }
    if (message.type === 'resourceRequest') { void handleResourceRequest(message); return; }
    if (message.type === 'resourceValidation') { void handleResourceValidation(message); return; }
    if (message.type === 'preloadRequest') { void handlePreloadRequest(message); return; }
    if (message.type === 'preloadCommit') { void handlePreloadCommit(message); return; }
    if (message.type === 'configRequest') { void handleConfigRequest(message); return; }
    if (message.type === 'ltsdRequest') { void handleLtsdRequest(message); return; }
    if (message.type === 'mapResourceReady') {
      postEvent('mapResource', { mapName: message.mapName, version: message.version, ready: true }, 'control', {
        gameSessionId: message.gameSessionId,
        connectionGeneration: message.connectionGeneration,
        controlGeneration: message.controlGeneration,
      });
      return;
    }
    if (message.type === 'mapResourceState') { state.mapResourceState = message.mapResourceState ?? 'degraded'; changed(); return; }
    if (message.type === 'commandResult') { settleCommandResult(message.result ?? null, { requestId: message.requestId ?? null }); return; }
    if (message.type === 'heartbeat') {
      state.heartbeat = { at: Date.now(), nextDeadlineMs: message.nextDeadlineMs ?? null, queueDepth: message.queueDepth ?? null };
      // 输出已在 Worker 队列里却连续两次心跳都没有被取走，说明“有输出”的通知丢了；
      // 此后 Worker 不会再通知，AI 的动作和日志会一直卡在队列里。主动取一次即可恢复。
      const depth = message.queueDepth;
      const pending = depth && ((depth.actions ?? 0) > 0 || (depth.status ?? 0) > 0);
      // Worker 单线程串行处理消息：被一个长任务占住时，心跳请求和 drainOutputs 都在后面排队，
      // 任务一结束就连着回两个“有输出”的心跳，看起来像通知丢了，其实 drain 已经在队列里。
      const waitMs = message.queueWaitMs ?? 0;
      const slow = message.slowTask;
      const busy = waitMs >= WORKER_BUSY_MS;
      if ((busy || (slow?.ms ?? 0) >= WORKER_BUSY_MS) && Date.now() - lastBusyLogAt >= 10_000) {
        lastBusyLogAt = Date.now();
        log('warn', `Worker 处理被占住：心跳排队 ${waitMs}ms，最慢任务 ${slow ? `${slow.label} ${slow.ms}ms` : '未知'}`);
      }
      if (pending && !busy && !outputsSinceHeartbeat && outputsPendingAtHeartbeat) {
        log('warn', `Worker 输出队列滞留（actions=${depth.actions ?? 0} status=${depth.status ?? 0} 已通知=${message.outputNotice === true}），已主动取出`);
        postWorker({ type: 'drainOutputs' });
      }
      outputsPendingAtHeartbeat = pending === true;
      outputsSinceHeartbeat = false;
      changed();
      return;
    }
    if (message.type === 'fault') {
      log('error', `worker fault: ${message.message ?? 'runtime-fault'}${message.messageType ? ` while handling "${message.messageType}"` : ''}${message.stack ? `\n${message.stack}` : ''}`);
      failWorker(message.message ?? 'runtime-fault', { retryable: message.retryable !== false });
      return;
    }
    if (message.type === 'workerError') {
      // Worker 已自行消化的非致命错误：只记录，不改变运行状态。
      log('warn', `worker error (recovered): ${message.message ?? message.code ?? 'unknown'}${message.messageType ? ` while handling "${message.messageType}"` : ''}`);
      return;
    }
  };
  const attachWorker = nextWorker => {
    worker = nextWorker;
    const listener = event => handleWorkerMessage(event.data);
    const transportFailure = event => failWorker(event.message ?? (event.type === 'messageerror' ? 'worker-message-error' : 'worker-error'));
    worker.addEventListener?.('message', listener);
    worker.addEventListener?.('error', transportFailure);
    worker.addEventListener?.('messageerror', transportFailure);
    removeWorkerListener = () => {
      worker?.removeEventListener?.('message', listener);
      worker?.removeEventListener?.('error', transportFailure);
      worker?.removeEventListener?.('messageerror', transportFailure);
    };
  };
  const sendCommandRaw = (command, extraFields = {}, { silent = false } = {}) => {
    const refusal = typeof command !== 'string' || !command.trim() ? 'empty-command' : !worker || !session ? 'runtime-not-ready' : null;
    if (refusal) { if (!silent) log('warn', `command not sent: ${refusal}`); return false; }
    const fields = { ...extraFields, command, hostNetworkSnapshot: { gameSessionId: gameSession?.id ?? '', bytesSent: state.sentBytes } };
    const bridgeSequence = postEvent('command', fields, 'control');
    if (bridgeSequence === null) {
      if (!silent) log('warn', `command not sent: ingress-buffer-full (${command})`);
      return false;
    }
    pendingCommands.set(`bridge:${bridgeSequence}`, { command, silent, bridgeSequence });
    while (pendingCommands.size > MAX_PENDING_COMMANDS) {
      const oldest = pendingCommands.keys().next().value;
      pendingCommands.delete(oldest);
      log('warn', 'command output correlation overflow; dropped the oldest pending command');
    }
    if (!silent) log('info', `> ${command}`);
    return true;
  };
  const sendCommand = (command, extraFields = {}) => sendCommandRaw(command, extraFields);
  const sendCommandText = (text, { silent = false } = {}) => sendCommandRaw(String(text ?? ''), {}, { silent: silent === true });
  // 创建 Worker 并发起 init。首次启动与自动重建共用；restart 时失败要回到重建/失败判定，而不是静默停在 loading。
  async function launchWorker({ restart = false } = {}) {
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
      if (heartbeatTimer === null && page.setInterval) heartbeatTimer = page.setInterval(() => postWorker({ type: 'heartbeatRequest', sentAt: Date.now() }), HEARTBEAT_INTERVAL_MS);
    } catch (error) {
      const reason = String(error?.message ?? error);
      if (restart) { failWorker(reason); return; }
      state.status = 'failed'; state.degradedReason = reason; log('error', reason);
    }
  }
  const api = {
    state,
    async start() {
      if (state.status === 'runtime-ready' || state.status === 'loading' || state.status === 'restarting') return;
      coreReady = false;
      bootReady = false;
      state.status = 'loading'; changed();
      void refreshLtsdAccount();
      await launchWorker();
    },
    dispose() {
      if (restartTimer !== null) (page.clearTimeout ?? globalThis.clearTimeout)(restartTimer);
      restartTimer = null; finishRecovery('disposed');
      stopDevicePolling();
      if (stallTimer !== null) page.clearTimeout?.(stallTimer);
      stallTimer = null;
      if (heartbeatTimer !== null && page.clearInterval) page.clearInterval(heartbeatTimer);
      heartbeatTimer = null; removeWorkerListener();
      try { if (worker && session) worker.postMessage({ runtimeSessionId: session, type: 'dispose', requestId: ++nextRequestId }); } catch { /* best effort */ }
      try { worker?.terminate?.(); } catch { /* best effort */ }
      worker = null; session = null; coreReady = false; bootReady = false; ingressPending = []; ingressInFlight.clear(); residentIngressGameChunks = 0; residentIngressGameBytes = 0;
      pendingCommands.clear();
      gameSession = null; connection = null; activeResourceRequestId = null;
      state.bootSession = null;
      void resources.close?.(); void configStore.close?.();
      state.gameSessionId = null; state.connectionGeneration = null; state.worldReady = false; state.streamStatus = 'idle'; state.mapResourceState = 'idle';
      try { onWorkerReleased(); } catch { /* best effort */ }
      state.status = 'disposed'; changed();
    },
    beginGameSession(characterGid, mapName, identity = {}) {
      if (!worker || !session || !Number.isSafeInteger(characterGid) || typeof mapName !== 'string' || !mapName) return null;
      const id = `${session}:game:${++nextRequestId}`;
      gameSession = { id, characterGid, mapName, aid: identity.aid ?? null, cid: identity.cid ?? null, nid: identity.nid ?? null,
        name: identity.name ?? null, baseLevel: identity.baseLevel ?? null, jobLevel: identity.jobLevel ?? null, jobId: identity.jobId ?? null };
      connection = null; gameSequence = 0; gameByteOffset = 0;
      state.gameSessionId = id; state.connectionGeneration = null;
      state.configIdentity = identity.aid > 0 && identity.cid > 0 && identity.nid > 0
        ? { aid: identity.aid, cid: identity.cid, nid: identity.nid } : null;
      state.streamStatus = 'awaiting-connection'; state.worldReady = false;
      const fields = {
        characterGid, mapName, aid: gameSession.aid, cid: gameSession.cid, nid: gameSession.nid,
        name: identity.name ?? null, baseLevel: identity.baseLevel ?? null,
        jobLevel: identity.jobLevel ?? null, jobId: identity.jobId ?? null,
        // 登录状态包在 KE 启动前就发完了，zeny 没变化就不会再收到，只能靠这里补初值。
        zeny: identity.zeny ?? null,
      };
      postEvent('gameSessionStarted', fields, 'control', { gameSessionId: id, connectionGeneration: 0 });
      changed(); sendCharacterToBoot(); return id;
    },
    beginMapConnection() {
      if (!worker || !session || !gameSession) return null;
      const generation = (connection?.generation ?? 0) + 1;
      connection = { generation, degraded: false }; gameSequence = 0; gameByteOffset = 0;
      traffic.sends.length = 0; traffic.lastReceiveAt = null; traffic.connectedAt = trafficNow(); state.disconnect = null;
      state.connectionGeneration = generation; state.streamStatus = 'awaiting-sync'; state.worldReady = false;
      resourceCycle += 1; state.mapResourceState = 'loading';
      postEvent('mapConnectionStarted', { mapName: gameSession.mapName, serverFieldsFolder, resourceCycle }, 'control', { gameSessionId: gameSession.id, connectionGeneration: generation });
      changed(); return generation;
    },
    mirrorMapData(connectionGeneration, data, options = {}) {
      if (!worker || !session || !gameSession || connection?.generation !== connectionGeneration || connection.degraded) return false;
      if (connection.awaitingAlignment) {
        // 重建后的 Runtime 只能从完整封包边界开始吃数据；aligned 缺省（旧版挂钩）按已对齐处理。
        if (options?.aligned === false) return false;
        connection.awaitingAlignment = false;
        log('info', '收包流已对齐，开始向新 Runtime 转发');
        timerSet(resyncAfterAlignment, policy.resyncDelayMs);
      }
      traffic.lastReceiveAt = trafficNow();
      const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer, data.byteOffset ?? 0, data.byteLength ?? data.length);
      const event = { sequence: gameSequence, byteOffset: gameByteOffset, receivedAtMs: (page.performance ?? globalThis.performance).now(), bytes };
      const queued = postEvent('gameData', event, 'game', { gameSessionId: gameSession.id, connectionGeneration });
      if (queued === null) return false;
      gameSequence += 1; gameByteOffset += bytes.byteLength; state.receivedBytes += bytes.byteLength;
      changed(); return true;
    },
    mirrorSentBytes(bytes, gameSessionId = gameSession?.id, packetId = null) {
      if (!Number.isSafeInteger(bytes) || bytes < 0 || (gameSessionId && gameSessionId !== gameSession?.id)) return false;
      const now = trafficNow();
      traffic.sends.push({ t: now, id: Number.isInteger(packetId) ? packetId : null });
      if (traffic.sends.length > 2000 || now - traffic.sends[0].t > TRAFFIC_WINDOW_MS * 2) {
        const cutoff = now - TRAFFIC_WINDOW_MS;
        traffic.sends = traffic.sends.filter(entry => entry.t >= cutoff).slice(-2000);
      }
      state.sentBytes += bytes; changed(); return true;
    },
    degradeConnection(reason = 'connection-degraded', details = null) {
      if (!worker || !session || !gameSession || !connection) return false;
      // 同一次断线可能被调用两次（原生路径与诊断补丁）；带 close 详情的那次为准。
      if (details || !state.disconnect) {
        state.disconnect = summarizeDisconnect(reason, details);
        const d = state.disconnect;
        log('warn', `连接断开 ${d.reason} code=${d.closeCode ?? '?'} clean=${d.wasClean ?? '?'} 连接时长=${d.socketAgeMs ?? '?'}ms 距上次发包=${d.lastSendAgoMs ?? '?'}ms 距上次收包=${d.lastReceiveAgoMs ?? '?'}ms 近1s/10s/60s发包=${d.sendsLast1s}/${d.sendsLast10s}/${d.sendsLast60s} 峰值=${d.peakSendsPerSecond}/s`);
      }
      connection.degraded = true; state.worldReady = false; state.streamStatus = 'degraded'; state.mapResourceState = 'degraded'; state.degradedReason = String(reason);
      const queued = postEvent('connectionDegraded', { reason: String(reason) }, 'control', { gameSessionId: gameSession.id, connectionGeneration: connection.generation }) !== null;
      changed(); return queued;
    },
    endGameSession() {
      if (!worker || !session || !gameSession) return false;
      const ended = gameSession.id;
      postEvent('gameSessionEnded', {}, 'control', { gameSessionId: ended, connectionGeneration: connection?.generation ?? 0 });
      pendingCommands.clear();
      gameSession = null; connection = null; state.gameSessionId = null; state.connectionGeneration = null; state.worldReady = false; state.streamStatus = 'idle';
      // 退出到选角/登录页后，上一个角色的就绪或错误状态不再适用；新角色进入时会重新绑定。
      if (state.authorization.user && GAME_BOUND_PHASES.has(state.authorization.phase)) {
        updateAuthorization({ phase: 'waiting-character', error: null, detail: null, configCached: false });
      } else changed();
      return true;
    },
    clearConsole() { state.logs.length = 0; changed(); },
    debugMapRetry() { if (!gameSession || !connection) return false; resourceCycle += 1; state.mapResourceState = 'loading'; postWorker({ type: 'debugMapRetry', mapName: gameSession.mapName, resourceCycle, connectionGeneration: connection.generation }); changed(); return true; },
    saveConfigDocument(document) { return configStore.saveDocument(document); },
    getConfigDefault(fileName) { return packageInfo?.configDefaults?.[fileName] ?? null; },
    async getConfigDocuments(identity) {
      return configStore.listDocuments(identity);
    },
    async refreshConfiguration(identity = null) {
      return refreshConfiguration(identity, gameSession?.id);
    },
    // 面板“重试”：core 已就绪则重新同步配置，否则重新发起角色绑定。
    async retryAuthorization() {
      log('info', `retry requested: ${describeAuthorizationContext()}`);
      if (!state.authorization.user || !worker || !session) {
        log('warn', 'retry ignored: not signed in to LTSD or the runtime worker is not available');
        return false;
      }
      if (state.status === 'failed') {
        // 自动重建次数用尽后，用户手动重试仍可重建（不受次数限制）。
        state.status = 'loading';
        if (scheduleRestart(state.degradedReason ?? 'manual-retry', { manual: true })) return true;
        state.status = 'failed';
        log('error', `retry ignored: the runtime worker stopped (${state.degradedReason ?? 'unknown'}); reload the page`);
        return false;
      }
      if (coreReady && gameSession) {
        const result = await refreshConfiguration(null, gameSession.id);
        log(result.status === 'loaded' ? 'info' : 'warn', `retry finished: config sync ${result.status}`);
        return result.status === 'loaded';
      }
      updateAuthorization({ phase: gameSession ? 'waiting-bind' : 'waiting-character', error: null, detail: null });
      const available = sendAuthorizationToBoot();
      const sent = sendCharacterToBoot();
      log(sent && available ? 'info' : 'warn', `retry finished: account handed to boot=${available}, character handed to boot=${sent}`);
      return sent && available;
    },
    getAuthorizationDiagnostics() { return authorizationDiagnostics(); },
    async beginLtsdLogin() {
      stopDevicePolling();
      updateAuthorization({ phase: 'requesting-device', userCode: null, verificationUriComplete: null, expiresAt: null, error: null });
      try {
        const device = await ltsd.beginDeviceAuthorization();
        updateAuthorization({ phase: 'awaiting-approval', userCode: device.userCode,
          verificationUriComplete: device.verificationUriComplete, expiresAt: device.expiresAt, interval: device.interval });
        scheduleDevicePoll(device.interval);
        return true;
      } catch (error) {
        updateAuthorization({ phase: 'error', error: String(error?.message ?? error) });
        return false;
      }
    },
    openLtsdApproval() {
      const url = state.authorization.verificationUriComplete;
      if (!url) return false;
      try { return Boolean(page.open?.(url, '_blank', 'noopener,noreferrer')); } catch { return false; }
    },
    cancelLtsdLogin() {
      stopDevicePolling();
      ltsd.cancelDeviceAuthorization();
      updateAuthorization({ phase: ltsd.hasToken() ? 'waiting-character' : 'signed-out', userCode: null,
        verificationUriComplete: null, expiresAt: null, error: null });
    },
    async logoutLtsd() {
      stopDevicePolling();
      try { await ltsd.revokeToken(); } catch { /* Local sign-out must complete when LTSD is unreachable. */ }
      ltsd.clearToken();
      if (bootReady && worker && session) postWorker({ type: 'authorizationUnavailable' });
      updateAuthorization({ phase: 'signed-out', user: null, userCode: null, verificationUriComplete: null, expiresAt: null,
        profileUpdatedAt: null, configCached: false, error: null });
      return true;
    },
    reloadConfig(target = 'config.txt') {
      if (!gameSession?.aid || !gameSession?.cid || !gameSession?.nid) { log('warn', 'reload not sent: no verified aid/cid/nid for the current game session'); return false; }
      void target;
      void refreshConfiguration(null, gameSession.id);
      return true;
    },
    debugCommand(command) { return sendCommandText(command); },
    sendCommand,
    sendCommandText,
    onCommandOutput(listener) {
      if (typeof listener !== 'function') return () => {};
      commandOutputSubscribers.add(listener);
      return () => commandOutputSubscribers.delete(listener);
    },
    onStateChange(listener) {
      if (typeof listener !== 'function') return () => {};
      stateSubscribers.add(listener);
      return () => stateSubscribers.delete(listener);
    },
  };
  return api;
}

const dash = value => value === null || value === undefined || value === '' ? '-' : String(value);
const clock = timestamp => { const date = new Date(timestamp); return [date.getHours(), date.getMinutes(), date.getSeconds()].map(part => String(part).padStart(2, '0')).join(':'); };
const rows = entries => entries.map(([label, value]) => `${label.padEnd(14)}${value}`).join('\n');
const point = (x, y) => Number.isFinite(x) && Number.isFinite(y) ? `(${x},${y})` : '-';
const toJson = (value, indent) => {
  try {
    return JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? item.toString()
      : item instanceof Map ? Object.fromEntries(item) : item instanceof Set ? [...item] : item, indent);
  } catch (error) { return `<unserializable: ${String(error?.message ?? error)}>`; }
};

export function formatKoreCommandResult(result) {
  if (!result) return '-';
  const reloadDiagnostics = Array.isArray(result.diagnostics) ? result.diagnostics : [];
  switch (result.kind) {
    case 'aiState': return `ai mode=${dash(result.aiMode)} tasks=${dash(result.taskCount)}`;
    case 'reload': return `reload ${dash(result.target)}: ${result.accepted ? 'ACCEPTED' : 'REJECTED'} effectiveRevision=${dash(result.effectiveRevision)} diagnostics=${reloadDiagnostics.length}`;
    case 'output': return formatKoreOutputResult(result);
    case 'error': return `ERROR ${dash(result.code)}: ${dash(result.message)}`;
    default: return `${dash(result.kind)}: ${toJson(result.report ?? result)}`;
  }
}

function formatKoreOutputResult(result) {
  const blocks = Array.isArray(result?.blocks) ? result.blocks : [];
  const text = blocks.map(block => {
    if (block?.type === 'text') return block.text;
    if (block?.type === 'table') return [block.columns?.join(' | '), ...(block.rows ?? []).map(row => row.join(' | '))].filter(Boolean).join(' / ');
    if (block?.type === 'kv') return (block.pairs ?? []).map(([key, value]) => `${key}=${value}`).join(' ');
    if (block?.type === 'map') return `map ${block.mapName} ${block.width}x${block.height}`;
    return '';
  }).filter(Boolean).join(' | ');
  return text || `${result?.ok ? 'OK' : 'ERROR'} ${dash(result?.command)}`;
}

// 目标的 class id 和名称表里的名字：`monsters` 过滤就是拿它们匹配的，对不上时先看这里。
const targetClass = diagnostic => diagnostic.targetClassId == null ? '' : ` class=${diagnostic.targetClassId}${diagnostic.targetName ? ` "${diagnostic.targetName}"` : ' (no name)'}`;

export function formatKoreDiagnosticLine(diagnostic) {
  if (!diagnostic) return '-';
  const target = diagnostic.targetGid == null ? '-' : `${diagnostic.targetGid}@${point(diagnostic.targetX, diagnostic.targetY)}${targetClass(diagnostic)}`;
  return `${dash(diagnostic.code)} task=${dash(diagnostic.task)} next=${dash(diagnostic.nextAction)} decided=${dash(diagnostic.decisionAction)} target=${target} why=${dash(diagnostic.reason ?? diagnostic.message)}`;
}

function formatHost(state) {
  const beat = state.heartbeat;
  const runtime = state.runtimeStatus;
  return [
    rows([
      ['status', `${state.status}${state.degradedReason ? `   DEGRADED: ${state.degradedReason}` : ''}`],
      ['package', `${dash(state.packageId?.slice(0, 12))} mode=${dash(state.mode)} runtimeGen=${state.runtimeGeneration} profile=${state.profile}`],
      ['gameSession', dash(state.gameSessionId)],
      ['connection', `generation=${dash(state.connectionGeneration)}`],
      ['identity', state.configIdentity ? `aid=${state.configIdentity.aid} cid=${state.configIdentity.cid}` : '- (reload needs aid+cid)'],
      ['stream', `${state.streamStatus} worldReady=${state.worldReady}`],
      ['mapResource', state.mapResourceState],
      ['bytes', `received=${state.receivedBytes} sent=${state.sentBytes}`],
      ['heartbeat', beat ? `${clock(beat.at)} nextDeadlineMs=${dash(beat.nextDeadlineMs)} queues=${toJson(beat.queueDepth)}` : 'none yet'],
    ]),
    '--- Rust runtime status ---',
    runtime ? rows([
      ['runtime', `state=${dash(runtime.runtimeState)} revision=${dash(runtime.revision)} stream=${dash(runtime.streamStatus)}`],
      ['ai', `mode=${dash(runtime.aiMode)} ${runtime.aiModeSynced === false ? 'NOT SYNCED' : 'synced'}`],
      ['nextDeadline', dash(runtime.nextDeadlineMs)],
    ]) : 'no Status output yet',
  ].join('\n');
}

function formatWorld() {
  return 'Rust retains WorldState; the bridge exposes status and diagnostics only.';
}

function formatDecision(state) {
  const diagnostic = state.lastDiagnostic;
  const history = state.diagnosticLog.map(entry => `${clock(entry.timestamp)} ${entry.text}`).join('\n');
  return [
    diagnostic ? rows([
      ['code', `${dash(diagnostic.code)} bridgeSequence=${dash(diagnostic.bridgeSequence)}`],
      ['message', dash(diagnostic.message)],
      ['task', `${dash(diagnostic.task)} intentGeneration=${dash(diagnostic.taskIntentGeneration)}`],
      ['next/decided', `${dash(diagnostic.nextAction)} / ${dash(diagnostic.decisionAction)}`],
      ['reason', dash(diagnostic.reason)],
      ['target', diagnostic.targetGid == null ? '-' : `gid=${diagnostic.targetGid} at ${point(diagnostic.targetX, diagnostic.targetY)}${targetClass(diagnostic)}`],
      ['monsters', `visible=${dash(diagnostic.visibleMonsters)} eligible=${dash(diagnostic.eligibleMonsters)}`],
      ['trace', dash(diagnostic.decisionTrace)],
    ]) : 'no diagnostic yet',
    '--- history (only changes) ---',
    history || '-',
  ].join('\n');
}

function formatCommand(state) {
  const result = state.lastCommandResult;
  if (!result) return 'no command result yet';
  const lines = [formatKoreCommandResult(result)];
  if (Array.isArray(result.diagnostics)) {
    for (const item of result.diagnostics) lines.push(`  [${dash(item.severity)}] ${dash(item.fileName)}:${dash(item.line)} ${dash(item.key)} ${dash(item.code)}: ${dash(item.message)}`);
  }
  if (result.report) lines.push(toJson(result.report, 2));
  return lines.join('\n');
}

function formatActions(state) {
  return state.actions.map(entry => `${clock(entry.timestamp)} #${entry.requestId}${entry.routeId == null ? '' : ` route=${entry.routeId}`} ${entry.type} ${entry.detail} -> ${entry.accepted ? 'ACCEPTED' : `REJECTED(${dash(entry.reason)})`}`).join('\n');
}

export function formatKoreSections(state) {
  const runtime = state.runtimeStatus;
  return {
    headline: `[${state.status}] stream=${state.streamStatus} worldReady=${state.worldReady} ai=${dash(runtime?.aiMode)}${runtime?.aiModeSynced === false ? '(unsynced)' : ''}${state.degradedReason ? ` DEGRADED: ${state.degradedReason}` : ''}`,
    host: formatHost(state),
    world: formatWorld(),
    decision: formatDecision(state),
    command: formatCommand(state),
    actions: formatActions(state),
    console: state.logs.map(entry => `${clock(entry.timestamp)} [${entry.level}] ${entry.text}`).join('\n'),
  };
}

const QUICK_COMMANDS = ['ai auto', 'ai manual', 'ai off', 'ai clear', 'exp', 'exp report'];
const RELOAD_FALLBACK = 'config.txt';

export function createKorePanel({ page, host }) {
  const panel = page.document.createElement('details');
  panel.id = 'kore-engine-panel'; panel.open = true;
  const setCursor = (element, value) => {
    if (typeof element.style.setProperty === 'function') element.style.setProperty('cursor', value, 'important');
    else element.style.cursor = value;
  };
  Object.assign(panel.style, {
    position: 'fixed', top: '12px', right: '12px', zIndex: '1006', boxSizing: 'border-box',
    width: 'min(640px, calc(100vw - 24px))', maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)',
    overflow: 'auto', padding: '8px', border: '1px solid #687586', borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.97)', color: '#1f2933', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
    font: '12px/1.4 system-ui, sans-serif',
  });
  setCursor(panel, 'default');
  const element = (tag, parent, props = {}) => {
    const node = page.document.createElement(tag);
    Object.assign(node, props);
    parent.append(node);
    return node;
  };
  const summary = element('summary', panel, { textContent: 'KoreEngine debug' });
  setCursor(summary, 'pointer');
  const headline = element('div', panel); headline.style.font = '12px/1.4 monospace'; headline.style.fontWeight = 'bold';
  const note = element('div', panel); note.style.font = '12px/1.4 monospace'; note.style.color = '#8a4b00';
  let lastState = null;
  const button = (parent, label, onClick) => {
    const node = element('button', parent, { type: 'button', textContent: label });
    node.addEventListener('click', onClick); setCursor(node, 'pointer'); return node;
  };
  const run = text => {
    const command = String(text ?? '').trim();
    const reload = /^reload(?:\s+(\S+))?$/i.exec(command);
    // reload 需要 Host 附带 IndexedDB 配置文档和身份，不能只发裸文本。
    const sent = reload && host.reloadConfig ? host.reloadConfig(reload[1] ?? RELOAD_FALLBACK) : host.debugCommand?.(command);
    note.textContent = sent ? `sent: ${command}` : `NOT sent: ${command || '(empty)'} - see console`;
  };

  const tabs = element('div', panel);
  const statusPane = element('div', panel);
  const editorPane = element('div', panel);
  const showTab = name => {
    statusPane.style.display = name === 'status' ? 'block' : 'none';
    editorPane.style.display = name === 'editor' ? 'block' : 'none';
    if (name === 'editor' && !loaded) void loadFile();
  };
  const statusTab = button(tabs, 'Status', () => showTab('status'));
  const editorTab = button(tabs, 'Editor', () => showTab('editor'));

  // ---- Status tab
  for (const command of QUICK_COMMANDS) button(statusPane, command, () => run(command));
  button(statusPane, 'map retry', () => { note.textContent = host.debugMapRetry?.() ? 'map retry requested' : 'map retry NOT sent: no game session or map connection'; });
  const clearButton = button(statusPane, 'Clear console', () => host.clearConsole());
  button(statusPane, 'Copy snapshot', () => {
    const text = toJson(lastState, 2);
    void copyText(page, text).then(copied => { note.textContent = copied ? `snapshot copied (${text.length} chars)` : 'copy failed'; });
  });
  const commandInput = element('input', statusPane, { type: 'text' }); commandInput.setAttribute('aria-label', 'KoreEngine command');
  commandInput.setAttribute('placeholder', 'ai auto | ai manual | ai off | reload all | exp'); commandInput.style.width = 'min(320px, 100%)';
  commandInput.addEventListener('keydown', event => { if (event.key === 'Enter') run(commandInput.value); });
  const commandButton = button(statusPane, 'Send command', () => run(commandInput.value)); setCursor(commandInput, 'text');
  const section = (parent, title, label, rowCount) => {
    const heading = element('div', parent, { textContent: title }); heading.style.fontWeight = 'bold'; heading.style.marginTop = '6px';
    const node = element('textarea', parent, { readOnly: true, rows: rowCount }); node.setAttribute('aria-label', label); node.setAttribute('wrap', 'off');
    Object.assign(node.style, { display: 'block', width: '100%', boxSizing: 'border-box', font: '11px/1.35 monospace' });
    setCursor(node, 'text'); return node;
  };
  const infoNode = section(statusPane, 'Host / Rust runtime', 'KoreEngine status', 15);
  const worldNode = section(statusPane, 'Rust-owned world status', 'KoreEngine world status', 4);
  const decisionNode = section(statusPane, 'AI decision (last Rust diagnostic + history)', 'KoreEngine decision', 12);
  const commandResultNode = section(statusPane, 'Last command result', 'KoreEngine command result', 4);
  const actionsNode = section(statusPane, 'Native actions (newest last)', 'KoreEngine actions', 8);
  const consoleNode = section(statusPane, 'Console', 'KoreEngine console', 10);

  // ---- Editor tab：编辑保存在 IndexedDB 里的 control 文件，并通过 Host 的 reload 路径交给 Rust。
  const identity = () => lastState?.configIdentity ? { profile: lastState.profile, ...lastState.configIdentity } : null;
  const editorNote = element('div', editorPane); editorNote.style.font = '12px/1.4 monospace'; editorNote.style.color = '#8a4b00';
  const fileSelect = element('select', editorPane); fileSelect.setAttribute('aria-label', 'KoreEngine control file');
  for (const fileName of M4_CONFIG_FILES) element('option', fileSelect, { value: fileName, textContent: fileName });
  fileSelect.value = [...M4_CONFIG_FILES][0];
  setCursor(fileSelect, 'pointer');
  const editor = element('textarea', editorPane, { rows: 22 }); editor.setAttribute('aria-label', 'KoreEngine control file editor'); editor.setAttribute('wrap', 'off');
  editor.setAttribute('spellcheck', 'false');
  Object.assign(editor.style, { display: 'block', width: '100%', boxSizing: 'border-box', font: '11px/1.35 monospace', marginTop: '4px' });
  setCursor(editor, 'text');
  let loaded = null;
  const dirty = () => loaded !== null && editor.value !== loaded.text;
  const say = text => { editorNote.textContent = text; };
  const describe = document => `${document.fileName} revision=${document.revision} lines=${document.rawText.split('\n').length}`;
  async function loadFile() {
    const owner = identity();
    if (!owner) { say('No verified aid/cid yet: enter the game first, then click Load.'); return; }
    const fileName = fileSelect.value;
    try {
      const document = (await host.getConfigDocuments(owner)).find(item => item.fileName === fileName);
      if (!document) { say(`${fileName} is not in storage`); return; }
      editor.value = document.rawText; loaded = { fileName, text: document.rawText, revision: document.revision };
      say(`Loaded ${describe(document)}`);
    } catch (error) { say(`Load failed: ${String(error?.message ?? error)}`); }
  }
  async function saveFile() {
    const owner = identity();
    if (!owner) { say('No verified aid/cid yet: cannot save.'); return null; }
    try {
      const saved = await host.saveConfigDocument({ ...owner, fileName: fileSelect.value, rawText: editor.value });
      loaded = { fileName: saved.fileName, text: saved.rawText, revision: saved.revision };
      say(`Saved ${describe(saved)}. Reload it to apply.`);
      return saved;
    } catch (error) { say(`Save failed: ${String(error?.message ?? error)}`); return null; }
  }
  fileSelect.addEventListener('change', () => {
    if (dirty()) { fileSelect.value = loaded.fileName; say(`${loaded.fileName} has unsaved changes: Save or Load it before switching.`); return; }
    void loadFile();
  });
  const editorButtons = element('div', editorPane);
  button(editorButtons, 'Load', () => void loadFile());
  button(editorButtons, 'Save', () => void saveFile());
  button(editorButtons, 'Reset to default', () => {
    const text = host.getConfigDefault?.(fileSelect.value);
    if (typeof text !== 'string') { say(`No packaged default for ${fileSelect.value}`); return; }
    editor.value = text; say(`Packaged default of ${fileSelect.value} placed in the editor (not saved).`);
  });
  const reloadButtons = element('div', editorPane);
  reloadButtons.style.marginTop = '4px';
  button(reloadButtons, 'Save + ai off + reload this file', async () => {
    if (!await saveFile()) return;
    // Rust 只在 AI off 时接受 reload；reload 成功后它会按配置重新自动启动。
    run('ai off'); run(`reload ${fileSelect.value}`);
  });
  button(reloadButtons, 'reload this file', () => run(`reload ${fileSelect.value}`));
  button(reloadButtons, 'reload config', () => run('reload config'));
  button(reloadButtons, 'reload all', () => run('reload all'));
  const reloadResultNode = section(editorPane, 'Last command result (reload needs ai off; unchanged revisions are rejected as stale)', 'KoreEngine reload result', 6);
  showTab('status');

  const setText = (node, text) => {
    if (node.value === text) return;
    const follow = node.scrollHeight === undefined || node.scrollTop + node.clientHeight >= node.scrollHeight - 4;
    node.value = text;
    if (follow && node.scrollHeight !== undefined) node.scrollTop = node.scrollHeight;
  };
  return { panel, infoNode, worldNode, decisionNode, commandResultNode, actionsNode, consoleNode, clearButton, commandInput, commandButton,
    editor, fileSelect, editorNote, reloadResultNode, editorTab, statusTab, update(current) {
      lastState = current;
      const sections = formatKoreSections(current);
      headline.textContent = sections.headline;
      setText(infoNode, sections.host); setText(worldNode, sections.world); setText(decisionNode, sections.decision);
      setText(commandResultNode, sections.command); setText(reloadResultNode, sections.command); setText(actionsNode, sections.actions); setText(consoleNode, sections.console);
    } };
}

export function startOptionalKore(options) {
  try {
    const page = globalThis;
    const host = createKoreIntegration({ ...options, page, manifest: page.LastROExecutableManifest });
    // The M7 shell mounts the panel inside LastROTools; the old debug details
    // panel is kept only through the exported createKorePanel() for tooling.
    page.KoreEngine = host; void host.start(); return host;
  } catch (error) { globalThis.console?.error('[KoreEngine] optional host failed', error); return null; }
}
