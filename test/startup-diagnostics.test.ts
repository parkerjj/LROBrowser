// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';

const html = readFileSync('index.html', 'utf8');
const script = readFileSync('public/startup-diagnostics.js', 'utf8');

type StartupApi = {
  phase(name: string): void;
  fail(reason: string, error?: unknown): void;
  ready(): void;
};

function harness() {
  const dom = new JSDOM(html, { url: 'https://iwa.invalid/', runScripts: 'outside-only' });
  const page = dom.window;
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
  return { dom, page, api, get, timers };
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
});
