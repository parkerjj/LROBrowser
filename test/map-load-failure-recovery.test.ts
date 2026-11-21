import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractRuntimeNode } from './helpers/vendor-runtime';

const source = readFileSync('vendor/v2/Online.js', 'utf8');
const runtime = source;
const diagnostic = extractRuntimeNode(source, { kind: 'function', name: 'describeLastroMapLoadFailure' });
const file = ts.createSourceFile('Online.js', runtime, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
let callback = '';
function visit(node: ts.Node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'onMapComplete') callback = node.getText(file);
  ts.forEachChild(node, visit);
}
visit(file);

function fixture({ initialize = () => {}, enterMap = () => {}, deferScene = false } = {}) {
  const state = { currentMap: 'prontera.gat', loading: true, fog: { exist: true } };
  const cancel = vi.fn(), close = vi.fn(), error = vi.fn(), popup = vi.fn(() => ({ ui: { css: vi.fn() } }));
  const mouse = { intersect: true };
  const bgm = vi.fn();
  const finish = vi.fn(enterMap), stop = vi.fn(), removeScene = vi.fn();
  let completeScene: (() => void) | undefined;
  const background = { remove: (fn: () => void) => { if (deferScene) completeScene = fn; else fn(); } };
  const onMapComplete = new Function('DB', 'LastROTools', 'Network', 'console', 'UIManager', 'Mouse', 'BGM', 'initialize', 'stop', 'removeScene', 'Background', `
    const Renderer = {init:()=>{}, getContext:()=>({}), show:()=>{}, render:()=>{}, stop, remove: removeScene};
    const SpriteRenderer = {init:initialize}, Sky_default = {init:()=>{},setUpCloudData:()=>{}};
    const Damage = {init:()=>{}}, EffectManager = {init:()=>{}};
    const ScreenEffectManager = {init:()=>{},startMapflagEffect:()=>{}};
    const registerPostProcessModules = ()=>{}, JoystickUI_default = {onRestore:()=>{}};
    let MapRenderer;
    ${diagnostic}
    ${callback}
    return (state,success,error)=>{MapRenderer=state;return onMapComplete.call(state,success,error)};
  `)({ getMap: () => null }, { _lastroPanels: { cancelRoute: cancel } }, { close }, { error }, { showErrorBox: popup }, mouse, { play: bgm }, initialize, stop, removeScene, background);
  return { state: Object.assign(state, { onLoad: finish, onRender: () => {} }), cancel, close, error, popup, mouse, bgm, finish, onMapComplete, stop, removeScene, showScene: () => completeScene?.() };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete (globalThis as typeof globalThis & { LastROMapLoadFailure?: unknown }).LastROMapLoadFailure;
});

