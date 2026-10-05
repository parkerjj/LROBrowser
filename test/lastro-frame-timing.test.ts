import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeFrameTiming } from '../scripts/lastro-frame-timing.mjs';

const source = await readFile(new URL('../vendor/v2/Online.js', import.meta.url), 'utf8');
const patched = patchRuntimeFrameTiming(source.replaceAll('\r\n', '\n'));
function region(name: string) {
  const start = patched.indexOf('//#region ' + name);
  return patched.slice(start, patched.indexOf('//#endregion', start));
}
function events() {
  let wall = 1000;
  const errors = vi.fn();
  const api = new Function('__esmMin', 'Date', 'console', region('src/Core/Events.js') + '\nreturn {Events, LastROEventDueTick};')(
    (initialize: () => void) => initialize(), { now: () => wall }, { error: errors },
  );
  return { ...api, errors, setWall: (value: number) => { wall = value; } };
}

function serverClock() {
  let mono = 0, wall = 1000;
  const session = { serverTick: 0, ping: {
    returned: true, pingTime: 0, pongTime: 0, value: 0,
    lastroSentAt: undefined as number | undefined,
    lastroSentMono: undefined as number | undefined,
    _lastroUnansweredSince: undefined as number | undefined,
  } };
  const rendererRegion = region('src/Renderer/Renderer.js');
  const clock = rendererRegion.slice(rendererRegion.indexOf('let lastroServerClockMark'), rendererRegion.indexOf('var mat4$9'));
  const pong = region('src/Engine/MapEngine.js').match(/function onPong\(pkt\) \{[\s\S]*?\n\}/)?.[0];
  if (!pong) throw new Error('Missing real pong handler');
  const api = new Function('performance', 'Date', 'SessionStorage_default', clock + '\n' + pong
    + '\nreturn {LastROResetServerTick,LastROAdvanceServerTick,LastROInvalidateServerTick,LastROSampleServerTick,onPong};')(
    { now: () => mono }, { now: () => wall }, session,
  );
  return { ...api, session, setMono: (value: number) => { mono = value; }, setWall: (value: number) => { wall = value; },
    send: () => {
      session.ping.returned = false;
      session.ping.lastroSentMono = mono;
      session.ping.lastroSentAt = wall;
    } };
}

