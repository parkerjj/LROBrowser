import ts from 'typescript';
import { createLastroPositionReconciler as positionReconcilerSource } from './lastro-position-reconciliation.mjs';
import { findLastroPredictedServerPath as predictedPathSource, lastroWalkStepDuration as walkDurationSource,
  createLastroWalkPrediction as walkPredictionSource, sampleLastroWalkPrediction as walkSampleSource } from './lastro-walk-prediction.mjs';

/* global SessionStorage_default, Altitude, MapRenderer, Configs,
  lastroMovementBlocked, lastroCheckMovementConnection, offsetToFloatDir, quantizeDir,
  createLastroPositionReconciler, findLastroServerWalkPath, findLastroPredictedServerPath,
  lastroWalkStepDuration, createLastroWalkPrediction, sampleLastroWalkPrediction, LastROAdvanceServerTick,
  lastroMovementFrameTick, MapControl */

function lastroMovementClock() {
  return Number.isFinite(lastroMovementFrameTick) ? lastroMovementFrameTick : Date.now();
}

function lastroMovementViewState(entity) {
  if (!entity || entity !== SessionStorage_default.Entity || !Configs.get('lastroProtocol', false)) return null;
  const map = typeof MapRenderer === 'undefined' ? null : MapRenderer.currentMap;
  let motion = entity._lastroMotion;
  if (!motion || motion.map !== map || motion.width !== Altitude.width || motion.height !== Altitude.height
      || motion.authority !== entity.position) {
    motion = entity._lastroMotion = {
      map, width: Altitude.width, height: Altitude.height, authority: entity.position,
      view: createLastroPositionReconciler({ altitude: Altitude, findPath: findLastroServerWalkPath }),
      pending: null, direction: entity.direction, distance: entity.walk?.dist || 0, speed: entity.walk?.speed,
      latency: null, ackOutstanding: false, ackFenced: false, allowMicroStop: false, approvedContinuation: null,
    };
    motion.view.reset(entity.position, lastroMovementClock(), 'motion-state');
  }
  return motion;
}

function lastroResetMovementVisual(entity, reason = 'explicit') {
  const motion = entity?._lastroMotion;
  if (!motion) return;
  if (motion.ackOutstanding) motion.ackFenced = true;
  motion.pending = null;
  motion.approvedContinuation = null;
  motion.allowMicroStop = false;
  motion.skillStopIntent = null;
  motion.skillStopSkill = undefined;
  motion.direction = entity.direction;
  motion.distance = entity.walk?.dist || 0;
  motion.speed = entity.walk?.speed;
  motion.fastMove = entity.walk?._lastroNormalSpeed !== undefined;
  motion.cache = null;
  const clock = lastroMovementClock();
  motion.view.reset(entity.position, Math.max(clock, motion.lastTick ?? clock), reason);
}

function lastroResetMovementSession(entity, reason) {
  const motion = entity?._lastroMotion;
  if (!motion) return;
  lastroResetMovementVisual(entity, reason);
  motion.latency = null;
  motion.ackOutstanding = false;
  motion.ackFenced = false;
  motion.predictionBlockedUntil = 0;
}

function lastroCancelApprovedMovement(entity) {
  const motion = entity?._lastroMotion;
  if (!motion) return;
  motion.approvedContinuation = null;
  motion.view.cancelApprovedMove();
  motion.cache = null;
}

function lastroValidateApprovedMovement(entity, motion) {
  const continuation = motion.approvedContinuation;
  if (!continuation) return;
  const walk = entity.walk;
  const arrived = walk?.total === 0 && entity.action === entity.ACTION.IDLE
    && entity.position[0] === continuation.endX && entity.position[1] === continuation.endY;
  const naturalArrival = arrived && !continuation.arrivalPath && walk.path !== continuation.path
    && Array.from(walk.path).every(value => value === 0);
  if (entity._lastroMovementEpoch !== continuation.epoch || entity.position !== continuation.authority
      || walk !== continuation.walk || walk.speed !== continuation.speed || lastroMovementBlocked(entity)
      || (entity.action !== entity.ACTION.IDLE && entity.action !== entity.ACTION.WALK)
      || (typeof MapRenderer !== 'undefined' && MapRenderer.loading)
      || (walk.total > 0 ? walk.path !== continuation.path || walk.total !== continuation.total
        : !arrived || !naturalArrival && walk.path !== (continuation.arrivalPath || continuation.path))) {
    lastroCancelApprovedMovement(entity);
    return;
  }
  if (naturalArrival) continuation.arrivalPath = walk.path;
}

