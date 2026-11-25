import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error The vendored runtime module intentionally has no declaration file.
import { createLastroAuction } from '../vendor/v2/lastro-auction-ui.mjs';
import { extractRuntimeNode } from './helpers/vendor-runtime';

function fixture(enabled = () => true) {
  const document = new JSDOM().window.document;
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const hooks = new Map<string, (packet: object) => void>();
  const receive = (name: string, packet: object) => hooks.get(name)?.(packet);
  const sent: Array<Record<string, unknown>> = [];
  const item = { ITID: 1201, index: 7, count: 1, IsIdentified: 1 };
  const removeItem = vi.fn();
  let approve: () => void;
  const Packets = new Proxy({}, { get: (_, name) => class { name = name; } });
  class Component {
    _host = host;
    _container = document.createElement('div');
    render?: () => string;
    init?: () => void;
    onAppend?: () => void;
    onRemove?: () => void;
    draggable() {}
    append() {
      document.body.append(host);
      if (!this._container.isConnected) root.append(this._container);
      if (!this._container.hasChildNodes()) {
        this._container.innerHTML = this.render?.() ?? '';
        this.init?.();
      }
      this.onAppend?.();
    }
    remove() { this.onRemove?.(); host.remove(); }
  }
  const component = createLastroAuction({
    GUIComponent: Component,
    UIManager: {
      showPromptBox: (_text: string, _yes: string, _no: string, onYes: () => void) => {
        approve = onYes;
        return { remove() {} };
      },
    },
    PACKET: { CZ: Packets, ZC: new Proxy({}, { get: (_, name) => name }) },
    Network: {
      hookPacket: (name: string, hook: (packet: object) => void) => hooks.set(name, hook),
      sendPacket: (packet: Record<string, unknown>) => sent.push(packet),
    },
    getInventory: () => ({ getItemByIndex: (index: number) => index === item.index ? item : null, removeItem }),
    getPlayerName: () => 'Buyer',
    getItemName: (entry: { ITID: number }) => `Item ${entry.ITID}`,
    loadItemIcon: () => {},
    showItemDetails: () => {},
    enabled,
  });
  component.hookPackets();
  const byLabel = <T extends HTMLElement>(label: string) => root.querySelector<T>(`[aria-label="${label}"]`)!;
  const findButton = (text: string) => [...root.querySelectorAll('button')].find(button => button.textContent === text)!;
  return { document, host, root, sent, receive, byLabel, findButton, confirm: () => approve(), removeItem, item };
}

const listing = { AuctionID: 19, SellerName: 'Seller', ITID: 1201, MaxPrice: 42, DeleteTime: 2_000_000_000 };
const listPage = { MaxPage: 2, Number: 1, auctionItemList: [listing] };

