define(
  "UI/Components/RankFont/RankFont",
  "require Utils/WebGL Core/Client Core/Preferences Loaders/Sprite Renderer/Renderer Renderer/SpriteRenderer Renderer/Entity/Entity UI/UIManager UI/UIComponent UI/Components/ChatBox/ChatBox text!./RankFont.html text!./RankFont.css".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/WebGL"),
      c = a("Core/Client"),
      d = a("Core/Preferences"),
      e = a("Loaders/Sprite");
    a("Renderer/Renderer");
    a("Renderer/SpriteRenderer");
    var m = a("Renderer/Entity/Entity"),
      h = a("UI/UIManager"),
      q = a("UI/UIComponent");
    a("UI/Components/ChatBox/ChatBox");
    var r = a("text!./RankFont.html");
    a = a("text!./RankFont.css");
    var k = new q("RankFont", r, a);
    k.needFocus = !1;
    var g = Array(11),
      u = 0;
    new m();
    d.get("RankFont", { x: 600, y: 200, show: !0 }, 1.1);
    k.init = function () {
      this.ui.css("zIndex", 30);
      g[0] ||
        c.getFiles(
          ["data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/rankfont.spr"],
          function (a) {
            var b;
            try {
              b = new e(a);
            } catch (n) {
              console.error("Sprite::init() - " + n.message);
              return;
            }
            for (a = 0; 11 > a; ++a) g[a] = b.getCanvasFromFrame(a);
          },
        );
    };
    k.free = function (a) {};
    k.onAppend = function () {
      this.ui.hide();
      this.refresh();
    };
    k.onRemove = function () {};
    k.updateCount = function (a) {
      u = a.total;
      this.refresh();
    };
    k.refresh = function () {
      var a,
        c,
        d,
        e,
        h,
        m = k.ui.find(".content");
      if (0 != u) {
        m.find(".row").empty();
        var r = document.createElement("canvas"),
          q = r.getContext("2d"),
          C = u.toString().split(""),
          J,
          A;
        h = g[1];
        J = 0 + (h.width + 2.8);
        A = Math.max(0, h.height);
        h = g[10];
        J += h.width + 2.8;
        A = Math.max(A, h.height);
        a = 0;
        for (c = C.length; a < c; ++a)
          ((h = g[C[a]]), (J += h.width + 2.8), (A = Math.max(A, h.height)));
        q.canvas.width = b.toPowerOfTwo(J);
        q.canvas.height = b.toPowerOfTwo(A);
        r.style.width = q.canvas.width / 2 + "px";
        d = (q.canvas.width - J + 4) >> 1;
        e = (q.canvas.height - A + 25) >> 1;
        J = 0;
        h = g[1];
        q.drawImage(h, d + J, (e + (A - h.height)) >> 1);
        J += h.width + 2.8;
        h = g[10];
        q.drawImage(h, d + J, (e + (A - h.height)) >> 1);
        J += h.width + 2.8;
        a = 0;
        for (c = C.length; a < c; ++a)
          ((h = g[C[a]]),
            q.drawImage(h, d + J, (e + (A - h.height)) >> 1),
            (J += h.width + 2.8));
        m.find(".row").append(r);
      }
    };
    return h.addComponent(k);
  },
);