function lastroMovementVisual(entity, tick) {
  let motion = lastroMovementViewState(entity);
  if (!motion) return entity.position;
  const clock = Number.isFinite(tick) ? tick : lastroMovementClock();
  const now = Math.max(clock, motion.lastTick ?? clock);
  motion.lastTick = now;
  lastroValidateApprovedMovement(entity, motion);
  // Camera is rendered before sprites. Advance the approved cell timer once so
  // every consumer in this frame sees the same phase, including packet handlers.
  if (!motion.advancing && motion.simulationTick !== now) {
    motion.simulationTick = now;
    motion.advancing = true;
    try { entity.walkProcess(now); } finally { motion.advancing = false; }
    const current = lastroMovementViewState(entity);
    if (!current) return entity.position;
    if (current !== motion) return lastroMovementVisual(entity, now);
    lastroValidateApprovedMovement(entity, motion);
  }
  const speed = entity.walk?.speed;
  if ((typeof MapRenderer !== 'undefined' && MapRenderer.loading)
      || entity.action === entity.ACTION.SIT || entity.action === entity.ACTION.DIE) {
    lastroResetMovementVisual(entity, typeof MapRenderer !== 'undefined' && MapRenderer.loading
      ? 'map-loading' : entity.action === entity.ACTION.DIE ? 'die' : 'sit');
    return entity.position;
  }
  // A control status or an action can end speculation while a late STOP is
  // still in flight. Preserve the display and its legal corridor as it settles.
  if (motion.pending && (lastroMovementBlocked(entity)
      || entity.action !== entity.ACTION.IDLE && entity.action !== entity.ACTION.WALK)) {
    lastroRetireMovementPrediction(entity);
  }
  if (lastroMovementBlocked(entity)) {
    lastroCancelApprovedMovement(entity);
    lastroReleaseSkillStop(entity, now);
  }
  if (motion.fastMove) {
    motion.pending = null;
    motion.speed = speed;
    motion.fastMove = entity.walk?._lastroNormalSpeed !== undefined;
    return motion.view.reset(entity.position, now, 'fast-move');
  }
  const cache = motion.cache, pending = motion.pending, authority = entity.position;
  if (cache && cache.tick === now && cache.pending === pending && cache.speed === speed
      && cache.action === entity.action && cache.x === authority[0] && cache.y === authority[1]
      && cache.z === authority[2]) return motion.view.position;
  if (motion.speed !== speed) {
    lastroCancelApprovedMovement(entity);
    motion.pending = null;
    motion.speed = speed;
    motion.view.correct(entity.position, now, speed, entity.walk);
  }
  let target = entity.position;
  const prediction = motion.pending;
  if (prediction && !prediction.expired) {
    if (now > prediction.deadline || !lastroCheckMovementConnection()) {
      prediction.expired = true;
      motion.view.correct(entity.position, now, speed, entity.walk);
    } else {
      const sample = sampleLastroWalkPrediction(prediction.route, Math.min(now, prediction.limitTick));
      if (sample) {
        sample.x += prediction.offsetX || 0;
        sample.y += prediction.offsetY || 0;
      }
      let z;
      try {
        z = sample && Altitude.getCellHeight(sample.x, sample.y)
          + entity.position[2] - Altitude.getCellHeight(entity.position[0], entity.position[1]);
      } catch { /* Fall back to authority. */ }
      if (sample && Number.isFinite(z) && lastroMovementSegmentClear(motion.view.position[0], motion.view.position[1], sample.x, sample.y)) {
        target = [sample.x, sample.y, z];
        motion.distance = prediction.distance + sample.distance;
        prediction.finished = sample.finished;
        if (sample.dx || sample.dy) motion.direction = quantizeDir(offsetToFloatDir(sample.dx, sample.dy));
      } else {
        prediction.expired = true;
        prediction.ackAmbiguous = true;
        motion.view.correct(entity.position, now, speed, entity.walk);
      }
    }
  }
  const previousX = motion.view.position[0], previousY = motion.view.position[1];
  const result = motion.view.update(target, now, speed, target === entity.position ? entity.walk : undefined);
  if (motion.view.continuingApprovedMove) motion.distance += Math.hypot(result[0] - previousX, result[1] - previousY);
  if (!motion.pending && motion.allowMicroStop && entity.walk?.total === 0
      && entity.action === entity.ACTION.IDLE && !lastroMovementBlocked(entity)
      && now >= (motion.predictionBlockedUntil || 0))
    motion.view.holdSmallStop(entity.position, now, speed, entity.walk);
  if (motion.approvedContinuation && entity.walk?.total === 0
      && (motion.view.holdingMicroStop || Math.hypot(result[0] - authority[0], result[1] - authority[1]) <= 1 / 1024))
    motion.approvedContinuation = null;
  motion.cache = { tick: now, pending: motion.pending, speed, action: entity.action,
    x: authority[0], y: authority[1], z: authority[2] };
  return result;
}

function lastroMovementVisualAction(entity) {
  const motion = entity._lastroMotion, pending = motion?.pending;
  if (entity === SessionStorage_default.Entity && motion?.view.continuingApprovedMove
      && !motion.view.holdingMicroStop && !motion.view.holdingStop
      && entity.action === entity.ACTION.IDLE && !lastroMovementBlocked(entity)
      && Math.hypot(motion.view.position[0] - entity.position[0], motion.view.position[1] - entity.position[1]) > 1 / 1024)
    return entity.ACTION.WALK;
  return entity === SessionStorage_default.Entity && pending && !pending.expired && !pending.finished
    && lastroMovementClock() <= pending.limitTick && entity.action === entity.ACTION.IDLE
    ? entity.ACTION.WALK : entity.action < 0 ? entity.ACTION.IDLE : entity.action;
}

function lastroMovementVisualDirection(entity) {
  const pending = entity._lastroMotion?.pending;
  if (entity !== SessionStorage_default.Entity) return entity.direction;
  if (entity._lastroMotion?.view.holdingStop) return entity.direction;
  if (pending && !pending.expired) return entity._lastroMotion.direction;
  const tangent = entity._lastroMotion?.view.direction;
  return tangent && (tangent[0] || tangent[1])
    ? quantizeDir(offsetToFloatDir(tangent[0], tangent[1])) : entity.direction;
}

function lastroMovementVisualDistance(entity) {
  const motion = entity._lastroMotion, pending = motion?.pending;
  return entity === SessionStorage_default.Entity && pending && !pending.expired
    ? motion.distance : entity === SessionStorage_default.Entity && motion?.view.continuingApprovedMove
      ? motion.distance : entity.walk.dist;
}

