define(
  "UI/Components/Achievement/Achievement",
  "require DB/DBManager Utils/jquery Network/NetworkManager Network/PacketStructure Core/Client UI/UIManager UI/UIComponent UI/Components/AchDescription/AchDescription text!./Achievement.html text!./Achievement.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      (a = parseInt(this.getAttribute("data-id"), 10)) ||
        (a = parseInt(this.parentNode.getAttribute("data-id"), 10));
      var b;
      a: {
        for (b = 0; b < g.length; b++)
          if (g[b].id == a) {
            b = g[b];
            break a;
          }
        b = void 0;
      }
      b && (r.remove(), r.append(), (r.uid = a), r.setAch(b));
    }
    var c = a("DB/DBManager"),
      d = a("Utils/jquery");
    a("Network/NetworkManager");
    a("Network/PacketStructure");
    var e = a("Core/Client"),
      m = a("UI/UIManager"),
      h = a("UI/UIComponent"),
      r = a("UI/Components/AchDescription/AchDescription"),
      q = a("text!./Achievement.html");
    a = a("text!./Achievement.css");
    var k = new h("Achievement", q, a),
      g = [],
      t = [],
      l = 1,
      f = 1,
      n = 1,
      p = 10;
    k.ACHEXP = 0;
    k.ACHEXPTNL = 0;
    k.ACHPoint = 0;
    k.ACHLevel = 0;
    k.init = function () {
      this.ui.on("click", function () {
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".content").on("click", ".ach", b);
      this.ui.find(".titlebar .close").on("click", function () {
        k.ui.hide();
      });
      this.ui.find(".tabs button").on("click", function () {
        k.ui.find(".tabs button.sd").removeClass("sd");
        d(this).addClass("sd");
        d(this).data("tab") != l &&
          0 <= d(this).data("tab") &&
          ((f = 1), (l = d(this).data("tab")), k.setAchs());
      });
      this.ui.find(".page").on("click", ".prev", function () {
        1 < f && (--f, k.SwitchTab());
      });
      this.ui.find(".page").on("click", ".next", function () {
        f < n && ((f += 1), k.SwitchTab());
      });
      this.ui.find(".menus").on("click", function () {
        d("#basicbutton").addClass("open").show();
      });
    };
    k.onAppend = function () {};
    k.onRemove = function () {
      this.ui.hide();
    };
    k.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && (this.focus(), k.setAchs());
    };
    k.clean = function () {
      this.ui.hide();
      g = [];
      t = [];
      n = f = l = 1;
      p = 10;
      k.ACHEXP = 0;
      k.ACHEXPTNL = 0;
      k.ACHPoint = 0;
      k.ACHLevel = 0;
      k.ui.find(".content").empty();
    };
    k.setAchList = function (a) {
      t = [];
      t = a.ACHList;
      k.ui && k.ui.is(":visible") && k.setAchs();
    };
    k.updateAch = function (a) {
      k.ACHEXP = a.ACHEXP;
      k.ACHEXPTNL = a.ACHEXPTNL;
      k.ACHPoint = a.ACHPoint;
      k.ACHLevel = a.ACHLevel;
      if (a.Achievement[0].AID) {
        for (var b = 0, c = 0; c < t.length; c++)
          t[c].AID == a.Achievement[0].AID &&
            ((t[c].Completed = a.Achievement[0].Completed),
            (t[c].endtime = a.Achievement[0].endtime),
            (t[c].rewarded = a.Achievement[0].rewarded),
            (b = 1));
        0 == b && t.push(a.Achievement[0]);
        k.ui && k.ui.is(":visible") && k.setAchs();
      }
    };
    k.setPage = function () {
      n = Math.ceil(g.length / p);
      this.ui.find(".currentPage").text(f);
      this.ui.find(".totalPages").text(n);
      this.ui.find(".page").show();
    };
    k.setAchs = function () {
      k.ui.find(".achLv").text(this.ACHLevel);
      k.ui.find(".achPoints").text(this.ACHPoint);
      k.ui.find(".achExp").text(this.ACHEXP);
      k.ui.find(".achExptnl").text(this.ACHEXPTNL);
      var a = Math.round((this.ACHEXP / this.ACHEXPTNL) * 100);
      k.ui.find(".expBar").css("width", a + "px");
      g = [];
      for (
        var a = JSON.parse(JSON.stringify(c.getAllAchInfo())), b = 0;
        b < t.length;
        b++
      )
        0 < t[b].AID &&
          ((a[t[b].AID].Completed =
            t[b].Completed && void 0 != t[b].Completed ? t[b].Completed : 0),
          (a[t[b].AID].endtime = t[b].endtime),
          (a[t[b].AID].rewarded = t[b].rewarded));
      for (var b = Object.keys(a), d = 0; d < b.length; d++) {
        var e = b[d];
        a[e].major == l && ((a[e].id = e), g.push(a[e]));
      }
      this.SwitchTab();
    };
    k.SwitchTab = function () {
      k.ui.find(".container .content").empty();
      for (var a = (f - 1) * p; a < (f - 1) * p + p; a++)
        g[a] && k.addAch(g[a]);
      this.setPage();
    };
    k.addAch = function (a) {
      var b = d(
        '\x3cdiv class\x3d"ach ' +
          (a.Completed ? "completed" : "") +
          '" data-id\x3d"' +
          a.id +
          '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"head"\x3e\x3cdiv class\x3d"left"\x3e\x3cdiv class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"38" height\x3d"32" /\x3e\x3c/div\x3e\x3cp class\x3d"title"\x3e' +
          a.title +
          (a.Completed ? "(\u5df2\u8fbe\u6210)" : "(\u672a\u8fbe\u6210)") +
          '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cdiv class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"20" height\x3d"30" /\x3e\x3c/div\x3e\x3cp class\x3d"rewardPoint"\x3e' +
          a.score +
          '\x3c/p\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cdiv class\x3d"left"\x3e\x3cp class\x3d"shortdesc"\x3e' +
          a.content[0].summary +
          '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cdiv class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"30" height\x3d"23" /\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
      );
      k.ui.find(".container .content").append(b);
      e.loadFile(
        c.INTERFACE_PATH + "achievement_re/icon_" + a.group + ".bmp",
        function (a) {
          b.find(".head .left .icon img").attr("src", a);
        },
      );
      e.loadFile(
        c.INTERFACE_PATH + "achievement_re/badge_complete.bmp",
        function (c) {
          b.find(".head .right .icon img").attr("src", c);
          a.Completed
            ? b.find(".head .right .icon img").show()
            : b.find(".head .right .icon img").hide();
        },
      );
      e.loadFile(
        c.INTERFACE_PATH + "achievement_re/list_rewardbox_default.bmp",
        function (c) {
          b.find(".bottom .right .icon img").attr("src", c);
          void 0 != a.reward && a.reward.length
            ? a.rewarded &&
              b.find(".bottom .right .icon img").css("opacity", "0.2")
            : b.find(".bottom .right .icon img").hide();
        },
      );
    };
    return m.addComponent(k);
  },
);
