define("Preferences/Controls", ["Core/Preferences"], function (a) {
  return a.get(
    "Controls",
    {
      noctrl: !0,
      noshift: !0,
      autoattack: !1,
      autofollow: !1,
      autopick: !1,
      autoeat: !1,
      onlyattack: 0,
      talk: !1,
      whitemail: !1,
    },
    1,
  );
});