function lastroPredictionCorridorClear(route) {
  const x0 = route.startX, y0 = route.startY, x1 = route.endX, y1 = route.endY;
  if (![x0, y0, x1, y1].every(Number.isInteger)
      || Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) > 32) return false;
  const walkable = (x, y) => {
    if (x < 0 || y < 0 || x >= Altitude.width || y >= Altitude.height) return false;
    try { return !!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE); } catch { return false; }
  };
  let x = x0, y = y0;
  if (!walkable(x, y) || !walkable(x1, y1)) return false;
  const dx = x1 - x0, dy = y1 - y0, sx = Math.sign(dx), sy = Math.sign(dy);
  let tx = sx ? 0.5 / Math.abs(dx) : Infinity, ty = sy ? 0.5 / Math.abs(dy) : Infinity;
  for (let steps = 0; x !== x1 || y !== y1; steps++) {
    if (steps >= 64) return false;
    if (Math.abs(tx - ty) < 1e-8) {
      if (!walkable(x + sx, y) || !walkable(x, y + sy)) return false;
      x += sx; y += sy; tx += 1 / Math.abs(dx); ty += 1 / Math.abs(dy);
    } else if (tx < ty) { x += sx; tx += 1 / Math.abs(dx); }
    else { y += sy; ty += 1 / Math.abs(dy); }
    if (!walkable(x, y)) return false;
  }
  return true;
}

// A translated sub-cell origin must be checked on its actual continuous path,
// rather than relying on the unshifted integer route's legal GAT corridor.
function lastroMovementSegmentClear(x0, y0, x1, y1) {
  if (![x0, y0, x1, y1].every(Number.isFinite)) return false;
  const walkable = (x, y) => {
    if (x < 0 || y < 0 || x >= Altitude.width || y >= Altitude.height) return false;
    try {
      const type = Altitude.getCellType(x, y);
      return Number.isInteger(type) && (type & Altitude.TYPE.WALKABLE) !== 0;
    } catch { return false; }
  };
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
}

function lastroPredictionPrefixClear(route, limitTick, offsetX, offsetY) {
  for (const segment of route.segments) {
    if (segment.start > limitTick) break;
    const alpha = Math.max(0, Math.min(1, (limitTick - segment.start) / (segment.end - segment.start)));
    if (!lastroMovementSegmentClear(segment.x0 + offsetX, segment.y0 + offsetY,
      segment.x0 + (segment.x1 - segment.x0) * alpha + offsetX,
      segment.y0 + (segment.y1 - segment.y0) * alpha + offsetY)) return false;
  }
  return true;
}

function lastroMovementLatencyClock() {
  return typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : NaN;
}

function lastroMovementPredictionBudget(motion) {
  const latency = motion.latency;
  if (motion.ackFenced || !latency || latency.count < 2) return { prediction: 250, acknowledgement: 1000 };
  return {
    prediction: Math.max(80, Math.min(600, Math.ceil(latency.mean + latency.deviation * 2 + 40))),
    acknowledgement: Math.max(1000, Math.min(1500, Math.ceil(latency.mean + latency.deviation * 4 + 600))),
  };
}

function lastroLearnMovementConfirmation(entity, token, arrived = false) {
  const pending = token.ackMeasurement, motion = token.motion;
  if (!pending || lastroMovementBlocked(entity) || entity._lastroMovementEpoch !== pending.epoch + 1
      || (arrived ? !token.confirmedArrival || entity.action !== entity.ACTION.IDLE || entity.walk?.total !== 0
        : entity.action !== entity.ACTION.WALK || entity.walk?.total < 4
          || entity.walk.path[entity.walk.total - 2] !== pending.destX
          || entity.walk.path[entity.walk.total - 1] !== pending.destY)) return;
  const elapsed = token.receivedMono - pending.sentMono;
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 2000) return;
  const previous = motion.latency;
  if (previous && ((token.serverTick - previous.lastServerTick) | 0) <= 0) return;
  motion.ackOutstanding = false;
  if (!previous) motion.latency = { count: 1, mean: elapsed, deviation: 0, lastServerTick: token.serverTick };
  else {
    const difference = elapsed - previous.mean;
    previous.mean += difference * 0.25;
    previous.deviation += (Math.abs(difference) - previous.deviation) * 0.25;
    previous.count = Math.min(32, previous.count + 1);
    previous.lastServerTick = token.serverTick;
  }
}

function lastroMarkMovementHit(entity, packet, hitStart) {
  const motion = lastroMovementViewState(entity);
  if (!motion) return;
  lastroCancelApprovedMovement(entity);
  const duration = packet.attackMT + packet.attackedMT
    + 200 * (packet.leftDamage ? 1.75 : 1) * (Math.max(1, packet.count || 1) - 1);
  const now = Date.now();
  motion.allowMicroStop = false;
  lastroReleaseSkillStop(entity, now);
  const elapsed = Number.isFinite(SessionStorage_default.serverTick) && SessionStorage_default.serverTick !== 0
    ? ((SessionStorage_default.serverTick % 0x100000000) - packet.startTime) | 0 : -1;
  const timed = Number.isInteger(packet.startTime) && packet.startTime >= 0 && packet.startTime <= 0xffffffff
    && elapsed >= 0 && elapsed <= 5000 && Number.isFinite(hitStart) && hitStart <= now && now - hitStart <= 5000;
  const protection = timed && Number.isFinite(duration)
    ? Math.max(80, Math.min(1500, hitStart + duration - now + 80))
    : Math.max(250, Math.min(1500, Number.isFinite(duration) ? duration : 250));
  motion.predictionBlockedUntil = Math.max(motion.predictionBlockedUntil || 0, now + protection);
  lastroRetireMovementPrediction(entity);
}

