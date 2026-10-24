define(
  "Renderer/CartObject",
  "DB/DBManager Renderer/Renderer Renderer/EntityManager Renderer/Entity/Entity Renderer/Map/Altitude Utils/PathFinding".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    function h(a) {
      var b = c.get(a),
        d = c.get(a - 1e5);
      if (b && d) {
        var h = b.position[0],
          f = b.position[1];
        if (d.action == d.ACTION.WALK) {
          var k = d.position[0] - b.position[0],
            m = d.position[1] - b.position[1],
            q = d.riding_ ? 1 : 0.7;
          if (k > q || k < -q || m > q || m < -q)
            ((k /= 7),
              (m /= 7),
              k && m && ((k *= 0.7), (m *= 0.7)),
              (h += k),
              (f += m),
              (b.action = 0));
        } else b.action = -1;
        b.direction = d.direction;
        b.position[0] = h;
        b.position[1] = f;
        b.position[2] = e.getCellHeight(h, f);
      }
      d || ((b = r.indexOf(a)), 0 <= b && (r.splice(b, 1), c.remove(a)));
    }
    var r = [],
      q = {
        x: [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7],
        y: [0.7, 1, 0, -1, -0.7, -1, 0, 1],
      };
    return {
      add: function (a, b) {
        if (!(0 <= r.indexOf(a.GID + 1e5))) {
          var g = new d();
          g.GID = a.GID + 1e5;
          g.objecttype = d.TYPE_CART;
          g.walk.speed = a.walk.speed;
          r.push(g.GID);
          this.prerender(g.GID);
          g.display.load = g.display.TYPE.COMPLETE;
          switch (b) {
            case 10:
              g.files.body.spr =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00b1\u00b9\u00b0\u00bb\u00f3\u00c0\u00da\u00c4\u00ab\u00c6\u00ae.spr";
              g.files.body.act =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00b1\u00b9\u00b0\u00bb\u00f3\u00c0\u00da\u00c4\u00ab\u00c6\u00ae.act";
              break;
            case 11:
              g.files.body.spr =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00c6\u00f7\u00b8\u00b5\u00bd\u00c6\u00c0\u00ba\u00c4\u00ab\u00c6\u00ae.spr";
              g.files.body.act =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00c6\u00f7\u00b8\u00b5\u00bd\u00c6\u00c0\u00ba\u00c4\u00ab\u00c6\u00ae.act";
              break;
            case 12:
              g.files.body.spr =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00c6\u00f7\u00b8\u00b5\u00c4\u00ab\u00c6\u00ae.spr";
              g.files.body.act =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00c6\u00f7\u00b8\u00b5\u00c4\u00ab\u00c6\u00ae.act";
              break;
            default:
              ((g.files.body.spr =
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00d5\u00bc\u00f6\u00b7\u00b9" +
                (1 > b - 1 ? "" : "" + b - 1 + "") +
                ".spr"),
                (g.files.body.act =
                  "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00d5\u00bc\u00f6\u00b7\u00b9" +
                  (1 > b - 1 ? "" : "" + b - 1 + "") +
                  ".act"));
          }
          g.files.shadow.size = 1;
          g.position[0] = a.position[0] + q.x[a.direction];
          g.position[1] = a.position[1] + q.y[a.direction];
          g.position[2] = e.getCellHeight(
            Math.round(g.position[0]),
            Math.round(g.position[1]),
          );
          c.add(g);
        }
      },
      render: function () {
        for (var a = 0; a < r.length; a++) h(r[a]);
      },
      prerender: h,
      remove: function (a) {
        var b = r.indexOf(a + 1e5);
        0 <= b && (r.splice(b, 1), c.remove(a + 1e5));
      },
    };
  },
);
