define(
  "Engine/MapEngine/NPC",
  "require Utils/jquery DB/DBManager Audio/SoundManager Audio/BGM Core/Client Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/Renderer Preferences/Controls UI/Components/NpcBox/NpcBox UI/Components/InputBox/InputBox UI/Components/NpcMenu/NpcMenu UI/Components/WinPopup/WinPopup UI/Components/MiniMap/MiniMap UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      O.append();
      O.setText(a.msg, a.NAID);
    }
    function c(a) {
      O.append();
      O.addNext(a.NAID);
    }
    function d(a) {
      setTimeout(function () {
        O.ui && O.ui.is(":visible") && O.addClose(a.NAID);
      }, 20);
    }
    function e(a) {
      O.ownerID === a.NAID &&
        (O.remove(),
        H.remove(),
        (a = document.getElementById("cutin")) &&
          a.parentNode &&
          document.body.removeChild(a));
    }
    function m(a) {
      0 == a.infoType
        ? D.addText(v.getMessage(1223), D.TYPE.ERROR)
        : 1 == a.infoType
          ? I.addBossMark(a.xPos, a.yPos)
          : 3 == a.infoType &&
            D.addText(
              "Boss\u7ea7\u9b54\u7269 '" +
                a.name +
                "'\u8ddd\u79bb\u590d\u6d3b\u8fd8\u6709 " +
                a.minHour +
                "\u5c0f\u65f6:" +
                a.minMinute +
                "\u5206",
              D.TYPE.PUBLIC,
            );
    }
    function h(a) {
      H.append();
      H.setMenu(a.msg, a.NAID);
      H.onSelectMenu = function (a, b) {
        H.remove();
        255 === b && O.remove();
        var c = new A.CZ.CHOOSE_MENU();
        c.NAID = a;
        c.num = b;
        J.sendPacket(c);
      };
    }
    function q(a) {
      var b = a instanceof A.ZC.OPEN_EDITDLGSTR ? "text" : "number",
        c = a.NAID;
      M.onAppend = function () {
        M.setType(b, !0);
      };
      M.onSubmitRequest = function (a) {
        M.remove();
        var d;
        switch (b) {
          case "text":
            d = new A.CZ.INPUT_EDITDLGSTR();
            d.msg = a;
            break;
          default:
          case "number":
            ((d = new A.CZ.INPUT_EDITDLG()), (d.value = a));
        }
        d.NAID = c;
        J.sendPacket(d);
      };
      M.append();
    }
    function r(a) {
      var b = x.clone("WinDeal"),
        c = a.NAID;
      b.init = function () {
        this.draggable();
        this.ui.find(".text").text(v.getMessage(92));
        this.ui.css({
          top: B.height / 1.5,
          left: (B.width - 280) / 2,
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
              var a = new A.CZ.ACK_SELECT_DEALTYPE();
              a.type = 0;
              a.NAID = c;
              J.sendPacket(a);
            })
            .each(this.parseHTML),
          p("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_sell.bmp")
            .data("hover", "btn_sell_a.bmp")
            .data("down", "btn_sell_b.bmp")
            .one("click", function () {
              b.remove();
              var a = new A.CZ.ACK_SELECT_DEALTYPE();
              a.type = 1;
              a.NAID = c;
              J.sendPacket(a);
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
        F.talk = !0;
      };
      b.onRemove = function () {
        F.talk = !1;
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
        E.loadFile(v.INTERFACE_PATH + "illust/" + a.imageName, function (b) {
          if (O.ui || O.ui.is(":visible")) {
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
          I.addNpcMark(a.id, a.xPos, a.yPos, a.color, 15e3);
          break;
        case 1:
          I.addNpcMark(a.id, a.xPos, a.yPos, a.color, Infinity);
          break;
        case 2:
          I.removeNpcMark(a.id);
      }
    }
    function u(a) {
      C.Entity.cast.onComplete = function () {
        var a = new A.CZ.PROGRESS();
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
      C.Entity.cast.set(1e3 * a.time, a.color ? b : null);
    }
    function l() {
      C.Entity.cast.remove();
      var a = new A.CZ.PROGRESS();
      J.sendPacket(a);
    }
    function f(a) {
      switch (a.act) {
        case 0:
        case 1:
          t.play(a.fileName);
          break;
        case 2:
          t.stop(a.fileName);
      }
    }
    function n(a) {
      a.Bgm.match(/\.mp3$/i) || (a.Bgm += ".mp3");
      z.play(a.Bgm);
    }
    var p = a("Utils/jquery"),
      v = a("DB/DBManager"),
      t = a("Audio/SoundManager"),
      z = a("Audio/BGM"),
      E = a("Core/Client"),
      C = a("Engine/SessionStorage"),
      J = a("Network/NetworkManager"),
      A = a("Network/PacketStructure"),
      B = a("Renderer/Renderer"),
      F = a("Preferences/Controls"),
      O = a("UI/Components/NpcBox/NpcBox"),
      M = a("UI/Components/InputBox/InputBox"),
      H = a("UI/Components/NpcMenu/NpcMenu"),
      x = a("UI/Components/WinPopup/WinPopup"),
      I = a("UI/Components/MiniMap/MiniMap"),
      D = a("UI/Components/ChatBox/ChatBox");
    O.onNextPressed = function (a) {
      var b = new A.CZ.REQ_NEXT_SCRIPT();
      b.NAID = a;
      J.sendPacket(b);
    };
    O.onClosePressed = function (a) {
      var b = new A.CZ.CLOSE_DIALOG();
      b.NAID = a;
      J.sendPacket(b);
      O.remove();
    };
    return function () {
      J.hookPacket(A.ZC.SAY_DIALOG, b);
      J.hookPacket(A.ZC.WAIT_DIALOG, c);
      J.hookPacket(A.ZC.CLOSE_DIALOG, d);
      J.hookPacket(A.ZC.OPEN_EDITDLG, q);
      J.hookPacket(A.ZC.OPEN_EDITDLGSTR, q);
      J.hookPacket(A.ZC.MENU_LIST, h);
      J.hookPacket(A.ZC.SELECT_DEALTYPE, r);
      J.hookPacket(A.ZC.SHOW_IMAGE, k);
      J.hookPacket(A.ZC.SHOW_IMAGE2, k);
      J.hookPacket(A.ZC.COMPASS, g);
      J.hookPacket(A.ZC.PROGRESS, u);
      J.hookPacket(A.ZC.PROGRESS_CANCEL, l);
      J.hookPacket(A.ZC.SOUND, f);
      J.hookPacket(A.ZC.PLAY_NPC_BGM, n);
      J.hookPacket(A.ZC.CLOSE_SCRIPT, e);
      J.hookPacket(A.ZC.BOSS_INFO, m);
    };
  },
);
