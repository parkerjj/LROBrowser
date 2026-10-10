import { describe, expect, it } from 'vitest';
import { createResourceScheduler, resourcePriority } from '../src/resources/resource-scheduler';

function deferred() {
  let complete!: () => void;
  const promise = new Promise<void>(resolve => { complete = resolve; });
  return { promise, complete };
}

describe('resource scheduler', () => {
  it('limits active requests and starts queued maps before sprites and music', async () => {
    const schedule = createResourceScheduler(1);
    const first = deferred(), order: string[] = [];
    const a = schedule(async () => { order.push('first'); await first.promise; return 1; }, 2);
    const audio = schedule(async () => { order.push('audio'); return 2; }, 1);
    const sprite = schedule(async () => { order.push('sprite'); return 3; }, 5);
    const map = schedule(async () => { order.push('map'); return 4; }, 10);
    expect(order).toEqual(['first']);
    first.complete();
    expect(await Promise.all([a, audio, sprite, map])).toEqual([1, 2, 3, 4]);
    expect(order).toEqual(['first', 'map', 'sprite', 'audio']);
  });

  it('releases capacity after both success and failure', async () => {
    const schedule = createResourceScheduler(1);
    await expect(schedule(async () => { throw new Error('offline'); })).rejects.toThrow('offline');
    await expect(schedule(async () => 42)).resolves.toBe(42);
  });

  it('recognizes critical maps and prioritizes sprites over audio', () => {
    expect(resourcePriority('data/map/prt.gnd')).toBeGreaterThan(resourcePriority('data/sprite/poring.spr'));
    expect(resourcePriority('data/sprite/poring.spr')).toBeGreaterThan(resourcePriority('BGM/01.mp3'));
    expect(() => createResourceScheduler(0)).toThrow();
  });
});
