define(
  "UI/Components/Mail/Mail",
  "require Network/NetworkManager Network/PacketStructure DB/DBManager DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/ChatBox/ChatBox UI/Components/MailInfo/MailInfo UI/Components/Inventory/Inventory text!./Mail.html text!./Mail.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b, c, d, e;
      D.ui.find(".inbox .currentpage").html(H);
      D.ui.find(".inbox .totaltpage").html(N);
      D.ui.find(".inbox .content ul").empty();
      for (var f = 7 * a - 7; f < 7 * a; f++)
        D.list[f] &&
          ((b = new Date(1e3 * D.list[f].DeleteTime)),
          b.getFullYear(),
          (c =
            (10 > b.getMonth() + 1
              ? "0" + (b.getMonth() + 1)
              : b.getMonth() + 1) + "\u6708 "),
          (d = b.getDate() + "\u65e5 "),
          (e = b.getHours() + "\u65f6"),
          b.getMinutes(),
          b.getSeconds(),
          D.ui
            .find(".inbox .content ul")
            .append(
              '\x3cli data-MailID\x3d"' +
                D.list[f].MailID +
                '" class\x3d"' +
                (0 == D.list[f].isOpen ? "new" : "") +
                '"\x3e\x3cdiv class\x3d"head"\x3e\x3ch1\x3e' +
                D.list[f].FromName +
                "\x3c/h1\x3e\x3cp\x3e" +
                c +
                d +
                e +
                '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cp\x3e' +
                D.list[f].HEADER +
                "\x3c/p\x3e\x3c/div\x3e\x3c/li\x3e",
            ));
      l.loadFile(
        r.INTERFACE_PATH + "basic_interface/envelop.bmp",
        function (a) {
          D.ui.find(".new").css("backgroundImage", "url(" + a + ")");
        },
      );
    }
    function c() {
      1 < H && (--H, b(H));
    }
    function d() {
      H < N && ((H += 1), b(H));
    }
    function e() {
      event.stopImmediatePropagation();
      p(this).hasClass("new") &&
        p(this).css("background-image", "").removeClass("new");
      var a = new g.CZ.MAIL_OPEN();
      a.MailID = p(this).attr("data-mailid");
      n.sendPacket(a);
    }
    function m() {
      if (
        "" == p(".Mailbox .head .name input").val() ||
        "" == p(".Mailbox .head .title input").val() ||
        "" == p(".Mailbox .center textarea").val()
      )
        C.addText("\u4e0d\u80fd\u7559\u7a7a", C.TYPE.ERROR);
      else {
        var a = new g.CZ.MAIL_SEND();
        a.ReceiveName = D.ui.find(".Mailbox .head .name input").val();
        a.Header = D.ui.find(".Mailbox .head .title input").val();
        a.msg_len = D.ui.find(".Mailbox .center textarea").val().length;
        a.msg = D.ui.find(".Mailbox .center textarea").val();
        n.sendPacket(a);
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
    function t(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (K) {}
      c &&
        "item" === c.type &&
        ((b = c.data),
        1 < b.count
          ? (v.append(),
            v.setType("number", !1, b.count),
            (v.onSubmitRequest = function (a) {
              v.remove();
              var c = new g.CZ.MAIL_ADD_ITEM();
              c.index = b.index;
              c.count = a || 1;
              n.sendPacket(c);
              B.mailItem(b.index, a);
            }))
          : ((c = new g.CZ.MAIL_ADD_ITEM()),
            (c.index = b.index),
            (c.count = 1),
            n.sendPacket(c),
            B.mailItem(b.index, 1)));
      a.stopImmediatePropagation();
      return !1;
    }
    var r = a("DB/DBManager"),
      n = a("Network/NetworkManager"),
      g = a("Network/PacketStructure");
    a("DB/Items/ItemType");
    var p = a("Utils/jquery"),
      l = a("Core/Client"),
      f = a("Core/Preferences"),
      k = a("Renderer/Renderer");
    a("Controls/MouseEventHandler");
    var q = a("UI/UIManager"),
      u = a("UI/UIComponent"),
      v = a("UI/Components/InputBox/InputBox"),
      A = a("UI/Components/ItemInfo/ItemInfo"),
      C = a("UI/Components/ChatBox/ChatBox");
    a("UI/Components/MailInfo/MailInfo");
    var B = a("UI/Components/Inventory/Inventory"),
      J = a("text!./Mail.html");
    a = a("text!./Mail.css");
    var D = new u("Mail", J, a);
    D.TAB = { Inbox: 0, Mailbox: 1 };
    D.list = [];
    var y = f.get(
        "Mail",
        {
          x: 200,
          y: 300,
          width: 6,
          height: 9,
          show: !0,
          reduce: !1,
          tab: D.TAB.Inbox,
        },
        1.1,
      ),
      H = 1,
      N;
    D.init = function () {
      this.ui.find(".tabs button").on("click", function () {
        D.SwitchTab(p(this).index());
        event.stopImmediatePropagation();
      });
      this.ui.find(".titlebar .close").on("click", function () {
        D.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".Mailbox").on("click", ".send", m);
      this.ui.find(".Mailbox .cancel").on("click", function () {
        D.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".item").on("contextmenu", ".item", h);
      this.ui.find(".inbox").on("click", "li", e);
      this.ui.find(".inbox").on("click", ".lastpage", c);
      this.ui.find(".inbox").on("click", ".nextpage", d);
      this.ui.find(".Mailbox").on("drop", t);
      y.tab = 0;
      this.draggable(this.ui.find(".titlebar"));
    };
    D.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, y.y), 0.5 * (k.height - this.ui.height())),
        left: Math.min(Math.max(0, y.x), 0.5 * (k.width - this.ui.width())),
      });
      this.SwitchTab(0);
    };
    D.onRemove = function () {
      this.ui.find(".Mailbox .head input,.Mailbox .center textarea").empty();
      D.ui.find(".Mailbox .zeny span input").val("0");
      this.ui.find(".Mailbox .bottom .item").remove();
      D.ui.find(".inbox .content ul").empty();
      p(".ItemInfo").remove();
      this.list.length = 0;
      N = H = 1;
    };
    D.setList = function (a) {
      for (var c = (this.list.length = 0); c < a.mailList.length; c++)
        this.list.push(a.mailList[c]);
      N = Math.ceil(D.list.length / 7);
      b(H);
    };
    D.addItem = function (a, b) {
      this.ui.find(".Mailbox .item").remove();
      this.ui.find(".Mailbox .bottom").append(
        p("#Inventory")
          .find('.item[data-index\x3d"' + a + '"]')
          .clone(),
      );
      this.ui.find(".Mailbox .bottom .item .count").html(b);
    };
    D.SwitchTab = function (a) {
      y.tab = parseInt(a, 10);
      0 == a &&
        (D.ui.find(".Mailbox .head input,.Mailbox .center textarea").val(""),
        D.ui.find(".Mailbox .zeny span input").val("0"),
        D.ui.find(".Mailbox .bottom .item").remove());
      l.loadFile(
        r.INTERFACE_PATH + "basic_interface/maillist" + (a + 1) + "_bg.bmp",
        function (b) {
          p("#Mail .tabs button.sd").removeClass("sd");
          p("#Mail .tabs button").eq(a).addClass("sd");
          D.ui.css("background-image", "url(" + b + ")");
          p("#Mail .container").hide().eq(a).show();
        },
      );
    };
    return q.addComponent(D);
  },
);
