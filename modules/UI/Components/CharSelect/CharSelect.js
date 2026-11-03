define(
  "UI/Components/CharSelect/CharSelect",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Configs Core/Preferences Controls/KeyEventHandler Renderer/Renderer Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera UI/UIManager UI/UIComponent UI/Components/PincodeBox/PincodeBox text!./CharSelect.html text!./CharSelect.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return function (b) {
        r((I + 12 + a) % 12);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function c(a) {
      return function (b) {
        r(3 * Math.floor(I / 3) + a);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function d() {
      A.showPromptBox(
        n.getMessage(17),
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
      C.onCreateRequest(I);
    }
    function l() {
      if (!B.ready) return !1;
      P[I] && ((z.index = I), z.save(), C.onConnectRequest(P[I]));
    }
    function h() {
      P[I] && (C.off("keydown"), C.onDeleteRequest(P[I].GID));
    }
    function r(a) {
      var b = C.ui,
        c = b.find(".charinfo"),
        d = N[I];
      d &&
        d.setAction({ action: d.ACTION.IDLE, frame: 0, play: !0, repeat: !0 });
      I = (a + 12) % 12;
      b.find(".box_select")
        .removeClass("slot1 slot2 slot3")
        .addClass("slot" + ((I % 3) + 1));
      a = Math.floor(I / 3) + 1;
      P[3 * a - 3] ? b.find(".add_slot1").hide() : b.find(".add_slot1").show();
      P[3 * a - 2] ? b.find(".add_slot2").hide() : b.find(".add_slot2").show();
      P[3 * a - 1] ? b.find(".add_slot3").hide() : b.find(".add_slot3").show();
      b.find(".pageinfo .current").text(Math.floor(I / 3) + 1);
      (d = N[I])
        ? (d.setAction({
            action: d.ACTION.READYFIGHT,
            frame: 0,
            play: !0,
            repeat: !0,
          }),
          b.find(".make").hide(),
          b.find(".delete").show(),
          b.find(".ok").show(),
          (b = P[I]),
          c.find(".name").text(b.name),
          c.find(".job").text(g[b.job] || ""),
          c.find(".lvl").text(b.level),
          c.find(".exp").text(b.exp),
          c.find(".hp").text(b.hp),
          c.find(".sp").text(b.sp),
          c.find(".map").text(n.getMapName(b.lastMap) || b.lastMap),
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
    function t() {
      var a, b, c;
      u.direction = 4;
      c = 3 * Math.floor(I / 3);
      b = x.length;
      for (a = 0; a < b; ++a)
        (x[a].clearRect(0, 0, x[a].canvas.width, x[a].canvas.height),
          N[c + a] &&
            (v.bind2DContext(x[a], 67, 134), N[c + a].renderEntity()));
    }
    var n = a("DB/DBManager"),
      g = a("DB/Monsters/MonsterTable"),
      p = a("Core/Configs"),
      k = a("Core/Preferences"),
      f = a("Controls/KeyEventHandler"),
      m = a("Renderer/Renderer"),
      q = a("Renderer/Entity/Entity"),
      v = a("Renderer/SpriteRenderer"),
      u = a("Renderer/Camera"),
      A = a("UI/UIManager"),
      D = a("UI/UIComponent"),
      B = a("UI/Components/PincodeBox/PincodeBox"),
      H = a("text!./CharSelect.html");
    a = a("text!./CharSelect.css");
    var C = new D("CharSelect", H, a),
      z = k.get("CharSelect", { index: 0 }, 1),
      G = [],
      P = [],
      N = [],
      I = 0,
      x = [],
      J = 0;
    C.init = function () {
      var a = this.ui;
      a.css({ top: (m.height - 342) / 2, left: (m.width - 576) / 2 });
      a.find(".ok").click(l);
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
          P[I] ? l() : e();
        })
        .each(function () {
          x.push(this.getContext("2d"));
        });
      this.draggable();
    };
    C.onAppend = function () {
      I = z.index;
      this.ui.find(".slotinfo .number").text(G.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      r(I);
      m.render(t);
    };
    C.onRemove = function () {
      z.index = I;
      z.save();
      m.stop();
    };
    C.onKeyDown = function (a) {
      switch (a.which) {
        case f.ESCAPE:
          d();
          break;
        case f.LEFT:
          r(I - 1);
          break;
        case f.RIGHT:
          r(I + 1);
          break;
        case f.SUPR:
          P[I] && h();
          break;
        case f.ENTER:
          if (!B.ready) return !1;
          P[I] ? l() : e();
          break;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    C.setInfo = function (a) {
      J = a.sex;
      P.length = 0;
      N.length = 0;
      G.length = 0;
      if (a.charInfo) {
        var b,
          c = a.charInfo.length;
        for (b = 0; b < c; ++b) C.addCharacter(a.charInfo[b]);
      }
      this.ui.find(".slotinfo .number").text(G.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      r(I);
      3 != p.get("ClientVer") &&
        0 <= a.code &&
        ((b = P[a.code]), (b.CharNum = a.code), C.onConnectRequest(b));
    };
    C.deleteAnswer = function (a) {
      this.on("keydown");
      switch (a) {
        case -2:
          break;
        case -1:
          delete P[I];
          delete N[I];
          a = 0;
          for (var b = G.length; a < b;)
            G[a].CharNum === I ? (G.splice(a, 1), --b) : a++;
          r(I);
          this.ui.find(".slotinfo .number").text(G.length + " / 12");
          break;
        default:
        case 0:
          A.showMessageBox(n.getMessage(301), "ok");
      }
    };
    C.addCharacter = function (a) {
      ("sex" in a && 99 !== a.sex) || (a.sex = J);
      G.push(a);
      P[a.CharNum] = a;
      N[a.CharNum] = new q();
      N[a.CharNum].set(a);
    };
    C.onExitRequest = function () {};
    C.onDeleteRequest = function () {};
    C.onCreateRequest = function () {};
    C.onConnectRequest = function () {};
    return A.addComponent(C);
  },
);
