import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { auditCoreOwnership, compareRuntimeSources } from '../scripts/check-runtime-consolidation.mjs';
import * as displayLocalization from '../scripts/lastro-display-localization.mjs';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './helpers/vendor-runtime';
import { extractWorldMapFixture } from '../scripts/extract-worldmap-fixture.mjs';
import { initializeWorldMap } from './helpers/worldmap-runtime';
import { buildWorldMapComparisonPair, mutateNpcResolverLoader } from './helpers/worldmap-comparison';

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
  }, 30_000);

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
  }, 120_000);
  it.each(actualJobSites.flatMap(site => [false, true].map(duplicate => ({ site, duplicate }))))('rejects missing/duplicate actual $site.0 display owner (duplicate=$duplicate)', ({ site: [, path, expression, occurrence], duplicate }) => {
    const input = mutateActualJobSite(readVendorSource(), path, expression, occurrence, duplicate);
    expect(() => displayLocalization.patchRuntimeJobLocalization(input)).toThrow('anchor:job-display-lookups');
  }, 30000);
  it.each([
    ['MonsterTable_default[id] ? DB.getBodyPath(id, 0)', 'MonsterTable_default[id + 1] ? DB.getBodyPath(id, 0)'],
    ['DB.getBodyPath(id, 0)', 'DB.getBodyPath(id, 1)'],
    ['const lastroWorldMapActions = {};', 'const lastroWorldMapActions = {}; const unknownJob = MonsterTable_default[12345];'],
  ])('rejects actual portrait/unknown lookup drift: %s', (needle, replacement) => {
    const source = readVendorSource();
    const worldMap = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', source);
    expect(worldMap.includes(needle)).toBe(true);
    const input = source.replace(worldMap, worldMap.replace(needle, replacement));
    expect(() => displayLocalization.patchRuntimeJobLocalization(input)).toThrow('anchor:job-display-lookups');
  });
  it('propagates the job lookup anchor failure through the localization coordinator', () => {
    const [, path, expression, occurrence] = actualJobSites[0]!;
    const input = mutateActualJobSite(readVendorSource(), path, expression, occurrence, false);
    expect(() => displayLocalization.patchRuntimeLocalization(input)).toThrow('anchor:job-display-lookups');
  }, 30_000);
});
