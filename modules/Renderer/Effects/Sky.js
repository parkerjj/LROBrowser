define(
  "Renderer/Effects/Sky",
  "require Utils/WebGL DB/Effects/WeatherEffect Core/Client Engine/SessionStorage Renderer/SpriteRenderer Utils/gl-matrix".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      m.loadFile("data/texture/effect/cloud" + (b + 1) + ".tga", function (c) {
        d.texture(a, c, function (a) {
          g[b] = a;
        });
      });
    }
    function c(a) {
      var b = h.Entity.position;
      a.position[0] =
        b[0] + ((35 * Math.random()) | 0) * (0.5 < Math.random() ? 1 : -1);
      a.position[1] =
        b[1] + ((35 * Math.random()) | 0) * (0.5 < Math.random() ? 1 : -1);
      a.position[2] = -10;
      a.direction[0] = 0.02 * Math.random() - 0.01;
      a.direction[1] = 0.02 * Math.random() - 0.01;
      a.direction[2] = 0.002 * Math.random() - 0.001;
      a.born_tick = a.death_tick ? a.death_tick + 2e3 : Date.now();
      a.death_tick = a.born_tick + 6e3;
    }
    var d = a("Utils/WebGL"),
      e = a("DB/Effects/WeatherEffect"),
      m = a("Core/Client"),
      h = a("Engine/SessionStorage"),
      t = a("Renderer/SpriteRenderer"),
      r = a("Utils/gl-matrix").vec3,
      n = Array(150),
      g = [],
      p = null,
      l = !0;
    return {
      init: function (a, c) {
        if (e.sky[c]) {
          if (
            ((p = e.sky[c].cloudColor),
            (c = e.sky[c].skyColor),
            (l = !0),
            a.clearColor(c[0], c[1], c[2], c[3]),
            !g.length)
          )
            for (g.length = 8, c = 0; 7 > c; c++) b(a, c);
        } else (a.clearColor(0, 0, 0, 1), (l = !1));
      },
      setUpCloudData: function () {
        var a;
        for (a = 0; 150 > a; a++)
          (n[a] ||
            (n[a] = {
              position: r.create(),
              direction: r.create(),
              born_tick: 0,
              death_tick: 0,
            }),
            c(n[a]),
            (n[a].sprite = (Math.random() * (g.length - 1)) | 0),
            (n[a].death_tick = n[a].born_tick + 8e3 * Math.random()),
            (n[a].born_tick -= 2e3));
        n.sort(function (a, b) {
          return a.sprite - b.sprite;
        });
      },
      render: function (a, b, d, e, h) {
        if (l) {
          t.bind3DContext(a, b, d, e);
          t.color.set(p);
          t.shadow = 1;
          t.angle = 0;
          t.size[0] = 500;
          t.size[1] = 500;
          t.offset[0] = 0;
          t.offset[1] = 0;
          t.image.palette = null;
          t.depth = 0;
          t.blendMode = 3;
          a.depthMask(!1);
          for (b = 0; 150 > b; b++)
            ((d = n[b]),
              d.born_tick + 1e3 > h
                ? (e = (h - d.born_tick) / 1e3)
                : d.death_tick + 2e3 < h
                  ? (c(d), (e = 0))
                  : (e = d.death_tick < h ? 1 - (h - d.death_tick) / 2e3 : 1),
              (t.zIndex = 0),
              (t.color[3] = e),
              (t.image.texture = g[d.sprite]),
              r.add(d.position, d.position, d.direction),
              t.position.set(d.position),
              t.render());
          t.unbind(a);
          a.depthMask(!0);
        }
      },
    };
  },
);
