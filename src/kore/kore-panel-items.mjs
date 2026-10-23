// Pure helpers for the fullscreen item and earnings views. Rust owns the data
// (the `i`, `cart` and `exp report` outputs); this only reads those blocks and
// arranges them for display. Equipment and groups are derived from one `i`
// result: re-listing with `i eq` / `i u` would renumber Rust's "latest list",
// and a user typing `eq 3` could then pick a different item.

const blockOf = (result, type) => Array.isArray(result?.blocks) ? result.blocks.find(block => block?.type === type) : null;
const text = value => String(value ?? '');

// What Rust calls the category (OpenKore itemtypes) -> how the bag groups it.
// Ordered for someone watching an AFK character: consumables, loot, cards, gear.
export const ITEM_GROUPS = Object.freeze([
  { key: 'usable', label: '使用品', categories: ['使用品'] },
  { key: 'etc', label: '其他物品', categories: ['其他物品'] },
  { key: 'card', label: '卡片', categories: ['卡片'] },
  { key: 'equip', label: '装备', categories: ['武器', '盔甲', '服饰'] },
  { key: 'ammo', label: '弹药', categories: ['箭矢', '枪', '子弹', '飞镖', '炮弹'] },
  { key: 'pet', label: '宠物蛋', categories: ['宠物蛋'] },
  { key: 'cash', label: '商城物品', categories: ['商城物品'] },
]);
const UNKNOWN_GROUP = Object.freeze({ key: 'unknown', label: '未分类', categories: [] });
const GROUP_BY_CATEGORY = new Map(ITEM_GROUPS.flatMap(group => group.categories.map(category => [category, group])));

export const NOT_WORN = '背包';

export function parseItemRows(result) {
  const table = blockOf(result, 'table');
  if (!table) return null;
  const columns = (table.columns ?? []).map(text);
  const at = name => columns.indexOf(name);
  return (table.rows ?? []).map(row => ({
    index: text(row?.[at('#')]),
    name: text(row?.[at('名称')]),
    amount: text(row?.[at('数量')]),
    category: at('类别') >= 0 ? text(row?.[at('类别')]) : '—',
    location: at('位置') >= 0 ? text(row?.[at('位置')]) : NOT_WORN,
    id: at('ID') >= 0 ? text(row?.[at('ID')]) : '',
  }));
}

export const isWorn = row => row.location !== NOT_WORN && row.location !== '—' && row.location !== '';

export function groupItems(rows, query = '') {
  const needle = text(query).trim().toLowerCase();
  const matches = row => !needle || row.name.toLowerCase().includes(needle) || row.id === needle;
  const groups = new Map();
  for (const row of rows) {
    if (!matches(row)) continue;
    const group = GROUP_BY_CATEGORY.get(row.category) ?? UNKNOWN_GROUP;
    if (!groups.has(group.key)) groups.set(group.key, { key: group.key, label: group.label, rows: [] });
    groups.get(group.key).rows.push(row);
  }
  return [...ITEM_GROUPS, UNKNOWN_GROUP].filter(group => groups.has(group.key)).map(group => groups.get(group.key));
}

// OpenKore slot names (equip_<slot> in the config) -> what the player calls them.
export const EQUIP_SLOTS = Object.freeze([
  ['topHead', '头上'], ['midHead', '头中'], ['lowHead', '头下'], ['armor', '盔甲'],
  ['rightHand', '右手'], ['leftHand', '左手'], ['robe', '披肩'], ['shoes', '鞋子'],
  ['rightAccessory', '右饰品'], ['leftAccessory', '左饰品'], ['arrow', '箭矢'],
]);
const EXTRA_SLOT_LABELS = Object.freeze({
  costumeTopHead: '服饰 头上', costumeMidHead: '服饰 头中', costumeLowHead: '服饰 头下',
  costumeRobe: '服饰 披肩', costumeFloor: '服饰 地面',
  shadowArmor: '影子 盔甲', shadowRightHand: '影子 右手', shadowLeftHand: '影子 左手',
  shadowShoes: '影子 鞋子', shadowRightAccessory: '影子 右饰品', shadowLeftAccessory: '影子 左饰品',
});

// The common slots are always listed (an empty slot is information too); costume
// and shadow slots only show up when something is worn there. A two-handed
// weapon or an upper+mid headgear occupies several slots and appears in each.
export function equipmentView(rows) {
  const bySlot = new Map();
  for (const row of rows) {
    if (!isWorn(row)) continue;
    for (const slot of row.location.split('+')) bySlot.set(slot, row);
  }
  const common = EQUIP_SLOTS.map(([key, label]) => ({ key, label, item: bySlot.get(key) ?? null }));
  const known = new Set(EQUIP_SLOTS.map(([key]) => key));
  const extra = [...bySlot].filter(([key]) => !known.has(key))
    .map(([key, item]) => ({ key, label: EXTRA_SLOT_LABELS[key] ?? key, item }));
  return [...common, ...extra];
}

// OpenKore prefixes a damaged item with "BROKEN ".
export const isBroken = name => /^BROKEN /.test(text(name));

const toNumber = value => {
  const number = Number(text(value).replace(/[,+\s]/g, ''));
  return Number.isFinite(number) ? number : 0;
};

// Rows of the experience table: [row label, base key, job key] from the `exp report` kv.
export const EXP_ROWS = Object.freeze([
  ['当前', '基础经验', '职业经验'],
  ['本次获得', '基础经验获得', '职业经验获得'],
  ['每小时', '基础经验每小时', '职业经验每小时'],
  ['升级预计', '基础升级预计', '职业升级预计'],
]);

export function parseEarnings(result) {
  if (!result || result.ok === false || !Array.isArray(result.blocks)) return null;
  const kv = new Map();
  for (const [key, value] of blockOf(result, 'kv')?.pairs ?? []) kv.set(text(key), text(value));
  const tables = result.blocks.filter(block => block?.type === 'table');
  const monsterTable = tables.find(table => (table.columns ?? []).includes('怪物'));
  const itemTable = tables.find(table => (table.columns ?? []).includes('来源'));
  const monsters = (monsterTable?.rows ?? [])
    .map(([name, id, count]) => ({ name: text(name), id: text(id), count: toNumber(count) }))
    .sort((a, b) => b.count - a.count);
  // Only what changed in the bag counts as earned or spent; moves to the cart or storage are transfers.
  const inventory = (itemTable?.rows ?? [])
    .map(([scope, id, name, net]) => ({ scope: text(scope), id: text(id), name: text(name), amount: toNumber(net) }))
    .filter(item => item.scope === 'Inventory' && item.amount !== 0);
  const [baseLevel = '—', jobLevel = '—'] = text(kv.get('等级')).split('/');
  return {
    kv, baseLevel, jobLevel, monsters,
    gained: inventory.filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount),
    consumed: inventory.filter(item => item.amount < 0).sort((a, b) => a.amount - b.amount),
  };
}
