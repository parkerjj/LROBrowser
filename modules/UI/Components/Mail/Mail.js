define(
  "UI/Components/Mail/Mail",
  "require Network/NetworkManager Network/PacketStructure DB/DBManager DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/ChatBox/ChatBox UI/Components/MailInfo/MailInfo UI/Components/Inventory/Inventory text!./Mail.html text!./Mail.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b, c, d, e;
      A.ui.find(".inbox .currentpage").html(F);
      A.ui.find(".inbox .totaltpage").html(O);
      A.ui.find(".inbox .content ul").empty();
      for (var f = 7 * a - 7; f < 7 * a; f++)
        A.list[f] &&
          ((b = new Date(1e3 * A.list[f].DeleteTime)),
          b.getFullYear(),
          (c =
            (10 > b.getMonth() + 1
              ? "0" + (b.getMonth() + 1)
              : b.getMonth() + 1) + "\u6708 "),
          (d = b.getDate() + "\u65e5 "),
          (e = b.getHours() + "\u65f6"),
          b.getMinutes(),
          b.getSeconds(),
          A.ui
            .find(".inbox .content ul")
            .append(
              '\x3cli data-MailID\x3d"' +
                A.list[f].MailID +
                '" class\x3d"' +
                (0 == A.list[f].isOpen ? "new" : "") +
                '"\x3e\x3cdiv class\x3d"head"\x3e\x3ch1\x3e' +
                A.list[f].FromName +
                "\x3c/h1\x3e\x3cp\x3e" +
                c +
                d +
                e +
                '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cp\x3e' +
                A.list[f].HEADER +
                "\x3c/p\x3e\x3c/div\x3e\x3c/li\x3e",
            ));
      l.loadFile(
        r.INTERFACE_PATH + "basic_interface/envelop.bmp",
        function (a) {
          A.ui.find(".new").css("backgroundImage", "url(" + a + ")");
        },
      );
    }
    function c() {
      1 < F && (--F, b(F));
    }
    function d() {
      F < O && ((F += 1), b(F));
    }
    function e() {
      event.stopImmediatePropagation();
      u(this).hasClass("new") &&
        u(this).css("background-image", "").removeClass("new");
      var a = new g.CZ.MAIL_OPEN();
      a.MailID = u(this).attr("data-mailid");
      k.sendPacket(a);
    }
    function m() {
      if (
        "" == u(".Mailbox .head .name input").val() ||
        "" == u(".Mailbox .head .title input").val() ||
        "" == u(".Mailbox .center textarea").val()
      )
        E.addText("\u4e0d\u80fd\u7559\u7a7a", E.TYPE.ERROR);
      else {
        var a = new g.CZ.MAIL_SEND();
        a.ReceiveName = A.ui.find(".Mailbox .head .name input").val();
        a.Header = A.ui.find(".Mailbox .head .title input").val();
        a.msg_len = A.ui.find(".Mailbox .center textarea").val().length;
        a.msg = A.ui.find(".Mailbox .center textarea").val();
        k.sendPacket(a);
      }
    }
    function h(a) {
      a = parseInt(this.getAttribute("data-index"), 10);
      a = C.getItemByIndex(a);
      if (!a) return !1;
      z.remove();
      z.append();
      z.uid = a.ITID;
      z.item_ = a;
      z.setItem(a, "Mail");
      return !1;
    }
    function q(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (I) {}
      c &&
        "item" === c.type &&
        ((b = c.data),
        1 < b.count
          ? (t.append(),
            t.setType("number", !1, b.count),
            (t.onSubmitRequest = function (a) {
              t.remove();
              var c = new g.CZ.MAIL_ADD_ITEM();
              c.index = b.index;
              c.count = a || 1;
              k.sendPacket(c);
              C.mailItem(b.index, a);
            }))
          : ((c = new g.CZ.MAIL_ADD_ITEM()),
            (c.index = b.index),
            (c.count = 1),
            k.sendPacket(c),
            C.mailItem(b.index, 1)));
      a.stopImmediatePropagation();
      return !1;
    }
    var r = a("DB/DBManager"),
      k = a("Network/NetworkManager"),
      g = a("Network/PacketStructure");
    a("DB/Items/ItemType");
    var u = a("Utils/jquery"),
      l = a("Core/Client"),
      f = a("Core/Preferences"),
      n = a("Renderer/Renderer");
    a("Controls/MouseEventHandler");
    var p = a("UI/UIManager"),
      v = a("UI/UIComponent"),
      t = a("UI/Components/InputBox/InputBox"),
      z = a("UI/Components/ItemInfo/ItemInfo"),
      E = a("UI/Components/ChatBox/ChatBox");
    a("UI/Components/MailInfo/MailInfo");
    var C = a("UI/Components/Inventory/Inventory"),
      J = a("text!./Mail.html");
    a = a("text!./Mail.css");
    var A = new v("Mail", J, a);
    A.TAB = { Inbox: 0, Mailbox: 1 };
    A.list = [];
    var B = f.get(
        "Mail",
        {
          x: 200,
          y: 300,
          width: 6,
          height: 9,
          show: !0,
          reduce: !1,
          tab: A.TAB.Inbox,
        },
        1.1,
      ),
      F = 1,
      O;
    A.init = function () {
      this.ui.find(".tabs button").on("click", function () {
        A.SwitchTab(u(this).index());
        event.stopImmediatePropagation();
      });
      this.ui.find(".titlebar .close").on("click", function () {
        A.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".Mailbox").on("click", ".send", m);
      this.ui.find(".Mailbox .cancel").on("click", function () {
        A.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".item").on("contextmenu", ".item", h);
      this.ui.find(".inbox").on("click", "li", e);
      this.ui.find(".inbox").on("click", ".lastpage", c);
      this.ui.find(".inbox").on("click", ".nextpage", d);
      this.ui.find(".Mailbox").on("drop", q);
      B.tab = 0;
      this.draggable(this.ui.find(".titlebar"));
    };
    A.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, B.y), 0.5 * (n.height - this.ui.height())),
        left: Math.min(Math.max(0, B.x), 0.5 * (n.width - this.ui.width())),
      });
      this.SwitchTab(0);
    };
    A.onRemove = function () {
      this.ui.find(".Mailbox .head input,.Mailbox .center textarea").empty();
      A.ui.find(".Mailbox .zeny span input").val("0");
      this.ui.find(".Mailbox .bottom .item").remove();
      A.ui.find(".inbox .content ul").empty();
      u(".ItemInfo").remove();
      this.list.length = 0;
      O = F = 1;
    };
    A.setList = function (a) {
      for (var c = (this.list.length = 0); c < a.mailList.length; c++)
        this.list.push(a.mailList[c]);
      O = Math.ceil(A.list.length / 7);
      b(F);
    };
    A.addItem = function (a, b) {
      this.ui.find(".Mailbox .item").remove();
      this.ui.find(".Mailbox .bottom").append(
        u("#Inventory")
          .find('.item[data-index\x3d"' + a + '"]')
          .clone(),
      );
      this.ui.find(".Mailbox .bottom .item .count").html(b);
    };
    A.SwitchTab = function (a) {
      B.tab = parseInt(a, 10);
      0 == a &&
        (A.ui.find(".Mailbox .head input,.Mailbox .center textarea").val(""),
        A.ui.find(".Mailbox .zeny span input").val("0"),
        A.ui.find(".Mailbox .bottom .item").remove());
      l.loadFile(
        r.INTERFACE_PATH + "basic_interface/maillist" + (a + 1) + "_bg.bmp",
        function (b) {
          u("#Mail .tabs button.sd").removeClass("sd");
          u("#Mail .tabs button").eq(a).addClass("sd");
          A.ui.css("background-image", "url(" + b + ")");
          u("#Mail .container").hide().eq(a).show();
        },
      );
    };
    return p.addComponent(A);
  },
);
