import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { auditCoreOwnership, compareRuntimeSources } from '../scripts/check-runtime-consolidation.mjs';
import * as displayLocalization from '../scripts/lastro-display-localization.mjs';
import { patchRuntimeEntityAppearance } from '../scripts/lastro-entity-appearance.mjs';
import { patchRuntimeEquipmentAppearance, patchRuntimeEquipmentCatalog, patchRuntimeEquipmentView } from '../scripts/lastro-equipment-view.mjs';
import { patchRuntimeUiState } from '../scripts/lastro-ui-state.mjs';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';
import { buildRuntimePatchFixture } from './helpers/runtime-patch-fixture';

const layoutRetirement = {
  module: './lastro-ui-layout.mjs',
  imported: 'patchRuntimeUiLayout',
  local: 'patchScopedUiLayout',
  callOwner: 'patchV2Runtime',
};
const task9Retirements = [
  { module: './lastro-typography.mjs', imported: 'patchRuntimeTypography', local: 'patchRuntimeTypography', callOwner: 'patchV2Runtime' },
  { module: './lastro-dialog-typography.mjs', imported: 'patchRuntimeDialogTypography', local: 'patchRuntimeDialogTypography', callOwner: 'patchV2Runtime' },
  layoutRetirement,
  { module: './lastro-basic-info.mjs', imported: 'patchRuntimeBasicInfoLayout', local: 'patchRuntimeBasicInfoLayout', callOwner: 'patchV2Runtime' },
  { module: './lastro-mail.mjs', imported: 'patchRuntimeMail', local: 'patchRuntimeMail', callOwner: 'patchV2Runtime' },
  { module: './lastro-shop-titles.mjs', imported: 'patchRuntimeShopTitles', local: 'patchRuntimeShopTitles', callOwner: 'patchV2Runtime' },
];

function audit(patcherSource: string, retiredTransforms = [layoutRetirement], ownership: Record<string, unknown> = {}) {
  return auditCoreOwnership({
    vendorSource: 'function permanentCore() {}',
    patcherSource,
    prepareSource: "import './patch-v2-runtime.mjs';",
    retiredTransforms,
    retiredHostExports: [],
    ...ownership,
  });
}

