import { expect, test, vi } from 'vitest';
import {
  decodeWalkability, drawMap, layoutMap, mapEntities, parseEntityTable, parsePoint, targetGidFromAi, walkableAt,
} from '../src/kore/kore-panel-map.mjs';

test('walkability bitsets decode in row-major cell order', () => {
  const bytes = decodeWalkability('//8=', 4, 4);
  expect([...bytes]).toEqual([0xff, 0xff]);
  for (let y = 0; y < 4; y += 1) for (let x = 0; x < 4; x += 1) expect(walkableAt(bytes, 4, x, y)).toBe(true);
  expect(walkableAt(Uint8Array.from([0b00000010]), 4, 1, 0)).toBe(true);
  expect(walkableAt(Uint8Array.from([0b00000010]), 4, 0, 0)).toBe(false);
});

test('map layout uses integer scale and centers the remainder', () => {
  expect(layoutMap(4, 4, 100, 60)).toEqual({ scale: 15, width: 60, height: 60, offsetX: 20, offsetY: 0 });
  expect(layoutMap(10, 5, 100, 100)).toEqual({ scale: 10, width: 100, height: 50, offsetX: 0, offsetY: 25 });
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

test('drawMap paints walkable cells, entity colors and the target ring', () => {
  const ctx = { fillStyle: '', strokeStyle: '', lineWidth: 0, fillRect: vi.fn(), strokeRect: vi.fn() };
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
  const colors = ctx.fillRect.mock.calls.map((_, index) => index);
  expect(colors).toHaveLength(9);
  expect(ctx.strokeRect).toHaveBeenCalledOnce();
});

test('target gid is read from the ai print kv target', () => {
  expect(targetGidFromAi({ blocks: [{ type: 'kv', pairs: [['目标', '1002 @(125, 88)']] }] })).toBe(1002);
  expect(targetGidFromAi({ blocks: [{ type: 'kv', pairs: [['目标', '—']] }] })).toBeNull();
});
