import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { createLastroNpcSpawnGate, patchRuntimeMapChangeHandoff } from '../scripts/lastro-character-switch.mjs';
import { formatLastroCharacterMapName, patchRuntimeCharSelectMapName } from '../scripts/lastro-display-localization.mjs';

const native = readFileSync('vendor/v2/Online.js', 'utf8');
const handoff = patchRuntimeMapChangeHandoff(native);

function section(source: string, path: string) {
  const start = source.indexOf('//#region ' + path + '\n');
  const end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing region: ' + path);
  return source.slice(start, end);
}
function mapFixture() {
  const file = ts.createSourceFile('MapEngine.js', section(handoff, 'src/Engine/MapEngine.js'), ts.ScriptTarget.Latest, true);
  const owners = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === 'onMapChange');
  if (owners.length !== 1) throw new Error('Missing unique map change owner');
  const changes: string[] = [];
  const mapRenderer: { loading: boolean; currentMap: string; onLoad?: () => void; setMap: (name: string) => void } = {
    loading: false, currentMap: '',
    setMap(name) { changes.push(name); this.loading = true; this.currentMap = name; },
  };
  const accepted: unknown[] = [];
  const context = {
    MapRenderer: mapRenderer, document: {},
    lastroNpcSpawnGate: { reset() {}, flush() {} },
    lastroCloseVendingShopping() {}, lastroCancelMovement() {},
    SessionStorage_default: { Entity: {} }, MapControl: {},
    resetEntityForMapEntry(_entity: unknown, packet: unknown) {
      accepted.push(packet);
      throw new Error('stop-before-game-ui');
    },
  };
  const api = vm.runInNewContext('let lastroDeferredMapChange = null;\n' + owners[0]!.getText(file) + '\n({onMapChange})', context) as {
    onMapChange: (packet: { mapName: string; xPos: number; yPos: number }) => void;
  };
  return { ...api, mapRenderer, changes, accepted };
}

describe('map changes during asynchronous resource loading', () => {
  it('defers and applies the newest cross-map packet instead of losing it', () => {
    const f = mapFixture();
    f.onMapChange({ mapName: 'prontera.gat', xPos: 1, yPos: 1 });
    f.onMapChange({ mapName: '1@tower.gat', xPos: 2, yPos: 3 });
    f.onMapChange({ mapName: '2@tower.gat', xPos: 4, yPos: 5 });
    expect(f.changes).toEqual(['prontera.gat']);
    f.mapRenderer.loading = false;
    f.mapRenderer.onLoad!();
    expect(f.changes).toEqual(['prontera.gat', '2@tower.gat']);
    expect(f.mapRenderer.loading).toBe(true);
    expect(f.accepted).toHaveLength(0);
  });
  it('uses the latest position for a same-map move without triggering a second resource load', () => {
    const f = mapFixture();
    f.onMapChange({ mapName: 'prontera.gat', xPos: 1, yPos: 1 });
    const latest = { mapName: 'prontera.gat', xPos: 44, yPos: 76 };
    f.onMapChange(latest);
    f.mapRenderer.loading = false;
    expect(() => f.mapRenderer.onLoad!()).toThrow('stop-before-game-ui');
    expect(f.changes).toEqual(['prontera.gat']);
    expect(f.accepted).toEqual([latest]);
  });
  it('does not display an obsolete completed map after a newer load begins', () => {
    const renderer = section(handoff, 'src/Renderer/MapRenderer.js');
    expect(renderer).toContain('MapRenderer.onLoad();\n    if (MapRenderer.loading) return;\n    Sky_default.setUpCloudData();');
  });
});

