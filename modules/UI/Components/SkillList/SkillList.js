define(
  "UI/Components/SkillList/SkillList",
  "require DB/DBManager Engine/SessionStorage Utils/jquery Core/Client Core/Preferences Renderer/Renderer DB/Status/StatusState DB/Jobs/JobConst Renderer/Camera Renderer/SpriteRenderer Controls/MouseEventHandler Preferences/Graphics UI/Components/ChatBox/ChatBox UI/UIManager UI/UIComponent UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/SkillDescription/SkillDescription text!./SkillList.html text!./SkillList.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function c(a) {
      var b,
        c = T.list.length;
      if (void 0 === a) return null;
      for (b = 0; b < c; ++b) if (T.list[b].SKID == a) return T.list[b];
      return null;
    }
    function d() {
      var a = L(this).index();
      fa.tab = parseInt(a, 10);
      T.ui.find(".tabs button").removeClass("active");
      this.classList.add("active");
      if (fa.treeView) T.buildSkillTree();
      else {
        T.ui.find(".content table").empty();
        for (var a = 0, b = T.list.length; a < b; ++a) T.addSkill(T.list[a]);
      }
      v();
    }
    function e() {
      var a = T.ui,
        b = a.position().top,
        c = a.position().left,
        d = 0,
        e = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((P.screen.x - c - -6) / 32),
          f = Math.floor((P.screen.y - b - 32) / 32),
          a = Math.min(Math.max(a, 8), 8),
          f = Math.min(Math.max(f, 4), 10);
        if (a !== d || f !== e) (q(a, f), (d = a), (e = f));
      }, 30);
      L(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), L(window).off("mouseup.resize"));
      });
    }
    function m() {
      oa != ga &&
        S.showPromptBox(J.getMessage(1377), "ok", "cancel", function () {
          for (var a in ka)
            for (var b = 0, c = ka[a]; b < c; b++) T.onIncreaseSkill(a);
          h();
        });
    }
    function h() {
      ka = {};
      oa != ga && ((ga = oa), T.updateSkpoints());
      if (fa.treeView) T.buildSkillTree();
      else {
        T.ui.find(".content table").empty();
        for (var a = 0, b = T.list.length; a < b; ++a) T.addSkill(T.list[a]);
      }
    }
    function r() {
      fa.showDesc = !fa.showDesc;
      x.loadFile(
        J.INTERFACE_PATH + "checkbox_" + (fa.showDesc ? "1" : "0") + ".bmp",
        function (a) {
          T.ui.find(".show_descr").css("backgroundImage", "url(" + a + ")");
        },
      );
    }
    function q(a, b) {
      a = Math.min(Math.max(a, 8), 8);
      b = Math.min(Math.max(b, 4), 10);
      T.ui.find(".content").css({ width: 32 * a, height: 32 * b });
    }
    function k() {
      T.ui.hide();
    }
    function g() {
      T.ui.toggleClass("tree");
      fa.treeView = T.ui.hasClass("tree");
      fa.treeView
        ? (E.render(qa),
          T.ui.find(".content").css("width", ""),
          T.ui.find(".content").css("height", ""))
        : (E.stop(qa), q(fa.width, fa.height));
      if (fa.treeView) T.buildSkillTree();
      else {
        T.ui.find(".content table").empty();
        for (var a = 0, b = T.list.length; a < b; ++a) T.addSkill(T.list[a]);
      }
      v();
    }
    function t() {
      T.ui.find(".prereq").removeClass("prereq");
      T.ui.find(".preNumber").hide();
    }
    function l(a) {
      a = c(a);
      if (null != a && "_NeedSkillList" in a)
        for (
          var b = $jscomp.makeIterator(a._NeedSkillList), d = b.next();
          !d.done;
          d = b.next()
        ) {
          var d = d.value,
            e = T.ui.find(".skill.id" + d[0] + ":first");
          if (e.length)
            (e.addClass("prereq"), e.find(".preNumber").show().html(d[1]));
          else
            for (e = a.tab - 1; 0 <= e; e--)
              T.ui.find(".tabs button").eq(e).addClass("prereq");
          l(d[0]);
        }
    }
    function f() {
      var a = this.parentNode.parentNode.getAttribute("data-index"),
        b = c(parseInt(a, 10));
      3 != b.tab &&
        (T.ui.find(".skill.id" + a + ":first").addClass("prereq"),
        null != b && l(b.SKID));
    }
    function n() {
      Z ||
        p(
          parseInt(this.parentNode.parentNode.getAttribute("data-index"), 10),
          1,
        );
    }
    function p(a, b) {
      b = void 0 === b ? 1 : b;
      var d = c(a);
      if (3 != d.tab) {
        a = T.ui.find(".skill.id" + a + ":first");
        if (0 > ga - b || null == d || d.level + ka[d.SKID] + b > d.MaxLv)
          return 0;
        if (!d.upgradable) {
          var e = d._NeedSkillList.length,
            f = 0;
          if (!e) return 0;
          for (
            var g = $jscomp.makeIterator(d._NeedSkillList), h = g.next();
            !h.done;
            h = g.next()
          ) {
            var k = h.value,
              h = k[0],
              l = k[1],
              k = c(k[0]);
            if (null == k || k.level + ka[k.SKID] >= l) f++;
            else {
              for (var m = l - k.level, n = 0; n < m; n++) p(h);
              k.level + ka[k.SKID] >= l && f++;
            }
          }
          if (f < e) return 0;
        }
        ka[d.SKID] = d.SKID in ka ? ka[d.SKID] + b : b;
        ga -= b;
        d.bSeperateLv
          ? a
              .find(".level .max")
              .addClass("tempLevel")
              .text(d.level + ka[d.SKID])
          : a
              .find(".level .current")
              .addClass("tempLevel")
              .text(d.level + ka[d.SKID]);
        a.removeClass("active passive disabled");
        a.addClass(d.type ? "active" : "passive");
        T.updateSkpoints();
        d.level + ka[d.SKID] == d.MaxLv &&
          a.find(".levelupcontainer .levelup").hide();
        return 1;
      }
    }
    function v() {
      for (var a in ka) {
        var b = c(a),
          d = T.ui.find(".skill.id" + a + ":first");
        null != b &&
          fa.tab === b.tab &&
          (b.bSeperateLv
            ? d
                .find(".level .max")
                .addClass("tempLevel")
                .text(b.level + ka[b.SKID])
            : d
                .find(".level .current")
                .addClass("tempLevel")
                .text(b.level + ka[b.SKID]),
          d.removeClass("active passive disabled"),
          d.addClass(b.type ? "active" : "passive"));
      }
    }
    function u() {
      var a = L(this).parent();
      a.hasClass("skill") || (a = a.parent());
      T.useSkillID(parseInt(a.data("index"), 10), a.find(".current").text());
    }
    function A() {
      if (fa.showDesc) {
        var a = L(this);
        a.hasClass("skill") || (a = a.parent());
        if ((a = c(parseInt(a.data("index"), 10))))
          U.uid === a.SKID ? U.remove() : (U.append(), U.setSkill(a.SKID));
      } else D();
    }
    function D() {
      L("#SkillDescription").is(":visible") && U.remove();
    }
    function B() {
      var a = L(this).parent();
      a.hasClass("skill") || (a = a.parent());
      T.ui.find(".skill").removeClass("selected");
      a.addClass("selected");
    }
    function O(a) {
      var d = parseInt(this.getAttribute("data-index"), 10),
        d = c(d),
        e = L(this).find(".current").text();
      if (!(d && d.level && d.type && e)) return b(a);
      Z = !0;
      var f = new Image();
      f.src = this.firstChild.firstChild.src;
      a.originalEvent.dataTransfer.setDragImage(f, 12, 12);
      a.originalEvent.dataTransfer.setData(
        "Text",
        JSON.stringify(
          (window._OBJ_DRAG_ = {
            type: "skill",
            from: "SkillList",
            data: d,
            level: e,
          }),
        ),
      );
    }
    function C() {
      Z = !1;
      delete window._OBJ_DRAG_;
    }
    function y() {
      var a = parseInt(
          this.parentNode.parentNode.parentNode.getAttribute("data-index"),
          10,
        ),
        a = c(a),
        b = a._level;
      b < a.level &&
        ((a._level += 1),
        L("#SkillList .selected .current").text(parseInt(b) + 1));
    }
    function z() {
      var a = parseInt(
          this.parentNode.parentNode.parentNode.getAttribute("data-index"),
          10,
        ),
        a = c(a),
        b = a._level;
      1 < b &&
        (--a._level, L("#SkillList .selected .current").text(parseInt(b) - 1));
    }
    var J = a("DB/DBManager"),
      I = a("Engine/SessionStorage"),
      L = a("Utils/jquery"),
      x = a("Core/Client"),
      M = a("Core/Preferences"),
      E = a("Renderer/Renderer"),
      F = a("DB/Status/StatusState"),
      G = a("DB/Jobs/JobConst"),
      H = a("Renderer/Camera"),
      K = a("Renderer/SpriteRenderer"),
      P = a("Controls/MouseEventHandler"),
      N = a("Preferences/Graphics");
    a("UI/Components/ChatBox/ChatBox");
    var S = a("UI/UIManager"),
      R = a("UI/UIComponent"),
      ea = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      U = a("UI/Components/SkillDescription/SkillDescription"),
      V = a("text!./SkillList.html"),
      ca = a("text!./SkillList.css"),
      T = new R("SkillList", V, ca);
    T.TAB = { FIRST: 0, SECOND: 1, THIRD: 2, ETC: 3 };
    var fa = M.get(
      "SkillList",
      {
        x: 100,
        y: 100,
        width: 8,
        height: 8,
        show: !1,
        showDesc: !0,
        treeView: !0,
        tab: T.TAB.FIRST,
      },
      1.3,
    );
    T.list = [];
    var da,
      ta,
      ka = {},
      oa = 0,
      ga = 0,
      la,
      ha = 0,
      X = 0,
      Z = !1;
    T.init = function () {
      da = this.ui.find("canvas")[0].getContext("2d");
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".footer .extend").mousedown(e);
      this.ui.find(".tabs button").mousedown(d);
      this.ui.find(".titlebar .close").click(k);
      this.ui.find(".titlebar .mini").click(g);
      this.ui.find(".footer .reset").click(h);
      this.ui.find(".footer .apply").click(m);
      ta = this.ui.find(".btn.levelup").detach().click(n);
      la = L("#lvlup_job").detach();
      la.click(function () {
        la.detach();
        T.ui.show();
        T.ui.parent().append(T.ui);
        T.ui.is(":visible") && fa.treeView && E.render(qa);
      }).mousedown(b);
      this.ui
        .on("dblclick", ".skill .icon, .skill .name", u)
        .on("mouseover", ".skill", A)
        .on("mouseout", "", D)
        .on("mousedown", ".selectable", B)
        .on("dragstart", ".skill", O)
        .on("dragend", ".skill", C)
        .on("click", ".selected .arw_left", z)
        .on("click", ".selected .arw_right", y);
      this.setSkills();
      T.ui
        .on("mouseup", ".skill .icon img", n)
        .on("mouseover", ".skill .icon img", f)
        .on("mouseleave", ".skill .icon img", t);
      this.ui.find(".show_descr").mousedown(r);
      this.draggable(this.ui.find(".titlebar"));
      this.ui.css("transform", "scale(" + N.zoom / 100 + ")");
    };
    T.onAppend = function () {
      fa.show || this.ui.hide();
      this.ui.css({
        top: Math.min(Math.max(0, fa.y), (E.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, fa.x), (E.width - this.ui.width()) / 2),
      });
      x.loadFile(
        J.INTERFACE_PATH + "checkbox_" + (fa.showDesc ? "1" : "0") + ".bmp",
        function (a) {
          T.ui.find(".show_descr").css("backgroundImage", "url(" + a + ")");
        },
      );
      this.ui.find("canvas").is(":visible") && fa.treeView && E.render(qa);
      this.ui
        .find(".tabs button")
        .eq(fa.tab || 0)
        .addClass("active");
      0 == T.list.length && this.setSkills();
      if (fa.treeView) this.buildSkillTree();
      else {
        T.ui.find(".content table").empty();
        for (var a = 0, b = T.list.length; a < b; ++a) this.addSkill(T.list[a]);
      }
    };
    T.onRemove = function () {
      la.detach();
      fa.treeView && E.stop(qa);
      fa.show = this.ui.is(":visible");
      fa.y = parseInt(this.ui.css("top"), 10);
      fa.x = parseInt(this.ui.css("left"), 10);
      fa.width = Math.floor(this.ui.find(".content").width() / 32);
      fa.height = Math.floor(this.ui.find(".content").height() / 32);
      fa.save();
    };
    T.clean = function () {
      var a, b;
      a = 0;
      for (b = T.list.length; a < b; ++a) this.onUpdateSkill(T.list[a].SKID, 0);
      T.list.length = 0;
      this.ui.find(".content table").empty();
    };
    T.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible")
        ? (fa.treeView && (h(), E.render(qa)), this.focus(), la.detach())
        : fa.treeView &&
          (L("#SkillDescription").is(":visible") && D(), E.stop(qa));
    };
    T.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          this.toggle();
      }
    };
    var qa = (function () {
      var a = 0,
        b = 0,
        c = new Float32Array([1, 1, 1, 1]),
        d = new Float32Array(4),
        e = {
          tick: 0,
          frame: 0,
          repeat: !0,
          play: !0,
          next: !1,
          delay: 0,
          save: !1,
        },
        f =
          F.EffectState.FALCON |
          F.EffectState.RIDING |
          F.EffectState.DRAGON1 |
          F.EffectState.DRAGON2 |
          F.EffectState.DRAGON3 |
          F.EffectState.DRAGON4 |
          F.EffectState.DRAGON5 |
          F.EffectState.MADOGEAR |
          F.EffectState.CART1 |
          F.EffectState.CART2 |
          F.EffectState.CART3 |
          F.EffectState.CART4 |
          F.EffectState.CART5,
        g =
          F.EffectState.CART1 |
          F.EffectState.CART2 |
          F.EffectState.CART3 |
          F.EffectState.CART4 |
          F.EffectState.CART5;
      return function () {
        var h = I.Entity;
        if (!(0 < h.tranfrom_bjob)) {
          var k = h.direction,
            l = h.headDir,
            m = h.action,
            n = h.animation;
          if (h.effectState !== a || b !== I.Entity.cart)
            ((a = h.effectState),
              (b = I.Entity.cart),
              a & f || b
                ? T.ui.find(".removeOption").show()
                : T.ui.find(".removeOption").hide(),
              a & g || b
                ? T.ui.find(".cartList").show()
                : T.ui.find(".cartList").hide());
          H.direction = 4;
          h.direction = 3;
          h.headDir = X;
          E.tick > ha + 1e3 && ((h.headDir = 1 < X ? 0 : X + 1), (ha = E.tick));
          X = h.headDir;
          h.action = h.ACTION.SIT;
          h.animation = e;
          d.set(h.effectColor);
          h.effectColor.set(c);
          K.bind2DContext(da, 30, 130);
          da.clearRect(0, 0, da.canvas.width, da.canvas.height);
          h.renderEntity();
          h.direction = k;
          h.headDir = l;
          h.action = m;
          h.animation = n;
          h.effectColor.set(d);
        }
      };
    })();
    T.updateSkills = function (b) {
      var c, d;
      this.ui.find(".content table").empty();
      c = 0;
      for (d = T.list.length; c < d; ++c)
        3 == T.list[c].tab && (T.list.splice(c, 1), --d, --c);
      c = 0;
      for (d = b.length; c < d; ++c) this.updateOneSkill(b[c]);
      if (fa.treeView) this.buildSkillTree();
      else
        for (
          T.ui.find(".content table").empty(), c = 0, d = T.list.length;
          c < d;
          ++c
        )
          this.addSkill(T.list[c]);
      a("UI/Components/vbk/vbk").updateSkill();
    };
    T.updateOneSkill = function (a) {
      if (
        void 0 ===
        T.list.find(function (b) {
          b.SKID == a.SKID &&
            ((b.type = a.type),
            (b._level = a.level),
            (b.level = a.level),
            (b.spcost = a.spcost),
            (b.attackRange = a.attackRange),
            (b.upgradable = a.upgradable),
            (b.ready = !0));
          return b.SKID == a.SKID;
        })
      ) {
        var b = J.getSkillInfo(a.SKID);
        null != b &&
          ((b.SKID = a.SKID),
          (b.type = a.type),
          (b._level = a.level),
          (b.level = a.level),
          (b.spcost = a.spcost),
          (b.attackRange = a.attackRange),
          (b.upgradable = a.upgradable),
          (b.tab = 3),
          (b.ready = !0),
          T.list.push(b));
      }
    };
    T.buildSkillList = function (a, b) {
      var d = J.getSkillTreePos(a),
        e;
      for (e in d)
        if (((d = J.getSkillTreePos(a, e)), !c(d))) {
          var f = J.getSkillInfo(d);
          f.SKID = d;
          f.type = 0;
          f.level = 0;
          f.DelayTM = 0;
          f.startTickCD = 0;
          f.spcost = 0;
          f.attackRange = 0;
          f.upgradable = 0;
          f.tab =
            a <= G.THIEF ||
            (a >= G.NOVICE_H && a <= G.THIEF_H) ||
            (a >= G.NOVICE_B && a <= G.THIEF_B) ||
            a == G.TAEKWON ||
            (a >= G.GUNSLINGER && a <= G.NINJA) ||
            (a >= G.DO_SUMMONER && a <= G.DO_CART_SUMMONER_B)
              ? T.TAB.FIRST
              : (a >= G.KNIGHT && a <= G.SUMMER) ||
                  (a >= G.KNIGHT_H && a <= G.CRUSADER2_H) ||
                  (a >= G.KNIGHT_B && a <= G.CRUSADER2_B) ||
                  (a >= G.STAR && a <= G.LINKER) ||
                  (a >= G.KAGEROU && a <= G.FROG_OBORO)
                ? T.TAB.SECOND
                : a >= G.RUNE_KNIGHT && a <= G.STAR_EMPEROR2_B
                  ? T.TAB.THIRD
                  : T.TAB.ETC;
          b[f.tab]++;
          T.list.push(f);
        }
      a in J.JobInheritList &&
        (1 < J.JobInheritList[a].length
          ? (T.buildSkillList(J.JobInheritList[a][1], b),
            T.buildSkillList(J.JobInheritList[a][0], b))
          : T.buildSkillList(J.JobInheritList[a], b));
    };
    T.setSkills = function () {
      var a,
        b,
        c = [0, 0, 0, 1];
      a = 0;
      for (b = T.list.length; a < b; ++a) this.onUpdateSkill(T.list[a].SKID, 0);
      T.list.length = 0;
      this.ui.find(".content table").empty();
      T.buildSkillList(I.Character.job, c);
      a = 0;
      for (b = c.length; a < b; ++a)
        c[a]
          ? T.ui.find(".tabs button").eq(a).show()
          : T.ui.find(".tabs button").eq(a).hide();
    };
    T.getSkillPosTree = function (a, b) {
      var d = J.getSkillTreePos(a, b),
        d = c(d);
      if (null != d && d.tab == fa.tab) return d;
      if (a in J.JobInheritList)
        if (1 < J.JobInheritList[a].length) {
          d = T.getSkillPosTree(J.JobInheritList[a][1], b);
          a = T.getSkillPosTree(J.JobInheritList[a][0], b);
          if (-1 != d) return d;
          if (-1 != a) return a;
        } else return T.getSkillPosTree(J.JobInheritList[a], b);
      return -1;
    };
    T.buildSkillTree = function (a) {
      T.ui.find(".content table").empty();
      if (3 == fa.tab) {
        var b,
          c = 0,
          d,
          e;
        b = 0;
        for (d = T.list.length; b < d; ++b)
          if (3 == T.list[b].tab) {
            a = T.list[b];
            if (T.ui.find(".skill.id" + a.SKID + ":first").length) {
              T.updateSkill(a);
              return;
            }
            var f = J.getSkillInfo(a.SKID),
              g = a.level ? (a.type ? "active" : "passive") : "disabled",
              h = ta.clone(!0);
            e = L(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                g +
                " pos" +
                b +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                L.escape(
                  9 < f.SkillName.length
                    ? f.SkillName.substring(0, 6) + "..."
                    : f.SkillName,
                ) +
                '\x3cbr/\x3e\x3cbr/\x3e\x3cbr/\x3e\x3c/div\x3e\x3cdiv class\x3d"level"\x3e' +
                (f.bSeperateLv
                  ? '\x3cspan class\x3d"arw_left" \x3e\x3c/span\x3e\x3cspan class\x3d"current"\x3e' +
                    a._level +
                    '\x3c/span\x3e / \x3cspan class\x3d"max"\x3e' +
                    a.level +
                    '\x3c/span\x3e\x3cspan class\x3d"arw_right"\x3e\x3c/span\x3e'
                  : '\x3cspan class\x3d"current"\x3e' +
                    a.level +
                    "\x3c/span\x3e") +
                '\x3c/div\x3e\x3c/td\x3e\x3ctd class\x3d"preNumber"\x3e\x3c/td\x3e\x3c/tr\x3e',
            );
            a.upgradable && oa ? e.addClass("upgradable") : h.hide();
            x.loadFile(
              J.INTERFACE_PATH + "basic_interface/arw_left.bmp",
              function (a) {
                e.find(".arw_left").attr(
                  "style",
                  "background-image:url(" +
                    a +
                    ");background-repeat:no-repeat;background-position:center;",
                );
              },
            );
            x.loadFile(
              J.INTERFACE_PATH + "basic_interface/arw_right.bmp",
              function (a) {
                e.find(".arw_right").attr(
                  "style",
                  "background-image:url(" +
                    a +
                    ");background-repeat:no-repeat;background-position:center;",
                );
              },
            );
            e.find(".levelupcontainer").append(h);
            T.parseHTML.call(h);
            T.ui.find(".content table").append(e);
            x.loadFile(
              J.INTERFACE_PATH + "item/" + f.Name + ".bmp",
              function (a) {
                e.find(".icon img").attr("src", a);
              },
            );
            c++;
          }
        a = 42 - c;
        if (0 < a)
          for (b = 0; b < a; ++b)
            ((e = L(
              '\x3ctr class\x3d"skill emptyCell pos' +
                b +
                '" draggable\x3d"false"\x3e\x3ctd class\x3d"icon"\x3e\x3c/td\x3e\x3c/tr\x3e',
            )),
              T.ui.find(".content table").append(e));
      } else
        for (b = {}, c = 0; 42 > c; b = { element: b.element }, ++c)
          if (
            ((b.element = void 0),
            -1 != (a = T.getSkillPosTree(I.Character.job, c)))
          ) {
            if (T.ui.find(".skill.id" + a.SKID + ":first").length) {
              T.updateSkill(a);
              break;
            }
            f = J.getSkillInfo(a.SKID);
            g = a.level ? (a.type ? "active" : "passive") : "disabled";
            h = ta.clone(!0);
            b.element = L(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                g +
                " pos" +
                c +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                L.escape(
                  9 < f.SkillName.length
                    ? f.SkillName.substring(0, 6) + "..."
                    : f.SkillName,
                ) +
                '\x3cbr/\x3e\x3cbr/\x3e\x3cbr/\x3e\x3c/div\x3e\x3cdiv class\x3d"level"\x3e' +
                (f.bSeperateLv
                  ? '\x3cspan class\x3d"arw_left" \x3e\x3c/span\x3e\x3cspan class\x3d"current"\x3e' +
                    a._level +
                    '\x3c/span\x3e / \x3cspan class\x3d"max"\x3e' +
                    a.level +
                    '\x3c/span\x3e\x3cspan class\x3d"arw_right"\x3e\x3c/span\x3e'
                  : '\x3cspan class\x3d"current"\x3e' +
                    a.level +
                    "\x3c/span\x3e") +
                '\x3c/div\x3e\x3c/td\x3e\x3ctd class\x3d"preNumber"\x3e\x3c/td\x3e\x3c/tr\x3e',
            );
            a.upgradable && oa ? b.element.addClass("upgradable") : h.hide();
            x.loadFile(
              J.INTERFACE_PATH + "basic_interface/arw_left.bmp",
              (function (a) {
                return function (b) {
                  a.element
                    .find(".arw_left")
                    .attr(
                      "style",
                      "background-image:url(" +
                        b +
                        ");background-repeat:no-repeat;background-position:center;",
                    );
                };
              })(b),
            );
            x.loadFile(
              J.INTERFACE_PATH + "basic_interface/arw_right.bmp",
              (function (a) {
                return function (b) {
                  a.element
                    .find(".arw_right")
                    .attr(
                      "style",
                      "background-image:url(" +
                        b +
                        ");background-repeat:no-repeat;background-position:center;",
                    );
                };
              })(b),
            );
            b.element.find(".levelupcontainer").append(h);
            T.parseHTML.call(h);
            T.ui.find(".content table").append(b.element);
            x.loadFile(
              J.INTERFACE_PATH + "item/" + f.Name + ".bmp",
              (function (a) {
                return function (b) {
                  a.element.find(".icon img").attr("src", b);
                };
              })(b),
            );
          } else
            ((b.element = L(
              '\x3ctr class\x3d"skill emptyCell pos' +
                c +
                '" draggable\x3d"false"\x3e\x3ctd class\x3d"icon"\x3e\x3c/td\x3e\x3c/tr\x3e',
            )),
              T.ui.find(".content table").append(b.element));
    };
    T.addSkill = function (a) {
      if (a.tab === fa.tab && a.SKID in J.getAllSkillInfo())
        if (T.ui.find(".skill.id" + a.SKID + ":first").length) T.updateSkill(a);
        else {
          var b = J.getSkillInfo(a.SKID),
            c = a.level ? (a.type ? "active" : "passive") : "disabled",
            d = ta.clone(!0),
            e = L(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                c +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                L.escape(b.SkillName) +
                '\x3cbr/\x3e\x3cspan class\x3d"level"\x3e' +
                (b.bSeperateLv
                  ? '\x3cspan class\x3d"arw_left" \x3e\x3c/span\x3eLv : \x3cspan class\x3d"current"\x3e' +
                    a._level +
                    '\x3c/span\x3e / \x3cspan class\x3d"max"\x3e' +
                    a.level +
                    '\x3c/span\x3e\x3cspan class\x3d"arw_right"\x3e\x3c/span\x3e'
                  : 'Lv : \x3cspan class\x3d"current"\x3e' +
                    a.level +
                    "\x3c/span\x3e") +
                '\x3c/span\x3e\x3c/div\x3e\x3c/td\x3e\x3ctd class\x3d"selectable type"\x3e\x3cdiv class\x3d"consume"\x3e' +
                (a.type
                  ? 'Sp : \x3cspan class\x3d"spcost"\x3e' +
                    a.spcost +
                    "\x3c/span\x3e"
                  : "\u88ab\u52a8") +
                "\x3c/div\x3e\x3c/td\x3e\x3c/tr\x3e",
            );
          (a.upgradable && oa) || d.hide();
          x.loadFile(
            J.INTERFACE_PATH + "basic_interface/arw_left.bmp",
            function (a) {
              e.find(".arw_left").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          x.loadFile(
            J.INTERFACE_PATH + "basic_interface/arw_right.bmp",
            function (a) {
              e.find(".arw_right").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          e.find(".levelupcontainer").append(d);
          T.parseHTML.call(d);
          T.ui.find(".content table").append(e);
          x.loadFile(
            J.INTERFACE_PATH + "item/" + b.Name + ".bmp",
            function (a) {
              e.find(".icon img").attr("src", a);
            },
          );
        }
    };
    T.removeSkill = function () {};
    T.updateSkill = function (a) {
      var b = c(a.SKID);
      b &&
        ((b.level = a.level),
        (b.spcost = a.spcost),
        (b.attackRange = a.attackRange),
        (b.upgradable = a.upgradable),
        (b = this.ui.find(".skill.id" + a.SKID + ":first")),
        b.find(".level .current, .level .max").text(a.level),
        b.find(".spcost").text(a.spcost),
        b.removeClass("active passive disabled"),
        b.addClass(a.level ? (a.type ? "active" : "passive") : "disabled"),
        a.upgradable && oa
          ? b.find(".levelup").show()
          : b.find(".levelup").hide());
    };
    T.setSkillCDById = function (a, b) {
      (a = c(a)) &&
        a.level &&
        a.type &&
        ((a.startTickCD = Date.now()), (a.DelayTM = b));
    };
    T.useSkillID = function (a, b) {
      (a = c(a)) && a.level && b && a.type && T.useSkill(a, b);
    };
    T.useSkill = (function () {
      var a = 0;
      return function (b, c) {
        var d = Date.now();
        if (!(200 > d - a)) {
          a = d;
          if (b.type & ea.TYPE.SELF) {
            if (I.Entity.cast.isCasting()) return;
            this.onUseSkill(b.SKID, c);
          }
          b.type & ea.TYPE.TARGET &&
            (ea.append(),
            (b.useLevel = c),
            ea.set(b, b.type),
            (ea.onUseSkillToId = T.onUseSkill));
        }
      };
    })();
    T.setPoints = function (a) {
      var b, c;
      b = !oa === !a;
      ga = oa = a;
      this.updateSkpoints();
      if (!b)
        for (c = T.list.length, b = 0; b < c; ++b)
          T.list[b].upgradable && a
            ? this.ui.find(".skill.id" + T.list[b].SKID + " .levelup").show()
            : this.ui.find(".skill.id" + T.list[b].SKID + " .levelup").hide();
    };
    T.updateSkpoints = function () {
      oa == ga
        ? this.ui.find(".skpoints_count").text(oa)
        : this.ui
            .find(".skpoints_count")
            .html(
              '\x3cspan class\x3d"tempPoints"\x3e' + ga + "\x3c/span\x3e/" + oa,
            );
    };
    T.onLevelUp = function () {
      la.appendTo("body");
    };
    T.getList = function () {
      return T.list;
    };
    T.onConfigUpdate = function () {};
    T.onUseSkill = function () {};
    T.onIncreaseSkill = function () {};
    T.onUpdateSkill = function () {};
    T.getSkillById = c;
    return S.addComponent(T);
  },
);
