import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';

const vendor = readVendorSource();
const scopedLayouts = {
  'CashShop/CashShop': ['#CashShop .panel-cart-charge-btn { display: none; }', 'background-size: 723px 540px'],
  'EntityRoom/EntityRoom': ['.EntityRoom .overlay { pointer-events: none; }'],
  'EntitySignboard/EntitySignboard': ['.EntitySignboard .overlay { pointer-events: none; }'],
  'ChatRoomCreate/ChatRoomCreate': ['#ChatRoomCreate .container { display: table;', 'padding-right: 7px;'],
  'CartItems/CartItems': ['#cartitems .footer .cnt, #cartitems .footer .wt { position: static;', 'margin-left: 12px;'],
  'Storage/StorageV3/Storage': ['#Storage .footer .search-input { box-sizing: border-box;', 'width: 136px;'],
  'SkillList/SkillListV2/SkillListV2': ['#SkillListV2 .content div.name { overflow: hidden;', 'text-overflow: ellipsis;'],
};
const previewRequiredPaths = [
  'CashShop/CashShop',
  'ChatRoomCreate/ChatRoomCreate',
  'CartItems/CartItems',
  'Storage/StorageV3/Storage',
  'SkillList/SkillListV2/SkillListV2',
];
const previewMarkerlessPaths = [
  'Inventory/InventoryV3/InventoryV3',
  'ChatBoxSettings/ChatBoxSettings',
  'GraphicsOption/GraphicsOption',
];

function cssText(path: string) {
  const region = extractVendorRegion(`src/UI/Components/${path}.css?raw`, vendor);
  const file = ts.createSourceFile('component-css.js', region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const variable = `${path.split('/').at(-1)}_default$1`;
  const assignments: ts.BinaryExpression[] = [];
  function visit(node: ts.Node) {
    if (ts.isBinaryExpression(node) && node.left.getText(file) === variable && ts.isStringLiteral(node.right)
      && [ts.SyntaxKind.EqualsToken, ts.SyntaxKind.PlusEqualsToken].includes(node.operatorToken.kind)) assignments.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (assignments.filter(node => node.operatorToken.kind === ts.SyntaxKind.EqualsToken).length !== 1)
    throw new Error(`Expected one CSS initializer for ${path}; found ${assignments.length}`);
  let css = '';
  for (const assignment of assignments) {
    const value = (assignment.right as ts.StringLiteral).text;
    css = assignment.operatorToken.kind === ts.SyntaxKind.EqualsToken ? value : css + value;
  }
  return css;
}

describe('permanent scoped native UI layout', () => {
  it('keeps every selected CSS fix in its exact vendor component owner', () => {
    for (const [path, snippets] of Object.entries(scopedLayouts)) {
      const css = cssText(path);
      const marker = `\n/* LASTRO scoped UI layout: ${path} */\n`;
      expect(css.split(marker)).toHaveLength(2);
      for (const snippet of snippets) expect(css).toContain(snippet);
    }
  });

  it('uses one marker for preview paths that receive scoped CSS', () => {
    for (const path of previewRequiredPaths) {
      const css = cssText(path), marker = `\n/* LASTRO scoped UI layout: ${path} */\n`;
      expect(css.split(marker)).toHaveLength(2);
      expect(css.indexOf(marker)).toBeGreaterThan(0);
    }
  });

  it('allows markerless Inventory, ChatBoxSettings and GraphicsOption preview paths', () => {
    for (const path of previewMarkerlessPaths) {
      const css = cssText(path);
      expect(css).not.toContain('LASTRO scoped UI layout:');
      const beforeCss = css;
      const fixedCss = css;
      expect(fixedCss).toBe(beforeCss);
    }
  });

  it('reads fixed preview CSS from generated runtime and checks markers by path', () => {
    const preview = readFileSync(new URL('../scripts/preview-ui-review.mjs', import.meta.url), 'utf8');
    expect(preview).not.toContain("from './lastro-ui-layout.mjs'");
    expect(preview).not.toContain('patchRuntimeUiLayout(runtime)');
    expect(preview).toContain("getString(runtime, window.path, 'css')");
    expect(preview).toContain('scopedLayoutPaths.has(window.path)');
    expect(preview).toContain('window.fixedCss = css;');
    for (const path of previewRequiredPaths) expect(preview).toContain(`'${path}'`);
    for (const path of previewMarkerlessPaths) expect(preview).toContain(`'${path}'`);
  });
});
