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
      var l,
        t,
        n = e.length;
      for (t = 0; t < n; ++t)
        ((l = e[t]),
          !l.isVisible && 25 > d.dist(l.pos, a)
            ? (b.spam({
                effectId: l.id,
                ownerAID: l.name,
                position: l.pos,
                startTick: h,
                persistent: !0,
              }),
              (l.isVisible = !0))
            : l.isVisible &&
              25 <= d.dist(l.pos, a) &&
              (c.remove(l.name), (l.isVisible = !1)));
    },
  };
});
