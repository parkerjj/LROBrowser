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
      r = a("UI/UIComponent");
    a("UI/Components/ChatBox/ChatBox");
    var q = a("text!./RankFont.html");
    a = a("text!./RankFont.css");
    var k = new r("RankFont", q, a);
    k.needFocus = !1;
    var g = Array(11),
      t = 0;
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
      t = a.total;
      this.refresh();
    };
    k.refresh = function () {
      var a,
        c,
        d,
        e,
        h,
        m = k.ui.find(".content");
      if (0 != t) {
        m.find(".row").empty();
        var q = document.createElement("canvas"),
          r = q.getContext("2d"),
          B = t.toString().split(""),
          O,
          C;
        h = g[1];
        O = 0 + (h.width + 2.8);
        C = Math.max(0, h.height);
        h = g[10];
        O += h.width + 2.8;
        C = Math.max(C, h.height);
        a = 0;
        for (c = B.length; a < c; ++a)
          ((h = g[B[a]]), (O += h.width + 2.8), (C = Math.max(C, h.height)));
        r.canvas.width = b.toPowerOfTwo(O);
        r.canvas.height = b.toPowerOfTwo(C);
        q.style.width = r.canvas.width / 2 + "px";
        d = (r.canvas.width - O + 4) >> 1;
        e = (r.canvas.height - C + 25) >> 1;
        O = 0;
        h = g[1];
        r.drawImage(h, d + O, (e + (C - h.height)) >> 1);
        O += h.width + 2.8;
        h = g[10];
        r.drawImage(h, d + O, (e + (C - h.height)) >> 1);
        O += h.width + 2.8;
        a = 0;
        for (c = B.length; a < c; ++a)
          ((h = g[B[a]]),
            r.drawImage(h, d + O, (e + (C - h.height)) >> 1),
            (O += h.width + 2.8));
        m.find(".row").append(q);
      }
    };
    return h.addComponent(k);
  },
);
