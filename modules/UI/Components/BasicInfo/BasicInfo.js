define(
  "UI/Components/BasicInfo/BasicInfo",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Client Core/Preferences Core/Configs Preferences/Controls Network/NetworkManager Network/PacketStructure Renderer/Renderer Engine/SessionStorage UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart UI/Components/WinStats/WinStats UI/Components/Equipment/Equipment UI/Components/SkillList/SkillList UI/Components/PartyFriends/PartyFriends UI/Components/Guild/Guild UI/Components/Emoticons/Emoticons UI/Components/Escape/Escape UI/Components/WorldMap/WorldMap UI/Components/Achievement/Achievement UI/Components/Attendance/Attendance UI/Components/CardConnection/CardConnection2 UI/Components/ShortCut/ShortCut UI/Components/Shop/CashShop UI/Components/PartyBooking/PartyBooking UI/Components/Quest/Quest UI/Components/Mail/Rodex text!./BasicInfo.html text!./BasicInfo.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      if (!(1e3 > a - V)) {
        V = a;
        W++;
        var b = 3600 - W;
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
      l = a("Core/Preferences"),
      h = a("Core/Configs"),
      r = a("Preferences/Controls"),
      t = a("Network/NetworkManager"),
      n = a("Network/PacketStructure"),
      g = a("Renderer/Renderer"),
      p = a("Engine/SessionStorage"),
      k = a("UI/UIManager"),
      f = a("UI/UIComponent"),
      m = a("UI/Components/Inventory/Inventory");
    a("UI/Components/OnPushCart/OnPushCart");
    var q = a("UI/Components/WinStats/WinStats"),
      v = a("UI/Components/Equipment/Equipment"),
      u = a("UI/Components/SkillList/SkillList"),
      A = a("UI/Components/PartyFriends/PartyFriends"),
      D = a("UI/Components/ChatBox/ChatBox"),
      B = a("UI/Components/Guild/Guild"),
      H = a("UI/Components/Emoticons/Emoticons"),
      C = a("UI/Components/Escape/Escape"),
      z = a("UI/Components/Quest/Quest"),
      G = a("UI/Components/Mail/Rodex"),
      P = a("UI/Components/WorldMap/WorldMap"),
      N = a("UI/Components/Achievement/Achievement"),
      I = a("UI/Components/Attendance/Attendance"),
      x = a("UI/Components/CardConnection/CardConnection2"),
      J = a("UI/Components/ShortCut/ShortCut"),
      E = a("UI/Components/Shop/CashShop"),
      L = a("UI/Components/PartyBooking/PartyBooking"),
      y = a("text!./BasicInfo.html"),
      F = a("text!./BasicInfo.css"),
      K = new f("BasicInfo", y, F);
    K.base_exp = 0;
    K.base_exp_next = 1;
    K.job_exp = 0;
    K.job_exp_next = -1;
    K.weight = 0;
    K.weight_max = 1;
    var M = l.get("BasicInfo", { x: 0, y: 0, reduce: !0, buttons: !0 }, 1),
      Q = h.get("ClientVer");
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
            q.ui.toggle();
            q.focus();
            break;
          case "equip":
            v.toggle();
            break;
          case "item":
            m.ui.toggle();
            m.focus();
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
            var b = new n.CZ.REQ_CASHSHOP_OPEN();
            t.sendPacket(b);
            break;
          case "sit":
            b = new n.CZ.REQUEST_ACT();
            b.action = p.Entity.action === p.Entity.ACTION.SIT ? 3 : 2;
            t.sendPacket(b);
            break;
          case "quest":
            z.toggle();
            z.focus();
            break;
          case "emo":
            H.ui.toggle();
            H.focus();
            break;
          case "map":
            P.select();
            break;
          case "mail":
            if (G.ui && G.ui.is(":visible")) break;
            G.ui.show();
            b = new n.CZ.OPEN_MAILBOX();
            b.MailTAB = 0;
            b.MailID = 0;
            t.sendPacket(b);
            G.focus();
            break;
          case "shortcut":
            J.setCustom();
            break;
          case "achievement":
            3 == Q || 4 == Q || 5 == Q
              ? N.toggle()
              : k.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "attendance":
            3 == Q || 4 == Q || 5 == Q
              ? I.toggle()
              : k.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "CardConnection":
            3 == Q || 4 == Q || 5 == Q
              ? (x.ui.is(":visible") && x.ui.hide(), x.ui.show(), x.focus())
              : k.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "adventureragency":
            3 == Q || 4 == Q || 5 == Q
              ? (a("Renderer/MapRenderer"),
                (b = new FormData()),
                b.append("AuthToken", p.AuthToken),
                b.append("AID", p.Entity.GID),
                b.append("GDID", p.Entity.GUID),
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
                    L.setList(a);
                  })
                  .fail(function (a) {
                    k.showMessageBox(
                      "\u6570\u636e\u52a0\u8f7d\u5931\u8d25",
                      "ok",
                    );
                  }))
              : k.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
        }
      });
      this.ui.find("#goldpcButton").on("click", function () {
        if (!r.talk) {
          var a = new n.CZ.DYNAMICNPC_CREATE_REQUEST();
          a.name = "GOLDPCCAFE";
          t.sendPacket(a);
        }
      });
    };
    var W = 0;
    K.setGoldPccafe = function (a) {
      a.isActive
        ? ((W = a.playedTime),
          this.ui.find("#goldpcButton .points").text(a.point),
          g.stop(b),
          0 < 3600 - W && g.render(b))
        : g.stop(b);
    };
    var V = 0;
    K.onAppend = function () {
      this.ui.css({
        top: Math.min(Math.max(0, M.y), g.height - this.ui.height()),
        left: Math.min(Math.max(0, M.x), g.width - this.ui.width()),
      });
      this.ui.removeClass("small large");
      M.reduce
        ? (this.ui.addClass("small"),
          M.buttons
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
      M.x = parseInt(this.ui.css("left"), 10);
      M.y = parseInt(this.ui.css("top"), 10);
      M.reduce = this.ui.hasClass("small");
      M.buttons = this.ui.find(".buttons").is(":visible");
      M.save();
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
        : (M.buttons
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
      M.buttons = !b.is(":visible");
      M.buttons
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
          p.zeny = b;
          b = b.toString().split("");
          var g = b.length,
            h = "";
          for (f = 0; f < g; f++)
            h = b[g - f - 1] + (f && 0 === f % 3 ? "," : "") + h;
          this.ui.find("." + a + "_value").text(h);
          m.ui.find(".curzeny").text(h);
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
          m.ui.find(".curweight").text((b / 10) | 0);
          m.ui.find(".maxweight").text((f / 10) | 0);
          m.ui.find(".curweight").css("color", b < 0.7 * f ? "#FFB850" : "red");
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
    return k.addComponent(K);
  },
);
