define(
  "UI/Components/ContextMenu/ContextMenu",
  "require Utils/jquery Renderer/Renderer Controls/MouseEventHandler UI/UIManager UI/UIComponent text!./ContextMenu.css".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/jquery"),
      c = a("Renderer/Renderer"),
      d = a("Controls/MouseEventHandler"),
      e = a("UI/UIManager"),
      m = a("UI/UIComponent");
    a = a("text!./ContextMenu.css");
    var h = new m(
      "ContextMenu",
      '\x3cdiv id\x3d"ContextMenu"\x3e\x3cdiv class\x3d"menu"/\x3e\x3c/div\x3e',
      a,
    );
    h.init = function () {
      this.ui.mousedown(function () {
        h.remove();
      });
      this.ui.find(".menu").on("mousedown", "div", function (a) {
        a.stopImmediatePropagation();
        return !1;
      });
    };
    h.onAppend = function () {
      var a = this.ui.find(".menu"),
        b = a.width(),
        e = a.height(),
        g = d.screen.x,
        h = d.screen.y;
      d.screen.x + b > c.width && (g = d.screen.x - b);
      d.screen.y + e > c.height && (h = d.screen.y - e);
      a.css({ top: h, left: g });
    };
    h.onRemove = function () {
      this.ui.find(".menu").empty();
    };
    h.addElement = function (a, c) {
      this.ui.find(".menu").append(
        b("\x3cdiv/\x3e")
          .text(a)
          .click(function () {
            h.remove();
            c();
          }),
      );
    };
    h.nextGroup = function () {
      this.ui.find(".menu").append("\x3chr/\x3e");
    };
    h.prepare();
    return e.addComponent(h);
  },
);
