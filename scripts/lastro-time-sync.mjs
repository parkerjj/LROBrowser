/* global SessionStorage_default, Network, _socket, LastROServerClockNow, MapRenderer */

function lastroRunTimeSync(state) {
  if (typeof _socket === 'undefined' || state.socket !== _socket || _socket?._lastroTimeSync !== state || !_socket?.isZone
    || !_socket.connected || _socket.handoffPending || !SessionStorage_default.Playing) return false;
  const now = LastROServerClockNow();
  // Keep the security heartbeat at its original cadence. Only the read-only
  // server-time request becomes more frequent.
  if (state.secureHeartbeat && now - state.hbtAt >= 15000) {
    state.hbtAt = now;
    Network.sendPacket(state.hbt);
  }
  if (!state.ready || (typeof MapRenderer !== 'undefined' && MapRenderer.loading)) return false;
  const SP = SessionStorage_default.ping;
  // NOTIFY_TIME has no echoed request id. Never overwrite an outstanding
  // sample: a delayed reply must retain the timestamp of its own request.
  if (SP.returned === false && Number.isFinite(SP.lastroSentMono)) return false;
  const entity = SessionStorage_default.Entity;
  const moving = entity?.walk?.total > 0 || !!entity?._lastroMotion?.pending;
  const interval = now < state.urgentUntil ? 500 : moving ? 1000 : 5000;
  if (now - state.lastSent < interval) return false;
  const wall = Date.now();
  state.ping.clientTime = Math.max(0, wall - state.startTick);
  SP.pingTime = state.ping.clientTime;
  SP.lastroSentAt = wall;
  SP.lastroSentMono = now;
  if (!Number.isFinite(SP._lastroUnansweredSince)) SP._lastroUnansweredSince = wall;
  SP.returned = false;
  state.lastSent = now;
  try {
    if (Network.sendPacket(state.ping) !== false) return true;
  } catch { /* A closed TCP socket must not leave a fictitious in-flight sample. */ }
  SP.lastroSentMono = undefined;
  SP._lastroUnansweredSince = undefined;
  SP.returned = true;
  return false;
}

function lastroStartTimeSync(ping, hbt, secureHeartbeat, startTick) {
  if (typeof _socket === 'undefined' || !_socket?.isZone) return;
  const state = {
    socket: _socket, ping, hbt, secureHeartbeat, startTick,
    hbtAt: LastROServerClockNow(), lastSent: -Infinity, urgentUntil: 0, ready: false,
  };
  _socket._lastroTimeSync = state;
  Network.setPing(() => lastroRunTimeSync(state), 250);
}

function lastroReadyTimeSync() {
  const state = typeof _socket !== 'undefined' && _socket?._lastroTimeSync;
  if (!state || state.socket !== _socket) return;
  state.ready = true;
  state.urgentUntil = LastROServerClockNow() + 2000;
  lastroRunTimeSync(state);
}

function lastroNoteTimeSyncActivity(entity) {
  if (entity !== SessionStorage_default.Entity) return;
  const state = typeof _socket !== 'undefined' && _socket?._lastroTimeSync;
  if (!state || state.socket !== _socket) return;
  state.urgentUntil = LastROServerClockNow() + 2000;
  lastroRunTimeSync(state);
}

function lastroNoteTimeSyncPacket(packet) {
  if (/^PACKET_CZ_(?:REQUEST_MOVE2?|REQUEST_ACT2?|USE_SKILL(?:2|_TOGROUND[23]?)?)$/.test(packet.constructor?.name || ''))
    lastroNoteTimeSyncActivity(SessionStorage_default.Entity);
}

function replaceOne(source, anchor, replacement) {
  if (source.split(anchor).length !== 2) throw new Error('anchor:time-sync');
  return source.replace(anchor, replacement);
}

function patchRegion(source, name, change) {
  const marker = '//#region ' + name, start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  if (end < 0 || source.indexOf(marker, start + marker.length) >= 0) throw new Error('anchor:time-sync');
  return source.slice(0, start) + change(source.slice(start, end).replace(/\r\n/g, '\n')) + source.slice(end);
}

export function patchRuntimeTimeSync(source) {
  if (source.includes('function lastroStartTimeSync(')) throw new Error('anchor:time-sync:installed');
  source = patchRegion(source, 'src/Engine/MapEngine.js', region => {
    region = replaceOne(region, '            Network.setPing(\n', `            if (sendMapTimeSync && Configs.get("lastroProtocol", false)) {
              lastroStartTimeSync(ping, hbt, is_sec_hbt, startTick);
            } else Network.setPing(
`);
    region = replaceOne(region, '  SessionStorage_default.Entity.onWalkEnd = onWalkEnd;',
      '  lastroReadyTimeSync();\n  SessionStorage_default.Entity.onWalkEnd = onWalkEnd;');
    const helpers = [lastroRunTimeSync, lastroStartTimeSync, lastroReadyTimeSync,
      lastroNoteTimeSyncActivity, lastroNoteTimeSyncPacket].map(fn => fn.toString()).join('\n');
    return region.slice(0, region.indexOf('\n') + 1) + helpers + '\n' + region.slice(region.indexOf('\n') + 1);
  });
  source = patchRegion(source, 'src/Network/NetworkManager.js', region => replaceOne(region,
    'lastroPredictSentMovement(Packet);', '{ lastroPredictSentMovement(Packet); lastroNoteTimeSyncPacket(Packet); }'));
  return patchRegion(source, 'src/Renderer/Entity/EntityWalk.js', region => replaceOne(region,
    '  const duration = packet.attackMT + packet.attackedMT',
    '  lastroNoteTimeSyncActivity(entity);\n  const duration = packet.attackMT + packet.attackedMT'));
}
