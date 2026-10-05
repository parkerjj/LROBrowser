import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  createLastroWalkPrediction, findLastroPredictedServerPath, lastroWalkStepDuration, sampleLastroWalkPrediction,
  type LastroWalkPredictionInput,
} from '../scripts/lastro-walk-prediction.mjs';

function map(blocked: number[][] = [], width = 40) {
  const cells = new Uint8Array(width * width).fill(2);
  for (const [x, y] of blocked) cells[x! + y! * width] = 0;
  return { width, height: width, TYPE: { WALKABLE: 2 }, getCellType: (x: number, y: number) => cells[x + y * width] };
}

function idle(input: Partial<LastroWalkPredictionInput> = {}) {
  return { position: [1, 1], walk: { speed: 150, total: 0 }, dest: [5, 1], now: 1000, altitude: map(), ...input };
}

function parityCases(seed: number) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const cases = [];
  for (const width of [12, 24, 48]) for (const density of [0, 0.08, 0.25, 0.45]) {
    for (let sample = 0; sample < 8; sample++) {
      const cells = new Uint8Array(width * width);
      for (let index = 0; index < cells.length; index++) cells[index] = random() < density ? 0 : 2;
      for (let request = 0; request < 4; request++) {
        const x0 = Math.floor(random() * width), y0 = Math.floor(random() * width);
        const x1 = Math.max(0, Math.min(width - 1, x0 + Math.floor(random() * 65) - 32));
        const y1 = Math.max(0, Math.min(width - 1, y0 + Math.floor(random() * 65) - 32));
        const requestCells = cells.slice();
        requestCells[x0 + y0 * width] = requestCells[x1 + y1 * width] = 2;
        cases.push({ x0, y0, x1, y1, altitude: {
          width, height: width, TYPE: { WALKABLE: 2 },
          getCellType: (x: number, y: number) => requestCells[x + y * width],
        } });
      }
    }
  }
  return cases;
}

