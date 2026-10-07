// @vitest-environment jsdom
import vm from 'node:vm';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const vendor = readVendorSource();
const frames: HTMLIFrameElement[] = [];
afterEach(() => { frames.splice(0).forEach(frame => frame.remove()); });

function cursorFixture() {
  const frame = document.createElement('iframe'); document.body.append(frame); frames.push(frame);
  const win = frame.contentWindow as Window & typeof globalThis, doc = win.document;
  const mouse = { screen: { x: 0, y: 0, width: 800, height: 600 } };
  const controls = { snap: true, itemsnap: true, joySense: 25 };
  const settings = { cursor: true, fpslimit: 30 };
  const movement = { held: false };
  let over: { objecttype: number; boundingRect: { x1: number; x2: number; y1: number; y2: number } } | null = null;
  const context = vm.createContext({ window: win, document: doc, Date, console,
    __exportAll: (value: unknown) => value, __esmMin: (fn: () => void) => fn,
    Mouse: mouse, Controls_default: controls, GraphicsSettings: settings,
    MapControl: { _lastroMovementInput: { isHeld: () => movement.held } },
    Entity: { TYPE_MOB: 1, TYPE_ITEM: 2 }, EntityManager: { getOverEntity: () => over },
    installLastroItemDrag() {},
  });
  const source = extractVendorRegion('src/UI/CursorManager.js', vendor);
  for (const match of source.matchAll(/\b(init_[\w$]+)\(\);/g)) context[match[1]!] = () => {};
  vm.runInContext(source + '\ninit_CursorManager();\n'
    + '_compiledStyle=["fixture"]; _action$2={actions:[{delay:100,animations:[{compiledStyleIndex:0}]}]};'
    + 'bindMouseEvents();', context);
  const pointer = doc.querySelector<HTMLElement>('.cursor')!;
  const sprite = doc.createElement('img'); sprite.className = 'cursor__sprite'; pointer.append(sprite);
  return { context, mouse, controls, settings, movement, pointer, sprite,
    move(x: number, y: number) {
      win.dispatchEvent(new win.MouseEvent('pointermove', { clientX: x, clientY: y }));
      mouse.screen.x = x; mouse.screen.y = y;
    },
    hover(type: number) { over = { objecttype: type, boundingRect: { x1: 200, x2: 240, y1: 100, y2: 140 } }; },
    render() { context.Cursor.render(Date.now()); },
  };
}

