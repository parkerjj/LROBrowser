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
      l = a("Renderer/Renderer"),
      h = a("Renderer/SpriteRenderer"),
      r = a("Preferences/Map"),
      t = a("DB/DBManager"),
      n = a("Audio/SoundManager"),
      g = a("Renderer/EffectManager"),
      p = a("Core/MemoryManager"),
      k = a("Renderer/Entity/Entity");
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
      m = {
        0: "miss",
        1: "guard",
        2: "crit",
        3: "critbg",
        4: "luckybg",
        5: "lucky",
      },
      q = Array(6),
      v = Array(6),
      u = [],
      A = window.devicePixelRatio;
    b.init = function (a) {
      (f[0] && q.miss && v.miss) ||
        d.getFiles(
          [
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00fd\u00c0\u00da.spr",
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/bluemsg.spr",
          ],
          function (b, d, g) {
            var k, h, n;
            p.remove(
              null,
              "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            );
            try {
              ((k = new e(b)), (h = new e(d)), (n = new e(g)));
            } catch (N) {
              console.error("Damage::init() - " + N.message);
              return;
            }
            for (b = 0; 10 > b; ++b) f[b] = k.getCanvasFromFrame(b);
            for (b = 0; 6 > b; b++)
              ((k = h.getCanvasFromFrame(b)),
                (d = document.createElement("canvas")),
                (g = d.getContext("2d")),
                (d.width = c.toPowerOfTwo(k.width) * A),
                (d.height = c.toPowerOfTwo(k.height) * A),
                g.drawImage(
                  k,
                  (d.width - k.width) / 2,
                  (d.height - k.height) / 2,
                  k.width,
                  k.height,
                ),
                (q[m[b]] = { texture: a.createTexture(), canvas: d }),
                a.bindTexture(a.TEXTURE_2D, q[m[b]].texture),
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
              ((k = n.getCanvasFromFrame(b)),
                (d = document.createElement("canvas")),
                (g = d.getContext("2d")),
                (d.width = c.toPowerOfTwo(k.width) * A),
                (d.height = c.toPowerOfTwo(k.height) * A),
                g.drawImage(
                  k,
                  (d.width - k.width) / 2,
                  (d.height - k.height) / 2,
                  k.width,
                  k.height,
                ),
                (v[m[b]] = { texture: a.createTexture(), canvas: d }),
                a.bindTexture(a.TEXTURE_2D, v[m[b]].texture),
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
    b.add = function (a, d, e, m, p) {
      if (!(0 > a) && f[0] && q.miss && v.miss) {
        a = Math.floor(a);
        var h,
          n,
          B = document.createElement("canvas"),
          D = B.getContext("2d"),
          A = a.toString().split(""),
          H = 0,
          z = 0,
          C = l.gl,
          y = new b();
        y.type = p || (a ? b.TYPE.DAMAGE : b.TYPE.MISS);
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
                    (p = new b()),
                    (p.type = b.TYPE.CRIT),
                    (p.color = [0.66, 0.66, 0.66, 1]),
                    (p.delay = 1500),
                    (p.startTick = e),
                    (p.entity = d),
                    (p.texture = q.critbg.texture),
                    (p.width = 0.6 * q.critbg.canvas.width),
                    (p.height = 0.6 * q.critbg.canvas.height),
                    (p.offset = [0, -6]),
                    (p.isDisposable = !1),
                    u.push(p),
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
                      (p = new b()),
                      (p.type = y.type),
                      (p.color = [0.66, 0.66, 0.66, 1]),
                      (p.delay = 1500),
                      (p.startTick = e),
                      (p.entity = d),
                      (p.texture = v.critbg.texture),
                      (p.width = 0.6 * v.critbg.canvas.width),
                      (p.height = 0.6 * v.critbg.canvas.height),
                      (p.offset = [0, -6]),
                      (p.isDisposable = !1),
                      u.push(p))
                    : ((y.color[0] = 1), (y.color[1] = 1), (y.color[2] = 1));
        if (a) {
          a = 0;
          for (e = A.length; a < e; ++a)
            ((n = f[A[a]]), (H += n.width + 2.8), (z = Math.max(z, n.height)));
          D.canvas.width = c.toPowerOfTwo(H);
          D.canvas.height = c.toPowerOfTwo(z);
          p = (D.canvas.width - H) >> 1;
          h = (D.canvas.height - z) >> 1;
          a = H = 0;
          for (e = A.length; a < e; ++a)
            ((n = f[A[a]]),
              D.drawImage(n, p + H, h + ((z - n.height) >> 1)),
              (H += n.width + 2.8));
          D = C.createTexture();
          C.bindTexture(C.TEXTURE_2D, D);
          C.texImage2D(C.TEXTURE_2D, 0, C.RGBA, C.RGBA, C.UNSIGNED_BYTE, B);
          C.texParameteri(C.TEXTURE_2D, C.TEXTURE_MAG_FILTER, C.LINEAR);
          C.texParameteri(C.TEXTURE_2D, C.TEXTURE_MIN_FILTER, C.LINEAR);
          y.texture = D;
          y.width = B.width;
          y.height = B.height;
          y.isDisposable = !0;
          var F;
          if (d.objecttype === k.TYPE_PC) F = t.getJobHitSound(d._job);
          else if (m || 0 === m) F = t.getWeaponHitSound(m);
          F && (y.soundFile = F[0]);
          u.push(y);
        } else
          r.miss &&
            ((y.texture = q.miss.texture),
            (y.width = q.miss.canvas.width),
            (y.height = q.miss.canvas.height),
            (y.isDisposable = !1),
            u.push(y));
      }
    };
    b.free = function (a) {
      var b, c;
      b = 0;
      for (c = u.length; b < c; ++b)
        u[b].isDisposable && a.deleteTexture(u[b].texture);
      u.length = 0;
    };
    b.render = function (a, c, d, f, e) {
      if (u.length) {
        h.bind3DContext(a, c, d, f);
        h.shadow = 1;
        h.angle = 0;
        h.zIndex = 100;
        h.image.palette = null;
        var g, k;
        c = 0;
        for (d = u.length; c < d; ++c)
          if (((g = u[c]), !(g.startTick > e)))
            if (g.startTick + g.delay < e)
              (g.isDisposable && a.deleteTexture(g.texture),
                u.splice(c, 1),
                d--,
                c--);
            else {
              f = (e - g.startTick) / g.delay;
              if (g.type & b.TYPE.COMBO || g.type & b.TYPE.COMBO_B)
                ((f = (e - g.startTick) / 1e3),
                  (k = 70 * Math.min(f, 0.05)),
                  !(g.type & b.TYPE.COMBO_FINAL) &&
                    0.1 < f &&
                    (g.startTick = 0),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 7 + f));
              else if (g.type & b.TYPE.DAMAGE)
                ((k = Math.max(4 * (1 - f), 0.8)),
                  (h.position[0] = g.entity.position[0] + 4 * f),
                  (h.position[1] = g.entity.position[1] - 3 * f),
                  (h.position[2] =
                    g.entity.position[2] +
                    2 +
                    5 * Math.sin(-Math.PI / 2 + Math.PI * (0.5 + 1.5 * f))),
                  g.soundFile &&
                    (g.type & b.TYPE.ENDURE &&
                      n.playPosition("player_metal.wav", g.entity.position),
                    n.playPosition(g.soundFile, g.entity.position),
                    delete g.soundFile));
              else if (g.type & b.TYPE.HEAL)
                ((k = Math.max(3 * (1 - f), 0.8)),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] =
                    g.entity.position[2] + 2 + (0.4 > f ? 0 : 5 * (f - 0.4))));
              else if (g.type & b.TYPE.MISS)
                ((f = (e - g.startTick) / 800),
                  (k = 0.5),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 3.5 + 7 * f));
              else if (g.type & b.TYPE.LUCKY)
                ((f = (e - g.startTick) / 800),
                  (k = 0.5),
                  (h.position[0] = g.entity.position[0]),
                  (h.position[1] = g.entity.position[1]),
                  (h.position[2] = g.entity.position[2] + 3.5 + 7 * f));
              else if (g.type & b.TYPE.CRIT) {
                var m = 0.06 * (2 * Math.random() - 1),
                  p = 0.06 * (2 * Math.random() - 1),
                  q = 0.06 * (2 * Math.random() - 1);
                k = 4 * (1 - f);
                h.position[0] = g.entity.position[0] + 4 * f + m;
                h.position[1] = g.entity.position[1] - f + p;
                h.position[2] =
                  g.entity.position[2] +
                  4 +
                  5 * Math.sin(-Math.PI / 2 + Math.PI * (0.5 + 1.5 * f)) +
                  q;
                g.soundFile &&
                  (g.type & b.TYPE.ENDURE &&
                    n.playPosition("player_metal.wav", g.entity.position),
                  n.playPosition(g.soundFile, g.entity.position),
                  delete g.soundFile);
              }
              h.size[0] = g.width * k;
              h.size[1] = g.height * k;
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
