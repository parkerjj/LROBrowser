// @vitest-environment jsdom
import vm from 'node:vm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, readVendorSource } from './helpers/vendor-runtime';

const source = readVendorSource();
const animation = extractRuntimeNode(source, { region: 'src/Utils/HtmlHelper.js', kind: 'function', name: 'animateElement' });
const transition = extractRuntimeNode(source, { region: 'src/UI/Background.js', kind: 'function', name: 'transition' });
const background = extractRuntimeNode(source, { region: 'src/UI/Background.js', kind: 'class', name: 'Background' });

function fixture() {
  const frames: FrameRequestCallback[] = [];
  const cover = document.createElement('div');
  const container = document.createElement('div');
  const canvas = document.createElement('canvas');
  const context = vm.createContext({
    document, setTimeout, clearTimeout,
    performance: { now: () => Date.now() },
    requestAnimationFrame: (callback: FrameRequestCallback) => frames.push(callback),
    _pixelProps: new Set(), _overlay: cover, _overlayAnim: null,
    _container: container, _canvas: canvas, _progress: -1,
    render$14() {}, Configs: { get: () => 500 },
    DB: { INTERFACE_PATH: 'data/texture/' },
    Client: { loadFile: (_path: string, loaded: (url: string) => void) => loaded('background.bmp') },
  });
  const api = vm.runInContext(`${animation}\n${transition}\nconst Background = ${background};
    ({ start: callback => Background.setImage('bgi_temp.bmp', callback), transition,
       stop: () => _overlayAnim.stop() });`, context) as {
    start(callback: () => void): void;
    transition(callback: () => void): void;
    stop(): void;
  };
  return {
    ...api, cover, container, canvas,
    paint() { frames.splice(0).forEach(callback => callback(Date.now())); },
  };
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(0); });
afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });

describe('native startup background without animation frames', () => {
  it('continues initialisation and removes the cover even if Chrome never delivers a frame', () => {
    const f = fixture();
    let continued = 0;
    f.start(() => { continued++; });
    expect(continued).toBe(0);
    vi.advanceTimersByTime(1000);
    expect(continued).toBe(1);
    expect(f.container.isConnected).toBe(true);
    expect(f.canvas.isConnected).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(f.cover.isConnected).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    f.paint();
    expect(continued).toBe(1);
    expect(f.cover.isConnected).toBe(false);
  });

  it('preserves normal fading and does not call initialisation again when the fallback would expire', () => {
    const f = fixture();
    let continued = 0;
    f.start(() => { continued++; });
    vi.advanceTimersByTime(250); f.paint();
    expect(continued).toBe(0);
    expect(Number(f.cover.style.opacity)).toBeGreaterThan(0);
    expect(Number(f.cover.style.opacity)).toBeLessThan(1);
    vi.advanceTimersByTime(250); f.paint();
    expect(continued).toBe(1);
    expect(f.cover.style.opacity).toBe('1');
    vi.advanceTimersByTime(500); f.paint();
    expect(f.cover.isConnected).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(2000); f.paint();
    expect(continued).toBe(1);
  });

  it('ignores late frames when a partially drawn transition has already timed out', () => {
    const f = fixture();
    let continued = 0;
    f.start(() => { continued++; });
    vi.advanceTimersByTime(250); f.paint();
    vi.advanceTimersByTime(750);
    expect(continued).toBe(1);
    f.paint();
    expect(continued).toBe(1);
    vi.advanceTimersByTime(1000); f.paint();
    expect(f.cover.isConnected).toBe(false);
    expect(continued).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels the previous fallback when another background transition replaces it', () => {
    const f = fixture();
    let old = 0, current = 0;
    f.start(() => { old++; });
    vi.advanceTimersByTime(300);
    f.transition(() => { current++; });
    vi.advanceTimersByTime(2000); f.paint();
    expect(old).toBe(0);
    expect(current).toBe(1);
    expect(f.cover.isConnected).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves a new transition started by the initialisation callback', () => {
    const f = fixture();
    let next = 0;
    f.start(() => f.transition(() => { next++; }));
    vi.advanceTimersByTime(1000);
    expect(next).toBe(0);
    vi.advanceTimersByTime(1000); f.paint();
    expect(next).toBe(1);
    expect(f.cover.isConnected).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
