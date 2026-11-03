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
      t = a("Renderer/Entity/Entity"),
      r = a("Renderer/SpriteRenderer"),
      n = new d("SlotMachine"),
      g,
      p,
      l = 0,
      f = !1,
      k,
      q = new t(),
      u = 0;
    n.init = function () {
      this.ui = b("\x3ccanvas/\x3e")
        .attr({ width: 270, height: 260, id: "SlotMachine" })
        .css({
          zIndex: 500,
          position: "absolute",
          top: h.height / 2 - 130,
          left: h.width / 2 - 135,
        });
      k = this.ui[0].getContext("2d");
      e.loadFiles(
        ["data/sprite/slotmachine.spr", "data/sprite/slotmachine.act"],
        function (a, b) {
          g = a;
          p = b;
          l = 0;
          u = h.tick;
          this.ui[0].parentNode && h.render(v);
        }.bind(this),
      );
      this.ui.mousedown(function (a) {
        if (0 === l) return (n.onTry(), a.stopImmediatePropagation(), !1);
      });
    };
    n.onAppend = function () {
      l = 0;
      u = h.tick;
      g && p && h.render(v);
    };
    n.onRemove = function () {
      h.stop(v);
    };
    n.setResult = function (a) {
      l = 1;
      f = a;
      u = h.tick;
    };
    var v = (function () {
      var a = new Uint16Array([0, 0]);
      return function B() {
        var b, c, d;
        switch (l) {
          case 0:
            c = p.actions[0];
            d = Math.floor(((h.tick - u) / c.delay) * 2);
            break;
          case 1:
            c = p.actions[1];
            b = c.animations.length + (f ? 7 : 3);
            d = h.tick - u;
            d = Math.floor(d / c.delay);
            d = Math.min(d, b);
            d === b && ((l = f ? 2 : 3), (u = h.tick));
            break;
          case 2:
          case 3:
            ((c = p.actions[l]),
              (b = c.animations.length),
              (d = h.tick - u),
              (d = Math.floor(d / c.delay)),
              d >= b &&
                (h.stop(B),
                m.setTimeout(function () {
                  n.remove();
                }, 500)));
        }
        d = c.animations[d % c.animations.length];
        r.bind2DContext(k, 140, 165);
        k.clearRect(0, 0, k.canvas.width, k.canvas.height);
        b = 0;
        for (c = d.layers.length; b < c; ++b)
          q.renderLayer(d.layers[b], g, g, 1, a, !1);
      };
    })();
    n.onTry = function () {};
    return c.addComponent(n);
  },
);
