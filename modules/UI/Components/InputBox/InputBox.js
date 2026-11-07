define(
  "UI/Components/InputBox/InputBox",
  "require Utils/jquery Renderer/Renderer Controls/KeyEventHandler DB/DBManager UI/UIManager UI/UIComponent text!./InputBox.html text!./InputBox.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = this.ui.find("input").val();
      if (!this.isPersistent || a.length)
        (this.ui.hasClass("number") && (a = parseInt(a, 10) | 0),
          this.onSubmitRequest(a));
    }
    var c = a("Utils/jquery"),
      d = a("Renderer/Renderer"),
      e = a("Controls/KeyEventHandler"),
      m = a("DB/DBManager"),
      h = a("UI/UIManager"),
      r = a("UI/UIComponent"),
      q = a("text!./InputBox.html");
    a = a("text!./InputBox.css");
    r = new r("InputBox", q, a);
    r.needFocus = !1;
    r.init = function () {
      this.ui.css("zIndex", 99);
      this.draggable();
      this.ui.css({ top: "60%", left: (d.width - 280) / 2 + 1 });
      this.ui.find("button").click(b.bind(this));
      this.ui.find("input").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.overlay = c("\x3cdiv/\x3e")
        .addClass("win_popup_overlay")
        .css("zIndex", 30)
        .click(
          function () {
            this.remove();
          }.bind(this),
        );
    };
    r.onAppend = function () {
      this.ui.find("input").select();
    };
    r.onRemove = function () {
      this.ui.find("input").val("");
      this.ui.find(".text").text("");
      this.overlay.detach();
    };
    r.onKeyDown = function (a) {
      return this.isPersistent || a.which !== e.ENTER
        ? !0
        : (b.call(this), a.stopImmediatePropagation(), !1);
    };
    r.setType = function (a, b, c) {
      switch (a) {
        case "number":
          this.ui.addClass("number");
          this.ui.find(".text").text(m.getMessage(1259));
          this.ui.find("input").attr("type", "text");
          c = c || "";
          break;
        case "text":
          this.ui.removeClass("number");
          this.ui.find(".text").text("");
          this.ui.find("input").attr("type", "text");
          break;
        case "pass":
          this.ui.removeClass("number");
          this.ui.find(".text").text("");
          this.ui.find("input").attr("type", "password");
          break;
        case "mail":
          (this.ui.removeClass("number"),
            this.ui.find(".text").text(m.getMessage(300)),
            this.ui.find("input").attr("type", "password"));
      }
      "undefined" !== typeof c && this.ui.find("input").val(c).select();
    };
    r.onSubmitRequest = function () {};
    return h.addComponent(r);
  },
);
