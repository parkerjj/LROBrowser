define(
  "Controls/MapControl",
  "require Utils/jquery DB/DBManager UI/UIManager UI/CursorManager UI/Components/InputBox/InputBox UI/Components/ChatBox/ChatBox UI/Components/Equipment/Equipment Controls/MouseEventHandler Controls/KeyEventHandler Core/Mobile Renderer/Renderer Renderer/Camera Renderer/EntityManager Engine/SessionStorage Preferences/Controls Network/PacketStructure Network/NetworkManager Controls/ScreenShot".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a = (a && a.which) || 1;
      E.moveAction = null;
      if (f.intersect && !f.padOn)
        switch (((O = Date.now()), a)) {
          case 1:
            if (n.SHIFT) {
              E.Entity.lookTo(f.world.x, f.world.y);
              a = new J.CZ.CHANGE_DIRECTION();
              a.headDir = E.Entity.headDir;
              a.dir = E.Entity.direction;
              A.sendPacket(a);
              break;
            }
            a = z.getFocusEntity();
            var b = z.getOverEntity(),
              c = z.get(E.mercGID),
              d = !1;
            a && a != b && (a.onFocusEnd(), z.setFocusEntity(null));
            if (n.ALT && c) {
              if (
                b &&
                b != E.Entity &&
                b != c &&
                ((d = (d = d || b.onMouseDown()) || b.onMercFocus()),
                z.setFocusEntity(b),
                d)
              )
                break;
              a = new J.CZ.REQUEST_MOVENPC();
              a.GID = E.mercGID;
              a.dest[0] = f.world.x;
              a.dest[1] = f.world.y;
              A.sendPacket(a);
            } else {
              if (
                b &&
                b != E.Entity &&
                ((d = (d = d || b.onMouseDown()) || b.onFocus()),
                z.setFocusEntity(b),
                d)
              )
                break;
              if (this.onRequestWalk) this.onRequestWalk();
            }
            break;
          case 3:
            ((B[0] = f.screen.x),
              (B[1] = f.screen.y),
              k.setType(k.ACTION.ROTATE),
              t.rotate(!0));
        }
    }
    function c(a) {
      var b;
      if (f.intersect && !f.padOn)
        switch ((a && a.which) || 1) {
          case 1:
            if ((b = z.getFocusEntity())) {
              b.onMouseUp();
              if ("touchend" == a.type)
                if (
                  O + 600 < Date.now() &&
                  B[0] === f.screen.x &&
                  B[1] === f.screen.y
                ) {
                  if ((b = z.getOverEntity()) && b !== E.Entity)
                    b.onContextMenu();
                  break;
                } else if (this.onRequestWalk) this.onRequestWalk();
              if (!1 === C.noctrl || b.objecttype !== b.constructor.TYPE_MOB)
                (z.setFocusEntity(null), b.onFocusEnd());
            }
            if (this.onRequestStopWalk) this.onRequestStopWalk();
            break;
          case 3:
            if (
              (k.setType(k.ACTION.DEFAULT),
              t.rotate(!1),
              B[0] === f.screen.x &&
                B[1] === f.screen.y &&
                (b = z.getOverEntity()) &&
                b !== E.Entity)
            )
              b.onContextMenu();
        }
    }
    function d(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      t.setZoom(b);
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function m(a) {
      var b, c;
      try {
        c = JSON.parse(a.originalEvent.dataTransfer.getData("Text"));
      } catch (I) {}
      a.stopImmediatePropagation();
      if (!c) return !1;
      c.from && r.getComponent(c.from).ui.trigger("mouseleave");
      if ("item" !== c.type || "Inventory" !== c.from) return !1;
      if (l.ui.is(":visible"))
        return (u.addText(q.getMessage(189), u.TYPE.ERROR), !1);
      b = c.data;
      if (1 < b.count)
        (g.append(),
          g.setType("number", !1, b.count),
          (g.onSubmitRequest = function (a) {
            g.remove();
            F.onRequestDropItem(b.index, parseInt(a, 10));
          }));
      else F.onRequestDropItem(b.index, 1);
      return !1;
    }
    var h = a("Utils/jquery"),
      q = a("DB/DBManager"),
      r = a("UI/UIManager"),
      k = a("UI/CursorManager"),
      g = a("UI/Components/InputBox/InputBox"),
      u = a("UI/Components/ChatBox/ChatBox"),
      l = a("UI/Components/Equipment/Equipment"),
      f = a("Controls/MouseEventHandler"),
      n = a("Controls/KeyEventHandler"),
      p = a("Core/Mobile"),
      v = a("Renderer/Renderer"),
      t = a("Renderer/Camera"),
      z = a("Renderer/EntityManager"),
      E = a("Engine/SessionStorage"),
      C = a("Preferences/Controls"),
      J = a("Network/PacketStructure"),
      A = a("Network/NetworkManager");
    a("Controls/ScreenShot");
    var B = new Int16Array(2),
      F = {},
      O = 0;
    F.onRequestWalk = function () {};
    F.onRequestStopWalk = function () {};
    F.onRequestDropItem = function () {};
    F.init = function () {
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
    return F;
  },
);
