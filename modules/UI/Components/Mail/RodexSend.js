define(
  "UI/Components/Mail/RodexSend",
  "require DB/DBManager Utils/jquery Preferences/Controls Core/Client Network/NetworkManager Network/PacketStructure Engine/SessionStorage UI/UIManager UI/UIComponent UI/Components/MiniMap/MiniMap UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox UI/Components/Inventory/Inventory text!./RodexSend.html text!./RodexSend.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = parseInt(this.getAttribute("data-index"), 10);
      if ((a = y.getItemByIndex(a))) {
        var b = t(this).position(),
          c = y.ui.find(".overlay");
        c.show();
        c.css({ top: b.top - 22, left: b.left });
        c.text(k.getItemName(a));
        a.IsIdentified ? c.removeClass("grey") : c.addClass("grey");
      }
    }
    function c() {
      y.ui.find(".overlay").hide();
    }
    function d(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (E) {}
      ("item" == c.type) & ("Inventory" == c.from) &&
        ((b = c.data),
        1 < b.count
          ? (B.append(),
            B.setType("number", !1, b.count),
            (B.onSubmitRequest = function (a) {
              B.remove();
              var c = new n.CZ.REQ_ADD_ITEM_TO_MAIL();
              c.index = b.index;
              c.count = a || 1;
              f.sendPacket(c);
              O.mailItem(b.index, a);
            }))
          : ((c = new n.CZ.REQ_ADD_ITEM_TO_MAIL()),
            (c.index = b.index),
            (c.count = 1),
            f.sendPacket(c),
            O.mailItem(b.index, 1)));
      a.stopImmediatePropagation();
      return !1;
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function m(a) {
      var b = parseInt(this.getAttribute("data-index"), 10);
      if ((b = y.getItemByIndex(b))) {
        var d = new Image(),
          e = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
        d.src = e.replace(/^\"/, "").replace(/\"$/, "");
        a.originalEvent.dataTransfer.setDragImage(d, 12, 12);
        a.originalEvent.dataTransfer.setData(
          "Text",
          JSON.stringify(
            (window._OBJ_DRAG_ = { type: "item", from: "RodexSend", data: b }),
          ),
        );
        c();
      }
    }
    function h() {
      delete window._OBJ_DRAG_;
    }
    function r(a) {
      for (var b = 0, c = 0; c < a.length; c++)
        b = null != a.charAt(c).match(/[^\x00-\xff]/gi) ? b + 2 : b + 1;
      return b;
    }
    function q(a) {
      a = parseInt(this.getAttribute("data-itid"), 10);
      for (var b, c = 0; c < z.length; c++) z[c].ITID == a && (b = z[c]);
      b &&
        (D.uid != b.ITID
          ? (D.append(),
            (D.uid = b.ITID),
            (D.item_ = b),
            (D.type = "RodexSend"),
            D.setItem(b))
          : D.remove());
    }
    var k = a("DB/DBManager"),
      g = a("Core/Client"),
      t = a("Utils/jquery"),
      l = a("Preferences/Controls"),
      f = a("Network/NetworkManager"),
      n = a("Network/PacketStructure"),
      p = a("Engine/SessionStorage"),
      v = a("UI/UIManager"),
      u = a("UI/UIComponent"),
      A = a("UI/Components/MiniMap/MiniMap"),
      D = a("UI/Components/ItemInfo/ItemInfo"),
      B = a("UI/Components/InputBox/InputBox"),
      O = a("UI/Components/Inventory/Inventory"),
      C = a("text!./RodexSend.html");
    a = a("text!./RodexSend.css");
    var y = new u("RodexSend", C, a),
      z = [],
      J = 0,
      I = 0;
    y.init = function () {
      this.ui
        .on("drop", d)
        .on("dragover", e)
        .find(".itemBar")
        .on("mouseover", ".item", b)
        .on("mouseout", ".item", c)
        .on("contextmenu", ".item", q)
        .on("dragstart", ".item", m)
        .on("dragend", ".item", h);
      this.ui.find(".titlebar .close").on("click", function () {
        y.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".checkBtn").on("click", function () {
        if (y.ui.find(".name").val()) {
          var a = y.ui.find(".name").val();
          v.showPromptBox(
            "\u786e\u5b9a\u540d\u5b57\u662f" + a + "\u5417\uff1f",
            "ok",
            "cancel",
            function () {
              var b = new n.CZ.CHECK_RECEIVE_CHARACTER_NAME();
              b.name = a;
              f.sendPacket(b);
            },
            null,
          );
        } else
          v.showMessageBox(
            "\u8bf7\u8f93\u5165\u6536\u4ef6\u4eba\u59d3\u540d",
            "ok",
            null,
          );
        event.stopImmediatePropagation();
      });
      this.ui.find(".sendBtn").on("click", function () {
        if (!y.ui.find(".checkName").text())
          return (
            v.showMessageBox(
              "\u8bf7\u68c0\u67e5\u6536\u4ef6\u4eba\u59d3\u540d",
              "ok",
              null,
            ),
            !1
          );
        if (!y.ui.find(".title").val())
          return (
            v.showMessageBox(
              "\u6807\u9898\u5fc5\u987b\u4e3a4\u4e2a\u5b57\u4ee5\u4e0a16\u4e2a\u5b57\u4ee5\u4e0b",
              "ok",
              null,
            ),
            !1
          );
        v.showPromptBox(
          "\u786e\u5b9a\u53d1\u9001\u8be5\u90ae\u4ef6\uff1f",
          "ok",
          "cancel",
          function () {
            for (var a = 0; a < z.length; a++) O.addItem(z[a]);
            a = new n.CZ.REQ_WRITE_MAIL2();
            a.ReceiveName = y.ui.find(".checkName").text();
            a.ToName = p.Character.name;
            a.Zeny = y.ui.find(".turnZeny").val() | 0;
            a.HeaderSize = r(y.ui.find(".title").val()) + 1;
            a.BodySize = r(y.ui.find(".main textarea").val()) + 1;
            a.CharId = 0;
            a.Header = y.ui.find(".title").val() + " ";
            a.msg = y.ui.find(".main textarea").val() + " ";
            f.sendPacket(a);
          },
          null,
        );
      });
      this.ui.find(".turnZeny").on("blur", function () {
        J = 0.02 * t(this).val();
        y.ui.find(".tax").text(J + I);
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    y.getItemByIndex = function (a) {
      var b, c;
      b = 0;
      for (c = z.length; b < c; ++b) if (z[b].index === a) return z[b];
      return null;
    };
    y.clearList = function () {
      z = [];
    };
    y.onAppend = function () {
      A.clearWalk();
      var a = p.zeny.toString().split(""),
        b,
        c = a.length,
        d = "";
      for (b = 0; b < c; b++)
        d = a[c - b - 1] + (b && 0 === b % 3 ? "," : "") + d;
      y.ui.find(".zeny").text(d);
      y.ui.find(".tax").text("0");
      l.writemail = !0;
    };
    y.onRemove = function () {
      I = J = 0;
      y.ui.find(".checkBtn").show();
      y.ui.find(".checkok").hide();
      y.ui.find(".checkName").text("").hide();
      y.ui.find(".name").val("").show();
      y.ui.find(".title").val("");
      y.ui.find("textarea").val("");
      y.ui.find(".zeny").text("0");
      y.ui.find(".turnZeny").val("0");
      y.ui.find(".itemBar").empty();
      if (0 < z.length)
        for (var a = 0; a < z.length; a++)
          y.reqRemoveItem(z[a].index, z[a].count);
      y.ui.find(".currentWeight").text("0");
      a = new n.CZ.REQ_CANCEL_WRITE_MAIL();
      f.sendPacket(a);
      l.writemail = !1;
    };
    y.checkName = function (a) {
      0 < a.GID
        ? (y.ui.find(".checkBtn").hide(),
          y.ui.find(".checkok").show(),
          y.ui.find(".checkName").text(y.ui.find(".name").val()).show(),
          y.ui.find(".name").hide(),
          (a = new n.CZ.REQ_OPEN_WRITE_MAIL()),
          (a.ReceiveName = y.ui.find(".name").val()),
          f.sendPacket(a))
        : v.showMessageBox(
            "\u8bf7\u68c0\u67e5\u6536\u4ef6\u4eba\u59d3\u540d\u662f\u5426\u6709\u8bef",
            "ok",
            null,
          );
    };
    y.mailReply = function (a) {
      a.success && y.append();
      a.receiver &&
        (y.ui.find(".name").hide(),
        y.ui.find(".checkBtn").hide(),
        y.ui.find(".checkok").show(),
        y.ui.find(".checkName").text(a.receiver).show());
    };
    y.addItem = function (a) {
      for (var b = 0, c = 0; c < z.length; c++)
        z[c].ITID == a.ITID &&
          4 != z[c].type &&
          5 != z[c].type &&
          8 != z[c].type &&
          ((z[c].count += a.count), (b = 1));
      0 == b &&
        ((c = {}),
        (c.ITID = a.ITID),
        (c.index = a.index),
        (c.IsDamaged = a.IsDamaged),
        (c.IsIdentified = a.IsIdentified),
        (c.RefiningLevel = a.RefiningLevel),
        (c.options = a.options),
        (c.count = a.count),
        (c.slot = a.slot),
        (c.type = a.type),
        z.push(c));
      if (1 == b)
        return (
          (b = y.ui.find(".item[data-ITID\x3d" + a.ITID + "] .count")),
          b.text(parseInt(b.text()) + a.count),
          !1
        );
      y.addItemSub(a);
      I = 2500 * z.length;
      y.ui.find(".tax").text(J + I);
    };
    y.addItemSub = function (a) {
      var b = k.getItemInfo(a.ITID),
        c = this.ui.find(".itemBar"),
        d = a.ITID;
      c.append(
        '\x3cdiv class\x3d"item" data-itid\x3d"' +
          d +
          '" data-IsIdentified\x3d"' +
          a.IsIdentified +
          '" data-type\x3d"' +
          a.type +
          '" data-count\x3d"' +
          a.count +
          '" data-index\x3d"' +
          a.index +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
          (a.count || 1) +
          "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
      );
      g.loadFile(
        k.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? b.identifiedResourceName
            : b.unidentifiedResourceName) +
          ".bmp",
        function (a) {
          c.find('.item[data-itid\x3d"' + d + '"] .icon').css(
            "backgroundImage",
            "url(" + a + ")",
          );
        },
      );
    };
    y.reqRemoveItem = function (a, b) {
      if (!(0 >= b)) {
        var c = new n.CZ.REQ_REMOVE_ITEM_MAIL();
        c.index = a;
        c.count = b;
        f.sendPacket(c);
      }
    };
    y.removeItem = function (a) {
      for (var b = this.ui.find(".itemBar"), c = 0; c < z.length; c++)
        if (z[c].index == a.index)
          if (z[c].count == a.count)
            (O.addItem(z[c]),
              z.splice(c, 1),
              b.find('.item[data-index\x3d"' + a.index + '"]').remove());
          else {
            var d = z[c].count - a.count;
            z[c].count = a.count;
            O.addItem(z[c]);
            z[c].count = d;
            b.find('.item[data-index\x3d"' + a.index + '"] .count').text(d);
          }
      D.ui && D.ui.is(":visible") && D.remove();
      I = 2500 * z.length;
      y.ui.find(".tax").text(J + I);
    };
    return v.addComponent(y);
  },
);