function lastroPredictSentMovement(packet) {
  if (!lastroCheckMovementConnection()) return;
  const entity = SessionStorage_default.Entity;
  const name = packet.constructor?.name || '';
  if (/^PACKET_CZ_(?:REQUEST_ACT2?|USE_SKILL(?:2|_TOGROUND[23]?)?)$/.test(name)) {
    const motion = entity && lastroMovementViewState(entity);
    if (motion) {
      lastroCancelApprovedMovement(entity);
      const now = Date.now();
      if (motion.view.holdingMicroStop) lastroReleaseSkillStop(entity, now);
      motion.allowMicroStop = false;
      motion.predictionBlockedUntil = Math.max(motion.predictionBlockedUntil || 0, now + 250);
      if (/^PACKET_CZ_USE_SKILL/.test(name)) {
        // A successful skill request supersedes queued floor clicks, while the
        // approved route remains active until the server actually stops it.
        if (typeof MapControl !== 'undefined') MapControl._lastroMovementInput?.cancel();
        if (entity.walk?.total > 0 && !lastroMovementBlocked(entity))
          motion.skillStopIntent = { epoch: entity._lastroMovementEpoch || 0, skill: packet.SKID, until: now + 1000 };
      } else motion.skillStopIntent = null;
      lastroRetireMovementPrediction(entity);
    }
    return;
  }
  if (!/REQUEST_MOVE2?$/.test(name)) return;
  const sentMono = lastroMovementLatencyClock();
  const motion = entity && lastroMovementViewState(entity);
  lastroCancelApprovedMovement(entity);
  // The protocol echoes no request id. Once another click has been sent, even
  // to the same tile, that reply cannot train the first request's latency.
  const ambiguousSend = !!motion && (motion.ackOutstanding || motion.ackFenced);
  if (motion) {
    // With no request id, overlapping or retired requests cannot be drained by
    // counting later route refreshes. Keep learning disabled until map entry.
    if (motion.ackOutstanding) motion.ackFenced = true;
    motion.ackOutstanding = true;
  }
  if (motion?.pending) motion.pending.ackAmbiguous = true;
  if (!entity || lastroMovementBlocked(entity) || (typeof MapRenderer !== 'undefined' && MapRenderer.loading)
      || (entity.action !== entity.ACTION.IDLE && entity.action !== entity.ACTION.WALK)) return;
  // Keep an approved route moving until the server accepts the new destination.
  // Speculation is useful only for the initial response from a stationary cell.
  if (entity.walk?.total > 0) return;
  // Repeated unacknowledged requests cannot extend the speculation window.
  if (!motion || motion.pending && !motion.pending.expired) return;
  const now = Date.now();
  if (now < (motion.predictionBlockedUntil || 0)
      || !Number.isInteger(entity.position[0]) || !Number.isInteger(entity.position[1])) return;
  const shown = lastroMovementVisual(entity, now);
  // An earlier correction must finish before a new prediction changes its
  // target. Otherwise the first sample can jump off the retained old corridor.
  const offsetX = shown[0] - entity.position[0], offsetY = shown[1] - entity.position[1];
  const residual = Math.hypot(offsetX, offsetY), inherit = residual > 1 / 1024;
  if (inherit && !motion.view.canContinueFromSameCell(entity.position, entity.walk)) return;
  const start = Math.max(now, motion.lastTick ?? now), budget = lastroMovementPredictionBudget(motion);
  const route = createLastroWalkPrediction({ position: entity.position, walk: entity.walk,
    dest: packet.dest, now: start, altitude: Altitude, findPath: findLastroPredictedServerPath });
  // Around obstacles, even a plausible local route can disagree with the
  // server. Send the request normally and wait for its approved grid route.
  if (!route || !lastroPredictionCorridorClear(route)) return;
  let limitTick = start + budget.prediction;
  const distanceLimit = 2 - (inherit ? residual : 0);
  if (sampleLastroWalkPrediction(route, limitTick).distance > distanceLimit) {
    let low = start, high = limitTick;
    for (let i = 0; i < 20; i++) {
      const middle = (low + high) / 2;
      if (sampleLastroWalkPrediction(route, middle).distance <= distanceLimit) low = middle;
      else high = middle;
    }
    limitTick = low;
  }
  if (!lastroPredictionPrefixClear(route, limitTick, inherit ? offsetX : 0, inherit ? offsetY : 0)) return;
  if (typeof LastROAdvanceServerTick === 'function') LastROAdvanceServerTick();
  const sentServerTick = SessionStorage_default.serverTick;
  // Stop speculative progress at the cell/time limit, then hold that endpoint
  // while a delayed ACK is in flight. An unchanged authority is not a rejection.
  if (inherit) {
    lastroReleaseSkillStop(entity, start);
    motion.view.reset(shown, start, 'prediction-inherit');
  }
  motion.allowMicroStop = false;
  motion.pending = { route, deadline: start + budget.acknowledgement, limitTick, expired: false, distance: entity.walk.dist || 0,
    speed: entity.walk.speed,
    offsetX: inherit ? offsetX : 0, offsetY: inherit ? offsetY : 0,
    epoch: entity._lastroMovementEpoch || 0, destX: route.endX, destY: route.endY,
    sentMono, ackAmbiguous: ambiguousSend,
    sentServerTick: Number.isFinite(sentServerTick) && sentServerTick !== 0 ? sentServerTick % 0x100000000 : undefined };
  motion.speed = entity.walk.speed;
  motion.cache = null;
}

