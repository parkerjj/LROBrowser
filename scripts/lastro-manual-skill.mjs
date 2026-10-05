import ts from 'typescript';

/** Let the server decide player skill timing; retain companion animation gates. */
export function patchRuntimeManualSkill(source) {
  const path = 'src/Engine/MapEngine/Skill.js', marker = '//#region ' + path;
  const fail = label => { throw new Error('anchor:manual-skill:' + label); };
  const start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  const next = source.indexOf('//#region ', start + marker.length);
  if (end < start || next >= 0 && next < end
    || source.indexOf(marker, start + marker.length) >= 0
    || !/^\r?\n/.test(source.slice(start + marker.length))) fail('region');
  const region = source.slice(start, end);
  if (/\r(?!\n)/.test(region) || region.includes('\r\n') && /(?<!\r)\n/.test(region)) fail('newlines');
  const file = ts.createSourceFile(path, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (file.parseDiagnostics.length) fail('syntax');
  const find = (root, predicate) => {
    const matches = [];
    function visit(node) { if (predicate(node)) matches.push(node); ts.forEachChild(node, visit); }
    visit(root); return matches;
  };
  const one = (root, predicate, label) => {
    const matches = find(root, predicate);
    if (matches.length !== 1) fail(label);
    return matches[0];
  };
  const target = one(file, node => ts.isFunctionDeclaration(node) && node.name?.text === 'onUseSkill', 'onUseSkill');
  const ground = one(file, node => ts.isFunctionExpression(node) && node.name?.text === 'onUseSkillToPos', 'onUseSkillToPos');
  const assignment = one(file, node => ts.isBinaryExpression(node)
    && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && node.left.getText(file) === 'SkillTargetSelection_default.onUseSkillToPos', 'ground-assignment');
  let owner = ground.parent;
  while (owner && !ts.isVariableDeclaration(owner)) owner = owner.parent;
  if (target.parent !== file || assignment.right !== ground || !ts.isExpressionStatement(assignment.parent)
    || owner?.name.getText(file) !== 'init_Skill') fail('entry-scope');
  const edits = [];
  for (const [entry, parameters] of [[target, 'id,level,targetID'], [ground, 'id,level,x,y']]) {
    if (!entry.body || entry.parameters.map(node => node.name.getText(file)).join(',') !== parameters) fail('parameters');
    const guard = one(entry.body, node => ts.isIfStatement(node)
      && ts.isBinaryExpression(node.expression)
      && node.expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      && ts.isIdentifier(node.expression.left) && node.expression.left.text === 'entity'
      && ts.isBinaryExpression(node.expression.right)
      && node.expression.right.operatorToken.kind === ts.SyntaxKind.GreaterThanToken
      && node.expression.right.left.getText(file) === 'entity.amotionTick'
      && node.expression.right.right.getText(file) === 'Renderer.tick', entry.name.text + '-guard');
    if (guard.parent !== entry.body || guard.elseStatement || !ts.isReturnStatement(guard.thenStatement)
      || guard.thenStatement.expression) fail('guard-action');
    edits.push(guard.expression.left.end);
  }
  let output = region;
  // This changes only the two input conditions; animation and cooldown state stay native.
  for (const position of edits.sort((a, b) => b - a)) {
    output = output.slice(0, position) + ' && entity !== SessionStorage_default.Entity' + output.slice(position);
  }
  return source.slice(0, start) + output + source.slice(end);
}
