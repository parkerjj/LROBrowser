import { createHash } from 'node:crypto';

export const digest = (value: Uint8Array | string) => createHash('sha256').update(value).digest('hex');
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : 1).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export function packageFixture(profile = 'lastro-20211103') {
  const payload = new Map<string, Uint8Array>([
    ['kore-worker.mjs', new TextEncoder().encode('export {};')],
    ['kore_wasm.js', new TextEncoder().encode('export default function init() {}')],
    ['kore_wasm_bg.wasm', new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0])],
  ]);
  const metadata = {
    schemaVersion: 1, engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103,
    profile, commitSha: null, sourceDirty: true, mode: 'debug',
    toolVersions: { rust: '1.99.0', wasmBindgen: '0.2.129', binaryen: null },
    files: [...payload].map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: digest(bytes), kind: name.endsWith('.wasm') ? 'wasm' : 'runtime' })),
  };
  const manifest = { ...metadata, packageId: digest(JSON.stringify(canonical(metadata))) };
  const prefix = `ke/${manifest.packageId}/`;
  const files = new Map([...payload].map(([name, bytes]) => [prefix + name, bytes]));
  files.set(prefix + 'manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  files.set('ke/active.json', new TextEncoder().encode(JSON.stringify({ schemaVersion: 1, packageId: manifest.packageId, manifestPath: prefix + 'manifest.json' })));
  const executable = { files: [...files].map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: digest(bytes), kind: name.endsWith('.json') ? 'data-json' : name.endsWith('.wasm') ? 'wasm' : 'runtime' })) };
  const fetch = async (url: URL | string) => {
    const bytes = files.get(new URL(url).pathname.slice('/core/'.length));
    return new Response(bytes ? new Uint8Array(bytes) : null, { status: bytes ? 200 : 404 });
  };
  return { manifest, payload, files, executable, fetch };
}
