define("DB/Jobs/JobPalNameTable", ["./JobConst"], function (a) {
  function b(a) {
    var d = c[a],
      b,
      h = arguments.length;
    for (b = 1; b < h; ++b) c[arguments[b]] = d;
  }
  var c = {};
  c[a.NOVICE] = "\u00c3\u00ca\u00ba\u00b8\u00c0\u00da";
  c[a.SWORDMAN] = "\u00b0\u00cb\u00bb\u00e7";
  c[a.MAGICIAN] = "\u00b8\u00b6\u00b9\u00fd\u00bb\u00e7";
  c[a.ARCHER] = "\u00b1\u00c3\u00bc\u00f6";
  c[a.ACOLYTE] = "\u00bc\u00ba\u00c1\u00f7\u00c0\u00da";
  c[a.MERCHANT] = "\u00bb\u00f3\u00c0\u00ce";
  c[a.THIEF] = "\u00b5\u00b5\u00b5\u00cf";
  c[a.KNIGHT] = "\u00b1\u00e2\u00bb\u00e7";
  c[a.PRIEST] = "\u00c7\u00c1\u00b8\u00ae\u00bd\u00ba\u00c6\u00ae";
  c[a.WIZARD] = "\u00c0\u00a7\u00c0\u00fa\u00b5\u00e5";
  c[a.BLACKSMITH] = "\u00c1\u00a6\u00c3\u00b6\u00b0\u00f8";
  c[a.HUNTER] = "\u00c7\u00e5\u00c5\u00cd";
  c[a.ASSASSIN] = "\u00be\u00ee\u00bc\u00bc\u00bd\u00c5";
  c[a.KNIGHT2] =
    "\u00c6\u00e4\u00c4\u00da\u00c6\u00e4\u00c4\u00da_\u00b1\u00e2\u00bb\u00e7";
  c[a.CRUSADER] = "\u00c5\u00a9\u00b7\u00e7";
  c[a.MONK] = "\u00b8\u00f9\u00c5\u00a9";
  c[a.SAGE] = "\u00bc\u00bc\u00c0\u00cc\u00c1\u00f6";
  c[a.ROGUE] = "\u00b7\u00ce\u00b1\u00d7";
  c[a.ALCHEMIST] = "\u00bf\u00ac\u00b1\u00dd\u00bc\u00fa\u00bb\u00e7";
  c[a.BARD] = "\u00b9\u00d9\u00b5\u00e5";
  c[a.DANCER] = "\u00c6\u00e4\u00c4\u00da\u00b7\u00ce\u00b3\u00aa";
  c[a.CRUSADER2] =
    "\u00c6\u00e4\u00c4\u00da\u00c6\u00e4\u00c4\u00da_\u00c5\u00a9\u00b7\u00e7";
  c[a.SUPERNOVICE] =
    "\u00bd\u00b4\u00c6\u00db\u00b3\u00eb\u00ba\u00f1\u00bd\u00ba";
  c[a.GUNSLINGER] = "\u00b0\u00c7\u00b3\u00ca";
  c[a.NINJA] = "\u00b4\u00d1\u00c0\u00da";
  c[a.TAEKWON] = "\u00c5\u00c2\u00b1\u00c7\u00bc\u00d2\u00b3\u00e2";
  c[a.STAR] = "\u00b1\u00c7\u00bc\u00ba";
  c[a.STAR2] = "\u00b1\u00c7\u00bc\u00ba\u00c0\u00b6\u00c7\u00d5";
  c[a.LINKER] = "\u00bc\u00d2\u00bf\u00ef\u00b8\u00b5\u00c4\u00bf";
  c[a.MARRIED] = "\u00b0\u00e1\u00c8\u00a5";
  c[a.XMAS] = "\u00bb\u00ea\u00c5\u00b8";
  c[a.SUMMER] = "\u00bf\u00a9\u00b8\u00a7";
  c[a.KNIGHT_H] =
    "\u00b7\u00ce\u00b5\u00e5\u00b3\u00aa\u00c0\u00cc\u00c6\u00ae";
  c[a.PRIEST_H] =
    "\u00c7\u00cf\u00c0\u00cc\u00c7\u00c1\u00b8\u00ae\u00bd\u00ba\u00c6\u00ae";
  c[a.WIZARD_H] =
    "\u00c7\u00cf\u00c0\u00cc\u00c0\u00a7\u00c0\u00fa\u00b5\u00e5";
  c[a.BLACKSMITH_H] =
    "\u00c8\u00ad\u00c0\u00cc\u00c6\u00ae\u00bd\u00ba\u00b9\u00cc\u00bd\u00ba";
  c[a.HUNTER_H] = "\u00bd\u00ba\u00b3\u00aa\u00c0\u00cc\u00c6\u00db";
  c[a.ASSASSIN_H] =
    "\u00be\u00ee\u00bc\u00bc\u00bd\u00c5\u00c5\u00a9\u00b7\u00ce\u00bd\u00ba";
  c[a.KNIGHT2_H] =
    "\u00b7\u00ce\u00b5\u00e5\u00b3\u00aa\u00c0\u00cc\u00c6\u00ae";
  c[a.CRUSADER_H] = "\u00c6\u00c8\u00b6\u00f3\u00b5\u00f2";
  c[a.MONK_H] = "\u00c3\u00a8\u00c7\u00c7\u00bf\u00c2";
  c[a.SAGE_H] = "\u00c7\u00c1\u00b7\u00ce\u00c6\u00e4\u00bc\u00ad";
  c[a.ROGUE_H] = "\u00bd\u00ba\u00c5\u00e4\u00c4\u00bf";
  c[a.ALCHEMIST_H] =
    "\u00c5\u00a9\u00b8\u00ae\u00bf\u00a1\u00c0\u00cc\u00c5\u00cd";
  c[a.BARD_H] = "\u00c5\u00a9\u00b6\u00f3\u00bf\u00ee";
  c[a.DANCER_H] = "\u00c1\u00fd\u00bd\u00c3";
  c[a.CRUSADER2_H] = "\u00c6\u00c8\u00b6\u00f3\u00b5\u00f2";
  c[a.RUNE_KNIGHT] = "\u00b7\u00e9\u00b3\u00aa\u00c0\u00cc\u00c6\u00ae";
  c[a.WARLOCK] = "\u00bf\u00f6\u00b7\u00cf";
  c[a.RANGER] = "\u00b7\u00b9\u00c0\u00ce\u00c1\u00ae";
  c[a.ARCHBISHOP] = "\u00be\u00c6\u00c5\u00a9\u00ba\u00f1\u00bc\u00f3";
  c[a.MECHANIC] = "\u00b9\u00cc\u00c4\u00c9\u00b4\u00d0";
  c[a.GUILLOTINE_CROSS] =
    "\u00b1\u00e6\u00b7\u00ce\u00c6\u00be\u00c5\u00a9\u00b7\u00ce\u00bd\u00ba";
  c[a.ROYAL_GUARD] = "\u00b0\u00a1\u00b5\u00e5";
  c[a.SORCERER] = "\u00bc\u00d2\u00bc\u00ad\u00b7\u00af";
  c[a.MINSTREL] = "\u00b9\u00ce\u00bd\u00ba\u00c6\u00ae\u00b7\u00b2";
  c[a.WANDERER] = "\u00bf\u00f8\u00b4\u00f5\u00b7\u00af";
  c[a.SURA] = "\u00bd\u00b4\u00b6\u00f3";
  c[a.GENETIC] = "\u00c1\u00a6\u00b3\u00d7\u00b8\u00af";
  c[a.SHADOW_CHASER] =
    "\u00bd\u00a6\u00b5\u00b5\u00bf\u00ec\u00c3\u00bc\u00c0\u00cc\u00bc\u00ad";
  c[a.RUNE_KNIGHT2] =
    "\u00b7\u00e9\u00b3\u00aa\u00c0\u00cc\u00c6\u00ae\u00bb\u00da\u00b6\u00ec";
  c[a.ROYAL_GUARD2] =
    "\u00b1\u00d7\u00b8\u00ae\u00c6\u00f9\u00b0\u00a1\u00b5\u00e5";
  c[a.RANGER2] = "\u00b7\u00b9\u00c0\u00ce\u00c1\u00ae\u00b4\u00c1\u00b4\u00eb";
  c[a.MECHANIC2] = "\u00b8\u00b6\u00b5\u00b5\u00b1\u00e2\u00be\u00ee";
  c[a.PORING_NOVICE] = "\u00c3\u00ca\u00ba\u00b8\u00c0\u00da";
  c[a.PECO_SWORD] = "\u00b0\u00cb\u00bb\u00e7";
  c[a.FOX_MAGICIAN] = "\u00b8\u00b6\u00b9\u00fd\u00bb\u00e7";
  c[a.OSTRICH_ARCHER] = "\u00b1\u00c3\u00bc\u00f6";
  c[a.SHEEP_ACO] = "\u00bc\u00ba\u00c1\u00f7\u00c0\u00da";
  c[a.PIG_MERCHANT] = "\u00bb\u00f3\u00c0\u00ce";
  c[a.DOG_THIEF] = "\u00b5\u00b5\u00b5\u00cf";
  c[a.SHEEP_PRIEST] = "\u00c7\u00c1\u00b8\u00ae\u00bd\u00ba\u00c6\u00ae";
  c[a.FOX_WIZ] = "\u00c0\u00a7\u00c0\u00fa\u00b5\u00e5";
  c[a.PIG_BLACKSMITH] = "\u00c1\u00a6\u00c3\u00b6\u00b0\u00f8";
  c[a.OSTRICH_HUNTER] = "\u00c7\u00e5\u00c5\u00cd";
  c[a.DOG_ASSASSIN] = "\u00be\u00ee\u00bc\u00bc\u00bd\u00c5";
  c[a.PORING_TAEKWON] = "\u00c5\u00c2\u00b1\u00c7\u00bc\u00d2\u00b3\u00e2";
  c[a.FROG_NINJA] = "\u00b4\u00d1\u00c0\u00da";
  c[a.PECO_GUNNER] = "\u00b0\u00c7\u00b3\u00ca";
  c[a.PORING_SNOVICE] =
    "\u00bd\u00b4\u00c6\u00db\u00b3\u00eb\u00ba\u00f1\u00bd\u00ba";
  c[a.SHEEP_MONK] = "\u00b8\u00f9\u00c5\u00a9";
  c[a.FOX_SAGE] = "\u00bc\u00bc\u00c0\u00cc\u00c1\u00f6";
  c[a.PIG_ALCHE] = "\u00bf\u00ac\u00b1\u00dd\u00bc\u00fa\u00bb\u00e7";
  c[a.DOG_ROGUE] = "\u00b7\u00ce\u00b1\u00d7";
  c[a.OSTRICH_BARD] = "\u00b9\u00d9\u00b5\u00e5";
  c[a.OSTRICH_DANCER] = "\u00c6\u00e4\u00c4\u00da\u00b7\u00ce\u00b3\u00aa";
  c[a.PORING_STAR] = "\u00b1\u00c7\u00bc\u00ba";
  c[a.FROG_LINKER] = "\u00bc\u00d2\u00bf\u00ef\u00b8\u00b5\u00c4\u00bf";
  c[a.SHEEP_PRIEST_H] =
    "\u00c7\u00cf\u00c0\u00cc\u00c7\u00c1\u00b8\u00ae\u00bd\u00ba\u00c6\u00ae";
  c[a.FOX_WIZ_H] =
    "\u00c7\u00cf\u00c0\u00cc\u00c0\u00a7\u00c0\u00fa\u00b5\u00e5";
  c[a.PIG_BLACKSMITH_H] =
    "\u00c8\u00ad\u00c0\u00cc\u00c6\u00ae\u00bd\u00ba\u00b9\u00cc\u00bd\u00ba";
  c[a.OSTRICH_HUNTER_H] = "\u00bd\u00ba\u00b3\u00aa\u00c0\u00cc\u00c6\u00db";
  c[a.DOG_ASSA_X] =
    "\u00be\u00ee\u00bc\u00bc\u00bd\u00c5\u00c5\u00a9\u00b7\u00ce\u00bd\u00ba";
  c[a.SHEEP_MONK_H] = "\u00c3\u00a8\u00c7\u00c7\u00bf\u00c2";
  c[a.FOX_SAGE_H] = "\u00c7\u00c1\u00b7\u00ce\u00c6\u00e4\u00bc\u00ad";
  c[a.DOG_ROGUE_H] = "\u00bd\u00ba\u00c5\u00e4\u00c4\u00bf";
  c[a.PIG_ALCHE_H] =
    "\u00c5\u00a9\u00b8\u00ae\u00bf\u00a1\u00c0\u00cc\u00c5\u00cd";
  c[a.OSTRICH_BARD_H] = "\u00c5\u00a9\u00b6\u00f3\u00bf\u00ee";
  c[a.OSTRICH_DANCER_H] = "\u00c1\u00fd\u00bd\u00c3";
  c[a.SUPERNOVICE2] =
    "\u00bd\u00b4\u00c6\u00db\u00b3\u00eb\u00ba\u00f1\u00bd\u00ba";
  c[a.PORING_SNOVICE2] =
    "\u00bd\u00b4\u00c6\u00db\u00b3\u00eb\u00ba\u00f1\u00bd\u00ba\u00c6\u00f7\u00b8\u00b5";
  c[a.KAGEROU] = "kagerou";
  c[a.FROG_KAGEROU] = "frog_kagerou";
  c[a.OBORO] = "oboro";
  c[a.FROG_OBORO] = "frog_oboro";
  b(a.NOVICE, a.NOVICE_H, a.NOVICE_B);
  b(a.SUPERNOVICE, a.SUPERNOVICE_B);
  b(a.SWORDMAN, a.SWORDMAN_H, a.SWORDMAN_B);
  b(a.MAGICIAN, a.MAGICIAN_H, a.MAGICIAN_B);
  b(a.ARCHER, a.ARCHER_H, a.ARCHER_B);
  b(a.ACOLYTE, a.ACOLYTE_H, a.ACOLYTE_B);
  b(a.MERCHANT, a.MERCHANT_H, a.MERCHANT_B);
  b(a.THIEF, a.THIEF_H, a.THIEF_B);
  b(a.KNIGHT, a.KNIGHT_B);
  b(a.KNIGHT2, a.KNIGHT2_B);
  b(a.PRIEST, a.PRIEST_B);
  b(a.WIZARD, a.WIZARD_B);
  b(a.BLACKSMITH, a.BLACKSMITH_B);
  b(a.HUNTER, a.HUNTER_B);
  b(a.ASSASSIN, a.ASSASSIN_B);
  b(a.CRUSADER, a.CRUSADER_B);
  b(a.CRUSADER2, a.CRUSADER2_B);
  b(a.MONK, a.MONK_B);
  b(a.SAGE, a.SAGE_B);
  b(a.ROGUE, a.ROGUE_B);
  b(a.ALCHEMIST, a.ALCHEMIST_B);
  b(a.BARD, a.BARD_B);
  b(a.DANCER, a.DANCER_B);
  b(a.RUNE_KNIGHT, a.RUNE_KNIGHT_H, a.RUNE_KNIGHT_B);
  b(a.RUNE_KNIGHT2, a.RUNE_KNIGHT2_H, a.RUNE_KNIGHT2_B);
  b(a.WARLOCK, a.WARLOCK_H, a.WARLOCK_B);
  b(a.RANGER, a.RANGER_H, a.RANGER_B);
  b(a.RANGER2, a.RANGER2_H, a.RANGER2_B);
  b(a.ARCHBISHOP, a.ARCHBISHOP_H, a.ARCHBISHOP_B);
  b(a.MECHANIC, a.MECHANIC_H, a.MECHANIC_B);
  b(a.MECHANIC2, a.MECHANIC2_H, a.MECHANIC2_B);
  b(a.GUILLOTINE_CROSS, a.GUILLOTINE_CROSS_H, a.GUILLOTINE_CROSS_B);
  b(a.ROYAL_GUARD, a.ROYAL_GUARD_H, a.ROYAL_GUARD_B);
  b(a.ROYAL_GUARD2, a.ROYAL_GUARD2_H, a.ROYAL_GUARD2_B);
  b(a.SORCERER, a.SORCERER_H, a.SORCERER_B);
  b(a.MINSTREL, a.MINSTREL_H, a.MINSTREL_B);
  b(a.WANDERER, a.WANDERER_H, a.WANDERER_B);
  b(a.SURA, a.SURA_H, a.SURA_B);
  b(a.GENETIC, a.GENETIC_H, a.GENETIC_B);
  b(a.SHADOW_CHASER, a.SHADOW_CHASER_H, a.SHADOW_CHASER_B);
  b(a.PORING_NOVICE, a.PORING_NOVICE_H, a.PORING_NOVICE_B);
  b(a.PORING_SNOVICE, a.PORING_SNOVICE_B);
  b(a.PECO_SWORD, a.PECO_SWORD_H, a.PECO_SWORD_B);
  b(a.FOX_MAGICIAN, a.FOX_MAGICIAN_H, a.FOX_MAGICIAN_B);
  b(a.OSTRICH_ARCHER, a.OSTRICH_ARCHER_H, a.OSTRICH_ARCHER_B);
  b(a.SHEEP_ACO, a.SHEEP_ACO_H, a.SHEEP_ACO_B);
  b(a.PIG_MERCHANT, a.PIG_MERCHANT_H, a.PIG_MERCHANT_B);
  b(a.DOG_THIEF, a.DOG_THIEF_H, a.DOG_THIEF_B);
  b(a.SHEEP_PRIEST, a.SHEEP_PRIEST_B);
  b(a.FOX_WIZ, a.FOX_WIZ_B);
  b(a.PIG_BLACKSMITH, a.PIG_BLACKSMITH_B);
  b(a.OSTRICH_HUNTER, a.OSTRICH_HUNTER_B);
  b(a.DOG_ASSASSIN, a.DOG_ASSASSIN_B);
  b(a.SHEEP_MONK, a.SHEEP_MONK_B);
  b(a.FOX_SAGE, a.FOX_SAGE_B);
  b(a.PIG_ALCHE, a.PIG_ALCHE_B);
  b(a.DOG_ROGUE, a.DOG_ROGUE_B);
  b(a.OSTRICH_BARD, a.OSTRICH_BARD_B);
  b(a.OSTRICH_DANCER, a.OSTRICH_DANCER_B);
  b(a.SHEEP_PRIEST_H);
  b(a.FOX_WIZ_H);
  b(a.PIG_BLACKSMITH_H);
  b(a.OSTRICH_HUNTER_H);
  b(a.DOG_ASSA_X);
  b(a.SHEEP_MONK_H);
  b(a.FOX_SAGE_H);
  b(a.PIG_ALCHE_H);
  b(a.DOG_ROGUE_H);
  b(a.OSTRICH_BARD_H);
  b(a.OSTRICH_DANCER_H);
  return c;
});
