define("UI/Components/Error/Error", [
  "require",
  "text!./Error.html",
  "text!./Error.css",
  "Vendors/jquery",
], function (a) {
  var b = a("text!./Error.html"),
    c = a("text!./Error.css"),
    d = a("Vendors/jquery");
  return {
    init: function () {
      this.ui = d(b);
      var e = d("style:first");
      e.length ||
        (e = d('\x3cstyle type\x3d"text/css"\x3e\x3c/style\x3e').appendTo(
          "head",
        ));
      e.append("\n" + c);
      d("body").html(this.ui);
      this.ui.css("backgroundImage", "url(" + a.toUrl("./angeling.png") + ")");
    },
    addTrace: function (a) {
      var b = requirejs.toUrl("");
      a = a.stack || a;
      b = b.replace(/\/([^\/]+)$/g, "/");
      a = a.replace(/\n/g, "\x3cbr/\x3e");
      a = a.replace(new RegExp(b, "g"), "");
      a = a.replace(/\?[^\:]+/g, "");
      this.ui || this.init();
      this.ui.find(".trace").append(a + "\x3cbr /\x3e");
    },
  };
});
