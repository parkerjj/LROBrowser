define(
  "UI/Components/Mercenary/MercenaryskillList",
  "require Utils/jquery DB/DBManager Core/Client Core/Preferences Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/SkillDescription/SkillDescription text!./MercenaryskillList.html text!./MercenaryskillList.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = h(this);
      a.hasClass("skill") || (a = a.parent());
      p.useSkillID(parseInt(a.data("index"), 10), a.find(".current").text());
    }
    function c(a) {
      var b,
        c = v.length;
      for (b = 0; b < c; ++b) if (v[b].SKID === a) return v[b];
      return null;
    }
    function d() {
      var a = h(this),
        a = c(parseInt(a.data("index"), 10));
      f.uid != a.SKID ? (f.append(), f.setSkill(a.SKID)) : f.remove();
    }
    function e() {
      p.ui.hide();
    }
    function m(a) {
      var b = parseInt(this.getAttribute("data-index"), 10),
        b = c(b),
        d = h(this).find(".current").text();
      if (!b || !b.level || !b.type) return (a.stopImmediatePropagation(), !1);
      var e = new Image();
      e.src = this.src;
      a.originalEvent.dataTransfer.setDragImage(e, 12, 12);
      a.originalEvent.dataTransfer.setData(
        "Text",
        JSON.stringify(
          (window._OBJ_DRAG_ = {
            type: "skill",
            from: "MercenaryskillList",
            data: b,
            level: d,
          }),
        ),
      );
    }
    var h = a("Utils/jquery"),
      r = a("DB/DBManager"),
      q = a("Core/Client"),
      k = a("Core/Preferences");
    a("Renderer/Renderer");
    var g = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      l = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      f = a("UI/Components/SkillDescription/SkillDescription"),
      n = a("text!./MercenaryskillList.html");
    a = a("text!./MercenaryskillList.css");
    var p = new t("MercenaryskillList", n, a);
    k.get("MercenaryskillList", { x: 100, y: 200, show: !1 }, 1);
    var v = [];
    p.init = function () {
      this.draggable(this.ui.find(".titlebar"));
      this.ui.find(".close").click(e);
      this.ui
        .on("dblclick", ".skill.active .icon", b)
        .find(".content")
        .on("contextmenu", ".skill", d)
        .on("dragstart", ".skill", m)
        .on("dragend", ".skill", function () {
          delete window._OBJ_DRAG_;
        });
      this.ui.hide();
    };
    p.onRemove = function () {};
    p.onShortCut = function (a) {
      if (this.ui)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(), this.ui.is(":visible") && this.focus());
        }
    };
    p.setskill = function (a) {
      var b, c;
      v.length = 0;
      this.ui.find(".content table").empty();
      b = 0;
      for (c = a.length; b < c; ++b) this.addSkill(a[b]);
    };
    p.addSkill = function (a) {
      if (a.SKID in r.getAllSkillInfo())
        if (this.ui.find(".skill.id" + a.SKID + ":first").length)
          this.updateSkill(a);
        else {
          var b = r.getSkillInfo(a.SKID),
            c = h(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                (a.level ? (a.type ? "active" : "passive") : "disabled") +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                h.escape(b.SkillName) +
                '\x3cbr/\x3e\x3cspan class\x3d"level"\x3e' +
                (b.bSeperateLv
                  ? '\x3cspan class\x3d"arw_left" \x3e\x3c/span\x3e Lv : \x3cspan class\x3d"current"\x3e' +
                    a.level +
                    '\x3c/span\x3e / \x3cspan class\x3d"max"\x3e' +
                    a.level +
                    '\x3c/span\x3e\x3cspan class\x3d"arw_right"\x3e\x3c/span\x3e'
                  : 'Lv : \x3cspan class\x3d"current"\x3e' +
                    a.level +
                    "\x3c/span\x3e") +
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
          q.loadFile(
            r.INTERFACE_PATH + "basic_interface/arw_left.bmp",
            function (a) {
              c.find(".arw_left").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          q.loadFile(
            r.INTERFACE_PATH + "basic_interface/arw_right.bmp",
            function (a) {
              c.find(".arw_right").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          this.ui.find(".content table").append(c);
          q.loadFile(
            r.INTERFACE_PATH + "item/" + b.Name + ".bmp",
            function (a) {
              c.find(".icon img").attr("src", a);
            },
          );
          v.push(a);
        }
    };
    p.useSkillID = function (a, b) {
      (a = c(a)) && b && a.type && p.useSkill(a, b);
    };
    p.useSkill = (function () {
      var a = 0;
      return function (b, c) {
        var d = Date.now();
        if (!(200 > d - a)) {
          a = d;
          if (b.type & l.TYPE.SELF) this.onUseSkill(b.SKID, c);
          b.type & l.TYPE.TARGET &&
            (l.append(),
            (b.useLevel = c),
            l.set(b, b.type),
            (l.onUseSkillToId = p.onUseSkill));
        }
      };
    })();
    p.onUseSkill = function () {};
    p.getSkillById = c;
    return g.addComponent(p);
  },
);
