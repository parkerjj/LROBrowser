import { afterEach, describe, expect, it, vi } from 'vitest';
import { startOptionalKore } from '../src/kore/kore-integration.mjs';
import { packageFixture, TestWorkerStub } from './kore-fixture';
import { keBuildTarget, resolveKeQueueMode } from '../src/kore/ke-queue-mode.mjs';

const storageWith = (value: string | null) => ({ getItem: (key: string) => (key === 'lro.keQueueMode' ? value : null) });

describe('resolveKeQueueMode', () => {
  it('defaults to auto for iwa and web', () => {
    expect(resolveKeQueueMode({ buildTarget: 'iwa' })).toBe('auto');
    expect(resolveKeQueueMode({ buildTarget: 'web' })).toBe('auto');
  });

  it('defaults to plain for native', () => {
    expect(resolveKeQueueMode({ buildTarget: 'native' })).toBe('plain');
  });

  it('lets localStorage override the default for every target', () => {
    for (const buildTarget of ['iwa', 'web', 'native']) {
      expect(resolveKeQueueMode({ buildTarget, storage: storageWith('shared') })).toBe('shared');
      expect(resolveKeQueueMode({ buildTarget, storage: storageWith('plain') })).toBe('plain');
      expect(resolveKeQueueMode({ buildTarget, storage: storageWith('auto') })).toBe('auto');
    }
  });

  it('ignores invalid, missing or throwing storage', () => {
    expect(resolveKeQueueMode({ buildTarget: 'native', storage: storageWith('bogus') })).toBe('plain');
    expect(resolveKeQueueMode({ buildTarget: 'iwa', storage: storageWith(null) })).toBe('auto');
    expect(resolveKeQueueMode({ buildTarget: 'iwa', storage: storageWith('') })).toBe('auto');
    const throwing = { getItem: () => { throw new Error('SecurityError'); } };
    expect(resolveKeQueueMode({ buildTarget: 'native', storage: throwing })).toBe('plain');
    expect(resolveKeQueueMode({ buildTarget: 'iwa', storage: null })).toBe('auto');
  });

  it('treats an unknown build target like iwa', () => {
    expect(resolveKeQueueMode({ buildTarget: 'something-else' })).toBe('auto');
  });
});

describe('keBuildTarget', () => {
  it('derives the target from the page globals', () => {
    expect(keBuildTarget({})).toBe('iwa');
    expect(keBuildTarget({ LastROWebBuild: true })).toBe('web');
    expect(keBuildTarget({ LastRONativeBuild: true })).toBe('native');
    expect(keBuildTarget({ LastRONativeBuild: true, LastROWebBuild: true })).toBe('native');
  });
});

describe('startOptionalKore wiring', () => {
  afterEach(() => { vi.unstubAllGlobals(); delete (globalThis as { KoreEngine?: unknown }).KoreEngine; });

  async function startWith(globals: Record<string, unknown>, options: Record<string, unknown> = {}) {
    const fixture = packageFixture('lastro-20211103', {}, 2, 2, ['fourQueues', 'oneShotDeadline', 'residentExecutor', 'plainQueues']);
    const worker = new TestWorkerStub();
    vi.stubGlobal('LastROExecutableManifest', fixture.executable);
    vi.stubGlobal('fetch', fixture.fetch);
    vi.stubGlobal('location', { href: 'http://localhost/' });
    for (const [key, value] of Object.entries(globals)) vi.stubGlobal(key, value);
    const host = startOptionalKore({ createWorker: () => worker, ...options });
    await vi.waitFor(() => expect(worker.messages.length).toBeGreaterThan(0));
    return { host, worker };
  }

  it('uses plain on the native build and forwards it to the Worker', async () => {
    const { worker } = await startWith({ LastRONativeBuild: true });
    expect(worker.messages[0]).toMatchObject({ type: 'residentInit', queueMode: 'plain' });
  });

  it('keeps auto on the IWA build', async () => {
    const { worker } = await startWith({});
    expect(worker.messages[0]).toMatchObject({ type: 'residentInit', queueMode: 'auto' });
  });

  it('honours the localStorage override', async () => {
    const { worker } = await startWith({ localStorage: storageWith('plain') });
    expect(worker.messages[0]).toMatchObject({ type: 'residentInit', queueMode: 'plain' });
  });

  it('lets an explicit option win over everything else', async () => {
    const { worker } = await startWith({ LastRONativeBuild: true, localStorage: storageWith('plain') }, { queueMode: 'shared' });
    expect(worker.messages[0]).toMatchObject({ type: 'residentInit', queueMode: 'shared' });
  });
});
