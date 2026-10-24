// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createKoreShell } from '../src/kore/kore-panel-shell.mjs';

function hostHarness() {
  const outputListeners = new Set<(output: { command: string; result: unknown; silent: boolean }) => void>();
  const stateListeners = new Set<(state: unknown) => void>();
  const sent: Array<{ text: string; options?: { silent?: boolean } }> = [];
  const host = {
    state: {
      status: 'runtime-ready', worldReady: true, logs: [] as unknown[], configIdentity: null,
      runtimeStatus: null, lastDiagnostic: null, actions: [] as unknown[], diagnosticLog: [] as unknown[],
      receivedBytes: 0, sentBytes: 0, streamStatus: 'world-ready',
    },
    sendCommandText: vi.fn((text: string, options?: { silent?: boolean }) => { sent.push({ text, options }); return true; }),
    onCommandOutput: vi.fn((listener: (output: { command: string; result: unknown; silent: boolean }) => void) => {
      outputListeners.add(listener); return () => outputListeners.delete(listener);
    }),
    onStateChange: vi.fn((listener: (state: unknown) => void) => {
      stateListeners.add(listener); return () => stateListeners.delete(listener);
    }),
    clearConsole: vi.fn(),
    debugMapRetry: vi.fn(() => true),
  };
  return {
    host, sent,
    emitOutput(command: string, result: unknown, silent = true) {
      for (const listener of outputListeners) listener({ command, result, silent });
    },
    emitState() { for (const listener of stateListeners) listener(host.state); },
  };
}

function pageHarness() {
  const canvas = { style: { display: 'block' } };
  const GraphicsSettings = { fpslimit: 60 };
  const page: Record<string, unknown> = {
    document: window.document,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window),
    requestAnimationFrame: (fn: () => void) => fn(),
    matchMedia: () => ({ matches: true }),
    atob: window.atob.bind(window),
    __LastRORenderer: { Renderer: { canvas, frameLimit: 60 }, GraphicsSettings },
  };
  return { page, canvas, GraphicsSettings };
}

function mount({ search = '' } = {}) {
  const harness = hostHarness();
  const { page, canvas, GraphicsSettings } = pageHarness();
  page.location = { search };
  const container = window.document.createElement('div');
  container.style.width = '520px';
  container.style.height = '360px';
  window.document.body.append(container);
  const shell = createKoreShell({
    page, container, getHost: () => harness.host, initialMode: 'lastro',
  });
  return { ...harness, page, canvas, GraphicsSettings, container, shell };
}

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.document.body.replaceChildren();
});

test('shell mounts the KE window only in the KE page and gates polling by mode', () => {
  const { container, shell, sent } = mount();
  expect(shell.initialized).toBe(true);
  expect(container.querySelector('.kore-window')).toBeTruthy();
  expect(container.hidden).toBe(true);
  shell.setVisible(true);
  shell.setMode('kore');
  expect(container.hidden).toBe(false);
  expect(shell.mode).toBe('kore');
  expect(sent.map(entry => entry.text)).toEqual(['s', 'ai print', 'where']);
  shell.setMode('lastro');
  expect(container.hidden).toBe(true);
  shell.dispose();
});

test('fullscreen is an independent overlay and restores 3D on exit', () => {
  const { container, shell, canvas, GraphicsSettings, sent } = mount();
  shell.setVisible(true);
  shell.setMode('kore');
  const before = { width: container.style.width, height: container.style.height, left: container.style.left, right: container.style.right };
  shell.openFullscreen();
  const overlay = window.document.querySelector('.kore-fullscreen');
  expect(overlay).toBeTruthy();
  expect(overlay?.parentElement).toBe(window.document.body);
  expect(container.querySelector('.kore-window')).toBeTruthy();
  expect({ width: container.style.width, height: container.style.height, left: container.style.left, right: container.style.right }).toEqual(before);
  expect(canvas.style.display).toBe('none');
  expect(GraphicsSettings.fpslimit).toBe(5);
  expect(sent.map(entry => entry.text)).toEqual(expect.arrayContaining(['ml', 'pl', 'nl', 'il']));

  overlay?.querySelector<HTMLButtonElement>('.kore-fs-exit')?.click();
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();
  expect(canvas.style.display).toBe('block');
  expect(GraphicsSettings.fpslimit).toBe(60);
  shell.dispose();
});

