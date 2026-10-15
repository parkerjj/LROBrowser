// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode, readVendorSource } from './helpers/vendor-runtime';

const source = readVendorSource();
const region = 'src/UI/Components/MiniMap/MiniMapCommon.js';
const extract = (name: string) => extractRuntimeNode(source, { region, kind: 'function', name });
const helpers = extract('isLastroFacewormMiniMap') + '\n' + extract('createLastroFacewormTerrainMap');
const identify = vm.runInNewContext(helpers + ';isLastroFacewormMiniMap');

function fixture() {
  const contexts: ReturnType<typeof makeContext>[] = [];
  function makeContext() {
    return {
      drawImage: vi.fn(), fillRect: vi.fn(), clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(), putImageData: vi.fn(),
      beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), fillText: vi.fn(),
      createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
      globalAlpha: 1,
    };
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
    const ctx = makeContext(); contexts.push(ctx);
    return ctx as unknown as CanvasRenderingContext2D;
  });
  const images: TestImage[] = [];
  class TestImage {
    complete = false; width = 0; height = 0; decoding = ''; value = '';
    constructor() { images.push(this); }
    set src(value: string) { this.value = value; this.complete = value.startsWith('data:image/gif'); this.width = this.complete ? 1 : 0; }
    get src() { return this.value; }
  }
  class GUI {
    static MouseMode = { STOP: 1 };
    _host = document.createElement('div');
    ui = { hide: vi.fn(), show: vi.fn() };
    constructor() { this._host.innerHTML = '<canvas></canvas><button class="plus"></button><button class="minus"></button><span class="coordinates"><span class="coord x"></span><span class="coord y"></span></span>'; }
    getRoot() { return this._host; }
  }
  const altitude = { width: 4, height: 2, TYPE: { WALKABLE: 2, WATER: 8 }, getCellType: vi.fn((x: number, y: number): number => y === 1 ? (x === 0 ? 10 : 2) : 1) };
  const requests: { path: string; done: (value: string) => void }[] = [];
  const prefs = { zoom: 0, opacity: 2, save: vi.fn() };
  const session = { Entity: { position: [1, 1], direction: 0 } };
  let frame: (tick: number) => void = () => {};
  const environment = {
    document, Image: TestImage, GUIComponent: GUI, Altitude: altitude,
    DB: { INTERFACE_PATH: 'data/texture/ui/', mapalias: {} as Record<string, string>, getTownInfo: vi.fn(() => []) },
    Client: { loadFile: (path: string, done: (value: string) => void) => requests.push({ path, done }) },
    Preferences: { get: () => prefs }, UIManager: { addComponent: (component: unknown) => component },
    Renderer: { render: (value: typeof frame) => { frame = value; }, tick: 0 },
    SessionStorage_default: session,
    lastroUiWindowAppend: (_a: unknown, _b: unknown, append: () => void) => append(),
  };
  const create = vm.runInNewContext(helpers + '\n' + extract('createMiniMap') + ';createMiniMap', environment);
  const map = create({ name: 'MiniMapV2', htmlText: '', cssText: '', coordinates: true });
  map.init(); map.onAppend();
  const ctx = contexts[0]!;
  return { map, ctx, contexts, altitude, requests, prefs, session, environment, images, render: (tick = 100) => frame(tick), terrain: () => contexts.at(-1)!.putImageData.mock.calls[0]?.[0] };
}
afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); });

