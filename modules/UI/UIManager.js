define(
  "UI/UIManager",
  "require DB/DBManager Utils/jquery ./UIComponent Core/Client Engine/SessionStorage Network/NetworkManager Network/PacketStructure Controls/KeyEventHandler Renderer/Renderer".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      b || (b = new Date().getTime() / 1e3);
      var c = "";
      b = 1e3 * b - 1e3 * a;
      a = Math.floor(b / 864e5);
      var d = b % 864e5;
      b = Math.floor(d / 36e5);
      var e = d % 36e5,
        d = Math.floor(e / 6e4),
        e = Math.round((e % 6e4) / 1e3);
      0 < a && (c = c + a + "\u5929");
      0 < b && (c = c + b + "\u5c0f\u65f6");
      0 < d && (c = c + d + "\u5206\u949f");
      0 < e && (c = c + e + "\u79d2");
      return c;
    }
    var c = a("DB/DBManager"),
      d = a("Utils/jquery"),
      e = a("./UIComponent"),
      m = a("Core/Client");
    a("Engine/SessionStorage");
    a("Network/NetworkManager");
    a("Network/PacketStructure");
    var h = a("Controls/KeyEventHandler"),
      r = a("Renderer/Renderer"),
      q = {
        components: {},
        addComponent: function (a) {
          if (!(a instanceof e))
            throw Error(
              "UIManager::addComponent() - Invalid type of component",
            );
          a.manager = this;
          return (this.components[a.name] = a);
        },
        getComponent: function (a) {
          if (!(a in this.components))
            throw Error(
              'UIManager.getComponent() - Component "' + a + '" not found',
            );
          return this.components[a];
        },
        removeComponents: function () {
          var a = Object.keys(this.components),
            b,
            c = a.length;
          for (b = 0; b < c; ++b) this.components[a[b]].remove();
        },
        fixResizeOverflow: function (a, b) {
          var c = Object.keys(this.components),
            d,
            e = c.length,
            g,
            k,
            h,
            t,
            m;
          for (d = 0; d < e; ++d)
            if ((g = this.components[c[d]].ui))
              ((k = parseInt(g.css("left"), 10)),
                (h = parseInt(g.css("top"), 10)),
                (t = parseInt(g.css("width"), 10)),
                (m = parseInt(g.css("height"), 10)),
                h + m > b && b > m && g.css("top", b - m),
                k + t > a && a > t && g.css("left", a - t));
        },
        showEventBox: function (a) {
          var b, e, f, g;
          b = this.getComponent("WinPopup").clone("WinEvent");
          e = this.getComponent("WinLoading");
          f = this.getComponent("WinLogin");
          b.init = function () {
            this.ui.find(".text").text(a);
            this.ui.css({
              top: (r.height - this.ui.height()) / 2,
              left: (r.width - this.ui.width()) / 2,
              marginTop: "-60px",
              zIndex: 100,
            });
            this.draggable();
            this.ui.find(".btns").append(
              d("\x3cbutton/\x3e")
                .addClass("btn")
                .on("click", function () {
                  g.remove();
                  b.remove();
                  e.remove();
                  f.append();
                })
                .each(this.parseHTML),
            );
          };
          b.onKeyDown = function (a) {
            if (!sessionStorage.getItem("offline"))
              switch ((a.stopImmediatePropagation(), a.which)) {
                case h.ENTER:
                case h.ESCAPE:
                  (g.remove(), b.remove(), e.remove(), f.append());
              }
          };
          g = d("\x3cdiv/\x3e")
            .addClass("win_popup_overlay")
            .on("click", function () {
              event.stopImmediatePropagation();
              return !1;
            });
          g.appendTo("body");
          b.onAppend = function () {
            m.loadFile(
              c.INTERFACE_PATH + "login_interface/btn_ok.bmp",
              function (a) {
                b.ui.find(".btn").css("backgroundImage", "url(" + a + ")");
              },
            );
            var a = d._data(window, "events").keydown;
            a.unshift(a.pop());
          };
          b.append();
          return b;
        },
        showErrorBox: function (b) {
          var e, g;
          e = this.getComponent("WinPopup").clone("WinError");
          e.init = function () {
            this.ui.find(".text").text(b);
            this.ui.css({
              top: (r.height - 120) / 1.5 - 120,
              left: (r.width - 280) / 2,
              zIndex: 100,
            });
            this.draggable();
            this.ui.find(".btns").append(
              d("\x3cbutton/\x3e")
                .addClass("btn")
                .on("click", function () {
                  g.remove();
                  e.remove();
                  a("Engine/GameEngine").reload();
                })
                .each(this.parseHTML),
            );
          };
          e.onKeyDown = function (b) {
            b.stopImmediatePropagation();
            switch (b.which) {
              case h.ENTER:
              case h.ESCAPE:
                (g.remove(), e.remove(), a("Engine/GameEngine").reload());
            }
          };
          g = d("\x3cdiv/\x3e").addClass("win_popup_overlay");
          g.appendTo("body");
          e.onAppend = function () {
            m.loadFile(
              c.INTERFACE_PATH + "login_interface/btn_exit.bmp",
              function (a) {
                e.ui.find(".btn").css("backgroundImage", "url(" + a + ")");
              },
            );
            var a = d._data(window, "events").keydown;
            a.unshift(a.pop());
          };
          e.append();
          return e;
        },
        showMessageBox: function (a, b, c, e) {
          var f;
          f = this.getComponent("WinPopup").clone("WinMSG");
          f.init = function () {
            this.draggable();
            this.ui.find(".text").text(a);
            this.ui.css({
              top: (r.height - 120) / 1.5 - 125,
              left: (r.width - 280) / 2,
              zIndex: 100,
            });
            b &&
              f.ui.find(".btns").append(
                d("\x3cbutton/\x3e")
                  .addClass("btn")
                  .data("background", "btn_" + b + ".bmp")
                  .data("hover", "btn_" + b + "_a.bmp")
                  .data("down", "btn_" + b + "_b.bmp")
                  .one("click", function () {
                    f.remove();
                    c && c();
                  })
                  .each(this.parseHTML),
              );
          };
          if (!b || e)
            ((f.onKeyDown = function (a) {
              switch (a.which) {
                case h.ENTER:
                case h.ESCAPE:
                  (this.remove(), c && c());
              }
              a.stopImmediatePropagation();
            }),
              (f.onAppend = function () {
                var a = d._data(window, "events").keydown;
                a.unshift(a.pop());
              }));
          f.append();
          return f;
        },
      },
      k;
    q.showPromptBox = function (a, b, c, e, n) {
      k && k.remove();
      k = this.getComponent("WinPopup").clone("WinPrompt");
      k.init = function () {
        this.draggable();
        this.ui.find(".text").text(a);
        this.ui.css({
          top: (r.height - 120) / 1.5 - 120,
          left: (r.width - 280) / 2,
          zIndex: 100,
        });
        this.ui.find(".btns").append(
          d("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_" + b + ".bmp")
            .data("hover", "btn_" + b + "_a.bmp")
            .data("down", "btn_" + b + "_b.bmp")
            .one("click", function () {
              k.remove();
              e && e();
            })
            .each(this.parseHTML),
          d("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_" + c + ".bmp")
            .data("hover", "btn_" + c + "_a.bmp")
            .data("down", "btn_" + c + "_b.bmp")
            .one("click", function () {
              k.remove();
              n && n();
            })
            .each(this.parseHTML),
        );
      };
      k.append();
      return k;
    };
    q.showOfflineMsgBox = function (a) {
      var c,
        e = "";
      c = this.getComponent("WinPopup").clone("WinOfflineMsg");
      c.init = function () {
        this.ui.addClass("offlineMsg");
        e = d("\x3cp\x3e").text(
          "\u79bb\u7ebf\u65f6\u957f\uff1a" + b(a.time, a.endtime),
        );
        this.ui.find(".text").append(e);
        var f = "";
        switch (a.feedback) {
          case 1:
            f =
              "\u80cc\u5305\u4e2d\u627e\u4e0d\u5230\u9b54\u7269\u9972\u6599\uff0c\u907f\u514d\u5ba0\u7269\u4e22\u5931\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 2:
            f =
              "\u89d2\u8272\u5df2\u6b7b\u4ea1\uff0c\u907f\u514d\u5361\u53f7\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 3:
            f =
              "\u5728\u5371\u53ca\u60c5\u51b5\u65f6\uff0c\u65e0\u6cd5\u4f7f\u7528\u77ac\u95f4\u79fb\u52a8\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 4:
            f =
              "\u8840\u91cf\u5c11\u4e8e\u6307\u5b9a\u503c\uff0c\u5f3a\u5236\u4e0b\u7ebf\u3002";
            break;
          case 5:
            f =
              "\u8840\u91cf\u6216\u6c14\u91cf\u8fc7\u4f4e\uff0c\u65e0\u6cd5\u4f7f\u7528\u77ac\u95f4\u79fb\u52a8\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 6:
            f =
              "\u8d1f\u91cd\u8d85\u8fc790%\u65f6\uff0c\u65e0\u6cd5\u653b\u51fb\u548c\u4f7f\u7528\u6280\u80fd\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 7:
            f =
              "\u627e\u4e0d\u5230\u7bad\u77e2\u548c\u7bad\u77e2\u6876\uff0c\u65e0\u6cd5\u6b63\u5e38\u653b\u51fb\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 8:
            f =
              "\u65e0\u6cd5\u77ac\u79fb\uff0c\u53d6\u6d88\u8ddf\u968f\u72b6\u6001\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 9:
            f =
              "\u627e\u4e0d\u5230\u8ddf\u968f\u76ee\u6807\uff0c\u53d6\u6d88\u8ddf\u968f\u72b6\u6001\u5e76\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 10:
            f =
              "\u89d2\u8272\u5df2\u6b7b\u4ea1\uff0c\u65e0\u6cd5\u8ddf\u968f\u76ee\u6807\u5e76\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 11:
            f =
              "\u8ddf\u968f\u72b6\u6001\u4e2d\uff0c\u8840\u91cf\u8fc7\u4f4e\u4fdd\u62a4\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 12:
            f =
              "\u8d1f\u91cd\u8d85\u8fc750%\uff0cSP\u4e0d\u8db3\uff0c\u65e0\u6cd5\u4f7f\u7528\u4e3b\u52a8\u6280\u80fd\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 13:
            f =
              "\u627e\u4e0d\u5230\u6280\u80fd\u6240\u9700\u7684\u50ac\u5316\u5242\uff0c\u65e0\u6cd5\u4f7f\u7528\u4e3b\u52a8\u6280\u80fd\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 14:
            f = "\u81ea\u52a8\u6218\u6597\u65f6\u95f4\u7ed3\u675f";
            break;
          default:
            f = "\u6b63\u5e38";
        }
        e = d("\x3cp\x3e").text("\u79bb\u7ebf\u53cd\u9988\uff1a" + f);
        this.ui.find(".text").append(e);
        a.baselv &&
          ((e = d("\x3cp\x3e").text(
            "\u7b49\u7ea7\u63d0\u5347\uff1a" + a.baselv + "\u7ea7",
          )),
          this.ui.find(".text").append(e));
        a.joblv &&
          ((e = d("\x3cp\x3e").text(
            "\u804c\u4e1a\u7b49\u7ea7\u63d0\u5347\uff1a" + a.joblv + "\u7ea7",
          )),
          this.ui.find(".text").append(e));
        a.zeny &&
          ((e = d("\x3cp\x3e").text(
            "\u83b7\u5f97\u6e38\u620f\u5e01\uff1a" + a.zeny + "Zeny",
          )),
          this.ui.find(".text").append(e));
        a.cash &&
          ((e = d("\x3cp\x3e").text("\u83b7\u5f97C\u70b9\uff1a" + a.cash)),
          this.ui.find(".text").append(e));
        a.equipCount &&
          ((e = d("\x3cp\x3e").text(
            "\u83b7\u5f97\u88c5\u5907\uff1ax" + a.equipCount,
          )),
          this.ui.find(".text").append(e));
        a.cardCount &&
          ((e = d("\x3cp\x3e").text(
            "\u83b7\u5f97\u5361\u7247\uff1ax" + a.cardCount,
          )),
          this.ui.find(".text").append(e));
        this.ui.css({
          top: "50%",
          left: "50%",
          marginTop: -(this.ui.height() / 2),
          marginLeft: -(this.ui.width() / 2),
          zIndex: 99,
        });
        f = d("\x3cdiv/\x3e").append(
          d("\x3cbutton/\x3e")
            .addClass("btn")
            .data("background", "btn_ok.bmp")
            .data("hover", "btn_ok_a.bmp")
            .data("down", "btn_ok_b.bmp")
            .one("click", function () {
              c.remove();
            })
            .each(this.parseHTML),
        );
        this.ui.one("click", function () {
          c.remove();
        });
        this.ui.find(".btns").append(f);
      };
      c.append();
      return c;
    };
    return q;
  },
);
