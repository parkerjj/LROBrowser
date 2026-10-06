import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { auditCoreOwnership, compareRuntimeSources, permanentRuntimeModules } from '../scripts/check-runtime-consolidation.mjs';
import type { PermanentRuntimeOwner } from '../scripts/check-runtime-consolidation.mjs';
import * as displayLocalization from '../scripts/lastro-display-localization.mjs';
import { patchRuntimeEntityAppearance } from '../scripts/lastro-entity-appearance.mjs';
import { patchRuntimeEquipmentAppearance, patchRuntimeEquipmentCatalog, patchRuntimeEquipmentView } from '../scripts/lastro-equipment-view.mjs';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';
import { buildRuntimePatchFixture } from './helpers/runtime-patch-fixture';
import { extractWorldMapFixture } from '../scripts/extract-worldmap-fixture.mjs';
import { initializeWorldMap } from './helpers/worldmap-runtime';
import { buildWorldMapComparisonPair, mutateNpcResolverLoader } from './helpers/worldmap-comparison';

describe('complete final core ownership gates', () => {
  const worldMapFileUrl = new URL('../scripts/lastro-worldmap.mjs', import.meta.url).href;
  const patcherSource = readFileSync('scripts/patch-v2-runtime.mjs', 'utf8');
  const prepareSource = readFileSync('scripts/prepare-runtime.mjs', 'utf8');
  const patcherDeclarationsSource = readFileSync('scripts/patch-v2-runtime.d.mts', 'utf8');
  const finalAudit = (overrides: Record<string, unknown> = {}) => auditCoreOwnership({
    vendorSource: '', patcherSource, prepareSource, patcherDeclarationsSource,
    retiredTransforms: [], retiredHostExports: [], strictCoreAudit: true, ...overrides,
  });

  it('audits all 31 permanent modules with the fixed 40 retirements and 12 relocations', async () => {
    const checker = await import('../scripts/check-runtime-consolidation.mjs');
    const modules = (checker as unknown as { permanentRuntimeModules?: { module: string }[] }).permanentRuntimeModules;
    expect(modules).toBeDefined();
    expect(modules?.map(row => row.module).sort()).toEqual([
      'network-receive-recovery', 'frame-timing', 'audio-timing', 'entity-sync', 'movement-input',
      'movement-sync', 'equipment-animation', 'equipment-cart', 'weapon-view-fallback', 'manual-skill',
      'skill-cooldown', 'party-state', 'monster-hover-hp', 'vending-movement', 'item-drag', 'ui-layout',
      'ui-input', 'ui-state', 'store-scroll', 'storage-count', 'basic-info', 'dialog-typography',
      'typography', 'navigation-ui', 'npc-dialog-buttons', 'mail', 'shop-titles', 'map-resource-name',
      'map-load-diagnostic', 'worldmap', 'monster-portrait',
    ].map(name => './lastro-' + name + '.mjs').sort());
    expect(finalAudit({ vendorSource: readVendorSource() })).toEqual([]);
  }, 30000);

  it.each(['patchWebAudioPlayback', 'patchRuntimePreferencesSave', 'patchRuntimeWorldMap', 'patchMapLoadFailureRecovery'])(
    'rejects reintroduced retired host API %s without requiring a vendor wrapper', name => {
      const definition = 'export function ' + name + '(source) { return source; }';
      expect(finalAudit({ patcherSource: patcherSource + '\n' + definition }).some(message => message.includes('retired host transform ' + name))).toBe(true);
      expect(finalAudit({ patcherSource: patcherSource + '\n' + name + '(source);' }).some(message => message.includes('retired host transform ' + name))).toBe(true);
      expect(finalAudit({ patcherDeclarationsSource: patcherDeclarationsSource + '\nexport function ' + name + '(source: string): string;' }).some(message => message.includes('retired host transform ' + name))).toBe(true);
      expect(finalAudit({ patcherSource: "import * as host from './unknown.mjs'; const copy = host['" + name + "']; function patchV2Runtime(source) { return copy(source); }" })
        .some(message => message.includes('retired host transform ' + name))).toBe(true);
    }, 30000);

  it.each(['createWorldMapIndex', 'createMonsterPortraitLoader', 'installLastroWorldMap', 'createLastroSoundTiming'])(
    'rejects missing or duplicate actual embedded factory %s', name => {
      const vendorSource = readVendorSource();
      const node = extractRuntimeNode(vendorSource, { kind: 'function', name });
      const renamed = node.replace('function ' + name, 'function missingPermanentFactory');
      expect(finalAudit({ vendorSource: vendorSource.replace(node, renamed) }).some(message => message.includes('permanent owner') && message.includes(name))).toBe(true);
      expect(finalAudit({ vendorSource: vendorSource + '\nconst duplicateFactory = (' + node + ');' }).some(message => message.includes('permanent owner') && message.includes(name))).toBe(true);
    }, 30000);

  it.each([
    'function patchV2Runtime(source) { const output = `function resolveLastroMapResourceName() {}\n${source}`; return output; }',
    'function patchV2Runtime(source) { return "function createWorldMapIndex() {}" + source; }',
    'function patchV2Runtime(source) { return `${source}\nconst installer = function installLastroWorldMap() {};`; }',
    'function patchV2Runtime(source) { return "function " + "createMonsterPortraitLoader() {}" + source; }',
  ])('rejects permanent definitions reinjected from decoded local code strings', patcher => {
    expect(finalAudit({ patcherSource: patcher }).some(message => message.includes('core reinjection'))).toBe(true);
  }, 30000);

  it('strict final ownership cannot suppress the fixed display gates through scoped options', () => {
    expect(finalAudit({
      patcherSource: patcherSource + '\nfunction patchRuntimeSkillLocalization(source) { return source; }',
      relocatedBindings: [], coordinatorBindings: [], forbiddenHostDefinitions: [],
    }).some(message => message.includes('moved coordinator patchRuntimeSkillLocalization'))).toBe(true);
  });

  it.each([
    "import { createWorldMapIndex as mirror } from './lastro-worldmap.mjs'; const again = mirror; function patchV2Runtime(source) { return again.toString() + source; }",
    "import * as mirror from './lastro-monster-portrait.mjs'; function patchV2Runtime(source) { return mirror.createMonsterPortraitLoader.toString() + source; }",
    "import { sampleLastroCostumeLoop as mirror } from './lastro-costume-loop.mjs'; function patchV2Runtime(source) { return mirror.toString() + source; }",
    "import * as mirror from './unknown.mjs'; function patchV2Runtime(source) { return mirror.createMonsterPortraitLoader.toString() + source; }",
    "import * as mirror from './lastro-worldmap.mjs?ownership-probe'; function patchV2Runtime(source) { return mirror.createWorldMapIndex.toString() + source; }",
    "import * as mirror from './lastro-worldmap.mjs#ownership-probe'; function patchV2Runtime(source) { return mirror.createWorldMapIndex.toString() + source; }",
    "import * as mirror from './temp/../lastro-worldmap.mjs'; function patchV2Runtime(source) { return mirror.createWorldMapIndex.toString() + source; }",
    `import * as mirror from '${worldMapFileUrl}'; function patchV2Runtime(source) { return mirror.createWorldMapIndex.toString() + source; }`,
    "import * as mirror from './unknown.mjs'; const { createWorldMapIndex: copy } = mirror; const again = copy; function patchV2Runtime(source) { return again.toString() + source; }",
    "import * as mirror from './unknown.mjs'; const { createWorldMapIndex } = mirror; function patchV2Runtime(source) { return createWorldMapIndex.toString() + source; }",
    "import * as mirror from './unknown.mjs'; function patchV2Runtime(source) { return mirror['createWorldMapIndex'].toString() + source; }",
    'function patchV2Runtime(source) { const mirror = resolveLastroMapResourceName; const again = mirror; return again.toString() + source; }',
  ])('rejects aliases of permanent mirror serialization', patcher => {
    expect(finalAudit({ patcherSource: patcher }).some(message => message.includes('core reinjection'))).toBe(true);
  }, 30000);

  it.each([
    "import * as mirror from './lastro-worldmap.mjs?ownership-probe';",
    "import * as mirror from './lastro-worldmap.mjs#ownership-probe';",
    "import * as mirror from './temp/../lastro-worldmap.mjs';",
    "import * as mirror from './%6castro-worldmap.mjs';",
    `import * as mirror from '${worldMapFileUrl}';`,
    "const mirror = require('./lastro-worldmap.mjs');",
    "import { createRequire } from 'node:module'; const load = createRequire(import.meta.url); const { WORLD_MAP_HTML } = load('./lastro-worldmap.mjs');",
    "import { createRequire as make } from 'node:module'; const creator = make; const load = creator(import.meta.url); const alias = load; alias('./lastro-worldmap.mjs?ownership-probe');",
    "import * as nodeModule from 'node:module'; const load = nodeModule.createRequire(import.meta.url); load('./lastro-monster-portrait.mjs');",
    "import * as nodeModule from 'module'; const { createRequire: make } = nodeModule; const load = make(import.meta.url); load('./lastro-map-resource-name.mjs');",
    "import { createRequire } from 'node:module'; createRequire(import.meta.url)('./lastro-map-load-diagnostic.mjs');",
  ])('rejects equivalent core module paths and actual runtime loaders', statement => {
    expect(finalAudit({ patcherSource: statement + '\nfunction patchV2Runtime(source) { return source; }' })
      .some(message => message.includes('core reinjection'))).toBe(true);
  }, 30000);

  it('keeps permanent ownership enforcement on prepare as well as the orchestrator', () => {
    expect(finalAudit({ prepareSource: prepareSource + '\nconst copy = describeLastroMapLoadFailure; copy.toString();' })
      .some(message => message.includes('core reinjection') && message.includes('prepare-runtime'))).toBe(true);
  }, 30000);

  it.each([
    'function serializeProduct(createWorldMapIndex) { return createWorldMapIndex.toString(); } function patchV2Runtime(source) { return source; }',
    'function serializeProduct({ createWorldMapIndex: copy }) { return copy.toString(); } function patchV2Runtime(source) { return source; }',
    "import * as product from './unknown-product.mjs'; function patchV2Runtime(source) { return product.installLastroToolsPanels.toString() + source; }",
    "import * as metadata from './unknown.mjs'; const { createWorldMapIndex: value } = metadata; function patchV2Runtime(source) { return source + typeof value; }",
    "function productLogger(path) { return path; } function patchV2Runtime(source) { productLogger('./lastro-worldmap.mjs'); return source; }",
    "function loadProduct(require) { return require('./lastro-worldmap.mjs'); } function patchV2Runtime(source) { return source; }",
    "import { createRequire as make } from './unknown-product.mjs'; const load = make(import.meta.url); function patchV2Runtime(source) { load('./lastro-worldmap.mjs'); return source; }",
  ])('permits distinct local parameters and product serialization', patcher => {
    expect(finalAudit({ patcherSource: patcher }).filter(message => message.includes('core reinjection'))).toEqual([]);
  }, 30000);
});

