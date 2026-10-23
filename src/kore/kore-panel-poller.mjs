// Shared polling scheduler for the KE small window and fullscreen panel.
// Regions only declare which raw command to send; Rust owns command semantics.

export const KORE_POLL_REGIONS = Object.freeze({
  status: { command: 's', intervalMs: 3000, views: ['small', 'fullscreen'] },
  ai: { command: 'ai print', intervalMs: 2000, views: ['small', 'fullscreen'] },
  where: { command: 'where', intervalMs: 2000, views: ['small', 'fullscreen'] },
  monsters: { command: 'ml', intervalMs: 2000, views: ['fullscreen'] },
  players: { command: 'pl', intervalMs: 2000, views: ['fullscreen'] },
  npcs: { command: 'nl', intervalMs: 2000, views: ['fullscreen'] },
  items: { command: 'il', intervalMs: 2000, views: ['fullscreen'] },
  map: { command: 'map', intervalMs: 0, views: ['fullscreen'] },
  inventory: { command: 'i', intervalMs: 5000, views: ['fullscreen'], tab: 'inventory' },
  cart: { command: 'cart', intervalMs: 5000, views: ['fullscreen'], tab: 'cart' },
  exp: { command: 'exp report', intervalMs: 5000, views: ['fullscreen'], tab: 'exp' },
});

const normalize = value => String(value ?? '').trim().toLowerCase();

export function createKorePoller({
  host, page = globalThis, regions = KORE_POLL_REGIONS,
  setInterval: setTimer = page.setInterval?.bind(page),
  clearInterval: clearTimer = page.clearInterval?.bind(page),
  now = () => Date.now(),
} = {}) {
  let view = 'hidden';
  let tab = null;
  let timer = null;
  let disposed = false;
  const inFlight = new Map();
  const nextDue = new Map(Object.keys(regions).map(name => [name, 0]));
  const results = new Map();
  const errors = new Map();
  const listeners = new Set();

  const ready = () => {
    const state = host?.state;
    return Boolean(host && state?.worldReady === true && state.status === 'runtime-ready');
  };
  const visible = name => {
    const region = regions[name];
    if (!region || !region.views.includes(view)) return false;
    if (region.tab && region.tab !== tab) return false;
    return true;
  };
  const notify = name => {
    for (const listener of listeners) {
      try { listener(name, results.get(name) ?? null, errors.get(name) ?? null); } catch { /* UI must not affect polling. */ }
    }
  };
  const settle = (command, result) => {
    const name = inFlight.get(command);
    if (!name) return false;
    inFlight.delete(command);
    if (result?.kind === 'output' && result.ok === true) {
      results.set(name, result);
      errors.delete(name);
    } else {
      errors.set(name, result);
    }
    nextDue.set(name, now() + (regions[name]?.intervalMs ?? 0));
    notify(name);
    return true;
  };
  const unsubscribeOutput = host?.onCommandOutput?.(({ command, result, silent }) => {
    if (silent === true) settle(normalize(command), result);
  }) ?? (() => {});
  // Every output marks the host state as changed; refresh only on the
  // not-ready -> ready transition instead of resetting every interval.
  let wasReady = ready();
  const unsubscribeState = host?.onStateChange?.(() => {
    const nextReady = ready();
    if (nextReady && !wasReady) refresh();
    wasReady = nextReady;
  }) ?? (() => {});

  function send(name) {
    if (disposed || !ready() || !visible(name)) return false;
    const command = normalize(regions[name].command);
    if (inFlight.has(command)) return false;
    inFlight.set(command, name);
    nextDue.set(name, now() + Math.max(regions[name].intervalMs, 1000));
    let sent = false;
    try { sent = host.sendCommandText(regions[name].command, { silent: true }) === true; } catch { sent = false; }
    if (!sent) { inFlight.delete(command); nextDue.set(name, now() + 1000); }
    return sent;
  }

  function tick() {
    if (disposed || view === 'hidden' || !ready()) return;
    if (page.document?.hidden === true) return;
    const current = now();
    for (const name of Object.keys(regions)) {
      if ((regions[name].intervalMs ?? 0) <= 0) continue;
      if (!visible(name) || current < (nextDue.get(name) ?? 0)) continue;
      send(name);
    }
  }

  function refresh() {
    if (view === 'hidden' || !ready()) return;
    for (const name of Object.keys(regions)) if (visible(name)) nextDue.set(name, 0);
    tick();
  }

  return {
    results: name => results.get(name) ?? null,
    errors: name => errors.get(name) ?? null,
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setView(next) {
      if (view === next) return;
      view = next;
      if (view === 'hidden') { inFlight.clear(); return; }
      refresh();
    },
    setTab(next) {
      if (tab === next) return;
      tab = next;
      refresh();
    },
    request(name) { return send(name); },
    start() {
      if (disposed || timer !== null) return;
      timer = setTimer(tick, 250);
      refresh();
    },
    stop() {
      if (timer !== null) { clearTimer?.(timer); timer = null; }
      inFlight.clear();
    },
    dispose() {
      disposed = true;
      this.stop();
      unsubscribeOutput();
      unsubscribeState();
      listeners.clear();
    },
  };
}
