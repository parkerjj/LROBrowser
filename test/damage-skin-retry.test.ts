import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
const start = vendor.indexOf('//#region src/Renderer/Effects/Damage.js');
const end = vendor.indexOf('//#endregion', start);
if (start < 0 || end < 0) throw new Error('Missing native Damage region');
const file = ts.createSourceFile('Damage.js', vendor.slice(start, end), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
let init: string | undefined;
let skins: string | undefined;
function visit(node: ts.Node) {
  if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'init'
    && node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)) init = node.getText(file);
  if (ts.isBinaryExpression(node) && node.left.getText(file) === '_damageSkins') skins = node.right.getText(file);
  ts.forEachChild(node, visit);
}
visit(file);
if (!init || !skins) throw new Error('Missing native Damage.init or skin table');

function harness(fail: (filename: string) => boolean) {
  const requests: string[] = [];
  const discarded: string[] = [];
  const frame = { width: 8, height: 8 };
  const context = vm.createContext({
    console: { error() {}, warn() {} },
    _enableSuffix: false,
    _loadedSkinsData: {} as Record<number, { numbers: unknown[] }>,
    _msgNames: ['miss', 'guard', 'crit', 'lucky', 'block', 'rdmg'],
    dpr$1: 1,
    Configs: { get: () => false },
    PacketVerManager_default: { value: 20211103 },
    MemoryManager: { remove() {}, discardFailedMusic: (name: string) => discarded.push(name) },
    Client: {
      getFile: (name: string, onload: (data: string) => void, onerror: (error: string) => void) => {
        requests.push(name);
        queueMicrotask(() => { if (fail(name)) onerror('download failed'); else onload(name); });
      },
    },
    SPR: class { getCanvasFromFrame() { return frame; } },
    ACT: class { actions = [{ animations: [{ layers: [{ scale: [1, 1] }] }] }]; },
    WebGL_default: { toPowerOfTwo: (value: number) => value },
    document: { createElement: () => ({ getContext: () => ({ drawImage() {} }) }) },
  });
  vm.runInContext(`_damageSkins = ${skins}; Damage = class { ${init} };`, context);
  const gl = new Proxy({}, { get: () => () => ({}) });
  return {
    requests, discarded, context,
    init: () => (context.Damage as { init: (value: unknown) => void }).init(gl),
    loaded: () => context._loadedSkinsData as Record<number, { numbers: unknown[] }>,
  };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const skinFiles = ['data/sprite/이팩트/숫자.spr', 'data/sprite/이팩트/msg.spr', 'data/sprite/이팩트/bluemsg.spr', 'data/sprite/이팩트/숫자.act'];

describe('native damage-number skin loading', () => {
  it('loads the packaged Korean-path skin once and keeps it for later maps', async () => {
    const damage = harness(() => false);
    damage.init(); await settle();
    expect(damage.requests).toEqual(skinFiles);
    expect(damage.loaded()[0]?.numbers.every(Boolean)).toBe(true);
    damage.init(); await settle();
    expect(damage.requests).toHaveLength(4);
  });

  it('forgets a skin whose download failed so the next map load retries it', async () => {
    let broken = true;
    const damage = harness(name => broken && name.endsWith('msg.spr'));
    damage.init(); await settle();
    expect(damage.loaded()[0]).toBeUndefined();
    broken = false;
    damage.init(); await settle();
    expect(damage.requests).toEqual([...skinFiles, ...skinFiles]);
    expect(damage.discarded).toEqual([...skinFiles, ...skinFiles]);
    expect(damage.loaded()[0]?.numbers.every(Boolean)).toBe(true);
  });
});
