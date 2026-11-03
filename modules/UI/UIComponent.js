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
      t = a("Core/Events"),
      r = a("Controls/MouseEventHandler"),
      n = d("style:first");
    n.length ||
      (n = d('\x3cstyle type\x3d"text/css"\x3e\x3c/style\x3e').appendTo(
        "head",
      ));
    n.append(c);
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
          (-1 === n.text().indexOf("\n\n/** " + this.name + " **/\n") &&
            n.append("\n\n/** " + this.name + " **/\n" + this._cssText),
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
          ((c = r.intersect),
          d++,
          c && ((r.intersect = !1), e.setType(e.ACTION.DEFAULT)));
      });
      b.mouseleave(function () {
        0 < d &&
          (d--,
          0 === d &&
            c &&
            ((r.intersect = !0),
            a("Renderer/EntityManager").setOverEntity(null)));
      });
      b.on("x_remove", function () {
        0 < d &&
          ((d = 0),
          c &&
            ((r.intersect = !0),
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
        this.mouseMode === b.MouseMode.FREEZE && (r.intersect = !0);
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
          ((r.intersect = !1), e.setType(e.ACTION.DEFAULT));
        if (this.onAppend) this.onAppend();
        this.focus();
      } else
        (this.prepare(),
          t.setTimeout(
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
          q;
        for (b in a)
          this !== a[b] &&
            a[b].__active &&
            a[b].needFocus &&
            ((c = parseInt(a[b].ui.css("zIndex"), 10)), (d[c - 50] = c));
        q = c = 0;
        for (e = d.length; c < e; ++c) d[c] ? (d[c] -= q) : q++;
        for (b in a)
          this !== a[b] &&
            a[b].__active &&
            a[b].needFocus &&
            ((c = parseInt(a[b].ui.css("zIndex"), 10)),
            a[b].ui.css("zIndex", d[c - 50]));
        this.ui.css("zIndex", d.length + 50 - q);
      }
    };
    b.prototype.clone = function (a, c) {
      a = new b(a, this._htmlText, this._cssText);
      if (c) {
        c = Object.keys(this);
        var d,
          f = c.length;
        for (d = 0; d < f; ++d) a[c[d]] = this[c[d]];
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
          var a = r.screen.x + e,
            d = r.screen.y + g,
            f = parseFloat(b.css("opacity") || 1) - 0.02;
          10 > Math.abs(a) && (a = 0);
          10 > Math.abs(d) && (d = 0);
          10 > Math.abs(a + l - r.screen.width) && (a = r.screen.width - l);
          10 > Math.abs(d + p - r.screen.height) && (d = r.screen.height - p);
          b.css({ top: d, left: a, opacity: Math.max(f, 0.7) });
          h = t.setTimeout(c, 15);
        }
        if ("touchstart" === a.type)
          ((r.screen.x = a.originalEvent.touches[0].pageX),
            (r.screen.y = a.originalEvent.touches[0].pageY));
        else if (1 !== a.which) return;
        var e, g, l, p, h;
        e = b.position().left - r.screen.x;
        g = b.position().top - r.screen.y;
        l = b.width();
        p = b.height();
        b.stop();
        h = t.setTimeout(c, 15);
        d(window).on("mouseup.dragdrop touchend.dragdrop", function (a) {
          if ("touchend" === a.type || 1 === a.which || a.isTrigger)
            (b.stop().animate({ opacity: 1 }, 500),
              t.clearTimeout(h),
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
            k = e - b73.screen.y,
            q = parseFloat(b.css("opacity") || 1) - 0.02;
          10 > Math.abs(f) && (f = 0);
          10 > Math.abs(k) && (k = 0);
          10 > Math.abs(f + g - b73.screen.width) && (f = b73.screen.width - g);
          10 > Math.abs(k + l * a - b73.screen.height) &&
            (k = b73.screen.height - l * a);
          b.css({ bottom: k, left: f, opacity: Math.max(q, 0.7) });
          p = b72.setTimeout(c, 15);
        }
        if ("touchstart" === a.type)
          ((b73.screen.x = a.originalEvent.touches[0].pageX),
            (b73.screen.y = a.originalEvent.touches[0].pageY));
        else if (1 !== a.which) return;
        var d, e, g, l, p;
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
        p = b72.setTimeout(c, 15);
        b6Y(window).on("mouseup.dragdrop touchend.dragdrop", function (a) {
          if ("touchend" === a.type || 1 === a.which || a.isTrigger)
            (b.stop().animate({ opacity: 1 }, 500),
              b72.clearTimeout(p),
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
        k = a.data("down"),
        q = a.data("text"),
        n = null,
        v = null;
      q && m.getMessage(q, "") && a.text(m.getMessage(q, ""));
      b &&
        h.loadFile(m.INTERFACE_PATH + b, function (b) {
          n = b;
          a.css("backgroundImage", "url(" + n + ")");
        });
      e &&
        h.loadFile(m.INTERFACE_PATH + e, function (b) {
          v = b;
          a.mouseover(function () {
            this.style.backgroundImage = "url(" + v + ")";
          });
          a.mouseout(function () {
            this.style.backgroundImage = "url(" + n + ")";
          });
        });
      k &&
        (h.loadFile(m.INTERFACE_PATH + k, function (b) {
          a.mousedown(function (a) {
            this.style.backgroundImage = "url(" + b + ")";
            a.stopImmediatePropagation();
          });
          a.mouseup(function () {
            this.style.backgroundImage = "url(" + (v || n) + ")";
          });
        }),
        e ||
          a.mouseout(function () {
            this.style.backgroundImage = "url(" + n + ")";
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
