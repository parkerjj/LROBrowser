define(
  "Renderer/FalconObject",
  "DB/DBManager Renderer/Renderer Renderer/EntityManager Renderer/Entity/Entity Renderer/Map/Altitude Utils/PathFinding".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    function h(a) {
      var g = c.get(a);
      a = c.get(a - 1e4);
      if (!g)
        a &&
          0 < a.position[0] &&
          0 < a.position[1] &&
          ((g = new d()),
          (g.GID = a.GID + 1e4),
          (g.objecttype = d.TYPE_FALCON),
          (g.walk.speed = a.walk.speed),
          (g.display.load = g.display.TYPE.COMPLETE),
          4012 == a._job || 4098 == a._job
            ? ((g.files.body.spr =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00b8\u00c52.spr"),
              (g.files.body.act =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00b8\u00c52.act"))
            : ((g.files.body.spr =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00b8\u00c5.spr"),
              (g.files.body.act =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00b8\u00c5.act")),
          (g.files.shadow.size = 1),
          (g.position[0] = a.position[0] + q.x[a.direction]),
          (g.position[1] = a.position[1] + q.y[a.direction]),
          (g.position[2] = e.getCellHeight(
            Math.round(g.position[0]),
            Math.round(g.position[1]),
          )),
          c.add(g));
      else if (a) {
        var h = g.position[0],
          f = g.position[1],
          m = 0,
          p = 0;
        if (g.moving)
          if (b.tick > g.moveTick)
            ((g.moving = !1), (g.action = -1), (g.back = !0));
          else {
            var r = g.posEnd[0] - a.position[0],
              u = g.posEnd[1] - a.position[1];
            10 < Math.abs(r) || 10 < Math.abs(u)
              ? ((m = r / 10), (p = u / 10))
              : 4 < Math.abs(r) || 4 < Math.abs(u)
                ? ((m = r / 7), (p = u / 7))
                : ((m = r / 3), (p = u / 3));
            h += m;
            f += p;
            g.action = 1;
          }
        else if (a.action == a.ACTION.WALK || g.back) {
          var r = a.position[0] - g.position[0],
            u = a.position[1] - g.position[1],
            A = a.riding_ ? 1 : 0.7;
          r > A || r < -A || u > A || u < -A
            ? ((m = r / 7),
              (p = u / 7),
              m && p && ((m *= 0.7), (p *= 0.7)),
              (h += m),
              (f += p))
            : g.back && (g.back = !1);
        }
        g.direction =
          0 == m && 0 == p
            ? a.direction
            : k[(0 < m ? 1 : 0 > m ? -1 : 0) + 1][
                (0 < p ? 1 : 0 > p ? -1 : 0) + 1
              ];
        g.position[0] = h;
        g.position[1] = f;
        g.position[2] = e.getCellHeight(a.position[0], a.position[1]) + 5 - 0;
      }
    }
    var r = [],
      q = {
        x: [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7],
        y: [0.7, 1, 0, -1, -0.7, -1, 0, 1],
      },
      k = [
        [1, 2, 3],
        [0, 0, 4],
        [7, 6, 5],
      ];
    return {
      add: function (a) {
        0 <= r.indexOf(a.GID + 1e4) || r.push(a.GID + 1e4);
      },
      render: function () {
        for (var a = 0; a < r.length; a++) h(r[a]);
      },
      prerender: h,
      remove: function (a) {
        var b = r.indexOf(a + 1e4);
        0 <= b && (r.splice(b, 1), c.remove(a + 1e4));
      },
    };
  },
);
