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
      m = a("Core/Events"),
      h = a("Renderer/Renderer"),
      r = a("Renderer/Entity/Entity"),
      q = a("Renderer/SpriteRenderer"),
      k = new d("SlotMachine"),
      g,
      t,
      l = 0,
      f = !1,
      n,
      p = new r(),
      v = 0;
    k.init = function () {
      this.ui = b("\x3ccanvas/\x3e")
        .attr({ width: 270, height: 260, id: "SlotMachine" })
        .css({
          zIndex: 500,
          position: "absolute",
          top: h.height / 2 - 130,
          left: h.width / 2 - 135,
        });
      n = this.ui[0].getContext("2d");
      e.loadFiles(
        ["data/sprite/slotmachine.spr", "data/sprite/slotmachine.act"],
        function (a, b) {
          g = a;
          t = b;
          l = 0;
          v = h.tick;
          this.ui[0].parentNode && h.render(u);
        }.bind(this),
      );
      this.ui.mousedown(function (a) {
        if (0 === l) return (k.onTry(), a.stopImmediatePropagation(), !1);
      });
    };
    k.onAppend = function () {
      l = 0;
      v = h.tick;
      g && t && h.render(u);
    };
    k.onRemove = function () {
      h.stop(u);
    };
    k.setResult = function (a) {
      l = 1;
      f = a;
      v = h.tick;
    };
    var u = (function () {
      var a = new Uint16Array([0, 0]);
      return function B() {
        var b, c, d;
        switch (l) {
          case 0:
            c = t.actions[0];
            d = Math.floor(((h.tick - v) / c.delay) * 2);
            break;
          case 1:
            c = t.actions[1];
            b = c.animations.length + (f ? 7 : 3);
            d = h.tick - v;
            d = Math.floor(d / c.delay);
            d = Math.min(d, b);
            d === b && ((l = f ? 2 : 3), (v = h.tick));
            break;
          case 2:
          case 3:
            ((c = t.actions[l]),
              (b = c.animations.length),
              (d = h.tick - v),
              (d = Math.floor(d / c.delay)),
              d >= b &&
                (h.stop(B),
                m.setTimeout(function () {
                  k.remove();
                }, 500)));
        }
        d = c.animations[d % c.animations.length];
        q.bind2DContext(n, 140, 165);
        n.clearRect(0, 0, n.canvas.width, n.canvas.height);
        b = 0;
        for (c = d.layers.length; b < c; ++b)
          p.renderLayer(d.layers[b], g, g, 1, a, !1);
      };
    })();
    k.onTry = function () {};
    return c.addComponent(k);
  },
);