describe('server-shaped step timing and paths', () => {
  it.each([
    [1, 0, 150, 150], [0, -1, 150, 150], [-1, 1, 150, 210],
    [1, 1, 151, 211], [0.25, 0, 150, 37.5], [0.25, 0.25, 151, 52.75],
    [3, -3, 151, 633], [4, 2, 150, 720], [0, 0, 150, 0],
  ])('computes (%s,%s) at %sms as %sms', (dx, dy, speed, expected) => {
    expect(lastroWalkStepDuration(dx, dy, speed)).toBe(expected);
  });

  it.each([[NaN, 0, 150], [1, Infinity, 150], [1, 1, 0], [1, 1, -150]])('rejects invalid duration input %j', (dx, dy, speed) => {
    expect(lastroWalkStepDuration(dx, dy, speed)).toBeNaN();
  });

  // Frozen outputs from the independent fixed-slot rAthena reference utility
  // in the local review evidence, not a second invocation of this planner.
  it.each([
    { start: [1, 1], target: [5, 3], blocked: [], path: [1, 1, 2, 2, 3, 3, 4, 3, 5, 3] },
    { start: [1, 3], target: [5, 3], blocked: [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5]], path: [1, 3, 2, 2, 2, 1, 2, 0, 3, 0, 4, 0, 5, 1, 5, 2, 5, 3] },
    { start: [5, 3], target: [1, 3], blocked: [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5]], path: [5, 3, 4, 4, 4, 5, 4, 6, 3, 6, 2, 6, 1, 5, 1, 4, 1, 3] },
    { start: [1, 1], target: [4, 4], blocked: [[1, 2], [2, 1]], path: [1, 1, 0, 1, 0, 2, 0, 3, 1, 4, 2, 4, 3, 4, 4, 4] },
    { start: [1, 2], target: [7, 5], blocked: [[3, 3], [4, 3], [4, 4], [5, 4]], path: [1, 2, 2, 3, 2, 4, 3, 5, 4, 5, 5, 5, 6, 5, 7, 5] },
    { start: [7, 5], target: [1, 2], blocked: [[3, 3], [4, 3], [4, 4], [5, 4]], path: [7, 5, 6, 4, 6, 3, 5, 2, 4, 2, 3, 2, 2, 2, 1, 2] },
  ])('matches the server reference from $start to $target', ({ start, target, blocked, path }) => {
    const out = new Int16Array(66).fill(-123);
    const count = findLastroPredictedServerPath(start[0]!, start[1]!, target[0]!, target[1]!, out, map(blocked, 12));
    expect(Array.from(out.slice(0, count * 2))).toEqual(path);
    expect(Array.from(out.slice(count * 2))).toEqual(new Array(66 - count * 2).fill(-123));
  });

  it('includes a zero-step origin and keeps the full 32-step boundary', () => {
    const out = new Int16Array(66), altitude = map();
    expect(findLastroPredictedServerPath(1, 1, 1, 1, out, altitude)).toBe(1);
    expect(Array.from(out.slice(0, 2))).toEqual([1, 1]);
    expect(findLastroPredictedServerPath(1, 1, 33, 33, out, altitude)).toBe(33);
    expect(Array.from(out.slice(64))).toEqual([33, 33]);
  });

  it('rejects long, blocked and invalid requests without writing a partial path', () => {
    const out = new Int16Array(66).fill(-123), altitude = map([[5, 1]]);
    expect(findLastroPredictedServerPath(1, 1, 34, 1, out, altitude)).toBe(0);
    expect(findLastroPredictedServerPath(1, 1, 5, 1, out, altitude)).toBe(0);
    expect(findLastroPredictedServerPath(1.5, 1, 4, 1, out, altitude)).toBe(0);
    expect(findLastroPredictedServerPath(1, 1, 33, 1, new Int16Array(64), altitude)).toBe(0);
    expect(Array.from(out)).toEqual(new Array(66).fill(-123));
  });

  // Each digest freezes all origin-inclusive coordinate arrays and untouched
  // output tails from the pre-optimization planner, not this implementation.
  it.each([
    [0x13579bdf, '9a98bda24020f4acbcb6419185d0e3ca81ae5961f41ba6958987268abdc6c840'],
    [0x2468ace0, 'e809ea7ce730ed7f1abf2c4be11d124aeb56aac86aa696d7c5f9097bd9c5c694'],
  ])('preserves the pre-optimization route choices for seed %s', (seed, expected) => {
    const digest = createHash('sha256');
    for (const { x0, y0, x1, y1, altitude } of parityCases(Number(seed))) {
      const out = new Int16Array(66).fill(-123);
      const count = findLastroPredictedServerPath(x0, y0, x1, y1, out, altitude);
      digest.update(count + ':' + Array.from(out).join(',') + '\n');
    }
    expect(digest.digest('hex')).toBe(expected);
  });

  it('rejects map dimensions whose numeric cell keys cannot remain exact', () => {
    const getCellType = vi.fn(() => 2), out = new Int16Array(66).fill(-123);
    for (const width of [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1]) {
      expect(findLastroPredictedServerPath(0, 0, 1, 0, out,
        { width, height: 2, TYPE: { WALKABLE: 2 }, getCellType })).toBe(0);
    }
    expect(getCellType).not.toHaveBeenCalled();
    expect(Array.from(out)).toEqual(new Array(66).fill(-123));
  });
});

