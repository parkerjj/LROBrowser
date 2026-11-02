define(
  "UI/Components/CharSelect/CharSelect",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Configs Core/Preferences Controls/KeyEventHandler Renderer/Renderer Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera UI/UIManager UI/UIComponent UI/Components/PincodeBox/PincodeBox text!./CharSelect.html text!./CharSelect.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      return function (b) {
        q((H + 12 + a) % 12);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function c(a) {
      return function (b) {
        q(3 * Math.floor(H / 3) + a);
        b.stopImmediatePropagation();
        return !1;
      };
    }
    function d() {
      z.showPromptBox(
        k.getMessage(17),
        "ok",
        "cancel",
        function () {
          A.onExitRequest();
        },
        null,
      );
    }
    function e() {
      if (!C.ready) return !1;
      A.onCreateRequest(H);
    }
    function m() {
      if (!C.ready) return !1;
      O[H] && ((B.index = H), B.save(), A.onConnectRequest(O[H]));
    }
    function h() {
      O[H] && (A.off("keydown"), A.onDeleteRequest(O[H].GID));
    }
    function q(a) {
      var b = A.ui,
        c = b.find(".charinfo"),
        d = M[H];
      d &&
        d.setAction({ action: d.ACTION.IDLE, frame: 0, play: !0, repeat: !0 });
      H = (a + 12) % 12;
      b.find(".box_select")
        .removeClass("slot1 slot2 slot3")
        .addClass("slot" + ((H % 3) + 1));
      a = Math.floor(H / 3) + 1;
      O[3 * a - 3] ? b.find(".add_slot1").hide() : b.find(".add_slot1").show();
      O[3 * a - 2] ? b.find(".add_slot2").hide() : b.find(".add_slot2").show();
      O[3 * a - 1] ? b.find(".add_slot3").hide() : b.find(".add_slot3").show();
      b.find(".pageinfo .current").text(Math.floor(H / 3) + 1);
      (d = M[H])
        ? (d.setAction({
            action: d.ACTION.READYFIGHT,
            frame: 0,
            play: !0,
            repeat: !0,
          }),
          b.find(".make").hide(),
          b.find(".delete").show(),
          b.find(".ok").show(),
          (b = O[H]),
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
    function r() {
      var a, b, c;
      t.direction = 4;
      c = 3 * Math.floor(H / 3);
      b = x.length;
      for (a = 0; a < b; ++a)
        (x[a].clearRect(0, 0, x[a].canvas.width, x[a].canvas.height),
          M[c + a] &&
            (v.bind2DContext(x[a], 67, 134), M[c + a].renderEntity()));
    }
    var k = a("DB/DBManager"),
      g = a("DB/Monsters/MonsterTable"),
      u = a("Core/Configs"),
      l = a("Core/Preferences"),
      f = a("Controls/KeyEventHandler"),
      n = a("Renderer/Renderer"),
      p = a("Renderer/Entity/Entity"),
      v = a("Renderer/SpriteRenderer"),
      t = a("Renderer/Camera"),
      z = a("UI/UIManager"),
      E = a("UI/UIComponent"),
      C = a("UI/Components/PincodeBox/PincodeBox"),
      J = a("text!./CharSelect.html");
    a = a("text!./CharSelect.css");
    var A = new E("CharSelect", J, a),
      B = l.get("CharSelect", { index: 0 }, 1),
      F = [],
      O = [],
      M = [],
      H = 0,
      x = [],
      I = 0;
    A.init = function () {
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
          O[H] ? m() : e();
        })
        .each(function () {
          x.push(this.getContext("2d"));
        });
      this.draggable();
    };
    A.onAppend = function () {
      H = B.index;
      this.ui.find(".slotinfo .number").text(F.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      q(H);
      n.render(r);
    };
    A.onRemove = function () {
      B.index = H;
      B.save();
      n.stop();
    };
    A.onKeyDown = function (a) {
      switch (a.which) {
        case f.ESCAPE:
          d();
          break;
        case f.LEFT:
          q(H - 1);
          break;
        case f.RIGHT:
          q(H + 1);
          break;
        case f.SUPR:
          O[H] && h();
          break;
        case f.ENTER:
          if (!C.ready) return !1;
          O[H] ? m() : e();
          break;
        default:
          return !0;
      }
      a.stopImmediatePropagation();
      return !1;
    };
    A.setInfo = function (a) {
      I = a.sex;
      O.length = 0;
      M.length = 0;
      F.length = 0;
      if (a.charInfo) {
        var b,
          c = a.charInfo.length;
        for (b = 0; b < c; ++b) A.addCharacter(a.charInfo[b]);
      }
      this.ui.find(".slotinfo .number").text(F.length + " / 12");
      this.ui.find(".pageinfo .count").text(4);
      q(H);
      3 != u.get("ClientVer") &&
        0 <= a.code &&
        ((b = O[a.code]), (b.CharNum = a.code), A.onConnectRequest(b));
    };
    A.deleteAnswer = function (a) {
      this.on("keydown");
      switch (a) {
        case -2:
          break;
        case -1:
          delete O[H];
          delete M[H];
          a = 0;
          for (var b = F.length; a < b;)
            F[a].CharNum === H ? (F.splice(a, 1), --b) : a++;
          q(H);
          this.ui.find(".slotinfo .number").text(F.length + " / 12");
          break;
        default:
        case 0:
          z.showMessageBox(k.getMessage(301), "ok");
      }
    };
    A.addCharacter = function (a) {
      ("sex" in a && 99 !== a.sex) || (a.sex = I);
      F.push(a);
      O[a.CharNum] = a;
      M[a.CharNum] = new p();
      M[a.CharNum].set(a);
    };
    A.onExitRequest = function () {};
    A.onDeleteRequest = function () {};
    A.onCreateRequest = function () {};
    A.onConnectRequest = function () {};
    return z.addComponent(A);
  },
);
