define("DB/Jobs/WeaponAction", ["./JobConst", "DB/Items/WeaponType"], function (
  a,
  b,
) {
  function c(a) {
    var b = d[a],
      c,
      e = arguments.length;
    for (c = 1; c < e; ++c) d[arguments[c]] = b;
  }
  var d = {};
  d[a.NOVICE] = [
    new (function () {
      this[b.NONE] = 0;
      this[b.ROD] = 1;
      this[b.TWOHANDROD] = 1;
      this[b.SWORD] = 1;
      this[b.TWOHANDSWORD] = 1;
      this[b.AXE] = 1;
      this[b.TWOHANDAXE] = 1;
      this[b.MACE] = 1;
      this[b.TWOHANDMACE] = 1;
      this[b.SHORTSWORD] = 2;
    })(),
    new (function () {
      this[b.NONE] = 0;
      this[b.SHORTSWORD] = 1;
      this[b.ROD] = 2;
      this[b.TWOHANDROD] = 2;
      this[b.SWORD] = 2;
      this[b.TWOHANDSWORD] = 2;
      this[b.AXE] = 2;
      this[b.TWOHANDAXE] = 2;
      this[b.MACE] = 2;
      this[b.TWOHANDMACE] = 2;
    })(),
  ];
  d[a.SWORDMAN] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.AXE] = 1;
    this[b.TWOHANDAXE] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.SPEAR] = 2;
    this[b.TWOHANDSPEAR] = 2;
  })();
  d[a.MAGICIAN] = new (function () {
    this[b.NONE] = 0;
    this[b.ROD] = 1;
    this[b.TWOHANDROD] = 1;
    this[b.SHORTSWORD] = 2;
  })();
  d[a.ARCHER] = new (function () {
    this[b.NONE] = 0;
    this[b.BOW] = 1;
    this[b.SHORTSWORD] = 2;
  })();
  d[a.ACOLYTE] = new (function () {
    this[b.NONE] = 0;
    this[b.ROD] = 1;
    this[b.TWOHANDROD] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
  })();
  d[a.MERCHANT] = new (function () {
    this[b.NONE] = 0;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.AXE] = 1;
    this[b.TWOHANDAXE] = 1;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.SHORTSWORD] = 2;
  })();
  d[a.THIEF] = new (function () {
    this[b.NONE] = 0;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.SHORTSWORD] = 1;
    this[b.BOW] = 2;
  })();
  d[a.KNIGHT] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.AXE] = 1;
    this[b.TWOHANDAXE] = 1;
    this[b.SWORD] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.SPEAR] = 2;
    this[b.TWOHANDSPEAR] = 2;
  })();
  d[a.PRIEST] = new (function () {
    this[b.NONE] = 0;
    this[b.ROD] = 1;
    this[b.TWOHANDROD] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.BOOK] = 2;
  })();
  d[a.WIZARD] = [
    new (function () {
      this[b.NONE] = 0;
      this[b.SHORTSWORD] = 1;
      this[b.ROD] = 2;
      this[b.TWOHANDROD] = 2;
    })(),
    new (function () {
      this[b.NONE] = 0;
      this[b.ROD] = 1;
      this[b.TWOHANDROD] = 1;
      this[b.SHORTSWORD] = 2;
    })(),
  ];
  d[a.BLACKSMITH] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SWORD] = 2;
    this[b.TWOHANDSWORD] = 2;
    this[b.AXE] = 2;
    this[b.TWOHANDAXE] = 2;
    this[b.MACE] = 2;
    this[b.TWOHANDMACE] = 2;
  })();
  d[a.HUNTER] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.BOW] = 2;
  })();
  d[a.ASSASSIN] = new (function () {
    this[b.NONE] = 0;
    this[b.SWORD] = 1;
    this[b.SHORTSWORD] = 1;
    this[b.SHORTSWORD_SHORTSWORD] = 2;
    this[b.SWORD_SWORD] = 2;
    this[b.AXE] = 1;
    this[b.AXE_AXE] = 2;
    this[b.SHORTSWORD_SWORD] = 2;
    this[b.SHORTSWORD_AXE] = 2;
    this[b.SWORD_AXE] = 2;
    this[b.KATAR] = 2;
  })();
  d[a.KNIGHT2] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.AXE] = 1;
    this[b.TWOHANDAXE] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.SPEAR] = 2;
    this[b.TWOHANDSPEAR] = 2;
  })();
  d[a.CRUSADER] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.AXE] = 1;
    this[b.TWOHANDAXE] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.SPEAR] = 2;
    this[b.TWOHANDSPEAR] = 2;
  })();
  d[a.MONK] = new (function () {
    this[b.NONE] = 0;
    this[b.ROD] = 1;
    this[b.TWOHANDROD] = 1;
    this[b.MACE] = 1;
    this[b.TWOHANDMACE] = 1;
    this[b.KNUKLE] = 2;
  })();
  d[a.SAGE] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.ROD] = 2;
    this[b.TWOHANDROD] = 2;
    this[b.BOOK] = 2;
  })();
  d[a.ROGUE] = new (function () {
    this[b.NONE] = 0;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.SHORTSWORD] = 1;
    this[b.BOW] = 2;
  })();
  d[a.ALCHEMIST] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.TWOHANDSWORD] = 2;
    this[b.SWORD] = 2;
    this[b.AXE] = 2;
    this[b.TWOHANDAXE] = 2;
    this[b.MACE] = 2;
    this[b.TWOHANDMACE] = 2;
  })();
  d[a.BARD] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.INSTRUMENT] = 1;
    this[b.BOW] = 2;
  })();
  d[a.DANCER] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 0;
    this[b.WHIP] = 1;
    this[b.BOW] = 2;
  })();
  d[a.CRUSADER2] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SWORD] = 1;
    this[b.TWOHANDSWORD] = 1;
    this[b.AXE] = 1;
    this[b.TWOHANDAXE] = 1;
    this[b.MACE] = 1;
    this[b.SPEAR] = 2;
    this[b.TWOHANDSPEAR] = 2;
  })();
  d[a.SUPERNOVICE] = [
    new (function () {
      this[b.NONE] = 0;
      this[b.ROD] = 1;
      this[b.TWOHANDROD] = 1;
      this[b.AXE] = 1;
      this[b.TWOHANDAXE] = 1;
      this[b.MACE] = 1;
      this[b.TWOHANDMACE] = 1;
      this[b.SWORD] = 1;
      this[b.SHORTSWORD] = 2;
    })(),
    new (function () {
      this[b.NONE] = 0;
      this[b.SHORTSWORD] = 1;
      this[b.ROD] = 2;
      this[b.TWOHANDROD] = 2;
      this[b.AXE] = 2;
      this[b.TWOHANDAXE] = 2;
      this[b.MACE] = 2;
      this[b.TWOHANDMACE] = 2;
      this[b.SWORD] = 2;
    })(),
  ];
  d[a.NINJA] = new (function () {
    this[b.NONE] = 0;
    this[b.SHORTSWORD] = 1;
    this[b.SYURIKEN] = 2;
  })();
  d[a.GUNSLINGER] = new (function () {
    this[b.NONE] = 1;
    this[b.GUN_HANDGUN] = 1;
    this[b.GUN_SHOTGUN] = 1;
    this[b.GUN_GATLING] = 2;
    this[b.GUN_RIFLE] = 2;
    this[b.GUN_GRANADE] = 2;
  })();
  d[a.LINKER] = [
    new (function () {
      this[b.NONE] = 0;
      this[b.SHORTSWORD] = 1;
      this[b.ROD] = 2;
      this[b.TWOHANDROD] = 2;
    })(),
    new (function () {
      this[b.NONE] = 0;
      this[b.ROD] = 1;
      this[b.TWOHANDROD] = 1;
      this[b.SHORTSWORD] = 2;
    })(),
  ];
  d[a.DO_SUMMONER] = new (function () {
    this[b.NONE] = 0;
    this[b.ROD] = 1;
  })();
  c(a.NOVICE, a.NOVICE_H, a.NOVICE_B);
  c(a.SWORDMAN, a.SWORDMAN_H, a.SWORDMAN_B);
  c(a.MAGICIAN, a.MAGICIAN_H, a.MAGICIAN_B);
  c(a.ARCHER, a.ARCHER_H, a.ARCHER_B);
  c(a.ACOLYTE, a.ACOLYTE_H, a.ACOLYTE_B);
  c(a.MERCHANT, a.MERCHANT_H, a.MERCHANT_B);
  c(a.THIEF, a.THIEF_H, a.THIEF_B);
  c(
    a.KNIGHT,
    a.KNIGHT_B,
    a.KNIGHT_H,
    a.RUNE_KNIGHT,
    a.RUNE_KNIGHT_H,
    a.RUNE_KNIGHT_B,
  );
  c(
    a.KNIGHT2,
    a.KNIGHT2_B,
    a.KNIGHT2_H,
    a.RUNE_KNIGHT2,
    a.RUNE_KNIGHT2_H,
    a.RUNE_KNIGHT2_B,
  );
  c(
    a.PRIEST,
    a.PRIEST_B,
    a.PRIEST_H,
    a.ARCHBISHOP,
    a.ARCHBISHOP_H,
    a.ARCHBISHOP_B,
  );
  c(a.WIZARD, a.WIZARD_B, a.WIZARD_H, a.WARLOCK, a.WARLOCK_H, a.WARLOCK_B);
  c(
    a.BLACKSMITH,
    a.BLACKSMITH_B,
    a.BLACKSMITH_H,
    a.MECHANIC,
    a.MECHANIC_H,
    a.MECHANIC_B,
  );
  c(a.HUNTER, a.HUNTER_B, a.HUNTER_H, a.RANGER, a.RANGER_H, a.RANGER_B);
  c(
    a.ASSASSIN,
    a.ASSASSIN_B,
    a.ASSASSIN_H,
    a.GUILLOTINE_CROSS,
    a.GUILLOTINE_CROSS_H,
    a.GUILLOTINE_CROSS_B,
  );
  c(
    a.CRUSADER,
    a.CRUSADER_B,
    a.CRUSADER_H,
    a.ROYAL_GUARD,
    a.ROYAL_GUARD_H,
    a.ROYAL_GUARD_B,
  );
  c(
    a.CRUSADER2,
    a.CRUSADER2_B,
    a.CRUSADER2_H,
    a.ROYAL_GUARD2,
    a.ROYAL_GUARD2_H,
    a.ROYAL_GUARD2_B,
  );
  c(a.MONK, a.MONK_B, a.MONK_H, a.SURA, a.SURA_H, a.SURA_B);
  c(a.SAGE, a.SAGE_B, a.SAGE_H, a.SORCERER, a.SORCERER_H, a.SORCERER_B);
  c(
    a.ROGUE,
    a.ROGUE_B,
    a.ROGUE_H,
    a.SHADOW_CHASER,
    a.SHADOW_CHASER_H,
    a.SHADOW_CHASER_B,
  );
  c(
    a.ALCHEMIST,
    a.ALCHEMIST_B,
    a.ALCHEMIST_H,
    a.GENETIC,
    a.GENETIC_H,
    a.GENETIC_B,
  );
  c(a.BARD, a.BARD_B, a.BARD_H, a.MINSTREL, a.MINSTREL_H, a.MINSTREL_B);
  c(a.DANCER, a.DANCER_B, a.DANCER_H, a.WANDERER, a.WANDERER_H, a.WANDERER_B);
  return d;
});
