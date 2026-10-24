define(
  "UI/Components/WinPopup/WinPopup",
  "require Renderer/Renderer UI/UIManager UI/UIComponent text!./WinPopup.html text!./WinPopup.css".split(
    " ",
  ),
  function (a) {
    var b = a("Renderer/Renderer"),
      c = a("UI/UIManager"),
      d = a("UI/UIComponent"),
      e = a("text!./WinPopup.html");
    a = a("text!./WinPopup.css");
    d = new d("WinPopup", e, a);
    d.init = function () {
      this.ui.css({
        top: (b.height - 120) / 1.5 - 120,
        left: (b.width - 280) / 2,
        zIndex: 100,
      });
    };
    return c.addComponent(d);
  },
);
