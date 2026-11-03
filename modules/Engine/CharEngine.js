define(
  "Engine/CharEngine",
  "require Utils/jquery DB/DBManager Core/Events Audio/SoundManager Audio/BGM Renderer/Renderer Engine/SessionStorage Engine/MapEngine Network/NetworkManager Network/PacketStructure Network/PacketVerManager UI/UIManager UI/Background UI/Components/CharSelect/CharSelect UI/Components/CharCreate/CharCreate UI/Components/InputBox/InputBox UI/Components/PincodeBox/PincodeBox UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a) {
    function b(a) {
      H.play("01.mp3");
      Q = a;
      P.connect(P.utils.longToIP(a.ip), a.port, function (a) {
        a
          ? ((a = new N.CH.ENTER()),
            (a.AID = z.AID),
            (a.AuthCode = z.AuthCode),
            (a.userLevel = z.UserLevel),
            (a.Sex = z.Sex),
            (a.clientType = z.LangType),
            P.sendPacket(a),
            P.read(function (a) {
              z.AID = a.readLong();
            }))
          : x.showErrorBox(A.getMessage(1));
      });
      P.hookPacket(N.HC.ACCEPT_ENTER_NEO_UNION, d);
      P.hookPacket(N.HC.ACCEPT_ENTER_NEO_UNION2, d);
      P.hookPacket(N.HC.ACCEPT_ENTER2, e);
      P.hookPacket(N.HC.REFUSE_ENTER, l);
      P.hookPacket(N.HC.ACCEPT_MAKECHAR_NEO_UNION, k);
      P.hookPacket(N.HC.ACCEPT_MAKECHAR, k);
      P.hookPacket(N.HC.REFUSE_MAKECHAR, f);
      P.hookPacket(N.HC.ACCEPT_DELETECHAR, n);
      P.hookPacket(N.HC.REFUSE_DELETECHAR, t);
      P.hookPacket(N.HC.NOTIFY_ZONESVR, q);
      P.hookPacket(N.HC.NOTIFY_ZONESVR2, q);
      P.hookPacket(N.HC.ACCEPT_ENTER_NEO_UNION_LIST, d);
      P.hookPacket(N.HC.NOTIFY_ACCESSIBLE_MAPNAME, h);
      P.hookPacket(N.HC.SECOND_PASSWD_LOGIN, v);
    }
    function c() {
      M("Engine/LoginEngine").reload();
    }
    function d(a) {
      a.sex = z.Sex;
      var b = new N.CZ.PING();
      b.AID = z.AID;
      P.setPing(function () {
        P.sendPacket(b);
      });
      setTimeout(function () {
        K.noMapsame = 1;
        K.clean();
        x.getComponent("WinLoading").remove();
        E.onExitRequest = c;
        E.onConnectRequest = m;
        E.onCreateRequest = g;
        E.onDeleteRequest = r;
        E.append();
        E.setInfo(a);
      }, 1e3);
    }
    function e(a) {
      var b = new N.CZ.PING();
      b.AID = z.AID;
      P.setPing(function () {
        P.sendPacket(b);
      });
      K.noMapsame = 1;
      K.clean();
      x.getComponent("WinLoading").remove();
      z.Character = a.entity;
    }
    function l(a) {
      x.showErrorBox(A.getMessage(3));
    }
    function h(a) {
      x.showMessageBox(A.getMessage(1811), null, function () {
        x.getComponent("WinLoading").remove();
        E.append();
      });
    }
    function r(a) {
      function b() {
        y.remove();
        e.remove();
        g.detach();
        D.clearTimeout(p);
        t({ ErrorCode: -2 });
      }
      function c(a) {
        f = a;
        y.remove();
        e.remove();
        e = x.showMessageBox(
          A.getMessage(296).replace("%d", 10),
          "cancel",
          function () {
            b();
          },
        );
        k = document.createElement("canvas");
        m = k.getContext("2d");
        n = k.width = 240;
        l = k.height = 15;
        k.style.marginTop = "10px";
        k.style.marginLeft = "20px";
        e.ui.append(k);
        h = Date.now() + 1e4;
        d();
      }
      function d() {
        var b = h - Date.now(),
          b = Math.round(100 - b / 100);
        100 <= b
          ? (e.remove(),
            g.detach(),
            (b = new N.CH.DELETE_CHAR()),
            (b.GID = a),
            (b.key = f),
            P.sendPacket(b))
          : (e.ui
              .find(".text")
              .text(A.getMessage(296).replace("%d", Math.round(10 - b / 10))),
            m.clearRect(0, 0, n, l),
            (m.fillStyle = "rgb(0,255,255)"),
            m.fillRect(0, 0, n, l),
            (m.fillStyle = "rgb(140,140,140)"),
            m.fillRect(1, 1, n - 2, l - 2),
            (m.fillStyle = "rgb(66,99,165)"),
            m.fillRect(2, 2, Math.round((b * (n - 4)) / 100), l - 4),
            (m.fillStyle = "rgb(255,255,0)"),
            m.fillText(b + "%", 0.5 * (n - m.measureText(b + "%").width), 12),
            (p = D.setTimeout(d, 30)));
      }
      var e, f, g, h, k, m, n, l, p;
      e = x.showPromptBox(
        A.getMessage(19),
        "ok",
        "cancel",
        function () {
          y.append();
          y.setType("mail", !0);
          y.ui.css("zIndex", 101);
          y.onSubmitRequest = c;
          e.append();
        },
        b,
      );
      g = u("\x3cdiv/\x3e").addClass("win_popup_overlay").appendTo("body");
    }
    function t(a) {
      E.deleteAnswer("undefined" === typeof a.ErrorCode ? -1 : a.ErrorCode);
    }
    function n(a) {
      E.deleteAnswer(-1);
    }
    function g(a) {
      W = a;
      E.remove();
      L.setAccountSex(z.Sex);
      L.onCharCreationRequest = p;
      L.onExitRequest = function () {
        L.remove();
        E.append();
      };
      L.append();
    }
    function p(a, b, c, d, e, f, g, h, k, m, n) {
      var l;
      20120307 > I.value
        ? ((l = new N.CH.MAKE_CHAR()),
          (l.Str = b),
          (l.Agi = c),
          (l.Vit = d),
          (l.Int = e),
          (l.Dex = f),
          (l.Luk = g))
        : 20150401 > I.value
          ? (l = new N.CH.MAKE_CHAR2())
          : ((l = new N.CH.MAKE_CHAR3()), (l.sex = m), (l.job = n));
      l.name = a;
      l.head = h;
      l.headPal = k;
      l.CharNum = W;
      P.sendPacket(l);
    }
    function k(a) {
      L.remove();
      E.addCharacter(a.charinfo);
      E.append();
    }
    function f(a) {
      switch (a.ErrorCode) {
        case 0:
          a = 10;
          break;
        case 1:
          a = 298;
          break;
        case 2:
          a = 1272;
          break;
        case 3:
          a = 1355;
          break;
        default:
        case 255:
          a = 11;
      }
      x.showMessageBox(A.getMessage(a), "ok");
    }
    function m(a) {
      B.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      E.remove();
      x.getComponent("WinLoading").append();
      z.Character = a;
      var b = new N.CH.SELECT_CHAR();
      b.CharNum = a.CharNum;
      P.sendPacket(b);
    }
    function q(a) {
      z.GID = a.GID;
      G.init(a.addr.ip, a.addr.port, a.mapName);
    }
    function v(a) {
      if (z.Character) return !1;
      F.ready = !1;
      if (localStorage.getItem("CdGId") == a.AID) return ((F.ready = !0), !1);
      F.remove();
      var b = a.state,
        c = 0;
      F.setData(a.pincode);
      F.onSubmitRequest = function (d, e) {
        F.remove();
        var f;
        if (1 == F.step) (F.append(), (F.step = 2), F.setType(3));
        else if (2 == F.step)
          ((f = new N.CH.CHANGE_PIN()),
            (f.AID = a.AID),
            (f.old_pinCode = d),
            (f.new_pinCode = e),
            P.sendPacket(f));
        else if (b)
          switch (c) {
            case 1:
              f = new N.CH.CHECK_PIN();
              f.AID = a.AID;
              f.pinCode = d;
              P.sendPacket(f);
              break;
            case 2:
            case 4:
              ((f = new N.CH.CREATE_NEW_PIN()),
                (f.AID = a.AID),
                (f.pinCode = d),
                P.sendPacket(f));
          }
      };
      F.onCancelRequest = function (a) {
        0 == F.step
          ? (F.remove(),
            u("#body-cover").removeClass("open"),
            M("Engine/LoginEngine").reload())
          : (F.remove(), F.append(), (F.step = 0), F.setType(1));
      };
      switch (b) {
        case 0:
        case 3:
          return (
            (c = 3),
            u("#body-cover").removeClass("open"),
            (F.step = 0),
            (F.ready = !0),
            localStorage.setItem("CdGId", a.AID),
            !1
          );
        case 1:
          c = 1;
          break;
        case 2:
        case 4:
          c = 2;
          break;
        case 5:
          x.showMessageBox(A.getMessage(1896), "ok");
          break;
        case 6:
          x.showMessageBox(A.getMessage(1897), "ok");
          break;
        case 7:
          u("#body-cover").removeClass("open");
          F.step = 0;
          F.ready = !0;
          localStorage.setItem("CdGId", a.AID);
          return;
        case 8:
          if (
            ((c = 1),
            x.showMessageBox("PIN\u7801\u4e0d\u6b63\u786e", "ok"),
            !F.CheckTry())
          )
            return (u("#body-cover").removeClass("open"), !1);
      }
      setTimeout(function () {
        u("#body-cover").addClass("open");
        F.append();
        F.setType(c);
      }, 1e3);
    }
    var u = a("Utils/jquery"),
      A = a("DB/DBManager"),
      D = a("Core/Events"),
      B = a("Audio/SoundManager"),
      H = a("Audio/BGM"),
      C = a("Renderer/Renderer"),
      z = a("Engine/SessionStorage"),
      G = a("Engine/MapEngine"),
      P = a("Network/NetworkManager"),
      N = a("Network/PacketStructure"),
      I = a("Network/PacketVerManager"),
      x = a("UI/UIManager"),
      J = a("UI/Background"),
      E = a("UI/Components/CharSelect/CharSelect"),
      L = a("UI/Components/CharCreate/CharCreate"),
      y = a("UI/Components/InputBox/InputBox"),
      F = a("UI/Components/PincodeBox/PincodeBox"),
      K = a("UI/Components/vbk/vbk"),
      M = a,
      Q = null,
      W = 0;
    return {
      init: b,
      reload: function () {
        P.close();
        J.reload(function () {
          x.removeComponents();
          C.remove();
          x.getComponent("WinLoading").append();
          u("#header").show();
          b(Q);
        });
      },
    };
  },
);
