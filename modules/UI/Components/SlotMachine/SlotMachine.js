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
      q = a("Renderer/Entity/Entity"),
      r = a("Renderer/SpriteRenderer"),
      k = new d("SlotMachine"),
      g,
      u,
      l = 0,
      f = !1,
      n,
      p = new q(),
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
          u = b;
          l = 0;
          v = h.tick;
          this.ui[0].parentNode && h.render(t);
        }.bind(this),
      );
      this.ui.mousedown(function (a) {
        if (0 === l) return (k.onTry(), a.stopImmediatePropagation(), !1);
      });
    };
    k.onAppend = function () {
      l = 0;
      v = h.tick;
      g && u && h.render(t);
    };
    k.onRemove = function () {
      h.stop(t);
    };
    k.setResult = function (a) {
      l = 1;
      f = a;
      v = h.tick;
    };
    var t = (function () {
      var a = new Uint16Array([0, 0]);
      return function C() {
        var b, c, d;
        switch (l) {
          case 0:
            c = u.actions[0];
            d = Math.floor(((h.tick - v) / c.delay) * 2);
            break;
          case 1:
            c = u.actions[1];
            b = c.animations.length + (f ? 7 : 3);
            d = h.tick - v;
            d = Math.floor(d / c.delay);
            d = Math.min(d, b);
            d === b && ((l = f ? 2 : 3), (v = h.tick));
            break;
          case 2:
          case 3:
            ((c = u.actions[l]),
              (b = c.animations.length),
              (d = h.tick - v),
              (d = Math.floor(d / c.delay)),
              d >= b &&
                (h.stop(C),
                m.setTimeout(function () {
                  k.remove();
                }, 500)));
        }
        d = c.animations[d % c.animations.length];
        r.bind2DContext(n, 140, 165);
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
