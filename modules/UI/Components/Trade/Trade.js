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
      a in F
        ? J.addText(u.getMessage(51), J.TYPE.ERROR)
        : 10 < O.length
          ? J.addText(u.getMessage(297), J.TYPE.ERROR)
          : ((F[a] = b), B.reqAddItem(a, b));
    }
    function d(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function e() {
      this.remove();
      B.onCancel();
    }
    function m() {
      var a = parseInt(B.ui.find(".zeny.send").val(), 10) || 0,
        a = Math.min(Math.max(0, a), n.zeny);
      c(0, a);
      B.onConclude();
    }
    function h() {
      B.onTradeSubmit();
      this.ui.find(".trade.enabled").hide();
      this.ui.find(".trade.disabled").show();
    }
    function q(a) {
      var b, d;
      try {
        d = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (D) {}
      a.stopImmediatePropagation();
      if (!d || "item" !== d.type || "Inventory" !== d.from) return !1;
      b = d.data;
      if (1 < b.count)
        return (
          z.append(),
          z.setType("number", !1, b.count),
          (z.onSubmitRequest = function (a) {
            a = parseInt(a, 10) || 0;
            a = Math.min(Math.max(a, 0), b.count);
            z.remove();
            a && c(b.index, a);
          }),
          !1
        );
      c(b.index, 1);
      return !1;
    }
    function r() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      if ((a = this.parentNode.className.match(/send/i) ? O[a] : M[a])) {
        var b = l(this),
          c = b.parent().position(),
          d = B.ui.find(".overlay");
        c.left += b.position().left;
        c.top += b.position().top;
        d.show();
        d.css({ top: c.top + 5, left: c.left + 30 });
        d.text(u.getItemName(a));
        a.IsIdentified ? d.removeClass("grey") : d.addClass("grey");
      }
    }
    function k() {
      B.ui.find(".overlay").hide();
    }
    function g(a) {
      var b = parseInt(this.getAttribute("data-index"), 10),
        b = this.parentNode.className.match(/send/i) ? O[b] : M[b];
      if (!b) return d(a);
      if (E.uid === b.ITID) return (E.remove(), !1);
      E.append();
      E.uid = b.ITID;
      E.setItem(b);
      return d(a);
    }
    var u = a("DB/DBManager"),
      l = a("Utils/jquery"),
      f = a("Core/Client"),
      n = a("Engine/SessionStorage"),
      p = a("Renderer/Renderer"),
      v = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      z = a("UI/Components/InputBox/InputBox"),
      E = a("UI/Components/ItemInfo/ItemInfo"),
      C = a("UI/Components/Inventory/Inventory"),
      J = a("UI/Components/ChatBox/ChatBox"),
      A = a("text!./Trade.html");
    a = a("text!./Trade.css");
    var B = new t("Trade", A, a),
      F = {},
      O = [],
      M = [];
    B.title = "";
    B.init = function () {
      this.ui.find(".ok.enabled").click(m);
      this.ui.find(".trade.enabled").click(h.bind(this));
      this.ui.find(".cancel").click(e.bind(this));
      this.ui.on("mousedown", ".disabled", d).on("drop", q).on("dragover", d);
      this.ui.find(".zeny.send").mousedown(function () {
        this.select();
      });
      this.ui
        .find(".box")
        .on("mouseover", ".item", r)
        .on("mouseout", ".item", k)
        .on("contextmenu", ".item", g);
      this.draggable(this.ui.find(".titlebar"));
    };
    B.onAppend = function () {
      this.onRemove();
      this.ui.find(".titlebar .title").text(this.title);
      this.ui.css({
        top: (p.height - this.ui.height()) / 2,
        left: (p.width - this.ui.width()) / 2,
      });
    };
    B.onRemove = function () {
      F = {};
      M.length = 0;
      O.length = 0;
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
    B.addItemFromInventory = function (a, c) {
      if (c)
        if (0 === a) 0 < F[a] && this.ui.find(".zeny.send").val(b(F[a]));
        else {
          c = l.extend({}, C.removeItem(a, F[a]));
          var d = u.getItemInfo(c.ITID),
            e = O.push(c) - 1,
            g = this.ui.find(".box.send");
          c.count = F[a];
          g.append(
            '\x3cdiv class\x3d"item" data-index\x3d"' +
              e +
              '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
              (F[a] || 1) +
              '\x3c/span\x3e\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
              l.escape(u.getItemName(c)) +
              "\x3c/span\x3e\x3c/div\x3e",
          );
          f.loadFile(
            u.INTERFACE_PATH +
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
      else delete F[a];
    };
    B.addItem = function (a) {
      if (0 === a.ITID) this.ui.find(".zeny.recv").text(b(a.count));
      else {
        var c = u.getItemInfo(a.ITID),
          d = M.push(a) - 1,
          e = this.ui.find(".box.recv");
        e.append(
          '\x3cdiv class\x3d"item" data-index\x3d"' +
            d +
            '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e' +
            a.count +
            '\x3c/div\x3e\x3cspan class\x3d"name"\x3e' +
            l.escape(u.getItemName(a)) +
            "\x3c/span\x3e\x3c/div\x3e",
        );
        f.loadFile(
          u.INTERFACE_PATH +
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
    B.conclude = function (a) {
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
    B.onConclude = function () {};
    B.onTradeSubmit = function () {};
    B.reqAddItem = function () {};
    B.onCancel = function () {};
    return v.addComponent(B);
  },
);