describe('runtime consolidation source helpers', () => {
  it('keeps combined localization exports and self-contained serialized factory inputs', () => {
    for (const name of [
      'patchRuntimeMapLocalization', 'patchRuntimeStatusTooltips', 'patchRuntimeUiText',
      'patchRuntimeUiMessages', 'patchRuntimeEmoticons', 'patchRuntimeItemName',
      'createLastroMapLocalization', 'createLastroUiMessages', 'setLastroStatusTooltip',
      'assertRuntimeLocalizationMount', 'JOB_NAME_OVERRIDES', 'RUNTIME_TEXT_REPLACEMENTS',
      'MESSAGE_FALLBACKS', 'MAP_NAME_OVERRIDES', 'MAP_TITLE_OVERRIDES',
      'SKILL_NAME_OVERRIDES', 'SKILL_DESCRIPTION_OVERRIDES', 'UI_MESSAGE_OVERRIDES',
      'patchRuntimeLocalization', 'patchRuntimeJobLocalization', 'patchRuntimeSkillLocalization',
    ]) expect(displayLocalization[name as keyof typeof displayLocalization]).toBeDefined();

    const source = readFileSync('vendor/v2/Online.js', 'utf8');
    const output = displayLocalization.patchRuntimeMapLocalization(source);
    const ast = ts.createSourceFile('localized.js', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    let expression = '';
    function visit(node: ts.Node) {
      if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'LastROMapLocalization' && node.initializer) {
        expression = node.initializer.getText(ast);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    expect(expression).not.toBe('');
    const runtimeFactory = runInNewContext(expression) as ReturnType<typeof displayLocalization.createLastroMapLocalization>;
    const [mapId, mapName] = Object.entries(displayLocalization.MAP_NAME_OVERRIDES)[0]!;
    expect(runtimeFactory.resolveName(mapId, mapName)).toBe(mapName);
    expect(runtimeFactory.resolveName('unknown-map', 'Prontera')).toBe(displayLocalization.MAP_TITLE_OVERRIDES.Prontera);
    expect(() => runInNewContext(`(${displayLocalization.createLastroMapLocalization.toString()})()`)).toThrow();
  });

  it('resolves the packet layout transform only from its renamed module', async () => {
    const previousModule = new URL(`../scripts/${['lastro', 'network', 'security'].join('-')}.mjs`, import.meta.url);
    expect(existsSync(previousModule)).toBe(false);
    const packetLayouts = await import('../scripts/lastro-item-packet-layouts.mjs');
    expect(packetLayouts.patchRuntimeLastROItemLayouts).toBeTypeOf('function');
  });

  it('reads the current vendor source for unique region extraction', () => {
    const source = readVendorSource();
    expect(extractVendorRegion('src/Audio/BGM.js', source)).toContain('//#region src/Audio/BGM.js');
  });

  it('builds residual patch fixtures from the current vendor core owners', () => {
    const vendor = readVendorSource();
    const fixture = buildRuntimePatchFixture(vendor);
    for (const region of [
      'src/Core/MemoryItem.js',
      'src/Core/MemoryManager.js',
      'src/Core/Preferences.js',
      'src/Audio/BGM.js',
      'src/Audio/SoundManager.js',
      'src/Renderer/Effects/RainWeather.js',
      'src/UI/Common.css?raw',
      'src/UI/Components/WorldMap/WorldMap.js',
    ]) {
      expect(fixture).toContain(extractVendorRegion(region, vendor));
    }
    expect(fixture).toContain(extractRuntimeNode(vendor, {
      region: 'src/Renderer/MapRenderer.js',
      kind: 'function',
      name: 'onMapComplete',
    }));
    for (const name of ['onMapChange', 'cleanGameUI']) {
      expect(fixture).toContain(extractRuntimeNode(vendor, {
        region: 'src/Engine/MapEngine.js',
        kind: 'function',
        name,
      }));
    }
    expect(fixture).toContain('function defaultSocketFactory(host, port)');
    expect(fixture).toContain('function initThread()');
  });

  it('permanent clock route and input compose without retained appearance patches', () => {
    const vendor = readVendorSource();
    for (const name of ['LastROServerClockNow', 'LastROResetServerTick', 'LastROInvalidateServerTick', 'LastROAdvanceServerTick']) {
      expect(extractRuntimeNode(vendor, { region: 'src/Renderer/Renderer.js', kind: 'function', name })).toContain(name);
    }
    expect(extractRuntimeNode(vendor, { region: 'src/Core/Events.js', kind: 'function', name: 'LastROEventDueTick' })).toContain('return lastroEventDueTick');
    expect(extractRuntimeNode(vendor, { region: 'src/Renderer/Entity/EntityWalk.js', kind: 'function', name: 'findLastroServerWalkPath' }))
      .toContain('const MAX_STEPS = 32, MAX_NODES = 2048');
    expect(extractRuntimeNode(vendor, { region: 'src/Renderer/Entity/EntityWalk.js', kind: 'function', name: 'lastroCancelMovement' }))
      .toContain('entity._lastroMovementEpoch = epoch + 1');
    expect(extractRuntimeNode(vendor, { kind: 'assignment', name: 'refreshLastroGroundInput' }))
      .toContain('event?.composedPath?.()');

    const retainedAppearanceInput = [
      'src/Renderer/Entity/EntityAction.js',
      'src/Renderer/Entity/EntityView.js',
      'src/DB/Monsters/MonsterTable.js',
      'src/DB/DBManager.js',
      'src/Engine/MapEngine/Entity.js',
    ].map(name => extractVendorRegion(name, vendor)).join('\n');
    const composed = patchRuntimeEntityAppearance(retainedAppearanceInput);
    expect(composed).toContain('function applyLastROMercenaryAppearance(pkt)');
    expect(vendor).not.toContain('function applyLastROMercenaryAppearance(pkt)');
    expect(vendor).not.toContain('const LastROMonsterAppearanceFallbacks =');
  });

  it('permanent weapon fallback composes with retained equipment catalog, view and appearance transforms', () => {
    const vendor = readVendorSource();
    const composed = patchRuntimeEquipmentAppearance(
      patchRuntimeEquipmentView(patchRuntimeEquipmentCatalog(vendor)),
    );
    const db = extractRuntimeNode(composed, {
      region: 'src/DB/DBManager.js',
      kind: 'class',
      name: 'DB',
    });
    expect(db).toContain('getWeaponFallbackViewID');
  });

  it('permanent cooldown survives the retained ui-state Shortcut append wrapping', () => {
    const vendor = readVendorSource();
    const wrapped = patchRuntimeUiState(vendor);
    const append = extractRuntimeNode(wrapped, {
      region: 'src/UI/Components/ShortCut/ShortCut.js',
      kind: 'assignment',
      name: 'ShortCut.onAppend',
    });
    expect(wrapped).toContain('function lastroUiWindowAppend(');
    expect(append).toContain('return lastroUiWindowAppend(this, _preferences$19, () => {');
    expect(append).toContain('_lastroCooldownDuration');
  });

  it('keeps every costume-loop helper token identical to its retained module', () => {
    const embedded = extractRuntimeNode(readVendorSource(), {
      region: 'src/Renderer/Entity/EntityRender.js',
      kind: 'function',
      name: 'sampleLastroCostumeLoop',
    });
    const retained = extractRuntimeNode(readFileSync('scripts/lastro-costume-loop.mjs', 'utf8'), {
      kind: 'function',
      name: 'sampleLastroCostumeLoop',
    });
    const tokens = (source: string) => {
      const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, source);
      const result: string[] = [];
      for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan())
        result.push(`${token}:${scanner.getTokenText()}`);
      return result;
    };
    const moduleTokens = tokens(retained);
    expect(moduleTokens[0]).toBe(`${ts.SyntaxKind.ExportKeyword}:export`);
    expect(moduleTokens.slice(1)).toEqual(tokens(embedded));
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

  it('allows only token-identical audio declarations to move after imports', () => {
    const before = `
function installLastROWebAudio() { return 1; }
const LastROWebAudio = installLastROWebAudio();
import { account } from './account.mjs';
function workerPolicy() { return account; }
function installLastROAudioUnlock() { return 2; }
function LastROAudioPlay() { return 3; }
function LastROAudioUnlock() { return 4; }
function LastROAudioRegisterContext() { return 5; }
installLastROAudioUnlock();
import { vendor } from './vendor.mjs';
function runtime() { return LastROWebAudio; }
function unrelatedRuntimeHelper() { return 6; }
`;
    const after = `
import { account } from './account.mjs';
function workerPolicy() { return account; }
import { vendor } from './vendor.mjs';
function installLastROWebAudio() { return 1; }
const LastROWebAudio = installLastROWebAudio();
function installLastROAudioUnlock() { return 2; }
function LastROAudioPlay() { return 3; }
function LastROAudioUnlock() { return 4; }
function LastROAudioRegisterContext() { return 5; }
installLastROAudioUnlock();
function runtime() { return LastROWebAudio; }
function unrelatedRuntimeHelper() { return 6; }
`;

    expect(compareRuntimeSources(before, after, { stage: 'audio' }))
      .toMatchObject({
        equal: true,
        differences: [],
        relocatedOwners: expect.arrayContaining([
          'function:installLastROWebAudio',
          'variable:LastROWebAudio',
          'call:installLastROAudioUnlock',
        ]),
      });
    expect(compareRuntimeSources(before, after, { stage: 'sync' }))
      .toMatchObject({ equal: true, differences: [] });

    const changedBody = after.replace('return 5;', 'return 6;');
    const changed = compareRuntimeSources(before, changedBody, { stage: 'audio' });
    expect(changed.equal).toBe(false);
    expect(changed.differences).toEqual([
      expect.objectContaining({ owner: 'function:LastROAudioRegisterContext' }),
    ]);

    const duplicate = after.replace(
      'function runtime() { return LastROWebAudio; }',
      'function LastROAudioRegisterContext() { return 5; }\nfunction runtime() { return LastROWebAudio; }',
    );
    expect(compareRuntimeSources(before, duplicate, { stage: 'audio' }).differences)
      .toContainEqual(expect.objectContaining({
        owner: 'function:LastROAudioRegisterContext',
        kind: 'audio-owner-count',
      }));

    const interleaved = after.replace(
      'const LastROWebAudio = installLastROWebAudio();',
      'function interleavedRuntimeOwner() {}\nconst LastROWebAudio = installLastROWebAudio();',
    );
    expect(compareRuntimeSources(before, interleaved, { stage: 'audio' }).differences)
      .toContainEqual(expect.objectContaining({ kind: 'audio-relocation-placement' }));

    const reorderedInitializers = after.replace(
      'const LastROWebAudio = installLastROWebAudio();',
      'installLastROAudioUnlock();\nconst LastROWebAudio = installLastROWebAudio();',
    ).replace('installLastROAudioUnlock();\nfunction runtime()', 'function runtime()');
    expect(compareRuntimeSources(before, reorderedInitializers, { stage: 'audio' }).equal).toBe(false);

    const reorderedUnrelatedOwners = after.replace(
      'function runtime() { return LastROWebAudio; }\nfunction unrelatedRuntimeHelper() { return 6; }',
      'function unrelatedRuntimeHelper() { return 6; }\nfunction runtime() { return LastROWebAudio; }',
    );
    expect(compareRuntimeSources(before, reorderedUnrelatedOwners, { stage: 'sync' }).differences)
      .toContainEqual(expect.objectContaining({ owner: 'source-file order', kind: 'owner-order' }));
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

  it('keeps the shared ownership audit compatible with scoped core checks', () => {
    const diagnostics = auditCoreOwnership({
      vendorSource: 'function permanentCore() {}',
      patcherSource: readFileSync(new URL('../scripts/patch-v2-runtime.mjs', import.meta.url), 'utf8'),
      prepareSource: readFileSync(new URL('../scripts/prepare-runtime.mjs', import.meta.url), 'utf8'),
      retiredTransforms: [
        { module: './lastro-network-receive-recovery.mjs', imported: 'patchRuntimeNetworkFramingRecovery', local: 'patchRuntimeNetworkFramingRecovery', callOwner: 'patchV2Runtime' },
        { module: './lastro-network-receive-recovery.mjs', imported: 'patchRuntimeNetworkCloseDrain', local: 'patchRuntimeNetworkCloseDrain', callOwner: 'patchV2Runtime' },
      ],
      retiredHostExports: [],
    });
    expect(diagnostics).toEqual([]);
  });

  it('retires the six permanent UI transforms while retaining the product layout', () => {
    const patcherSource = readFileSync(new URL('../scripts/patch-v2-runtime.mjs', import.meta.url), 'utf8');
    const diagnostics = auditCoreOwnership({
      vendorSource: readVendorSource(),
      patcherSource,
      prepareSource: readFileSync(new URL('../scripts/prepare-runtime.mjs', import.meta.url), 'utf8'),
      retiredTransforms: task9Retirements,
      retiredHostExports: [],
    });
    expect(diagnostics).toEqual([]);
    expect(patcherSource).toContain('output = patchRuntimeUiLayout(output);');
    expect(patcherSource).not.toContain('patchScopedUiLayout');
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

  it('accepts only the exact relocated localization binding and rejects stale ownership', () => {
    const retired = {
      module: './lastro-ui-text.mjs',
      imported: 'patchRuntimeUiText',
      local: 'patchRuntimeUiText',
      callOwner: 'patchV2Runtime',
    };
    const relocated = {
      retiredModule: retired.module,
      retiredExport: retired.imported,
      module: './lastro-display-localization.mjs',
      imported: retired.imported,
      local: retired.local,
      callOwner: retired.callOwner,
      patcherImport: true,
    };
    const ownership = {
      relocatedBindings: [relocated],
      coordinatorBindings: [],
      forbiddenHostDefinitions: [],
    };
    const valid = `
import { patchRuntimeUiText } from './lastro-display-localization.mjs';
function patchV2Runtime(source) { return patchRuntimeUiText(source); }`;
    expect(audit(valid, [retired], ownership)).toEqual([]);

    const oldImport = `
import { patchRuntimeUiText } from './lastro-ui-text.mjs';
function patchV2Runtime(source) { return patchRuntimeUiText(source); }`;
    expect(audit(oldImport, [retired], ownership).some(message => message.includes('retired import'))).toBe(true);

    const orphanCall = 'function patchV2Runtime(source) { return patchRuntimeUiText(source); }';
    expect(audit(orphanCall, [retired], ownership).some(message => message.includes('retired call'))).toBe(true);

    const unknownSource = `
import { patchRuntimeUiText } from './unknown-localization.mjs';
function patchV2Runtime(source) { return patchRuntimeUiText(source); }`;
    const unknownDiagnostics = audit(unknownSource, [retired], ownership);
    expect(unknownDiagnostics.some(message => message.includes('expected exactly once'))).toBe(true);
    expect(unknownDiagnostics.some(message => message.includes('retired call'))).toBe(true);

    const shadowedImport = `
import { patchRuntimeUiText } from './lastro-display-localization.mjs';
function patchV2Runtime(source) {
  const patchRuntimeUiText = value => value;
  return patchRuntimeUiText(source);
}`;
    expect(audit(shadowedImport, [retired], ownership)
      .some(message => message.includes('shadowed by owner-local'))).toBe(true);
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
