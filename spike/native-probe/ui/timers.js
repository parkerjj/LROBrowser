export async function measureTimers(durationS, onTick) {
  const worker = new Worker('timer-worker.js');
  const workerDone = new Promise((resolve) => { worker.onmessage = (e) => resolve(e.data); });
  worker.postMessage({ durationS });
  const start = performance.now();
  let last = start, maxGap = 0, ticked = 0;
  const mainDone = new Promise((resolve) => {
    const id = setInterval(() => {
      const now = performance.now();
      maxGap = Math.max(maxGap, now - last);
      last = now;
      if (onTick && Math.floor((now - start) / 60000) > ticked) { ticked++; onTick({ elapsedS: Math.round((now - start) / 1000), mainMaxGapMs: Math.round(maxGap) }); }
      if (now - start >= durationS * 1000) { clearInterval(id); resolve(Math.round(maxGap)); }
    }, 1000);
  });
  const [mainMaxGapMs, w] = await Promise.all([mainDone, workerDone]);
  worker.terminate();
  return { mainMaxGapMs, workerMaxGapMs: w.workerMaxGapMs, durationS };
}
