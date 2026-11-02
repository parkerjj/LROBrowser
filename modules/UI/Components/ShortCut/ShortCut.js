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
      W.size = (W.size + a) % (Q + 1);
      W.save();
      K.ui.css("height", 34 * W.size);
      1 >= W.size
        ? K.ui.find(".resize-up").hide()
        : K.ui.find(".resize-up").show();
      4 == W.size
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
        var a = Math.floor((J.screen.y - c) / 34 + 1),
          a = Math.min(Math.max(a, 1), Q);
        a !== d && (b.css("height", 34 * a), (W.size = a), W.save(), (d = a));
      }, 30);
      t(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), t(window).off("mouseup.resize"));
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
        a = O.getItemById(c);
        if (!a) return;
        c = p.getItemInfo(c);
        c = a.IsIdentified
          ? c.identifiedResourceName
          : c.unidentifiedResourceName;
        e = p.getItemName(a);
        d = a.type === v.WEAPON || a.type === v.EQUIP ? 1 : a.count;
        if (!d) return;
      }
      z.loadFile(p.INTERFACE_PATH + "item/" + c + ".bmp", function (a) {
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
    function q(a, b, c, d) {
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
      } catch (pa) {
        return !1;
      }
      if ("item" !== b.type && "skill" !== b.type) return !1;
      switch (b.from) {
        case "SkillList":
          K.onChange(e, !0, c.SKID, d);
          q(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "MercenaryskillList":
          K.onChange(e, !0, c.SKID, d);
          q(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "HomuncskillList":
          K.onChange(e, !0, c.SKID, d);
          q(!0, c.SKID, f, d);
          h(e, !0, c.SKID, d);
          break;
        case "Inventory":
          K.onChange(e, !1, c.ITID, 0);
          q(!1, c.ITID, f);
          h(e, !1, c.ITID, 0);
          break;
        case "ShortCut":
          (K.onChange(e, c.isSkill, c.ID, c.count),
            q(c.isSkill, c.ID, f),
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
    function u(a) {
      var b = parseInt(this.parentNode.getAttribute("data-index"), 10),
        c = __list[b];
      a.stopImmediatePropagation();
      if (c.isSkill)
        L.uid === __list[b].ID
          ? L.remove()
          : (L.append(), L.setSkill(__list[b].ID));
      else {
        if (F.uid === __list[b].ID) return (F.remove(), !1);
        F.append();
        F.uid = __list[b].ID;
        F.setItem(O.getItemById(__list[b].ID));
      }
      return !1;
    }
    function l() {
      var a = parseInt(this.parentNode.getAttribute("data-index"), 10),
        b = t(this).parent().find(".amount").text();
      f(a, b);
    }
    function f(a, b) {
      var c = __list[a];
      y.remove();
      if (S) return !1;
      ba
        ? A.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          )
        : !c ||
          t("#NpcStore").is(":visible") ||
          t("#NpcBox").is(":visible") ||
          t("#NpcMenu").is(":visible") ||
          t("#WarpList").is(":visible") ||
          K.ui.find(".container[data-index\x3d" + a + "]").hasClass("cd") ||
          (1 === V &&
            setTimeout(function () {
              V = 0;
            }, 5e3),
          30 < V
            ? ((ba = !0),
              A.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                ba = !1;
                A.showMessageBox(
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
                ? "" == t("#SkillTargetSelection").html()
                  ? y.remove()
                  : (a = x.getSkillById(c.ID)) && a.level
                    ? x.useSkillID(c.ID, b)
                    : (a = I.getSkillById(c.ID)) && a.level
                      ? I.useSkillID(c.ID, b)
                      : (a = D.getSkillById(c.ID)) &&
                        a.level &&
                        D.useSkillID(c.ID, b)
                : (b = O.getItemById(__list[a].ID)) && O.useItem(b)));
    }
    function n() {
      K.ui.css("height", 0);
      W.size = 0;
      W.save();
    }
    var p = a("DB/DBManager"),
      v = a("DB/Items/ItemType"),
      t = a("Utils/jquery"),
      z = a("Core/Client"),
      E = a("Core/Preferences"),
      C = a("Renderer/Renderer"),
      J = a("Controls/MouseEventHandler"),
      A = a("UI/UIManager"),
      B = a("UI/UIComponent"),
      F = a("UI/Components/ItemInfo/ItemInfo"),
      O = a("UI/Components/Inventory/Inventory"),
      M = a("UI/Components/OnPushCart/OnPushCart"),
      H = a("UI/Components/Guild/Guild"),
      x = a("UI/Components/SkillList/SkillList"),
      I = a("UI/Components/Mercenary/MercenaryskillList"),
      D = a("UI/Components/Homunc/HomuncskillList"),
      L = a("UI/Components/SkillDescription/SkillDescription"),
      y = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      G = a("text!./ShortCut.html");
    a = a("text!./ShortCut.css");
    var K = new B("ShortCut", G, a),
      N = [],
      Q = 0,
      W = E.get("ShortCut", { x: 223, y: 0, size: 1 }, 1.1),
      V = 0,
      ba = !1;
    K.init = function () {
      this.ui.find(".resize").mousedown(m);
      this.ui.find(".close").mousedown(e).click(n);
      this.ui.find(".resize-up").on("click", b);
      this.ui.find(".resize-down").on("click", c);
      this.ui
        .on("drop", ".container", r)
        .on("dragover", ".container", e)
        .on("dragstart", ".icon", g)
        .on("dragend", ".icon", k)
        .on("dblclick", ".icon", l)
        .on("contextmenu", ".icon", u)
        .on("mousedown", ".icon", function (a) {
          a.stopImmediatePropagation();
        });
      1 >= W.size
        ? K.ui.find(".resize-up").hide()
        : K.ui.find(".resize-up").show();
      4 == W.size
        ? (K.ui.find(".resize-down").hide(),
          K.ui.find(".resize-down-disabled").show())
        : (K.ui.find(".resize-down").show(),
          K.ui.find(".resize-down-disabled").hide());
      this.draggable();
    };
    K.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, W.y), C.height - this.ui.height()),
        left: Math.min(Math.max(0, W.x), C.width - this.ui.width()),
        height: 34 * W.size,
      });
    };
    K.onRemove = function () {
      W.y = parseInt(this.ui.css("top"), 10);
      W.x = parseInt(this.ui.css("left"), 10);
      W.size = Math.floor(parseInt(this.ui.css("height"), 10) / 34);
      W.save();
    };
    K.clean = function () {
      N.length = 0;
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
              c = t("#ShortCut .container[data-index\x3d" + b + "]")
                .find(".amount")
                .text();
              f(b, c);
              break;
            case "EXTEND":
              ((W.size = (W.size + 1) % (Q + 1)),
                W.save(),
                this.ui.css("height", 34 * W.size));
          }
      };
    })();
    K.setList = function (a) {
      var b, c, d, e;
      N = a;
      this.ui.find(".container .border").empty();
      N.length = a.length;
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
                (d = I.getSkillById(a[b].ID)) &&
                d.level &&
                ((e = 1),
                d.bSeperateLv &&
                  I.ui
                    .find(".skill[data-index\x3d" + a[b].ID + "] .current")
                    .text(a[b].count),
                h(b, !0, a[b].ID, a[b].count)),
              0 == e &&
                (d = D.getSkillById(a[b].ID)) &&
                d.level &&
                (d.bSeperateLv &&
                  D.ui
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
        if (N[c] && 1 == N[c].isSkill && N[c].ID == a.SKID) {
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
      return N;
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
      for (var c = -1, d = 0, e = N.length; d < e; ++d)
        if (N[d].ID === a) {
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
      V++;
    };
    var S = !1;
    O.onUpdateItem = function (a, b) {
      K.setElement(!1, a, b);
    };
    M.onUpdateItem = function (a, b) {
      K.setElement(!1, a, b);
    };
    H.onUpdateSkill = function (a, b) {
      K.setElement(!0, a, b);
    };
    x.onUpdateSkill = function (a, b) {
      K.setElement(!0, a, b);
    };
    K.onChange = function () {};
    return A.addComponent(K);
  },
);
