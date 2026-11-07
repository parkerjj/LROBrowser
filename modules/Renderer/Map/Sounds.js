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
    render: function (a, m) {
      var e,
        r,
        q = d.length;
      for (r = 0; r < q; ++r) {
        e = d[r];
        var k = Math.floor(c.dist(e.pos, a));
        e.tick < m &&
          k <= e.range &&
          (b.playPosition(e.file, e.pos), (e.tick = m + 1e3 * e.cycle));
      }
    },
  };
});
