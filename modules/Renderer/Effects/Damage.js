define(
  "Renderer/Effects/Damage",
  "require Utils/WebGL Core/Client Loaders/Sprite Renderer/Renderer Renderer/SpriteRenderer Preferences/Map DB/DBManager Audio/SoundManager Renderer/EffectManager Core/MemoryManager Renderer/Entity/Entity".split(
    " ",
  ),
  function (a) {
    function b() {
      this.entity = null;
      this.type = this.startTick = 0;
      this.color = new Float32Array(4);
      this.delay = 1500;
      this.texture = null;
      this.height = this.width = 0;
    }
    var c = a("Utils/WebGL"),
      d = a("Core/Client"),
      e = a("Loaders/Sprite"),
      m = a("Renderer/Renderer"),
      h = a("Renderer/SpriteRenderer"),
      q = a("Preferences/Map"),
      r = a("DB/DBManager"),
      k = a("Audio/SoundManager"),
      g = a("Renderer/EffectManager"),
      u = a("Core/MemoryManager"),
      l = a("Renderer/Entity/Entity");
    b.TYPE = {
      HEAL: 1,
      MISS: 2,
      DAMAGE: 4,
      ENEMY: 8,
      COMBO: 16,
      COMBO_FINAL: 32,
      SP: 64,
      CRIT: 128,
      LUCKY: 256,
      ENDURE: 512,
      COMBO_B: 1024,
    };
    var f = Array(10),
      n = {
        0: "miss",
        1: "guard",
        2: "crit",
        3: "critbg",
        4: "luckybg",
        5: "lucky",
      },
      p = Array(6),
      v = Array(6),
      t = [],
      z = window.devicePixelRatio;
    b.init = function (a) {
      (f[0] && p.miss && v.miss) ||
        d.getFiles(
          [
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00fd\u00c0\u00da.spr",
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/bluemsg.spr",
          ],
          function (b, d, g) {
            var l, k, h;
            u.remove(
              null,
              "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            );
            try {
              ((l = new e(b)), (k = new e(d)), (h = new e(g)));
            } catch (M) {
              console.error("Damage::init() - " + M.message);
              return;
            }
            for (b = 0; 10 > b; ++b) f[b] = l.getCanvasFromFrame(b);
            for (b = 0; 6 > b; b++)
              ((l = k.getCanvasFromFrame(b)),
                (d = document.createElement("canvas")),
                (g = d.getContext("2d")),
                (d.width = c.toPowerOfTwo(l.width) * z),
                (d.height = c.toPowerOfTwo(l.height) * z),
                g.drawImage(
                  l,
                  (d.width - l.width) / 2,
                  (d.height - l.height) / 2,
                  l.width,
                  l.height,
                ),
                (p[n[b]] = { texture: a.createTexture(), canvas: d }),
                a.bindTexture(a.TEXTURE_2D, p[n[b]].texture),
                a.texImage2D(
                  a.TEXTURE_2D,
                  0,
                  a.RGBA,
                  a.RGBA,
                  a.UNSIGNED_BYTE,
                  d,
                ),
                a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR),
                a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR),
                a.texParameteri(
                  a.TEXTURE_2D,
                  a.TEXTURE_WRAP_S,
                  a.CLAMP_TO_EDGE,
                ),
                a.texParameteri(
                  a.TEXTURE_2D,
                  a.TEXTURE_WRAP_T,
                  a.CLAMP_TO_EDGE,
                ));
            for (b = 0; 6 > b; b++)
              ((l = h.getCanvasFromFrame(b)),
                (d = document.createElement("canvas")),
                (g = d.getContext("2d")),
                (d.width = c.toPowerOfTwo(l.width) * z),
                (d.height = c.toPowerOfTwo(l.height) * z),
                g.drawImage(
                  l,
                  (d.width - l.width) / 2,
                  (d.height - l.height) / 2,
                  l.width,
                  l.height,
                ),
                (v[n[b]] = { texture: a.createTexture(), canvas: d }),
                a.bindTexture(a.TEXTURE_2D, v[n[b]].texture),
                a.texImage2D(
                  a.TEXTURE_2D,
                  0,
                  a.RGBA,
                  a.RGBA,
                  a.UNSIGNED_BYTE,
                  d,
                ),
                a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR),
                a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR),
                a.texParameteri(
                  a.TEXTURE_2D,
                  a.TEXTURE_WRAP_S,
                  a.CLAMP_TO_EDGE,
                ),
                a.texParameteri(
                  a.TEXTURE_2D,
                  a.TEXTURE_WRAP_T,
                  a.CLAMP_TO_EDGE,
                ));
          },
        );
    };
    b.add = function (a, d, e, n, k) {
      if (!(0 > a) && f[0] && p.miss && v.miss) {
        a = Math.floor(a);
        var h,
          u,
          z = document.createElement("canvas"),
          C = z.getContext("2d"),
          E = a.toString().split(""),
          J = 0,
          A = 0,
          B = m.gl,
          y = new b();
        y.type = k || (a ? b.TYPE.DAMAGE : b.TYPE.MISS);
        d.objecttype === d.constructor.TYPE_PC && (y.type |= b.TYPE.ENEMY);
        y.color = [1, 1, 1, 1];
        y.delay = 1500;
        y.startTick = e;
        y.entity = d;
        y.color = [1, 1, 1, 1];
        y.delay = 1500;
        y.startTick = e;
        y.entity = d;
        y.type & b.TYPE.SP
          ? ((y.color[0] = 0.13), (y.color[1] = 0.19), (y.color[2] = 0.75))
          : y.type & b.TYPE.HEAL
            ? ((y.color[0] = 0), (y.color[1] = 1), (y.color[2] = 0))
            : y.type & b.TYPE.ENEMY
              ? ((y.color[0] = 1), (y.color[1] = 0), (y.color[2] = 0))
              : y.type & b.TYPE.COMBO
                ? ((y.color[0] = 0.9),
                  (y.color[1] = 0.9),
                  (y.color[2] = 0.15),
                  (y.delay = 3e3))
                : y.type & b.TYPE.CRIT
                  ? ((y.color[0] = 0.8),
                    (y.color[1] = 0.8),
                    (y.color[2] = 0.25),
                    (k = new b()),
                    (k.type = b.TYPE.CRIT),
                    (k.color = [0.66, 0.66, 0.66, 1]),
                    (k.delay = 1500),
                    (k.startTick = e),
                    (k.entity = d),
                    (k.texture = p.critbg.texture),
                    (k.width = 0.6 * p.critbg.canvas.width),
                    (k.height = 0.6 * p.critbg.canvas.height),
                    (k.offset = [0, -6]),
                    (k.isDisposable = !1),
                    t.push(k),
                    g.spam({
                      effectId: 1,
                      ownerAID: d.GID,
                      position: d.position,
                      startTick: e,
                    }))
                  : y.type & b.TYPE.COMBO_B
                    ? ((y.color[0] = 1),
                      (y.color[1] = 1),
                      (y.color[2] = 1),
                      (k = new b()),
                      (k.type = y.type),
                      (k.color = [0.66, 0.66, 0.66, 1]),
                      (k.delay = 1500),
                      (k.startTick = e),
                      (k.entity = d),
                      (k.texture = v.critbg.texture),
                      (k.width = 0.6 * v.critbg.canvas.width),
                      (k.height = 0.6 * v.critbg.canvas.height),
                      (k.offset = [0, -6]),
                      (k.isDisposable = !1),
                      t.push(k))
                    : ((y.color[0] = 1), (y.color[1] = 1), (y.color[2] = 1));
        if (a) {
          a = 0;
          for (e = E.length; a < e; ++a)
            ((u = f[E[a]]), (J += u.width + 2.8), (A = Math.max(A, u.height)));
          C.canvas.width = c.toPowerOfTwo(J);
          C.canvas.height = c.toPowerOfTwo(A);
          k = (C.canvas.width - J) >> 1;
          h = (C.canvas.height - A) >> 1;
          a = J = 0;
          for (e = E.length; a < e; ++a)
            ((u = f[E[a]]),
              C.drawImage(u, k + J, h + ((A - u.height) >> 1)),
              (J += u.width + 2.8));
          C = B.createTexture();
          B.bindTexture(B.TEXTURE_2D, C);
          B.texImage2D(B.TEXTURE_2D, 0, B.RGBA, B.RGBA, B.UNSIGNED_BYTE, z);
          B.texParameteri(B.TEXTURE_2D, B.TEXTURE_MAG_FILTER, B.LINEAR);
          B.texParameteri(B.TEXTURE_2D, B.TEXTURE_MIN_FILTER, B.LINEAR);
          y.texture = C;
          y.width = z.width;
          y.height = z.height;
          y.isDisposable = !0;
          var G;
          if (d.objecttype === l.TYPE_PC) G = r.getJobHitSound(d._job);
          else if (n || 0 === n) G = r.getWeaponHitSound(n);
          G && (y.soundFile = G[0]);
          t.push(y);
        } else
          q.miss &&
            ((y.texture = p.miss.texture),
            (y.width = p.miss.canvas.width),
            (y.height = p.miss.canvas.height),
            (y.isDisposable = !1),
            t.push(y));
      }
    };
    b.free = function (a) {
      var b, c;
      b = 0;
      for (c = t.length; b < c; ++b)
        t[b].isDisposable && a.deleteTexture(t[b].texture);
      t.length = 0;
    };
    b.render = function (a, c, d, f, e) {
      if (t.length) {
        h.bind3DContext(a, c, d, f);
        h.shadow = 1;
        h.angle = 0;
        h.zIndex = 100;
        h.image.palette = null;
        var g, l;
        c = 0;
        for (d = t.length; c < d; ++c)
          if (((g = t[c]), !(g.startTick > e)))
            if (g.startTick + g.delay < e)
              (g.isDisposable && a.deleteTexture(g.texture),
                t.splice(c, 1),
                d--,
                c--);
            else {
              f = (e - g.startTick) / g.delay;
              if (g.type & b.TYPE.COMBO || g.type & b.TYPE.COMBO_B)
                ((f = (e - g.startTick) / 1e3),
                  (l = 70 * Math.min(f, 0.05)),
                  !(g.type & b.TYPE.COMBO_FINAL) &&
                    0.1 < f &&
                    (g.startTick = 0),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 7 + f));
              else if (g.type & b.TYPE.DAMAGE)
                ((l = Math.max(4 * (1 - f), 0.8)),
                  (h.position[0] = g.entity.position[0] + 4 * f),
                  (h.position[1] = g.entity.position[1] - 3 * f),
                  (h.position[2] =
                    g.entity.position[2] +
                    2 +
                    5 * Math.sin(-Math.PI / 2 + Math.PI * (0.5 + 1.5 * f))),
                  g.soundFile &&
                    (g.type & b.TYPE.ENDURE &&
                      k.playPosition("player_metal.wav", g.entity.position),
                    k.playPosition(g.soundFile, g.entity.position),
                    delete g.soundFile));
              else if (g.type & b.TYPE.HEAL)
                ((l = Math.max(3 * (1 - f), 0.8)),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] =
                    g.entity.position[2] + 2 + (0.4 > f ? 0 : 5 * (f - 0.4))));
              else if (g.type & b.TYPE.MISS)
                ((f = (e - g.startTick) / 800),
                  (l = 0.5),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 3.5 + 7 * f));
              else if (g.type & b.TYPE.LUCKY)
                ((f = (e - g.startTick) / 800),
                  (l = 0.5),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 3.5 + 7 * f));
              else if (g.type & b.TYPE.CRIT) {
                var n = 0.06 * (2 * Math.random() - 1),
                  p = 0.06 * (2 * Math.random() - 1),
                  u = 0.06 * (2 * Math.random() - 1);
                l = 4 * (1 - f);
                h.position[0] = g.entity.position[0] + 4 * f + n;
                h.position[1] = g.entity.position[1] - f + p;
                h.position[2] =
                  g.entity.position[2] +
                  4 +
                  5 * Math.sin(-Math.PI / 2 + Math.PI * (0.5 + 1.5 * f)) +
                  u;
                g.soundFile &&
                  (g.type & b.TYPE.ENDURE &&
                    k.playPosition("player_metal.wav", g.entity.position),
                  k.playPosition(g.soundFile, g.entity.position),
                  delete g.soundFile);
              }
              h.size[0] = g.width * l;
              h.size[1] = g.height * l;
              g.color[3] = 1 - f;
              g.offset
                ? ((h.offset[0] = g.offset[0]), (h.offset[1] = g.offset[1]))
                : ((h.offset[0] = 0), (h.offset[1] = 0));
              h.depth = c;
              h.color.set(g.color);
              h.image.texture = g.texture;
              h.render();
            }
        h.unbind(a);
      }
    };
    return b;
  },
);