describe('pure walking prediction', () => {
  it('samples an idle path using absolute time without accumulating repeated samples', () => {
    const prediction = createLastroWalkPrediction(idle());
    expect(sampleLastroWalkPrediction(prediction, 900)).toMatchObject({ x: 1, y: 1, finished: false, distance: 0 });
    expect(sampleLastroWalkPrediction(prediction, 1075)).toMatchObject({ x: 1.5, y: 1, finished: false, distance: 0.5, dx: 1, dy: 0 });
    expect(sampleLastroWalkPrediction(prediction, 1300)).toMatchObject({ x: 3, y: 1, distance: 2 });
    expect(sampleLastroWalkPrediction(prediction, 1075)?.x).toBe(1.5);
    expect(sampleLastroWalkPrediction(prediction, 1600)).toEqual({ x: 5, y: 1, finished: true, distance: 4, dx: 0, dy: 0 });
  });

  it('uses integer server diagonal timing over the whole route', () => {
    const prediction = createLastroWalkPrediction(idle({ dest: [33, 33] }));
    expect(prediction?.segments).toHaveLength(32);
    expect(prediction?.endTick).toBe(1000 + 32 * 210);
    expect(sampleLastroWalkPrediction(prediction, 7720)).toMatchObject({ x: 33, y: 33, finished: true });
  });

  it('finishes the in-flight authoritative cell before changing direction', () => {
    const onEnd = vi.fn(), path = new Int16Array([1, 1, 2, 1, 3, 1, 4, 1]);
    const walk = { speed: 150, total: 8, index: 2, path, pos: new Float32Array([1, 1]), tick: 1000, prevTick: 1060, onEnd };
    const before = { path: Array.from(path), pos: Array.from(walk.pos), tick: walk.tick, index: walk.index };
    const prediction = createLastroWalkPrediction(idle({ position: [1.4, 1], walk, now: 1060, dest: [2, 4] }));
    expect(prediction?.segments[0]).toEqual({ x0: 1.4, y0: 1, x1: 2, y1: 1, start: 1060, end: 1150 });
    expect(sampleLastroWalkPrediction(prediction, 1105)).toMatchObject({ x: 1.7, y: 1 });
    expect(sampleLastroWalkPrediction(prediction, 1150)).toMatchObject({ x: 2, y: 1, dx: 0, dy: 1 });
    expect(sampleLastroWalkPrediction(prediction, 1225)).toMatchObject({ x: 2, y: 1.5 });
    expect({ path: Array.from(path), pos: Array.from(walk.pos), tick: walk.tick, index: walk.index }).toEqual(before);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('projects a stale render index and keeps the currently moving server cell', () => {
    const walk = { speed: 150, total: 8, index: 2, path: new Int16Array([1, 1, 2, 1, 3, 1, 4, 1]), pos: [1, 1], tick: 1000 };
    const prediction = createLastroWalkPrediction(idle({ position: [1, 1], walk, now: 1225, dest: [3, 4] }));
    expect(prediction?.segments[0]).toEqual({ x0: 2.5, y0: 1, x1: 3, y1: 1, start: 1225, end: 1300 });
    expect(sampleLastroWalkPrediction(prediction, 1300)).toMatchObject({ x: 3, y: 1, dx: 0, dy: 1 });
  });

  it('changes target immediately when the request falls exactly on a cell boundary', () => {
    const walk = { speed: 150, total: 8, index: 2, path: new Int16Array([1, 1, 2, 1, 3, 1, 4, 1]), pos: [1, 1], tick: 1000 };
    const prediction = createLastroWalkPrediction(idle({ position: [2, 1], walk, now: 1150, dest: [2, 4] }));
    expect(prediction?.segments[0]).toEqual({ x0: 2, y0: 1, x1: 2, y1: 2, start: 1150, end: 1300 });
  });

  it('retains an already joined segment deadline before predicting the new route', () => {
    const walk = { speed: 150, total: 6, index: 2, path: [1, 1, 2, 1, 3, 1], pos: [1.4, 1], tick: 1060,
      _lastroJoinIndex: 2, _lastroJoinSpeed: 150, _lastroJoinEndTick: 1150 };
    const prediction = createLastroWalkPrediction(idle({ position: [1.7, 1], walk, now: 1105, dest: [2, 4] }));
    expect(prediction?.segments[0]?.end).toBe(1150);
    expect(prediction?.segments[0]?.x0).toBeCloseTo(1.7);
  });

  it('keeps cached in-flight speed after a buff and uses new speed from the next cell', () => {
    const walk = { speed: 75, total: 6, index: 2, path: [1, 1, 2, 1, 3, 1], pos: [1, 1], tick: 1000,
      _lastroServerStepIndex: 2, _lastroServerStepSpeed: 150 };
    const prediction = createLastroWalkPrediction(idle({ position: [1.5, 1], walk, now: 1075, dest: [2, 3] }));
    expect(prediction?.segments[0]).toEqual({ x0: 1.5, y0: 1, x1: 2, y1: 1, start: 1075, end: 1150 });
    expect(prediction?.segments[1]).toEqual({ x0: 2, y0: 1, x1: 2, y1: 2, start: 1150, end: 1225 });
    expect(sampleLastroWalkPrediction(prediction, 1187.5)).toMatchObject({ x: 2, y: 1.5 });

    const later = createLastroWalkPrediction(idle({ position: [1.5, 1], walk, now: 1175, dest: [3, 3] }));
    expect(later?.segments[0]?.end).toBe(1225);
    expect(later?.segments[0]?.x0).toBeCloseTo(2 + 25 / 75);
  });

  it('ignores a cached speed for FASTMOVE override or a different current cell', () => {
    const walk = { speed: 10, total: 6, index: 2, path: [1, 1, 2, 1, 3, 1], pos: [1, 1], tick: 1000,
      _lastroServerStepIndex: 2, _lastroServerStepSpeed: 150, _lastroNormalSpeed: 150 };
    const fast = createLastroWalkPrediction(idle({ position: [1.5, 1], walk, now: 1005, dest: [2, 3] }));
    expect(fast?.segments[0]?.end).toBe(1010);
    expect(fast?.segments[1]?.end).toBe(1020);

    const stale = createLastroWalkPrediction(idle({ position: [1.5, 1],
      walk: { ...walk, _lastroNormalSpeed: undefined, _lastroServerStepIndex: 4 }, now: 1005, dest: [2, 3] }));
    expect(stale?.segments[0]?.end).toBe(1010);
  });

  it('connects an idle fractional position to its nearest cell center without snapping', () => {
    const prediction = createLastroWalkPrediction(idle({ position: [1.25, 1.25], dest: { x: 4, y: 4 } }));
    expect(sampleLastroWalkPrediction(prediction, 1000)).toMatchObject({ x: 1.25, y: 1.25, distance: 0 });
    expect(prediction?.segments[0]).toEqual({ x0: 1.25, y0: 1.25, x1: 1, y1: 1, start: 1000, end: 1052.5 });
    expect(sampleLastroWalkPrediction(prediction, 1052.5)).toMatchObject({ x: 1, y: 1 });
  });

  it('refuses blocked fractional origins and clipped diagonal routes', () => {
    expect(createLastroWalkPrediction(idle({ position: [1.25, 1.25], altitude: map([[1, 1]]) }))).toBeNull();
    const findPath = (_x0: number, _y0: number, _x1: number, _y1: number, out: Int16Array) => { out.set([1, 1, 2, 2]); return 2; };
    expect(createLastroWalkPrediction(idle({ dest: [2, 2], altitude: map([[2, 1]]), findPath }))).toBeNull();
  });

  it('plans around a wall instead of drawing a straight prediction to the destination', () => {
    const prediction = createLastroWalkPrediction(idle({ position: [1, 3], dest: [5, 3], altitude: map([[3, 1], [3, 2], [3, 3], [3, 4], [3, 5]], 12) }));
    expect(prediction?.segments.some(segment => segment.x1 === 3 && segment.y1 === 0)).toBe(true);
    expect(prediction?.segments.every(segment => !(segment.x1 === 3 && segment.y1 >= 1 && segment.y1 <= 5))).toBe(true);
  });

  it('bounds the full plan including the retained cell or fractional connection', () => {
    expect(createLastroWalkPrediction(idle({ position: [1.25, 1], dest: [33, 1] }))).toBeNull();
    const walk = { speed: 150, total: 4, index: 2, path: [1, 1, 2, 1], pos: [1, 1], tick: 1000 };
    expect(createLastroWalkPrediction(idle({ position: [1.5, 1], walk, now: 1075, dest: [34, 1] }))).toBeNull();
    expect(createLastroWalkPrediction(idle({ position: [1.5, 1], walk, now: 1075, dest: [33, 1] }))?.segments).toHaveLength(32);
  });

  it('rejects incomplete, invalid and failed injected paths', () => {
    const endpointWrong = (_x0: number, _y0: number, _x1: number, _y1: number, out: Int16Array) => { out.set([1, 1, 2, 1]); return 2; };
    const leap = (_x0: number, _y0: number, _x1: number, _y1: number, out: Int16Array) => { out.set([1, 1, 5, 1]); return 2; };
    for (const findPath of [endpointWrong, leap, () => 0, () => 100, () => { throw new Error('GAT unavailable'); }]) {
      expect(createLastroWalkPrediction(idle({ findPath }))).toBeNull();
    }
  });

  it('returns no route for an already reached target and rejects malformed inputs', () => {
    expect(createLastroWalkPrediction(idle({ dest: [1, 1] }))).toBeNull();
    for (const input of [
      { position: [NaN, 1] }, { now: Infinity }, { dest: [1.5, 1] }, { walk: { speed: 0 } }, { walk: { speed: 150, total: NaN } },
      { walk: { speed: 150, total: 4, index: 2, pos: [1, 1], tick: 1000, path: [1, 1, 5, 1] } },
      { walk: { speed: 150, total: 3, index: 2, pos: [1, 1], tick: 1000, path: [1, 1, 2] } },
    ]) expect(createLastroWalkPrediction(idle(input))).toBeNull();
    expect(sampleLastroWalkPrediction(null, 1000)).toBeNull();
    expect(sampleLastroWalkPrediction(createLastroWalkPrediction(idle()), NaN)).toBeNull();
  });

  it('serializes all runtime functions with only their explicit declared dependencies', () => {
    const context = vm.createContext({ Int16Array, altitude: map() });
    const functions = [findLastroPredictedServerPath, lastroWalkStepDuration, createLastroWalkPrediction, sampleLastroWalkPrediction];
    const output = vm.runInContext(functions.map(fn => fn.toString()).join('\n')
      + '\nsampleLastroWalkPrediction(createLastroWalkPrediction({position:[1,1],walk:{speed:150},dest:[3,3],now:1000,altitude}),1105)', context);
    expect(output).toMatchObject({ x: 1.5, y: 1.5, finished: false });
  });
});
