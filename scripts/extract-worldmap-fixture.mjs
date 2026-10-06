import ts from 'typescript';

export function extractWorldMapFixture(source) {
  const regions = [...source.matchAll(/\/\/#region src\/UI\/Components\/WorldMap\/WorldMap\.js\r?\n[\s\S]*?\/\/#endregion/g)];
  if (regions.length !== 1) throw new Error('Missing or ambiguous packaged world map region');
  const ast = ts.createSourceFile('WorldMap.js', regions[0][0], ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (ast.parseDiagnostics.length) throw new Error('Invalid packaged world map source');
  const result = {};
  const record = (key, value) => {
    if (Object.hasOwn(result, key)) throw new Error(`Ambiguous packaged world map ${key}`);
    result[key] = value;
  };
  function visit(node) {
    if (ts.isFunctionExpression(node) && ['installLastroWorldMap', 'createWorldMapIndex', 'createMonsterPortraitLoader'].includes(node.name?.text)) record(node.name.text, node.getText(ast));
    if (ts.isNewExpression(node) && node.expression.getText(ast) === 'GUIComponent' && node.arguments?.[0]?.text === 'WorldMap') {
      if (node.arguments.length !== 2 || !ts.isStringLiteral(node.arguments[1])) throw new Error('Invalid packaged world map CSS');
      record('css', node.arguments[1].text);
    }
    if (ts.isBinaryExpression(node) && node.left.getText(ast) === 'WorldMap.render') {
      if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isArrowFunction(node.right) || !ts.isStringLiteral(node.right.body)) throw new Error('Invalid packaged world map HTML');
      record('html', node.right.body.text);
    }
    if (ts.isCallExpression(node) && ts.isParenthesizedExpression(node.expression) && node.expression.expression.name?.text === 'installLastroWorldMap') {
      if (node.arguments.length !== 4 || node.arguments[0].getText(ast) !== 'WorldMap') throw new Error('Invalid packaged world map installer');
      record('regions', JSON.parse(node.arguments[2].getText(ast)));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const key of ['installLastroWorldMap', 'createWorldMapIndex', 'createMonsterPortraitLoader', 'html', 'css', 'regions']) if (!result[key]) throw new Error(`Missing packaged world map ${key}`);
  return result;
}
