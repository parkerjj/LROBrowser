define(
  "UI/Components/Homunc/HomuncskillList",
  "require Utils/jquery DB/DBManager Core/Client Core/Preferences Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/SkillDescription/SkillDescription text!./HomuncskillList.html text!./HomuncskillList.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = g(this).parent(),
        b = a.find(".current"),
        c = a.find(".max"),
        a = parseInt(b.text()),
        c = parseInt(c.text());
      a < c && b.text(parseInt(a) + 1);
    }
    function c() {
      var a = g(this).parent().find(".current"),
        b = parseInt(a.text());
      1 < b && a.text(parseInt(b) - 1);
    }
    function d() {
      if (0 >= C) return 0;
      var a = this.parentNode.parentNode.getAttribute("data-index");
      E.onIncreaseSkill(parseInt(a, 10));
    }
    function e() {
      var a = g(this);
      a.hasClass("skill") || (a = a.parent());
      E.useSkillID(parseInt(a.data("index"), 10), a.find(".current").text());
    }
    function m(a) {
      var b,
        c = A.length;
      for (b = 0; b < c; ++b) if (A[b].SKID === a) return A[b];
      return null;
    }
    function h() {
      var a = g(this),
        a = m(parseInt(a.data("index"), 10));
      t.uid != a.SKID ? (t.append(), t.setSkill(a.SKID)) : t.remove();
    }
    function q() {
      E.ui.hide();
    }
    function r(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function k(a) {
      var b = parseInt(this.getAttribute("data-index"), 10),
        b = m(b),
        c = g(this).find(".current").text();
      if (!b || !b.level || !b.type) return r(a);
      var d = new Image();
      d.src = this.src;
      a.originalEvent.dataTransfer.setDragImage(d, 12, 12);
      a.originalEvent.dataTransfer.setData(
        "Text",
        JSON.stringify(
          (window._OBJ_DRAG_ = {
            type: "skill",
            from: "HomuncskillList",
            data: b,
            level: c,
          }),
        ),
      );
    }
    var g = a("Utils/jquery"),
      u = a("DB/DBManager"),
      l = a("Core/Client"),
      f = a("Core/Preferences");
    a("Renderer/Renderer");
    var n = a("UI/UIManager"),
      p = a("UI/UIComponent"),
      v = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      t = a("UI/Components/SkillDescription/SkillDescription"),
      z = a("text!./HomuncskillList.html");
    a = a("text!./HomuncskillList.css");
    var E = new p("HomuncskillList", z, a),
      C = 0,
      J;
    f.get("HomuncskillList", { x: 100, y: 200, show: !1 }, 1);
    var A = [];
    E.init = function () {
      this.draggable(this.ui.find(".titlebar"));
      J = this.ui.find(".btn.levelup").detach().mousedown(r).click(d);
      this.ui.find(".close").click(q);
      this.ui
        .find(".content")
        .on("dblclick", ".skill.active .icon", e)
        .on("click", ".arw_left", c)
        .on("click", ".arw_right", b)
        .on("contextmenu", ".skill", h)
        .on("dragstart", ".skill", k)
        .on("dragend", ".skill", function () {
          delete window._OBJ_DRAG_;
        });
      this.ui.hide();
    };
    E.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && (this.focus(), _btnLevelUp.detach());
    };
    E.onAppend = function () {};
    E.onRemove = function () {};
    E.onShortCut = function (a) {
      if (this.ui)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(), this.ui.is(":visible") && this.focus());
        }
    };
    E.setskill = function (a) {
      var b, c;
      A.length = 0;
      this.ui.find(".content table").empty();
      b = 0;
      for (c = a.length; b < c; ++b) this.addSkill(a[b]);
    };
    E.addSkill = function (a) {
      if (a.SKID in u.getAllSkillInfo())
        if (this.ui.find(".skill.id" + a.SKID + ":first").length)
          this.updateSkill(a);
        else {
          var b = u.getSkillInfo(a.SKID),
            c = J.clone(!0),
            d = g(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                (a.level ? (a.type ? "active" : "passive") : "disabled") +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                g.escape(b.SkillName) +
                '\x3cbr/\x3e\x3cspan class\x3d"level"\x3e' +
                (a.level
                  ? b.bSeperateLv
                    ? '\x3cspan class\x3d"arw_left" \x3e\x3c/span\x3e Lv : \x3cspan class\x3d"current"\x3e' +
                      a.level +
                      '\x3c/span\x3e / \x3cspan class\x3d"max"\x3e' +
                      a.level +
                      '\x3c/span\x3e\x3cspan class\x3d"arw_right"\x3e\x3c/span\x3e'
                    : 'Lv : \x3cspan class\x3d"current"\x3e' +
                      a.level +
                      "\x3c/span\x3e"
                  : "") +
                '\x3c/span\x3e\x3c/div\x3e\x3c/td\x3e\x3ctd class\x3d"selectable type"\x3e' +
                (a.type
                  ? a.spcost
                    ? 'Sp : \x3cspan class\x3d"spcost"\x3e' +
                      a.spcost +
                      "\x3c/span\x3e"
                    : "\u4e3b\u52a8"
                  : "\u88ab\u52a8") +
                "\x3c/td\x3e\x3c/tr\x3e",
            );
          (a.upgradable && C) || c.hide();
          l.loadFile(
            u.INTERFACE_PATH + "basic_interface/arw_left.bmp",
            function (a) {
              d.find(".arw_left").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          l.loadFile(
            u.INTERFACE_PATH + "basic_interface/arw_right.bmp",
            function (a) {
              d.find(".arw_right").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          this.ui.find(".content table").append(d);
          l.loadFile(
            u.INTERFACE_PATH + "item/" + b.Name + ".bmp",
            function (a) {
              d.find(".icon img").attr("src", a);
            },
          );
          d.find(".levelupcontainer").append(c);
          A.push(a);
        }
    };
    E.setPoints = function (a) {
      var b, c;
      this.ui.find(".skpoints_count").text(a);
      if (!C === !a) C = a;
      else {
        C = a;
        c = A.length;
        for (b = 0; b < c; ++b)
          A[b].upgradable && a
            ? this.ui.find(".skill.id" + A[b].SKID + " .levelup").show()
            : this.ui.find(".skill.id" + A[b].SKID + " .levelup").hide();
        0 < a && this.ui.find(".levelup").css("opacity", 1);
      }
    };
    E.useSkillID = function (a, b) {
      (a = m(a)) && b && a.type && E.useSkill(a, b);
    };
    E.useSkill = (function () {
      var a = 0;
      return function (b, c) {
        var d = Date.now();
        if (!(200 > d - a)) {
          a = d;
          if (b.type & v.TYPE.SELF) this.onUseSkill(b.SKID, c);
          b.type & v.TYPE.TARGET &&
            (v.append(),
            (b.useLevel = c),
            v.set(b, b.type),
            (v.onUseSkillToId = E.onUseSkill));
        }
      };
    })();
    E.onUseSkill = function () {};
    E.onIncreaseSkill = function () {};
    E.getSkillById = m;
    return n.addComponent(E);
  },
);
