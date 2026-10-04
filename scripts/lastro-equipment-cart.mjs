import ts from 'typescript';

/** Restore native attachment buttons without changing cart state or actions. */
export function patchRuntimeEquipmentCart(source) {
  const path = 'src/UI/Components/Equipment/EquipmentCommon.js';
  const marker = '//#region ' + path;
  const start = source.indexOf(marker);
  if (start < 0) return source;
  const fail = label => { throw new Error('anchor:equipment-cart:' + label); };
  const end = source.indexOf('//#endregion', start);
  const next = source.indexOf('//#region ', start + marker.length);
  if (end < 0 || next >= 0 && next < end || source.indexOf(marker, start + marker.length) >= 0) fail('region');
  const region = source.slice(start, end);
  if (/\r(?!\n)/.test(region) || region.includes('\r\n') && /(?<!\r)\n/.test(region)) fail('newlines');
  const file = ts.createSourceFile(path, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (file.parseDiagnostics.length) fail('syntax');
  const functions = [];
  function find(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'updateAttachmentButtons') functions.push(node);
    ts.forEachChild(node, find);
  }
  find(file);
  if (functions.length !== 1 || !functions[0].body || functions[0].parameters.length) fail('updateAttachmentButtons');
  const edits = [];
  for (const target of ['cartBtn.style.display', 'removeOpt.style.display']) {
    const matches = [];
    function visit(node) {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && node.left.getText(file) === target && ts.isStringLiteral(node.right) && node.right.text === '') matches.push(node);
      ts.forEachChild(node, visit);
    }
    visit(functions[0].body);
    if (matches.length !== 1 || !ts.isExpressionStatement(matches[0].parent)) fail(target);
    edits.push({ start: matches[0].right.getStart(file), end: matches[0].right.end });
  }
  let output = region;
  // Clearing the inline display leaves the native CSS display:none in force.
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + '"block"' + output.slice(edit.end);
  }
  return source.slice(0, start) + output + source.slice(end);
}
