// Public, optional M0 host. No game data, sockets or game operations cross this boundary.
const idPattern = /^[a-f0-9]{64}$/;
const metadataFields = ['schemaVersion', 'engineVersion', 'bridgeApiVersion', 'packetver', 'profile', 'commitSha', 'sourceDirty', 'mode', 'toolVersions', 'files'];
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
    || manifest.profile !== 'lastro-2x' || !/^\d+\.\d+\.\d+$/.test(manifest.engineVersion)
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
  const state = { status: 'absent', packageId: null, mode: null, tickCount: 0, elapsedMs: 0, worldReady: false, aiState: 'off', logs: [] };
  let generation = 0, worker = null, session = null, nextId = 0, initId = 0, probe = null, discardedThrough = 0;
  let timer = null, controller = null, lastNow = 0, initAge = 0, removeListeners = () => {};
  const clock = () => (page.performance ?? globalThis.performance).now();
  const timers = page.setInterval ? page : globalThis;
  const changed = () => { try { onChange(state); } catch { /* UI must not affect the client. */ } };
  function log(level, text) {
    state.logs.push({ level, text: String(text).slice(0, 4096) });
    if (state.logs.length > 1000) state.logs.splice(0, state.logs.length - 1000);
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
  function receive(event) {
    const message = event.data;
    if (!message || typeof message.runtimeSessionId !== 'string' || !message.runtimeSessionId) { fail(Error('invalid-worker-response')); return; }
    if (message?.runtimeSessionId !== session) return;
    if (!Number.isSafeInteger(message.requestId) || message.requestId <= 0 || message.requestId > nextId) { fail(Error('invalid-worker-response')); return; }
    if (message.requestId <= discardedThrough) return;
    if (message.type === 'fault') { fail(Error(String(message.message ?? 'Worker fault'))); return; }
    if (message.type === 'log') {
      if (!['info', 'warn', 'error', 'debug'].includes(message.level) || typeof message.text !== 'string') fail(Error('invalid-worker-log'));
      else log(message.level, message.text);
      return;
    }
    if (message.type === 'ready' && state.status === 'loading' && message.requestId === initId) {
      const info = message.buildInfo;
      if (message.packageId !== state.packageId || message.worldReady !== false || message.aiState !== 'off'
        || info?.engineVersion !== packageInfo.manifest.engineVersion || info.bridgeApiVersion !== 1
        || info.packetver !== 20211103 || info.target !== 'wasm32-unknown-unknown') { fail(Error('invalid-worker-ready')); return; }
      state.status = 'runtime-ready'; changed(); return;
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
      const current = ++generation;
      Object.assign(state, { status: 'absent', packageId: null, mode: null, tickCount: 0, elapsedMs: 0 });
      if (!manifest?.files?.some(file => file.path === 'ke/active.json')) { changed(); return; }
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
        packageInfo = await loadKorePackage({ page, manifest, signal: controller.signal });
        if (current !== generation) return;
        state.packageId = packageInfo.manifest.packageId; state.mode = packageInfo.manifest.mode;
        session = (page.crypto ?? globalThis.crypto).randomUUID();
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
      generation++;
      state.status = 'disposed'; changed();
      // Revoke the host synchronously; no ACK is needed to stop this runtime.
      release({ type: 'dispose', runtimeSessionId: session, requestId: ++nextId });
    },
    debugProbe(type) {
      if (state.mode !== 'debug' || state.status !== 'runtime-ready' || !['debugTrap', 'debugCrash'].includes(type)) return false;
      return post(type) !== null;
    },
  };
  return api;
}

export function startOptionalKore(options) {
  try {
    const page = globalThis;
    let panel = null, refresh = null;
    const host = createKoreIntegration({ ...options, page, manifest: page.LastROExecutableManifest,
      onChange(state) {
        if (state.status === 'absent' || refresh !== null || !page.document?.body) return;
        refresh = page.setTimeout(() => {
          refresh = null;
          if (!panel) {
            panel = page.document.createElement('details');
            Object.assign(panel.style, { position: 'fixed', right: '8px', bottom: '8px', zIndex: '10000', background: '#20242c', color: '#eee', padding: '8px', maxWidth: '420px', maxHeight: '240px', overflow: 'auto' });
            const title = page.document.createElement('summary'); title.textContent = 'KoreEngine M0'; panel.append(title);
            panel.append(page.document.createElement('pre')); page.document.body.append(panel);
          }
          panel.lastChild.textContent = `${state.status} | ticks: ${state.tickCount}\nworldReady: false | AI: off\n` + state.logs.map(entry => `[${entry.level}] ${entry.text}`).join('\n');
        }, 100);
      },
    });
    page.KoreEngine = host;
    void host.start();
    return host;
  } catch (error) { globalThis.console?.error('[KoreEngine] optional host failed', error); return null; }
}
