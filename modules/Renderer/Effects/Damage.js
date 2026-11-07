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
      r = a("Preferences/Map"),
      q = a("DB/DBManager"),
      k = a("Audio/SoundManager"),
      g = a("Renderer/EffectManager"),
      t = a("Core/MemoryManager"),
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
      u = [],
      A = window.devicePixelRatio;
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
            t.remove(
              null,
              "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            );
            try {
              ((l = new e(b)), (k = new e(d)), (h = new e(g)));
            } catch (I) {
              console.error("Damage::init() - " + I.message);
              return;
            }
            for (b = 0; 10 > b; ++b) f[b] = l.getCanvasFromFrame(b);
            for (b = 0; 6 > b; b++)
              ((l = k.getCanvasFromFrame(b)),
                (d = document.createElement("canvas")),
                (g = d.getContext("2d")),
                (d.width = c.toPowerOfTwo(l.width) * A),
                (d.height = c.toPowerOfTwo(l.height) * A),
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
                (d.width = c.toPowerOfTwo(l.width) * A),
                (d.height = c.toPowerOfTwo(l.height) * A),
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
          t,
          D = document.createElement("canvas"),
          B = D.getContext("2d"),
          A = a.toString().split(""),
          O = 0,
          y = 0,
          C = m.gl,
          G = new b();
        G.type = k || (a ? b.TYPE.DAMAGE : b.TYPE.MISS);
        d.objecttype === d.constructor.TYPE_PC && (G.type |= b.TYPE.ENEMY);
        G.color = [1, 1, 1, 1];
        G.delay = 1500;
        G.startTick = e;
        G.entity = d;
        G.color = [1, 1, 1, 1];
        G.delay = 1500;
        G.startTick = e;
        G.entity = d;
        G.type & b.TYPE.SP
          ? ((G.color[0] = 0.13), (G.color[1] = 0.19), (G.color[2] = 0.75))
          : G.type & b.TYPE.HEAL
            ? ((G.color[0] = 0), (G.color[1] = 1), (G.color[2] = 0))
            : G.type & b.TYPE.ENEMY
              ? ((G.color[0] = 1), (G.color[1] = 0), (G.color[2] = 0))
              : G.type & b.TYPE.COMBO
                ? ((G.color[0] = 0.9),
                  (G.color[1] = 0.9),
                  (G.color[2] = 0.15),
                  (G.delay = 3e3))
                : G.type & b.TYPE.CRIT
                  ? ((G.color[0] = 0.8),
                    (G.color[1] = 0.8),
                    (G.color[2] = 0.25),
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
                    u.push(k),
                    g.spam({
                      effectId: 1,
                      ownerAID: d.GID,
                      position: d.position,
                      startTick: e,
                    }))
                  : G.type & b.TYPE.COMBO_B
                    ? ((G.color[0] = 1),
                      (G.color[1] = 1),
                      (G.color[2] = 1),
                      (k = new b()),
                      (k.type = G.type),
                      (k.color = [0.66, 0.66, 0.66, 1]),
                      (k.delay = 1500),
                      (k.startTick = e),
                      (k.entity = d),
                      (k.texture = v.critbg.texture),
                      (k.width = 0.6 * v.critbg.canvas.width),
                      (k.height = 0.6 * v.critbg.canvas.height),
                      (k.offset = [0, -6]),
                      (k.isDisposable = !1),
                      u.push(k))
                    : ((G.color[0] = 1), (G.color[1] = 1), (G.color[2] = 1));
        if (a) {
          a = 0;
          for (e = A.length; a < e; ++a)
            ((t = f[A[a]]), (O += t.width + 2.8), (y = Math.max(y, t.height)));
          B.canvas.width = c.toPowerOfTwo(O);
          B.canvas.height = c.toPowerOfTwo(y);
          k = (B.canvas.width - O) >> 1;
          h = (B.canvas.height - y) >> 1;
          a = O = 0;
          for (e = A.length; a < e; ++a)
            ((t = f[A[a]]),
              B.drawImage(t, k + O, h + ((y - t.height) >> 1)),
              (O += t.width + 2.8));
          B = C.createTexture();
          C.bindTexture(C.TEXTURE_2D, B);
          C.texImage2D(C.TEXTURE_2D, 0, C.RGBA, C.RGBA, C.UNSIGNED_BYTE, D);
          C.texParameteri(C.TEXTURE_2D, C.TEXTURE_MAG_FILTER, C.LINEAR);
          C.texParameteri(C.TEXTURE_2D, C.TEXTURE_MIN_FILTER, C.LINEAR);
          G.texture = B;
          G.width = D.width;
          G.height = D.height;
          G.isDisposable = !0;
          var H;
          if (d.objecttype === l.TYPE_PC) H = q.getJobHitSound(d._job);
          else if (n || 0 === n) H = q.getWeaponHitSound(n);
          H && (G.soundFile = H[0]);
          u.push(G);
        } else
          r.miss &&
            ((G.texture = p.miss.texture),
            (G.width = p.miss.canvas.width),
            (G.height = p.miss.canvas.height),
            (G.isDisposable = !1),
            u.push(G));
      }
    };
    b.free = function (a) {
      var b, c;
      b = 0;
      for (c = u.length; b < c; ++b)
        u[b].isDisposable && a.deleteTexture(u[b].texture);
      u.length = 0;
    };
    b.render = function (a, c, d, e, f) {
      if (u.length) {
        h.bind3DContext(a, c, d, e);
        h.shadow = 1;
        h.angle = 0;
        h.zIndex = 100;
        h.image.palette = null;
        var g, l;
        c = 0;
        for (d = u.length; c < d; ++c)
          if (((g = u[c]), !(g.startTick > f)))
            if (g.startTick + g.delay < f)
              (g.isDisposable && a.deleteTexture(g.texture),
                u.splice(c, 1),
                d--,
                c--);
            else {
              e = (f - g.startTick) / g.delay;
              if (g.type & b.TYPE.COMBO || g.type & b.TYPE.COMBO_B)
                ((e = (f - g.startTick) / 1e3),
                  (l = 70 * Math.min(e, 0.05)),
                  !(g.type & b.TYPE.COMBO_FINAL) &&
                    0.1 < e &&
                    (g.startTick = 0),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 7 + e));
              else if (g.type & b.TYPE.DAMAGE)
                ((l = Math.max(4 * (1 - e), 0.8)),
                  (h.position[0] = g.entity.position[0] + 4 * e),
                  (h.position[1] = g.entity.position[1] - 3 * e),
                  (h.position[2] =
                    g.entity.position[2] +
                    2 +
                    5 * Math.sin(-Math.PI / 2 + Math.PI * (0.5 + 1.5 * e))),
                  g.soundFile &&
                    (g.type & b.TYPE.ENDURE &&
                      k.playPosition("player_metal.wav", g.entity.position),
                    k.playPosition(g.soundFile, g.entity.position),
                    delete g.soundFile));
              else if (g.type & b.TYPE.HEAL)
                ((l = Math.max(3 * (1 - e), 0.8)),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] =
                    g.entity.position[2] + 2 + (0.4 > e ? 0 : 5 * (e - 0.4))));
              else if (g.type & b.TYPE.MISS)
                ((e = (f - g.startTick) / 800),
                  (l = 0.5),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 3.5 + 7 * e));
              else if (g.type & b.TYPE.LUCKY)
                ((e = (f - g.startTick) / 800),
                  (l = 0.5),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 3.5 + 7 * e));
              else if (g.type & b.TYPE.CRIT) {
                var n = 0.06 * (2 * Math.random() - 1),
                  p = 0.06 * (2 * Math.random() - 1),
                  t = 0.06 * (2 * Math.random() - 1);
                l = 4 * (1 - e);
                h.position[0] = g.entity.position[0] + 4 * e + n;
                h.position[1] = g.entity.position[1] - e + p;
                h.position[2] =
                  g.entity.position[2] +
                  4 +
                  5 * Math.sin(-Math.PI / 2 + Math.PI * (0.5 + 1.5 * e)) +
                  t;
                g.soundFile &&
                  (g.type & b.TYPE.ENDURE &&
                    k.playPosition("player_metal.wav", g.entity.position),
                  k.playPosition(g.soundFile, g.entity.position),
                  delete g.soundFile);
              }
              h.size[0] = g.width * l;
              h.size[1] = g.height * l;
              g.color[3] = 1 - e;
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
