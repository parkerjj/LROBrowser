define(
  "UI/UIComponent",
  "require text!./Common.css Utils/jquery ./CursorManager DB/DBManager Core/Client Core/Events Controls/MouseEventHandler".split(
    " ",
  ),
  function (a) {
    function b(a, b, c) {
      this.name = a;
      this._htmlText = b || null;
      this._cssText = c || null;
    }
    var c = a("text!./Common.css"),
      d = a("Utils/jquery"),
      e = a("./CursorManager"),
      m = a("DB/DBManager"),
      h = a("Core/Client"),
      r = a("Core/Events"),
      q = a("Controls/MouseEventHandler"),
      k = d("style:first");
    k.length ||
      (k = d('\x3cstyle type\x3d"text/css"\x3e\x3c/style\x3e').appendTo(
        "head",
      ));
    k.append(c);
    b.MouseMode = { CROSS: 0, STOP: 1, FREEZE: 2 };
    b.prototype.mouseMode = b.MouseMode.STOP;
    b.prototype.__loaded = !1;
    b.prototype.__active = !1;
    b.prototype.needFocus = !0;
    b.prototype.prepare = function () {
      if (!this.__loaded) {
        this._htmlText &&
          ((this.ui = d(this._htmlText)), this.ui.css("zIndex", 50));
        this._cssText &&
          (-1 === k.text().indexOf("\n\n/** " + this.name + " **/\n") &&
            k.append("\n\n/** " + this.name + " **/\n" + this._cssText),
          d("body").append(this.ui));
        this._htmlText &&
          this.ui.each(this.parseHTML).find("*").each(this.parseHTML);
        this.init && this.init();
        if (this.mouseMode === b.MouseMode.STOP)
          if (this.__mouseStopBlock)
            for (var a = 0; a < this.__mouseStopBlock.length; a++)
              this.setIntersection(this.__mouseStopBlock[a]);
          else this.setIntersection(this.ui);
        this._htmlText && this.ui.detach();
        this.__loaded = !0;
      }
    };
    b.prototype.setIntersection = function (b) {
      var c,
        d = 0;
      b.mouseenter(function () {
        0 === d &&
          ((c = q.intersect),
          d++,
          c && ((q.intersect = !1), e.setType(e.ACTION.DEFAULT)));
      });
      b.mouseleave(function () {
        0 < d &&
          (d--,
          0 === d &&
            c &&
            ((q.intersect = !0),
            a("Renderer/EntityManager").setOverEntity(null)));
      });
      b.on("x_remove", function () {
        0 < d &&
          ((d = 0),
          c &&
            ((q.intersect = !0),
            a("Renderer/EntityManager").setOverEntity(null)));
      });
      b.on("touchstart", function (a) {
        a.stopImmediatePropagation();
      });
      b.mousedown(this.focus.bind(this));
    };
    b.prototype.remove = function () {
      this.__active = !1;
      if (this.__loaded && this.ui.parent().length) {
        if (this.onRemove) this.onRemove();
        this.onKeyDown && d(window).off("keydown." + this.name);
        this.ui.trigger("x_remove");
        this.ui.detach();
        this.mouseMode === b.MouseMode.FREEZE && (q.intersect = !0);
      }
    };
    b.prototype.append = function () {
      this.__active = !0;
      if (this.__loaded) {
        this.ui.appendTo("body");
        if (this.onKeyDown)
          d(window)
            .off("keydown." + this.name)
            .on("keydown." + this.name, this.onKeyDown.bind(this));
        this.mouseMode === b.MouseMode.FREEZE &&
          ((q.intersect = !1), e.setType(e.ACTION.DEFAULT));
        if (this.onAppend) this.onAppend();
        this.focus();
      } else
        (this.prepare(),
          r.setTimeout(
            function () {
              this.__active && this.append();
            }.bind(this),
            10,
          ));
    };
    b.prototype.focus = function () {
      if (this.manager && this.needFocus) {
        var a = this.manager.components,
          b,
          c,
          d = [],
          e,
          k;
        for (b in a)
          this !== a[b] &&
            a[b].__active &&
            a[b].needFocus &&
            ((c = parseInt(a[b].ui.css("zIndex"), 10)), (d[c - 50] = c));
        k = c = 0;
        for (e = d.length; c < e; ++c) d[c] ? (d[c] -= k) : k++;
        for (b in a)
          this !== a[b] &&
            a[b].__active &&
            a[b].needFocus &&
            ((c = parseInt(a[b].ui.css("zIndex"), 10)),
            a[b].ui.css("zIndex", d[c - 50]));
        this.ui.css("zIndex", d.length + 50 - k);
      }
    };
    b.prototype.clone = function (a, c) {
      a = new b(a, this._htmlText, this._cssText);
      if (c) {
        c = Object.keys(this);
        var d,
          e = c.length;
        for (d = 0; d < e; ++d) a[c[d]] = this[c[d]];
      }
      return a;
    };
    b.prototype.on = function (a) {
      switch (a.toLowerCase()) {
        case "keydown":
          if (this.onKeyDown)
            d(window)
              .off("keydown." + this.name)
              .on("keydown." + this.name, this.onKeyDown.bind(this));
      }
    };
    b.prototype.off = function (a) {
      switch (a.toLowerCase()) {
        case "keydown":
          d(window).off("keydown." + this.name);
      }
    };
    b.prototype.draggable = function (a) {
      var b = this.ui;
      a || (a = this.ui);
      a.on("mousedown touchstart", function (a) {
        function c() {
          var a = q.screen.x + e,
            d = q.screen.y + g,
            f = parseFloat(b.css("opacity") || 1) - 0.02;
          10 > Math.abs(a) && (a = 0);
          10 > Math.abs(d) && (d = 0);
          10 > Math.abs(a + l - q.screen.width) && (a = q.screen.width - l);
          10 > Math.abs(d + k - q.screen.height) && (d = q.screen.height - k);
          b.css({ top: d, left: a, opacity: Math.max(f, 0.7) });
          h = r.setTimeout(c, 15);
        }
        if ("touchstart" === a.type)
          ((q.screen.x = a.originalEvent.touches[0].pageX),
            (q.screen.y = a.originalEvent.touches[0].pageY));
        else if (1 !== a.which) return;
        var e, g, l, k, h;
        e = b.position().left - q.screen.x;
        g = b.position().top - q.screen.y;
        l = b.width();
        k = b.height();
        b.stop();
        h = r.setTimeout(c, 15);
        d(window).on("mouseup.dragdrop touchend.dragdrop", function (a) {
          if ("touchend" === a.type || 1 === a.which || a.isTrigger)
            (b.stop().animate({ opacity: 1 }, 500),
              r.clearTimeout(h),
              d(window).off("mouseup.dragdrop touchend.dragdrop"));
        });
      });
      return this;
    };
    b.prototype.draggableBottom = function (a, b) {
      b || (b = this.ui);
      a || (a = this.ui);
      a.on("mousedown touchstart", function (a) {
        function c() {
          var a = b74.zoom / 100,
            f = b73.screen.x + d,
            n = e - b73.screen.y,
            p = parseFloat(b.css("opacity") || 1) - 0.02;
          10 > Math.abs(f) && (f = 0);
          10 > Math.abs(n) && (n = 0);
          10 > Math.abs(f + g - b73.screen.width) && (f = b73.screen.width - g);
          10 > Math.abs(n + l * a - b73.screen.height) &&
            (n = b73.screen.height - l * a);
          b.css({ bottom: n, left: f, opacity: Math.max(p, 0.7) });
          k = b72.setTimeout(c, 15);
        }
        if ("touchstart" === a.type)
          ((b73.screen.x = a.originalEvent.touches[0].pageX),
            (b73.screen.y = a.originalEvent.touches[0].pageY));
        else if (1 !== a.which) return;
        var d, e, g, l, k;
        a = b74.zoom / 100;
        d = b.position().left - b73.screen.x;
        e =
          b6Y(window).height() -
          b.position().top -
          b.height() * a +
          b73.screen.y;
        g = b.width();
        l = b.height();
        b.stop();
        k = b72.setTimeout(c, 15);
        b6Y(window).on("mouseup.dragdrop touchend.dragdrop", function (a) {
          if ("touchend" === a.type || 1 === a.which || a.isTrigger)
            (b.stop().animate({ opacity: 1 }, 500),
              b72.clearTimeout(k),
              b6Y(window).off("mouseup.dragdrop touchend.dragdrop"));
        });
      });
      return this;
    };
    b.prototype.changeBackground = function (a, b) {
      var c = this.ui.find(a);
      for (a = 0; a < c.length; a++) c[a].usePreloadAsBgr = b;
      c.data("hover")
        ? c.mouseout()
        : c.data("down")
          ? c.mouseup()
          : ((b = b
              ? c.data("preload").split(";")[b - 1]
              : c.data("background")),
            b71.loadFile(b70.INTERFACE_PATH + b, function (a) {
              c.css("backgroundImage", "url(" + a + ")");
            }));
    };
    b.prototype.parseHTML = function () {
      var a = d(this),
        b = a.data("background"),
        c = a.data("preload"),
        e = a.data("hover"),
        n = a.data("down"),
        k = a.data("text"),
        v = null,
        u = null;
      k && m.getMessage(k, "") && a.text(m.getMessage(k, ""));
      b &&
        h.loadFile(m.INTERFACE_PATH + b, function (b) {
          v = b;
          a.css("backgroundImage", "url(" + v + ")");
        });
      e &&
        h.loadFile(m.INTERFACE_PATH + e, function (b) {
          u = b;
          a.mouseover(function () {
            this.style.backgroundImage = "url(" + u + ")";
          });
          a.mouseout(function () {
            this.style.backgroundImage = "url(" + v + ")";
          });
        });
      n &&
        (h.loadFile(m.INTERFACE_PATH + n, function (b) {
          a.mousedown(function (a) {
            this.style.backgroundImage = "url(" + b + ")";
            a.stopImmediatePropagation();
          });
          a.mouseup(function () {
            this.style.backgroundImage = "url(" + (u || v) + ")";
          });
        }),
        e ||
          a.mouseout(function () {
            this.style.backgroundImage = "url(" + v + ")";
          }));
      if (c) {
        b = c.split(";");
        c = 0;
        for (e = b.length; c < e; ++c) b[c] = m.INTERFACE_PATH + d.trim(b[c]);
        h.loadFiles(b);
      }
    };
    return b;
  },
);
