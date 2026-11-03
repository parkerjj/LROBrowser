define(
  "UI/Components/NpcMenu/NpcMenu",
  "require Utils/jquery Controls/KeyEventHandler Renderer/Renderer UI/UIManager UI/UIComponent Preferences/Controls text!./NpcMenu.html text!./NpcMenu.css".split(
    " ",
  ),
  function (a) {
    function b() {
      this.onSelectMenu(f, k + 1);
    }
    function c() {
      this.onSelectMenu(f, 255);
    }
    function d(a) {
      this.ui.find(".content div").removeClass("selected");
      a.addClass("selected");
      k = parseInt(a.data("index"), 10);
    }
    function e(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 20 * Math.floor(this.scrollTop / 20) - 20 * b;
      return !1;
    }
    var l = a("Utils/jquery"),
      h = a("Controls/KeyEventHandler"),
      r = a("Renderer/Renderer"),
      t = a("UI/UIManager"),
      n = a("UI/UIComponent"),
      g = a("Preferences/Controls"),
      p = a("text!./NpcMenu.html");
    a = a("text!./NpcMenu.css");
    var n = new n("NpcMenu", p, a),
      k = 0,
      f = 0;
    n.needFocus = !1;
    n.init = function () {
      this.ui.find(".ok").click(b.bind(this));
      this.ui.find(".cancel").click(c.bind(this));
      this.ui.css({
        zIndex: 99,
        top: 0.5 * (r.height - this.ui.height()) + 100,
        left: 0.5 * (r.width - this.ui.width()),
      });
      this.draggable();
      var a = this;
      this.ui
        .find(".content")
        .on("mousewheel DOMMouseScroll", e)
        .on("mousedown", "div", function (b) {
          d.call(a, l(this));
        })
        .on("dblclick", "div", b.bind(this))
        .mousedown(function (a) {
          a.stopImmediatePropagation();
          return !1;
        });
    };
    n.onAppend = function () {
      g.talk = !0;
    };
    n.onRemove = function () {
      f = 0;
      g.talk = !1;
      this.ui.find(".content").empty();
    };
    n.onKeyDown = function (a) {
      var c, d;
      switch (a.which) {
        case h.ENTER:
          b.call(this);
          break;
        case h.ESCAPE:
          this.onSelectMenu(f, 255);
          break;
        case h.UP:
          this.ui.find(".content div");
          k = Math.max(k - 1, 0);
          this.ui.find(".content div").removeClass("selected");
          this.ui.find(".content div:eq(" + k + ")").addClass("selected");
          d = this.ui.find(".content")[0];
          c = 20 * k;
          c < d.scrollTop && (d.scrollTop = c);
          break;
        case h.DOWN:
          c = this.ui.find(".content div").length;
          k = Math.min(k + 1, c - 1);
          this.ui.find(".content div").removeClass("selected");
          this.ui.find(".content div:eq(" + k + ")").addClass("selected");
          d = this.ui.find(".content")[0];
          c = 20 * k;
          c >= d.scrollTop + 80 && (d.scrollTop = c - 60);
          break;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    n.setMenu = function (a, b) {
      var c, d, e;
      c = this.ui.find(".content");
      a = a.split(":");
      f = b;
      k = 0;
      c.empty();
      d = b = 0;
      for (e = a.length; b < e; ++b)
        a[b].length &&
          l("\x3cdiv/\x3e").text(a[b]).data("index", d++).appendTo(c);
      c.find("div:first").addClass("selected");
    };
    n.onSelectMenu = function () {};
    return t.addComponent(n);
  },
);
