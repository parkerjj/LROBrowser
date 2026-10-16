import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeStorageItemFlow, patchRuntimeStorageOpening } from '../scripts/patch-v2-runtime.mjs';
import { extractRuntimeNode, extractVendorRegion } from './helpers/vendor-runtime';

const original = [
  extractVendorRegion('src/Engine/MapEngine/Item.js'),
  extractVendorRegion('src/UI/Components/Storage/StorageCommon.js'),
  extractVendorRegion('src/Engine/MapEngine/Storage.js'),
].join('\n');
const patched = patchRuntimeStorageItemFlow(patchRuntimeStorageOpening(original));
const staging = patched.slice(patched.indexOf('const lastroStagedStorageItems'),
  patched.indexOf('//#region src/Engine/MapEngine/Item.js'));
const names = ['onItemListNormal', 'onItemListEquip', 'onStorageInfo', 'onStorageClose', 'onClosePressed', 'StorageEngine'];
const handlers = names.map(name => extractRuntimeNode(patched, { kind: 'function', name })).join('\n');

interface StorageItem { index: number; ITID: number; type: number; count?: number }
function harness() {
  const stage = { list: [] as StorageItem[] };
  const storage = {
    __loaded: false, __active: false,
    _host: { isConnected: false, style: { display: 'none' } },
    append: vi.fn(() => {
      storage.__loaded = true;
      storage.__active = true;
      storage._host.isConnected = true;
      storage._host.style.display = '';
    }),
    replaceItems: vi.fn((items: StorageItem[]) => { stage.list = items; }),
    setItems: vi.fn(),
    setItemInfo: vi.fn(),
    focus: vi.fn(), remove: vi.fn(() => { storage.__active = false; storage._host.isConnected = false; }),
    ui: { find: () => ({ text() {} }) },
  };
  const ctx = {
    StorageController: { getUI: () => storage },
    PacketVerManager_default: { value: 20170401 },
    InvTypeName: '',
    itemBuffer: [] as StorageItem[],
    lastroRecoverWindowBounds: vi.fn(),
    requestAnimationFrame: () => undefined,
  };
  const api = vm.runInNewContext(staging + '\n' + handlers
    + '\n({ normal: onItemListNormal, equip: onItemListEquip, info: onStorageInfo, close: onStorageClose, reset: lastroResetStorageSnapshot })',
    ctx) as { normal(pkt: object): void; equip(pkt: object): void; info(pkt: object): void; close(): void; reset(): void };
  return { api, storage, stage, ctx };
}
const sword = (index = 10): StorageItem => ({ index, ITID: 1102, type: 7 });
const potion = (index = 11): StorageItem => ({ index, ITID: 501, type: 0, count: 9 });
describe('Kafra storage item-list ordering', () => {
  it('opens a gear-only account only when COUNTINFO arrives, without rendering before prepare', () => {
    const h = harness();
    h.api.equip({ invType: 2, ItemInfo: [sword()] });
    expect(h.storage.append).not.toHaveBeenCalled();
    expect(h.storage.setItems).not.toHaveBeenCalled();
    h.api.info({ curCount: 1, maxCount: 600 });
    expect(h.storage.append).toHaveBeenCalledOnce();
    expect(h.storage.replaceItems).toHaveBeenCalledOnce();
    expect(h.stage.list).toEqual([sword()]);
    expect(h.storage.setItemInfo).toHaveBeenCalledWith(1, 600);
  });

  it.each(['equip-first', 'normal-first'])('merges both list orders: %s', order => {
    const h = harness();
    if (order === 'equip-first') {
      h.api.equip({ invType: 2, ItemInfo: [sword()] });
      h.api.normal({ invType: 2, ItemInfo: [potion()] });
    } else {
      h.api.normal({ invType: 2, ItemInfo: [potion()] });
      h.api.equip({ invType: 2, ItemInfo: [sword()] });
    }
    h.api.info({ curCount: 2, maxCount: 600 });
    expect(h.storage.append).toHaveBeenCalledOnce();
    expect(h.stage.list.map(item => item.index).sort()).toEqual([10, 11]);
  });

  it('opens completely empty storages and supports multiple equipment chunks', () => {
    const h = harness();
    h.api.info({ curCount: 0, maxCount: 600 });
    expect(h.stage.list).toEqual([]);
    h.api.close();
    h.api.equip({ invType: 2, ItemInfo: [sword(10)] });
    h.api.equip({ invType: 2, ItemInfo: [sword(20)] });
    h.api.info({ curCount: 2, maxCount: 600 });
    expect(h.stage.list.map(item => item.index)).toEqual([10, 20]);
  });

  it('deduplicates repeated slots and clears pending lists when the storage closes', () => {
    const h = harness();
    h.api.equip({ invType: 2, ItemInfo: [sword(), sword()] });
    h.api.info({ curCount: 1, maxCount: 600 });
    expect(h.stage.list).toHaveLength(1);
    h.api.close();
    h.api.equip({ invType: 2, ItemInfo: [sword(40)] });
    h.api.close();
    h.api.info({ curCount: 0, maxCount: 600 });
    expect(h.stage.list).toEqual([]);
  });

  it('does not overwrite an existing populated list on a count-only update', () => {
    const h = harness();
    h.api.equip({ invType: 2, ItemInfo: [sword()] });
    h.api.info({ curCount: 1, maxCount: 600 });
    h.api.info({ curCount: 1, maxCount: 1200 });
    expect(h.storage.replaceItems).toHaveBeenCalledOnce();
    expect(h.storage.setItemInfo).toHaveBeenLastCalledWith(1, 1200);
  });

  it('preserves inventory and cart handling branches unchanged', () => {
    const native = extractVendorRegion('src/Engine/MapEngine/Item.js');
    const modified = extractVendorRegion('src/Engine/MapEngine/Item.js', patched);
    expect(modified).toContain('case 0:');
    expect(modified).toContain('case 1:');
    expect(native).toContain('onItemListNormal');
  });

  it('installs a real snapshot replacement method for both V0 and V3 storage UIs', () => {
    const common = extractVendorRegion('src/UI/Components/Storage/StorageCommon.js', patched);
    expect(common).toContain('Component.replaceItems = function replaceItems(items)');
    expect(common).toContain('_list.length = 0;');
  });
});
