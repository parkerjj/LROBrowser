define(
  "Engine/CharEngine",
  "require Utils/jquery DB/DBManager Core/Events Audio/SoundManager Audio/BGM Renderer/Renderer Engine/SessionStorage Engine/MapEngine Network/NetworkManager Network/PacketStructure Network/PacketVerManager UI/UIManager UI/Background UI/Components/CharSelect/CharSelect UI/Components/CharCreate/CharCreate UI/Components/InputBox/InputBox UI/Components/PincodeBox/PincodeBox UI/Components/vbk/vbk".split(
    " ",
  ),
  function (a) {
    function b(a) {
      J.play("01.mp3");
      Q = a;
      O.connect(O.utils.longToIP(a.ip), a.port, function (a) {
        a
          ? ((a = new M.CH.ENTER()),
            (a.AID = B.AID),
            (a.AuthCode = B.AuthCode),
            (a.userLevel = B.UserLevel),
            (a.Sex = B.Sex),
            (a.clientType = B.LangType),
            O.sendPacket(a),
            O.read(function (a) {
              B.AID = a.readLong();
            }))
          : x.showErrorBox(z.getMessage(1));
      });
      O.hookPacket(M.HC.ACCEPT_ENTER_NEO_UNION, d);
      O.hookPacket(M.HC.ACCEPT_ENTER_NEO_UNION2, d);
      O.hookPacket(M.HC.ACCEPT_ENTER2, e);
      O.hookPacket(M.HC.REFUSE_ENTER, m);
      O.hookPacket(M.HC.ACCEPT_MAKECHAR_NEO_UNION, l);
      O.hookPacket(M.HC.ACCEPT_MAKECHAR, l);
      O.hookPacket(M.HC.REFUSE_MAKECHAR, f);
      O.hookPacket(M.HC.ACCEPT_DELETECHAR, k);
      O.hookPacket(M.HC.REFUSE_DELETECHAR, r);
      O.hookPacket(M.HC.NOTIFY_ZONESVR, p);
      O.hookPacket(M.HC.NOTIFY_ZONESVR2, p);
      O.hookPacket(M.HC.ACCEPT_ENTER_NEO_UNION_LIST, d);
      O.hookPacket(M.HC.NOTIFY_ACCESSIBLE_MAPNAME, h);
      O.hookPacket(M.HC.SECOND_PASSWD_LOGIN, v);
    }
    function c() {
      N("Engine/LoginEngine").reload();
    }
    function d(a) {
      a.sex = B.Sex;
      var b = new M.CZ.PING();
      b.AID = B.AID;
      O.setPing(function () {
        O.sendPacket(b);
      });
      setTimeout(function () {
        K.noMapsame = 1;
        K.clean();
        x.getComponent("WinLoading").remove();
        D.onExitRequest = c;
        D.onConnectRequest = n;
        D.onCreateRequest = g;
        D.onDeleteRequest = q;
        D.append();
        D.setInfo(a);
      }, 1e3);
    }
    function e(a) {
      var b = new M.CZ.PING();
      b.AID = B.AID;
      O.setPing(function () {
        O.sendPacket(b);
      });
      K.noMapsame = 1;
      K.clean();
      x.getComponent("WinLoading").remove();
      B.Character = a.entity;
    }
    function m(a) {
      x.showErrorBox(z.getMessage(3));
    }
    function h(a) {
      x.showMessageBox(z.getMessage(1811), null, function () {
        x.getComponent("WinLoading").remove();
        D.append();
      });
    }
    function q(a) {
      function b() {
        y.remove();
        e.remove();
        g.detach();
        E.clearTimeout(p);
        r({ ErrorCode: -2 });
      }
      function c(a) {
        f = a;
        y.remove();
        e.remove();
        e = x.showMessageBox(
          z.getMessage(296).replace("%d", 10),
          "cancel",
          function () {
            b();
          },
        );
        l = document.createElement("canvas");
        n = l.getContext("2d");
        k = l.width = 240;
        m = l.height = 15;
        l.style.marginTop = "10px";
        l.style.marginLeft = "20px";
        e.ui.append(l);
        h = Date.now() + 1e4;
        d();
      }
      function d() {
        var b = h - Date.now(),
          b = Math.round(100 - b / 100);
        100 <= b
          ? (e.remove(),
            g.detach(),
            (b = new M.CH.DELETE_CHAR()),
            (b.GID = a),
            (b.key = f),
            O.sendPacket(b))
          : (e.ui
              .find(".text")
              .text(z.getMessage(296).replace("%d", Math.round(10 - b / 10))),
            n.clearRect(0, 0, k, m),
            (n.fillStyle = "rgb(0,255,255)"),
            n.fillRect(0, 0, k, m),
            (n.fillStyle = "rgb(140,140,140)"),
            n.fillRect(1, 1, k - 2, m - 2),
            (n.fillStyle = "rgb(66,99,165)"),
            n.fillRect(2, 2, Math.round((b * (k - 4)) / 100), m - 4),
            (n.fillStyle = "rgb(255,255,0)"),
            n.fillText(b + "%", 0.5 * (k - n.measureText(b + "%").width), 12),
            (p = E.setTimeout(d, 30)));
      }
      var e, f, g, h, l, n, k, m, p;
      e = x.showPromptBox(
        z.getMessage(19),
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
      g = t("\x3cdiv/\x3e").addClass("win_popup_overlay").appendTo("body");
    }
    function r(a) {
      D.deleteAnswer("undefined" === typeof a.ErrorCode ? -1 : a.ErrorCode);
    }
    function k(a) {
      D.deleteAnswer(-1);
    }
    function g(a) {
      W = a;
      D.remove();
      L.setAccountSex(B.Sex);
      L.onCharCreationRequest = u;
      L.onExitRequest = function () {
        L.remove();
        D.append();
      };
      L.append();
    }
    function u(a, b, c, d, e, f, g, h, l, n, k) {
      var m;
      20120307 > H.value
        ? ((m = new M.CH.MAKE_CHAR()),
          (m.Str = b),
          (m.Agi = c),
          (m.Vit = d),
          (m.Int = e),
          (m.Dex = f),
          (m.Luk = g))
        : 20150401 > H.value
          ? (m = new M.CH.MAKE_CHAR2())
          : ((m = new M.CH.MAKE_CHAR3()), (m.sex = n), (m.job = k));
      m.name = a;
      m.head = h;
      m.headPal = l;
      m.CharNum = W;
      O.sendPacket(m);
    }
    function l(a) {
      L.remove();
      D.addCharacter(a.charinfo);
      D.append();
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
      x.showMessageBox(z.getMessage(a), "ok");
    }
    function n(a) {
      C.play("\u00b9\u00f6\u00c6\u00b0\u00bc\u00d2\u00b8\u00ae.wav");
      D.remove();
      x.getComponent("WinLoading").append();
      B.Character = a;
      var b = new M.CH.SELECT_CHAR();
      b.CharNum = a.CharNum;
      O.sendPacket(b);
    }
    function p(a) {
      B.GID = a.GID;
      F.init(a.addr.ip, a.addr.port, a.mapName);
    }
    function v(a) {
      if (B.Character) return !1;
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
          ((f = new M.CH.CHANGE_PIN()),
            (f.AID = a.AID),
            (f.old_pinCode = d),
            (f.new_pinCode = e),
            O.sendPacket(f));
        else if (b)
          switch (c) {
            case 1:
              f = new M.CH.CHECK_PIN();
              f.AID = a.AID;
              f.pinCode = d;
              O.sendPacket(f);
              break;
            case 2:
            case 4:
              ((f = new M.CH.CREATE_NEW_PIN()),
                (f.AID = a.AID),
                (f.pinCode = d),
                O.sendPacket(f));
          }
      };
      G.onCancelRequest = function (a) {
        0 == G.step
          ? (G.remove(),
            t("#body-cover").removeClass("open"),
            N("Engine/LoginEngine").reload())
          : (G.remove(), G.append(), (G.step = 0), G.setType(1));
      };
      switch (b) {
        case 0:
        case 3:
          return (
            (c = 3),
            t("#body-cover").removeClass("open"),
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
          x.showMessageBox(z.getMessage(1896), "ok");
          break;
        case 6:
          x.showMessageBox(z.getMessage(1897), "ok");
          break;
        case 7:
          t("#body-cover").removeClass("open");
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
            return (t("#body-cover").removeClass("open"), !1);
      }
      setTimeout(function () {
        t("#body-cover").addClass("open");
        G.append();
        G.setType(c);
      }, 1e3);
    }
    var t = a("Utils/jquery"),
      z = a("DB/DBManager"),
      E = a("Core/Events"),
      C = a("Audio/SoundManager"),
      J = a("Audio/BGM"),
      A = a("Renderer/Renderer"),
      B = a("Engine/SessionStorage"),
      F = a("Engine/MapEngine"),
      O = a("Network/NetworkManager"),
      M = a("Network/PacketStructure"),
      H = a("Network/PacketVerManager"),
      x = a("UI/UIManager"),
      I = a("UI/Background"),
      D = a("UI/Components/CharSelect/CharSelect"),
      L = a("UI/Components/CharCreate/CharCreate"),
      y = a("UI/Components/InputBox/InputBox"),
      G = a("UI/Components/PincodeBox/PincodeBox"),
      K = a("UI/Components/vbk/vbk"),
      N = a,
      Q = null,
      W = 0;
    return {
      init: b,
      reload: function () {
        O.close();
        I.reload(function () {
          x.removeComponents();
          A.remove();
          x.getComponent("WinLoading").append();
          t("#header").show();
          b(Q);
        });
      },
    };
  },
);
