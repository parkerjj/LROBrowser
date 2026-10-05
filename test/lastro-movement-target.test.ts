import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { selectLastroMovementTarget } from '../scripts/lastro-movement-target.mjs';
import { findLastroPredictedServerPath } from '../scripts/lastro-walk-prediction.mjs';

function fixture(size = 24) {
  const cells = new Uint8Array(size * size).fill(2);
  const altitude = { width: size, height: size, TYPE: { WALKABLE: 2 },
    getCellType: vi.fn((x: number, y: number) => cells[x + y * size]) };
  const occupiedCells = new Set<string>();
  const occupied = vi.fn((x: number, y: number) => occupiedCells.has(x + ',' + y));
  const findPath = vi.fn(findLastroPredictedServerPath);
  const options = { position: [1, 1], target: { x: 10, y: 10 }, altitude, occupied, findPath };
  return { cells, altitude, occupiedCells, occupied, findPath, options };
}

describe('reachable manual movement landing cells', () => {
  it('keeps an exact reachable unoccupied click with one path search and no nearby flood', () => {
    const f = fixture();
    expect(selectLastroMovementTarget(f.options)).toEqual(f.options.target);
    expect(f.findPath).toHaveBeenCalledOnce();
    expect(f.occupied).toHaveBeenCalledOnce();
  });

  it('selects a nearby free cell by click distance, then actual server-route cost', () => {
    const f = fixture(); f.options.target = { x: 10, y: 1 }; f.occupiedCells.add('10,1');
    expect(selectLastroMovementTarget({ ...f.options, range: 1 })).toEqual({ x: 9, y: 1 });
    expect(f.occupied.mock.calls.filter(([x, y]) => x === 10 && y === 1)).toHaveLength(1);
  });

  it('rejects an unreachable ground click instead of changing its destination to our side of a wall', () => {
    const f = fixture();
    for (let y = 0; y < 24; y++) f.cells[10 + y * 24] = 0;
    f.options.target = { x: 11, y: 1 };
    expect(selectLastroMovementTarget({ ...f.options, range: 3 })).toBeNull();
    expect(f.findPath).toHaveBeenCalledOnce();
    expect(f.occupied).not.toHaveBeenCalled();
  });

  it('retains a valid route around a wall and keeps its requested destination', () => {
    const f = fixture();
    for (let y = 0; y < 7; y++) f.cells[5 + y * 24] = 0;
    f.options.target = { x: 7, y: 2 };
    expect(selectLastroMovementTarget(f.options)).toEqual(f.options.target);
  });

  it('does not use a diagonal shortcut through blocked cardinal neighbors', () => {
    const f = fixture(); f.cells.fill(0);
    f.cells[1 + 24] = f.cells[2 + 2 * 24] = 2;
    f.options.target = { x: 2, y: 2 }; f.occupiedCells.add('1,1');
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toBeNull();
  });

  it('allows the exact crowded ground if no reachable free landing cell exists', () => {
    const f = fixture();
    f.options.target = { x: 8, y: 1 }; f.options.occupied = vi.fn(() => true);
    expect(selectLastroMovementTarget({ ...f.options, range: 1 })).toEqual(f.options.target);
    expect(f.findPath).toHaveBeenCalledOnce();
  });

  it('does not make occupied actors into walls along a route', () => {
    const f = fixture(); f.cells.fill(0);
    for (let x = 1; x <= 9; x++) { f.cells[x + 24] = 2; if (x < 9) f.occupiedCells.add(x + ',1'); }
    f.options.target = { x: 9, y: 1 };
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toEqual(f.options.target);
  });

  it('continues beyond nearby flooded cells rejected by the server planner', () => {
    const f = fixture(); f.options.target = { x: 8, y: 8 }; f.occupiedCells.add('8,8');
    f.options.findPath = vi.fn((x0, y0, x1, y1, out, altitude) => x1 === 8 && y1 === 8 || x1 === 9 && y1 === 10
      ? findLastroPredictedServerPath(x0, y0, x1, y1, out, altitude) : 0);
    expect(selectLastroMovementTarget({ ...f.options, range: 2 })).toEqual({ x: 9, y: 10 });
    const attempted = f.findPath.mock.calls.map(call => call[2] + ',' + call[3]);
    expect(new Set(attempted).size).toBe(attempted.length);
  });

  it('checks a moving request from its next scheduled grid center', () => {
    const f = fixture(); f.options.position = [1.2, 1]; f.options.target = { x: 8, y: 1 };
    const walk = { path: new Int16Array([1, 1, 2, 1, 3, 1]), index: 2, total: 6 };
    expect(selectLastroMovementTarget({ ...f.options, walk })).toEqual(f.options.target);
    expect(f.findPath.mock.calls[0]!.slice(0, 2)).toEqual([2, 1]);
    expect(Array.from(walk.path)).toEqual([1, 1, 2, 1, 3, 1]);
    expect(f.options.position).toEqual([1.2, 1]);
  });

  it('keeps an occupied next-center click as a request to stop the active route there', () => {
    const f = fixture(); f.options.position = [1.7, 1]; f.options.target = { x: 2, y: 1 };
    f.occupiedCells.add('2,1');
    const walk = { path: new Int16Array([1, 1, 2, 1, 3, 1, 4, 1]), index: 2, total: 8 };
    expect(selectLastroMovementTarget({ ...f.options, walk })).toEqual(f.options.target);
    expect(f.findPath).not.toHaveBeenCalled();
    expect(f.occupied).not.toHaveBeenCalled();
  });

  it('does not trust malformed native route hints', () => {
    const f = fixture();
    const walk = { path: [1, 1, NaN, 1], index: 2, total: 4 };
    expect(selectLastroMovementTarget({ ...f.options, walk })).toEqual(f.options.target);
    expect(f.findPath.mock.calls[0]!.slice(0, 2)).toEqual([1, 1]);
  });

  it('can leave a blocked origin as the server pathfinder permits', () => {
    const f = fixture(); f.cells[1 + 24] = 0; f.options.target = { x: 3, y: 1 };
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toEqual(f.options.target);
  });

  it('bounds a full disconnected search to a local 65 by 65 cell region', () => {
    const f = fixture(160); f.options.position = [60, 60]; f.options.target = { x: 80, y: 60 };
    for (let y = 0; y < 160; y++) f.cells[75 + y * 160] = 0;
    expect(selectLastroMovementTarget({ ...f.options, range: 1 })).toBeNull();
    // The planner and selector each cache their cell probes. No flood is global.
    expect(f.altitude.getCellType.mock.calls.length).toBeLessThan(9000);
  });

  it.each([0, 34, 99, NaN])('rejects malformed planner count %s without returning an unchecked target', count => {
    const f = fixture(); f.options.findPath = vi.fn(() => count);
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toBeNull();
  });

  it('rejects path endpoints or segments that disagree with the requested route', () => {
    const f = fixture();
    f.options.findPath = vi.fn((_x0, _y0, _x1, _y1, out) => { out.set([1, 1, 10, 10]); return 2; });
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toBeNull();
  });

  it('falls back to finite results when terrain or occupancy probes throw', () => {
    const f = fixture(); f.altitude.getCellType.mockImplementation(() => { throw new Error('map unavailable'); });
    expect(selectLastroMovementTarget(f.options)).toBeNull();
    const g = fixture(); g.options.occupied = vi.fn(() => { throw new Error('actor list unavailable'); });
    expect(selectLastroMovementTarget({ ...g.options, range: 0 })).toEqual(g.options.target);
  });

  it.each([
    { target: { x: -1, y: 1 } }, { target: { x: 1.1, y: 1 } }, { target: { x: 24, y: 1 } },
    { position: [NaN, 1] }, { range: -1 }, { range: 10 },
  ])('rejects malformed request %j', change => {
    const f = fixture(); expect(selectLastroMovementTarget({ ...f.options, ...change })).toBeNull();
  });

  it('lets the caller retain its far-click behavior rather than running an unbounded search', () => {
    const f = fixture(80); f.options.target = { x: 50, y: 1 };
    expect(selectLastroMovementTarget(f.options)).toBeNull();
    expect(f.findPath).not.toHaveBeenCalled();
    expect(f.altitude.getCellType).not.toHaveBeenCalled();
  });

  it('has no persistent map cache when GAT walkability changes between clicks', () => {
    const f = fixture(); f.options.target = { x: 3, y: 1 };
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toEqual(f.options.target);
    f.cells[3 + 24] = 0;
    expect(selectLastroMovementTarget({ ...f.options, range: 0 })).toBeNull();
  });

  it('serializes without external runtime dependencies', () => {
    const f = fixture();
    const embedded = vm.runInNewContext('(' + selectLastroMovementTarget.toString() + ')') as typeof selectLastroMovementTarget;
    // Use a same-realm route buffer because the server planner checks its type.
    const findPath = (_x0: number, _y0: number, _x1: number, _y1: number, out: Int16Array) => { out.set([1, 1, 2, 1]); return 2; };
    expect(embedded({ ...f.options, target: { x: 2, y: 1 }, findPath })).toEqual({ x: 2, y: 1 });
  });
});
