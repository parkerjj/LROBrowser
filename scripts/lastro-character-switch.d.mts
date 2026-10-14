export function patchRuntimeCharacterSwitch(source: string): string;
export function patchRuntimeNetworkHandoffCleanup(source: string): string;
export function patchRuntimeMapChangeHandoff(source: string): string;

export function createLastroNpcSpawnGate<T extends { GID: number; objecttype: number }>(options: {
  isLoading(): boolean;
  isNpc(packet: T): boolean;
  replay(packet: T): void;
  maxPending?: number;
}): {
  capture(packet: T): boolean;
  vanish(gid: number): void;
  reset(): void;
  flush(): void;
  readonly size: number;
};