describe('every permanent module owner', () => {
  const source = readVendorSource();
  const file = ts.createSourceFile('actual-vendor.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const candidates = new Map<string, ts.Node[]>();
  const collect = (node: ts.Node) => {
    let key: string | undefined;
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name) key = 'function:' + node.name.text;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) key = 'variable:' + node.name.text;
    if (ts.isMethodDeclaration(node)) key = 'method:' + node.name.getText(file);
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) key = 'assignment:' + node.left.getText(file);
    if (ts.isCallExpression(node)) key = 'call:' + node.expression.getText(file);
    if (ts.isClassExpression(node) || ts.isClassDeclaration(node)) key = 'class:' + (node.name?.text
      ?? (ts.isBinaryExpression(node.parent) ? node.parent.left.getText(file) : undefined));
    if (key) candidates.set(key, [...(candidates.get(key) ?? []), node]);
    ts.forEachChild(node, collect);
  };
  collect(file);

  function actualOwner(owner: PermanentRuntimeOwner): string {
    const region = owner.region ? extractVendorRegion(owner.region, source) : undefined;
    const start = region ? source.indexOf(region) : 0, end = region ? start + region.length : source.length;
    const nodes = (candidates.get(owner.kind + ':' + owner.name) ?? []).filter(node => {
      if (node.getStart(file) < start || node.end > end) return false;
      if (owner.topLevel && node.parent !== file && node.parent?.parent !== file) return false;
      return true;
    });
    expect(nodes).toHaveLength(1);
    const node = nodes[0]!;
    if (ts.isFunctionExpression(node)) return `const factory = (${node.getText(file)});`;
    if (ts.isVariableDeclaration(node)) return `var ${node.getText(file)};`;
    if (ts.isMethodDeclaration(node)) return `class Owner { ${node.getText(file)} }`;
    if (ts.isClassExpression(node) && ts.isBinaryExpression(node.parent)) return node.parent.getText(file) + ';';
    return node.getText(file) + ';';
  }

  it.each(permanentRuntimeModules.flatMap(module => module.owners.map(owner => ({ module: module.module, owner }))))(
    '$module rejects missing or duplicate $owner.kind:$owner.name from its actual vendor node', ({ module, owner }) => {
      const actual = actualOwner(owner);
      const wrap = (text: string) => owner.region ? `//#region ${owner.region}\n${text}\n//#endregion` : text;
      const check = (vendorSource: string) => auditCoreOwnership({
        vendorSource, patcherSource: 'function patchV2Runtime(source) { return source; }', prepareSource: '',
        retiredTransforms: [], retiredHostExports: [], permanentModules: [{ module, owners: [owner] }],
      });
      expect(check(wrap(actual))).toEqual([]);
      expect(check(wrap(actual.replace(owner.name, 'missingPermanentOwner')))
        .some(message => message.includes('permanent owner') && message.includes(owner.name))).toBe(true);
      expect(check(wrap(actual + '\n' + actual))
        .some(message => message.includes('permanent owner') && message.includes(owner.name))).toBe(true);
    });
});

