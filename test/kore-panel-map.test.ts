import { expect, test, vi } from 'vitest';
import {
  cellCenter, decodeWalkability, drawMap, entityCounts, layoutMap, mapEntities, parseEntityTable, parsePoint, targetGidFromAi, walkableAt,
} from '../src/kore/kore-panel-map.mjs';

test('walkability bitsets decode in row-major cell order', () => {
  const bytes = decodeWalkability('//8=', 4, 4);
  expect([...bytes]).toEqual([0xff, 0xff]);
  for (let y = 0; y < 4; y += 1) for (let x = 0; x < 4; x += 1) expect(walkableAt(bytes, 4, x, y)).toBe(true);
  expect(walkableAt(Uint8Array.from([0b00000010]), 4, 1, 0)).toBe(true);
  expect(walkableAt(Uint8Array.from([0b00000010]), 4, 0, 0)).toBe(false);
});

test('map layout scales to fill the space and centers the remainder', () => {
  expect(layoutMap(4, 4, 100, 60)).toEqual({ scale: 15, width: 60, height: 60, offsetX: 20, offsetY: 0 });
  expect(layoutMap(10, 5, 100, 100)).toEqual({ scale: 10, width: 100, height: 50, offsetX: 0, offsetY: 25 });
  // A 400-cell map in a 700x620 box is scaled by 1.55, not left at 1x.
  expect(layoutMap(400, 400, 700, 620)).toEqual({ scale: 1.55, width: 620, height: 620, offsetX: 40, offsetY: 0 });
});

test('cell (0, 0) is the bottom-left corner and y grows upwards', () => {
  const layout = layoutMap(4, 4, 40, 40);
  expect(cellCenter(layout, 4, 0, 0)).toEqual({ x: 5, y: 35 });
  expect(cellCenter(layout, 4, 3, 3)).toEqual({ x: 35, y: 5 });
  expect(cellCenter(layout, 4, 0, 3).y).toBeLessThan(cellCenter(layout, 4, 0, 0).y);
});

test('entity tables become map points and portal rows are typed', () => {
  const monsters = { blocks: [{ type: 'table', columns: ['#', '名称', 'GID', '坐标', '距离', 'HP%'], rows: [['1', '波利', '1002', '(13, 10)', '1', '50%']] }] };
  const npcs = { blocks: [{ type: 'table', columns: ['#', '名称', 'GID', '坐标', '距离', '类型'], rows: [['1', 'Npc #9', '9', '(12, 10)', '1', 'npc'], ['2', 'Portal #10', '10', '(11, 10)', '1', 'portal']] }] };
  expect(parseEntityTable(monsters, 'monster')).toEqual([{ kind: 'monster', gid: 1002, name: '波利', x: 13, y: 10 }]);
  expect(mapEntities({ monsters, npcs })).toEqual([
    { kind: 'monster', gid: 1002, name: '波利', x: 13, y: 10 },
    { kind: 'npc', gid: 9, name: 'Npc #9', x: 12, y: 10 },
    { kind: 'portal', gid: 10, name: 'Portal #10', x: 11, y: 10 },
  ]);
  expect(parsePoint('no point')).toBeNull();
});

function mockContext() {
  return {
    fillStyle: '', strokeStyle: '', lineWidth: 0, font: '', textAlign: '', textBaseline: '',
    fillRect: vi.fn(), strokeRect: vi.fn(), fillText: vi.fn(),
    beginPath: vi.fn(), arc: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
  };
}

test('drawMap paints walkable runs, entities and the target ring', () => {
  const ctx = mockContext();
  const layout = drawMap(ctx as unknown as CanvasRenderingContext2D, {
    map: { width: 2, height: 2, walkability: 'Dw==' },
    entities: [
      { kind: 'monster', gid: 1, name: 'a', x: 1, y: 0 },
      { kind: 'npc', gid: 2, name: 'b', x: 0, y: 1 },
      { kind: 'portal', gid: 3, name: 'c', x: 1, y: 1 },
    ],
    self: { x: 0, y: 0 }, targetGid: 1, maxWidth: 20, maxHeight: 20,
  });
  expect(layout).toEqual({ scale: 10, width: 20, height: 20, offsetX: 0, offsetY: 0 });
  // Background, map extent, then one merged run per fully walkable row.
  expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 20, 20);
  expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 20, 10);
  expect(ctx.fillRect).toHaveBeenCalledWith(0, 10, 20, 10);
  // Two filled entities and one hollow portal, plus the target ring.
  expect(ctx.strokeRect).toHaveBeenCalledTimes(4);
});

test('the player at cell (0, 0) is drawn on the bottom row, not the top', () => {
  const draw = (self: { x: number; y: number }) => {
    const ctx = mockContext();
    drawMap(ctx as unknown as CanvasRenderingContext2D, {
      map: { width: 4, height: 4, walkability: '//8=' }, self, maxWidth: 40, maxHeight: 40,
    });
    return ctx.arc.mock.calls[0]!;
  };
  expect(draw({ x: 0, y: 0 }).slice(0, 2)).toEqual([5, 35]);
  expect(draw({ x: 0, y: 3 }).slice(0, 2)).toEqual([5, 5]);
});

test('rulers label game coordinates from the bottom-left origin', () => {
  const ctx = mockContext();
  drawMap(ctx as unknown as CanvasRenderingContext2D, {
    map: { width: 100, height: 100, walkability: '' }, maxWidth: 400, maxHeight: 400, rulers: true,
  });
  const labels = ctx.fillText.mock.calls.map(([text, x, y]) => ({ text, x, y }));
  const xLabels = labels.filter(label => label.y > 300);
  const yLabels = labels.filter(label => label.x < 40);
  // Zero starts at the bottom-left corner; larger y values sit higher up.
  expect(xLabels[0]!.text).toBe('0');
  expect(yLabels[0]!.text).toBe('0');
  const yPositions = yLabels.map(label => label.y);
  expect(yPositions).toEqual([...yPositions].sort((a, b) => b - a));
});

test('entity counts are grouped by kind', () => {
  expect(entityCounts([
    { kind: 'monster', gid: 1, name: '', x: 0, y: 0 }, { kind: 'monster', gid: 2, name: '', x: 0, y: 0 },
    { kind: 'player', gid: 3, name: '', x: 0, y: 0 }, { kind: 'portal', gid: 4, name: '', x: 0, y: 0 },
  ])).toEqual({ monster: 2, player: 1, npc: 0, item: 0, portal: 1 });
});

test('target gid is read from the ai print kv target', () => {
  expect(targetGidFromAi({ blocks: [{ type: 'kv', pairs: [['目标', '1002 @(125, 88)']] }] })).toBe(1002);
  expect(targetGidFromAi({ blocks: [{ type: 'kv', pairs: [['目标', '—']] }] })).toBeNull();
});
