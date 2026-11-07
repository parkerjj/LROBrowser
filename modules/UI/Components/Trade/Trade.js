define(
  "UI/Components/Trade/Trade",
  "require DB/DBManager Utils/jquery Core/Client Engine/SessionStorage Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/Inventory/Inventory UI/Components/ChatBox/ChatBox text!./Trade.html text!./Trade.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a = String(a);
      for (var b = 0, c = a.length, d = ""; b < c;)
        ((d = a[c - b - 1] + d),
          0 === (b + 1) % 3 && b + 1 !== c && (d = "," + d),
          ++b);
      return d;
    }
    function c(a, b) {
      a in z
        ? O.addText(t.getMessage(51), O.TYPE.ERROR)
        : 10 < J.length
          ? O.addText(t.getMessage(297), O.TYPE.ERROR)
          : ((z[a] = b), y.reqAddItem(a, b));
    }
    function d(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function e() {
      this.remove();
      y.onCancel();
    }
    function m() {
      var a = parseInt(y.ui.find(".zeny.send").val(), 10) || 0,
        a = Math.min(Math.max(0, a), n.zeny);
      c(0, a);
      y.onConclude();
    }
    function h() {
      y.onTradeSubmit();
      this.ui.find(".trade.enabled").hide();
      this.ui.find(".trade.disabled").show();
    }
    function r(a) {
      var b, d;
      try {
        d = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (E) {}
      a.stopImmediatePropagation();
      if (!d || "item" !== d.type || "Inventory" !== d.from) return !1;
      b = d.data;
      if (1 < b.count)
        return (
          A.append(),
          A.setType("number", !1, b.count),
          (A.onSubmitRequest = function (a) {
            a = parseInt(a, 10) || 0;
            a = Math.min(Math.max(a, 0), b.count);
            A.remove();
            a && c(b.index, a);
          }),
          !1
        );
      c(b.index, 1);
      return !1;
    }
    function q() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      if ((a = this.parentNode.className.match(/send/i) ? J[a] : I[a])) {
        var b = l(this),
          c = b.parent().position(),
          d = y.ui.find(".overlay");
        c.left += b.position().left;
        c.top += b.position().top;
        d.show();
        d.css({ top: c.top + 5, left: c.left + 30 });
        d.text(t.getItemName(a));
        a.IsIdentified ? d.removeClass("grey") : d.addClass("grey");
      }
    }
    function k() {
      y.ui.find(".overlay").hide();
    }
    function g(a) {
      var b = parseInt(this.getAttribute("data-index"), 10),
        b = this.parentNode.className.match(/send/i) ? J[b] : I[b];
      if (!b) return d(a);
      if (D.uid === b.ITID) return (D.remove(), !1);
      D.append();
      D.uid = b.ITID;
      D.setItem(b);
      return d(a);
    }
    var t = a("DB/DBManager"),
      l = a("Utils/jquery"),
      f = a("Core/Client"),
      n = a("Engine/SessionStorage"),
      p = a("Renderer/Renderer"),
      v = a("UI/UIManager"),
      u = a("UI/UIComponent"),
      A = a("UI/Components/InputBox/InputBox"),
      D = a("UI/Components/ItemInfo/ItemInfo"),
      B = a("UI/Components/Inventory/Inventory"),
      O = a("UI/Components/ChatBox/ChatBox"),
      C = a("text!./Trade.html");
    a = a("text!./Trade.css");
    var y = new u("Trade", C, a),
      z = {},
      J = [],
      I = [];
    y.title = "";
    y.init = function () {
      this.ui.find(".ok.enabled").click(m);
      this.ui.find(".trade.enabled").click(h.bind(this));
      this.ui.find(".cancel").click(e.bind(this));
      this.ui.on("mousedown", ".disabled", d).on("drop", r).on("dragover", d);
      this.ui.find(".zeny.send").mousedown(function () {
        this.select();
      });
      this.ui
        .find(".box")
        .on("mouseover", ".item", q)
        .on("mouseout", ".item", k)
        .on("contextmenu", ".item", g);
      this.draggable(this.ui.find(".titlebar"));
    };
    y.onAppend = function () {
      this.onRemove();
      this.ui.find(".titlebar .title").text(this.title);
      this.ui.css({
        top: (p.height - this.ui.height()) / 2,
        left: (p.width - this.ui.width()) / 2,
      });
    };
    y.onRemove = function () {
      z = {};
      I.length = 0;
      J.length = 0;
      this.ui.find(".overlay").hide();
      this.ui.find(".ok.disabled, .trade.enabled").hide();
      this.ui.find(".ok.enabled, .trade.disabled").show();
      this.ui.find(".box").removeClass("disabled").empty();
      this.ui
        .find(".zeny.send")
        .val(0)
        .removeClass("disabled")
        .attr("disabled", !1);
      this.ui.find(".zeny.recv").text("0");
    };
    y.addItemFromInventory = function (a, c) {
      if (c)
        if (0 === a) 0 < z[a] && this.ui.find(".zeny.send").val(b(z[a]));
        else {
          c = l.extend({}, B.removeItem(a, z[a]));
          var d = t.getItemInfo(c.ITID),
            e = J.push(c) - 1,
            g = this.ui.find(".box.send");
          c.count = z[a];
          g.append(
            '\x3cdiv class\x3d"item" data-index\x3d"' +
              e +
              '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
              (z[a] || 1) +
              '\x3c/span\x3e\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
              l.escape(t.getItemName(c)) +
              "\x3c/span\x3e\x3c/div\x3e",
          );
          f.loadFile(
            t.INTERFACE_PATH +
              "item/" +
              (c.IsIdentified
                ? d.identifiedResourceName
                : d.unidentifiedResourceName) +
              ".bmp",
            function (a) {
              g.find('.item[data-index\x3d"' + e + '"] .icon').css(
                "backgroundImage",
                "url(" + a + ")",
              );
            }.bind(this),
          );
        }
      else delete z[a];
    };
    y.addItem = function (a) {
      if (0 === a.ITID) this.ui.find(".zeny.recv").text(b(a.count));
      else {
        var c = t.getItemInfo(a.ITID),
          d = I.push(a) - 1,
          e = this.ui.find(".box.recv");
        e.append(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            d +
            '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
            a.count +
            '\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
            l.escape(t.getItemName(a)) +
            "\x3c/span\x3e\x3c/div\x3e",
        );
        f.loadFile(
          t.INTERFACE_PATH +
            "item/" +
            (a.IsIdentified
              ? c.identifiedResourceName
              : c.unidentifiedResourceName) +
            ".bmp",
          function (a) {
            e.find('.item[data-index\x3d"' + d + '"] .icon').css(
              "backgroundImage",
              "url(" + a + ")",
            );
          }.bind(this),
        );
      }
    };
    y.conclude = function (a) {
      this.ui.find(".box." + a).addClass("disabled");
      "send" === a &&
        (this.ui.find(".ok.disabled").show(),
        this.ui.find(".ok.enabled").hide(),
        this.ui.find(".zeny.send").addClass("disabled").attr("disabled", !0));
      this.ui.find(".box.recv.disabled").is(":visible") &&
        this.ui.find(".box.send.disabled").is(":visible") &&
        (this.ui.find(".trade.enabled").show(),
        this.ui.find(".trade.disabled").hide());
    };
    y.onConclude = function () {};
    y.onTradeSubmit = function () {};
    y.reqAddItem = function () {};
    y.onCancel = function () {};
    return v.addComponent(y);
  },
);
