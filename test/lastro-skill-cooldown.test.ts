// @vitest-environment jsdom
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const path = 'src/UI/Components/ShortCut/ShortCut.js';
const source = readVendorSource();
const native = extractVendorRegion(path, source).replace(/\r\n/g, '\n');
const lastroUiWindowAppend = vm.runInNewContext(`${extractRuntimeNode(source, {
  kind: 'function', name: 'lastroUiWindowAppend',
})}\nlastroUiWindowAppend`) as (...args: unknown[]) => unknown;
function parse(text: string) {
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
}
function nodeText(text: string, predicate: (node: ts.Node) => boolean) {
  const file = parse(text), found: ts.Node[] = [];
  function visit(node: ts.Node) {
    if (predicate(node)) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (found.length !== 1) throw new Error('Missing or ambiguous native shortcut node');
  return found[0]!.getText(file);
}
const methods = ['onAppend', 'onRemove', 'clean', 'setSkillDelay', 'setGlobalSkillDelay'];
function method(text: string, name: string) {
  return nodeText(text, node => ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)
    && node.expression.left.getText() === 'ShortCut.' + name);
}
function runnable(text: string) {
  return nodeText(text, node => ts.isFunctionDeclaration(node) && node.name?.text === 'setDelayOnIndex')
    + '\n' + methods.map(name => method(text, name)).join('\n');
}
const programs = new Map([[native, runnable(native)]]);
const disposals: (() => void)[] = [];
interface Slot { isSkill: boolean; ID: number; Delay?: number; _lastroCooldownDuration?: number }
function fixture(text = native) {
  let clock = 1000, sequence = 0;
  const pending = new Map<number, () => void>(), background = new WeakMap<HTMLElement, string>();
  const createElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
    const node = createElement(tagName, options);
    // jsdom does not parse conic gradients; capture the real native CSS assignment.
    Object.defineProperty(node.style, 'background', {
      configurable: true, get: () => background.get(node) || '',
      set: (value: string) => { background.set(node, value); },
    });
    return node;
  });
  const host = document.createElement('div'), root = document.createElement('div');
  host.append(root); document.body.append(host);
  const list: Slot[] = [{ isSkill: true, ID: 10 }, { isSkill: true, ID: 20 }, { isSkill: false, ID: 30 }];
  for (let index = 0; index < list.length; index++) {
    const slot = document.createElement('div'); slot.className = 'container'; slot.dataset.index = String(index);
    const icon = document.createElement('div'); icon.className = 'icon';
    const image = document.createElement('div'); image.className = 'img';
    icon.append(image); slot.append(icon); root.append(slot);
  }
  host.style.height = '34px'; host.style.top = '0px'; host.style.left = '0px';
  const shortcut = { _host: host, magnet: {}, getRoot: () => root };
  const renderer = { tick: 1000, width: 800, height: 600 };
  const cancel = vi.fn((id: number) => { pending.delete(id); });
  const context = vm.createContext({
    ShortCut: shortcut, _list$1: list, _activeAnimations: new Map(), document, Renderer: renderer, lastroUiWindowAppend,
    Date: { now: () => clock },
    requestAnimationFrame: (callback: () => void) => { pending.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: cancel,
    _preferences$19: { x: 0, y: 0, size: 1, save: vi.fn() },
    Controller$4: { getUI: () => ({}) }, onUpdateSkill: vi.fn(), updateEmptySlotTooltips: vi.fn(),
  });
  vm.runInContext(programs.get(text) ?? runnable(text), context);
  disposals.push(() => { vm.runInContext('ShortCut._lastroWindowState?.dispose();', context); });
  return {
    list, pending, renderer, root, cancel,
    overlay: (index = 0) => root.querySelector<HTMLElement>(`.container[data-index="${index}"] .cooldown-overlay`),
    background: (index = 0) => background.get(root.querySelector<HTMLElement>(`.container[data-index="${index}"] .cooldown-overlay`)!) || '',
    degrees: (index = 0) => Number(/transparent 0deg, transparent ([\d.]+)deg/.exec(background.get(root.querySelector<HTMLElement>(`.container[data-index="${index}"] .cooldown-overlay`)!) || '')?.[1]),
    now: (value: number) => { clock = value; },
    frame: () => { for (const [id, callback] of [...pending]) { pending.delete(id); callback(); } },
    delay: (id: number, duration: number) => { context.args = [id, duration]; vm.runInContext('ShortCut.setSkillDelay(...args);', context); },
    global: (duration: number) => { context.duration = duration; vm.runInContext('ShortCut.setGlobalSkillDelay(duration);', context); },
    remove: () => { vm.runInContext('ShortCut.onRemove();', context); host.remove(); },
    append: () => { document.body.append(host); vm.runInContext('ShortCut.onAppend();', context); },
    clean: () => { vm.runInContext('ShortCut.clean();', context); },
  };
}
afterEach(() => { for (const dispose of disposals.splice(0)) dispose(); vi.restoreAllMocks(); document.body.replaceChildren(); });

