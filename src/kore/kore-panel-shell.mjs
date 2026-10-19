// Shell around the LastROTools host: mode switching, visibility gating,
// fullscreen lifecycle and automatic 3D power saving. It owns no gameplay
// state; every KE value is read back from Rust output.

import { createKoreConsoleModel } from './kore-panel-console.mjs';
import { createKoreDebugView } from './kore-panel-debug.mjs';
import { createKoreFullscreen } from './kore-panel-fullscreen.mjs';
import { createKorePoller } from './kore-panel-poller.mjs';
import { ensureKorePanelStyle } from './kore-panel-style.mjs';
import { createKoreWindow } from './kore-panel-window.mjs';
import { createRenderToggle } from './kore-render-toggle.mjs';

export const KORE_SHELL_MODE_KEY = 'ke-shell-mode';

export function createKoreShell({
  page = globalThis, container, getHost = () => page.KoreEngine,
  onModeChange = () => {}, initialMode = null, history = [],
} = {}) {
  const document = page.document;
  const forceDebug = /[?&]kore-debug=1(?:&|$)/.test(String(page.location?.search ?? ''));
  ensureKorePanelStyle(page);
  let host = null;
  let poller = null;
  let consoleModel = null;
  let renderToggle = null;
  let windowView = null;
  let fullscreen = null;
  let fullscreenPreEnabled = true;
  let fullscreenAutoRevision = 0;
  let debugView = null;
  let retryTimer = null;
  let preferenceApplied = false;
  let mode = initialMode === 'kore' || initialMode === 'lastro' ? initialMode : readMode();
  let visible = false;

  function readMode() {
    try { return page.localStorage?.getItem(KORE_SHELL_MODE_KEY) === 'kore' ? 'kore' : 'lastro'; } catch { return 'lastro'; }
  }
  function writeMode(next) {
    try { page.localStorage?.setItem(KORE_SHELL_MODE_KEY, next); } catch { /* UI preference is best effort. */ }
  }

  const placeholder = document.createElement('div');
  placeholder.className = 'kore-shell-placeholder';
  placeholder.textContent = '等待 KoreEngine…';
  container.append(placeholder);

  function initialize() {
    try { initializeInner(); }
    catch (error) {
      placeholder.textContent = `KE 面板初始化失败: ${String(error?.message ?? error)}`;
    }
  }
  function initializeInner() {
    host = getHost();
    if (!host) {
      retryTimer = page.setTimeout?.(initialize, 500) ?? null;
      return;
    }
    placeholder.remove();
    poller = createKorePoller({ host, page });
    consoleModel = createKoreConsoleModel({ host });
    renderToggle = createRenderToggle({ page });
    windowView = createKoreWindow({
      page, host, poller, consoleModel, renderToggle, history,
      onFullscreen: openFullscreen, onDebug: openDebug,
    });
    container.append(windowView.element);
    poller.start();
    host.onStateChange?.(state => {
      if (!preferenceApplied && state.worldReady === true) {
        preferenceApplied = true;
        renderToggle.applyPreference();
      }
      applyVisibility();
    });
    if (host.state?.worldReady === true) {
      preferenceApplied = true;
      renderToggle.applyPreference();
    }
    applyVisibility();
    if (forceDebug) openDebug();
  }

  function applyVisibility() {
    if (!poller) return;
    if (fullscreen) { poller.setView('fullscreen'); return; }
    poller.setView(visible && mode === 'kore' ? 'small' : 'hidden');
  }

  function setMode(next) {
    if (next !== 'kore' && next !== 'lastro') return;
    mode = next;
    writeMode(next);
    container.hidden = next !== 'kore';
    if (next !== 'kore' && !forceDebug) debugView?.hide();
    applyVisibility();
    onModeChange(next);
  }

  function setVisible(next) {
    visible = next === true;
    if (!visible) {
      debugView?.hide();
      if (fullscreen) fullscreen.close();
    }
    applyVisibility();
  }

  function openFullscreen() {
    if (!host || fullscreen) return;
    fullscreenPreEnabled = renderToggle.enabled;
    if (renderToggle.available && fullscreenPreEnabled) renderToggle.setEnabled(false, { persist: false });
    // Remember the revision after the automatic change so a manual toggle
    // made during fullscreen can be detected on exit.
    fullscreenAutoRevision = renderToggle.revision;
    fullscreen = createKoreFullscreen({
      page, host, poller, consoleModel, history,
      onExit: finishFullscreen,
      onSwitchLastro: () => {
        finishFullscreen();
        setMode('lastro');
      },
    });
  }

  function finishFullscreen() {
    if (!fullscreen) return;
    fullscreen = null;
    // A manual 3D change made during fullscreen wins over the automatic restore.
    if (renderToggle.available && renderToggle.revision === fullscreenAutoRevision) {
      renderToggle.setEnabled(fullscreenPreEnabled, { persist: false });
    }
    applyVisibility();
  }

  function openDebug() {
    if (!host) return;
    if (!debugView) debugView = createKoreDebugView({ page, host });
    if (!debugView.element.isConnected) document.body.append(debugView.element);
    debugView.show('state');
  }

  const shortcut = event => {
    if (!event.altKey || !event.shiftKey || String(event.key).toLowerCase() !== 'k') return;
    if (!visible || mode !== 'kore') return;
    event.preventDefault();
    if (fullscreen) fullscreen.close();
    else openFullscreen();
  };
  document.addEventListener?.('keydown', shortcut);

  initialize();
  // The LastROTools patch calls setMode after it has updated its own views.
  setMode(mode);

  return {
    get mode() { return mode; },
    get host() { return host; },
    get poller() { return poller; },
    get initialized() { return Boolean(host); },
    setMode,
    setVisible,
    openFullscreen,
    openDebug,
    focus() { windowView?.focus(); },
    dispose() {
      document.removeEventListener?.('keydown', shortcut);
      if (retryTimer !== null) { page.clearTimeout?.(retryTimer); retryTimer = null; }
      if (fullscreen) {
        fullscreen.close();
        fullscreen = null;
        // close() may animate; restore 3D now instead of relying on onExit.
        if (renderToggle?.available && renderToggle.revision === fullscreenAutoRevision) {
          renderToggle.setEnabled(fullscreenPreEnabled, { persist: false });
        }
      }
      poller?.dispose();
      consoleModel?.dispose();
      debugView?.destroy();
      windowView?.destroy();
      placeholder.remove();
      container.replaceChildren();
    },
  };
}

export function initializeKoreShell(options) {
  return createKoreShell(options);
}
