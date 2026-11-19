import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NativeNetEvent, NativeSocketDependencies } from '../src/network/native-socket';
import { openNativeTlsStreams } from '../src/network/native-tls-streams';

const chunk = (...bytes: number[]) => new Uint8Array(bytes);

function harness() {
  let emit!: (event: NativeNetEvent) => void;
  const invoke = vi.fn<NativeSocketDependencies['invoke']>(async cmd => cmd === 'net_open' ? 9 : undefined);
  const dependencies = {
    invoke,
    createChannel(onMessage: (event: NativeNetEvent) => void) { emit = onMessage; return 'tls-channel'; },
  };
  const start = (options?: { signal?: AbortSignal; timeoutMs?: number }) =>
    openNativeTlsStreams('game.lastro.cn', 443, { ...options, dependencies });
  const open = async (options?: { signal?: AbortSignal }) => {
    const opening = start(options);
    await Promise.resolve();
    emit({ type: 'open' });
    return opening;
  };
  return { invoke, start, open, emit: (event: NativeNetEvent) => emit(event) };
}

afterEach(() => vi.useRealTimers());

describe('openNativeTlsStreams', () => {
  it('waits for native writes and sends only the supplied view', async () => {
    const { invoke, open } = harness();
    const { writable } = await open();
    expect(invoke).toHaveBeenLastCalledWith('net_open', { kind: 'tls', host: 'game.lastro.cn', port: 443, onEvent: 'tls-channel' });
    let ack!: () => void;
    invoke.mockImplementationOnce(() => new Promise(resolve => { ack = () => resolve(undefined); }));
    const writer = writable.getWriter();
    const complete = vi.fn();
    const writing = writer.write(chunk(7, 1, 2, 8).subarray(1, 3)).then(complete);
    await vi.waitFor(() => expect(invoke).toHaveBeenLastCalledWith('net_send', { id: 9, bytes: [1, 2] }));
    expect(complete).not.toHaveBeenCalled();
    ack();
    await writing;
    expect(complete).toHaveBeenCalledOnce();
    await writer.close();
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 9 });
  });

  it('drains data received before the id and closes gracefully on peer EOF', async () => {
    const { emit, start } = harness();
    const opening = start();
    await Promise.resolve();
    emit({ type: 'open' });
    emit({ type: 'data', bytes: chunk(1, 2).buffer });
    emit({ type: 'data', bytes: chunk(3).buffer });
    emit({ type: 'closed' });
    const { readable, writable } = await opening;
    const reader = readable.getReader();
    expect(await reader.read()).toEqual({ done: false, value: chunk(1, 2) });
    expect(await reader.read()).toEqual({ done: false, value: chunk(3) });
    expect(await reader.read()).toEqual({ done: true, value: undefined });
    await expect(writable.getWriter().write(chunk(4))).rejects.toThrow();
  });

  it('lets an acknowledged write finish if the peer closes while its IPC reply is pending', async () => {
    const { emit, invoke, open } = harness();
    const { readable, writable } = await open();
    let ack!: () => void;
    invoke.mockImplementationOnce(() => new Promise(resolve => { ack = () => resolve(undefined); }));
    const writer = writable.getWriter();
    const writing = writer.write(chunk(1));
    await vi.waitFor(() => expect(invoke).toHaveBeenLastCalledWith('net_send', { id: 9, bytes: [1] }));
    emit({ type: 'data', bytes: chunk(2).buffer });
    emit({ type: 'closed' });
    ack();
    await expect(writing).resolves.toBeUndefined();
    await expect(writer.close()).resolves.toBeUndefined();
    expect(await readable.getReader().read()).toEqual({ done: false, value: chunk(2) });
  });

  it('propagates send failures to both streams', async () => {
    const { invoke, open } = harness();
    const { readable, writable } = await open();
    invoke.mockRejectedValueOnce('send failed');
    const reading = expect(readable.getReader().read()).rejects.toThrow('send failed');
    await expect(writable.getWriter().write(chunk(1))).rejects.toThrow('send failed');
    await reading;
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 9 });
  });

  it('propagates a peer read error to both streams', async () => {
    const { emit, open } = harness();
    const { readable, writable } = await open();
    emit({ type: 'closed', error: 'connection reset' });
    await expect(readable.getReader().read()).rejects.toThrow('connection reset');
    await expect(writable.getWriter().write(chunk(1))).rejects.toThrow('connection reset');
  });

  it('cancels an in-flight write even if the native reply never arrives', async () => {
    const { invoke, open } = harness();
    const { readable, writable } = await open();
    const writer = writable.getWriter();
    invoke.mockImplementationOnce(() => new Promise(() => undefined));
    const writing = expect(writer.write(chunk(1))).rejects.toThrow();
    await vi.waitFor(() => expect(invoke).toHaveBeenLastCalledWith('net_send', { id: 9, bytes: [1] }));
    await writer.abort(new Error('cleanup'));
    await writing;
    await expect(readable.getReader().read()).rejects.toThrow('cleanup');
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 9 });
  });

  it('can abort a stalled write after the peer reaches EOF', async () => {
    const { emit, invoke, open } = harness();
    const { writable } = await open();
    const writer = writable.getWriter();
    invoke.mockImplementationOnce(() => new Promise(() => undefined));
    const writing = writer.write(chunk(1));
    void writing.catch(() => undefined);
    await vi.waitFor(() => expect(invoke).toHaveBeenLastCalledWith('net_send', { id: 9, bytes: [1] }));
    emit({ type: 'closed' });
    await writer.abort();
    await expect(writing).rejects.toThrow();
  });

  it('closes the connection when a response reader is cancelled', async () => {
    const { invoke, open } = harness();
    const { readable, writable } = await open();
    await readable.cancel();
    await expect(writable.getWriter().write(chunk(1))).rejects.toThrow();
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 9 });
  });

  it('rejects with the native handshake failure', async () => {
    const { emit, start } = harness();
    const opening = expect(start()).rejects.toThrow('certificate rejected');
    await Promise.resolve();
    emit({ type: 'failed', message: 'certificate rejected' });
    await opening;
  });

  it('rejects a timed-out open and closes the late id', async () => {
    vi.useFakeTimers();
    const { invoke, start } = harness();
    let returnId!: (id: number) => void;
    invoke.mockImplementationOnce(() => new Promise(resolve => { returnId = resolve; }));
    const opening = expect(start({ timeoutMs: 50 })).rejects.toThrow(/timeout/i);
    await vi.advanceTimersByTimeAsync(50);
    await opening;
    returnId(10);
    await Promise.resolve();
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 10 });
  });

  it('does not open a socket for an already aborted signal', async () => {
    const { invoke, start } = harness();
    await expect(start({ signal: AbortSignal.abort(new Error('cancelled')) })).rejects.toThrow('cancelled');
    expect(invoke).not.toHaveBeenCalled();
  });

  it('aborts open streams and their pending reads', async () => {
    const { invoke, open } = harness();
    const controller = new AbortController();
    const { readable, writable } = await open({ signal: controller.signal });
    const reading = expect(readable.getReader().read()).rejects.toThrow('cancelled');
    controller.abort(new Error('cancelled'));
    await reading;
    await expect(writable.getWriter().write(chunk(1))).rejects.toThrow('cancelled');
    expect(invoke).toHaveBeenLastCalledWith('net_close', { id: 9 });
  });
});
