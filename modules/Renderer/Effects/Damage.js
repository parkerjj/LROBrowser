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
      t = a("Preferences/Map"),
      r = a("DB/DBManager"),
      n = a("Audio/SoundManager"),
      g = a("Renderer/EffectManager"),
      p = a("Core/MemoryManager"),
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
      k = {
        0: "miss",
        1: "guard",
        2: "crit",
        3: "critbg",
        4: "luckybg",
        5: "lucky",
      },
      q = Array(6),
      u = Array(6),
      v = [],
      A = window.devicePixelRatio;
    b.init = function (a) {
      (f[0] && q.miss && u.miss) ||
        d.getFiles(
          [
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/\u00bc\u00fd\u00c0\u00da.spr",
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/bluemsg.spr",
          ],
          function (b, d, g) {
            var l, h, n;
            p.remove(
              null,
              "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/msg.spr",
            );
            try {
              ((l = new e(b)), (h = new e(d)), (n = new e(g)));
            } catch (O) {
              console.error("Damage::init() - " + O.message);
              return;
            }
            for (b = 0; 10 > b; ++b) f[b] = l.getCanvasFromFrame(b);
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
                (q[k[b]] = { texture: a.createTexture(), canvas: d }),
                a.bindTexture(a.TEXTURE_2D, q[k[b]].texture),
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
              ((l = n.getCanvasFromFrame(b)),
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
                (u[k[b]] = { texture: a.createTexture(), canvas: d }),
                a.bindTexture(a.TEXTURE_2D, u[k[b]].texture),
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
    b.add = function (a, d, e, k, p) {
      if (!(0 > a) && f[0] && q.miss && u.miss) {
        a = Math.floor(a);
        var h,
          n,
          C = document.createElement("canvas"),
          B = C.getContext("2d"),
          A = a.toString().split(""),
          J = 0,
          y = 0,
          D = m.gl,
          z = new b();
        z.type = p || (a ? b.TYPE.DAMAGE : b.TYPE.MISS);
        d.objecttype === d.constructor.TYPE_PC && (z.type |= b.TYPE.ENEMY);
        z.color = [1, 1, 1, 1];
        z.delay = 1500;
        z.startTick = e;
        z.entity = d;
        z.color = [1, 1, 1, 1];
        z.delay = 1500;
        z.startTick = e;
        z.entity = d;
        z.type & b.TYPE.SP
          ? ((z.color[0] = 0.13), (z.color[1] = 0.19), (z.color[2] = 0.75))
          : z.type & b.TYPE.HEAL
            ? ((z.color[0] = 0), (z.color[1] = 1), (z.color[2] = 0))
            : z.type & b.TYPE.ENEMY
              ? ((z.color[0] = 1), (z.color[1] = 0), (z.color[2] = 0))
              : z.type & b.TYPE.COMBO
                ? ((z.color[0] = 0.9),
                  (z.color[1] = 0.9),
                  (z.color[2] = 0.15),
                  (z.delay = 3e3))
                : z.type & b.TYPE.CRIT
                  ? ((z.color[0] = 0.8),
                    (z.color[1] = 0.8),
                    (z.color[2] = 0.25),
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
                    v.push(p),
                    g.spam({
                      effectId: 1,
                      ownerAID: d.GID,
                      position: d.position,
                      startTick: e,
                    }))
                  : z.type & b.TYPE.COMBO_B
                    ? ((z.color[0] = 1),
                      (z.color[1] = 1),
                      (z.color[2] = 1),
                      (p = new b()),
                      (p.type = z.type),
                      (p.color = [0.66, 0.66, 0.66, 1]),
                      (p.delay = 1500),
                      (p.startTick = e),
                      (p.entity = d),
                      (p.texture = u.critbg.texture),
                      (p.width = 0.6 * u.critbg.canvas.width),
                      (p.height = 0.6 * u.critbg.canvas.height),
                      (p.offset = [0, -6]),
                      (p.isDisposable = !1),
                      v.push(p))
                    : ((z.color[0] = 1), (z.color[1] = 1), (z.color[2] = 1));
        if (a) {
          a = 0;
          for (e = A.length; a < e; ++a)
            ((n = f[A[a]]), (J += n.width + 2.8), (y = Math.max(y, n.height)));
          B.canvas.width = c.toPowerOfTwo(J);
          B.canvas.height = c.toPowerOfTwo(y);
          p = (B.canvas.width - J) >> 1;
          h = (B.canvas.height - y) >> 1;
          a = J = 0;
          for (e = A.length; a < e; ++a)
            ((n = f[A[a]]),
              B.drawImage(n, p + J, h + ((y - n.height) >> 1)),
              (J += n.width + 2.8));
          B = D.createTexture();
          D.bindTexture(D.TEXTURE_2D, B);
          D.texImage2D(D.TEXTURE_2D, 0, D.RGBA, D.RGBA, D.UNSIGNED_BYTE, C);
          D.texParameteri(D.TEXTURE_2D, D.TEXTURE_MAG_FILTER, D.LINEAR);
          D.texParameteri(D.TEXTURE_2D, D.TEXTURE_MIN_FILTER, D.LINEAR);
          z.texture = B;
          z.width = C.width;
          z.height = C.height;
          z.isDisposable = !0;
          var G;
          if (d.objecttype === l.TYPE_PC) G = r.getJobHitSound(d._job);
          else if (k || 0 === k) G = r.getWeaponHitSound(k);
          G && (z.soundFile = G[0]);
          v.push(z);
        } else
          t.miss &&
            ((z.texture = q.miss.texture),
            (z.width = q.miss.canvas.width),
            (z.height = q.miss.canvas.height),
            (z.isDisposable = !1),
            v.push(z));
      }
    };
    b.free = function (a) {
      var b, c;
      b = 0;
      for (c = v.length; b < c; ++b)
        v[b].isDisposable && a.deleteTexture(v[b].texture);
      v.length = 0;
    };
    b.render = function (a, c, d, f, e) {
      if (v.length) {
        h.bind3DContext(a, c, d, f);
        h.shadow = 1;
        h.angle = 0;
        h.zIndex = 100;
        h.image.palette = null;
        var g, l;
        c = 0;
        for (d = v.length; c < d; ++c)
          if (((g = v[c]), !(g.startTick > e)))
            if (g.startTick + g.delay < e)
              (g.isDisposable && a.deleteTexture(g.texture),
                v.splice(c, 1),
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
                      n.playPosition("player_metal.wav", g.entity.position),
                    n.playPosition(g.soundFile, g.entity.position),
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
                var p = 0.06 * (2 * Math.random() - 1),
                  k = 0.06 * (2 * Math.random() - 1),
                  q = 0.06 * (2 * Math.random() - 1);
                l = 4 * (1 - f);
                h.position[0] = g.entity.position[0] + 4 * f + p;
                h.position[1] = g.entity.position[1] - f + k;
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
