import type { LegacyClientSocket } from './client-socket';

export type NativeNetEvent =
  | { type: 'open' }
  | { type: 'failed'; message: string }
  | { type: 'data'; bytes: ArrayBuffer }
  | { type: 'closed'; error?: string };

export interface NativeSocketDependencies {
  invoke(cmd: string, args?: Record<string, unknown>): Promise<unknown>;
  createChannel(onMessage: (event: NativeNetEvent) => void): unknown;
  schedule?: (callback: () => void) => void;
  reportError?: (error: unknown) => void;
}

interface NativeSocketTarget {
  kind: 'tcp' | 'tls' | 'relay';
  host: string;
  port: number;
}

type TauriNetEvent = NativeNetEvent | ArrayBuffer | { type: 'closed'; error: null };
interface TauriCore {
  invoke: NativeSocketDependencies['invoke'];
  Channel: new (onMessage: (event: TauriNetEvent) => void) => unknown;
}

function tauriDependencies(): NativeSocketDependencies {
  const core = (globalThis as { __TAURI__?: { core?: TauriCore } }).__TAURI__?.core;
  if (typeof core?.invoke !== 'function' || typeof core.Channel !== 'function') {
    throw new Error('Native networking is unavailable');
  }
  return {
    invoke: (cmd, args) => core.invoke(cmd, args),
    createChannel: onMessage => new core.Channel(event => {
      if (event instanceof ArrayBuffer) onMessage({ type: 'data', bytes: event });
      else if (event.type === 'closed' && event.error === null) onMessage({ type: 'closed' });
      else onMessage(event);
    }),
  };
}

function socketError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

export class NativeSocket implements LegacyClientSocket {
  connected = false;
  isZone?: boolean;
  handoffPending?: boolean;
  onComplete?: (success: boolean) => void;
  onMessage?: (buffer: ArrayBuffer) => void;
  onClose?: (error?: unknown) => void;

  private state: 'opening' | 'open' | 'closed' = 'opening';
  private id?: number;
  private failure?: Error;
  private pendingEvents: NativeNetEvent[] = [];
  private writeTail: Promise<void> = Promise.resolve();
  private cancelWrite?: (error: Error) => void;

  constructor(private readonly target: NativeSocketTarget, private deps?: NativeSocketDependencies) {
    const schedule = deps?.schedule ?? (callback => globalThis.queueMicrotask(callback));
    schedule(() => { void this.initialize(); });
  }

  get openError(): Error | undefined { return this.failure; }

  send(buffer: ArrayBuffer): void {
    void this.sendAsync(buffer).catch(() => undefined);
  }

  /** Resolve only after the native write is acknowledged. */
  sendAsync(buffer: ArrayBuffer | Uint8Array): Promise<void> {
    if (this.state !== 'open') return Promise.reject(this.failure ?? new Error('Native socket is not open'));
    const bytes = new Uint8Array(buffer instanceof ArrayBuffer ? buffer.slice(0) : buffer);
    const pending = this.writeTail.then(() => this.write(bytes));
    this.writeTail = pending.catch(() => undefined);
    return pending;
  }

  close(): void {
    if (this.isFinished()) {
      this.cancelWrite?.(this.failure ?? new Error('Native socket is closed'));
      return;
    }
    this.finish();
  }

  private async initialize(): Promise<void> {
    // The legacy client installs its callbacks before this microtask runs.
    if (this.state !== 'opening') return;
    try {
      const deps = this.deps ??= tauriDependencies();
      const onEvent = deps.createChannel(event => this.receive(event));
      const id = await deps.invoke('net_open', { ...this.target, onEvent });
      if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 0) {
        throw new Error('Native socket returned an invalid connection ID');
      }
      this.id = id;
      if (this.isFinished()) {
        await this.closeNative();
        return;
      }
      // The native task may open, deliver bytes, and reach EOF before the
      // command returns. Replay that ordered sequence once the ID is usable.
      const events = this.pendingEvents;
      this.pendingEvents = [];
      for (const event of events) this.receive(event);
    } catch (error) {
      this.finish(socketError(error));
    }
  }

  private isFinished(): boolean {
    return this.state === 'closed';
  }

  private receive(event: NativeNetEvent): void {
    if (this.isFinished()) return;
    if (this.id === undefined) {
      this.pendingEvents.push(event);
      return;
    }
    switch (event.type) {
      case 'open':
        if (this.state !== 'opening') return;
        this.state = 'open';
        this.connected = true;
        this.notify(() => this.onComplete?.(true));
        break;
      case 'data':
        if (this.state === 'open') this.notify(() => this.onMessage?.(event.bytes));
        break;
      case 'failed':
        this.finish(new Error(event.message), true);
        break;
      case 'closed':
        this.finish(event.error === undefined ? undefined : new Error(event.error), true);
        break;
    }
  }

  private async write(bytes: Uint8Array): Promise<void> {
    if (this.state !== 'open') throw this.failure ?? new Error('Native socket is closed');
    try {
      await new Promise<void>((resolve, reject) => {
        this.cancelWrite = reject;
        void this.deps!.invoke('net_send', { id: this.id, bytes: Array.from(bytes) }).then(() => resolve(), reject);
      });
    } catch (cause) {
      const error = socketError(cause);
      this.finish(error);
      throw error;
    } finally {
      this.cancelWrite = undefined;
    }
  }

  private finish(error?: Error, fromPeer = false): void {
    if (this.isFinished()) return;
    const wasOpen = this.state === 'open';
    this.state = 'closed';
    this.connected = false;
    this.failure = error;
    this.pendingEvents = [];
    // A clean EOF can cross the reply to a successful write in IPC. Let
    // that write settle so the caller can read the buffered response.
    if (!fromPeer || error) this.cancelWrite?.(error ?? new Error('Native socket is closed'));
    if (fromPeer) this.id = undefined;
    else void this.closeNative();
    if (wasOpen) {
      this.notify(() => this.onClose?.(error));
    } else {
      this.notify(() => this.onComplete?.(false));
      if (error) this.report(error);
    }
  }

  private async closeNative(): Promise<void> {
    const id = this.id;
    if (id === undefined) return;
    this.id = undefined;
    try {
      await this.deps!.invoke('net_close', { id });
    } catch (error) {
      this.report(error);
    }
  }

  private notify(callback: () => void): void {
    try { callback(); } catch (error) { this.report(error); }
  }

  private report(error: unknown): void {
    if (this.deps?.reportError) this.deps.reportError(error);
    else globalThis.reportError?.(error);
  }
}

export function createNativeSocketFactories(deps?: NativeSocketDependencies): {
  direct: (host: string, port: number) => LegacyClientSocket;
  relay: (url: string) => LegacyClientSocket;
} {
  return {
    direct: (host, port) => new NativeSocket({ kind: 'tcp', host, port }, deps),
    relay: url => new NativeSocket({ kind: 'relay', host: url, port: 0 }, deps),
  };
}
