import type { openEncryptedHttpStreams } from '../resources/direct-http-resource';
import { NativeSocket, type NativeSocketDependencies } from './native-socket';

export interface NativeTlsStreamsOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  dependencies?: NativeSocketDependencies;
}

/** Adapt the decrypted native connection to the existing HTTP byte streams. */
export async function openNativeTlsStreams(
  host: string,
  port: number,
  options: NativeTlsStreamsOptions = {},
): ReturnType<typeof openEncryptedHttpStreams> {
  const { signal } = options;
  signal?.throwIfAborted();

  return new Promise((resolve, reject) => {
    const socket = new NativeSocket({ kind: 'tls', host, port }, options.dependencies);
    let reader!: ReadableStreamDefaultController<Uint8Array>;
    let writer!: WritableStreamDefaultController;
    let opened = false;
    let finished = false;

    const finish = (error?: unknown, source?: 'reader' | 'writer' | 'peer') => {
      if (finished) {
        if (source === 'writer') socket.close();
        return;
      }
      finished = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      const closed = new Error('Native TLS connection closed');
      if (!opened) reject(error ?? closed);
      if (source !== 'reader') {
        if (error === undefined) reader.close();
        else reader.error(error);
      }
      // A peer EOF leaves the writer available for a normal close after the
      // final write, even when the EOF reached JS before its acknowledgment.
      if (source !== 'writer' && (source !== 'peer' || error !== undefined)) writer.error(error ?? closed);
      if (source !== 'peer') socket.close();
    };
    const abort = () => finish(signal?.reason);
    const timer = setTimeout(
      () => finish(new Error('Native TLS open timeout')),
      Math.max(1, options.timeoutMs ?? 8_000),
    );
    const readable = new ReadableStream<Uint8Array>({
      start(controller) { reader = controller; },
      cancel() { finish(undefined, 'reader'); },
    });
    const writable = new WritableStream<Uint8Array>({
      start(controller) {
        writer = controller;
        // The sink's abort callback waits for a pending write to settle. The
        // controller signal lets us cancel that write as soon as abort starts.
        controller.signal.addEventListener('abort', () => finish(controller.signal.reason, 'writer'), { once: true });
      },
      write(bytes) { return socket.sendAsync(bytes); },
      close() { finish(undefined, 'writer'); },
    });

    socket.onComplete = success => {
      if (finished) return;
      if (!success) {
        finish(socket.openError ?? new Error('Native TLS connection failed to open'));
        return;
      }
      opened = true;
      clearTimeout(timer);
      resolve({ readable, writable });
    };
    socket.onMessage = buffer => reader.enqueue(new Uint8Array(buffer));
    socket.onClose = error => finish(error, 'peer');
    signal?.addEventListener('abort', abort, { once: true });
  });
}
