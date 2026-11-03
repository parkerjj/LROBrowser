define(
  "UI/CursorManager",
  "require Utils/jquery Core/Client Core/MemoryManager Preferences/Graphics Loaders/Sprite Loaders/Action Preferences/Controls".split(
    " ",
  ),
  function (a) {
    function b() {
      function a(a) {
        var b, c, d;
        a = D.getCanvasFromFrame(a);
        if (!a) return "";
        a = atob(a.toDataURL("image/png").replace(/^data[^,]+,/, ""));
        d = a.length;
        b = new Uint8Array(d);
        for (c = 0; c < d; ++c) b[c] = a.charCodeAt(c);
        return URL.createObjectURL(new Blob([b], { type: "image/png" }));
      }
      var b = B.actions[n.ACTION.CLICK],
        d = a(b.animations[0].layers[0].index),
        b = a(b.animations[1].layers[0].index),
        f = a(B.actions[n.ACTION.DEFAULT].animations[0].layers[0].index);
      c("head").append(
        [
          '\x3cstyle type\x3d"text/css"\x3e',
          "button { cursor: url(" + d + "), auto; }",
          "button:active { cursor: url(" + b + "), auto; }",
          ".event_add_cursor { cursor: url(" + d + "), auto; }",
          ".event_add_cursor:active { cursor: url(" + b + "), auto; }",
          "input[type\x3dtext] { cursor: url(" + f + "), auto; }",
          "textarea { cursor: url(" + f + "), auto; }",
          "\x3c/style\x3e",
        ].join("\n"),
      );
    }
    var c = a("Utils/jquery"),
      d = a("Core/Client"),
      e = a("Core/MemoryManager"),
      l = a("Preferences/Graphics"),
      h = a("Loaders/Sprite"),
      r = a("Loaders/Action"),
      t = a("Preferences/Controls"),
      n = {
        ACTION: {
          DEFAULT: 0,
          TALK: 1,
          CLICK: 2,
          LOCK: 3,
          ROTATE: 4,
          ATTACK: 5,
          WARP: 7,
          PICK: 9,
          TARGET: 10,
        },
        freeze: !1,
        magnetism: !0,
        blockMagnetism: !1,
      },
      g = n.ACTION.DEFAULT,
      p = 0,
      k = !1,
      f = 0,
      m = !0,
      q = -1,
      v = 0,
      u = 0,
      A = [],
      D,
      B,
      H = {};
    H[n.ACTION.DEFAULT] = {
      drawX: 1,
      drawY: 19,
      startX: 0,
      startY: 0,
      delayMult: 2,
    };
    H[n.ACTION.TALK] = {
      drawX: 20,
      drawY: 40,
      startX: 20,
      startY: 20,
      delayMult: 1,
    };
    H[n.ACTION.WARP] = {
      drawX: 10,
      drawY: 32,
      startX: 0,
      startY: 0,
      delayMult: 1,
    };
    H[n.ACTION.ROTATE] = {
      drawX: 18,
      drawY: 26,
      startX: 10,
      startY: 0,
      delayMult: 1,
    };
    H[n.ACTION.PICK] = {
      drawX: 20,
      drawY: 40,
      startX: 15,
      startY: 15,
      delayMult: 1,
    };
    H[n.ACTION.TARGET] = {
      drawX: 20,
      drawY: 50,
      startX: 20,
      startY: 28,
      delayMult: 0.5,
    };
    var C, z, G, P;
    n.init = function (c) {
      D
        ? c()
        : (d.getFiles(
            ["data/sprite/cursors.spr", "data/sprite/cursors.act"],
            function (a, d) {
              try {
                ((D = new h(a)), (B = new r(d)));
              } catch (fa) {
                console.error("Cursor::init() - " + fa.message);
                return;
              }
              e.remove(null, "data/sprite/cursors.spr");
              e.remove(null, "data/sprite/cursors.act");
              b();
              var f, g, k, m, q, p, l, v, u, t, x, S, T, I, R;
              v = document.createElement("canvas");
              v.width = 50;
              v.height = 50;
              u = v.getContext("2d");
              t = new z();
              I = [];
              A = [];
              R = [0, 0];
              a = 0;
              for (g = B.actions.length; a < g; ++a)
                for (
                  q = B.actions[a],
                    l = H[a] || H[n.ACTION.DEFAULT],
                    d = 0,
                    k = q.animations.length;
                  d < k;
                  ++d
                ) {
                  p = q.animations[d];
                  G.bind2DContext(u, l.drawX, l.drawY);
                  u.clearRect(0, 0, 50, 50);
                  f = 0;
                  for (m = p.layers.length; f < m; ++f)
                    t.renderLayer(p.layers[f], D, D, 1, R, !1);
                  T = v.toDataURL("image/png");
                  f = I.indexOf(T);
                  if (-1 < f) p.compiledStyleIndex = f;
                  else {
                    x = atob(T.replace(/^data[^,]+,/, ""));
                    m = x.length;
                    S = new Uint8Array(m);
                    for (f = 0; f < m; ++f) S[f] = x.charCodeAt(f);
                    p.compiledStyleIndex = A.length;
                    I.push(T);
                    A.push(
                      URL.createObjectURL(
                        new Blob([S.buffer], { type: "image/png" }),
                      ),
                    );
                  }
                }
              c();
            },
          ),
          (C = a("Renderer/EntityManager")),
          (z = a("Renderer/Entity/Entity")),
          (G = a("Renderer/SpriteRenderer")),
          (P = a("Controls/MouseEventHandler")));
    };
    n.setType = function (a, b, c) {
      n.freeze ||
        ((g = a),
        (p = Date.now()),
        (k = !!b),
        "undefined" !== typeof c
          ? ((f = c), (m = !1))
          : ((f = c || 0), (m = !0)));
    };
    n.render = function (a) {
      if (l.cursor && A.length) {
        var b = H[g] || H[n.ACTION.DEFAULT],
          c = B.actions[g],
          d = f,
          e = c.delay * b.delayMult,
          h = b.startX,
          b = b.startY;
        m &&
          ((a = ((a - p) / e) | 0),
          (d = k
            ? Math.min(a, c.animations.length - 1)
            : a % c.animations.length));
        if ((c = c.animations[d]))
          if (
            (n.magnetism &&
              !n.blockMagnetism &&
              (a = C.getOverEntity()) &&
              ((a.objecttype === z.TYPE_MOB && !0 === t.snap) ||
                (a.objecttype === z.TYPE_ITEM && !0 === t.itemsnap)) &&
              ((h += Math.floor(
                P.screen.x -
                  (a.boundingRect.x1 +
                    (a.boundingRect.x2 - a.boundingRect.x1) / 2),
              )),
              (b += Math.floor(
                P.screen.y -
                  (a.boundingRect.y1 +
                    (a.boundingRect.y2 - a.boundingRect.y1) / 2),
              ))),
            c.compiledStyleIndex !== q || h !== v || b !== u)
          )
            ((q = c.compiledStyleIndex),
              (v = h),
              (u = b),
              (document.body.style.cursor =
                "url(" + A[q] + ") " + h + " " + b + ", auto"));
      }
    };
    return n;
  },
);