describe('三转服交易所', () => {
  it('商店引擎只初始化一次，切换到三转服后可以开窗，并保留商品词条', () => {
    const vendor = readFileSync('vendor/v2/Online.js', 'utf8');
    const region = 'src/Engine/MapEngine/Store.js';
    const install = extractRuntimeNode(vendor, { region, kind: 'function', name: 'installLastroAuctionHooks' });
    const initializeStore = extractRuntimeNode(vendor, { region, kind: 'function', name: 'MainEngine$9' });
    const hookPackets = vi.fn();
    type AuctionDependencies = { enabled: () => boolean; getPlayerName: () => string; showItemDetails: (item: object) => void };
    const create = vi.fn<(deps: AuctionDependencies) => { hookPackets: typeof hookPackets }>(() => ({ hookPackets }));
    const setItem = vi.fn();
    let nid = 2;
    let observing = false;
    const dependencies = {
      Configs: { get: () => nid }, isObserverMode: () => observing,
      UIManager: { addComponent: (component: unknown) => component }, createLastroAuction: create,
      GUIComponent: {}, PACKET: { ZC: {} }, Network: { hookPacket() {} },
      SessionStorage_default: { Entity: { display: { name: '三转角色' } } },
      ItemInfo_default: { append() {}, setItem },
    };
    const storeCallbacks = Object.fromEntries([...initializeStore.matchAll(/\bon[A-Z]\w+/g)].map(match => [match[0], () => {}]));
    const init = runInNewContext(`let lastroAuction;\n${install}\n${initializeStore}\nMainEngine$9`, { ...dependencies, ...storeCallbacks }) as () => void;
    init();
    expect(create).toHaveBeenCalledTimes(1);
    expect(hookPackets).toHaveBeenCalledTimes(1);
    const auction = create.mock.calls[0]![0];
    const f = fixture(auction.enabled);
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    expect(f.host.isConnected).toBe(false);
    nid = 3;
    observing = true;
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    expect(f.host.isConnected).toBe(false);
    observing = false;
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    expect(f.host.isConnected).toBe(true);
    expect(auction.getPlayerName()).toBe('三转角色');
    auction.showItemDetails({ ITID: 1201, Type: 4, options: { Index0: 7, Value0: 15, Param0: 1, Index4: 12, Value4: 33, Param4: 2 } });
    expect(setItem).toHaveBeenCalledWith(expect.objectContaining({
      ITID: 1201, type: 4, Options: [{ index: 7, value: 15, param: 1 }, { index: 12, value: 33, param: 2 }],
    }));
  });

  it('服务端开窗后加载首屏，翻页并确认购买后才发购买包', () => {
    const f = fixture();
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    expect(f.host.isConnected).toBe(true);
    expect(f.sent).toEqual([{ name: 'AUCTION_ITEM_SEARCH', Type: 4, AuctionID: 0, Name: '', Page: 1 }]);
    f.receive('AUCTION_ITEM_REQ_SEARCH', listPage);
    expect(f.root.textContent).toContain('42 C点');
    f.findButton('下一页').click();
    expect(f.sent.at(-1)).toMatchObject({ name: 'AUCTION_ITEM_SEARCH', Page: 2 });
    f.receive('AUCTION_ITEM_REQ_SEARCH', listPage);
    f.findButton('购买').click();
    expect(f.sent.at(-1)?.name).toBe('AUCTION_ITEM_SEARCH');
    f.confirm();
    f.confirm();
    expect(f.sent.filter(packet => packet.name === 'AUCTION_BUY')).toEqual([
      { name: 'AUCTION_BUY', AuctionID: 19, Money: 42 },
    ]);
    f.receive('AUCTION_RESULT', { Result: 6 });
    expect(f.sent.at(-1)).toMatchObject({ name: 'AUCTION_ITEM_SEARCH', Page: 2 });
  });

  it('匹配上架道具确认后扣除一件，并按填写的价格和时长提交', () => {
    const f = fixture();
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    f.receive('AUCTION_ITEM_REQ_SEARCH', listPage);
    f.findButton('发布商品').click();
    const drop = new f.document.defaultView!.Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', {
      value: { getData: () => JSON.stringify({ type: 'item', from: 'Inventory', data: f.item }) },
    });
    f.byLabel('上架道具').dispatchEvent(drop);
    expect(f.sent.slice(-2)).toEqual([
      { name: 'AUCTION_CREATE', Type: 0 },
      { name: 'AUCTION_ADD_ITEM', index: 7, count: 1 },
    ]);
    f.receive('ACK_AUCTION_ADD_ITEM', { Index: 8, result: 0 });
    expect(f.removeItem).not.toHaveBeenCalled();
    f.receive('ACK_AUCTION_ADD_ITEM', { Index: 7, result: 0 });
    f.receive('ACK_AUCTION_ADD_ITEM', { Index: 7, result: 0 });
    expect(f.removeItem).toHaveBeenCalledExactlyOnceWith(7, 1);
    f.byLabel<HTMLInputElement>('售价').value = '55';
    f.byLabel<HTMLInputElement>('上架小时数').value = '24';
    f.findButton('确认上架').click();
    f.confirm();
    expect(f.sent.at(-1)).toEqual({ name: 'AUCTION_ADD', NowMoney: 55, MaxMoney: 55, DeleteHour: 24 });
    f.receive('AUCTION_RESULT', { Result: 1 });
    expect(f.sent.at(-1)).toEqual({ name: 'AUCTION_REQ_MY_INFO', Type: 0 });
  });

  it('从窗口发起关闭后仍会处理服务器先返回的道具扣除确认', () => {
    const f = fixture();
    f.item.count = 3;
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    f.receive('AUCTION_ITEM_REQ_SEARCH', listPage);
    f.findButton('发布商品').click();
    const drop = new f.document.defaultView!.Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', {
      value: { getData: () => JSON.stringify({ type: 'item', from: 'Inventory', data: f.item }) },
    });
    f.byLabel('上架道具').dispatchEvent(drop);
    f.byLabel('关闭交易所').click();
    expect(f.sent.at(-1)).toEqual({ name: 'AUCTION_CLOSE' });
    expect(f.host.isConnected).toBe(true);
    f.item.count = 2;
    f.receive('ACK_AUCTION_ADD_ITEM', { Index: 7, result: 0 });
    expect(f.removeItem).toHaveBeenCalledExactlyOnceWith(7, 1);
    f.receive('AUCTION_WINDOWS', { Type: 1 });
    expect(f.host.isConnected).toBe(false);
  });

  it('关闭窗口使旧的下架确认失效，重新打开时加载第一页面', () => {
    const f = fixture();
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    f.receive('AUCTION_ITEM_REQ_SEARCH', listPage);
    f.findButton('我的挂单').click();
    expect(f.sent.at(-1)).toEqual({ name: 'AUCTION_REQ_MY_INFO', Type: 0 });
    f.receive('AUCTION_ITEM_REQ_SEARCH', { ...listPage, auctionItemList: [{ ...listing, SellerName: 'Buyer' }] });
    f.findButton('下架').click();
    f.receive('AUCTION_WINDOWS', { Type: 1 });
    expect(f.host.isConnected).toBe(false);
    f.confirm();
    expect(f.sent.some(packet => packet.name === 'AUCTION_ADD_CANCEL')).toBe(false);
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    expect(f.sent.at(-1)).toMatchObject({ name: 'AUCTION_ITEM_SEARCH', Page: 1 });
    f.byLabel('关闭交易所').click();
    expect(f.sent.at(-1)).toEqual({ name: 'AUCTION_CLOSE' });
    f.receive('AUCTION_WINDOWS', { Type: 1 });
    expect(f.host.isConnected).toBe(false);
  });

  it.each([
    ['AUCTION_RESULT', 2],
    ['AUCTION_ACK_MY_SELL_STOP', 1],
  ])('收到 %s 下架确认后刷新一次挂单', (packet, result) => {
    const f = fixture();
    f.receive('AUCTION_WINDOWS', { Type: 0 });
    f.receive('AUCTION_ITEM_REQ_SEARCH', listPage);
    f.findButton('我的挂单').click();
    f.receive('AUCTION_ITEM_REQ_SEARCH', { ...listPage, auctionItemList: [{ ...listing, SellerName: 'Buyer' }] });
    f.findButton('下架').click();
    f.confirm();
    expect(f.sent.at(-1)).toEqual({ name: 'AUCTION_ADD_CANCEL', AuctionID: 19 });
    f.receive(packet, { Result: result });
    f.receive('AUCTION_ACK_MY_SELL_STOP', { Result: 1 });
    expect(f.sent.filter(packet => packet.name === 'AUCTION_REQ_MY_INFO')).toHaveLength(2);
    f.receive('AUCTION_ITEM_REQ_SEARCH', { MaxPage: 0, Number: 0, auctionItemList: [] });
    expect(f.root.textContent).toContain('商品已下架');
  });
});
