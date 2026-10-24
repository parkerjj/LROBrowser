define("UI/Components/EntityRoom/EntityRoom", [
  "require",
  "UI/UIManager",
  "UI/UIComponent",
  "text!./EntityRoom.html",
  "text!./EntityRoom.css",
], function (a) {
  var b = a("UI/UIManager"),
    c = a("UI/UIComponent"),
    d = a("text!./EntityRoom.html");
  a = a("text!./EntityRoom.css");
  c = new c("EntityRoom", d, a);
  c.needFocus = !1;
  c.onAppend = function () {
    this.ui.find("button").dblclick(
      function () {
        if (this.onEnter) this.onEnter();
      }.bind(this),
    );
    this.ui.mousedown(function () {
      return !1;
    });
    this.ui.css("zIndex", 45);
  };
  c.onRemove = function () {
    this.ui.find("button").unbind();
  };
  c.setTitle = function (a, b) {
    this.ui.find("button").css("backgroundImage", "url(" + b + ")");
    this.ui.find(".title, .overlay").text(a);
  };
  c.onEnter = function () {};
  return b.addComponent(c);
});
