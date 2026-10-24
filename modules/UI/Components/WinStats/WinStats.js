define(
  "UI/Components/WinStats/WinStats",
  "require UI/UIManager UI/UIComponent Core/Preferences Renderer/Renderer text!./WinStats.html text!./WinStats.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c() {
      q.ui.hide();
    }
    var d = a("UI/UIManager"),
      e = a("UI/UIComponent"),
      m = a("Core/Preferences");
    a("Renderer/Renderer");
    var h = a("text!./WinStats.html");
    a = a("text!./WinStats.css");
    var r = m.get("WinStats", { x: 50, y: 200, show: !1, reduce: !1 }, 1),
      q = new e("WinStats", h, a);
    q.init = function () {
      this.statuspoint = 0;
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".titlebar .mini").click(function () {
        q.ui.find(".panel").toggle();
      });
      this.ui.find(".titlebar .close").click(c);
      this.ui.find(".up button").mousedown(function () {
        switch (this.className) {
          case "str":
            q.onRequestUpdate(13, 1);
            break;
          case "agi":
            q.onRequestUpdate(14, 1);
            break;
          case "vit":
            q.onRequestUpdate(15, 1);
            break;
          case "int":
            q.onRequestUpdate(16, 1);
            break;
          case "dex":
            q.onRequestUpdate(17, 1);
            break;
          case "luk":
            q.onRequestUpdate(18, 1);
        }
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    q.stack = [];
    q.onAppend = function () {
      var a, b;
      r.show || this.ui.hide();
      r.reduce && this.ui.find(".panel").hide();
      a = 0;
      for (b = this.stack.length; a < b; ++a)
        this.update.apply(this, this.stack[a]);
      this.stack.length = 0;
    };
    q.onRemove = function () {
      r.show = this.ui.is(":visible");
      r.reduce = "none" === this.ui.find(".panel").css("display");
      r.y = parseInt(this.ui.css("top"), 10);
      r.x = parseInt(this.ui.css("left"), 10);
      r.save();
    };
    q.update = function (a, b) {
      var c;
      if (this.__loaded)
        switch (a) {
          case "statuspoint":
            this.statuspoint = b;
            this.ui.find(".requirements div").each(function () {
              q.ui
                .find(".up ." + this.className)
                .css("opacity", parseInt(this.textContent, 10) <= b ? 1 : 0);
            });
            this.ui.find("." + a).text(b);
            break;
          case "guildname":
          case "atak":
          case "matak":
          case "def":
          case "mdef":
          case "hit":
          case "flee":
          case "critical":
            this.ui.find("." + a).text(b);
            break;
          case "aspd":
            this.ui.find("." + a).text(Math.floor(200 - b / 10));
            break;
          case "matak2":
            c = "+" + b;
            this.ui.find("." + a).text(c);
            break;
          case "atak2":
          case "def2":
          case "mdef2":
          case "flee2":
            c = 0 > b ? "- " + -b : "+ " + b;
            this.ui.find("." + a).text(c);
            break;
          case "str":
          case "agi":
          case "vit":
          case "int":
          case "dex":
          case "luk":
            this.ui.find(".stats ." + a).text(b);
            break;
          case "str2":
          case "agi2":
          case "vit2":
          case "int2":
          case "dex2":
          case "luk2":
            c = 0 > b ? "- " + -b : 0 < b ? "+" + b : "";
            this.ui.find(".bonus ." + a.replace("2", "")).text(c);
            break;
          case "str3":
          case "agi3":
          case "vit3":
          case "int3":
          case "dex3":
          case "luk3":
            (this.ui.find(".requirements ." + a.replace("3", "")).text(b),
              this.ui
                .find(".up ." + a.replace("3", ""))
                .css("opacity", b <= this.statuspoint ? 1 : 0));
        }
      else this.stack.push(arguments);
    };
    q.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          (q.ui.toggle(), q.focus());
      }
    };
    q.onRequestUpdate = function () {};
    return d.addComponent(q);
  },
);
