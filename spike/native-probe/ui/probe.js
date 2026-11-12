const { invoke } = window.__TAURI__.core;

export async function runProbes() {
  const results = {};
  results.ua = navigator.userAgent;
  results.relay = await invoke('relay_probe', { userAgent: null });
  results.relayWithWebviewUa = await invoke('relay_probe', { userAgent: navigator.userAgent });
  results.coi = crossOriginIsolated;
  results.sabMain = typeof SharedArrayBuffer;
  const lroUrl = (rootId, path) => window.__TAURI__.core.convertFileSrc(`${rootId}/${path}`, 'lro');
  const worker = new Worker('probe-worker.js');
  const fromWorker = await new Promise((resolve) => {
    const t = setTimeout(() => resolve({ workerTimeout: true }), 30000);
    worker.onmessage = (e) => { clearTimeout(t); resolve(e.data); };
    worker.onerror = (e) => { clearTimeout(t); resolve({ workerError: String(e.message) }); };
    worker.postMessage({ okUrl: lroUrl('lastro', 'data/clientinfo.xml'), forbiddenUrl: lroUrl('nope', 'data/clientinfo.xml') });
  });
  Object.assign(results, fromWorker);
  worker.terminate();
  return results;
}

const args = await invoke('probe_args');
const results = await runProbes();
document.getElementById('out').textContent = JSON.stringify(results, null, 2);
await invoke('report', { json: JSON.stringify(results) });
