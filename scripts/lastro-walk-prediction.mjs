// The prediction uses rAthena's public walking rules, not server authority.
// Keep this planner separate from the recovery pathfinder used by approved MOVE.
export function findLastroPredictedServerPath(x0, y0, x1, y1, out, altitude) {
  const width = altitude?.width, height = altitude?.height, type = altitude?.TYPE?.WALKABLE;
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0
    || !Number.isInteger(type) || type <= 0 || typeof altitude?.getCellType !== 'function'
    || !(out instanceof Int16Array) || out.length < 2) return 0;
  // Flattened keys must remain exact for every addressable Int16 GAT cell.
  if (!Number.isSafeInteger(Math.min(height - 1, 32767) * width + Math.min(width - 1, 32767))) return 0;
  const valid = (x, y) => Number.isInteger(x) && Number.isInteger(y)
    && x >= 0 && y >= 0 && x < width && y < height && x <= 32767 && y <= 32767;
  if (!valid(x0, y0) || !valid(x1, y1)) return 0;
  const cache = new Map();
  const walkable = (x, y) => {
    if (!valid(x, y)) return false;
    const key = x + y * width;
    if (cache.has(key)) return cache.get(key);
    let value;
    try { value = altitude.getCellType(x, y); } catch { value = undefined; }
    const pass = Number.isInteger(value) && (value & type) !== 0;
    cache.set(key, pass);
    return pass;
  };
  if (!walkable(x1, y1)) return 0;
  const limit = Math.min(32, (out.length >> 1) - 1);
  if (Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) > limit) return 0;
  const estimate = (x, y) => 10 * (Math.abs(x1 - x) + Math.abs(y1 - y));
  const heap = [], nodes = new Map();
  // Same-priority nodes stay under their parent on insert; removal prefers
  // the right child on a tie, matching the public server's client-style heap.
  const swap = (a, b) => {
    const node = heap[a];
    heap[a] = heap[b]; heap[b] = node;
    heap[a].heapIndex = a; node.heapIndex = b;
  };
  const rise = (floor, index) => {
    while (index > floor) {
      const parent = (index - 1) >> 1;
      if (heap[parent].f <= heap[index].f) break;
      swap(parent, index);
      index = parent;
    }
  };
  const sink = index => {
    const floor = index;
    while (index * 2 + 1 < heap.length) {
      const left = index * 2 + 1, right = left + 1;
      const child = right >= heap.length || heap[left].f < heap[right].f ? left : right;
      swap(index, child);
      index = child;
    }
    rise(floor, index);
  };
  const push = node => { node.heapIndex = heap.length; heap.push(node); rise(0, node.heapIndex); };
  const pop = () => {
    const first = heap[0], last = heap.pop();
    first.heapIndex = -1;
    if (heap.length) { heap[0] = last; last.heapIndex = 0; sink(0); }
    return first;
  };
  const add = (x, y, cost, parent) => {
    const key = x + y * width, previous = nodes.get(key);
    if (previous) {
      if (cost >= previous.cost) return true;
      previous.cost = cost; previous.f = cost + estimate(x, y); previous.parent = parent;
      if (previous.closed) { previous.closed = false; push(previous); }
      else {
        const index = previous.heapIndex;
        if (index < 0 || heap[index] !== previous) return false;
        // Keep the original two-pass heap repair and its tie behavior. rise
        // can move this node; sink still starts at the original slot.
        rise(0, index); sink(index);
      }
      return true;
    }
    // Complete coordinate keys deliberately avoid rAthena's fixed-slot
    // collisions. The bounded budget still prevents an unbounded search.
    if (nodes.size >= 2048) return false;
    const node = { x, y, cost, f: cost + estimate(x, y), parent, closed: false, heapIndex: -1 };
    nodes.set(key, node); push(node); return true;
  };
  add(x0, y0, 0, null);
  const directions = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]];
  while (heap.length) {
    const node = pop(); node.closed = true;
    if (node.x === x1 && node.y === y1) {
      const route = [];
      for (let current = node; current; current = current.parent) {
        route.push(current.x, current.y);
        if (route.length > (limit + 1) * 2) return 0;
      }
      for (let i = 0, end = route.length - 2; i < route.length; i += 2, end -= 2) {
        out[i] = route[end]; out[i + 1] = route[end + 1];
      }
      return route.length >> 1;
    }
    for (const [dx, dy] of directions) {
      const x = node.x + dx, y = node.y + dy;
      if (!walkable(x, y) || dx && dy && (!walkable(node.x + dx, node.y) || !walkable(node.x, node.y + dy))) continue;
      if (!add(x, y, node.cost + (dx && dy ? 14 : 10), node)) return 0;
    }
  }
  return 0;
}

