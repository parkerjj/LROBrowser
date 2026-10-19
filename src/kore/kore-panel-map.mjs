// MAP projection helpers. Field geometry and walkability come from Rust;
// entity rows come from the `ml/pl/nl/il` query outputs.

export const MAP_COLORS = Object.freeze({
  background: '#05070a', blocked: '#0c1116', walkable: '#1b2530',
  self: '#f2f5f8', monster: '#d05050', player: '#5c8dff', item: '#d8b84a',
  npc: '#59c3c3', portal: '#4fbf6a', target: '#e8b84b',
});

export function decodeWalkability(encoded, width, height) {
  const cells = Math.max(0, width | 0) * Math.max(0, height | 0);
  const bytes = new Uint8Array(Math.ceil(cells / 8));
  if (!encoded || !bytes.length) return bytes;
  const binary = globalThis.atob(String(encoded));
  const length = Math.min(bytes.length, binary.length);
  for (let index = 0; index < length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function walkableAt(bytes, width, x, y) {
  const index = y * width + x;
  return (bytes[index >> 3] & (1 << (index & 7))) !== 0;
}

export function layoutMap(width, height, maxWidth, maxHeight) {
  const w = Math.max(1, width | 0), h = Math.max(1, height | 0);
  const scale = Math.max(1, Math.floor(Math.min(Math.max(1, maxWidth) / w, Math.max(1, maxHeight) / h)));
  return {
    scale, width: w * scale, height: h * scale,
    offsetX: Math.floor((maxWidth - w * scale) / 2),
    offsetY: Math.floor((maxHeight - h * scale) / 2),
  };
}

export function parsePoint(text) {
  const match = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/.exec(String(text ?? ''));
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
}

export function parseEntityTable(result, kind) {
  const table = Array.isArray(result?.blocks) ? result.blocks.find(block => block?.type === 'table') : null;
  if (!table) return [];
  const columns = (table.columns ?? []).map(column => String(column));
  const index = name => columns.indexOf(name);
  const gidAt = index('GID');
  const pointAt = index('坐标');
  const nameAt = index('名称');
  const typeAt = index('类型');
  const out = [];
  for (const row of table.rows ?? []) {
    const point = parsePoint(row?.[pointAt]);
    if (!point) continue;
    const type = typeAt >= 0 ? String(row?.[typeAt] ?? '').toLowerCase() : '';
    out.push({
      kind: type === 'portal' ? 'portal' : kind,
      gid: gidAt >= 0 ? Number(row?.[gidAt]) : null,
      name: nameAt >= 0 ? String(row?.[nameAt] ?? '') : '',
      x: point.x, y: point.y,
    });
  }
  return out;
}

export function mapEntities({ monsters, players, npcs, items } = {}) {
  return [
    ...parseEntityTable(monsters, 'monster'),
    ...parseEntityTable(players, 'player'),
    ...parseEntityTable(npcs, 'npc'),
    ...parseEntityTable(items, 'item'),
  ];
}

export function drawMap(ctx, {
  map, entities = [], self = null, targetGid = null,
  maxWidth = 640, maxHeight = 640,
} = {}) {
  if (!ctx || !map) return null;
  const width = Math.max(1, map.width | 0), height = Math.max(1, map.height | 0);
  const layout = layoutMap(width, height, maxWidth, maxHeight);
  const walkability = map.walkabilityBytes ?? decodeWalkability(map.walkability, width, height);
  const pixel = layout.scale;
  ctx.fillStyle = MAP_COLORS.background;
  ctx.fillRect(0, 0, maxWidth, maxHeight);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      ctx.fillStyle = walkableAt(walkability, width, x, y) ? MAP_COLORS.walkable : MAP_COLORS.blocked;
      ctx.fillRect(layout.offsetX + x * pixel, layout.offsetY + y * pixel, pixel, pixel);
    }
  }
  const dot = ({ x, y }, color, size = pixel) => {
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= width || y >= height) return false;
    ctx.fillStyle = color;
    ctx.fillRect(layout.offsetX + x * pixel + Math.floor((pixel - size) / 2),
      layout.offsetY + y * pixel + Math.floor((pixel - size) / 2), size, size);
    return true;
  };
  for (const entity of entities) dot(entity, MAP_COLORS[entity.kind] ?? MAP_COLORS.monster, pixel);
  if (self) dot(self, MAP_COLORS.self, Math.max(2, pixel + 1));
  const target = targetGid == null ? null : entities.find(entity => entity.gid === targetGid);
  if (target) {
    ctx.strokeStyle = MAP_COLORS.target;
    ctx.lineWidth = Math.max(1, Math.floor(pixel / 2));
    const x = layout.offsetX + target.x * pixel, y = layout.offsetY + target.y * pixel;
    ctx.strokeRect(x - 1, y - 1, pixel + 2, pixel + 2);
  }
  return layout;
}

export function targetGidFromAi(result) {
  const pairs = Array.isArray(result?.blocks) ? result.blocks.find(block => block?.type === 'kv')?.pairs ?? [] : [];
  const target = pairs.find(([key]) => key === '目标')?.[1];
  const match = /^\s*(\d+)/.exec(String(target ?? ''));
  return match ? Number(match[1]) : null;
}
