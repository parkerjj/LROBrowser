import { readFileSync } from 'node:fs';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import ts from 'typescript';

const vendorPath = fileURLToPath(new NodeURL('../../vendor/v2/Online.js', import.meta.url));

export function readVendorSource(): string {
  return readFileSync(vendorPath, 'utf8');
}

export function extractVendorRegion(path: string, source = readVendorSource()): string {
  if (!path.trim()) throw new Error('A vendor region path is required');
  const marker = `//#region ${path}`;
  const starts: number[] = [];
  for (let index = source.indexOf(marker); index >= 0; index = source.indexOf(marker, index + marker.length)) {
    const atLineStart = index === 0 || source[index - 1] === '\n';
    const afterMarker = source[index + marker.length];
    if (atLineStart && (afterMarker === '\n' || afterMarker === '\r')) starts.push(index);
  }
  if (starts.length !== 1) {
    throw new Error(`Expected exactly one vendor region ${path}; found ${starts.length}`);
  }

  const start = starts[0];
  if (start === undefined) throw new Error(`Missing vendor region ${path}`);
  const endMarker = '//#endregion';
  const endStart = source.indexOf(endMarker, start + marker.length);
  if (endStart < 0 || endStart > 0 && source[endStart - 1] !== '\n') {
    throw new Error(`Missing region end for vendor region ${path}`);
  }
  return source.slice(start, endStart + endMarker.length);
}

export type RuntimeNodeSelector = {
  region?: string;
  kind: 'function' | 'class' | 'assignment';
  name: string;
};

export function extractRuntimeNode(source: string, selector: RuntimeNodeSelector): string {
  if (!selector.name.trim()) throw new Error('A runtime node name is required');
  const scopedSource = selector.region ? extractVendorRegion(selector.region, source) : source;
  const file = ts.createSourceFile('Online.js', scopedSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const parseDiagnostics = (file as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics ?? [];
  if (parseDiagnostics.length) {
    const diagnostic = parseDiagnostics[0];
    const message = diagnostic ? ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') : 'Invalid JavaScript';
    throw new Error(`Cannot parse runtime source: ${message}`);
  }

  const matches: ts.Node[] = [];
  function visit(node: ts.Node): void {
    if (selector.kind === 'function'
      && (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node))
      && node.name?.text === selector.name) {
      matches.push(node);
    } else if (selector.kind === 'class') {
      const isClass = ts.isClassDeclaration(node) || ts.isClassExpression(node);
      if (isClass && (node.name?.text === selector.name || isAssignedClass(node, file, selector.name))) {
        matches.push(node);
      }
    } else if (selector.kind === 'assignment'
      && ((ts.isBinaryExpression(node)
        && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && node.left.getText(file) === selector.name)
        || (ts.isVariableDeclaration(node)
          && ts.isIdentifier(node.name)
          && node.name.text === selector.name
          && node.initializer !== undefined))) {
      matches.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${selector.kind} owner ${selector.name}; found ${matches.length}`);
  }
  return matches[0]!.getText(file);
}

function isAssignedClass(node: ts.ClassExpression | ts.ClassDeclaration, file: ts.SourceFile, name: string): boolean {
  if (!ts.isClassExpression(node)) return false;
  const parent = node.parent;
  if (ts.isVariableDeclaration(parent)) return parent.name.getText(file) === name;
  return ts.isBinaryExpression(parent)
    && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && parent.right === node
    && parent.left.getText(file) === name;
}
