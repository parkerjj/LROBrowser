import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('GitHub workflow policy', () => {
  it('keeps CI secret-free and release protected', async () => {
    const workflow = await readFile('.github/workflows/ci-release.yml', 'utf8');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('concurrency:');
    expect(workflow).toContain('https://client.ltsd.ro/updates.json');
    expect(workflow).toContain('pnpm minify:release');

    const sections = new Map<string, string>();
    const matches = [...workflow.matchAll(/^ {2}([a-z0-9-]+):\n/gm)];
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      if (!match || match.index === undefined || !match[1]) continue;
      const end = matches[index + 1]?.index ?? workflow.length;
      sections.set(match[1], workflow.slice(match.index, end));
    }

    // Verify and build jobs never receive secrets or write permissions.
    for (const job of ['lint', 'test', 'build-iwa', 'build-web']) {
      const section = sections.get(job);
      expect(section, `missing job ${job}`).toBeTruthy();
      expect(section).not.toContain('secrets.');
      expect(section).not.toContain('contents: write');
    }

    // Signed production releases are gated by every verification stage.
    const release = sections.get('release-iwa');
    expect(release).toContain('needs: [lint, test, build-iwa]');
    expect(release).toContain('environment:');
    expect(release).toContain('name: production');
    expect(release).toContain('secrets.IWA_SIGNING_KEY');
    expect(release).toContain('if: always()');
    expect(release).toContain('rm -f');

    // Web deploys also wait for the single shared test gate.
    const deployWeb = sections.get('deploy-web');
    expect(deployWeb).toContain('needs: [lint, test, build-web]');
    expect(deployWeb).toContain('name: production-web');
    expect(deployWeb).toContain('surge@0.24.6');
  });
});
