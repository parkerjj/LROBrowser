import { existsSync, readFileSync } from 'node:fs';
import { copyFile, readFile, rm as rmAsync, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type Plugin, type ViteDevServer } from 'vite';
import { defineConfig } from 'vitest/config';
import { REQUIRED_HEADERS } from './scripts/iwa-security.mjs';
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

const buildTarget = process.env.LASTRO_BUILD_TARGET === 'web' ? 'web' : 'iwa';

export default defineConfig({
  base: './',
  define: { __LASTRO_BUILD_TARGET__: JSON.stringify(buildTarget) },
  plugins: [packageRuntime(buildTarget)],
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
    // Runtime fixtures parse large bundled sources; keep their memory use bounded.
    maxWorkers: 2,
  },
});
