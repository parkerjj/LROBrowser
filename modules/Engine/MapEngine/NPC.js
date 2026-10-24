define(
  "Engine/MapEngine/NPC",
  "require Utils/jquery DB/DBManager Audio/SoundManager Audio/BGM Core/Client Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/Renderer Preferences/Controls UI/Components/NpcBox/NpcBox UI/Components/InputBox/InputBox UI/Components/NpcMenu/NpcMenu UI/Components/WinPopup/WinPopup UI/Components/MiniMap/MiniMap UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      J.append();
      J.setText(a.msg, a.NAID);
    }
    function c(a) {
      J.append();
      J.addNext(a.NAID);
    }
    function d(a) {
      setTimeout(function () {
        J.ui && J.ui.is(":visible") && J.addClose(a.NAID);
      }, 20);
    }
    function e(a) {
      J.ownerID === a.NAID &&
        (J.remove(),
        L.remove(),
        (a = document.getElementById("cutin")) &&
          a.parentNode &&
          document.body.removeChild(a));
    }
    function m(a) {
      0 == a.infoType
        ? E.addText(v.getMessage(1223), E.TYPE.ERROR)
        : 1 == a.infoType
          ? M.addBossMark(a.xPos, a.yPos)
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
      L.append();
      L.setMenu(a.msg, a.NAID);
      L.onSelectMenu = function (a, b) {
        L.remove();
        255 === b && J.remove();
        var c = new C.CZ.CHOOSE_MENU();
        c.NAID = a;
        c.num = b;
        O.sendPacket(c);
      };
    }
    function r(a) {
      var b = a instanceof C.ZC.OPEN_EDITDLGSTR ? "text" : "number",
        c = a.NAID;
      I.onAppend = function () {
        I.setType(b, !0);
      };
      I.onSubmitRequest = function (a) {
        I.remove();
        var d;
        switch (b) {
          case "text":
            d = new C.CZ.INPUT_EDITDLGSTR();
            d.msg = a;
            break;
          default:
          case "number":
            ((d = new C.CZ.INPUT_EDITDLG()), (d.value = a));
        }
        d.NAID = c;
        O.sendPacket(d);
      };
      I.append();
    }
    function q(a) {
      var b = x.clone("WinDeal"),
        c = a.NAID;
      b.init = function () {
        this.draggable();
        this.ui.find(".text").text(v.getMessage(92));
        this.ui.css({
          top: y.height / 1.5,
          left: (y.width - 280) / 2,
          zIndex: 100,
        });
        this.ui.find(".btns").append(
          p("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_buy.bmp")
            .data("hover", "btn_buy_a.bmp")
            .data("down", "btn_buy_b.bmp")
            .one("click", function () {
              b.remove();
              var a = new C.CZ.ACK_SELECT_DEALTYPE();
              a.type = 0;
              a.NAID = c;
              O.sendPacket(a);
            })
            .each(this.parseHTML),
          p("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_sell.bmp")
            .data("hover", "btn_sell_a.bmp")
            .data("down", "btn_sell_b.bmp")
            .one("click", function () {
              b.remove();
              var a = new C.CZ.ACK_SELECT_DEALTYPE();
              a.type = 1;
              a.NAID = c;
              O.sendPacket(a);
            })
            .each(this.parseHTML),
          p("\x3cbutton/\x3e")
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
        z.talk = !0;
      };
      b.onRemove = function () {
        z.talk = !1;
      };
      b.append();
    }
    function k(a) {
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
        D.loadFile(v.INTERFACE_PATH + "illust/" + a.imageName, function (b) {
          if (J.ui || J.ui.is(":visible")) {
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
          M.addNpcMark(a.id, a.xPos, a.yPos, a.color, 15e3);
          break;
        case 1:
          M.addNpcMark(a.id, a.xPos, a.yPos, a.color, Infinity);
          break;
        case 2:
          M.removeNpcMark(a.id);
      }
    }
    function t(a) {
      B.Entity.cast.onComplete = function () {
        var a = new C.CZ.PROGRESS();
        O.sendPacket(a);
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
      var a = new C.CZ.PROGRESS();
      O.sendPacket(a);
    }
    function f(a) {
      switch (a.act) {
        case 0:
        case 1:
          u.play(a.fileName);
          break;
        case 2:
          u.stop(a.fileName);
      }
    }
    function n(a) {
      a.Bgm.match(/\.mp3$/i) || (a.Bgm += ".mp3");
      A.play(a.Bgm);
    }
    var p = a("Utils/jquery"),
      v = a("DB/DBManager"),
      u = a("Audio/SoundManager"),
      A = a("Audio/BGM"),
      D = a("Core/Client"),
      B = a("Engine/SessionStorage"),
      O = a("Network/NetworkManager"),
      C = a("Network/PacketStructure"),
      y = a("Renderer/Renderer"),
      z = a("Preferences/Controls"),
      J = a("UI/Components/NpcBox/NpcBox"),
      I = a("UI/Components/InputBox/InputBox"),
      L = a("UI/Components/NpcMenu/NpcMenu"),
      x = a("UI/Components/WinPopup/WinPopup"),
      M = a("UI/Components/MiniMap/MiniMap"),
      E = a("UI/Components/ChatBox/ChatBox");
    J.onNextPressed = function (a) {
      var b = new C.CZ.REQ_NEXT_SCRIPT();
      b.NAID = a;
      O.sendPacket(b);
    };
    J.onClosePressed = function (a) {
      var b = new C.CZ.CLOSE_DIALOG();
      b.NAID = a;
      O.sendPacket(b);
      J.remove();
    };
    return function () {
      O.hookPacket(C.ZC.SAY_DIALOG, b);
      O.hookPacket(C.ZC.WAIT_DIALOG, c);
      O.hookPacket(C.ZC.CLOSE_DIALOG, d);
      O.hookPacket(C.ZC.OPEN_EDITDLG, r);
      O.hookPacket(C.ZC.OPEN_EDITDLGSTR, r);
      O.hookPacket(C.ZC.MENU_LIST, h);
      O.hookPacket(C.ZC.SELECT_DEALTYPE, q);
      O.hookPacket(C.ZC.SHOW_IMAGE, k);
      O.hookPacket(C.ZC.SHOW_IMAGE2, k);
      O.hookPacket(C.ZC.COMPASS, g);
      O.hookPacket(C.ZC.PROGRESS, t);
      O.hookPacket(C.ZC.PROGRESS_CANCEL, l);
      O.hookPacket(C.ZC.SOUND, f);
      O.hookPacket(C.ZC.PLAY_NPC_BGM, n);
      O.hookPacket(C.ZC.CLOSE_SCRIPT, e);
      O.hookPacket(C.ZC.BOSS_INFO, m);
    };
  },
);
