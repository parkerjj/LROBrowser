define(
  "UI/Components/CharSelect/CharSelect",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Configs Core/Preferences Controls/KeyEventHandler Renderer/Renderer Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera UI/UIManager UI/UIComponent UI/Components/PincodeBox/PincodeBox text!./CharSelect.html text!./CharSelect.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return function (b) {
        r((L + 12 + a) % 12);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function c(a) {
      return function (b) {
        r(3 * Math.floor(L / 3) + a);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function d() {
      A.showPromptBox(
        k.getMessage(17),
        "ok",
        "cancel",
        function () {
          C.onExitRequest();
        },
        null,
      );
    }
    function e() {
      if (!B.ready) return !1;
      C.onCreateRequest(L);
    }
    function m() {
      if (!B.ready) return !1;
      J[L] && ((y.index = L), y.save(), C.onConnectRequest(J[L]));
    }
    function h() {
      J[L] && (C.off("keydown"), C.onDeleteRequest(J[L].GID));
    }
    function r(a) {
      var b = C.ui,
        c = b.find(".charinfo"),
        d = I[L];
      d &&
        d.setAction({ action: d.ACTION.IDLE, frame: 0, play: !0, repeat: !0 });
      L = (a + 12) % 12;
      b.find(".box_select")
        .removeClass("slot1 slot2 slot3")
        .addClass("slot" + ((L % 3) + 1));
      a = Math.floor(L / 3) + 1;
      J[3 * a - 3] ? b.find(".add_slot1").hide() : b.find(".add_slot1").show();
      J[3 * a - 2] ? b.find(".add_slot2").hide() : b.find(".add_slot2").show();
      J[3 * a - 1] ? b.find(".add_slot3").hide() : b.find(".add_slot3").show();
      b.find(".pageinfo .current").text(Math.floor(L / 3) + 1);
      (d = I[L])
        ? (d.setAction({
            action: d.ACTION.READYFIGHT,
            frame: 0,
            play: !0,
            repeat: !0,
          }),
          b.find(".make").hide(),
          b.find(".delete").show(),
          b.find(".ok").show(),
          (b = J[L]),
          c.find(".name").text(b.name),
          c.find(".job").text(g[b.job] || ""),
          c.find(".lvl").text(b.level),
          c.find(".exp").text(b.exp),
          c.find(".hp").text(b.hp),
          c.find(".sp").text(b.sp),
          c.find(".map").text(k.getMapName(b.lastMap) || b.lastMap),
          c.find(".str").text(b.Str),
          c.find(".agi").text(b.Agi),
          c.find(".vit").text(b.Vit),
          c.find(".int").text(b.Int),
          c.find(".dex").text(b.Dex),
          c.find(".luk").text(b.Luk))
        : (c.find("div").empty(),
          b.find(".make").show(),
          b.find(".delete").hide(),
          b.find(".ok").hide());
    }
    function q() {
      var a, b, c;
      u.direction = 4;
      c = 3 * Math.floor(L / 3);
      b = x.length;
      for (a = 0; a < b; ++a)
        (x[a].clearRect(0, 0, x[a].canvas.width, x[a].canvas.height),
          I[c + a] &&
            (v.bind2DContext(x[a], 67, 134), I[c + a].renderEntity()));
    }
    var k = a("DB/DBManager"),
      g = a("DB/Monsters/MonsterTable"),
      t = a("Core/Configs"),
      l = a("Core/Preferences"),
      f = a("Controls/KeyEventHandler"),
      n = a("Renderer/Renderer"),
      p = a("Renderer/Entity/Entity"),
      v = a("Renderer/SpriteRenderer"),
      u = a("Renderer/Camera"),
      A = a("UI/UIManager"),
      D = a("UI/UIComponent"),
      B = a("UI/Components/PincodeBox/PincodeBox"),
      O = a("text!./CharSelect.html");
    a = a("text!./CharSelect.css");
    var C = new D("CharSelect", O, a),
      y = l.get("CharSelect", { index: 0 }, 1),
      z = [],
      J = [],
      I = [],
      L = 0,
      x = [],
      M = 0;
    C.init = function () {
      var a = this.ui;
      a.css({ top: (n.height - 342) / 2, left: (n.width - 576) / 2 });
      a.find(".ok").click(m);
      a.find(".cancel").click(d);
      a.find(".make").click(e);
      a.find(".delete").click(h);
      a.find(".add_slot1").click(e);
      a.find(".add_slot2").click(e);
      a.find(".add_slot3").click(e);
      a.find(".arrow.left").mousedown(b(-1));
      a.find(".arrow.right").mousedown(b(1));
      a.find(".slot1").mousedown(c(0));
      a.find(".slot2").mousedown(c(1));
      a.find(".slot3").mousedown(c(2));
      a.find("canvas")
        .dblclick(function () {
          J[L] ? m() : e();
        })
        .each(function () {
          x.push(this.getContext("2d"));
        });
      this.draggable();
    };
    C.onAppend = function () {
      L = y.index;
      this.ui.find(".slotinfo .number").text(z.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      r(L);
      n.render(q);
    };
    C.onRemove = function () {
      y.index = L;
      y.save();
      n.stop();
    };
    C.onKeyDown = function (a) {
      switch (a.which) {
        case f.ESCAPE:
          d();
          break;
        case f.LEFT:
          r(L - 1);
          break;
        case f.RIGHT:
          r(L + 1);
          break;
        case f.SUPR:
          J[L] && h();
          break;
        case f.ENTER:
          if (!B.ready) return !1;
          J[L] ? m() : e();
          break;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    C.setInfo = function (a) {
      M = a.sex;
      J.length = 0;
      I.length = 0;
      z.length = 0;
      if (a.charInfo) {
        var b,
          c = a.charInfo.length;
        for (b = 0; b < c; ++b) C.addCharacter(a.charInfo[b]);
      }
      this.ui.find(".slotinfo .number").text(z.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      r(L);
      3 != t.get("ClientVer") &&
        0 <= a.code &&
        ((b = J[a.code]), (b.CharNum = a.code), C.onConnectRequest(b));
    };
    C.deleteAnswer = function (a) {
      this.on("keydown");
      switch (a) {
        case -2:
          break;
        case -1:
          delete J[L];
          delete I[L];
          a = 0;
          for (var b = z.length; a < b;)
            z[a].CharNum === L ? (z.splice(a, 1), --b) : a++;
          r(L);
          this.ui.find(".slotinfo .number").text(z.length + " / 12");
          break;
        default:
        case 0:
          A.showMessageBox(k.getMessage(301), "ok");
      }
    };
    C.addCharacter = function (a) {
      ("sex" in a && 99 !== a.sex) || (a.sex = M);
      z.push(a);
      J[a.CharNum] = a;
      I[a.CharNum] = new p();
      I[a.CharNum].set(a);
    };
    C.onExitRequest = function () {};
    C.onDeleteRequest = function () {};
    C.onCreateRequest = function () {};
    C.onConnectRequest = function () {};
    return A.addComponent(C);
  },
);
