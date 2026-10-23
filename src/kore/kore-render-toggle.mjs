// Power-saving 3D toggle. It never touches KE state or the network path; it
// only hides the WebGL canvas and lowers the render loop rate.

export const KORE_RENDER_PREFERENCE = 'ke-render-3d';
const POWER_SAVE_FPS = 5;

export function createRenderToggle({ page = globalThis } = {}) {
  // The renderer is exposed from Renderer.init, which may run after the panel
  // is constructed; read it lazily instead of caching availability.
  const current = () => {
    const value = page.__LastRORenderer;
    return value?.Renderer?.canvas && value?.GraphicsSettings ? value : null;
  };
  const available = () => Boolean(current());
  const listeners = new Set();
  let saved = null;
  let enabled = true;
  let revision = 0;
  const storage = page.localStorage;

  const readPreference = () => {
    try { return storage?.getItem(KORE_RENDER_PREFERENCE); } catch { return null; }
  };
  const writePreference = value => {
    try { storage?.setItem(KORE_RENDER_PREFERENCE, value ? '1' : '0'); } catch { /* UI preference is best effort. */ }
  };
  const notify = () => {
    for (const listener of listeners) { try { listener(); } catch { /* UI must not break rendering. */ } }
  };

  function setEnabled(value, { persist = true } = {}) {
    const next = value === true;
    const renderer = current();
    if (!renderer) return false;
    const Renderer = renderer.Renderer;
    const settings = renderer.GraphicsSettings;
    if (next === enabled) {
      if (persist) writePreference(next);
      return true;
    }
    if (!next) {
      saved = { fpslimit: settings.fpslimit, display: Renderer.canvas.style.display };
      Renderer.canvas.style.display = 'none';
      settings.fpslimit = POWER_SAVE_FPS;
      Renderer.frameLimit = POWER_SAVE_FPS;
    } else {
      if (Renderer.canvas.style.display === 'none') Renderer.canvas.style.display = saved?.display ?? '';
      // Only restore the saved limit when our power-saving value is still in
      // place; a manual change made while hidden must win.
      if (settings.fpslimit === POWER_SAVE_FPS) settings.fpslimit = saved?.fpslimit ?? 60;
      if (Renderer.frameLimit === POWER_SAVE_FPS) Renderer.frameLimit = settings.fpslimit;
      saved = null;
    }
    enabled = next;
    revision += 1;
    if (persist) writePreference(next);
    notify();
    return true;
  }

  function applyPreference() {
    if (!current()) return false;
    const stored = readPreference();
    if (stored === '0') return setEnabled(false, { persist: false });
    if (stored === '1') return setEnabled(true, { persist: false });
    return true;
  }

  return {
    get available() { return available(); },
    get enabled() { return enabled; },
    get revision() { return revision; },
    setEnabled,
    applyPreference,
    onChange(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
