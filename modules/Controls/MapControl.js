define(
  "Controls/MapControl",
  "require Utils/jquery DB/DBManager UI/UIManager UI/CursorManager UI/Components/InputBox/InputBox UI/Components/ChatBox/ChatBox UI/Components/Equipment/Equipment Controls/MouseEventHandler Controls/KeyEventHandler Core/Mobile Renderer/Renderer Renderer/Camera Renderer/EntityManager Engine/SessionStorage Preferences/Controls Network/PacketStructure Network/NetworkManager Controls/ScreenShot".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a = (a && a.which) || 1;
      C.moveAction = null;
      if (f.intersect && !f.padOn)
        switch (((N = Date.now()), a)) {
          case 1:
            if (k.SHIFT) {
              C.Entity.lookTo(f.world.x, f.world.y);
              a = new J.CZ.CHANGE_DIRECTION();
              a.headDir = C.Entity.headDir;
              a.dir = C.Entity.direction;
              D.sendPacket(a);
              break;
            }
            a = A.getFocusEntity();
            var b = A.getOverEntity(),
              c = A.get(C.mercGID),
              d = !1;
            a && a != b && (a.onFocusEnd(), A.setFocusEntity(null));
            if (k.ALT && c) {
              if (
                b &&
                b != C.Entity &&
                b != c &&
                ((d = (d = d || b.onMouseDown()) || b.onMercFocus()),
                A.setFocusEntity(b),
                d)
              )
                break;
              a = new J.CZ.REQUEST_MOVENPC();
              a.GID = C.mercGID;
              a.dest[0] = f.world.x;
              a.dest[1] = f.world.y;
              D.sendPacket(a);
            } else {
              if (
                b &&
                b != C.Entity &&
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
              n.setType(n.ACTION.ROTATE),
              v.rotate(!0));
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
                  N + 600 < Date.now() &&
                  y[0] === f.screen.x &&
                  y[1] === f.screen.y
                ) {
                  if ((b = A.getOverEntity()) && b !== C.Entity)
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
              v.rotate(!1),
              y[0] === f.screen.x &&
                y[1] === f.screen.y &&
                (b = A.getOverEntity()) &&
                b !== C.Entity)
            )
              b.onContextMenu();
        }
    }
    function d(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      v.setZoom(b);
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function m(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (K) {}
      a.stopImmediatePropagation();
      if (!c) return !1;
      c.from && r.getComponent(c.from).ui.trigger("mouseleave");
      if ("item" !== c.type || "Inventory" !== c.from) return !1;
      if (l.ui.is(":visible"))
        return (p.addText(t.getMessage(189), p.TYPE.ERROR), !1);
      b = c.data;
      if (1 < b.count)
        (g.append(),
          g.setType("number", !1, b.count),
          (g.onSubmitRequest = function (a) {
            g.remove();
            H.onRequestDropItem(b.index, parseInt(a, 10));
          }));
      else H.onRequestDropItem(b.index, 1);
      return !1;
    }
    var h = a("Utils/jquery"),
      t = a("DB/DBManager"),
      r = a("UI/UIManager"),
      n = a("UI/CursorManager"),
      g = a("UI/Components/InputBox/InputBox"),
      p = a("UI/Components/ChatBox/ChatBox"),
      l = a("UI/Components/Equipment/Equipment"),
      f = a("Controls/MouseEventHandler"),
      k = a("Controls/KeyEventHandler"),
      q = a("Core/Mobile"),
      u = a("Renderer/Renderer"),
      v = a("Renderer/Camera"),
      A = a("Renderer/EntityManager"),
      C = a("Engine/SessionStorage"),
      B = a("Preferences/Controls"),
      J = a("Network/PacketStructure"),
      D = a("Network/NetworkManager");
    a("Controls/ScreenShot");
    var y = new Int16Array(2),
      H = {},
      N = 0;
    H.onRequestWalk = function () {};
    H.onRequestStopWalk = function () {};
    H.onRequestDropItem = function () {};
    H.init = function () {
      q.init();
      q.onTouchStart = b.bind(this);
      q.onTouchEnd = c.bind(this);
      h(u.canvas)
        .on("mousewheel DOMMouseScroll", d)
        .on("dragover", e)
        .on("drop", m.bind(this));
      h(window)
        .on("mousedown.map", b.bind(this))
        .on("mouseup.map", c.bind(this));
    };
    return H;
  },
);
