define(
  "UI/CursorManager",
  "require Utils/jquery Core/Client Core/MemoryManager Preferences/Graphics Loaders/Sprite Loaders/Action Preferences/Controls".split(
    " ",
  ),
  function (a) {
    function b() {
      function a(a) {
        var b, c, d;
        a = E.getCanvasFromFrame(a);
        if (!a) return "";
        a = atob(a.toDataURL("image/png").replace(/^data[^,]+,/, ""));
        d = a.length;
        b = new Uint8Array(d);
        for (c = 0; c < d; ++c) b[c] = a.charCodeAt(c);
        return URL.createObjectURL(new Blob([b], { type: "image/png" }));
      }
      var b = C.actions[k.ACTION.CLICK],
        d = a(b.animations[0].layers[0].index),
        b = a(b.animations[1].layers[0].index),
        f = a(C.actions[k.ACTION.DEFAULT].animations[0].layers[0].index);
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
      m = a("Preferences/Graphics"),
      h = a("Loaders/Sprite"),
      q = a("Loaders/Action"),
      r = a("Preferences/Controls"),
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
      u = 0,
      l = !1,
      f = 0,
      n = !0,
      p = -1,
      v = 0,
      t = 0,
      z = [],
      E,
      C,
      J = {};
    J[k.ACTION.DEFAULT] = {
      drawX: 1,
      drawY: 19,
      startX: 0,
      startY: 0,
      delayMult: 2,
    };
    J[k.ACTION.TALK] = {
      drawX: 20,
      drawY: 40,
      startX: 20,
      startY: 20,
      delayMult: 1,
    };
    J[k.ACTION.WARP] = {
      drawX: 10,
      drawY: 32,
      startX: 0,
      startY: 0,
      delayMult: 1,
    };
    J[k.ACTION.ROTATE] = {
      drawX: 18,
      drawY: 26,
      startX: 10,
      startY: 0,
      delayMult: 1,
    };
    J[k.ACTION.PICK] = {
      drawX: 20,
      drawY: 40,
      startX: 15,
      startY: 15,
      delayMult: 1,
    };
    J[k.ACTION.TARGET] = {
      drawX: 20,
      drawY: 50,
      startX: 20,
      startY: 28,
      delayMult: 0.5,
    };
    var A, B, F, O;
    k.init = function (c) {
      E
        ? c()
        : (d.getFiles(
            ["data/sprite/cursors.spr", "data/sprite/cursors.act"],
            function (a, d) {
              try {
                ((E = new h(a)), (C = new q(d)));
              } catch (fa) {
                console.error("Cursor::init() - " + fa.message);
                return;
              }
              e.remove(null, "data/sprite/cursors.spr");
              e.remove(null, "data/sprite/cursors.act");
              b();
              var f, g, l, n, p, u, t, m, v, r, x, M, T, H, R;
              m = document.createElement("canvas");
              m.width = 50;
              m.height = 50;
              v = m.getContext("2d");
              r = new B();
              H = [];
              z = [];
              R = [0, 0];
              a = 0;
              for (g = C.actions.length; a < g; ++a)
                for (
                  p = C.actions[a],
                    t = J[a] || J[k.ACTION.DEFAULT],
                    d = 0,
                    l = p.animations.length;
                  d < l;
                  ++d
                ) {
                  u = p.animations[d];
                  F.bind2DContext(v, t.drawX, t.drawY);
                  v.clearRect(0, 0, 50, 50);
                  f = 0;
                  for (n = u.layers.length; f < n; ++f)
                    r.renderLayer(u.layers[f], E, E, 1, R, !1);
                  T = m.toDataURL("image/png");
                  f = H.indexOf(T);
                  if (-1 < f) u.compiledStyleIndex = f;
                  else {
                    x = atob(T.replace(/^data[^,]+,/, ""));
                    n = x.length;
                    M = new Uint8Array(n);
                    for (f = 0; f < n; ++f) M[f] = x.charCodeAt(f);
                    u.compiledStyleIndex = z.length;
                    H.push(T);
                    z.push(
                      URL.createObjectURL(
                        new Blob([M.buffer], { type: "image/png" }),
                      ),
                    );
                  }
                }
              c();
            },
          ),
          (A = a("Renderer/EntityManager")),
          (B = a("Renderer/Entity/Entity")),
          (F = a("Renderer/SpriteRenderer")),
          (O = a("Controls/MouseEventHandler")));
    };
    k.setType = function (a, b, c) {
      k.freeze ||
        ((g = a),
        (u = Date.now()),
        (l = !!b),
        "undefined" !== typeof c
          ? ((f = c), (n = !1))
          : ((f = c || 0), (n = !0)));
    };
    k.render = function (a) {
      if (m.cursor && z.length) {
        var b = J[g] || J[k.ACTION.DEFAULT],
          c = C.actions[g],
          d = f,
          e = c.delay * b.delayMult,
          h = b.startX,
          b = b.startY;
        n &&
          ((a = ((a - u) / e) | 0),
          (d = l
            ? Math.min(a, c.animations.length - 1)
            : a % c.animations.length));
        if ((c = c.animations[d]))
          if (
            (k.magnetism &&
              !k.blockMagnetism &&
              (a = A.getOverEntity()) &&
              ((a.objecttype === B.TYPE_MOB && !0 === r.snap) ||
                (a.objecttype === B.TYPE_ITEM && !0 === r.itemsnap)) &&
              ((h += Math.floor(
                O.screen.x -
                  (a.boundingRect.x1 +
                    (a.boundingRect.x2 - a.boundingRect.x1) / 2),
              )),
              (b += Math.floor(
                O.screen.y -
                  (a.boundingRect.y1 +
                    (a.boundingRect.y2 - a.boundingRect.y1) / 2),
              ))),
            c.compiledStyleIndex !== p || h !== v || b !== t)
          )
            ((p = c.compiledStyleIndex),
              (v = h),
              (t = b),
              (document.body.style.cursor =
                "url(" + z[p] + ") " + h + " " + b + ", auto"));
      }
    };
    return k;
  },
);
