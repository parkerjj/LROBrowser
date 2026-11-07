define(
  "UI/Components/SkillDescription/SkillDescription",
  "require DB/DBManager Utils/jquery Renderer/Renderer Controls/KeyEventHandler Controls/MouseEventHandler UI/UIManager UI/UIComponent text!./SkillDescription.html text!./SkillDescription.css".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("Utils/jquery");
    a("Renderer/Renderer");
    var d = a("Controls/KeyEventHandler"),
      e = a("Controls/MouseEventHandler"),
      m = a("UI/UIManager"),
      h = a("UI/UIComponent"),
      r = a("text!./SkillDescription.html");
    a = a("text!./SkillDescription.css");
    h = new h("SkillDescription", r, a);
    h.uid = -1;
    h.onKeyDown = function (a) {
      return a.which === d.ESCAPE
        ? (this.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    h.onAppend = function () {
      var a = c._data(window, "events").keydown;
      a.unshift(a.pop());
    };
    h.onRemove = function () {
      this.uid = -1;
    };
    h.init = function () {
      this.ui.find(".close").click(
        function () {
          this.remove();
        }.bind(this),
      );
      this.draggable(this.ui.find(".titlebar"));
    };
    h.setSkill = function (a) {
      this.uid = a;
      this.ui.find(".content").text(b.getSkillDesc(a) || "...");
      this.ui.css({ top: e.screen.y + 10, left: e.screen.x + 10 });
    };
    return m.addComponent(h);
  },
);
