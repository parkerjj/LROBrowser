// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createKorePanel } from '../src/kore/kore-integration.mjs';
import { addAssistantAwareListener, installAssistantInputTracking, removeAssistantAwareListener } from '../src/assistant/lro-assistant-input.mjs';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { extractRuntimeNode, getRuntimeSourceFile, readVendorSource } from './helpers/vendor-runtime';

afterEach(() => { document.body.replaceChildren(); });

test('route and reload rejections display the concrete blocking reason in the panel', () => {
  const host = {
    clearConsole() {},
    state: { logs: [{ text: 'World synchronization incomplete.' }] },
    debugCommand: () => false,
    reloadConfig: () => false,
  };
  const view = createKorePanel({ page: { document }, host: host as unknown as Parameters<typeof createKorePanel>[0]['host'] });
  document.body.append(view.panel);
  const buttons = [...view.panel.querySelectorAll('button')];
  buttons.find(button => button.textContent === 'Preview route')!.click();
  expect(view.panel.querySelector('[aria-label="KoreEngine command status"]')?.textContent).toContain('World synchronization incomplete');
  buttons.find(button => button.textContent === 'Reload TXT')!.click();
  expect(view.panel.querySelector('output[aria-live]')?.textContent).toContain('World synchronization incomplete');
});

test('status panel shows the selected AI task, next movement, and native action result', () => {
  const host = { clearConsole() {}, state: { logs: [] } };
  const view = createKorePanel({ page: { document }, host: host as unknown as Parameters<typeof createKorePanel>[0]['host'] });
  document.body.append(view.panel);
  view.update({
    status: 'runtime-ready', streamStatus: 'world-ready', profile: 'lastro-20211103',
    connectionGeneration: 0, mapName: 'prt_fild08.gat', selfActor: { gid: 7, x: 20, y: 20, kind: 'self' },
    visibleEntities: { total: 1, players: 0, monsters: 1, other: 0, unknown: 0 },
    receivedBytes: 32000, sentBytes: 479, worldReady: true, mapResourceState: 'ready', aiState: 'auto',
    controlGeneration: 33, aiTaskCount: 1,
    aiDiagnostics: { diagnostics: { mode: 'auto', task: 'attack', nextAction: 'MoveTo (24,20)',
      reason: null, targetGid: 9001, targetX: 22, targetY: 20, visibleMonsters: 1,
      eligibleMonsters: 1, configLoaded: true, attackAuto: 2 },
      lastAction: { type: 'MoveTo', accepted: false, reason: 'native-action-unavailable' } },
    playerStatus: null, inventory: null, experience: null,
    routeState: 'idle', routePreview: null, parserDiagnostics: { bufferedBytes: 0,
      pendingPacketId: null, pendingRequiredBytes: null, lastPacketId: null },
    degradedReason: null, logs: [], configIdentity: null,
  } as unknown as Parameters<typeof view.update>[0]);
  expect(view.infoNode.rows).toBeGreaterThanOrEqual(12);
  expect(view.infoNode.value).toContain('AI task attack');
  expect(view.infoNode.value).toContain('next MoveTo (24,20)');
  expect(view.infoNode.value).toContain('sent MoveTo: native-action-unavailable');
});

const preparedSource = readFileSync(new NodeURL('../generated/runtime/Online.js', import.meta.url), 'utf8');
const preparedFile = getRuntimeSourceFile(preparedSource, 'KE-input.js');
function nativeBindings(listener: string) {
  const bindings: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && node.arguments.some(argument => ts.isIdentifier(argument) && argument.text === listener)) bindings.push(node.getText(preparedFile));
    ts.forEachChild(node, visit);
  }
  visit(preparedFile);
  return bindings.join(';\n');
}

test('native mouse release cleanup stops map movement and camera rotation when released over KE', () => {
  installAssistantInputTracking(window);
  const vendor = readVendorSource();
  const binding = nativeBindings('onMouseUpCapture');
  const cleanupSource = extractRuntimeNode(vendor, { region: 'src/Controls/MapControl.js', kind: 'function', name: 'onMouseUpCapture' });
  const camera = { action: { active: true }, rotate(active: boolean) { this.action.active = active; } };
  let held = true;
  const control = { _lastroMovementInput: { stop() { held = false; } } };
  const dispose = new Function('window', 'addAssistantAwareListener', 'MapControl', 'Camera', 'Cursor',
    cleanupSource + '\n' + binding + '; return () => window.removeEventListener("mouseup", onMouseUpCapture, true);')(
    window, addAssistantAwareListener, control, camera, { ACTION: { DEFAULT: 0 }, setType() {} },
  );
  const view = createKorePanel({ page: { document }, host: { clearConsole() {} } });
  const canvas = document.createElement('canvas');
  document.body.append(view.panel, canvas);
  const gameplay = vi.fn();
  addAssistantAwareListener(window, 'mouseup', gameplay, true);
  try {
    for (const button of [0, 2]) {
      canvas.dispatchEvent(new MouseEvent('mousedown', { button, bubbles: true }));
      const release = new MouseEvent('mouseup', { button, bubbles: true });
      Object.defineProperty(release, 'which', { value: button === 2 ? 3 : 1 });
      view.configNode.dispatchEvent(release);
    }
    expect(held).toBe(false);
    expect(camera.action.active).toBe(false);
    expect(gameplay).not.toHaveBeenCalled();
  } finally {
    dispose();
    removeAssistantAwareListener(window, 'mouseup', gameplay, true);
  }
});

