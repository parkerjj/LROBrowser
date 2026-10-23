// @vitest-environment jsdom
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const native = readVendorSource();
const gui = extractRuntimeNode(native, { region: 'src/UI/GUIComponent.js', kind: 'class', name: 'GUIComponent' });
const manager = extractRuntimeNode(native, { region: 'src/UI/UIManager.js', kind: 'class', name: 'UIManager' });
const rendererFile = ts.createSourceFile('MapRenderer.js', extractVendorRegion('src/Renderer/MapRenderer.js'), ts.ScriptTarget.Latest, true);
let setMap = '';
function visit(node: ts.Node) {
  if (ts.isMethodDeclaration(node) && node.name.getText(rendererFile) === 'setMap') setMap = node.getText(rendererFile);
  ts.forEachChild(node, visit);
}
visit(rendererFile);
if (!setMap) throw new Error('Missing native MapRenderer.setMap');

afterEach(() => { document.body.replaceChildren(); });

function fixture() {
  const send = vi.fn();
  const session = { FreezeUI: false };
  const mouse = { intersect: true };
  const loads: string[] = [];
  const context = vm.createContext({
    document, window, Event, console,
    MouseMode: { STOP: 1, FREEZE: 2 }, Mouse: mouse, SessionStorage_default: session, _Cursor: null,
    _ensureDeps() {}, Common_default$1: '',
    __esmMin: (init: () => void) => init,
    init_Renderer() {}, init_UIManager() {}, init_GUIComponent() {}, init_Elements() {},
    Renderer: { width: 1024, height: 720, stop() {} }, SoundManager: { stop() {} }, BGM: { stop() {} },
    DB: { getMessage: () => '购买 / 出售' },
    Network: { sendPacket: send }, PACKET: { CZ: { ACK_SELECT_DEALTYPE: class {} } },
    Cursor: { ACTION: { DEFAULT: 0 }, setType() {} },
    stripMapExtension: (name: string) => name.replace(/\.[^.]*$/, ''),
    Background: { setLoading() { loads.push('loading'); } },
  });
  vm.runInContext(`
    var GUIComponent = ${gui};
    // Asset loading, scrolling and dragging are independent of popup ownership.
    for (const name of ['_processAllDataAttrs', '_createUIProxy', '_setupMouseMode', '_setupScrollbars', '_fixPositionOverflow', 'focus', 'draggable']) {
      GUIComponent.prototype[name] = function() {};
    }
    GUIComponent.processDataAttrs = function() {};
    var UIManager = ${manager};
    ${['html?raw', 'css?raw', 'js'].map(suffix => extractVendorRegion('src/UI/Components/WinPopup/WinPopup.' + suffix)).join('\n')}
    init_WinPopup$2(); init_WinPopup$1(); init_WinPopup();
    ${extractVendorRegion('src/Engine/MapEngine/NPC.js')}
    var MapRenderer = class MapRenderer {
      static loading = false;
      static currentMap = 'prontera.gat';
      ${setMap}
    };
  `.replaceAll('import.meta', '({})'), context);
  return {
    send, session, mouse, loads,
    open(id = 42) { vm.runInContext(`onDealSelection({NAID:${id}});`, context); },
    map() { vm.runInContext('MapRenderer.loading = false; MapRenderer.setMap(MapRenderer.currentMap === "prontera.gat" ? "geffen.gat" : "prontera.gat");', context); },
    registered() { return Object.keys((context.UIManager as { components: Record<string, unknown> }).components); },
    windows() { return [...document.body.children].filter(host => host.shadowRoot?.querySelector('#win_popup')); },
  };
}

describe('NPC buy/sell selection lifecycle during map loading', () => {
  it('clears every outstanding selection before the loading screen and releases its registry entry', () => {
    const f = fixture();
    const baseline = f.registered();
    for (let i = 0; i < 6; i++) f.open(42);
    expect(f.windows()).toHaveLength(6);
    f.map();
    expect(f.loads).toEqual(['loading']);
    expect(f.windows()).toHaveLength(0);
    expect(f.registered()).toEqual(baseline);
    expect(f.session.FreezeUI).toBe(false);
    expect(f.mouse.intersect).toBe(true);
    expect(f.send).not.toHaveBeenCalled();
  });

  it.each([['buy', 0], ['sell', 1]] as const)('opens again after a map change and sends %s to the new NPC', (button, type) => {
    const f = fixture();
    f.open(42); f.map(); f.open(99);
    const windows = f.windows();
    expect(windows).toHaveLength(1);
    expect(f.session.FreezeUI).toBe(true);
    windows[0]!.shadowRoot!.querySelector<HTMLButtonElement>(`button[data-background="btn_${button}.bmp"]`)!.click();
    expect(f.send).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ NAID: 99, type }));
    expect(f.windows()).toHaveLength(0);
    expect(f.registered()).toEqual(['WinPopup']);
  });

  it('releases cancelled selections across repeated open / cancel / map cycles', () => {
    const f = fixture();
    for (let i = 0; i < 20; i++) {
      f.open();
      f.windows()[0]!.shadowRoot!.querySelector<HTMLButtonElement>('button[data-background="btn_cancel.bmp"]')!.click();
      expect(f.registered()).toEqual(['WinPopup']);
      f.open(); f.map();
      expect(f.windows()).toHaveLength(0);
      expect(f.registered()).toEqual(['WinPopup']);
    }
    expect(f.send).not.toHaveBeenCalled();
  });
});
