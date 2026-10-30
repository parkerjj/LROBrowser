// @vitest-environment jsdom
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('Phase A IWA', () => {
  it('declares an isolated, manually installed app with Direct Sockets permissions', async () => {
    const source = await readFile('public/.well-known/manifest.webmanifest', 'utf8');
    const manifest = JSON.parse(source);
    expect(manifest.name).toBe('LRO进阶客户端(Powered by LTSD.Ro)');
    expect(manifest.short_name).toBe('LRO进阶客户端');
    expect(manifest.version).toMatch(/^\d+(?:\.\d+)*$/);
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.permissions_policy['direct-sockets']).toEqual(['self']);
    expect(manifest.permissions_policy.gamepad).toEqual(['self']);
    expect(manifest.permissions_policy['cross-origin-isolated']).toEqual(['self']);
    expect(manifest.permissions_policy.autoplay).toEqual(['self']);
    expect(manifest.permissions_policy['clipboard-write']).toEqual(['self']);
    expect(manifest.protocol_handlers).toEqual([
      { protocol: 'web+lastro', url: '/?protocol=%s' },
    ]);
    expect(manifest.icons).toEqual([
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ]);
    expect(manifest).not.toHaveProperty('update_manifest_url');
  });

  it('keeps the full app title consistent across the HTML and shell sources', async () => {
    const [html, play, shell] = await Promise.all([
      readFile('index.html', 'utf8'),
      readFile('play.html', 'utf8'),
      readFile('src/app-shell.ts', 'utf8'),
    ]);
    expect(html).toContain('<title>LRO进阶客户端(Powered by LTSD.Ro)</title>');
    expect(play).toContain('<title>LRO进阶客户端(Powered by LTSD.Ro)</title>');
    expect(shell).toContain("title.textContent = 'LRO进阶客户端(Powered by LTSD.Ro)';");
  });

  it('starts with a dependency-free page that redirects to the game after two seconds', async () => {
    const document = new DOMParser().parseFromString(await readFile('index.html', 'utf8'), 'text/html');
    expect(document.querySelector('meta[http-equiv="refresh"]')?.getAttribute('content')).toBe('2; url=/play.html');
    expect(document.querySelector('a[href="/play.html"]')?.textContent).toBeTruthy();
    expect(document.body.textContent).toContain('启动入口已加载');
    expect(document.querySelectorAll('script, style, link, img, iframe').length).toBe(0);
  });

  it('ships only the compact OFL glyph fallback and relies on system fonts for Chinese text', async () => {
    const [medium, bold, license, notice, css] = await Promise.all([
      readFile('public/fonts/LastROGlyphFallback-Medium.woff2'),
      readFile('public/fonts/LastROGlyphFallback-Bold.woff2'),
      readFile('public/fonts/OFL.txt', 'utf8'),
      readFile('public/fonts/NOTICE.txt', 'utf8'),
      readFile('public/fonts/misans.css', 'utf8'),
    ]);
    for (const font of [medium, bold]) expect(font.toString('ascii', 0, 4)).toBe('wOF2');
    expect(medium.byteLength + bold.byteLength).toBeLessThan(1024 * 1024);
    expect((await readdir('public/fonts')).filter(name => /\.(?:woff2?|otf|ttf|pdf)$/i.test(name)).sort()).toEqual([
      'LastROGlyphFallback-Bold.woff2', 'LastROGlyphFallback-Medium.woff2',
    ]);
    expect(license).toContain('SIL OPEN FONT LICENSE');
    expect(license).toContain('Version 1.1');
    expect(notice).not.toContain('MiSans');
    expect(notice).toContain('LastRO Glyph Fallback');
    expect(css).not.toContain('MiSans');
  });

});
