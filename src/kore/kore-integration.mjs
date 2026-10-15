// Public, optional host. Only the passive inbound map stream crosses this boundary.
export const KORE_PROTOCOL_PROFILE = 'lastro-20211103';
const compatibleProfiles = new Set([KORE_PROTOCOL_PROFILE, 'lastro-2x']);
const idPattern = /^[a-f0-9]{64}$/;
const metadataFields = ['schemaVersion', 'engineVersion', 'bridgeApiVersion', 'packetver', 'profile', 'commitSha', 'sourceDirty', 'mode', 'toolVersions', 'files'];
const MAX_PENDING_GAME_CHUNKS = 256;
const MAX_PENDING_GAME_BYTES = 1024 * 1024;
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
  if (!manifest || manifest.schemaVersion !== 1 || manifest.bridgeApiVersion !== 1 || manifest.packetver !== 20211103
    || !compatibleProfiles.has(manifest.profile) || !/^\d+\.\d+\.\d+$/.test(manifest.engineVersion)
    || !['debug', 'release'].includes(manifest.mode) || typeof manifest.sourceDirty !== 'boolean'
    || !(manifest.commitSha === null || /^[a-f0-9]{40}$/.test(manifest.commitSha))
    || manifest.toolVersions?.rust !== '1.99.0' || manifest.toolVersions?.wasmBindgen !== '0.2.129'
    || manifest.toolVersions?.binaryen !== (manifest.mode === 'release' ? '133' : null)
    || !Array.isArray(manifest.files) || !idPattern.test(manifest.packageId)) throw Error('incompatible-package');
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
  for (const file of packageManifest.files) await read(prefix + file.path, file);
  return { manifest: packageManifest, workerUrl: new globalThis.URL('/core/' + prefix + 'kore-worker.mjs', page.location.href).href };
}

