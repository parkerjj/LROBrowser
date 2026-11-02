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
      q = a("Renderer/SpriteRenderer"),
      r = a("Utils/gl-matrix").vec3,
      k = Array(150),
      g = [],
      u = null,
      l = !0;
    return {
      init: function (a, c) {
        if (e.sky[c]) {
          if (
            ((u = e.sky[c].cloudColor),
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
          (k[a] ||
            (k[a] = {
              position: r.create(),
              direction: r.create(),
              born_tick: 0,
              death_tick: 0,
            }),
            c(k[a]),
            (k[a].sprite = (Math.random() * (g.length - 1)) | 0),
            (k[a].death_tick = k[a].born_tick + 8e3 * Math.random()),
            (k[a].born_tick -= 2e3));
        k.sort(function (a, b) {
          return a.sprite - b.sprite;
        });
      },
      render: function (a, b, d, e, h) {
        if (l) {
          q.bind3DContext(a, b, d, e);
          q.color.set(u);
          q.shadow = 1;
          q.angle = 0;
          q.size[0] = 500;
          q.size[1] = 500;
          q.offset[0] = 0;
          q.offset[1] = 0;
          q.image.palette = null;
          q.depth = 0;
          q.blendMode = 3;
          a.depthMask(!1);
          for (b = 0; 150 > b; b++)
            ((d = k[b]),
              d.born_tick + 1e3 > h
                ? (e = (h - d.born_tick) / 1e3)
                : d.death_tick + 2e3 < h
                  ? (c(d), (e = 0))
                  : (e = d.death_tick < h ? 1 - (h - d.death_tick) / 2e3 : 1),
              (q.zIndex = 0),
              (q.color[3] = e),
              (q.image.texture = g[d.sprite]),
              r.add(d.position, d.position, d.direction),
              q.position.set(d.position),
              q.render());
          q.unbind(a);
          a.depthMask(!0);
        }
      },
    };
  },
);
