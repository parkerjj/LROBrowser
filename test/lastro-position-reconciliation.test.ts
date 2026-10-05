import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import {
  createLastroPositionReconciler, type LastroPositionAltitude, type LastroPositionReconciler,
} from '../scripts/lastro-position-reconciliation.mjs';
import { findLastroServerWalkPath } from '../scripts/lastro-server-walk.mjs';

function map(width = 24) {
  const cells = new Uint8Array(width * width).fill(10);
  const altitude: LastroPositionAltitude = {
    width, height: width, TYPE: { WALKABLE: 2 },
    getCellType: (x, y) => cells[x + y * width],
    getCellHeight: (x, y) => x * 0.1 + y * 0.25,
  };
  const findPath = vi.fn(findLastroServerWalkPath);
  const reconciler = createLastroPositionReconciler({ altitude, findPath });
  const point = (x: number, y: number, elevation = 0) => new Float32Array([x, y, altitude.getCellHeight(x, y)! + elevation]);
  return { cells, altitude, findPath, reconciler, point };
}

function expectSafeSegment(from: number[], to: number[], altitude: LastroPositionAltitude) {
  let px = Math.round(from[0]!), py = Math.round(from[1]!);
  const walkable = (x: number, y: number) => x >= 0 && y >= 0 && x < altitude.width && y < altitude.height
    && (altitude.getCellType(x, y)! & altitude.TYPE.WALKABLE) !== 0;
  const steps = Math.max(1, Math.ceil(Math.hypot(to[0]! - from[0]!, to[1]! - from[1]!) * 100));
  for (let index = 0; index <= steps; index++) {
    const alpha = index / steps;
    const x = Math.round(from[0]! + (to[0]! - from[0]!) * alpha);
    const y = Math.round(from[1]! + (to[1]! - from[1]!) * alpha);
    expect(walkable(x, y), `${x},${y}`).toBe(true);
    if (x !== px && y !== py) {
      expect(walkable(x, py)).toBe(true); expect(walkable(px, y)).toBe(true);
    }
    px = x; py = y;
  }
}

function setStraightIndex(hint: { index: number; total: number } | undefined, x: number, origin = 2) {
  if (hint) hint.index = Math.min(hint.total - 2, Math.max(2, (Math.floor(x - origin) + 1) * 2));
}

function offRouteWallMap() {
  const scene = map();
  for (const [x, y] of [[6, 2], [6, 3], [4, 2]]) scene.cells[x! + y! * scene.altitude.width] = 1;
  return scene;
}

function microStopScene(xOffset = 0.06, yOffset = 0.06) {
  const scene = map();
  const path = new Int16Array([2, 2, 3, 2, 4, 2, 5, 2]);
  const active = { path, index: 4, total: path.length }, stopped = { path, index: 0, total: 0 };
  const original = scene.point(3 + xOffset, 2 + yOffset, 5), target = scene.point(3, 2, 5);
  scene.reconciler.reset(original, 0); scene.reconciler.correct(target, 0, 150, active);
  return { ...scene, path, active, stopped, original, target };
}

function acknowledgedForwardScene(arrived = false) {
  const scene = map(96);
  const path = new Int16Array(Array.from({ length: 33 }, (_, index) => [2 + index, 2]).flat());
  const hint = { path: arrived ? new Int16Array(64) : path, index: arrived ? 0 : 26, total: arrived ? 0 : path.length };
  const proof = { path, index: arrived ? path.length : 26, total: path.length };
  const display = scene.point(4, 2, 5), target = scene.point(arrived ? 34 : 14, 2, 5);
  scene.reconciler.reset(display, 600);
  return { ...scene, path, hint, proof, display, target };
}

