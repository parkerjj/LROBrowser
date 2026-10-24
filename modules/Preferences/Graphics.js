define("Preferences/Graphics", ["Core/Preferences"], function (a) {
  return a.get(
    "Graphics",
    { screensize: "800x600", quality: 100, cursor: !0 },
    1.1,
  );
});