function lastroBeginMovementConfirmation(entity, serverTick, force = false, destX, destY) {
  if (!Number.isInteger(serverTick) || serverTick < 0 || serverTick > 0xffffffff) return null;
  const motion = lastroMovementViewState(entity);
  if (!motion) return null;
  lastroCancelApprovedMovement(entity);
  const now = Math.max(Date.now(), motion.lastTick ?? -Infinity);
  lastroMovementVisual(entity, now);
  if (lastroMovementViewState(entity) !== motion) return null;
  const pending = motion.pending;
  const intent = motion.skillStopIntent;
  const skillStop = force && intent && now <= intent.until
    && intent.epoch === (entity._lastroMovementEpoch || 0) && !lastroMovementBlocked(entity) ? intent : null;
  motion.skillStopIntent = null;
  if (!force) motion.skillStopSkill = undefined;
  // A MOVE already in flight before this click describes the preceding route.
  // It may refresh authority, but cannot acknowledge the newer intent.
  const retainedPending = !force && pending && Number.isFinite(pending.sentServerTick)
    && ((serverTick - pending.sentServerTick) | 0) < 0 ? pending : null;
  const startDelta = pending && ((serverTick - pending.sentServerTick) | 0);
  const ackMeasurement = !force && !retainedPending && pending && !pending.ackAmbiguous && !motion.ackFenced
    && pending.epoch === (entity._lastroMovementEpoch || 0) && Number.isFinite(pending.sentServerTick)
    && Number.isInteger(serverTick) && serverTick >= 0 && serverTick <= 0xffffffff
    && startDelta >= 0 && startDelta <= 2000 && destX === pending.destX && destY === pending.destY ? pending : null;
  if (!retainedPending) motion.pending = null;
  motion.cache = null;
  if (entity.walk) entity.walk._lastroServerTiming = true;
  return { motion, retainedPending, skillStop, authority: entity.position, now,
    force, ackMeasurement, serverTick, receivedMono: lastroMovementLatencyClock() };
}

function lastroCaptureApprovedMovement(entity, token) {
  const pending = token?.ackMeasurement, walk = entity.walk;
  if (!pending || token.force || pending.expired || pending.ackAmbiguous || token.motion.ackFenced
      || entity._lastroMovementEpoch !== pending.epoch + 1 || walk?.speed !== pending.speed
      || entity.action !== entity.ACTION.WALK || lastroMovementBlocked(entity)
      || token.now < (token.motion.predictionBlockedUntil || 0)) return;
  const segments = pending.route.segments, total = walk.total;
  if (!Array.isArray(segments) || !segments.length || segments.length > 32
      || total !== (segments.length + 1) * 2 || total > walk.path.length) return;
  const snapshot = Array.from(walk.path.slice(0, total));
  if (snapshot[0] !== segments[0].x0 || snapshot[1] !== segments[0].y0) return;
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (![segment.x0, segment.y0, segment.x1, segment.y1].every(Number.isInteger)
        || snapshot[index * 2] !== segment.x0 || snapshot[index * 2 + 1] !== segment.y0
        || snapshot[index * 2 + 2] !== segment.x1 || snapshot[index * 2 + 3] !== segment.y1) return;
  }
  token.approvedRoute = { path: walk.path, total, snapshot, walk, speed: walk.speed, epoch: entity._lastroMovementEpoch };
}

function lastroApprovedMovementMatches(entity, token) {
  const approved = token.approvedRoute, pending = token.ackMeasurement, walk = entity.walk;
  const elapsed = pending && token.receivedMono - pending.sentMono;
  if (!approved || !pending || token.force || pending.expired || pending.ackAmbiguous || token.motion.ackFenced
      || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > 2000
      || entity._lastroMovementEpoch !== pending.epoch + 1 || entity._lastroMovementEpoch !== approved.epoch
      || entity.position !== token.authority || walk !== approved.walk || walk.speed !== approved.speed
      || lastroMovementBlocked(entity) || (entity.action !== entity.ACTION.IDLE && entity.action !== entity.ACTION.WALK)
      || approved.snapshot.some((value, index) => approved.path[index] !== value)
      || (walk.total > 0 ? walk.path !== approved.path || walk.total !== approved.total
        : walk.total !== 0 || entity.action !== entity.ACTION.IDLE
          || entity.position[0] !== pending.destX || entity.position[1] !== pending.destY
          || !Array.from(walk.path).every(value => value === 0))) return false;
  if (walk.total === 0) {
    try {
      if (!Number.isFinite(entity.position[2]) || Math.abs(entity.position[2]
          - Altitude.getCellHeight(entity.position[0], entity.position[1])) > 1 / 1024) return false;
    } catch { return false; }
  }
  return true;
}

function lastroContinueApprovedMovement(entity, token) {
  if (!lastroApprovedMovementMatches(entity, token)) return false;
  const approved = token.approvedRoute, pending = token.ackMeasurement, walk = entity.walk;
  // Request acknowledgement depends on native route identity, not on whether
  // the display lies on the corridor and qualifies for a long visual tail.
  if (walk.total === 0) {
    token.confirmedArrival = true;
    token.motion.ackOutstanding = false;
    lastroLearnMovementConfirmation(entity, token, true);
  }
  if (token.now < (token.motion.predictionBlockedUntil || 0)) return false;
  if (!token.motion.view.continueApprovedMove(entity.position, token.now, walk.speed, walk,
    { path: approved.path, total: approved.total, index: walk.total > 0 ? walk.index : approved.total })) return false;
  // An overdue but fully matched route can have completed natively already.
  // It still acknowledges this request, even when it cannot train WALK latency.
  token.motion.ackOutstanding = false;
  token.motion.approvedContinuation = { authority: entity.position, walk, path: approved.path, total: approved.total,
    epoch: approved.epoch, speed: approved.speed, endX: pending.destX, endY: pending.destY,
    arrivalPath: walk.total === 0 ? walk.path : null };
  return true;
}

