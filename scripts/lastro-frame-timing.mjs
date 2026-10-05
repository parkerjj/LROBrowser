function patchRegion(source, name, transform) {
  const marker = `//#region ${name}`;
  const start = source.indexOf(marker);
  if (start < 0) return source;
  const end = source.indexOf('//#endregion', start);
  if (end < 0 || source.indexOf(marker, start + marker.length) >= 0) throw new Error('anchor:frame-timing:' + name);
  return source.slice(0, start) + transform(source.slice(start, end)) + source.slice(end);
}

function replaceOne(source, anchor, replacement, name) {
  if (source.split(anchor).length !== 2) throw new Error('anchor:frame-timing:' + name);
  return source.replace(anchor, replacement);
}

export function patchRuntimeFrameTiming(source) {
  let output = patchRegion(source, 'src/Core/Events.js', region => {
    if (region.includes('LastROEventDueTick')) throw new Error('anchor:frame-timing:already-installed');
    region = replaceOne(region, 'var _events, _tick$1, _uid, Events;', `let lastroEventDueTick;
function LastROEventDueTick() { return lastroEventDueTick; }
var _events, _tick$1, _uid, Events;`, 'event-context');
    region = replaceOne(region, 'const tick = _tick$1 + delay;', 'const tick = Math.max(_tick$1, Date.now()) + (Number.isFinite(delay) ? Math.max(0, delay) : 0);', 'event-schedule');
    const oldProcess = `      let count = _events.length;
      while (count > 0) {
        if (_events[0].tick > tick) break;
        _events.shift().callback();
        count--;
      }
      _tick$1 = tick;`;
    return replaceOne(region, oldProcess, `      _tick$1 = tick;
      const cutoff = _uid;
      let processed = 0;
      while (_events.length && _events[0].tick <= tick && _events[0].uid < cutoff && processed < 256) {
        const event = _events.shift();
        const previousDueTick = lastroEventDueTick;
        lastroEventDueTick = event.tick;
        try { event.callback(); }
        catch (error) { console.error("[Events] callback failed", error); }
        finally { lastroEventDueTick = previousDueTick; }
        processed++;
      }`, 'event-process');
  });
  output = patchRegion(output, 'src/Renderer/Renderer.js', region => {
    region = replaceOne(region, 'var mat4$9, _requestAnimationFrame, _cancelAnimationFrame, Renderer;', `let lastroServerClockMark;
let lastroHasServerSample = false;
let lastroServerClockCorrection = 0;
let lastroServerClockSample;
function LastROServerClockNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
function LastROClearServerClockProbe() {
  const ping = SessionStorage_default.ping;
  if (!ping) return;
  ping.returned = true;
  ping.value = 0;
  delete ping.lastroSentAt;
  delete ping.lastroSentMono;
  delete ping._lastroUnansweredSince;
}
function LastROResetServerTick(tick) {
  if (!Number.isInteger(tick) || tick < 0 || tick > 0xffffffff) return false;
  SessionStorage_default.serverTick = tick;
  lastroHasServerSample = true;
  lastroServerClockMark = LastROServerClockNow();
  lastroServerClockCorrection = 0;
  lastroServerClockSample = { tick, mono: lastroServerClockMark };
  LastROClearServerClockProbe();
  return true;
}
function LastROInvalidateServerTick() {
  SessionStorage_default.serverTick = 0;
  lastroHasServerSample = false;
  lastroServerClockMark = undefined;
  lastroServerClockCorrection = 0;
  lastroServerClockSample = undefined;
  LastROClearServerClockProbe();
}
function LastROAdvanceServerTick(now = LastROServerClockNow()) {
  if (!Number.isFinite(now)) return SessionStorage_default.serverTick;
  if (lastroHasServerSample && lastroServerClockMark !== undefined) {
    const elapsed = Math.max(0, now - lastroServerClockMark);
    // Correct phase through a small speed change. Frequent pongs must never
    // rewind the timeline or jump an approved walk ahead between frames.
    const correction = Math.sign(lastroServerClockCorrection)
      * Math.min(Math.abs(lastroServerClockCorrection), elapsed * 0.1);
    SessionStorage_default.serverTick += elapsed + correction;
    lastroServerClockCorrection -= correction;
  }
  lastroServerClockMark = Math.max(lastroServerClockMark ?? now, now);
  return SessionStorage_default.serverTick;
}
function LastROSampleServerTick(tick, sentMono, receivedMono = LastROServerClockNow()) {
  if (!Number.isInteger(tick) || tick < 0 || tick > 0xffffffff
      || !Number.isFinite(sentMono) || !Number.isFinite(receivedMono)) return false;
  const rtt = receivedMono - sentMono;
  if (rtt < 0 || rtt > 2000) return false;
  const oneWay = Math.min(rtt / 2, 250);
  if (!lastroHasServerSample) {
    SessionStorage_default.serverTick = tick + oneWay;
    lastroHasServerSample = true;
    lastroServerClockMark = receivedMono;
    lastroServerClockCorrection = 0;
    lastroServerClockSample = { tick, mono: receivedMono };
    return true;
  }
  const current = LastROAdvanceServerTick(receivedMono);
  if (lastroServerClockSample) {
    const progression = (tick - lastroServerClockSample.tick) | 0;
    if (progression < 0 || receivedMono < lastroServerClockSample.mono) return false;
  }
  // Unwrap the uint32 sample around the continuous local server timeline.
  let error = tick - current % 0x100000000;
  if (error >= 0x80000000) error -= 0x100000000;
  if (error < -0x80000000) error += 0x100000000;
  error += oneWay;
  // A late reply or implausible server clock cannot install a huge drift.
  if (!Number.isFinite(error) || Math.abs(error) > 2000) return false;
  lastroServerClockCorrection = error;
  lastroServerClockSample = { tick, mono: receivedMono };
  return true;
}
var mat4$9, _requestAnimationFrame, _cancelAnimationFrame, Renderer;`, 'server-clock');
    return replaceOne(region, 'SessionStorage_default.serverTick += newTick - this.tick;', 'LastROAdvanceServerTick();', 'render-clock');
  });
  return patchRegion(output, 'src/Engine/MapEngine.js', region => {
    region = replaceOne(region, `  SP.returned = true;
  SP.pongTime = SP.pingTime;
  SP.value = 0;
  SessionStorage_default.serverTick = pkt.time;`, `  const receivedMono = LastROServerClockNow();
  const sentMono = SP.returned === false ? SP.lastroSentMono : undefined;
  const rtt = receivedMono - sentMono;
  if (Number.isFinite(rtt) && rtt >= 0 && rtt <= 2000) {
    SP.value = rtt;
    LastROSampleServerTick(pkt.time, sentMono, receivedMono);
  }
  SP.returned = true;
  SP.pongTime = Date.now();
  delete SP.lastroSentAt;
  delete SP.lastroSentMono;`, 'pong-clock');
    region = replaceOne(region, '                SP.pingTime = ping.clientTime;', '                SP.pingTime = ping.clientTime;\n                SP.lastroSentAt = Date.now();\n                SP.lastroSentMono = LastROServerClockNow();', 'ping-clock');
    region = replaceOne(region, 'function onConnectionAccepted$2(pkt) {', `function onConnectionAccepted$2(pkt) {
  if (Number.isInteger(pkt.startTime) && pkt.startTime >= 0 && pkt.startTime <= 0xffffffff) LastROResetServerTick(pkt.startTime);`, 'entry-clock-sample');
    region = replaceOne(region, `          if (!success) {
            UIManager.showErrorBox(DB.getMessage(1));
            return;
          }
          let pkt;`, `          if (!success) {
            UIManager.showErrorBox(DB.getMessage(1));
            return;
          }
          LastROInvalidateServerTick();
          let pkt;`, 'zone-clock-reset');
    return replaceOne(region, 'function cleanGameUI() {', 'function cleanGameUI() {\n  LastROInvalidateServerTick();', 'logout-clock-reset');
  });
}
