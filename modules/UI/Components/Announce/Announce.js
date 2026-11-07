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
    var m = new a("Announce");
    m.mouseMode = a.MouseMode.CROSS;
    m.needFocus = !1;
    m.init = function () {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.ui = b(this.canvas);
      this.ui
        .attr("id", "Announce")
        .css({ position: "absolute", top: 120, zIndex: 50 });
    };
    m.onRemove = function () {};
    m.timeEnd = function () {
      this.remove();
    };
    m.set = function (a, b) {
      var e = [],
        h = 0,
        g,
        m,
        l;
      for (this.ctx.font = "12px serif"; a.length;) {
        for (m = a.length; 450 < this.ctx.measureText(a.substr(0, m)).width;)
          m--;
        g = a.substr(0, m);
        if (m !== a.length)
          for (l = 0; -1 !== g.indexOf(" ", l);) l = g.indexOf(" ", l) + 1;
        e.push(g.substr(0, l || g.length));
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
      m = 0;
      for (a = e.length; m < a; ++m) this.ctx.fillText(e[m], 10, 17 + 17 * m);
      this.timer = c.setTimeout(this.timeEnd.bind(this), 3e3);
    };
    return e.addComponent(m);
  },
);
