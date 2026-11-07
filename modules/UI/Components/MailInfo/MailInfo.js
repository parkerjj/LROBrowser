define(
  "UI/Components/MailInfo/MailInfo",
  "require Network/NetworkManager Network/PacketStructure DB/DBManager DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/ChatBox/ChatBox text!./MailInfo.html text!./MailInfo.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = new h.CZ.MAIL_GET_ITEM();
      a.MailID = f.ui.attr("data-mailid");
      m.sendPacket(a);
    }
    function c() {
      var a = new h.CZ.REQ_MAIL_RETURN();
      a.MailID = f.ui.attr("data-mailid");
      a.ReceiveName = f.ui.find(".content .head span").html();
      m.sendPacket(a);
    }
    function d() {
      var a = new h.CZ.MAIL_DELETE();
      a.MailID = f.ui.attr("data-mailid");
      m.sendPacket(a);
    }
    var e = a("DB/DBManager"),
      m = a("Network/NetworkManager"),
      h = a("Network/PacketStructure");
    a("DB/Items/ItemType");
    var r = a("Utils/jquery"),
      q = a("Core/Client"),
      k = a("Core/Preferences");
    a("Renderer/Renderer");
    a("Controls/MouseEventHandler");
    var g = a("UI/UIManager"),
      t = a("UI/UIComponent");
    a("UI/Components/InputBox/InputBox");
    a("UI/Components/ItemInfo/ItemInfo");
    a("UI/Components/ChatBox/ChatBox");
    var l = a("text!./MailInfo.html");
    a = a("text!./MailInfo.css");
    var f = new t("MailInfo", l, a);
    f.list = [];
    k.get(
      "MailInfo",
      { x: 200, y: 300, width: 6, height: 9, show: !0, reduce: !1 },
      1.1,
    );
    f.init = function () {
      this.ui.find(".titlebar .close").on("click", function () {
        f.remove();
        event.stopImmediatePropagation();
      });
      this.ui.find(".footer").on("click", ".return", c);
      this.ui.find(".footer").on("click", ".remail", this.remailMail);
      this.ui.find(".footer").on("click", ".del", d);
      this.ui.find(".content").on("click", ".bottom", b);
    };
    f.onAppend = function () {};
    f.setLetter = function (a) {
      if (a.ITID) {
        var b = e.getItemInfo(a.ITID),
          c = this.ui.find(".content .bottom");
        q.loadFile(
          e.INTERFACE_PATH + "item/" + b.identifiedResourceName + ".bmp",
          function (b) {
            c.append(
              '\x3cdiv class\x3d"item" draggable\x3d"true"\x3e\x3cdiv class\x3d"icon" style\x3d"background-image:url(' +
                b +
                ')"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3cspan class\x3d"count"\x3e' +
                a.count +
                "\x3c/span\x3e\x3c/div\x3e\x3c/div\x3e",
            );
          },
        );
      }
      this.ui.attr("data-MailID", a.MailID);
      this.ui.find(".content .head h1").html(a.Header);
      this.ui.find(".content .head span").html(a.FromName);
      this.ui.find(".content .bottom span").html(a.Money);
      this.ui.find(".content .bottom .item .count").html(a.count);
      this.ui.find(".content .center p").html(a.msg);
    };
    f.onRemove = function () {
      this.ui
        .find(
          ".content .head h1,.content .head span,.content .center p,.content .bottom span",
        )
        .empty();
      this.ui.find(".content .bottom .item").remove();
      r(".ItemInfo").remove();
    };
    f.remailMail = function () {};
    return g.addComponent(f);
  },
);
