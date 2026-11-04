import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const bundle = readFileSync(new URL('./Online.js', import.meta.url), 'utf8');

test('boss scaling uses a monster-id whitelist, not the server isBoss flag', () => {
  const start = bundle.indexOf('// Boss whitelist by monster class id');
  const end = bundle.indexOf('function updateEntityStyle(entity)', start);
  assert.notEqual(start, -1);
  const get = new Function(`${bundle.slice(start, end)}; return getLastroBossScale;`)();
  assert.equal(get(1038), 2.5); // Osiris (MVP)
  assert.equal(get(1039), 2.5); // Baphomet (MVP)
  assert.equal(get(1096), 2); // Angeling (mini-boss)
  assert.equal(get(1002), 0); // Poring
  assert.equal(get(1865), 0); // minions are not scaled
  const handler = bundle.slice(bundle.indexOf('getLastroBossScale(pkt.job)') - 400);
  assert.doesNotMatch(handler.slice(0, 900), /LASTRO_BOSS_SIZE_SCALE\[pkt\.isBoss\]/);
  assert.match(handler.slice(0, 900), /entity\.xSize === 5 && entity\.ySize === 5[\s\S]*entity\.xSize = entity\.ySize = 5 \* bossScale;/);
});

test('barter lists expose the packet quota as the remaining stock count', () => {
  const start = bundle.indexOf('function getBarterRemaining(item)');
  assert.notEqual(start, -1);
  // Evaluate the helper in isolation to pin the unlimited sentinels.
  const fn = new Function(`${bundle.slice(start, bundle.indexOf('\n}\n', start) + 3)}; return getBarterRemaining;`)();
  assert.equal(fn({ amount: 5 }), 5);
  assert.equal(fn({ amount: 0 }), 0);
  assert.equal(fn({ amount: 0xffffffff }), 0);
  assert.equal(fn({}), 0);

  assert.match(
    bundle,
    /case NpcStore\.Type\.BARTER_MARKET:\s*case NpcStore\.Type\.BARTER_MARKET_EXTENDED:[\s\S]{0,260}items\[i\]\.count =\s*items\[i\]\.count \|\| getBarterRemaining\(items\[i\]\) \|\| Infinity;/
  );
  assert.equal((bundle.match(/title="\$\{_escapeHTML\(formatBarterTitle\(item\)\)\}"/g) || []).length, 2);
});
