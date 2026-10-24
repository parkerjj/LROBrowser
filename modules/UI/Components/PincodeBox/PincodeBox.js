define(
  "UI/Components/PincodeBox/PincodeBox",
  "require Utils/jquery Renderer/Renderer Controls/KeyEventHandler DB/DBManager UI/UIManager UI/UIComponent text!./PincodeBox.html text!./PincodeBox.css".split(
    " ",
  ),
  function (a) {
    function b() {
      for (var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], b = 0; 2 > b; b++)
        for (var c = 0; 10 > c; c++) {
          var d = Math.floor(10 * Math.random()),
            f = a[c];
          a[c] = a[d];
          a[d] = f;
        }
      b = k.ui.find(".s");
      for (c = 0; c < b.length; c++) e(b[c]).text(a[c]);
    }
    function c() {
      var a, b;
      if (0 == k.step) {
        a = d(g, t);
        if (4 > a.length) return !1;
        if (!this.isPersistent || a.length) this.onSubmitRequest(a);
      } else if (1 == k.step) {
        a = d(g, l);
        if (4 > a.length) return !1;
        if (!this.isPersistent || a.length) this.onSubmitRequest(a);
      } else if (2 == k.step) {
        a = d(g, l);
        b = d(g, f);
        if (4 > a.length || 4 > b.length) return !1;
        if (!this.isPersistent || (a.length && b.length))
          this.onSubmitRequest(a, b);
      }
      event.stopImmediatePropagation();
      return !1;
    }
    function d(a, b) {
      if (null == b) return 0;
      for (var c = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], d = 1; 10 > d; d++) {
        var e;
        a = 8 + 3 * a;
        e = a % (d + 1);
        d != e && ((c[d] ^= c[e]), (c[e] ^= c[d]), (c[d] ^= c[e]));
      }
      a = b.toString().split("");
      b = "";
      for (d = 0; d < a.length; d++)
        for (e = 0; e < c.length; e++) a[d] == c[e] && (b += e);
      return b;
    }
    var e = a("Utils/jquery");
    a("Renderer/Renderer");
    var m = a("Controls/KeyEventHandler");
    a("DB/DBManager");
    var h = a("UI/UIManager"),
      r = a("UI/UIComponent"),
      q = a("text!./PincodeBox.html");
    a = a("text!./PincodeBox.css");
    var k = new r("PincodeBox", q, a);
    k.needFocus = !1;
    var g = null,
      t = -1,
      l = -1,
      f = -1,
      n = 3;
    k.step = 0;
    k.init = function () {
      this.ui.css("zIndex", 100);
      this.ui.find(".border").on("click", "#bo", c.bind(this));
      this.ui.find(".border").on("click", "#cancel", function () {
        k.onCancelRequest();
      });
      this.ui.find(".btns button.s").on("click", function () {
        var a = k.ui.find(".head").text();
        3 < a.toString().split("").length ||
          ((a += e(this).text()),
          k.ui.find(".head").text(a),
          0 == k.step
            ? (t = a)
            : 1 == k.step
              ? (l = a)
              : 2 == k.step && (f = a),
          b());
      });
      this.ui.find(".btns button#sb").on("click", function () {
        k.ui.find(".head").empty();
        0 == k.step
          ? (t = null)
          : 1 == k.step
            ? (l = null)
            : 2 == k.step && (f = null);
        b();
      });
      this.ui.find(".btns button#sa").on("click", function () {
        b();
      });
      this.ui.find(".changeCode").on("click", function () {
        k.remove();
        k.step = 1;
        k.append();
        k.setType(3);
      });
    };
    k.onAppend = function () {};
    k.onRemove = function () {
      k.ui.find(".head").empty();
      t = 0;
    };
    k.onKeyDown = function (a) {
      return this.isPersistent || a.which !== m.ENTER
        ? !0
        : (c.call(this), a.stopImmediatePropagation(), !1);
    };
    k.setData = function (a) {
      g = a;
    };
    k.setType = function (a) {
      b();
      switch (a) {
        case 1:
          this.ui.find(".text").text("4\u4f4dPIN\u7801");
          break;
        case 2:
          this.ui.find(".text").text("\u521b\u5efa\u65b0PIN\u7801");
          break;
        case 3:
          1 == k.step
            ? this.ui.find(".text").text("\u65e74\u4f4dPIN\u7801")
            : 2 == k.step &&
              this.ui.find(".text").text("\u65b04\u4f4dPIN\u7801");
          break;
        case 4:
          this.ui.find(".text").text("\u521b\u5efa\u65b0PIN\u7801");
      }
    };
    k.CheckTry = function () {
      --n;
      return 0 >= n ? (this.onCancelRequest(), (n = 3), !1) : !0;
    };
    k.onSubmitRequest = function () {};
    k.onCancelRequest = function () {};
    return h.addComponent(k);
  },
);
