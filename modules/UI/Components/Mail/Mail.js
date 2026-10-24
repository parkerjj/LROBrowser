define(
  "UI/Components/Mail/Mail",
  "require Network/NetworkManager Network/PacketStructure DB/DBManager DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/ChatBox/ChatBox UI/Components/MailInfo/MailInfo UI/Components/Inventory/Inventory text!./Mail.html text!./Mail.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b, c, d, e;
      C.ui.find(".inbox .currentpage").html(z);
      C.ui.find(".inbox .totaltpage").html(J);
      C.ui.find(".inbox .content ul").empty();
      for (var f = 7 * a - 7; f < 7 * a; f++)
        C.list[f] &&
          ((b = new Date(1e3 * C.list[f].DeleteTime)),
          b.getFullYear(),
          (c =
            (10 > b.getMonth() + 1
              ? "0" + (b.getMonth() + 1)
              : b.getMonth() + 1) + "\u6708 "),
          (d = b.getDate() + "\u65e5 "),
          (e = b.getHours() + "\u65f6"),
          b.getMinutes(),
          b.getSeconds(),
          C.ui
            .find(".inbox .content ul")
            .append(
              '\x3cli data-MailID\x3d"' +
                C.list[f].MailID +
                '" class\x3d"' +
                (0 == C.list[f].isOpen ? "new" : "") +
                '"\x3e\x3cdiv class\x3d"head"\x3e\x3ch1\x3e' +
                C.list[f].FromName +
                "\x3c/h1\x3e\x3cp\x3e" +
                c +
                d +
                e +
                '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cp\x3e' +
                C.list[f].HEADER +
                "\x3c/p\x3e\x3c/div\x3e\x3c/li\x3e",
            ));
      l.loadFile(
        q.INTERFACE_PATH + "basic_interface/envelop.bmp",
        function (a) {
          C.ui.find(".new").css("backgroundImage", "url(" + a + ")");
        },
      );
    }
    function c() {
      1 < z && (--z, b(z));
    }
    function d() {
      z < J && ((z += 1), b(z));
    }
    function e() {
      event.stopImmediatePropagation();
      t(this).hasClass("new") &&
        t(this).css("background-image", "").removeClass("new");
      var a = new g.CZ.MAIL_OPEN();
      a.MailID = t(this).attr("data-mailid");
      k.sendPacket(a);
    }
    function m() {
      if (
        "" == t(".Mailbox .head .name input").val() ||
        "" == t(".Mailbox .head .title input").val() ||
        "" == t(".Mailbox .center textarea").val()
      )
        D.addText("\u4e0d\u80fd\u7559\u7a7a", D.TYPE.ERROR);
      else {
        var a = new g.CZ.MAIL_SEND();
        a.ReceiveName = C.ui.find(".Mailbox .head .name input").val();
        a.Header = C.ui.find(".Mailbox .head .title input").val();
        a.msg_len = C.ui.find(".Mailbox .center textarea").val().length;
        a.msg = C.ui.find(".Mailbox .center textarea").val();
        k.sendPacket(a);
      }
    }
    function h(a) {
      a = parseInt(this.getAttribute("data-index"), 10);
      a = B.getItemByIndex(a);
      if (!a) return !1;
      A.remove();
      A.append();
      A.uid = a.ITID;
      A.item_ = a;
      A.setItem(a, "Mail");
      return !1;
    }
    function r(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (M) {}
      c &&
        "item" === c.type &&
        ((b = c.data),
        1 < b.count
          ? (u.append(),
            u.setType("number", !1, b.count),
            (u.onSubmitRequest = function (a) {
              u.remove();
              var c = new g.CZ.MAIL_ADD_ITEM();
              c.index = b.index;
              c.count = a || 1;
              k.sendPacket(c);
              B.mailItem(b.index, a);
            }))
          : ((c = new g.CZ.MAIL_ADD_ITEM()),
            (c.index = b.index),
            (c.count = 1),
            k.sendPacket(c),
            B.mailItem(b.index, 1)));
      a.stopImmediatePropagation();
      return !1;
    }
    var q = a("DB/DBManager"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure");
    a("DB/Items/ItemType");
    var t = a("Utils/jquery"),
      l = a("Core/Client"),
      f = a("Core/Preferences"),
      n = a("Renderer/Renderer");
    a("Controls/MouseEventHandler");
    var p = a("UI/UIManager"),
      v = a("UI/UIComponent"),
      u = a("UI/Components/InputBox/InputBox"),
      A = a("UI/Components/ItemInfo/ItemInfo"),
      D = a("UI/Components/ChatBox/ChatBox");
    a("UI/Components/MailInfo/MailInfo");
    var B = a("UI/Components/Inventory/Inventory"),
      O = a("text!./Mail.html");
    a = a("text!./Mail.css");
    var C = new v("Mail", O, a);
    C.TAB = { Inbox: 0, Mailbox: 1 };
    C.list = [];
    var y = f.get(
        "Mail",
        {
          x: 200,
          y: 300,
          width: 6,
          height: 9,
          show: !0,
          reduce: !1,
          tab: C.TAB.Inbox,
        },
        1.1,
      ),
      z = 1,
      J;
    C.init = function () {
      this.ui.find(".tabs button").on("click", function () {
        C.SwitchTab(t(this).index());
        event.stopImmediatePropagation();
      });
      this.ui.find(".titlebar .close").on("click", function () {
        C.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".Mailbox").on("click", ".send", m);
      this.ui.find(".Mailbox .cancel").on("click", function () {
        C.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".item").on("contextmenu", ".item", h);
      this.ui.find(".inbox").on("click", "li", e);
      this.ui.find(".inbox").on("click", ".lastpage", c);
      this.ui.find(".inbox").on("click", ".nextpage", d);
      this.ui.find(".Mailbox").on("drop", r);
      y.tab = 0;
      this.draggable(this.ui.find(".titlebar"));
    };
    C.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, y.y), 0.5 * (n.height - this.ui.height())),
        left: Math.min(Math.max(0, y.x), 0.5 * (n.width - this.ui.width())),
      });
      this.SwitchTab(0);
    };
    C.onRemove = function () {
      this.ui.find(".Mailbox .head input,.Mailbox .center textarea").empty();
      C.ui.find(".Mailbox .zeny span input").val("0");
      this.ui.find(".Mailbox .bottom .item").remove();
      C.ui.find(".inbox .content ul").empty();
      t(".ItemInfo").remove();
      this.list.length = 0;
      J = z = 1;
    };
    C.setList = function (a) {
      for (var c = (this.list.length = 0); c < a.mailList.length; c++)
        this.list.push(a.mailList[c]);
      J = Math.ceil(C.list.length / 7);
      b(z);
    };
    C.addItem = function (a, b) {
      this.ui.find(".Mailbox .item").remove();
      this.ui.find(".Mailbox .bottom").append(
        t("#Inventory")
          .find('.item[data-index\x3d"' + a + '"]')
          .clone(),
      );
      this.ui.find(".Mailbox .bottom .item .count").html(b);
    };
    C.SwitchTab = function (a) {
      y.tab = parseInt(a, 10);
      0 == a &&
        (C.ui.find(".Mailbox .head input,.Mailbox .center textarea").val(""),
        C.ui.find(".Mailbox .zeny span input").val("0"),
        C.ui.find(".Mailbox .bottom .item").remove());
      l.loadFile(
        q.INTERFACE_PATH + "basic_interface/maillist" + (a + 1) + "_bg.bmp",
        function (b) {
          t("#Mail .tabs button.sd").removeClass("sd");
          t("#Mail .tabs button").eq(a).addClass("sd");
          C.ui.css("background-image", "url(" + b + ")");
          t("#Mail .container").hide().eq(a).show();
        },
      );
    };
    return p.addComponent(C);
  },
);
