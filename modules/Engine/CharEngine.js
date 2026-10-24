define(
  "Engine/CharEngine",
  "require Utils/jquery DB/DBManager Core/Events Audio/SoundManager Audio/BGM Renderer/Renderer Engine/SessionStorage Engine/MapEngine Network/NetworkManager Network/PacketStructure Network/PacketVerManager UI/UIManager UI/Background UI/Components/CharSelect/CharSelect UI/Components/CharCreate/CharCreate UI/Components/InputBox/InputBox UI/Components/PincodeBox/PincodeBox UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a) {
    function b(a) {
      O.play("01.mp3");
      N = a;
      J.connect(J.utils.longToIP(a.ip), a.port, function (a) {
        a
          ? ((a = new I.CH.ENTER()),
            (a.AID = y.AID),
            (a.AuthCode = y.AuthCode),
            (a.userLevel = y.UserLevel),
            (a.Sex = y.Sex),
            (a.clientType = y.LangType),
            J.sendPacket(a),
            J.read(function (a) {
              y.AID = a.readLong();
            }))
          : x.showErrorBox(A.getMessage(1));
      });
      J.hookPacket(I.HC.ACCEPT_ENTER_NEO_UNION, d);
      J.hookPacket(I.HC.ACCEPT_ENTER_NEO_UNION2, d);
      J.hookPacket(I.HC.ACCEPT_ENTER2, e);
      J.hookPacket(I.HC.REFUSE_ENTER, m);
      J.hookPacket(I.HC.ACCEPT_MAKECHAR_NEO_UNION, l);
      J.hookPacket(I.HC.ACCEPT_MAKECHAR, l);
      J.hookPacket(I.HC.REFUSE_MAKECHAR, f);
      J.hookPacket(I.HC.ACCEPT_DELETECHAR, k);
      J.hookPacket(I.HC.REFUSE_DELETECHAR, q);
      J.hookPacket(I.HC.NOTIFY_ZONESVR, p);
      J.hookPacket(I.HC.NOTIFY_ZONESVR2, p);
      J.hookPacket(I.HC.ACCEPT_ENTER_NEO_UNION_LIST, d);
      J.hookPacket(I.HC.NOTIFY_ACCESSIBLE_MAPNAME, h);
      J.hookPacket(I.HC.SECOND_PASSWD_LOGIN, v);
    }
    function c() {
      P("Engine/LoginEngine").reload();
    }
    function d(a) {
      a.sex = y.Sex;
      var b = new I.CZ.PING();
      b.AID = y.AID;
      J.setPing(function () {
        J.sendPacket(b);
      });
      setTimeout(function () {
        K.noMapsame = 1;
        K.clean();
        x.getComponent("WinLoading").remove();
        E.onExitRequest = c;
        E.onConnectRequest = n;
        E.onCreateRequest = g;
        E.onDeleteRequest = r;
        E.append();
        E.setInfo(a);
      }, 1e3);
    }
    function e(a) {
      var b = new I.CZ.PING();
      b.AID = y.AID;
      J.setPing(function () {
        J.sendPacket(b);
      });
      K.noMapsame = 1;
      K.clean();
      x.getComponent("WinLoading").remove();
      y.Character = a.entity;
    }
    function m(a) {
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
        G.remove();
        e.remove();
        g.detach();
        D.clearTimeout(p);
        q({ ErrorCode: -2 });
      }
      function c(a) {
        f = a;
        G.remove();
        e.remove();
        e = x.showMessageBox(
          A.getMessage(296).replace("%d", 10),
          "cancel",
          function () {
            b();
          },
        );
        k = document.createElement("canvas");
        l = k.getContext("2d");
        n = k.width = 240;
        m = k.height = 15;
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
            (b = new I.CH.DELETE_CHAR()),
            (b.GID = a),
            (b.key = f),
            J.sendPacket(b))
          : (e.ui
              .find(".text")
              .text(A.getMessage(296).replace("%d", Math.round(10 - b / 10))),
            l.clearRect(0, 0, n, m),
            (l.fillStyle = "rgb(0,255,255)"),
            l.fillRect(0, 0, n, m),
            (l.fillStyle = "rgb(140,140,140)"),
            l.fillRect(1, 1, n - 2, m - 2),
            (l.fillStyle = "rgb(66,99,165)"),
            l.fillRect(2, 2, Math.round((b * (n - 4)) / 100), m - 4),
            (l.fillStyle = "rgb(255,255,0)"),
            l.fillText(b + "%", 0.5 * (n - l.measureText(b + "%").width), 12),
            (p = D.setTimeout(d, 30)));
      }
      var e, f, g, h, k, l, n, m, p;
      e = x.showPromptBox(
        A.getMessage(19),
        "ok",
        "cancel",
        function () {
          G.append();
          G.setType("mail", !0);
          G.ui.css("zIndex", 101);
          G.onSubmitRequest = c;
          e.append();
        },
        b,
      );
      g = u("\x3cdiv/\x3e").addClass("win_popup_overlay").appendTo("body");
    }
    function q(a) {
      E.deleteAnswer("undefined" === typeof a.ErrorCode ? -1 : a.ErrorCode);
    }
    function k(a) {
      E.deleteAnswer(-1);
    }
    function g(a) {
      S = a;
      E.remove();
      F.setAccountSex(y.Sex);
      F.onCharCreationRequest = t;
      F.onExitRequest = function () {
        F.remove();
        E.append();
      };
      F.append();
    }
    function t(a, b, c, d, e, f, g, h, k, l, n) {
      var m;
      20120307 > L.value
        ? ((m = new I.CH.MAKE_CHAR()),
          (m.Str = b),
          (m.Agi = c),
          (m.Vit = d),
          (m.Int = e),
          (m.Dex = f),
          (m.Luk = g))
        : 20150401 > L.value
          ? (m = new I.CH.MAKE_CHAR2())
          : ((m = new I.CH.MAKE_CHAR3()), (m.sex = l), (m.job = n));
      m.name = a;
      m.head = h;
      m.headPal = k;
      m.CharNum = S;
      J.sendPacket(m);
    }
    function l(a) {
      F.remove();
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
    function n(a) {
      B.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      E.remove();
      x.getComponent("WinLoading").append();
      y.Character = a;
      var b = new I.CH.SELECT_CHAR();
      b.CharNum = a.CharNum;
      J.sendPacket(b);
    }
    function p(a) {
      y.GID = a.GID;
      z.init(a.addr.ip, a.addr.port, a.mapName);
    }
    function v(a) {
      if (y.Character) return !1;
      H.ready = !1;
      if (localStorage.getItem("CdGId") == a.AID) return ((H.ready = !0), !1);
      H.remove();
      var b = a.state,
        c = 0;
      H.setData(a.pincode);
      H.onSubmitRequest = function (d, e) {
        H.remove();
        var f;
        if (1 == H.step) (H.append(), (H.step = 2), H.setType(3));
        else if (2 == H.step)
          ((f = new I.CH.CHANGE_PIN()),
            (f.AID = a.AID),
            (f.old_pinCode = d),
            (f.new_pinCode = e),
            J.sendPacket(f));
        else if (b)
          switch (c) {
            case 1:
              f = new I.CH.CHECK_PIN();
              f.AID = a.AID;
              f.pinCode = d;
              J.sendPacket(f);
              break;
            case 2:
            case 4:
              ((f = new I.CH.CREATE_NEW_PIN()),
                (f.AID = a.AID),
                (f.pinCode = d),
                J.sendPacket(f));
          }
      };
      H.onCancelRequest = function (a) {
        0 == H.step
          ? (H.remove(),
            u("#body-cover").removeClass("open"),
            P("Engine/LoginEngine").reload())
          : (H.remove(), H.append(), (H.step = 0), H.setType(1));
      };
      switch (b) {
        case 0:
        case 3:
          return (
            (c = 3),
            u("#body-cover").removeClass("open"),
            (H.step = 0),
            (H.ready = !0),
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
          H.step = 0;
          H.ready = !0;
          localStorage.setItem("CdGId", a.AID);
          return;
        case 8:
          if (
            ((c = 1),
            x.showMessageBox("PIN\u7801\u4e0d\u6b63\u786e", "ok"),
            !H.CheckTry())
          )
            return (u("#body-cover").removeClass("open"), !1);
      }
      setTimeout(function () {
        u("#body-cover").addClass("open");
        H.append();
        H.setType(c);
      }, 1e3);
    }
    var u = a("Utils/jquery"),
      A = a("DB/DBManager"),
      D = a("Core/Events"),
      B = a("Audio/SoundManager"),
      O = a("Audio/BGM"),
      C = a("Renderer/Renderer"),
      y = a("Engine/SessionStorage"),
      z = a("Engine/MapEngine"),
      J = a("Network/NetworkManager"),
      I = a("Network/PacketStructure"),
      L = a("Network/PacketVerManager"),
      x = a("UI/UIManager"),
      M = a("UI/Background"),
      E = a("UI/Components/CharSelect/CharSelect"),
      F = a("UI/Components/CharCreate/CharCreate"),
      G = a("UI/Components/InputBox/InputBox"),
      H = a("UI/Components/PincodeBox/PincodeBox"),
      K = a("UI/Components/vbk/vbk"),
      P = a,
      N = null,
      S = 0;
    return {
      init: b,
      reload: function () {
        J.close();
        M.reload(function () {
          x.removeComponents();
          C.remove();
          x.getComponent("WinLoading").append();
          u("#header").show();
          b(N);
        });
      },
    };
  },
);
