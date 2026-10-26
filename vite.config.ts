import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { copyFile, readFile, rm as rmAsync, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { type Plugin, type ViteDevServer } from 'vite';
import { defineConfig } from 'vitest/config';
import { packagedAssetPath, REQUIRED_HEADERS } from './scripts/iwa-security.mjs';
import { isLocalRequest, resolveStagedResource } from './scripts/dev-resource-security.mjs';

export function stripViteClientInjection(html: string): string {
  return html.replace(/<script\b(?=[^>]*\bsrc=["'][^"']*\/@vite\/client["'])[^>]*>\s*<\/script>\s*/g, '');
}

export function packageRuntime(target: 'iwa' | 'web', root = process.cwd()): Plugin {
  function serveStagedRuntime(server: ViteDevServer) {
    server.middlewares.use((request, response, next) => {
      for (const [name, value] of Object.entries(REQUIRED_HEADERS)) response.setHeader(name, value);
      if (!isLocalRequest(request.headers.host, request.headers.origin)) {
        response.statusCode = 403; response.end('Forbidden request origin'); return;
      }
      let resource;
      try { resource = resolveStagedResource(server.config.root, request.url); }
      catch { response.statusCode = 403; response.end('Invalid resource path'); return; }
      if (!resource) { next(); return; }
      if (!resource.exists) { response.statusCode = 404; response.end('Resource not found'); return; }
      const source = resource.file;
      const extension = path.extname(source).toLowerCase();
      const contentType = extension === '.json' ? 'application/json' : extension === '.wasm' ? 'application/wasm' : 'text/javascript; charset=utf-8';
      response.statusCode = 200;
      response.setHeader('Content-Type', contentType);
      response.setHeader('Cache-Control', 'no-store');
      response.end(readFileSync(source));
    });
  }
  return {
    name: 'package-patched-runtime',
    resolveId(source) {
      // This URL is served verbatim by the staged-resource middleware. Keep it
      // resolvable during Vite's dev import analysis without rewriting/bundling it.
      if (source === '/runtime/Online.js') return { id: source, external: true };
    },
    configureServer: serveStagedRuntime,
    transformIndexHtml: {
      order: 'post',
      handler: (html) => {
        const transformed = stripViteClientInjection(html);
        return target === 'web' ? transformed.replace(/\s*<link rel="manifest"[^>]*>/i, '') : transformed;
      },
    },
    generateBundle(_options, bundle) {
      if (target === 'web') {
        delete bundle['.well-known/manifest.webmanifest'];
        const index = bundle['index.html'];
        if (index && index.type === 'asset') this.emitFile({ type: 'asset', fileName: '200.html', source: index.source });
      }
      const runtime = path.resolve(root, 'generated/runtime/Online.js');
      if (existsSync(runtime)) this.emitFile({ type: 'asset', fileName: 'runtime/Online.js', source: readFileSync(runtime) });
      const manifestPath = path.resolve(root, 'generated/core/executable-assets.json');
      if (!existsSync(manifestPath)) return;
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        files: Array<{ path: string; kind: string; bytes?: number; sha256?: string; encoding?: 'gzip' }>;
      };
      for (const file of manifest.files) {
        const source = path.resolve(root, 'generated/core', file.path);
        if (!existsSync(source)) throw new Error(`Missing core asset: ${file.path}`);
        if (file.path === 'runtime/Online.js') continue;
        let bytes: Uint8Array = readFileSync(source);
        // Web Bundles store bodies uncompressed. Lua/LUB tables shrink ~85% and are
        // inflated by the worker resource loader; KE keeps its own content hashes.
        if (target === 'iwa' && (file.kind === 'lua' || file.kind === 'lub') && !file.path.startsWith('ke/')) {
          bytes = gzipSync(bytes, { level: 9 });
          Object.assign(file, { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), encoding: 'gzip' });
        }
        this.emitFile({ type: 'asset', fileName: packagedAssetPath(file), source: bytes });
      }
      this.emitFile({ type: 'asset', fileName: 'core/executable-assets.json', source: JSON.stringify(manifest, null, 2) + '\n' });
    },
    async writeBundle(options) {
      if (target !== 'web') return;
      const outputDirectory = path.resolve(options.dir ?? 'dist-web');
      await rmAsync(path.join(outputDirectory, '.well-known'), { recursive: true, force: true });
      await copyFile(path.join(outputDirectory, 'index.html'), path.join(outputDirectory, '200.html'));
      const worldMapSources = path.join(outputDirectory, 'worldmap/sources.json');
      const sourceText = await readFile(worldMapSources, 'utf8');
      await writeFile(worldMapSources, sourceText.replaceAll('https://game.lastro.cn/', 'https://rodata.ltsd.ro/'));
    },
  };
}

