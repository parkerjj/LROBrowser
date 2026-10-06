import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { patchRuntimeShortcutSettings, patchRuntimeToolsPanels } from '../scripts/patch-v2-runtime.mjs';
import { patchRuntimeHotkeys } from '../scripts/lastro-hotkeys.mjs';
import { patchRuntimeNpcMapLinks } from '../scripts/lastro-npc-map-links.mjs';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const vendor = readVendorSource();
const helper = extractRuntimeNode(vendor, { kind: 'function', name: 'lastroUiWindowAppend' });
const graphics = helper + '\n' + extractVendorRegion('src/UI/Components/GraphicsOption/GraphicsOption.js', vendor);
const hotkeys = [
  'src/Controls/KeyEventHandler.js', 'src/UI/Components/ShortCutOption/ShortCutOption.js',
  'src/UI/Components/ChatBox/ChatBox.js',
].map(name => extractVendorRegion(name, vendor)).join('\n');
const npc = extractVendorRegion('src/UI/Components/NpcBox/NpcBox.js', vendor);
const tools = [
  'src/Renderer/MapRenderer.js', 'src/UI/Components/Navigation/Navigation.js',
  'src/UI/Components/LastROTools/LastROTools.js', 'src/Engine/MapEngine.js',
].map(name => extractVendorRegion(name, vendor)).join('\n');

