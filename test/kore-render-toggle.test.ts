import { beforeEach, expect, test, vi } from 'vitest';
import { createRenderToggle, KORE_RENDER_PREFERENCE } from '../src/kore/kore-render-toggle.mjs';

// 同一应用的所有窗口共享 localStorage；sessionStorage 按窗口隔离。
// 测试里两个窗口共用 sharedLocalStorage，各自持有独立 sessionStorage。
let sharedLocalStorage = new Map<string, string>();
beforeEach(() => { sharedLocalStorage = new Map(); });

function renderPage({ stored = null as string | null, fpslimit = 60, display = 'block' } = {}) {
  const canvas = { style: { display } };
  const GraphicsSettings = { fpslimit };
  const Renderer = { canvas, frameLimit: fpslimit };
  const values = new Map<string, string>();
  if (stored != null) values.set(KORE_RENDER_PREFERENCE, stored);
  const sessionStorage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
  };
  const localStorage = {
    getItem: vi.fn((key: string) => sharedLocalStorage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { sharedLocalStorage.set(key, value); }),
  };
  return {
    page: { __LastRORenderer: { Renderer, GraphicsSettings }, sessionStorage, localStorage },
    canvas, GraphicsSettings, Renderer, sessionStorage, localStorage,
  };
}

test('unavailable renderer disables the toggle without writing preferences', () => {
  const setItem = vi.fn();
  const toggle = createRenderToggle({ page: { sessionStorage: { setItem } } });
  expect(toggle.available).toBe(false);
  expect(toggle.setEnabled(false)).toBe(false);
  expect(setItem).not.toHaveBeenCalled();
});

test('disabling hides the canvas and lowers the frame limit, enabling restores both', () => {
  const harness = renderPage();
  const toggle = createRenderToggle({ page: harness.page });
  const changes = vi.fn();
  toggle.onChange(changes);
  expect(toggle.setEnabled(false)).toBe(true);
  expect(harness.canvas.style.display).toBe('none');
  expect(harness.GraphicsSettings.fpslimit).toBe(5);
  expect(harness.Renderer.frameLimit).toBe(5);
  expect(harness.sessionStorage.setItem).toHaveBeenCalledWith(KORE_RENDER_PREFERENCE, '0');
  expect(changes).toHaveBeenCalledOnce();
  expect(toggle.setEnabled(true)).toBe(true);
  expect(harness.canvas.style.display).toBe('block');
  expect(harness.GraphicsSettings.fpslimit).toBe(60);
  expect(harness.Renderer.frameLimit).toBe(60);
  expect(toggle.enabled).toBe(true);
});

test('a manual fps change made while hidden is not overwritten on restore', () => {
  const harness = renderPage();
  const toggle = createRenderToggle({ page: harness.page });
  toggle.setEnabled(false);
  harness.GraphicsSettings.fpslimit = 30;
  toggle.setEnabled(true);
  expect(harness.GraphicsSettings.fpslimit).toBe(30);
});

test('automatic power saving does not persist a preference', () => {
  const harness = renderPage();
  const toggle = createRenderToggle({ page: harness.page });
  toggle.setEnabled(false, { persist: false });
  expect(harness.sessionStorage.setItem).not.toHaveBeenCalled();
  expect(toggle.enabled).toBe(false);
});

test('stored preference applies without writing it back', () => {
  const harness = renderPage({ stored: '0' });
  const toggle = createRenderToggle({ page: harness.page });
  expect(toggle.applyPreference()).toBe(true);
  expect(toggle.enabled).toBe(false);
  expect(harness.sessionStorage.setItem).not.toHaveBeenCalled();
});

test('a second client window does not inherit power saving from the first', () => {
  const first = renderPage();
  const second = renderPage();
  const a = createRenderToggle({ page: first.page });
  const b = createRenderToggle({ page: second.page });
  expect(a.setEnabled(false)).toBe(true);
  expect(first.canvas.style.display).toBe('none');
  expect(sharedLocalStorage.has(KORE_RENDER_PREFERENCE)).toBe(false);
  expect(second.sessionStorage.getItem(KORE_RENDER_PREFERENCE)).toBe(null);
  expect(b.applyPreference()).toBe(true);
  expect(b.enabled).toBe(true);
  expect(second.canvas.style.display).toBe('block');
  expect(second.GraphicsSettings.fpslimit).toBe(60);
});
