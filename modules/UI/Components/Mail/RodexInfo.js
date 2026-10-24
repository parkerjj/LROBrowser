define(
  "UI/Components/Mail/RodexInfo",
  "require DB/DBManager Network/NetworkManager Network/PacketStructure Utils/jquery Core/Client UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo text!./RodexInfo.html text!./RodexInfo.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a = parseInt(this.getAttribute("data-itid"), 10);
      if ((a = g.getItemById(a)))
        q.uid != a.ITID
          ? (q.append(), (q.uid = a.ITID), (q.type = "RodexInfo"), q.setItem(a))
          : q.remove();
    }
    var c = a("DB/DBManager"),
      d = a("Network/NetworkManager"),
      e = a("Network/PacketStructure");
    a("Utils/jquery");
    var m = a("Core/Client"),
      h = a("UI/UIManager"),
      r = a("UI/UIComponent"),
      q = a("UI/Components/ItemInfo/ItemInfo"),
      k = a("text!./RodexInfo.html");
    a = a("text!./RodexInfo.css");
    var g = new r("RodexInfo", k, a),
      t = [];
    g.init = function () {
      this.ui.find(".titlebar .close").on("click", function () {
        g.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".itemBar").on("contextmenu", ".item", b);
      this.ui.find(".zenyReceive").on("click", function () {
        var a = new e.CZ.REQ_ZENY_FROM_MAIL();
        a.MailID = g.id;
        a.MailTAB = 0;
        d.sendPacket(a);
      });
      this.ui.find(".itemReceive").on("click", function () {
        h.showPromptBox(
          "\u786e\u5b9a\u63a5\u6536\u90ae\u4ef6\u9053\u5177\uff1f",
          "ok",
          "cancel",
          function () {
            var a = new e.CZ.REQ_ITEM_FROM_MAIL();
            a.MailID = g.id;
            a.MailTAB = 0;
            d.sendPacket(a);
          },
          null,
        );
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    g.getItemById = function (a) {
      var b, c;
      b = 0;
      for (c = t.length; b < c; ++b) if (t[b].ITID === a) return t[b];
      return null;
    };
    g.onAppend = function () {};
    g.onRemove = function () {
      t = [];
    };
    g.readMail = function (a) {
      this.id = a.MailID;
      this.ui.find(".conts").text(a.msg);
      0 < a.Zeny
        ? (this.ui.find(".zeny").text(a.Zeny),
          this.ui.find(".zenyReceive").show())
        : (this.ui.find(".zeny").text(""), this.ui.find(".zenyReceive").hide());
      this.ui.find(".itemBar").empty();
      0 < a.itemCount
        ? this.ui.find(".itemReceive").show()
        : this.ui.find(".itemReceive").hide();
      t = a.itemList;
      for (a = 0; a < t.length; a++) g.setMailItem(t[a]);
    };
    g.setMailItem = function (a) {
      var b = c.getItemInfo(a.ITID),
        d = this.ui.find(".itemBar"),
        e = a.ITID;
      d.append(
        '\x3cdiv class\x3d"item" data-itid\x3d"' +
          e +
          '" data-IsIdentified\x3d"' +
          a.IsIdentified +
          '" data-type\x3d"' +
          a.type +
          '" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
          (a.count || 1) +
          "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
      );
      m.loadFile(
        c.INTERFACE_PATH +
          "item/" +
          (a.IsIdentified
            ? b.identifiedResourceName
            : b.unidentifiedResourceName) +
          ".bmp",
        function (a) {
          d.find('.item[data-itid\x3d"' + e + '"] .icon').css(
            "backgroundImage",
            "url(" + a + ")",
          );
        },
      );
    };
    g.getMailZeny = function (a) {
      this.ui.find(".zeny").text("");
      this.ui.find(".zenyReceive").hide();
    };
    g.getMailItem = function (a) {
      this.ui.find(".itemBar").empty();
      this.ui.find(".itemReceive").hide();
    };
    return h.addComponent(g);
  },
);