export function createKoreIntegration({ page = globalThis, manifest, createWorker = url => new page.Worker(url, { type: 'module' }), onWorkerReleased = () => {}, onChange = () => {} }) {
  const state = {
    status: 'absent', packageId: null, mode: null, tickCount: 0, elapsedMs: 0,
    profile: KORE_PROTOCOL_PROFILE, gameSessionId: null, connectionGeneration: null,
    streamStatus: 'idle', mapName: null, selfActor: null,
    visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
    parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
    receivedBytes: 0, degradedReason: null, worldReady: false, aiState: 'off', logs: [],
  };
  let generation = 0, worker = null, session = null, nextId = 0, initId = 0, probe = null, discardedThrough = 0;
  let timer = null, controller = null, lastNow = 0, initAge = 0, removeListeners = () => {};
  let gameSession = null, connection = null, postedGameSessionId = null, postedConnectionGeneration = null;
  let pendingGameEvents = [], pendingGameBytes = 0, workerDegraded = false, needsMapResync = false;
  let mapStreamCapability = null;
  const clock = () => (page.performance ?? globalThis.performance).now();
  const timers = page.setInterval ? page : globalThis;
  const changed = () => { try { onChange(state); } catch { /* UI must not affect the client. */ } };
  function log(level, text) {
    state.logs.push({ level, text: String(text).slice(0, 1024), timestamp: Date.now() });
    if (state.logs.length > 200) state.logs.splice(0, state.logs.length - 200);
    changed();
  }
  function release(disposeMessage = null) {
    controller?.abort(); controller = null;
    if (timer !== null) timers.clearInterval(timer);
    timer = null;
    removeListeners(); removeListeners = () => {};
    const oldWorker = worker; worker = null; probe = null;
    try { onWorkerReleased(); } catch { /* Cleanup is best effort. */ }
    try { if (disposeMessage) oldWorker?.postMessage(disposeMessage); } catch { /* Already gone. */ }
    try { oldWorker?.terminate(); } catch { /* Already gone. */ }
  }
  function fail(error) {
    generation++;
    release();
    state.status = 'failed';
    log('error', error instanceof Error ? error.message : String(error));
  }
  function post(type, fields = {}) {
    const requestId = ++nextId;
    try { worker.postMessage({ type, runtimeSessionId: session, requestId, ...fields }); }
    catch (error) { fail(error); return null; }
    return requestId;
  }
  function postGameData(message) {
    try { worker.postMessage(message, [message.bytes.buffer]); }
    catch (error) { fail(error); return false; }
    return true;
  }
  function clearPendingGameEvents() {
    pendingGameEvents = [];
    pendingGameBytes = 0;
  }
  function sendCurrentGameContext() {
    if (state.status !== 'runtime-ready' || !gameSession || mapStreamCapability === false) return false;
    if (postedGameSessionId !== gameSession.id) {
      const id = post('beginGameSession', {
        gameSessionId: gameSession.id, characterGid: gameSession.characterGid, mapName: gameSession.mapName,
      });
      if (id === null) return false;
      postedGameSessionId = gameSession.id;
      postedConnectionGeneration = null;
    }
    if (connection && postedConnectionGeneration !== connection.generation) {
      const id = post('beginMapConnection', {
        gameSessionId: gameSession.id, connectionGeneration: connection.generation,
      });
      if (id === null) return false;
      postedConnectionGeneration = connection.generation;
    }
    return true;
  }
  function sendDegradedState() {
    if (workerDegraded || state.status !== 'runtime-ready' || !connection || !gameSession) return;
    if (!sendCurrentGameContext()) return;
    const id = post('degradeConnection', {
      gameSessionId: gameSession.id, connectionGeneration: connection.generation,
      reason: state.degradedReason ?? 'stream-unavailable',
    });
    if (id !== null) workerDegraded = true;
  }
  function markDegraded(reason) {
    if (!connection || state.streamStatus === 'degraded') return;
    clearPendingGameEvents();
    state.streamStatus = 'degraded';
    state.worldReady = false;
    state.degradedReason = String(reason).slice(0, 512);
    log('error', `Map stream degraded: ${state.degradedReason}`);
    sendDegradedState();
  }
  function rejectMapStreamCapability() {
    const reason = 'package-missing-m1-map-stream';
    if (state.streamStatus === 'degraded' && state.degradedReason === reason) return;
    needsMapResync ||= gameSession !== null;
    gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
    clearPendingGameEvents(); workerDegraded = false;
    Object.assign(state, {
      gameSessionId: null, connectionGeneration: null, streamStatus: 'degraded', mapName: null,
      selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
      parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
      receivedBytes: 0, degradedReason: reason, worldReady: false,
    });
    log('warn', 'This KE package does not support M1 map streaming; rebuild the local KE package.');
  }
  function flushPendingGameEvents() {
    if (state.status !== 'runtime-ready' || !gameSession) return;
    if (mapStreamCapability === false) {
      rejectMapStreamCapability();
      return;
    }
    if (!sendCurrentGameContext()) return;
    if (state.streamStatus === 'degraded') { sendDegradedState(); return; }
    if (!pendingGameEvents.length) return;
    const events = pendingGameEvents;
    clearPendingGameEvents();
    for (const event of events) {
      if (event.gameSessionId !== gameSession?.id || event.connectionGeneration !== connection?.generation) continue;
      if (!postGameData(event)) return;
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
    state.streamStatus = message.streamStatus;
    state.profile = message.profile;
    state.worldReady = message.worldReady;
    state.mapName = message.mapName;
    state.selfActor = message.selfActor;
    state.visibleEntities = { ...message.visibleEntities };
    state.parserDiagnostics = { ...message.parserDiagnostics };
    state.degradedReason = message.degradedReason ?? null;
    if (becameReady) log('info', `World synchronized on ${message.mapName ?? 'unknown map'}.`);
    else if (becameDegraded) log('error', `Map stream degraded: ${state.degradedReason ?? 'unknown reason'}`);
    changed();
  }
  function receive(event) {
    const message = event.data;
    if (!message || typeof message.runtimeSessionId !== 'string' || !message.runtimeSessionId) { fail(Error('invalid-worker-response')); return; }
    if (message?.runtimeSessionId !== session) return;
    if (message.type === 'worldState' && !Object.hasOwn(message, 'requestId')) {
      receiveWorldState(message);
      return;
    }
    if (!Number.isSafeInteger(message.requestId) || message.requestId <= 0 || message.requestId > nextId) { fail(Error('invalid-worker-response')); return; }
    if (message.requestId <= discardedThrough) return;
    if (message.type === 'fault') { fail(Error(String(message.message ?? 'Worker fault'))); return; }
    if (message.type === 'log') {
      if (!['info', 'warn', 'error', 'debug'].includes(message.level) || typeof message.text !== 'string') fail(Error('invalid-worker-log'));
      else log(message.level, message.text);
      return;
    }
    if (['gameSessionStarted', 'gameSessionEnded', 'connectionStarted', 'connectionDegraded'].includes(message.type)) return;
    if (message.type === 'ready' && state.status === 'loading' && message.requestId === initId) {
      const info = message.buildInfo;
      if (message.packageId !== state.packageId || message.worldReady !== false || message.aiState !== 'off'
        || info?.engineVersion !== packageInfo.manifest.engineVersion || info.bridgeApiVersion !== 1
        || info.packetver !== 20211103 || info.target !== 'wasm32-unknown-unknown') { fail(Error('invalid-worker-ready')); return; }
        mapStreamCapability = message.capabilities?.mapStream === true;
        if (packageInfo.manifest.profile === KORE_PROTOCOL_PROFILE && !mapStreamCapability) {
          fail(Error('invalid-worker-ready'));
          return;
        }
      state.status = 'runtime-ready'; changed();
      flushPendingGameEvents();
      return;
    }
    if (message.type === 'tick' && state.status === 'runtime-ready' && message.requestId === probe?.id) {
      if (!Number.isSafeInteger(message.tickCount) || message.tickCount <= state.tickCount || !Number.isFinite(message.elapsedMs) || message.elapsedMs < state.elapsedMs) { fail(Error('invalid-worker-tick')); return; }
      state.tickCount = message.tickCount; state.elapsedMs = message.elapsedMs; probe = null; changed(); return;
    }
    fail(Error('unexpected-worker-response'));
  }
  let packageInfo = null;
  function supervise() {
    const now = clock();
    const delta = Math.min(Math.max(now - lastNow, 0), 1000); lastNow = now;
    if (page.document?.hidden) return;
    if (state.status === 'loading') {
      initAge += delta;
      if (initAge >= 10000) fail(Error('initialization-timeout'));
    } else if (state.status === 'runtime-ready') {
      if (probe) {
        probe.age += delta;
        if (probe.age >= 5000) fail(Error('tick-timeout'));
      } else {
        const id = post('tick', { nowMs: now });
        if (id !== null) probe = { id, age: 0 };
      }
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
      Object.assign(state, {
        status: 'absent', packageId: null, mode: null, tickCount: 0, elapsedMs: 0,
        profile: KORE_PROTOCOL_PROFILE,
        gameSessionId: null, connectionGeneration: null, streamStatus: 'idle', mapName: null,
        selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null, worldReady: false,
      });
      if (!manifest?.files?.some(file => file.path === 'ke/active.json')) { changed(); return; }
      if (lostSession) log('warn', 'KoreEngine restarted; re-enter the map server to synchronize.');
      state.status = 'loading'; changed();
      initAge = 0; lastNow = clock(); nextId = 0; discardedThrough = 0;
      controller = new globalThis.AbortController();
      timer = timers.setInterval(supervise, 1000);
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
        state.packageId = packageInfo.manifest.packageId; state.mode = packageInfo.manifest.mode;
        state.profile = packageInfo.manifest.profile;
        worker = createWorker(packageInfo.workerUrl);
        const localWorker = worker;
        const workerError = event => { event.preventDefault?.(); fail(Error(event.message ?? 'Worker communication failed')); };
        localWorker.addEventListener('message', receive);
        localWorker.addEventListener('error', workerError);
        localWorker.addEventListener('messageerror', workerError);
        const previousCleanup = removeListeners;
        removeListeners = () => {
          previousCleanup();
          localWorker.removeEventListener('message', receive);
          localWorker.removeEventListener('error', workerError);
          localWorker.removeEventListener('messageerror', workerError);
        };
        initId = post('init', { expectedPackageId: state.packageId, bridgeApiVersion: 1, packetver: 20211103, startMs: clock() });
      } catch (error) { if (current === generation) fail(error); }
    },
    dispose() {
      const disposeMessage = session === null ? null : { type: 'dispose', runtimeSessionId: session, requestId: ++nextId };
      needsMapResync ||= gameSession !== null;
      generation++;
      gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      session = null; clearPendingGameEvents(); workerDegraded = false;
      mapStreamCapability = null;
      Object.assign(state, {
        status: 'disposed', gameSessionId: null, connectionGeneration: null,
        streamStatus: 'idle', mapName: null, selfActor: null,
        visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null, worldReady: false,
      });
      changed();
      // Revoke the host synchronously; no ACK is needed to stop this runtime.
      release(disposeMessage);
    },
    debugProbe(type) {
      if (state.mode !== 'debug' || state.status !== 'runtime-ready' || !['debugTrap', 'debugCrash'].includes(type)) return false;
      return post(type) !== null;
    },
    beginGameSession(characterGid, mapName) {
      if (!['loading', 'runtime-ready'].includes(state.status)) return null;
      if (mapStreamCapability === false) {
        rejectMapStreamCapability();
        return null;
      }
      if (!Number.isSafeInteger(characterGid) || characterGid <= 0 || typeof mapName !== 'string' || !mapName.trim()) {
        log('error', 'KoreEngine needs a new map-server entry to establish character context.');
        return null;
      }
      try {
        gameSession = { id: (page.crypto ?? globalThis.crypto).randomUUID(), characterGid, mapName: mapName.slice(0, 128) };
      } catch (error) { log('error', `Unable to create game session: ${String(error)}`); return null; }
      connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      clearPendingGameEvents(); workerDegraded = false;
      Object.assign(state, {
        gameSessionId: gameSession.id, connectionGeneration: null, streamStatus: 'awaiting-connection',
        mapName: gameSession.mapName, selfActor: null,
        visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null, worldReady: false,
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
      connection = { generation: nextGeneration, sequence: 0, byteOffset: 0 };
      postedConnectionGeneration = null; workerDegraded = false;
      clearPendingGameEvents();
      Object.assign(state, {
        connectionGeneration: nextGeneration, streamStatus: 'awaiting-sync', worldReady: false,
        selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null,
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
        if (state.status !== 'runtime-ready'
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
        if (!sendCurrentGameContext()) return false;
        return postGameData(message);
      }
      pendingGameEvents.push(message);
      pendingGameBytes += bytes.byteLength;
      changed();
      return true;
    },
    endGameSession() {
      if (!gameSession) return;
      const ended = gameSession.id;
      if (state.status === 'runtime-ready' && postedGameSessionId === ended) post('endGameSession', { gameSessionId: ended });
      gameSession = null; connection = null; postedGameSessionId = null; postedConnectionGeneration = null;
      clearPendingGameEvents(); workerDegraded = false; needsMapResync = false;
      Object.assign(state, {
        gameSessionId: null, connectionGeneration: null, streamStatus: 'idle', mapName: null,
        selfActor: null, visibleEntities: { total: 0, players: 0, monsters: 0, other: 0, unknown: 0 },
        parserDiagnostics: { bufferedBytes: 0, pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
        receivedBytes: 0, degradedReason: null, worldReady: false,
      });
      changed();
    },
    clearConsole() { state.logs.length = 0; changed(); },
  };
  return api;
}

export function createKorePanel({ page, host }) {
  const panel = page.document.createElement('details');
  Object.assign(panel.style, {
    position: 'fixed', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: '10000',
    background: '#20242c', color: '#eee', padding: '8px', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', width: '840px', height: '840px',
    maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100vh - 16px)', overflow: 'hidden',
  });
  panel.open = true;
  panel.addEventListener('toggle', () => { panel.style.height = panel.open ? '840px' : 'auto'; });
  const title = page.document.createElement('summary'); title.textContent = 'KoreEngine M1'; panel.append(title);
  const controls = page.document.createElement('div');
  controls.style.flex = '0 0 auto';
  const clearButton = page.document.createElement('button'); clearButton.type = 'button'; clearButton.textContent = 'Clear console';
  clearButton.addEventListener('click', () => host.clearConsole()); controls.append(clearButton);
  const createTextArea = (label, rows) => {
    const node = page.document.createElement('textarea');
    node.readOnly = true; node.rows = rows; node.wrap = 'off'; node.setAttribute('aria-label', label);
    Object.assign(node.style, { display: 'block', width: '100%', boxSizing: 'border-box', marginTop: '6px', resize: 'vertical', font: '12px/1.35 monospace', whiteSpace: 'pre', overflow: 'auto' });
    return node;
  };
  const infoNode = createTextArea('KoreEngine status', 7);
  const consoleNode = createTextArea('KoreEngine console', 10);
  Object.assign(consoleNode.style, { flex: '1 1 auto', minHeight: '0', resize: 'none' });
  controls.append(infoNode); panel.append(controls, consoleNode);
  return {
    panel, infoNode, consoleNode, clearButton,
    update(state) {
      const actor = state.selfActor ? `GID ${state.selfActor.gid} @ ${state.selfActor.x}, ${state.selfActor.y}` : 'waiting';
      const counts = state.visibleEntities;
      infoNode.value = [
        `KE ${state.status} / ${state.streamStatus}`,
        `profile ${state.profile} | connection ${state.connectionGeneration ?? '-'}`,
        `map ${state.mapName ?? '-'} | character ${actor}`,
        `entities ${counts.total} (players ${counts.players}, monsters ${counts.monsters}, other ${counts.other}, unknown ${counts.unknown})`,
        `received ${state.receivedBytes} bytes | worldReady ${state.worldReady} | AI off`,
        `parser buffer ${state.parserDiagnostics.bufferedBytes} bytes | pending ${state.parserDiagnostics.pendingPacketId === null ? '-' : `0x${state.parserDiagnostics.pendingPacketId.toString(16).padStart(4, '0')}`} ${state.parserDiagnostics.pendingRequiredBytes === null ? '' : `${state.parserDiagnostics.bufferedBytes}/${state.parserDiagnostics.pendingRequiredBytes}`} | last ${state.parserDiagnostics.lastPacketId === null ? '-' : `0x${state.parserDiagnostics.lastPacketId.toString(16).padStart(4, '0')}`}`,
        state.degradedReason ? `reason ${state.degradedReason}` : '',
      ].filter(Boolean).join('\n');
      consoleNode.value = state.logs.map(entry => `[${new Date(entry.timestamp).toLocaleTimeString()}] [${entry.level}] ${entry.text}`).join('\n');
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
