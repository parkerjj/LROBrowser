import { expect, test, vi } from 'vitest';
import { createRenderToggle, KORE_RENDER_PREFERENCE } from '../src/kore/kore-render-toggle.mjs';

function renderPage({ stored = null as string | null, fpslimit = 60, display = 'block' } = {}) {
  const canvas = { style: { display } };
  const GraphicsSettings = { fpslimit };
  const Renderer = { canvas, frameLimit: fpslimit };
  const values = new Map<string, string>();
  if (stored != null) values.set(KORE_RENDER_PREFERENCE, stored);
  const localStorage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
  };
  return { page: { __LastRORenderer: { Renderer, GraphicsSettings }, localStorage }, canvas, GraphicsSettings, Renderer, localStorage };
}

test('unavailable renderer disables the toggle without writing preferences', () => {
  const setItem = vi.fn();
  const toggle = createRenderToggle({ page: { localStorage: { setItem } } });
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
  expect(harness.localStorage.setItem).toHaveBeenCalledWith(KORE_RENDER_PREFERENCE, '0');
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
  expect(harness.localStorage.setItem).not.toHaveBeenCalled();
  expect(toggle.enabled).toBe(false);
});

test('stored preference applies without writing it back', () => {
  const harness = renderPage({ stored: '0' });
  const toggle = createRenderToggle({ page: harness.page });
  expect(toggle.applyPreference()).toBe(true);
  expect(toggle.enabled).toBe(false);
  expect(harness.localStorage.setItem).not.toHaveBeenCalled();
});
