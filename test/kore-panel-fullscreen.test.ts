// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createKoreFullscreen } from '../src/kore/kore-panel-fullscreen.mjs';

const kv = (pairs: Array<[string, string]>) => ({ kind: 'output', ok: true, blocks: [{ type: 'kv', pairs }] });
const table = (columns: string[], rows: string[][]) => ({ kind: 'output', ok: true, blocks: [{ type: 'table', columns, rows }] });

function open({ mode = 'AUTO', worldReady = true, results = {} as Record<string, unknown> } = {}) {
  const outputs = new Set<(output: { command: string; result: unknown; silent: boolean }) => void>();
  const host = {
    state: { status: 'runtime-ready', worldReady, logs: [] as unknown[] },
    sendCommandText: vi.fn((text: string, options?: { silent?: boolean }) => {
      void options;
      return text.length > 0;
    }),
    onCommandOutput: vi.fn((listener: (output: { command: string; result: unknown; silent: boolean }) => void) => {
      outputs.add(listener); return () => outputs.delete(listener);
    }),
    onStateChange: vi.fn(() => () => {}),
  };
  const data: Record<string, unknown> = {
    status: kv([['名称', 'Parker'], ['职业', '高阶祭司'], ['等级', '99/70'], ['HP', '8421/9120 (92%)'], ['SP', '1630/1980 (82%)'], ['重量', '1820/3000'], ['Zeny', '12,400,000']]),
    ai: kv([['模式', mode], ['任务', '巡逻'], ['目标', '—'], ['下一步', 'walk'], ['原因', 'idle']]),
    where: kv([['地图', 'prt_fild08'], ['坐标', '(156, 182)']]),
    ...results,
  };
  const poller = {
    results: (name: string) => data[name] ?? null, errors: () => null,
    subscribe: () => () => {}, setView: vi.fn(), setTab: vi.fn(), request: vi.fn(),
  };
  const page = {
    document: window.document, setTimeout: window.setTimeout.bind(window), requestAnimationFrame: (fn: () => void) => fn(),
    matchMedia: () => ({ matches: true }), atob: window.atob.bind(window),
  };
  const fullscreen = createKoreFullscreen({ page, host, poller, consoleModel: null, history: [] } as never);
  return { fullscreen, host, outputs, $: (selector: string) => window.document.querySelector(selector) as HTMLElement };
}

afterEach(() => { window.document.body.replaceChildren(); });

test('the title row says who this is and what the AI is doing', () => {
  const { $ } = open();
  expect($('.kore-fs-name').textContent).toBe('Parker');
  expect($('.kore-fs-job').textContent).toBe('高阶祭司 · Lv 99/70');
  expect($('.kore-fs-pill').textContent).toBe('自动');
  expect($('.kore-fs-finding').textContent).toBe('任务 巡逻 · 下一步 walk · 原因 idle');
});

test('the main button stops the AI while it runs and starts it otherwise, without touching the typed command', () => {
  const running = open({ mode: 'AUTO' });
  const typed = running.$('.kore-fs-input') as HTMLInputElement;
  typed.value = 'where';
  expect(running.$('.kore-fs-auto').textContent).toBe('关闭自动');
  running.$('.kore-fs-auto').click();
  expect(running.host.sendCommandText).toHaveBeenCalledWith('ai off');
  expect(typed.value).toBe('where');
  window.document.body.replaceChildren();

  const stopped = open({ mode: 'OFF' });
  expect(stopped.$('.kore-fs-auto').textContent).toBe('开启自动');
  expect(stopped.$('.kore-fs-auto').classList.contains('kore-fs-btn-primary')).toBe(true);
  stopped.$('.kore-fs-auto').click();
  expect(stopped.host.sendCommandText).toHaveBeenCalledWith('ai auto');
});

test('before the world is ready the last answers are not shown as live', () => {
  const { $ } = open({ worldReady: false });
  expect($('.kore-fs-name').textContent).toBe('等待 KE');
  expect($('.kore-fs-pill').textContent).toBe('');
  expect($('.kore-fs-finding').textContent).toBe('等待 KE 就绪…');
  expect(($('.kore-fs-auto') as HTMLButtonElement).disabled).toBe(true);
  expect($('.kore-fs-auto').textContent).toBe('开启自动');
});

