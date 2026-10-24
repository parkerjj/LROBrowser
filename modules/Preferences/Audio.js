define("Preferences/Audio", ["Core/Preferences"], function (a) {
  return a.get(
    "Audio",
    { BGM: { play: !0, volume: 0.5 }, Sound: { play: !0, volume: 0.5 } },
    1,
  );
});
