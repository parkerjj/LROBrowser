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
        c = R.list.length;
      if (void 0 === a) return null;
      for (b = 0; b < c; ++b) if (R.list[b].SKID == a) return R.list[b];
      return null;
    }
    function d() {
      var a = I(this).index();
      fa.tab = parseInt(a, 10);
      R.ui.find(".tabs button").removeClass("active");
      this.classList.add("active");
      if (fa.treeView) R.buildSkillTree();
      else {
        R.ui.find(".content table").empty();
        for (var a = 0, b = R.list.length; a < b; ++a) R.addSkill(R.list[a]);
      }
      v();
    }
    function e() {
      var a = R.ui,
        b = a.position().top,
        c = a.position().left,
        d = 0,
        e = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((M.screen.x - c - -6) / 32),
          f = Math.floor((M.screen.y - b - 32) / 32),
          a = Math.min(Math.max(a, 8), 8),
          f = Math.min(Math.max(f, 4), 10);
        if (a !== d || f !== e) (t(a, f), (d = a), (e = f));
      }, 30);
      I(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), I(window).off("mouseup.resize"));
      });
    }
    function l() {
      la != ga &&
        W.showPromptBox(P.getMessage(1377), "ok", "cancel", function () {
          for (var a in oa)
            for (var b = 0, c = oa[a]; b < c; b++) R.onIncreaseSkill(a);
          h();
        });
    }
    function h() {
      oa = {};
      la != ga && ((ga = la), R.updateSkpoints());
      if (fa.treeView) R.buildSkillTree();
      else {
        R.ui.find(".content table").empty();
        for (var a = 0, b = R.list.length; a < b; ++a) R.addSkill(R.list[a]);
      }
    }
    function r() {
      fa.showDesc = !fa.showDesc;
      x.loadFile(
        P.INTERFACE_PATH + "checkbox_" + (fa.showDesc ? "1" : "0") + ".bmp",
        function (a) {
          R.ui.find(".show_descr").css("backgroundImage", "url(" + a + ")");
        },
      );
    }
    function t(a, b) {
      a = Math.min(Math.max(a, 8), 8);
      b = Math.min(Math.max(b, 4), 10);
      R.ui.find(".content").css({ width: 32 * a, height: 32 * b });
    }
    function n() {
      R.ui.hide();
    }
    function g() {
      R.ui.toggleClass("tree");
      fa.treeView = R.ui.hasClass("tree");
      fa.treeView
        ? (E.render(qa),
          R.ui.find(".content").css("width", ""),
          R.ui.find(".content").css("height", ""))
        : (E.stop(qa), t(fa.width, fa.height));
      if (fa.treeView) R.buildSkillTree();
      else {
        R.ui.find(".content table").empty();
        for (var a = 0, b = R.list.length; a < b; ++a) R.addSkill(R.list[a]);
      }
      v();
    }
    function p() {
      R.ui.find(".prereq").removeClass("prereq");
      R.ui.find(".preNumber").hide();
    }
    function k(a) {
      a = c(a);
      if (null != a && "_NeedSkillList" in a)
        for (
          var b = $jscomp.makeIterator(a._NeedSkillList), d = b.next();
          !d.done;
          d = b.next()
        ) {
          var d = d.value,
            e = R.ui.find(".skill.id" + d[0] + ":first");
          if (e.length)
            (e.addClass("prereq"), e.find(".preNumber").show().html(d[1]));
          else
            for (e = a.tab - 1; 0 <= e; e--)
              R.ui.find(".tabs button").eq(e).addClass("prereq");
          k(d[0]);
        }
    }
    function f() {
      var a = this.parentNode.parentNode.getAttribute("data-index"),
        b = c(parseInt(a, 10));
      3 != b.tab &&
        (R.ui.find(".skill.id" + a + ":first").addClass("prereq"),
        null != b && k(b.SKID));
    }
    function m() {
      Z ||
        q(
          parseInt(this.parentNode.parentNode.getAttribute("data-index"), 10),
          1,
        );
    }
    function q(a, b) {
      b = void 0 === b ? 1 : b;
      var d = c(a);
      if (3 != d.tab) {
        a = R.ui.find(".skill.id" + a + ":first");
        if (0 > ga - b || null == d || d.level + oa[d.SKID] + b > d.MaxLv)
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
            if (null == k || k.level + oa[k.SKID] >= l) f++;
            else {
              for (var m = l - k.level, n = 0; n < m; n++) q(h);
              k.level + oa[k.SKID] >= l && f++;
            }
          }
          if (f < e) return 0;
        }
        oa[d.SKID] = d.SKID in oa ? oa[d.SKID] + b : b;
        ga -= b;
        d.bSeperateLv
          ? a
              .find(".level .max")
              .addClass("tempLevel")
              .text(d.level + oa[d.SKID])
          : a
              .find(".level .current")
              .addClass("tempLevel")
              .text(d.level + oa[d.SKID]);
        a.removeClass("active passive disabled");
        a.addClass(d.type ? "active" : "passive");
        R.updateSkpoints();
        d.level + oa[d.SKID] == d.MaxLv &&
          a.find(".levelupcontainer .levelup").hide();
        return 1;
      }
    }
    function v() {
      for (var a in oa) {
        var b = c(a),
          d = R.ui.find(".skill.id" + a + ":first");
        null != b &&
          fa.tab === b.tab &&
          (b.bSeperateLv
            ? d
                .find(".level .max")
                .addClass("tempLevel")
                .text(b.level + oa[b.SKID])
            : d
                .find(".level .current")
                .addClass("tempLevel")
                .text(b.level + oa[b.SKID]),
          d.removeClass("active passive disabled"),
          d.addClass(b.type ? "active" : "passive"));
      }
    }
    function u() {
      var a = I(this).parent();
      a.hasClass("skill") || (a = a.parent());
      R.useSkillID(parseInt(a.data("index"), 10), a.find(".current").text());
    }
    function A() {
      if (fa.showDesc) {
        var a = I(this);
        a.hasClass("skill") || (a = a.parent());
        if ((a = c(parseInt(a.data("index"), 10))))
          S.uid === a.SKID ? S.remove() : (S.append(), S.setSkill(a.SKID));
      } else D();
    }
    function D() {
      I("#SkillDescription").is(":visible") && S.remove();
    }
    function B() {
      var a = I(this).parent();
      a.hasClass("skill") || (a = a.parent());
      R.ui.find(".skill").removeClass("selected");
      a.addClass("selected");
    }
    function H(a) {
      var d = parseInt(this.getAttribute("data-index"), 10),
        d = c(d),
        e = I(this).find(".current").text();
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
    function z() {
      var a = parseInt(
          this.parentNode.parentNode.parentNode.getAttribute("data-index"),
          10,
        ),
        a = c(a),
        b = a._level;
      b < a.level &&
        ((a._level += 1),
        I("#SkillList .selected .current").text(parseInt(b) + 1));
    }
    function G() {
      var a = parseInt(
          this.parentNode.parentNode.parentNode.getAttribute("data-index"),
          10,
        ),
        a = c(a),
        b = a._level;
      1 < b &&
        (--a._level, I("#SkillList .selected .current").text(parseInt(b) - 1));
    }
    var P = a("DB/DBManager"),
      N = a("Engine/SessionStorage"),
      I = a("Utils/jquery"),
      x = a("Core/Client"),
      J = a("Core/Preferences"),
      E = a("Renderer/Renderer"),
      L = a("DB/Status/StatusState"),
      y = a("DB/Jobs/JobConst"),
      F = a("Renderer/Camera"),
      K = a("Renderer/SpriteRenderer"),
      M = a("Controls/MouseEventHandler"),
      Q = a("Preferences/Graphics");
    a("UI/Components/ChatBox/ChatBox");
    var W = a("UI/UIManager"),
      V = a("UI/UIComponent"),
      ba = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      S = a("UI/Components/SkillDescription/SkillDescription"),
      T = a("text!./SkillList.html"),
      da = a("text!./SkillList.css"),
      R = new V("SkillList", T, da);
    R.TAB = { FIRST: 0, SECOND: 1, THIRD: 2, ETC: 3 };
    var fa = J.get(
      "SkillList",
      {
        x: 100,
        y: 100,
        width: 8,
        height: 8,
        show: !1,
        showDesc: !0,
        treeView: !0,
        tab: R.TAB.FIRST,
      },
      1.3,
    );
    R.list = [];
    var ea,
      ta,
      oa = {},
      la = 0,
      ga = 0,
      ka,
      ha = 0,
      X = 0,
      Z = !1;
    R.init = function () {
      ea = this.ui.find("canvas")[0].getContext("2d");
      this.ui.find(".titlebar .base").mousedown(b);
      this.ui.find(".footer .extend").mousedown(e);
      this.ui.find(".tabs button").mousedown(d);
      this.ui.find(".titlebar .close").click(n);
      this.ui.find(".titlebar .mini").click(g);
      this.ui.find(".footer .reset").click(h);
      this.ui.find(".footer .apply").click(l);
      ta = this.ui.find(".btn.levelup").detach().click(m);
      ka = I("#lvlup_job").detach();
      ka.click(function () {
        ka.detach();
        R.ui.show();
        R.ui.parent().append(R.ui);
        R.ui.is(":visible") && fa.treeView && E.render(qa);
      }).mousedown(b);
      this.ui
        .on("dblclick", ".skill .icon, .skill .name", u)
        .on("mouseover", ".skill", A)
        .on("mouseout", "", D)
        .on("mousedown", ".selectable", B)
        .on("dragstart", ".skill", H)
        .on("dragend", ".skill", C)
        .on("click", ".selected .arw_left", G)
        .on("click", ".selected .arw_right", z);
      this.setSkills();
      R.ui
        .on("mouseup", ".skill .icon img", m)
        .on("mouseover", ".skill .icon img", f)
        .on("mouseleave", ".skill .icon img", p);
      this.ui.find(".show_descr").mousedown(r);
      this.draggable(this.ui.find(".titlebar"));
      this.ui.css("transform", "scale(" + Q.zoom / 100 + ")");
    };
    R.onAppend = function () {
      fa.show || this.ui.hide();
      this.ui.css({
        top: Math.min(Math.max(0, fa.y), (E.height - this.ui.height()) / 2),
        left: Math.min(Math.max(0, fa.x), (E.width - this.ui.width()) / 2),
      });
      x.loadFile(
        P.INTERFACE_PATH + "checkbox_" + (fa.showDesc ? "1" : "0") + ".bmp",
        function (a) {
          R.ui.find(".show_descr").css("backgroundImage", "url(" + a + ")");
        },
      );
      this.ui.find("canvas").is(":visible") && fa.treeView && E.render(qa);
      this.ui
        .find(".tabs button")
        .eq(fa.tab || 0)
        .addClass("active");
      0 == R.list.length && this.setSkills();
      if (fa.treeView) this.buildSkillTree();
      else {
        R.ui.find(".content table").empty();
        for (var a = 0, b = R.list.length; a < b; ++a) this.addSkill(R.list[a]);
      }
    };
    R.onRemove = function () {
      ka.detach();
      fa.treeView && E.stop(qa);
      fa.show = this.ui.is(":visible");
      fa.y = parseInt(this.ui.css("top"), 10);
      fa.x = parseInt(this.ui.css("left"), 10);
      fa.width = Math.floor(this.ui.find(".content").width() / 32);
      fa.height = Math.floor(this.ui.find(".content").height() / 32);
      fa.save();
    };
    R.clean = function () {
      var a, b;
      a = 0;
      for (b = R.list.length; a < b; ++a) this.onUpdateSkill(R.list[a].SKID, 0);
      R.list.length = 0;
      this.ui.find(".content table").empty();
    };
    R.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible")
        ? (fa.treeView && (h(), E.render(qa)), this.focus(), ka.detach())
        : fa.treeView &&
          (I("#SkillDescription").is(":visible") && D(), E.stop(qa));
    };
    R.onShortCut = function (a) {
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
          L.EffectState.FALCON |
          L.EffectState.RIDING |
          L.EffectState.DRAGON1 |
          L.EffectState.DRAGON2 |
          L.EffectState.DRAGON3 |
          L.EffectState.DRAGON4 |
          L.EffectState.DRAGON5 |
          L.EffectState.MADOGEAR |
          L.EffectState.CART1 |
          L.EffectState.CART2 |
          L.EffectState.CART3 |
          L.EffectState.CART4 |
          L.EffectState.CART5,
        g =
          L.EffectState.CART1 |
          L.EffectState.CART2 |
          L.EffectState.CART3 |
          L.EffectState.CART4 |
          L.EffectState.CART5;
      return function () {
        var h = N.Entity;
        if (!(0 < h.tranfrom_bjob)) {
          var k = h.direction,
            l = h.headDir,
            m = h.action,
            n = h.animation;
          if (h.effectState !== a || b !== N.Entity.cart)
            ((a = h.effectState),
              (b = N.Entity.cart),
              a & f || b
                ? R.ui.find(".removeOption").show()
                : R.ui.find(".removeOption").hide(),
              a & g || b
                ? R.ui.find(".cartList").show()
                : R.ui.find(".cartList").hide());
          F.direction = 4;
          h.direction = 3;
          h.headDir = X;
          E.tick > ha + 1e3 && ((h.headDir = 1 < X ? 0 : X + 1), (ha = E.tick));
          X = h.headDir;
          h.action = h.ACTION.SIT;
          h.animation = e;
          d.set(h.effectColor);
          h.effectColor.set(c);
          K.bind2DContext(ea, 30, 130);
          ea.clearRect(0, 0, ea.canvas.width, ea.canvas.height);
          h.renderEntity();
          h.direction = k;
          h.headDir = l;
          h.action = m;
          h.animation = n;
          h.effectColor.set(d);
        }
      };
    })();
    R.updateSkills = function (b) {
      var c, d;
      this.ui.find(".content table").empty();
      c = 0;
      for (d = R.list.length; c < d; ++c)
        3 == R.list[c].tab && (R.list.splice(c, 1), --d, --c);
      c = 0;
      for (d = b.length; c < d; ++c) this.updateOneSkill(b[c]);
      if (fa.treeView) this.buildSkillTree();
      else
        for (
          R.ui.find(".content table").empty(), c = 0, d = R.list.length;
          c < d;
          ++c
        )
          this.addSkill(R.list[c]);
      a("UI/Components/vbk/vbk").updateSkill();
    };
    R.updateOneSkill = function (a) {
      if (
        void 0 ===
        R.list.find(function (b) {
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
        var b = P.getSkillInfo(a.SKID);
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
          R.list.push(b));
      }
    };
    R.buildSkillList = function (a, b) {
      var d = P.getSkillTreePos(a),
        e;
      for (e in d)
        if (((d = P.getSkillTreePos(a, e)), !c(d))) {
          var f = P.getSkillInfo(d);
          f.SKID = d;
          f.type = 0;
          f.level = 0;
          f.DelayTM = 0;
          f.startTickCD = 0;
          f.spcost = 0;
          f.attackRange = 0;
          f.upgradable = 0;
          f.tab =
            a <= y.THIEF ||
            (a >= y.NOVICE_H && a <= y.THIEF_H) ||
            (a >= y.NOVICE_B && a <= y.THIEF_B) ||
            a == y.TAEKWON ||
            (a >= y.GUNSLINGER && a <= y.NINJA) ||
            (a >= y.DO_SUMMONER && a <= y.DO_CART_SUMMONER_B)
              ? R.TAB.FIRST
              : (a >= y.KNIGHT && a <= y.SUMMER) ||
                  (a >= y.KNIGHT_H && a <= y.CRUSADER2_H) ||
                  (a >= y.KNIGHT_B && a <= y.CRUSADER2_B) ||
                  (a >= y.STAR && a <= y.LINKER) ||
                  (a >= y.KAGEROU && a <= y.FROG_OBORO)
                ? R.TAB.SECOND
                : a >= y.RUNE_KNIGHT && a <= y.STAR_EMPEROR2_B
                  ? R.TAB.THIRD
                  : R.TAB.ETC;
          b[f.tab]++;
          R.list.push(f);
        }
      a in P.JobInheritList &&
        (1 < P.JobInheritList[a].length
          ? (R.buildSkillList(P.JobInheritList[a][1], b),
            R.buildSkillList(P.JobInheritList[a][0], b))
          : R.buildSkillList(P.JobInheritList[a], b));
    };
    R.setSkills = function () {
      var a,
        b,
        c = [0, 0, 0, 1];
      a = 0;
      for (b = R.list.length; a < b; ++a) this.onUpdateSkill(R.list[a].SKID, 0);
      R.list.length = 0;
      this.ui.find(".content table").empty();
      R.buildSkillList(N.Character.job, c);
      a = 0;
      for (b = c.length; a < b; ++a)
        c[a]
          ? R.ui.find(".tabs button").eq(a).show()
          : R.ui.find(".tabs button").eq(a).hide();
    };
    R.getSkillPosTree = function (a, b) {
      var d = P.getSkillTreePos(a, b),
        d = c(d);
      if (null != d && d.tab == fa.tab) return d;
      if (a in P.JobInheritList)
        if (1 < P.JobInheritList[a].length) {
          d = R.getSkillPosTree(P.JobInheritList[a][1], b);
          a = R.getSkillPosTree(P.JobInheritList[a][0], b);
          if (-1 != d) return d;
          if (-1 != a) return a;
        } else return R.getSkillPosTree(P.JobInheritList[a], b);
      return -1;
    };
    R.buildSkillTree = function (a) {
      R.ui.find(".content table").empty();
      if (3 == fa.tab) {
        var b,
          c = 0,
          d,
          e;
        b = 0;
        for (d = R.list.length; b < d; ++b)
          if (3 == R.list[b].tab) {
            a = R.list[b];
            if (R.ui.find(".skill.id" + a.SKID + ":first").length) {
              R.updateSkill(a);
              return;
            }
            var f = P.getSkillInfo(a.SKID),
              g = a.level ? (a.type ? "active" : "passive") : "disabled",
              h = ta.clone(!0);
            e = I(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                g +
                " pos" +
                b +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                I.escape(
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
            a.upgradable && la ? e.addClass("upgradable") : h.hide();
            x.loadFile(
              P.INTERFACE_PATH + "basic_interface/arw_left.bmp",
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
              P.INTERFACE_PATH + "basic_interface/arw_right.bmp",
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
            R.parseHTML.call(h);
            R.ui.find(".content table").append(e);
            x.loadFile(
              P.INTERFACE_PATH + "item/" + f.Name + ".bmp",
              function (a) {
                e.find(".icon img").attr("src", a);
              },
            );
            c++;
          }
        a = 42 - c;
        if (0 < a)
          for (b = 0; b < a; ++b)
            ((e = I(
              '\x3ctr class\x3d"skill emptyCell pos' +
                b +
                '" draggable\x3d"false"\x3e\x3ctd class\x3d"icon"\x3e\x3c/td\x3e\x3c/tr\x3e',
            )),
              R.ui.find(".content table").append(e));
      } else
        for (b = {}, c = 0; 42 > c; b = { element: b.element }, ++c)
          if (
            ((b.element = void 0),
            -1 != (a = R.getSkillPosTree(N.Character.job, c)))
          ) {
            if (R.ui.find(".skill.id" + a.SKID + ":first").length) {
              R.updateSkill(a);
              break;
            }
            f = P.getSkillInfo(a.SKID);
            g = a.level ? (a.type ? "active" : "passive") : "disabled";
            h = ta.clone(!0);
            b.element = I(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                g +
                " pos" +
                c +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                I.escape(
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
            a.upgradable && la ? b.element.addClass("upgradable") : h.hide();
            x.loadFile(
              P.INTERFACE_PATH + "basic_interface/arw_left.bmp",
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
              P.INTERFACE_PATH + "basic_interface/arw_right.bmp",
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
            R.parseHTML.call(h);
            R.ui.find(".content table").append(b.element);
            x.loadFile(
              P.INTERFACE_PATH + "item/" + f.Name + ".bmp",
              (function (a) {
                return function (b) {
                  a.element.find(".icon img").attr("src", b);
                };
              })(b),
            );
          } else
            ((b.element = I(
              '\x3ctr class\x3d"skill emptyCell pos' +
                c +
                '" draggable\x3d"false"\x3e\x3ctd class\x3d"icon"\x3e\x3c/td\x3e\x3c/tr\x3e',
            )),
              R.ui.find(".content table").append(b.element));
    };
    R.addSkill = function (a) {
      if (a.tab === fa.tab && a.SKID in P.getAllSkillInfo())
        if (R.ui.find(".skill.id" + a.SKID + ":first").length) R.updateSkill(a);
        else {
          var b = P.getSkillInfo(a.SKID),
            c = a.level ? (a.type ? "active" : "passive") : "disabled",
            d = ta.clone(!0),
            e = I(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                c +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                I.escape(b.SkillName) +
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
          (a.upgradable && la) || d.hide();
          x.loadFile(
            P.INTERFACE_PATH + "basic_interface/arw_left.bmp",
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
            P.INTERFACE_PATH + "basic_interface/arw_right.bmp",
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
          R.parseHTML.call(d);
          R.ui.find(".content table").append(e);
          x.loadFile(
            P.INTERFACE_PATH + "item/" + b.Name + ".bmp",
            function (a) {
              e.find(".icon img").attr("src", a);
            },
          );
        }
    };
    R.removeSkill = function () {};
    R.updateSkill = function (a) {
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
        a.upgradable && la
          ? b.find(".levelup").show()
          : b.find(".levelup").hide());
    };
    R.setSkillCDById = function (a, b) {
      (a = c(a)) &&
        a.level &&
        a.type &&
        ((a.startTickCD = Date.now()), (a.DelayTM = b));
    };
    R.useSkillID = function (a, b) {
      (a = c(a)) && a.level && b && a.type && R.useSkill(a, b);
    };
    R.useSkill = (function () {
      var a = 0;
      return function (b, c) {
        var d = Date.now();
        if (!(200 > d - a)) {
          a = d;
          if (b.type & ba.TYPE.SELF) {
            if (N.Entity.cast.isCasting()) return;
            this.onUseSkill(b.SKID, c);
          }
          b.type & ba.TYPE.TARGET &&
            (ba.append(),
            (b.useLevel = c),
            ba.set(b, b.type),
            (ba.onUseSkillToId = R.onUseSkill));
        }
      };
    })();
    R.setPoints = function (a) {
      var b, c;
      b = !la === !a;
      ga = la = a;
      this.updateSkpoints();
      if (!b)
        for (c = R.list.length, b = 0; b < c; ++b)
          R.list[b].upgradable && a
            ? this.ui.find(".skill.id" + R.list[b].SKID + " .levelup").show()
            : this.ui.find(".skill.id" + R.list[b].SKID + " .levelup").hide();
    };
    R.updateSkpoints = function () {
      la == ga
        ? this.ui.find(".skpoints_count").text(la)
        : this.ui
            .find(".skpoints_count")
            .html(
              '\x3cspan class\x3d"tempPoints"\x3e' + ga + "\x3c/span\x3e/" + la,
            );
    };
    R.onLevelUp = function () {
      ka.appendTo("body");
    };
    R.getList = function () {
      return R.list;
    };
    R.onConfigUpdate = function () {};
    R.onUseSkill = function () {};
    R.onIncreaseSkill = function () {};
    R.onUpdateSkill = function () {};
    R.getSkillById = c;
    return W.addComponent(R);
  },
);
