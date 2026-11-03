define(
  "UI/Components/ChatRoomCreate/ChatRoomCreate",
  "require Utils/jquery DB/DBManager Controls/KeyEventHandler Renderer/Renderer Core/Preferences UI/UIManager UI/UIComponent text!./ChatRoomCreate.html text!./ChatRoomCreate.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c() {
      this.title = this.ui.find("input[name\x3dtitle]").val();
      this.limit = parseInt(this.ui.find("select[name\x3dlimit]").val(), 10);
      this.type = parseInt(
        this.ui.find("input[name\x3dpublic]:checked").val(),
        10,
      );
      this.password = this.ui.find("input[name\x3dpassword]").val();
      if (1 > this.title.length) {
        var a = document.createElement("div");
        a.className = "win_popup_overlay";
        document.body.appendChild(a);
        t.showMessageBox(
          e.getMessage(13),
          "ok",
          function () {
            document.body.removeChild(a);
          },
          !0,
        ).ui.css({
          top: parseInt(this.ui.css("top"), 10) - 120,
          left: parseInt(this.ui.css("left"), 10),
        });
      } else (this.requestRoom(), this.hide());
    }
    var d = a("Utils/jquery"),
      e = a("DB/DBManager"),
      l = a("Controls/KeyEventHandler"),
      h = a("Renderer/Renderer"),
      r = a("Core/Preferences"),
      t = a("UI/UIManager"),
      n = a("UI/UIComponent"),
      g = a("text!./ChatRoomCreate.html");
    a = a("text!./ChatRoomCreate.css");
    n = new n("ChatRoomCreate", g, a);
    n.title = "";
    n.limit = 20;
    n.type = 1;
    n.password = "";
    var p = r.get("ChatRoomCreate", { x: 480, y: 200, show: !1 }, 1);
    n.init = function () {
      this.ui.find(".close, .cancel").mousedown(b).click(this.hide.bind(this));
      this.ui.find(".ok").on("click", c.bind(this));
      this.ui.find(".setup").submit(function () {
        return !1;
      });
      this.ui.find("input, select").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.draggable(this.ui.find(".titlebar"));
      this.ui.hide();
    };
    n.onAppend = function () {
      this.ui.hide();
      this.ui.css({
        top: Math.min(Math.max(0, p.y), h.height - this.ui.height()),
        left: Math.min(Math.max(0, p.x), h.width - this.ui.width()),
      });
      var a = d._data(window, "events").keydown;
      a.unshift(a.pop());
    };
    n.onRemove = function () {
      p.show = this.ui.is(":visible");
      p.y = parseInt(this.ui.css("top"), 10);
      p.x = parseInt(this.ui.css("left"), 10);
      p.save();
    };
    n.show = function () {
      this.ui.show();
      this.ui.find(".title").focus();
      p.show = !0;
    };
    n.hide = function () {
      this.ui.hide();
      this.ui.find(".setup")[0].reset();
      p.show = !1;
    };
    n.onKeyDown = function (a) {
      if (this.ui.is(":visible")) {
        if (a.which === l.ENTER)
          return (c.call(this), a.stopImmediatePropagation(), !1);
        if (a.which === l.ESCAPE)
          return (this.hide(), a.stopImmediatePropagation(), !1);
      }
      return !0;
    };
    n.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          (this.ui.toggle(), this.ui.is(":visible") && this.focus());
      }
    };
    n.requestRoom = function () {};
    return t.addComponent(n);
  },
);