describe('native game cursor', () => {
  it('keeps the movement cursor and pointer position over clickable signs and entities while held', () => {
    const h = cursorFixture(), button = h.pointer.ownerDocument.createElement('button');
    h.pointer.ownerDocument.body.append(button);
    h.movement.held = true; h.move(320, 240); h.hover(1);
    button.dispatchEvent(new h.context.window.MouseEvent('mouseover', { bubbles: true }));
    expect(h.context.Cursor.getActualType()).toBe(h.context.Cursor.ACTION.DEFAULT);
    for (const type of ['TALK', 'ATTACK', 'PICK', 'TARGET']) {
      h.context.Cursor.setType(h.context.Cursor.ACTION[type]);
      expect(h.context.Cursor.getActualType()).toBe(h.context.Cursor.ACTION.DEFAULT);
    }
    h.render(); expect(h.pointer.style.transform).toBe('translate(0px, 0px)');
    h.movement.held = false;
    button.dispatchEvent(new h.context.window.MouseEvent('mouseover', { bubbles: true }));
    expect(h.context.Cursor.getActualType()).toBe(h.context.Cursor.ACTION.CLICK);
    h.context.Cursor.setType(h.context.Cursor.ACTION.DEFAULT); h.render();
    expect(h.pointer.style.transform).toBe('translate(-100px, -120px)');
  });

  it('samples mouse coordinates before a sign can swallow the bubbling mousemove', () => {
    const h = cursorFixture(), win = h.context.window as Window & typeof globalThis;
    const source = extractVendorRegion('src/Controls/MouseEventHandler.js', vendor);
    vm.runInContext(source + '\ninit_MouseEventHandler();', h.context);
    const button = win.document.createElement('button'); win.document.body.append(button);
    button.addEventListener('mousemove', event => event.stopImmediatePropagation());
    button.dispatchEvent(new win.MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 200, buttons: 1 }));
    expect(h.context.Mouse.screen).toMatchObject({ x: 300, y: 200 });
  });

  it('restores a pending skill target cursor after releasing held movement', () => {
    const h = cursorFixture(), cursor = h.context.Cursor;
    Object.assign(h.context, {
      SkillTargetSelection: { TYPE: { PLACE: 2, FRIEND: 4 } },
      SessionStorage_default: { TouchTargeting: false }, SkillInfo: { 7: { SkillName: 'fixture' } },
      renderText() {}, renderLevel() {}, _skillName: {}, _skillLevel: {},
    });
    Object.assign(h.mouse, { state: 0, MOUSE_STATE: { USESKILL: 2 } });
    h.context.EntityManager.setSupportPicking = vi.fn();
    vm.runInContext(extractRuntimeNode(vendor, {
      region: 'src/UI/Components/SkillTargetSelection/SkillTargetSelection.js', kind: 'assignment', name: 'SkillTargetSelection.set',
    }), h.context);
    h.context._action$2.actions[cursor.ACTION.NOWALK] = { delay: 100, animations: [{ compiledStyleIndex: 2 }] };
    h.context._action$2.actions[cursor.ACTION.TARGET] = { delay: 100, animations: [{ compiledStyleIndex: 1 }] };
    h.movement.held = true;
    h.context.SkillTargetSelection.set({ SKID: 7, level: 1 }, 2);
    expect(h.context.Mouse.state).toBe(2); expect(cursor.freeze).toBe(true);
    cursor.setType(cursor.ACTION.NOWALK);
    expect(cursor.getActualType()).toBe(cursor.ACTION.NOWALK);
    h.render(); expect(h.sprite.style.left).toBe('-100px');
    h.movement.held = false;
    expect(cursor.getActualType()).toBe(cursor.ACTION.TARGET);
    h.render(); expect(h.sprite.style.left).toBe('-50px');
    cursor.setType(cursor.ACTION.CLICK);
    expect(cursor.getActualType()).toBe(cursor.ACTION.TARGET);
    cursor.freeze = false; cursor.setType(cursor.ACTION.DEFAULT);
    expect(cursor.getActualType()).toBe(cursor.ACTION.DEFAULT);
  });

  it('moves using an independent translation even when the scene skips a frame', () => {
    const h = cursorFixture();
    const renderer = extractRuntimeNode(vendor, { region: 'src/Renderer/Renderer.js', kind: 'class', name: 'Renderer' });
    const file = ts.createSourceFile('renderer.js', '(' + renderer + ')', ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    let method = '';
    function visit(node: ts.Node) {
      if (ts.isMethodDeclaration(node) && node.name.getText(file) === '_render') method = node.getText(file);
      ts.forEachChild(node, visit);
    }
    visit(file);
    expect(method).not.toBe('');
    h.context.SessionStorage_default = { Playing: true };
    h.context._requestAnimationFrame = vi.fn();
    vm.runInContext('Renderer=class {' + method + '};', h.context);
    const scene = vi.fn();
    Object.assign(h.context.Renderer, { frameLimit: 30, _lastFrameTime: 100, tick: 1, renderCallbacks: [scene] });
    h.context.Renderer._render(116);
    expect(scene).not.toHaveBeenCalled();
    h.pointer.style.transform = 'translate(-20px, -28px)';
    h.move(320, 240);
    expect(h.pointer.style.translate).toBe('320px 240px');
    expect(h.pointer.style.left).toBe(''); expect(h.pointer.style.top).toBe('');
    expect(h.pointer.style.transform).toBe('translate(-20px, -28px)');
    expect(h.context.Cursor.x).toBe(320); expect(h.context.Cursor.y).toBe(240);
  });

  it.each([1, 2])('preserves target centering from either side for entity type %s', type => {
    const h = cursorFixture(); h.hover(type);
    h.move(320, 240); h.render();
    expect(h.pointer.style.transform).toBe('translate(-100px, -120px)');
    h.move(180, 80); h.render();
    expect(h.pointer.style.transform).toBe('translate(40px, 40px)');
    expect(h.pointer.style.translate).toBe('180px 80px');
  });

  it('honors independent monster/item switches and suppresses snapping while targeting', () => {
    const h = cursorFixture(); h.move(320, 240); h.hover(1);
    h.controls.snap = false; h.render();
    expect(h.pointer.style.transform).toBe('translate(0px, 0px)');
    h.hover(2); h.render();
    expect(h.pointer.style.transform).toBe('translate(-100px, -120px)');
    h.controls.itemsnap = false; h.render();
    expect(h.pointer.style.transform).toBe('translate(0px, 0px)');
    h.controls.snap = true; h.hover(1); h.context.Cursor.blockMagnetism = true; h.render();
    expect(h.pointer.style.transform).toBe('translate(0px, 0px)');
  });

  it('moves the virtual gamepad cursor with the same translation', () => {
    const h = cursorFixture();
    h.context.Renderer = { width: 800, height: 600 };
    const move = vm.runInContext('(' + extractRuntimeNode(vendor, {
      region: 'src/UI/Components/JoystickUI/JoystickMouseCursorAdapter.js', kind: 'function', name: 'move',
    }) + ')', h.context) as (x: number, y: number) => void;
    move(2, 3);
    expect(h.pointer.style.translate).toBe('50px 75px');
    expect(h.pointer.style.left).toBe(''); expect(h.pointer.style.top).toBe('');
  });
});

