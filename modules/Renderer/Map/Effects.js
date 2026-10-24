define("Renderer/Map/Effects", [
  "Utils/gl-matrix",
  "Renderer/EffectManager",
  "Renderer/EntityManager",
], function (a, b, c) {
  var d = a.vec3,
    e = [];
  return {
    add: function (a) {
      e.push(a);
    },
    free: function () {
      e.length = 0;
    },
    get: function (a) {
      for (var b, c = e.length, d = 0; d < c; ++d)
        if (((b = e[d]), b.name == a)) return b;
      return null;
    },
    remove: function (a) {
      for (var b, c = e.length, d = 0; d < c; ++d)
        if (((b = e[d]), b.name == a)) {
          e.splice(d, 1);
          break;
        }
    },
    spam: function (a, h) {
      var m,
        q,
        k = e.length;
      for (q = 0; q < k; ++q)
        ((m = e[q]),
          !m.isVisible && 25 > d.dist(m.pos, a)
            ? (b.spam({
                effectId: m.id,
                ownerAID: m.name,
                position: m.pos,
                startTick: h,
                persistent: !0,
              }),
              (m.isVisible = !0))
            : m.isVisible &&
              25 <= d.dist(m.pos, a) &&
              (c.remove(m.name), (m.isVisible = !1)));
    },
  };
});