describe('display position reconciliation', () => {
  it('follows the authority exactly outside a correction and never writes the target', () => {
    const { reconciler, point } = map();
    const target = point(3.125, 4.25, 5), original = Array.from(target);
    expect(reconciler.update(target, 0, 150)).toBe(reconciler.position);
    expect(Array.from(reconciler.position)).toEqual(original);
    const next = point(4, 6, 5);
    expect(reconciler.update(next, 16, 150)).toBe(reconciler.position);
    expect(Array.from(reconciler.position)).toEqual(Array.from(next));
    expect(Array.from(target)).toEqual(original);
  });

  it('preserves normal 0.8-cell high-speed frames when there is no position error', () => {
    const { reconciler, point } = map();
    const path = new Int16Array(Array.from({ length: 20 }, (_, index) => [2 + index, 2]).flat());
    const hint = { path, index: 2, total: path.length };
    reconciler.reset(point(2, 2), 0); reconciler.update(point(2, 2), 0, 20, hint);
    let previousX = reconciler.position[0]!;
    for (let now = 16; now <= 256; now += 16) {
      const target = point(2 + now / 20, 2), snapshot = Array.from(target);
      setStraightIndex(hint, target[0]!);
      const display = reconciler.update(target, now, 20, hint);
      expect(Array.from(display)).toEqual(snapshot);
      expect(display[0]! - previousX).toBeCloseTo(0.8, 5);
      expect(Array.from(target)).toEqual(snapshot);
      previousX = display[0]!;
    }
  });

  it.each([60, 80, 150, 251].flatMap(frame => [false, true].map(native => ({ frame, native }))))(
    'does not accumulate normal forward movement into correction lag at $frame ms frames (approved route $native)', ({ frame, native }) => {
      const { reconciler, point } = map(128);
      const path = new Int16Array(Array.from({ length: 120 }, (_, index) => [2 + index, 2]).flat());
      const hint = native ? { path, index: 2, total: path.length } : undefined;
      const speed = 40, advance = frame / speed;
      reconciler.reset(point(2, 2), 0); reconciler.correct(point(2.5, 2), 0, speed, hint);
      let previous = reconciler.position[0]!;
      for (let now = frame; now <= frame * 12; now += frame) {
        const target = point(2.5 + now / speed, 2), snapshot = Array.from(target);
        setStraightIndex(hint, target[0]!);
        reconciler.update(target, now, speed, hint);
        const step = reconciler.position[0]! - previous;
        expect(step).toBeGreaterThanOrEqual(advance - 0.45001);
        expect(step).toBeLessThanOrEqual(advance + 0.45001);
        expect(Math.abs(target[0]! - reconciler.position[0]!)).toBeLessThanOrEqual(0.50001);
        expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid|frame-gap/);
        expect(Array.from(target)).toEqual(snapshot);
        previous = reconciler.position[0]!;
      }
    },
  );

  it.each([false, true])('admits only the current proved forward advance before the strict local range check (approved route %s)', native => {
    const { reconciler, point } = map(128);
    const path = new Int16Array(Array.from({ length: 120 }, (_, index) => [2 + index, 2]).flat());
    const hint = native ? { path, index: 2, total: path.length } : undefined;
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(2.5, 2), 0, 20, hint);
    const target = point(2.5 + 251 / 20, 2);
    setStraightIndex(hint, target[0]!);
    reconciler.update(target, 251, 20, hint);
    expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid/);
    expect(reconciler.position[0]!).toBeGreaterThan(target[0]! - 0.5);
    expect(reconciler.position[0]!).toBeLessThanOrEqual(target[0]!);
  });

  it.each([false, true])('does not treat an unproved relocation or a suspended loop as normal high-speed progress (approved route %s)', native => {
    const { reconciler, point } = map(128);
    const path = new Int16Array(Array.from({ length: 120 }, (_, index) => [2 + index, 2]).flat());
    const hint = native ? { path, index: 2, total: path.length } : undefined;
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(2.5, 2), 0, 80, hint);
    setStraightIndex(hint, 20);
    expect(Array.from(reconciler.update(point(20, 2), 60, 80, hint))).toEqual(Array.from(point(20, 2)));
    expect(reconciler.lastHardSetReason).toMatch(/distance-limit|fit-invalid/);
    reconciler.reset(point(2, 2), 1000); setStraightIndex(hint, 2.5);
    reconciler.correct(point(2.5, 2), 1000, 80, hint);
    setStraightIndex(hint, 6.5);
    reconciler.update(point(6.5, 2), 2000, 80, hint);
    expect(reconciler.position[0]! - 2).toBeLessThanOrEqual(0.45001);
  });

  it.each([16, 80, 251])('smoothly consumes a reliably acknowledged forward corridor at %s ms frames without widening ordinary corrections', frame => {
    const { reconciler, point, hint, proof, display, target } = acknowledgedForwardScene();
    const snapshot = Array.from(target);
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, proof)).toBe(true);
    expect(Array.from(reconciler.position)).toEqual(Array.from(display));
    let previous = display[0]!, debt = 10;
    for (let now = 600 + frame; now <= 600 + frame * 20; now += frame) {
      const x = Math.min(34, 14 + (now - 600) / 40), authority = point(x, 2, 5);
      const advance = x - (now === 600 + frame ? 14 : Math.min(34, 14 + (now - 600 - frame) / 40));
      setStraightIndex(hint, x);
      if (x === 34) { hint.path = new Int16Array(64); hint.index = hint.total = 0; }
      reconciler.update(authority, now, 40, hint);
      expect(reconciler.position[0]! - previous).toBeLessThanOrEqual(advance + 0.45001);
      expect(reconciler.position[0]!).toBeGreaterThanOrEqual(previous);
      expect(x - reconciler.position[0]!).toBeLessThanOrEqual(debt + 0.00001);
      expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid|forward-invalid/);
      debt = x - reconciler.position[0]!; previous = reconciler.position[0]!;
      if (x === 34) break;
    }
    expect(Array.from(target)).toEqual(snapshot);
    const ordinary = acknowledgedForwardScene();
    expect(Array.from(ordinary.reconciler.correct(ordinary.target, 600, 40, ordinary.hint))).toEqual(Array.from(ordinary.target));
    expect(ordinary.reconciler.lastHardSetReason).toMatch(/distance-limit/);
  });

  it('finishes a native-arrived acknowledgement through its retained source path after resetRoute replaced the walk array', () => {
    const { reconciler, hint, proof, display, target } = acknowledgedForwardScene(true);
    expect(reconciler.continueApprovedMove(target, 600, 20, hint, proof)).toBe(true);
    let previous = display[0]!;
    for (let now = 616; now <= 3000; now += 16) {
      reconciler.update(target, now, 20, hint);
      expect(reconciler.position[0]! - previous).toBeLessThanOrEqual(0.45001);
      expect(reconciler.position[0]!).toBeGreaterThanOrEqual(previous);
      previous = reconciler.position[0]!;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
    expect(reconciler.continuingApprovedMove).toBe(false);
  });

  it.each(['stop', 'hit', 'control', 'skill', 'speed'])('retains only non-growing proved forward debt when %s cancels before convergence', reason => {
    const { reconciler, hint, proof, display, target } = acknowledgedForwardScene();
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, proof)).toBe(true);
    expect(reconciler.cancelApprovedMove()).toBe(true); expect(reconciler.cancelApprovedMove()).toBe(false);
    const stopped = { path: new Int16Array(64), index: 0, total: 0 }, speed = reason === 'speed' ? 80 : 40;
    reconciler.correct(target, 600, speed, stopped);
    expect(Array.from(reconciler.update(target, 600, speed, stopped))).toEqual(Array.from(display));
    let previous = display[0]!;
    for (let now = 616; now <= 2500; now += 16) {
      reconciler.cancelApprovedMove(); reconciler.releaseStopHold(now);
      reconciler.update(target, now, speed, stopped);
      expect(reconciler.position[0]! - previous).toBeLessThanOrEqual(0.45001);
      expect(reconciler.position[0]!).toBeGreaterThanOrEqual(previous);
      previous = reconciler.position[0]!;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('bridges only a new native source at the exact confirmed old visit and keeps its existing forward debt from growing', () => {
    const { reconciler, hint, proof, display, target, point } = acknowledgedForwardScene();
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, proof)).toBe(true);
    reconciler.cancelApprovedMove();
    const path = new Int16Array(Array.from({ length: 33 }, (_, index) => [14, 2 + index]).flat());
    const next = { path, index: 2, total: path.length };
    reconciler.correct(target, 600, 40, next);
    expect(reconciler.continuingApprovedMove).toBe(true);
    expect(Array.from(reconciler.position)).toEqual(Array.from(display));
    let previous = Array.from(display), debt = 10;
    for (let now = 616; now <= 1600; now += 16) {
      const y = 2 + (now - 600) / 40, authority = point(14, y, 5);
      setStraightIndex(next, y);
      reconciler.update(authority, now, 40, next);
      const current = Array.from(reconciler.position);
      expect(current[1] === 2 || current[0] === 14).toBe(true);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThanOrEqual(0.85001);
      const remaining = current[1] === 2 ? 14 - current[0]! + y - 2 : y - current[1]!;
      expect(remaining).toBeLessThanOrEqual(debt + 0.0001);
      expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid|forward-invalid/);
      debt = remaining; previous = current;
    }
  });

  it.each(['off-route', 'height', 'wall', 'loop', 'too-long', 'wrong-index'])('rejects an initial forward permission with %s proof', reason => {
    const { reconciler, path, hint, proof, display, target, point, cells, altitude } = acknowledgedForwardScene();
    if (reason === 'off-route') reconciler.reset(point(4, 2.1, 5), 600);
    if (reason === 'height') reconciler.reset(point(4, 2, 6), 600);
    if (reason === 'wall') cells[8 + 2 * altitude.width] = 1;
    if (reason === 'loop') { path[6] = 3; path[7] = 2; }
    if (reason === 'too-long') proof.total = 68;
    if (reason === 'wrong-index') proof.index = 8;
    const before = Array.from(reconciler.position);
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, proof)).toBe(false);
    expect(reconciler.continuingApprovedMove).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(before);
    expect(Array.from(display)).toEqual(Array.from(point(4, 2, 5)));
  });

  it.each(['wall', 'path', 'jump', 'unknown-move'])('never carries forward permission through %s invalidation', reason => {
    const { reconciler, hint, proof, target, point, cells, altitude } = acknowledgedForwardScene();
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, proof)).toBe(true);
    if (reason === 'wall') cells[8 + 2 * altitude.width] = 1;
    if (reason === 'path') hint.path[8] = 3;
    if (reason === 'jump') reconciler.reset(point(50, 50), 616, 'jump');
    if (reason === 'unknown-move') reconciler.correct(point(50, 50), 616, 40);
    else if (reason !== 'jump') reconciler.update(target, 616, 40, hint);
    expect(reconciler.continuingApprovedMove).toBe(false);
  });

  it.each([16, 80])('keeps a resumed same-direction STOP route moving at true high speed across %s ms frames', frame => {
    const { reconciler, point } = map(96);
    const path = new Int16Array(Array.from({ length: 33 }, (_, index) => [2 + index, 2]).flat());
    const old = { path, index: 4, total: path.length }, stop = { path, index: 0, total: 0 };
    reconciler.reset(point(3.4, 2), 0); reconciler.update(point(3.4, 2), 0, 20, old);
    reconciler.correct(point(3, 2), 0, 20, stop);
    const next = { path: new Int16Array(Array.from({ length: 33 }, (_, index) => [3 + index, 2]).flat()), index: 2, total: 66 };
    reconciler.correct(point(3, 2), 0, 20, next);
    let previous = 3.4;
    for (let now = frame; now <= Math.min(560, frame * 30); now += frame) {
      const x = 3 + now / 20, authority = point(x, 2);
      setStraightIndex(next, x, 3);
      reconciler.update(authority, now, 20, next);
      expect(reconciler.position[0]! - previous).toBeGreaterThanOrEqual(frame / 20 - 0.45001);
      expect(reconciler.position[0]! - previous).toBeLessThanOrEqual(frame / 20 + 0.45001);
      expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid/);
      previous = reconciler.position[0]!;
    }
  });

  it.each([16, 80, 251])('keeps a proved reverse STOP prefix bounded while accounting for its new native route at %s ms frames', frame => {
    const { reconciler, point } = map(96);
    const path = new Int16Array(Array.from({ length: 33 }, (_, index) => [2 + index, 2]).flat());
    const old = { path, index: 18, total: path.length }, stop = { path, index: 0, total: 0 };
    reconciler.reset(point(10, 2), 0); reconciler.update(point(10, 2), 0, 20, old);
    reconciler.correct(point(3, 2), 0, 20, stop);
    const next = { path: new Int16Array(Array.from({ length: 33 }, (_, index) => [3, 2 + index]).flat()), index: 2, total: 66 };
    reconciler.correct(point(3, 2), 0, 20, next);
    expect(reconciler.continuingApprovedMove).toBe(true);
    let previous = Array.from(reconciler.position);
    for (let now = frame; now <= frame * 140; now += frame) {
      const y = Math.min(34, 2 + now / 20), authority = point(3, y);
      setStraightIndex(next, y);
      if (y === 34 && next.total) { next.path = new Int16Array(64); next.index = next.total = 0; }
      reconciler.update(authority, now, 20, next);
      const current = Array.from(reconciler.position);
      expect(current[1] === 2 || current[0] === 3).toBe(true);
      if (previous[0]! > 3 + 1e-6) {
        expect(previous[0]! - current[0]!).toBeLessThanOrEqual(0.45001);
        expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThanOrEqual(0.45001);
      }
      expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid|recovery-invalid|forward-invalid/);
      previous = current;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(3, 34)));
  });

  it.each([30, 31, 32])('retains only the already proved old prefix for a fresh integer source %s from fractional authority 31.5', source => {
    const { reconciler, point, path } = acknowledgedForwardScene();
    const hint = { path, index: 60, total: path.length }, proof = { ...hint }, target = point(31.5, 2, 5);
    reconciler.reset(point(3, 2, 5), 600);
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, proof)).toBe(true);
    reconciler.cancelApprovedMove();
    const next = { path: new Int16Array(Array.from({ length: 33 }, (_, index) => [source, 2 + index]).flat()), index: 2, total: 66 };
    reconciler.correct(point(source, 2, 5), 600, 40, next);
    expect(reconciler.continuingApprovedMove).toBe(true);
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(3, 2, 5)));
    reconciler.update(point(source, 2.4, 5), 616, 40, next);
    expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid|forward-invalid/);
    expect(reconciler.position[0]).toBeGreaterThan(3);
    expect(reconciler.position[0]!).toBeLessThanOrEqual(4.05001);
  });

  it('rejects a new native source beyond the old authority segment instead of borrowing its forward debt', () => {
    const { reconciler, point, path } = acknowledgedForwardScene();
    const hint = { path, index: 60, total: path.length }, target = point(31.5, 2, 5);
    reconciler.reset(point(3, 2, 5), 600);
    expect(reconciler.continueApprovedMove(target, 600, 40, hint, hint)).toBe(true);
    reconciler.cancelApprovedMove();
    const next = { path: new Int16Array(Array.from({ length: 33 }, (_, index) => [33, 2 + index]).flat()), index: 2, total: 66 };
    expect(Array.from(reconciler.correct(point(33, 2, 5), 600, 40, next))).toEqual(Array.from(point(33, 2, 5)));
    expect(reconciler.continuingApprovedMove).toBe(false);
  });

  it.each([false, true].flatMap(diagonal => [false, true].map(moving => ({ diagonal, moving }))))(
    'keeps source alignment inside correction limits without adding normal movement (diagonal $diagonal, moving $moving)', ({ diagonal, moving }) => {
      const { reconciler, point } = map(96);
      const path = new Int16Array(Array.from({ length: 33 }, (_, index) => [2 + index, diagonal ? 2 + index : 2]).flat());
      const target = point(20.5, diagonal ? 20.5 : 2, 5), display = point(3, diagonal ? 3 : 2, 5);
      const old = { path, index: 38, total: 66 };
      reconciler.reset(display, 600);
      expect(reconciler.continueApprovedMove(target, 600, 20, old, old)).toBe(true);
      reconciler.cancelApprovedMove();
      const y = diagonal ? 21 : 2;
      const next = { path: new Int16Array(Array.from({ length: 33 }, (_, index) => [21 + index, y]).flat()), index: 2, total: 66 };
      reconciler.correct(point(21, y, 5), 600, 20, next);
      expect(Array.from(reconciler.position)).toEqual(Array.from(display));
      let previous = Array.from(display);
      for (let now = 616; now <= 680; now += 16) {
        const x = moving ? 21 + (now - 600) / 20 : 21;
        setStraightIndex(next, x, 21);
        reconciler.update(point(x, y, 5), now, 20, next);
        const current = Array.from(reconciler.position), advance = moving ? 0.8 : 0;
        expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThanOrEqual(advance + 0.45001);
        expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid|forward-invalid/);
        previous = current;
      }
    },
  );

  it.each([80, 150, 251])('preserves the native corners and forward budget of a lateral phase fit at %s ms frames', frame => {
    const { reconciler, point } = map(96), nodes = [[2, 2]];
    for (let index = 1; index < 33; index++) {
      const previous = nodes[nodes.length - 1]!;
      nodes.push([previous[0]! + (Math.floor((index - 1) / 3) % 2 === 0 ? 1 : 0),
        previous[1]! + (Math.floor((index - 1) / 3) % 2 === 1 ? 1 : 0)]);
    }
    const path = new Int16Array(nodes.flat()), hint = { path, index: 2, total: path.length };
    reconciler.reset(point(2, 2.2), 0); reconciler.correct(point(2.5, 2), 0, 40, hint);
    let previous = Array.from(reconciler.position);
    for (let now = frame; now <= frame * 8; now += frame) {
      const progress = Math.min(31.99, 0.5 + now / 40), index = Math.floor(progress), alpha = progress - index;
      const a = nodes[index]!, b = nodes[index + 1]!;
      const target = point(a[0]! + (b[0]! - a[0]!) * alpha, a[1]! + (b[1]! - a[1]!) * alpha);
      hint.index = (index + 1) * 2;
      reconciler.update(target, now, 40, hint);
      const current = Array.from(reconciler.position);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThanOrEqual(frame / 40 + 0.45001);
      expect(Math.hypot(current[0]! - target[0]!, current[1]! - target[1]!)).toBeLessThan(0.8);
      expect(reconciler.lastHardSetReason).not.toMatch(/distance-limit|fit-invalid/);
      previous = current;
    }
  });

  it.each([16, 251, 1000])('holds a caller-approved lateral micro STOP across a %s ms frame without changing authority', gap => {
    const { reconciler, original, target, stopped } = microStopScene();
    const snapshot = Array.from(target), shown = Array.from(original);
    expect(reconciler.holdSmallStop(target, 0, 150, stopped)).toBe(true);
    expect(reconciler.holdingMicroStop).toBe(true); expect(reconciler.holdingStop).toBe(false);
    for (const now of [gap, gap + 16, gap + 1000]) {
      expect(Array.from(reconciler.update(target, now, 150, stopped))).toEqual(shown);
      expect(reconciler.canContinueFromSameCell(target, stopped)).toBe(true);
      expect(Array.from(reconciler.direction)).toEqual([0, 0]);
    }
    expect(Array.from(target)).toEqual(snapshot);
  });

  it('keeps micro eligibility queries read-only and clamps caller-provided tolerances', () => {
    const baseline = microStopScene(), queried = microStopScene();
    const snapshot = Array.from(queried.target);
    for (let now = 16; now <= 640; now += 16) {
      for (let index = 0; index < 20; index++) queried.reconciler.canContinueFromSameCell(queried.target, queried.stopped);
      expect(Array.from(queried.reconciler.update(queried.target, now, 150, queried.stopped)))
        .toEqual(Array.from(baseline.reconciler.update(baseline.target, now, 150, baseline.stopped)));
      expect(queried.reconciler.holdingMicroStop).toBe(false);
    }
    expect(Array.from(queried.target)).toEqual(snapshot);
    const tooFar = microStopScene(0.13, 0);
    expect(tooFar.reconciler.canContinueFromSameCell(tooFar.target, tooFar.stopped, 8)).toBe(false);
    expect(tooFar.reconciler.holdSmallStop(tooFar.target, 0, 150, tooFar.stopped)).toBe(false);
  });

  it.each(['active-route', 'unknown-route', 'changed-elevation', 'blocked-cell', 'different-cell'])(
    'rejects a micro hold when its same-cell proof is invalid (%s)', invalid => {
      const scene = microStopScene();
      const { reconciler, altitude, cells, target, point, active, stopped } = scene;
      let nextTarget = target, hint = stopped;
      if (invalid === 'active-route') hint = active;
      if (invalid === 'unknown-route') reconciler.reset(scene.original, 0);
      if (invalid === 'changed-elevation') nextTarget = point(3, 2, 6);
      if (invalid === 'blocked-cell') cells[3 + 2 * altitude.width] = 1;
      if (invalid === 'different-cell') nextTarget = point(4, 2, 5);
      const before = Array.from(reconciler.position);
      expect(reconciler.holdSmallStop(nextTarget, 0, 150, hint)).toBe(false);
      expect(reconciler.canContinueFromSameCell(nextTarget, hint)).toBe(false);
      expect(Array.from(reconciler.position)).toEqual(before);
      expect(reconciler.holdingMicroStop).toBe(false);
    },
  );

  it('releases a lateral micro hold into smooth correction for a hit/control caller', () => {
    const { reconciler, target, stopped, altitude } = microStopScene();
    expect(reconciler.holdSmallStop(target, 0, 150, stopped)).toBe(true);
    const before = Array.from(reconciler.position);
    expect(reconciler.releaseStopHold(80)).toBe(true);
    expect(reconciler.holdingMicroStop).toBe(false); expect(Array.from(reconciler.position)).toEqual(before);
    let previous = before;
    for (let now = 96; now <= 720; now += 16) {
      const display = Array.from(reconciler.update(target, now, 150, stopped));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThan(0.03);
      expect(reconciler.lastHardSetReason).not.toContain('off-route');
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('consumes a micro hold continuously on a new approved MOVE or different STOP and resets genuine relocation', () => {
    for (const event of ['move', 'stop', 'jump']) {
      const { reconciler, target, stopped, point, original } = microStopScene();
      expect(reconciler.holdSmallStop(target, 0, 150, stopped)).toBe(true);
      if (event === 'jump') {
        const jump = point(15, 15, 5);
        reconciler.reset(jump, 16, 'jump');
        expect(Array.from(reconciler.position)).toEqual(Array.from(jump));
      } else {
        const path = new Int16Array([3, 2, 4, 3, 5, 4]), active = { path, index: 2, total: path.length };
        const next = event === 'move' ? target : point(4, 2, 5);
        reconciler.correct(next, 16, 150, event === 'move' ? active : stopped);
        expect(Array.from(reconciler.position)).toEqual(Array.from(original));
        reconciler.update(next, 32, 150, event === 'move' ? active : stopped);
        expect(Math.hypot(reconciler.position[0]! - original[0]!, reconciler.position[1]! - original[1]!)).toBeLessThan(0.22);
      }
      expect(reconciler.holdingMicroStop).toBe(false);
    }
  });

  it('revokes a held micro tolerance immediately if its cell becomes blocked', () => {
    const { reconciler, target, stopped, cells, altitude } = microStopScene();
    expect(reconciler.holdSmallStop(target, 0, 150, stopped)).toBe(true);
    cells[3 + 2 * altitude.width] = 1;
    expect(Array.from(reconciler.update(target, 1000, 150, stopped))).toEqual(Array.from(target));
    expect(reconciler.holdingMicroStop).toBe(false);
    expect(reconciler.lastHardSetReason).toBe('micro-hold-unsafe-link');
  });

  it('keeps correction velocity when an approved native route becomes a lateral direct link', () => {
    const baseline = map(), turned = map();
    const path = new Int16Array(Array.from({ length: 16 }, (_, index) => [2 + index, 2]).flat());
    const hint = { path, index: 2, total: path.length }, positionsAt48: number[] = [];
    for (const { reconciler, point } of [baseline, turned]) {
      reconciler.reset(point(3, 2), 0); reconciler.correct(point(2, 2), 0, 150, hint);
      for (const now of [16, 32, 48]) reconciler.update(point(2, 2), now, 150, hint);
      positionsAt48.push(reconciler.position[0]!);
    }
    const diagonal = new Int16Array([2, 2, 3, 3, 4, 4, 5, 5]);
    const nextHint = { path: diagonal, index: 2, total: diagonal.length };
    turned.reconciler.correct(turned.point(2, 2), 48, 150, nextHint);
    expect(turned.reconciler.position[0]).toBe(positionsAt48[1]);
    baseline.reconciler.update(baseline.point(2, 2), 64, 150, hint);
    turned.reconciler.update(turned.point(2, 2), 64, 150, nextHint);
    const baselineStep = baseline.reconciler.position[0]! - positionsAt48[0]!;
    const turnedStep = turned.reconciler.position[0]! - positionsAt48[1]!;
    expect(turnedStep).toBeCloseTo(baselineStep, 5);
    expect(Math.abs(turnedStep)).toBeGreaterThan(0.12);
  });

  it('projects native correction speed into a safe phase link when the approved target turns', () => {
    const { reconciler, point, altitude } = map();
    const east = new Int16Array([2, 2, 3, 2, 4, 2, 5, 2]), active = { path: east, index: 4, total: east.length };
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(3, 2), 0, 150);
    reconciler.update(point(3.1, 2), 16, 150); reconciler.correct(point(3.1, 2), 16, 150, active);
    const previous = Array.from(reconciler.position);
    reconciler.update(point(3.2, 2), 32, 150, active);
    const before = Array.from(reconciler.position), previousStep = before[0]! - previous[0]!;
    const west = new Int16Array([4, 3, 3, 3, 2, 3]), nextHint = { path: west, index: 2, total: west.length };
    reconciler.correct(point(4, 3), 32, 150, nextHint);
    expect(Array.from(reconciler.position)).toEqual(before);
    const after = Array.from(reconciler.update(point(4, 3), 48, 150, nextHint));
    expectSafeSegment(before, after, altitude);
    const nextStep = Math.hypot(after[0]! - before[0]!, after[1]! - before[1]!);
    expect(nextStep).toBeGreaterThan(previousStep * 0.8);
    expect(nextStep).toBeLessThanOrEqual(2 * 16 / 150 + 1e-6);
  });

  it.each([
    { from: [2, 2], to: [4, 2], direction: 1 },
    { from: [4, 2], to: [2, 2], direction: -1 },
  ])('smoothly catches a stopped target from $from to $to', ({ from, to, direction }) => {
    const { reconciler, point } = map();
    const target = point(to[0]!, to[1]!, 5), original = Array.from(target);
    reconciler.reset(point(from[0]!, from[1]!, 5), 0);
    reconciler.correct(target, 0, 150);
    expect(reconciler.position[0]).toBe(from[0]);
    let previous = reconciler.position[0]!;
    for (let now = 16; now <= 640; now += 16) {
      const display = reconciler.update(target, now, 150);
      expect((display[0]! - previous) * direction).toBeGreaterThanOrEqual(-1e-6);
      expect(Math.abs(display[0]! - previous)).toBeLessThan(0.45);
      expect(display[2]).toBeCloseTo(display[0]! * 0.1 + display[1]! * 0.25 + 5, 5);
      previous = display[0]!;
    }
    expect(Array.from(reconciler.position)).toEqual(original);
    expect(Array.from(target)).toEqual(original);
  });

  it('tracks a moving target through a turn and reaches its stopped endpoint', () => {
    const { reconciler, point, altitude } = map();
    reconciler.reset(point(2, 2), 0);
    reconciler.correct(point(3, 2), 0, 150);
    let previous = Array.from(reconciler.position), turned = false;
    for (let now = 16; now <= 720; now += 16) {
      const target = now < 160 ? point(3 + now / 150, 2) : point(4, 2 + Math.min(2, (now - 160) / 150));
      const display = Array.from(reconciler.update(target, now, 150));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - target[0]!, display[1]! - target[1]!)).toBeLessThan(6);
      if (display[1]! > 2.1) turned = true;
      previous = display;
    }
    expect(turned).toBe(true);
    expect(reconciler.position[0]).toBe(4); expect(reconciler.position[1]).toBe(4);
  });

  it('does not let repeated correction packets postpone convergence', () => {
    const baseline = map(), repeated = map(), target = baseline.point(5, 2);
    for (const { reconciler, point } of [baseline, repeated]) {
      reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    }
    for (let now = 16; now <= 608; now += 16) {
      repeated.reconciler.correct(target, now, 150);
      baseline.reconciler.update(target, now, 150);
      repeated.reconciler.update(target, now, 150);
      expect(Array.from(repeated.reconciler.position)).toEqual(Array.from(baseline.reconciler.position));
    }
    expect(Array.from(repeated.reconciler.position)).toEqual(Array.from(target));
  });

  it.each(['same-corridor', 'parallel-corridor'] as const)(
    'fits a six-to-seven-cell approved MOVE without a preceding STOP (%s)', corridor => {
      const { reconciler, point, altitude } = map();
      const oldPath = new Int16Array(Array.from({ length: 14 }, (_, index) => [2 + index, 2]).flat());
      const originX = corridor === 'same-corridor' ? 2 : 3, targetY = corridor === 'same-corridor' ? 2 : 3;
      const path = new Int16Array(Array.from({ length: 16 - originX }, (_, index) => [originX + index, targetY]).flat());
      const hint = { path, index: 2, total: path.length }, original = point(9.25, 2, 5);
      reconciler.reset(original, 0);
      reconciler.update(original, 0, 150, { path: oldPath, index: 16, total: oldPath.length });
      const target = point(originX, targetY, 5), authoritySnapshot = Array.from(target);
      reconciler.correct(target, 0, 150, hint);
      expect(Array.from(reconciler.position)).toEqual(Array.from(original));
      expect(Array.from(target)).toEqual(authoritySnapshot);
      let previous = Array.from(reconciler.position), fractional = false;
      for (let now = 16; now <= 3200; now += 16) {
        const targetX = Math.min(12, originX + now / 150), authority = point(targetX, targetY, 5);
        setStraightIndex(hint, targetX, originX);
        const display = Array.from(reconciler.update(authority, now, 150, hint));
        expectSafeSegment(previous, display, altitude);
        expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(0.45 + 1e-6);
        if (corridor === 'same-corridor' && targetX < 12) expect(display[0]).toBeGreaterThan(previous[0]!);
        if (display[0] !== Math.round(display[0]!) || display[1] !== Math.round(display[1]!)) fractional = true;
        expect(display[2]).toBeCloseTo(display[0]! * 0.1 + display[1]! * 0.25 + 5, 5);
        previous = display;
      }
      expect(fractional).toBe(true);
      expect(Array.from(reconciler.position)).toEqual(Array.from(point(12, targetY, 5)));
    },
  );

  it.each([false, true])('caps a stopped 5.5-cell correction at two walking speeds and 0.45 cells per frame (approved %s)', native => {
    const { reconciler, point, altitude } = map();
    const path = new Int16Array(Array.from({ length: 12 }, (_, index) => [2 + index, 2]).flat());
    const original = point(9.5, 2, 5), target = point(4, 2, 5), snapshot = Array.from(target);
    const hint = native ? { path, index: 0, total: 0 } : undefined;
    reconciler.reset(original, 0);
    if (native) reconciler.update(original, 0, 150, { path, index: 16, total: path.length });
    reconciler.correct(target, 0, 150, hint);
    expect(Array.from(reconciler.position)).toEqual(Array.from(original));
    let previous = Array.from(reconciler.position);
    for (let now = 50; now <= 2200; now += 50) {
      const display = Array.from(reconciler.update(target, now, 150, hint));
      const distance = Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!);
      expect(distance).toBeLessThanOrEqual(Math.min(0.45, 2 * 50 / 150) + 1e-6);
      expect(display[0]).toBeLessThanOrEqual(previous[0]! + 1e-6);
      expect(display[0]).toBeGreaterThanOrEqual(target[0]!);
      expectSafeSegment(previous, display, altitude);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(snapshot);
    expect(Array.from(target)).toEqual(snapshot);
  });

  it.each(['approved', 'parallel', 'unknown'] as const)(
    'dense identical position and route snapshots preserve the baseline recovery (%s)', corridor => {
      const baseline = map(), repeated = map();
      const targetY = corridor === 'parallel' ? 3 : 2;
      const path = new Int16Array(Array.from({ length: 14 }, (_, index) => [2 + index, targetY]).flat());
      const hint = corridor === 'unknown' ? undefined : { path, index: 2, total: path.length };
      const startX = corridor === 'unknown' ? 7.5 : 9.25;
      for (const { reconciler, point } of [baseline, repeated]) {
        reconciler.reset(point(startX, 2), 0); reconciler.correct(point(2, targetY), 0, 150, hint);
      }
      const target = baseline.point(2, targetY), snapshot = Array.from(target);
      for (let now = 16; now <= 2400; now += 16) {
        const refreshedHint = hint && { path: new Int16Array(path), index: 2, total: path.length };
        repeated.reconciler.correct(target, now, 150, refreshedHint);
        baseline.reconciler.update(target, now, 150, hint);
        repeated.reconciler.update(target, now, 150, refreshedHint);
        expect(Array.from(repeated.reconciler.position)).toEqual(Array.from(baseline.reconciler.position));
      }
      expect(Array.from(repeated.reconciler.position)).toEqual(snapshot);
      expect(Array.from(target)).toEqual(snapshot);
    },
  );

  it('rejects a short Euclidean correction when the approved U-shaped visit is more than eight cells away', () => {
    const { reconciler, point } = map();
    const nodes = Array.from({ length: 9 }, (_, index) => [2 + index, 2]);
    nodes.push([10, 3], [10, 4]);
    nodes.push(...Array.from({ length: 8 }, (_, index) => [9 - index, 4]));
    const path = new Int16Array(nodes.flat()), target = point(2, 2);
    reconciler.reset(point(2, 4), 0);
    reconciler.update(point(2, 4), 0, 150, { path, index: path.length, total: path.length });
    reconciler.correct(target, 0, 150, { path, index: 2, total: path.length });
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('fits a nearby approved route around a wall without cutting blocked corners', () => {
    const { reconciler, point, altitude, cells, findPath } = map();
    cells[6 + 2 * altitude.width] = cells[6 + 3 * altitude.width] = 1;
    const original = point(9.25, 2, 5), target = point(3, 3, 5), snapshot = Array.from(target);
    const path = new Int16Array([3, 3, 4, 3, 5, 3]), hint = { path, index: 2, total: path.length };
    reconciler.reset(original, 0); reconciler.correct(target, 0, 150, hint);
    expect(Array.from(reconciler.position)).toEqual(Array.from(original));
    let previous = Array.from(reconciler.position), wentAround = false;
    for (let now = 16; now <= 2400; now += 16) {
      const display = Array.from(reconciler.update(target, now, 150, hint));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / 150) + 1e-6);
      if (display[1]! < 1.5 || display[1]! > 3.5) wentAround = true;
      previous = display;
    }
    expect(wentAround).toBe(true);
    expect(findPath).toHaveBeenCalled();
    expect(findPath.mock.calls.length).toBeLessThan(5);
    expect(Array.from(reconciler.position)).toEqual(snapshot);
    expect(Array.from(target)).toEqual(snapshot);
  });

  it('rejoins a moving approved route when the original wall detour can no longer reach its target safely', () => {
    const { reconciler, point, altitude, findPath } = offRouteWallMap();
    const path = new Int16Array([3, 3, 3, 2, 3, 1, 3, 0]), hint = { path, index: 2, total: path.length };
    const original = point(9.25, 2, 5);
    reconciler.reset(original, 0); reconciler.correct(point(3, 3, 5), 0, 150, hint);
    expect(Array.from(reconciler.position)).toEqual(Array.from(original));
    let previous = Array.from(reconciler.position);
    for (let now = 16; now <= 3200; now += 16) {
      const y = Math.max(0, 3 - now / 150), target = point(3, y, 5);
      hint.index = Math.min(path.length - 2, (Math.floor(3 - y) + 1) * 2);
      const display = Array.from(reconciler.update(target, now, 150, hint));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / 150) + 1e-6);
      expect(Math.hypot(display[0]! - target[0]!, display[1]! - target[1]!)).toBeLessThanOrEqual(8 + 1e-6);
      expect(display[2]).toBeCloseTo(display[0]! * 0.1 + display[1]! * 0.25 + 5, 5);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(3, 0, 5)));
    expect(findPath.mock.calls.length).toBeLessThan(6);
  });

  it.each([500, 800])('retains a safe seven-cell approved detour while walking slowly at %s ms per cell', speed => {
    const { reconciler, point, altitude } = offRouteWallMap();
    const path = new Int16Array([3, 3, 4, 3, 5, 3]), hint = { path, index: 2, total: path.length };
    const original = point(9.25, 2, 5), target = point(3, 3, 5), snapshot = Array.from(target);
    reconciler.reset(original, 0); reconciler.correct(target, 0, speed, hint);
    expect(Array.from(reconciler.position)).toEqual(Array.from(original));
    let previous = Array.from(reconciler.position);
    for (let now = 50; now <= 12000; now += 50) {
      const display = Array.from(reconciler.update(target, now, speed, hint));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 50 / speed) + 1e-6);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(snapshot);
    expect(Array.from(target)).toEqual(snapshot);
  });

  it('keeps a wall detour continuous when speed slows and a repeated server snapshot arrives', () => {
    const { reconciler, point, altitude } = offRouteWallMap();
    const path = new Int16Array([3, 3, 4, 3, 5, 3]), hint = { path, index: 2, total: path.length };
    const original = point(9.25, 2, 5), target = point(3, 3, 5);
    reconciler.reset(original, 0); reconciler.correct(target, 0, 150, hint);
    let previous = Array.from(reconciler.position);
    for (let now = 16; now <= 8000; now += 16) {
      const speed = now < 96 ? 150 : 800;
      if (now === 96) {
        const before = Array.from(reconciler.position);
        reconciler.correct(target, now, speed, { ...hint, path: new Int16Array(path) });
        expect(Array.from(reconciler.position)).toEqual(before);
      }
      const display = Array.from(reconciler.update(target, now, speed, hint));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / speed) + 1e-6);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('keeps an approved lateral fit inside eight cells while authority advances near its boundary', () => {
    const { reconciler, point, altitude } = map();
    const path = new Int16Array(Array.from({ length: 6 }, (_, index) => [10 + index, 3]).flat());
    const hint = { path, index: 2, total: path.length }, original = point(2.5, 2, 5);
    reconciler.reset(original, 0); reconciler.correct(point(10.4, 3, 5), 0, 150, hint);
    expect(Array.from(reconciler.position)).toEqual(Array.from(original));
    let previous = Array.from(reconciler.position);
    for (let now = 16; now <= 3200; now += 16) {
      const x = Math.min(15, 10.4 + now / 150), target = point(x, 3, 5);
      setStraightIndex(hint, x, 10);
      const display = Array.from(reconciler.update(target, now, 150, hint));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / 150) + 1e-6);
      expect(Math.hypot(display[0]! - target[0]!, display[1]! - target[1]!)).toBeLessThanOrEqual(8 + 1e-6);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(15, 3, 5)));
  });

  it.each([false, true])('stops at a delayed STOP instead of crossing it and springing back (approved path %s)', native => {
    const { reconciler, point } = map();
    const path = new Int16Array(Array.from({ length: 12 }, (_, index) => [2 + index, 2]).flat());
    const hint = native ? { path, index: 6, total: path.length } : undefined;
    reconciler.reset(point(5.5, 2), 0); reconciler.correct(point(4, 2), 0, 150, hint);
    for (let now = 16; now <= 160; now += 16) {
      const target = point(4 + now / 150, 2);
      setStraightIndex(hint, target[0]!);
      reconciler.update(target, now, 150, hint);
    }
    const target = point(reconciler.position[0]! - 0.05, 2), original = Array.from(target);
    const stopped = native ? { path, index: 0, total: 0 } : undefined;
    const before = Array.from(reconciler.position);
    reconciler.correct(target, 160, 150, stopped);
    expect(Array.from(reconciler.position)).toEqual(before);
    let previous = reconciler.position[0]!;
    for (let now = 176; now <= 800; now += 16) {
      reconciler.correct(target, now, 150, stopped);
      reconciler.update(target, now, 150, stopped);
      expect(reconciler.position[0]).toBeGreaterThanOrEqual(target[0]! - 1e-6);
      expect(reconciler.position[0]).toBeLessThanOrEqual(previous + 1e-6);
      previous = reconciler.position[0]!;
    }
    expect(Array.from(reconciler.position)).toEqual(original);
    expect(Array.from(target)).toEqual(original);
  });

  it('does not reintroduce a settled axis from residual velocity after an action stops movement', () => {
    const { reconciler, point } = map();
    reconciler.reset(point(5.5, 5.5), 0); reconciler.correct(point(4, 4), 0, 150);
    for (let now = 16; now <= 160; now += 16) {
      reconciler.update(point(4 + now / 150, 4 + now / 150), now, 150);
    }
    const target = point(reconciler.position[0]!, reconciler.position[1]! - 0.05);
    reconciler.correct(target, 160, 150);
    for (let now = 176; now <= 800; now += 16) {
      reconciler.update(target, now, 150);
      expect(reconciler.position[0]).toBe(target[0]);
      expect(reconciler.position[1]).toBeGreaterThanOrEqual(target[1]! - 1e-6);
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('holds a small approved same-cell skill STOP without changing authority or sliding backwards', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2, 5, 2]);
    const active = { path, index: 4, total: path.length }, stopped = { path, index: 0, total: 0 };
    const display = point(3.2, 2, 5), target = point(3, 2, 5), original = Array.from(target);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    expect(reconciler.holdingStop).toBe(true);
    for (let now = 16; now <= 640; now += 16) {
      reconciler.correct(target, now, 150, stopped);
      expect(Array.from(reconciler.update(target, now, 150, stopped))).toEqual(Array.from(display));
      expect(Array.from(reconciler.direction)).toEqual([0, 0]);
      expect(reconciler.holdingStop).toBe(true);
    }
    expect(Array.from(target)).toEqual(original);
  });

  it('releases a held skill STOP into smooth normal correction for a hit or failed skill', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2]);
    const active = { path, index: 4, total: path.length }, stopped = { path, index: 0, total: 0 };
    const display = point(3.2, 2), target = point(3, 2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    reconciler.update(target, 160, 150, stopped);
    expect(reconciler.releaseStopHold(160)).toBe(true);
    expect(reconciler.releaseStopHold(160)).toBe(false);
    expect(reconciler.holdingStop).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(Array.from(display));
    let previous = reconciler.position[0]!;
    for (let now = 176; now <= 800; now += 16) {
      reconciler.update(target, now, 150, stopped);
      expect(reconciler.position[0]).toBeLessThanOrEqual(previous);
      expect(reconciler.position[0]).toBeGreaterThanOrEqual(target[0]!);
      expect(previous - reconciler.position[0]!).toBeLessThan(0.04);
      previous = reconciler.position[0]!;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('automatically releases a held STOP on an approved MOVE and keeps its display continuous', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2, 5, 2]);
    const active = { path, index: 4, total: path.length }, stopped = { path, index: 0, total: 0 };
    const display = point(3.2, 2), target = point(3, 2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    reconciler.update(target, 100, 150, stopped);
    reconciler.correct(target, 100, 150, active);
    expect(reconciler.holdingStop).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(Array.from(display));
    let previous = reconciler.position[0]!;
    for (let now = 116; now <= 350; now += 16) {
      const authority = point(3 + (now - 100) / 150, 2);
      setStraightIndex(active, authority[0]!);
      reconciler.update(authority, now, 150, active);
      expect(reconciler.position[0]).toBeGreaterThan(previous);
      previous = reconciler.position[0]!;
    }
  });

  it('automatically releases a held STOP for a different STOP and an actual reset', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2]);
    const active = { path, index: 4, total: path.length }, stopped = { path, index: 0, total: 0 };
    const display = point(3.2, 2), target = point(3, 2), earlier = point(2, 2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    reconciler.correct(earlier, 16, 150, stopped);
    expect(reconciler.holdingStop).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(Array.from(display));
    for (let now = 32; now <= 700; now += 16) reconciler.update(earlier, now, 150, stopped);
    expect(Array.from(reconciler.position)).toEqual(Array.from(earlier));
    reconciler.reset(display, 800); reconciler.update(display, 800, 150, active);
    expect(reconciler.holdAtStop(target, 800, 150, stopped)).toBe(true);
    reconciler.reset(point(12, 14), 816);
    expect(reconciler.holdingStop).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(12, 14)));
  });

  it.each([
    { from: [3.5, 2], to: [3, 2] },
    { from: [3.6, 2], to: [3, 2] },
    { from: [2.9, 2], to: [3, 2] },
    { from: [3.2, 2], to: [3.1, 2] },
  ])('rejects a skill STOP outside the approved same-cell ahead range ($from to $to)', ({ from, to }) => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2]), active = { path, index: from[0]! < 3 ? 2 : 4, total: path.length };
    const display = point(from[0]!, from[1]!), target = point(to[0]!, to[1]!);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, { path, index: 0, total: 0 })).toBe(false);
    expect(reconciler.holdingStop).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(Array.from(display));
  });

  it('rejects missing approved cursors, active routes, blocked terrain and changed elevation for a skill hold', () => {
    const { reconciler, point, cells, altitude } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2]), active = { path, index: 4, total: path.length };
    const stopped = { path, index: 0, total: 0 }, display = point(3.2, 2), target = point(3, 2);
    reconciler.reset(display, 0);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(false);
    reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, active)).toBe(false);
    expect(reconciler.holdAtStop(point(3, 2, 5), 0, 150, stopped)).toBe(false);
    cells[3 + 2 * altitude.width] = 1;
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(false);
    expect(reconciler.holdingStop).toBe(false);
  });

  it('holds a diagonal sub-cell skill STOP while staying within its actual approved segment', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 3, 4, 4]), active = { path, index: 4, total: path.length };
    const stopped = { path, index: 0, total: 0 }, display = point(3.49, 3.49, 5), target = point(3, 3, 5);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    expect(Array.from(reconciler.update(target, 16, 150, stopped))).toEqual(Array.from(display));
    expect(reconciler.holdingStop).toBe(true);
  });

  it.each([300, 1000])('keeps a verified same-cell skill STOP held across a %sms render gap', gap => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2]), active = { path, index: 4, total: path.length };
    const stopped = { path, index: 0, total: 0 }, display = point(3.3, 2), target = point(3, 2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    expect(Array.from(reconciler.update(target, gap, 150, stopped))).toEqual(Array.from(display));
    expect(reconciler.holdingStop).toBe(true);
  });

  it('clears a skill hold when its terrain becomes blocked across a long render gap', () => {
    const { reconciler, point, cells, altitude } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2]), active = { path, index: 4, total: path.length };
    const stopped = { path, index: 0, total: 0 }, display = point(3.3, 2), target = point(3, 2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, active);
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    cells[3 + 2 * altitude.width] = 1;
    expect(Array.from(reconciler.update(target, 300, 150, stopped))).toEqual(Array.from(target));
    expect(reconciler.holdingStop).toBe(false);
  });

  it('returns smoothly from the approved terminal to an earlier STOP through the old corner despite repeated packets', () => {
    const baseline = map(), repeated = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2, 4, 3, 4, 4]);
    const active = { path, index: path.length, total: path.length };
    const stopped = { path, index: 0, total: 0 };
    for (const { reconciler, point, cells, altitude } of [baseline, repeated]) {
      cells.fill(1);
      for (let index = 0; index < path.length; index += 2) cells[path[index]! + path[index + 1]! * altitude.width] = 10;
      const end = point(4, 4, 5);
      reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
      reconciler.correct(point(3, 2, 5), 0, 150, stopped);
      expect(Array.from(reconciler.position)).toEqual(Array.from(end));
    }
    const target = baseline.point(3, 2, 5), original = Array.from(target);
    let previous = Array.from(baseline.reconciler.position), previousProgress = 4;
    for (let now = 16; now <= 640; now += 16) {
      repeated.reconciler.correct(target, now, 150, stopped);
      baseline.reconciler.update(target, now, 150, stopped);
      repeated.reconciler.update(target, now, 150, stopped);
      const display = Array.from(baseline.reconciler.position);
      expect(Array.from(repeated.reconciler.position)).toEqual(display);
      expect(display[0] === 4 || display[1] === 2).toBe(true);
      expectSafeSegment(previous, display, baseline.altitude);
      const progress = display[0] === 4 ? display[1]! : display[0]! - 2;
      expect(progress).toBeLessThanOrEqual(previousProgress + 1e-6);
      expect(progress).toBeGreaterThanOrEqual(1);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThan(0.45);
      expect(display[2]).toBeCloseTo(display[0]! * 0.1 + display[1]! * 0.25 + 5, 5);
      previous = display; previousProgress = progress;
    }
    expect(Array.from(baseline.reconciler.position)).toEqual(original);
    expect(Array.from(target)).toEqual(original);
    expect(baseline.findPath).not.toHaveBeenCalled(); expect(repeated.findPath).not.toHaveBeenCalled();
  });

  it.each([6, 7, 8].flatMap(distance => [false, true].map(corner => ({ distance, corner }))))(
    'smoothly returns $distance approved cells to a delayed STOP (corner $corner) at bounded speed', ({ distance, corner }) => {
      const { reconciler, point, cells, altitude, findPath } = map();
      const horizontal = distance - (corner ? 1 : 0);
      const nodes = Array.from({ length: horizontal + 1 }, (_, index) => [2 + index, 2]);
      if (corner) nodes.push([2 + horizontal, 3]);
      const path = new Int16Array(nodes.flat()), active = { path, index: path.length, total: path.length };
      cells.fill(1);
      for (const [x, y] of nodes) cells[x! + y! * altitude.width] = 10;
      const target = point(2, 2, 5), original = Array.from(target), last = nodes[nodes.length - 1]!;
      const end = point(last[0]!, last[1]!, 5), stopped = { path, index: 0, total: 0 };
      reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
      reconciler.correct(target, 0, 150, stopped);
      expect(Array.from(reconciler.position)).toEqual(Array.from(end));
      let previous = Array.from(reconciler.position), previousProgress = distance;
      for (let now = 16; now <= 1200; now += 16) {
        reconciler.correct(target, now, 150, stopped);
        const display = Array.from(reconciler.update(target, now, 150, stopped));
        const progress = display[0]! - 2 + display[1]! - 2;
        expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(2 * 16 / 150 + 1e-6);
        expect(progress).toBeLessThanOrEqual(previousProgress + 1e-6);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(display[0] === last[0] || display[1] === 2).toBe(true);
        expectSafeSegment(previous, display, altitude);
        expect(display[2]).toBeCloseTo(display[0]! * 0.1 + display[1]! * 0.25 + 5, 5);
        previous = display; previousProgress = progress;
      }
      expect(Array.from(reconciler.position)).toEqual(original);
      expect(Array.from(target)).toEqual(original);
      expect(findPath).not.toHaveBeenCalled();
    },
  );

  it('fits a forward STOP inside the retained approved corridor', () => {
    const { reconciler, point, altitude } = map();
    const path = new Int16Array(Array.from({ length: 10 }, (_, index) => [2 + index, 2]).flat());
    const target = point(8, 2), stopped = { path, index: 0, total: 0 };
    reconciler.reset(point(2, 2), 0);
    reconciler.update(point(2, 2), 0, 150, { path, index: 2, total: path.length });
    reconciler.correct(target, 0, 150, stopped);
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(2, 2)));
    let previous = Array.from(reconciler.position);
    for (let now = 16; now <= 1800; now += 16) {
      const display = Array.from(reconciler.update(target, now, 150, stopped));
      expect(display[0]).toBeGreaterThanOrEqual(previous[0]!);
      expect(display[0]! - previous[0]!).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / 150) + 1e-6);
      expectSafeSegment(previous, display, altitude);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('keeps a more than eight-cell STOP relocation immediate', () => {
    const from = 11, to = 2;
    const { reconciler, point } = map();
    const path = new Int16Array(Array.from({ length: 10 }, (_, index) => [2 + index, 2]).flat());
    const active = { path, index: path.length, total: path.length };
    const original = point(from, 2), target = point(to, 2);
    reconciler.reset(original, 0); reconciler.update(original, 0, 150, active);
    reconciler.correct(target, 0, 150, { path, index: 0, total: 0 });
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it.each([false, true])('preserves a long STOP correction when an approved MOVE resumes its corridor (future turn %s)', turn => {
    const { reconciler, point, findPath } = map();
    const oldPath = new Int16Array(Array.from({ length: 8 }, (_, index) => [2 + index, 2]).flat());
    const active = { path: oldPath, index: oldPath.length, total: oldPath.length };
    const stopped = { path: oldPath, index: 0, total: 0 }, target = point(2, 2), end = point(9, 2);
    reconciler.reset(end, 0); reconciler.update(end, 0, 240, active);
    reconciler.correct(target, 0, 240, stopped);
    for (let now = 20; now <= 100; now += 20) reconciler.update(target, now, 240, stopped);
    expect(reconciler.position[0]! - target[0]!).toBeGreaterThan(6);
    const nodes = turn ? Array.from({ length: 8 }, (_, index) => [2 + index, 2])
      .concat(Array.from({ length: 6 }, (_, index) => [9, 3 + index]))
      : Array.from({ length: 14 }, (_, index) => [2 + index, 2]);
    const path = new Int16Array(nodes.flat()), hint = { path, index: 2, total: path.length };
    const before = Array.from(reconciler.position);
    reconciler.correct(target, 100, 240, hint);
    expect(Array.from(reconciler.position)).toEqual(before);
    let previousProgress = before[0]! - 2;
    for (let now = 116; now <= 2500; now += 16) {
      const progress = (now - 100) / 240;
      const authority = turn && progress >= 7 ? point(9, 2 + progress - 7) : point(2 + progress, 2);
      hint.index = Math.min(path.length - 2, (Math.floor(progress) + 1) * 2);
      reconciler.update(authority, now, 240, hint);
      const display = Array.from(reconciler.position), displayProgress = display[0]! - 2 + display[1]! - 2;
      expect(displayProgress).toBeGreaterThan(previousProgress);
      expect(displayProgress - previousProgress).toBeLessThanOrEqual(1.5 * 16 / 240 + 1e-6);
      expect(display[0] === 9 || display[1] === 2).toBe(true);
      previousProgress = displayProgress;
    }
    expect(findPath).not.toHaveBeenCalled();
  });

  it('resumes the identical approved route without resetting a still large STOP error', () => {
    const { reconciler, point } = map();
    const path = new Int16Array(Array.from({ length: 8 }, (_, index) => [2 + index, 2]).flat());
    const active = { path, index: path.length, total: path.length }, stopped = { path, index: 0, total: 0 };
    const end = point(9, 2), target = point(2, 2);
    reconciler.reset(end, 0); reconciler.update(end, 0, 240, active);
    reconciler.correct(target, 0, 240, stopped);
    for (let now = 20; now <= 100; now += 20) reconciler.update(target, now, 240, stopped);
    const before = Array.from(reconciler.position), resumed = { path, index: 2, total: path.length };
    reconciler.correct(target, 100, 240, resumed);
    expect(Array.from(reconciler.position)).toEqual(before);
    let previous = reconciler.position[0]!;
    for (let now = 116; now <= 500; now += 16) {
      const authority = point(2 + (now - 100) / 240, 2);
      setStraightIndex(resumed, authority[0]!);
      reconciler.update(authority, now, 240, resumed);
      expect(reconciler.position[0]).toBeGreaterThan(previous);
      expect(reconciler.position[0]! - previous).toBeLessThanOrEqual(1.5 * 16 / 240 + 1e-6);
      previous = reconciler.position[0]!;
    }
  });

  it('caps a verified delayed STOP across a suspended render loop while keeping genuine jumps immediate', () => {
    const { reconciler, point } = map();
    const path = new Int16Array(Array.from({ length: 9 }, (_, index) => [2 + index, 2]).flat());
    const active = { path, index: path.length, total: path.length }, stopped = { path, index: 0, total: 0 };
    const end = point(10, 2), target = point(2, 2), jump = point(12, 14, 5);
    reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
    reconciler.correct(target, 0, 150, stopped);
    expect(Array.from(reconciler.position)).toEqual(Array.from(end));
    const resumed = Array.from(reconciler.update(target, 251, 150, stopped));
    expect(resumed[0]).toBeGreaterThan(target[0]!);
    expect(end[0]! - resumed[0]!).toBeLessThanOrEqual(2 * 50 / 150 + 1e-6);
    reconciler.reset(end, 1000); reconciler.update(end, 1000, 150, active);
    reconciler.correct(target, 1000, 150, stopped);
    reconciler.reset(jump, 1016);
    expect(Array.from(reconciler.update(jump, 1032, 150))).toEqual(Array.from(jump));
  });

  it.each([1, 3, 5])('resumes a %s-cell verified STOP after a 300ms gap without flashing to authority', distance => {
    const { reconciler, point } = map();
    const path = new Int16Array(Array.from({ length: 12 }, (_, index) => [1 + index, 1]).flat());
    const active = { path, index: (distance + 1) * 2, total: path.length }, stopped = { path, index: 0, total: 0 };
    const end = point(2 + distance, 1), target = point(2, 1);
    reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
    reconciler.correct(target, 0, 150, stopped);
    reconciler.update(target, 300, 150, stopped);
    expect(reconciler.position[0]).toBeGreaterThan(target[0]!);
    expect(end[0]! - reconciler.position[0]!).toBeLessThanOrEqual(2 * 50 / 150 + 1e-6);
    for (let now = 316; now <= 1500; now += 16) reconciler.update(target, now, 150, stopped);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it.each([1, 3, 5, 7])('bridges a %s-cell delayed STOP to an approved perpendicular MOVE along the old corridor', distance => {
    const { reconciler, point, cells, altitude, findPath } = map();
    cells.fill(1);
    for (let coordinate = 1; coordinate <= 12; coordinate++) {
      cells[coordinate + altitude.width] = 10; cells[2 + coordinate * altitude.width] = 10;
    }
    const oldPath = new Int16Array(Array.from({ length: 12 }, (_, index) => [1 + index, 1]).flat());
    const active = { path: oldPath, index: (distance + 1) * 2, total: oldPath.length };
    const stopped = { path: oldPath, index: 0, total: 0 }, end = point(2 + distance, 1), target = point(2, 1);
    reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
    reconciler.correct(target, 0, 150, stopped);
    const path = new Int16Array(Array.from({ length: 12 }, (_, index) => [2, 1 + index]).flat());
    const moving = { path, index: 2, total: path.length };
    reconciler.correct(target, 0, 150, moving);
    expect(Array.from(reconciler.position)).toEqual(Array.from(end));
    let previous = Array.from(reconciler.position), previousTime = 0, turned = false;
    for (let now = 80; now <= 2600; now += 16) {
      const y = Math.min(12, 1 + now / 150), authority = point(2, y);
      moving.index = Math.min(path.length - 2, (Math.floor(y - 1) + 1) * 2);
      const hint = y === 12 ? { path, index: 0, total: 0 } : moving;
      reconciler.update(authority, now, 150, hint);
      const display = Array.from(reconciler.position);
      expect(display[0] === 2 || display[1] === 1).toBe(true);
      expectSafeSegment(previous, display, altitude);
      const elapsed = now - previousTime;
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(2 * elapsed / 150 + 1e-6);
      if (display[0]! > 2 + 1e-6) expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
      if (display[1]! > 1) turned = true;
      previous = display; previousTime = now;
    }
    expect(turned).toBe(true);
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(2, 12)));
    expect(findPath).not.toHaveBeenCalled();
  });

  it.each([5, 7])('keeps the STOP visit when a %s-cell recovery joins a new origin one approved cell ahead', distance => {
    const { reconciler, point, cells, altitude } = map();
    cells.fill(1);
    for (let coordinate = 1; coordinate <= 12; coordinate++) {
      cells[coordinate + altitude.width] = 10; cells[3 + coordinate * altitude.width] = 10;
    }
    const oldPath = new Int16Array(Array.from({ length: 12 }, (_, index) => [1 + index, 1]).flat());
    const active = { path: oldPath, index: (distance + 1) * 2, total: oldPath.length }, stopped = { path: oldPath, index: 0, total: 0 };
    const end = point(2 + distance, 1), target = point(2, 1), origin = point(3, 1);
    reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
    reconciler.correct(target, 0, 150, stopped);
    const path = new Int16Array(Array.from({ length: 12 }, (_, index) => [3, 1 + index]).flat());
    const moving = { path, index: 2, total: path.length };
    reconciler.correct(origin, 0, 150, moving);
    expect(Array.from(reconciler.position)).toEqual(Array.from(end));
    let previous = Array.from(reconciler.position), nearestStop = Infinity;
    for (let now = 16; now <= 2600; now += 16) {
      const y = Math.min(12, 1 + now / 150), authority = point(3, y);
      moving.index = Math.min(path.length - 2, (Math.floor(y - 1) + 1) * 2);
      reconciler.update(authority, now, 150, y === 12 ? { path, index: 0, total: 0 } : moving);
      const display = Array.from(reconciler.position);
      expect(display[0] === 3 || display[1] === 1).toBe(true);
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(2 * 16 / 150 + 1e-6);
      nearestStop = Math.min(nearestStop, Math.hypot(display[0]! - target[0]!, display[1]! - target[1]!));
      previous = display;
    }
    expect(nearestStop).toBeLessThan(0.2);
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(3, 12)));
  });

  it.each([false, true])('bridges a STOP before the latest source origin along verified first-segment cells (frame gap %s)', gap => {
    const { reconciler, point, cells, altitude } = map();
    cells.fill(1);
    for (let coordinate = 1; coordinate <= 12; coordinate++) {
      cells[coordinate + altitude.width] = 10; cells[2 + coordinate * altitude.width] = 10;
    }
    const oldPath = new Int16Array(Array.from({ length: 8 }, (_, index) => [5 + index, 1]).flat());
    const active = { path: oldPath, index: 2, total: oldPath.length }, stopped = { path: oldPath, index: 0, total: 0 };
    const end = point(6, 1), target = point(2, 1);
    reconciler.reset(end, 0); reconciler.update(end, 0, 150, active);
    reconciler.correct(target, 0, 150, stopped);
    const start = gap ? 300 : 0;
    if (gap) {
      reconciler.update(target, start, 150, stopped);
      expect(reconciler.position[0]).toBeGreaterThan(5);
    }
    const before = Array.from(reconciler.position);
    const path = new Int16Array(Array.from({ length: 12 }, (_, index) => [2, 1 + index]).flat());
    const moving = { path, index: 2, total: path.length };
    reconciler.correct(target, start, 150, moving);
    expect(Array.from(reconciler.position)).toEqual(before);
    let previous = before;
    for (let elapsed = 16; elapsed <= 2400; elapsed += 16) {
      const y = Math.min(12, 1 + elapsed / 150), authority = point(2, y);
      moving.index = Math.min(path.length - 2, (Math.floor(y - 1) + 1) * 2);
      reconciler.update(authority, start + elapsed, 150, y === 12 ? { path, index: 0, total: 0 } : moving);
      const display = Array.from(reconciler.position);
      expect(display[0] === 2 || display[1] === 1).toBe(true);
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(2 * 16 / 150 + 1e-6);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(2, 12)));
  });

  it('updates fractional endpoints without running pathfinding every frame', () => {
    const { reconciler, findPath, point } = map();
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(4, 2), 0, 150);
    for (let now = 16; now <= 144; now += 16) reconciler.update(point(4 + now / 1000, 2), now, 150);
    expect(findPath).not.toHaveBeenCalled();
    reconciler.update(point(4.6, 2), 160, 150);
    expect(findPath).not.toHaveBeenCalled();
  });

  it('does not walk backwards to a rounded source center when a moving target changes cells', () => {
    const { reconciler, point } = map();
    reconciler.reset(point(2.2, 2), 0); reconciler.correct(point(4.4, 2), 0, 150);
    let previous = reconciler.position[0]!;
    for (let now = 16; now <= 400; now += 16) {
      const target = point(4.4 + now / 150, 2);
      reconciler.update(target, now, 150);
      expect(reconciler.position[0]).toBeGreaterThanOrEqual(previous);
      previous = reconciler.position[0]!;
    }
  });

  it.each([false, true])('keeps moving at a steady frame velocity during 100ms packets (approved path %s)', native => {
    const { reconciler, point, findPath } = map(40);
    const path = new Int16Array(Array.from({ length: 34 }, (_, index) => [2 + index, 2]).flat());
    const hint = native ? { path, index: 2, total: path.length } : undefined;
    let bias = 0;
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(2.5, 2), 0, 150, hint);
    let previous = reconciler.position[0]!, previousVelocity = 1 / 150;
    for (let now = 10; now <= 2000; now += 10) {
      const target = point(2.5 + now / 150 + bias, 2);
      setStraightIndex(hint, target[0]!);
      reconciler.update(target, now, 150, hint);
      const velocity = (reconciler.position[0]! - previous) / 10;
      expect(velocity).toBeGreaterThan(0.0045);
      expect(velocity).toBeLessThanOrEqual(0.010001);
      expect(Math.abs(velocity - previousVelocity)).toBeLessThan(0.002);
      previous = reconciler.position[0]!; previousVelocity = velocity;
      if (now % 100 === 0) {
        bias = bias ? 0 : 0.05;
        const corrected = point(2.5 + now / 150 + bias, 2), before = Array.from(reconciler.position);
        setStraightIndex(hint, corrected[0]!);
        reconciler.correct(corrected, now, 150, hint);
        expect(Math.hypot(reconciler.position[0]! - before[0]!, reconciler.position[1]! - before[1]!)).toBeLessThanOrEqual(1 / 1024);
        const afterCorrection = Array.from(reconciler.position);
        expect(Array.from(reconciler.update(corrected, now, 150, hint))).toEqual(afterCorrection);
      }
    }
    expect(findPath).not.toHaveBeenCalled();
  });

  it.each([false, true])('limits a 1.5-cell moving catch-up to 1.5 times native speed (approved path %s)', native => {
    const { reconciler, point } = map(40);
    const path = new Int16Array(Array.from({ length: 34 }, (_, index) => [2 + index, 2]).flat());
    const hint = native ? { path, index: 2, total: path.length } : undefined;
    setStraightIndex(hint, 3.5);
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(3.5, 2), 0, 150, hint);
    let previous = reconciler.position[0]!;
    for (let now = 10; now <= 1000; now += 10) {
      const target = point(3.5 + now / 150, 2);
      setStraightIndex(hint, target[0]!);
      reconciler.update(target, now, 150, hint);
      const delta = reconciler.position[0]! - previous;
      expect(delta).toBeGreaterThan(0.066);
      expect(delta).toBeLessThanOrEqual(0.10001);
      previous = reconciler.position[0]!;
    }
    expect(reconciler.position[0]).toBeCloseTo(3.5 + 1000 / 150, 3);
  });

  it('never stops or reverses to eliminate an ahead-of-authority phase error', () => {
    const { reconciler, point } = map(40);
    const path = new Int16Array(Array.from({ length: 34 }, (_, index) => [2 + index, 2]).flat());
    const hint = { path, index: 2, total: path.length };
    reconciler.reset(point(3.5, 2), 0); reconciler.correct(point(2.5, 2), 0, 150, hint);
    let previous = reconciler.position[0]!;
    for (let now = 10; now <= 1000; now += 10) {
      const target = point(2.5 + now / 150, 2);
      setStraightIndex(hint, target[0]!);
      reconciler.update(target, now, 150, hint);
      expect(reconciler.position[0]! - previous).toBeGreaterThan(0.016);
      previous = reconciler.position[0]!;
    }
    expect(reconciler.position[0]).toBeCloseTo(2.5 + 1000 / 150, 3);
  });

  it('uses future approved tile segments before an ahead display reaches a turn', () => {
    const { reconciler, point, findPath } = map();
    const path = new Int16Array([1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9, 1, 10, 1, 10, 2, 10, 3]);
    const hint = { path, index: 18, total: path.length };
    reconciler.reset(point(9.7, 1), 0); reconciler.correct(point(9.3, 1), 0, 150, hint);
    let previousProgress = 9.7, advancedTurn = false;
    for (let now = 16; now <= 352; now += 16) {
      const nativeProgress = 9.3 + now / 150;
      const target = nativeProgress <= 10 ? point(nativeProgress, 1) : point(10, nativeProgress - 9);
      hint.index = nativeProgress < 10 ? 18 : nativeProgress < 11 ? 20 : 22;
      reconciler.update(target, now, 150, hint);
      const x = reconciler.position[0]!, y = reconciler.position[1]!;
      expect(x).toBeLessThanOrEqual(10); expect(x === 10 || y === 1).toBe(true);
      const progress = x === 10 ? 9 + y : x;
      expect(progress).toBeGreaterThan(previousProgress);
      if (nativeProgress < 10 && y > 1) advancedTurn = true;
      previousProgress = progress;
    }
    expect(advancedTurn).toBe(true); expect(findPath).not.toHaveBeenCalled();
  });

  it('preserves all approved centers when a low-frequency frame crosses multiple turns', () => {
    const { reconciler, point, altitude } = map();
    const path = new Int16Array([1, 1, 2, 1, 2, 2, 3, 2, 3, 3, 4, 3]);
    const hint = { path, index: 2, total: path.length };
    reconciler.reset(point(1, 1), 0); reconciler.correct(point(1.5, 1), 0, 60, hint);
    reconciler.update(point(1.75, 1), 15, 60, hint);
    let previous = Array.from(reconciler.position);
    hint.index = 10;
    const target = point(3 + 1 / 12, 3);
    const resumed = Array.from(reconciler.update(target, 215, 60, hint));
    expect(Math.hypot(resumed[0]! - previous[0]!, resumed[1]! - previous[1]!)).toBeLessThanOrEqual(200 / 60 + 0.45 + 1e-6);
    expect(resumed[0]).toBe(3);
    expect(resumed[1]).toBeGreaterThan(2);
    previous = resumed;
    for (let now = 231; now <= 1511; now += 16) {
      const display = Array.from(reconciler.update(target, now, 60, hint));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(0.45 + 1e-6);
      const onEdge = display[1] === 1 && display[0]! >= 1 && display[0]! <= 2
        || display[0] === 2 && display[1]! >= 1 && display[1]! <= 2
        || display[1] === 2 && display[0]! >= 2 && display[0]! <= 3
        || display[0] === 3 && display[1]! >= 2 && display[1]! <= 3
        || display[1] === 3 && display[0]! >= 3 && display[0]! <= 4;
      expect(onEdge).toBe(true);
      previous = display;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('faces the new approved segment after a same-corridor U-turn', () => {
    const { reconciler, point } = map();
    const east = new Int16Array(Array.from({ length: 10 }, (_, index) => [1 + index, 1]).flat());
    const west = new Int16Array(Array.from({ length: 10 }, (_, index) => [10 - index, 1]).flat());
    reconciler.reset(point(9.4, 1), 0);
    reconciler.update(point(9.4, 1), 0, 150, { path: east, index: 18, total: east.length });
    const hint = { path: west, index: 2, total: west.length };
    reconciler.correct(point(9.8, 1), 0, 150, hint);
    let previous = reconciler.position[0]!;
    for (let now = 16; now <= 256; now += 16) {
      const targetX = 9.8 - now / 150;
      hint.index = (10 - Math.ceil(targetX) + 1) * 2;
      reconciler.update(point(targetX, 1), now, 150, hint);
      expect(reconciler.position[0]).toBeLessThan(previous);
      if (Math.abs(reconciler.position[0]! - targetX) > 0.002) expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
      previous = reconciler.position[0]!;
    }
  });

  it('rebases signed phase when an equal-position MOVE rewrites the same path buffer', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([6, 1, 7, 1, 8, 1, 9, 1, 10, 1, 11, 1]);
    const hint = { path, index: 2, total: path.length };
    reconciler.reset(point(6.4, 1), 0); reconciler.correct(point(6, 1), 0, 150, hint);
    const before = Array.from(reconciler.position);
    path.set([6, 1, 5, 1, 4, 1, 3, 1, 2, 1, 1, 1]);
    reconciler.correct(point(6, 1), 0, 150, hint);
    expect(Array.from(reconciler.position)).toEqual(before);
    expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
    const target = point(6 - 16 / 150, 1);
    reconciler.update(target, 16, 150, hint);
    expect(reconciler.position[0]).toBeLessThan(6.4);
    expect(reconciler.position[0]! - target[0]!).toBeGreaterThan(0.35);
    expect(reconciler.position[0]! - target[0]!).toBeLessThan(0.4);
    expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
  });

  it.each(['active', 'past-end', 'stopped'])('keeps the new shared endpoint visit distinct from its old prefix (%s)', ending => {
    const { reconciler, point, findPath } = map();
    const oldPath = new Int16Array([1, 1, 2, 2, 3, 3, 4, 3]);
    const newPath = new Int16Array([4, 3, 3, 2, 2, 1, 1, 1]);
    const oldHint = { path: oldPath, index: 4, total: oldPath.length };
    const hint = { path: newPath, index: 2, total: newPath.length };
    const display = point(3 - 0.5 / Math.SQRT2, 3 - 0.5 / Math.SQRT2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, oldHint);
    oldHint.index = 6;
    reconciler.correct(point(4, 3), 0, 150, oldHint);
    reconciler.correct(point(4, 3), 0, 150, hint);
    let previous = Array.from(reconciler.position);
    for (let now = 10; now <= 1000; now += 10) {
      let target: Float32Array;
      if (now < 210) { target = point(4 - now / 210, 3 - now / 210); hint.index = 2; }
      else if (now < 420) { target = point(3 - (now - 210) / 210, 2 - (now - 210) / 210); hint.index = 4; }
      else { target = point(Math.max(1, 2 - (now - 420) / 150), 1); hint.index = 6; }
      if (now >= 570 && ending === 'past-end') hint.index = hint.total;
      if (now >= 570 && ending === 'stopped') { hint.index = 0; hint.total = 0; }
      reconciler.update(target, now, 150, hint);
      const current = Array.from(reconciler.position);
      expect(Math.hypot(current[0]! - previous[0]!, current[1]! - previous[1]!)).toBeLessThan(0.105);
      if (now >= 540) {
        expect(current[1]).toBe(1); expect(current[0]).toBeGreaterThanOrEqual(1);
        if (current[0]! - target[0]! > 1 / 1024) expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
      }
      if (now === 570) expect(current[0]).toBeGreaterThan(1.001);
      previous = current;
    }
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(1, 1)));
    expect(findPath).not.toHaveBeenCalled();
  });

  it('continues on the new branch when it crosses an interior tile retained from the previous route', () => {
    const { reconciler, point } = map();
    const oldPath = new Int16Array([1, 1, 2, 2, 3, 3, 4, 3]);
    const newPath = new Int16Array([4, 3, 4, 2, 3, 2, 2, 2, 1, 2, 1, 1]);
    const oldHint = { path: oldPath, index: 4, total: oldPath.length };
    const hint = { path: newPath, index: 2, total: newPath.length };
    const display = point(3 - 0.5 / Math.SQRT2, 3 - 0.5 / Math.SQRT2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, oldHint);
    oldHint.index = 6;
    reconciler.correct(point(4, 3), 0, 150, oldHint);
    reconciler.correct(point(4, 3), 0, 150, hint);
    let previous = Array.from(reconciler.position);
    for (let now = 10; now <= 500; now += 10) {
      const target = now < 150 ? point(4, 3 - now / 150) : point(4 - (now - 150) / 150, 2);
      hint.index = now < 150 ? 2 : now < 300 ? 4 : now < 450 ? 6 : 8;
      reconciler.update(target, now, 150, hint);
      if (now >= 430) {
        expect(reconciler.position[1]).toBe(2); expect(reconciler.position[0]).toBeLessThan(previous[0]!);
        expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
      }
      previous = Array.from(reconciler.position);
    }
  });

  it('attaches a later MOVE to the current visit of a shared origin tile', () => {
    const { reconciler, point } = map();
    const oldPath = new Int16Array([1, 1, 2, 2, 3, 3, 4, 3]);
    const newPath = new Int16Array([4, 3, 3, 2, 2, 1, 1, 1]);
    const oldHint = { path: oldPath, index: 4, total: oldPath.length };
    const hint = { path: newPath, index: 2, total: newPath.length };
    const display = point(3 - 0.5 / Math.SQRT2, 3 - 0.5 / Math.SQRT2);
    reconciler.reset(display, 0); reconciler.update(display, 0, 150, oldHint);
    oldHint.index = 6;
    reconciler.correct(point(4, 3), 0, 150, oldHint);
    reconciler.correct(point(4, 3), 0, 150, hint);
    for (let now = 10; now <= 570; now += 10) {
      const target = now < 210 ? point(4 - now / 210, 3 - now / 210)
        : now < 420 ? point(3 - (now - 210) / 210, 2 - (now - 210) / 210)
          : point(Math.max(1, 2 - (now - 420) / 150), 1);
      hint.index = now < 210 ? 2 : now < 420 ? 4 : 6;
      reconciler.update(target, now, 150, hint);
    }
    const laterPath = new Int16Array([1, 1, 1, 2, 2, 3]);
    const later = { path: laterPath, index: 2, total: laterPath.length };
    const before = Array.from(reconciler.position);
    reconciler.correct(point(1, 1), 570, 150, later);
    expect(Array.from(reconciler.position)).toEqual(before);
    expect(Array.from(reconciler.direction)).toEqual([-1, 0]);
    reconciler.update(point(1, 1 + 10 / 150), 580, 150, later);
    expect(reconciler.position[0]).toBe(1);
    expect(reconciler.position[1]).toBeGreaterThan(1);
    expect(reconciler.position[1]).toBeLessThan(1 + 10 / 150);
    expect(Array.from(reconciler.direction)).toEqual([0, 1]);
  });

  it('uses the current source step when one approved path visits a tile again', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 3, 3, 2, 3, 2, 2, 2, 1]);
    const hint = { path, index: 2, total: path.length };
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(2.5, 2), 0, 50, hint);
    for (let now = 10; now <= 230; now += 10) {
      const progress = Math.min(5, 0.5 + now / 50);
      const target = progress < 1 ? point(2 + progress, 2) : progress < 2 ? point(3, 1 + progress)
        : progress < 3 ? point(5 - progress, 3) : point(2, 6 - progress);
      hint.index = Math.min(10, (Math.floor(progress) + 1) * 2);
      reconciler.update(target, now, 50, hint);
      if (progress >= 4) {
        expect(reconciler.position[0]).toBe(2);
        expect(reconciler.position[1]).toBeGreaterThanOrEqual(target[1]!);
        expect(Array.from(reconciler.direction)).toEqual([0, -1]);
      }
    }
  });

  it('maps native source indices through consecutive duplicate nodes', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 3, 2, 4, 2, 4, 3]);
    const hint = { path, index: 6, total: path.length };
    reconciler.reset(point(4, 2.2), 0); reconciler.correct(point(3.9, 2), 0, 150, hint);
    expect(Array.from(reconciler.direction)).toEqual([0, 1]);
    reconciler.update(point(3.95, 2), 10, 150, hint);
    expect(reconciler.position[0]).toBe(4);
    expect(reconciler.position[1]).toBeGreaterThan(2);
  });

  it('keeps the last approved path while a STOP settles and avoids whole-route probes every frame', () => {
    const { reconciler, point, altitude } = map(40);
    const path = new Int16Array(Array.from({ length: 30 }, (_, index) => [2 + index, 2]).flat());
    const hint = { path, index: 2, total: path.length };
    const getCellType = vi.fn(altitude.getCellType); altitude.getCellType = getCellType;
    reconciler.reset(point(2, 2), 0); reconciler.update(point(2, 2), 0, 150, hint);
    getCellType.mockClear();
    for (let now = 10; now <= 100; now += 10) reconciler.update(point(2 + now / 150, 2), now, 150, hint);
    expect(getCellType).not.toHaveBeenCalled();
    setStraightIndex(hint, 2.5 + 100 / 150);
    reconciler.correct(point(2.5 + 100 / 150, 2), 100, 150, hint);
    getCellType.mockClear();
    for (let now = 110; now <= 200; now += 10) reconciler.update(point(2.5 + now / 150, 2), now, 150, hint);
    expect(getCellType.mock.calls.length).toBeLessThan(80);
    const target = point(4, 2);
    reconciler.correct(target, 200, 150, { path, index: 0, total: 0 });
    for (let now = 216; now <= 800; now += 16) reconciler.update(target, now, 150, { path, index: 0, total: 0 });
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('makes repeated same-clock render reads stable without consuming spring time', () => {
    const baseline = map(), duplicate = map();
    for (const { reconciler, point } of [baseline, duplicate]) {
      reconciler.reset(point(2, 2), 0); reconciler.correct(point(3, 2), 0, 150);
    }
    for (let now = 16; now <= 640; now += 16) {
      const target = baseline.point(3 + now / 150, 2);
      baseline.reconciler.update(target, now, 150);
      const expected = Array.from(duplicate.reconciler.update(target, now, 150));
      for (let read = 0; read < 10; read++) expect(Array.from(duplicate.reconciler.update(target, now, 150))).toEqual(expected);
      expect(expected).toEqual(Array.from(baseline.reconciler.position));
    }
  });

  it('connects fractional endpoints to tile centers without cutting blocked corners', () => {
    const { reconciler, cells, altitude, point } = map();
    cells[3 + 2 * altitude.width] = cells[2 + 3 * altitude.width] = 1;
    const target = point(3.1, 3.1);
    reconciler.reset(point(2.49, 2.49), 0); reconciler.correct(target, 0, 150);
    let previous = Array.from(reconciler.position), detoured = false;
    for (let now = 8; now <= 900; now += 8) {
      const display = Array.from(reconciler.update(target, now, 150));
      expectSafeSegment(previous, display, altitude);
      if (display[0]! < 1.5 || display[1]! < 1.5) detoured = true;
      previous = display;
    }
    expect(detoured).toBe(true);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('takes the walkable opening around a wall rather than interpolating through it', () => {
    const { reconciler, cells, altitude, point } = map();
    for (let y = 1; y <= 3; y++) cells[4 + y * altitude.width] = 1;
    const target = point(5, 2);
    reconciler.reset(point(3, 2), 0); reconciler.correct(target, 0, 150);
    let previous = Array.from(reconciler.position), detoured = false;
    for (let now = 8; now <= 900; now += 8) {
      const display = Array.from(reconciler.update(target, now, 150));
      expectSafeSegment(previous, display, altitude);
      if (display[1]! < 0.5 || display[1]! > 3.5) detoured = true;
      previous = display;
    }
    expect(detoured).toBe(true);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('immediately resets when a small error requires a detour outside the six-cell display bound', () => {
    const { reconciler, cells, altitude, point } = map();
    for (let y = 0; y <= 12; y++) cells[10 + y * altitude.width] = 1;
    const target = point(11, 5);
    reconciler.reset(point(9, 5), 0); reconciler.correct(target, 0, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('uses the full safe detour distance to finish within six hundred milliseconds with bounded steps', () => {
    const { reconciler, cells, altitude, point } = map();
    for (let y = 1; y <= 4; y++) cells[4 + y * altitude.width] = 1;
    const target = point(5, 2);
    reconciler.reset(point(3, 2), 0); reconciler.correct(target, 0, 150);
    expect(reconciler.position[0]).toBe(3);
    let previous = Array.from(reconciler.position);
    for (let now = 16; now <= 592; now += 16) {
      const display = Array.from(reconciler.update(target, now, 150));
      expectSafeSegment(previous, display, altitude);
      expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / 150) + 1e-6);
      previous = display;
    }
    const endpoint = Array.from(reconciler.update(target, 600, 150));
    expectSafeSegment(previous, endpoint, altitude);
    expect(Math.hypot(endpoint[0]! - previous[0]!, endpoint[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 8 / 150) + 1e-6);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('rejects disconnected or illegal pathfinder results and honors the authority', () => {
    const { cells, altitude, point } = map();
    for (const output of [[2, 2, 4, 2], [1, 2, 3, 2], [2, 2, 3, 3]]) {
      const badPath = (_x0: number, _y0: number, _x1: number, _y1: number, out: Int16Array) => {
        out.set(output); return output.length / 2;
      };
      const reconciler = createLastroPositionReconciler({ altitude, findPath: badPath });
      cells[3 + 2 * altitude.width] = 1;
      const target = output[3] === 3 ? point(3, 3) : point(4, 2);
      reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
      expect(Array.from(reconciler.position)).toEqual(Array.from(target));
    }
    const target = point(5, 2), reconciler = createLastroPositionReconciler({ altitude, findPath: () => 0 });
    reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it.each([6, 6.01, 12])('immediately resets a real %s-cell displacement', distance => {
    const { reconciler, point, findPath } = map();
    const target = point(2 + distance, 2);
    reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
    expect(findPath).not.toHaveBeenCalled();
  });

  it('reset cancels a correction immediately for map changes and genuine jumps', () => {
    const { reconciler, point } = map();
    reconciler.reset(point(2, 2), 0); reconciler.correct(point(4, 2), 0, 150);
    const target = point(12, 14, 5);
    reconciler.reset(target, 20);
    expect(Array.from(reconciler.update(target, 32, 150))).toEqual(Array.from(target));
  });

  it('caps late frame advancement and safely resumes after a suspended render loop', () => {
    const { reconciler, point } = map();
    const target = point(5, 2);
    reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    reconciler.update(target, 200, 150);
    expect(reconciler.position[0]! - 2).toBeLessThanOrEqual(Math.min(0.45, 2 * 50 / 150) + 1e-6);
    for (let now = 216; now <= 800; now += 16) reconciler.update(target, now, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
    reconciler.reset(point(2, 2), 1000); reconciler.correct(target, 1000, 150);
    const resumed = Array.from(reconciler.update(target, 1251, 150));
    expect(resumed[0]! - 2).toBeGreaterThan(0);
    expect(resumed[0]! - 2).toBeLessThanOrEqual(Math.min(0.45, 2 * 50 / 150) + 1e-6);
    expect(resumed[0]).toBeLessThan(target[0]!);
    for (let now = 1267; now <= 2051; now += 16) reconciler.update(target, now, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it.each([251, 1000].flatMap(gap => [false, true].map(native => ({ gap, native }))))(
    'keeps a legal correction continuous after a $gap ms render gap (approved MOVE $native)', ({ gap, native }) => {
      const { reconciler, point, altitude } = map();
      const path = new Int16Array(Array.from({ length: 14 }, (_, index) => [2 + index, 2]).flat());
      const hint = native ? { path, index: 6, total: path.length } : undefined;
      const original = point(3.5, 2, 5);
      reconciler.reset(original, 0); reconciler.correct(point(4, 2, 5), 0, 150, hint);
      const targetAtGap = point(native ? Math.min(12, 4 + gap / 150) : 4, 2, 5);
      setStraightIndex(hint, targetAtGap[0]!);
      const resumed = Array.from(reconciler.update(targetAtGap, gap, 150, hint));
      expect(Math.hypot(resumed[0]! - original[0]!, resumed[1]! - original[1]!)).toBeGreaterThan(0);
      const regularAdvance = native && gap <= 300 ? targetAtGap[0]! - 4 : 0;
      expect(Math.hypot(resumed[0]! - original[0]!, resumed[1]! - original[1]!)).toBeLessThanOrEqual(regularAdvance + Math.min(0.45, 2 * 50 / 150) + 1e-6);
      expect(resumed[0]).toBeLessThan(targetAtGap[0]!);
      let previous = resumed;
      for (let now = gap + 16; now <= gap + 3200; now += 16) {
        const targetX = native ? Math.min(12, 4 + now / 150) : 4, target = point(targetX, 2, 5);
        setStraightIndex(hint, targetX);
        const display = Array.from(reconciler.update(target, now, 150, hint));
        expectSafeSegment(previous, display, altitude);
        expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(0.45 + 1e-6);
        previous = display;
      }
      expect(Array.from(reconciler.position)).toEqual(Array.from(point(native ? 12 : 4, 2, 5)));
    },
  );

  it('falls back to finite authority positions if terrain heights become unavailable', () => {
    const { reconciler, altitude, point } = map();
    const target = point(4, 2);
    reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    altitude.getCellHeight = () => NaN;
    expect(Array.from(reconciler.update(target, 16, 150))).toEqual(Array.from(target));
    reconciler.reset([2, 2, 0], 32);
    altitude.getCellHeight = () => { throw new Error('map removed'); };
    reconciler.correct(target, 32, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it.each(['detour', 'separated'] as const)('honors GAT cells that became blocked after route construction (%s)', change => {
    const { reconciler, cells, altitude, point } = map();
    const target = point(4, 2);
    reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    cells[3 + 2 * altitude.width] = 1;
    if (change === 'separated') for (let y = 0; y < altitude.height; y++) cells[3 + y * altitude.width] = 1;
    if (change === 'separated') expect(Array.from(reconciler.update(target, 16, 150))).toEqual(Array.from(target));
    else {
      let previous = Array.from(reconciler.position), wentAround = false;
      for (let now = 16; now <= 1200; now += 16) {
        const display = Array.from(reconciler.update(target, now, 150));
        expectSafeSegment(previous, display, altitude);
        expect(Math.hypot(display[0]! - previous[0]!, display[1]! - previous[1]!)).toBeLessThanOrEqual(Math.min(0.45, 2 * 16 / 150) + 1e-6);
        if (Math.abs(display[1]! - 2) > 0.5) wentAround = true;
        previous = display;
      }
      expect(wentAround).toBe(true);
      expect(Array.from(reconciler.position)).toEqual(Array.from(target));
    }
  });

  it('preserves finite display values for malformed input and invalid clocks or speeds', () => {
    const { reconciler, point } = map();
    const original = point(2, 2), target = point(4, 2);
    for (const input of [[NaN, 1, 0], [1, Infinity, 0], [1, 1, NaN], [1, 1], [1e20, 1, 0]]) {
      reconciler.reset(original, 0); reconciler.correct(input, 0, 150);
      expect(Array.from(reconciler.position)).toEqual(Array.from(original));
      reconciler.update(input, 16, 150);
      expect(Array.from(reconciler.position)).toEqual(Array.from(original));
    }
    for (const [now, speed] of [[NaN, 150], [16, 0], [16, Infinity], [-1, 150]]) {
      reconciler.reset(original, 0); reconciler.correct(target, now!, speed!);
      expect(Array.from(reconciler.position)).toEqual(Array.from(target));
    }
  });

  it('runs as a serialized self-contained runtime factory', () => {
    const { altitude, point } = map();
    const context = vm.createContext({ altitude });
    const reconciler = vm.runInContext(`
      const findPath = ${findLastroServerWalkPath.toString()};
      (${createLastroPositionReconciler.toString()})({ altitude, findPath });
    `, context) as LastroPositionReconciler;
    const target = point(4, 2);
    reconciler.reset(point(2, 2), 0); reconciler.correct(target, 0, 150);
    expect(reconciler.position[0]).toBe(2);
    expect(reconciler.update(target, 16, 150)[0]).toBeGreaterThan(2);
    for (let now = 32; now <= 640; now += 16) reconciler.update(target, now, 150);
    expect(Array.from(reconciler.position)).toEqual(Array.from(target));
  });

  it('retains passive hard-transition reasons and validates external reset tags', () => {
    const { altitude, findPath, point } = map();
    const reconciler = createLastroPositionReconciler({ altitude, findPath });
    reconciler.reset(point(2, 2), 0, 'initialize');
    expect(reconciler.lastHardSetReason).toBe('reset:initialize');
    reconciler.update(point(2.2, 2), 16, 150);
    expect(reconciler.lastHardSetReason).toBe('authority-follow');
    reconciler.update(point(4, 2), 32, 150);
    expect(reconciler.lastHardSetReason).toBe('authority-follow');
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(4, 2)));
    reconciler.reset(point(5, 2), 40, 'jump');
    expect(reconciler.lastHardSetReason).toBe('reset:jump');
    reconciler.correct(point(12, 2), 40, 150);
    expect(reconciler.lastHardSetReason).toBe('correct-distance-limit');
    expect(Array.from(reconciler.position)).toEqual(Array.from(point(12, 2)));
    reconciler.reset(point(2, 2), 50, 'raw-packet:1234');
    expect(reconciler.lastHardSetReason).toBe('reset:external');
  });

  it('smoothly retires a speculative position without changing the authoritative target', () => {
    const { altitude, findPath, point } = map();
    const reconciler = createLastroPositionReconciler({ altitude, findPath });
    const origin = point(3.3, 2), target = point(3, 2), originalTarget = Array.from(target);
    reconciler.reset(origin, 0);
    reconciler.correct(target, 0, 150, { path: new Int16Array(0), index: 0, total: 0 });
    expect(Array.from(reconciler.position)).toEqual(Array.from(origin));
    expect(Array.from(target)).toEqual(originalTarget);
    reconciler.update(target, 16, 150);
    expect(reconciler.position[0]).toBeLessThan(origin[0]!);
    expect(reconciler.position[0]).toBeGreaterThan(target[0]!);
    reconciler.correct(point(3.1, 2), 16, 150);
    expect(Array.from(target)).toEqual(originalTarget);
  });

  it.each(['direct-unsafe-target-link', 'height-unavailable', 'invalid-target', 'clock-regression'])(
    'identifies the %s hard-set branch without changing its result', reason => {
      const { reconciler, altitude, cells, point } = map();
      const origin = point(2, 2), target = point(4, 2);
      reconciler.reset(origin, 0); reconciler.correct(target, 0, 150);
      if (reason === 'direct-unsafe-target-link') for (let y = 0; y < altitude.height; y++) cells[3 + y * altitude.width] = 1;
      if (reason === 'height-unavailable') altitude.getCellHeight = () => NaN;
      reconciler.update(reason === 'invalid-target' ? [NaN, 2, 0] : target, reason === 'clock-regression' ? -1 : 16, 150);
      expect(reconciler.lastHardSetReason).toBe(reason);
      expect(Array.from(reconciler.position)).toEqual(Array.from(reason === 'invalid-target' ? origin : target));
    });

  it('retains and releases a hold on the approved cursor without moving it immediately', () => {
    const { reconciler, point } = map();
    const path = new Int16Array([2, 2, 3, 2, 4, 2, 5, 2]);
    const stopped = { path, index: 0, total: 0 }, target = point(3, 2);
    reconciler.reset(point(3.3, 2), 0); reconciler.update(point(3.3, 2), 0, 150, { path, index: 4, total: path.length });
    expect(reconciler.holdAtStop(target, 0, 150, stopped)).toBe(true);
    expect(reconciler.holdingStop).toBe(true);
    reconciler.correct(target, 100, 150, stopped);
    expect(reconciler.holdingStop).toBe(true);
    reconciler.update(target, 1000, 150, stopped);
    const held = Array.from(reconciler.position);
    expect(reconciler.releaseStopHold(1020)).toBe(true);
    expect(reconciler.holdingStop).toBe(false);
    expect(Array.from(reconciler.position)).toEqual(held);
    reconciler.update(target, 1036, 150, stopped);
    expect(reconciler.position[0]).toBeLessThan(held[0]!);
  });

  it.each(['no-approved-route', 'different-cell', 'display-not-ahead', 'approved-route-invalid'])(
    'rejects a hold with %s without adding a correction', reason => {
      const { reconciler, point, cells, altitude } = map();
      const path = new Int16Array([2, 2, 3, 2, 4, 2, 5, 2]);
      const x = reason === 'different-cell' ? 3.6 : reason === 'display-not-ahead' ? 2.8 : 3.3;
      reconciler.reset(point(x, 2), 0);
      if (reason !== 'no-approved-route') reconciler.update(point(x, 2), 0, 150, { path, index: x < 3 ? 2 : 4, total: path.length });
      if (reason === 'approved-route-invalid') cells[4 + 2 * altitude.width] = 1;
      const before = Array.from(reconciler.position);
      expect(reconciler.holdAtStop(point(3, 2), 0, 150, { path, index: 0, total: 0 })).toBe(false);
      expect(Array.from(reconciler.position)).toEqual(before);
      expect(reconciler.holdingStop).toBe(false);
    });
});
