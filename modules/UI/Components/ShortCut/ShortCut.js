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
      V.size = (V.size + a) % (Q + 1);
      V.save();
      L.ui.css("height", 34 * V.size);
      1 >= V.size
        ? L.ui.find(".resize-up").hide()
        : L.ui.find(".resize-up").show();
      4 == V.size
        ? (L.ui.find(".resize-down").hide(),
          L.ui.find(".resize-down-disabled").show())
        : (L.ui.find(".resize-down").show(),
          L.ui.find(".resize-down-disabled").hide());
    }
    function e(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function m(a) {
      var b = L.ui,
        c = b.position().top,
        d = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((J.screen.y - c) / 34 + 1),
          a = Math.min(Math.max(a, 1), Q);
        a !== d && (b.css("height", 34 * a), (V.size = a), V.save(), (d = a));
      }, 30);
      v(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), v(window).off("mouseup.resize"));
      });
      return e(a);
    }
    function h(a, b, c, d) {
      var e,
        f = L.ui.find(".container:eq(" + a + ")").empty();
      __list[a] || (__list[a] = {});
      __list[a].isSkill = b;
      __list[a].ID = c;
      __list[a].count = d;
      if (b) {
        if (!d) return;
        a = q.getSkillInfo(c);
        c = a.Name;
        e = a.SkillName;
      } else {
        a = N.getItemById(c);
        if (!a) return;
        c = q.getItemInfo(c);
        c = a.IsIdentified
          ? c.identifiedResourceName
          : c.unidentifiedResourceName;
        e = q.getItemName(a);
        d = a.type === u.WEAPON || a.type === u.EQUIP ? 1 : a.count;
        if (!d) return;
      }
      A.loadFile(q.INTERFACE_PATH + "item/" + c + ".bmp", function (a) {
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
    function t(a, b, c, d) {
      var e;
      if (b)
        if (d)
          for (e = 9 * c, c = Math.min(__list.length, 9 * c + 9); e < c; ++e)
            __list[e] &&
              __list[e].isSkill == a &&
              __list[e].ID === b &&
              __list[e].count == d &&
              (L.ui.find(".container:eq(" + e + ")").empty(),
              (__list[e].isSkill = 0),
              (__list[e].ID = 0),
              (__list[e].count = 0),
              L.onChange(e, 0, 0, 0));
        else
          for (e = 9 * c, c = Math.min(__list.length, 9 * c + 9); e < c; ++e)
            __list[e] &&
              __list[e].isSkill == a &&
              __list[e].ID === b &&
              (L.ui.find(".container:eq(" + e + ")").empty(),
              (__list[e].isSkill = 0),
              (__list[e].ID = 0),
              (__list[e].count = 0),
              L.onChange(e, 0, 0, 0));
    }
    function r(a) {
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
      } catch (oa) {
        return !1;
      }
      if ("item" !== b.type && "skill" !== b.type) return !1;
      switch (b.from) {
        case "SkillList":
          L.onChange(e, !0, c.SKID, d);
          t(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "MercenaryskillList":
          L.onChange(e, !0, c.SKID, d);
          t(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "HomuncskillList":
          L.onChange(e, !0, c.SKID, d);
          t(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "Inventory":
          L.onChange(e, !1, c.ITID, 0);
          t(!1, c.ITID, f);
          h(e, !1, c.ITID, 0);
          break;
        case "ShortCut":
          (L.onChange(e, c.isSkill, c.ID, c.count),
            t(c.isSkill, c.ID, f),
            h(e, c.isSkill, c.ID, c.count));
      }
      return !1;
    }
    function n() {
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
    function p(a) {
      var b = parseInt(this.parentNode.getAttribute("data-index"), 10),
        c = __list[b];
      a.stopImmediatePropagation();
      if (c.isSkill)
        F.uid === __list[b].ID
          ? F.remove()
          : (F.append(), F.setSkill(__list[b].ID));
      else {
        if (H.uid === __list[b].ID) return (H.remove(), !1);
        H.append();
        H.uid = __list[b].ID;
        H.setItem(N.getItemById(__list[b].ID));
      }
      return !1;
    }
    function l() {
      var a = parseInt(this.parentNode.getAttribute("data-index"), 10),
        b = v(this).parent().find(".amount").text();
      f(a, b);
    }
    function f(a, b) {
      var c = __list[a];
      z.remove();
      if (S) return !1;
      ba
        ? D.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          )
        : !c ||
          v("#NpcStore").is(":visible") ||
          v("#NpcBox").is(":visible") ||
          v("#NpcMenu").is(":visible") ||
          v("#WarpList").is(":visible") ||
          L.ui.find(".container[data-index\x3d" + a + "]").hasClass("cd") ||
          (1 === W &&
            setTimeout(function () {
              W = 0;
            }, 5e3),
          30 < W
            ? ((ba = !0),
              D.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                ba = !1;
                D.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : ((S = !0),
              setTimeout(
                function () {
                  S = !1;
                }.bind(this),
                100,
              ),
              c.isSkill
                ? "" == v("#SkillTargetSelection").html()
                  ? z.remove()
                  : (a = x.getSkillById(c.ID)) && a.level
                    ? x.useSkillID(c.ID, b)
                    : (a = K.getSkillById(c.ID)) && a.level
                      ? K.useSkillID(c.ID, b)
                      : (a = E.getSkillById(c.ID)) &&
                        a.level &&
                        E.useSkillID(c.ID, b)
                : (b = N.getItemById(__list[a].ID)) && N.useItem(b)));
    }
    function k() {
      L.ui.css("height", 0);
      V.size = 0;
      V.save();
    }
    var q = a("DB/DBManager"),
      u = a("DB/Items/ItemType"),
      v = a("Utils/jquery"),
      A = a("Core/Client"),
      C = a("Core/Preferences"),
      B = a("Renderer/Renderer"),
      J = a("Controls/MouseEventHandler"),
      D = a("UI/UIManager"),
      y = a("UI/UIComponent"),
      H = a("UI/Components/ItemInfo/ItemInfo"),
      N = a("UI/Components/Inventory/Inventory"),
      O = a("UI/Components/OnPushCart/OnPushCart"),
      I = a("UI/Components/Guild/Guild"),
      x = a("UI/Components/SkillList/SkillList"),
      K = a("UI/Components/Mercenary/MercenaryskillList"),
      E = a("UI/Components/Homunc/HomuncskillList"),
      F = a("UI/Components/SkillDescription/SkillDescription"),
      z = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      G = a("text!./ShortCut.html");
    a = a("text!./ShortCut.css");
    var L = new y("ShortCut", G, a),
      M = [],
      Q = 0,
      V = C.get("ShortCut", { x: 223, y: 0, size: 1 }, 1.1),
      W = 0,
      ba = !1;
    L.init = function () {
      this.ui.find(".resize").mousedown(m);
      this.ui.find(".close").mousedown(e).click(k);
      this.ui.find(".resize-up").on("click", b);
      this.ui.find(".resize-down").on("click", c);
      this.ui
        .on("drop", ".container", r)
        .on("dragover", ".container", e)
        .on("dragstart", ".icon", g)
        .on("dragend", ".icon", n)
        .on("dblclick", ".icon", l)
        .on("contextmenu", ".icon", p)
        .on("mousedown", ".icon", function (a) {
          a.stopImmediatePropagation();
        });
      1 >= V.size
        ? L.ui.find(".resize-up").hide()
        : L.ui.find(".resize-up").show();
      4 == V.size
        ? (L.ui.find(".resize-down").hide(),
          L.ui.find(".resize-down-disabled").show())
        : (L.ui.find(".resize-down").show(),
          L.ui.find(".resize-down-disabled").hide());
      this.draggable();
    };
    L.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, V.y), B.height - this.ui.height()),
        left: Math.min(Math.max(0, V.x), B.width - this.ui.width()),
        height: 34 * V.size,
      });
    };
    L.onRemove = function () {
      V.y = parseInt(this.ui.css("top"), 10);
      V.x = parseInt(this.ui.css("left"), 10);
      V.size = Math.floor(parseInt(this.ui.css("height"), 10) / 34);
      V.save();
    };
    L.clean = function () {
      M.length = 0;
      this.ui.find(".container").empty();
    };
    L.onShortCut = (function () {
      var a = 0;
      return function (b) {
        var c = new Date().getTime();
        if (!(200 > c - a))
          switch (((a = c), b.cmd.replace(/\d+/, ""))) {
            case "EXECUTE":
              b = parseInt(b.cmd.match(/\d+/).toString(), 10);
              c = v("#ShortCut .container[data-index\x3d" + b + "]")
                .find(".amount")
                .text();
              f(b, c);
              break;
            case "EXTEND":
              ((V.size = (V.size + 1) % (Q + 1)),
                V.save(),
                this.ui.css("height", 34 * V.size));
          }
      };
    })();
    L.setList = function (a) {
      var b, c, d, e;
      M = a;
      this.ui.find(".container .border").empty();
      M.length = a.length;
      Q = Math.min(4, Math.floor(a.length / 9));
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
                (d = K.getSkillById(a[b].ID)) &&
                d.level &&
                ((e = 1),
                d.bSeperateLv &&
                  K.ui
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
    L.setElement = function (a, b, c) {
      var d, e;
      d = 0;
      for (e = __list.length; d < e; ++d)
        __list[d] &&
          __list[d].isSkill == a &&
          __list[d].ID === b &&
          h(d, a, b, c);
    };
    L.setPostdelay = function (a) {
      for (var b, c = 0; 18 > c; ++c)
        if (M[c] && 1 == M[c].isSkill && M[c].ID == a.SKID) {
          L.ui.find(".container[data-index\x3d" + c + "] ._cover").show();
          b = c;
          break;
        }
      setTimeout(function () {
        L.ui.find(".container[data-index\x3d" + b + "] ._cover").hide();
      }, a.DelayTM);
    };
    L.setCustom = function () {
      d(1);
    };
    L.getList = function () {
      return M;
    };
    L.addCooldown = function (a) {
      this.ui.find(".container").addClass("cd");
      this.ui
        .find(".container .icon[data-isSkill\x3dtrue]")
        .parent()
        .prepend('\x3cdiv class\x3d"cooldown-square"\x3e\x3c/div\x3e');
      this.ui
        .find(".container .cooldown-square")
        .css("animation", "cooldown " + a / 1e3 + "s linear 1");
      setTimeout(function () {
        L.ui.find(".container").removeClass("cd");
        L.ui.find(".container .cooldown-square").remove();
      }, a);
    };
    L.addSkillCooldown = function (a, b) {
      for (var c = -1, d = 0, e = M.length; d < e; ++d)
        if (M[d].ID === a) {
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
          L.ui
            .find(".container[data-index\x3d" + c + "] .cooldown-square2")
            .parent()
            .removeClass("cd");
          L.ui
            .find(".container[data-index\x3d" + c + "] .cooldown-square2")
            .remove();
        }, b));
    };
    L.AddClickCount = function () {
      W++;
    };
    var S = !1;
    N.onUpdateItem = function (a, b) {
      L.setElement(!1, a, b);
    };
    O.onUpdateItem = function (a, b) {
      L.setElement(!1, a, b);
    };
    I.onUpdateSkill = function (a, b) {
      L.setElement(!0, a, b);
    };
    x.onUpdateSkill = function (a, b) {
      L.setElement(!0, a, b);
    };
    L.onChange = function () {};
    return D.addComponent(L);
  },
);
