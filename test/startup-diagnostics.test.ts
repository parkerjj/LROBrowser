// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';

const html = readFileSync('index.html', 'utf8');
const script = readFileSync('public/startup-diagnostics.js', 'utf8');

type StartupApi = {
  phase(name: string): void;
  fail(reason: string, error?: unknown): void;
  ready(): void;
};

function harness(options: { frames?: boolean } = {}) {
  const dom = new JSDOM(html, { url: 'https://iwa.invalid/', runScripts: 'outside-only' });
  const page = dom.window;
  const frameCallbacks: FrameRequestCallback[] = [];
  const focus = vi.fn();
  const resizeBy = vi.fn();
  let clock = 1_000_000;
  if (options.frames) {
    page.requestAnimationFrame = ((callback: FrameRequestCallback) => frameCallbacks.push(callback)) as typeof page.requestAnimationFrame;
    page.focus = focus;
    page.resizeBy = resizeBy;
    vi.spyOn(page.Date, 'now').mockImplementation(() => clock);
  }
  const timers = new Map<number, { delay: number; run: () => void }>();
  let next = 0;
  page.setTimeout = ((handler: () => void, delay: number) => {
    const id = ++next;
    timers.set(id, { delay, run: handler });
    return id;
  }) as typeof page.setTimeout;
  page.clearTimeout = ((id: number) => { timers.delete(id); }) as typeof page.clearTimeout;
  page.eval(script);
  page.document.dispatchEvent(new page.Event('DOMContentLoaded'));
  const api = (page as unknown as { LastROStartupDiagnostics: StartupApi }).LastROStartupDiagnostics;
  const get = (id: string) => page.document.getElementById(id)!;
  // Advance the page clock and run its 1s frame watchdog; `paint` lets rAF callbacks fire like a visible window.
  const advance = (ms: number, paint: boolean) => {
    clock += ms;
    if (paint) frameCallbacks.splice(0).forEach(callback => callback(clock));
    [...timers.entries()].filter(([, timer]) => timer.delay === 1000).forEach(([id, timer]) => { timers.delete(id); timer.run(); });
  };
  return { dom, page, api, get, timers, focus, resizeBy, advance, frameCallbacks };
}