const COLUMNS = ['#', '名称', '数量', '类别', '位置', 'ID'];
const inventory = table(COLUMNS, [
  ['1', '红色药水', '128', '使用品', '背包', '501'],
  ['2', '胶质物', '117', '其他物品', '背包', '909'],
  ['3', '+7 长剑 [Poring] [3]', '1', '武器', 'rightHand+leftHand', '1101'],
  ['4', 'BROKEN +4 棉衬衫 [1]', '1', '盔甲', 'armor', '2301'],
  ['5', '白色药水', '30', '使用品', '背包', '504'],
]);
const tab = (id: string) => window.document.querySelector(`.kore-fs-tab[data-tab="${id}"]`) as HTMLButtonElement;
const texts = (selector: string) => [...window.document.querySelectorAll(selector)].map(node => node.textContent);

test('the left module has bag, equipment, cart and earnings tabs and no item-info tab', () => {
  open();
  expect(texts('.kore-fs-tab')).toEqual(['背包', '穿戴', '手推车', '收益']);
});

test('the bag groups worn-free items by category, consumables first, and counts each group', () => {
  open({ results: { inventory } });
  expect(texts('.kore-fs-group-label')).toEqual(['使用品', '其他物品']);
  expect(texts('.kore-fs-group .kore-fs-meta')).toEqual(['2', '1']);
  // Worn items are not in the bag.
  expect(texts('.kore-fs-item-name')).toEqual(['红色药水', '白色药水', '胶质物']);
});

test('searching narrows the bag and a group can be collapsed', () => {
  const { $ } = open({ results: { inventory } });
  const search = $('.kore-fs-search-input') as HTMLInputElement;
  search.value = '药水';
  search.dispatchEvent(new Event('input'));
  expect(texts('.kore-fs-group-label')).toEqual(['使用品']);
  search.value = '没有这个';
  search.dispatchEvent(new Event('input'));
  expect($('.kore-fs-empty').textContent).toBe('没有匹配的物品');
  search.value = '';
  search.dispatchEvent(new Event('input'));
  ($('.kore-fs-group-head') as HTMLButtonElement).click();
  expect($('.kore-fs-group').classList.contains('is-collapsed')).toBe(true);
  expect(texts('.kore-fs-item-name')).toEqual(['胶质物']);
});

test('the equipment tab lists slots with the real item name and flags a broken item', () => {
  open({ results: { inventory } });
  tab('equipment').click();
  const slots = [...window.document.querySelectorAll('.kore-fs-slot')].map(node => [node.querySelector('.kore-fs-slot-label')?.textContent, node.querySelector('.kore-fs-item-text, .kore-fs-item-name')?.textContent]);
  expect(slots.find(([label]) => label === '右手')![1]).toBe('+7 长剑 [Poring] [3]');
  expect(slots.find(([label]) => label === '左手')![1]).toBe('+7 长剑 [Poring] [3]');
  expect(slots.find(([label]) => label === '头上')![1]).toBe('—');
  // OpenKore's "BROKEN " prefix becomes a flag next to the name.
  expect(texts('.kore-fs-slot .kore-fs-item-text')).toContain('+4 棉衬衫 [1]');
  expect(texts('.kore-fs-pill-bad')).toEqual(['损坏']);
  expect(window.document.querySelector('.kore-fs-search')?.hasAttribute('hidden')).toBe(true);
});

test('switching tabs never sends a listing command: the views are derived from one `i` result', () => {
  const { host, $ } = open({ results: { inventory } });
  host.sendCommandText.mockClear();
  for (const id of ['equipment', 'cart', 'earnings', 'inventory']) tab(id).click();
  ($('.kore-fs-group-head') as HTMLButtonElement).click();
  expect(host.sendCommandText).not.toHaveBeenCalled();
});

test('the cart is grouped like the bag and a missing cart is explained', () => {
  const cart = table(['#', '名称', '数量', '类别', 'ID'], [['1', '红色药水', '500', '使用品', '501']]);
  open({ results: { cart } });
  tab('cart').click();
  expect(texts('.kore-fs-group-label')).toEqual(['使用品']);
  window.document.body.replaceChildren();
  open({ results: { cart: { kind: 'output', ok: false, blocks: [{ type: 'text', text: 'cart-not-ready: cart snapshot has not arrived' }] } } });
  tab('cart').click();
  expect(window.document.querySelector('.kore-fs-empty')?.textContent).toBe('没有手推车，或手推车数据还没有收到');
});

