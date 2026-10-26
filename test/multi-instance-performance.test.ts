// @vitest-environment jsdom
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';
import { patchRuntimeScrollbarObserverLifecycle } from '../scripts/lastro-ui-lifecycle.mjs';

const vendor = readVendorSource();
const frames: HTMLIFrameElement[] = [];
afterEach(() => {
  frames.splice(0).forEach(frame => frame.remove());
  vi.useRealTimers(); vi.restoreAllMocks();
});

function classMethod(source: string, region: string, className: string, name: string) {
  const text = extractVendorRegion(region, source);
  const file = ts.createSourceFile(region, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const found: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && ts.isClassExpression(node.parent)
      && node.parent.name?.text === className && node.name.getText(file) === name) found.push(node.getText(file));
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (found.length !== 1) throw new Error(`Expected one ${className}.${name}`);
  return found[0]!;
}

describe('background windows yield the GPU', () => {
  const renderer = extractRuntimeNode(vendor, { region: 'src/Renderer/Renderer.js', kind: 'class', name: 'Renderer' });
  const rendererFile = ts.createSourceFile('renderer.js', '(' + renderer + ')', ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let render = '';
  (function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(rendererFile) === '_render') render = node.getText(rendererFile);
    ts.forEachChild(node, visit);
  })(rendererFile);

  function rendererFixture(fpslimit: number, focused: boolean) {
    const scene = vi.fn();
    const context = vm.createContext({
      Date, console, document: { hasFocus: () => focused },
      SessionStorage_default: { Playing: true }, GraphicsSettings: { fpslimit },
      _requestAnimationFrame: vi.fn(), LastROAdvanceServerTick() {},
      Events: { process() {} }, Cursor: { render() {} },
    });
    vm.runInContext('Renderer=class {' + render + '};', context);
    Object.assign(context.Renderer, { frameLimit: fpslimit, _lastFrameTime: 0, tick: 1, renderCallbacks: [scene], gl: {} });
    // Drive one second of 1ms animation frames so the count equals the effective frame rate.
    for (let time = 1; time <= 1001; time++) context.Renderer._render(time);
    return { renderer: context.Renderer, frames: scene.mock.calls.length };
  }

  it('caps an unfocused window at 20fps without touching its configured limit', () => {
    const background = rendererFixture(60, false);
    expect(background.frames).toBe(20);
    expect(background.renderer.frameLimit).toBe(60);
    expect(rendererFixture(60, true).frames).toBe(60);
  });

  it('also caps unlimited fps and keeps lower limits such as power saving', () => {
    expect(rendererFixture(-1, false).frames).toBe(20);
    expect(rendererFixture(5, false).frames).toBe(5);
    // A focused unlimited window still renders every animation frame.
    expect(rendererFixture(-1, true).frames).toBe(1001);
  });
});

