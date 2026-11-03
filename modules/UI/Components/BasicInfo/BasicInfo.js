define(
  "UI/Components/BasicInfo/BasicInfo",
  "require DB/DBManager DB/Monsters/MonsterTable Core/Client Core/Preferences Core/Configs Preferences/Controls Network/NetworkManager Network/PacketStructure Renderer/Renderer Engine/SessionStorage UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/OnPushCart/OnPushCart UI/Components/WinStats/WinStats UI/Components/Equipment/Equipment UI/Components/SkillList/SkillList UI/Components/PartyFriends/PartyFriends UI/Components/Guild/Guild UI/Components/Emoticons/Emoticons UI/Components/Escape/Escape UI/Components/WorldMap/WorldMap UI/Components/Achievement/Achievement UI/Components/Attendance/Attendance UI/Components/CardConnection/CardConnection2 UI/Components/ShortCut/ShortCut UI/Components/Shop/CashShop UI/Components/PartyBooking/PartyBooking UI/Components/Quest/Quest UI/Components/Mail/Rodex text!./BasicInfo.html text!./BasicInfo.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      if (!(1e3 > a - W)) {
        W = a;
        V++;
        var b = 3600 - V;
        0 > b && (b = 0);
        a = parseInt(b / 60);
        b %= 60;
        a =
          (0 == parseInt(a / 10) ? "0" + a : a) +
          ":" +
          (0 == parseInt(b / 10) ? "0" + b : b);
        L.ui.find("#goldpcButton .timer").text(a);
      }
    }
    var c = a("DB/DBManager"),
      d = a("DB/Monsters/MonsterTable"),
      e = a("Core/Client"),
      m = a("Core/Preferences"),
      h = a("Core/Configs"),
      t = a("Preferences/Controls"),
      r = a("Network/NetworkManager"),
      n = a("Network/PacketStructure"),
      g = a("Renderer/Renderer"),
      p = a("Engine/SessionStorage"),
      l = a("UI/UIManager"),
      f = a("UI/UIComponent"),
      k = a("UI/Components/Inventory/Inventory");
    a("UI/Components/OnPushCart/OnPushCart");
    var q = a("UI/Components/WinStats/WinStats"),
      u = a("UI/Components/Equipment/Equipment"),
      v = a("UI/Components/SkillList/SkillList"),
      A = a("UI/Components/PartyFriends/PartyFriends"),
      C = a("UI/Components/ChatBox/ChatBox"),
      B = a("UI/Components/Guild/Guild"),
      J = a("UI/Components/Emoticons/Emoticons"),
      D = a("UI/Components/Escape/Escape"),
      y = a("UI/Components/Quest/Quest"),
      H = a("UI/Components/Mail/Rodex"),
      N = a("UI/Components/WorldMap/WorldMap"),
      O = a("UI/Components/Achievement/Achievement"),
      I = a("UI/Components/Attendance/Attendance"),
      x = a("UI/Components/CardConnection/CardConnection2"),
      K = a("UI/Components/ShortCut/ShortCut"),
      E = a("UI/Components/Shop/CashShop"),
      F = a("UI/Components/PartyBooking/PartyBooking"),
      z = a("text!./BasicInfo.html"),
      G = a("text!./BasicInfo.css"),
      L = new f("BasicInfo", z, G);
    L.base_exp = 0;
    L.base_exp_next = 1;
    L.job_exp = 0;
    L.job_exp_next = -1;
    L.weight = 0;
    L.weight_max = 1;
    var M = m.get("BasicInfo", { x: 0, y: 0, reduce: !0, buttons: !0 }, 1),
      Q = h.get("ClientVer");
    L.init = function () {
      this.ui.find(".topbar button").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.ui.find(".topbar .right").click(L.toggleMode.bind(this));
      this.ui.find(".toggle_btns_show").mousedown(L.toggleButtons.bind(this));
      this.ui.find(".toggle_btns_hide").mousedown(L.toggleButtons.bind(this));
      this.ui.find(".buttons button").mousedown(function () {
        switch (this.className) {
          case "status":
            q.ui.toggle();
            q.focus();
            break;
          case "equip":
            u.toggle();
            break;
          case "item":
            k.ui.toggle();
            k.focus();
            break;
          case "info":
            u.toggle();
            break;
          case "skill":
            v.toggle();
            break;
          case "option":
            D.ui.toggle();
            D.focus();
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
            r.sendPacket(b);
            break;
          case "sit":
            b = new n.CZ.REQUEST_ACT();
            b.action = p.Entity.action === p.Entity.ACTION.SIT ? 3 : 2;
            r.sendPacket(b);
            break;
          case "quest":
            y.toggle();
            y.focus();
            break;
          case "emo":
            J.ui.toggle();
            J.focus();
            break;
          case "map":
            N.select();
            break;
          case "mail":
            if (H.ui && H.ui.is(":visible")) break;
            H.ui.show();
            b = new n.CZ.OPEN_MAILBOX();
            b.MailTAB = 0;
            b.MailID = 0;
            r.sendPacket(b);
            H.focus();
            break;
          case "shortcut":
            K.setCustom();
            break;
          case "achievement":
            3 == Q || 4 == Q || 5 == Q
              ? O.toggle()
              : l.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "attendance":
            3 == Q || 4 == Q || 5 == Q
              ? I.toggle()
              : l.showMessageBox(
                  "\u7248\u672c\u5347\u7ea7\u540e\u5f00\u653e",
                  "ok",
                );
            break;
          case "CardConnection":
            3 == Q || 4 == Q || 5 == Q
              ? (x.ui.is(":visible") && x.ui.hide(), x.ui.show(), x.focus())
              : l.showMessageBox(
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
        if (!t.talk) {
          var a = new n.CZ.DYNAMICNPC_CREATE_REQUEST();
          a.name = "GOLDPCCAFE";
          r.sendPacket(a);
        }
      });
    };
    var V = 0;
    L.setGoldPccafe = function (a) {
      a.isActive
        ? ((V = a.playedTime),
          this.ui.find("#goldpcButton .points").text(a.point),
          g.stop(b),
          0 < 3600 - V && g.render(b))
        : g.stop(b);
    };
    var W = 0;
    L.onAppend = function () {
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
    L.onRemove = function () {
      g.stop(b);
      L.ui &&
        (L.ui.find("#goldpcButton .timer").text("00:00"),
        L.ui.find("#goldpcButton .points").text("0"));
      M.x = parseInt(this.ui.css("left"), 10);
      M.y = parseInt(this.ui.css("top"), 10);
      M.reduce = this.ui.hasClass("small");
      M.buttons = this.ui.find(".buttons").is(":visible");
      M.save();
    };
    L.onShortCut = function (a) {
      switch (a.cmd) {
        case "EXTEND":
          this.toggleMode();
      }
    };
    L.toggleMode = function () {
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
    L.toggleButtons = function (a) {
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
    L.update = function (a, b, f) {
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
          k.ui.find(".curzeny").text(h);
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
          k.ui.find(".curweight").text((b / 10) | 0);
          k.ui.find(".maxweight").text((f / 10) | 0);
          k.ui.find(".curweight").css("color", b < 0.7 * f ? "#FFB850" : "red");
          b > 0.9 * f && C.addText(c.getMessage(243), C.TYPE.ERROR);
          break;
        case "hp":
        case "sp":
          var l = Math.floor((100 * b) / f),
            g = 25 > l ? "red" : "blue";
          this.ui.find("." + a + "_value").text(b);
          this.ui.find("." + a + "_max_value").text(f);
          this.ui.find("." + a + "_perc").text(l + "%");
          0 >= l
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
                      width: Math.floor(1.27 * Math.min(l, 100)) + "px",
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
                      left: Math.floor(1.27 * Math.min(l, 100)) + "px",
                    });
                }.bind(this),
              ));
      }
    };
    return l.addComponent(L);
  },
);
