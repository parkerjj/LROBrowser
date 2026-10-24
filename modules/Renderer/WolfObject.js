define(
  "Renderer/WolfObject",
  "DB/DBManager Renderer/Renderer Renderer/EntityManager Renderer/Entity/Entity Renderer/Map/Altitude Utils/PathFinding Renderer/Entity/EntityAction".split(
    " ",
  ),
  function (a, b, c, d, e, m, h) {
    function r(a) {
      var l = c.get(a),
        f = c.get(a - 2e4);
      if (!l)
        f &&
          0 < f.position[0] &&
          0 < f.position[1] &&
          ((l = new d()),
          (l.GID = a),
          (l.objecttype = d.TYPE_WOLF),
          h.call(l),
          (l.walk.speed = 90),
          (l.attack_speed = 510),
          (l.lastTick = 0),
          (l.move = !1),
          (l.display.load = l.display.TYPE.COMPLETE),
          (l.files.body.spr =
            "data/sprite/\u00b8\u00f3\u00bd\u00ba\u00c5\u00cd/\u00bf\u00f6\u00b1\u00d7.spr"),
          (l.files.body.act =
            "data/sprite/\u00b8\u00f3\u00bd\u00ba\u00c5\u00cd/\u00bf\u00f6\u00b1\u00d7.act"),
          (l.files.shadow.size = 1),
          (l.position[0] = f.position[0] + k.x[f.direction]),
          (l.position[1] = f.position[1] + k.y[f.direction]),
          (l.position[2] = e.getCellHeight(
            Math.round(l.position[0]),
            Math.round(l.position[1]),
          )),
          c.add(l));
      else if (f) {
        a = l.position[0];
        var m = l.position[1],
          p = 0,
          q = 0;
        l.strike
          ? b.tick > l.moveTick
            ? ((l.strike = !1),
              (l.delayMove = !0),
              (l.action = 1),
              setTimeout(function () {
                l.delayMove = !1;
              }, 200))
            : ((p = l.target.position[0] - l.position[0]),
              (f = l.target.position[1] - l.position[1]),
              (p /= 10),
              (q = f / 10),
              (l.action = 2),
              (l.direction =
                g[(0 < p ? 1 : 0 > p ? -1 : 0) + 1][
                  (0 < q ? 1 : 0 > q ? -1 : 0) + 1
                ]),
              (l.position[0] = a + p),
              (l.position[1] = m + q),
              (l.position[2] = e.getCellHeight(
                Math.round(l.position[0]),
                Math.round(l.position[1]),
              )))
          : l.delayMove ||
            (14 < Math.abs(f.position[0] - a) ||
            14 < Math.abs(f.position[1] - m)
              ? ((l.position[0] = f.position[0]),
                (l.position[1] = f.position[1]),
                (l.position[2] = e.getCellHeight(
                  Math.round(l.position[0]),
                  Math.round(l.position[1]),
                )))
              : ((3 < Math.abs(f.position[0] - a) ||
                  3 < Math.abs(f.position[1] - m)) &&
                  !l.move &&
                  ((l.move = !0), (l.action = 1)),
                1 > Math.abs(f.position[0] - a) &&
                  1 > Math.abs(f.position[1] - m) &&
                  ((l.move = !1), (l.action = 0)),
                l.move &&
                  ((p = f.position[0] - l.position[0]),
                  (q = f = f.position[1] - l.position[1]),
                  (a += p / (l.walk.speed / 3)),
                  (m += q / (l.walk.speed / 3)),
                  (l.direction =
                    g[(0 < p ? 1 : 0 > p ? -1 : 0) + 1][
                      (0 < q ? 1 : 0 > q ? -1 : 0) + 1
                    ]),
                  (l.position[0] = a),
                  (l.position[1] = m),
                  (l.position[2] = e.getCellHeight(
                    Math.round(l.position[0]),
                    Math.round(l.position[1]),
                  )))));
      }
    }
    var q = [],
      k = {
        x: [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7],
        y: [0.7, 1, 0, -1, -0.7, -1, 0, 1],
      },
      g = [
        [1, 2, 3],
        [0, 0, 4],
        [7, 6, 5],
      ];
    return {
      add: function (a) {
        0 <= q.indexOf(a.GID + 2e4) || q.push(a.GID + 2e4);
      },
      render: function () {
        for (var a = 0; a < q.length; a++) r(q[a]);
      },
      prerender: r,
      remove: function (a) {
        var b = q.indexOf(a + 2e4);
        0 <= b && (q.splice(b, 1), c.remove(a + 2e4));
      },
    };
  },
);
