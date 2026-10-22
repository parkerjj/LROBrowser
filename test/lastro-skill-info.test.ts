import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readSkillSource } from '../scripts/lastro-skill-data.mjs';

// LastRO (gbk) loads skillinfolist_re_06.lua, not skillinfolist.lub. A skill that the built-in
// skill tree lists but this file lacks has no SkillInfo, so the skill window drops it.
const native = readFileSync('vendor/v2/Online.js', 'utf8');
const start = native.indexOf('//#region src/DB/Skills/SkillTreeView.js');
const treeSkills = new Set([...native.slice(start, native.indexOf('//#endregion', start)).matchAll(/SkillConst_default\.([A-Z0-9_]+)/g)].map(match => match[1]!));
const info: string = readSkillSource('skillinfolist_re_06.lua');

describe('LastRO skill info for the built-in skill tree', () => {
  const shSkills = [...treeSkills].filter(name => name.startsWith('SH_'));

  it('lists the 16 SH_ skills that the skill tree shows', () => {
    expect(shSkills).toHaveLength(16);
  });

  it.each(shSkills)('defines %s with a consistent level table', name => {
    const entry = info.match(new RegExp(`\\[SKID\\.${name}\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\t?\\}`));
    expect(entry, `${name} is missing from skillinfolist_re_06.lua`).not.toBeNull();
    const body = entry![1]!;
    const maxLevel = Number(/MaxLv\s*=\s*(\d+)/.exec(body)?.[1]);
    expect(maxLevel).toBeGreaterThan(0);
    for (const field of ['SpAmount', 'AttackRange']) {
      const values = new RegExp(`${field}\\s*=\\s*\\{([^}]*)\\}`).exec(body)?.[1];
      expect(values?.split(','), `${name}.${field}`).toHaveLength(maxLevel);
    }
  });
});
