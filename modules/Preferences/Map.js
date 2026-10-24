define("Preferences/Map", ["Core/Preferences"], function (a) {
  return a.get(
    "Map",
    { fog: !0, lightmap: !0, effect: !0, mineffect: !0, miss: !0 },
    1.1,
  );
});
