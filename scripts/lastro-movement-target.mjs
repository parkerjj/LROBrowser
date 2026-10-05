// Select a nearby landing cell without changing the server's path ordering.
// Keep this function self-contained: MapEngine embeds its source.
export function selectLastroMovementTarget({ position, walk, target, range = 9, altitude, occupied, findPath } = {}) {
  const width = altitude?.width, height = altitude?.height, type = altitude?.TYPE?.WALKABLE;
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0
    || !Number.isSafeInteger(width * height) || !Number.isInteger(type) || type <= 0
    || typeof altitude?.getCellType !== 'function' || typeof findPath !== 'function'
    || !Number.isInteger(range) || range < 0 || range > 9) return null;
  const valid = (x, y) => Number.isInteger(x) && Number.isInteger(y)
    && x >= 0 && y >= 0 && x < width && y < height && x <= 32767 && y <= 32767;
  const tx = target?.x, ty = target?.y;
  if (!valid(tx, ty) || !Number.isFinite(position?.[0]) || !Number.isFinite(position?.[1])) return null;
  let ox = Math.round(position[0]), oy = Math.round(position[1]);
  // A turn request takes effect at a cell boundary. While walking, check
  // reachability from the scheduled next center rather than rounding mid-cell.
  const index = walk?.index, total = walk?.total, path = walk?.path;
  let scheduledCenter = false;
  if (Number.isInteger(index) && index >= 2 && index % 2 === 0 && Number.isInteger(total)
    && total >= 4 && total <= 66 && total % 2 === 0 && index < total && path?.length >= total
    && valid(path[index], path[index + 1]) && valid(path[index - 2], path[index - 1])
    && Math.max(Math.abs(path[index] - path[index - 2]), Math.abs(path[index + 1] - path[index - 1])) <= 1) {
    ox = path[index]; oy = path[index + 1]; scheduledCenter = true;
  }
  if (!valid(ox, oy) || Math.max(Math.abs(tx - ox), Math.abs(ty - oy)) > 32) return null;
  const cells = new Map(), occupancy = new Map(), costs = new Map(), routeBuffer = new Int16Array(66);
  const walkable = (x, y) => {
    if (!valid(x, y)) return false;
    const key = x + y * width;
    if (cells.has(key)) return cells.get(key);
    let value;
    try { value = altitude.getCellType(x, y); } catch { value = undefined; }
    const pass = Number.isInteger(value) && (value & type) !== 0;
    cells.set(key, pass); return pass;
  };
  const isOccupied = (x, y) => {
    const key = x + y * width;
    if (occupancy.has(key)) return occupancy.get(key);
    let value = false;
    try { value = typeof occupied === 'function' && !!occupied(x, y); } catch { value = true; }
    occupancy.set(key, value); return value;
  };
  const computeRouteCost = (x, y) => {
    let count;
    try { count = findPath(ox, oy, x, y, routeBuffer, altitude); } catch { return null; }
    if (!Number.isInteger(count) || count < 1 || count > 33 || count * 2 > routeBuffer.length
      || routeBuffer[0] !== ox || routeBuffer[1] !== oy
      || routeBuffer[(count - 1) * 2] !== x || routeBuffer[(count - 1) * 2 + 1] !== y) return null;
    let cost = 0;
    for (let i = 2; i < count * 2; i += 2) {
      const ax = routeBuffer[i - 2], ay = routeBuffer[i - 1], bx = routeBuffer[i], by = routeBuffer[i + 1];
      const dx = bx - ax, dy = by - ay;
      if (!walkable(bx, by) || Math.max(Math.abs(dx), Math.abs(dy)) !== 1
        || dx && dy && (!walkable(ax + dx, ay) || !walkable(ax, ay + dy))) return null;
      cost += dx && dy ? 14 : 10;
    }
    return cost;
  };
  const routeCost = (x, y) => {
    const key = x + y * width;
    if (costs.has(key)) return costs.get(key);
    const cost = computeRouteCost(x, y);
    costs.set(key, cost); return cost;
  };
  const requestedPassable = walkable(tx, ty);
  // Clicking the center already scheduled by the approved walk is a request
  // to stop there. The player's rounded occupancy must not redirect that click.
  if (scheduledCenter && tx === ox && ty === oy && requestedPassable) return { x: tx, y: ty };
  // An unreachable ground click is not a request to walk to our side of its
  // wall. Nearby landing preferences must not rescue that unreachable click.
  const requestedCost = requestedPassable ? routeCost(tx, ty) : null;
  if (requestedPassable && requestedCost === null) return null;
  // Most clicks keep the exact destination and need one server-style search.
  if (requestedPassable && !isOccupied(tx, ty)) return { x: tx, y: ty };

  const candidates = [];
  let nearestPossible = Infinity;
  for (let y = Math.max(0, ty - range); y <= Math.min(height - 1, ty + range, 32767); y++) {
    for (let x = Math.max(0, tx - range); x <= Math.min(width - 1, tx + range, 32767); x++) {
      if (!walkable(x, y) || isOccupied(x, y)) continue;
      const distance = (x - tx) ** 2 + (y - ty) ** 2;
      nearestPossible = Math.min(nearestPossible, distance);
      candidates.push({ x, y, distance, key: x + y * width });
    }
  }
  if (!candidates.length) return requestedPassable && routeCost(tx, ty) !== null ? { x: tx, y: ty } : null;
  // One bounded flood checks all alternatives together. Actors are a landing
  // preference, not terrain walls; a crowded corridor must remain traversable.
  const originKey = ox + oy * width, reached = new Map([[originKey, 0]]);
  const queue = [{ x: ox, y: oy, steps: 0 }];
  const directions = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]];
  let remainingNearest = candidates.filter(candidate => candidate.distance === nearestPossible && candidate.key !== originKey).length;
  const nearestKeys = new Set(candidates.filter(candidate => candidate.distance === nearestPossible).map(candidate => candidate.key));
  for (let cursor = 0; cursor < queue.length && cursor < 4225; cursor++) {
    const node = queue[cursor];
    if (node.steps >= 32) continue;
    for (const [dx, dy] of directions) {
      const x = node.x + dx, y = node.y + dy, key = x + y * width;
      if (reached.has(key) || !walkable(x, y)
        || dx && dy && (!walkable(node.x + dx, node.y) || !walkable(node.x, node.y + dy))) continue;
      reached.set(key, node.steps + 1); queue.push({ x, y, steps: node.steps + 1 });
      if (nearestKeys.has(key)) remainingNearest--;
    }
    if (nearestPossible < Infinity && remainingNearest === 0) {
      let nearest = null, nearestCost = Infinity;
      for (const candidate of candidates) {
        if (candidate.distance !== nearestPossible) continue;
        const cost = routeCost(candidate.x, candidate.y);
        if (cost !== null && cost < nearestCost) { nearest = candidate; nearestCost = cost; }
      }
      if (nearest) return { x: nearest.x, y: nearest.y };
      // Reaching a cell in the flood is insufficient if the server-style
      // planner rejects it. Keep exploring the more distant alternatives.
      remainingNearest = -1;
    }
  }
  candidates.sort((a, b) => a.distance - b.distance || (reached.get(a.key) ?? Infinity) - (reached.get(b.key) ?? Infinity)
    || a.y - b.y || a.x - b.x);
  let chosen = null, chosenDistance = Infinity, chosenCost = Infinity;
  for (const candidate of candidates) {
    if (candidate.distance > chosenDistance) break;
    if (!reached.has(candidate.key)) continue;
    const cost = routeCost(candidate.x, candidate.y);
    if (cost === null) continue;
    if (cost < chosenCost) { chosen = { x: candidate.x, y: candidate.y }; chosenDistance = candidate.distance; chosenCost = cost; }
  }
  if (chosen) return chosen;
  // If every nearby free tile is unreachable, still allow the exact crowded
  // ground requested by the player when the server-style route reaches it.
  return requestedPassable && routeCost(tx, ty) !== null ? { x: tx, y: ty } : null;
}
