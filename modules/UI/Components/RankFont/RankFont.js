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
      t = a("UI/UIComponent");
    a("UI/Components/ChatBox/ChatBox");
    var r = a("text!./RankFont.html");
    a = a("text!./RankFont.css");
    var n = new t("RankFont", r, a);
    n.needFocus = !1;
    var g = Array(11),
      p = 0;
    new m();
    d.get("RankFont", { x: 600, y: 200, show: !0 }, 1.1);
    n.init = function () {
      this.ui.css("zIndex", 30);
      g[0] ||
        c.getFiles(
          ["data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/rankfont.spr"],
          function (a) {
            var b;
            try {
              b = new e(a);
            } catch (k) {
              console.error("Sprite::init() - " + k.message);
              return;
            }
            for (a = 0; 11 > a; ++a) g[a] = b.getCanvasFromFrame(a);
          },
        );
    };
    n.free = function (a) {};
    n.onAppend = function () {
      this.ui.hide();
      this.refresh();
    };
    n.onRemove = function () {};
    n.updateCount = function (a) {
      p = a.total;
      this.refresh();
    };
    n.refresh = function () {
      var a,
        c,
        d,
        e,
        h,
        m = n.ui.find(".content");
      if (0 != p) {
        m.find(".row").empty();
        var r = document.createElement("canvas"),
          t = r.getContext("2d"),
          B = p.toString().split(""),
          J,
          D;
        h = g[1];
        J = 0 + (h.width + 2.8);
        D = Math.max(0, h.height);
        h = g[10];
        J += h.width + 2.8;
        D = Math.max(D, h.height);
        a = 0;
        for (c = B.length; a < c; ++a)
          ((h = g[B[a]]), (J += h.width + 2.8), (D = Math.max(D, h.height)));
        t.canvas.width = b.toPowerOfTwo(J);
        t.canvas.height = b.toPowerOfTwo(D);
        r.style.width = t.canvas.width / 2 + "px";
        d = (t.canvas.width - J + 4) >> 1;
        e = (t.canvas.height - D + 25) >> 1;
        J = 0;
        h = g[1];
        t.drawImage(h, d + J, (e + (D - h.height)) >> 1);
        J += h.width + 2.8;
        h = g[10];
        t.drawImage(h, d + J, (e + (D - h.height)) >> 1);
        J += h.width + 2.8;
        a = 0;
        for (c = B.length; a < c; ++a)
          ((h = g[B[a]]),
            t.drawImage(h, d + J, (e + (D - h.height)) >> 1),
            (J += h.width + 2.8));
        m.find(".row").append(r);
      }
    };
    return h.addComponent(n);
  },
);
