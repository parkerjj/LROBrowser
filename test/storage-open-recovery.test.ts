import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeStorageOpening } from '../scripts/patch-v2-runtime.mjs';
import { extractRuntimeNode, extractVendorRegion } from './helpers/vendor-runtime';

const native = extractVendorRegion('src/Engine/MapEngine/Storage.js');
const patched = patchRuntimeStorageOpening(native);
const handler = extractRuntimeNode(patched, { kind: 'function', name: 'onStorageInfo' });

function setup({ connected = true, hidden = false, active = true, managed = false } = {}) {
  const animationFrames: Array<() => void> = [];
  const recover = vi.fn();
  const fit = vi.fn();
  const append = vi.fn(() => {
    storage.__loaded = true;
    storage.__active = true;
    storage._host.isConnected = true;
    storage._host.style.display = '';
  });
  const storage = {
    __loaded: true, __active: active,
    _host: { isConnected: connected, style: { display: hidden ? 'none' : '' } },
    append, focus: vi.fn(), setItemInfo: vi.fn(), setItems: vi.fn(),
    _lastroWindowState: managed ? { fit } : undefined,
    ui: { find: () => ({ text() {} }) },
  };
  const sandbox = {
    StorageController: { getUI: () => storage },
    PacketVerManager_default: { value: 20170401 },
    InvTypeName: '',
    itemBuffer: [{ index: 7, ITID: 501 }],
    requestAnimationFrame: (callback: () => void) => { animationFrames.push(callback); },
    lastroRecoverWindowBounds: recover,
  };
  const open = vm.runInNewContext(handler + '\nonStorageInfo', sandbox) as (packet: unknown) => void;
  const flush = () => {
    while (animationFrames.length) animationFrames.shift()!();
  };
  return { storage, append, recover, fit, open, flush };
}

describe('server-driven Kafra storage opening', () => {
  it('patches the shipped native storage packet handler rather than only its UI positioning helper', () => {
    expect(handler).toContain('StorageController.getUI()._host?.isConnected');
    expect(handler).toContain('StorageController.getUI()._host.style.display !== "none"');
    expect(handler).toContain('lastroRecoverWindowBounds(lastroStorageWindow)');
  });

  it.each([
    { connected: false, hidden: false },
    { connected: true, hidden: true },
  ])('re-appends a stale active storage window when disconnected/hidden: %j', state => {
    const f = setup(state);
    f.open({ curCount: 4, maxCount: 600 });
    expect(f.append).toHaveBeenCalledOnce();
    expect(f.storage.setItemInfo).toHaveBeenCalledWith(4, 600);
    expect(f.storage.setItems).toHaveBeenCalledOnce();
    expect(f.storage.focus).toHaveBeenCalledOnce();
    f.flush();
    expect(f.recover).toHaveBeenCalledTimes(2);
  });

  it('does not reinitialize an already visible storage, but refocuses and recovers its bounds', () => {
    const f = setup();
    f.open({ curCount: 0, maxCount: 600 });
    expect(f.append).not.toHaveBeenCalled();
    expect(f.storage.focus).toHaveBeenCalledOnce();
    f.flush();
    expect(f.recover).toHaveBeenCalledTimes(2);
  });

  it('uses the native geometry fitter when installed', () => {
    const f = setup({ managed: true });
    f.open({ curCount: 1, maxCount: 600 });
    f.flush();
    expect(f.fit).toHaveBeenCalledTimes(2);
    expect(f.recover).not.toHaveBeenCalled();
  });

  it('does not resurrect a storage that was closed before the next animation frame', () => {
    const f = setup();
    f.open({ curCount: 1, maxCount: 600 });
    f.storage.__active = false;
    f.storage._host.isConnected = false;
    f.flush();
    expect(f.append).not.toHaveBeenCalled();
    expect(f.recover).not.toHaveBeenCalled();
  });
});