function assignment(source: string, name: string) {
  const file = ts.createSourceFile('runtime.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches: ts.BinaryExpression[] = [];
  function visit(node: ts.Node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && node.left.getText(file) === name) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  expect(matches).toHaveLength(1);
  return { file, node: matches[0]!, fn: matches[0]!.right as ts.FunctionExpression };
}

function rewriteAssignment(source: string, name: string, rewrite: (text: string) => string) {
  const text = extractRuntimeNode(source, { kind: 'assignment', name });
  const rewritten = rewrite(text);
  expect(rewritten).not.toBe(text);
  return source.replace(text, rewritten);
}

describe('retained products compose with permanent UI owners', () => {
  it('wraps both Graphics settings installers once in the available preference closure', () => {
    const patched = patchRuntimeShortcutSettings(graphics);
    expect(patched.split('function lastroUiWindowAppend(')).toHaveLength(2);
    for (const name of ['installLastroShortcutSettings', 'installLastroTeleportSettings']) {
      const factory = extractRuntimeNode(patched, { kind: 'function', name });
      const { file, fn } = assignment(factory, 'component.onAppend');
      expect(fn.body.statements).toHaveLength(1);
      const returned = fn.body.statements[0] as ts.ReturnStatement;
      expect(ts.isReturnStatement(returned)).toBe(true);
      const call = returned.expression as ts.CallExpression;
      expect(call.expression.getText(file)).toBe('lastroUiWindowAppend');
      expect(call.arguments.map(argument => argument.getText(file)).slice(0, 2)).toEqual(['this', '_preferences$32']);
      expect(call.arguments).toHaveLength(4);
      expect(call.arguments[2]!.getText(file)).toContain('originalAppend?.apply(this, args);');
      expect(call.arguments[3]!.getText(file)).toContain('_preferences$32.x = parseFloat(this._host.style.left) || 0;');
    }
  });

  it('rejects missing or duplicate Graphics helper, preference and native append owners', () => {
    const append = extractRuntimeNode(graphics, { kind: 'assignment', name: 'GraphicsOption.onAppend' });
    const preference = extractRuntimeNode(graphics, { kind: 'assignment', name: '_preferences$32' });
    for (const broken of [
      graphics.replace(helper, ''), helper + '\n' + graphics,
      graphics.replace(preference, '0'), graphics.replace(preference, preference + ';' + preference),
      graphics.replace(append, '0'), graphics.replace(append, append + ';' + append),
      graphics.replace(preference, preference.replace('"GraphicsOption"', '"OtherOption"')),
    ]) expect(() => patchRuntimeShortcutSettings(broken)).toThrow('anchor:lastro-shortcut-settings:ui-state');
  });

  it('rejects Graphics wrapper argument, callback and snapshot drift', () => {
    for (const rewrite of [
      (text: string) => text.replace('lastroUiWindowAppend(this, _preferences$32,', 'lastroUiWindowAppend(this,'),
      (text: string) => text.replace('lastroUiWindowAppend(this,', 'lastroUiWindowAppend(null,'),
      (text: string) => text.replace('() => {', '(value) => {'),
      (text: string) => text.replace('parseInt(this._host.style.left, 10)', 'parseInt(this._host.style.top, 10)'),
      (text: string) => text.replace('function onAppend(', 'async function onAppend('),
      (text: string) => text.replace('function onAppend(', 'function* onAppend('),
    ]) expect(() => patchRuntimeShortcutSettings(rewriteAssignment(graphics, 'GraphicsOption.onAppend', rewrite)))
      .toThrow('anchor:lastro-shortcut-settings:ui-state');
  });

  it('runs Hotkeys cancellation inside the permanent append callback', () => {
    const { file, fn } = assignment(patchRuntimeHotkeys(hotkeys), 'ShortCutOption.onAppend');
    const returned = fn.body.statements[0] as ts.ReturnStatement;
    expect(ts.isReturnStatement(returned)).toBe(true);
    const call = returned.expression as ts.CallExpression;
    expect(call.expression.getText(file)).toBe('lastroUiWindowAppend');
    const callback = call.arguments[2] as ts.ArrowFunction;
    expect((callback.body as ts.Block).statements[0]!.getText(file)).toBe('cancelSettings();');
  });

  it('rejects missing, duplicated and drifting permanent Hotkeys append shapes', () => {
    const append = extractRuntimeNode(hotkeys, { kind: 'assignment', name: 'ShortCutOption.onAppend' });
    for (const broken of [
      hotkeys.replace(append, '0'), hotkeys.replace(append, append + ';' + append),
      rewriteAssignment(hotkeys, 'ShortCutOption.onAppend', text => text.replace('lastroUiWindowAppend', 'unknownAppend')),
      rewriteAssignment(hotkeys, 'ShortCutOption.onAppend', text => text.replace('_preferences$31,', '_preferences$30,')),
      rewriteAssignment(hotkeys, 'ShortCutOption.onAppend', text => text.replace('() => {', '(value) => {')),
      rewriteAssignment(hotkeys, 'ShortCutOption.onAppend', text => text.replace('parseInt(this._host.style.left, 10)', '0')),
      rewriteAssignment(hotkeys, 'ShortCutOption.onAppend', text => text.replace('function (', 'async function (')),
      rewriteAssignment(hotkeys, 'ShortCutOption.onAppend', text => text.replace('function (', 'function* (')),
    ]) expect(() => patchRuntimeHotkeys(broken)).toThrow('anchor:hotkeys:');
  });

  it('initializes NPC products before the permanent button installer and registration', () => {
    const patched = patchRuntimeNpcMapLinks(npc, '() => {}');
    const product = patched.indexOf('const lastroNpcMapPreflight =');
    const buttons = patched.indexOf('installLastroNpcDialogButtonFallback(NpcBox);');
    const registration = patched.indexOf('NpcBox_default = UIManager.addComponent(NpcBox);');
    expect(product).toBeGreaterThanOrEqual(0);
    expect(product).toBeLessThan(buttons);
    expect(buttons).toBeLessThan(registration);
    expect(patched.split('installLastroNpcDialogButtonFallback(NpcBox);')).toHaveLength(2);
  });

  it('rejects missing, duplicate and drifting permanent NPC installer shapes', () => {
    const call = 'installLastroNpcDialogButtonFallback(NpcBox);';
    const nativeHelper = extractRuntimeNode(npc, { kind: 'function', name: 'installLastroNpcDialogButtonFallback' });
    for (const broken of [
      npc.replace(call, ''), npc.replace(call, call + call), npc.replace(call, 'installLastroNpcDialogButtonFallback(null);'),
      npc.replace(call, 'installLastroNpcDialogButtonFallback?.(NpcBox);'),
      npc.replace(call, 'if (ready) ' + call), npc.replace('/* lastro-npc-dialog-buttons */', ''),
      npc.replace(nativeHelper, ''), npc.replace(nativeHelper, nativeHelper + '\n' + nativeHelper),
      npc.replace(call, call + 'prepareExtraHook();'),
    ]) expect(() => patchRuntimeNpcMapLinks(broken, '() => {}')).toThrow('anchor:npc-map-links:dialog-buttons');
  });

  it('retains the raw NPC registration contract only without the permanent marker or helper', () => {
    const raw = `//#region src/UI/Components/NpcBox/NpcBox.js
function initNpc() {
  NpcBox = new GUIComponent("NpcBox", NpcBox_default$1);
  function render() { div.innerHTML = processText(text); }
  NpcBox_default = UIManager.addComponent(NpcBox);
}
//#endregion`;
    const patched = patchRuntimeNpcMapLinks(raw, '() => {}');
    expect(patched).toContain('const lastroNpcMapPreflight =');
    expect(patched).not.toContain('installLastroNpcDialogButtonFallback');
  });

  it('places tools route cancellation directly after native drag teardown', () => {
    const patched = patchRuntimeToolsPanels(tools);
    const cleanup = extractRuntimeNode(patched, { kind: 'function', name: 'cleanGameUI' });
    expect(cleanup).toMatch(/document\._lastroItemDrag\?\.cancel\(\);\s*if \(typeof LastROTools/);
    expect(cleanup.indexOf('cancelRoute()')).toBeLessThan(cleanup.indexOf('lastroCloseVendingShopping()'));
  });

  it('rejects missing, duplicate, indirect or optional-root drag teardown anchors', () => {
    const cleanup = extractRuntimeNode(tools, { kind: 'function', name: 'cleanGameUI' });
    const call = 'document._lastroItemDrag?.cancel();';
    for (const replacement of ['', call + call, 'if (ready) ' + call,
      'document._lastroItemDrag?.cancel(1);', 'document?._lastroItemDrag?.cancel();']) {
      expect(() => patchRuntimeToolsPanels(tools.replace(cleanup, cleanup.replace(call, replacement))))
        .toThrow('anchor:lastro-tools-panels');
    }
  });
});