describe('early standalone startup diagnostic', () => {
  it('gives actionable graphics guidance for an asynchronous WebGL failure', () => {
    const h = harness();
    h.page.dispatchEvent(new h.page.ErrorEvent('error', {
      error: new Error('WebGL::getContext() - WebGL2 is required but not available.'),
    }));
    expect(h.get('lastro-startup-help').hidden).toBe(false);
    expect(h.get('lastro-startup-help').textContent).toMatch(/图形加速|硬件加速/);
    expect(h.get('lastro-startup-help').textContent).toContain('显卡驱动');
    expect(h.get('lastro-startup-help').textContent).toContain('重启');
    h.dom.window.close();
  });

  it.each(['资源工作线程启动失败', '本地光标加载失败', '启动脚本加载失败'])('offers package recovery for %s', reason => {
    const h = harness();
    h.api.fail(reason, new Error('local package unavailable'));
    expect(h.get('lastro-startup-help').textContent).toContain('重新安装');
    expect(h.get('lastro-startup-help').textContent).toContain('诊断信息');
    h.dom.window.close();
  });

  it('keeps network advice when the background error stack mentions Online.js', () => {
    const h = harness();
    h.api.phase('加载启动背景与基础资料');
    const error = new Error('Failed to fetch');
    error.stack = 'TypeError: Failed to fetch\n    at load (https://iwa.invalid/runtime/Online.js:1:1)';
    h.api.fail('未处理的异步异常', error);
    expect(h.get('lastro-startup-help').textContent).toContain('检查网络');
    expect(h.get('lastro-startup-help').textContent).not.toContain('重新安装');
    h.dom.window.close();
  });

  it('explains how to handle a stalled Worker stage and ignores later errors after login', () => {
    const h = harness();
    h.api.phase('等待资源工作线程');
    [...h.timers.values()].find(timer => timer.delay === 60000)!.run();
    expect(h.get('lastro-startup-help').textContent).toContain('重新安装');
    h.api.ready();
    h.page.dispatchEvent(new h.page.ErrorEvent('error', { error: new Error('late error') }));
    expect(h.get('lastro-startup-screen').hidden).toBe(true);
    h.dom.window.close();
  });

  it('renders before app module startup and survives #app replacement', () => {
    const h = harness();
    expect(h.get('lastro-startup-screen').hidden).toBe(false);
    h.api.phase('加载游戏运行时 Online.js');
    h.get('app').replaceChildren();
    expect(h.get('lastro-startup-phase').textContent).toContain('Online.js');
    expect(h.get('lastro-startup-screen').isConnected).toBe(true);
    h.api.ready();
    expect(h.get('lastro-startup-screen').hidden).toBe(true);
    expect(h.timers.size).toBe(0);
    h.dom.window.close();
  });

  it('reports failures while keeping technical details and a copy control visible', () => {
    const h = harness();
    h.api.phase('读取核心资源清单');
    h.api.fail('客户端启动失败', new Error('Package resource failed (404): System/test.lua'));
    expect(h.get('lastro-startup-heading').textContent).toContain('异常');
    expect(h.get('lastro-startup-phase').textContent).toContain('资源清单');
    expect(h.get('lastro-startup-detail').textContent).toContain('Package resource failed');
    expect(h.get('lastro-startup-copy').hidden).toBe(false);
    h.dom.window.close();
  });

  it('reports a stalled phase without aborting the eventual successful login', () => {
    const h = harness();
    h.api.phase('等待游戏登录窗口');
    const warning = [...h.timers.values()].find(timer => timer.delay === 25000);
    expect(warning).toBeDefined();
    warning!.run();
    expect(h.get('lastro-startup-message').textContent).toContain('25 秒');
    expect(h.get('lastro-startup-copy').hidden).toBe(false);
    h.api.ready();
    expect(h.get('lastro-startup-screen').hidden).toBe(true);
    h.dom.window.close();
  });

  it('captures early JavaScript exceptions before importing main.ts', () => {
    const h = harness();
    const event = new h.page.ErrorEvent('error', { message: 'startup import failed', error: new Error('startup import failed') });
    h.page.dispatchEvent(event);
    expect(h.get('lastro-startup-message').textContent).toContain('JavaScript 运行异常');
    expect(h.get('lastro-startup-detail').textContent).toContain('startup import failed');
    h.dom.window.close();
  });

  it('never prints obvious credential tokens in error details', () => {
    const h = harness();
    h.api.fail('启动失败', 'Authorization: SECRET_VALUE');
    expect(h.get('lastro-startup-detail').textContent).not.toContain('SECRET_VALUE');
    h.dom.window.close();
  });

  it('nudges a window whose frames never start, then restores the title when frames resume', () => {
    const h = harness({ frames: true });
    const title = h.page.document.title;
    for (let i = 0; i < 2; i += 1) h.advance(1000, false);
    expect(h.focus).not.toHaveBeenCalled();
    h.advance(1000, false);
    expect(h.focus).toHaveBeenCalledTimes(1);
    expect(h.resizeBy).toHaveBeenCalledWith(-1, 0);
    expect(h.page.document.title).toContain('画面未刷新');
    [...h.timers.values()].find(timer => timer.delay === 120)!.run();
    expect(h.resizeBy).toHaveBeenLastCalledWith(1, 0);
    h.advance(1000, true);
    expect(h.page.document.title).toBe(title);
    h.advance(10_000, true);
    expect(h.focus).toHaveBeenCalledTimes(1);
    h.api.ready();
    expect([...h.timers.values()].some(timer => timer.delay === 1000)).toBe(false);
    h.dom.window.close();
  });

  it('does not nudge while frames are being produced', () => {
    const h = harness({ frames: true });
    for (let i = 0; i < 20; i += 1) h.advance(1000, true);
    expect(h.focus).not.toHaveBeenCalled();
    expect(h.resizeBy).not.toHaveBeenCalled();
    expect(h.page.document.title).not.toContain('画面未刷新');
    h.dom.window.close();
  });

  it('treats a long main-thread task as busy rather than stalled', () => {
    const h = harness({ frames: true });
    h.advance(9000, false);
    expect(h.focus).not.toHaveBeenCalled();
    h.dom.window.close();
  });

  it('gives up after a bounded number of nudges and restores the title on login', () => {
    const h = harness({ frames: true });
    for (let i = 0; i < 60; i += 1) h.advance(1000, false);
    expect(h.focus).toHaveBeenCalledTimes(5);
    expect(h.page.document.title).toContain('画面未刷新');
    h.api.ready();
    expect(h.page.document.title).not.toContain('画面未刷新');
    // Only the pending 1px window restores remain; they must still run after login.
    expect([...h.timers.values()].every(timer => timer.delay === 120)).toBe(true);
    [...h.timers.values()].forEach(timer => timer.run());
    expect(h.resizeBy).toHaveBeenLastCalledWith(1, 0);
    h.dom.window.close();
  });
});
