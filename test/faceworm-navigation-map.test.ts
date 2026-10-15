// @vitest-environment jsdom
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, readVendorSource } from './helpers/vendor-runtime';

const source = readVendorSource();
const miniRegion = 'src/UI/Components/MiniMap/MiniMapCommon.js';
const navRegion = 'src/UI/Components/Navigation/Navigation.js';
const helpers = ['isLastroFacewormMiniMap', 'createLastroFacewormTerrainMap'].map(name =>
  extractRuntimeNode(source, { region: miniRegion, kind: 'function', name })).join('\n');
const methods = ['Navigation.loadMap', 'Navigation.renderCanvas', 'Navigation.screenToMapCoordinates'].map(name =>
  extractRuntimeNode(source, { region: navRegion, kind: 'assignment', name }) + ';').join('\n');
const projection = extractRuntimeNode(source, { region: navRegion, kind: 'function', name: 'mapToScreen' });

function setup() {
  const ctx = { drawImage: vi.fn(), clearRect: vi.fn(), fillRect: vi.fn(), save: vi.fn(), restore: vi.fn(),
    translate: vi.fn(), scale: vi.fn(), rotate: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), fillText: vi.fn(),
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  const requests: { path: string; done: (data: unknown) => void }[] = [];
  const host = document.createElement('div'); document.body.append(host);
  const env = {
    document, getComputedStyle, Navigation: { _host: host, clear: vi.fn(), setMapNameText: vi.fn() },
    DB: { INTERFACE_PATH: 'data/texture/ui/', mapalias: {} as Record<string, string>, getTownInfo: () => [] },
    Client: { loadFile: (path: string, done: (data: unknown) => void) => requests.push({ path, done }) },
    Altitude: { TYPE: { WALKABLE: 2, WATER: 8 }, width: 999, height: 999, getCellType: () => { throw Error('must use preview terrain'); } },
    _map: { complete: true, width: 512, src: 'blank-512' }, _mapData: { width: 4, height: 2, map: 'prontera' },
    _ctx$2: ctx, _towninfo: [], _isMapClickTarget: false, _finalTargetData: null, _targetData: null,
    _path: [], _markers: [], _arrow: { complete: false, width: 0 },
    getCurrentMap: () => 'prontera', getPlayerPosition: () => ({ x: 1, y: 1 }),
    SessionStorage_default: { Entity: { direction: 0, walk: { total: 0 } } },
  };
  const context = vm.createContext(env);
  vm.runInContext(helpers + '\n' + projection + '\n' + methods, context);
  const nav = env.Navigation as typeof env.Navigation & {
    loadMap: (name: string) => void; renderCanvas: (tick: number) => void;
    screenToMapCoordinates: (x: number, y: number) => { x: number; y: number };
  };
  const gat = { width: 4, height: 2, cells: new Float32Array(40) };
  for (let i = 0; i < 8; i++) gat.cells[i * 5 + 4] = i >= 4 ? 6 : 1;
  return { nav, env, ctx, requests, gat };
}
afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); });

describe('Faceworm Navigation terrain', () => {
  it('draws its own GAT over a loaded blank bitmap, including when previewing a different map', () => {
    const f = setup(); f.nav.loadMap('1@face'); f.requests[0]!.done('blank-512'); f.requests[1]!.done(f.gat);
    f.nav.renderCanvas(100);
    expect(f.ctx.drawImage.mock.calls[0]![0]).toBeInstanceOf(HTMLCanvasElement);
    expect(f.ctx.drawImage.mock.calls[0]!.slice(1)).toEqual([0, 128, 512, 256, 0, 0, 4, 2]);
    const pixels = f.ctx.putImageData.mock.calls[0]![0].data;
    expect(Array.from(pixels.slice((150 * 512 + 100) * 4, (150 * 512 + 100) * 4 + 4))).toEqual([236, 234, 221, 255]);
    expect(f.env._mapData.map).toBe('1@face');
    expect(f.nav.screenToMapCoordinates(140, 115)).toEqual({ x: 2, y: 1 });
    f.nav.renderCanvas(200); expect(f.ctx.putImageData).toHaveBeenCalledTimes(1);
  });
  it('keeps ordinary map artwork and never makes terrain for it', () => {
    const f = setup(); f.nav.loadMap('prontera'); f.requests[1]!.done(f.gat); f.nav.renderCanvas(100);
    expect(f.ctx.drawImage).toHaveBeenCalledWith(f.env._map, 0, 0, 4, 2);
    expect(f.ctx.putImageData).not.toHaveBeenCalled();
  });
  it('does not let earlier image or GAT callbacks replace a newer requested map', () => {
    const f = setup(); f.nav.loadMap('1@face'); const old = f.requests.slice();
    f.nav.loadMap('prontera'); f.requests[2]!.done('town'); f.requests[3]!.done(f.gat);
    old[0]!.done('stale-face'); old[1]!.done(f.gat); f.nav.renderCanvas(100);
    expect(f.env._map.src).toBe('town'); expect(f.env._mapData.map).toBe('prontera');
    expect(f.ctx.drawImage.mock.calls[0]![0]).toBe(f.env._map);
    expect(f.ctx.putImageData).not.toHaveBeenCalled();
  });
  it('drops the previous terrain when leaving Faceworm', () => {
    const f = setup(); f.nav.loadMap('1@face'); f.requests[1]!.done(f.gat); f.nav.renderCanvas(100);
    f.nav.loadMap('prontera'); f.requests[3]!.done(f.gat); f.nav.renderCanvas(200);
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBe(f.env._map);
  });
  it('supports explicit instance aliases and missing artwork', () => {
    const f = setup(); f.env.DB.mapalias['private.gat'] = '1@face.gat';
    f.nav.loadMap('private'); expect(f.requests[1]!.path).toBe('data/1@face.gat');
    f.requests[0]!.done(null); f.requests[1]!.done(f.gat); f.nav.renderCanvas(100);
    expect(f.ctx.drawImage.mock.calls[0]![0]).toBeInstanceOf(HTMLCanvasElement);
  });
});
