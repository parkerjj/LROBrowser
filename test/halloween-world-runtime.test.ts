import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { installHalloweenWorldRuntime } from '../src/halloween/halloween-world-runtime.mjs';
import { patchRuntimeHalloweenWorld, patchV2Runtime } from '../scripts/patch-v2-runtime.mjs';
import type { HalloweenWorldEntity } from '../src/halloween/halloween-world-runtime.mjs';

const source = readFileSync('vendor/v2/Online.js', 'utf8');

describe('Halloween game-world effects', () => {
  let active: boolean;
  let map: string;
  let entities: HalloweenWorldEntity[];
  let added: HalloweenWorldEntity[];
  let played: string[];
  let listeners: Record<string, Array<() => void>>;
  let animationCallbacks: Array<(tick: number) => boolean | void>;
  let runtime: ReturnType<typeof installHalloweenWorldRuntime>;

  class FakeEntity {
    static TYPE_MOB = 5;
    static TYPE_EFFECT = -5;
    GID = 0;
    objecttype = FakeEntity.TYPE_EFFECT;
    position: number[] = [0, 0, 0];
    hideShadow = false;
    direction = 0;
    attachments = {
      list: [] as Array<{ uid?: string; [key: string]: unknown }>,
      add: vi.fn((attachment: { uid?: string; [key: string]: unknown }) => { this.attachments.list.push(attachment); }),
      remove: vi.fn((uid: string) => { this.attachments.list = this.attachments.list.filter(item => item.uid !== uid); }),
    };
    animations = {
      add: vi.fn((callback: (tick: number) => boolean | void) => { animationCallbacks.push(callback); }),
    };
  }

  const makeMob = (job: number): HalloweenWorldEntity => ({
    GID: job,
    job,
    objecttype: FakeEntity.TYPE_MOB,
    position: [20, 30, 0],
    attachments: {
      list: [] as Array<{ uid?: string; [key: string]: unknown }>,
      add(attachment: { uid?: string; [key: string]: unknown }) { this.list.push(attachment); },
      remove(uid: string) { this.list = this.list.filter(item => item.uid !== uid); },
    },
    animations: { add: vi.fn() },
  });

  const install = () => {
    const manager = {
      add(entity: HalloweenWorldEntity) { added.push(entity); entities.push(entity); return entity; },
      remove(gid: number | string) { entities = entities.filter(entity => entity.GID !== gid); },
      forEach(callback: (entity: HalloweenWorldEntity) => void) { entities.forEach(callback); },
    };
    runtime = installHalloweenWorldRuntime({
      window: {
        addEventListener: (name: string, listener: () => void) => { (listeners[name] ??= []).push(listener); },
        removeEventListener: (name: string, listener: () => void) => { listeners[name] = (listeners[name] || []).filter(item => item !== listener); },
        setTimeout: globalThis.setTimeout,
        clearTimeout: globalThis.clearTimeout,
      },
      isActive: () => active,
      getMap: () => map,
      playBgm: (filename: string) => { played.push(filename); },
      Entity: FakeEntity,
      EntityManager: manager,
      getPlayer: () => ({ position: [20, 30, 0] }),
      getBodyPath: (id: number) => `data/sprite/mob/${id}`,
      getGroundHeight: () => 0,
    });
  };

  const change = () => (listeners['lastro-halloween-change'] || []).forEach(listener => listener());

  beforeEach(() => {
    vi.useFakeTimers();
    active = true;
    map = 'prontera.gat';
    entities = [makeMob(1120), makeMob(1179), makeMob(1002)];
    added = [];
    played = [];
    listeners = {};
    animationCallbacks = [];
  });

  afterEach(() => {
    runtime?.destroy();
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('uses the Niflheim track only in Prontera and restores each map track', () => {
    install();
    runtime.onMapLoaded({ mp3: '08.mp3' });
    expect(played).toEqual(['84.mp3']);

    active = false;
    change();
    expect(played).toEqual(['84.mp3', '08.mp3']);

    map = 'geffen.gat';
    runtime.onMapLoaded({ mp3: '13.mp3' });
    active = true;
    change();
    expect(played).toEqual(['84.mp3', '08.mp3', '13.mp3']);
  });

  it('adds the local ghost sprite to selected live mobs and clears it when disabled', () => {
    install();
    runtime.onMapLoaded({ mp3: '08.mp3' });

    expect(entities[0]!.attachments.list[0]).toMatchObject({ completeFile: 'data/sprite/mob/1120' });
    expect(entities[1]!.attachments.list[0]).toMatchObject({ completeFile: 'data/sprite/mob/1120' });
    expect(entities[2]!.attachments.list).toHaveLength(0);

    active = false;
    change();
    expect(entities[0]!.attachments.list).toHaveLength(0);
    expect(entities[1]!.attachments.list).toHaveLength(0);
  });

  it('flies one non-targetable RO bat across Prontera and removes it when disabled', () => {
    install();
    runtime.onMapLoaded({ mp3: '08.mp3' });
    vi.advanceTimersByTime(1200);

    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ objecttype: FakeEntity.TYPE_EFFECT, hideShadow: true });
    expect(added[0]!.attachments.list[0]).toMatchObject({ completeFile: 'data/sprite/mob/1111' });

    active = false;
    change();
    expect(entities).not.toContain(added[0]);
    expect(added[0]!.attachments.list).toHaveLength(0);
  });

  it('moves the bat using elapsed renderer ticks', () => {
    install();
    runtime.onMapLoaded({ mp3: '08.mp3' });
    vi.advanceTimersByTime(1200);
    const bat = added[0]!;
    const animate = animationCallbacks[0]!;
    const startX = bat.position[0]!;

    animate(0);
    expect(bat.position[0]).toBe(startX);
    animate(3250);
    expect(bat.position[0]).toBe(startX + 8);
    expect(animate(6500)).toBe(true);
    expect(bat.position[0]).toBe(startX + 16);
  });

  it('keeps scheduling bat flyovers after the previous bat is cleaned up', () => {
    install();
    runtime.onMapLoaded({ mp3: '08.mp3' });
    vi.spyOn(Math, 'random').mockReturnValue(0);

    vi.advanceTimersByTime(19200);

    expect(added).toHaveLength(2);
    expect(entities).toContain(added[1]);
  });

  it('injects the adapter at successful map completion', () => {
    const patched = patchV2Runtime(source);
    expect(patched).toContain('installHalloweenWorldRuntime');
    expect(patched).toContain('lastroHalloweenWorldRuntime.onMapLoaded({ mp3: lastroBaseBgm })');
    const rendererStart = patched.indexOf('Renderer.render(MapRenderer.onRender);');
    const portraitLoader = patched.indexOf('globalThis.lastroHalloweenPortraitLoader2026 ??=');
    expect(portraitLoader).toBeGreaterThan(rendererStart);
    expect(patched.includes('setMonsterPortraitLoader?.(globalThis.lastroHalloweenPortraitLoader2026)')).toBe(true);
    expect(patched).toContain('globalThis.LastROHalloweenEffects?.setMonsterPortraitLoader?.(deps.monsterPortrait)');
    expect(() => patchRuntimeHalloweenWorld('unrecognized upstream source')).toThrow('anchor:halloween-world-runtime');
  });
});
