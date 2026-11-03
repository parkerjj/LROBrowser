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
      if (!r.intersect) return !1;
      if (1 !== a.which) return !0;
      a.stopImmediatePropagation();
      if (C & A.TYPE.PLACE)
        return (
          A.onUseSkillToPos(
            B.SKID,
            B.useLevel ? B.useLevel : B.level,
            r.world.x,
            r.world.y,
          ),
          !1
        );
      a = l.getOverEntity();
      if (!a || (a.objecttype === p.TYPE_TRAP && !(C & A.TYPE.TRAP))) return !1;
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
      if (b & C || t.SHIFT || k.noshift)
        if (C === A.TYPE.PET) A.onPetSelected(a.GID);
        else if (!(C & A.TYPE.ENEMY && a === f.Entity))
          A.onUseSkillToId(B.SKID, B.useLevel ? B.useLevel : B.level, a.GID);
    }
    var m = a("DB/DBManager"),
      h = a("DB/Skills/SkillInfo"),
      t = a("Controls/KeyEventHandler"),
      r = a("Controls/MouseEventHandler"),
      n = a("Utils/jquery"),
      g = a("Renderer/Renderer"),
      p = a("Renderer/Entity/Entity"),
      l = a("Renderer/EntityManager"),
      f = a("Engine/SessionStorage"),
      k = a("Preferences/Controls"),
      q = a("UI/UIManager"),
      u = a("UI/UIComponent"),
      v = a("UI/CursorManager"),
      A = new u("SkillTargetSelection");
    A.mouseMode = u.MouseMode.CROSS;
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
    var C = 0,
      B,
      J,
      D,
      y;
    A.init = function () {
      J = document.createElement("canvas");
      D = document.createElement("canvas");
      y = document.createElement("canvas");
      J.style.position = "absolute";
      J.style.top = "45px";
      J.style.zIndex = 100;
      J.style.borderRadius = "3px";
      J.style.border = "1px solid #555";
      D.style.position = "absolute";
      D.style.bottom = "60px";
      D.style.zIndex = 100;
      D.style.borderRadius = "3px";
      D.style.border = "1px solid #555";
      y.style.position = "absolute";
      y.style.left = 0;
      y.style.top = 0;
      y.style.zIndex = 100;
      n(window).mousemove(function (a) {
        y.style.left = a.pageX + 20 + "px";
        y.style.top = a.pageY - 18 + "px";
      });
      b(m.getMessage(234), D);
      this.ui = n('\x3cdiv id \x3d"SkillTargetSelection"/\x3e');
      this.ui.append();
    };
    A.onAppend = function () {
      var a;
      J.parentNode || document.body.appendChild(J);
      D.parentNode || document.body.appendChild(D);
      y.parentNode || document.body.appendChild(y);
      a = n._data(window, "events").keydown;
      a.unshift(a.pop());
      n(window).one("mousedown.targetselection", d);
      a = n._data(window, "events").mousedown;
      a.unshift(a.pop());
    };
    A.onKeyDown = function (a) {
      return a.which === t.ESCAPE
        ? (this.remove(), a.stopImmediatePropagation(), !1)
        : !0;
    };
    A.onRemove = function () {
      n(window).off("mousedown.targetselection");
      v.blockMagnetism = !1;
      v.freeze = !1;
      v.setType(v.ACTION.DEFAULT);
      l.setSupportPicking(!1);
      J.parentNode && document.body.removeChild(J);
      D.parentNode && document.body.removeChild(D);
      y.parentNode && document.body.removeChild(y);
      r.state = r.MOUSE_STATE.NORMAL;
    };
    A.set = function (a, d, e) {
      C = d;
      B = a;
      if (C) {
        if (f.TouchTargeting && (d = l.getFocusEntity())) {
          if (C & A.TYPE.PLACE)
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
        C & A.TYPE.PLACE && (v.blockMagnetism = !0);
        r.state = r.MOUSE_STATE.USESKILL;
        l.setSupportPicking(0 < (C & A.TYPE.FRIEND));
        a = m.getSkillInfo(a.SKID);
        b(e || a.SkillName, J);
        c(B.useLevel ? B.useLevel : B.level, y);
        v.setType(v.ACTION.TARGET);
        v.freeze = !0;
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
    return q.addComponent(A);
  },
);
