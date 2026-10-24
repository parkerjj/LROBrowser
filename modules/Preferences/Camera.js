define("Preferences/Camera", ["Core/Preferences"], function (a) {
  return a.get(
    "Camera",
    { smooth: !0, rotation: 0, height: 220, zoom: 80 },
    1.1,
  );
});
