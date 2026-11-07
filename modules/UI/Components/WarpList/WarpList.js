define(
  "UI/Components/WarpList/WarpList",
  "require Utils/jquery Controls/KeyEventHandler Renderer/Renderer UI/UIManager UI/UIComponent text!./WarpList.html text!./WarpList.css".split(
    " ",
  ),
  function (a) {
    function b() {
      this.onSelectMenu(l, t + 1);
    }
    function c() {
      this.onSelectMenu(l, 255);
    }
    function d(a) {
      this.ui.find(".content div").removeClass("selected");
      a.addClass("selected");
      t = parseInt(a.data("index"), 10);
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
      g = a("text!./WarpList.html");
    a = a("text!./WarpList.css");
    var k = new k("WarpList", g, a),
      t = 0,
      l = 0;
    k.init = function () {
      this.ui.find(".ok").click(b.bind(this));
      this.ui.find(".cancel").click(c.bind(this));
      this.ui.css({
        top: Math.max(300, r.height / 2 + 60),
        left: Math.max(r.width / 3, 20),
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
    k.onRemove = function () {
      this.ui.find(".content").empty();
    };
    k.onKeyDown = function (a) {
      var c, d;
      switch (a.which) {
        case h.ENTER:
          b.call(this);
          break;
        case h.ESCAPE:
          this.onSelectMenu(l, 255);
          break;
        case h.UP:
          this.ui.find(".content div");
          t = Math.max(t - 1, 0);
          this.ui.find(".content div").removeClass("selected");
          this.ui.find(".content div:eq(" + t + ")").addClass("selected");
          d = this.ui.find(".content")[0];
          c = 20 * t;
          c < d.scrollTop && (d.scrollTop = c);
          break;
        case h.DOWN:
          c = this.ui.find(".content div").length;
          t = Math.min(t + 1, c - 1);
          this.ui.find(".content div").removeClass("selected");
          this.ui.find(".content div:eq(" + t + ")").addClass("selected");
          d = this.ui.find(".content")[0];
          c = 20 * t;
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
      l = b;
      t = 0;
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
