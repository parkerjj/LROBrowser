import { afterEach, expect, test, vi } from 'vitest';
import { createKoreIntegration, loadKorePackage } from '../src/kore/kore-integration.mjs';
import { packageFixture } from './kore-fixture';

afterEach(() => vi.useRealTimers());

test('absent and corrupt packages do not block the independent client', async () => {
  const page = { location: { href: 'http://localhost/' }, fetch: () => { throw Error('unexpected KE request'); } };
  const absent = createKoreIntegration({ page, manifest: { files: [] } });
  await absent.start();
  expect(absent.state.status).toBe('absent');
  const fixture = packageFixture();
  fixture.files.set(`ke/${fixture.manifest.packageId}/kore_wasm_bg.wasm`, new Uint8Array([1]));
  const host = createKoreIntegration({ page: { ...page, fetch: fixture.fetch }, manifest: fixture.executable });
  const nativeStartup = Promise.resolve('client initialized');
  await host.start();
  expect(host.state.status).toBe('failed');
  expect(await nativeStartup).toBe('client initialized');
  await expect(loadKorePackage({ page: { ...page, fetch: fixture.fetch }, manifest: fixture.executable })).rejects.toThrow();
});

test('Worker faults, post failures, stale responses and suspended probes stay isolated', async () => {
  vi.useFakeTimers();
  const fixture = packageFixture();
  const document = Object.assign(new EventTarget(), { hidden: false });
  let now = 100;
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    document, performance: { now: () => now }, setInterval, clearInterval, setTimeout, clearTimeout, crypto: globalThis.crypto });
  class ProbeWorker extends EventTarget {
    messages: Record<string, unknown>[] = [];
    terminated = false;
    failPost = false;
    postMessage(message: Record<string, unknown>) { if (this.failPost) throw Error('post failed'); this.messages.push(message); }
    terminate() { this.terminated = true; }
    reply(fields: Record<string, unknown>) { this.dispatchEvent(new MessageEvent('message', { data: fields })); }
  }
  let worker = new ProbeWorker();
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  const init = worker.messages[0]!;
  const ready = { ...init, type: 'ready', packageId: fixture.manifest.packageId, worldReady: false, aiState: 'off',
    buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } };
  worker.reply({ ...ready, runtimeSessionId: 'old-session' });
  expect(host.state.status).toBe('loading');
  worker.reply(ready);
  expect(host.state.status).toBe('runtime-ready');
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  const oldTick = worker.messages.at(-1)!;
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
  now += 60000; await vi.advanceTimersByTimeAsync(60000);
  expect(host.state.status).toBe('runtime-ready');
  document.hidden = false; document.dispatchEvent(new Event('visibilitychange'));
  worker.reply({ ...oldTick, type: 'tick', tickCount: 100, elapsedMs: 1 });
  expect(host.state.tickCount).toBe(0);
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  const tick = worker.messages.at(-1)!;
  worker.reply({ ...tick, type: 'tick', tickCount: 1, elapsedMs: 1000 });
  expect(host.state.tickCount).toBe(1);
  worker.dispatchEvent(new Event('error'));
  expect(host.state.status).toBe('failed');
  expect(worker.terminated).toBe(true);
  worker = new ProbeWorker();
  await host.start();
  worker.reply(ready);
  expect(host.state.status).toBe('loading');
  worker.reply({ ...ready, ...worker.messages[0], type: 'ready' });
  worker.failPost = true;
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  expect(host.state.status).toBe('failed');
  host.dispose();
  expect(host.state.status).toBe('disposed');
});

test('initialization and unanswered ticks expire only with foreground supervision', async () => {
  vi.useFakeTimers();
  const fixture = packageFixture();
  let now = 0;
  const page = Object.assign(new EventTarget(), { location: { href: 'http://localhost/' }, fetch: fixture.fetch,
    document: Object.assign(new EventTarget(), { hidden: false }), performance: { now: () => now },
    setInterval, clearInterval, setTimeout, clearTimeout, crypto: globalThis.crypto });
  const messages: Record<string, unknown>[] = [];
  const worker = Object.assign(new EventTarget(), { postMessage(message: Record<string, unknown>) { messages.push(message); }, terminate() {} });
  const host = createKoreIntegration({ page, manifest: fixture.executable, createWorker: () => worker });
  await host.start();
  for (let i = 0; i < 10; i++) { now += i === 0 ? 60000 : 1000; await vi.advanceTimersByTimeAsync(1000); }
  expect(host.state.status).toBe('failed');
  await host.start();
  const init = messages.at(-1)!;
  worker.dispatchEvent(new MessageEvent('message', { data: { ...init, type: 'ready', packageId: fixture.manifest.packageId,
    worldReady: false, aiState: 'off', buildInfo: { engineVersion: '0.1.0', bridgeApiVersion: 1, packetver: 20211103, target: 'wasm32-unknown-unknown' } } }));
  now += 1000; await vi.advanceTimersByTimeAsync(1000);
  expect(messages.at(-1)?.type).toBe('tick');
  for (let i = 0; i < 5; i++) { now += 1000; await vi.advanceTimersByTimeAsync(1000); }
  expect(host.state.status).toBe('failed');
  expect(messages.filter(message => message.type === 'tick')).toHaveLength(1);
});
