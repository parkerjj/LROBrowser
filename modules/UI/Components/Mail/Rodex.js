define(
  "UI/Components/Mail/Rodex",
  "require DB/DBManager Utils/jquery Network/NetworkManager Network/PacketStructure Core/Client Preferences/Controls UI/UIManager UI/UIComponent UI/Components/Mail/RodexInfo UI/Components/Mail/RodexSend UI/Components/ChatBox/ChatBox text!./Rodex.html text!./Rodex.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return 86400 < a
        ? parseInt(a / 86400) + "\u5929\u540e"
        : 3600 < a
          ? parseInt(a / 3600) + "\u5c0f\u65f6\u540e"
          : 60 < a
            ? parseInt(a / 60) + "\u5206\u949f\u540e"
            : parseInt(a) + "\u79d2\u540e";
    }
    var c = a("DB/DBManager"),
      d = a("Utils/jquery"),
      e = a("Network/NetworkManager"),
      m = a("Network/PacketStructure"),
      h = a("Core/Client"),
      r = a("Preferences/Controls"),
      q = a("UI/UIManager"),
      k = a("UI/UIComponent"),
      g = a("UI/Components/Mail/RodexInfo"),
      t = a("UI/Components/Mail/RodexSend"),
      l = a("UI/Components/ChatBox/ChatBox"),
      f = a("text!./Rodex.html");
    a = a("text!./Rodex.css");
    var n = new k("Rodex", f, a),
      p = 1,
      v = 0,
      u = [];
    n.init = function () {
      d("#rodexButton").on("mousedown", function () {
        if (!n.ui || !n.ui.is(":visible")) {
          n.ui.show();
          var a = new m.CZ.OPEN_MAILBOX();
          a.MailTAB = 0;
          a.MailID = 0;
          e.sendPacket(a);
          event.stopImmediatePropagation();
        }
      });
      this.ui.find(".written").on("click", function () {
        if (r.autoattack || r.autofollow)
          return (
            l.addText(
              "\u6218\u6597\u65f6\u4e0d\u80fd\u53d1\u9001\u90ae\u4ef6",
              l.TYPE.ERROR,
            ),
            !1
          );
        if (t.ui && t.ui.is(":visible"))
          return (
            l.addText(
              "\u8bf7\u5173\u95ed\u5199\u4fe1\u7a97\u53e3",
              l.TYPE.ERROR,
            ),
            !1
          );
        var a = new m.CZ.REQ_OPEN_WRITE_MAIL();
        a.ReceiveName = "";
        e.sendPacket(a);
      });
      this.ui.on("click", ".title", function () {
        if (r.autoattack || r.autofollow)
          return (
            l.addText(
              "\u6218\u6597\u65f6\u4e0d\u80fd\u53d1\u9001\u90ae\u4ef6",
              l.TYPE.ERROR,
            ),
            !1
          );
        if (t.ui && t.ui.is(":visible"))
          return (
            l.addText(
              "\u8bf7\u5173\u95ed\u5199\u4fe1\u7a97\u53e3",
              l.TYPE.ERROR,
            ),
            !1
          );
        var a = new m.CZ.REQ_OPEN_WRITE_MAIL();
        a.ReceiveName = d(this).text();
        e.sendPacket(a);
      });
      this.ui.on("click", ".icon", function () {
        if (g.ui && g.ui.is(":visible"))
          return (
            l.addText(
              "\u8bf7\u5173\u95ed\u8bfb\u4fe1\u7a97\u53e3",
              l.TYPE.ERROR,
            ),
            !1
          );
        g.remove();
        g.append();
        var a = d(this).parent().parent();
        g.ui.find(".name").text(a.find(".title").text());
        g.ui.find(".title").text(a.find(".detailed").text());
        var a = a.data("id"),
          b = new m.CZ.REQ_READ_MAIL();
        b.MailTAB = 0;
        b.MailID = a;
        e.sendPacket(b);
      });
      this.ui.on("click", ".detailed", function () {
        if (g.ui && g.ui.is(":visible"))
          return (
            l.addText(
              "\u8bf7\u5173\u95ed\u8bfb\u4fe1\u7a97\u53e3",
              l.TYPE.ERROR,
            ),
            !1
          );
        g.remove();
        g.append();
        var a = d(this).parent().parent().parent();
        g.ui.find(".name").text(a.find(".title").text());
        g.ui.find(".title").text(a.find(".detailed").text());
        var a = a.data("id"),
          b = new m.CZ.REQ_READ_MAIL();
        b.MailTAB = 0;
        b.MailID = a;
        e.sendPacket(b);
      });
      this.ui.find(".prev").on("click", function () {
        1 < p &&
          ((v = 0),
          n.ui.find(".container").empty(),
          --p,
          n.ui.find(".pageNum").text(p),
          n.setMails());
      });
      this.ui.find(".next").on("click", function () {
        if (v) return !1;
        var a = n.ui.find(".mail:last").data("id");
        n.ui.find(".container").empty();
        p += 1;
        n.ui.find(".pageNum").text(p);
        var b = new m.CZ.REQ_NEXT_MAIL_LIST();
        b.MailTAB = 0;
        b.MailID = a;
        e.sendPacket(b);
      });
      this.ui.on("click", ".mail_del", function () {
        var a = d(this).parent().parent().parent().data("id");
        q.showPromptBox(
          "\u786e\u5b9a\u5220\u9664\u8be5\u90ae\u4ef6\uff1f",
          "ok",
          "cancel",
          function () {
            var b = new m.CZ.REQ_DELETE_MAIL();
            b.MailTAB = 0;
            b.MailID = a;
            e.sendPacket(b);
          },
          null,
        );
      });
      this.ui.find(".titlebar .close").on("click", function () {
        p = 1;
        v = 0;
        u = [];
        n.ui.find(".container").empty();
        n.ui.find(".pageNum").text(p);
        var a = new m.CZ.CLOSE_MAILBOX();
        e.sendPacket(a);
        n.ui.hide();
        event.stopImmediatePropagation();
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    n.onAppend = function () {};
    n.onRemove = function () {
      p = 1;
      v = 0;
      u = [];
      n.ui.find(".container ul").empty();
      n.ui.find(".pageNum").text(p);
      n.ui.hide();
    };
    n.toggle = function () {
      if (n.ui.is(":visible")) {
        n.ui.hide();
        var a = new m.CZ.CLOSE_MAILBOX();
      } else
        (n.ui.show(),
          (a = new m.CZ.OPEN_MAILBOX()),
          (a.MailTAB = 0),
          (a.MailID = 0));
      e.sendPacket(a);
    };
    n.setList = function (a) {
      if (u.length) {
        for (e = 0; e < a.mailList.length; e++) {
          for (var b = 0, c = 0; c < u.length; c++)
            a.mailList[e].MailID == u[c].MailID &&
              ((u[c] = a.mailList[e]), (b = 1));
          0 == b && u.push(a.mailList[e]);
        }
        b = u;
        for (e = 0; e < b.length; e++)
          for (var d = e; d < b.length; d++)
            b[e].MailID < b[d].MailID &&
              ((c = b[d]), (b[d] = b[e]), (b[e] = c));
      } else for (var e = 0; e < a.mailList.length; e++) u.push(a.mailList[e]);
      n.setMails();
      v = a.last_page ? 1 : 0;
      this.ui.find(".ownmail").text(u.length);
    };
    n.setMails = function () {
      this.ui.find(".container").empty();
      for (var a = 7 * (p - 1); a < 7 * (p - 1) + 7; a++)
        u[a] && n.setMail(u[a]);
    };
    n.setMail = function (a) {
      var d = this.ui.find(".container");
      d.append(
        '\x3cdiv class\x3d"mail" data-id\x3d"' +
          a.MailID +
          '"\x3e\x3cdiv class\x3d"left"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cdiv class\x3d"mail_left"\x3e\x3cdiv class\x3d"title"\x3e' +
          a.FromName +
          '\x3c/div\x3e\x3cdiv class\x3d"detailed"\x3e' +
          a.title +
          '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"mail_main"\x3e\x3cdiv class\x3d"datetime"\x3e' +
          b(a.DeleteTime) +
          '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"mail_right"\x3e\x3cbutton class\x3d"mail_del"\x3e\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      switch (a.type) {
        case 0:
        case 8:
          h.loadFile(
            c.INTERFACE_PATH +
              "basic_interface/" +
              (a.isOpen ? "rodexsystem/none-2" : "rodexsystem/none") +
              ".bmp",
            function (b) {
              d.find('.mail[data-id\x3d"' + a.MailID + '"] .icon').css(
                "backgroundImage",
                "url(" + b + ")",
              );
            },
          );
          break;
        case 2:
        case 10:
          h.loadFile(
            c.INTERFACE_PATH +
              "basic_interface/" +
              (a.isOpen ? "rodexsystem/zeny-2" : "rodexsystem/zeny") +
              ".bmp",
            function (b) {
              d.find('.mail[data-id\x3d"' + a.MailID + '"] .icon').css(
                "backgroundImage",
                "url(" + b + ")",
              );
            },
          );
          break;
        case 4:
        case 12:
          h.loadFile(
            c.INTERFACE_PATH +
              "basic_interface/" +
              (a.isOpen ? "rodexsystem/items-2" : "rodexsystem/items") +
              ".bmp",
            function (b) {
              d.find('.mail[data-id\x3d"' + a.MailID + '"] .icon').css(
                "backgroundImage",
                "url(" + b + ")",
              );
            },
          );
          break;
        case 6:
          h.loadFile(
            c.INTERFACE_PATH +
              "basic_interface/" +
              (a.isOpen
                ? "rodexsystem/zeny\x26items-2"
                : "rodexsystem/zeny\x26items") +
              ".bmp",
            function (b) {
              d.find('.mail[data-id\x3d"' + a.MailID + '"] .icon').css(
                "backgroundImage",
                "url(" + b + ")",
              );
            },
          );
      }
      h.loadFile(
        c.INTERFACE_PATH + "basic_interface/rodexsystem/mail_delete.bmp",
        function (b) {
          d.find('.mail[data-id\x3d"' + a.MailID + '"] .mail_del').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    n.deleteMail = function (a) {
      for (var b = 0; b < u.length; b++)
        u[b].MailID == a.MailID && u.splice(b, 1);
      n.setMails();
    };
    return q.addComponent(n);
  },
);
