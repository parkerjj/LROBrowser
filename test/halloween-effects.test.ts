// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HALLOWEEN_STORAGE_KEY, installHalloweenEffects, isHalloweenDate } from '../src/halloween/halloween-effects';

const initialHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
let controller: ReturnType<typeof installHalloweenEffects> | undefined;
const root = () => document.querySelector<HTMLElement>('.lastro-halloween-layer');
const halloweenCss = readFileSync('src/halloween/halloween.css', 'utf8');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 30, 12, 0));
  window.localStorage.clear();
  document.body.replaceChildren();
  delete globalThis.LastROHalloweenEffects;
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
afterEach(() => {
  controller?.destroy();
  controller = undefined;
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  window.localStorage.clear();
  document.body.replaceChildren();
  delete globalThis.LastROHalloweenEffects;
  if (initialHidden) Object.defineProperty(document, 'hidden', initialHidden);
  else Reflect.deleteProperty(document, 'hidden');
});

describe('Halloween local time and visual effects', () => {
  it('uses only local dates from October 30 through the end of November 1, 2026', () => {
    expect(isHalloweenDate(new Date(2026, 9, 29, 23, 59, 59))).toBe(false);
    expect(isHalloweenDate(new Date(2026, 9, 30, 0, 0, 0))).toBe(true);
    expect(isHalloweenDate(new Date(2026, 9, 31, 23, 59, 59))).toBe(true);
    expect(isHalloweenDate(new Date(2026, 10, 1, 23, 59, 59))).toBe(true);
    expect(isHalloweenDate(new Date(2026, 10, 2, 0, 0, 0))).toBe(false);
    expect(isHalloweenDate(new Date(2027, 9, 31, 12, 0))).toBe(false);
  });

  it('supports a development-only preview URL without changing the system clock', () => {
    const original = window.location.pathname + window.location.search + window.location.hash;
    try {
      vi.setSystemTime(new Date(2026, 9, 29, 12, 0));
      window.history.replaceState({}, '', '?halloween-preview=1');
      controller = installHalloweenEffects(window);
      expect(controller.seasonal).toBe(true);
      expect(root()).not.toBeNull();
    } finally {
      window.history.replaceState({}, '', original);
    }
  });

  it('ignores a saved IWA preview flag outside the seasonal dates', () => {
    vi.stubEnv('DEV', false);
    vi.setSystemTime(new Date(2026, 9, 29, 12, 0));
    window.history.replaceState({}, '', '/');
    window.localStorage.setItem('lastro-halloween-effects-preview-2026', '1');
    controller = installHalloweenEffects(window);
    expect(controller.seasonal).toBe(false);
    expect(root()).toBeNull();
  });

  it('does not preview in Vite development without the URL parameter', () => {
    vi.setSystemTime(new Date(2026, 9, 29, 12, 0));
    window.history.replaceState({}, '', '/');
    controller = installHalloweenEffects(window);
    expect(controller.seasonal).toBe(false);
    expect(root()).toBeNull();
  });

  it('ignores a saved preview flag outside the 2026 feature year', () => {
    vi.setSystemTime(new Date(2027, 9, 29, 12, 0));
    window.localStorage.setItem('lastro-halloween-effects-preview-2026', '1');
    controller = installHalloweenEffects(window);
    expect(controller.seasonal).toBe(false);
    expect(root()).toBeNull();
  });

  it('keeps the ghost and three wisps without creating a full-screen vignette', () => {
    controller = installHalloweenEffects(window);
    expect(controller.seasonal).toBe(true);
    expect(controller.disabled).toBe(false);
    expect(document.body.classList.contains('lastro-halloween-active')).toBe(false);
    expect(root()?.style.pointerEvents).toBe(''); // CSS owns click-through.
    expect(root()?.getAttribute('aria-hidden')).toBe('true');
    expect(root()?.querySelectorAll('.lastro-halloween-wisp')).toHaveLength(3);
    expect(root()?.querySelector('.lastro-halloween-ghost')).not.toBeNull();
    expect(root()?.querySelector('.lastro-halloween-vignette')).toBeNull();
    expect(root()?.querySelector('.lastro-halloween-ghost')?.hasAttribute('src')).toBe(false);
  });

  it('keeps ghost and wisp styles while removing the canvas filter and vignette CSS', () => {
    expect(halloweenCss).not.toContain('lastro-halloween-canvas');
    expect(halloweenCss).not.toContain('lastro-halloween-vignette');
    expect(halloweenCss).toContain('.lastro-halloween-wisp');
    expect(halloweenCss).toContain('.lastro-halloween-ghost');
  });

  it('randomizes each wisp path again after completing a drift cycle', () => {
    controller = installHalloweenEffects(window);
    const wisps = [...document.querySelectorAll<HTMLImageElement>('.lastro-halloween-wisp')];
    expect(wisps).toHaveLength(3);
    expect(wisps[0]!.style.getPropertyValue('--wisp-exit-x')).not.toBe('');

    vi.spyOn(Math, 'random').mockReturnValue(0);
    wisps[0]!.dispatchEvent(new Event('animationiteration'));

    expect(wisps[0]!.style.getPropertyValue('--wisp-exit-x')).toBe('-110vw');
    const duration = Number.parseInt(wisps[0]!.style.getPropertyValue('--wisp-duration'), 10);
    expect(duration).toBeGreaterThanOrEqual(22);
    expect(duration).toBeLessThanOrEqual(40);
  });

  it('disables every effect immediately, persists the choice, and restores it on uncheck', () => {
    controller = installHalloweenEffects(window);
    expect(controller.setDisabled(true)).toBe(true);
    expect(window.localStorage.getItem(HALLOWEEN_STORAGE_KEY)).toBe('1');
    expect(root()).toBeNull();
    vi.advanceTimersByTime(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(controller.setDisabled(false)).toBe(true);
    expect(window.localStorage.getItem(HALLOWEEN_STORAGE_KEY)).toBe('0');
    expect(root()).not.toBeNull();
  });

  it('honors a saved opt-out and does not mount decorations outside the dates', () => {
    vi.stubEnv('DEV', false);
    window.localStorage.setItem(HALLOWEEN_STORAGE_KEY, '1');
    controller = installHalloweenEffects(window);
    expect(controller.disabled).toBe(true);
    expect(root()).toBeNull();
    controller.destroy();
    vi.setSystemTime(new Date(2026, 10, 2, 0, 0));
    controller = installHalloweenEffects(window);
    expect(controller.seasonal).toBe(false);
    expect(controller.setDisabled(false)).toBe(true);
    expect(root()).toBeNull();
    vi.advanceTimersByTime(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows a game ghost after its sprite loads, then releases all animation timers', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    controller = installHalloweenEffects(window);
    controller.setMonsterPortraitLoader(async () => 'data:image/png;base64,AA==');
    await Promise.resolve();
    await Promise.resolve();
    const ghost = document.querySelector<HTMLImageElement>('.lastro-halloween-ghost')!;
    expect(ghost.hidden).toBe(true);
    ghost.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(349);
    expect(ghost.hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(ghost.hidden).toBe(false);
    expect(ghost.classList.contains('is-visible')).toBe(true);
    vi.advanceTimersByTime(8_000);
    expect(ghost.hidden).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    controller.destroy();
    expect(vi.getTimerCount()).toBe(0);
    expect(root()).toBeNull();
  });

  it('pauses the wandering ghost when hidden without affecting the date guard', async () => {
    controller = installHalloweenEffects(window);
    controller.setMonsterPortraitLoader(async () => 'data:image/png;base64,AA==');
    await Promise.resolve();
    await Promise.resolve();
    document.querySelector('.lastro-halloween-ghost')?.dispatchEvent(new Event('load'));
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(1);
  });
});
