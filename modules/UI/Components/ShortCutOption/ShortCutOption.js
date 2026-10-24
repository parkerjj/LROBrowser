define(
  "UI/Components/ShortCutOption/ShortCutOption",
  "require Utils/jquery Controls/KeyEventHandler Core/Configs Core/Context Core/Preferences Renderer/Renderer UI/UIManager UI/UIComponent Preferences/ShortCutControls Controls/BattleMode text!./ShortCutOption.html text!./ShortCutOption.css".split(
    " ",
  ),
  function (a) {
    function b() {
      v.ui && v.ui[0].parentNode ? v.remove() : v.append();
    }
    function c() {
      for (var a = v.ui.find("td[data-button]"), b = 0; b < a.length; b++)
        d(a.eq(b).data("button"))
          ? a
              .eq(b)
              .text(
                (e(a.eq(b).data("button")) ? "ALT + " : "") +
                  (m(a.eq(b).data("button")) ? "CTRL + " : "") +
                  (h(a.eq(b).data("button")) ? "SHIFT + " : "") +
                  q.toReadableKey(parseInt(d(a.eq(b).data("button")), 10)),
              )
          : a.eq(b).text("\u672a\u8bbe\u7f6e");
    }
    function d(a) {
      return f[a].Custom_settings ? f[a].Custom_settings : f[a].init;
    }
    function e(a) {
      return f[a].Custom_settings ? f[a].Custom_alt : f[a].alt;
    }
    function m(a) {
      return f[a].Custom_settings ? f[a].Custom_ctrl : f[a].ctrl;
    }
    function h(a) {
      return f[a].Custom_settings ? f[a].Custom_shift : f[a].shift;
    }
    var r = a("Utils/jquery"),
      q = a("Controls/KeyEventHandler");
    a("Core/Configs");
    a("Core/Context");
    var k = a("Core/Preferences"),
      g = a("Renderer/Renderer"),
      t = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("Preferences/ShortCutControls"),
      n = a("Controls/BattleMode"),
      p = a("text!./ShortCutOption.html");
    a = a("text!./ShortCutOption.css");
    var v = new l("ShortCutOption", p, a),
      u = k.get("ShortCutOption", { x: 300, y: 300 }, 1.1),
      A = (v.needFocus = !1);
    v.init = function () {
      this.ui.find(".close").on("click", b);
      this.ui.find(".tabs").on("click", "button", function () {
        0 == r(this).data("index")
          ? v.ui.find(".border").hasClass("ui") &&
            v.ui.find(".border").removeClass("ui").addClass("ShortCut")
          : v.ui.find(".border").hasClass("ShortCut") &&
            v.ui.find(".border").removeClass("ShortCut").addClass("ui");
      });
      this.ui.find("td").on("click", function () {
        r(this).hasClass("customize")
          ? ((A = !0),
            r("#ShortCutOption td.sd").removeClass("sd"),
            r(this).addClass("sd"))
          : ((A = !1), r("#ShortCutOption td.sd").removeClass("sd"));
      });
      c();
      this.draggable(this.ui.find(".titlebar"));
    };
    v.onAppend = function () {
      this.ui.css({
        top: 0.5 * (g.height - this.ui.height()),
        left: 0.5 * (g.width - this.ui.width()),
        zIndex: 100,
      });
    };
    v.onRemove = function () {
      u.x = parseInt(this.ui.css("left"), 10);
      u.y = parseInt(this.ui.css("top"), 10);
      u.save();
    };
    v.onKeyDown = function (a) {
      if (A) {
        var b = v.ui.find("td.sd");
        if (n.match(a.which, q.ALT, q.CTRL, q.SHIFT))
          return (
            alert("\u4e0e\u5176\u5b83\u5feb\u6377\u952e\u51b2\u7a81"),
            !1
          );
        16 != a.which &&
          17 != a.which &&
          18 != a.which &&
          ((f[b.data("button")].Custom_settings = a.which),
          (f[b.data("button")].Custom_alt = q.ALT),
          (f[b.data("button")].Custom_ctrl = q.CTRL),
          (f[b.data("button")].Custom_shift = q.SHIFT),
          f.save());
        n.reload();
        b.text(
          (e(b.data("button")) ? "ALT + " : "") +
            (m(b.data("button")) ? "CTRL + " : "") +
            (h(b.data("button")) ? "SHIFT + " : "") +
            q.toReadableKey(d(b.data("button")), 10),
        );
      }
      return !1;
    };
    return t.addComponent(v);
  },
);
