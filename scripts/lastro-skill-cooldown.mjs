import ts from 'typescript';

const fail = label => { throw new Error('anchor:skill-cooldown:' + label); };
function tokens(source) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, source);
  const out = [];
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) out.push([token, scanner.getTokenText()]);
  return JSON.stringify(out);
}

/** Resume native shortcut cooldowns after map loading without restarting their duration. */
export function patchRuntimeSkillCooldown(source) {
  const path = 'src/UI/Components/ShortCut/ShortCut.js';
  const marker = '//#region ' + path;
  const start = source.indexOf(marker);
  if (start < 0) return source;
  if (start > 0 && source[start - 1] !== '\n' || !/^(?:\r\n|\n)/.test(source.slice(start + marker.length))) fail('region-header');
  const end = source.indexOf('//#endregion', start);
  const next = source.indexOf('//#region ', start + marker.length);
  if (end < 0 || next >= 0 && next < end || source.indexOf(marker, start + marker.length) >= 0) fail('region');
  const region = source.slice(start, end);
  if (/\r(?!\n)/.test(region) || region.includes('\r\n') && /(?<!\r)\n/.test(region)) fail('newlines');
  const newline = region.includes('\r\n') ? '\r\n' : '\n';
  const file = ts.createSourceFile(path, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (file.parseDiagnostics.length) fail('syntax');
  function unique(predicate, label, root = file) {
    const matches = [];
    function visit(node) {
      if (predicate(node)) matches.push(node);
      ts.forEachChild(node, visit);
    }
    visit(root);
    if (matches.length !== 1) fail(label);
    return matches[0];
  }
  const matches = (node, text) => tokens(node.getText(file)) === tokens(text);
  const fn = unique(node => ts.isFunctionDeclaration(node) && node.name?.text === 'setDelayOnIndex', 'setDelayOnIndex');
  if (!fn.body || fn.parameters.length !== 2 || fn.parameters.some(parameter => parameter.initializer)
    || fn.parameters[0].name.getText(file) !== 'index' || fn.parameters[1].name.getText(file) !== 'delay') fail('parameters');
  const guard = unique(node => ts.isIfStatement(node) && matches(node,
    'if (_list$1[index].Delay && _list$1[index].Delay >= Renderer.tick + delay) return;'), 'merge-guard', fn.body);
  const deadline = unique(node => ts.isExpressionStatement(node) && matches(node,
    '_list$1[index].Delay = Renderer.tick + delay;'), 'deadline', fn.body);
  if (guard.parent !== fn.body || deadline.parent !== fn.body
    || fn.body.statements.indexOf(deadline) !== fn.body.statements.indexOf(guard) + 1) fail('deadline-order');
  const clock = unique(node => ts.isVariableDeclaration(node) && node.name.getText(file) === 'now'
    && node.initializer?.getText(file) === 'Renderer.tick', 'animation-clock', fn.body);
  const removal = unique(node => ts.isIfStatement(node) && matches(node, 'if (existing) existing.remove();'), 'overlay-removal', fn.body);
  if (removal.parent !== fn.body) fail('overlay-removal-scope');
  const append = unique(node => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && node.left.getText(file) === 'ShortCut.onAppend', 'onAppend');
  if (!ts.isFunctionExpression(append.right) || append.right.parameters.length) fail('onAppend-body');
  const tooltips = unique(node => ts.isExpressionStatement(node) && matches(node, 'updateEmptySlotTooltips();'), 'onAppend-tooltips', append.right.body);
  const edits = [
    { start: fn.parameters[1].end, end: fn.parameters[1].end, text: ', resume = false' },
    { start: guard.getStart(file), end: deadline.end, text: `const now = Date.now();
  if (!resume) {
    if (_list$1[index].Delay && _list$1[index].Delay >= now + delay) return;
    _list$1[index].Delay = now + delay;
    _list$1[index]._lastroCooldownDuration = delay;
  }
  const expired = resume && _list$1[index].Delay <= now;
  if (expired) {
    _list$1[index].Delay = 0;
    _list$1[index]._lastroCooldownDuration = 0;
    if (_activeAnimations.has(index)) {
      cancelAnimationFrame(_activeAnimations.get(index));
      _activeAnimations.delete(index);
    }
  }` },
    { start: clock.initializer.getStart(file), end: clock.initializer.end, text: 'Date.now()' },
    { start: removal.end, end: removal.end, text: '\n  if (expired) return;' },
    { start: tooltips.end, end: tooltips.end, text: `
    _list$1.forEach((element, index) => {
      if (element && element.Delay) setDelayOnIndex(index, element._lastroCooldownDuration, true);
    });` },
  ];
  let output = region;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text.replace(/\n/g, newline) + output.slice(edit.end);
  }
  return source.slice(0, start) + output + source.slice(end);
}