describe('permanent WorldMap core and product seam', () => {
  it('normal patching imports no core mirrors and retires full WorldMap/failure APIs', async () => {
    const patcher = readFileSync('scripts/patch-v2-runtime.mjs', 'utf8');
    const file = ts.createSourceFile('patcher.mjs', patcher, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const modules = file.statements.filter(ts.isImportDeclaration).map(node => (node.moduleSpecifier as ts.StringLiteral).text);
    for (const path of ['./lastro-worldmap.mjs', './lastro-monster-portrait.mjs', './lastro-map-resource-name.mjs', './lastro-map-load-diagnostic.mjs']) expect(modules).not.toContain(path);
    const api = await import('../scripts/patch-v2-runtime.mjs');
    expect(api.patchRuntimeWorldMapProductActions).toBeTypeOf('function');
    expect('patchRuntimeWorldMap' in api).toBe(false);
    expect('patchMapLoadFailureRecovery' in api).toBe(false);
    expect(auditCoreOwnership({ vendorSource: readVendorSource(), patcherSource: patcher, prepareSource: readFileSync('scripts/prepare-runtime.mjs', 'utf8'), retiredTransforms: [], retiredHostExports: ['resolveLastroMapResourceName', 'describeLastroMapLoadFailure'] })).toEqual([]);
  }, 30000);

  it('worldmap core initializes with optional actions absent', () => {
    const source = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js');
    const fixture = extractWorldMapFixture(source);
    const model = runInNewContext(`(${fixture.createWorldMapIndex})({prontera:{name:'普隆德拉',mobs:[1002]}},{1002:{kName:'波利'}},{},()=>({}))`);
    expect(model.search('1002')[0].record.maps[0].id).toBe('prontera');
    expect(source).toContain('const lastroWorldMapActions = {};');
    expect(source).not.toContain('createLastroWorldMapTeleport');
    const f = initializeWorldMap(readVendorSource());
    expect(f.component.name).toBe('WorldMap');
    expect(f.component._host).toBeNull();
    expect(f.component.render()).toContain('wm-search');
    expect(f.component.searchMonster).toBeTypeOf('function');
    expect(f.component._lastroTeleport).toBeUndefined();
    expect(() => f.component.updatePartyMembers({ groupInfo: [] })).not.toThrow();
    expect(() => f.component.onRemove()).not.toThrow();
    expect(f.events).toEqual(['init_DBManager', 'init_Client', 'init_UIManager', 'init_GUIComponent', 'init_MonsterTable', 'init_NetworkManager', 'init_PacketStructure', 'init_SessionStorage', 'init_MapRenderer', 'init_Navigation', 'init_Thread', 'init_Configs', 'register']);
    f.window.close();
  });

  it('product actions bind once and preserve confirmation cancel preflight', async () => {
    const patcher = await import('../scripts/patch-v2-runtime.mjs');
    const patch = (patcher as unknown as { patchRuntimeWorldMapProductActions?: (source: string) => string }).patchRuntimeWorldMapProductActions;
    expect(patch).toBeTypeOf('function');
    const source = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js');
    const output = patch!(source);
    expect(output.match(/Object\.assign\(lastroWorldMapActions,/g)).toHaveLength(1);
    expect(() => patch!(output)).toThrow('anchor:worldmap-product-actions');
    const f = initializeWorldMap(output);
    expect(f.component._lastroTeleport?.cancelPending).toBeTypeOf('function');
    expect(() => f.component.onRemove()).not.toThrow();
    expect(f.events).toEqual(['init_DBManager', 'init_Client', 'init_UIManager', 'init_GUIComponent', 'init_MonsterTable', 'init_NetworkManager', 'init_PacketStructure', 'init_SessionStorage', 'init_MapRenderer', 'init_Navigation', 'init_Thread', 'init_Configs', 'register']);
    f.window.close();
  });

  it('embedded helpers match reusable factories and templates', () => {
    const fixture = extractWorldMapFixture(readVendorSource());
    const raw = readFileSync('scripts/lastro-worldmap.mjs', 'utf8');
    const file = ts.createSourceFile('worldmap.mjs', raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const name of ['createWorldMapIndex', 'installLastroWorldMap'] as const) {
      const declaration = file.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)!;
      const text = declaration.getText(file).replace(/^export\s+/, '');
      const expression = fixture[name];
      expect(compareRuntimeSources(`const helper = (${text});`, `const helper = (${expression});`, { stage: 'worldmap' })).toMatchObject({ equal: true, differences: [] });
    }
    for (const name of ['WORLD_MAP_HTML', 'WORLD_MAP_CSS']) {
      const declaration = file.statements.flatMap(node => ts.isVariableStatement(node) ? [...node.declarationList.declarations] : []).find(node => node.name.getText(file) === name)!;
      expect(fixture[name === 'WORLD_MAP_HTML' ? 'html' : 'css']).toBe(runInNewContext(declaration.initializer!.getText(file)));
    }
    expect(fixture.regions).toEqual(JSON.parse(readFileSync('scripts/lastro-worldmap-layout.json', 'utf8')).regions);
    for (const [name, path] of [['createMonsterPortraitLoader', 'scripts/lastro-monster-portrait.mjs'], ['resolveLastroMapResourceName', 'scripts/lastro-map-resource-name.mjs'], ['describeLastroMapLoadFailure', 'scripts/lastro-map-load-diagnostic.mjs']]) {
      const helperFile = ts.createSourceFile(path!, readFileSync(path!, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      const declaration = helperFile.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)!;
      const reusable = declaration.getText(helperFile).replace(/^export\s+/, '');
      const permanent = name === 'createMonsterPortraitLoader' ? fixture.createMonsterPortraitLoader : extractRuntimeNode(readVendorSource(), { kind: 'function', name: name! });
      expect(compareRuntimeSources(`const helper = (${reusable});`, `const helper = (${permanent});`, { stage: 'worldmap' })).toMatchObject({ equal: true, differences: [] });
    }
  });

  it.each([
    ['const lastroWorldMapActions = {};', 'let lastroWorldMapActions = {};'],
    ['/* lastro-worldmap-product-actions */', '/* lastro-worldmap-product-actions */\n/* lastro-worldmap-product-actions */'],
    ['...lastroWorldMapActions', '...otherActions'],
    ['init_MonsterTable();', 'init_MonsterTable(); init_MonsterTable();'],
    ['../core/data/world/', '../remote/world/'],
    ['currentMap: () => MapRenderer.currentMap', 'currentMap: () => MapRenderer.nextMap'],
    ['accountId: () => SessionStorage_default.AID', 'accountId: () => SessionStorage_default.GID'],
    ['MonsterTable_default[id] ? DB.getBodyPath(id, 0)', 'MonsterTable_default[id + 1] ? DB.getBodyPath(id, 0)'],
  ])('rejects permanent actions seam dependency drift: %s', async (needle, replacement) => {
    const { patchRuntimeWorldMapProductActions } = await import('../scripts/patch-v2-runtime.mjs');
    const source = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js');
    expect(source.includes(needle)).toBe(true);
    expect(() => patchRuntimeWorldMapProductActions(source.replace(needle, replacement))).toThrow('anchor:worldmap-product-actions');
  });

  it('rejects duplicate embedded factories and extractor region/constructor drift', () => {
    const source = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js');
    expect(() => extractWorldMapFixture(source + '\n' + source)).toThrow('ambiguous');
    const factory = extractWorldMapFixture(source).createMonsterPortraitLoader;
    expect(() => extractWorldMapFixture(source.replace('WorldMap.mouseMode =', `const duplicate = (${factory}); WorldMap.mouseMode =`))).toThrow('Ambiguous');
    expect(() => extractWorldMapFixture(source.replace('new GUIComponent("WorldMap",', 'new GUIComponent("Different",'))).toThrow('Missing packaged world map css');
  });
});

describe('WorldMap structural comparison of actual prepared owners', () => {
  const pair = buildWorldMapComparisonPair(readFileSync('generated/runtime/Online.js', 'utf8'));
  it('accepts only the four reviewed structural deltas', () => {
    expect(compareRuntimeSources(pair.before, pair.after, { stage: 'worldmap' })).toMatchObject({ equal: true, differences: [], structuralDeltas: expect.any(Array) });
  });

  it.each([
    ['const', 'const resolveLastroMapResourceName = () => "shadow";', ''],
    ['var', 'var resolveLastroMapResourceName = () => "shadow";', ''],
    ['function', 'function resolveLastroMapResourceName() { return "shadow"; }', ''],
    ['destructuring', 'const { resolveLastroMapResourceName } = { resolveLastroMapResourceName: () => "shadow" };', ''],
    ['block', '{ const resolveLastroMapResourceName = () => "shadow";', '}'],
    ['parameter', '((resolveLastroMapResourceName) => {', '})(() => "shadow");'],
    ['catch', 'try { throw () => "shadow"; } catch (resolveLastroMapResourceName) {', '}'],
  ])('rejects %s resolver lexical shadow even when both inputs contain it', (_kind, prefix, suffix) => {
    const before = mutateNpcResolverLoader(pair.before, prefix, suffix);
    const after = mutateNpcResolverLoader(pair.after, prefix, suffix);
    const result = compareRuntimeSources(before, after, { stage: 'worldmap' });
    expect(result.equal).toBe(false);
    const detail = _kind === 'function' ? 'permanent resolver: expected one, found 2' : 'callee is shadowed or unresolved';
    expect(result.differences.some(item => item.detail.includes(detail))).toBe(true);
  });

  it('records the actual inline to shadowed global loader behavior', async () => {
    const prefix = 'const resolveLastroMapResourceName = () => "shadow";';
    const before = mutateNpcResolverLoader(pair.before, prefix), after = mutateNpcResolverLoader(pair.after, prefix);
    async function transmitted(source: string, permanent: boolean) {
      const loader = source.slice(source.indexOf('const lastroNpcMapPreflight'), source.indexOf('const lastroAchievementMapPreflight'));
      const resolver = permanent ? extractRuntimeNode(source, { kind: 'function', name: 'resolveLastroMapResourceName' }) : '';
      const sent: string[] = [];
      const loadFile = runInNewContext(`${resolver}\n${loader}\nlastroNpcMapPreflight.loadFile;`, {
        DB: { mapalias: {} }, console, setTimeout: () => 1, clearTimeout: () => {},
        Thread: { send: (_type: string, request: { filename: string }, done: (bytes: Uint8Array) => void) => { sent.push(request.filename); done(new Uint8Array([1])); } },
      });
      await loadFile('data/prontera.gat');
      return sent;
    }
    expect(await transmitted(before, false)).toEqual(['data/prontera.gat']);
    expect(await transmitted(after, true)).toEqual(['shadow']);
    expect(compareRuntimeSources(before, after, { stage: 'worldmap' }).equal).toBe(false);
  });

  it.each([
    ['cancelTeleport: () => lastroWorldMapTeleport.cancelPending(),', ''],
    ['/* lastro-worldmap-product-actions */', '/* changed-marker */'],
    ['init_NetworkManager(); init_PacketStructure();', 'init_PacketStructure(); init_NetworkManager();'],
    ['resolveLastroMapResourceName(filename, DB.mapalias)', 'resolveLastroMapResourceName(filename, {})'],
    ['function onMapComplete(success, error) {', 'const fifth = resolveLastroMapResourceName("data/x.gat", DB.mapalias);\nfunction onMapComplete(success, error) {'],
  ])('rejects fixed structural member/order/loader drift: %s', (needle, replacement) => {
    expect(pair.after.includes(needle)).toBe(true);
    expect(compareRuntimeSources(pair.before, pair.after.replace(needle, replacement), { stage: 'worldmap' }).equal).toBe(false);
  });
});

const actualJobSites: Array<[string, string, string, number]> = [
  ['PartyFriends', 'src/UI/Components/PartyFriends/PartyFriendsCommon.js', 'MonsterTable_default[job]', 0],
  ['Guild text', 'src/UI/Components/Guild/Guild.js', 'MonsterTable_default[member.Job]', 0],
  ['Guild title', 'src/UI/Components/Guild/Guild.js', 'MonsterTable_default[member.Job]', 1],
  ['BasicInfo', 'src/UI/Components/BasicInfo/BasicInfoCommon.js', 'MonsterTable_default[val1]', 0],
  ['WriteRodex', 'src/UI/Components/Rodex/WriteRodex.js', 'MonsterTable_default[pkt.Job]', 0],
  ['Captcha label', 'src/UI/Components/Captcha/CaptchaSelector.js', 'MonsterTable_default[charEntity?._job ?? 0]', 0],
  ['Captcha aid', 'src/UI/Components/Captcha/CaptchaSelector.js', 'MonsterTable_default[entity?._job ?? 0]', 0],
  ['CharSelect paginated', 'src/UI/Components/CharSelect/CharSelectCommon.js', 'MonsterTable_default[info.job]', 0],
  ['CharSelect grid', 'src/UI/Components/CharSelect/CharSelectCommon.js', 'MonsterTable_default[info.job]', 1],
];
function mutateActualJobSite(source: string, path: string, expression: string, occurrence: number, duplicate: boolean) {
  const region = extractVendorRegion(path, source);
  const file = ts.createSourceFile(path, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const lookups: ts.ElementAccessExpression[] = [];
  function visit(node: ts.Node) {
    if (ts.isElementAccessExpression(node) && node.getText(file) === expression) lookups.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  const node = lookups[occurrence];
  if (!node) throw new Error('Missing actual display fixture site ' + expression);
  const replacement = duplicate ? `(${expression} || ${expression})` : 'undefined';
  const changed = region.slice(0, node.getStart(file)) + replacement + region.slice(node.end);
  return source.replace(region, changed);
}
describe('permanent WorldMap portrait guard and exact nine display owners', () => {
  it('translates nine actual display owners and preserves the portrait asset guard', async () => {
    const source = readVendorSource();
    const output = displayLocalization.patchRuntimeJobLocalization(source);
    const ast = ts.createSourceFile('localized.js', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    let calls = 0;
    function visit(node: ts.Node) { if (ts.isCallExpression(node) && node.expression.getText(ast) === 'lastroJobDisplayName') calls++; ts.forEachChild(node, visit); }
    visit(ast);
    expect(calls).toBe(9);
    const guard = 'MonsterTable_default[id] ? DB.getBodyPath(id, 0) : null';
    expect(extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', output)).toContain(guard);
    const { patchV2Runtime } = await import('../scripts/patch-v2-runtime.mjs');
    expect(extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', patchV2Runtime(source))).toContain(guard);
  }, 60000);
  it.each(actualJobSites.flatMap(site => [false, true].map(duplicate => ({ site, duplicate }))))('rejects missing/duplicate actual $site.0 display owner (duplicate=$duplicate)', async ({ site: [, path, expression, occurrence], duplicate }) => {
    const input = mutateActualJobSite(readVendorSource(), path, expression, occurrence, duplicate);
    expect(() => displayLocalization.patchRuntimeJobLocalization(input)).toThrow('anchor:job-display-lookups');
    const { patchV2Runtime } = await import('../scripts/patch-v2-runtime.mjs');
    expect(() => patchV2Runtime(input)).toThrow('anchor:job-display-lookups');
  }, 30000);
  it.each([
    ['MonsterTable_default[id] ? DB.getBodyPath(id, 0)', 'MonsterTable_default[id + 1] ? DB.getBodyPath(id, 0)'],
    ['DB.getBodyPath(id, 0)', 'DB.getBodyPath(id, 1)'],
    ['const lastroWorldMapActions = {};', 'const lastroWorldMapActions = {}; const unknownJob = MonsterTable_default[12345];'],
  ])('rejects actual portrait/unknown lookup drift: %s', async (needle, replacement) => {
    const source = readVendorSource();
    const worldMap = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', source);
    expect(worldMap.includes(needle)).toBe(true);
    const input = source.replace(worldMap, worldMap.replace(needle, replacement));
    expect(() => displayLocalization.patchRuntimeJobLocalization(input)).toThrow('anchor:job-display-lookups');
    const { patchV2Runtime } = await import('../scripts/patch-v2-runtime.mjs');
    expect(() => patchV2Runtime(input)).toThrow('anchor:job-display-lookups');
  }, 30000);
});

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
const task10Retirements = [
  { module: './lastro-npc-dialog-buttons.mjs', imported: 'patchRuntimeNpcDialogButtons', local: 'patchRuntimeNpcDialogButtons', callOwner: 'patchV2Runtime' },
  { module: './lastro-navigation-ui.mjs', imported: 'patchRuntimeNavigationUi', local: 'patchRuntimeNavigationUi', callOwner: 'patchV2Runtime' },
  { module: './lastro-store-scroll.mjs', imported: 'patchRuntimeStoreScroll', local: 'patchRuntimeStoreScroll', callOwner: 'patchV2Runtime' },
  { module: './lastro-storage-count.mjs', imported: 'patchRuntimeStorageCount', local: 'patchRuntimeStorageCount', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-state.mjs', imported: 'patchRuntimeUiState', local: 'patchRuntimeUiState', callOwner: 'patchV2Runtime' },
  { module: './lastro-ui-input.mjs', imported: 'patchRuntimeUiInput', local: 'patchRuntimeUiInput', callOwner: 'patchV2Runtime' },
  { module: './lastro-item-drag.mjs', imported: 'patchRuntimeItemDrag', local: 'patchRuntimeItemDrag', callOwner: 'patchV2Runtime' },
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

  it('permanent cooldown survives the vendor Shortcut append wrapper', () => {
    const vendor = readVendorSource();
    const append = extractRuntimeNode(vendor, {
      region: 'src/UI/Components/ShortCut/ShortCut.js',
      kind: 'assignment',
      name: 'ShortCut.onAppend',
    });
    expect(vendor.includes('function lastroUiWindowAppend(')).toBe(true);
    expect(append).toContain('return lastroUiWindowAppend(this, _preferences$19, () => {');
    expect(append).toContain('_lastroCooldownDuration');
    expect(append).toContain('setDelayOnIndex(index, element._lastroCooldownDuration, true)');
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

  it.each([
    ['function', 'function mode(){ "use strict"; return this === undefined; }', String.raw`function mode(){ "use\x20strict"; return this === undefined; }`],
    ['source', '"use strict"; function mode(){ return this === undefined; }', String.raw`"use\x20strict"; function mode(){ return this === undefined; }`],
  ])('keeps %s directive prologue spelling significant when it changes strict-mode behavior', (_scope, before, after) => {
    expect(runInNewContext(before + '; mode();')).toBe(true);
    expect(runInNewContext(after + '; mode();')).toBe(false);
    expect(compareRuntimeSources(before, after, { stage: 'ui-state' }).equal).toBe(false);
  });

  it('compares template interpolation tokens and keeps tagged-template raw text significant', () => {
    const before = 'function render(value) { return `prefix ${ value + 1 } suffix`; }';
    const triviaOnly = 'function render ( value ) { return `prefix ${value+1} suffix`; }';
    expect(compareRuntimeSources(before, triviaOnly, { stage: 'ui-state' }))
      .toMatchObject({ equal: true, differences: [] });

    const changedExpression = triviaOnly.replace('value+1', 'other+1');
    expect(compareRuntimeSources(before, changedExpression, { stage: 'ui-state' }).differences)
      .toContainEqual(expect.objectContaining({ owner: 'function:render', kind: 'token-range' }));

    const untaggedBefore = 'function render() { element.textContent = `  `; }';
    const untaggedEscaped = 'function render() { element.textContent = `\\x20\\x20`; }';
    expect(compareRuntimeSources(untaggedBefore, untaggedEscaped, { stage: 'ui-state' }))
      .toMatchObject({ equal: true, differences: [] });

    const taggedBefore = 'function render() { return String.raw`\\x20`; }';
    const taggedAfter = 'function render() { return String.raw` `; }';
    expect(compareRuntimeSources(taggedBefore, taggedAfter, { stage: 'ui-state' }).differences)
      .toContainEqual(expect.objectContaining({ owner: 'function:render', kind: 'literal' }));
  });

  it('preserves syntax-tree boundaries so automatic semicolon insertion changes are detected', () => {
    const newlineReturn = 'function run() { return\nvalue; }';
    const sameTree = 'function run ( ) { return\n  value ; }';
    expect(compareRuntimeSources(newlineReturn, sameTree, { stage: 'ui-state' }))
      .toMatchObject({ equal: true, differences: [] });

    const joinedReturn = 'function run() { return value; }';
    const comparison = compareRuntimeSources(newlineReturn, joinedReturn, { stage: 'ui-state' });
    expect(comparison.equal).toBe(false);
    expect(comparison.differences).toContainEqual(expect.objectContaining({
      owner: 'function:run', kind: 'token-range',
    }));

    const prefix = 'function run() { value\n++other; }';
    const postfix = 'function run() { value++\nother; }';
    expect(compareRuntimeSources(prefix, postfix, { stage: 'ui-state' }).differences)
      .toContainEqual(expect.objectContaining({ owner: 'function:run', kind: 'token-range' }));
  });

  it('keeps regular-expression tokens distinct while ignoring surrounding comments', () => {
    const before = 'function test() { const matcher = /a\\/b/g; return matcher.test("a/b"); } // trailing';
    const same = 'function test ( ) { /* comment */ const matcher = /a\\/b/g; return matcher.test("a/b"); }';
    expect(compareRuntimeSources(before, same, { stage: 'ui-state' }))
      .toMatchObject({ equal: true, differences: [] });
    const changed = same.replace('/a\\/b/g', '/a\\/c/g');
    expect(compareRuntimeSources(before, changed, { stage: 'ui-state' }).differences)
      .toContainEqual(expect.objectContaining({ owner: 'function:test', kind: 'token-range' }));
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

  it('retires the seven permanent Task 10 UI transforms while retaining the product layout', () => {
    const patcherSource = readFileSync(new URL('../scripts/patch-v2-runtime.mjs', import.meta.url), 'utf8');
    const diagnostics = auditCoreOwnership({
      vendorSource: readVendorSource(),
      patcherSource,
      prepareSource: readFileSync(new URL('../scripts/prepare-runtime.mjs', import.meta.url), 'utf8'),
      retiredTransforms: [...task9Retirements, ...task10Retirements],
      retiredHostExports: [],
      forbiddenHostDefinitions: ['patchRuntimePreferencesSave'],
    });
    expect(diagnostics).toEqual([]);
    expect(patcherSource).toContain('output = patchRuntimeUiLayout(output);');
    expect(patcherSource).not.toContain('patchScopedUiLayout');
    expect(patcherSource).not.toContain('patchRuntimePreferencesSave');
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
