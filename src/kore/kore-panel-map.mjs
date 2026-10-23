// MAP projection helpers. Field geometry and walkability come from Rust;
// entity rows come from the `ml/pl/nl/il` query outputs.

export const MAP_COLORS = Object.freeze({
  background: '#131217', blocked: '#0e0d11', walkable: '#2a2830',
  self: '#ffffff', monster: '#e5566f', player: '#6fb3c9', item: '#d9a441',
  npc: '#5fc39c', portal: '#5fc39c', target: '#ffffff', ruler: '#8a8c92',
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
  const scale = Math.max(0.25, Math.min(Math.max(1, maxWidth) / w, Math.max(1, maxHeight) / h));
  const pixelWidth = Math.floor(w * scale), pixelHeight = Math.floor(h * scale);
  return {
    scale, width: pixelWidth, height: pixelHeight,
    offsetX: Math.floor((maxWidth - pixelWidth) / 2),
    offsetY: Math.floor((maxHeight - pixelHeight) / 2),
  };
}

// RO cell (0, 0) is the bottom-left corner and y grows upwards, like the
// game's own minimap; canvas rows run downwards, so the row is flipped.
export function cellCenter(layout, height, x, y) {
  return {
    x: layout.offsetX + (x + 0.5) * layout.scale,
    y: layout.offsetY + (height - y - 0.5) * layout.scale,
  };
}

export function entityCounts(entities = []) {
  const counts = { monster: 0, player: 0, npc: 0, item: 0, portal: 0 };
  for (const entity of entities) if (entity.kind in counts) counts[entity.kind] += 1;
  return counts;
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

const RULER_GUTTER = Object.freeze({ left: 30, bottom: 22, top: 8, right: 8 });
const RULER_FONT = '11px Arial,"Microsoft YaHei","MiSans",sans-serif';

export function drawMap(ctx, {
  map, entities = [], self = null, targetGid = null,
  maxWidth = 640, maxHeight = 640, rulers = false,
} = {}) {
  if (!ctx || !map) return null;
  const width = Math.max(1, map.width | 0), height = Math.max(1, map.height | 0);
  const gutter = rulers ? RULER_GUTTER : { left: 0, bottom: 0, top: 0, right: 0 };
  const inner = layoutMap(width, height, maxWidth - gutter.left - gutter.right, maxHeight - gutter.top - gutter.bottom);
  const layout = { ...inner, offsetX: inner.offsetX + gutter.left, offsetY: inner.offsetY + gutter.top };
  const { scale, offsetX, offsetY } = layout;
  const walkability = map.walkabilityBytes ?? decodeWalkability(map.walkability, width, height);
  // Cell edges are snapped, so neighbouring runs never leave a seam at a fractional scale.
  const edge = cells => Math.round(cells * scale);
  ctx.fillStyle = MAP_COLORS.background;
  ctx.fillRect(0, 0, maxWidth, maxHeight);
  ctx.fillStyle = MAP_COLORS.blocked;
  ctx.fillRect(offsetX, offsetY, edge(width), edge(height));
  ctx.fillStyle = MAP_COLORS.walkable;
  for (let y = 0; y < height; y += 1) {
    const top = offsetY + edge(height - 1 - y), bottom = offsetY + edge(height - y);
    let x = 0;
    while (x < width) {
      if (!walkableAt(walkability, width, x, y)) { x += 1; continue; }
      let end = x + 1;
      while (end < width && walkableAt(walkability, width, end, y)) end += 1;
      ctx.fillRect(offsetX + edge(x), top, edge(end) - edge(x), bottom - top);
      x = end;
    }
  }
  const inside = ({ x, y }) => Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x < width && y < height;
  const size = Math.max(7, Math.min(12, scale * 1.8));
  for (const entity of entities) {
    if (!inside(entity)) continue;
    const { x: cx, y: cy } = cellCenter(layout, height, entity.x, entity.y);
    if (entity.kind === 'portal') {
      ctx.strokeStyle = MAP_COLORS.portal;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
      continue;
    }
    ctx.fillStyle = MAP_COLORS[entity.kind] ?? MAP_COLORS.monster;
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - size / 2 + 0.5, cy - size / 2 + 0.5, size - 1, size - 1);
  }
  const target = targetGid == null ? null : entities.find(entity => entity.gid === targetGid);
  if (target && inside(target)) {
    const { x: cx, y: cy } = cellCenter(layout, height, target.x, target.y);
    ctx.strokeStyle = MAP_COLORS.target;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - size / 2 - 3, cy - size / 2 - 3, size + 6, size + 6);
  }
  if (self && inside(self)) {
    const { x: cx, y: cy } = cellCenter(layout, height, self.x, self.y);
    const r = Math.max(4, size / 2 + 2);
    // A crosshair + ring keeps the player visible even on a large map.
    ctx.strokeStyle = MAP_COLORS.self;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - r - 4, cy); ctx.lineTo(cx + r + 4, cy);
    ctx.moveTo(cx, cy - r - 4); ctx.lineTo(cx, cy + r + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = MAP_COLORS.self;
    ctx.fillRect(cx - 1, cy - 1, 3, 3);
  }
  if (rulers) drawRulers(ctx, layout, width, height);
  return layout;
}

// Game coordinates along the left and bottom edges; the origin is the bottom-left corner.
function drawRulers(ctx, layout, width, height) {
  const { scale, offsetX, offsetY } = layout;
  const step = [10, 20, 25, 50, 100].find(candidate => candidate * scale >= 44) ?? 100;
  ctx.fillStyle = MAP_COLORS.ruler;
  ctx.strokeStyle = MAP_COLORS.ruler;
  ctx.lineWidth = 1;
  ctx.font = RULER_FONT;
  ctx.textBaseline = 'middle';
  const bottom = offsetY + Math.round(height * scale);
  ctx.textAlign = 'center';
  for (let x = 0; x < width; x += step) {
    const px = offsetX + (x + 0.5) * scale;
    ctx.beginPath(); ctx.moveTo(px, bottom); ctx.lineTo(px, bottom + 4); ctx.stroke();
    ctx.fillText(String(x), px, bottom + 13);
  }
  ctx.textAlign = 'right';
  for (let y = 0; y < height; y += step) {
    const py = offsetY + (height - y - 0.5) * scale;
    ctx.beginPath(); ctx.moveTo(offsetX - 4, py); ctx.lineTo(offsetX, py); ctx.stroke();
    ctx.fillText(String(y), offsetX - 7, py);
  }
}

export function targetGidFromAi(result) {
  const pairs = Array.isArray(result?.blocks) ? result.blocks.find(block => block?.type === 'kv')?.pairs ?? [] : [];
  const target = pairs.find(([key]) => key === '目标')?.[1];
  const match = /^\s*(\d+)/.exec(String(target ?? ''));
  return match ? Number(match[1]) : null;
}
