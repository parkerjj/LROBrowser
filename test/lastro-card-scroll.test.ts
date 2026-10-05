// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installLastroCardState } from '../scripts/lastro-card-state.mjs';
import type { LastroCardStateComponent } from '../scripts/lastro-card-state.mjs';
import { setLastROInnerHTML } from '../src/runtime/lastro-trusted-dom.mjs';

const library = readFileSync('vendor/v2/lastro-card-collection.mjs', 'utf8').replace(/^export /gm, '');
const nativeUI = readFileSync('vendor/v2/lastro-card-collection-ui.mjs', 'utf8').replace(/^export /gm, '');
const online = readFileSync('vendor/v2/Online.js', 'utf8').replace(/\r\n/g, '\n');
const scrollbarStart = online.indexOf('  ScrollBar = class ScrollBar {');
const scrollbarEnd = online.indexOf('\n});\n//#endregion', scrollbarStart);
const setupStart = online.indexOf('    _setupScrollbars() {');
const setupEnd = online.indexOf('\n    /**', setupStart);
if ([scrollbarStart, scrollbarEnd, setupStart, setupEnd].some(value => value < 0)) throw new Error('Missing native scrollbar source');
const nativeScrollbar = online.slice(scrollbarStart, scrollbarEnd);
const nativeSetup = online.slice(setupStart, setupEnd);
type ScrollBody = HTMLElement & { _roScrollbarApplied?: boolean; _roScrollHandler?: () => void };
type Component = LastroCardStateComponent & { render(): string; init(): void; onAppend(): void; onRemove(): void; switchTab(tab: number): void; };
type Dependencies = Parameters<typeof installLastroCardState>[1];

function fixture(patched = true) {
  vi.useFakeTimers();
  class GUIComponent {
    static MouseMode = { STOP: 1 };
    _host = document.createElement('div');
    _container = document.createElement('div');
    __scrollbarObserver?: MutationObserver;
    constructor() { this._host.append(this._container); }
    getRoot() { return this._container; }
  }
  const context = vm.createContext({ document, window, ShadowRoot, MutationObserver, getComputedStyle,
    setTimeout, clearTimeout, setInterval, clearInterval, GUIComponent });
  vm.runInContext(`var ScrollBar; ${nativeScrollbar}\n
    ScrollBar.complete = true; ScrollBar.skins.default = { name: 'default', width: 13, colors: { track: 'transparent', thumb: 'grey' } };
    var _ScrollBar = ScrollBar;
    var setup = (class { ${nativeSetup} }).prototype._setupScrollbars;
    ${library}\n${nativeUI}\n
    var component = createCardCollectionComponent({ GUIComponent, Network: { sendPacket() {} }, PACKET: { CZ: {} },
      DB: { INTERFACE_PATH: '', getItemInfo: id => ({ identifiedDisplayName: 'Card ' + id }) }, Client: { loadFile() {} },
      Configs: { get: () => 5 }, CARD_CONNECTION_TABS, getCardConnectionData, listCardEntries, getCardDeckOverview,
      getCardLevelCount, buildCardConnectionAction, applyCardConnectionUpdate, applyCardConnectionCancelUpdate,
      applyCardConnectionActivateUpdate, applyCardConnectionEnableUpdate });`, context);
  const component = context.component as Component & GUIComponent;
  if (patched) expect(installLastroCardState(component, {
    document,
    CARD_CONNECTION_TABS: vm.runInContext('CARD_CONNECTION_TABS', context) as Dependencies['CARD_CONNECTION_TABS'],
    listCardEntries: vm.runInContext('listCardEntries', context) as Dependencies['listCardEntries'],
    resolveCategoryCardAction: vm.runInContext('resolveCategoryCardAction', context) as Dependencies['resolveCategoryCardAction'],
  })).toBe(true);
  const root = component.getRoot()!; setLastROInnerHTML(root, component.render()); component.init();
  const body = root.querySelector<ScrollBody>('[data-body]')!;
  // jsdom has no layout; retain real native DOM/listeners and supply its viewport dimensions.
  Object.defineProperties(body, { clientHeight: { value: 200 }, scrollHeight: { value: 1600 } });
  body.style.overflowY = 'auto';
  const setup = context.setup as (this: GUIComponent) => void;
  const open = () => { document.body.append(component._host); component.onAppend(); setup.call(component); };
  const close = () => { component.onRemove(); component._host.remove(); component.__scrollbarObserver?.disconnect(); };
  const wheel = (deltaY = 100) => {
    const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true });
    body.dispatchEvent(event); return event;
  };
  return { component, body, root, open, close, wheel };
}

afterEach(() => { document.body.replaceChildren(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('card panel native scrollbar ownership', () => {
  it('reproduces anonymous wheel handler accumulation when native rerenders delete the scrollbar', async () => {
    const f = fixture(false); f.open(); await vi.advanceTimersByTimeAsync(0);
    f.wheel(); expect(f.body.scrollTop).toBe(20);
    for (let index = 0; index < 5; index++) { f.component.renderCards(); await vi.advanceTimersByTimeAsync(0); }
    f.body.scrollTop = 0; expect(f.wheel().defaultPrevented).toBe(true);
    expect(f.body.scrollTop).toBe(120);
    f.close();
  });

  it('keeps one native scrollbar and one 20px wheel step through repeated renders and category changes', async () => {
    const f = fixture(); f.open(); await vi.advanceTimersByTimeAsync(0);
    const wrapper = f.body.querySelector(':scope > .ro-custom-scrollbar'); expect(wrapper).not.toBeNull();
    for (let index = 0; index < 12; index++) {
      f.component.switchTab(index % 2); await vi.advanceTimersByTimeAsync(0);
      expect(f.body.querySelectorAll(':scope > .ro-custom-scrollbar')).toHaveLength(1);
      expect(f.body.querySelector(':scope > .ro-custom-scrollbar')).toBe(wrapper);
      expect(f.wheel().defaultPrevented).toBe(true); expect(f.body.scrollTop).toBe(20);
      f.wheel(-100); expect(f.body.scrollTop).toBe(0);
    }
    f.close();
  });

  it('retains the native wrapper and wheel listener when the same panel is closed and reopened', async () => {
    const f = fixture(); f.open(); await vi.advanceTimersByTimeAsync(500);
    const wrapper = f.body.querySelector(':scope > .ro-custom-scrollbar');
    for (let index = 0; index < 4; index++) {
      f.close(); await vi.advanceTimersByTimeAsync(300); f.open(); await vi.advanceTimersByTimeAsync(500);
      expect(f.body.querySelector(':scope > .ro-custom-scrollbar')).toBe(wrapper);
      f.wheel(); expect(f.body.scrollTop).toBe(20);
    }
    f.close();
  });
});
