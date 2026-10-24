define(
  "UI/Components/CardIllustration/CardIllustration",
  "require DB/DBManager Core/Client UI/UIManager UI/UIComponent text!./CardIllustration.html text!./CardIllustration.css".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("Core/Client"),
      d = a("UI/UIManager"),
      e = a("UI/UIComponent"),
      m = a("text!./CardIllustration.html");
    a = a("text!./CardIllustration.css");
    e = new e("CardIllustration", m, a);
    e.init = function () {
      this.ui.find(".close").click(this.remove.bind(this));
      this.draggable();
    };
    e.setCard = function (a) {
      this.ui.find(".titlebar .text").text(a.identifiedDiSPlayName);
      this.ui.find(".content").css("backgroundImage", "none");
      c.loadFile(
        b.INTERFACE_PATH + "cardbmp/" + a.illustResourcesName + ".bmp",
        function (a) {
          this.ui.find(".content").css("backgroundImage", "url(" + a + ")");
        }.bind(this),
      );
    };
    return d.addComponent(e);
  },
);