describe('character selection displays protocol map IDs instead of legacy encoded names', () => {
  it.each([
    ['prontera', 'prontera.gat'],
    ['prontera.gat', 'prontera.gat'],
    ['1@tower', '1@tower.gat'],
    ['002#prt_fild08.rsw', '002#prt_fild08.gat'],
    ['乱码地图', ''],
    ['../../file', ''],
    ['', ''],
  ])('formats %s as %s', (source, expected) => {
    expect(formatLastroCharacterMapName(source)).toBe(expected);
  });
  it('patches both layouts without modifying the shared DB map-name/localization code', () => {
    const result = patchRuntimeCharSelectMapName(native);
    const originalUi = section(native, 'src/UI/Components/CharSelect/CharSelectCommon.js');
    const newUi = section(result, 'src/UI/Components/CharSelect/CharSelectCommon.js');
    expect(originalUi.split('DB.getMapName(info.lastMap, "") || ""')).toHaveLength(3);
    expect(newUi.split('LastROCharacterMapName(info.lastMap)')).toHaveLength(3);
    expect(newUi).not.toContain('DB.getMapName(info.lastMap, "") || ""');
    expect(section(result, 'src/DB/DBManager.js')).toBe(section(native, 'src/DB/DBManager.js'));
  });
});

describe('NPC spawn notifications across asynchronous map loading', () => {
  function fixture() {
    let loading = false;
    type SpawnPacket = { GID: number; objecttype: number; label?: string };
    const accepted: SpawnPacket[] = [];
    const gate = createLastroNpcSpawnGate<SpawnPacket>({
      isLoading: () => loading,
      isNpc: pkt => pkt.objecttype === 6 || pkt.objecttype === 10,
      replay: pkt => accepted.push(pkt),
    });
    return { gate, accepted, load(value: boolean) { loading = value; } };
  }

  it('defers only NPCs during loading, deduplicates by GID, and replays after native map initialization', () => {
    const f = fixture();
    f.load(true);
    expect(f.gate.capture({ GID: 101, objecttype: 6, label: 'old' })).toBe(true);
    expect(f.gate.capture({ GID: 101, objecttype: 6, label: 'new' })).toBe(true);
    expect(f.gate.capture({ GID: 102, objecttype: 10 })).toBe(true);
    expect(f.gate.capture({ GID: 103, objecttype: 5 })).toBe(false);
    f.gate.flush();
    expect(f.accepted).toHaveLength(0);
    f.load(false);
    f.gate.flush();
    expect(f.accepted).toEqual([
      { GID: 101, objecttype: 6, label: 'new' },
      { GID: 102, objecttype: 10 },
    ]);
    f.gate.flush();
    expect(f.accepted).toHaveLength(2);
  });

  it('drops vanished NPCs and never carries a pending NPC into a later map', () => {
    const f = fixture();
    f.load(true);
    f.gate.capture({ GID: 100, objecttype: 6 });
    f.gate.capture({ GID: 101, objecttype: 6 });
    f.gate.vanish(100);
    f.load(false);
    f.gate.flush();
    expect(f.accepted.map(pkt => pkt.GID)).toEqual([101]);
    f.load(true);
    f.gate.capture({ GID: 200, objecttype: 6 });
    f.gate.reset();
    f.load(false);
    f.gate.flush();
    expect(f.accepted.map(pkt => pkt.GID)).toEqual([101]);
  });

  it('injects NPC gate into the real native spawn/vanish handlers and flushes after map onLoad', () => {
    const map = section(handoff, 'src/Engine/MapEngine.js');
    const entity = section(handoff, 'src/Engine/MapEngine/Entity.js');
    const file = ts.createSourceFile('MapEngine.js', map, ts.ScriptTarget.Latest, true);
    const owner = file.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'onMapChange');
    expect(owner).toBeDefined();
    expect(map).toContain('lastroNpcSpawnGate.flush();');
    expect(entity).toContain('if (lastroNpcSpawnGate.capture(pkt)) return;');
    expect(entity).toContain('lastroNpcSpawnGate.vanish(pkt.GID);');
    expect(map).toContain('lastroNpcSpawnGate.reset();');
    const diagnostics = ts.transpileModule(map, {
      fileName: 'MapEngine.js',
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.Latest },
    }).diagnostics ?? [];
    expect(diagnostics.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)).toHaveLength(0);
  });
});