function lastroFinishMovementConfirmation(entity, token) {
  if (!token || entity !== SessionStorage_default.Entity || entity._lastroMotion !== token.motion
      || entity.position !== token.authority) return;
  const motion = token.motion;
  if (typeof MapRenderer !== 'undefined' && MapRenderer.loading) {
    lastroResetMovementVisual(entity, 'confirmation-loading');
    return;
  }
  if (lastroMovementBlocked(entity)) motion.pending = null;
  if (token.retainedPending && motion.pending === token.retainedPending && !motion.pending.expired) return;
  lastroLearnMovementConfirmation(entity, token);
  motion.allowMicroStop = (!token.force || motion.allowMicroStop) && !token.skillStop && !lastroMovementBlocked(entity)
    && (entity.action === entity.ACTION.IDLE || entity.action === entity.ACTION.WALK)
    && token.now >= (motion.predictionBlockedUntil || 0);
  // The authoritative path, arrival callback and interaction position stay independent.
  motion.cache = null;
  if (lastroContinueApprovedMovement(entity, token)) { /* Keep the confirmed route's render tail independent of native arrival. */ }
  else if (token.skillStop && !lastroMovementBlocked(entity)
      && motion.view.holdAtStop(entity.position, token.now, entity.walk.speed, entity.walk))
    motion.skillStopSkill = token.skillStop.skill;
  else if (!(token.force && motion.allowMicroStop
      && motion.view.holdSmallStop(entity.position, token.now, entity.walk.speed, entity.walk)))
    motion.view.correct(entity.position, token.now, entity.walk.speed, entity.walk);
  motion.direction = entity.direction;
  if (!motion.view.continuingApprovedMove) motion.distance = entity.walk.dist;
  motion.speed = entity.walk.speed;
}

function lastroReleaseSkillStop(entity, now = lastroMovementClock()) {
  const motion = entity?._lastroMotion;
  if (!motion) return;
  motion.skillStopIntent = null;
  motion.skillStopSkill = undefined;
  const releaseTick = Math.max(now, motion.lastTick ?? now);
  if (motion.view.releaseStopHold(releaseTick)) {
    motion.lastTick = releaseTick;
    motion.cache = null;
  }
}

function lastroRejectMovementSkill(packet) {
  if (packet.result) return;
  const entity = SessionStorage_default.Entity, motion = entity && lastroMovementViewState(entity);
  if (motion && (motion.skillStopIntent && packet.SKID === motion.skillStopIntent.skill
      || motion.view.holdingStop && packet.SKID === motion.skillStopSkill)) {
    motion.allowMicroStop = false;
    lastroReleaseSkillStop(entity);
  }
}

function lastroFailedMovementSend(packet) {
  if (!/^PACKET_CZ_(?:REQUEST_ACT2?|USE_SKILL(?:2|_TOGROUND[23]?)?|REQUEST_MOVE2?)$/.test(packet.constructor?.name || '')) return;
  const entity = SessionStorage_default.Entity, motion = entity?._lastroMotion;
  if (!motion) return;
  motion.allowMicroStop = false;
  if (motion.view.holdingMicroStop) lastroReleaseSkillStop(entity);
}

function lastroRetireMovementPrediction(entity) {
  const motion = entity?._lastroMotion;
  if (!motion?.pending) return;
  if (motion.ackOutstanding) motion.ackFenced = true;
  motion.pending = null;
  motion.cache = null;
  const clock = lastroMovementClock();
  motion.view.correct(entity.position, Math.max(clock, motion.lastTick ?? clock), entity.walk.speed, entity.walk);
}

function lastroEstimateServerWalkDuration(path, total, speed) {
  let duration = 0;
  for (let index = 2; index < total; index += 2)
    duration += lastroWalkStepDuration(path[index] - path[index - 2], path[index + 1] - path[index - 1], speed);
  return duration;
}

function replaceExact(source, needle, replacement) {
  if (source.split(needle).length !== 2) throw new Error('anchor:movement-prediction');
  return source.replace(needle, replacement);
}

