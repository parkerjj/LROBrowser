import { describe, expect, it } from 'vitest';
import { auditCoreOwnership, compareRuntimeSources } from '../scripts/check-runtime-consolidation.mjs';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const layoutRetirement = {
  module: './lastro-ui-layout.mjs',
  imported: 'patchRuntimeUiLayout',
  local: 'patchScopedUiLayout',
  callOwner: 'patchV2Runtime',
};

function audit(patcherSource: string, retiredTransforms = [layoutRetirement]) {
  return auditCoreOwnership({
    vendorSource: 'function permanentCore() {}',
    patcherSource,
    prepareSource: "import './patch-v2-runtime.mjs';",
    retiredTransforms,
    retiredHostExports: [],
  });
}

describe('runtime consolidation source helpers', () => {
  it('reads the current vendor source for unique region extraction', () => {
    const source = readVendorSource();
    expect(extractVendorRegion('src/Audio/BGM.js', source)).toContain('//#region src/Audio/BGM.js');
  });

  it('rejects missing or duplicated AST owners', () => {
    expect(() => extractRuntimeNode('function present() {}', {
      kind: 'function',
      name: 'missing',
    })).toThrow(/expected exactly one/i);

    expect(() => extractRuntimeNode('function duplicate() {} function duplicate() {}', {
      kind: 'function',
      name: 'duplicate',
    })).toThrow(/found 2/i);

    const expression = extractRuntimeNode('const Hook = function namedHook() { return 1; };', {
      kind: 'function',
      name: 'namedHook',
    });
    expect(expression).toContain('function namedHook()');

    const classExpression = extractRuntimeNode('const Widget = class Widget { render() {} };', {
      kind: 'class',
      name: 'Widget',
    });
    expect(classExpression).toContain('class Widget');
    const assignment = extractRuntimeNode('Panel.mount = function () { return true; };', {
      kind: 'assignment',
      name: 'Panel.mount',
    });
    expect(assignment).toContain('Panel.mount = function');

    expect(() => extractVendorRegion('src/Nope.js', '//#region src/Other.js\n//#endregion'))
      .toThrow(/found 0/i);
    expect(() => extractVendorRegion('src/Repeated.js', [1, 2].map(() =>
      '//#region src/Repeated.js\nconst item = 1;\n//#endregion').join('\n')))
      .toThrow(/found 2/i);
  });

  it('preserves decoded HTML/CSS strings in comparison', () => {
    const before = String.raw`function render() {
  const html = "\x3csection title=\"LastRO\">";
  const css = ".window { color: r\x65d; }";
  return html + css;
}`;
    const sameDecodedValues = String.raw`function render() {
  const html = '<section title="LastRO">';
  const css = '.window { color: red; }';
  return html + css;
}`;

    expect(compareRuntimeSources(before, sameDecodedValues, { stage: 'ui-layout' }))
      .toMatchObject({ equal: true, differences: [] });

    const changedLiteral = sameDecodedValues.replace('color: red', 'color: blue');
    const comparison = compareRuntimeSources(before, changedLiteral, { stage: 'ui-layout' });
    expect(comparison.equal).toBe(false);
    expect(comparison.differences).toEqual([
      expect.objectContaining({ owner: 'function:render', kind: 'literal' }),
    ]);
    expect(comparison.differences[0]?.detail).toContain('blue');
  });

  it('rejects retired transform calls instead of accepting no-op', () => {
    const patcher = `
import { patchRuntimeUiLayout as patchScopedUiLayout } from './lastro-ui-layout.mjs';
function patchV2Runtime(source) {
  return patchScopedUiLayout(source);
}`;
    const diagnostics = audit(patcher);
    expect(diagnostics.some(message => message.includes('retired import'))).toBe(true);
    expect(diagnostics.some(message => message.includes('retired call'))).toBe(true);

    const importRemovedButCallLeft = `
function patchV2Runtime(source) {
  return patchScopedUiLayout(source);
}`;
    expect(audit(importRemovedButCallLeft).some(message => message.includes('retired call'))).toBe(true);

    const namespaceImport = `
import * as layout from './lastro-ui-layout.mjs';
function patchV2Runtime(source) {
  return layout.patchRuntimeUiLayout(source);
}`;
    expect(audit(namespaceImport).some(message => message.includes('retired namespace import'))).toBe(true);
  });

  it('distinguishes retired scoped layout import from retained local product layout', () => {
    const patcher = `
import { patchRuntimeUiLayout as patchScopedUiLayout } from './lastro-ui-layout.mjs';
function patchRuntimeUiLayout(source) { return source + ':product'; }
function patchV2Runtime(source) { return patchScopedUiLayout(source); }
const productSource = patchRuntimeUiLayout('bundle');`;
    const diagnostics = audit(patcher);
    expect(diagnostics.some(message => message.includes('patchScopedUiLayout'))).toBe(true);
    expect(diagnostics.some(message => message.includes('patchRuntimeUiLayout') && message.includes('retired call'))).toBe(false);

    const retainedProductOnly = `
function patchRuntimeUiLayout(source) { return source + ':product'; }
function patchV2Runtime(source) { return source; }
const productSource = patchRuntimeUiLayout('bundle');`;
    expect(audit(retainedProductOnly)).toEqual([]);
  });

  it('checks permanent top-level owners and keeps migration tooling out of prepare', () => {
    const diagnostics = auditCoreOwnership({
      vendorSource: 'function permanentHelper() {}',
      patcherSource: 'const output = `function permanentHelper() {}\\n${source}`;',
      prepareSource: "import '../generated/runtime-consolidation/migrate-runtime-core.mjs';",
      retiredTransforms: [],
      retiredHostExports: ['permanentHelper'],
    });
    expect(diagnostics.some(message => message.includes('retired host export permanentHelper'))).toBe(true);
    expect(diagnostics.some(message => message.includes('prepare references migration tooling'))).toBe(true);
  });
});
