define(
  "UI/Components/BasicInfo/BasicInfo",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Client Core/Preferences Core/Configs Preferences/Controls Network/NetworkManager Network/PacketStructure Renderer/Renderer Engine/SessionStorage UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart UI/Components/WinStats/WinStats UI/Components/Equipment/Equipment UI/Components/SkillList/SkillList UI/Components/PartyFriends/PartyFriends UI/Components/Guild/Guild UI/Components/Emoticons/Emoticons UI/Components/Escape/Escape UI/Components/WorldMap/WorldMap UI/Components/Achievement/Achievement UI/Components/Attendance/Attendance UI/Components/CardConnection/CardConnection2 UI/Components/ShortCut/ShortCut UI/Components/Shop/CashShop UI/Components/PartyBooking/PartyBooking UI/Components/Quest/Quest UI/Components/Mail/Rodex text!./BasicInfo.html text!./BasicInfo.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      if (!(1e3 > a - R)) {
        R = a;
        S++;
        var b = 3600 - S;
        0 > b && (b = 0);
        a = parseInt(b / 60);
        b %= 60;
        a =
          (0 == parseInt(a / 10) ? "0" + a : a) +
          ":" +
          (0 == parseInt(b / 10) ? "0" + b : b);
        K.ui.find("#goldpcButton .timer").text(a);
      }
    }
    var c = a("DB/DBManager"),
      d = a("DB/Monsters/MonsterTable"),
      e = a("Core/Client"),
      m = a("Core/Preferences"),
      h = a("Core/Configs"),
      r = a("Preferences/Controls"),
      q = a("Network/NetworkManager"),
      k = a("Network/PacketStructure"),
      g = a("Renderer/Renderer"),
      t = a("Engine/SessionStorage"),
      l = a("UI/UIManager"),
      f = a("UI/UIComponent"),
      n = a("UI/Components/Inventory/Inventory");
    a("UI/Components/OnPushCart/OnPushCart");
    var p = a("UI/Components/WinStats/WinStats"),
      v = a("UI/Components/Equipment/Equipment"),
      u = a("UI/Components/SkillList/SkillList"),
      A = a("UI/Components/PartyFriends/PartyFriends"),
      D = a("UI/Components/ChatBox/ChatBox"),
      B = a("UI/Components/Guild/Guild"),
      O = a("UI/Components/Emoticons/Emoticons"),
      C = a("UI/Components/Escape/Escape"),
      y = a("UI/Components/Quest/Quest"),
      z = a("UI/Components/Mail/Rodex"),
      J = a("UI/Components/WorldMap/WorldMap"),
      I = a("UI/Components/Achievement/Achievement"),
      L = a("UI/Components/Attendance/Attendance"),
      x = a("UI/Components/CardConnection/CardConnection2"),
      M = a("UI/Components/ShortCut/ShortCut"),
      E = a("UI/Components/Shop/CashShop"),
      F = a("UI/Components/PartyBooking/PartyBooking"),
      G = a("text!./BasicInfo.html"),
      H = a("text!./BasicInfo.css"),
      K = new f("BasicInfo", G, H);
    K.base_exp = 0;
    K.base_exp_next = 1;
    K.job_exp = 0;
    K.job_exp_next = -1;
    K.weight = 0;
    K.weight_max = 1;
    var P = m.get("BasicInfo", { x: 0, y: 0, reduce: !0, buttons: !0 }, 1),
      N = h.get("ClientVer");
    K.init = function () {
      this.ui.find(".topbar button").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.ui.find(".topbar .right").click(K.toggleMode.bind(this));
      this.ui.find(".toggle_btns_show").mousedown(K.toggleButtons.bind(this));
      this.ui.find(".toggle_btns_hide").mousedown(K.toggleButtons.bind(this));
      this.ui.find(".buttons button").mousedown(function () {
        switch (this.className) {
          case "status":
            p.ui.toggle();
            p.focus();
            break;
          case "equip":
            v.toggle();
            break;
          case "item":
            n.ui.toggle();
            n.focus();
            break;
          case "info":
            v.toggle();
            break;
          case "skill":
            u.toggle();
            break;
          case "option":
            C.ui.toggle();
            C.focus();
            break;
          case "party":
            A.toggle();
            break;
          case "guild":
            B.toggle();
            break;
          case "cashshop":
            if (E.ui && E.ui.is(":visible")) break;
            E.ui.show();
            var b = new k.CZ.REQ_CASHSHOP_OPEN();
            q.sendPacket(b);
            break;
          case "sit":
            b = new k.CZ.REQUEST_ACT();
            b.action = t.Entity.action === t.Entity.ACTION.SIT ? 3 : 2;
            q.sendPacket(b);
            break;
          case "quest":
            y.toggle();
            y.focus();
            break;
          case "emo":
            O.ui.toggle();
            O.focus();
            break;
          case "map":
            J.select();
            break;
          case "mail":
            if (z.ui && z.ui.is(":visible")) break;
            z.ui.show();
            b = new k.CZ.OPEN_MAILBOX();
            b.MailTAB = 0;
            b.MailID = 0;
            q.sendPacket(b);
            z.focus();
            break;
          case "shortcut":
            M.setCustom();
            break;
          case "achievement":
            3 == N || 4 == N || 5 == N
              ? I.toggle()
              : l.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "attendance":
            3 == N || 4 == N || 5 == N
              ? L.toggle()
              : l.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "CardConnection":
            3 == N || 4 == N || 5 == N
              ? (x.ui.is(":visible") && x.ui.hide(), x.ui.show(), x.focus())
              : l.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "adventureragency":
            3 == N || 4 == N || 5 == N
              ? (a("Renderer/MapRenderer"),
                (b = new FormData()),
                b.append("AuthToken", t.AuthToken),
                b.append("AID", t.Entity.GID),
                b.append("GDID", t.Entity.GUID),
                b.append("WorldName", "lastro"),
                $.ajax({
                  url: "https://game.lastro.cn/" + c.webpath + "/party/list",
                  type: "POST",
                  cache: !1,
                  data: b,
                  processData: !1,
                  contentType: !1,
                })
                  .done(function (a) {
                    F.setList(a);
                  })
                  .fail(function (a) {
                    l.showMessageBox(
                      "\u6570\u636e\u52a0\u8f7d\u5931\u8d25",
                      "ok",
                    );
                  }))
              : l.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
        }
      });
      this.ui.find("#goldpcButton").on("click", function () {
        if (!r.talk) {
          var a = new k.CZ.DYNAMICNPC_CREATE_REQUEST();
          a.name = "GOLDPCCAFE";
          q.sendPacket(a);
        }
      });
    };
    var S = 0;
    K.setGoldPccafe = function (a) {
      a.isActive
        ? ((S = a.playedTime),
          this.ui.find("#goldpcButton .points").text(a.point),
          g.stop(b),
          0 < 3600 - S && g.render(b))
        : g.stop(b);
    };
    var R = 0;
    K.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, P.y), g.height - this.ui.height()),
        left: Math.min(Math.max(0, P.x), g.width - this.ui.width()),
      });
      this.ui.removeClass("small large");
      P.reduce
        ? (this.ui.addClass("small"),
          P.buttons
            ? (this.ui.find(".buttons").show(),
              this.ui.find(".toggle_btns_hide").show(),
              this.ui.find(".toggle_btns_show").hide())
            : (this.ui.find(".buttons").hide(),
              this.ui.find(".toggle_btns_hide").hide(),
              this.ui.find(".toggle_btns_show").show()))
        : this.ui.addClass("large");
    };
    K.onRemove = function () {
      g.stop(b);
      K.ui &&
        (K.ui.find("#goldpcButton .timer").text("00:00"),
        K.ui.find("#goldpcButton .points").text("0"));
      P.x = parseInt(this.ui.css("left"), 10);
      P.y = parseInt(this.ui.css("top"), 10);
      P.reduce = this.ui.hasClass("small");
      P.buttons = this.ui.find(".buttons").is(":visible");
      P.save();
    };
    K.onShortCut = function (a) {
      switch (a.cmd) {
        case "EXTEND":
          this.toggleMode();
      }
    };
    K.toggleMode = function () {
      var a;
      this.ui.toggleClass("small large");
      this.ui.hasClass("large")
        ? this.ui.find(".buttons").show()
        : (P.buttons
            ? (this.ui.find(".buttons").show(), (a = "off"))
            : (this.ui.find(".buttons").hide(), (a = "on")),
          e.loadFile(
            c.INTERFACE_PATH + "basic_interface/view" + a + ".bmp",
            function (a) {
              this.ui
                .find(".toggle_btns")
                .css("backgroundImage", "url(" + a + ")");
            }.bind(this),
          ));
    };
    K.toggleButtons = function (a) {
      var b = this.ui.find(".buttons");
      P.buttons = !b.is(":visible");
      P.buttons
        ? (b.show(),
          this.ui.find(".toggle_btns_hide").show(),
          this.ui.find(".toggle_btns_show").hide())
        : (b.hide(),
          this.ui.find(".toggle_btns_hide").hide(),
          this.ui.find(".toggle_btns_show").show());
      a.stopImmediatePropagation();
    };
    K.update = function (a, b, f) {
      switch (a) {
        case "name":
        case "blvl":
        case "jlvl":
          this.ui.find("." + a + "_value").text(b);
          break;
        case "zeny":
          t.zeny = b;
          b = b.toString().split("");
          var g = b.length,
            h = "";
          for (f = 0; f < g; f++)
            h = b[g - f - 1] + (f && 0 === f % 3 ? "," : "") + h;
          this.ui.find("." + a + "_value").text(h);
          n.ui.find(".curzeny").text(h);
          break;
        case "job":
          this.ui.find(".job_value").text(d[b]);
          break;
        case "bexp":
        case "jexp":
          if (!f) {
            this.ui.find("." + a).hide();
            break;
          }
          this.ui.find("." + a).show();
          this.ui
            .find("." + a + " div")
            .css("width", Math.min(100, Math.floor((100 * b) / f)) + "%");
          this.ui
            .find("." + a + "_value")
            .text(
              Math.min(100, (0.1 * Math.floor((1e3 * b) / f)).toFixed(1)) + "%",
            );
          break;
        case "weight":
          this.ui.find(".weight_value").text((b / 10) | 0);
          this.ui.find(".weight_total").text((f / 10) | 0);
          this.ui.find(".weight").css("color", b < 0.7 * f ? "" : "red");
          n.ui.find(".curweight").text((b / 10) | 0);
          n.ui.find(".maxweight").text((f / 10) | 0);
          n.ui.find(".curweight").css("color", b < 0.7 * f ? "#FFB850" : "red");
          b > 0.9 * f && D.addText(c.getMessage(243), D.TYPE.ERROR);
          break;
        case "hp":
        case "sp":
          var k = Math.floor((100 * b) / f),
            g = 25 > k ? "red" : "blue";
          this.ui.find("." + a + "_value").text(b);
          this.ui.find("." + a + "_max_value").text(f);
          this.ui.find("." + a + "_perc").text(k + "%");
          0 >= k
            ? this.ui.find("." + a + "_bar div").css("backgroundImage", "none")
            : (e.loadFile(
                c.INTERFACE_PATH + "basic_interface/gze" + g + "_left.bmp",
                function (b) {
                  this.ui
                    .find("." + a + "_bar_left")
                    .css("backgroundImage", "url(" + b + ")");
                }.bind(this),
              ),
              e.loadFile(
                c.INTERFACE_PATH + "basic_interface/gze" + g + "_mid.bmp",
                function (b) {
                  this.ui
                    .find("." + a + "_bar_middle")
                    .css({
                      backgroundImage: "url(" + b + ")",
                      width: Math.floor(1.27 * Math.min(k, 100)) + "px",
                    });
                }.bind(this),
              ),
              e.loadFile(
                c.INTERFACE_PATH + "basic_interface/gze" + g + "_right.bmp",
                function (b) {
                  this.ui
                    .find("." + a + "_bar_right")
                    .css({
                      backgroundImage: "url(" + b + ")",
                      left: Math.floor(1.27 * Math.min(k, 100)) + "px",
                    });
                }.bind(this),
              ));
      }
    };
    return l.addComponent(K);
  },
);
