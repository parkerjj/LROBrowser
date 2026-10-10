import { existsSync, readFileSync } from 'node:fs';
import { copyFile, readFile, rm as rmAsync, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { type Plugin, type ViteDevServer } from 'vite';
import { defineConfig } from 'vitest/config';
import { REQUIRED_HEADERS } from './scripts/iwa-security.mjs';
import { patchCspReflectGlobals } from './scripts/csp-reflect-global.mjs';
import { isLocalRequest, resolveStagedResource } from './scripts/dev-resource-security.mjs';

export function stripViteClientInjection(html: string): string {
  return html.replace(/<script\b(?=[^>]*\bsrc=["'][^"']*\/@vite\/client["'])[^>]*>\s*<\/script>\s*/g, '');
}

function packageRuntime(target: 'iwa' | 'web'): Plugin {
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
      const runtime = path.resolve('generated/runtime/Online.js');
      if (existsSync(runtime)) this.emitFile({ type: 'asset', fileName: 'runtime/Online.js', source: readFileSync(runtime) });
      const manifestPath = path.resolve('generated/core/executable-assets.json');
      if (!existsSync(manifestPath)) return;
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { files: Array<{ path: string; kind: string }> };
      for (const file of manifest.files) {
        const source = path.resolve('generated/core', file.path);
        if (!existsSync(source)) throw new Error(`Missing core asset: ${file.path}`);
        this.emitFile({ type: 'asset', fileName: `core/${file.path}`, source: readFileSync(source) });
        if (file.kind === 'runtime' && file.path !== 'runtime/Online.js') {
          this.emitFile({ type: 'asset', fileName: `runtime/${path.basename(file.path)}`, source: readFileSync(source) });
        }
      }
      this.emitFile({ type: 'asset', fileName: 'core/executable-assets.json', source: readFileSync(manifestPath) });
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
 * reflect-metadata is shipped as an ES3 compatibility polyfill. Its fallback
 * global-object probes use Function("return this;") and indirect eval(), both
 * prohibited by IWA CSP. Chrome 154 always provides globalThis: substitute
 * that standard primitive before Vite minifies the dependency. Leave all
 * metadata/certificate functionality unchanged and fail closed on drift.
 */
export function cspSafeReflectMetadata(source: string): string {
  return patchCspReflectGlobals(source);
}

/**
 * The TLS package's WebCrypto implementation imports Node's "crypto" solely
 * for its standard "webcrypto" export. Use the native browser implementation
 * when Vite bundles the IWA UI, without a Node polyfill or pure-JS fallback.
 */
function browserTlsCrypto(): Plugin {
  const id = String.fromCharCode(0) + 'lastro-native-tls-webcrypto';
  return {
    name: 'lastro-tls-native-webcrypto',
    enforce: 'pre',
    renderChunk(source) {
      // Our IWA targets modern Chrome; legacy Reflect globals are unnecessary.
      if (!source.includes('return this;')) return;
      if (!source.includes('(function() { return this; })()')) return;
      return { code: cspSafeReflectMetadata(source), map: null };
    },
    transform(source, id) {
      // Only rewrite the installed reflect-metadata polyfill, never game code.
      if (!/(?:^|[/\\\\])reflect-metadata[/\\\\]Reflect(?:NoConflict)?\\.js(?:$|\\?)/.test(id)) return;
      return { code: cspSafeReflectMetadata(source), map: null };
    },
    resolveId(source, importer) {
      if ((source === 'crypto' || source === 'node:crypto') && importer?.includes('@reclaimprotocol')) return id;
    },
    load(source) {
      if (source === id) return 'export const webcrypto = globalThis.crypto;';
    },
  };
}

const buildTarget = process.env.LASTRO_BUILD_TARGET === 'web' ? 'web' : 'iwa';

export default defineConfig({
  base: './',
  define: { __LASTRO_BUILD_TARGET__: JSON.stringify(buildTarget) },
  plugins: [browserTlsCrypto(), packageRuntime(buildTarget)],
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
    // Runtime fixtures parse large bundled sources (~1-3GB heap per worker). Scale
    // workers with available CPU/RAM instead of a fixed low number: CI runners with
    // few cores stay conservative, local machines parallelize.
    maxWorkers: Math.max(2, Math.min(8, Math.floor(os.cpus().length / 2), Math.floor(os.freemem() / (4 * 1024 ** 3)))),
  },
});
