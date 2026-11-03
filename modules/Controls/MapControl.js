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
        switch (((P = Date.now()), a)) {
          case 1:
            if (m.SHIFT) {
              D.Entity.lookTo(f.world.x, f.world.y);
              a = new H.CZ.CHANGE_DIRECTION();
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
            if (m.ALT && c) {
              if (
                b &&
                b != D.Entity &&
                b != c &&
                ((d = (d = d || b.onMouseDown()) || b.onMercFocus()),
                A.setFocusEntity(b),
                d)
              )
                break;
              a = new H.CZ.REQUEST_MOVENPC();
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
            ((z[0] = f.screen.x),
              (z[1] = f.screen.y),
              n.setType(n.ACTION.ROTATE),
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
                  P + 600 < Date.now() &&
                  z[0] === f.screen.x &&
                  z[1] === f.screen.y
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
              (n.setType(n.ACTION.DEFAULT),
              u.rotate(!1),
              z[0] === f.screen.x &&
                z[1] === f.screen.y &&
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
    function l(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (J) {}
      a.stopImmediatePropagation();
      if (!c) return !1;
      c.from && t.getComponent(c.from).ui.trigger("mouseleave");
      if ("item" !== c.type || "Inventory" !== c.from) return !1;
      if (k.ui.is(":visible"))
        return (p.addText(r.getMessage(189), p.TYPE.ERROR), !1);
      b = c.data;
      if (1 < b.count)
        (g.append(),
          g.setType("number", !1, b.count),
          (g.onSubmitRequest = function (a) {
            g.remove();
            G.onRequestDropItem(b.index, parseInt(a, 10));
          }));
      else G.onRequestDropItem(b.index, 1);
      return !1;
    }
    var h = a("Utils/jquery"),
      r = a("DB/DBManager"),
      t = a("UI/UIManager"),
      n = a("UI/CursorManager"),
      g = a("UI/Components/InputBox/InputBox"),
      p = a("UI/Components/ChatBox/ChatBox"),
      k = a("UI/Components/Equipment/Equipment"),
      f = a("Controls/MouseEventHandler"),
      m = a("Controls/KeyEventHandler"),
      q = a("Core/Mobile"),
      v = a("Renderer/Renderer"),
      u = a("Renderer/Camera"),
      A = a("Renderer/EntityManager"),
      D = a("Engine/SessionStorage"),
      B = a("Preferences/Controls"),
      H = a("Network/PacketStructure"),
      C = a("Network/NetworkManager");
    a("Controls/ScreenShot");
    var z = new Int16Array(2),
      G = {},
      P = 0;
    G.onRequestWalk = function () {};
    G.onRequestStopWalk = function () {};
    G.onRequestDropItem = function () {};
    G.init = function () {
      q.init();
      q.onTouchStart = b.bind(this);
      q.onTouchEnd = c.bind(this);
      h(v.canvas)
        .on("mousewheel DOMMouseScroll", d)
        .on("dragover", e)
        .on("drop", l.bind(this));
      h(window)
        .on("mousedown.map", b.bind(this))
        .on("mouseup.map", c.bind(this));
    };
    return G;
  },
);
