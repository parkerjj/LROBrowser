// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { installKoreShellPanels } from '../scripts/lastro-tools-panels.mjs';

const nativeHtml = `<div class="lastro-tools"><div class="lastro-header"><div class="lastro-header-title"><strong>LastRO 工具</strong><span>已就绪</span></div><button data-action="close"></button></div><div class="lastro-quick"></div><div class="lastro-compact-status" hidden><span data-compact-status-text>战斗：关 · 捡物：关</span></div></div>`;
const classicHtml = `<div class="lastro-tools"><div class="lastro-ro-titlebar"><strong>挂机设置</strong><button data-action="close"></button></div><div class="lastro-settings-view"></div><div class="lastro-panel-footer"></div></div>`;

function install(html: string) {
  const host = window.document.createElement('div');
  const shortcut = { setEnabled: vi.fn(), refresh: vi.fn() };
  const tools = {
    _panelOpener: null as HTMLElement | null,
    _lastroShortcutEntry: shortcut,
    render: vi.fn(() => html),
    init: vi.fn(),
    hidePanel: vi.fn(),
    restorePanel: vi.fn(),
    onAppend: vi.fn(),
    onRemove: vi.fn(),
    renderCompactStatus: vi.fn(),
    getRoot: () => host,
  };
  const shell = { mode: 'lastro', setMode: vi.fn(), setVisible: vi.fn(), dispose: vi.fn() };
  const createKoreShell = vi.fn((options?: unknown) => { void options; return shell; });
  const api = installKoreShellPanels(tools, {
    document: window.document, window,
    setHtml: (node: HTMLElement, value: string) => { node.innerHTML = value; },
    createKoreShell, getKoreHost: () => ({ state: { worldReady: false } }),
    shellCss: '.kore-shell-host{height:320px}',
  });
  return { host, tools, shell, createKoreShell, api, shortcut };
}

test('shell wrapper replaces the native header and keeps the switch in both renders', () => {
  const native = install(nativeHtml);
  const nativeOutput = native.tools.render();
  expect(nativeOutput).toContain('data-shell-mode="lastro"');
  expect(nativeOutput).toContain('科技改变生活');
  expect(nativeOutput).toContain('kore-shell-host');
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

test('shortcut-entry mode changes reinstall the shell', () => {
  const { host, tools, createKoreShell, shortcut } = install(nativeHtml);
  host.innerHTML = tools.render();
  tools.init();
  expect(createKoreShell).toHaveBeenCalledTimes(1);
  shortcut.setEnabled(true);
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
