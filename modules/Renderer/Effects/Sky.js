define(
  "Renderer/Effects/Sky",
  "require Utils/WebGL DB/Effects/WeatherEffect Core/Client Engine/SessionStorage Renderer/SpriteRenderer Utils/gl-matrix".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      l.loadFile("data/texture/effect/cloud" + (b + 1) + ".tga", function (c) {
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
      l = a("Core/Client"),
      h = a("Engine/SessionStorage"),
      r = a("Renderer/SpriteRenderer"),
      t = a("Utils/gl-matrix").vec3,
      n = Array(150),
      g = [],
      p = null,
      k = !0;
    return {
      init: function (a, c) {
        if (e.sky[c]) {
          if (
            ((p = e.sky[c].cloudColor),
            (c = e.sky[c].skyColor),
            (k = !0),
            a.clearColor(c[0], c[1], c[2], c[3]),
            !g.length)
          )
            for (g.length = 8, c = 0; 7 > c; c++) b(a, c);
        } else (a.clearColor(0, 0, 0, 1), (k = !1));
      },
      setUpCloudData: function () {
        var a;
        for (a = 0; 150 > a; a++)
          (n[a] ||
            (n[a] = {
              position: t.create(),
              direction: t.create(),
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
        if (k) {
          r.bind3DContext(a, b, d, e);
          r.color.set(p);
          r.shadow = 1;
          r.angle = 0;
          r.size[0] = 500;
          r.size[1] = 500;
          r.offset[0] = 0;
          r.offset[1] = 0;
          r.image.palette = null;
          r.depth = 0;
          r.blendMode = 3;
          a.depthMask(!1);
          for (b = 0; 150 > b; b++)
            ((d = n[b]),
              d.born_tick + 1e3 > h
                ? (e = (h - d.born_tick) / 1e3)
                : d.death_tick + 2e3 < h
                  ? (c(d), (e = 0))
                  : (e = d.death_tick < h ? 1 - (h - d.death_tick) / 2e3 : 1),
              (r.zIndex = 0),
              (r.color[3] = e),
              (r.image.texture = g[d.sprite]),
              t.add(d.position, d.position, d.direction),
              r.position.set(d.position),
              r.render());
          r.unbind(a);
          a.depthMask(!0);
        }
      },
    };
  },
);
