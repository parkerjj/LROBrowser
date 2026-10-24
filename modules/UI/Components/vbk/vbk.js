define(
  "UI/Components/vbk/vbk",
  "require DB/DBManager DB/Mobs/mob_db DB/worldData DB/logsTable DB/Plug/PlugPreferences Utils/jquery Controls/MapControl Renderer/Camera Renderer/MapRenderer Renderer/EntityManager Renderer/SpriteRenderer Engine/SessionStorage Network/NetworkManager Network/PacketStructure Preferences/Controls Preferences/Graphics UI/UIManager UI/UIComponent UI/Components/ChatBox/ChatBox UI/Components/Emoticons/Emoticons UI/Components/MiniMap/MiniMap UI/Components/BasicInfo/BasicInfo UI/Components/StatusIcons/StatusIcons UI/Components/Quest/Quest UI/Components/SkillList/SkillList text!./vbk.html text!./vbk.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b, d;
      if ("SELECT" == a.context.nodeName)
        switch (
          ((b = a.data("id")),
          (d = a.find("option:selected").data("index")),
          a.attr("class"))
        ) {
          case "autoskillid":
            z.ui.find(".autoskilllv").val("0");
            z.ui.find(".autoskillPro").val("0");
            a = a.find("option:selected").index();
            if (0 < a) {
              var f = G[a - 1].SKID;
              if (0 < f) {
                d = e.getSkillInfo(f);
                "undefined" == d.bSeperateLv
                  ? z.ui.find(".autoskilllv").attr("disabled", "disabled")
                  : z.ui.find(".autoskilllv").removeAttr("disabled");
                z.ui.find(".autoskilllv").parent().show();
                z.ui.find(".autoskillPro").parent().show();
                d = f;
                break;
              }
            }
            z.ui.find(".autoskilllv").parent().hide();
            z.ui.find(".autoskillPro").parent().hide();
            d = 0;
            break;
          case "qoautoskillid":
            z.ui.find(".qoautoskilllv").val("0");
            a = a.find("option:selected").index();
            if (0 < a && ((f = P[a - 1].SKID), 0 < f)) {
              z.ui.find(".qoautoskilllv").parent().show();
              d = f;
              break;
            }
            z.ui.find(".qoautoskilllv").parent().hide();
            d = 0;
            break;
          case "addiskillid":
            z.ui.find(".addiskilllv").val("0");
            z.ui.find(".addiskillop").prop("checked", !1);
            a = a.find("option:selected").index();
            if (0 < a && ((f = H[a - 1].SKID), 0 < f)) {
              d = e.getSkillInfo(f);
              d.bSeperateLv
                ? z.ui.find(".addiskilllv").removeAttr("disabled")
                : z.ui.find(".addiskilllv").attr("disabled", "disabled");
              z.ui.find(".addiskilllv").parent().show();
              z.ui.find(".addiskillop").parent().show();
              279 == f
                ? z.ui.find(".container .automatic").show()
                : z.ui.find(".container .automatic").hide();
              2286 == f
                ? z.ui.find(".container .autoshadow").show()
                : z.ui.find(".container .autoshadow").hide();
              d = f;
              break;
            }
            z.ui.find(".addiskilllv").parent().hide();
            z.ui.find(".addiskillop").parent().hide();
            z.ui.find(".container .automatic").hide();
            z.ui.find(".container .autoshadow").hide();
            z.ui.find(".adt").hide();
            d = 0;
            break;
          case "touchskillid":
            z.ui.find(".touchskillop").prop("checked", !1);
            a = a.find("option:selected").index();
            if (0 < a && ((f = K[a - 1].SKID), 0 < f)) {
              z.ui.find(".touchskillop").parent().show();
              d = f;
              break;
            }
            z.ui.find(".touchskillop").parent().hide();
            d = 0;
            break;
          case "autoUseItem":
            z.ui.find(".UseItemid").prop("checked", !1);
            a = a.find("option:selected").data("index");
            if (0 < a) {
              switch (a) {
                case 1:
                case 2:
                case 3:
                  c("UseItemid", "hpList");
                  break;
                case 4:
                case 5:
                case 6:
                  c("UseItemid", "spList");
              }
              z.ui.find(".UseItemid").parent().show();
              d = a;
            } else (z.ui.find(".UseItemid").parent().hide(), (d = 0));
            break;
          case "UseItemid":
            f = $(".autoUseItem option:selected").data("index");
            a = a.find("option:selected").index();
            var g = q.useItemid;
            if (0 < a) {
              0 < f && 4 > f
                ? (d = g.hpList.ITID[a - 1])
                : 3 < f && 7 > f && (d = g.spList.ITID[a - 1]);
              z.ui.find(".touchskillop").parent().show();
              break;
            }
            z.ui.find(".touchskillop").parent().hide();
            d = 0;
            break;
          case "AutoUseItem_Protectionid":
            z.ui.find(".AutoUseItem_Protectionop").prop("checked", !1);
            a = a.find("option:selected").data("index");
            0 < a
              ? (z.ui.find(".AutoUseItem_Protectionop").parent().show(),
                (d = a))
              : (z.ui.find(".AutoUseItem_Protectionop").parent().hide(),
                (d = 0));
            break;
          case "AutoUseItem_Dishid":
            (z.ui.find(".AutoUseItem_Dishop").prop("checked", !1),
              (a = a.find("option:selected").data("index")),
              0 < a
                ? (z.ui.find(".AutoUseItem_Dishop").parent().show(), (d = a))
                : (z.ui.find(".AutoUseItem_Dishop").parent().hide(), (d = 0)));
        }
      else
        "checkbox" == a.context.type
          ? ((b = a.data("id")), (d = a.prop("checked")))
          : (a.val() > a.data("max") && a.val(a.data("max")),
            0 != a.val() && a.val() < a.data("min") && a.val(a.data("min")),
            "" == a.val() && a.val(a.data("min")),
            (b = a.data("id")),
            (d = a.val()),
            3 == b && 0 < d && (5 > d && (d = 5), 60 < d && (d = 60)),
            a.hasClass("lootProbability") && (d *= 100));
      f = new p.CZ.NOTIFY_UPDATEINFO();
      f.id = b;
      f.value = d;
      n.sendPacket(f);
      z.setReloadInfo(f);
    }
    function c(a, b, c) {
      c || (c = "\u5173\u95ed");
      z.ui
        .find("." + a)
        .empty()
        .append("\x3coption data-index\x3d'0'\x3e" + c + "\x3c/option\x3e");
      c = q.useItemid;
      for (var d = 0; d < c[b].ITID.length; d++) {
        var f = { ITID: c[b].ITID[d] };
        z.ui
          .find("." + a)
          .append(
            "\x3coption data-index\x3d'" +
              c[b].ITID[d] +
              "'\x3e" +
              e.getItemName(f) +
              "\x3c/option\x3e",
          );
      }
      1 == z.ui.find("." + a + " option").length &&
        z.ui.find("." + a + " option[data-index\x3d'0']").text("\u7a7a");
    }
    function d() {
      var a = z.ui.find(".btns .tagconent");
      a.empty();
      var b = Object.keys(r[e.nid][E]);
      if (0 == b.length) return !1;
      for (var c = 0; c < b.length; c++)
        if (r[e.nid][E][b[c]]) {
          var d = k(
            '\x3cdiv class\x3d"log"\x3e\x3cdiv class\x3d"logMain"\x3e\x3cdiv class\x3d"logtitle"\x3e' +
              r[e.nid][E][b[c]].npc +
              '\x3c/div\x3e\x3cdiv class\x3d"logdesc"\x3e' +
              r[e.nid][E][b[c]].desc +
              '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"logBtn"\x3e\x3cbutton class\x3d"logGo" data-id\x3d"' +
              b[c] +
              '"\x3e\u524d\u5f80\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e',
          );
          a.append(d);
        }
    }
    var e = a("DB/DBManager"),
      m = a("DB/Mobs/mob_db"),
      h = a("DB/worldData"),
      r = a("DB/logsTable"),
      q = a("DB/Plug/PlugPreferences"),
      k = a("Utils/jquery");
    a("Controls/MapControl");
    var g = a("Renderer/Camera"),
      t = a("Renderer/MapRenderer"),
      l = a("Renderer/SpriteRenderer");
    a("Renderer/EntityManager");
    var f = a("Engine/SessionStorage"),
      n = a("Network/NetworkManager"),
      p = a("Network/PacketStructure"),
      v = a("Preferences/Controls");
    a("Preferences/Graphics");
    var u = a("UI/UIManager"),
      A = a("UI/UIComponent"),
      D = a("UI/Components/ChatBox/ChatBox");
    a("UI/Components/Emoticons/Emoticons");
    var B = a("UI/Components/MiniMap/MiniMap");
    a("UI/Components/BasicInfo/BasicInfo");
    a("UI/Components/StatusIcons/StatusIcons");
    var O = a("UI/Components/Quest/Quest"),
      C = a("UI/Components/SkillList/SkillList"),
      y = a("text!./vbk.html");
    a = a("text!./vbk.css");
    var z = new A("vbk", y, a),
      J,
      I = "attack",
      L = "guide";
    z.ready = 0;
    z.reReady = 0;
    z.noMapsame = 0;
    var x = [],
      M = [],
      E = "guide",
      F = [],
      G = [],
      H = [],
      K = [],
      P = [],
      N = 0,
      S = !1;
    z.init = function () {
      k("#vbk .btn button").on("click", function () {
        k("#vbk .btns").removeClass(J);
        "minimap" == J && B.renderStop();
        switch (this.className) {
          case "setAutokey":
            if ("setAuto" == J) return ((J = ""), !1);
            J = "setAuto";
            f.skillUpdate && (f.skillUpdate = !1);
            break;
          case "logsMsgkey":
            if ("logsMsg" == J) return ((J = ""), !1);
            J = "logsMsg";
            break;
          case "emokey":
            if ("emo" == J) return ((J = ""), !1);
            J = "emo";
            break;
          case "chatboxkey":
            J = "";
            k("#chatbox.small").removeClass("small");
            k("#chatbox").addClass("large");
            k("#chatbox")
              .find(".containers .content")
              .scrollTop(k("#chatbox").find(".containers .border").height());
            break;
          case "minimapkey":
            if ("minimap" == J) return ((J = ""), !1);
            B.renderPlay();
            J = "minimap";
            break;
          case "rolekey":
            if ("role" == J) return ((J = ""), !1);
            J = "role";
            break;
          case "menuButton":
            ((J = ""), k("#basicbutton").addClass("open").show());
        }
        J && k("#vbk .btns").addClass(J);
        event.stopImmediatePropagation();
        return !1;
      });
      k("#vbk .setAuto span").on("click", function () {
        k("#vbk .setAuto .content").removeClass(I);
        switch (this.className) {
          case "openattack":
            I = "attack";
            break;
          case "openpick":
            I = "pick";
            break;
          case "openeat":
            I = "eat";
            break;
          case "openfollow":
            I = "follow";
        }
        I && k("#vbk .btns.setAuto .setAuto .content").addClass(I);
      });
      k("#vbk .menu span").on("click", function () {
        k("#vbk .menu .content").removeClass(L);
        switch (this.className) {
          case "guidekey":
            L = "guide";
            break;
          case "trainkey":
            L = "train";
            break;
          case "makeMonzykey":
            L = "makeMonzy";
            break;
          case "challengekey":
            L = "challenge";
            break;
          case "dungeonskey":
            L = "dungeons";
            break;
          case "mvpkey":
            L = "mvp";
        }
        L && k("#vbk .btns.logsMsg .menu .content").addClass(L);
        E = k(this).attr("data-tag");
        d();
      });
      this.ui.find(".btn.menu .tagconent").on("click", ".logGo", function () {
        var a = k(this).attr("data-id"),
          b = r[e.nid][E][a];
        u.showPromptBox(
          "\u786e\u5b9a\u524d\u5f80\u6307\u5b9a\u76ee\u6807\u5417\uff1f",
          "ok",
          "cancel",
          function () {
            O.run(b, 0);
          },
          null,
        );
      });
      this.ui.find(".openattack").change(function () {
        if (1 == v.talk || 1 == z.reReady) return !1;
        if (S)
          u.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          );
        else if (
          (N++,
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3),
          30 < N)
        )
          ((S = !0),
            u.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              S = !1;
              u.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else {
          event.stopImmediatePropagation();
          if (3 == e.nid) {
            var a = new p.CZ.WHISPER();
            a.receiver = "NPC:setautoattack";
            a.msg = "0";
          } else
            ((a = new p.CZ.NOTIFY_UPDATEINFO()), (a.id = 34), (a.value = 1));
          n.sendPacket(a);
          B.removeDestination();
          k(this).attr("disabled", "disabled");
          setTimeout(
            function () {
              k(this).removeAttr("disabled");
            }.bind(this),
            200,
          );
        }
      });
      this.ui.find(".openpick").change(function () {
        if (1 == v.talk || 1 == z.reReady) return !1;
        if (S)
          u.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          );
        else if (
          (N++,
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3),
          30 < N)
        )
          ((S = !0),
            u.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              S = !1;
              u.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else {
          event.stopImmediatePropagation();
          if (3 == e.nid) {
            var a = new p.CZ.WHISPER();
            a.receiver = "NPC:setautopick";
            a.msg = "0";
          } else
            ((a = new p.CZ.NOTIFY_UPDATEINFO()), (a.id = 35), (a.value = 1));
          n.sendPacket(a);
          k(this).attr("disabled", "disabled");
          setTimeout(
            function () {
              k(this).removeAttr("disabled");
            }.bind(this),
            200,
          );
        }
      });
      this.ui.find(".openeat").change(function () {
        if (1 == v.talk || 1 == z.reReady) return !1;
        if (S)
          u.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          );
        else if (
          (N++,
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3),
          30 < N)
        )
          ((S = !0),
            u.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              S = !1;
              u.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else {
          event.stopImmediatePropagation();
          if (3 == e.nid) {
            var a = new p.CZ.WHISPER();
            a.receiver = "NPC:setautoeat";
            a.msg = "0";
          } else
            ((a = new p.CZ.NOTIFY_UPDATEINFO()), (a.id = 36), (a.value = 1));
          n.sendPacket(a);
          k(this).attr("disabled", "disabled");
          setTimeout(
            function () {
              k(this).removeAttr("disabled");
            }.bind(this),
            200,
          );
        }
      });
      this.ui.find(".openfollow").change(function () {
        if (1 == v.talk || 1 == z.reReady) return !1;
        if (S)
          u.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          );
        else if (
          (N++,
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3),
          30 < N)
        )
          ((S = !0),
            u.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              S = !1;
              u.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else {
          event.stopImmediatePropagation();
          if (3 == e.nid) {
            var a = new p.CZ.WHISPER();
            a.receiver = "NPC:setfollow";
            a.msg = "0";
          } else
            ((a = new p.CZ.NOTIFY_UPDATEINFO()), (a.id = 37), (a.value = 1));
          n.sendPacket(a);
          k(this).attr("disabled", "disabled");
          setTimeout(
            function () {
              k(this).removeAttr("disabled");
            }.bind(this),
            200,
          );
        }
      });
      this.ui
        .find(
          ".setAuto .container .content select,.setAuto .container .content input.text,.setAuto .container .content input.checkbox",
        )
        .on("focus", function () {
          window.scrollTo(0, 0);
        })
        .change(function () {
          if (1 == v.talk || 1 == z.reReady) return !1;
          S
            ? u.showMessageBox(
                "You are temporarily restricted from clicking.",
                "ok",
              )
            : (N++,
              1 === N &&
                setTimeout(function () {
                  N = 0;
                }, 5e3),
              30 < N
                ? ((S = !0),
                  u.showMessageBox(
                    "Click limit exceeded. You are restricted for 10s.",
                    "ok",
                  ),
                  setTimeout(function () {
                    S = !1;
                    u.showMessageBox(
                      "Restriction lifted. You can click again.",
                      "ok",
                    );
                  }, 1e4))
                : (b(k(this)),
                  k(this).attr("disabled", "disabled"),
                  setTimeout(
                    function () {
                      k(this).removeAttr("disabled");
                    }.bind(this),
                    200,
                  )));
        });
      this.ui.find(".onlyattack_block").on("change", "input", function () {
        if (1 == v.talk || 1 == z.reReady) return !1;
        if (S)
          u.showMessageBox(
            "You are temporarily restricted from clicking.",
            "ok",
          );
        else if (
          (N++,
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3),
          30 < N)
        )
          ((S = !0),
            u.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              S = !1;
              u.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else {
          var a = k(this).data("id"),
            b = m[a].kName,
            c = new p.CZ.NOTIFY_ONLYTARGET();
          c.id = a;
          if (k(this).prop("checked")) {
            if (20 <= M.length)
              return (
                k(this).removeAttr("checked"),
                D.addText(
                  "\u6307\u5b9a\u76ee\u6807\u4e0d\u80fd\u8d85\u8fc720\u4e2a",
                  D.TYPE.ERROR,
                ),
                !1
              );
            D.addText("\u68c0\u6d4b\u76ee\u6807 " + b, D.TYPE.SELF);
            z.setAttackList(a);
            c.value = 1;
          } else
            (D.addText(
              "\u53d6\u6d88\u68c0\u6d4b\u76ee\u6807 " + b,
              D.TYPE.SELF,
            ),
              z.delAttackList(a),
              (c.value = 0));
          n.sendPacket(c);
          k(this).attr("disabled", "disabled");
          setTimeout(
            function () {
              k(this).removeAttr("disabled");
            }.bind(this),
            200,
          );
        }
      });
    };
    z.renderFaces = function () {
      var a,
        b,
        c = f.Entity;
      if (c) {
        var d = c.direction,
          e = c.headDir,
          h = c.action,
          k = c.riding,
          m = c.riding_,
          n = c.costume,
          p = c._effectState;
        a = document.createElement("canvas");
        a.width = 50;
        a.height = 50;
        g.direction = 4;
        c.direction = 4;
        c.headDir = 0;
        c.riding = !1;
        c.riding_ = !1;
        c.costume = 0;
        c.effectState = 0;
        c.action = c.ACTION.IDLE;
        b = a.getContext("2d");
        b.clearRect(0, 0, b.canvas.width, b.canvas.height);
        l.bind2DContext(b, 26, 105);
        c.renderEntity();
        c.direction = d;
        c.headDir = e;
        c.action = h;
        c.riding = k;
        c.riding_ = m;
        c.costume = n;
        c.effectState = p;
        z.ui.find(".rolekey").html(a);
      }
    };
    z.setAttackList = function (a) {
      for (var b = 0; b < M.length; b++) if (M[b] == a) return;
      M.push(a);
    };
    z.delAttackList = function (a) {
      for (var b = 0; b < M.length; b++) M[b] == a && M.splice(b, 1);
    };
    z.getAttackList = function (a) {
      for (var b = 0; b < M.length; b++) if (M[b] == a) return !0;
      return !1;
    };
    z.setTarget = function (a) {
      var b = a.value;
      this.ui
        .find(".onlyattack_block input[data-id\x3d" + a.mobid + "]")
        .prop("checked", b);
    };
    z.setObjList = function (a) {
      for (var b = 0; b < F.length; b++) if (F[b] && F[b].GID == a.GID) return;
      F.push(a);
    };
    z.delobjlist = function (a) {
      for (var b = 0; b < F.length; b++)
        F[b] && F[b].GID == a && F.splice(b, 1);
    };
    z.getObjList = function (a) {
      for (var b = 0; b < F.length; b++)
        if (F[b] && F[b].display.name == a) return F[b];
    };
    z.onAppend = function () {
      this.addonlytarget();
      z.ready || this.addSoption();
      k("html").removeClass("gray");
      d();
    };
    z.onRemove = function () {};
    z.clean = function () {
      z.ready = 0;
      M = [];
      G = [];
      H = [];
      K = [];
      P = [];
      z.ui &&
        (z.removeskillOption("autoskillid", "\u5173\u95ed"),
        z.removeskillOption("addiskillid", "\u8bf7\u9009\u62e9"),
        z.removeskillOption("touchskillid", "\u8bf7\u9009\u62e9"),
        z.removeskillOption("qoautoskillid", "\u5173\u95ed"));
    };
    z.setloadInfo = function (a) {
      this.ready = 1;
      x = a;
      this.loadInfo();
    };
    z.setReloadInfo = function (a) {
      switch (a.id) {
        case 0:
          this.ui
            .find(".onlynoattack option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.onlynoattack = a.value;
          break;
        case 1:
          this.ui.find(".attackdis").val(a.value);
          x.pmdis = a.value;
          break;
        case 2:
          this.ui.find(".skilldis").val(a.value);
          x.mgdis = a.value;
          break;
        case 3:
          this.ui.find(".flytimer").val(a.value);
          x.AutoUseWing_time = a.value;
          break;
        case 4:
          this.ui.find(".usehpConversion").prop("checked", a.value);
          x.usehpConversion = a.value;
          break;
        case 5:
          this.ui.find(".bossfly").prop("checked", a.value);
          x.AutoSeeBoss = a.value;
          break;
        case 6:
          this.ui.find(".mobnumMin").val(a.value);
          x.qomobnumMin = a.value;
          break;
        case 7:
          this.ui.find(".mobnumMax").val(a.value);
          x.qomobnum = a.value;
          break;
        case 8:
          this.ui.find(".usealheal").prop("checked", a.value);
          x.usealheal = a.value;
          break;
        case 9:
          this.ui.find(".MinHpValFly").val(a.value);
          x.MinHpValFly = a.value;
          break;
        case 10:
          this.ui.find(".MinSpValFly").val(a.value);
          x.MinSpValFly = a.value;
          break;
        case 11:
          this.ui.find(".MinHpVal").val(a.value);
          x.MinHpVal = a.value;
          break;
        case 12:
          this.ui.find(".useBoarding").prop("checked", a.value);
          x.useBoarding = a.value;
          break;
        case 13:
          this.ui
            .find(".petTurnEgg option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.petTurnEgg = a.value;
          break;
        case 14:
          this.ui.find(".opensit").prop("checked", a.value);
          x.AutoUseSit = a.value;
          break;
        case 15:
          this.ui.find(".AutoUseSit_reHpVal").val(a.value);
          x.AutoUseSit_reHpVal = a.value;
          break;
        case 16:
          this.ui.find(".AutoUseSit_reSpVal").val(a.value);
          x.AutoUseSit_reSpVal = a.value;
          break;
        case 17:
          this.ui.find(".AutoUseSit_reHpUpVal").val(a.value);
          x.AutoUseSit_reHpUpVal = a.value;
          break;
        case 18:
          this.ui.find(".AutoUseSit_reSpUpVal").val(a.value);
          x.AutoUseSit_reSpUpVal = a.value;
          break;
        case 19:
          this.ui
            .find(".AutoUseSit_xw option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.AutoUseSit_xw = a.value;
          break;
        case 20:
          this.ui.find(".lootProbability").val(a.value / 100);
          x.autoloot = a.value;
          break;
        case 21:
          this.ui.find(".reHpVal").val(a.value);
          x.AutoUseItem_reHpVal = a.value;
          break;
        case 22:
          this.ui.find(".reSpVal").val(a.value);
          x.AutoUseItem_reSpVal = a.value;
          break;
        case 23:
          this.ui.find(".AutoUseItem_jsys").prop("checked", a.value);
          x.AutoUseItem_jsys = a.value;
          break;
        case 24:
          this.ui.find(".AutoUseItem_Elemental").prop("checked", a.value);
          x.AutoUseItem_Elemental = a.value;
          break;
        case 25:
          this.ui.find(".AutoUseItem_Panacea").prop("checked", a.value);
          x.AutoUseItem_Panacea = a.value;
          break;
        case 26:
          this.ui.find(".useSiegfried").prop("checked", a.value);
          x.useSiegfried = a.value;
          break;
        case 27:
          this.ui
            .find(".followStatus option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.AutoAttackstatus = a.value;
          1 == a.value || 2 == a.value
            ? z.ui.find(".follow.block").addClass("addis")
            : z.ui.find(".follow.block").removeClass("addis");
          break;
        case 28:
          this.ui
            .find(".followMode option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.AutofollowMode = a.value;
          break;
        case 29:
          this.ui.find(".disTarget").val(a.value);
          x.disTarget = a.value;
          break;
        case 30:
          this.ui
            .find(".addisTarget option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.addisTarget = a.value;
          break;
        case 31:
          this.ui.find(".aidddis_reHpVal").val(a.value);
          x.aidddis_reHpVal = a.value;
          break;
        case 32:
          this.ui.find(".aidddis_reSpVal").val(a.value);
          x.aidddis_reSpVal = a.value;
          break;
        case 33:
          this.ui
            .find(
              ".AutoUseItem_Elementalid option[data-index\x3d" + a.value + "]",
            )
            .prop("selected", "selected");
          x.AutoUseItem_Elementalid = a.value;
          break;
        case 34:
          this.ui.find(".openattack").prop("checked", a.value);
          (x.startAutoAtk = a.value)
            ? ((v.autoattack = !0),
              f.Entity.dialog.set("\u5f00\u59cb\u81ea\u52a8\u6218\u6597"))
            : ((v.autoattack = !1),
              f.Entity.dialog.set("\u5173\u95ed\u81ea\u52a8\u6218\u6597"));
          break;
        case 35:
          this.ui.find(".openpick").prop("checked", a.value);
          x.startAutoLoot = a.value;
          v.autopick = a.value ? !0 : !1;
          break;
        case 36:
          this.ui.find(".openeat").prop("checked", a.value);
          x.startAutopots = a.value;
          v.autoeat = a.value ? !0 : !1;
          break;
        case 37:
          this.ui.find(".openfollow").prop("checked", a.value);
          x.startAutofollow = a.value;
          v.autofollow = a.value ? !0 : !1;
          break;
        case 38:
          this.ui
            .find(".searchMode option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.searchMode = a.value;
          break;
        case 39:
          this.ui
            .find(".autoskillid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.AutoUseSkillid = a.value;
          if (0 < a.value) {
            var b = e.getSkillInfo(a.value);
            b &&
              D.addText(
                "\u4e3b\u52a8\u6280\u80fd\u8bbe\u7f6e\u4e3a" + b.SkillName,
                D.TYPE.SELF,
              );
          } else
            (this.ui.find(".autoskilllv").parent().hide(),
              this.ui.find(".autoskillPro").parent().hide());
          break;
        case 40:
          0 < a.value &&
            (this.ui.find(".autoskilllv").val(a.value),
            (x.AutoUseSkilllv = a.value),
            this.ui.find(".autoskilllv").parent().show());
          break;
        case 41:
          0 < a.value &&
            (this.ui.find(".autoskillPro").val(a.value),
            (x.useSkill_pro = a.value),
            this.ui.find(".autoskillPro").parent().show());
          break;
        case 42:
          this.ui
            .find(".touchskillid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          break;
        case 43:
          this.ui.find(".touchskillop").prop("checked", a.value);
          this.ui.find(".touchskillop").parent().show();
          this.ui.find(".touchskillid option:selected").data("index") ||
            this.ui.find(".touchskillop").parent().hide();
          break;
        case 44:
          this.ui
            .find(".qoautoskillid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          x.qo_AutoUseSkillid = a.value;
          0 < a.value
            ? (b = e.getSkillInfo(a.value)) &&
              D.addText(
                "\u89e3\u56f4\u6280\u80fd\u8bbe\u7f6e\u4e3a" + b.SkillName,
                D.TYPE.SELF,
              )
            : (D.addText(
                "\u89e3\u56f4\u6280\u80fd\u8bbe\u7f6e\u5931\u8d25",
                D.TYPE.ERROR,
              ),
              ItemObtain.setMsg(
                "\u89e3\u56f4\u6280\u80fd\u8bbe\u7f6e\u5931\u8d25",
              ),
              this.ui.find(".qoautoskilllv").parent().hide());
          break;
        case 45:
          this.ui.find(".qoautoskilllv").val(a.value);
          x.qo_AutoUseSkilllv = a.value;
          break;
        case 46:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          this.ui.find(".UseItemid").parent().show();
          a = { ITID: a.value };
          D.addText(
            "HP\u836f\u54c1(1)\u8bbe\u7f6e\u4e3a" + e.getItemName(a),
            D.TYPE.SELF,
          );
          break;
        case 47:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          a = { ITID: a.value };
          D.addText(
            "HP\u836f\u54c1(2)\u8bbe\u7f6e\u4e3a" + e.getItemName(a),
            D.TYPE.SELF,
          );
          break;
        case 48:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          a = { ITID: a.value };
          D.addText(
            "HP\u836f\u54c1(3)\u8bbe\u7f6e\u4e3a" + e.getItemName(a),
            D.TYPE.SELF,
          );
          break;
        case 49:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          a = { ITID: a.value };
          D.addText(
            "SP\u836f\u54c1(1)\u8bbe\u7f6e\u4e3a" + e.getItemName(a),
            D.TYPE.SELF,
          );
          break;
        case 50:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          a = { ITID: a.value };
          D.addText(
            "SP\u836f\u54c1(2)\u8bbe\u7f6e\u4e3a" + e.getItemName(a),
            D.TYPE.SELF,
          );
          break;
        case 51:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          a = { ITID: a.value };
          D.addText(
            "SP\u836f\u54c1(3)\u8bbe\u7f6e\u4e3a" + e.getItemName(a),
            D.TYPE.SELF,
          );
          break;
        case 52:
          this.ui.find(".AutoUseItem_Protection").prop("checked", a.value);
          x.AutoUseItem_Protection = a.value;
          break;
        case 53:
          this.ui
            .find(".addiskillid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          279 == a.value
            ? z.ui.find(".automatic").show()
            : z.ui.find(".automatic").hide();
          2286 == a.value
            ? z.ui.find(".autoshadow").show()
            : z.ui.find(".autoshadow").hide();
          break;
        case 54:
          a.value &&
            ((b = e.getSkillInfo(
              this.ui.find(".addiskillid option:selected").data("index"),
            )),
            b.bSeperateLv
              ? z.ui.find(".addiskilllv").removeAttr("disabled")
              : z.ui.find(".addiskilllv").attr("disabled", "disabled"),
            this.ui.find(".addiskilllv").val(a.value),
            this.ui.find(".addiskilllv").parent().show());
          this.ui.find(".addiskillid option:selected").data("index") ||
            this.ui.find(".addiskilllv").parent().hide();
          break;
        case 55:
          this.ui.find(".addiskillop").prop("checked", a.value);
          this.ui.find(".addiskillop").parent().show();
          this.ui.find(".addiskillid option:selected").data("index") ||
            this.ui.find(".addiskillop").parent().hide();
          break;
        case 56:
          this.ui
            .find(".automaticid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          break;
        case 57:
          if (a.value) {
            switch (a.value) {
              case 1:
              case 2:
              case 3:
                c("UseItemid", "hpList");
                break;
              case 4:
              case 5:
              case 6:
                c("UseItemid", "spList");
            }
            this.ui
              .find(".autoUseItem option[data-index\x3d" + a.value + "]")
              .prop("selected", "selected");
            this.ui.find(".UseItemid").parent().show();
          } else this.ui.find(".UseItemid").parent().hide();
          break;
        case 58:
          this.ui
            .find(".UseItemid option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          break;
        case 59:
          this.ui
            .find(
              ".AutoUseItem_Protectionid option[data-index\x3d" + a.value + "]",
            )
            .prop("selected", "selected");
          break;
        case 60:
          this.ui.find(".AutoUseItem_Protectionop").prop("checked", a.value);
          this.ui.find(".AutoUseItem_Protectionop").parent().show();
          this.ui
            .find(".AutoUseItem_Protectionid option:selected")
            .data("index") || this.ui.find(".addiskillop").parent().hide();
          break;
        case 61:
          0 <= a.value
            ? (this.ui
                .find(".adTarget option[data-index\x3d" + a.value + "]")
                .prop("selected", "selected"),
              this.ui.find(".line.adt").show())
            : this.ui.find(".line.adt").hide();
          break;
        case 62:
          this.ui
            .find(".keepway_xw option[data-index\x3d" + a.value + "]")
            .prop("selected", "selected");
          break;
        case 63:
          this.ui.find(".useManuals").prop("checked", a.value);
          break;
        case 64:
          this.ui.find(".useBubbles").prop("checked", a.value);
          break;
        case 66:
          this.ui.find(".AutoUseItem_Dishop").prop("checked", a.value);
          break;
        case 67:
          this.ui.find(".useAspersio").prop("checked", a.value);
          break;
        case 68:
          this.ui.find(".ProtectTeam").prop("checked", a.value);
      }
    };
    z.loadInfo = function () {
      if (0 == x.length) return !1;
      this.ui
        .find(".onlynoattack option[data-index\x3d" + x.onlynoattack + "]")
        .prop("selected", "selected");
      this.ui.find(".attackdis").val(x.pmdis);
      this.ui.find(".skilldis").val(x.mgdis);
      this.ui.find(".flytimer").val(x.AutoUseWing_time);
      this.ui.find(".usehpConversion").prop("checked", x.usehpConversion);
      this.ui.find(".bossfly").prop("checked", x.AutoSeeBoss);
      this.ui.find(".mobnumMin").val(x.qomobnumMin);
      this.ui.find(".mobnumMax").val(x.qomobnum);
      this.ui.find(".usealheal").prop("checked", x.usealheal);
      this.ui.find(".MinHpValFly").val(x.MinHpValFly);
      this.ui.find(".MinSpValFly").val(x.MinSpValFly);
      this.ui.find(".MinHpVal").val(x.MinHpVal);
      this.ui.find(".useBoarding").prop("checked", x.useBoarding);
      this.ui
        .find(".petTurnEgg option[data-index\x3d" + x.petTurnEgg + "]")
        .prop("selected", "selected");
      this.ui.find(".opensit").prop("checked", x.AutoUseSit);
      this.ui.find(".AutoUseSit_reHpVal").val(x.AutoUseSit_reHpVal);
      this.ui.find(".AutoUseSit_reSpVal").val(x.AutoUseSit_reSpVal);
      this.ui.find(".AutoUseSit_reHpUpVal").val(x.AutoUseSit_reHpUpVal);
      this.ui.find(".AutoUseSit_reSpUpVal").val(x.AutoUseSit_reSpUpVal);
      this.ui
        .find(".AutoUseSit_xw option[data-index\x3d" + x.AutoUseSit_xw + "]")
        .prop("selected", "selected");
      this.ui.find(".lootProbability").val(x.autoloot / 100);
      this.ui.find(".reHpVal").val(x.AutoUseItem_reHpVal);
      this.ui.find(".reSpVal").val(x.AutoUseItem_reSpVal);
      this.ui.find(".AutoUseItem_jsys").prop("checked", x.AutoUseItem_jsys);
      this.ui
        .find(".AutoUseItem_Elemental")
        .prop("checked", x.AutoUseItem_Elemental);
      this.ui
        .find(
          ".AutoUseItem_Elementalid option[data-index\x3d" +
            x.AutoUseItem_Elementalid +
            "]",
        )
        .prop("selected", "selected");
      this.ui
        .find(".AutoUseItem_Protection")
        .prop("checked", x.AutoUseItem_Protection);
      this.ui
        .find(".AutoUseItem_Protectionid option[data-index\x3d0]")
        .prop("selected", "selected");
      this.ui.find(".AutoUseItem_Protectionop").parent().hide();
      this.ui
        .find(".AutoUseItem_Panacea")
        .prop("checked", x.AutoUseItem_Panacea);
      this.ui.find(".useSiegfried").prop("checked", x.useSiegfried);
      this.ui
        .find(".followStatus option[data-index\x3d" + x.AutoAttackstatus + "]")
        .prop("selected", "selected");
      (1 != x.AutoAttackstatus && 2 != x.AutoAttackstatus) ||
        this.ui.find(".follow.block").addClass("addis");
      this.ui
        .find(".followMode option[data-index\x3d" + x.AutofollowMode + "]")
        .prop("selected", "selected");
      this.ui.find(".disTarget").val(x.disTarget);
      this.ui
        .find(".addisTarget option[data-index\x3d" + x.addisTarget + "]")
        .prop("selected", "selected");
      this.ui.find(".aidddis_reHpVal").val(x.aidddis_reHpVal);
      this.ui.find(".aidddis_reSpVal").val(x.aidddis_reSpVal);
      this.ui.find(".openattack").prop("checked", x.startAutoAtk);
      this.ui.find(".openpick").prop("checked", x.startAutoLoot);
      this.ui.find(".openeat").prop("checked", x.startAutopots);
      this.ui.find(".openfollow").prop("checked", x.startAutofollow);
      this.ui
        .find(".searchMode option[data-index\x3d" + x.searchMode + "]")
        .prop("selected", "selected");
      this.ui.find(".autoskilllv").parent().hide();
      this.ui.find(".autoskillPro").parent().hide();
      0 < x.AutoUseSkillid &&
        this.ui.find(
          ".autoskillid option[data-index\x3d" + x.AutoUseSkillid + "]",
        ).length &&
        (this.ui
          .find(".autoskillid option[data-index\x3d" + x.AutoUseSkillid + "]")
          .prop("selected", "selected"),
        this.ui.find(".autoskilllv").val(x.AutoUseSkilllv),
        this.ui.find(".autoskillPro").val(x.useSkill_pro),
        this.ui.find(".autoskilllv").parent().show(),
        this.ui.find(".autoskillPro").parent().show());
      this.ui.find(".addiskilllv").parent().hide();
      this.ui.find(".addiskillop").parent().hide();
      this.ui.find(".touchskillop").parent().hide();
      this.ui.find(".qoautoskilllv").parent().hide();
      0 < x.qo_AutoUseSkillid &&
        this.ui.find(
          ".qoautoskillid option[data-index\x3d" + x.qo_AutoUseSkillid + "]",
        ).length &&
        (this.ui
          .find(
            ".qoautoskillid option[data-index\x3d" + x.qo_AutoUseSkillid + "]",
          )
          .prop("selected", "selected"),
        this.ui.find(".qoautoskilllv").val(x.qo_AutoUseSkilllv),
        this.ui.find(".qoautoskilllv").parent().show());
      this.ui
        .find(".autoUseItem option[data-index\x3d0]")
        .prop("selected", "selected");
      this.ui.find(".UseItemid").parent().hide();
      this.ui
        .find(".keepway_xw option[data-index\x3d" + x.keepwayOp + "]")
        .prop("selected", "selected");
      this.ui.find(".useManuals").prop("checked", x.useManuals);
      this.ui.find(".useBubbles").prop("checked", x.useBubbles);
      this.ui.find(".AutoUseItem_Dishop").parent().hide();
      this.ui.find(".useAspersio").prop("checked", x.useAspersio);
      this.ui.find(".ProtectTeam").prop("checked", x.ProtectTeam);
      k("html").removeClass("gray");
      this.ui.show();
    };
    z.addonlytarget = function () {
      if (z.noMapsame) {
        M = [];
        this.ui.find(".onlyattack_block input").prop("checked", !1);
        this.ui.find(".onlyattack_block").empty();
        var a = t.currentMap.split(".");
        if ((a = h[a[0]]))
          if (((a = a.mobs), a.length)) {
            for (var b in a) {
              var c = k(
                "\x3clabel\x3e" +
                  m[a[b]].kName +
                  '\x3cinput type\x3d"checkbox" data-id\x3d"' +
                  a[b] +
                  '"\x3e\x3c/label\x3e',
              );
              z.ui.find(".onlyattack_block").append(c);
            }
            return !1;
          }
        z.ui
          .find(".onlyattack_block")
          .html("\u627e\u4e0d\u5230\u53ef\u653b\u51fb\u7684\u9b54\u7269");
      }
    };
    z.addoption = function (a) {
      a = k("#vbk .nav_content ." + a);
      a.empty();
      for (var b = 0; b <= a.attr("data-max"); b++) {
        var c = parseInt(a.attr("data-min")) + b;
        a.append(
          "\x3coption data-index\x3d" + c + "\x3e" + c + "\x3c/option\x3e",
        );
      }
    };
    z.addSoption = function () {
      z.removeskillOption("autoskillid", "\u5173\u95ed");
      z.removeskillOption("addiskillid", "\u8bf7\u9009\u62e9");
      z.removeskillOption("touchskillid", "\u8bf7\u9009\u62e9");
      z.removeskillOption("qoautoskillid", "\u5173\u95ed");
    };
    z.addskillOption = function (a, b, c) {
      switch (b) {
        case "autoskillid":
          G = a;
          break;
        case "addiskillid":
          H = a;
          break;
        case "touchskillid":
          K = a;
          break;
        case "qoautoskillid":
          P = a;
      }
      for (c = 0; c < a.length; c++)
        if (
          0 ==
          z.ui.find("." + b + " option[data-index\x3d" + a[c].SKID + "]").length
        ) {
          var d = e.getSkillInfo(a[c].SKID);
          d &&
            z.ui
              .find("." + b)
              .append(
                "\x3coption data-index\x3d'" +
                  a[c].SKID +
                  "'\x3e" +
                  d.SkillName +
                  "\x3c/option\x3e",
              );
        }
    };
    z.addskillOption2 = function (a) {
      var b = a.SKID;
      a = a.why;
      for (var c = 0; c < b.length; c++)
        if (
          0 ==
          z.ui.find(".autoshadowid option[data-index\x3d" + b[c] + "]").length
        ) {
          var d = e.getSkillInfo(b[c]);
          d &&
            z.ui
              .find(".autoshadowid")
              .append(
                "\x3coption data-index\x3d'" +
                  b[c] +
                  "'\x3e" +
                  d.SkillName +
                  "\x3c/option\x3e",
              );
        }
      z.ui
        .find(".autoshadowid option[data-index\x3d" + a + "]")
        .prop("selected", "selected");
    };
    z.removeskillOption = function (a, b) {
      z.ui
        .find("." + a)
        .empty()
        .append("\x3coption data-index\x3d'0'\x3e" + b + "\x3c/option\x3e");
    };
    z.updateSkill = function () {
      for (var a = C.getList(), b = 0; b < a.length; b++)
        if (0 < a[b].level) {
          var c = q.autoskill.SKID.includes(a[b].SKID);
          if (c && (c = e.getSkillInfo(a[b].SKID))) {
            for (var d = !1, f = 0; f < G.length; f++)
              if (G[f].SKID == a[b].SKID) {
                d = !0;
                break;
              }
            d ||
              (z.ui
                .find(".autoskillid")
                .append(
                  "\x3coption data-index\x3d'" +
                    a[b].SKID +
                    "'\x3e" +
                    c.SkillName +
                    "\x3c/option\x3e",
                ),
              G.push(a[b]));
          }
          if ((c = q.addiskill.SKID.includes(a[b].SKID)))
            if ((c = e.getSkillInfo(a[b].SKID))) {
              d = !1;
              for (f = 0; f < H.length; f++)
                if (H[f].SKID == a[b].SKID) {
                  d = !0;
                  break;
                }
              d ||
                (z.ui
                  .find(".addiskillid")
                  .append(
                    "\x3coption data-index\x3d'" +
                      a[b].SKID +
                      "'\x3e" +
                      c.SkillName +
                      "\x3c/option\x3e",
                  ),
                H.push(a[b]));
            }
          if ((c = q.touchskill.SKID.includes(a[b].SKID)))
            if ((c = e.getSkillInfo(a[b].SKID))) {
              d = !1;
              for (f = 0; f < K.length; f++)
                if (K[f].SKID == a[b].SKID) {
                  d = !0;
                  break;
                }
              d ||
                (z.ui
                  .find(".touchskillid")
                  .append(
                    "\x3coption data-index\x3d'" +
                      a[b].SKID +
                      "'\x3e" +
                      c.SkillName +
                      "\x3c/option\x3e",
                  ),
                K.push(a[b]));
            }
          if ((c = q.qoautoskill.SKID.includes(a[b].SKID)))
            if ((c = e.getSkillInfo(a[b].SKID))) {
              d = !1;
              for (f = 0; f < P.length; f++)
                if (P[f].SKID == a[b].SKID) {
                  d = !0;
                  break;
                }
              d ||
                (z.ui
                  .find(".qoautoskillid")
                  .append(
                    "\x3coption data-index\x3d'" +
                      a[b].SKID +
                      "'\x3e" +
                      c.SkillName +
                      "\x3c/option\x3e",
                  ),
                P.push(a[b]));
            }
        }
    };
    z.onShortCut = function (a) {
      switch (a.cmd) {
        case "Role":
          k("#vbk .btns").removeClass(J);
          "minimap" == J && B.renderStop();
          if ("role" == J) return ((J = ""), !1);
          J = "role";
          k("#vbk .btns").addClass(J);
          break;
        case "MiniMap":
          k("#vbk .btns").removeClass(J);
          "minimap" == J && B.renderStop();
          if ("minimap" == J) return ((J = ""), !1);
          J = "minimap";
          B.renderPlay();
          k("#vbk .btns").addClass(J);
          break;
        case "EMO":
          k("#vbk .btns").removeClass(J);
          "minimap" == J && B.renderStop();
          if ("emo" == J) return ((J = ""), !1);
          J = "emo";
          k("#vbk .btns").addClass(J);
          break;
        case "autoattack":
          if (v.talk) return !1;
          if (S) {
            u.showMessageBox(
              "You are temporarily restricted from clicking.",
              "ok",
            );
            break;
          }
          N++;
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3);
          30 < N
            ? ((S = !0),
              u.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                u.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : (z.ui.find(".openattack").prop("checked")
                ? z.ui.find(".openattack").removeAttr("checked")
                : z.ui.find(".openattack").prop("checked", "checked"),
              3 == e.nid
                ? ((a = new p.CZ.WHISPER()),
                  (a.receiver = "NPC:setautoattack"),
                  (a.msg = "0"))
                : ((a = new p.CZ.NOTIFY_UPDATEINFO()),
                  (a.id = 34),
                  (a.value = 1)),
              n.sendPacket(a),
              B.removeDestination());
          break;
        case "autoloot":
          if (S) {
            u.showMessageBox(
              "You are temporarily restricted from clicking.",
              "ok",
            );
            break;
          }
          N++;
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3);
          30 < N
            ? ((S = !0),
              u.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                u.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : (z.ui.find(".openpick").prop("checked")
                ? z.ui.find(".openpick").removeAttr("checked")
                : z.ui.find(".openpick").prop("checked", "checked"),
              3 == e.nid
                ? ((a = new p.CZ.WHISPER()),
                  (a.receiver = "NPC:setautopick"),
                  (a.msg = "0"))
                : ((a = new p.CZ.NOTIFY_UPDATEINFO()),
                  (a.id = 35),
                  (a.value = 1)),
              n.sendPacket(a));
          break;
        case "autopots":
          if (S) {
            u.showMessageBox(
              "You are temporarily restricted from clicking.",
              "ok",
            );
            break;
          }
          N++;
          1 === N &&
            setTimeout(function () {
              N = 0;
            }, 5e3);
          30 < N
            ? ((S = !0),
              u.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                u.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : (z.ui.find(".openeat").prop("checked")
                ? z.ui.find(".openeat").removeAttr("checked")
                : z.ui.find(".openeat").prop("checked", "checked"),
              3 == e.nid
                ? ((a = new p.CZ.WHISPER()),
                  (a.receiver = "NPC:setautoeat"),
                  (a.msg = "0"))
                : ((a = new p.CZ.NOTIFY_UPDATEINFO()),
                  (a.id = 36),
                  (a.value = 1)),
              n.sendPacket(a));
          break;
        case "autofollow":
          if (v.talk) return !1;
          S
            ? u.showMessageBox(
                "You are temporarily restricted from clicking.",
                "ok",
              )
            : (N++,
              1 === N &&
                setTimeout(function () {
                  N = 0;
                }, 5e3),
              30 < N
                ? ((S = !0),
                  u.showMessageBox(
                    "Click limit exceeded. You are restricted for 10s.",
                    "ok",
                  ),
                  setTimeout(function () {
                    S = !1;
                    u.showMessageBox(
                      "Restriction lifted. You can click again.",
                      "ok",
                    );
                  }, 1e4))
                : (z.ui.find(".openfollow").prop("checked")
                    ? z.ui.find(".openfollow").removeAttr("checked")
                    : z.ui.find(".openfollow").prop("checked", "checked"),
                  3 == e.nid
                    ? ((a = new p.CZ.WHISPER()),
                      (a.receiver = "NPC:setfollow"),
                      (a.msg = "0"))
                    : ((a = new p.CZ.NOTIFY_UPDATEINFO()),
                      (a.id = 37),
                      (a.value = 1)),
                  n.sendPacket(a)));
      }
    };
    return u.addComponent(z);
  },
);