describe('cursor snap preferences', () => {
  it.each([undefined, { snap: false, itemsnap: false, _version: 1 }])('enables new defaults while preserving stored settings %j', stored => {
    const frame = document.createElement('iframe'); document.body.append(frame); frames.push(frame);
    const win = frame.contentWindow!;
    if (stored) win.localStorage.setItem('Controls', JSON.stringify(stored));
    const context = vm.createContext({ localStorage: win.localStorage, __esmMin: (fn: () => void) => fn });
    vm.runInContext(extractVendorRegion('src/Core/Preferences.js', vendor)
      + extractVendorRegion('src/Preferences/Controls.js', vendor) + '\ninit_Controls();', context);
    expect(context.Controls_default.snap).toBe(stored?.snap ?? true);
    expect(context.Controls_default.itemsnap).toBe(stored?.itemsnap ?? true);
  });
});

it('uses the same system cursor and independent snap settings in the startup preferences', () => {
  const root = document.createElement('div');
  root.innerHTML = '<select class="screensize"><option value="full">Full</option></select>'
    + '<input class="quality"><input class="cursor" type="checkbox">'
    + '<input class="monster-snap" type="checkbox"><input class="item-snap" type="checkbox">'
    + '<input class="clientinfo"><input class="bgmvol"><input class="soundvol"><input class="save" type="checkbox">'
    + '<table><tbody class="servers"></tbody></table>';
  const graphics = { screensize: 'full', quality: 100, cursor: true, save: vi.fn() };
  const controls = { snap: true, itemsnap: false, save: vi.fn() };
  const context = vm.createContext({ GraphicsSettings: graphics, Controls_default: controls,
    window: {}, Event, Context: { isFullScreen: () => true }, Configs: { get: () => false, set() {} },
    Audio_default: { BGM: { volume: 0.5 }, Sound: { volume: 0.5 }, save() {} },
    _preferences: { serverlist: [], save() {} }, apply() {},
  });
  for (const name of ['load', 'save']) vm.runInContext(extractRuntimeNode(vendor, {
    region: 'src/UI/Components/Intro/Preferences.js', kind: 'function', name,
  }), context);
  context.load(root);
  const system = root.querySelector<HTMLInputElement>('.cursor')!;
  const monster = root.querySelector<HTMLInputElement>('.monster-snap')!;
  const item = root.querySelector<HTMLInputElement>('.item-snap')!;
  expect(system.checked).toBe(false); expect(monster.checked).toBe(true); expect(item.checked).toBe(false);
  system.checked = true; monster.checked = false; item.checked = true;
  context.save(root);
  expect(graphics.cursor).toBe(false); expect(controls.snap).toBe(false); expect(controls.itemsnap).toBe(true);
  expect(graphics.save).toHaveBeenCalledOnce(); expect(controls.save).toHaveBeenCalledOnce();
  context.load(root);
  expect(system.checked).toBe(true); expect(monster.checked).toBe(false); expect(item.checked).toBe(true);
});