test('Alt+Shift+K toggles the independent fullscreen panel', () => {
  const { shell } = mount();
  shell.setVisible(true);
  shell.setMode('kore');
  const key = () => window.document.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', altKey: true, shiftKey: true }));
  key();
  expect(window.document.querySelector('.kore-fullscreen')).toBeTruthy();
  // The mode switch only lives in the small window.
  expect(window.document.querySelector('.kore-fullscreen .kore-fs-title')?.textContent).toBe('KoreEngine');
  expect(window.document.querySelector('.kore-fullscreen [role="tablist"]')).toBeNull();
  key();
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();
  shell.dispose();
});

test('re-mounting the window preserves fullscreen and debug state', () => {
  const { shell, container } = mount();
  shell.setVisible(true);
  shell.setMode('kore');
  shell.openFullscreen();
  shell.openDebug();
  expect(window.document.querySelector('.kore-fullscreen')).toBeTruthy();
  expect(window.document.querySelector('.kore-debug')).toBeTruthy();
  // A teleport re-render drops the small window into a fresh host; the
  // fullscreen overlay and debug drawer must survive it.
  const newHost = window.document.createElement('div');
  newHost.className = 'kore-shell-host';
  container.replaceChildren(newHost);
  shell.remountWindow(newHost);
  expect(window.document.querySelector('.kore-fullscreen')).toBeTruthy();
  expect(window.document.querySelector('.kore-debug')).toBeTruthy();
  expect(newHost.querySelector('.kore-window')).toBeTruthy();
  shell.dispose();
});

test('lifecycle hides keep fullscreen and debug open; an explicit hide closes them', () => {
  const { shell } = mount();
  shell.setVisible(true);
  shell.setMode('kore');
  shell.openFullscreen();
  shell.openDebug();
  // A map change removes and re-appends the LastRO panel.
  shell.setVisible(false, { keepOverlays: true });
  shell.setVisible(true, { keepOverlays: true });
  expect(window.document.querySelector('.kore-fullscreen')).toBeTruthy();
  expect((window.document.querySelector('.kore-debug') as HTMLElement).hidden).toBe(false);
  shell.setVisible(false);
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();
  expect((window.document.querySelector('.kore-debug') as HTMLElement).hidden).toBe(true);
  shell.dispose();
});

test('overlays close when the KE game session ends or is replaced', () => {
  const { host, shell, emitState } = mount();
  const state = host.state as { gameSessionId?: string | null };
  state.gameSessionId = 'game-1';
  emitState();
  shell.setVisible(true);
  shell.setMode('kore');
  shell.openFullscreen();
  emitState();
  expect(window.document.querySelector('.kore-fullscreen')).toBeTruthy();
  state.gameSessionId = null;
  emitState();
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();
  state.gameSessionId = 'game-2';
  emitState();
  shell.openFullscreen();
  state.gameSessionId = 'game-3';
  emitState();
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();
  shell.dispose();
});

test('kore-debug=1 opens the debug page on initialization', () => {
  const { shell } = mount({ search: '?kore-debug=1' });
  const debug = window.document.querySelector('.kore-debug');
  expect(debug).toBeTruthy();
  expect((debug as HTMLElement).hidden).toBe(false);
  shell.dispose();
});

test('disposing the shell while fullscreen restores 3D', () => {
  const { shell, canvas, GraphicsSettings } = mount();
  shell.setVisible(true);
  shell.setMode('kore');
  shell.openFullscreen();
  expect(canvas.style.display).toBe('none');
  shell.dispose();
  expect(canvas.style.display).toBe('block');
  expect(GraphicsSettings.fpslimit).toBe(60);
});

test('a manual 3D change during fullscreen wins over the automatic restore', () => {
  window.sessionStorage.setItem('ke-render-3d', '0');
  const { host, container, shell, canvas, GraphicsSettings, emitState } = mount();
  emitState();
  expect(canvas.style.display).toBe('none');

  shell.setVisible(true);
  shell.setMode('kore');
  shell.openFullscreen();
  expect(canvas.style.display).toBe('none');

  const checkbox = container.querySelector<HTMLInputElement>('.kore-render-toggle input');
  expect(checkbox).toBeTruthy();
  expect(checkbox!.parentElement?.textContent?.trim()).toBe('省电模式');
  expect(checkbox!.checked).toBe(true);
  checkbox!.checked = false;
  checkbox!.dispatchEvent(new Event('change'));
  expect(canvas.style.display).toBe('block');
  expect(GraphicsSettings.fpslimit).toBe(60);

  window.document.querySelector<HTMLButtonElement>('.kore-fs-exit')?.click();
  expect(canvas.style.display).toBe('block');
  expect(host.state.logs).toEqual([]);
  shell.dispose();
});