/**
 * The TLS package's WebCrypto implementation imports Node's "crypto" solely
 * for its standard "webcrypto" export. Use the native browser implementation
 * for both production builds and dev dependency prebundling, without a Node
 * polyfill or pure-JS fallback.
 */
function browserTlsCrypto(): Plugin {
  const namespace = 'lastro-native-tls-webcrypto';
  const id = String.fromCharCode(0) + namespace;
  const contents = 'export const webcrypto = globalThis.crypto;';
  const isTlsCrypto = (source: string, importer?: string) =>
    (source === 'crypto' || source === 'node:crypto') && importer?.includes('@reclaimprotocol');
  return {
    name: 'lastro-tls-native-webcrypto',
    enforce: 'pre',
    // Vite's esbuild dependency optimizer does not run resolveId/load hooks.
    config() {
      return { optimizeDeps: { esbuildOptions: { plugins: [{
        name: 'lastro-tls-native-webcrypto',
        setup(build) {
          build.onResolve({ filter: /^(?:node:)?crypto$/ }, ({ path: source, importer }) => {
            if (isTlsCrypto(source, importer)) return { path: source, namespace };
          });
          build.onLoad({ filter: /.*/, namespace }, () => ({ contents, loader: 'js' }));
        },
      }] } } };
    },
    resolveId(source, importer) {
      if (isTlsCrypto(source, importer)) return id;
    },
    load(source) {
      if (source === id) return contents;
    },
  };
}

/**
 * The TLS dependency tree imports reflect-metadata via @peculiar/x509.
 * Its regular entry point uses eval/Function as a legacy global fallback.
 * Chrome IWAs can use the official lite entry point instead.
 */
function browserReflectMetadataLite(): Plugin {
  return {
    name: 'lastro-reflect-metadata-lite',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source === 'reflect-metadata') return this.resolve('reflect-metadata/lite', importer, { skipSelf: true });
    },
  };
}

const buildTarget = process.env.LASTRO_BUILD_TARGET === 'web' ? 'web' : 'iwa';

export default defineConfig({
  base: './',
  define: { __LASTRO_BUILD_TARGET__: JSON.stringify(buildTarget) },
  plugins: [browserTlsCrypto(), browserReflectMetadataLite(), packageRuntime(buildTarget)],
  optimizeDeps: { entries: ['index.html'], exclude: ['/runtime/Online.js'] },
  build: { target: 'es2022', sourcemap: false, rollupOptions: { external: ['/runtime/Online.js'] } },
  server: {
    host: '127.0.0.1',
    hmr: false,
    fs: { strict: true, allow: [path.resolve('.')], deny: ['**/.env', '**/.env.*', '**/*.{crt,pem,key}', '**/.git/**', '**/.local/**', '**/.codex/**', '**/.agents/**', '**/.npmrc', '**/.netrc'] },
    headers: REQUIRED_HEADERS,
  },
  test: {
    include: ['test/**/*.test.ts'],
    // Native-bundle AST fixtures are slow under CI parallel workers; allow 60s per test.
    testTimeout: 60000,
    // Public GitHub ubuntu-24.04 runners have 4 vCPUs / 16 GB RAM.
    // Use all 4 cores in CI, rather than the previous half-CPU (2-worker) cap.
    // Locally, remain conservative with large TypeScript AST fixtures.
    maxWorkers: process.env.CI
      ? Math.min(4, os.availableParallelism())
      : Math.max(2, Math.min(8, Math.floor(os.availableParallelism() / 2), Math.floor(os.totalmem() / (4 * 1024 ** 3)))),
  },
});
