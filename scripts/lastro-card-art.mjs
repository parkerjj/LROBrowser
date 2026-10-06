/** Attach native card details and artwork loading to the packaged card panel. */
export function installLastroCardArt(component, deps) {
  if (!component || component._lastroCardArtInstalled || typeof component.createCardNode !== 'function') return false;
  const { DB, Client, UIManager, getItemInfo } = deps;
  const doc = deps.document || globalThis.document;
  const cache = new Map();
  const pending = new Map();
  const queued = new Map();
  let targets = new WeakMap();
  const overlays = new Map();
  const cacheLimit = 256;
  const pendingLimit = 64;
  const pendingLifetime = 30000;
  let rendering = 0, pumping = false;
  const nativeCreate = component.createCardNode;
  const nativeRender = component.renderCards;
  const nativeRemove = component.onRemove;
  const nativeFocus = component.focus;

  function applyArtwork(element, token, url) {
    // A card is built before insertion. Cached callbacks are synchronous, so
    // connectivity cannot determine whether its image is still the right one.
    if (targets.get(element) !== token || !url) return;
    element.style.backgroundImage = 'url(' + JSON.stringify(url) + ')';
    element.classList.add('is-art');
  }

  function releaseTargets() {
    targets = new WeakMap();
    queued.clear();
    // Native resource loads cannot be cancelled. Keep their concurrency slots
    // and cache successful results, but release the old view's DOM references.
    for (const request of pending.values()) request.waiters.clear();
  }

  function pumpArtwork() {
    if (pumping || rendering) return;
    pumping = true;
    try {
      while (pending.size < pendingLimit && queued.size) {
        const [path, request] = queued.entries().next().value;
        queued.delete(path);
        for (const [element, token] of request.waiters) {
          if (targets.get(element) !== token) request.waiters.delete(element);
        }
        if (!request.waiters.size) continue;
        request.started = Date.now();
        pending.set(path, request);
        const finish = url => {
          if (pending.get(path) !== request) return;
          pending.delete(path);
          try {
            if (typeof url !== 'string' || !url) return;
            cache.set(path, url);
            while (cache.size > cacheLimit) cache.delete(cache.keys().next().value);
            for (const [element, token] of request.waiters) applyArtwork(element, token, url);
          } finally {
            request.waiters.clear();
            pumpArtwork();
          }
        };
        try { Client.loadFile(path, finish, () => finish(null)); }
        catch { finish(null); }
      }
    } finally { pumping = false; }
  }

  component.loadCardArt = function loadCardArt(element, id) {
    const token = {};
    targets.set(element, token);
    element.style.backgroundImage = '';
    element.classList.remove('is-art');
    try {
      const resource = DB.getItemInfo(Number(id))?.illustResourcesName;
      if (!resource || typeof Client?.loadFile !== 'function') return;
      const path = DB.INTERFACE_PATH + 'cardbmp/' + resource + '.bmp';
      const cached = cache.get(path);
      if (cached) {
        cache.delete(path);
        cache.set(path, cached);
        applyArtwork(element, token, cached);
        return;
      }
      const now = Date.now();
      // Expire stalled requests only when another render needs artwork;
      // failures are retried on a later render, without background timers.
      for (const [key, request] of pending) {
        if (now - request.started >= pendingLifetime) {
          pending.delete(key);
          request.waiters.clear();
        }
      }
      let request = pending.get(path) || queued.get(path);
      if (!request) {
        request = { waiters: new Map() };
        queued.set(path, request);
      }
      request.waiters.set(element, token);
      pumpArtwork();
    } catch { /* Missing art keeps the native monogram without caching failure. */ }
  };

  if (typeof nativeRender === 'function') component.renderCards = function (...args) {
    if (!rendering) releaseTargets();
    rendering++;
    try { return nativeRender.apply(this, args); }
    finally { rendering--; pumpArtwork(); }
  };

  function restoreLayer(record) {
    if (!record.host || !record.saved) return;
    if (record.saved.value) record.host.style.setProperty('z-index', record.saved.value, record.saved.priority);
    else record.host.style.removeProperty('z-index');
    record.saved = null;
  }

  function liftOverlays() {
    if (!component._host?.isConnected) return;
    const nativeZ = Number.parseInt(doc.defaultView?.getComputedStyle(component._host).zIndex, 10);
    const base = Math.max(120, Number.isFinite(nativeZ) ? nativeZ : 0);
    let offset = 1;
    for (const [overlay, record] of overlays) {
      const host = overlay._host;
      if (record.closed || !host?.isConnected) continue;
      if (record.host !== host) {
        record.host?.removeEventListener('x_remove', record.removed);
        restoreLayer(record);
        record.host = host;
        host.addEventListener('x_remove', record.removed);
      }
      if (!record.saved) record.saved = {
        value: host.style.getPropertyValue('z-index'), priority: host.style.getPropertyPriority('z-index'),
      };
      host.style.setProperty('z-index', String(base + offset++), 'important');
    }
  }

  function registerOverlay(overlay) {
    if (!overlay || overlays.has(overlay) || typeof overlay.focus !== 'function') return;
    const original = overlay.focus;
    const record = { original, host: null, saved: null, removed: null, wrapped: null, closed: false };
    record.removed = () => { record.closed = true; restoreLayer(record); liftOverlays(); };
    record.wrapped = function (...args) {
      record.closed = false;
      const result = original.apply(this, args);
      liftOverlays();
      return result;
    };
    overlays.set(overlay, record);
    overlay.focus = record.wrapped;
  }

  function releaseOverlays() {
    for (const [overlay, record] of overlays) {
      restoreLayer(record);
      record.host?.removeEventListener('x_remove', record.removed);
      if (overlay.focus === record.wrapped) overlay.focus = record.original;
    }
    overlays.clear();
  }

  component.createCardNode = function createCardNode(entry, ...args) {
    const card = nativeCreate.call(this, entry, ...args);
    const id = Number(entry.id);
    if (!Number.isSafeInteger(id) || id <= 0) return card;
    card.addEventListener('contextmenu', event => {
      event.preventDefault();
      event.stopPropagation();
      const info = getItemInfo?.();
      if (!info || typeof info.append !== 'function' || typeof info.setItem !== 'function') return;
      registerOverlay(info);
      // The native ItemInfo card-view button opens this same illustration UI.
      registerOverlay(UIManager?.components?.CardIllustration);
      info.append();
      info.uid = id;
      info.setItem({ ITID: id, IsIdentified: true, type: 6 });
      info.focus?.();
      liftOverlays();
    });
    return card;
  };
  component.focus = function (...args) {
    const result = nativeFocus?.apply(this, args);
    liftOverlays();
    return result;
  };
  component.onRemove = function (...args) {
    try { return nativeRemove?.apply(this, args); }
    finally { releaseTargets(); releaseOverlays(); }
  };
  component._lastroCardArtInstalled = true;
  return true;
}
