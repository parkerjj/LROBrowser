define(
  "UI/Components/Announce/Announce",
  "require Utils/jquery Core/Events Renderer/Renderer UI/UIManager UI/UIComponent".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/jquery"),
      c = a("Core/Events"),
      d = a("Renderer/Renderer"),
      e = a("UI/UIManager");
    a = a("UI/UIComponent");
    var l = new a("Announce");
    l.mouseMode = a.MouseMode.CROSS;
    l.needFocus = !1;
    l.init = function () {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.ui = b(this.canvas);
      this.ui
        .attr("id", "Announce")
        .css({ position: "absolute", top: 120, zIndex: 50 });
    };
    l.onRemove = function () {};
    l.timeEnd = function () {
      this.remove();
    };
    l.set = function (a, b) {
      var e = [],
        h = 0,
        g,
        l,
        k;
      for (this.ctx.font = "12px serif"; a.length;) {
        for (l = a.length; 450 < this.ctx.measureText(a.substr(0, l)).width;)
          l--;
        g = a.substr(0, l);
        if (l !== a.length)
          for (k = 0; -1 !== g.indexOf(" ", k);) k = g.indexOf(" ", k) + 1;
        e.push(g.substr(0, k || g.length));
        h = Math.max(h, this.ctx.measureText(e[e.length - 1]).width);
        a = a.substr(e[e.length - 1].length, a.length);
      }
      this.canvas.width = 20 + h;
      this.canvas.height = 10 + 17 * e.length;
      this.canvas.style.left = ((d.width - this.canvas.width) >> 1) + "px";
      this.ctx.font = "12px serif";
      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = b || "#FFFF00";
      l = 0;
      for (a = e.length; l < a; ++l) this.ctx.fillText(e[l], 10, 17 + 17 * l);
      this.timer = c.setTimeout(this.timeEnd.bind(this), 3e3);
    };
    return e.addComponent(l);
  },
);
