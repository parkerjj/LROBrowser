// @vitest-environment jsdom
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';
import { patchRuntimeScrollbarObserverLifecycle, patchRuntimeSameMapSignboardCleanup } from '../scripts/lastro-ui-lifecycle.mjs';

const native = readVendorSource();

function method(source: string, regionName: string, className: string, methodName: string) {
  const region = extractVendorRegion(regionName, source);
  const file = ts.createSourceFile(regionName, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const found: ts.MethodDeclaration[] = [];
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && ts.isClassExpression(node.parent)
      && node.parent.name?.text === className && node.name.getText(file) === methodName) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (found.length !== 1) throw new Error('Expected one native method ' + className + '.' + methodName);
  return found[0]!.getText(file);
}

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('repeated NPC GUI append does not accumulate MutationObservers', () => {
  it('keeps a single observer over 40 dialogue rounds and releases it between mounts', async () => {
    vi.useFakeTimers();
    const output = patchRuntimeScrollbarObserverLifecycle(native);
    const source = ['append', 'remove', '_setupScrollbars']
      .map(name => method(output, 'src/UI/GUIComponent.js', 'GUIComponent', name)).join('\n');
    const active = new Set<CountingObserver>();
    class CountingObserver {
      private registered = false;
      constructor(_callback: MutationCallback) {}
      observe() { this.registered = true; active.add(this); }
      disconnect() { this.registered = false; active.delete(this); }
    }
    const context = vm.createContext({
      document, window, Event, MutationObserver: CountingObserver, setTimeout, clearTimeout,
      MouseMode: { FREEZE: 2 }, Mouse: { intersect: true },
      SessionStorage_default: { FreezeUI: false }, _Cursor: null,
      _ScrollBar: { applyDOMScrollbar: vi.fn() },
    });
    vm.runInContext(`
      class GUIComponent {
        constructor() {
          this.name = 'NpcBox';
          this._host = document.createElement('div');
          this._shadow = this._host.attachShadow({mode:'open'});
          this._container = document.createElement('section');
          this._container.style.overflowY = 'auto';
          this._shadow.appendChild(this._container);
          this.__loaded = true;
          this.__active = false;
          this.__scrollbarObserver = null;
          this._keyHandler = null;
          this.mouseMode = 1;
        }
        _bindKeyDown() {}
        _unbindKeyDown() {}
        _fixPositionOverflow() {}
        focus() {}
        ${source}
      }
      globalThis.TestGuiComponent = GUIComponent;
    `, context);
    const component = new (context.TestGuiComponent as new () => {
      append(): void; remove(): void; _host: HTMLElement;
    })();
    try {
      // One NPC box receives multiple SAY_DIALOG and WAIT_DIALOG packets each round.
      for (let round = 0; round < 40; round++) {
        for (let page = 0; page < 8; page++) component.append();
        await vi.advanceTimersByTimeAsync(0);
        expect(active.size).toBe(1);
        component._host.shadowRoot!.querySelector('section')!.appendChild(document.createElement('p'));
      }
      component.remove();
      expect(active.size).toBe(0);
      await vi.advanceTimersByTimeAsync(600);
      expect(active.size).toBe(0);

      for (let round = 0; round < 40; round++) {
        component.append();
        await vi.advanceTimersByTimeAsync(0);
        expect(active.size).toBe(1);
        component.remove();
        expect(active.size).toBe(0);
      }
    } finally {
      component.remove();
      component._host.remove();
    }
  });

  it('cancels pending observer initialization when a GUI is removed before its timer fires', async () => {
    vi.useFakeTimers();
    const patched = patchRuntimeScrollbarObserverLifecycle(native);
    const gui = extractVendorRegion('src/UI/GUIComponent.js', patched);
    expect(gui).toContain('clearTimeout(this.__scrollbarSetupTimer)');
    expect(gui).toContain('this.__scrollbarGeneration !== generation');
    expect(gui).toContain('if (this.__scrollbarObserver || this.__scrollbarSetupTimer != null) return;');
    expect(gui).toContain('this.__scrollbarObserver.disconnect()');
  });
});

describe('signboard lifecycle on same-map instance transitions', () => {
  it('releases old signboards before every map-entry onLoad rebuild', () => {
    const patched = patchRuntimeSameMapSignboardCleanup(native);
    const setMap = method(patched, 'src/Renderer/MapRenderer.js', 'MapRenderer', 'setMap');
    const signboards: string[] = [];
    const events: string[] = [];
    const context = vm.createContext({
      MapControl: {}, SoundManager: { stop() {} }, Renderer: { stop() {}, getContext: () => ({}), render() {} },
      UIManager: { removeComponents() {} }, Cursor: { ACTION: { DEFAULT: 0 }, setType() {} },
      EntityManager: { free() { events.push('entities-free'); } },
      SignboardManager: { free() { events.push('signboards-free'); signboards.length = 0; }, add() { signboards.push('signboard'); } },
      Damage: { free() {} }, EffectManager: { free() {} },
      JoystickUI_default: { onRestore() {} }, Mouse: { intersect: true },
      Sky_default: { setUpCloudData() {} }, Background: { remove(callback: () => void) { callback(); } },
    });
    vm.runInContext(`
      function stripMapExtension(value) { return value.replace(/\\.[^.]*$/, ''); }
      class MapRenderer {
        static currentMap = 'instance.gat';
        static loading = false;
        static onLoad() { SignboardManager.add(); }
        ${setMap}
      }
      globalThis.TestMapRenderer = MapRenderer;
    `, context);
    const renderer = context.TestMapRenderer as { setMap(map: string): void };
    for (let i = 0; i < 40; i++) {
      renderer.setMap('instance.gat');
      expect(signboards).toHaveLength(1);
    }
    expect(events.filter(event => event === 'signboards-free')).toHaveLength(40);
    expect(events.slice(0, 2)).toEqual(['signboards-free', 'entities-free']);
  });

  it('fails closed when vendor anchors drift instead of silently shipping the leak', () => {
    expect(() => patchRuntimeScrollbarObserverLifecycle('//#region src/UI/GUIComponent.js\ninvalid\n//#endregion')).toThrow('anchor:ui-lifecycle:scrollbar-remove');
    expect(() => patchRuntimeSameMapSignboardCleanup('//#region src/Renderer/MapRenderer.js\ninvalid\n//#endregion')).toThrow('anchor:ui-lifecycle:same-map-signboards');
  });
});
