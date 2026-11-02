define(
  "UI/Components/SkillTargetSelection/SkillTargetSelection",
  "require DB/DBManager DB/Skills/SkillInfo Controls/KeyEventHandler Controls/MouseEventHandler Utils/jquery Renderer/Renderer Renderer/Entity/Entity Renderer/EntityManager Engine/SessionStorage Preferences/Controls UI/UIManager UI/UIComponent UI/CursorManager".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      var c = b.getContext("2d");
      c.font = "12px Arial";
      b.width = c.measureText(a).width + 14;
      b.height = 23;
      c.font = "12px Arial";
      c.clearRect(0, 0, b.width, b.height);
      c.fillStyle = "rgba(0,0,0,0.5)";
      c.fillRect(0, 0, b.width, b.height);
      c.fillStyle = "black";
      c.fillText(a, 8, 17);
      c.fillStyle = "#00FF00";
      c.fillText(a, 7, 16);
      b.style.left = ((g.width - b.width) >> 1) + "px";
    }
    function c(a, b) {
      var c = b.getContext("2d");
      b.width = 35;
      b.height = 35;
      c.font = "18px Arial";
      c.strokeStyle = "#333333";
      c.lineWidth = 3;
      c.strokeText(a, 0, 30);
      c.fillStyle = "white";
      c.fillText(a, 0, 30);
    }
    function d(a) {
      z.remove();
      if (!r.intersect) return !1;
      if (1 !== a.which) return !0;
      a.stopImmediatePropagation();
      if (E & z.TYPE.PLACE)
        return (
          z.onUseSkillToPos(
            C.SKID,
            C.useLevel ? C.useLevel : C.level,
            r.world.x,
            r.world.y,
          ),
          !1
        );
      a = l.getOverEntity();
      if (!a || (a.objecttype === u.TYPE_TRAP && !(E & z.TYPE.TRAP))) return !1;
      e(a);
      return !1;
    }
    function e(a) {
      var b;
      switch (a.objecttype) {
        case u.TYPE_MOB:
        case u.TYPE_UNIT:
        case u.TYPE_TRAP:
          b = z.TYPE.ENEMY | z.TYPE.PET;
          break;
        case u.TYPE_HOM:
        case u.TYPE_MERC:
          b = z.TYPE.HOMUN;
          break;
        case u.TYPE_PC:
        case u.TYPE_ELEM:
          b = z.TYPE.FRIEND;
          break;
        default:
          return;
      }
      if (b & E || q.SHIFT || n.noshift)
        if (E === z.TYPE.PET) z.onPetSelected(a.GID);
        else if (!(E & z.TYPE.ENEMY && a === f.Entity))
          z.onUseSkillToId(C.SKID, C.useLevel ? C.useLevel : C.level, a.GID);
    }
    var m = a("DB/DBManager"),
      h = a("DB/Skills/SkillInfo"),
      q = a("Controls/KeyEventHandler"),
      r = a("Controls/MouseEventHandler"),
      k = a("Utils/jquery"),
      g = a("Renderer/Renderer"),
      u = a("Renderer/Entity/Entity"),
      l = a("Renderer/EntityManager"),
      f = a("Engine/SessionStorage"),
      n = a("Preferences/Controls"),
      p = a("UI/UIManager"),
      v = a("UI/UIComponent"),
      t = a("UI/CursorManager"),
      z = new v("SkillTargetSelection");
    z.mouseMode = v.MouseMode.CROSS;
    z.TYPE = {
      ENEMY: 1,
      PLACE: 2,
      SELF: 4,
      FRIEND: 16,
      TRAP: 32,
      TARGET: 51,
      PET: 64,
      HOMUN: 128,
    };
    var E = 0,
      C,
      J,
      A,
      B;
    z.init = function () {
      J = document.createElement("canvas");
      A = document.createElement("canvas");
      B = document.createElement("canvas");
      J.style.position = "absolute";
      J.style.top = "45px";
      J.style.zIndex = 100;
      J.style.borderRadius = "3px";
      J.style.border = "1px solid #555";
      A.style.position = "absolute";
      A.style.bottom = "60px";
      A.style.zIndex = 100;
      A.style.borderRadius = "3px";
      A.style.border = "1px solid #555";
      B.style.position = "absolute";
      B.style.left = 0;
      B.style.top = 0;
      B.style.zIndex = 100;
      k(window).mousemove(function (a) {
        B.style.left = a.pageX + 20 + "px";
        B.style.top = a.pageY - 18 + "px";
      });
      b(m.getMessage(234), A);
      this.ui = k('\x3cdiv id \x3d"SkillTargetSelection"/\x3e');
      this.ui.append();
    };
    z.onAppend = function () {
      var a;
      J.parentNode || document.body.appendChild(J);
      A.parentNode || document.body.appendChild(A);
      B.parentNode || document.body.appendChild(B);
      a = k._data(window, "events").keydown;
      a.unshift(a.pop());
      k(window).one("mousedown.targetselection", d);
      a = k._data(window, "events").mousedown;
      a.unshift(a.pop());
    };
    z.onKeyDown = function (a) {
      return a.which === q.ESCAPE
        ? (this.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    z.onRemove = function () {
      k(window).off("mousedown.targetselection");
      t.blockMagnetism = !1;
      t.freeze = !1;
      t.setType(t.ACTION.DEFAULT);
      l.setSupportPicking(!1);
      J.parentNode && document.body.removeChild(J);
      A.parentNode && document.body.removeChild(A);
      B.parentNode && document.body.removeChild(B);
      r.state = r.MOUSE_STATE.NORMAL;
    };
    z.set = function (a, d, e) {
      E = d;
      C = a;
      if (E) {
        if (f.TouchTargeting && (d = l.getFocusEntity())) {
          if (E & z.TYPE.PLACE)
            z.onUseSkillToPos(
              C.SKID,
              C.useLevel ? C.useLevel : C.level,
              d.position[0],
              d.position[1],
            );
          else
            z.onUseSkillToId(C.SKID, C.useLevel ? C.useLevel : C.level, d.GID);
          z.remove();
          return;
        }
        E & z.TYPE.PLACE && (t.blockMagnetism = !0);
        r.state = r.MOUSE_STATE.USESKILL;
        l.setSupportPicking(0 < (E & z.TYPE.FRIEND));
        a = m.getSkillInfo(a.SKID);
        b(e || a.SkillName, J);
        c(C.useLevel ? C.useLevel : C.level, B);
        t.setType(t.ACTION.TARGET);
        t.freeze = !0;
      }
    };
    z.setSkillLevelDelta = function (a) {
      h[C.SKID].bSeperateLv &&
        (C.useLevel || (C.useLevel = C.level),
        (C.useLevel += a),
        1 > C.useLevel && (C.useLevel = 1),
        C.useLevel > C.level && (C.useLevel = C.level),
        c(C.useLevel, B));
    };
    z.intersectEntityId = function (a) {
      (a = l.get(a)) && e(a);
    };
    z.onUseSkillToId = function () {};
    z.onUseSkillToPos = function () {};
    return p.addComponent(z);
  },
);
