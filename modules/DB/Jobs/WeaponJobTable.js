define("DB/Jobs/WeaponJobTable", ["./JobConst", "./JobNameTable"], function (
  a,
  b,
) {
  function c(a) {
    var c = b[a],
      e,
      h = arguments.length;
    for (e = 1; e < h; ++e) d[arguments[e]] = c;
  }
  var d = {},
    e = Object.keys(b),
    m,
    h = e.length;
  for (m = 0; m < h; ++m) d[e[m]] = b[e[m]];
  c(a.NOVICE, a.NOVICE_H, a.NOVICE_B);
  c(a.SWORDMAN, a.SWORDMAN_H, a.SWORDMAN_B);
  c(a.MAGICIAN, a.MAGICIAN_H, a.MAGICIAN_B);
  c(a.ARCHER, a.ARCHER_H, a.ARCHER_B);
  c(a.ACOLYTE, a.ACOLYTE_H, a.ACOLYTE_B);
  c(a.MERCHANT, a.MERCHANT_H, a.MERCHANT_B);
  c(a.THIEF, a.THIEF_H, a.THIEF_B);
  c(
    a.KNIGHT,
    a.KNIGHT_H,
    a.KNIGHT_B,
    a.RUNE_KNIGHT,
    a.RUNE_KNIGHT_H,
    a.RUNE_KNIGHT_B,
  );
  c(
    a.KNIGHT2,
    a.KNIGHT2_H,
    a.KNIGHT2_B,
    a.RUNE_KNIGHT2,
    a.RUNE_KNIGHT2_H,
    a.RUNE_KNIGHT2_B,
  );
  c(
    a.PRIEST,
    a.PRIEST_H,
    a.PRIEST_B,
    a.ARCHBISHOP,
    a.ARCHBISHOP_H,
    a.ARCHBISHOP_B,
  );
  c(a.WIZARD, a.WIZARD_H, a.WIZARD_B, a.WARLOCK, a.WARLOCK_H, a.WARLOCK_B);
  c(
    a.BLACKSMITH,
    a.BLACKSMITH_H,
    a.BLACKSMITH_B,
    a.MECHANIC,
    a.MECHANIC_H,
    a.MECHANIC_B,
  );
  c(a.HUNTER, a.HUNTER_H, a.HUNTER_B, a.RANGER, a.RANGER_H, a.RANGER_B);
  c(
    a.ASSASSIN,
    a.ASSASSIN_H,
    a.ASSASSIN_B,
    a.GUILLOTINE_CROSS,
    a.GUILLOTINE_CROSS_H,
    a.GUILLOTINE_CROSS_B,
  );
  c(
    a.CRUSADER,
    a.CRUSADER_H,
    a.CRUSADER_B,
    a.ROYAL_GUARD,
    a.ROYAL_GUARD_H,
    a.ROYAL_GUARD_B,
  );
  c(
    a.CRUSADER2,
    a.CRUSADER2_H,
    a.CRUSADER2_B,
    a.ROYAL_GUARD2,
    a.ROYAL_GUARD2_H,
    a.ROYAL_GUARD2_B,
  );
  c(a.MONK, a.MONK_H, a.MONK_B, a.SURA, a.SURA_H, a.SURA_B);
  c(a.SAGE, a.SAGE_H, a.SAGE_B, a.SORCERER, a.SORCERER_H, a.SORCERER_B);
  c(
    a.ROGUE,
    a.ROGUE_H,
    a.ROGUE_B,
    a.SHADOW_CHASER,
    a.SHADOW_CHASER_H,
    a.SHADOW_CHASER_B,
  );
  c(
    a.ALCHEMIST,
    a.ALCHEMIST_H,
    a.ALCHEMIST_B,
    a.GENETIC,
    a.GENETIC_H,
    a.GENETIC_B,
  );
  c(a.BARD, a.BARD_H, a.BARD_B, a.MINSTREL, a.MINSTREL_H, a.MINSTREL_B);
  c(a.DANCER, a.DANCER_H, a.DANCER_B, a.WANDERER, a.WANDERER_H, a.WANDERER_B);
  return d;
});
