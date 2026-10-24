define(
  "UI/Components/Guild/Guild",
  "require DB/DBManager DB/Monsters/MonsterTable Engine/SessionStorage Utils/jquery Renderer/Entity/Entity Renderer/SpriteRenderer Renderer/Camera Renderer/Renderer Core/Preferences Core/Client UI/UIManager UI/UIComponent UI/Components/ContextMenu/ContextMenu UI/Components/ChatBox/ChatBox UI/Components/InputBox/InputBox UI/Components/SkillDescription/SkillDescription text!./Guild.html text!./Guild.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = l(this);
      a.hasClass("skill") || (a = a.parent());
      a = d(parseInt(a.data("index"), 10));
      z.uid === a.SKID ? z.remove() : (z.append(), z.setSkill(a.SKID));
    }
    function c() {
      var a = this.parentNode.parentNode.getAttribute("data-index");
      x.onIncreaseSkill(parseInt(a, 10));
    }
    function d(a) {
      var b,
        c = L.length;
      for (b = 0; b < c; ++b) if (L[b].SKID === a) return L[b];
      return null;
    }
    function e() {
      var a = l(this);
      a.hasClass("skill") || (a = a.parent());
      x.useSkillID(parseInt(a.data("index"), 10));
    }
    function m(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function h(a) {
      var b = parseInt(this.getAttribute("data-flag"), 10);
      if (
        !a.isTrigger &&
        (this.classList.contains("active") || (b && !(P & I[b])))
      )
        return !1;
      x.onGuildInfoRequest(b);
      x.ui.find(".tabs button").removeClass("active");
      x.ui.find(".content").hide();
      x.ui.find(".content." + this.className).show();
      x.ui.find(".footer .btn_ok").hide();
      "members" === this.className ? v.render(U) : v.stop(U);
      this.classList.add("active");
      return !1;
    }
    function r(a, b) {
      a = x.ui.find(".content.info .tendency canvas").get(0);
      b = a.getContext("2d");
      b.fillStyle = "#cecfce";
      b.fillRect(0, 0, a.width, a.height);
      b.fillStyle = "#739eef";
      b.fillRect(1, 1, a.width - 2, a.height - 2);
      b.fillStyle = "#4261a5";
      b.fillRect(a.width / 2 - 1, 1, 2, a.height - 2);
      b.fillRect(1, a.height / 2 - 1, a.width - 2, 2);
      b.fillStyle = "#ffffff";
      b.fillRect(a.width / 2 - 1, a.height / 2 - 1, 2, 2);
    }
    function q() {
      var a = x.ui.find(".content:visible").get(0).className,
        a = a.replace(/content/g, "").replace(/^\s+|\s+$/gm, "");
      switch (a) {
        case "positions":
          var b,
            c,
            d,
            e,
            f,
            g,
            h = [];
          d = x.ui.find(".PositionView");
          a = 0;
          for (b = G.length; a < b; ++a)
            ((c = d.eq(a)),
              (f = c.find(".title input").val()),
              (g = parseInt(c.find(".tax input").val(), 10)),
              (e = 0),
              c.find(".invite button").hasClass("on") && (e |= 1),
              c.find(".punish button").hasClass("on") && (e |= 16),
              (G[a].right === e && G[a].posName === f && G[a].payRate === g) ||
                h.push({
                  positionID: G[a].positionID,
                  ranking: G[a].ranking,
                  right: e,
                  posName: f,
                  payRate: g,
                }));
          x.onPositionUpdateRequest(h);
          break;
        case "notice":
          ((a = x.ui.find(".content.notice input").val()),
            (b = x.ui.find(".content.notice textarea").val()),
            x.onNoticeUpdateRequest(a, b));
      }
      x.ui.find(".footer .btn_ok").hide();
    }
    var k = a("DB/DBManager"),
      g = a("DB/Monsters/MonsterTable"),
      t = a("Engine/SessionStorage"),
      l = a("Utils/jquery"),
      f = a("Renderer/Entity/Entity"),
      n = a("Renderer/SpriteRenderer"),
      p = a("Renderer/Camera"),
      v = a("Renderer/Renderer"),
      u = a("Core/Preferences"),
      A = a("Core/Client"),
      D = a("UI/UIManager"),
      B = a("UI/UIComponent"),
      O = a("UI/Components/ContextMenu/ContextMenu"),
      C = a("UI/Components/ChatBox/ChatBox"),
      y = a("UI/Components/InputBox/InputBox"),
      z = a("UI/Components/SkillDescription/SkillDescription"),
      J = a("text!./Guild.html");
    a = a("text!./Guild.css");
    u.get("Guild", { x: 100, y: 100 }, 1);
    var I = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 16, 5: 64, 6: 128 },
      L = [],
      x = new B("Guild", J, a),
      M,
      E,
      F,
      G = [],
      H = [],
      K = 0,
      P = 0,
      N,
      S,
      R,
      ea = 0;
    x.init = function () {
      var a = this.ui;
      M = this.ui.find(".MemberView").remove();
      E = this.ui.find(".PositionView").remove();
      F = this.ui.find(".ExpelView").remove();
      R = this.ui.find(".btn.levelup").detach().click(c);
      this.ui.on("dblclick", ".skill .icon", e).on("contextmenu", ".skill", b);
      a.find(".titlebar .close").mousedown(m).click(x.toggle.bind(this));
      a.find(".tabs").on("click", "button", h);
      A.loadFiles(
        [
          k.INTERFACE_PATH + "checkbox_0.bmp",
          k.INTERFACE_PATH + "checkbox_1.bmp",
        ],
        function (a, b) {
          N = a;
          S = b;
        },
      );
      a.find(".content.positions tbody")
        .on("mousedown", "input", function () {
          return t.isGuildMaster;
        })
        .on("focus", "input", function () {
          a.find(".footer .btn_ok").show();
          this.select();
        })
        .on("click", "button", function () {
          t.isGuildMaster &&
            ((this.className = "on" === this.className ? "off" : "on"),
            (this.style.backgroundImage =
              "url(" + ("on" === this.className ? S : N) + ")"),
            a.find(".footer .btn_ok").show());
        })
        .on("mousedown", "tr", function () {
          a.find(".content.positions tbody tr").removeClass("active");
          this.classList.add("active");
        });
      a.find(".content.info .ally_list, .content.info .hostile_list").on(
        "contextmenu",
        "div",
        function () {
          var b = this.parentNode.classList.contains("ally_list") ? 0 : 1,
            c = parseInt(this.getAttribute("data-guild-id"), 10);
          a.find(
            ".content.info .ally_list div, .content.info .hostile_list div",
          ).removeClass("active");
          this.classList.add("active");
          O.remove();
          O.append();
          O.addElement(k.getMessage(351), function () {
            x.onRequestDeleteRelation(c, b);
          });
        },
      );
      a.find(".content.members tbody")
        .on("mousedown", "tr", function () {
          a.find(".content.members tbody tr").removeClass("active");
          this.classList.add("active");
        })
        .on("change", ".MemberView.active .position", function () {
          var a = H[l(".MemberView.active").index()].AID,
            b = H[l(".MemberView.active").index()].GID,
            c = l(".MemberView.active .position select option:selected").attr(
              "data-id",
            );
          x.onRequestCHANGE_MEMBERPOS(a, b, c);
        })
        .on("contextmenu", "td.name", function () {
          var a = this.parentNode.getAttribute("data-index"),
            b = H[a],
            a = b.AID === t.AID && b.GID === t.GID;
          O.remove();
          O.append();
          O.addElement(k.getMessage(129), function () {
            x.onRequestMemberInfo(b.AID);
          });
          a &&
            !t.isGuildMaster &&
            O.addElement(k.getMessage(508), function () {
              y.append();
              y.setType("text");
              y.ui.find(".text").text(k.getMessage(523));
              y.onSubmitRequest = function (a) {
                y.remove();
                x.onRequestLeave(b.AID, b.GID, a);
              };
            });
          t.guildRight & 16 &&
            !a &&
            O.addElement(k.getMessage(509), function () {
              y.append();
              y.setType("text");
              y.ui.find(".text").text(k.getMessage(524));
              y.onSubmitRequest = function (a) {
                y.remove();
                x.onRequestMemberExpel(b.AID, b.GID, a);
              };
            });
        });
      a.find(".content.notice").on("focus", "textarea, input", function () {
        a.find(".footer .btn_ok").show();
      });
      a.find(".content.info .emblem_edit input").change(function () {
        var a = event.target.files[0];
        if (a)
          if (2097152 < a.size)
            alert(
              "\u6587\u4ef6\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc71MB\uff0c\u8bf7\u9009\u62e9\u8f83\u5c0f\u7684\u6587\u4ef6\u3002",
            );
          else {
            var b = new FileReader();
            b.onload = function (a) {
              var b = new Image();
              b.onload = function () {
                var a = document.createElement("canvas"),
                  c = a.getContext("2d");
                a.width = 24;
                a.height = 24;
                c.clearRect(0, 0, a.width, a.height);
                c.drawImage(b, 0, 0, a.width, a.height);
                var a = c.getImageData(0, 0, a.width, a.height),
                  c = a.width,
                  d = a.height,
                  e = 4 * Math.floor((3 * c + 3) / 4),
                  f = e * d,
                  g = 54 + f,
                  h = new ArrayBuffer(g),
                  k = new DataView(h);
                k.setUint8(0, 66);
                k.setUint8(1, 77);
                k.setUint32(2, g, !0);
                k.setUint32(6, 0, !0);
                k.setUint32(10, 54, !0);
                k.setUint32(14, 40, !0);
                k.setInt32(18, a.width, !0);
                k.setInt32(22, -a.height, !0);
                k.setUint16(26, 1, !0);
                k.setUint16(28, 24, !0);
                k.setUint32(30, 0, !0);
                k.setUint32(34, f, !0);
                k.setUint32(38, 2835, !0);
                k.setUint32(42, 2835, !0);
                k.setUint32(46, 0, !0);
                k.setUint32(50, 0, !0);
                for (var f = 54, l = 0; l < d; l++) {
                  for (var m = 0; m < c; m++) {
                    var n = 4 * (l * c + m);
                    k.setUint8(f++, a.data[n + 2]);
                    k.setUint8(f++, a.data[n + 1]);
                    k.setUint8(f++, a.data[n]);
                  }
                  f += e - 3 * c;
                }
                if (f !== g)
                  throw Error(
                    "BMP construction error: The final offset does not match the expected file size.",
                  );
                a = new Uint8Array(h);
                x.onSendEmblem(new Uint8Array(a));
              };
              b.src = a.target.result;
            };
            b.readAsDataURL(a);
          }
      });
      a.find(".footer .btn_ok").click(q);
      this.draggable(this.ui.find(".titlebar"));
      this.ui.hide();
      r(0, 0);
    };
    x.onRemove = function () {
      v.stop(U);
    };
    x.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          this.toggle();
      }
    };
    x.toggle = function () {
      t.hasGuild
        ? this.ui.is(":visible")
          ? this.hide()
          : this.show()
        : C.addText(
            "\u4f60\u672a\u52a0\u5165\u4efb\u4f55\u516c\u4f1a",
            C.TYPE.ERROR,
          );
    };
    x.show = function () {
      this.focus();
      this.ui.is(":visible") ||
        (this.ui.show(),
        this.ui.find(".tabs .active").length ||
          (this.ui.find(".tabs .info").click(), x.onRequestAccess()),
        this.ui.find(".content.members").is(":visible") && v.render(U));
    };
    x.hide = function () {
      this.ui.hide();
      v.stop(U);
    };
    x.setGuildInformations = function (a) {
      var b = this.ui.find(".content.info");
      b.find(".name .value").text(a.guildname);
      b.find(".level .value").text(a.level);
      b.find(".master .value").text(a.masterName);
      b.find(".members .numMember").text(a.userNum);
      b.find(".members .maxMember").text(a.maxUserNum);
      b.find(".avglevel .value").text(a.userAverageLevel);
      b.find(".master .value").text(a.master_char_name);
      b.find(".territory .value").text(a.manageLand);
      b.find(".exp .value").text(a.exp);
      b.find(".tax .value").text(a.point);
      x.onRequestGuildEmblem(a.GDID, a.emblemVersion, x.setEmblem.bind(this));
      t.isGuildMaster
        ? b.find(".emblem_edit").show()
        : b.find(".emblem_edit").hide();
      r(a.honor, a.virtue);
    };
    x.changeGuildInfo = function (a) {
      t.Entity.GID == a.AID &&
        (0 < a.GDID
          ? ((t.hasGuild = !0), (t.Entity.GUID = a.GDID))
          : ((t.hasGuild = !1), (t.Entity.GUID = 0)));
    };
    x.setEmblem = function (a) {
      this.ui
        .find(".content.info")
        .find(".emblem_container")
        .css("backgroundImage", "url(" + a.src + ")");
    };
    x.setRelations = function (a) {
      var b, c;
      this.ui.find(".ally_list, .hostile_list").empty();
      b = 0;
      for (c = a.length; b < c; ++b) this.addRelation(a[b]);
    };
    x.addRelation = function (a) {
      var b = this.ui.find(
          "." + (0 === a.relation ? "ally" : "hostile") + "_list",
        ),
        c = document.createElement("div");
      c.setAttribute("data-guild-id", a.GDID);
      c.textContent = a.guildName;
      b.append(c);
    };
    x.removeRelation = function (a, b) {
      this.ui
        .find(".content.info ." + (0 === b ? "ally" : "hostile") + "_list")
        .find('div[data-guild-id\x3d"' + a + '"]')
        .remove();
    };
    x.setMembers = function (a) {
      var b, c, d;
      c = a.length;
      d = K = H.length = 0;
      this.ui.find(".content.members tbody").empty();
      for (b = 0; b < c; ++b)
        ((K += a[b].MemberExp), (d += a[b].CurrentState ? 1 : 0));
      this.ui.find(".content.info .members .online").text(d);
      b = 0;
      for (c = a.length; b < c; ++b) this.setMember(a[b]);
      U(v.tick + 1e3);
    };
    x.setMember = function (a) {
      var b, c;
      b = 0;
      for (
        c = H.length;
        b < c && (H[b].AID !== a.AID || H[b].GID !== a.GID);
        ++b
      );
      b < c
        ? (c = this.ui.find('.MemberView[data-index\x3d"' + b + '"]'))
        : ((c = M.clone()),
          this.ui.find(".content.members tbody").append(c),
          H.push(a));
      a.CurrentState && c.addClass("online");
      c.attr("data-index", b);
      c.find(".name .value").text(a.CharName);
      if (t.isGuildMaster) {
        if (G[a.GPositionID]) {
          var d = null;
          for (b = 0; b < G.length; b++)
            G[b].posName != G[a.GPositionID].posName &&
              (d +=
                "\x3coption data-id\x3d" +
                b +
                "\x3e" +
                G[b].posName +
                "\x3c/option\x3e");
          b =
            "\x3cselect\x3e\x3coption\x3e" +
            G[a.GPositionID].posName +
            "\x3c/option\x3e" +
            d +
            "\x3c/select\x3e";
          c.find(".position").html(b);
        }
      } else
        G[a.GPositionID] && c.find(".position").text(G[a.GPositionID].posName);
      c.find(".job").text(g[a.Job]);
      c.find(".level").text(a.Level);
      c.find(".note").text(a.Memo);
      c.find(".devotion").text(
        (a.MemberExp ? Math.round((a.MemberExp / K) * 100) : 0) + "%",
      );
      c.find(".tax").text(a.MemberExp);
      a.entity ||
        ((a.entity = new f()),
        (a.entity.direction = 4),
        (a.entity.objecttype = f.TYPE_PC),
        (a.entity.files.shadow.spr = null));
      a.entity.sex = a.Sex;
      a.entity.head = a.HeadType;
      a.entity.headpalette = a.HeadPalette;
    };
    x.updateMemberStatus = function (a) {
      var b, c;
      b = 0;
      for (
        c = H.length;
        b < c && (H[b].AID !== a.AID || H[b].GID !== a.GID);
        ++b
      );
      b >= c ||
        ((c = this.ui.find('.MemberView[data-index\x3d"' + b + '"]')),
        (H[b].CurrentState = a.status),
        c.toggleClass("online", H[b].CurrentState),
        "sex" in a && (H[b].entity.sex = a.sex),
        "head" in a && (H[b].entity.head = a.head),
        "headPalette" in a && (H[b].entity.headpalette = a.headPalette),
        C.addText(
          k
            .getMessage(485 + (a.status ? 0 : 1))
            .replace("%s", c.find(".name .value").text()),
          C.TYPE.BLUE,
        ));
    };
    x.updateMemberPosition = function (a, b, c) {
      var d, e;
      d = 0;
      for (e = H.length; d < e; ++d)
        if (H[d].AID === a && H[d].GID === b) {
          H[d].GPositionID = c;
          x.setMember(H[d]);
          break;
        }
    };
    x.setPositions = function (a, b) {
      var c, d;
      b && (G.length = a.length);
      b = 0;
      for (c = a.length; b < c; ++b)
        ((d = a[b]),
          d.positionID in G || (G[d.positionID] = {}),
          (G[d.positionID].positionID = d.positionID),
          (G[d.positionID].right = d.right),
          (G[d.positionID].ranking = d.ranking),
          (G[d.positionID].payRate = d.payRate),
          d.posName && (G[d.positionID].posName = d.posName));
      x.updatePositionView();
    };
    x.setPositionsName = function (a) {
      var b, c, d;
      b = 0;
      for (c = a.length; b < c; ++b)
        ((d = a[b]),
          d.positionID in G || (G[d.positionID] = {}),
          (G[d.positionID].posName = d.posName));
      x.updatePositionView();
    };
    x.updatePositionView = function () {
      var a, b, c, d, e;
      b = G.length;
      e = this.ui.find(".content.positions tbody");
      e.empty();
      for (a = 0; a < b; ++a)
        ((c = E.clone()),
          (d = G[a]),
          0 === a && c.addClass("active"),
          c.find(".id").text(d.positionID),
          c.find(".title input").val(d.posName),
          c.find(".tax input").val(d.payRate),
          c
            .find(".invite button")
            .css("backgroundImage", "url(" + (d.right & 1 ? S : N) + ")")
            .removeClass("on off")
            .addClass(d.right & 1 ? "on" : "off"),
          c
            .find(".punish button")
            .css("backgroundImage", "url(" + (d.right & 16 ? S : N) + ")")
            .removeClass("on off")
            .addClass(d.right & 16 ? "on" : "off"),
          e.append(c));
    };
    x.setNotice = function (a, b) {
      var c = this.ui.find(".content.notice");
      c.find(".subject").val(a);
      c.find(".notice").val(b);
    };
    x.setExpelList = function (a) {
      var b, c, d, e;
      d = this.ui.find(".content.history tbody");
      d.empty();
      b = 0;
      for (c = a.length; b < c; ++b)
        ((e = F.clone()),
          e.find(".name").text(a[b].charname),
          e.find(".reason").text(a[b].reason),
          d.append(e));
    };
    x.setAccess = function (a) {
      P = a;
    };
    x.setSkillsPoints = function (a) {
      var b, c;
      this.ui.find(".skpoints_count").text(a);
      if (!ea === !a) ea = a;
      else
        for (ea = a, c = L.length, b = 0; b < c; ++b)
          L[b].upgradable && a
            ? this.ui.find(".skill.id" + L[b].SKID + " .levelup").show()
            : this.ui.find(".skill.id" + L[b].SKID + " .levelup").hide();
    };
    x.setSkills = function (a) {
      var b, c;
      b = 0;
      for (c = L.length; b < c; ++b) this.onUpdateSkill(L[b].SKID, 0);
      L.length = 0;
      this.ui.find(".content.skills table").empty();
      b = 0;
      for (c = a.length; b < c; ++b) this.addSkill(a[b]);
    };
    x.addSkill = function (a) {
      if (a.SKID in k.getAllSkillInfo())
        if (this.ui.find(".skill.id" + a.SKID + ":first").length)
          this.updateSkill(a);
        else {
          var b = k.getSkillInfo(a.SKID),
            c = R.clone(!0),
            d = l(
              '\x3ctr class\x3d"skill id' +
                a.SKID +
                " " +
                (a.level ? (a.type ? "active" : "passive") : "disabled") +
                '" data-index\x3d"' +
                a.SKID +
                '" draggable\x3d"true"\x3e\x3ctd class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"24" height\x3d"24" /\x3e\x3c/td\x3e\x3ctd class\x3d"levelupcontainer"\x3e\x3c/td\x3e\x3ctd class\x3dselectable\x3e\x3cdiv class\x3d"name"\x3e' +
                l.escape(b.SkillName) +
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
                '\x3c/span\x3e\x3c/div\x3e\x3c/td\x3e\x3ctd class\x3d"selectable type"\x3e\x3cdiv class\x3d"consume"\x3e' +
                (a.type
                  ? a.spcost
                    ? 'Sp : \x3cspan class\x3d"spcost"\x3e' +
                      a.spcost +
                      "\x3c/span\x3e"
                    : "\u4e3b\u52a8"
                  : "\u88ab\u52a8") +
                "\x3c/div\x3e\x3c/td\x3e\x3c/tr\x3e",
            );
          (a.upgradable && ea) || c.hide();
          A.loadFile(
            k.INTERFACE_PATH + "basic_interface/arw_left.bmp",
            function (a) {
              d.find(".arw_left").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          A.loadFile(
            k.INTERFACE_PATH + "basic_interface/arw_right.bmp",
            function (a) {
              d.find(".arw_right").attr(
                "style",
                "background-image:url(" +
                  a +
                  ");background-repeat:no-repeat;background-position:center;",
              );
            },
          );
          A.loadFile(
            k.INTERFACE_PATH + "item/" + b.Name + ".bmp",
            function (a) {
              d.find(".icon img").attr("src", a);
            },
          );
          d.find(".levelupcontainer").append(c);
          x.ui.find(".content.skills table").append(d);
          this.parseHTML.call(c);
          L.push(a);
        }
    };
    x.updateSkill = function (a) {
      var b = d(a.SKID);
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
        a.upgradable && ea
          ? b.find(".levelup").show()
          : b.find(".levelup").hide());
    };
    x.useSkillID = function (a) {
      (a = d(a)) && a.level && a.type && x.useSkill(a);
    };
    x.useSkill = (function () {
      var a = 0;
      return function (b) {
        var c = Date.now();
        200 > c - a || ((a = c), this.onUseSkill(b.SKID, b.level));
      };
    })();
    var U = (function () {
      var a = 0;
      return function (b) {
        if (!(b < a + 1e3 / 60)) {
          var c, d, e;
          a = b;
          b = x.ui.find(".content.members canvas");
          p.direction = 4;
          d = 0;
          for (e = H.length; d < e; ++d)
            ((c = b[d].getContext("2d")),
              c.clearRect(0, 0, c.canvas.width, c.canvas.height),
              H[d].CurrentState &&
                (n.bind2DContext(c, 15, 45), H[d].entity.renderEntity()));
        }
      };
    })();
    x.onGuildInfoRequest = function () {};
    x.onPositionUpdateRequest = function () {};
    x.onNoticeUpdateRequest = function () {};
    x.onRequestMemberInfo = function () {};
    x.onRequestLeave = function () {};
    x.onRequestMemberExpel = function () {};
    x.onRequestDeleteRelation = function () {};
    x.onRequestAccess = function () {};
    x.onRequestGuildEmblem = function () {};
    x.onSendEmblem = function () {};
    x.onIncreaseSkill = function () {};
    x.onUpdateSkill = function () {};
    x.onUseSkill = function () {};
    x.getSkillById = d;
    x.onRequestCHANGE_MEMBERPOS = function () {};
    return D.addComponent(x);
  },
);
