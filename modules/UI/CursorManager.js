define(
  "UI/CursorManager",
  "require Utils/jquery Core/Client Core/MemoryManager Preferences/Graphics Loaders/Sprite Loaders/Action Preferences/Controls".split(
    " ",
  ),
  function (a) {
    function b() {
      function a(a) {
        var b, c, d;
        a = C.getCanvasFromFrame(a);
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
      m = a("Preferences/Graphics"),
      h = a("Loaders/Sprite"),
      t = a("Loaders/Action"),
      r = a("Preferences/Controls"),
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
      l = !1,
      f = 0,
      k = !0,
      q = -1,
      u = 0,
      v = 0,
      A = [],
      C,
      B,
      J = {};
    J[n.ACTION.DEFAULT] = {
      drawX: 1,
      drawY: 19,
      startX: 0,
      startY: 0,
      delayMult: 2,
    };
    J[n.ACTION.TALK] = {
      drawX: 20,
      drawY: 40,
      startX: 20,
      startY: 20,
      delayMult: 1,
    };
    J[n.ACTION.WARP] = {
      drawX: 10,
      drawY: 32,
      startX: 0,
      startY: 0,
      delayMult: 1,
    };
    J[n.ACTION.ROTATE] = {
      drawX: 18,
      drawY: 26,
      startX: 10,
      startY: 0,
      delayMult: 1,
    };
    J[n.ACTION.PICK] = {
      drawX: 20,
      drawY: 40,
      startX: 15,
      startY: 15,
      delayMult: 1,
    };
    J[n.ACTION.TARGET] = {
      drawX: 20,
      drawY: 50,
      startX: 20,
      startY: 28,
      delayMult: 0.5,
    };
    var D, y, H, N;
    n.init = function (c) {
      C
        ? c()
        : (d.getFiles(
            ["data/sprite/cursors.spr", "data/sprite/cursors.act"],
            function (a, d) {
              try {
                ((C = new h(a)), (B = new t(d)));
              } catch (fa) {
                console.error("Cursor::init() - " + fa.message);
                return;
              }
              e.remove(null, "data/sprite/cursors.spr");
              e.remove(null, "data/sprite/cursors.act");
              b();
              var f, g, k, l, p, q, m, u, v, r, x, O, T, I, R;
              u = document.createElement("canvas");
              u.width = 50;
              u.height = 50;
              v = u.getContext("2d");
              r = new y();
              I = [];
              A = [];
              R = [0, 0];
              a = 0;
              for (g = B.actions.length; a < g; ++a)
                for (
                  p = B.actions[a],
                    m = J[a] || J[n.ACTION.DEFAULT],
                    d = 0,
                    k = p.animations.length;
                  d < k;
                  ++d
                ) {
                  q = p.animations[d];
                  H.bind2DContext(v, m.drawX, m.drawY);
                  v.clearRect(0, 0, 50, 50);
                  f = 0;
                  for (l = q.layers.length; f < l; ++f)
                    r.renderLayer(q.layers[f], C, C, 1, R, !1);
                  T = u.toDataURL("image/png");
                  f = I.indexOf(T);
                  if (-1 < f) q.compiledStyleIndex = f;
                  else {
                    x = atob(T.replace(/^data[^,]+,/, ""));
                    l = x.length;
                    O = new Uint8Array(l);
                    for (f = 0; f < l; ++f) O[f] = x.charCodeAt(f);
                    q.compiledStyleIndex = A.length;
                    I.push(T);
                    A.push(
                      URL.createObjectURL(
                        new Blob([O.buffer], { type: "image/png" }),
                      ),
                    );
                  }
                }
              c();
            },
          ),
          (D = a("Renderer/EntityManager")),
          (y = a("Renderer/Entity/Entity")),
          (H = a("Renderer/SpriteRenderer")),
          (N = a("Controls/MouseEventHandler")));
    };
    n.setType = function (a, b, c) {
      n.freeze ||
        ((g = a),
        (p = Date.now()),
        (l = !!b),
        "undefined" !== typeof c
          ? ((f = c), (k = !1))
          : ((f = c || 0), (k = !0)));
    };
    n.render = function (a) {
      if (m.cursor && A.length) {
        var b = J[g] || J[n.ACTION.DEFAULT],
          c = B.actions[g],
          d = f,
          e = c.delay * b.delayMult,
          h = b.startX,
          b = b.startY;
        k &&
          ((a = ((a - p) / e) | 0),
          (d = l
            ? Math.min(a, c.animations.length - 1)
            : a % c.animations.length));
        if ((c = c.animations[d]))
          if (
            (n.magnetism &&
              !n.blockMagnetism &&
              (a = D.getOverEntity()) &&
              ((a.objecttype === y.TYPE_MOB && !0 === r.snap) ||
                (a.objecttype === y.TYPE_ITEM && !0 === r.itemsnap)) &&
              ((h += Math.floor(
                N.screen.x -
                  (a.boundingRect.x1 +
                    (a.boundingRect.x2 - a.boundingRect.x1) / 2),
              )),
              (b += Math.floor(
                N.screen.y -
                  (a.boundingRect.y1 +
                    (a.boundingRect.y2 - a.boundingRect.y1) / 2),
              ))),
            c.compiledStyleIndex !== q || h !== u || b !== v)
          )
            ((q = c.compiledStyleIndex),
              (u = h),
              (v = b),
              (document.body.style.cursor =
                "url(" + A[q] + ") " + h + " " + b + ", auto"));
      }
    };
    return n;
  },
);
