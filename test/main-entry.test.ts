// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

const bootstrapV2Client = vi.fn().mockResolvedValue(undefined);
vi.mock('../src/runtime/client-bootstrap', () => ({ bootstrapV2Client }));

describe('application entry', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetModules();
    bootstrapV2Client.mockClear();
    localStorage.clear();
  });

  it('restores the last server before bootstrapping instead of using a stale URL', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const { saveLoginPreferences } = await import('../src/runtime/login-preferences.mjs');
    saveLoginPreferences({ connectionMode: 'relay', serverProfileId: 'lastro-3x' });
    await import('../src/main');
    expect(bootstrapV2Client).toHaveBeenCalledWith(expect.objectContaining({
      profile: expect.objectContaining({ id: 'lastro-3x' }),
    }));
  });

  it('starts the V2 runtime directly without mounting an account shell', async () => {
    document.body.innerHTML = '<div id="app"></div>';

    await import('../src/main');

    const root = document.querySelector<HTMLElement>('#app')!;
    expect(root.querySelector('#account-region')).toBeNull();
    expect(root.querySelector('[data-action="login"]')).toBeNull();
    expect(bootstrapV2Client).toHaveBeenCalledOnce();
    expect(bootstrapV2Client).toHaveBeenCalledWith(expect.objectContaining({
      mount: root,
      profile: expect.objectContaining({ id: 'lastro-2x' }),
      credentials: { username: '', password: '' },
    }));
  });
});
