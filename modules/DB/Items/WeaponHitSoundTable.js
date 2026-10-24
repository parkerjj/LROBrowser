define("DB/Items/WeaponHitSoundTable", ["./WeaponType"], function (a) {
  var b = {};
  b[a.NONE] = [
    "_hit_fist1.wav",
    "_hit_fist2.wav",
    "_hit_fist3.wav",
    "_hit_fist4.wav",
  ];
  b[a.SHORTSWORD] = ["_hit_dagger.wav"];
  b[a.SWORD] = ["_hit_sword.wav"];
  b[a.TWOHANDSWORD] = ["_hit_sword.wav"];
  b[a.SPEAR] = ["_hit_spear.wav"];
  b[a.TWOHANDSPEAR] = ["_hit_spear.wav"];
  b[a.AXE] = ["_hit_axe.wav"];
  b[a.TWOHANDAXE] = ["_hit_axe.wav"];
  b[a.MACE] = ["_hit_mace.wav"];
  b[a.TWOHANDMACE] = ["_hit_mace.wav"];
  b[a.ROD] = ["_hit_rod.wav"];
  b[a.BOW] = ["_hit_arrow.wav"];
  b[a.KNUKLE] = ["_HIT_FIST2.wav"];
  b[a.INSTRUMENT] = ["_hit_mace.wav"];
  b[a.WHIP] = ["_hit_mace.wav"];
  b[a.BOOK] = ["_hit_mace.wav"];
  b[a.KATAR] = ["_hit_mace.wav"];
  b[a.GUN_HANDGUN] = ["_hit_\u00b1\u00c7\u00c3\u00d1.wav"];
  b[a.GUN_RIFLE] = ["_hit_\u00b6\u00f3\u00c0\u00cc\u00c7\u00c3.wav"];
  b[a.GUN_GATLING] = [
    "_hit_\u00b0\u00b3\u00c6\u00b2\u00b8\u00b5\u00c7\u00d1\u00b9\u00df.wav",
  ];
  b[a.GUN_SHOTGUN] = ["_hit_\u00bc\u00a6\u00b0\u00c7.wav"];
  b[a.GUN_GRANADE] = [
    "_hit_\u00b1\u00d7\u00b7\u00b9\u00b3\u00d7\u00c0\u00cc\u00b5\u00e5\u00b7\u00b1\u00c3\u00c4.wav",
  ];
  b[a.SYURIKEN] = ["_hit_mace.wav"];
  b[a.TWOHANDROD] = ["_hit_rod.wav"];
  b[a.LAST] = ["_hit_fist4.wav"];
  b[a.SHORTSWORD_SHORTSWORD] = ["_hit_mace.wav"];
  b[a.SWORD_SWORD] = ["_hit_mace.wav"];
  b[a.AXE_AXE] = ["_hit_mace.wav"];
  b[a.SHORTSWORD_SWORD] = ["_hit_mace.wav"];
  b[a.SHORTSWORD_AXE] = ["_hit_mace.wav"];
  b[a.SWORD_AXE] = ["_hit_mace.wav"];
  b[a.MAX] = ["_hit_mace.wav"];
  return b;
});
