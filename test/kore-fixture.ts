import { createHash } from 'node:crypto';

export const digest = (value: Uint8Array | string) => createHash('sha256').update(value).digest('hex');
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : 1).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export function packageFixture(profile = 'lastro-20211103', extraFiles: Record<string, string> = {}, bridgeApiVersion: 1 | 2 = 2) {
  const payload = new Map<string, Uint8Array>([
    ['kore-worker.mjs', new TextEncoder().encode('export {};')],
    ['kore_wasm.js', new TextEncoder().encode('export default function init() {}')],
    ['kore_wasm_bg.wasm', new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0])],
  ]);
  for (const [name, text] of Object.entries(extraFiles)) payload.set(name, new TextEncoder().encode(text));
  const kind = (name: string) => name.endsWith('.json') ? 'data-json' : name.endsWith('.txt') ? 'passive' : name.endsWith('.wasm') ? 'wasm' : 'runtime';
  const metadata = {
    schemaVersion: 1, engineVersion: '0.1.0', bridgeApiVersion,
    ...(bridgeApiVersion === 2 ? { schedulerCapabilities: ['fourQueues', 'oneShotDeadline', 'residentExecutor'] } : {}),
    packetver: 20211103,
    profile, commitSha: null, sourceDirty: true, mode: 'debug',
    toolVersions: { rust: '1.99.0', wasmBindgen: '0.2.129', binaryen: null },
    files: [...payload].map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: digest(bytes), kind: kind(name) })).sort((a, b) => a.path < b.path ? -1 : 1),
  };
  const manifest = { ...metadata, packageId: digest(JSON.stringify(canonical(metadata))) };
  const prefix = `ke/${manifest.packageId}/`;
  const files = new Map([...payload].map(([name, bytes]) => [prefix + name, bytes]));
  files.set(prefix + 'manifest.json', new TextEncoder().encode(JSON.stringify(manifest)));
  files.set('ke/active.json', new TextEncoder().encode(JSON.stringify({ schemaVersion: 1, packageId: manifest.packageId, manifestPath: prefix + 'manifest.json' })));
  const executable = { files: [...files].map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: digest(bytes), kind: kind(name) })) };
  const fetch = async (url: URL | string) => {
    const bytes = files.get(new URL(url).pathname.slice('/core/'.length));
    return new Response(bytes ? new Uint8Array(bytes) : null, { status: bytes ? 200 : 404 });
  };
  return { manifest, payload, files, executable, fetch };
}

export interface TestBridgeRecord {
  [key: string]: unknown;
  kind?: string;
  context?: Record<string, unknown>;
}

export interface TestWorkerMessage {
  [key: string]: unknown;
  type?: string;
  runtimeSessionId?: string;
  requestId?: number;
  record?: TestBridgeRecord;
}

export function bridgeRecord(message: TestWorkerMessage): TestBridgeRecord {
  if (!message.record) throw new Error('Expected a bridge record');
  return message.record;
}

export function objectRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') throw new Error('Expected an object');
  return value as Record<string, unknown>;
}

export class TestWorkerStub extends EventTarget {
  messages: TestWorkerMessage[] = [];
  terminated = false;
  postError: Error | null = null;
  postMessage(message: unknown) {
    if (this.postError) throw this.postError;
    if (!message || typeof message !== 'object') throw new TypeError('Worker message must be an object');
    this.messages.push(message as TestWorkerMessage);
  }
  terminate() { this.terminated = true; }
  reply(message: unknown) { this.dispatchEvent(new MessageEvent('message', { data: message })); }
}
