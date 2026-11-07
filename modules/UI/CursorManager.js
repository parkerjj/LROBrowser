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
      var b = B.actions[k.ACTION.CLICK],
        d = a(b.animations[0].layers[0].index),
        b = a(b.animations[1].layers[0].index),
        e = a(B.actions[k.ACTION.DEFAULT].animations[0].layers[0].index);
      c("head").append(
        [
          '\x3cstyle type\x3d"text/css"\x3e',
          "button { cursor: url(" + d + "), auto; }",
          "button:active { cursor: url(" + b + "), auto; }",
          ".event_add_cursor { cursor: url(" + d + "), auto; }",
          ".event_add_cursor:active { cursor: url(" + b + "), auto; }",
          "input[type\x3dtext] { cursor: url(" + e + "), auto; }",
          "textarea { cursor: url(" + e + "), auto; }",
          "\x3c/style\x3e",
        ].join("\n"),
      );
    }
    var c = a("Utils/jquery"),
      d = a("Core/Client"),
      e = a("Core/MemoryManager"),
      m = a("Preferences/Graphics"),
      h = a("Loaders/Sprite"),
      r = a("Loaders/Action"),
      q = a("Preferences/Controls"),
      k = {
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
      g = k.ACTION.DEFAULT,
      t = 0,
      l = !1,
      f = 0,
      n = !0,
      p = -1,
      v = 0,
      u = 0,
      A = [],
      D,
      B,
      O = {};
    O[k.ACTION.DEFAULT] = {
      drawX: 1,
      drawY: 19,
      startX: 0,
      startY: 0,
      delayMult: 2,
    };
    O[k.ACTION.TALK] = {
      drawX: 20,
      drawY: 40,
      startX: 20,
      startY: 20,
      delayMult: 1,
    };
    O[k.ACTION.WARP] = {
      drawX: 10,
      drawY: 32,
      startX: 0,
      startY: 0,
      delayMult: 1,
    };
    O[k.ACTION.ROTATE] = {
      drawX: 18,
      drawY: 26,
      startX: 10,
      startY: 0,
      delayMult: 1,
    };
    O[k.ACTION.PICK] = {
      drawX: 20,
      drawY: 40,
      startX: 15,
      startY: 15,
      delayMult: 1,
    };
    O[k.ACTION.TARGET] = {
      drawX: 20,
      drawY: 50,
      startX: 20,
      startY: 28,
      delayMult: 0.5,
    };
    var C, y, z, J;
    k.init = function (c) {
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
              var f, g, l, n, p, t, m, u, v, R, q, I, V, x, L;
              u = document.createElement("canvas");
              u.width = 50;
              u.height = 50;
              v = u.getContext("2d");
              R = new y();
              x = [];
              A = [];
              L = [0, 0];
              a = 0;
              for (g = B.actions.length; a < g; ++a)
                for (
                  p = B.actions[a],
                    m = O[a] || O[k.ACTION.DEFAULT],
                    d = 0,
                    l = p.animations.length;
                  d < l;
                  ++d
                ) {
                  t = p.animations[d];
                  z.bind2DContext(v, m.drawX, m.drawY);
                  v.clearRect(0, 0, 50, 50);
                  f = 0;
                  for (n = t.layers.length; f < n; ++f)
                    R.renderLayer(t.layers[f], D, D, 1, L, !1);
                  V = u.toDataURL("image/png");
                  f = x.indexOf(V);
                  if (-1 < f) t.compiledStyleIndex = f;
                  else {
                    q = atob(V.replace(/^data[^,]+,/, ""));
                    n = q.length;
                    I = new Uint8Array(n);
                    for (f = 0; f < n; ++f) I[f] = q.charCodeAt(f);
                    t.compiledStyleIndex = A.length;
                    x.push(V);
                    A.push(
                      URL.createObjectURL(
                        new Blob([I.buffer], { type: "image/png" }),
                      ),
                    );
                  }
                }
              c();
            },
          ),
          (C = a("Renderer/EntityManager")),
          (y = a("Renderer/Entity/Entity")),
          (z = a("Renderer/SpriteRenderer")),
          (J = a("Controls/MouseEventHandler")));
    };
    k.setType = function (a, b, c) {
      k.freeze ||
        ((g = a),
        (t = Date.now()),
        (l = !!b),
        "undefined" !== typeof c
          ? ((f = c), (n = !1))
          : ((f = c || 0), (n = !0)));
    };
    k.render = function (a) {
      if (m.cursor && A.length) {
        var b = O[g] || O[k.ACTION.DEFAULT],
          c = B.actions[g],
          d = f,
          e = c.delay * b.delayMult,
          h = b.startX,
          b = b.startY;
        n &&
          ((a = ((a - t) / e) | 0),
          (d = l
            ? Math.min(a, c.animations.length - 1)
            : a % c.animations.length));
        if ((c = c.animations[d]))
          if (
            (k.magnetism &&
              !k.blockMagnetism &&
              (a = C.getOverEntity()) &&
              ((a.objecttype === y.TYPE_MOB && !0 === q.snap) ||
                (a.objecttype === y.TYPE_ITEM && !0 === q.itemsnap)) &&
              ((h += Math.floor(
                J.screen.x -
                  (a.boundingRect.x1 +
                    (a.boundingRect.x2 - a.boundingRect.x1) / 2),
              )),
              (b += Math.floor(
                J.screen.y -
                  (a.boundingRect.y1 +
                    (a.boundingRect.y2 - a.boundingRect.y1) / 2),
              ))),
            c.compiledStyleIndex !== p || h !== v || b !== u)
          )
            ((p = c.compiledStyleIndex),
              (v = h),
              (u = b),
              (document.body.style.cursor =
                "url(" + A[p] + ") " + h + " " + b + ", auto"));
      }
    };
    return k;
  },
);
