import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { extractVendorRegion } from './helpers/vendor-runtime';

type Selection = { region: string; kind: 'region' | 'function' | 'method' | 'variable' | 'assignment' | 'expression-assignment'; name?: string };
type Provenance = {
  path: string; fixturePath?: string; sourceCommit: string; sourceSha256: string; fixtureSha256: string;
  transformPath?: string; transformSha256?: string; sourceSelections?: Record<string, Selection[]>;
};
const provenance = JSON.parse(readFileSync('test/fixtures/runtime-consolidation/provenance.json', 'utf8')) as { fixtures: Provenance[] };
const legacyPaths = ['audio-pre-timing', 'emoticons-upstream', 'party-state-upstream', 'showshop-upstream'];
const fixtures = provenance.fixtures.map((entry, index) => ({
  ...entry, fixturePath: entry.fixturePath ?? `test/fixtures/runtime-consolidation/${legacyPaths[index]}.json`,
}));
const sources = new Map<string, string>();
const sha256 = (source: string | Buffer) => createHash('sha256').update(source).digest('hex');
function gitSource(commit: string, path: string) {
  const key = `${commit}:${path}`;
  if (!sources.has(key)) sources.set(key, execFileSync('git', ['show', key], { encoding: 'utf8', maxBuffer: 20_000_000 }));
  return sources.get(key)!;
}
function select(source: string, selection: Selection): string {
  const scoped = extractVendorRegion(selection.region, source);
  if (selection.kind === 'region') return scoped;
  const file = ts.createSourceFile(selection.region, scoped, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches: ts.Node[] = [];
  function visit(node: ts.Node) {
    if (selection.kind === 'function' && ts.isFunctionDeclaration(node) && node.name?.text === selection.name
      || selection.kind === 'method' && ts.isMethodDeclaration(node) && node.name.getText(file) === selection.name
      || selection.kind === 'variable' && ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(file) === selection.name)
      || selection.kind === 'assignment' && ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && node.left.getText(file) === selection.name
      || selection.kind === 'expression-assignment' && ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)
        && node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken && node.expression.left.getText(file) === selection.name) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  expect(matches, JSON.stringify(selection)).toHaveLength(1);
  return matches[0]!.getText(file) + (selection.kind === 'assignment' ? ';' : '');
}

describe('bounded historical runtime fixture provenance', () => {
  it.each(fixtures)('pins $fixturePath to its actual Git source and exact fixture bytes', entry => {
    const bytes = readFileSync(entry.fixturePath);
    expect(sha256(bytes)).toBe(entry.fixtureSha256);
    const source = gitSource(entry.sourceCommit, entry.path);
    expect(sha256(source)).toBe(entry.sourceSha256);
    if (entry.transformPath) expect(sha256(gitSource(entry.sourceCommit, entry.transformPath))).toBe(entry.transformSha256);
    if (entry.sourceSelections) {
      const extracted = Object.fromEntries(Object.entries(entry.sourceSelections)
        .map(([key, selections]) => [key, selections.map(selection => select(source, selection)).join('\n')]));
      expect(JSON.parse(bytes.toString('utf8'))).toEqual(extracted);
      expect(bytes.toString('utf8')).toBe(JSON.stringify(extracted, null, 2) + '\n');
    }
  });
});
