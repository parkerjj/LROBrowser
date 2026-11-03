define(
  "UI/Components/CharSelect/CharSelect",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Configs Core/Preferences Controls/KeyEventHandler Renderer/Renderer Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera UI/UIManager UI/UIComponent UI/Components/PincodeBox/PincodeBox text!./CharSelect.html text!./CharSelect.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return function (b) {
        t((I + 12 + a) % 12);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function c(a) {
      return function (b) {
        t(3 * Math.floor(I / 3) + a);
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
          D.onExitRequest();
        },
        null,
      );
    }
    function e() {
      if (!B.ready) return !1;
      D.onCreateRequest(I);
    }
    function m() {
      if (!B.ready) return !1;
      N[I] && ((y.index = I), y.save(), D.onConnectRequest(N[I]));
    }
    function h() {
      N[I] && (D.off("keydown"), D.onDeleteRequest(N[I].GID));
    }
    function t(a) {
      var b = D.ui,
        c = b.find(".charinfo"),
        d = O[I];
      d &&
        d.setAction({ action: d.ACTION.IDLE, frame: 0, play: !0, repeat: !0 });
      I = (a + 12) % 12;
      b.find(".box_select")
        .removeClass("slot1 slot2 slot3")
        .addClass("slot" + ((I % 3) + 1));
      a = Math.floor(I / 3) + 1;
      N[3 * a - 3] ? b.find(".add_slot1").hide() : b.find(".add_slot1").show();
      N[3 * a - 2] ? b.find(".add_slot2").hide() : b.find(".add_slot2").show();
      N[3 * a - 1] ? b.find(".add_slot3").hide() : b.find(".add_slot3").show();
      b.find(".pageinfo .current").text(Math.floor(I / 3) + 1);
      (d = O[I])
        ? (d.setAction({
            action: d.ACTION.READYFIGHT,
            frame: 0,
            play: !0,
            repeat: !0,
          }),
          b.find(".make").hide(),
          b.find(".delete").show(),
          b.find(".ok").show(),
          (b = N[I]),
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
    function r() {
      var a, b, c;
      v.direction = 4;
      c = 3 * Math.floor(I / 3);
      b = x.length;
      for (a = 0; a < b; ++a)
        (x[a].clearRect(0, 0, x[a].canvas.width, x[a].canvas.height),
          O[c + a] &&
            (u.bind2DContext(x[a], 67, 134), O[c + a].renderEntity()));
    }
    var n = a("DB/DBManager"),
      g = a("DB/Monsters/MonsterTable"),
      p = a("Core/Configs"),
      l = a("Core/Preferences"),
      f = a("Controls/KeyEventHandler"),
      k = a("Renderer/Renderer"),
      q = a("Renderer/Entity/Entity"),
      u = a("Renderer/SpriteRenderer"),
      v = a("Renderer/Camera"),
      A = a("UI/UIManager"),
      C = a("UI/UIComponent"),
      B = a("UI/Components/PincodeBox/PincodeBox"),
      J = a("text!./CharSelect.html");
    a = a("text!./CharSelect.css");
    var D = new C("CharSelect", J, a),
      y = l.get("CharSelect", { index: 0 }, 1),
      H = [],
      N = [],
      O = [],
      I = 0,
      x = [],
      K = 0;
    D.init = function () {
      var a = this.ui;
      a.css({ top: (k.height - 342) / 2, left: (k.width - 576) / 2 });
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
          N[I] ? m() : e();
        })
        .each(function () {
          x.push(this.getContext("2d"));
        });
      this.draggable();
    };
    D.onAppend = function () {
      I = y.index;
      this.ui.find(".slotinfo .number").text(H.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      t(I);
      k.render(r);
    };
    D.onRemove = function () {
      y.index = I;
      y.save();
      k.stop();
    };
    D.onKeyDown = function (a) {
      switch (a.which) {
        case f.ESCAPE:
          d();
          break;
        case f.LEFT:
          t(I - 1);
          break;
        case f.RIGHT:
          t(I + 1);
          break;
        case f.SUPR:
          N[I] && h();
          break;
        case f.ENTER:
          if (!B.ready) return !1;
          N[I] ? m() : e();
          break;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    D.setInfo = function (a) {
      K = a.sex;
      N.length = 0;
      O.length = 0;
      H.length = 0;
      if (a.charInfo) {
        var b,
          c = a.charInfo.length;
        for (b = 0; b < c; ++b) D.addCharacter(a.charInfo[b]);
      }
      this.ui.find(".slotinfo .number").text(H.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      t(I);
      3 != p.get("ClientVer") &&
        0 <= a.code &&
        ((b = N[a.code]), (b.CharNum = a.code), D.onConnectRequest(b));
    };
    D.deleteAnswer = function (a) {
      this.on("keydown");
      switch (a) {
        case -2:
          break;
        case -1:
          delete N[I];
          delete O[I];
          a = 0;
          for (var b = H.length; a < b;)
            H[a].CharNum === I ? (H.splice(a, 1), --b) : a++;
          t(I);
          this.ui.find(".slotinfo .number").text(H.length + " / 12");
          break;
        default:
        case 0:
          A.showMessageBox(n.getMessage(301), "ok");
      }
    };
    D.addCharacter = function (a) {
      ("sex" in a && 99 !== a.sex) || (a.sex = K);
      H.push(a);
      N[a.CharNum] = a;
      O[a.CharNum] = new q();
      O[a.CharNum].set(a);
    };
    D.onExitRequest = function () {};
    D.onDeleteRequest = function () {};
    D.onCreateRequest = function () {};
    D.onConnectRequest = function () {};
    return A.addComponent(D);
  },
);
