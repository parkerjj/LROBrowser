import { measureTimers } from './timers.js';
import { webglBench } from './webgl.js';

const { invoke, convertFileSrc } = window.__TAURI__.core;
const params = new URLSearchParams(location.search);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function runProbes(args) {
  const results = {};
  results.ua = navigator.userAgent;
  results.relay = await invoke('relay_probe', { userAgent: null });
  results.relayWithWebviewUa = await invoke('relay_probe', { userAgent: navigator.userAgent });
  results.coi = crossOriginIsolated;
  results.sabMain = typeof SharedArrayBuffer;
  const lroUrl = (rootId, path) => convertFileSrc(`${rootId}/${path}`, 'lro');
  const worker = new Worker('probe-worker.js');
  const fromWorker = await new Promise((resolve) => {
    const t = setTimeout(() => resolve({ workerTimeout: true }), 30000);
    worker.onmessage = (e) => { clearTimeout(t); resolve(e.data); };
    worker.onerror = (e) => { clearTimeout(t); resolve({ workerError: String(e.message) }); };
    worker.postMessage({ okUrl: lroUrl('lastro', 'data/clientinfo.xml'), forbiddenUrl: lroUrl('nope', 'data/clientinfo.xml') });
  });
  Object.assign(results, fromWorker);
  worker.terminate();

  results.webgl = await webglBench();

  const childCount = Number(params.get('children') ?? 3);
  await invoke('open_probe_windows', { count: childCount, duration_s: args.duration_s, durationS: args.duration_s });
  const own = await measureTimers(args.duration_s);
  let kids = [];
  for (let i = 0; i < 120 && kids.length < childCount; i++) { kids = await invoke('child_results'); if (kids.length < childCount) await sleep(1000); }
  const windows = kids.map(([label, json]) => ({ label, ...JSON.parse(json) }));
  const all = [own, ...windows];
  results.timers = { main: own, windows, pass: kids.length === childCount && all.every((w) => w.mainMaxGapMs <= 5000 && w.workerMaxGapMs <= 5000) };
  return results;
}

const args = await invoke('probe_args');
if (params.get('child') === '1') {
  const m = await measureTimers(Number(params.get('duration') ?? args.duration_s));
  await invoke('report_child', { label: window.__TAURI_INTERNALS__.metadata.currentWindow.label, json: JSON.stringify({ state: params.get('state'), ...m }) });
} else {
  const results = await runProbes(args);
  document.getElementById('out').textContent = JSON.stringify(results, null, 2);
  await invoke('report', { json: JSON.stringify(results) });
}
