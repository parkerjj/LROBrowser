// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { installKoreShellPanels } from '../scripts/lastro-tools-panels.mjs';

const nativeHtml = `<div class="lastro-tools"><div class="lastro-header"><div class="lastro-header-title"><strong>LastRO 工具</strong><span>已就绪</span></div><button data-action="close"></button></div><div class="lastro-quick"></div><div class="lastro-compact-status" hidden><span data-compact-status-text>战斗：关 · 捡物：关</span></div></div>`;
const classicHtml = `<div class="lastro-tools"><div class="lastro-ro-titlebar"><strong>挂机设置</strong><button data-action="close"></button></div><div class="lastro-settings-view"></div><div class="lastro-panel-footer"></div></div>`;

function install(html: string, onAppend: () => void = () => {}, gameSessionId: string | null = null) {
  const host = window.document.createElement('div');
  const shortcut = { setEnabled: vi.fn(), refresh: vi.fn() };
  const tools = {
    _panelOpener: null as HTMLElement | null,
    _lastroShortcutEntry: shortcut,
    render: vi.fn(() => html),
    init: vi.fn(),
    hidePanel: vi.fn(),
    restorePanel: vi.fn(),
    onAppend: vi.fn(onAppend),
    onRemove: vi.fn(),
    renderCompactStatus: vi.fn(),
    getRoot: () => host,
  };
  const shell = { mode: 'lastro', setMode: vi.fn(), setVisible: vi.fn(), dispose: vi.fn(), remountWindow: vi.fn() };
  const createKoreShell = vi.fn((options?: unknown) => {
    const container = (options as { container?: HTMLElement } | undefined)?.container;
    if (container) {
      const win = window.document.createElement('div');
      win.className = 'kore-window';
      container.append(win);
    }
    return shell;
  });
  const api = installKoreShellPanels(tools, {
    document: window.document, window,
    setHtml: (node: HTMLElement, value: string) => { node.innerHTML = value; },
    createKoreShell, getKoreHost: () => ({ state: { worldReady: false, gameSessionId } }),
    shellCss: '.kore-shell-host{height:320px}',
  });
  return { host, tools, shell, createKoreShell, api, shortcut };
}

test('shell wrapper replaces the native header and keeps the switch in both renders', () => {
  const native = install(nativeHtml);
  const nativeOutput = native.tools.render();
  expect(nativeOutput).toContain('data-shell-mode="lastro"');
  expect(nativeOutput).toContain('>KoreEngine<');
  expect(nativeOutput).toContain('kore-shell-host');
  expect(nativeOutput).toContain('lastro-mode-thumb');
  expect(nativeOutput).not.toContain('LastRO 工具');
  // The LastRO Trusted Types policy rejects <style> inside component HTML.
  expect(nativeOutput).not.toContain('<style');

  const classic = install(classicHtml);
  const classicOutput = classic.tools.render();
  expect(classicOutput).toContain('data-shell-mode="lastro"');
  expect(classicOutput).toContain('kore-shell-host');
  expect(classicOutput).not.toContain('<strong>挂机设置</strong>');
  expect(classicOutput).not.toContain('<style');
});

test('init mounts one shell and the switch changes the panel mode', () => {
  const { host, tools, shell, createKoreShell, api } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  expect(createKoreShell).toHaveBeenCalledOnce();
  const container = createKoreShell.mock.calls[0]![0] as unknown as { container: HTMLElement; history: string[] };
  expect(container.container.classList.contains('kore-shell-host')).toBe(true);
  expect(container.history).toEqual([]);

  const switchToKore = host.querySelector<HTMLButtonElement>('[data-shell-mode="kore"]')!;
  switchToKore.click();
  expect(shell.setMode).toHaveBeenCalledWith('kore');
  expect(host.querySelector('.lastro-tools')?.getAttribute('data-mode')).toBe('kore');
  expect(host.querySelector<HTMLElement>('.kore-shell-host')?.hidden).toBe(false);
  expect(api.mode).toBe('kore');

  host.querySelector<HTMLButtonElement>('[data-shell-mode="lastro"]')!.click();
  expect(shell.setMode).toHaveBeenLastCalledWith('lastro');
  expect(host.querySelector<HTMLElement>('.kore-shell-host')?.hidden).toBe(true);
});

test('shortcut-entry mode changes re-mount the window in place', () => {
  const { host, tools, shell, createKoreShell, shortcut } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  expect(createKoreShell).toHaveBeenCalledTimes(1);
  // A shortcut-entry toggle re-renders the panel, dropping the mounted KE
  // window into a fresh, empty shell host. The shell survives; only the window
  // is rebuilt, so the fullscreen/debug state is preserved.
  host.querySelector('.kore-shell-host')?.replaceChildren();
  shortcut.setEnabled(true);
  expect(createKoreShell).toHaveBeenCalledTimes(1);
  expect(shell.remountWindow).toHaveBeenCalled();
});

test('re-appending after removal re-mounts the KE window', () => {
  const { host, tools, createKoreShell } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  expect(createKoreShell).toHaveBeenCalledTimes(1);
  tools.onRemove();
  tools.onAppend();
  expect(createKoreShell).toHaveBeenCalledTimes(2);
});

