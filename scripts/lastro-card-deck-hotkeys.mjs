import ts from 'typescript';

/** Add only the new actions to saved native controls, retaining existing bindings. */
export function installLastroCardDeckHotkeyPreferences(controls) {
  for (let index = 1; index <= 4; index++) {
    const name = 'CardDeck' + index;
    const saved = controls.ShortCuts[name];
    controls.ShortCuts[name] = {
      init: { key: '', alt: false, ctrl: false, shift: false },
      cust: saved?.cust || false,
      component: 'CardConnection2',
      cmd: 'SWITCH_DECK_' + index,
    };
  }
}

/** Keep native chat shortcuts while protecting other text fields and key recording. */
export function installLastroCardDeckShortcutDispatch(component, { getActiveElement, isCapturing, getChatRoot = () => null }) {
  const original = component.onShortCut;
  component.onShortCut = function (binding) {
    const match = /^SWITCH_DECK_([1-4])$/.exec(binding?.cmd || '');
    if (!match) return original?.call(this, binding);
    const active = getActiveElement();
    const chat = getChatRoot();
    // ChatBox already gates ordinary typing, editing commands and composition.
    // Its permitted function/modifier shortcuts must not be blocked a second time.
    const chatInput = active && (active === chat?.querySelector('.input-chatbox')
      || active === chat?.querySelector('.input .username'));
    if (isCapturing() || !chatInput && active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)
      || active.isContentEditable || active.closest?.('[contenteditable]:not([contenteditable="false"])'))) return false;
    // The controller owns the shared lock and reports a blocked switch.
    // Keep shortcuts on that path so an unfinished request is not silent.
    return this.switchDeckPreset?.(Number(match[1]), { requireVerified: true });
  };
}

const preferencesPath = 'src/Preferences/ShortCutControls.js';
const templatePath = 'src/UI/Components/ShortCutOption/ShortCutOption.html?raw';
const cardPath = 'src/UI/Components/CardConnection/CardConnection2';
const integrationMarker = '/* lastro-card-deck-hotkeys */';

function fail(label) { throw new Error('anchor:card-deck-hotkeys:' + label); }
function regionStarts(source, path) {
  const marker = '//#region ' + path, starts = [];
  let offset = 0;
  while ((offset = source.indexOf(marker, offset)) >= 0) {
    const following = source[offset + marker.length];
    if (following === undefined || following === '\r' || following === '\n') starts.push(offset);
    offset += marker.length;
  }
  return starts;
}
function region(source, path) {
  const marker = '//#region ' + path, starts = regionStarts(source, path);
  if (starts.length !== 1) fail(path);
  const start = starts[0];
  const end = source.indexOf('//#endregion', start), next = source.indexOf('//#region ', start + marker.length);
  if (end < 0 || next >= 0 && next < end) fail('region');
  const text = source.slice(start, end);
  if (/\r(?!\n)/.test(text) || text.includes('\r\n') && /(?<!\r)\n/.test(text)) fail('newlines');
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (file.parseDiagnostics.length) fail('syntax');
  return { start, text, file, newline: text.includes('\r\n') ? '\r\n' : '\n' };
}
function one(scope, predicate, label) {
  const found = [];
  function visit(node) {
    if (predicate(node)) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(scope.file);
  if (found.length !== 1) fail(label);
  return found[0];
}

export function patchRuntimeCardDeckHotkeys(source) {
  const paths = [preferencesPath, templatePath, cardPath];
  if (!paths.some(path => regionStarts(source, path).length)) return source;
  if (source.includes(integrationMarker)) fail('already-patched');
  const controls = region(source, preferencesPath), html = region(source, templatePath), card = region(source, cardPath);
  const settings = one(controls, node => ts.isBinaryExpression(node)
    && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && node.left.getText(controls.file) === 'ShortCutControls_default'
    && ts.isCallExpression(node.right) && node.right.expression.getText(controls.file) === 'Preferences.get', 'preferences');
  if (!ts.isExpressionStatement(settings.parent) || settings.right.arguments[0]?.text !== 'ShortCutControls') fail('preferences');
  const literal = one(html, node => ts.isBinaryExpression(node) && node.left.getText(html.file) === 'ShortCutOption_default$2'
    && ts.isStringLiteral(node.right), 'template').right;
  if (literal.text.includes('data-button="CardDeck')) fail('template-already-patched');
  const section = [...literal.text.matchAll(/<div class="content t_ui">[\s\S]*?<\/tbody>/g)];
  if (section.length !== 1) fail('interface-table');
  const position = section[0].index + section[0][0].lastIndexOf('</tbody>');
  const rows = [[1, 2], [3, 4]].map(pair => '<tr>' + pair.map(index =>
    '<td>切换卡册' + index + '</td><td data-button="CardDeck' + index + '" class="customize"></td>').join('') + '</tr>').join('\n');
  const template = literal.text.slice(0, position) + rows + '\n' + literal.text.slice(position);
  const creation = one(card, node => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && node.left.getText(card.file) === 'CardConnection2' && ts.isCallExpression(node.right)
    && node.right.expression.getText(card.file) === 'createCardCollectionComponent', 'component');
  if (!ts.isExpressionStatement(creation.parent)) fail('component');
  const normalize = (scope, value) => value.replace(/\r?\n/g, scope.newline);
  const changes = [
    { start: controls.start + settings.parent.end, end: controls.start + settings.parent.end,
      text: normalize(controls, '\n  ' + integrationMarker + '\n  (' + installLastroCardDeckHotkeyPreferences.toString() + ')(ShortCutControls_default);\n') },
    { start: html.start + literal.getStart(html.file), end: html.start + literal.end, text: JSON.stringify(template) },
    { start: card.start + creation.parent.end, end: card.start + creation.parent.end,
      text: normalize(card, '\n  (' + installLastroCardDeckShortcutDispatch.toString() + ')(CardConnection2, {\n'
        + '    getActiveElement: () => KEYS.getDeepActiveElement(),\n'
        + '    getChatRoot: () => UIManager.components.ChatBox?.getRoot?.(),\n'
        + '    isCapturing: () => UIManager.components.ShortCutOption?.isCapturing === true,\n  });\n') },
  ];
  for (const change of changes.sort((a, b) => b.start - a.start)) source = source.slice(0, change.start) + change.text + source.slice(change.end);
  return source;
}
