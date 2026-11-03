define(
  "UI/Components/SlotMachine/SlotMachine",
  "require Utils/jquery UI/UIManager UI/UIComponent Core/Client Core/Events Renderer/Renderer Renderer/Entity/Entity Renderer/SpriteRenderer".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/jquery"),
      c = a("UI/UIManager"),
      d = a("UI/UIComponent"),
      e = a("Core/Client"),
      l = a("Core/Events"),
      h = a("Renderer/Renderer"),
      r = a("Renderer/Entity/Entity"),
      t = a("Renderer/SpriteRenderer"),
      n = new d("SlotMachine"),
      g,
      p,
      k = 0,
      f = !1,
      m,
      q = new r(),
      v = 0;
    n.init = function () {
      this.ui = b("\x3ccanvas/\x3e")
        .attr({ width: 270, height: 260, id: "SlotMachine" })
        .css({
          zIndex: 500,
          position: "absolute",
          top: h.height / 2 - 130,
          left: h.width / 2 - 135,
        });
      m = this.ui[0].getContext("2d");
      e.loadFiles(
        ["data/sprite/slotmachine.spr", "data/sprite/slotmachine.act"],
        function (a, b) {
          g = a;
          p = b;
          k = 0;
          v = h.tick;
          this.ui[0].parentNode && h.render(u);
        }.bind(this),
      );
      this.ui.mousedown(function (a) {
        if (0 === k) return (n.onTry(), a.stopImmediatePropagation(), !1);
      });
    };
    n.onAppend = function () {
      k = 0;
      v = h.tick;
      g && p && h.render(u);
    };
    n.onRemove = function () {
      h.stop(u);
    };
    n.setResult = function (a) {
      k = 1;
      f = a;
      v = h.tick;
    };
    var u = (function () {
      var a = new Uint16Array([0, 0]);
      return function B() {
        var b, c, d;
        switch (k) {
          case 0:
            c = p.actions[0];
            d = Math.floor(((h.tick - v) / c.delay) * 2);
            break;
          case 1:
            c = p.actions[1];
            b = c.animations.length + (f ? 7 : 3);
            d = h.tick - v;
            d = Math.floor(d / c.delay);
            d = Math.min(d, b);
            d === b && ((k = f ? 2 : 3), (v = h.tick));
            break;
          case 2:
          case 3:
            ((c = p.actions[k]),
              (b = c.animations.length),
              (d = h.tick - v),
              (d = Math.floor(d / c.delay)),
              d >= b &&
                (h.stop(B),
                l.setTimeout(function () {
                  n.remove();
                }, 500)));
        }
        d = c.animations[d % c.animations.length];
        t.bind2DContext(m, 140, 165);
        m.clearRect(0, 0, m.canvas.width, m.canvas.height);
        b = 0;
        for (c = d.layers.length; b < c; ++b)
          q.renderLayer(d.layers[b], g, g, 1, a, !1);
      };
    })();
    n.onTry = function () {};
    return c.addComponent(n);
  },
);
