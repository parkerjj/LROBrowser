define(
  "UI/Components/ChatBox/ChatBox",
  "require DB/DBManager Utils/jquery Network/PacketStructure Network/NetworkManager Renderer/Renderer Core/Client Core/Events Core/Preferences Controls/KeyEventHandler Controls/BattleMode Preferences/Controls ./History UI/UIManager UI/UIComponent UI/Components/ContextMenu/ContextMenu Engine/SessionStorage text!./ChatBox.html text!./ChatBox.css Controls/ProcessCommand".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = x.ui.find(".content");
      G[0].content =
        "\u6211\u4eec\u5728\u73a9\u4e00\u6b3e\u8001\u6e38\u620f\u53eb\u4ed9\u5883\u4f20\u8bf4Online\uff0c\u6211\u7684\u540d\u5b57\u53eb" +
        D.Entity.display.name +
        "\uff0c\u6211\u7684\u8eab\u4efd\u662f\u626e\u6f14\u4e00\u4e2a\u5bcc\u6709\u751f\u547d\u529b\uff0c\u79ef\u6781\u9633\u5149\uff0c\u5e7d\u9ed8\uff0c\u5177\u6709\u521b\u9020\u529b\u7684\u6e38\u620f\u89d2\u8272\uff0c\u89d2\u8272\u7b49\u7ea7\u4e3a" +
        D.Entity.clevel +
        "\u7ea7\uff0c\u6211\u7684\u4efb\u52a1\u5c31\u662f\u4e3a\u73a9\u5bb6\uff0c\u5c31\u662f\u4f60\u89e3\u7b54\u95ee\u9898\u548c\u51b3\u7b56\u65b9\u6848\u3002";
      var c = y("AI/Delegate"),
        d = D.Entity.display.name + " : ",
        e = { _csrf: h("#_csrf").val(), msg: G };
      $.ajax({
        url: "/?r\x3dmn/gpt",
        type: "post",
        dataType: "json",
        data: e,
        success: function (e) {
          if (e.error)
            ((H = !1),
              $(".entering").html(d + "\u55ef\uff01\uff1f"),
              $(".entering").removeClass("entering"),
              console.log(e.error));
          else if (
            (3 < G.length && G.splice(1, 1),
            G.push(e.choices[0].message),
            e.choices[0].message.function_call)
          ) {
            var f = e.choices[0].message.function_call.name;
            e = JSON.parse(e.choices[0].message.function_call.arguments);
            e = c[f](e);
            if (!e)
              return (
                (H = !1),
                $(".entering").html(d + "\u55ef\uff01\uff1f"),
                $(".entering").removeClass("entering"),
                !1
              );
            f = { role: "function", name: f, content: e };
            3 < G.length && G.splice(1, 1);
            G.push(f);
            b();
          } else {
            var g = function () {
                h < k.length
                  ? ($(".entering").append(k[h++]),
                    setTimeout(g, Math.floor(11 * Math.random()) + 50))
                  : ((H = !1), $(".entering").removeClass("entering"));
                a[0].scrollTop = a[0].scrollHeight;
              },
              h = 0,
              k = e.choices[0].message.content;
            $(".entering").html(d);
            g();
          }
        },
      });
    }
    function c(a) {
      var b;
      a.originalEvent.wheelDelta
        ? ((b = a.originalEvent.wheelDelta / 120), window.opera && (b = -b))
        : a.originalEvent.detail && (b = -a.originalEvent.detail);
      this.scrollTop = 14 * Math.floor(this.scrollTop / 14) - 14 * b;
      return !1;
    }
    function d(a) {
      return function () {
        x.ui.find(".input .username").val(a);
      };
    }
    function e(a) {
      return function () {
        var b = x.ui.find(".input .message");
        b.removeClass("guild party word");
        a & x.TYPE.PARTY
          ? (b.addClass("party"),
            x.addText("\u7ec4\u961f\u53d1\u8a00\u9891\u9053", x.TYPE.PARTY))
          : a & x.TYPE.GUILD
            ? (b.addClass("guild"),
              x.addText("\u516c\u4f1a\u53d1\u8a00\u9891\u9053", x.TYPE.GUILD))
            : a & x.TYPE.WORLD
              ? (b.addClass("word"),
                x.addText("\u4e16\u754c\u53d1\u8a00\u9891\u9053", x.TYPE.WORLD))
              : a & x.TYPE.GPTA
                ? (x.ui.find(".filter button").text("GPT"),
                  x.addText(
                    D.Entity.display.name +
                      " : \u6709\u4ec0\u4e48\u53ef\u4ee5\u5e2e\u4f60\u7684\u5417\uff1f",
                    x.TYPE.GPTA,
                  ),
                  x.addText('"\u6253\u5f00\u80cc\u5305"', x.TYPE.SELF),
                  x.addText(
                    '"\u7ed9\u6307\u5b9a\u540d\u5b57\u73a9\u5bb6\u53d1\u9001\u4e00\u6761\u6c42\u52a9\u7684\u79c1\u4fe1"',
                    x.TYPE.SELF,
                  ),
                  x.addText(
                    '"\u67e5\u627e\u6307\u5b9a\u540d\u5b57\u7684\u9b54\u7269"',
                    x.TYPE.SELF,
                  ),
                  x.addText(
                    '"\u67e5\u627e\u6307\u5b9a\u540d\u5b57\u7684\u9053\u5177"',
                    x.TYPE.SELF,
                  ),
                  x.addText(
                    '"\u5e2e\u5fd9\u5582\u4e00\u4e0b\u5ba0\u7269"',
                    x.TYPE.SELF,
                  ),
                  x.addText(
                    '"\u53bb\u54ea\u91cc\u7ec3\u7ea7\u5408\u9002","\u51fa\u53d1"',
                    x.TYPE.SELF,
                  ),
                  x.addText(
                    '"\u53bb\u54ea\u91cc\u6253\u94b1\u5408\u9002","\u51fa\u53d1"',
                    x.TYPE.SELF,
                  ),
                  x.addText(
                    '"\u54ea\u4e2a\u5546\u5e97\u6709\u7ea2\u8272\u836f\u6c34\u51fa\u552e\u5462","\u51fa\u53d1"',
                    x.TYPE.SELF,
                  ))
                : x.addText(
                    "\u516c\u5f00\u53d1\u8a00\u9891\u9053",
                    x.TYPE.SELF,
                  );
        M = a;
      };
    }
    var m = a("DB/DBManager"),
      h = a("Utils/jquery"),
      r = a("Network/PacketStructure"),
      q = a("Network/NetworkManager");
    a("Renderer/Renderer");
    var k = a("Core/Client"),
      g = a("Core/Events"),
      t = a("Core/Preferences"),
      l = a("Controls/KeyEventHandler"),
      f = a("Controls/BattleMode"),
      n = a("Preferences/Controls"),
      p = a("./History"),
      v = a("UI/UIManager"),
      u = a("UI/UIComponent"),
      A = a("UI/Components/ContextMenu/ContextMenu"),
      D = a("Engine/SessionStorage"),
      B = a("text!./ChatBox.html"),
      O = a("text!./ChatBox.css"),
      C = a("Controls/ProcessCommand"),
      y = a,
      z = new p(),
      J = new p(!0),
      I = 2,
      L = t.get("ChatBox", { x: 5, y: Infinity, height: 3 }, 1.2),
      x = new u("ChatBox", B, O);
    x.TYPE = {
      SELF: 1,
      PUBLIC: 2,
      PRIVATE: 4,
      PARTY: 8,
      GUILD: 16,
      ANNOUNCE: 32,
      ERROR: 64,
      INFO: 128,
      BLUE: 256,
      ADMIN: 512,
      WORLD: 1024,
      GPTU: 2048,
      GPTA: 4096,
    };
    var M = x.TYPE.PUBLIC;
    x.PrivateMessageStorage = { nick: "", msg: "" };
    var E = 0,
      F = 0,
      G = [],
      H = !1,
      K = { role: "system", content: "" };
    G.push(K);
    var P = 0,
      N = 0,
      S = !1;
    x.init = function () {
      I = L.height - 1;
      x.updateHeight();
      this.ui.css({ bottom: 0, left: 0 });
      this.__mouseStopBlock = [];
      this.__mouseStopBlock[0] = this.ui.find(".input");
      this.__mouseStopBlock[1] = this.ui.find(".options");
      k.loadFiles(
        [
          m.INTERFACE_PATH + "basic_interface/dialscr_down.bmp",
          m.INTERFACE_PATH + "basic_interface/dialscr_up.bmp",
        ],
        function (a, b) {
          h("style:first").append(
            [
              "#chatbox .content::-webkit-scrollbar { width: 10px; height: 10px;}\n#chatbox .content::-webkit-scrollbar-button:vertical:start:increment,\n#chatbox .content::-webkit-scrollbar-button:vertical:end:decrement { display: none;}\n#chatbox .content::-webkit-scrollbar-corner:vertical { display:none;}\n#chatbox .content::-webkit-scrollbar-resizer:vertical { display:none;}\n#chatbox .content::-webkit-scrollbar-button:start:decrement,\n#chatbox .content::-webkit-scrollbar-button:end:increment { display: block; border:none;}",
              "#chatbox .content::-webkit-scrollbar-button:vertical:increment { background: url(" +
                a +
                ") no-repeat; height:10px;}",
              "#chatbox .content::-webkit-scrollbar-button:vertical:decrement { background: url(" +
                b +
                ") no-repeat; height:10px;}",
              "#chatbox .content::-webkit-scrollbar-track-piece:vertical { background:black; border:none;}\n#chatbox .content::-webkit-scrollbar-thumb:vertical { background:grey; -webkit-border-image:none; border-color:transparent;border-width: 0px 0; }",
            ].join("\n"),
          );
        },
      );
      this.ui.find(".input input").mousedown(function (a) {
        this.select();
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".input .message").blur(
        function () {
          g.setTimeout(
            function () {
              document.activeElement.tagName.match(/input|select|textarea/i) ||
                this.ui.find(".input .message").focus();
            }.bind(this),
            1,
          );
        }.bind(this),
      );
      this.ui
        .find(".header input")
        .dblclick(function () {
          this.type = "text";
          this.select();
        })
        .blur(function () {
          this.type = "button";
        });
      this.ui
        .find(".input .list")
        .click(function () {
          var a = J.list,
            b,
            c = a.length,
            e = h(this).offset(),
            f = A.ui.find(".menu");
          if (c) {
            A.remove();
            A.append();
            for (b = 0; b < c; ++b) A.addElement(a[b], d(a[b]));
            A.addElement("", d(""));
            f.css({
              top: e.top - f.height() - 5,
              left: e.left - f.width() - 5,
            });
          } else x.addText(m.getMessage(192), x.TYPE.ERROR);
        })
        .mousedown(function (a) {
          a.stopImmediatePropagation();
          return !1;
        });
      this.ui
        .find(".input .filter")
        .click(function () {
          var a = h(this).offset(),
            b = A.ui.find(".menu");
          A.remove();
          A.append();
          A.addElement(m.getMessage(85), e(x.TYPE.PUBLIC));
          A.addElement("\u4e16\u754c\u53d1\u8a00\u9891\u9053", e(x.TYPE.WORLD));
          A.addElement(m.getMessage(86), e(x.TYPE.PARTY));
          A.addElement(m.getMessage(437), e(x.TYPE.GUILD));
          A.addElement("GPT", e(x.TYPE.GPTA));
          b.css({ top: a.top - b.height() - 5, left: a.left - b.width() + 25 });
        })
        .mousedown(function (a) {
          a.stopImmediatePropagation();
          return !1;
        });
      this.ui.find(".input .size").click(function (a) {
        x.updateHeight(!0);
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".body .content").on("click", ".join", function () {
        var a = $(this).data("info").split("#");
        if (D.hasParty && D.partyLeaderAID != a[2])
          return (ItemObtain.setMsg("\u8bf7\u9000\u51fa\u961f\u4f0d"), !1);
        var b = new r.CZ.REQ_ENTER_INSTANCE();
        b.CID = a[1];
        b.AID = a[2];
        b.instanceName = a[0];
        q.sendPacket(b);
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".content").on("mousewheel DOMMouseScroll", c);
    };
    x.clean = function () {
      var a, b, c;
      if (
        (a = this.ui
          .find(".content")
          .html()
          .match(/(blob:[^"]+)/g))
      )
        for (b = 0, c = a.length; b < c; ++b) window.URL.revokeObjectURL(a[b]);
      this.ui.find(".content").empty();
      this.ui.find(".input .message").val("");
      this.ui.find(".input .username").val("");
      G = [];
      G.push(K);
      H = !1;
      z.clear();
      J.clear();
    };
    x.onAppend = function () {
      this.ui.find(".input .message").focus();
      var a = this.ui.find(".content")[0];
      a.scrollTop = a.scrollHeight;
    };
    x.onRemove = function () {
      this.ui.find(".content").off("scroll");
      L.y = parseInt(this.ui.css("bottom"), 5);
      L.x = parseInt(this.ui.css("left"), 5);
      L.height = I;
      L.save();
    };
    x.processBattleMode = function (a) {
      if (
        this.ui.find(".battlemode").is(":visible") ||
        l.ALT ||
        l.SHIFT ||
        l.CTRL ||
        (a >= l.F1 && a <= l.F24)
      )
        return f.process(a);
      var b = this.ui.find(".input .message"),
        c = b.val();
      g.setTimeout(
        function () {
          b.val() === c && f.process(a);
        }.bind(this),
        4,
      );
      return !1;
    };
    x.onKeyDown = function (a) {
      var b = this.ui.find(".input .message"),
        c = this.ui.find(".input .username");
      switch (a.which) {
        default:
          return x.processBattleMode(a.which)
            ? (a.stopImmediatePropagation(), !1)
            : !0;
        case l.TAB:
          if (document.activeElement === b[0]) {
            c.select().focus();
            break;
          }
          if (document.activeElement === c[0]) {
            b.select().focus();
            break;
          }
          return !0;
        case l.UP:
          if (!h("#NpcMenu").length) {
            if (document.activeElement === b[0]) {
              b.val(z.previous()).select();
              break;
            }
            if (document.activeElement === c[0]) {
              c.val(J.previous()).select();
              break;
            }
          }
          return !0;
        case l.DOWN:
          if (!h("#NpcMenu").length) {
            if (document.activeElement === b[0]) {
              b.val(z.next()).select();
              break;
            }
            if (document.activeElement === c[0]) {
              c.val(J.next()).select();
              break;
            }
          }
          return !0;
        case l.ENTER:
          if (
            ("INPUT" === document.activeElement.tagName &&
              document.activeElement !== b[0]) ||
            h("#NpcMenu, #NpcBox, #WarpList, #inputbox, #ItemSelection").length
          )
            return !0;
          b.focus();
          this.submit();
      }
      a.stopImmediatePropagation();
      return !1;
    };
    x.submit = function () {
      var a = this.ui.find(".input"),
        c = a.find(".username"),
        d = a.find(".message"),
        e = c.val(),
        c = d.val();
      if (M & x.TYPE.GPTA && H)
        ItemObtain.setMsg("\u8bf4\u8bdd\u592a\u5feb\u4e86");
      else {
        if (!D.Entity.isAdmin) {
          var f = e.split(":");
          if (1 < f.length && "npc" == f[0].toLowerCase()) {
            d.val("");
            return;
          }
        }
        if (c.length)
          if (
            (e.length &&
              "/" !== c[0] &&
              ((this.PrivateMessageStorage.nick = e),
              (this.PrivateMessageStorage.msg = c),
              J.push(e),
              J.previous()),
            z.push(c),
            d.val(""),
            "/" === c[0])
          )
            C.call(this, c.substr(1));
          else if (M & x.TYPE.GPTA) {
            Date.now() >= E && ((F = 0), (E = Date.now() + 6e4));
            if (30 <= F)
              return (
                ItemObtain.setMsg(
                  "\u64cd\u4f5c\u592a\u9891\u7e41\u8bf7\u7a0d\u540e\u518d\u8bd5",
                ),
                !1
              );
            F++;
            H = !0;
            a = { role: "user", content: c };
            3 < G.length && G.splice(1, 1);
            G.push(a);
            x.addText("\u6211 : " + c, x.TYPE.GPTU);
            x.addText(
              D.Entity.display.name + " : \u6211\u60f3\u60f3...",
              x.TYPE.GPTA,
              0,
              0,
              !0,
            );
            b();
          } else if (S)
            v.showMessageBox(
              "You are temporarily restricted from sending data.",
              "ok",
            );
          else if (
            (N++,
            1 === N &&
              setTimeout(function () {
                N = 0;
              }, 5e3),
            10 < N)
          )
            ((S = !0),
              v.showMessageBox(
                "Send limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                v.showMessageBox(
                  "Restriction lifted. You can send data again.",
                  "ok",
                );
              }, 1e4));
          else this.onRequestTalk(e, c, M);
        else
          (a.toggle(),
            this.ui.find(".battlemode").toggle(),
            a.is(":visible") && d.focus());
      }
    };
    x.addText = function (a, b, c, d, e) {
      d = this.ui.find(".content");
      c ||
        (c =
          b & x.TYPE.PUBLIC && b & x.TYPE.SELF
            ? "#00FF00"
            : b & x.TYPE.PARTY
              ? b & x.TYPE.SELF
                ? "rgb(200, 200, 100)"
                : "rgb(230,215,200)"
              : b & x.TYPE.GUILD
                ? "rgb(180, 255, 180)"
                : b & x.TYPE.PRIVATE
                  ? "#FFFF00"
                  : b & x.TYPE.ERROR
                    ? "#FF0000"
                    : b & x.TYPE.INFO
                      ? "#FFFF63"
                      : b & x.TYPE.BLUE
                        ? "#00FFFF"
                        : b & x.TYPE.ADMIN
                          ? "#FFFF00"
                          : b & x.TYPE.GPTU
                            ? "#FFFF00"
                            : b & x.TYPE.GPTA
                              ? "rgb(255, 255, 0)"
                              : "white");
      e
        ? d.append(
            h("\x3cdiv/\x3e").addClass("entering").css("color", c).html(a),
          )
        : d.append(h("\x3cdiv/\x3e").css("color", c).html(a));
      a = d.find("div");
      if (50 < a.length) {
        a = a.eq(0);
        if ((b = a.html().match(/(blob:[^"]+)/g)))
          for (c = 0, e = b.length; c < e; ++c)
            window.URL.revokeObjectURL(b[c]);
        a.remove();
      }
      d[0].scrollTop = d[0].scrollHeight;
    };
    x.addText2 = function (a, b, c, d, e) {
      d = this.ui.find(".content");
      c ||
        (c =
          b & x.TYPE.PUBLIC && b & x.TYPE.SELF
            ? "#00FF00"
            : b & x.TYPE.PARTY
              ? b & x.TYPE.SELF
                ? "rgb(200, 200, 100)"
                : "rgb(230,215,200)"
              : b & x.TYPE.GUILD
                ? "rgb(180, 255, 180)"
                : b & x.TYPE.PRIVATE
                  ? "#FFFF00"
                  : b & x.TYPE.ERROR
                    ? "#FF0000"
                    : b & x.TYPE.INFO
                      ? "#FFFF63"
                      : b & x.TYPE.BLUE
                        ? "#00FFFF"
                        : b & x.TYPE.ADMIN
                          ? "#FFFF00"
                          : b & x.TYPE.GPTU
                            ? "#FFFF00"
                            : b & x.TYPE.GPTA
                              ? "rgb(255, 255, 0)"
                              : "white");
      b = h("\x3cdiv/\x3e").css("color", c).html(a);
      e
        ? d.append(
            h("\x3cdiv/\x3e").addClass("entering").css("color", c).html(a),
          )
        : d.append(b);
      var f = b.find("span").data("map");
      f &&
        b
          .find("span")
          .on("click", function (a) {
            var b = f.split("#");
            v.showPromptBox(
              "\u786e\u5b9a\u524d\u5f80\u6d3b\u52a8\u5730\u56fe\u5417?",
              "ok",
              "cancel",
              function () {
                var a = new r.CZ.PRIVATE_AIRSHIP_REQUEST();
                a.mapname = b[0];
                a.x = b[1];
                a.y = b[2];
                a.type = 1;
                a.itemid = 14527;
                q.sendPacket(a);
              },
              null,
            );
          })
          .mousedown(function (a) {
            a.stopImmediatePropagation();
            return !1;
          });
      a = d.find("div");
      if (50 < a.length) {
        a = a.eq(0);
        if ((c = a.html().match(/(blob:[^"]+)/g)))
          for (e = 0, b = c.length; e < b; ++e)
            window.URL.revokeObjectURL(c[e]);
        a.remove();
      }
      d[0].scrollTop = d[0].scrollHeight;
    };
    x.updateHeight = function (a) {
      var b = [0, 0, 42, 84, 126, 168, 210];
      I = (I + 1) % b.length;
      var c = this.ui.find(".content"),
        b = b[I],
        d = parseInt(this.ui.css("bottom"), 10);
      this.ui.css("bottom", d);
      c.height(b);
      0 === I && a && I++;
      switch (I) {
        case 0:
          this.ui.hide();
          break;
        case 1:
          this.ui.show();
          this.ui.find(".header, .body").hide();
          this.ui.find(".input").addClass("fix");
          break;
        default:
          (this.ui.find(".input").removeClass("fix"),
            this.ui.find(".header, .body").show());
      }
      c[0].scrollTop = c[0].scrollHeight;
    };
    x.saveNickName = function (a) {
      J.push(a);
    };
    x.onShortCut = function (a) {
      switch (a.cmd) {
        case "EMO":
          x.ui.find(".header").hasClass("emo")
            ? (x.ui.find(".header").removeClass("emo"),
              x.ui.find(".body").removeClass("emo"))
            : (x.ui.find(".header").attr("class", "header"),
              x.ui.find(".body").attr("class", "body"),
              x.ui.find(".input").hide(),
              x.ui.find(".header").addClass("emo"),
              x.ui.find(".body").addClass("emo"));
          break;
        case "EXTEND":
          x.ui.find(".header").hasClass("role")
            ? (x.ui.find(".header").removeClass("role"),
              x.ui.find(".body").removeClass("role"))
            : (x.ui.find(".header").attr("class", "header"),
              x.ui.find(".body").attr("class", "body"),
              x.ui.find(".input").hide(),
              x.ui.find(".header").addClass("role"),
              x.ui.find(".body").addClass("role"));
          break;
        case "updateHeight":
          x.updateHeight(!1);
          break;
        case "autoattack":
          if (n.talk) return !1;
          if (S) {
            v.showMessageBox(
              "You are temporarily restricted from clicking.",
              "ok",
            );
            break;
          }
          P++;
          1 === P &&
            setTimeout(function () {
              P = 0;
            }, 5e3);
          30 < P
            ? ((S = !0),
              v.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                v.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : (3 == m.nid
                ? ((a = new r.CZ.WHISPER()),
                  (a.receiver = "NPC:setautoattack"),
                  (a.msg = "0"))
                : ((a = new r.CZ.NOTIFY_UPDATEINFO()),
                  (a.id = 34),
                  (a.value = 1)),
              q.sendPacket(a),
              y("UI/Components/MiniMap/MiniMap").removeDestination());
          break;
        case "autoloot":
          if (S) {
            v.showMessageBox(
              "You are temporarily restricted from clicking.",
              "ok",
            );
            break;
          }
          P++;
          1 === P &&
            setTimeout(function () {
              P = 0;
            }, 5e3);
          30 < P
            ? ((S = !0),
              v.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                v.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : (3 == m.nid
                ? ((a = new r.CZ.WHISPER()),
                  (a.receiver = "NPC:setautopick"),
                  (a.msg = "0"))
                : ((a = new r.CZ.NOTIFY_UPDATEINFO()),
                  (a.id = 35),
                  (a.value = 1)),
              q.sendPacket(a));
          break;
        case "autopots":
          if (S) {
            v.showMessageBox(
              "You are temporarily restricted from clicking.",
              "ok",
            );
            break;
          }
          P++;
          1 === P &&
            setTimeout(function () {
              P = 0;
            }, 5e3);
          30 < P
            ? ((S = !0),
              v.showMessageBox(
                "Click limit exceeded. You are restricted for 10s.",
                "ok",
              ),
              setTimeout(function () {
                S = !1;
                v.showMessageBox(
                  "Restriction lifted. You can click again.",
                  "ok",
                );
              }, 1e4))
            : (3 == m.nid
                ? ((a = new r.CZ.WHISPER()),
                  (a.receiver = "NPC:setautoeat"),
                  (a.msg = "0"))
                : ((a = new r.CZ.NOTIFY_UPDATEINFO()),
                  (a.id = 36),
                  (a.value = 1)),
              q.sendPacket(a));
          break;
        case "autofollow":
          if (n.talk) return !1;
          S
            ? v.showMessageBox(
                "You are temporarily restricted from clicking.",
                "ok",
              )
            : (P++,
              1 === P &&
                setTimeout(function () {
                  P = 0;
                }, 5e3),
              30 < P
                ? ((S = !0),
                  v.showMessageBox(
                    "Click limit exceeded. You are restricted for 10s.",
                    "ok",
                  ),
                  setTimeout(function () {
                    S = !1;
                    v.showMessageBox(
                      "Restriction lifted. You can click again.",
                      "ok",
                    );
                  }, 1e4))
                : (3 == m.nid
                    ? ((a = new r.CZ.WHISPER()),
                      (a.receiver = "NPC:setfollow"),
                      (a.msg = "0"))
                    : ((a = new r.CZ.NOTIFY_UPDATEINFO()),
                      (a.id = 37),
                      (a.value = 1)),
                  q.sendPacket(a)));
      }
    };
    return v.addComponent(x);
  },
);