describe('Faceworm display-only terrain minimap', () => {
  it.each(['1@face.gat', '1@face', '0011@face.gat', '12341@face.rsw', '1@FACE.GAT'])('recognizes the base and numbered instance: %s', name => {
    expect(identify(name, {})).toBe(true);
  });
  it('accepts an explicit terrain alias but not names containing face', () => {
    expect(identify('private.gat', { 'private.rsw': '1@face.rsw' })).toBe(true);
    for (const name of ['prontera.gat', '2@face.gat', 'fake1@face.gat', '../1@face.gat', '1@face_extra.gat']) expect(identify(name, {})).toBe(false);
  });
  it('draws a real terrain canvas without an image response and keeps coordinates live', () => {
    const f = fixture(); f.map.setMap('1@face.gat'); f.render();
    const image = f.ctx.drawImage.mock.calls[0]![0];
    expect(image).toBeInstanceOf(HTMLCanvasElement); expect(image.width).toBe(512);
    expect(f.map.getRoot().querySelector('.coord.x').textContent).toBe('1');
    f.session.Entity.position = [3.8, 0.2]; f.render();
    expect(f.map.getRoot().querySelector('.coord.x').textContent).toBe('3');
    expect(f.map.getRoot().querySelector('.coord.y').textContent).toBe('0');
    expect(f.ctx.fillRect).toHaveBeenLastCalledWith(119, 87, 5, 5);
  });
  it('centers non-square terrain, flips north upwards, and uses native walk/water flags', () => {
    const f = fixture(); f.map.setMap('1@face.gat');
    const data = f.terrain().data;
    const color = (x: number, y: number) => Array.from(data.slice((x + y * 512) * 4, (x + y * 512) * 4 + 4));
    expect(color(100, 20)).toEqual([48, 48, 48, 255]);
    expect(color(20, 150)).toEqual([124, 180, 202, 255]);
    expect(color(200, 150)).toEqual([236, 234, 221, 255]);
    expect(color(200, 300)).toEqual([48, 48, 48, 255]);
    expect(f.altitude.getCellType).toHaveBeenCalledTimes(8);
    f.render(); f.render(3000); expect(f.altitude.getCellType).toHaveBeenCalledTimes(8);
  });
  it('keeps terrain when a full-size blank artwork finishes decoding', () => {
    const f = fixture(); f.map.setMap('1@face.gat');
    f.requests.at(-1)!.done('artwork'); f.render();
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBeInstanceOf(HTMLCanvasElement);
    const image = f.images.at(-1)!; image.complete = true; image.width = 512;
    f.render(); expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBeInstanceOf(HTMLCanvasElement);
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).not.toBe(image);
  });
  it('keeps fallback after artwork decode failure and renders native zoom crops', () => {
    const f = fixture(); f.map.setMap('0011@face.gat'); f.requests.at(-1)!.done('broken');
    f.images.at(-1)!.complete = true; f.images.at(-1)!.width = 0;
    f.map.updateZoom(1); f.render();
    expect(f.ctx.drawImage.mock.calls.at(-1)).toHaveLength(9);
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBeInstanceOf(HTMLCanvasElement);
    expect(f.ctx.fillRect).toHaveBeenLastCalledWith(62, 62, 5, 5);
  });
  it('does not use Faceworm terrain for other maps or accept a late old callback', () => {
    const f = fixture(); f.map.setMap('1@face.gat'); const old = f.requests.at(-1)!;
    f.map.setMap('prontera.gat'); old.done('stale'); f.render();
    expect(f.images.at(-1)!.src).not.toBe('stale');
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBe(f.images.at(-1));
    expect(f.altitude.getCellType).toHaveBeenCalledTimes(8);
  });
  it('invalidates map loads and fallback when the component is removed', () => {
    const f = fixture(); f.map.setMap('1@face.gat'); const pending = f.requests.at(-1)!;
    f.map.onRemove(); pending.done('late'); f.render();
    expect(f.images.at(-1)!.src).not.toBe('late');
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBe(f.images.at(-1));
  });
  it('waits for valid terrain and retries at most once per second', () => {
    const f = fixture(); f.altitude.getCellType.mockImplementation(() => { throw new Error('loading'); });
    f.map.setMap('1@face.gat'); f.render(100); const calls = f.altitude.getCellType.mock.calls.length;
    f.render(200); f.render(1099); expect(f.altitude.getCellType).toHaveBeenCalledTimes(calls);
    f.altitude.getCellType.mockImplementation(() => 2); f.render(1100);
    expect(f.ctx.drawImage.mock.calls.at(-1)![0]).toBeInstanceOf(HTMLCanvasElement);
  });
  it('leaves ordinary map aliases, opacity and arrow projection intact', () => {
    const f = fixture(); f.environment.DB.mapalias['ui\\map\\prontera.bmp'] = 'ui\\map\\town.bmp';
    f.map.setMap('prontera.gat'); expect(f.requests.at(-1)!.path).toBe('data/texture/ui\\map\\town.bmp');
    expect(f.altitude.getCellType).not.toHaveBeenCalled();
    f.images[0]!.width = 8; f.images[0]!.height = 8; f.images[0]!.complete = true; f.render();
    expect(f.ctx.translate).toHaveBeenLastCalledWith(32, 64);
    expect(f.ctx.drawImage).toHaveBeenLastCalledWith(f.images[0], -4, -4);
    f.map.toggleOpacity(0); expect(f.ctx.globalAlpha).toBe(1);
  });
  it('keeps the built runtime wired to the local terrain helper', () => {
    const built = readFileSync(resolve('generated/runtime/Online.js'), 'utf8');
    expect(extractRuntimeNode(built, { region, kind: 'function', name: 'createMiniMap' })).toContain('createLastroFacewormTerrainMap(Altitude)');
  });
});
