define("Renderer/Map/Sounds", [
  "Utils/gl-matrix",
  "Audio/SoundManager",
], function (a, b) {
  var c = a.vec2,
    d = [];
  return {
    add: function (a) {
      d.push(a);
    },
    free: function () {
      d.length = 0;
    },
    render: function (a, l) {
      var e,
        r,
        t = d.length;
      for (r = 0; r < t; ++r) {
        e = d[r];
        var n = Math.floor(c.dist(e.pos, a));
        e.tick < l &&
          n <= e.range &&
          (b.playPosition(e.file, e.pos), (e.tick = l + 1e3 * e.cycle));
      }
    },
  };
});
