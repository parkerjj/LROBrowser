self.onmessage = (e) => {
  const { durationS } = e.data;
  const start = performance.now();
  let last = start, maxGap = 0;
  const id = setInterval(() => {
    const now = performance.now();
    maxGap = Math.max(maxGap, now - last);
    last = now;
    if (now - start >= durationS * 1000) { clearInterval(id); self.postMessage({ workerMaxGapMs: Math.round(maxGap) }); }
  }, 1000);
};
