define(
  "Engine/CharEngine",
  "require Utils/jquery DB/DBManager Core/Events Audio/SoundManager Audio/BGM Renderer/Renderer Engine/SessionStorage Engine/MapEngine Network/NetworkManager Network/PacketStructure Network/PacketVerManager UI/UIManager UI/Background UI/Components/CharSelect/CharSelect UI/Components/CharCreate/CharCreate UI/Components/InputBox/InputBox UI/Components/PincodeBox/PincodeBox UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a) {
    function b(a) {
      J.play("01.mp3");
      Q = a;
      N.connect(N.utils.longToIP(a.ip), a.port, function (a) {
        a
          ? ((a = new O.CH.ENTER()),
            (a.AID = y.AID),
            (a.AuthCode = y.AuthCode),
            (a.userLevel = y.UserLevel),
            (a.Sex = y.Sex),
            (a.clientType = y.LangType),
            N.sendPacket(a),
            N.read(function (a) {
              y.AID = a.readLong();
            }))
          : x.showErrorBox(A.getMessage(1));
      });
      N.hookPacket(O.HC.ACCEPT_ENTER_NEO_UNION, d);
      N.hookPacket(O.HC.ACCEPT_ENTER_NEO_UNION2, d);
      N.hookPacket(O.HC.ACCEPT_ENTER2, e);
      N.hookPacket(O.HC.REFUSE_ENTER, m);
      N.hookPacket(O.HC.ACCEPT_MAKECHAR_NEO_UNION, l);
      N.hookPacket(O.HC.ACCEPT_MAKECHAR, l);
      N.hookPacket(O.HC.REFUSE_MAKECHAR, f);
      N.hookPacket(O.HC.ACCEPT_DELETECHAR, n);
      N.hookPacket(O.HC.REFUSE_DELETECHAR, r);
      N.hookPacket(O.HC.NOTIFY_ZONESVR, q);
      N.hookPacket(O.HC.NOTIFY_ZONESVR2, q);
      N.hookPacket(O.HC.ACCEPT_ENTER_NEO_UNION_LIST, d);
      N.hookPacket(O.HC.NOTIFY_ACCESSIBLE_MAPNAME, h);
      N.hookPacket(O.HC.SECOND_PASSWD_LOGIN, u);
    }
    function c() {
      M("Engine/LoginEngine").reload();
    }
    function d(a) {
      a.sex = y.Sex;
      var b = new O.CZ.PING();
      b.AID = y.AID;
      N.setPing(function () {
        N.sendPacket(b);
      });
      setTimeout(function () {
        L.noMapsame = 1;
        L.clean();
        x.getComponent("WinLoading").remove();
        E.onExitRequest = c;
        E.onConnectRequest = k;
        E.onCreateRequest = g;
        E.onDeleteRequest = t;
        E.append();
        E.setInfo(a);
      }, 1e3);
    }
    function e(a) {
      var b = new O.CZ.PING();
      b.AID = y.AID;
      N.setPing(function () {
        N.sendPacket(b);
      });
      L.noMapsame = 1;
      L.clean();
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
    function t(a) {
      function b() {
        z.remove();
        e.remove();
        g.detach();
        C.clearTimeout(n);
        r({ ErrorCode: -2 });
      }
      function c(a) {
        f = a;
        z.remove();
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
        m = k.width = 240;
        p = k.height = 15;
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
            (b = new O.CH.DELETE_CHAR()),
            (b.GID = a),
            (b.key = f),
            N.sendPacket(b))
          : (e.ui
              .find(".text")
              .text(A.getMessage(296).replace("%d", Math.round(10 - b / 10))),
            l.clearRect(0, 0, m, p),
            (l.fillStyle = "rgb(0,255,255)"),
            l.fillRect(0, 0, m, p),
            (l.fillStyle = "rgb(140,140,140)"),
            l.fillRect(1, 1, m - 2, p - 2),
            (l.fillStyle = "rgb(66,99,165)"),
            l.fillRect(2, 2, Math.round((b * (m - 4)) / 100), p - 4),
            (l.fillStyle = "rgb(255,255,0)"),
            l.fillText(b + "%", 0.5 * (m - l.measureText(b + "%").width), 12),
            (n = C.setTimeout(d, 30)));
      }
      var e, f, g, h, k, l, m, p, n;
      e = x.showPromptBox(
        A.getMessage(19),
        "ok",
        "cancel",
        function () {
          z.append();
          z.setType("mail", !0);
          z.ui.css("zIndex", 101);
          z.onSubmitRequest = c;
          e.append();
        },
        b,
      );
      g = v("\x3cdiv/\x3e").addClass("win_popup_overlay").appendTo("body");
    }
    function r(a) {
      E.deleteAnswer("undefined" === typeof a.ErrorCode ? -1 : a.ErrorCode);
    }
    function n(a) {
      E.deleteAnswer(-1);
    }
    function g(a) {
      V = a;
      E.remove();
      F.setAccountSex(y.Sex);
      F.onCharCreationRequest = p;
      F.onExitRequest = function () {
        F.remove();
        E.append();
      };
      F.append();
    }
    function p(a, b, c, d, e, f, g, h, k, l, m) {
      var p;
      20120307 > I.value
        ? ((p = new O.CH.MAKE_CHAR()),
          (p.Str = b),
          (p.Agi = c),
          (p.Vit = d),
          (p.Int = e),
          (p.Dex = f),
          (p.Luk = g))
        : 20150401 > I.value
          ? (p = new O.CH.MAKE_CHAR2())
          : ((p = new O.CH.MAKE_CHAR3()), (p.sex = l), (p.job = m));
      p.name = a;
      p.head = h;
      p.headPal = k;
      p.CharNum = V;
      N.sendPacket(p);
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
    function k(a) {
      B.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      E.remove();
      x.getComponent("WinLoading").append();
      y.Character = a;
      var b = new O.CH.SELECT_CHAR();
      b.CharNum = a.CharNum;
      N.sendPacket(b);
    }
    function q(a) {
      y.GID = a.GID;
      H.init(a.addr.ip, a.addr.port, a.mapName);
    }
    function u(a) {
      if (y.Character) return !1;
      G.ready = !1;
      if (localStorage.getItem("CdGId") == a.AID) return ((G.ready = !0), !1);
      G.remove();
      var b = a.state,
        c = 0;
      G.setData(a.pincode);
      G.onSubmitRequest = function (d, e) {
        G.remove();
        var f;
        if (1 == G.step) (G.append(), (G.step = 2), G.setType(3));
        else if (2 == G.step)
          ((f = new O.CH.CHANGE_PIN()),
            (f.AID = a.AID),
            (f.old_pinCode = d),
            (f.new_pinCode = e),
            N.sendPacket(f));
        else if (b)
          switch (c) {
            case 1:
              f = new O.CH.CHECK_PIN();
              f.AID = a.AID;
              f.pinCode = d;
              N.sendPacket(f);
              break;
            case 2:
            case 4:
              ((f = new O.CH.CREATE_NEW_PIN()),
                (f.AID = a.AID),
                (f.pinCode = d),
                N.sendPacket(f));
          }
      };
      G.onCancelRequest = function (a) {
        0 == G.step
          ? (G.remove(),
            v("#body-cover").removeClass("open"),
            M("Engine/LoginEngine").reload())
          : (G.remove(), G.append(), (G.step = 0), G.setType(1));
      };
      switch (b) {
        case 0:
        case 3:
          return (
            (c = 3),
            v("#body-cover").removeClass("open"),
            (G.step = 0),
            (G.ready = !0),
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
          v("#body-cover").removeClass("open");
          G.step = 0;
          G.ready = !0;
          localStorage.setItem("CdGId", a.AID);
          return;
        case 8:
          if (
            ((c = 1),
            x.showMessageBox("PIN\u7801\u4e0d\u6b63\u786e", "ok"),
            !G.CheckTry())
          )
            return (v("#body-cover").removeClass("open"), !1);
      }
      setTimeout(function () {
        v("#body-cover").addClass("open");
        G.append();
        G.setType(c);
      }, 1e3);
    }
    var v = a("Utils/jquery"),
      A = a("DB/DBManager"),
      C = a("Core/Events"),
      B = a("Audio/SoundManager"),
      J = a("Audio/BGM"),
      D = a("Renderer/Renderer"),
      y = a("Engine/SessionStorage"),
      H = a("Engine/MapEngine"),
      N = a("Network/NetworkManager"),
      O = a("Network/PacketStructure"),
      I = a("Network/PacketVerManager"),
      x = a("UI/UIManager"),
      K = a("UI/Background"),
      E = a("UI/Components/CharSelect/CharSelect"),
      F = a("UI/Components/CharCreate/CharCreate"),
      z = a("UI/Components/InputBox/InputBox"),
      G = a("UI/Components/PincodeBox/PincodeBox"),
      L = a("UI/Components/vbk/vbk"),
      M = a,
      Q = null,
      V = 0;
    return {
      init: b,
      reload: function () {
        N.close();
        K.reload(function () {
          x.removeComponents();
          D.remove();
          x.getComponent("WinLoading").append();
          v("#header").show();
          b(Q);
        });
      },
    };
  },
);
