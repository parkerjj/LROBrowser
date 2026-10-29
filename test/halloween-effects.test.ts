// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HALLOWEEN_STORAGE_KEY, installHalloweenEffects, isHalloweenDate } from '../src/halloween/halloween-effects';

const initialHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
let controller: ReturnType<typeof installHalloweenEffects> | undefined;
const page = window as Window & { __LastRORenderer?: { Renderer: { canvas: HTMLCanvasElement } } };
const root = () => document.querySelector<HTMLElement>('.lastro-halloween-layer');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 30, 12, 0));
  window.localStorage.clear();
  document.body.replaceChildren();
  delete page.__LastRORenderer;
  delete globalThis.LastROHalloweenEffects;
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
afterEach(() => {
  controller?.destroy();
  controller = undefined;
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.body.replaceChildren();
  delete page.__LastRORenderer;
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

  it('creates only passive decorations, and attaches the filter to the native canvas when ready', () => {
    controller = installHalloweenEffects(window);
    expect(controller.seasonal).toBe(true);
    expect(controller.disabled).toBe(false);
    expect(document.body.classList.contains('lastro-halloween-active')).toBe(true);
    expect(root()?.style.pointerEvents).toBe(''); // CSS owns click-through.
    expect(root()?.getAttribute('aria-hidden')).toBe('true');
    expect(root()?.querySelectorAll('.lastro-halloween-flame')).toHaveLength(3);
    expect(root()?.querySelector('.lastro-halloween-pumpkin')?.getAttribute('src')).toBe('/halloween/pumpkin.svg');
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    page.__LastRORenderer = { Renderer: { canvas } };
    vi.advanceTimersByTime(1000);
    expect(canvas.classList.contains('lastro-halloween-canvas')).toBe(true);
    expect(root()?.querySelector('.lastro-halloween-ghost')?.getAttribute('src')).toBe('/halloween/ghost.svg');
  });

  it('disables every effect immediately, persists the choice, and restores it on uncheck', () => {
    const canvas = document.createElement('canvas');
    page.__LastRORenderer = { Renderer: { canvas } };
    controller = installHalloweenEffects(window);
    expect(canvas.classList.contains('lastro-halloween-canvas')).toBe(true);
    expect(controller.setDisabled(true)).toBe(true);
    expect(window.localStorage.getItem(HALLOWEEN_STORAGE_KEY)).toBe('1');
    expect(document.body.classList.contains('lastro-halloween-active')).toBe(false);
    expect(canvas.classList.contains('lastro-halloween-canvas')).toBe(false);
    expect(root()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    expect(controller.setDisabled(false)).toBe(true);
    expect(window.localStorage.getItem(HALLOWEEN_STORAGE_KEY)).toBe('0');
    expect(root()).not.toBeNull();
    expect(canvas.classList.contains('lastro-halloween-canvas')).toBe(true);
  });

  it('honors a saved opt-out and does not mount decorations outside the dates', () => {
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
    expect(vi.getTimerCount()).toBe(0);
  });

  it('spawns at most one ghost periodically, then releases all animation timers', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const canvas = document.createElement('canvas');
    page.__LastRORenderer = { Renderer: { canvas } };
    controller = installHalloweenEffects(window);
    const ghost = root()?.querySelector<HTMLImageElement>('.lastro-halloween-ghost')!;
    expect(ghost.hidden).toBe(true);
    vi.advanceTimersByTime(19_999);
    expect(ghost.hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(ghost.hidden).toBe(false);
    expect(ghost.classList.contains('is-visible')).toBe(true);
    vi.advanceTimersByTime(5500);
    expect(ghost.hidden).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    controller.destroy();
    expect(vi.getTimerCount()).toBe(0);
    expect(root()).toBeNull();
  });

  it('pauses the wandering ghost when hidden without affecting the date guard', () => {
    const canvas = document.createElement('canvas');
    page.__LastRORenderer = { Renderer: { canvas } };
    controller = installHalloweenEffects(window);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(1);
  });
});