test('releasing modifiers inside KE updates native key state without running game shortcuts', () => {
  installAssistantInputTracking(window);
  const handler = extractRuntimeNode(preparedSource, { region: 'src/Controls/KeyEventHandler.js', kind: 'assignment', name: 'onKeyEvent' });
  const keys = { SHIFT: false, CTRL: false, ALT: false };
  let recorded = false;
  const recorder = { isCapturing: false, _host: { isConnected: true, style: { display: 'block' } }, onKeyDown() { recorded = true; } };
  const dispose = new Function('window', 'addAssistantAwareListener', 'removeAssistantAwareListener', 'KEYS', 'UIManager',
    'let onKeyEvent;\n' + handler + ';\n' + nativeBindings('onKeyEvent')
    + '; return () => { for (const type of ["keydown", "keyup"]) { window.removeEventListener(type, onKeyEvent, true); removeAssistantAwareListener(window, type, onKeyEvent, true); } };')(
    window, addAssistantAwareListener, removeAssistantAwareListener, keys, { components: { ShortCutOption: recorder } },
  );
  const view = createKorePanel({ page: { document }, host: { clearConsole() {} } });
  const canvas = document.createElement('canvas');
  document.body.append(view.panel, canvas);
  const gameplay = vi.fn();
  addAssistantAwareListener(window, 'keyup', gameplay);
  try {
    canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, shiftKey: true, ctrlKey: true, altKey: true }));
    expect(keys).toEqual({ SHIFT: true, CTRL: true, ALT: true });
    view.configNode.focus();
    recorder.isCapturing = true;
    view.configNode.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', bubbles: true, shiftKey: true, ctrlKey: true, altKey: true }));
    view.configNode.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    expect(keys).toEqual({ SHIFT: false, CTRL: false, ALT: false });
    expect(recorded).toBe(false);
    expect(gameplay).not.toHaveBeenCalled();
  } finally {
    dispose();
    removeAssistantAwareListener(window, 'keyup', gameplay);
  }
});

test('KE controls receive clicks and typing without reaching capture-phase game bindings', () => {
  installAssistantInputTracking(window);
  const gameplay = vi.fn();
  const clearConsole = vi.fn();
  const view = createKorePanel({ page: { document }, host: { clearConsole } });
  document.body.append(view.panel);
  const events = ['pointerdown', 'mousedown', 'mouseup', 'click', 'wheel', 'keydown'];
  for (const type of events) addAssistantAwareListener(window, type, gameplay, true);
  try {
    for (const type of ['pointerdown', 'mousedown', 'mouseup']) {
      view.clearButton.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    view.clearButton.click();
    view.configNode.focus();
    view.configNode.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    view.configNode.dispatchEvent(new WheelEvent('wheel', { bubbles: true }));
    expect(clearConsole).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(view.configNode);
    expect(gameplay).not.toHaveBeenCalled();

    // A drag that starts in KE must not release/click through onto the map.
    view.configNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(gameplay).not.toHaveBeenCalled();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(gameplay).toHaveBeenCalledOnce();
  } finally {
    for (const type of events) removeAssistantAwareListener(window, type, gameplay, true);
  }
});

test('KE displays a system cursor even when the game hides the browser cursor', () => {
  const style = document.createElement('style');
  style.textContent = '.custom-cursor, .custom-cursor * { cursor: none !important; }';
  document.body.append(style);
  document.body.classList.add('custom-cursor');
  try {
    const view = createKorePanel({ page: { document }, host: { clearConsole() {} } });
    document.body.append(view.panel);
    expect(getComputedStyle(view.panel).cursor).toBe('default');
    expect(getComputedStyle(view.clearButton).cursor).toBe('pointer');
    expect(getComputedStyle(view.configNode).cursor).toBe('text');
  } finally { document.body.classList.remove('custom-cursor'); }
});
