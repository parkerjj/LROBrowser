define(
  "Engine/MapEngine/NPC",
  "require Utils/jquery DB/DBManager Audio/SoundManager Audio/BGM Core/Client Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/Renderer Preferences/Controls UI/Components/NpcBox/NpcBox UI/Components/InputBox/InputBox UI/Components/NpcMenu/NpcMenu UI/Components/WinPopup/WinPopup UI/Components/MiniMap/MiniMap UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      N.append();
      N.setText(a.msg, a.NAID);
    }
    function c(a) {
      N.append();
      N.addNext(a.NAID);
    }
    function d(a) {
      setTimeout(function () {
        N.ui && N.ui.is(":visible") && N.addClose(a.NAID);
      }, 20);
    }
    function e(a) {
      N.ownerID === a.NAID &&
        (N.remove(),
        I.remove(),
        (a = document.getElementById("cutin")) &&
          a.parentNode &&
          document.body.removeChild(a));
    }
    function m(a) {
      0 == a.infoType
        ? E.addText(u.getMessage(1223), E.TYPE.ERROR)
        : 1 == a.infoType
          ? K.addBossMark(a.xPos, a.yPos)
          : 3 == a.infoType &&
            E.addText(
              "Boss\u7ea7\u9b54\u7269 '" +
                a.name +
                "'\u8ddd\u79bb\u590d\u6d3b\u8fd8\u6709 " +
                a.minHour +
                "\u5c0f\u65f6:" +
                a.minMinute +
                "\u5206",
              E.TYPE.PUBLIC,
            );
    }
    function h(a) {
      I.append();
      I.setMenu(a.msg, a.NAID);
      I.onSelectMenu = function (a, b) {
        I.remove();
        255 === b && N.remove();
        var c = new D.CZ.CHOOSE_MENU();
        c.NAID = a;
        c.num = b;
        J.sendPacket(c);
      };
    }
    function t(a) {
      var b = a instanceof D.ZC.OPEN_EDITDLGSTR ? "text" : "number",
        c = a.NAID;
      O.onAppend = function () {
        O.setType(b, !0);
      };
      O.onSubmitRequest = function (a) {
        O.remove();
        var d;
        switch (b) {
          case "text":
            d = new D.CZ.INPUT_EDITDLGSTR();
            d.msg = a;
            break;
          default:
          case "number":
            ((d = new D.CZ.INPUT_EDITDLG()), (d.value = a));
        }
        d.NAID = c;
        J.sendPacket(d);
      };
      O.append();
    }
    function r(a) {
      var b = x.clone("WinDeal"),
        c = a.NAID;
      b.init = function () {
        this.draggable();
        this.ui.find(".text").text(u.getMessage(92));
        this.ui.css({
          top: y.height / 1.5,
          left: (y.width - 280) / 2,
          zIndex: 100,
        });
        this.ui.find(".btns").append(
          q("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_buy.bmp")
            .data("hover", "btn_buy_a.bmp")
            .data("down", "btn_buy_b.bmp")
            .one("click", function () {
              b.remove();
              var a = new D.CZ.ACK_SELECT_DEALTYPE();
              a.type = 0;
              a.NAID = c;
              J.sendPacket(a);
            })
            .each(this.parseHTML),
          q("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_sell.bmp")
            .data("hover", "btn_sell_a.bmp")
            .data("down", "btn_sell_b.bmp")
            .one("click", function () {
              b.remove();
              var a = new D.CZ.ACK_SELECT_DEALTYPE();
              a.type = 1;
              a.NAID = c;
              J.sendPacket(a);
            })
            .each(this.parseHTML),
          q("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_cancel.bmp")
            .data("hover", "btn_cancel_a.bmp")
            .data("down", "btn_cancel_b.bmp")
            .one("click", function () {
              b.remove();
            })
            .each(this.parseHTML),
        );
      };
      b.onAppend = function () {
        H.talk = !0;
      };
      b.onRemove = function () {
        H.talk = !1;
      };
      b.append();
    }
    function n(a) {
      var b = document.getElementById("cutin");
      b && document.body.removeChild(b);
      a.imageName.length &&
        (-1 === a.imageName.indexOf(".") && (a.imageName += ".bmp"),
        (b = new Image()),
        (b.style.position = "absolute"),
        (b.style.zIndex = 40),
        (b.id = "cutin"),
        (b.draggable = !1),
        document.body.appendChild(b),
        C.loadFile(u.INTERFACE_PATH + "illust/" + a.imageName, function (b) {
          if (N.ui || N.ui.is(":visible")) {
            var c = document.getElementById("cutin");
            c.src = b;
            c.style.display = "none";
            switch (a.type) {
              case 0:
                c.style.bottom = "0px";
                c.style.left = "0px";
                break;
              case 1:
                c.style.bottom = "0px";
                c.style.left = "50%";
                c.style.marginLeft = "-" + Math.floor(c.width / 2) + "px";
                break;
              case 2:
                c.style.bottom = "0px";
                c.style.right = "0px";
                break;
              case 3:
              case 4:
                ((c.style.top = "50%"),
                  (c.style.left = "50%"),
                  (c.style.marginLeft = "-" + Math.floor(c.width / 2) + "px"),
                  (c.style.marginTop = "-" + Math.floor(c.height / 2) + "px"));
            }
          }
        }));
    }
    function g(a) {
      switch (a.type) {
        case 0:
          K.addNpcMark(a.id, a.xPos, a.yPos, a.color, 15e3);
          break;
        case 1:
          K.addNpcMark(a.id, a.xPos, a.yPos, a.color, Infinity);
          break;
        case 2:
          K.removeNpcMark(a.id);
      }
    }
    function p(a) {
      B.Entity.cast.onComplete = function () {
        var a = new D.CZ.PROGRESS();
        J.sendPacket(a);
      };
      var b =
        "rgb(" +
        [
          (a.color & 16711680) >> 16,
          (a.color & 65280) >> 8,
          a.color & 255,
        ].join() +
        ")";
      B.Entity.cast.set(1e3 * a.time, a.color ? b : null);
    }
    function l() {
      B.Entity.cast.remove();
      var a = new D.CZ.PROGRESS();
      J.sendPacket(a);
    }
    function f(a) {
      switch (a.act) {
        case 0:
        case 1:
          v.play(a.fileName);
          break;
        case 2:
          v.stop(a.fileName);
      }
    }
    function k(a) {
      a.Bgm.match(/\.mp3$/i) || (a.Bgm += ".mp3");
      A.play(a.Bgm);
    }
    var q = a("Utils/jquery"),
      u = a("DB/DBManager"),
      v = a("Audio/SoundManager"),
      A = a("Audio/BGM"),
      C = a("Core/Client"),
      B = a("Engine/SessionStorage"),
      J = a("Network/NetworkManager"),
      D = a("Network/PacketStructure"),
      y = a("Renderer/Renderer"),
      H = a("Preferences/Controls"),
      N = a("UI/Components/NpcBox/NpcBox"),
      O = a("UI/Components/InputBox/InputBox"),
      I = a("UI/Components/NpcMenu/NpcMenu"),
      x = a("UI/Components/WinPopup/WinPopup"),
      K = a("UI/Components/MiniMap/MiniMap"),
      E = a("UI/Components/ChatBox/ChatBox");
    N.onNextPressed = function (a) {
      var b = new D.CZ.REQ_NEXT_SCRIPT();
      b.NAID = a;
      J.sendPacket(b);
    };
    N.onClosePressed = function (a) {
      var b = new D.CZ.CLOSE_DIALOG();
      b.NAID = a;
      J.sendPacket(b);
      N.remove();
    };
    return function () {
      J.hookPacket(D.ZC.SAY_DIALOG, b);
      J.hookPacket(D.ZC.WAIT_DIALOG, c);
      J.hookPacket(D.ZC.CLOSE_DIALOG, d);
      J.hookPacket(D.ZC.OPEN_EDITDLG, t);
      J.hookPacket(D.ZC.OPEN_EDITDLGSTR, t);
      J.hookPacket(D.ZC.MENU_LIST, h);
      J.hookPacket(D.ZC.SELECT_DEALTYPE, r);
      J.hookPacket(D.ZC.SHOW_IMAGE, n);
      J.hookPacket(D.ZC.SHOW_IMAGE2, n);
      J.hookPacket(D.ZC.COMPASS, g);
      J.hookPacket(D.ZC.PROGRESS, p);
      J.hookPacket(D.ZC.PROGRESS_CANCEL, l);
      J.hookPacket(D.ZC.SOUND, f);
      J.hookPacket(D.ZC.PLAY_NPC_BGM, k);
      J.hookPacket(D.ZC.CLOSE_SCRIPT, e);
      J.hookPacket(D.ZC.BOSS_INFO, m);
    };
  },
);
