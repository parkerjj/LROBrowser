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
    var l = a("Renderer/Entity/Entity"),
      h = a("UI/UIManager"),
      r = a("UI/UIComponent");
    a("UI/Components/ChatBox/ChatBox");
    var t = a("text!./RankFont.html");
    a = a("text!./RankFont.css");
    var n = new r("RankFont", t, a);
    n.needFocus = !1;
    var g = Array(11),
      p = 0;
    new l();
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
            } catch (m) {
              console.error("Sprite::init() - " + m.message);
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
        l = n.ui.find(".content");
      if (0 != p) {
        l.find(".row").empty();
        var t = document.createElement("canvas"),
          r = t.getContext("2d"),
          B = p.toString().split(""),
          H,
          C;
        h = g[1];
        H = 0 + (h.width + 2.8);
        C = Math.max(0, h.height);
        h = g[10];
        H += h.width + 2.8;
        C = Math.max(C, h.height);
        a = 0;
        for (c = B.length; a < c; ++a)
          ((h = g[B[a]]), (H += h.width + 2.8), (C = Math.max(C, h.height)));
        r.canvas.width = b.toPowerOfTwo(H);
        r.canvas.height = b.toPowerOfTwo(C);
        t.style.width = r.canvas.width / 2 + "px";
        d = (r.canvas.width - H + 4) >> 1;
        e = (r.canvas.height - C + 25) >> 1;
        H = 0;
        h = g[1];
        r.drawImage(h, d + H, (e + (C - h.height)) >> 1);
        H += h.width + 2.8;
        h = g[10];
        r.drawImage(h, d + H, (e + (C - h.height)) >> 1);
        H += h.width + 2.8;
        a = 0;
        for (c = B.length; a < c; ++a)
          ((h = g[B[a]]),
            r.drawImage(h, d + H, (e + (C - h.height)) >> 1),
            (H += h.width + 2.8));
        l.find(".row").append(t);
      }
    };
    return h.addComponent(n);
  },
);
