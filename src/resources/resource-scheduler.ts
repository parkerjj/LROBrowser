/**
 * Bounds concurrent resource resolutions (including IndexedDB reads and body
 * downloads) so large map transitions cannot exhaust TCP sockets or memory.
 * Requests for already-in-flight paths are coalesced before they reach here.
 */
export function createResourceScheduler(maxConcurrent: number) {
  if (!Number.isSafeInteger(maxConcurrent) || maxConcurrent < 1) throw new Error('Invalid resource concurrency');
  let active = 0;
  const waiting: { priority: number; start: () => void }[] = [];
  const drain = () => {
    while (active < maxConcurrent && waiting.length) waiting.shift()!.start();
  };
  return function schedule<T>(work: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        active += 1;
        let pending: Promise<T>;
        try { pending = work(); }
        catch (error) { pending = Promise.reject(error); }
        void pending.then(resolve, reject).finally(() => {
          active -= 1;
          drain();
        });
      };
      // Stable FIFO for equal priority, map/visible sprites ahead of audio.
      const item = { priority, start };
      const index = waiting.findIndex(candidate => candidate.priority < priority);
      if (index < 0) waiting.push(item);
      else waiting.splice(index, 0, item);
      drain();
    });
  };
}

export function resourcePriority(path: string): number {
  if (/\.(?:gat|gnd|rsw|rsm2?)$/i.test(path)) return 10;
  if (/\.(?:act|spr|bmp|png|tga|dds|jpg|jpeg)$/i.test(path)) return 5;
  if (/\.(?:wav|ogg|mp3)$/i.test(path)) return 1;
  return 3;
}
