import { expect, test } from 'vitest';
import {
  equipmentView, groupItems, isBroken, isWorn, parseEarnings, parseItemRows,
} from '../src/kore/kore-panel-items.mjs';

const table = (columns: string[], rows: string[][]) => ({ kind: 'output', ok: true, blocks: [{ type: 'table', columns, rows }] });
const COLUMNS = ['#', '名称', '数量', '类别', '位置', 'ID'];
const inventory = table(COLUMNS, [
  ['1', '红色药水', '128', '使用品', '背包', '501'],
  ['2', '胶质物', '117', '其他物品', '背包', '909'],
  ['3', '+7 长剑 [Poring] [3]', '1', '武器', 'rightHand+leftHand', '1101'],
  ['4', '耳机', '1', '盔甲', 'topHead', '5001'],
  ['5', '波利卡片', '1', '卡片', '背包', '4001'],
  ['6', '神秘的东西', '3', '—', '背包', '9999'],
  ['7', '白色药水', '30', '使用品', '背包', '504'],
]);

test('item rows are read by column name, so the column order does not matter', () => {
  const rows = parseItemRows(inventory)!;
  expect(rows).toHaveLength(7);
  expect(rows[2]).toEqual({ index: '3', name: '+7 长剑 [Poring] [3]', amount: '1', category: '武器', location: 'rightHand+leftHand', id: '1101' });
  // Cart rows have no location column: everything in a cart counts as "not worn".
  const cart = parseItemRows(table(['#', '名称', '数量', '类别', 'ID'], [['1', '红色药水', '500', '使用品', '501']]))!;
  expect(cart[0]).toMatchObject({ name: '红色药水', location: '背包', category: '使用品', id: '501' });
  expect(parseItemRows({ kind: 'output', ok: false, blocks: [{ type: 'text', text: 'inventory-not-ready' }] })).toBeNull();
});

test('the bag groups by category in the order an AFK player cares about', () => {
  const bag = parseItemRows(inventory)!.filter(row => !isWorn(row));
  const groups = groupItems(bag);
  expect(groups.map(group => [group.label, group.rows.length])).toEqual([
    ['使用品', 2], ['其他物品', 1], ['卡片', 1], ['未分类', 1],
  ]);
  expect(groups[0]!.rows.map(row => row.name)).toEqual(['红色药水', '白色药水']);
});

test('searching filters by name or exact item id and drops empty groups', () => {
  const bag = parseItemRows(inventory)!.filter(row => !isWorn(row));
  expect(groupItems(bag, '药水').map(group => group.label)).toEqual(['使用品']);
  expect(groupItems(bag, '504')[0]!.rows.map(row => row.name)).toEqual(['白色药水']);
  expect(groupItems(bag, '没有这个')).toEqual([]);
});

test('equipment is a fixed slot list; a two-handed weapon fills both hands', () => {
  const view = equipmentView(parseItemRows(inventory)!);
  const byKey = Object.fromEntries(view.map(slot => [slot.key, slot]));
  expect(view.slice(0, 4).map(slot => slot.label)).toEqual(['头上', '头中', '头下', '盔甲']);
  expect(byKey.topHead!.item?.name).toBe('耳机');
  expect(byKey.rightHand!.item?.name).toBe('+7 长剑 [Poring] [3]');
  expect(byKey.leftHand!.item?.name).toBe('+7 长剑 [Poring] [3]');
  // An empty slot is still listed.
  expect(byKey.armor!.item).toBeNull();
  expect(view.some(slot => slot.key.startsWith('costume'))).toBe(false);
});

test('costume and shadow slots only appear when something is worn there', () => {
  const rows = parseItemRows(table(COLUMNS, [['1', '时尚帽子', '1', '服饰', 'costumeTopHead', '19000']]))!;
  const view = equipmentView(rows);
  expect(view.find(slot => slot.key === 'costumeTopHead')).toMatchObject({ label: '服饰 头上', item: { name: '时尚帽子' } });
});

test('a broken item is recognised from OpenKore\'s BROKEN prefix', () => {
  expect(isBroken('BROKEN +4 长剑 [3]')).toBe(true);
  expect(isBroken('长剑 [3]')).toBe(false);
});

const report = {
  kind: 'output', ok: true, blocks: [
    { type: 'kv', pairs: [['等级', '99/70'], ['基础经验', '2,284/5,000 (45.7%)'], ['Zeny 净增', '+12,300']] },
    { type: 'table', columns: ['怪物', 'ID', '击杀'], rows: [['波利', '1002', '120'], ['蚂蚁', '1042', '362']] },
    { type: 'table', columns: ['来源', 'ID', '名称', '净变化'], rows: [
      ['Inventory', '909', '胶质物', '117'], ['Inventory', '501', '红色药水', '-30'], ['Inventory', '7321', '水晶碎片', '12'],
      ['Cart', '501', '红色药水', '100'], ['Inventory', '502', '橙色药水', '0'],
    ] },
  ],
};

test('earnings separate gains, spending and kills; cart and storage moves are not earnings', () => {
  const earnings = parseEarnings(report)!;
  expect(earnings.baseLevel).toBe('99');
  expect(earnings.jobLevel).toBe('70');
  expect(earnings.kv.get('Zeny 净增')).toBe('+12,300');
  expect(earnings.gained.map(item => [item.name, item.amount])).toEqual([['胶质物', 117], ['水晶碎片', 12]]);
  expect(earnings.consumed.map(item => [item.name, item.amount])).toEqual([['红色药水', -30]]);
  expect(earnings.monsters.map(monster => [monster.name, monster.count])).toEqual([['蚂蚁', 362], ['波利', 120]]);
  expect(parseEarnings({ kind: 'output', ok: false, blocks: [] })).toBeNull();
  expect(parseEarnings(null)).toBeNull();
});
