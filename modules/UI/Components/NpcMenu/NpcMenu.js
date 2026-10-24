define(
  "UI/Components/NpcMenu/NpcMenu",
  "require Utils/jquery Controls/KeyEventHandler Renderer/Renderer UI/UIManager UI/UIComponent Preferences/Controls text!./NpcMenu.html text!./NpcMenu.css".split(
    " ",
  ),
  function (a) {
    function b() {
      this.onSelectMenu(f, l + 1);
    }
    function c() {
      this.onSelectMenu(f, 255);
    }
    function d(a) {
      this.ui.find(".content div").removeClass("selected");
      a.addClass("selected");
      l = parseInt(a.data("index"), 10);
    }
    function e(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 20 * Math.floor(this.scrollTop / 20) - 20 * b;
      return !1;
    }
    var m = a("Utils/jquery"),
      h = a("Controls/KeyEventHandler"),
      r = a("Renderer/Renderer"),
      q = a("UI/UIManager"),
      k = a("UI/UIComponent"),
      g = a("Preferences/Controls"),
      t = a("text!./NpcMenu.html");
    a = a("text!./NpcMenu.css");
    var k = new k("NpcMenu", t, a),
      l = 0,
      f = 0;
    k.needFocus = !1;
    k.init = function () {
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
          d.call(a, m(this));
        })
        .on("dblclick", "div", b.bind(this))
        .mousedown(function (a) {
          a.stopImmediatePropagation();
          return !1;
        });
    };
    k.onAppend = function () {
      g.talk = !0;
    };
    k.onRemove = function () {
      f = 0;
      g.talk = !1;
      this.ui.find(".content").empty();
    };
    k.onKeyDown = function (a) {
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
          l = Math.max(l - 1, 0);
          this.ui.find(".content div").removeClass("selected");
          this.ui.find(".content div:eq(" + l + ")").addClass("selected");
          d = this.ui.find(".content")[0];
          c = 20 * l;
          c < d.scrollTop && (d.scrollTop = c);
          break;
        case h.DOWN:
          c = this.ui.find(".content div").length;
          l = Math.min(l + 1, c - 1);
          this.ui.find(".content div").removeClass("selected");
          this.ui.find(".content div:eq(" + l + ")").addClass("selected");
          d = this.ui.find(".content")[0];
          c = 20 * l;
          c >= d.scrollTop + 80 && (d.scrollTop = c - 60);
          break;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    k.setMenu = function (a, b) {
      var c, d, e;
      c = this.ui.find(".content");
      a = a.split(":");
      f = b;
      l = 0;
      c.empty();
      d = b = 0;
      for (e = a.length; b < e; ++b)
        a[b].length &&
          m("\x3cdiv/\x3e").text(a[b]).data("index", d++).appendTo(c);
      c.find("div:first").addClass("selected");
    };
    k.onSelectMenu = function () {};
    return q.addComponent(k);
  },
);
