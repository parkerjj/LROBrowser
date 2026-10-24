define("Plugins/PluginManager", ["require", "Core/Configs"], function (a) {
  var b = a("Core/Configs");
  return {
    list: [],
    init: function (c) {
      var d, e;
      c = b.get("plugins", {});
      this.list = Object.keys(c);
      c = Array(this.list.length);
      d = 0;
      for (e = this.list.length; d < e; ++d)
        c[d] = "./" + this.list[d] + "/" + this.list[d];
      a(c, function () {
        for (d = 0; d < e; ++d) arguments[d]();
      });
    },
  };
});
