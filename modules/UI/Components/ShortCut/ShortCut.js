define(
  "UI/Components/ShortCut/ShortCut",
  "require DB/DBManager DB/Items/ItemType Utils/jquery Core/Client Core/Preferences Renderer/Renderer Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/ItemInfo/ItemInfo UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart UI/Components/Guild/Guild UI/Components/SkillList/SkillList UI/Components/Mercenary/MercenaryskillList UI/Components/Homunc/HomuncskillList UI/Components/SkillDescription/SkillDescription UI/Components/SkillTargetSelection/SkillTargetSelection text!./ShortCut.html text!./ShortCut.css".split(
    " ",
  ),
  function (a) {
    function b() {
      d(-1);
    }
    function c() {
      d(1);
    }
    function d(a) {
      S.size = (S.size + a) % (N + 1);
      S.save();
      K.ui.css("height", 34 * S.size);
      1 >= S.size
        ? K.ui.find(".resize-up").hide()
        : K.ui.find(".resize-up").show();
      4 == S.size
        ? (K.ui.find(".resize-down").hide(),
          K.ui.find(".resize-down-disabled").show())
        : (K.ui.find(".resize-down").show(),
          K.ui.find(".resize-down-disabled").hide());
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function m(a) {
      var b = K.ui,
        c = b.position().top,
        d = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((O.screen.y - c) / 34 + 1),
          a = Math.min(Math.max(a, 1), N);
        a !== d && (b.css("height", 34 * a), (S.size = a), S.save(), (d = a));
      }, 30);
      u(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), u(window).off("mouseup.resize"));
      });
      return e(a);
    }
    function h(a, b, c, d) {
      var e,
        f = K.ui.find(".container:eq(" + a + ")").empty();
      __list[a] || (__list[a] = {});
      __list[a].isSkill = b;
      __list[a].ID = c;
      __list[a].count = d;
      if (b) {
        if (!d) return;
        a = p.getSkillInfo(c);
        c = a.Name;
        e = a.SkillName;
      } else {
        a = J.getItemById(c);
        if (!a) return;
        c = p.getItemInfo(c);
        c = a.IsIdentified
          ? c.identifiedResourceName
          : c.unidentifiedResourceName;
        e = p.getItemName(a);
        d = a.type === v.WEAPON || a.type === v.EQUIP ? 1 : a.count;
        if (!d) return;
      }
      A.loadFile(p.INTERFACE_PATH + "item/" + c + ".bmp", function (a) {
        f.html(
          '\x3cdiv draggable\x3d"true" class\x3d"icon" data-isSkill\x3d"' +
            b +
            '"\x3e\x3cdiv class\x3d"img"\x3e\x3c/div\x3e\x3cdiv class\x3d"amount"\x3e\x3c/div\x3e\x3cspan class\x3d"name"\x3e\x3c/span\x3e\x3c/div\x3e',
        );
        f.find(".img").css("backgroundImage", "url(" + a + ")");
        f.find(".amount").text(d);
        f.find(".name").text(e);
      });
    }
    function r(a, b, c, d) {
      var e;
      if (b)
        if (d)
          for (e = 9 * c, c = Math.min(__list.length, 9 * c + 9); e < c; ++e)
            __list[e] &&
              __list[e].isSkill == a &&
              __list[e].ID === b &&
              __list[e].count == d &&
              (K.ui.find(".container:eq(" + e + ")").empty(),
              (__list[e].isSkill = 0),
              (__list[e].ID = 0),
              (__list[e].count = 0),
              K.onChange(e, 0, 0, 0));
        else
          for (e = 9 * c, c = Math.min(__list.length, 9 * c + 9); e < c; ++e)
            __list[e] &&
              __list[e].isSkill == a &&
              __list[e].ID === b &&
              (K.ui.find(".container:eq(" + e + ")").empty(),
              (__list[e].isSkill = 0),
              (__list[e].ID = 0),
              (__list[e].count = 0),
              K.onChange(e, 0, 0, 0));
    }
    function q(a) {
      var b,
        c,
        d,
        e = parseInt(this.getAttribute("data-index"), 10),
        f = Math.floor(e / 9);
      a.stopImmediatePropagation();
      try {
        ((b = JSON.parse(a.originalEvent.dataTransfer.getData("Text"))),
          (c = b.data),
          (d = b.level));
      } catch (ka) {
        return !1;
      }
      if ("item" !== b.type && "skill" !== b.type) return !1;
      switch (b.from) {
        case "SkillList":
          K.onChange(e, !0, c.SKID, d);
          r(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "MercenaryskillList":
          K.onChange(e, !0, c.SKID, d);
          r(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "HomuncskillList":
          K.onChange(e, !0, c.SKID, d);
          r(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "Inventory":
          K.onChange(e, !1, c.ITID, 0);
          r(!1, c.ITID, f);
          h(e, !1, c.ITID, 0);
          break;
        case "ShortCut":
          (K.onChange(e, c.isSkill, c.ID, c.count),
            r(c.isSkill, c.ID, f),
            h(e, c.isSkill, c.ID, c.count));
      }
      return !1;
    }
    function k() {
      delete window._OBJ_DRAG_;
      this.classList.remove("hide");
    }
    function g(a) {
      var b, c;
      c = parseInt(this.parentNode.getAttribute("data-index"), 10);
      this.classList.add("hide");
      b = new Image();
      b.src = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
      a.originalEvent.dataTransfer.setDragImage(b, 12, 12);
      a.originalEvent.dataTransfer.setData(
        "Text",
        JSON.stringify(
          (window._OBJ_DRAG_ = {
            type: __list[c].isSkill ? "skill" : "item",
            from: "ShortCut",
            data: __list[c],
          }),
        ),
      );
    }
    function t(a) {
      var b = parseInt(this.parentNode.getAttribute("data-index"), 10),
        c = __list[b];
      a.stopImmediatePropagation();
      if (c.isSkill)
        F.uid === __list[b].ID
          ? F.remove()
          : (F.append(), F.setSkill(__list[b].ID));
      else {
        if (z.uid === __list[b].ID) return (z.remove(), !1);
        z.append();
        z.uid = __list[b].ID;
        z.setItem(J.getItemById(__list[b].ID));
      }
      return !1;
    }
    function l() {
      var a = parseInt(this.parentNode.getAttribute("data-index"), 10),
        b = u(this).parent().find(".amount").text();
      f(a, b);
    }
    function f(a, b) {
      var c = __list[a];
      G.remove();
      if (U) return !1;
      ea
        ? C.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          )
        : !c ||
          u("#NpcStore").is(":visible") ||
          u("#NpcBox").is(":visible") ||
          u("#NpcMenu").is(":visible") ||
          u("#WarpList").is(":visible") ||
          K.ui.find(".container[data-index\x3d" + a + "]").hasClass("cd") ||
          (1 === R &&
            setTimeout(function () {
              R = 0;
            }, 5e3),
          30 < R
            ? ((ea = !0),
              C.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                ea = !1;
                C.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : ((U = !0),
              setTimeout(
                function () {
                  U = !1;
                }.bind(this),
                200,
              ),
              c.isSkill
                ? "" == u("#SkillTargetSelection").html()
                  ? G.remove()
                  : (a = x.getSkillById(c.ID)) && a.level
                    ? x.useSkillID(c.ID, b)
                    : (a = M.getSkillById(c.ID)) && a.level
                      ? M.useSkillID(c.ID, b)
                      : (a = E.getSkillById(c.ID)) &&
                        a.level &&
                        E.useSkillID(c.ID, b)
                : (b = J.getItemById(__list[a].ID)) && J.useItem(b)));
    }
    function n() {
      K.ui.css("height", 0);
      S.size = 0;
      S.save();
    }
    var p = a("DB/DBManager"),
      v = a("DB/Items/ItemType"),
      u = a("Utils/jquery"),
      A = a("Core/Client"),
      D = a("Core/Preferences"),
      B = a("Renderer/Renderer"),
      O = a("Controls/MouseEventHandler"),
      C = a("UI/UIManager"),
      y = a("UI/UIComponent"),
      z = a("UI/Components/ItemInfo/ItemInfo"),
      J = a("UI/Components/Inventory/Inventory"),
      I = a("UI/Components/OnPushCart/OnPushCart"),
      L = a("UI/Components/Guild/Guild"),
      x = a("UI/Components/SkillList/SkillList"),
      M = a("UI/Components/Mercenary/MercenaryskillList"),
      E = a("UI/Components/Homunc/HomuncskillList"),
      F = a("UI/Components/SkillDescription/SkillDescription"),
      G = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      H = a("text!./ShortCut.html");
    a = a("text!./ShortCut.css");
    var K = new y("ShortCut", H, a),
      P = [],
      N = 0,
      S = D.get("ShortCut", { x: 223, y: 0, size: 1 }, 1.1),
      R = 0,
      ea = !1;
    K.init = function () {
      this.ui.find(".resize").mousedown(m);
      this.ui.find(".close").mousedown(e).click(n);
      this.ui.find(".resize-up").on("click", b);
      this.ui.find(".resize-down").on("click", c);
      this.ui
        .on("drop", ".container", q)
        .on("dragover", ".container", e)
        .on("dragstart", ".icon", g)
        .on("dragend", ".icon", k)
        .on("dblclick", ".icon", l)
        .on("contextmenu", ".icon", t)
        .on("mousedown", ".icon", function (a) {
          a.stopImmediatePropagation();
        });
      1 >= S.size
        ? K.ui.find(".resize-up").hide()
        : K.ui.find(".resize-up").show();
      4 == S.size
        ? (K.ui.find(".resize-down").hide(),
          K.ui.find(".resize-down-disabled").show())
        : (K.ui.find(".resize-down").show(),
          K.ui.find(".resize-down-disabled").hide());
      this.draggable();
    };
    K.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, S.y), B.height - this.ui.height()),
        left: Math.min(Math.max(0, S.x), B.width - this.ui.width()),
        height: 34 * S.size,
      });
    };
    K.onRemove = function () {
      S.y = parseInt(this.ui.css("top"), 10);
      S.x = parseInt(this.ui.css("left"), 10);
      S.size = Math.floor(parseInt(this.ui.css("height"), 10) / 34);
      S.save();
    };
    K.clean = function () {
      P.length = 0;
      this.ui.find(".container").empty();
    };
    K.onShortCut = (function () {
      var a = 0;
      return function (b) {
        var c = new Date().getTime();
        if (!(200 > c - a))
          switch (((a = c), b.cmd.replace(/\d+/, ""))) {
            case "EXECUTE":
              b = parseInt(b.cmd.match(/\d+/).toString(), 10);
              c = u("#ShortCut .container[data-index\x3d" + b + "]")
                .find(".amount")
                .text();
              f(b, c);
              break;
            case "EXTEND":
              ((S.size = (S.size + 1) % (N + 1)),
                S.save(),
                this.ui.css("height", 34 * S.size));
          }
      };
    })();
    K.setList = function (a) {
      var b, c, d, e;
      P = a;
      this.ui.find(".container .border").empty();
      P.length = a.length;
      N = Math.min(4, Math.floor(a.length / 9));
      b = 0;
      for (c = a.length; b < c; ++b)
        ((e = 0),
          a[b].isSkill
            ? ((d = x.getSkillById(a[b].ID)) &&
                d.level &&
                ((e = 1),
                d.bSeperateLv &&
                  x.ui
                    .find(".skill[data-index\x3d" + a[b].ID + "] .current")
                    .text(a[b].count),
                h(b, !0, a[b].ID, a[b].count)),
              0 == e &&
                (d = M.getSkillById(a[b].ID)) &&
                d.level &&
                ((e = 1),
                d.bSeperateLv &&
                  M.ui
                    .find(".skill[data-index\x3d" + a[b].ID + "] .current")
                    .text(a[b].count),
                h(b, !0, a[b].ID, a[b].count)),
              0 == e &&
                (d = E.getSkillById(a[b].ID)) &&
                d.level &&
                (d.bSeperateLv &&
                  E.ui
                    .find(".skill[data-index\x3d" + a[b].ID + "] .current")
                    .text(a[b].count),
                h(b, !0, a[b].ID, a[b].count)))
            : h(b, a[b].isSkill, a[b].ID, a[b].count));
    };
    K.setElement = function (a, b, c) {
      var d, e;
      d = 0;
      for (e = __list.length; d < e; ++d)
        __list[d] &&
          __list[d].isSkill == a &&
          __list[d].ID === b &&
          h(d, a, b, c);
    };
    K.setPostdelay = function (a) {
      for (var b, c = 0; 18 > c; ++c)
        if (P[c] && 1 == P[c].isSkill && P[c].ID == a.SKID) {
          K.ui.find(".container[data-index\x3d" + c + "] ._cover").show();
          b = c;
          break;
        }
      setTimeout(function () {
        K.ui.find(".container[data-index\x3d" + b + "] ._cover").hide();
      }, a.DelayTM);
    };
    K.setCustom = function () {
      d(1);
    };
    K.getList = function () {
      return P;
    };
    K.addCooldown = function (a) {
      this.ui.find(".container").addClass("cd");
      this.ui
        .find(".container .icon[data-isSkill\x3dtrue]")
        .parent()
        .prepend('\x3cdiv class\x3d"cooldown-square"\x3e\x3c/div\x3e');
      this.ui
        .find(".container .cooldown-square")
        .css("animation", "cooldown " + a / 1e3 + "s linear 1");
      setTimeout(function () {
        K.ui.find(".container").removeClass("cd");
        K.ui.find(".container .cooldown-square").remove();
      }, a);
    };
    K.addSkillCooldown = function (a, b) {
      for (var c = -1, d = 0, e = P.length; d < e; ++d)
        if (P[d].ID === a) {
          c = d;
          break;
        }
      -1 != c &&
        (this.ui.find(".container[data-index\x3d" + c + "]").addClass("cd"),
        this.ui
          .find(".container[data-index\x3d" + c + "]")
          .prepend('\x3cdiv class\x3d"cooldown-square2"\x3e\x3c/div\x3e'),
        this.ui
          .find(".container[data-index\x3d" + c + "] .cooldown-square2")
          .css("animation", "cooldown " + b / 1e3 + "s linear 1"),
        setTimeout(function () {
          K.ui
            .find(".container[data-index\x3d" + c + "] .cooldown-square2")
            .parent()
            .removeClass("cd");
          K.ui
            .find(".container[data-index\x3d" + c + "] .cooldown-square2")
            .remove();
        }, b));
    };
    K.AddClickCount = function () {
      R++;
    };
    var U = !1;
    J.onUpdateItem = function (a, b) {
      K.setElement(!1, a, b);
    };
    I.onUpdateItem = function (a, b) {
      K.setElement(!1, a, b);
    };
    L.onUpdateSkill = function (a, b) {
      K.setElement(!0, a, b);
    };
    x.onUpdateSkill = function (a, b) {
      K.setElement(!0, a, b);
    };
    K.onChange = function () {};
    return C.addComponent(K);
  },
);
