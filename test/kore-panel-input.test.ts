// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createKorePanel } from '../src/kore/kore-integration.mjs';
import { addAssistantAwareListener, installAssistantInputTracking, removeAssistantAwareListener } from '../src/assistant/lro-assistant-input.mjs';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { extractRuntimeNode, getRuntimeSourceFile, readVendorSource } from './helpers/vendor-runtime';

afterEach(() => { document.body.replaceChildren(); });

class FakeElement extends EventTarget {
  style: Record<string, string> = {}; children: FakeElement[] = []; textContent = ''; value = ''; readOnly = false; rows = 0; type = '';
  constructor(public tagName: string) { super(); this.tagName = tagName.toUpperCase(); }
  append(...nodes: FakeElement[]) { this.children.push(...nodes); }
  setAttribute() {}
  click() { this.dispatchEvent(new Event('click')); }
}

function viewFor() {
  const command = vi.fn(); const clearConsole = vi.fn();
  const document = { createElement: (tag: string) => new FakeElement(tag) } as unknown as Document;
  const view = createKorePanel({ page: { document }, host: { clearConsole, debugCommand: command } });
  return { view, command, clearConsole };
}

test('panel sends an opaque command and clears diagnostics', () => {
  const { view, command, clearConsole } = viewFor();
  const input = view.commandInput as HTMLInputElement; input.value = 'ai auto';
  (view.commandButton as HTMLButtonElement).click(); view.clearButton.click();
  expect(command).toHaveBeenCalledWith('ai auto'); expect(clearConsole).toHaveBeenCalledTimes(1);
});

test('panel renders only read-only Rust status and console output', () => {
  const { view } = viewFor();
  view.update({ status: 'runtime-ready', packageId: null, mode: null, runtimeGeneration: 1, profile: 'lastro-20211103', gameSessionId: null, disconnect: null,
    connectionGeneration: null, streamStatus: 'world-ready', worldReady: true, mapResourceState: 'ready', receivedBytes: 10, sentBytes: 4,
    degradedReason: null, logs: [{ level: 'info', text: 'ready', timestamp: 0 }], runtimeStatus: { nextDeadlineMs: 10 }, lastDiagnostic: null, lastCommandResult: null, configIdentity: null,
    lastWorldState: null, lastWorldStateAt: null, heartbeat: null, actions: [], diagnosticLog: [] });
  expect(view.infoNode.readOnly).toBe(true); expect(view.consoleNode.readOnly).toBe(true);
  expect(view.infoNode.value).toContain('worldReady'); expect(view.consoleNode.value).toContain('[info] ready');
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
  const view = createKorePanel({ page: { document }, host: { clearConsole() {}, debugCommand: () => false } });
  const canvas = document.createElement('canvas');
  document.body.append(view.panel, canvas);
  const gameplay = vi.fn();
  addAssistantAwareListener(window, 'mouseup', gameplay, true);
  try {
    for (const button of [0, 2]) {
      canvas.dispatchEvent(new MouseEvent('mousedown', { button, bubbles: true }));
      const release = new MouseEvent('mouseup', { button, bubbles: true });
      Object.defineProperty(release, 'which', { value: button === 2 ? 3 : 1 });
      view.commandInput.dispatchEvent(release);
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
  const view = createKorePanel({ page: { document }, host: { clearConsole() {}, debugCommand: () => false } });
  const canvas = document.createElement('canvas');
  document.body.append(view.panel, canvas);
  const gameplay = vi.fn();
  addAssistantAwareListener(window, 'keyup', gameplay);
  try {
    canvas.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, shiftKey: true, ctrlKey: true, altKey: true }));
    expect(keys).toEqual({ SHIFT: true, CTRL: true, ALT: true });
    view.commandInput.focus();
    recorder.isCapturing = true;
    view.commandInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', bubbles: true, shiftKey: true, ctrlKey: true, altKey: true }));
    view.commandInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
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
  const view = createKorePanel({ page: { document }, host: { clearConsole, debugCommand: () => false } });
  document.body.append(view.panel);
  const events = ['pointerdown', 'mousedown', 'mouseup', 'click', 'wheel', 'keydown'];
  for (const type of events) addAssistantAwareListener(window, type, gameplay, true);
  try {
    for (const type of ['pointerdown', 'mousedown', 'mouseup']) {
      view.clearButton.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    view.clearButton.click();
    view.commandInput.focus();
    view.commandInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    view.commandInput.dispatchEvent(new WheelEvent('wheel', { bubbles: true }));
    expect(clearConsole).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(view.commandInput);
    expect(gameplay).not.toHaveBeenCalled();
    view.editor.focus();
    view.editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    view.editor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(document.activeElement).toBe(view.editor);
    expect(gameplay).not.toHaveBeenCalled();
    view.commandInput.focus();

    view.commandInput.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
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
    const view = createKorePanel({ page: { document }, host: { clearConsole() {}, debugCommand: () => false } });
    document.body.append(view.panel);
    expect(getComputedStyle(view.panel).cursor).toBe('default');
    expect(getComputedStyle(view.clearButton).cursor).toBe('pointer');
    expect(getComputedStyle(view.commandInput).cursor).toBe('text');
  } finally { document.body.classList.remove('custom-cursor'); }
});
