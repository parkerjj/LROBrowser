import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

function classesIn(source: string) {
  const file = ts.createSourceFile('Online.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const classes = new Map<string, string>();
  function visit(node: ts.Node) {
    if (ts.isClassExpression(node) && node.name) classes.set(node.name.text, node.getText(file));
    ts.forEachChild(node, visit);
  }
  visit(file);
  return classes;
}
const vendorClasses = classesIn(readFileSync('vendor/v2/Online.js', 'utf8'));
const runtime = readFileSync('generated/runtime/Online.js', 'utf8');
const runtimeClasses = classesIn(runtime);
const queueStart = runtime.indexOf('//#region src/Utils/Queue.js');
const queue = runtime.slice(queueStart, runtime.indexOf('//#endregion', queueStart));
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function cursorHarness(mode: 'normal' | 'download-failure' | 'parse-failure') {
  const failures: string[] = [];
  let ready = 0;
  const client = vm.runInNewContext(`(${vendorClasses.get('Client')})`);
  client.getFile = (_path: string, success: (bytes: ArrayBuffer) => void, failure?: (error: Error) => void) => {
    queueMicrotask(() => { if (mode === 'download-failure') failure?.(new Error('local file missing')); else success(new ArrayBuffer(1)); });
  };
  const context = vm.createContext({
    _sprite$2: null, _action$2: null, console: { error() {} },
    LastROStartupDiagnostics: { fail: (reason: string) => failures.push(reason) },
    Client: client,
    SPR: class { constructor() { if (mode === 'parse-failure') throw new Error('invalid sprite header'); } },
    ACT: class {}, MemoryManager: { remove() {} },
    bindMouseEvents() {}, preCompiledAnimations() {}, createSpriteSheet() {},
    onReady() { ready++; },
  });
  vm.runInContext(`var Cursor = ${vendorClasses.get('Cursor')}; Cursor.init(onReady);`, context);
  return { failures, ready: () => ready };
}

function engineHarness(rendererFails = false) {
  const failures: string[] = [];
  let filesLoaded = false;
  const workers: Worker[] = [];
  class Worker {
    listeners = new Map<string, (event: unknown) => void>();
    constructor() { workers.push(this); }
    addEventListener(type: string, listener: (event: unknown) => void) { this.listeners.set(type, listener); }
  }
  const context = vm.createContext({
    Worker, console: { info() {}, error() {} }, window: {}, createLastROWorkerScriptUrl: (path: string) => path,
    addAssistantAwareListener: (target: Worker, type: string, listener: (event: unknown) => void) => target.addEventListener(type, listener),
    LastROStartupDiagnostics: { phase() {}, fail: (reason: string) => failures.push(reason) },
    _memory$1: {}, _hook: {}, _uid$1: 0, _origin: [], _source: null, _thread_ready: false,
    ConsoleManager_default: { init() {}, toggle() {} }, Context: { checkSupport() {} },
    Renderer: { init() { if (rendererFails) throw new Error('WebGL2 unavailable'); } },
    loadFiles() { filesLoaded = true; }, onThreadError() {}, onThreadLog() {},
    __esmMin: (callback: () => void) => callback,
  });
  vm.runInContext(`${queue}; init_Queue(); var Thread = ${runtimeClasses.get('Thread')}; var GameEngine = ${runtimeClasses.get('GameEngine')}; GameEngine.init();`, context);
  return {
    failures, filesLoaded: () => filesLoaded,
    dispatch: (type: string, event: unknown) => workers[0]!.listeners.get(type)?.(event),
  };
}

describe('native startup failure propagation', () => {
  it('advances only after the local cursor has initialized', async () => {
    const h = cursorHarness('normal');
    await settle();
    expect(h.ready()).toBe(1);
    expect(h.failures).toEqual([]);
  });

  it.each(['download-failure', 'parse-failure'] as const)('reports cursor %s instead of silently leaving the queue pending', async mode => {
    const h = cursorHarness(mode);
    await settle();
    expect(h.ready()).toBe(0);
    expect(h.failures).toEqual(['本地光标加载失败']);
  });

  it('reports renderer failure delivered after GameEngine.init has returned', () => {
    const h = engineHarness(true);
    expect(() => h.dispatch('message', { data: { type: 'THREAD_READY' } })).not.toThrow();
    expect(h.failures).toEqual(['图形初始化失败']);
    expect(h.filesLoaded()).toBe(false);
  });

  it('continues startup after normal Worker readiness', () => {
    const h = engineHarness();
    h.dispatch('message', { data: { type: 'THREAD_READY' } });
    expect(h.filesLoaded()).toBe(true);
    expect(h.failures).toEqual([]);
  });

  it.each(['error', 'messageerror'])('reports resource Worker %s instead of waiting forever', type => {
    const h = engineHarness();
    h.dispatch(type, { message: 'worker failed' });
    expect(h.failures).toEqual(['资源工作线程启动失败']);
    expect(h.filesLoaded()).toBe(false);
  });
});
