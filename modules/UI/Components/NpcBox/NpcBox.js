define(
  "UI/Components/NpcBox/NpcBox",
  "require Utils/jquery Controls/KeyEventHandler Renderer/Renderer UI/UIManager UI/UIComponent Preferences/Controls UI/Components/WorldMap/WorldMap text!./NpcBox.html text!./NpcBox.css".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/jquery"),
      c = a("Controls/KeyEventHandler"),
      d = a("Renderer/Renderer"),
      e = a("UI/UIManager"),
      m = a("UI/UIComponent"),
      h = a("Preferences/Controls"),
      t = a("UI/Components/WorldMap/WorldMap"),
      r = a("text!./NpcBox.html");
    a = a("text!./NpcBox.css");
    var n = new m("NpcBox", r, a),
      g = !1,
      p = 0;
    n.needFocus = !1;
    n.init = function () {
      this.ui.css({
        zIndex: 99,
        top: 0.5 * (d.height - this.ui.height()) - 70,
        left: 0.5 * (d.width - this.ui.width()),
      });
      this.ui.find(".next").click(n.next.bind(this));
      this.ui.find(".close").click(n.close.bind(this));
      this.ui.find(".content").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.ui.on("click", ".smap", function (a) {
        t.select();
        t.selectMap(b(this).text());
        n.close();
        a.stopImmediatePropagation();
        return !1;
      });
      this.draggable();
    };
    n.onAppend = function () {
      h.talk = !0;
    };
    n.onRemove = function () {
      this.ui.find(".next").hide();
      this.ui.find(".close").hide();
      this.ui.find(".content").text("");
      g = h.talk = !1;
      p = 0;
      var a = document.getElementById("cutin");
      a && document.body.removeChild(a);
    };
    n.onKeyDown = function (a) {
      switch (a.which) {
        case c.ENTER:
          if (this.ui.find(".next").is(":visible")) {
            this.next();
            break;
          } else if (this.ui.find(".close").is(":visible")) {
            this.close();
            break;
          }
          return !0;
        case c.ESCAPE:
          if (this.ui.find(".close").is(":visible")) {
            this.close();
            break;
          }
          return !0;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    n.setText = function (a, c) {
      var d = this.ui.find(".content");
      p = c;
      g && ((g = !1), d.text(""));
      d.append(b("\x3cdiv/\x3e").text(a));
    };
    n.addNext = function (a) {
      p = a;
      this.ui.find(".next").show();
    };
    n.addClose = function (a) {
      p = a;
      this.ui.find(".close").show();
    };
    n.next = function () {
      g = !0;
      this.ui.find(".next").hide();
      this.onNextPressed(p);
    };
    n.close = function () {
      g = !0;
      h.talk = !1;
      this.ui.find(".close").hide();
      this.onClosePressed(p);
    };
    n.onClosePressed = function () {};
    n.onNextPressed = function () {};
    return e.addComponent(n);
  },
);
