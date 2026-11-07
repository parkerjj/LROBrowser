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
      r = a("UI/Components/WorldMap/WorldMap"),
      q = a("text!./NpcBox.html");
    a = a("text!./NpcBox.css");
    var k = new m("NpcBox", q, a),
      g = !1,
      t = 0;
    k.needFocus = !1;
    k.init = function () {
      this.ui.css({
        zIndex: 99,
        top: 0.5 * (d.height - this.ui.height()) - 70,
        left: 0.5 * (d.width - this.ui.width()),
      });
      this.ui.find(".next").click(k.next.bind(this));
      this.ui.find(".close").click(k.close.bind(this));
      this.ui.find(".content").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.ui.on("click", ".smap", function (a) {
        r.select();
        r.selectMap(b(this).text());
        k.close();
        a.stopImmediatePropagation();
        return !1;
      });
      this.draggable();
    };
    k.onAppend = function () {
      h.talk = !0;
    };
    k.onRemove = function () {
      this.ui.find(".next").hide();
      this.ui.find(".close").hide();
      this.ui.find(".content").text("");
      g = h.talk = !1;
      t = 0;
      var a = document.getElementById("cutin");
      a && document.body.removeChild(a);
    };
    k.onKeyDown = function (a) {
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
    k.setText = function (a, c) {
      var d = this.ui.find(".content");
      t = c;
      g && ((g = !1), d.text(""));
      d.append(b("\x3cdiv/\x3e").text(a));
    };
    k.addNext = function (a) {
      t = a;
      this.ui.find(".next").show();
    };
    k.addClose = function (a) {
      t = a;
      this.ui.find(".close").show();
    };
    k.next = function () {
      g = !0;
      this.ui.find(".next").hide();
      this.onNextPressed(t);
    };
    k.close = function () {
      g = !0;
      h.talk = !1;
      this.ui.find(".close").hide();
      this.onClosePressed(t);
    };
    k.onClosePressed = function () {};
    k.onNextPressed = function () {};
    return e.addComponent(k);
  },
);
