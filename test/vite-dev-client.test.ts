import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { optimizeDeps, resolveConfig } from 'vite';
import { describe, expect, it } from 'vitest';
import { stripViteClientInjection } from '../vite.config';

describe('IWA development entry', () => {
  it('removes Vite HMR client injection while preserving the app module', () => {
    const html = [
      '<head>',
      '<script type="module" src="/@vite/client"></script>',
      '<script type="module" src="/src/main.ts"></script>',
      '</head>',
    ].join('\n');

    const transformed = stripViteClientInjection(html);

    expect(transformed).not.toContain('/@vite/client');
    expect(transformed).toContain('/src/main.ts');
  });

  it('loads the stylesheet without a CSS-module HMR client import', async () => {
    const html = await readFile('play.html', 'utf8');
    const main = await readFile('src/main.ts', 'utf8');

    expect(html).toContain('href="/src/styles.css"');
    expect(main).not.toContain("import './styles.css'");
  });

  it('prebundles TLS WebCrypto with working native crypto in development', async () => {
    const cacheDir = await mkdtemp(path.resolve('node_modules/.vite-tls-test-'));
    try {
      const config = await resolveConfig({
        cacheDir,
        logLevel: 'silent',
        optimizeDeps: {
          entries: [],
          include: ['@reclaimprotocol/tls', '@reclaimprotocol/tls/webcrypto'],
          noDiscovery: true,
        },
      }, 'serve');
      const metadata = await optimizeDeps(config, true);
      const optimized = metadata.optimized['@reclaimprotocol/tls/webcrypto'];
      expect(optimized).toBeDefined();
      const moduleUrl = pathToFileURL(optimized!.file).href;
      const output = execFileSync(process.execPath, ['--input-type=module', '--eval', `
        const { webcryptoCrypto } = await import(${JSON.stringify(moduleUrl)});
        const digest = await webcryptoCrypto.hash('SHA-256', new Uint8Array());
        console.log(JSON.stringify({
          digest: Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join(''),
          randomLength: webcryptoCrypto.randomBytes(32).length,
        }));
      `], { encoding: 'utf8' });

      expect(JSON.parse(output)).toEqual({
        digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        randomLength: 32,
      });
    } finally {
      await rm(cacheDir, { recursive: true, force: true });
    }
  }, 30_000);
});
