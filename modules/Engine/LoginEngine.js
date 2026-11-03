define(
  "Engine/LoginEngine",
  "require Vendors/text-encoding DB/DBManager Audio/BGM Audio/SoundManager Core/Configs Core/Thread Engine/SessionStorage Engine/CharEngine Network/NetworkManager Network/PacketStructure Network/PacketVerManager Renderer/Renderer UI/UIManager UI/Components/WinList/WinList UI/Components/WinPopup/WinPopup UI/Components/WinLogin/WinLogin".split(
    " ",
  ),
  function (a) {
    function b() {
      H.removeComponents();
      G.append();
      u.close();
    }
    function c(a, b) {
      k.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      G.remove();
      N.append();
      J = a;
      u.connect(I.address, I.port, function (c) {
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
          d = new A.CA.EXE_HASHCHECK();
          d.HashValue = c;
          u.sendPacket(d);
          d = new A.CA.LOGIN();
          d.ID = a;
          d.Passwd = b;
          d.Version = parseInt(I.version, 10);
          d.clienttype = parseInt(I.langtype, 10);
          u.sendPacket(d);
          c = jQuery("#_csrf").val();
          d = f.get("ClientVer");
          var k;
          switch (d) {
            case 3:
              k = {
                _csrf: c,
                "Login_cn2[userid]": uid,
                "Login_cn2[user_pass]": psd,
              };
              break;
            case 4:
              k = {
                _csrf: c,
                "Login_ts[userid]": uid,
                "Login_ts[user_pass]": psd,
              };
              break;
            case 5:
              k = {
                _csrf: c,
                "Login_debug[userid]": uid,
                "Login_debug[user_pass]": psd,
              };
          }
          jQuery.ajax({
            url: "/?r\x3dmg/checkin\x26nid\x3d" + d,
            type: "post",
            data: k,
            success: function (a) {},
          });
        } else H.showErrorBox(g.getMessage(1));
      });
    }
    function d() {
      P("Engine/GameEngine").reload();
    }
    function e(a) {
      k.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      C.remove();
      N.append();
      v.onExitRequest = b;
      v.init(x[a]);
    }
    function l(a) {
      k.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      C.remove();
      N.append();
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
      H.removeComponents();
      q.AuthCode = a.AuthCode;
      q.AuthToken = a.AuthToken;
      q.AID = a.AID;
      q.UserLevel = a.userLevel;
      q.Sex = a.Sex;
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
        ? (N.append(), (v.onExitRequest = b), v.init(x[0]))
        : (N.remove(),
          C.append(),
          C.ui.find("h1").text("\u6570\u636e\u4e92\u901a\u7ebf\u8def"),
          (C.onIndexSelected = e),
          (C.onInterCode = l),
          (C.onExitRequest = function () {
            u.close();
            H.removeComponents();
            C.remove();
            G.append();
          }),
          C.setList(x, 1));
      var f = new A.CA.CONNECT_INFO_CHANGED();
      f.ID = J;
      u.setPing(function () {
        u.sendPacket(f);
      });
    }
    function r(a) {
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
      H.showMessageBox(
        g.getMessage(b).replace("%s", a.blockDate),
        "ok",
        function () {
          H.removeComponents();
          G.append();
        },
      );
      u.close();
    }
    function t(a) {
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
          H.showErrorBox(g.getMessage(b));
          break;
        default:
          H.showEventBox(g.getMessage(b));
      }
      u.close();
    }
    var n = a("Vendors/text-encoding"),
      g = a("DB/DBManager"),
      p = a("Audio/BGM"),
      k = a("Audio/SoundManager"),
      f = a("Core/Configs"),
      m = a("Core/Thread"),
      q = a("Engine/SessionStorage"),
      v = a("Engine/CharEngine"),
      u = a("Network/NetworkManager"),
      A = a("Network/PacketStructure"),
      D = a("Network/PacketVerManager"),
      B = a("Renderer/Renderer"),
      H = a("UI/UIManager"),
      C = a("UI/Components/WinList/WinList"),
      z = a("UI/Components/WinPopup/WinPopup"),
      G = a("UI/Components/WinLogin/WinLogin"),
      P = a,
      N = z.clone("WinLoading");
    N.init = function () {
      this.ui.css({ top: (B.height - 120) / 1.5, left: (B.width - 280) / 2 });
      this.ui.find(".text").text(g.getMessage(121));
    };
    H.addComponent(N);
    var I = null,
      x = [],
      J = "";
    return {
      init: function (a) {
        var b;
        f.setServer(a);
        H.removeComponents();
        q.LangType = "langtype" in a ? parseInt(a.langtype, 10) : 1;
        switch (q.LangType) {
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
        n.setCharset(b);
        I = a;
        b = f.get("remoteClient");
        f.get("ClientVer");
        var e = f.get("autoLogin"),
          g = f.get("BGMFileExtension");
        "20211103".match(/^\d+$/) && (D.value = 20211103);
        D.value
          ? (b && m.send("SET_HOST", b),
            g && p.setAvailableExtensions(g),
            (q.AdminList = a.adminList || []),
            (G.onConnectionRequest = c),
            (G.onExitRequest = d),
            e instanceof Array && e[0] && e[1]
              ? (c.apply(null, e), f.set("autoLogin", null))
              : G.append(),
            u.hookPacket(A.AC.ACCEPT_LOGIN, h),
            u.hookPacket(A.AC.ACCEPT_LOGIN3, h),
            u.hookPacket(A.AC.REFUSE_LOGIN, r),
            u.hookPacket(A.AC.REFUSE_LOGIN_R2, r),
            u.hookPacket(A.SC.NOTIFY_BAN, t))
          : H.showErrorBox("Sorry, no PACKETVER configs found.");
      },
      reload: b,
    };
  },
);