describe('main WebGL context', () => {
  it('is created without MSAA while keeping the screenshot buffer', () => {
    // Renderer.init() passes no parameters, so these defaults apply to every player.
    const getContext = vm.runInNewContext('(' + extractRuntimeNode(vendor, {
      region: 'src/Utils/WebGL.js', kind: 'function', name: 'getContext',
    }) + ')', { console }) as (canvas: object) => object;
    let options: Record<string, unknown> = {};
    getContext({ getContext: (_name: string, parameters: Record<string, unknown>) => { options = parameters; return {}; } });
    expect(options).toMatchObject({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  });
});

describe('custom scrollbars poll from one shared timer', () => {
  function scrollbarFixture() {
    const frame = document.createElement('iframe'); document.body.append(frame); frames.push(frame);
    const win = frame.contentWindow as Window & typeof globalThis, doc = win.document;
    const geometry = new Map<Element, { h: number; sh: number }>();
    const reads = { element: 0, track: 0 };
    Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { configurable: true, get(this: HTMLElement) {
      if (this.classList.contains('track')) { reads.track++; return 80; }
      if (geometry.has(this)) reads.element++;
      return geometry.get(this)?.h ?? 0;
    } });
    Object.defineProperty(win.HTMLElement.prototype, 'scrollHeight', { configurable: true, get(this: HTMLElement) {
      return geometry.get(this)?.sh ?? 0;
    } });
    const ticks: Array<() => void> = [];
    const setInterval = vi.fn((callback: () => void) => { ticks.push(callback); return ticks.length; });
    const clearInterval = vi.fn((id: number) => { ticks[id - 1] = () => {}; });
    const context = vm.createContext({ window: win, document: doc, ShadowRoot: win.ShadowRoot,
      getComputedStyle: win.getComputedStyle.bind(win), setTimeout: () => 0, setInterval, clearInterval });
    vm.runInContext('ScrollBar = ' + extractRuntimeNode(vendor, { region: 'src/UI/Scrollbar.js', kind: 'class', name: 'ScrollBar' }) + ';', context);
    const ScrollBar = context.ScrollBar;
    ScrollBar.complete = true; ScrollBar._cssText = '';
    ScrollBar.skins.default = { name: 'default', up: 'u', down: 'd', mid: 'm', thumb: 't', colors: {}, width: 13 };
    function mount() {
      const host = doc.createElement('div'); doc.body.append(host);
      const content = doc.createElement('div'); host.attachShadow({ mode: 'open' }).append(content);
      geometry.set(content, { h: 100, sh: 400 });
      ScrollBar.applyDOMScrollbar(content);
      return { host, content, thumb: content.querySelector<HTMLElement>('.thumb')!, geometry: geometry.get(content)! };
    }
    return { doc, ScrollBar, setInterval, clearInterval, reads, mount, tick() { ticks.at(-1)!(); } };
  }

  it('uses a single interval and stops it once every scrollbar is gone', () => {
    const f = scrollbarFixture();
    const windows = [f.mount(), f.mount(), f.mount()];
    expect(f.setInterval).toHaveBeenCalledTimes(1);
    expect(f.ScrollBar._pollers.size).toBe(3);
    windows.forEach(window => window.host.remove());
    f.tick();
    expect(f.ScrollBar._pollers.size).toBe(0);
    expect(f.clearInterval).toHaveBeenCalledOnce();
    expect(f.ScrollBar._pollTimer).toBeNull();
    f.mount();
    expect(f.setInterval).toHaveBeenCalledTimes(2);
  });

  it('only rewrites the thumb when size or scroll position changes', () => {
    const f = scrollbarFixture(), view = f.mount();
    expect(view.thumb.style.height).toBe('20px');
    const trackReads = f.reads.track;
    f.tick(); f.tick();
    expect(f.reads.track).toBe(trackReads);
    view.geometry.sh = 800; f.tick();
    expect(view.thumb.style.height).toBe('10px');
    view.content.scrollTop = 0; view.geometry.h = 400; view.geometry.sh = 300; f.tick();
    expect(view.content.querySelector<HTMLElement>('.ro-custom-scrollbar')!.style.display).toBe('none');
  });

  it('still restores its styles after another module moves the bar', () => {
    // NpcStore drag scrolling parks the bar at top:0 while measuring, then relies on updateThumb.
    const f = scrollbarFixture(), view = f.mount();
    const bar = view.content.querySelector<HTMLElement>('.ro-custom-scrollbar')!;
    expect(bar.style.top).toBe('0px');
    bar.style.top = '37px'; bar.style.height = '5px';
    f.tick();
    expect(bar.style.top).toBe('0px'); expect(bar.style.height).toBe('100px');
    view.content.style.paddingRight = '0px';
    f.tick();
    expect(view.content.style.paddingRight).toBe('13px');
  });

  it('skips hidden native windows and hidden pages, then resumes', () => {
    const f = scrollbarFixture(), view = f.mount();
    view.host.style.display = 'none';
    const before = f.reads.element;
    f.tick();
    expect(f.reads.element).toBe(before);
    view.host.style.display = '';
    Object.defineProperty(f.doc, 'hidden', { configurable: true, value: true });
    f.tick();
    expect(f.reads.element).toBe(before);
    Object.defineProperty(f.doc, 'hidden', { configurable: true, value: false });
    view.geometry.sh = 800; f.tick();
    expect(view.thumb.style.height).toBe('10px');
  });
});

describe('GUI scrollbar observer scans only what changed', () => {
  async function observerFixture() {
    vi.useFakeTimers();
    const source = classMethod(patchRuntimeScrollbarObserverLifecycle(vendor), 'src/UI/GUIComponent.js', 'GUIComponent', '_setupScrollbars');
    const styled: Element[] = [];
    const apply = vi.fn((node: HTMLElement & { _roScrollbarApplied?: boolean }) => { node._roScrollbarApplied = true; });
    const context = vm.createContext({ document, MutationObserver, setTimeout, clearTimeout,
      window: { getComputedStyle: (node: Element) => { styled.push(node); return window.getComputedStyle(node); } },
      _ScrollBar: { applyDOMScrollbar: apply } });
    vm.runInContext(`class GUIComponent { ${source} } globalThis.TestGui = GUIComponent;`, context);
    const host = document.createElement('div'); document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const titlebar = document.createElement('div'), wrapper = document.createElement('div');
    const container = document.createElement('section'), content = document.createElement('div');
    content.style.overflowY = 'auto';
    for (let index = 0; index < 50; index++) content.append(Object.assign(document.createElement('div'), { textContent: 'message ' + index }));
    container.append(content); wrapper.append(container); shadow.append(titlebar, wrapper);
    const component = Object.assign(new (context.TestGui as new () => { _setupScrollbars(): void })(), {
      _host: host, _shadow: shadow, _container: container, __active: true });
    component._setupScrollbars();
    await vi.advanceTimersByTimeAsync(600);
    expect(apply).toHaveBeenCalledWith(content);
    const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
    const reset = () => { styled.length = 0; apply.mockClear(); };
    reset();
    return { host, titlebar, wrapper, content, styled, apply, flush, reset };
  }

  it('checks only new chat lines and refreshes their scroll container', async () => {
    const f = await observerFixture();
    const line = document.createElement('div'); line.append(document.createElement('span'));
    f.content.append(line); await f.flush();
    expect(f.styled).toEqual([line, line.firstElementChild]);
    expect(f.apply.mock.calls.map(([node]) => node)).toEqual([f.content]);
    f.reset();
    f.content.lastElementChild!.textContent = 'updated'; await f.flush();
    expect(f.styled).toEqual([]);
    expect(f.apply.mock.calls.map(([node]) => node)).toEqual([f.content]);
    f.host.remove();
  });

  it('ignores outside chrome but rescans the window when an ancestor changes', async () => {
    const f = await observerFixture();
    f.titlebar.className = 'hover'; await f.flush();
    expect(f.styled).toHaveLength(0); expect(f.apply).not.toHaveBeenCalled();
    f.wrapper.className = 'compact'; await f.flush();
    expect(f.styled.length).toBeGreaterThan(50);
    expect(f.apply).toHaveBeenCalledWith(f.content);
    f.host.remove();
  });

  it('rescans the window when a stylesheet can change overflow anywhere', async () => {
    const f = await observerFixture();
    const panel = f.content.firstElementChild as HTMLElement;
    panel.className = 'detail-content';
    await f.flush(); f.reset();
    const style = document.createElement('style'); style.textContent = '.detail-content{overflow-y:auto}';
    f.titlebar.after(style); await f.flush();
    // jsdom does not cascade shadow stylesheets; assert the whole window was re-evaluated.
    expect(f.styled.length).toBeGreaterThan(50);
    expect(f.styled).toContain(panel);
    f.host.remove();
  });
});
