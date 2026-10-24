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
      A.remove();
      if (!q.intersect) return !1;
      if (1 !== a.which) return !0;
      a.stopImmediatePropagation();
      if (D & A.TYPE.PLACE)
        return (
          A.onUseSkillToPos(
            B.SKID,
            B.useLevel ? B.useLevel : B.level,
            q.world.x,
            q.world.y,
          ),
          !1
        );
      a = l.getOverEntity();
      if (!a || (a.objecttype === t.TYPE_TRAP && !(D & A.TYPE.TRAP))) return !1;
      e(a);
      return !1;
    }
    function e(a) {
      var b;
      switch (a.objecttype) {
        case t.TYPE_MOB:
        case t.TYPE_UNIT:
        case t.TYPE_TRAP:
          b = A.TYPE.ENEMY | A.TYPE.PET;
          break;
        case t.TYPE_HOM:
        case t.TYPE_MERC:
          b = A.TYPE.HOMUN;
          break;
        case t.TYPE_PC:
        case t.TYPE_ELEM:
          b = A.TYPE.FRIEND;
          break;
        default:
          return;
      }
      if (b & D || r.SHIFT || n.noshift)
        if (D === A.TYPE.PET) A.onPetSelected(a.GID);
        else if (!(D & A.TYPE.ENEMY && a === f.Entity))
          A.onUseSkillToId(B.SKID, B.useLevel ? B.useLevel : B.level, a.GID);
    }
    var m = a("DB/DBManager"),
      h = a("DB/Skills/SkillInfo"),
      r = a("Controls/KeyEventHandler"),
      q = a("Controls/MouseEventHandler"),
      k = a("Utils/jquery"),
      g = a("Renderer/Renderer"),
      t = a("Renderer/Entity/Entity"),
      l = a("Renderer/EntityManager"),
      f = a("Engine/SessionStorage"),
      n = a("Preferences/Controls"),
      p = a("UI/UIManager"),
      v = a("UI/UIComponent"),
      u = a("UI/CursorManager"),
      A = new v("SkillTargetSelection");
    A.mouseMode = v.MouseMode.CROSS;
    A.TYPE = {
      ENEMY: 1,
      PLACE: 2,
      SELF: 4,
      FRIEND: 16,
      TRAP: 32,
      TARGET: 51,
      PET: 64,
      HOMUN: 128,
    };
    var D = 0,
      B,
      O,
      C,
      y;
    A.init = function () {
      O = document.createElement("canvas");
      C = document.createElement("canvas");
      y = document.createElement("canvas");
      O.style.position = "absolute";
      O.style.top = "45px";
      O.style.zIndex = 100;
      O.style.borderRadius = "3px";
      O.style.border = "1px solid #555";
      C.style.position = "absolute";
      C.style.bottom = "60px";
      C.style.zIndex = 100;
      C.style.borderRadius = "3px";
      C.style.border = "1px solid #555";
      y.style.position = "absolute";
      y.style.left = 0;
      y.style.top = 0;
      y.style.zIndex = 100;
      k(window).mousemove(function (a) {
        y.style.left = a.pageX + 20 + "px";
        y.style.top = a.pageY - 18 + "px";
      });
      b(m.getMessage(234), C);
      this.ui = k('\x3cdiv id \x3d"SkillTargetSelection"/\x3e');
      this.ui.append();
    };
    A.onAppend = function () {
      var a;
      O.parentNode || document.body.appendChild(O);
      C.parentNode || document.body.appendChild(C);
      y.parentNode || document.body.appendChild(y);
      a = k._data(window, "events").keydown;
      a.unshift(a.pop());
      k(window).one("mousedown.targetselection", d);
      a = k._data(window, "events").mousedown;
      a.unshift(a.pop());
    };
    A.onKeyDown = function (a) {
      return a.which === r.ESCAPE
        ? (this.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    A.onRemove = function () {
      k(window).off("mousedown.targetselection");
      u.blockMagnetism = !1;
      u.freeze = !1;
      u.setType(u.ACTION.DEFAULT);
      l.setSupportPicking(!1);
      O.parentNode && document.body.removeChild(O);
      C.parentNode && document.body.removeChild(C);
      y.parentNode && document.body.removeChild(y);
      q.state = q.MOUSE_STATE.NORMAL;
    };
    A.set = function (a, d, e) {
      D = d;
      B = a;
      if (D) {
        if (f.TouchTargeting && (d = l.getFocusEntity())) {
          if (D & A.TYPE.PLACE)
            A.onUseSkillToPos(
              B.SKID,
              B.useLevel ? B.useLevel : B.level,
              d.position[0],
              d.position[1],
            );
          else
            A.onUseSkillToId(B.SKID, B.useLevel ? B.useLevel : B.level, d.GID);
          A.remove();
          return;
        }
        D & A.TYPE.PLACE && (u.blockMagnetism = !0);
        q.state = q.MOUSE_STATE.USESKILL;
        l.setSupportPicking(0 < (D & A.TYPE.FRIEND));
        a = m.getSkillInfo(a.SKID);
        b(e || a.SkillName, O);
        c(B.useLevel ? B.useLevel : B.level, y);
        u.setType(u.ACTION.TARGET);
        u.freeze = !0;
      }
    };
    A.setSkillLevelDelta = function (a) {
      h[B.SKID].bSeperateLv &&
        (B.useLevel || (B.useLevel = B.level),
        (B.useLevel += a),
        1 > B.useLevel && (B.useLevel = 1),
        B.useLevel > B.level && (B.useLevel = B.level),
        c(B.useLevel, y));
    };
    A.intersectEntityId = function (a) {
      (a = l.get(a)) && e(a);
    };
    A.onUseSkillToId = function () {};
    A.onUseSkillToPos = function () {};
    return p.addComponent(A);
  },
);