test('visible lifecycle forwards to the shared shell', () => {
  const { host, tools, shell } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  tools.restorePanel();
  expect(shell.setVisible).toHaveBeenCalledWith(true);
  tools.hidePanel();
  expect(shell.setVisible).toHaveBeenCalledWith(false);
  tools.onRemove();
  expect(shell.dispose).toHaveBeenCalledOnce();
});

test('appending a panel that is already visible (shortcut entry) marks the shell visible', () => {
  const { host, tools, shell } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  // The native shortcut-entry panel is shown by onAppend itself and never goes
  // through restorePanel, so the poller would stay hidden without this.
  tools.onAppend();
  expect(shell.setVisible).toHaveBeenLastCalledWith(true, { keepOverlays: true });
});

test('appending a panel hidden behind the classic dock keeps the shell hidden', () => {
  const panelHost = window.document.createElement('div');
  // Classic onAppend hides the host until the dock opener restores it.
  const { host, tools, shell } = install(nativeHtml, () => { panelHost.style.display = 'none'; });
  (tools as unknown as { _host: HTMLElement })._host = panelHost;
  host.innerHTML = tools.render();
  tools.init();
  tools.onAppend();
  expect(shell.setVisible).toHaveBeenLastCalledWith(false, { keepOverlays: true });
});

test('a map change removes and re-appends the panel without disposing the shell', () => {
  // MapRenderer.setMap() calls UIManager.removeComponents() on every map change.
  const { host, tools, shell, createKoreShell } = install(nativeHtml, () => {}, 'game-1');
  host.innerHTML = tools.render();
  tools.init();
  tools.onRemove();
  expect(shell.dispose).not.toHaveBeenCalled();
  expect(shell.setVisible).toHaveBeenLastCalledWith(false, { keepOverlays: true });
  tools.onAppend();
  expect(createKoreShell).toHaveBeenCalledTimes(1);
  expect(shell.setVisible).toHaveBeenLastCalledWith(true, { keepOverlays: true });
});

afterEach(() => { vi.useRealTimers(); });

test('only the LastRO to KE switch plays the ignition and it cleans up after itself', () => {
  vi.useFakeTimers();
  const { host, tools } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  const panel = () => host.querySelector('.lastro-tools')!;
  const tab = (mode: string) => host.querySelector<HTMLButtonElement>(`[data-shell-mode="${mode}"]`)!;
  expect(panel().querySelector('.kore-boot')).toBeNull();

  tab('kore').click();
  expect(panel().querySelectorAll('.kore-boot')).toHaveLength(1);
  expect(panel().classList.contains('is-igniting')).toBe(true);
  expect(panel().querySelectorAll('.kore-boot > span')).toHaveLength(3);

  vi.advanceTimersByTime(1500);
  expect(panel().querySelector('.kore-boot')).not.toBeNull();
  vi.advanceTimersByTime(1400);
  expect(panel().querySelector('.kore-boot')).toBeNull();
  expect(panel().classList.contains('is-igniting')).toBe(false);

  tab('lastro').click();
  expect(panel().querySelector('.kore-boot')).toBeNull();
  expect(panel().classList.contains('is-igniting')).toBe(false);
});

test('reduced motion skips the ignition', () => {
  vi.useFakeTimers();
  const { host, tools } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({ matches: query.includes('reduce') })) as typeof window.matchMedia;
  try {
    host.querySelector<HTMLButtonElement>('[data-shell-mode="kore"]')!.click();
    expect(host.querySelector('.kore-boot')).toBeNull();
    expect(host.querySelector('.lastro-tools')?.getAttribute('data-mode')).toBe('kore');
  } finally { window.matchMedia = original; }
});

// 真实面板结构：设置视图默认隐藏，只有点主视图里的齿轮才能打开。
const realHtml = `<div class="lastro-tools"><div class="lastro-header"><div class="lastro-header-title"><strong>LastRO 工具</strong></div><div class="lastro-header-actions"><button data-action="open-settings">⚙</button><button data-action="close"></button></div></div><div class="lastro-main-view"><div class="lastro-quick-toggles"><label><span>战斗</span><input type="checkbox" data-option="autoAttack"></label><label><span>捡物</span><input type="checkbox" data-option="autoLoot"></label></div></div><div class="lastro-settings-view" hidden><div class="lastro-tabs"><button data-tab="battle">战斗设置</button></div></div><div class="lastro-panel-footer"></div></div>`;

test('settings gear sits next to the battle switches in the main view, not inside the hidden settings view', () => {
  const { host, tools } = install(realHtml);
  host.innerHTML = tools.render();
  const gears = host.querySelectorAll('[data-action="open-settings"]');
  expect(gears).toHaveLength(1);
  const gear = gears[0] as HTMLElement;
  expect(gear.closest('.lastro-settings-view')).toBeNull();
  expect(gear.closest('[hidden]')).toBeNull();
  expect(gear.parentElement?.classList.contains('lastro-quick-toggles')).toBe(true);
  expect(gear.getAttribute('aria-label')).toBe('打开挂机设置');
  expect(gear.textContent).toBe('⚙');
  expect(gear.parentElement?.lastElementChild).toBe(gear);
  expect(gear.previousElementSibling?.querySelector('[data-option]')).toBeTruthy();
});