describe('map load failure recovery', () => {
  it('unlocks loading, clears the failed map and stops navigation before the native error popup', () => {
    const f = fixture();
    f.onMapComplete(f.state, false, 'Invalid GND header');
    expect(f.state).toMatchObject({ loading: false, currentMap: '' });
    expect(f.mouse.intersect).toBe(false);
    expect(f.cancel).toHaveBeenCalledOnce();
    expect(f.close).toHaveBeenCalledOnce();
    expect(f.error).toHaveBeenCalledWith('[LastRO] Map load failed', 'prontera.gat', 'Invalid GND header');
    expect(f.popup).toHaveBeenCalledWith('地图加载失败：prontera。\n原因：地图文件不完整或格式异常\n确认后返回登录，请重新尝试。');
    expect(f.finish).not.toHaveBeenCalled();
  });

  it('keeps the resource and reason available after restarting the client', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });
    const f = fixture();
    f.state.currentMap = 'ein_fild04.gat';
    f.onMapComplete(f.state, false, 'Unable to resolve resource (logical path): data/ein_fild04.gnd [download-timeout-60000ms]');
    const saved = JSON.parse(setItem.mock.calls[0]![1]);
    expect(saved).toMatchObject({ map: 'ein_fild04', resource: 'data/ein_fild04.gnd', category: 'timeout' });
    expect(f.popup).toHaveBeenCalledWith(expect.stringContaining('文件：data/ein_fild04.gnd'));
  });

  it('still shows the native error when diagnostic storage is unavailable', () => {
    vi.stubGlobal('localStorage', { setItem: () => { throw new Error('unavailable'); } });
    const f = fixture();
    expect(() => f.onMapComplete(f.state, false, 'http-503')).not.toThrow();
    expect(f.popup).toHaveBeenCalledWith(expect.stringContaining('地图资源下载失败'));
  });

  it('preserves successful loading and the native render completion', () => {
    const f = fixture();
    f.onMapComplete(f.state, true);
    expect(f.state).toMatchObject({ loading: false, currentMap: 'prontera.gat', fog: { exist: false } });
    expect(f.finish).toHaveBeenCalledOnce();
    expect(f.bgm).toHaveBeenCalledWith('01.mp3');
    expect(f.close).not.toHaveBeenCalled();
    expect(f.popup).not.toHaveBeenCalled();
    expect(f.mouse.intersect).toBe(true);
  });

  it('reports graphics initialization as a map failure even when all assets loaded', () => {
    const f = fixture({ initialize: () => { throw new Error('shader link failed'); } });
    expect(() => f.onMapComplete(f.state, true)).not.toThrow();
    expect(f.state).toMatchObject({ loading: false, currentMap: '' });
    expect(f.close).toHaveBeenCalledOnce();
    expect(f.stop).toHaveBeenCalledOnce();
    expect(f.popup).toHaveBeenCalledWith(expect.stringContaining('初始化地图渲染器'));
    expect(f.finish).not.toHaveBeenCalled();
  });

  it('recovers when the deferred map display callback fails after the loading background', () => {
    const f = fixture({ deferScene: true, enterMap: () => { throw new Error('scene activation failed'); } });
    f.onMapComplete(f.state, true);
    expect(() => f.showScene()).not.toThrow();
    expect(f.state).toMatchObject({ loading: false, currentMap: '' });
    expect(f.removeScene).toHaveBeenCalledOnce();
    expect(f.popup).toHaveBeenCalledWith(expect.stringContaining('显示地图'));
  });

  it.each(['inline', 'deferred'])('reports %s ground upload errors even when the Worker succeeds', timing => {
    const renderer = extractRuntimeNode(source, { region: 'src/Renderer/MapRenderer.js', kind: 'class', name: 'MapRenderer' });
    const received = new Map<string, (...args: unknown[]) => void>();
    const finish = vi.fn(), onModels = vi.fn();
    const uploadError = new Error('ground shader unavailable');
    let reportFailure: ((error: Error) => void) | undefined;
    const deferUpload = timing === 'deferred' ? (report: (error: Error) => void) => { reportFailure = report; } : undefined;
    const execute = new Function('Thread', 'onMapComplete', 'onModelsComplete', 'uploadError', 'deferUpload', `
      const Map_default = {};
      const Cursor = {ACTION:{DEFAULT:0},setType(){}};
      const BGM = {stop(){}}, SoundManager = {stop(){}};
      const Renderer = {stop(){},remove(){}}, UIManager = {removeComponents(){}};
      const Background = {setLoading: callback => callback()};
      const onProgressUpdate = () => {}, onWorldComplete = () => {};
      const onAltitudeComplete = () => {}, onAnimatedModelComplete = () => {};
      const onGroundComplete = (_data, report) => {
        if (deferUpload) deferUpload(report);
        else throw uploadError;
      };
      const MapRenderer = ${renderer};
      MapRenderer.free = () => {};
      ${extractRuntimeNode(source, { region: 'src/Renderer/MapRenderer.js', kind: 'function', name: 'stripMapExtension' })}
      MapRenderer.setMap('prontera.gat');
    `);
    execute({ hook: (type: string, callback: (...args: unknown[]) => void) => received.set(type, callback),
      send: (type: string, _file: string, callback: (...args: unknown[]) => void) => received.set(type, callback),
    }, finish, onModels, uploadError, deferUpload);

    expect(() => received.get('MAP_GROUND')!({})).not.toThrow();
    received.get('LOAD_MAP')!(true, null);
    if (reportFailure) {
      expect(finish).toHaveBeenCalledExactlyOnceWith(true, null);
      finish.mockClear();
      reportFailure(uploadError);
      reportFailure(uploadError);
    }
    received.get('MAP_MODELS')!({});
    expect(onModels).not.toHaveBeenCalled();
    expect(finish).toHaveBeenCalledExactlyOnceWith(false, uploadError, '上传地形');
  });

  it('reports a scene error when returning to the same map', () => {
    const region = 'src/Renderer/MapRenderer.js';
    const renderer = extractRuntimeNode(source, { region, kind: 'class', name: 'MapRenderer' });
    const strip = extractRuntimeNode(source, { region, kind: 'function', name: 'stripMapExtension' });
    const enterError = new Error('same-map scene failed');
    const finish = vi.fn(), render = vi.fn();
    const move = new Function('onMapComplete', 'enterError', 'render', `
      const Map_default = {}, Mouse = {intersect:true};
      const SoundManager = {stop(){}}, UIManager = {removeComponents(){}};
      const Renderer = {stop(){},getContext:()=>({}),render};
      const Cursor = {ACTION:{DEFAULT:0},setType(){}};
      const EntityManager = {free(){}}, Damage = EntityManager, EffectManager = EntityManager;
      const JoystickUI_default = {onRestore(){}}, Background = {remove: fn=>fn()};
      const MapRenderer = ${renderer};
      ${strip}
      MapRenderer.currentMap = 'prontera.gat';
      MapRenderer.onLoad = () => { throw enterError; };
      MapRenderer.setMap('prontera.gat');
    `);
    expect(() => move(finish, enterError, render)).not.toThrow();
    expect(finish).toHaveBeenCalledExactlyOnceWith(false, enterError, '显示地图');
    expect(render).not.toHaveBeenCalled();
  });

  it('requires one actual permanent failure callback and diagnostic helper', () => {
    for (const name of ['onMapComplete', 'describeLastroMapLoadFailure']) {
      expect(() => extractRuntimeNode('', { kind: 'function', name })).toThrow('Expected exactly one');
      // Both owners are extracted from the actual vendor source at module load.
      // Test duplicate detection on the small owner instead of reparsing 16 MB.
      const node = name === 'onMapComplete' ? callback : diagnostic;
      expect(node).toContain('function ' + name);
      expect(() => extractRuntimeNode(node + '\n' + node, { kind: 'function', name })).toThrow('found 2');
    }
  }, 30_000);
});
