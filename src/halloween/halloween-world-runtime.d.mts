export interface HalloweenWorldEntity {
  GID: number | string;
  objecttype: number;
  job?: number;
  _job?: number;
  position: number[] | Float32Array;
  direction?: number;
  hideShadow?: boolean;
  attachments: {
    list: Array<{ uid?: string; [key: string]: unknown }>;
    add(attachment: Record<string, unknown>): void;
    remove(uid: string): void;
  };
  animations: {
    add(callback: (tick: number) => boolean | void): void;
  };
}

interface HalloweenWorldDependencies {
  window: {
    addEventListener(type: string, listener: () => void): void;
    removeEventListener(type: string, listener: () => void): void;
    setTimeout(handler: () => void, timeout?: number): ReturnType<typeof setTimeout>;
    clearTimeout(handle: ReturnType<typeof setTimeout>): void;
  };
  isActive(): boolean;
  getMap(): string;
  playBgm(filename: string): void;
  Entity: {
    new(): HalloweenWorldEntity;
    TYPE_MOB: number;
    TYPE_EFFECT: number;
  };
  EntityManager: {
    add(entity: HalloweenWorldEntity): HalloweenWorldEntity | void;
    remove(gid: number | string): void;
    forEach(callback: (entity: HalloweenWorldEntity) => void): void;
  };
  getPlayer(): { position: ArrayLike<number> } | null | undefined;
  getBodyPath(id: number): string | null | undefined;
  getGroundHeight(x: number, y: number): number;
}

export interface HalloweenWorldRuntime {
  onMapLoaded(mapInfo?: { mp3?: string } | null): void;
  destroy(): void;
}

export function installHalloweenWorldRuntime(deps: HalloweenWorldDependencies): HalloweenWorldRuntime;