function patchRegion(source, name, transform) {
  const marker = '//#region ' + name, start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  if (end < 0 || source.indexOf(marker, start + marker.length) >= 0) throw new Error('anchor:movement-prediction');
  const region = source.slice(start, end).replace(/\r\n/g, '\n');
  const file = ts.createSourceFile(name, region, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS), edits = [];
  function body(name, params, update) {
    const nodes = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
    if (nodes.length !== 1 || !nodes[0].body
        || nodes[0].parameters.map(node => node.name.getText(file)).join(',') !== params) throw new Error('anchor:movement-prediction:' + name);
    edits.push({ start: nodes[0].body.getStart(file), end: nodes[0].body.end, text: update(nodes[0].body.getText(file)) });
  }
  transform(body, edits, file);
  let output = region;
  for (const edit of edits.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return source.slice(0, start) + output + source.slice(end);
}

function patchDisplayReads(source, name, objects, actions = false) {
  return patchRegion(source, name, (_body, edits, file) => {
    let positions = 0;
    function visit(node) {
      if (ts.isPropertyAccessExpression(node)) {
        const object = node.expression.getText(file), property = node.name.text;
        let replacement;
        if (objects.includes(object) && property === 'position') {
          replacement = 'lastroMovementVisual(' + object + ')';
          positions++;
        } else if (actions && ['this', 'self', 'entity'].includes(object)) {
          if (property === 'action') replacement = 'lastroMovementVisualAction(' + object + ')';
          if (property === 'direction') replacement = 'lastroMovementVisualDirection(' + object + ')';
        } else if (actions && object === 'entity.walk' && property === 'dist') replacement = 'lastroMovementVisualDistance(entity)';
        if (replacement) {
          edits.push({ start: node.getStart(file), end: node.end, text: replacement });
          return;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
    if (!positions) throw new Error('anchor:movement-prediction:display');
  });
}

// Apply after other renderer patches so their native statement anchors remain intact.
export function patchRuntimeMovementFrameClock(source) {
  return patchRegion(source, 'src/Renderer/MapRenderer.js', (_body, edits, file) => {
    const methods = [];
    function visit(node) {
      if (ts.isMethodDeclaration(node) && node.name.getText(file) === 'onRender') methods.push(node);
      ts.forEachChild(node, visit);
    }
    visit(file);
    if (methods.length !== 1 || methods[0].parameters.map(node => node.name.getText(file)).join(',') !== 'tick,gl')
      throw new Error('anchor:movement-prediction:frame');
    const block = methods[0].body;
    if (!block) throw new Error('anchor:movement-prediction:frame');
    if (block.getText(file).includes('lastroPreviousFrameTick')) throw new Error('anchor:movement-prediction:installed-frame');
    edits.push({ start: block.getStart(file), end: block.end,
      text: '{\n  const lastroPreviousFrameTick = lastroMovementFrameTick;\n  lastroMovementFrameTick = tick;\n  try ' + block.getText(file)
        + ' finally { lastroMovementFrameTick = lastroPreviousFrameTick; }\n}' });
  });
}

export function patchRuntimeMovementPrediction(source) {
  const marker = '//#region src/Renderer/Entity/EntityWalk.js';
  if (!source.includes(marker)) return source;
  if (source.includes('function lastroMovementViewState(')) throw new Error('anchor:movement-prediction:installed');
  if (!source.includes('function lastroCancelMovement(')) throw new Error('anchor:movement-prediction:requires-sync');
  source = patchRegion(source, 'src/Renderer/Entity/EntityWalk.js', body => {
    body('walkTo', 'from_x,from_y,to_x,to_y,range,moveStartTime', original => {
      let output = replaceExact(original, '  this._lastroMovementEpoch =',
        '  const lastroConfirmation = lastroBeginMovementConfirmation(this, moveStartTime, false, to_x, to_y);\n  try {\n  this._lastroMovementEpoch =');
      output = replaceExact(output, 'lastroCaptureRouteJoin(this)', '(this._lastroMotion ? null : lastroCaptureRouteJoin(this))');
      output = replaceExact(output, '  let total = PathFinding_default.search(',
        '  let total = serverMove && this._lastroMotion && !range\n    ? findLastroPredictedServerPath(from_x, from_y, to_x, to_y, path, Altitude)\n    : PathFinding_default.search(');
      output = replaceExact(output,
        'const duration = estimatePathDuration(this.walk.path, this.walk.total, this.walk.speed, this.position);',
        'const duration = this._lastroMotion\n      ? lastroEstimateServerWalkDuration(this.walk.path, this.walk.total, this.walk.speed)\n      : estimatePathDuration(this.walk.path, this.walk.total, this.walk.speed, this.position);');
      output = replaceExact(output, '    if (serverMove) {\n      this.walkProcess();',
        '    if (serverMove) {\n      lastroCaptureApprovedMovement(this, lastroConfirmation);\n      this.walkProcess();');
      return output.slice(0, -1) + '\n  } finally { lastroFinishMovementConfirmation(this, lastroConfirmation); }\n}';
    });
    body('walkProcess', 'lastroTick', original => replaceExact(original,
      '      const distance = Math.sqrt(dx * dx + dy * dy);',
      `      if (lastroServerTiming) {
        // Server walk timers retain the speed sampled at this cell's start.
        // FASTMOVE deliberately replaces that timer with its skill speed.
        if (walk._lastroNormalSpeed !== undefined) {
          const duration = lastroWalkStepDuration(dx, dy, baseSpeed);
          return Number.isFinite(duration) && duration >= 1 ? duration : 1;
        }
        if (walk._lastroServerStepIndex !== index) {
          walk._lastroServerStepIndex = index;
          walk._lastroServerStepSpeed = baseSpeed;
        }
        const duration = lastroWalkStepDuration(dx, dy, walk._lastroServerStepSpeed);
        return Number.isFinite(duration) && duration >= 1 ? duration : 1;
      }
      const distance = Math.sqrt(dx * dx + dy * dy);`));
  });
  // The native nested segment helper needs the entity receiver explicitly.
  source = patchRegion(source, 'src/Renderer/Entity/EntityWalk.js', body => {
    body('lastroProjectWalkDistance', 'walk,tick', original => {
      const needle = 'duration = duration > 0 ? walk.speed * duration : walk.speed;';
      if (original.split(needle).length !== 3) throw new Error('anchor:movement-prediction:distance');
      return original.replaceAll(needle,
        'duration = walk._lastroServerTiming\n    ? lastroWalkStepDuration(dx, dy, index === walk._lastroServerStepIndex ? walk._lastroServerStepSpeed : walk.speed)\n    : duration > 0 ? walk.speed * duration : walk.speed;');
    });
    body('walkProcess', 'lastroTick', original => replaceExact(original, '    const getSegmentDuration = function',
      '    const lastroServerTiming = !!this._lastroMotion;\n    const getSegmentDuration = function'));
    body('resetRoute', 'keepDistance', original => '{\n  delete this.walk._lastroServerStepIndex;\n  delete this.walk._lastroServerStepSpeed;' + original.slice(1));
    body('lastroCancelMovement', 'entity,invalidate', original => replaceExact(original,
      '  if (!entity) return;', '  if (!entity) return;\n  lastroRetireMovementPrediction(entity);'));
  });
  source = patchRegion(source, 'src/Renderer/Entity/EntityWalk.js', body => {
    body('walkProcess', 'lastroTick', original => replaceExact(original,
      'const TICK = Number.isFinite(lastroTick) ? lastroTick : Date.now();',
      'const TICK = Number.isFinite(lastroTick) ? lastroTick : this === SessionStorage_default.Entity && this._lastroMotion\n    ? Math.max(lastroMovementClock(), walk.prevTick) : Date.now();'));
  });
  source = patchRegion(source, 'src/Network/NetworkManager.js', body => {
    body('sendPacket', 'Packet', original => replaceExact(original, '  send(pkt.buffer);',
      '  try { send(pkt.buffer); } catch (error) { lastroFailedMovementSend(Packet); throw error; }\n  if (_socket?.isZone && _socket.connected && !_socket.handoffPending) lastroPredictSentMovement(Packet);'));
    body('onClose$9', 'event', original => replaceExact(original,
      '    lastroCancelMovement(SessionStorage_default.Entity);',
      '    lastroCancelMovement(SessionStorage_default.Entity);\n    lastroResetMovementSession(SessionStorage_default.Entity, "connection-close");'));
  });
  source = patchRegion(source, 'src/Engine/MapEngine.js', body => {
    body('onConnectionAccepted$2', 'pkt', original => '{\n  lastroResetMovementSession(SessionStorage_default.Entity, "zone-accept");' + original.slice(1));
    body('resetEntityForMapEntry', 'entity,pkt,gid', original => '{\n  try ' + original
      + '\n  finally { lastroResetMovementSession(entity, "map-entry"); }\n}');
  });
  source = patchRegion(source, 'src/Engine/MapEngine/Entity.js', body => {
    body('onEntityStopMove', 'pkt', original => {
      const output = replaceExact(original, '    lastroCancelMovement(entity);',
        '    const lastroStopView = lastroBeginMovementConfirmation(entity, 0, true);\n    lastroCancelMovement(entity);');
      return replaceExact(output, '    entity.position[2] = Altitude.getCellHeight(pkt.xPos, pkt.yPos);',
        '    entity.position[2] = Altitude.getCellHeight(pkt.xPos, pkt.yPos);\n    lastroFinishMovementConfirmation(entity, lastroStopView);');
    });
    body('onEntityJump', 'pkt', original => {
      const output = replaceExact(original, '  if (entity) {', '  if (entity) {\n    try {');
      return output.slice(0, -3) + '\n    } finally { lastroResetMovementVisual(entity, "jump"); }\n  }\n}';
    });
    body('onEntityFastMove', 'pkt', original => {
      let output = replaceExact(original, '  if (entity) {', '  if (entity) {\n    let lastroValidRelocation = false;\n    try {');
      output = replaceExact(output, '    if (!Number.isFinite(height)) return;',
        '    if (!Number.isFinite(height)) return;\n    lastroValidRelocation = true;');
      return output.slice(0, -3) + '\n    } finally { if (lastroValidRelocation) lastroResetMovementVisual(entity, "fast-move-packet"); }\n  }\n}';
    });
    body('onEntityWillBeHitSub', 'pkt,dstEntity', original => {
      const staleHit = '    if (approved && hitStart + pkt.attackMT < approved.walk.tick) return;';
      let output = replaceExact(original, staleHit, staleHit + '\n    lastroMarkMovementHit(dstEntity, pkt, hitStart);');
      output = replaceExact(output, '      if (dstEntity.action !== dstEntity.ACTION.DIE)',
        '      lastroRetireMovementPrediction(dstEntity);\n      if (dstEntity.action !== dstEntity.ACTION.DIE)');
      return output;
    });
  });
  source = patchRegion(source, 'src/Engine/MapEngine/Skill.js', body => {
    body('onSkillResult', 'pkt', original => replaceExact(original, '  if (pkt.result) return;',
      '  lastroRejectMovementSkill(pkt);\n  if (pkt.result) return;'));
  });
  source = patchDisplayReads(source, 'src/Renderer/Entity/EntityRender.js', ['this', 'self', 'entity'], true);
  source = patchDisplayReads(source, 'src/Renderer/Camera.js', ['this.target']);
  source = patchDisplayReads(source, 'src/Renderer/GR2/GR2ModelRenderer.js', ['entity', 'e']);
  source = patchRegion(source, 'src/Renderer/GR2/GR2ModelRenderer.js', body => {
    body('syncFromEntity', 'inst,type,tick', original => replaceExact(original,
      '  const dir = e.direction;', '  const dir = lastroMovementVisualDirection(e);'));
  });
  source = patchDisplayReads(source, 'src/Renderer/Entity/EntityAttachments.js', ['this.entity']);
  source = patchRegion(source, 'src/Renderer/Entity/EntityAttachments.js', (_body, edits, file) => {
    let directions = 0;
    function visit(node) {
      if (ts.isPropertyAccessExpression(node) && node.expression.getText(file) === 'this.entity' && node.name.text === 'direction') {
        edits.push({ start: node.getStart(file), end: node.end, text: 'lastroMovementVisualDirection(this.entity)' });
        directions++;
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
    if (!directions) throw new Error('anchor:movement-prediction:attachment-direction');
  });
  source = patchDisplayReads(source, 'src/Renderer/Effects/Damage.js', ['entity', 'damage.entity']);
  const helpers = [predictedPathSource, walkDurationSource, walkPredictionSource,
    walkSampleSource, positionReconcilerSource, lastroMovementClock, lastroMovementViewState,
    lastroResetMovementVisual, lastroResetMovementSession, lastroCancelApprovedMovement, lastroValidateApprovedMovement,
    lastroMovementVisual, lastroMovementVisualAction,
    lastroMovementVisualDirection, lastroMovementVisualDistance, lastroPredictionCorridorClear,
    lastroMovementSegmentClear, lastroPredictionPrefixClear, lastroMovementLatencyClock,
    lastroMovementPredictionBudget, lastroLearnMovementConfirmation,
    lastroMarkMovementHit, lastroPredictSentMovement, lastroReleaseSkillStop, lastroRejectMovementSkill, lastroFailedMovementSend,
    lastroBeginMovementConfirmation, lastroCaptureApprovedMovement, lastroApprovedMovementMatches, lastroContinueApprovedMovement,
    lastroFinishMovementConfirmation, lastroRetireMovementPrediction,
    lastroEstimateServerWalkDuration];
  return source.replace(marker, marker + '\nlet lastroMovementFrameTick;\n'
    + helpers.map(fn => fn.toString()).join('\n') + '\n');
}
