import ts from 'typescript';

/**
 * Chrome IWA forbids string-to-code execution. The reflect-metadata
 * compatibility fallback uses Function/eval solely to find the global object,
 * which is always available as globalThis in supported Chrome versions.
 *
 * Rewrite only these two known calls. This runs on bundled code before it
 * enters the IWA manifest; the regular audit is never disabled or bypassed.
 * A changed dependency shape must fail closed instead of shipping unsafe JS.
 */
export function patchCspReflectGlobals(source) {
  const ast = ts.createSourceFile('reflect-compat.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const edits = [];
  let functionCount = 0;
  let evalCount = 0;
  const visit = node => {
    if (ts.isCallExpression(node) && node.arguments.length === 0
      && ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression)
      && node.expression.expression.text === 'Function'
      && node.expression.arguments.length === 1
      && ts.isStringLiteralLike(node.expression.arguments[0])
      && node.expression.arguments[0].text === 'return this;') {
      functionCount++;
      edits.push({ start: node.getStart(ast), end: node.end });
      return;
    }
    if (ts.isCallExpression(node) && node.arguments.length === 1
      && ts.isStringLiteralLike(node.arguments[0])
      && node.arguments[0].text === '(function() { return this; })()') {
      if (!/\beval\b/.test(node.expression.getText(ast))) {
        throw new Error('Unexpected reflection global probe callee');
      }
      evalCount++;
      edits.push({ start: node.getStart(ast), end: node.end });
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  if (functionCount !== 1 || evalCount !== 1) {
    throw new Error(`Unexpected reflect-metadata global detection: Function=${functionCount}, eval=${evalCount}`);
  }
  return edits.sort((a, b) => b.start - a.start).reduce(
    (result, edit) => result.slice(0, edit.start) + 'globalThis' + result.slice(edit.end),
    source,
  );
}
