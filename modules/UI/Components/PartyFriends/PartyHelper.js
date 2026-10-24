define("UI/Components/PartyFriends/PartyHelper", [
  "require",
  "UI/UIManager",
  "UI/UIComponent",
  "text!./PartyHelper.html",
  "text!./PartyHelper.css",
], function (a) {
  function b() {
    var a, b;
    b = c.getComponent("PartyFriends");
    switch (h) {
      case m.Type.CREATE:
        a = m.ui.find(".content .name").val();
        if (a.length)
          b.onRequestPartyCreation(
            a,
            +m.ui.find(".item_share .on").data("value"),
            +m.ui.find(".item_sharing_type .on").data("value"),
          );
        break;
      case m.Type.INVITE:
        a = m.ui.find(".content .name").val();
        if (a.length) b.onRequestAddingMember(0, a);
        break;
      case m.Type.SETUP:
        b.onRequestSettingUpdate(
          +m.ui.find(".exp_share .on").data("value"),
          +m.ui.find(".item_share .on").data("value"),
          +m.ui.find(".item_sharing_type .on").data("value"),
        );
    }
    m.remove();
  }
  var c = a("UI/UIManager"),
    d = a("UI/UIComponent"),
    e = a("text!./PartyHelper.html");
  a = a("text!./PartyHelper.css");
  var m = new d("PartyHelper", e, a);
  m.Type = { CREATE: 0, SETUP: 1, INVITE: 2 };
  var h = m.Type.CREATE;
  m.init = function () {
    this.ui.find(".base").mousedown(function (a) {
      a.stopImmediatePropagation();
      return !1;
    });
    this.ui.on("mousedown", ".off", function () {
      if (!m.ui.find(".content").hasClass("disabled")) {
        var a, b;
        a = this.parentNode.getElementsByClassName("on")[0];
        a.className = "off";
        this.className = "on";
        b = a.style.backgroundImage;
        a.style.backgroundImage = this.style.backgroundImage;
        this.style.backgroundImage = b;
      }
    });
    this.ui.find(".cancel, .close").click(this.remove.bind(this));
    this.ui.find(".ok").click(b);
    this.draggable(this.ui.find(".titlebar"));
  };
  m.onAppend = function () {
    var a = c.getComponent("PartyFriends").ui;
    this.ui.find(".setup, .create, .invite").hide();
    this.ui.find(".name").val("").focus().select();
    this.ui.css({
      top: a.css("top"),
      left: parseInt(a.css("left"), 10) + a.width() + 10,
    });
  };
  m.onRemove = function () {
    this.ui.find(".setup, .create, .invite").hide();
    this.ui.find(".name").val("");
  };
  m.setType = function (a) {
    this.ui.find(".content").removeClass("disabled");
    switch (a) {
      case m.Type.CREATE:
        this.ui.find(".setup, .invite").hide();
        this.ui.find(".create").show();
        break;
      case m.Type.INVITE:
        this.ui.find(".setup, .create").hide();
        this.ui.find(".invite").show();
        break;
      case m.Type.SETUP:
        (this.ui.find(".create .invite").hide(), this.ui.find(".setup").show());
    }
    h = a;
  };
  m.setOptions = function (a, b) {
    var c = ["exp_share", "item_share", "item_sharing_type"],
      d,
      e = c.length,
      h;
    for (d = 0; d < e; ++d)
      if (
        ((h = this.ui.find("." + c[d]).find(".off")),
        a[c[d]] == h.data("value"))
      ) {
        var f, n;
        f = h.parent().find(".on");
        f.addClass("off").removeClass("on");
        h.addClass("on").removeClass("off");
        n = f.css("background-image");
        f.css("background-image", h.css("background-image"));
        h.css("background-image", n);
      }
    b
      ? this.ui.find(".content").removeClass("disabled")
      : this.ui.find(".content").addClass("disabled");
  };
  m.getType = function () {
    return h;
  };
  m.onCreate = function () {};
  m.onInvite = function () {};
  m.onSetupUpdate = function () {};
  return c.addComponent(m);
});
