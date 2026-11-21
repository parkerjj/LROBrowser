import { classifyResource } from './resource-policy';

export function nativeResourceBaseUrl(protocol = globalThis.location.protocol): string {
  return protocol === 'http:' || protocol === 'https:' ? `${protocol}//lro.localhost/` : 'lro://localhost/';
}

export function createNativeResourceFetch(base: URL | string, transport = globalThis.fetch): typeof fetch {
  return async (input, init) => {
    const request = input instanceof Request ? input : undefined;
    const upstream = new URL(request?.url ?? String(input));
    const root = upstream.origin === 'https://game.lastro.cn' ? 'lastro'
      : upstream.origin === 'https://rodata.ltsd.ro' ? 'rodata' : undefined;
    const prefix = '/ro/client_re/';
    if (!root || upstream.username || upstream.password || upstream.search || upstream.hash
      || !upstream.pathname.startsWith(prefix) || (init?.method ?? request?.method ?? 'GET').toUpperCase() !== 'GET') {
      throw new TypeError('Invalid native resource request');
    }
    const resource = upstream.pathname.slice(prefix.length);
    // Resolver candidates can contain GBK or CP949 bytes. Preserve the original
    // escapes on the wire, and let Rust validate decoded path segments.
    if (classifyResource(resource.replace(/%[0-9a-f]{2}/gi, '_')) !== 'remote-passive') {
      throw new TypeError('Only passive resources can use the native resource protocol');
    }
    const url = new URL(`${root}/${resource}`, base);
    const options: RequestInit = { signal: request?.signal, ...init, credentials: 'omit', redirect: 'error' };
    const signal = options.signal;
    if (!signal) return transport(url, options);
    if (signal.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');

    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    url.searchParams.set('request', id);
    // Tauri buffers the upstream body before resolving fetch. Aborting fetch
    // alone leaves the Rust task and its download slot active.
    const cancel = () => {
      void transport(new URL(`cancel/${id}`, base), { credentials: 'omit', redirect: 'error' }).catch(() => {});
    };
    signal.addEventListener('abort', cancel, { once: true });
    try {
      return await transport(url, options);
    } finally {
      signal.removeEventListener('abort', cancel);
    }
  };
}

// The native Worker build selects this adapter at the existing fetch boundary.
export function createDirectHttpFetch({ nativeFetch }: { nativeFetch: typeof fetch }): typeof fetch {
  return createNativeResourceFetch(nativeResourceBaseUrl(), nativeFetch);
}
