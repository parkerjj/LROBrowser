import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const bundle = readFileSync(new URL('./Online.js', import.meta.url), 'utf8');

test('mini-boss and MVP monsters are drawn larger via the base xSize/ySize', () => {
  assert.match(bundle, /const LASTRO_BOSS_SIZE_SCALE = \{ 1: 2, 2: 2\.5 \};/);
  const handler = bundle.slice(bundle.indexOf('entity.objecttype === Entity.TYPE_MOB && pkt.isBoss'));
  assert.match(
    handler.slice(0, 900),
    /entity\.mobtype = pkt\.isBoss;[\s\S]*LASTRO_BOSS_SIZE_SCALE\[pkt\.isBoss\][\s\S]*entity\.xSize === 5 && entity\.ySize === 5[\s\S]*entity\.xSize = entity\.ySize = 5 \* bossScale;/
  );
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
