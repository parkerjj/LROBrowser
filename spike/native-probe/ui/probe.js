const { invoke } = window.__TAURI__.core;

export async function runProbes() {
  const results = {};
  results.ua = navigator.userAgent;
  return results;
}

const args = await invoke('probe_args');
const results = await runProbes();
document.getElementById('out').textContent = JSON.stringify(results, null, 2);
await invoke('report', { json: JSON.stringify(results) });
