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

function mount() {
  const harness = hostHarness();
  const { page, canvas, GraphicsSettings } = pageHarness();
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

test('Alt+Shift+K toggles fullscreen and the fullscreen switch exits to LastRO', () => {
  const { shell } = mount();
  shell.setVisible(true);
  shell.setMode('kore');
  const key = () => window.document.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', altKey: true, shiftKey: true }));
  key();
  expect(window.document.querySelector('.kore-fullscreen')).toBeTruthy();
  key();
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();

  shell.openFullscreen();
  window.document.querySelector<HTMLButtonElement>('.kore-fullscreen [data-shell-mode="lastro"]')?.click();
  expect(window.document.querySelector('.kore-fullscreen')).toBeNull();
  expect(shell.mode).toBe('lastro');
  shell.dispose();
});

test('a manual 3D change during fullscreen wins over the automatic restore', () => {
  window.localStorage.setItem('ke-render-3d', '0');
  const { host, container, shell, canvas, GraphicsSettings, emitState } = mount();
  emitState();
  expect(canvas.style.display).toBe('none');

  shell.setVisible(true);
  shell.setMode('kore');
  shell.openFullscreen();
  expect(canvas.style.display).toBe('none');

  const checkbox = container.querySelector<HTMLInputElement>('.kore-render-toggle input');
  expect(checkbox).toBeTruthy();
  checkbox!.checked = true;
  checkbox!.dispatchEvent(new Event('change'));
  expect(canvas.style.display).toBe('block');
  expect(GraphicsSettings.fpslimit).toBe(60);

  window.document.querySelector<HTMLButtonElement>('.kore-fs-exit')?.click();
  expect(canvas.style.display).toBe('block');
  expect(host.state.logs).toEqual([]);
  shell.dispose();
});
