define(
  "UI/Components/ShortCutOption/ShortCutOption",
  "require Utils/jquery Controls/KeyEventHandler Core/Configs Core/Context Core/Preferences Renderer/Renderer UI/UIManager UI/UIComponent Preferences/ShortCutControls Controls/BattleMode text!./ShortCutOption.html text!./ShortCutOption.css".split(
    " ",
  ),
  function (a) {
    function b() {
      u.ui && u.ui[0].parentNode ? u.remove() : u.append();
    }
    function c() {
      for (var a = u.ui.find("td[data-button]"), b = 0; b < a.length; b++)
        d(a.eq(b).data("button"))
          ? a
              .eq(b)
              .text(
                (e(a.eq(b).data("button")) ? "ALT + " : "") +
                  (m(a.eq(b).data("button")) ? "CTRL + " : "") +
                  (h(a.eq(b).data("button")) ? "SHIFT + " : "") +
                  r.toReadableKey(parseInt(d(a.eq(b).data("button")), 10)),
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
    var t = a("Utils/jquery"),
      r = a("Controls/KeyEventHandler");
    a("Core/Configs");
    a("Core/Context");
    var n = a("Core/Preferences"),
      g = a("Renderer/Renderer"),
      p = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("Preferences/ShortCutControls"),
      k = a("Controls/BattleMode"),
      q = a("text!./ShortCutOption.html");
    a = a("text!./ShortCutOption.css");
    var u = new l("ShortCutOption", q, a),
      v = n.get("ShortCutOption", { x: 300, y: 300 }, 1.1),
      A = (u.needFocus = !1);
    u.init = function () {
      this.ui.find(".close").on("click", b);
      this.ui.find(".tabs").on("click", "button", function () {
        0 == t(this).data("index")
          ? u.ui.find(".border").hasClass("ui") &&
            u.ui.find(".border").removeClass("ui").addClass("ShortCut")
          : u.ui.find(".border").hasClass("ShortCut") &&
            u.ui.find(".border").removeClass("ShortCut").addClass("ui");
      });
      this.ui.find("td").on("click", function () {
        t(this).hasClass("customize")
          ? ((A = !0),
            t("#ShortCutOption td.sd").removeClass("sd"),
            t(this).addClass("sd"))
          : ((A = !1), t("#ShortCutOption td.sd").removeClass("sd"));
      });
      c();
      this.draggable(this.ui.find(".titlebar"));
    };
    u.onAppend = function () {
      this.ui.css({
        top: 0.5 * (g.height - this.ui.height()),
        left: 0.5 * (g.width - this.ui.width()),
        zIndex: 100,
      });
    };
    u.onRemove = function () {
      v.x = parseInt(this.ui.css("left"), 10);
      v.y = parseInt(this.ui.css("top"), 10);
      v.save();
    };
    u.onKeyDown = function (a) {
      if (A) {
        var b = u.ui.find("td.sd");
        if (k.match(a.which, r.ALT, r.CTRL, r.SHIFT))
          return (
            alert("\u4e0e\u5176\u5b83\u5feb\u6377\u952e\u51b2\u7a81"),
            !1
          );
        16 != a.which &&
          17 != a.which &&
          18 != a.which &&
          ((f[b.data("button")].Custom_settings = a.which),
          (f[b.data("button")].Custom_alt = r.ALT),
          (f[b.data("button")].Custom_ctrl = r.CTRL),
          (f[b.data("button")].Custom_shift = r.SHIFT),
          f.save());
        k.reload();
        b.text(
          (e(b.data("button")) ? "ALT + " : "") +
            (m(b.data("button")) ? "CTRL + " : "") +
            (h(b.data("button")) ? "SHIFT + " : "") +
            r.toReadableKey(d(b.data("button")), 10),
        );
      }
      return !1;
    };
    return p.addComponent(u);
  },
);
