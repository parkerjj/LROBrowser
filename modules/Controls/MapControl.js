define(
  "Controls/MapControl",
  "require Utils/jquery DB/DBManager UI/UIManager UI/CursorManager UI/Components/InputBox/InputBox UI/Components/ChatBox/ChatBox UI/Components/Equipment/Equipment Controls/MouseEventHandler Controls/KeyEventHandler Core/Mobile Renderer/Renderer Renderer/Camera Renderer/EntityManager Engine/SessionStorage Preferences/Controls Network/PacketStructure Network/NetworkManager Controls/ScreenShot".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a = (a && a.which) || 1;
      D.moveAction = null;
      if (f.intersect && !f.padOn)
        switch (((J = Date.now()), a)) {
          case 1:
            if (n.SHIFT) {
              D.Entity.lookTo(f.world.x, f.world.y);
              a = new O.CZ.CHANGE_DIRECTION();
              a.headDir = D.Entity.headDir;
              a.dir = D.Entity.direction;
              C.sendPacket(a);
              break;
            }
            a = A.getFocusEntity();
            var b = A.getOverEntity(),
              c = A.get(D.mercGID),
              d = !1;
            a && a != b && (a.onFocusEnd(), A.setFocusEntity(null));
            if (n.ALT && c) {
              if (
                b &&
                b != D.Entity &&
                b != c &&
                ((d = (d = d || b.onMouseDown()) || b.onMercFocus()),
                A.setFocusEntity(b),
                d)
              )
                break;
              a = new O.CZ.REQUEST_MOVENPC();
              a.GID = D.mercGID;
              a.dest[0] = f.world.x;
              a.dest[1] = f.world.y;
              C.sendPacket(a);
            } else {
              if (
                b &&
                b != D.Entity &&
                ((d = (d = d || b.onMouseDown()) || b.onFocus()),
                A.setFocusEntity(b),
                d)
              )
                break;
              if (this.onRequestWalk) this.onRequestWalk();
            }
            break;
          case 3:
            ((y[0] = f.screen.x),
              (y[1] = f.screen.y),
              k.setType(k.ACTION.ROTATE),
              u.rotate(!0));
        }
    }
    function c(a) {
      var b;
      if (f.intersect && !f.padOn)
        switch ((a && a.which) || 1) {
          case 1:
            if ((b = A.getFocusEntity())) {
              b.onMouseUp();
              if ("touchend" == a.type)
                if (
                  J + 600 < Date.now() &&
                  y[0] === f.screen.x &&
                  y[1] === f.screen.y
                ) {
                  if ((b = A.getOverEntity()) && b !== D.Entity)
                    b.onContextMenu();
                  break;
                } else if (this.onRequestWalk) this.onRequestWalk();
              if (!1 === B.noctrl || b.objecttype !== b.constructor.TYPE_MOB)
                (A.setFocusEntity(null), b.onFocusEnd());
            }
            if (this.onRequestStopWalk) this.onRequestStopWalk();
            break;
          case 3:
            if (
              (k.setType(k.ACTION.DEFAULT),
              u.rotate(!1),
              y[0] === f.screen.x &&
                y[1] === f.screen.y &&
                (b = A.getOverEntity()) &&
                b !== D.Entity)
            )
              b.onContextMenu();
        }
    }
    function d(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      u.setZoom(b);
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function m(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (M) {}
      a.stopImmediatePropagation();
      if (!c) return !1;
      c.from && q.getComponent(c.from).ui.trigger("mouseleave");
      if ("item" !== c.type || "Inventory" !== c.from) return !1;
      if (l.ui.is(":visible"))
        return (t.addText(r.getMessage(189), t.TYPE.ERROR), !1);
      b = c.data;
      if (1 < b.count)
        (g.append(),
          g.setType("number", !1, b.count),
          (g.onSubmitRequest = function (a) {
            g.remove();
            z.onRequestDropItem(b.index, parseInt(a, 10));
          }));
      else z.onRequestDropItem(b.index, 1);
      return !1;
    }
    var h = a("Utils/jquery"),
      r = a("DB/DBManager"),
      q = a("UI/UIManager"),
      k = a("UI/CursorManager"),
      g = a("UI/Components/InputBox/InputBox"),
      t = a("UI/Components/ChatBox/ChatBox"),
      l = a("UI/Components/Equipment/Equipment"),
      f = a("Controls/MouseEventHandler"),
      n = a("Controls/KeyEventHandler"),
      p = a("Core/Mobile"),
      v = a("Renderer/Renderer"),
      u = a("Renderer/Camera"),
      A = a("Renderer/EntityManager"),
      D = a("Engine/SessionStorage"),
      B = a("Preferences/Controls"),
      O = a("Network/PacketStructure"),
      C = a("Network/NetworkManager");
    a("Controls/ScreenShot");
    var y = new Int16Array(2),
      z = {},
      J = 0;
    z.onRequestWalk = function () {};
    z.onRequestStopWalk = function () {};
    z.onRequestDropItem = function () {};
    z.init = function () {
      p.init();
      p.onTouchStart = b.bind(this);
      p.onTouchEnd = c.bind(this);
      h(v.canvas)
        .on("mousewheel DOMMouseScroll", d)
        .on("dragover", e)
        .on("drop", m.bind(this));
      h(window)
        .on("mousedown.map", b.bind(this))
        .on("mouseup.map", c.bind(this));
    };
    return z;
  },
);
