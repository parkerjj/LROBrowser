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
      r.ui.hide();
    }
    var d = a("UI/UIManager"),
      e = a("UI/UIComponent"),
      m = a("Core/Preferences");
    a("Renderer/Renderer");
    var h = a("text!./WinStats.html");
    a = a("text!./WinStats.css");
    var t = m.get("WinStats", { x: 50, y: 200, show: !1, reduce: !1 }, 1),
      r = new e("WinStats", h, a);
    r.init = function () {
      this.statuspoint = 0;
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".titlebar .mini").click(function () {
        r.ui.find(".panel").toggle();
      });
      this.ui.find(".titlebar .close").click(c);
      this.ui.find(".up button").mousedown(function () {
        switch (this.className) {
          case "str":
            r.onRequestUpdate(13, 1);
            break;
          case "agi":
            r.onRequestUpdate(14, 1);
            break;
          case "vit":
            r.onRequestUpdate(15, 1);
            break;
          case "int":
            r.onRequestUpdate(16, 1);
            break;
          case "dex":
            r.onRequestUpdate(17, 1);
            break;
          case "luk":
            r.onRequestUpdate(18, 1);
        }
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    r.stack = [];
    r.onAppend = function () {
      var a, b;
      t.show || this.ui.hide();
      t.reduce && this.ui.find(".panel").hide();
      a = 0;
      for (b = this.stack.length; a < b; ++a)
        this.update.apply(this, this.stack[a]);
      this.stack.length = 0;
    };
    r.onRemove = function () {
      t.show = this.ui.is(":visible");
      t.reduce = "none" === this.ui.find(".panel").css("display");
      t.y = parseInt(this.ui.css("top"), 10);
      t.x = parseInt(this.ui.css("left"), 10);
      t.save();
    };
    r.update = function (a, b) {
      var c;
      if (this.__loaded)
        switch (a) {
          case "statuspoint":
            this.statuspoint = b;
            this.ui.find(".requirements div").each(function () {
              r.ui
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
    r.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          (r.ui.toggle(), r.focus());
      }
    };
    r.onRequestUpdate = function () {};
    return d.addComponent(r);
  },
);
