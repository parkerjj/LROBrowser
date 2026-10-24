define("DB/Items/WeaponTable", ["./WeaponType"], function (a) {
  var b = {};
  b[a.NONE] = "";
  b[a.SHORTSWORD] = "_\u00b4\u00dc\u00b0\u00cb";
  b[a.SWORD] = "_\u00b0\u00cb";
  b[a.TWOHANDSWORD] = "_\u00b0\u00cb";
  b[a.SPEAR] = "_\u00c3\u00a2";
  b[a.TWOHANDSPEAR] = "_\u00c3\u00a2";
  b[a.AXE] = "_\u00b5\u00b5\u00b3\u00a2";
  b[a.TWOHANDAXE] = "_\u00b5\u00b5\u00b3\u00a2";
  b[a.MACE] = "_\u00c5\u00ac\u00b7\u00b4";
  b[a.TWOHANDMACE] = "_\u00c5\u00ac\u00b7\u00b4";
  b[a.ROD] = "_\u00b7\u00d4\u00b5\u00e5";
  b[a.BOW] = "_\u00c8\u00b0";
  b[a.KNUKLE] = "_\u00b3\u00ca\u00c5\u00ac";
  b[a.INSTRUMENT] = "_\u00be\u00c7\u00b1\u00e2";
  b[a.WHIP] = "_\u00c3\u00a4\u00c2\u00ef";
  b[a.BOOK] = "_\u00c3\u00a5";
  b[a.CATARRH] =
    "_\u00c4\u00ab\u00c5\u00b8\u00b8\u00a3_\u00c4\u00ab\u00c5\u00b8\u00b8\u00a3";
  b[a.GUN_HANDGUN] = "_\u00b1\u00c7\u00c3\u00d1";
  b[a.GUN_RIFLE] = "_\u00b1\u00e2\u00b0\u00fc\u00c3\u00d1";
  b[a.GUN_GATLING] = "_\u00b1\u00e2\u00b0\u00fc\u00c3\u00d1";
  b[a.GUN_SHOTGUN] = "_\u00b1\u00e2\u00b0\u00fc\u00c3\u00d1";
  b[a.GUN_GRANADE] = "_\u00b1\u00e2\u00b0\u00fc\u00c3\u00d1";
  b[a.SYURIKEN] = "_\u00bc\u00f6\u00b8\u00ae\u00b0\u00cb";
  b[a.TWOHANDROD] = "_\u00b7\u00d4\u00b5\u00e5";
  b[a.SHORTSWORD_SHORTSWORD] =
    "_\u00b4\u00dc\u00b0\u00cb_\u00b4\u00dc\u00b0\u00cb";
  b[a.SWORD_SWORD] = "_\u00b0\u00cb_\u00b0\u00cb";
  b[a.AXE_AXE] = "_\u00b5\u00b5\u00b3\u00a2_\u00b5\u00b5\u00b3\u00a2";
  b[a.SHORTSWORD_SWORD] = "_\u00b4\u00dc\u00b0\u00cb_\u00b0\u00cb";
  b[a.SHORTSWORD_AXE] = "_\u00b4\u00dc\u00b0\u00cb_\u00b5\u00b5\u00b3\u00a2";
  b[a.SWORD_AXE] = "_\u00b0\u00cb_\u00b5\u00b5\u00b3\u00a2";
  b[a.KATAR] = "_Katar";
  return b;
});
