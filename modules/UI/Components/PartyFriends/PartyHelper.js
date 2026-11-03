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
      case l.Type.CREATE:
        a = l.ui.find(".content .name").val();
        if (a.length)
          b.onRequestPartyCreation(
            a,
            +l.ui.find(".item_share .on").data("value"),
            +l.ui.find(".item_sharing_type .on").data("value"),
          );
        break;
      case l.Type.INVITE:
        a = l.ui.find(".content .name").val();
        if (a.length) b.onRequestAddingMember(0, a);
        break;
      case l.Type.SETUP:
        b.onRequestSettingUpdate(
          +l.ui.find(".exp_share .on").data("value"),
          +l.ui.find(".item_share .on").data("value"),
          +l.ui.find(".item_sharing_type .on").data("value"),
        );
    }
    l.remove();
  }
  var c = a("UI/UIManager"),
    d = a("UI/UIComponent"),
    e = a("text!./PartyHelper.html");
  a = a("text!./PartyHelper.css");
  var l = new d("PartyHelper", e, a);
  l.Type = { CREATE: 0, SETUP: 1, INVITE: 2 };
  var h = l.Type.CREATE;
  l.init = function () {
    this.ui.find(".base").mousedown(function (a) {
      a.stopImmediatePropagation();
      return !1;
    });
    this.ui.on("mousedown", ".off", function () {
      if (!l.ui.find(".content").hasClass("disabled")) {
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
  l.onAppend = function () {
    var a = c.getComponent("PartyFriends").ui;
    this.ui.find(".setup, .create, .invite").hide();
    this.ui.find(".name").val("").focus().select();
    this.ui.css({
      top: a.css("top"),
      left: parseInt(a.css("left"), 10) + a.width() + 10,
    });
  };
  l.onRemove = function () {
    this.ui.find(".setup, .create, .invite").hide();
    this.ui.find(".name").val("");
  };
  l.setType = function (a) {
    this.ui.find(".content").removeClass("disabled");
    switch (a) {
      case l.Type.CREATE:
        this.ui.find(".setup, .invite").hide();
        this.ui.find(".create").show();
        break;
      case l.Type.INVITE:
        this.ui.find(".setup, .create").hide();
        this.ui.find(".invite").show();
        break;
      case l.Type.SETUP:
        (this.ui.find(".create .invite").hide(), this.ui.find(".setup").show());
    }
    h = a;
  };
  l.setOptions = function (a, b) {
    var c = ["exp_share", "item_share", "item_sharing_type"],
      d,
      e = c.length,
      h;
    for (d = 0; d < e; ++d)
      if (
        ((h = this.ui.find("." + c[d]).find(".off")),
        a[c[d]] == h.data("value"))
      ) {
        var f, m;
        f = h.parent().find(".on");
        f.addClass("off").removeClass("on");
        h.addClass("on").removeClass("off");
        m = f.css("background-image");
        f.css("background-image", h.css("background-image"));
        h.css("background-image", m);
      }
    b
      ? this.ui.find(".content").removeClass("disabled")
      : this.ui.find(".content").addClass("disabled");
  };
  l.getType = function () {
    return h;
  };
  l.onCreate = function () {};
  l.onInvite = function () {};
  l.onSetupUpdate = function () {};
  return c.addComponent(l);
});
