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
      if (!t.intersect) return !1;
      if (1 !== a.which) return !0;
      a.stopImmediatePropagation();
      if (D & A.TYPE.PLACE)
        return (
          A.onUseSkillToPos(
            B.SKID,
            B.useLevel ? B.useLevel : B.level,
            t.world.x,
            t.world.y,
          ),
          !1
        );
      a = k.getOverEntity();
      if (!a || (a.objecttype === p.TYPE_TRAP && !(D & A.TYPE.TRAP))) return !1;
      e(a);
      return !1;
    }
    function e(a) {
      var b;
      switch (a.objecttype) {
        case p.TYPE_MOB:
        case p.TYPE_UNIT:
        case p.TYPE_TRAP:
          b = A.TYPE.ENEMY | A.TYPE.PET;
          break;
        case p.TYPE_HOM:
        case p.TYPE_MERC:
          b = A.TYPE.HOMUN;
          break;
        case p.TYPE_PC:
        case p.TYPE_ELEM:
          b = A.TYPE.FRIEND;
          break;
        default:
          return;
      }
      if (b & D || r.SHIFT || m.noshift)
        if (D === A.TYPE.PET) A.onPetSelected(a.GID);
        else if (!(D & A.TYPE.ENEMY && a === f.Entity))
          A.onUseSkillToId(B.SKID, B.useLevel ? B.useLevel : B.level, a.GID);
    }
    var l = a("DB/DBManager"),
      h = a("DB/Skills/SkillInfo"),
      r = a("Controls/KeyEventHandler"),
      t = a("Controls/MouseEventHandler"),
      n = a("Utils/jquery"),
      g = a("Renderer/Renderer"),
      p = a("Renderer/Entity/Entity"),
      k = a("Renderer/EntityManager"),
      f = a("Engine/SessionStorage"),
      m = a("Preferences/Controls"),
      q = a("UI/UIManager"),
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
      H,
      C,
      z;
    A.init = function () {
      H = document.createElement("canvas");
      C = document.createElement("canvas");
      z = document.createElement("canvas");
      H.style.position = "absolute";
      H.style.top = "45px";
      H.style.zIndex = 100;
      H.style.borderRadius = "3px";
      H.style.border = "1px solid #555";
      C.style.position = "absolute";
      C.style.bottom = "60px";
      C.style.zIndex = 100;
      C.style.borderRadius = "3px";
      C.style.border = "1px solid #555";
      z.style.position = "absolute";
      z.style.left = 0;
      z.style.top = 0;
      z.style.zIndex = 100;
      n(window).mousemove(function (a) {
        z.style.left = a.pageX + 20 + "px";
        z.style.top = a.pageY - 18 + "px";
      });
      b(l.getMessage(234), C);
      this.ui = n('\x3cdiv id \x3d"SkillTargetSelection"/\x3e');
      this.ui.append();
    };
    A.onAppend = function () {
      var a;
      H.parentNode || document.body.appendChild(H);
      C.parentNode || document.body.appendChild(C);
      z.parentNode || document.body.appendChild(z);
      a = n._data(window, "events").keydown;
      a.unshift(a.pop());
      n(window).one("mousedown.targetselection", d);
      a = n._data(window, "events").mousedown;
      a.unshift(a.pop());
    };
    A.onKeyDown = function (a) {
      return a.which === r.ESCAPE
        ? (this.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    A.onRemove = function () {
      n(window).off("mousedown.targetselection");
      u.blockMagnetism = !1;
      u.freeze = !1;
      u.setType(u.ACTION.DEFAULT);
      k.setSupportPicking(!1);
      H.parentNode && document.body.removeChild(H);
      C.parentNode && document.body.removeChild(C);
      z.parentNode && document.body.removeChild(z);
      t.state = t.MOUSE_STATE.NORMAL;
    };
    A.set = function (a, d, e) {
      D = d;
      B = a;
      if (D) {
        if (f.TouchTargeting && (d = k.getFocusEntity())) {
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
        t.state = t.MOUSE_STATE.USESKILL;
        k.setSupportPicking(0 < (D & A.TYPE.FRIEND));
        a = l.getSkillInfo(a.SKID);
        b(e || a.SkillName, H);
        c(B.useLevel ? B.useLevel : B.level, z);
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
        c(B.useLevel, z));
    };
    A.intersectEntityId = function (a) {
      (a = k.get(a)) && e(a);
    };
    A.onUseSkillToId = function () {};
    A.onUseSkillToPos = function () {};
    return q.addComponent(A);
  },
);
