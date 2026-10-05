// Rendering only: the authoritative entity position and walk state never change.
// Keep the factory self-contained; the runtime embeds its function source.
export function createLastroPositionReconciler({ altitude, findPath }) {
  const position = new Float32Array(3), direction = new Float32Array(2), pathBuffer = new Int16Array(66);
  const EPSILON = 1 / 1024, OMEGA = 0.024, LOCAL_RANGE = 8, MICRO_RANGE = 1 / 8;
  let initialized = false, mode = '', lastTime = 0, lastTarget = null;
  let offsetX = 0, offsetY = 0, velocityX = 0, velocityY = 0;
  let directionX = 0, directionY = 0, centers = [], centerIndex = 0;
  let routeError = 0, routeVelocity = 0, deadline = 0;
  let nativeRoute = null, nativeError = 0, nativeVelocity = 0;
  let nativeStopBacktrack = false, nativeStopHold = false, nativeMicroHold = false, nativeLocalFit = false, localFit = false;
  let lastSpeed = 150;
  let nativeHintPath = null, nativeHintTotal = 0;
  let nativeHintSnapshot = [], nativeRevision = 0;
  let nativeCursorId = 0, nativeAuthorityProgress = NaN, nativeDisplayProgress = NaN;
  let approvedContinuation = null;
  let lastHardSetReason = 'none', stopRejectReason = '';
  const invalidInputReason = (target, now, speed) => !target ? 'invalid-target' : !initialized ? 'uninitialized'
    : !Number.isFinite(now) ? 'invalid-clock' : !Number.isFinite(speed) || speed <= 0 ? 'invalid-speed' : 'clock-regression';
  const readTarget = target => {
    try {
      const x = target?.[0], y = target?.[1], z = target?.[2];
      return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
        && Math.abs(x) <= 32767 && Math.abs(y) <= 32767 && Math.abs(z) <= 1e7 ? [x, y, z] : null;
    } catch { return null; }
  };
  const hardSet = (target, now, reason) => {
    lastHardSetReason = reason;

    if (target && lastTarget && target[0] === lastTarget[0] && target[1] === lastTarget[1]
      && nativeCursorId === nativeRoute?.id) nativeDisplayProgress = nativeAuthorityProgress;
    else { nativeCursorId = 0; nativeAuthorityProgress = nativeDisplayProgress = NaN; }
    mode = ''; centers = []; centerIndex = 0;
    offsetX = offsetY = velocityX = velocityY = directionX = directionY = 0;
    routeError = routeVelocity = 0;
    nativeError = nativeVelocity = 0;
    approvedContinuation = null;
    nativeStopBacktrack = nativeStopHold = nativeMicroHold = nativeLocalFit = localFit = false; direction.fill(0);
    lastTime = Number.isFinite(now) ? now : 0;
    if (target) { position.set(target); lastTarget = target; initialized = true; }
    return position;
  };
  const walkable = (x, y) => {
    const width = altitude?.width, height = altitude?.height, type = altitude?.TYPE?.WALKABLE;
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0
      || !Number.isInteger(type) || type <= 0 || !Number.isInteger(x) || !Number.isInteger(y)
      || x < 0 || y < 0 || x >= width || y >= height || x > 32767 || y > 32767) return false;
    try {
      const value = altitude.getCellType(x, y);
      return Number.isInteger(value) && (value & type) !== 0;
    } catch { return false; }
  };
  const groundHeight = (x, y) => {
    try {
      const value = altitude.getCellHeight(x, y);
      return Number.isFinite(value) && Math.abs(value) <= 1e7 ? value : null;
    } catch { return null; }
  };
  // Traverse rounded GAT cells at their exact half-cell boundaries. Simultaneous
  // diagonal crossings also require both cardinal neighbors, just like walking.
  const safeSegment = (x0, y0, x1, y1) => {
    let x = Math.round(x0), y = Math.round(y0);
    const endX = Math.round(x1), endY = Math.round(y1), dx = x1 - x0, dy = y1 - y0;
    if (!walkable(x, y) || !walkable(endX, endY)) return false;
    const sx = Math.sign(dx), sy = Math.sign(dy);
    let tx = sx ? (x + sx * 0.5 - x0) / dx : Infinity;
    let ty = sy ? (y + sy * 0.5 - y0) / dy : Infinity;
    for (let steps = 0; x !== endX || y !== endY; steps++) {
      if (steps >= 128) return false;
      if (Math.abs(tx - ty) < 1e-8) {
        if (!walkable(x + sx, y) || !walkable(x, y + sy)) return false;
        x += sx; y += sy; tx += 1 / Math.abs(dx); ty += 1 / Math.abs(dy);
      } else if (tx < ty) { x += sx; tx += 1 / Math.abs(dx); }
      else { y += sy; ty += 1 / Math.abs(dy); }
      if (!walkable(x, y)) return false;
    }
    return true;
  };
  const routeDistance = target => {
    let x = position[0], y = position[1], distance = 0;
    for (let index = centerIndex; index < centers.length; index++) {
      const point = centers[index];
      distance += Math.hypot(point[0] - x, point[1] - y); x = point[0]; y = point[1];
    }
    return distance + Math.hypot(target[0] - x, target[1] - y);
  };
  // Bound recovery in path space, not just XY: nearby tiles can sit on opposite
  // sides of a wall, or represent separate visits to the same winding route.
  const stepLimit = (dt, speed) => Math.min(0.45, Math.max(0, dt) * 2 / speed);
  const validRoute = (target, allowance = 0) => {
    if (localFit && routeDistance(target) > LOCAL_RANGE + allowance + EPSILON) return false;
    let x = position[0], y = position[1];
    for (let index = centerIndex; index < centers.length; index++) {
      const point = centers[index];
      if (Math.hypot(point[0] - target[0], point[1] - target[1]) >= (localFit ? LOCAL_RANGE + allowance + EPSILON : 6)
        || !safeSegment(x, y, point[0], point[1])) return false;
      x = point[0]; y = point[1];
    }
    return safeSegment(x, y, target[0], target[1]);
  };
  const buildDetour = (target, now, speed, allowance = 0) => {
    const x0 = Math.round(position[0]), y0 = Math.round(position[1]);
    const x1 = Math.round(target[0]), y1 = Math.round(target[1]);
    let count;
    try { count = findPath(x0, y0, x1, y1, pathBuffer, altitude); } catch { return false; }
    if (!Number.isInteger(count) || count < 2 || count > pathBuffer.length / 2
      || pathBuffer[0] !== x0 || pathBuffer[1] !== y0
      || pathBuffer[(count - 1) * 2] !== x1 || pathBuffer[(count - 1) * 2 + 1] !== y1) return false;
    centers = []; centerIndex = 0;
    for (let index = 0; index < count; index++) {
      const x = pathBuffer[index * 2], y = pathBuffer[index * 2 + 1];
      if (!walkable(x, y)) return false;
      if (index) {
        const px = pathBuffer[(index - 1) * 2], py = pathBuffer[(index - 1) * 2 + 1];
        if (Math.max(Math.abs(x - px), Math.abs(y - py)) !== 1
          || !safeSegment(px, py, x, y)) return false;
      }
      if (index < count - 1 && (index || Math.hypot(x - position[0], y - position[1]) > EPSILON)) centers.push([x, y]);
    }
    if (!validRoute(target, allowance)) return false;
    const distance = routeDistance(target);
    if (localFit && distance > LOCAL_RANGE + allowance + EPSILON) return false;
    if (!localFit && distance > (3 / speed + 0.006) * 600) return false;
    // A slow/controlled walk still has the same legal local corridor. Its
    // recovery time follows the walk speed instead of rejecting that corridor
    // for failing an unrelated fixed six-hundred-millisecond deadline.
    const nominalDuration = Math.min(600, Math.max(180, distance * speed * 0.65 + 120));
    mode = 'detour'; deadline = now + Math.max(nominalDuration, localFit ? distance * speed / 2 : 0);
    return true;
  };
  const spring = (value, velocity, dt, stopAtTarget = false) => {
    const coefficient = velocity + OMEGA * value, decay = Math.exp(-OMEGA * dt);
    const next = [(value + coefficient * dt) * decay, (velocity - OMEGA * coefficient * dt) * decay];
    // A late STOP can leave velocity from the preceding moving correction.
    // Settle at its real target rather than crossing it and rebounding; an axis
    // already at the stopped target must not drift away on that old velocity.
    return stopAtTarget && value * next[0] <= 0 ? [0, 0] : next;
  };
  const projectSegment = (route, x, y, index, extend = false) => {
    const a = route.points[index], b = route.points[index + 1];
    if (!a || !b) return null;
    const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
    if (!length) return null;
    const alpha = Math.max(extend && !index ? -6 / length : 0,
      Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (length * length)));
    return {
      distance: Math.hypot(x - a[0] - dx * alpha, y - a[1] - dy * alpha), index,
      progress: route.lengths[index] + alpha * length, dx: dx / length, dy: dy / length,
    };
  };
  const project = (route, x, y, preferred = NaN) => {
    let best = null;
    for (let index = 0; index < route.points.length - 1; index++) {
      const candidate = projectSegment(route, x, y, index, true);
      if (!candidate) continue;
      if (!best || candidate.distance < best.distance - 1e-7
        || Math.abs(candidate.distance - best.distance) <= 1e-7 && Number.isFinite(preferred)
          && Math.abs(candidate.progress - preferred) < Math.abs(best.progress - preferred) - 1e-7) best = candidate;
    }
    return best && best.distance <= EPSILON * 4 ? best : null;
  };
  const cursorProgress = (route, display = false) => {
    const progress = display ? nativeDisplayProgress : nativeAuthorityProgress;
    if (nativeCursorId === route.id) return progress;
    if (nativeCursorId === route.previousId && Number.isFinite(route.prefixFrom)
      && progress >= route.prefixFrom - EPSILON && progress <= route.prefixUntil + EPSILON) {
      return route.prefixOffset + (progress - route.prefixFrom) * route.prefixScale;
    }
    return NaN;
  };
  const saveCursor = (route, authority, display = authority) => {
    nativeCursorId = route.id; nativeAuthorityProgress = authority; nativeDisplayProgress = display;
  };
  const authorityProjection = (route, target, hint) => {
    const index = hint?.index, total = hint?.total;
    if (hint?.path === nativeHintPath && total === nativeHintTotal && total >= 4) {
      if (!Number.isInteger(index) || index < 2 || index > total || index % 2) return null;
      // The native index identifies a visit to a tile, rather than just its XY.
      // Two equal coordinates on different route branches must stay distinct.
      const start = route.sourceNodes[Math.min(index / 2 - 1, route.sourceNodes.length - 1)];
      const end = route.sourceNodes[Math.min(index / 2, route.sourceNodes.length - 1)];
      if (start === end) {
        const point = route.points[end];
        if (Math.hypot(target[0] - point[0], target[1] - point[1]) > EPSILON * 4) return null;
        const tangent = sampleRoute(route, route.lengths[end]);
        return { distance: 0, index: Math.min(end, route.points.length - 2), progress: route.lengths[end], dx: tangent.dx, dy: tangent.dy };
      }
      const result = projectSegment(route, target[0], target[1], start);
      return result && result.distance <= EPSILON * 4 ? result : null;
    }
    // STOP clears walk.total. Its last cursor still identifies the current visit
    // when an endpoint shares coordinates with an older, retained prefix.
    const preferred = cursorProgress(route);
    return project(route, target[0], target[1], Number.isFinite(preferred) ? preferred : route.lengths[route.sourceNodes[0]]);
  };
  const sampleRoute = (route, progress) => {
    const bounded = Math.min(route.total, progress);
    let index = 0;
    while (index < route.points.length - 2 && route.lengths[index + 1] <= bounded) index++;
    const a = route.points[index], b = route.points[index + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
    const alpha = (bounded - route.lengths[index]) / length;
    return { x: a[0] + dx * alpha, y: a[1] + dy * alpha, dx: dx / length, dy: dy / length, progress: bounded };
  };
  const nativePath = (hint, force = false) => {
    const path = hint?.path, total = hint?.total;
    // A STOP has no active walk array. Keep the last approved corridor so its
    // remaining signed progress error still settles along the same tile path.
    if (!path || !Number.isInteger(total) || total < 4 || total > path.length || total > 4096 || total % 2) {
      if (!nativeRoute) return null;
      for (let index = 0; force && index < nativeRoute.points.length; index++) {
        const point = nativeRoute.points[index], previous = nativeRoute.points[index - 1];
        if (!walkable(Math.round(point[0]), Math.round(point[1]))
          || previous && !safeSegment(previous[0], previous[1], point[0], point[1])) return null;
      }
      return nativeRoute;
    }
    // Native walk.path is mutated only when a MOVE replaces the route. correct
    // snapshots those packets, including equal-position changes in destination.
    if (!force && path === nativeHintPath && total === nativeHintTotal && nativeRoute) return nativeRoute;
    let points = [];
    const sourceNodes = [], snapshot = [];
    for (let index = 0; index < total; index += 2) {
      const x = path[index], y = path[index + 1];
      if (!Number.isFinite(x) || !Number.isFinite(y) || !walkable(Math.round(x), Math.round(y))) return null;
      const previous = points[points.length - 1];
      if (previous && (previous[0] !== x || previous[1] !== y)) {
        if (Math.max(Math.abs(x - previous[0]), Math.abs(y - previous[1])) > 1.001
          || !safeSegment(previous[0], previous[1], x, y)) return null;
      }
      if (!previous || previous[0] !== x || previous[1] !== y) points.push([x, y]);
      sourceNodes.push(points.length - 1); snapshot.push(x, y);
    }
    if (points.length < 2) return null;
    const changed = snapshot.length !== nativeHintSnapshot.length
      || snapshot.some((value, index) => value !== nativeHintSnapshot[index]);
    if (!changed && nativeRoute) { nativeHintPath = path; nativeHintTotal = total; return nativeRoute; }
    const previousId = nativeRoute?.id;
    let prefixFrom = NaN, prefixUntil = NaN, prefixCount = 0, prefixScale = 1, prefixOffset = 0;
    let inheritedDebt = 0, inheritedAdvance = 0;
    if (nativeRoute) {
      const origin = project(nativeRoute, points[0][0], points[0][1], cursorProgress(nativeRoute));
      const display = nativeStopBacktrack && project(nativeRoute, position[0], position[1], cursorProgress(nativeRoute, true));
      const stopped = display && lastTarget && project(nativeRoute, lastTarget[0], lastTarget[1], cursorProgress(nativeRoute));
      const sourceLengths = [0];
      for (let index = 1; display && index < points.length; index++) {
        sourceLengths.push(sourceLengths[index - 1] + Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]));
      }
      const sourceDisplay = display && origin && project({ points, lengths: sourceLengths }, position[0], position[1], display.progress - origin.progress);
      const bridge = display && origin && stopped && nativeCursorId === nativeRoute.id
        && origin.progress >= stopped.progress - EPSILON && origin.progress <= display.progress + EPSILON
        && display.progress > stopped.progress + EPSILON
        && display.progress - stopped.progress + origin.progress - stopped.progress <= 8 + EPSILON
        && (!sourceDisplay || sourceDisplay.progress < -EPSILON)
        && safeProgress(nativeRoute, stopped.progress, display.progress);
      const firstX = points[1][0] - points[0][0], firstY = points[1][1] - points[0][1];
      const reversed = origin && firstX * origin.dx + firstY * origin.dy < -1e-7
        && Math.abs(firstX * origin.dy - firstY * origin.dx) < 1e-7;
      const debtAuthority = approvedContinuation?.recoveryOnly && approvedContinuation.routeId === nativeRoute.id
        && lastTarget && project(nativeRoute, lastTarget[0], lastTarget[1], nativeAuthorityProgress);
      const oldDebtDisplay = debtAuthority && project(nativeRoute, position[0], position[1], nativeDisplayProgress);
      let uniqueOrigin = true;
      for (let node = 0; debtAuthority && origin && node < nativeRoute.points.length - 1; node++) {
        const candidate = projectSegment(nativeRoute, points[0][0], points[0][1], node);
        if (candidate?.distance <= EPSILON * 4 && Math.abs(candidate.progress - origin.progress) > EPSILON * 4) uniqueOrigin = false;
      }
      const debtDisplay = debtAuthority && origin
        && uniqueOrigin && oldDebtDisplay && origin.progress >= oldDebtDisplay.progress - EPSILON * 4
        && origin.progress <= nativeRoute.lengths[debtAuthority.index + 1] + EPSILON * 4
        && oldDebtDisplay;
      // A U-turn revisits the same tiles in the opposite order. Concatenating
      // its old prefix would create two overlapping branches with wrong phase.
      if (bridge) {
        // A new approved turn can leave the display on the far side of its
        // STOP. Walk that known old suffix backwards to the STOP center before
        // entering the new route; a direct blend would cut the inside wall.
        const end = display.index + 1;
        const prefix = nativeRoute.points.slice(stopped.progress < 0 ? 0 : stopped.index + 1, end + 1).reverse();
        if (stopped.progress < 0) {
          const first = nativeRoute.points[0], next = nativeRoute.points[1];
          let x = first[0], y = first[1];
          const stepX = Math.sign(next[0] - x), stepY = Math.sign(next[1] - y);
          for (let count = 0; Math.hypot(x - lastTarget[0], y - lastTarget[1]) > EPSILON && count < 8; count++) {
            x -= stepX; y -= stepY; prefix.push([x, y]);
          }
        } else {
          const tail = prefix[prefix.length - 1];
          if (!tail || Math.hypot(tail[0] - lastTarget[0], tail[1] - lastTarget[1]) > EPSILON) prefix.push([lastTarget[0], lastTarget[1]]);
        }
        // A confirmed origin can advance within the old STOP/display corridor.
        // Keep that STOP visit, then retrace its approved centers to the origin.
        if (stopped.progress < 0) {
          const first = nativeRoute.points[0], next = nativeRoute.points[1], step = Math.hypot(next[0] - first[0], next[1] - first[1]);
          for (let progress = stopped.progress + step; progress < Math.min(0, origin.progress) - EPSILON; progress += step) {
            const point = sampleRoute(nativeRoute, progress); prefix.push([Math.round(point.x), Math.round(point.y)]);
          }
        }
        for (let index = 0; index < nativeRoute.points.length; index++) {
          if (nativeRoute.lengths[index] > stopped.progress + EPSILON && nativeRoute.lengths[index] < origin.progress - EPSILON) prefix.push(nativeRoute.points[index]);
        }
        const tail = prefix[prefix.length - 1];
        if (tail && tail[0] === points[0][0] && tail[1] === points[0][1]) prefix.pop();
        prefixFrom = stopped.progress; prefixUntil = nativeRoute.lengths[end];
        prefixScale = -1; prefixOffset = prefixUntil - prefixFrom; prefixCount = prefix.length;
        points = prefix.concat(points);
      } else if (origin && origin.progress >= 0 && !reversed) {
        // A new MOVE often replaces its path with a later origin on the old
        // route. Preserve up to eight cells of its walked prefix for a display
        // that has not reached an earlier corner yet.
        let start = 0;
        if (debtDisplay && debtDisplay.progress <= origin.progress + EPSILON) {
          start = Math.max(0, debtDisplay.index); inheritedDebt = approvedContinuation.debt;
          inheritedAdvance = Math.max(0, origin.progress - nativeAuthorityProgress);
        } else while (start < origin.index && nativeRoute.lengths[start + 1] < origin.progress - 8) start++;
        const prefix = nativeRoute.points.slice(start, origin.index + 1);
        const tail = prefix[prefix.length - 1];
        if (tail && tail[0] === points[0][0] && tail[1] === points[0][1]) prefix.pop();
        prefixFrom = nativeRoute.lengths[start]; prefixUntil = origin.progress; prefixCount = prefix.length;
        points = prefix.concat(points);
      }
    }
    const lengths = [0];
    for (let index = 1; index < points.length; index++) {
      if (!safeSegment(points[index - 1][0], points[index - 1][1], points[index][0], points[index][1])) return null;
      lengths.push(lengths[index - 1] + Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]));
    }
    nativeHintPath = path; nativeHintTotal = total;
    nativeHintSnapshot = snapshot; nativeRevision++;
    return nativeRoute = {
      points, lengths, total: lengths[lengths.length - 1], id: nativeRevision,
      previousId, prefixFrom, prefixUntil, prefixScale, prefixOffset, inheritedDebt, inheritedAdvance,
      sourceNodes: sourceNodes.map(index => index + prefixCount),
    };
  };
  const safeProgress = (route, from, to) => {
    const minimum = Math.min(from, to), maximum = Math.min(route.total, Math.max(from, to));
    for (let index = 0; index < route.points.length - 1; index++) {
      const start = route.lengths[index], end = route.lengths[index + 1];
      if (minimum > end || maximum < start && index) continue;
      const a = route.points[index], b = route.points[index + 1], length = end - start;
      const low = (Math.max(index ? start : minimum, minimum) - start) / length;
      const high = (Math.min(end, maximum) - start) / length;
      if (!safeSegment(a[0] + (b[0] - a[0]) * low, a[1] + (b[1] - a[1]) * low,
        a[0] + (b[0] - a[0]) * high, a[1] + (b[1] - a[1]) * high)) return false;
    }
    return true;
  };
  const cancelApprovedMove = () => {
    if (!approvedContinuation || approvedContinuation.recoveryOnly) return false;
    approvedContinuation.recoveryOnly = true;
    approvedContinuation.debt = Math.max(0, nativeAuthorityProgress - nativeDisplayProgress);
    return true;
  };
  const emptyWalkPath = path => {
    if (!path || !Number.isInteger(path.length) || path.length < 0 || path.length > 4096) return false;
    for (let index = 0; index < path.length; index++) if (path[index] !== 0) return false;
    return true;
  };
  // Only the packet caller can establish a reliably matched initial MOVE ACK.
  // Recheck its entire short corridor and the prediction's original visit here;
  // ordinary corrections never acquire this narrowly scoped forward debt.
  const continueApprovedMove = (input, now, speed, hint, proof) => {
    const target = readTarget(input), path = proof?.path, total = proof?.total, index = proof?.index;
    if (!target || !initialized || !Number.isFinite(now) || now < lastTime || !Number.isFinite(speed) || speed <= 0
      || nativeStopHold || nativeMicroHold || !path || !Number.isInteger(total) || total < 4 || total > 66
      || total > path.length || total % 2 || !Number.isInteger(index) || index < 2 || index > total || index % 2
      || !hint || !(hint.total === total && hint.path === path && hint.index === index
        || hint.total === 0 && (hint.path === path || emptyWalkPath(hint.path)) && index === total)) return false;
    const points = [], lengths = [0], snapshot = [];
    for (let offset = 0; offset < total; offset += 2) {
      const x = path[offset], y = path[offset + 1], previous = points[points.length - 1];
      if (!Number.isInteger(x) || !Number.isInteger(y) || !walkable(x, y)
        || previous && (Math.max(Math.abs(x - previous[0]), Math.abs(y - previous[1])) !== 1
          || !safeSegment(previous[0], previous[1], x, y))) return false;
      if (previous) lengths.push(lengths[lengths.length - 1] + Math.hypot(x - previous[0], y - previous[1]));
      points.push([x, y]); snapshot.push(x, y);
    }
    const route = { points, lengths, total: lengths[lengths.length - 1], sourceNodes: points.map((_, node) => node) };
    const display = project(route, position[0], position[1], 0);
    const authority = projectSegment(route, target[0], target[1], index === total ? points.length - 2 : index / 2 - 1);
    const end = points[points.length - 1];
    if (!display || display.progress < -EPSILON || display.progress > 2 + EPSILON * 4
      || !authority || authority.distance > EPSILON * 4 || authority.progress <= display.progress + EPSILON
      || index === total && Math.hypot(target[0] - end[0], target[1] - end[1]) > EPSILON * 4) return false;
    for (let node = 0; node < points.length - 1; node++) {
      const candidate = projectSegment(route, position[0], position[1], node);
      if (candidate?.distance <= EPSILON * 4 && Math.abs(candidate.progress - display.progress) > EPSILON * 4) return false;
    }
    const displayHeight = groundHeight(position[0], position[1]), targetHeight = groundHeight(target[0], target[1]);
    if (displayHeight === null || targetHeight === null
      || Math.abs(position[2] - displayHeight - target[2] + targetHeight) > EPSILON
      || !safeProgress(route, display.progress, authority.progress)) return false;
    route.id = ++nativeRevision;
    nativeRoute = route; nativeHintPath = path; nativeHintTotal = total; nativeHintSnapshot = snapshot;
    approvedContinuation = { routeId: route.id, path, total, speed, currentPath: hint.path, arrived: hint.total === 0,
      recoveryOnly: false, debt: authority.progress - display.progress, maxDebt: route.total - display.progress };
    mode = 'native'; localFit = nativeLocalFit = true;
    nativeStopBacktrack = nativeStopHold = nativeMicroHold = false;
    nativeError = display.progress - authority.progress; nativeVelocity = 0;
    velocityX = velocityY = routeError = routeVelocity = 0; centers = []; centerIndex = 0;
    saveCursor(route, authority.progress, display.progress);
    const segment = sampleRoute(route, display.progress);
    direction[0] = segment.dx; direction[1] = segment.dy;
    lastTime = now; lastTarget = target; lastSpeed = speed;

    return true;
  };
  const validContinuation = (target, speed, hint) => {
    const proof = approvedContinuation, route = nativeRoute;
    if (!proof || route?.id !== proof.routeId || nativeCursorId !== route.id
      || proof.total !== nativeHintTotal || proof.path !== nativeHintPath) return false;
    if (speed !== proof.speed) cancelApprovedMove();
    for (let offset = 0; offset < proof.total; offset++) if (proof.path[offset] !== nativeHintSnapshot[offset]) return false;
    if (hint?.path === proof.path && hint.total === proof.total && !proof.arrived) return true;
    if (hint?.total !== 0 || !(hint.path === proof.currentPath || !proof.arrived && emptyWalkPath(hint.path))) return false;
    const end = route.points[route.points.length - 1], authority = authorityProjection(route, target, hint);
    if (!authority || authority.progress < nativeDisplayProgress - EPSILON
      || !(Math.hypot(target[0] - end[0], target[1] - end[1]) <= EPSILON * 4
        || proof.recoveryOnly && authority.progress <= nativeAuthorityProgress + EPSILON)) return false;
    proof.arrived = true; proof.currentPath = hint.path;
    return true;
  };
  const turnCenter = (target, dx, dy, hint) => {
    if (!directionX && !directionY || Math.abs(directionX * dy - directionY * dx) <= 1e-7) return null;
    // The native walk index is an offset into its flat (x,y) path. Its previous
    // node is the actual approved turn, including diagonal/cardinal transitions.
    const index = hint?.index, path = hint?.path, total = hint?.total;
    if (Number.isInteger(index) && index >= 2 && index < total && path?.length >= total) {
      const x = path[index - 2], y = path[index - 1];
      if (Number.isInteger(x) && Number.isInteger(y) && Math.hypot(x - lastTarget[0], y - lastTarget[1]) <= 1.5
        && Math.hypot(x - target[0], y - target[1]) <= 1.5) return [x, y];
    }
    // A frame can straddle a center. Infer only an exact tile-center intersection
    // with one of RO's eight permitted next directions, never an arbitrary bend.
    let best = null, distance = Infinity;
    for (const [nx, ny] of [[0, 1], [-1, 0], [0, -1], [1, 0], [-1, 1], [-1, -1], [1, -1], [1, 1]]) {
      const determinant = directionX * ny - directionY * nx;
      if (!determinant) continue;
      const a = (dx * ny - dy * nx) / determinant, b = (directionX * dy - directionY * dx) / determinant;
      if (a < -1e-5 || b < -1e-5) continue;
      const x = lastTarget[0] + directionX * a, y = lastTarget[1] + directionY * a;
      if (Math.abs(x - Math.round(x)) > 1e-5 || Math.abs(y - Math.round(y)) > 1e-5) continue;
      const length = a * Math.hypot(directionX, directionY) + b * Math.hypot(nx, ny);
      if (length < distance && length < 2) { best = [Math.round(x), Math.round(y)]; distance = length; }
    }
    return best;
  };
  const setHeight = target => {
    const displayHeight = groundHeight(position[0], position[1]), targetHeight = groundHeight(target[0], target[1]);
    if (displayHeight === null || targetHeight === null) return false;
    position[2] = displayHeight + target[2] - targetHeight;
    return Number.isFinite(position[2]);
  };
  const reset = (target, now, reason = 'explicit') => {

    nativeRoute = nativeHintPath = null; nativeHintTotal = 0;
    nativeHintSnapshot = []; nativeRevision++;
    nativeCursorId = 0; nativeAuthorityProgress = nativeDisplayProgress = NaN;
    return hardSet(readTarget(target), now, `reset:${typeof reason === 'string' && /^[a-z][a-z-]{0,63}$/.test(reason) ? reason : 'external'}`);
  };
  const smallApprovedStop = (route, target, authority, display) => {
    stopRejectReason = !route ? 'approved-route-invalid' : !authority ? 'authority-off-route' : !display ? 'display-off-route'
      : nativeCursorId !== route?.id ? 'cursor-route-mismatch'
        : !Number.isInteger(target[0]) || !Number.isInteger(target[1]) ? 'target-not-grid-center'
          : Math.round(position[0]) !== target[0] || Math.round(position[1]) !== target[1] ? 'different-cell'
            : Math.abs(position[0] - target[0]) >= 0.5 || Math.abs(position[1] - target[1]) >= 0.5 ? 'cell-boundary'
              : display.progress <= authority.progress + EPSILON ? 'display-not-ahead'
                : display.progress - authority.progress > Math.SQRT1_2 ? 'phase-too-large'
                  : !safeProgress(route, authority.progress, display.progress) ? 'unsafe-corridor' : '';
    if (stopRejectReason) return false;
    const displayHeight = groundHeight(position[0], position[1]), targetHeight = groundHeight(target[0], target[1]);
    stopRejectReason = displayHeight === null || targetHeight === null ? 'height-unavailable'
      : !(Math.abs(position[2] - displayHeight - target[2] + targetHeight) <= EPSILON) ? 'elevation-mismatch' : '';
    return !stopRejectReason;
  };
  const legalRecoveryOrigin = (route, target, authority) => {
    if (!authority) return false;
    if (authority.progress >= 0) return true;
    const first = route.points[0], next = route.points[1];
    // Only a real integer STOP can extend the first approved grid direction
    // backwards. The full extension is still checked against current GAT cells.
    return authority.progress >= -6 - EPSILON && Number.isInteger(target[0]) && Number.isInteger(target[1])
      && first.every(Number.isInteger) && next.every(Number.isInteger)
      && Math.max(Math.abs(next[0] - first[0]), Math.abs(next[1] - first[1])) === 1;
  };
  const sameHeldStop = (target, hint) => (nativeStopHold || nativeMicroHold) && hint?.total === 0
    && target.every((value, index) => value === lastTarget[index]);
  const sameCellProof = (target, hint, maximum) => {
    if (!target || !initialized || !nativeRoute || nativeCursorId !== nativeRoute.id
      || !nativeHintPath || nativeHintTotal < 4 || hint?.total !== 0
      || !Number.isInteger(target[0]) || !Number.isInteger(target[1])
      || Math.round(position[0]) !== target[0] || Math.round(position[1]) !== target[1]
      || Math.hypot(position[0] - target[0], position[1] - target[1]) > maximum + 1e-6
      || !safeSegment(position[0], position[1], target[0], target[1])) return null;
    const displayHeight = groundHeight(position[0], position[1]), targetHeight = groundHeight(target[0], target[1]);
    if (displayHeight === null || targetHeight === null
      || Math.abs(position[2] - displayHeight - target[2] + targetHeight) > EPSILON) return null;
    const authority = authorityProjection(nativeRoute, target, hint);
    return authority && legalRecoveryOrigin(nativeRoute, target, authority) ? authority : null;
  };
  const stableMicroVelocity = speed => (mode === '' || mode === 'native' || mode === 'direct')
    && (mode === 'native' ? Math.abs(nativeVelocity) : Math.hypot(velocityX, velocityY)) <= Math.min(0.0015, 0.25 / speed);
  // This query never changes a cursor, hold, clock or coordinate. Its wider
  // same-cell allowance applies only to an existing skill-specific hold.
  const canContinueFromSameCell = (input, hint, maxOffset = MICRO_RANGE) => {
    const target = readTarget(input);
    if (!target || !lastTarget || !target.every((value, index) => value === lastTarget[index])) return false;
    if (nativeStopHold && sameHeldStop(target, hint)) {
      const authority = sameCellProof(target, hint, Math.SQRT1_2);
      const display = authority && project(nativeRoute, position[0], position[1], cursorProgress(nativeRoute, true));
      return !!(display && Math.abs(position[0] - target[0]) < 0.5 && Math.abs(position[1] - target[1]) < 0.5
        && display.progress > authority.progress + EPSILON
        && display.progress - authority.progress <= Math.SQRT1_2
        && safeProgress(nativeRoute, authority.progress, display.progress));
    }
    if (!Number.isFinite(maxOffset) || maxOffset <= 0 || nativeStopBacktrack && !nativeMicroHold
      || !stableMicroVelocity(lastSpeed)) return false;
    return !!sameCellProof(target, hint, Math.min(MICRO_RANGE, maxOffset));
  };
  // Only an ordinary STOP/stable-arrival caller may request this narrow render
  // tolerance. Hit/control callers release it; authority and callbacks never
  // inherit or change these fractional display coordinates.
  const holdSmallStop = (input, now, speed, hint) => {
    const target = readTarget(input);
    if (!target || !Number.isFinite(now) || now < lastTime || !Number.isFinite(speed) || speed <= 0
      || nativeStopHold || !stableMicroVelocity(speed)) return false;
    const authority = sameCellProof(target, hint, MICRO_RANGE);
    if (!authority || Math.hypot(position[0] - target[0], position[1] - target[1]) <= EPSILON) return false;
    if (nativeMicroHold && sameHeldStop(target, hint)) return true;
    const display = project(nativeRoute, position[0], position[1], cursorProgress(nativeRoute, true));
    approvedContinuation = null;
    nativeStopBacktrack = false; nativeMicroHold = true; nativeLocalFit = localFit = true;
    mode = 'native'; nativeError = display ? display.progress - authority.progress : 0; nativeVelocity = 0;
    offsetX = position[0] - target[0]; offsetY = position[1] - target[1];
    velocityX = velocityY = routeError = routeVelocity = 0; centers = []; centerIndex = 0; direction.fill(0);
    saveCursor(nativeRoute, authority.progress, display?.progress ?? authority.progress);
    lastTarget = target; lastTime = now; lastSpeed = speed;
    return true;
  };
  const holdAtStop = (input, now, speed, hint) => {

    const target = readTarget(input);
    const rejected = !target ? 'invalid-target' : !initialized ? 'uninitialized'
      : !Number.isFinite(now) ? 'invalid-clock' : now < lastTime ? 'clock-regression'
        : !Number.isFinite(speed) || speed <= 0 ? 'invalid-speed' : hint?.total !== 0 ? 'not-stop'
          : !nativeHintPath || nativeHintTotal < 4 || !nativeRoute ? 'no-approved-route'
            : nativeCursorId !== nativeRoute.id ? 'cursor-route-mismatch' : '';
    if (rejected) {  return false; }
    const route = nativePath(hint, true), authority = route && authorityProjection(route, target, hint);
    const display = route && project(route, position[0], position[1], cursorProgress(route, true));
    if (!smallApprovedStop(route, target, authority, display)) {
       return false;
    }
    approvedContinuation = null;
    mode = 'native'; nativeStopHold = true; nativeStopBacktrack = nativeMicroHold = false;
    nativeLocalFit = localFit = true;
    nativeError = display.progress - authority.progress; nativeVelocity = 0;
    offsetX = offsetY = velocityX = velocityY = routeError = routeVelocity = 0;
    centers = []; centerIndex = 0; direction.fill(0);
    saveCursor(route, authority.progress, display.progress);
    lastTarget = target; lastTime = now; lastSpeed = speed;

    return true;
  };
  const releaseStopHold = now => {
    cancelApprovedMove();
    if (!nativeStopHold && !nativeMicroHold) return false;


    const wasMicro = nativeMicroHold;
    nativeStopHold = nativeMicroHold = false;
    if (Number.isFinite(now) && now >= lastTime) lastTime = now;
    if (wasMicro) {
      // A tolerated XY may be slightly lateral to the retained route. Release
      // through its checked continuous link, rather than forcing a native
      // display projection or entering the skill STOP's reverse bridge state.
      mode = 'direct'; nativeStopBacktrack = nativeLocalFit = false;
      offsetX = position[0] - lastTarget[0]; offsetY = position[1] - lastTarget[1];
      velocityX = velocityY = routeError = routeVelocity = 0; centers = []; centerIndex = 0; direction.fill(0);
      return true;
    }
    if (nativeRoute && nativeCursorId === nativeRoute.id) {
      nativeStopBacktrack = true;
      const segment = sampleRoute(nativeRoute, nativeDisplayProgress);
      direction[0] = segment.dx; direction[1] = segment.dy;
    }
    return true;
  };
  const correct = (input, now, speed, hint) => {
    cancelApprovedMove();

    const target = readTarget(input);
    if (!target || !initialized || !Number.isFinite(now) || !Number.isFinite(speed) || speed <= 0
      || now < lastTime) return hardSet(target, now, invalidInputReason(target, now, speed));
    lastSpeed = speed;
    if (sameHeldStop(target, hint)) {  return position; }
    releaseStopHold(now, true);
    const revision = nativeRevision, previousDirectionX = direction[0], previousDirectionY = direction[1];
    // Error velocity has different coordinates in the three fitting modes.
    // Carry its world-space projection across a route change so a new lateral
    // link does not restart an already moving correction from zero velocity.
    const leavingNative = mode === 'native';
    const previousVelocityX = leavingNative ? nativeVelocity * previousDirectionX : velocityX;
    const previousVelocityY = leavingNative ? nativeVelocity * previousDirectionY : velocityY;
    const continuingBacktrack = mode === 'native' && nativeStopBacktrack;
    const route = nativePath(hint, true), changed = revision !== nativeRevision;
    const authority = route && authorityProjection(route, target, hint);
    const sameVisit = !authority || nativeCursorId !== route.id
      || Math.abs(authority.progress - nativeAuthorityProgress) <= EPSILON;
    // A repeated packet must not restart either the error spring or its clock.
    if ((!mode || !changed && sameVisit) && !(mode === 'native' && hint?.total === 0 && !nativeStopBacktrack)
      && lastTarget && target[0] === lastTarget[0] && target[1] === lastTarget[1]
      && target[2] === lastTarget[2]) {
      if (!mode && authority) saveCursor(route, authority.progress);

      return position;
    }
    const previousDisplay = route && cursorProgress(route, true);
    const preferredDisplay = Number.isFinite(previousDisplay) ? previousDisplay
      : authority ? authority.progress + (mode === 'native' ? nativeError
        : (position[0] - target[0]) * authority.dx + (position[1] - target[1]) * authority.dy) : NaN;
    const display = route && project(route, position[0], position[1], preferredDisplay);
    const previousAuthority = route && lastTarget && project(route, lastTarget[0], lastTarget[1], cursorProgress(route));
    const backtrackDistance = authority && display ? display.progress - authority.progress : 0;
    // A delayed STOP can retain its walked corridor across the next MOVE. This
    // specific backtrack/bridge state is separate from an ordinary approved
    // local MOVE fit; unproved relocations retain the six-cell reset bound.
    const approvedMove = hint?.path === nativeHintPath && hint?.total === nativeHintTotal && nativeHintTotal >= 4;
    const delayedStop = hint?.total === 0 && !changed && nativeCursorId === route?.id
      && authority && previousAuthority && authority.progress <= previousAuthority.progress + EPSILON
      && (backtrackDistance > EPSILON || continuingBacktrack);
    // An accepted MOVE can inherit the STOP bridge only when its approved
    // corridor contains the display and preceding STOP. Ordinary approved
    // MOVE fitting below never enters this special reverse bridge state.
    const resumedMove = continuingBacktrack && approvedMove && authority && previousAuthority
      && (nativeCursorId === route?.id || nativeCursorId === route?.previousId)
      && authority.progress >= previousAuthority.progress - EPSILON;
    const boundedBacktrack = (delayedStop || resumedMove) && authority && display && previousAuthority
      && legalRecoveryOrigin(route, target, authority) && (backtrackDistance >= 0 || continuingBacktrack) && Math.abs(backtrackDistance) <= 8 + EPSILON
      && safeProgress(route, authority.progress, display.progress);
    const error = Math.hypot(target[0] - position[0], target[1] - position[1]);
    const sameDebtRoute = approvedContinuation && route?.id === approvedContinuation.routeId;
    const inheritedDebt = approvedContinuation && route?.previousId === approvedContinuation.routeId && route.inheritedDebt > 0;
    const recoveryDebt = approvedContinuation && authority && display && (sameDebtRoute || inheritedDebt)
      && display.progress >= -EPSILON && authority.progress >= display.progress - EPSILON
      && authority.progress - display.progress <= approvedContinuation.debt + (approvedContinuation.alignmentDebt || 0)
        + (inheritedDebt ? route.inheritedAdvance : 0) + EPSILON * 4
      && authority.progress - display.progress <= approvedContinuation.maxDebt + EPSILON * 4
      && authority.progress - display.progress - approvedContinuation.debt <= Math.SQRT2 + EPSILON * 4
      && safeProgress(route, display.progress, authority.progress)
      && groundHeight(position[0], position[1]) !== null && groundHeight(target[0], target[1]) !== null
      && Math.abs(position[2] - groundHeight(position[0], position[1]) - target[2] + groundHeight(target[0], target[1])) <= EPSILON;
    if (recoveryDebt) {
      approvedContinuation.routeId = route.id; approvedContinuation.path = nativeHintPath; approvedContinuation.total = nativeHintTotal;
      approvedContinuation.currentPath = hint?.path; approvedContinuation.arrived = hint?.total === 0;
      // Grid source alignment is a proved residual, never extra instantaneous
      // movement. Keep it in the finite ledger and consume it at the same cap.
      approvedContinuation.alignmentDebt = Math.max(0, authority.progress - display.progress - approvedContinuation.debt);
      approvedContinuation.debt = Math.min(approvedContinuation.debt, authority.progress - display.progress);
    } else approvedContinuation = null;
    const sourceProgress = route?.lengths[route.sourceNodes[0]];
    const derivedBridge = !approvedContinuation && boundedBacktrack && resumedMove && changed && route.prefixScale === -1
      && approvedMove && nativeHintTotal <= 66 && display.progress >= -EPSILON
      && sourceProgress - display.progress <= LOCAL_RANGE + EPSILON
      && Math.abs(authority.progress - sourceProgress) <= EPSILON * 4
      && Math.abs(position[2] - groundHeight(position[0], position[1]) - target[2] + groundHeight(target[0], target[1])) <= EPSILON;
    if (derivedBridge) approvedContinuation = { routeId: route.id, path: nativeHintPath, total: nativeHintTotal, speed,
      currentPath: hint.path, arrived: false, recoveryOnly: true, derivedBridge: true,
      debt: authority.progress - display.progress, maxDebt: route.total - display.progress };
    const approvedLocal = authority && (approvedMove || hint?.total === 0 && nativeCursorId === route?.id);
    const approvedFit = approvedLocal && display && legalRecoveryOrigin(route, target, authority)
      && Math.abs(backtrackDistance) <= LOCAL_RANGE + EPSILON
      && safeProgress(route, authority.progress, display.progress);
    // A small lateral discrepancy need not snap the display onto a polyline.
    // Its actual continuous XY remains until a checked short link/detour joins
    // it to the new authority. Exact route visits still use signed arc length.
    const connectedFit = approvedLocal && !display && error <= LOCAL_RANGE + EPSILON;
    const excessiveArc = !recoveryDebt && !derivedBridge && approvedLocal && display && Math.abs(backtrackDistance) > LOCAL_RANGE + EPSILON;
    if (error >= 6 && !boundedBacktrack && !approvedFit && !connectedFit && !recoveryDebt && !derivedBridge || excessiveArc || error <= EPSILON) {
      const result = hardSet(target, now, excessiveArc ? 'correct-route-distance-limit'
        : error >= 6 ? 'correct-distance-limit' : 'correct-deadzone');
      if (authority) saveCursor(route, authority.progress);
      return result;
    }
    if (groundHeight(position[0], position[1]) === null || groundHeight(target[0], target[1]) === null) return hardSet(target, now, 'correct-height-unavailable');
    localFit = !!(approvedFit || connectedFit || recoveryDebt || derivedBridge || error < 6);
    if (authority && display) {
      if (mode !== 'native') nativeVelocity = velocityX * display.dx + velocityY * display.dy;
      else if (changed) nativeVelocity *= previousDirectionX * display.dx + previousDirectionY * display.dy;
      nativeError = display.progress - authority.progress; nativeStopBacktrack = !!boundedBacktrack;
      nativeLocalFit = !!(approvedFit || recoveryDebt || derivedBridge);
      nativeRoute = route; mode = 'native'; centers = []; centerIndex = 0;
      saveCursor(route, authority.progress, display.progress);
      const segment = sampleRoute(route, display.progress);
      direction[0] = segment.dx; direction[1] = segment.dy;
      lastTime = now; lastTarget = target;

      return position;
    }
    nativeStopBacktrack = nativeLocalFit = false;
    if (leavingNative) {
      velocityX = previousVelocityX; velocityY = previousVelocityY;
      offsetX = position[0] - target[0]; offsetY = position[1] - target[1];
    }
    const corner = lastTarget ? turnCenter(target, target[0] - lastTarget[0], target[1] - lastTarget[1], hint) : null;
    if (mode === 'phase' || corner) {
      if (mode !== 'phase') {
        const length = Math.hypot(offsetX, offsetY);
        routeVelocity = length ? (offsetX * velocityX + offsetY * velocityY) / length : 0;
        centers = []; centerIndex = 0;
      }
      const tail = centers[centers.length - 1];
      if (corner && (!tail || tail[0] !== corner[0] || tail[1] !== corner[1])) centers.push(corner);
      if (validRoute(target)) {
        mode = 'phase'; routeError = routeDistance(target);
        lastTime = now; lastTarget = target;

        return position;
      }
    }
    if (!safeSegment(position[0], position[1], target[0], target[1])) {
      if (!buildDetour(target, now, speed)) return hardSet(target, now, 'correct-detour-unavailable');
    } else {
      mode = 'direct'; centers = []; centerIndex = 0;
      offsetX = position[0] - target[0]; offsetY = position[1] - target[1];
      // Offset velocity survives a new correction: packet arrivals do not reset
      // the visible movement to zero velocity at the start of another tween.
    }
    // A lateral fit has no native display cursor yet. Retain the authority
    // visit so a STOP or a later overlapping MOVE cannot select another branch.
    if (authority) saveCursor(route, authority.progress, display?.progress ?? authority.progress);
    lastTime = now; lastTarget = target;

    return position;
  };
  const update = (input, now, speed, hint) => {

    const target = readTarget(input);
    if (!target || !initialized || !Number.isFinite(now)
      || !Number.isFinite(speed) || speed <= 0 || now < lastTime) return hardSet(target, now, invalidInputReason(target, now, speed));
    const previousSpeed = lastSpeed;
    lastSpeed = speed;
    if (!mode) {
      const route = nativePath(hint), authority = route && authorityProjection(route, target, hint);
      const result = hardSet(target, now, 'authority-follow');
      if (authority) saveCursor(route, authority.progress);
      return result;
    }
    if (now === lastTime && lastTarget && target.every((value, index) => value === lastTarget[index])) return position;
    const elapsed = now - lastTime;
    const continuingBacktrack = mode === 'native' && nativeStopBacktrack && nativeCursorId === nativeRoute?.id;
    const continuingHold = sameHeldStop(target, hint);
    const dt = Math.min(elapsed, 50), dx = target[0] - lastTarget[0], dy = target[1] - lastTarget[1];
    const moved = Math.hypot(dx, dy);
    // Packet/frame authority advances before the display consumes this frame's
    // budget. Permit only that transient margin, then enforce the strict local
    // range on the actual continuous sample or remaining detour below.
    const frameRoute = nativePath(hint), frameAuthority = frameRoute && authorityProjection(frameRoute, target, hint);
    const framePrevious = frameRoute && lastTarget && project(frameRoute, lastTarget[0], lastTarget[1], cursorProgress(frameRoute));
    const arcAdvance = frameAuthority && framePrevious ? frameAuthority.progress - framePrevious.progress : 0;
    const end = frameRoute?.points[frameRoute.points.length - 1];
    const approvedRoute = hint?.path === nativeHintPath && hint?.total === nativeHintTotal && nativeHintTotal >= 4;
    const arrived = hint?.total === 0 && end && Math.hypot(target[0] - end[0], target[1] - end[1]) <= EPSILON * 4;
    // A slow frame must not turn normal walk progress into growing correction
    // debt. The spring still integrates at most 50 ms; only a short, proved
    // forward walk gets its own budget. Long suspended loops retain the cap.
    const timely = elapsed > 0 && elapsed <= 300;
    const timedAdvance = elapsed / Math.min(previousSpeed, speed) * 1.02 + EPSILON * 4;
    const sourceProgress = frameRoute?.lengths[frameRoute.sourceNodes[0]];
    const forwardBridge = continuingBacktrack && nativeDisplayProgress >= sourceProgress - EPSILON;
    const ledgerAdvance = (elapsed > 50 || continuingBacktrack || approvedContinuation) && timely
      && !continuingHold && nativeCursorId === frameRoute?.id
      && (approvedRoute || arrived) && arcAdvance > EPSILON && arcAdvance <= timedAdvance
      && safeProgress(frameRoute, framePrevious.progress, frameAuthority.progress) ? arcAdvance : 0;
    const regularRoute = (elapsed > 50 || forwardBridge) && (!continuingBacktrack || forwardBridge) && ledgerAdvance > 0;
    const straight = Math.min(Math.abs(dx), Math.abs(dy)) <= EPSILON * 4
      || Math.abs(Math.abs(dx) - Math.abs(dy)) <= EPSILON * 4;
    const regularDirect = elapsed > 50 && timely && !hint && moved > EPSILON && moved <= timedAdvance
      && straight && safeSegment(lastTarget[0], lastTarget[1], target[0], target[1]);
    const forwardAdvance = regularRoute ? arcAdvance : regularDirect ? moved : 0;
    const continuingForward = validContinuation(target, speed, hint);
    if (approvedContinuation && !continuingForward) approvedContinuation = null;
    const recoveryAllowance = stepLimit(dt, speed) + (elapsed <= 50 ? moved : forwardAdvance);
    if (elapsed > 250 && !continuingBacktrack && !continuingHold && !localFit) return hardSet(target, now, 'frame-gap');
    if (!continuingBacktrack && !continuingForward && !(mode === 'native' && nativeLocalFit)
      && Math.hypot(target[0] - position[0], target[1] - position[1]) >= (localFit ? LOCAL_RANGE + recoveryAllowance + EPSILON : 6)) return hardSet(target, now, 'update-distance-limit');
    if (nativeMicroHold) {
      if (sameHeldStop(target, hint) && canContinueFromSameCell(target, hint)) {
        direction.fill(0); lastTime = now;
        return position;
      }
      releaseStopHold(now, true);
      if (!safeSegment(position[0], position[1], target[0], target[1])) return hardSet(target, now, 'micro-hold-unsafe-link');
      if (groundHeight(position[0], position[1]) === null || groundHeight(target[0], target[1]) === null) return hardSet(target, now, 'micro-hold-height-unavailable');
      return correct(target, now, speed, hint);
    }
    if (nativeStopHold && !sameHeldStop(target, hint)) {
      releaseStopHold(now, true);
      return correct(target, now, speed, hint);
    }
    if (mode === 'native') {
      const route = frameRoute, authority = frameAuthority;
      const previousProgress = route && cursorProgress(route);
      const previous = route && project(route, lastTarget[0], lastTarget[1], previousProgress);
      const displayProgress = route && cursorProgress(route, true);
      const display = route && project(route, position[0], position[1], Number.isFinite(displayProgress)
        ? displayProgress : authority ? authority.progress + nativeError : NaN);
      if (!authority || !previous || !display) return hardSet(target, now,
        !route ? 'native-route-unavailable' : !authority ? 'native-authority-off-route' : !previous ? 'native-previous-off-route' : 'native-display-off-route');
      if (!walkable(Math.round(target[0]), Math.round(target[1]))) return hardSet(target, now, 'native-target-blocked');
      const advance = authority.progress - previous.progress;
      // Authority may advance before this frame gets its recovery budget. Check
      // the resulting sample against the strict range below, so an eight-cell
      // STOP bridge is not discarded merely for the next cell's first fraction.
      if (nativeLocalFit && (!continuingForward && Math.abs(display.progress - authority.progress) > LOCAL_RANGE + stepLimit(dt, speed)
        + (elapsed <= 50 && !continuingBacktrack ? Math.max(0, advance) : forwardAdvance) + EPSILON
        || !safeProgress(route, display.progress, authority.progress))) return hardSet(target, now, 'native-local-fit-invalid');
      if (nativeStopHold) {
        if (smallApprovedStop(route, target, authority, display)) {
          direction.fill(0); lastTarget = target; lastTime = now;
          return position;
        }


        nativeStopHold = false;
        if (elapsed > 250 && !localFit) return hardSet(target, now, 'hold-invalid-after-frame-gap');
      }
      const stoppedBacktrack = hint?.total === 0 && target.every((value, index) => value === lastTarget[index])
        && Math.abs(advance) <= EPSILON;
      const resumedMove = hint?.path === nativeHintPath && hint?.total === nativeHintTotal
        && nativeHintTotal >= 4 && advance >= -EPSILON;
      const end = route.points[route.sourceNodes[route.sourceNodes.length - 1]];
      const arrived = hint?.total === 0 && advance >= -EPSILON && Math.hypot(target[0] - end[0], target[1] - end[1]) <= EPSILON * 4;
      const boundedBacktrack = continuingBacktrack && (stoppedBacktrack || resumedMove || arrived)
        && legalRecoveryOrigin(route, target, authority)
        && (continuingForward && approvedContinuation.derivedBridge || Math.abs(display.progress - previous.progress) <= 8 + EPSILON)
        && safeProgress(route, authority.progress, display.progress);
      if (continuingBacktrack && !boundedBacktrack) return hardSet(target, now, 'native-recovery-invalid');
      const errorOrigin = nativeError;
      const next = spring(errorOrigin, nativeVelocity, dt, Math.abs(advance) <= EPSILON);
      if (boundedBacktrack && stoppedBacktrack && dt) {
        const change = next[0] - errorOrigin, limit = stepLimit(dt, speed);
        if (Math.abs(change) > limit) {
          next[0] = errorOrigin + Math.sign(change) * limit;
          next[1] = Math.max(-2 / speed, Math.min(2 / speed, next[1]));
        }
      }
      if (advance > EPSILON && dt && next[0] - errorOrigin < -advance * 0.75) {
        next[0] = errorOrigin - advance * 0.75;
        next[1] = Math.max(next[1], -advance * 0.75 / dt);
      }
      if (advance > EPSILON && dt) {
        const change = next[0] - errorOrigin, limit = Math.min(0.45, dt * 0.5 / speed);
        if (Math.abs(change) > limit) {
          next[0] = errorOrigin + Math.sign(change) * limit;
          next[1] = Math.max(-0.5 / speed, Math.min(0.5 / speed, next[1]));
        }
      }
      let sample = sampleRoute(route, authority.progress + next[0]);
      if ((localFit || boundedBacktrack) && (Math.abs(advance) <= EPSILON || elapsed > 50 && !forwardAdvance || boundedBacktrack && !forwardAdvance)) {
        const change = sample.progress - display.progress, limit = stepLimit(dt, speed);
        if (Math.abs(change) > limit) sample = sampleRoute(route, display.progress + Math.sign(change) * limit);
        next[1] = Math.max(-2 / speed, Math.min(2 / speed, next[1]));
      }
      if (!safeProgress(route, display.progress, sample.progress)) return hardSet(target, now, 'native-unsafe-progress');
      if (continuingForward && (sample.progress < -EPSILON || sample.progress > authority.progress + EPSILON
        || authority.progress - sample.progress > approvedContinuation.maxDebt + EPSILON * 4
        || authority.progress - sample.progress > approvedContinuation.debt
          + (approvedContinuation.alignmentDebt || 0) + (approvedContinuation.derivedBridge ? ledgerAdvance : 0)
          + EPSILON * 4)) return hardSet(target, now, 'approved-forward-invalid');
      if (nativeLocalFit && !continuingForward && Math.abs(sample.progress - authority.progress) > LOCAL_RANGE + EPSILON) return hardSet(target, now, 'native-local-fit-distance-limit');
      if (boundedBacktrack && !continuingForward && Math.abs(sample.progress - authority.progress) > 8 + EPSILON) return hardSet(target, now, 'native-recovery-distance-limit');
      if (!boundedBacktrack && !continuingForward && Math.hypot(sample.x - target[0], sample.y - target[1]) >= (nativeLocalFit ? LOCAL_RANGE + EPSILON : 6)) return hardSet(target, now, 'native-distance-limit');
      position[0] = sample.x; position[1] = sample.y; direction[0] = sample.dx; direction[1] = sample.dy;
      nativeRoute = route; nativeError = sample.progress - authority.progress; nativeVelocity = next[1];
      nativeStopBacktrack = !!boundedBacktrack;
      saveCursor(route, authority.progress, sample.progress);
      if (continuingForward) {
        const remainingDebt = authority.progress - sample.progress;
        approvedContinuation.alignmentDebt = approvedContinuation.derivedBridge ? 0 : Math.max(0, remainingDebt - approvedContinuation.debt);
        approvedContinuation.debt = approvedContinuation.derivedBridge ? remainingDebt : Math.min(approvedContinuation.debt, remainingDebt);
      }
      lastTime = now; lastTarget = target;
      if (Math.abs(nativeError) <= EPSILON) return hardSet(target, now, 'native-settled');
      if (!setHeight(target)) return hardSet(target, now, 'native-height-unavailable');
      return position;
    }
    const frameCorners = [];
    if (regularRoute) for (let node = 1; node < frameRoute.points.length - 1; node++) {
      if (frameRoute.lengths[node] <= framePrevious.progress + EPSILON || frameRoute.lengths[node] >= frameAuthority.progress - EPSILON) continue;
      const a = frameRoute.points[node - 1], b = frameRoute.points[node], c = frameRoute.points[node + 1];
      if ((b[0] - a[0]) * (c[1] - b[1]) !== (b[1] - a[1]) * (c[0] - b[0])) frameCorners.push(b);
    }
    const corner = frameCorners[frameCorners.length - 1] || (moved > 1e-7 ? turnCenter(target, dx, dy, hint) : null);
    if (corner && mode !== 'detour' && Math.hypot(corner[0] - position[0], corner[1] - position[1]) > EPSILON) {
      const previousLength = Math.hypot(offsetX, offsetY);
      if (mode === 'direct') {
        mode = 'phase'; centers = []; centerIndex = 0;
        routeError = previousLength;
        routeVelocity = previousLength ? (offsetX * velocityX + offsetY * velocityY) / previousLength : 0;
      }
      for (const point of frameCorners.length ? frameCorners : [corner]) {
        const tail = centers[centers.length - 1];
        if (!tail || tail[0] !== point[0] || tail[1] !== point[1]) centers.push(point);
      }
    }
    if (moved > 1e-7) {
      const origin = corner || lastTarget, mx = target[0] - origin[0], my = target[1] - origin[1];
      const maximum = Math.max(Math.abs(mx), Math.abs(my));
      if (maximum) { directionX = mx / maximum; directionY = my / maximum; }
    }
    if (mode === 'direct' && !safeSegment(position[0], position[1], target[0], target[1])) {
      if (!localFit || !buildDetour(target, now, speed, recoveryAllowance)) return hardSet(target, now, 'direct-unsafe-target-link');
    }
    if (mode === 'direct') {
      const stopped = moved <= EPSILON;
      const sx = spring(offsetX, velocityX, dt, stopped), sy = spring(offsetY, velocityY, dt, stopped);
      if (moved > EPSILON && dt) {
        const length = Math.hypot(sx[0] - offsetX, sy[0] - offsetY), limit = Math.min(0.45, dt * 0.5 / speed);
        if (length > limit) {
          sx[0] = offsetX + (sx[0] - offsetX) * limit / length;
          sy[0] = offsetY + (sy[0] - offsetY) * limit / length;
          const velocity = Math.hypot(sx[1], sy[1]);
          if (velocity > 0.5 / speed) { sx[1] *= 0.5 / speed / velocity; sy[1] *= 0.5 / speed / velocity; }
        }
      }
      // A display ahead of a moving authority slows gently but keeps going
      // forward. It cannot reverse or stop just to eliminate phase error.
      if (moved > EPSILON && dt) {
        const ux = dx / moved, uy = dy / moved;
        const backward = (sx[0] - offsetX) * ux + (sy[0] - offsetY) * uy;
        const limit = -moved * 0.75;
        if (backward < limit) {
          sx[0] += (limit - backward) * ux; sy[0] += (limit - backward) * uy;
          const alongVelocity = sx[1] * ux + sy[1] * uy, minimum = limit / dt;
          if (alongVelocity < minimum) { sx[1] += (minimum - alongVelocity) * ux; sy[1] += (minimum - alongVelocity) * uy; }
        }
      }
      // A stationary STOP needs the same bound as a moving correction. Spring
      // decay alone can cover several cells after just one slow rendered frame.
      const changeX = target[0] + sx[0] - position[0], changeY = target[1] + sy[0] - position[1];
      const changeLength = Math.hypot(changeX, changeY), maximumStep = stepLimit(dt, speed);
      if ((stopped || elapsed > 50 && !forwardAdvance) && changeLength > maximumStep) {
        sx[0] = position[0] + changeX * maximumStep / changeLength - target[0];
        sy[0] = position[1] + changeY * maximumStep / changeLength - target[1];
        const velocity = Math.hypot(sx[1], sy[1]);
        if (velocity > 2 / speed) { sx[1] *= 2 / speed / velocity; sy[1] *= 2 / speed / velocity; }
      }
      const x = target[0] + sx[0], y = target[1] + sy[0];
      if (!safeSegment(position[0], position[1], x, y)) {
        if (!buildDetour(target, now, speed, recoveryAllowance)) return hardSet(target, now, 'direct-detour-unavailable');
      } else {
        if (localFit && Math.hypot(x - target[0], y - target[1]) > LOCAL_RANGE + EPSILON) return hardSet(target, now, 'direct-local-fit-distance-limit');
        position[0] = x; position[1] = y;
        [offsetX, velocityX] = sx; [offsetY, velocityY] = sy;
        if (Math.hypot(offsetX, offsetY) <= EPSILON) return hardSet(target, now, 'direct-settled');
      }
    }
    if (mode === 'detour' || mode === 'phase') {
      if (!validRoute(target, localFit ? recoveryAllowance : 0)
        && (!localFit || !buildDetour(target, now, speed, recoveryAllowance))) return hardSet(target, now, 'phase-route-invalid');
      const distance = routeDistance(target);
      let budget;
      if (mode === 'phase') {
        const next = spring(routeError, routeVelocity, dt);
        routeError = Math.max(0, next[0]); routeVelocity = next[1];
        budget = Math.max(0, distance - routeError);
      } else budget = Math.min(distance * dt / Math.max(deadline - now + dt, dt || 1), (3 / speed + 0.006) * dt);
      if (forwardAdvance && mode === 'detour') budget = Math.max(budget, forwardAdvance);
      budget = Math.min(budget, moved <= EPSILON || elapsed > 50 && !forwardAdvance
        ? stepLimit(dt, speed) : (forwardAdvance || moved) + Math.min(0.45, dt * 0.5 / speed));
      while (budget > 0) {
        const point = centerIndex < centers.length ? centers[centerIndex] : target;
        const dx = point[0] - position[0], dy = point[1] - position[1], length = Math.hypot(dx, dy);
        if (length <= budget + 1e-6) {
          position[0] = point[0]; position[1] = point[1]; budget = Math.max(0, budget - length);
          if (centerIndex < centers.length) centerIndex++;
          else return hardSet(target, now, 'phase-target-reached');
        } else { position[0] += dx * budget / length; position[1] += dy * budget / length; budget = 0; }
      }
      if (localFit && !validRoute(target)) return hardSet(target, now, 'phase-local-fit-distance-limit');
      if (routeDistance(target) <= EPSILON) return hardSet(target, now, 'phase-settled');
    }
    lastTime = now; lastTarget = target;
    if (!setHeight(target)) return hardSet(target, now, 'height-unavailable');
    return position;
  };
  return {
    position, direction, get holdingStop() { return nativeStopHold; }, get holdingMicroStop() { return nativeMicroHold; },
    get lastHardSetReason() { return lastHardSetReason; },
    get continuingApprovedMove() { return approvedContinuation !== null; },
    reset, correct, update, holdAtStop, holdSmallStop, canContinueFromSameCell, releaseStopHold,
    continueApprovedMove, cancelApprovedMove,
  };
}
