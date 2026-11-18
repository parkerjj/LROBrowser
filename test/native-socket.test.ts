import { afterEach, describe, expect, it, vi } from 'vitest';
import { createNativeSocketFactories, NativeSocket, type NativeNetEvent, type NativeSocketDependencies } from '../src/network/native-socket';

const target = { kind: 'tcp', host: 'example.com', port: 26600 } as const;
const packet = (...bytes: number[]) => new Uint8Array(bytes).buffer;

function harness() {
  let emit!: (event: NativeNetEvent) => void;
  const invoke = vi.fn<NativeSocketDependencies['invoke']>(async cmd => cmd === 'net_open' ? 12 : undefined);
  const reportError = vi.fn();
  const deps = {
    invoke,
    createChannel(onMessage: (event: NativeNetEvent) => void) { emit = onMessage; return 'test-channel'; },
    reportError,
  };
  const socket = new NativeSocket(target, deps);
  socket.onComplete = vi.fn();
  socket.onClose = vi.fn();
  socket.onMessage = vi.fn();
  return { socket, invoke, deps, reportError, emit: (event: NativeNetEvent) => emit(event), async open() {
    await Promise.resolve();
    emit({ type: 'open' });
    await vi.waitFor(() => expect(socket.connected).toBe(true));
  } };
}

afterEach(() => vi.unstubAllGlobals());

describe('NativeSocket', () => {
  it('does not open a connection when closed before initialization', async () => {
    const { socket, invoke } = harness();
    socket.close();
    await Promise.resolve();
    expect(invoke).not.toHaveBeenCalled();
    expect(socket.onComplete).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('opens once and reports success', async () => {
    const { socket, invoke, open, emit } = harness();
    expect(invoke).not.toHaveBeenCalled();
    await open();
    emit({ type: 'open' });
    expect(invoke).toHaveBeenCalledExactlyOnceWith('net_open', { ...target, onEvent: 'test-channel' });
    expect(socket.onComplete).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('reports open failure once and never calls onClose', async () => {
    const { socket, emit, reportError } = harness();
    await Promise.resolve();
    emit({ type: 'failed', message: 'refused' });
    emit({ type: 'closed', error: 'refused' });
    await vi.waitFor(() => expect(socket.onComplete).toHaveBeenCalledExactlyOnceWith(false));
    expect(reportError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ message: 'refused' }));
    expect(socket.onClose).not.toHaveBeenCalled();
  });

  it('reports a rejected open command as a connection failure', async () => {
    const { socket, invoke } = harness();
    invoke.mockRejectedValueOnce('Invalid destination');
    await vi.waitFor(() => expect(socket.onComplete).toHaveBeenCalledExactlyOnceWith(false));
    expect(socket.onClose).not.toHaveBeenCalled();
  });

  it('copies the buffer passed to send so the caller can reuse it', async () => {
    const { socket, invoke, open } = harness();
    await open();
    const bytes = packet(1, 2);
    socket.send(bytes);
    new Uint8Array(bytes).fill(0);
    await vi.waitFor(() => expect(invoke).toHaveBeenLastCalledWith('net_send', { id: 12, bytes: [1, 2] }));
  });

  it('serializes writes in call order', async () => {
    const { socket, invoke, open } = harness();
    await open();
    let ack!: () => void;
    invoke.mockImplementationOnce(() => new Promise(resolve => { ack = () => resolve(undefined); }));
    const first = socket.sendAsync(packet(1));
    const second = socket.sendAsync(packet(2));
    await Promise.resolve();
    expect(invoke.mock.calls.slice(1)).toEqual([['net_send', { id: 12, bytes: [1] }]]);
    ack();
    await Promise.all([first, second]);
    expect(invoke.mock.calls.slice(1)).toEqual([
      ['net_send', { id: 12, bytes: [1] }], ['net_send', { id: 12, bytes: [2] }],
    ]);
  });

  it('delivers data events as ArrayBuffer to onMessage without reordering', async () => {
    const { socket, emit, open } = harness();
    await open();
    emit({ type: 'data', bytes: packet(1, 2) });
    emit({ type: 'data', bytes: packet(3) });
    emit({ type: 'closed' });
    emit({ type: 'closed' });
    expect(vi.mocked(socket.onMessage!).mock.calls).toEqual([[packet(1, 2)], [packet(3)]]);
    expect(socket.onClose).toHaveBeenCalledOnce();
    expect(socket.connected).toBe(false);
  });

  it('close is idempotent and drops queued writes', async () => {
    const { socket, invoke, open } = harness();
    await open();
    invoke.mockImplementationOnce(() => new Promise(() => undefined));
    const first = socket.sendAsync(packet(1));
    const second = socket.sendAsync(packet(2));
    await Promise.resolve();
    socket.close();
    socket.close();
    expect((await Promise.allSettled([first, second])).map(result => result.status)).toEqual(['rejected', 'rejected']);
    expect(invoke.mock.calls.slice(1)).toEqual([['net_send', { id: 12, bytes: [1] }], ['net_close', { id: 12 }]]);
    expect(socket.onClose).toHaveBeenCalledOnce();
  });

  it('closes once when invoking a write throws synchronously', async () => {
    const { socket, invoke, open } = harness();
    await open();
    invoke.mockImplementationOnce(() => { throw new Error('write unavailable'); });
    await expect(socket.sendAsync(packet(1))).rejects.toThrow('write unavailable');
    expect(socket.onClose).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ message: 'write unavailable' }));
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 12 });
  });

  it('closes a late open without firing a successful connection callback', async () => {
    const { socket, invoke, emit } = harness();
    let returnId!: (id: number) => void;
    invoke.mockImplementationOnce(() => new Promise(resolve => { returnId = resolve; }));
    await Promise.resolve();
    emit({ type: 'open' });
    socket.close();
    expect(invoke).toHaveBeenCalledOnce();
    returnId(24);
    await vi.waitFor(() => expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 24 }));
    expect(socket.onComplete).toHaveBeenCalledExactlyOnceWith(false);
    expect(socket.onClose).not.toHaveBeenCalled();
  });

  it('preserves isZone and handoffPending across close', async () => {
    const { socket, open } = harness();
    await open();
    socket.isZone = true;
    socket.handoffPending = true;
    socket.close();
    expect(socket).toMatchObject({ connected: false, isZone: true, handoffPending: true });
  });

  it('relay kind forwards the full wss url and ignores the port', async () => {
    const { deps, invoke, socket } = harness();
    socket.close();
    const url = 'wss://port.lastro.cn/example.com:26600';
    createNativeSocketFactories(deps).relay(url);
    await Promise.resolve();
    expect(invoke).toHaveBeenCalledExactlyOnceWith('net_open', { kind: 'relay', host: url, port: 0, onEvent: 'test-channel' });
  });

  it('normalizes binary messages from the global Tauri channel, including data and EOF received before the id', async () => {
    class Channel {
      constructor(readonly onmessage: (event: unknown) => void) {}
    }
    vi.stubGlobal('__TAURI__', { core: { Channel, invoke: async (_cmd: string, { onEvent }: { onEvent: Channel }) => {
      onEvent.onmessage({ type: 'open' });
      onEvent.onmessage(packet(1, 2));
      onEvent.onmessage({ type: 'closed', error: null });
      return 12;
    } } });
    const socket = new NativeSocket(target);
    const events: unknown[] = [];
    socket.onComplete = success => events.push(success);
    socket.onMessage = buffer => events.push(buffer);
    socket.onClose = error => events.push(error);
    await vi.waitFor(() => expect(events).toEqual([true, packet(1, 2), undefined]));
    expect(socket.connected).toBe(false);
  });
});