describe('native shortcut cooldown lifetime across map loading', () => {
  it('resumes remaining time and original progress without extending the deadline', () => {
    const f = fixture(); f.delay(10, 5000); f.now(2000); f.frame();
    expect(f.degrees()).toBeCloseTo(72); f.remove();
    f.now(3000); f.append(); expect(f.pending.size).toBe(1);
    expect(f.list[0]).toMatchObject({ Delay: 6000, _lastroCooldownDuration: 5000 });
    f.frame(); expect(f.degrees()).toBeCloseTo(144);
    f.now(6000); f.frame(); expect(f.overlay()).toBeNull(); expect(f.list[0]!.Delay).toBe(0); expect(f.pending.size).toBe(0);
  });

  it.each([6000, 8000])('immediately clears an expired overlay on append at %i ms, before a render frame', reopened => {
    const f = fixture(); f.delay(10, 5000); f.remove(); f.now(reopened); f.append();
    expect(f.renderer.tick).toBe(1000); expect(f.overlay()).toBeNull(); expect(f.pending.size).toBe(0);
    expect(f.list[0]).toMatchObject({ Delay: 0, _lastroCooldownDuration: 0 });
  });

  it('uses wall time both when receiving a delay and refreshing with a frozen Renderer.tick', () => {
    const f = fixture(); f.renderer.tick = 0; f.delay(10, 5000);
    expect(f.list[0]!.Delay).toBe(6000); f.now(2000); f.frame();
    expect(f.degrees()).toBeCloseTo(72); f.now(6000); f.frame();
    expect(f.overlay()).toBeNull(); expect(f.pending.size).toBe(0); expect(f.renderer.tick).toBe(0);
  });

  it('survives repeated remove and append with one callback and the original deadline', () => {
    const f = fixture(); f.delay(10, 10000);
    for (const clock of [2000, 4000, 7000]) {
      f.remove(); expect(f.pending.size).toBe(0); f.now(clock); f.append(); f.frame();
      expect(f.pending.size).toBe(1); expect(f.list[0]).toMatchObject({ Delay: 11000, _lastroCooldownDuration: 10000 });
    }
    expect(f.degrees()).toBeCloseTo(216);
    f.remove(); f.now(12000); f.append(); expect(f.overlay()).toBeNull(); expect(f.pending.size).toBe(0);
  });

  it('keeps native global and per-skill maximum merging, including equal deadlines', () => {
    const f = fixture(); f.delay(10, 5000); const pending = [...f.pending.keys()];
    f.delay(10, 2000); f.delay(10, 5000); f.global(2000);
    expect(f.list[0]).toMatchObject({ Delay: 6000, _lastroCooldownDuration: 5000 });
    expect([...f.pending.keys()][0]).toBe(pending[0]);
    expect(f.list[1]).toMatchObject({ Delay: 3000, _lastroCooldownDuration: 2000 });
    expect(f.list[2]!.Delay).toBeUndefined();
    f.delay(20, 4000); expect(f.list[1]!.Delay).toBe(5000);
    f.global(7000); expect(f.list.slice(0, 2).map(slot => slot.Delay)).toEqual([8000, 8000]);
    f.remove(); f.now(3000); f.append(); f.frame();
    expect(f.list.slice(0, 2).map(slot => slot.Delay)).toEqual([8000, 8000]); expect(f.pending.size).toBe(2);
  });

  it('keeps the existing behavior for a shorter server update rather than expanding this repair', () => {
    const f = fixture(); f.delay(10, 5000); f.delay(10, 0);
    expect(f.list[0]!.Delay).toBe(6000); expect(f.pending.size).toBe(1);
  });

  it('new cooldown after expiry replaces duration and keeps normal two-argument packet handlers', () => {
    const f = fixture(); f.delay(10, 5000); f.now(8000); f.delay(10, 1000);
    expect(f.list[0]).toMatchObject({ Delay: 9000, _lastroCooldownDuration: 1000 });
    expect(f.root.querySelectorAll('.cooldown-overlay')).toHaveLength(1); expect(f.pending.size).toBe(1);
    f.now(8500); f.frame(); expect(f.degrees()).toBeCloseTo(180);
  });

  it.each([false, true])('clean clears all state and prevents residual cooldowns after append (removed=%s)', removed => {
    const f = fixture(); f.global(5000); if (removed) f.remove(); f.clean(); f.now(8000); f.append();
    expect(f.list).toHaveLength(0); expect(f.pending.size).toBe(0); expect(f.overlay()).toBeNull();
    expect(f.root.querySelectorAll('.container .icon')).toHaveLength(0);
  });

  it('onRemove still cancels all native cooldown animation callbacks', () => {
    const f = fixture(); f.global(5000); f.remove();
    expect(f.cancel).toHaveBeenCalledTimes(2); expect(f.pending.size).toBe(0);
    expect(f.list.slice(0, 2).map(slot => slot.Delay)).toEqual([6000, 6000]);
  });

  it('repeated append replaces the callback without duplicate animations or changing progress', () => {
    const f = fixture(); f.delay(10, 5000); f.now(3000); f.append(); f.append(); f.frame();
    expect(f.pending.size).toBe(1); expect(f.root.querySelectorAll('.cooldown-overlay')).toHaveLength(1);
    expect(f.list[0]).toMatchObject({ Delay: 6000, _lastroCooldownDuration: 5000 }); expect(f.degrees()).toBeCloseTo(144);
  });

  it('clears an expired cached deadline even if its container is absent', () => {
    const f = fixture(); f.delay(10, 5000); f.root.querySelector('.container[data-index="0"]')!.remove();
    f.now(8000); f.append(); expect(f.list[0]).toMatchObject({ Delay: 0, _lastroCooldownDuration: 0 });
    expect(f.pending.size).toBe(0);
  });

  it('retains a live deadline if its container is temporarily absent', () => {
    const f = fixture(); f.delay(10, 5000); f.remove(); const slot = f.root.querySelector('.container[data-index="0"]')!;
    slot.remove(); f.now(3000); f.append(); expect(f.pending.size).toBe(0);
    expect(f.list[0]).toMatchObject({ Delay: 6000, _lastroCooldownDuration: 5000 });
    f.root.append(slot); f.append(); f.frame(); expect(f.pending.size).toBe(1); expect(f.degrees()).toBeCloseTo(144);
  });

  it('resumes inside the real UI-state append wrapper after permanent migration', () => {
    const append = method(native, 'onAppend');
    expect(append).toContain('lastroUiWindowAppend');
    expect(append).toContain('setDelayOnIndex(index, element._lastroCooldownDuration, true)');
    const f = fixture(native); f.append(); f.delay(10, 5000); f.remove(); f.now(3000); f.append(); f.frame();
    expect(f.pending.size).toBe(1); expect(f.list[0]!.Delay).toBe(6000); expect(f.degrees()).toBeCloseTo(144);
    f.remove(); f.now(8000); f.append(); expect(f.overlay()).toBeNull(); expect(f.pending.size).toBe(0);
  });
});