export function lastroWalkStepDuration(dx, dy, speed) {
  if (![dx, dy, speed].every(Number.isFinite) || speed <= 0) return NaN;
  const x = Math.abs(dx), y = Math.abs(dy), diagonal = Math.min(x, y);
  return diagonal * Math.floor(speed * 14 / 10) + (Math.max(x, y) - diagonal) * speed;
}

export function createLastroWalkPrediction({ position, walk, dest, now, altitude, findPath = findLastroPredictedServerPath } = {}) {
  const width = altitude?.width, height = altitude?.height, type = altitude?.TYPE?.WALKABLE;
  const x = position?.[0], y = position?.[1];
  const targetX = dest?.[0] ?? dest?.x, targetY = dest?.[1] ?? dest?.y;
  const speed = walk?.speed ?? 150;
  if (![x, y, now, speed].every(Number.isFinite) || speed <= 0
    || (walk?.total !== undefined && (!Number.isInteger(walk.total) || walk.total < 0))
    || !Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0
    || !Number.isInteger(type) || type <= 0 || typeof altitude?.getCellType !== 'function'
    || typeof findPath !== 'function') return null;
  const valid = (px, py) => Number.isFinite(px) && Number.isFinite(py)
    && px >= 0 && py >= 0 && px < width && py < height && px <= 32767 && py <= 32767;
  const walkable = (px, py) => {
    if (!valid(px, py) || !Number.isInteger(px) || !Number.isInteger(py)) return false;
    try { const value = altitude.getCellType(px, py); return Number.isInteger(value) && (value & type) !== 0; }
    catch { return false; }
  };
  // Supercover on the center-based GAT grid, including both cardinal cells
  // when crossing a diagonal boundary. Fractional display origins cannot
  // create a shortcut through a blocked corner.
  const legalSegment = (ax, ay, bx, by) => {
    if (!valid(ax, ay) || !valid(bx, by)) return false;
    let previousX = Math.round(ax), previousY = Math.round(ay);
    if (!walkable(previousX, previousY)) return false;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 8));
    for (let i = 1; i <= steps; i++) {
      const nextX = Math.round(ax + (bx - ax) * i / steps), nextY = Math.round(ay + (by - ay) * i / steps);
      if (!walkable(nextX, nextY) || (nextX !== previousX && nextY !== previousY
        && (!walkable(nextX, previousY) || !walkable(previousX, nextY)))) return false;
      previousX = nextX; previousY = nextY;
    }
    return true;
  };
  if (!valid(x, y) || !Number.isInteger(targetX) || !Number.isInteger(targetY) || !walkable(targetX, targetY)) return null;
  const segments = [];
  let originX = Math.round(x), originY = Math.round(y), startX = x, startY = y, nextTick = now;
  const append = (ax, ay, bx, by, end) => {
    if (!legalSegment(ax, ay, bx, by) || !Number.isFinite(end) || end <= nextTick || segments.length >= 32) return false;
    segments.push({ x0: ax, y0: ay, x1: bx, y1: by, start: nextTick, end });
    nextTick = end; return true;
  };
  if (walk?.total) {
    const path = walk.path, total = walk.total;
    let index = walk.index;
    if (!path || !Number.isInteger(total) || total < 4 || total > 66 || total % 2 || total > path.length
      || !Number.isInteger(index) || index < 2 || index >= total || index % 2
      || !Number.isFinite(walk.tick) || !Number.isFinite(walk.pos?.[0]) || !Number.isFinite(walk.pos?.[1])) return null;
    let ax = walk.pos[0], ay = walk.pos[1], segmentTick = walk.tick;
    for (; index < total; index += 2) {
      const bx = path[index], by = path[index + 1];
      if (!Number.isInteger(bx) || !Number.isInteger(by) || Math.max(Math.abs(bx - ax), Math.abs(by - ay)) > 1.000001
        || !legalSegment(ax, ay, bx, by)) return null;
      // The server reads speed when a cell starts. A buff or debuff received
      // halfway through it affects the following cell, not its current timer.
      const stepSpeed = index === walk.index && walk._lastroServerStepIndex === index
        && Number.isFinite(walk._lastroServerStepSpeed) && walk._lastroServerStepSpeed > 0
        && walk._lastroNormalSpeed === undefined ? walk._lastroServerStepSpeed : speed;
      const duration = lastroWalkStepDuration(bx - ax, by - ay, stepSpeed);
      const joined = index === walk.index && walk._lastroJoinIndex === index && walk._lastroJoinSpeed === speed
        && Number.isFinite(walk._lastroJoinEndTick) && walk._lastroJoinEndTick > segmentTick;
      const end = joined ? walk._lastroJoinEndTick : segmentTick + Math.max(duration, 1);
      if (now < end) {
        const progress = Math.min(Math.max((now - segmentTick) / (end - segmentTick), 0), 1);
        startX = ax + (bx - ax) * progress; startY = ay + (by - ay) * progress;
        originX = bx; originY = by;
        if (!append(startX, startY, bx, by, end)) return null;
        break;
      }
      originX = bx; originY = by; startX = bx; startY = by;
      // A target change exactly at a cell boundary starts there immediately.
      if (now === end) break;
      ax = bx; ay = by; segmentTick = end;
    }
  } else if (x !== originX || y !== originY) {
    const duration = lastroWalkStepDuration(originX - x, originY - y, speed);
    if (!append(x, y, originX, originY, now + duration)) return null;
  }
  if (!walkable(originX, originY)) return null;
  if (originX !== targetX || originY !== targetY) {
    const out = new Int16Array((33 - segments.length) * 2);
    let count;
    try { count = findPath(originX, originY, targetX, targetY, out, altitude); } catch { return null; }
    if (!Number.isInteger(count) || count < 2 || count * 2 > out.length
      || out[0] !== originX || out[1] !== originY || out[(count - 1) * 2] !== targetX || out[(count - 1) * 2 + 1] !== targetY) return null;
    for (let i = 2; i < count * 2; i += 2) {
      const ax = out[i - 2], ay = out[i - 1], bx = out[i], by = out[i + 1];
      const delta = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
      if (delta !== 1 || !append(ax, ay, bx, by, nextTick + lastroWalkStepDuration(bx - ax, by - ay, speed))) return null;
    }
  }
  if (!segments.length) return null;
  let totalDistance = 0;
  for (const segment of segments) totalDistance += Math.hypot(segment.x1 - segment.x0, segment.y1 - segment.y0);
  return { segments, startTick: now, endTick: nextTick, startX, startY, endX: targetX, endY: targetY, totalDistance };
}

export function sampleLastroWalkPrediction(prediction, now) {
  if (!prediction || !Array.isArray(prediction.segments) || !prediction.segments.length
    || prediction.segments.length > 32 || !Number.isFinite(now)) return null;
  let distance = 0, last;
  for (const segment of prediction.segments) {
    if (!segment || ![segment.x0, segment.y0, segment.x1, segment.y1, segment.start, segment.end].every(Number.isFinite)
      || segment.end <= segment.start) return null;
    const dx = segment.x1 - segment.x0, dy = segment.y1 - segment.y0;
    const length = Math.hypot(dx, dy);
    if (now < segment.end) {
      const progress = Math.min(Math.max((now - segment.start) / (segment.end - segment.start), 0), 1);
      return { x: segment.x0 + dx * progress, y: segment.y0 + dy * progress, finished: false, distance: distance + length * progress, dx, dy };
    }
    distance += length; last = segment;
  }
  return { x: last.x1, y: last.y1, finished: true, distance, dx: 0, dy: 0 };
}