test('earnings put the hourly rates and money first, then what dropped, then the experience detail', () => {
  const exp = {
    kind: 'output', ok: true, blocks: [
      { type: 'kv', pairs: [['等级', '99/70'], ['基础经验', '2,284/5,000 (45.7%)'], ['职业经验', '—'], ['基础经验获得', '1,284 (25.7%)'], ['职业经验获得', '0'],
        ['基础经验每小时', '574,600 (3.2%)'], ['职业经验每小时', '0 (—)'], ['基础升级预计', '1h 35m'], ['职业升级预计', '—'],
        ['Zeny 净增', '+12,300'], ['Zeny 每小时', '+44,280'], ['获得道具', '2 种 / 129 件'], ['击杀', '482'], ['死亡', '0'], ['时长', '2h 14m']] },
      { type: 'table', columns: ['怪物', 'ID', '击杀'], rows: [['波利', '1002', '482']] },
      { type: 'table', columns: ['来源', 'ID', '名称', '净变化'], rows: [['Inventory', '909', '胶质物', '117'], ['Inventory', '501', '红色药水', '12'], ['Inventory', '502', '白色药水', '-5']] },
    ],
  };
  open({ results: { exp } });
  tab('earnings').click();
  expect(texts('.kore-fs-earn-title')).toEqual(['本次挂机', '获得道具', '基础经验', '职业经验', '消耗道具', '击杀']);
  const first = [...window.document.querySelectorAll('.kore-fs-earn')[0]!.querySelectorAll('dt, dd')].map(node => node.textContent);
  expect(first).toEqual(['击杀', '482', '死亡', '0', '基础经验每小时', '574,600 (3.2%)', '职业经验每小时', '0 (—)', 'Zeny 净增', '+12,300', 'Zeny 每小时', '+44,280']);
  // The bar is the current progress (current/max), not what was gained.
  expect((window.document.querySelector('.kore-fs-earn-track .kore-fs-gauge-fill') as HTMLElement).style.width).toBe('45.7%');
  expect(texts('.kore-fs-earn:nth-child(2) .kore-fs-item-qty')).toEqual(['+117', '+12']);
  expect(window.document.querySelectorAll('.kore-fs-earn')[1]!.querySelector('.kore-fs-meta')?.textContent).toBe('2 种 / 129 件');
});

test('quick commands run the same command a user would type, and wait for the world', () => {
  const ready = open();
  const labels = [...window.document.querySelectorAll('.kore-fs-quick-btn')].map(node => node.textContent);
  expect(labels).toEqual(['状态', '位置', 'AI 状态', '技能', '怪物', '玩家', 'NPC', '地面物品', '背包', '手推车', '经验', '经验报告', '取消路线', '命令表']);
  const typed = ready.$('.kore-fs-input') as HTMLInputElement;
  typed.value = 'ml';
  (window.document.querySelector('.kore-fs-quick-btn[title="ai print"]') as HTMLElement).click();
  (window.document.querySelector('.kore-fs-quick-btn[title="exp report"]') as HTMLElement).click();
  expect(ready.host.sendCommandText).toHaveBeenCalledWith('ai print');
  expect(ready.host.sendCommandText).toHaveBeenCalledWith('exp report');
  expect(typed.value).toBe('ml');
  window.document.body.replaceChildren();

  open({ worldReady: false });
  const buttons = [...window.document.querySelectorAll<HTMLButtonElement>('.kore-fs-quick-btn')];
  expect(buttons.every(button => button.disabled)).toBe(true);
});

test('the console is the large centre column and the map sits in the right column', () => {
  open();
  const columns = [...window.document.querySelectorAll('.kore-fs-grid > .kore-fs-col')].map(node => node.className);
  expect(columns).toEqual(['kore-fs-col kore-fs-col-side', 'kore-fs-col kore-fs-col-log', 'kore-fs-col kore-fs-col-map']);
  expect(window.document.querySelector('.kore-fs-col-log .kore-fs-console')).toBeTruthy();
  expect(window.document.querySelector('.kore-fs-col-map .kore-fs-map')).toBeTruthy();
  expect(window.document.querySelector('.kore-fs-col-map .kore-fs-quick')).toBeTruthy();
});
