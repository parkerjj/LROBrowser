define(
  "Engine/LoginEngine",
  "require Vendors/text-encoding DB/DBManager Audio/BGM Audio/SoundManager Core/Configs Core/Thread Engine/SessionStorage Engine/CharEngine Network/NetworkManager Network/PacketStructure Network/PacketVerManager Renderer/Renderer UI/UIManager UI/Components/WinList/WinList UI/Components/WinPopup/WinPopup UI/Components/WinLogin/WinLogin".split(
    " ",
  ),
  function (a) {
    function b() {
      J.removeComponents();
      F.append();
      t.close();
    }
    function c(a, b) {
      l.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      F.remove();
      M.append();
      I = a;
      t.connect(H.address, H.port, function (c) {
        if (c) {
          account = a;
          var d;
          c = "83ba069fd7c9e7683c435cecd507b18d";
          if (/^[a-f0-9]+$/i.test(c)) {
            d = "";
            var e,
              h = c.length;
            for (e = 0; e < h; e += 2)
              d += String.fromCharCode(parseInt(c.substr(e, 2), 16));
            c = d;
          }
          d = new z.CA.EXE_HASHCHECK();
          d.HashValue = c;
          t.sendPacket(d);
          d = new z.CA.LOGIN();
          d.ID = a;
          d.Passwd = b;
          d.Version = parseInt(H.version, 10);
          d.clienttype = parseInt(H.langtype, 10);
          t.sendPacket(d);
          c = jQuery("#_csrf").val();
          d = f.get("ClientVer");
          var l;
          switch (d) {
            case 3:
              l = {
                _csrf: c,
                "Login_cn2[userid]": uid,
                "Login_cn2[user_pass]": psd,
              };
              break;
            case 4:
              l = {
                _csrf: c,
                "Login_ts[userid]": uid,
                "Login_ts[user_pass]": psd,
              };
              break;
            case 5:
              l = {
                _csrf: c,
                "Login_debug[userid]": uid,
                "Login_debug[user_pass]": psd,
              };
          }
          jQuery.ajax({
            url: "/?r\x3dmg/checkin\x26nid\x3d" + d,
            type: "post",
            data: l,
            success: function (a) {},
          });
        } else J.showErrorBox(g.getMessage(1));
      });
    }
    function d() {
      O("Engine/GameEngine").reload();
    }
    function e(a) {
      l.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      A.remove();
      M.append();
      v.onExitRequest = b;
      v.init(x[a]);
    }
    function m(a) {
      l.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      A.remove();
      M.append();
      v.onExitRequest = b;
      var c = x[0];
      switch (a) {
        case "zgv4":
          c.port = 26122;
          break;
        case "avv6":
          c.port = 24323;
      }
      v.init(c);
    }
    function h(a) {
      J.removeComponents();
      p.AuthCode = a.AuthCode;
      p.AuthToken = a.AuthToken;
      p.AID = a.AID;
      p.UserLevel = a.userLevel;
      p.Sex = a.Sex;
      x = a.ServerList;
      var c = x.length,
        d = Array(c);
      for (a = 0; a < c; ++a)
        ((d[a] = x[a].property ? g.getMessage(482) + " " : ""),
          (d[a] += x[a].name),
          (d[a] += x[a].state
            ? g.getMessage(484)
            : " " + g.getMessage(483).replace("%d", x[a].usercount)));
      1 === c
        ? (M.append(), (v.onExitRequest = b), v.init(x[0]))
        : (M.remove(),
          A.append(),
          A.ui.find("h1").text("\u6570\u636e\u4e92\u901a\u7ebf\u8def"),
          (A.onIndexSelected = e),
          (A.onInterCode = m),
          (A.onExitRequest = function () {
            t.close();
            J.removeComponents();
            A.remove();
            F.append();
          }),
          A.setList(x, 1));
      var f = new z.CA.CONNECT_INFO_CHANGED();
      f.ID = I;
      t.setPing(function () {
        t.sendPacket(f);
      });
    }
    function q(a) {
      var b = 9;
      switch (a.ErrorCode) {
        case 0:
          b = 6;
          break;
        case 1:
          b = 7;
          break;
        case 2:
          b = 8;
          break;
        case 3:
          b = 3;
          break;
        case 4:
          b = 266;
          break;
        case 5:
          b = 310;
          break;
        case 6:
          b = 449;
          break;
        case 7:
          b = 264;
          break;
        case 8:
          b = 681;
          break;
        case 9:
          b = 703;
          break;
        case 10:
          b = 704;
          break;
        case 11:
          b = 705;
          break;
        case 12:
          b = 706;
          break;
        case 13:
          b = 707;
          break;
        case 14:
          b = 708;
          break;
        case 15:
          b = 709;
          break;
        case 99:
          b = 368;
          break;
        case 100:
          b = 809;
          break;
        case 101:
          b = 810;
          break;
        case 102:
          b = 811;
          break;
        case 103:
          b = 859;
          break;
        case 104:
          b = 860;
      }
      J.showMessageBox(
        g.getMessage(b).replace("%s", a.blockDate),
        "ok",
        function () {
          J.removeComponents();
          F.append();
        },
      );
      t.close();
    }
    function r(a) {
      var b;
      switch (a.ErrorCode) {
        default:
        case 0:
          b = 3;
          break;
        case 1:
          b = 4;
          break;
        case 2:
          b = 5;
          break;
        case 3:
          b = 9;
          break;
        case 4:
          b = 439;
          break;
        case 5:
          b = 305;
          break;
        case 6:
          b = 764;
          break;
        case 8:
          b = 440;
          break;
        case 9:
          b = 529;
          break;
        case 10:
          b = 530;
          break;
        case 15:
          b = 579;
          break;
        case 101:
          b = 810;
          break;
        case 102:
          b = 1179;
      }
      switch (a.ErrorCode) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 15:
          J.showErrorBox(g.getMessage(b));
          break;
        default:
          J.showEventBox(g.getMessage(b));
      }
      t.close();
    }
    var k = a("Vendors/text-encoding"),
      g = a("DB/DBManager"),
      u = a("Audio/BGM"),
      l = a("Audio/SoundManager"),
      f = a("Core/Configs"),
      n = a("Core/Thread"),
      p = a("Engine/SessionStorage"),
      v = a("Engine/CharEngine"),
      t = a("Network/NetworkManager"),
      z = a("Network/PacketStructure"),
      E = a("Network/PacketVerManager"),
      C = a("Renderer/Renderer"),
      J = a("UI/UIManager"),
      A = a("UI/Components/WinList/WinList"),
      B = a("UI/Components/WinPopup/WinPopup"),
      F = a("UI/Components/WinLogin/WinLogin"),
      O = a,
      M = B.clone("WinLoading");
    M.init = function () {
      this.ui.css({ top: (C.height - 120) / 1.5, left: (C.width - 280) / 2 });
      this.ui.find(".text").text(g.getMessage(121));
    };
    J.addComponent(M);
    var H = null,
      x = [],
      I = "";
    return {
      init: function (a) {
        var b;
        f.setServer(a);
        J.removeComponents();
        p.LangType = "langtype" in a ? parseInt(a.langtype, 10) : 1;
        switch (p.LangType) {
          case 0:
            if (f.get("disableKorean")) {
              b = "windows-1252";
              break;
            }
            console.warn(
              "%c[Warning] You are using a Korean langtype. If you have some charset problem set ROConfig.servers[\x3cindex\x3e].disableKorean to true or use a proper langtype !",
              "font-weight:bold; color:red; font-size:14px",
            );
            b = "windows-949";
            break;
          default:
          case 12:
          case 18:
            b = "windows-1252";
            break;
          case 2:
            b = "shift-jis";
            break;
          case 3:
            b = "gbk";
            break;
          case 4:
            b = "big5";
            break;
          case 5:
            b = "windows-874";
            break;
          case 14:
            b = "windows-1251";
            break;
          case 15:
            b = "windows-1258";
            break;
          case 20:
            b = "windows-1256";
        }
        k.setCharset(b);
        H = a;
        b = f.get("remoteClient");
        f.get("ClientVer");
        var e = f.get("autoLogin"),
          g = f.get("BGMFileExtension");
        "20211103".match(/^\d+$/) && (E.value = 20211103);
        E.value
          ? (b && n.send("SET_HOST", b),
            g && u.setAvailableExtensions(g),
            (p.AdminList = a.adminList || []),
            (F.onConnectionRequest = c),
            (F.onExitRequest = d),
            e instanceof Array && e[0] && e[1]
              ? (c.apply(null, e), f.set("autoLogin", null))
              : F.append(),
            t.hookPacket(z.AC.ACCEPT_LOGIN, h),
            t.hookPacket(z.AC.ACCEPT_LOGIN3, h),
            t.hookPacket(z.AC.REFUSE_LOGIN, q),
            t.hookPacket(z.AC.REFUSE_LOGIN_R2, q),
            t.hookPacket(z.SC.NOTIFY_BAN, r))
          : J.showErrorBox("Sorry, no PACKETVER configs found.");
      },
      reload: b,
    };
  },
);
