const STORAGE_KEY = 'lastro-login-preferences';
const DEFAULT_SELECTION = Object.freeze({ connectionMode: 'relay', serverProfileId: 'lastro-2x' });
const SERVER_IDS = new Set(['lastro-2x', 'lastro-3x', 'lastro-app']);

function normalize(selection) {
  if (!selection || !['relay', 'direct'].includes(selection.connectionMode)
    || !SERVER_IDS.has(selection.serverProfileId)) return { ...DEFAULT_SELECTION };
  const connectionMode = selection.connectionMode;
  const serverProfileId = connectionMode === 'direct' ? 'lastro-app'
    : selection.serverProfileId === 'lastro-app' ? 'lastro-2x' : selection.serverProfileId;
  return { connectionMode, serverProfileId };
}

export function readLoginPreferences() {
  try { return normalize(JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? 'null')); }
  catch { return { ...DEFAULT_SELECTION }; }
}

export function saveLoginPreferences(selection) {
  try { globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(normalize(selection))); }
  catch { /* Preferences are optional; account storage remains independent. */ }
}