describe('real runtime frame and event timing', () => {
  it('schedules fresh packets from their arrival time after a stopped renderer', () => {
    const h = events(), callback = vi.fn();
    h.Events.process(1000);
    h.setWall(8000);
    h.Events.setTimeout(callback, 150);
    h.Events.process(8000);
    expect(callback).not.toHaveBeenCalled();
    h.Events.process(8150);
    expect(callback).toHaveBeenCalledOnce();
  });
  it('does not replay recursively scheduled callbacks in the recovery frame', () => {
    const h = events(), calls: number[] = [];
    h.Events.setTimeout(() => {
      calls.push(1);
      h.Events.setTimeout(() => calls.push(2), 50);
    }, 50);
    h.setWall(5000);
    h.Events.process(5000);
    expect(calls).toEqual([1]);
    h.Events.process(5049);
    expect(calls).toEqual([1]);
    h.Events.process(5050);
    expect(calls).toEqual([1, 2]);
  });
  it('isolates a failing callback so it cannot permanently stop rendering', () => {
    const h = events(), after = vi.fn();
    h.Events.setTimeout(() => { throw new Error('late resource'); }, 0);
    h.Events.setTimeout(after, 0);
    expect(() => h.Events.process(1000)).not.toThrow();
    expect(h.errors).toHaveBeenCalledOnce();
    expect(after).toHaveBeenCalledOnce();
    expect(h.LastROEventDueTick()).toBeUndefined();
  });
  it('exposes the original due time only while executing a delayed event', () => {
    const h = events(), due: unknown[] = [];
    h.Events.setTimeout(() => due.push(h.LastROEventDueTick()), 100);
    h.setWall(4000);
    h.Events.process(4000);
    expect(due).toEqual([1100]);
    expect(h.LastROEventDueTick()).toBeUndefined();
  });
  it('still honours cancellation during an event batch', () => {
    const h = events(), after = vi.fn();
    h.Events.setTimeout(() => h.Events.clearTimeout(cancel), 0);
    const cancel = h.Events.setTimeout(after, 0);
    h.Events.process(1000);
    expect(after).not.toHaveBeenCalled();
  });
  it('bounds huge event batches and executes every remaining event next frame', () => {
    const h = events(), callback = vi.fn();
    for (let i = 0; i < 300; i++) h.Events.setTimeout(callback, 0);
    h.Events.process(1000);
    expect(callback).toHaveBeenCalledTimes(256);
    h.Events.process(1016);
    expect(callback).toHaveBeenCalledTimes(300);
  });
  it('keeps zero-delay self scheduling for the next frame', () => {
    const h = events(), callback = vi.fn(() => h.Events.setTimeout(callback, 0));
    h.Events.setTimeout(callback, 0);
    h.Events.process(1000);
    expect(callback).toHaveBeenCalledOnce();
    h.Events.process(1016);
    expect(callback).toHaveBeenCalledTimes(2);
  });
  it('advances the server sample only from its receive time, never the stale render tick', () => {
    let mono = 0;
    const session = { serverTick: 0 };
    const rendererRegion = region('src/Renderer/Renderer.js');
    const clock = rendererRegion.slice(rendererRegion.indexOf('let lastroServerClockMark'), rendererRegion.indexOf('var mat4$9'));
    const api = new Function('performance', 'SessionStorage_default', clock + '\nreturn {LastROResetServerTick,LastROAdvanceServerTick};')({ now: () => mono }, session);
    api.LastROResetServerTick(10000);
    mono = 100;
    expect(api.LastROAdvanceServerTick()).toBe(10100);
    mono = 8000;
    api.LastROResetServerTick(20000);
    mono = 8016;
    expect(api.LastROAdvanceServerTick()).toBe(20016);
    expect(api.LastROAdvanceServerTick()).toBe(20016);
    mono = 8032;
    expect(api.LastROAdvanceServerTick()).toBe(20032);
  });
  it('does not add the initial epoch timestamp to an unsampled server tick', () => {
    let mono = 40000;
    const session = { serverTick: 0 };
    const rendererRegion = region('src/Renderer/Renderer.js');
    const clock = rendererRegion.slice(rendererRegion.indexOf('let lastroServerClockMark'), rendererRegion.indexOf('var mat4$9'));
    const advance = new Function('performance', 'SessionStorage_default', clock + '\nreturn LastROAdvanceServerTick;')({ now: () => mono }, session);
    expect(advance()).toBe(0);
    mono = 42000;
    expect(advance()).toBe(0);
  });
  it('invalidates the previous zone clock until the new zone supplies its own sample', () => {
    let mono = 0;
    const session = { serverTick: 0 };
    const rendererRegion = region('src/Renderer/Renderer.js');
    const clock = rendererRegion.slice(rendererRegion.indexOf('let lastroServerClockMark'), rendererRegion.indexOf('var mat4$9'));
    const api = new Function('performance', 'SessionStorage_default', clock + '\nreturn {LastROResetServerTick,LastROAdvanceServerTick,LastROInvalidateServerTick};')({ now: () => mono }, session);
    api.LastROResetServerTick(100000);
    mono = 10000;
    api.LastROInvalidateServerTick();
    mono = 20000;
    expect(api.LastROAdvanceServerTick()).toBe(0);
    api.LastROResetServerTick(5000);
    mono = 20016;
    expect(api.LastROAdvanceServerTick()).toBe(5016);
    expect(region('src/Engine/MapEngine.js')).toMatch(/if \(!success\)[\s\S]*?return;\s*\}\s*LastROInvalidateServerTick\(\);/);
    expect(region('src/Engine/MapEngine.js')).toContain('function cleanGameUI() {\n  LastROInvalidateServerTick();');
  });
  it('records actual ping latency and anchors a pong received between frames', () => {
    let mono = 8000;
    const session = { serverTick: 0, ping: { returned: false, pingTime: 10, lastroSentAt: 5000, lastroSentMono: 7920, pongTime: 0, value: 0 } };
    const rendererRegion = region('src/Renderer/Renderer.js');
    const clock = rendererRegion.slice(rendererRegion.indexOf('let lastroServerClockMark'), rendererRegion.indexOf('var mat4$9'));
    const pong = region('src/Engine/MapEngine.js').match(/function onPong\(pkt\) \{[\s\S]*?\n\}/)?.[0];
    expect(pong).toBeTruthy();
    const api = new Function('performance', 'Date', 'SessionStorage_default', clock + '\n' + pong + '\nreturn {onPong,LastROAdvanceServerTick};')({ now: () => mono }, { now: () => 5080 }, session);
    api.onPong({ time: 25000 });
    expect(session.ping).toMatchObject({ returned: true, pongTime: 5080, value: 80 });
    mono = 8016;
    expect(api.LastROAdvanceServerTick()).toBe(25056);
  });
  it('measures RTT with the monotonic clock even when the wall clock changes', () => {
    const h = serverClock();
    h.setMono(5000); h.send();
    h.setMono(5080); h.setWall(-200000); h.onPong({ time: 25000 });
    expect(h.session.ping).toMatchObject({ returned: true, pongTime: -200000, value: 80 });
    expect(h.session.ping.lastroSentMono).toBeUndefined();
    expect(h.session.ping.lastroSentAt).toBeUndefined();
    expect(h.session.serverTick).toBe(25040);
  });
  it('slews later samples forward without advancing a walk on the pong itself', () => {
    const h = serverClock(); h.LastROResetServerTick(10000);
    h.setMono(20); h.send(); h.setMono(100); h.onPong({ time: 10360 });
    expect(h.session.serverTick).toBe(10100);
    h.setMono(116);
    expect(h.LastROAdvanceServerTick()).toBeCloseTo(10117.6);
    h.setMono(3100);
    expect(h.LastROAdvanceServerTick()).toBe(13400);
    h.setMono(3200);
    expect(h.LastROAdvanceServerTick()).toBe(13500);
  });
  it('gradually slows an ahead clock until it catches the server timeline', () => {
    const h = serverClock(); h.LastROResetServerTick(10000);
    h.setMono(920); h.send(); h.setMono(1000); h.onPong({ time: 10100 });
    expect(h.session.serverTick).toBe(11000);
    h.setMono(2000);
    expect(h.LastROAdvanceServerTick()).toBe(11900);
    h.setMono(9600);
    expect(h.LastROAdvanceServerTick()).toBe(18740);
    h.setMono(9700);
    expect(h.LastROAdvanceServerTick()).toBe(18840);
  });
  it('keeps the server clock continuous when the uint32 packet tick wraps', () => {
    const h = serverClock(); h.LastROResetServerTick(0xffffff00);
    h.setMono(320); h.send(); h.setMono(400); h.onPong({ time: 104 });
    expect(h.session.serverTick).toBe(0xffffff00 + 400);
    h.setMono(416);
    expect(h.LastROAdvanceServerTick()).toBe(0xffffff00 + 416);
    expect(h.session.serverTick).toBeGreaterThan(0xffffffff);
  });
  it('slews a sample that wraps ahead without jumping to a different epoch', () => {
    const h = serverClock(); h.LastROResetServerTick(0xffffff00);
    h.setMono(120); h.send(); h.setMono(200); h.onPong({ time: 40 });
    expect(h.session.serverTick).toBe(0xffffff00 + 200);
    h.setMono(1560);
    expect(h.LastROAdvanceServerTick()).toBe(0x100000000 + 1440);
  });
  it('ignores unsolicited and duplicate pongs instead of adopting their ticks', () => {
    const h = serverClock(); h.LastROResetServerTick(10000);
    h.onPong({ time: 90000000 });
    expect(h.session.serverTick).toBe(10000);
    h.send(); h.setMono(80); h.onPong({ time: 10040 });
    expect(h.session.serverTick).toBe(10080);
    h.onPong({ time: 90000000 });
    expect(h.session.serverTick).toBe(10080);
    expect(h.session.ping.value).toBe(80);
  });
  it('rejects expired replies and never adds a long paused RTT to movement', () => {
    const h = serverClock(); h.LastROResetServerTick(10000); h.send();
    h.setMono(9000); h.onPong({ time: 10000 });
    expect(h.session.ping.returned).toBe(true);
    expect(h.session.ping.value).toBe(0);
    expect(h.LastROAdvanceServerTick()).toBe(19000);
  });
  it('caps one-way compensation for a valid slow response', () => {
    const h = serverClock(); h.send(); h.setMono(1800); h.onPong({ time: 10000 });
    expect(h.session.ping.value).toBe(1800);
    expect(h.session.serverTick).toBe(10250);
  });
  it('rejects invalid packet ticks and invalid monotonic probe times', () => {
    const h = serverClock(); h.LastROResetServerTick(10000);
    for (const tick of [undefined, NaN, -1, 0x100000000, '10000', 10000.5]) {
      expect(h.LastROSampleServerTick(tick, 0, 80)).toBe(false);
      expect(h.LastROResetServerTick(tick)).toBe(false);
    }
    for (const [sent, received] of [[NaN, 80], [0, NaN], [100, 80], [0, 2001]])
      expect(h.LastROSampleServerTick(10000, sent, received)).toBe(false);
    expect(h.session.serverTick).toBe(10000);
  });
  it('rejects implausible forward clock samples without creating later drift', () => {
    const h = serverClock(); h.LastROResetServerTick(10000); h.send();
    h.setMono(80); h.onPong({ time: 90000000 });
    expect(h.session.serverTick).toBe(10080);
    h.setMono(180);
    expect(h.LastROAdvanceServerTick()).toBe(10180);
  });
  it('rejects older server samples without overwriting the accepted correction', () => {
    const h = serverClock(); h.LastROResetServerTick(10000);
    h.setMono(100);
    expect(h.LastROSampleServerTick(10300, 20, 100)).toBe(true);
    h.setMono(200);
    expect(h.LastROSampleServerTick(10200, 120, 200)).toBe(false);
    expect(h.session.serverTick).toBe(10210);
    h.setMono(300);
    expect(h.LastROAdvanceServerTick()).toBe(10320);
  });
  it('clears an old zone probe and clock correction on entry and logout', () => {
    const h = serverClock(); h.LastROResetServerTick(10000); h.send();
    h.session.ping._lastroUnansweredSince = 1000;
    expect(h.LastROSampleServerTick(10100, 0, 0)).toBe(true);
    h.LastROInvalidateServerTick();
    expect(h.session.ping).toMatchObject({ returned: true, value: 0 });
    expect(h.session.ping.lastroSentMono).toBeUndefined();
    expect(h.session.ping._lastroUnansweredSince).toBeUndefined();
    h.setMono(1000); h.onPong({ time: 11000 });
    expect(h.LastROAdvanceServerTick()).toBe(0);
    h.LastROResetServerTick(5000);
    h.setMono(1016);
    expect(h.LastROAdvanceServerTick()).toBe(5016);
  });
  it('accounts for a long frame once and never replays its correction', () => {
    const h = serverClock(); h.LastROResetServerTick(10000);
    expect(h.LastROSampleServerTick(10200, 0, 0)).toBe(true);
    h.setMono(8000);
    expect(h.LastROAdvanceServerTick()).toBe(18200);
    expect(h.LastROAdvanceServerTick()).toBe(18200);
    h.setMono(8016);
    expect(h.LastROAdvanceServerTick()).toBe(18216);
  });
  it('does not charge a backwards performance sample again when time recovers', () => {
    const h = serverClock(); h.setMono(100); h.LastROResetServerTick(10000);
    h.setMono(150); expect(h.LastROAdvanceServerTick()).toBe(10050);
    h.setMono(120); expect(h.LastROAdvanceServerTick()).toBe(10050);
    h.setMono(160); expect(h.LastROAdvanceServerTick()).toBe(10060);
  });
  it('uses the entry packet server tick immediately without waiting for the first ping', () => {
    const resets = vi.fn();
    const engine = region('src/Engine/MapEngine.js');
    const start = engine.indexOf('function onConnectionAccepted$2(pkt) {');
    const end = engine.indexOf('  SessionStorage_default.Entity.onWalkEnd', start);
    const initialize = new Function('LastROResetServerTick', engine.slice(start, end) + '}\nreturn onConnectionAccepted$2;')(resets);
    initialize({ startTime: 5000 });
    initialize({ startTime: 0xffffffff });
    initialize({ startTime: 0 });
    expect(resets.mock.calls).toEqual([[5000], [0xffffffff], [0]]);
    resets.mockClear();
    for (const startTime of [undefined, NaN, -1, 0x100000000, '5000']) initialize({ startTime });
    expect(resets).not.toHaveBeenCalled();
  });
  it('rejects duplicated or changed runtime anchors', () => {
    expect(() => patchRuntimeFrameTiming(patched)).toThrow('anchor:frame-timing');
    expect(() => patchRuntimeFrameTiming(source.replace('const tick = _tick$1 + delay;', 'const tick = delay;'))).toThrow('anchor:frame-timing');
    expect(patchRuntimeFrameTiming('small fixture')).toBe('small fixture');
  });
});
