define(
  "UI/Components/CardConnection/CardConnection2",
  "require DB/DBManager DB/Card_Connection_db2 Utils/jquery Network/NetworkManager Network/PacketStructure Core/Client UI/UIManager UI/UIComponent UI/Components/Inventory/Inventory UI/Components/ItemInfo/ItemInfo UI/Components/InputBox/InputBox UI/Components/ItemObtain/ItemObtain text!./CardConnection2.html text!./CardConnection2.css".split(
    " ",
  ),
  function (a) {
    function b(a, b) {
      if (0 <= a) {
        if (void 0 == v[a])
          return (
            g.showMessageBox("\u5361\u7247\u6570\u636e\u4e0d\u5168", "ok"),
            !1
          );
        u = a;
        A = 0 < b ? b : 1;
        p.ui.find(".tabs button.sd").removeClass("sd");
        p.ui.find(".tabs button").eq(a).addClass("sd");
        0 < a
          ? ((D = Object.keys(v[u].data).length),
            p.ui.find(".header").hide(),
            p.ui.find(".tag").show(),
            p.ui.find(".page").hide(),
            p.ui.find(".totalPages").text(D),
            p.setPage())
          : (p.ui.find(".header").show(),
            p.ui.find(".tag").hide(),
            p.ui.find(".page").hide(),
            p.setCards());
      } else
        -1 == a
          ? ((u = a),
            p.ui.find(".tabs button.sd").removeClass("sd"),
            p.ui.find('.tabs button[data-tab\x3d"' + a + '"]').addClass("sd"),
            p.ui.find(".header").hide(),
            p.ui.find(".tag").hide(),
            p.ui.find(".page").hide(),
            p.setCards2())
          : ((u = 0),
            p.ui.find(".header").show(),
            p.ui.find(".tag").hide(),
            p.ui.find(".page").hide(),
            p.setCards());
    }
    function c(a) {
      (a = parseInt(this.parentNode.getAttribute("data-itid"), 10)) ||
        (a = parseInt(
          this.parentNode.parentNode.getAttribute("data-itid"),
          10,
        ));
      var b = e.getItemInfo(a);
      b.ITID = a;
      b.IsIdentified = 1;
      b.type = 6;
      b &&
        (f.uid != b.ITID
          ? (f.append(),
            (f.uid = b.ITID),
            (f.type = "CardConnection2"),
            f.setItem(b))
          : f.remove());
    }
    function d(a) {
      (a = parseInt(this.getAttribute("data-itid"), 10)) ||
        (a = parseInt(this.parentNode.getAttribute("data-itid"), 10));
      var b = e.getItemInfo(a);
      b.ITID = a;
      b.IsIdentified = 1;
      b.type = 3;
      b &&
        (f.uid != b.ITID
          ? (f.append(),
            (f.uid = b.ITID),
            (f.type = "CardConnection2"),
            f.setItem(b))
          : f.remove());
    }
    var e = a("DB/DBManager"),
      m = a("DB/Card_Connection_db2"),
      h = a("Utils/jquery"),
      r = a("Network/NetworkManager"),
      q = a("Network/PacketStructure"),
      k = a("Core/Client"),
      g = a("UI/UIManager"),
      t = a("UI/UIComponent"),
      l = a("UI/Components/Inventory/Inventory"),
      f = a("UI/Components/ItemInfo/ItemInfo");
    a("UI/Components/InputBox/InputBox");
    a("UI/Components/ItemObtain/ItemObtain");
    var n = a("text!./CardConnection2.html");
    a = a("text!./CardConnection2.css");
    var p = new t("CardConnection2", n, a),
      v = [],
      u = 0,
      A = 1,
      D = 1,
      B = [],
      O = 0;
    p.init = function () {
      this.ui.find(".titlebar .close").on("click", function () {
        p.ui.hide();
      });
      this.ui.find(".tabs").on("click", "button", function () {
        b(h(this).data("tab"));
      });
      this.ui.find(".tag").on("click", ".radio-label", function () {
        O = h(this).index();
        b(u);
      });
      this.ui.find(".menus").on("click", function () {
        h("#basicbutton").addClass("open").show();
      });
      this.ui.find(".page").on("click", ".prev", function () {
        1 < A && (--A, p.setPage());
      });
      this.ui.find(".page").on("click", ".next", function () {
        A < D && ((A += 1), p.setPage());
      });
      this.ui.find(".content").on("contextmenu", ".item .title,.item .icon", c);
      this.ui.find(".container").on("click", ".material", d);
      this.ui.find(".titlebar .search_btn").on("click", function () {
        var a = p.ui.find(".search .msg").val();
        if ("" == a) return !1;
        B = [];
        for (var c = 1; c < v.length; c++)
          for (var d = Object.keys(v[c].data), f = 0; f < d.length; f++)
            for (var g = 0; g < v[c].data[d[f]].cards.length; g++) {
              var h = v[c].data[d[f]].cards[g],
                k = v[c].data[d[f]].recharge[g];
              if (String(h).includes(a))
                ((h = { tab: c, level: d[f], id: h, charge: k }), B.push(h));
              else {
                var l = e.getItemInfo(h);
                l &&
                  l.identifiedDiSPlayName.includes(a) &&
                  ((h = { tab: c, level: d[f], id: h, charge: k }), B.push(h));
              }
            }
        b(-1);
      });
      this.ui.find(".content").on("click", ".item .recharge", function () {
        var a = h(this).data("tab"),
          b = h(this).data("level"),
          c = h(this).data("itid"),
          d = e.getItemInfo(c);
        g.showPromptBox(
          "\u6d88\u8017\u4e00\u5f20" +
            d.identifiedDiSPlayName +
            "\u8fdb\u884c\u5145\u80fd\u5417\uff1f",
          "ok",
          "cancel",
          function () {
            var d = new q.CZ.REQUEST_CARDCONNECTION_RECHARGE();
            d.tab = a;
            d.level = b;
            d.cardid = c;
            r.sendPacket(d);
          },
          null,
        );
      });
      this.ui.find(".content").on("click", ".item .addmyDeck", function () {
        var a = h(this).data("tab"),
          b = h(this).data("level"),
          c = h(this).data("itid"),
          d = e.getItemInfo(c);
        g.showPromptBox(
          "\u5c06" +
            d.identifiedDiSPlayName +
            "\u6dfb\u52a0\u5230\u6211\u7684\u5361\u7ec4\u5417\uff1f",
          "ok",
          "cancel",
          function () {
            var d = new q.CZ.REQUEST_CARDCONNECTION_ADDMYDECK();
            d.tab = a;
            d.level = b;
            d.cardid = c;
            r.sendPacket(d);
          },
          null,
        );
      });
      this.ui.find(".content").on("click", ".item .cancel", function () {
        var a = h(this).data("tab"),
          b = h(this).data("level"),
          c = h(this).data("itid"),
          d = e.getItemInfo(c);
        g.showPromptBox(
          "\u4ece\u6211\u7684\u5361\u7ec4\u91cc\u79fb\u9664" +
            d.identifiedDiSPlayName +
            "\uff1f",
          "ok",
          "cancel",
          function () {
            var d = new q.CZ.REQUEST_CARDCONNECTION_CANCEL();
            d.tab = a;
            d.level = b;
            d.cardid = c;
            r.sendPacket(d);
          },
          null,
        );
      });
      this.setList();
      b(0);
    };
    p.onAppend = function () {
      b(0);
    };
    p.onRemove = function () {};
    p.toggle = function () {
      this.ui.is(":visible") ? this.remove() : (this.append(), this.focus());
    };
    p.rechargeList = function (a) {
      for (var c = 0; c < a.classInfos.length; c++) {
        var d = a.classInfos[c].enable,
          e = a.classInfos[c].data;
        if (v[c])
          if (0 == c)
            ((v[c].enable = d),
              (v[c].data[1].activate = e[0].activate),
              (v[c].data[1].cards[0] = e[0].recharge0),
              (v[c].data[1].cards[1] = e[0].recharge1),
              (v[c].data[1].cards[2] = e[0].recharge2),
              (v[c].data[1].cards[3] = e[0].recharge3),
              (v[c].data[1].cards[4] = e[0].recharge4),
              (v[c].data[1].cards[5] = e[0].recharge5),
              (v[c].data[1].cards[6] = e[0].recharge6),
              (v[c].data[1].cards[7] = e[0].recharge7));
          else
            for (v[c].enable = d, d = 0; d < e.length; d++)
              ((v[c].data[d + 1].activate = e[d].activate),
                (v[c].data[d + 1].recharge[0] = e[d].recharge0),
                (v[c].data[d + 1].recharge[1] = e[d].recharge1),
                (v[c].data[d + 1].recharge[2] = e[d].recharge2),
                (v[c].data[d + 1].recharge[3] = e[d].recharge3),
                (v[c].data[d + 1].recharge[4] = e[d].recharge4),
                (v[c].data[d + 1].recharge[5] = e[d].recharge5),
                (v[c].data[d + 1].recharge[6] = e[d].recharge6),
                (v[c].data[d + 1].recharge[7] = e[d].recharge7));
      }
      b();
    };
    p.updateList = function (a) {
      if (0 < a.state) {
        for (var c = 0; c < v[a.tab].data[a.level].cards.length; c++)
          if (v[a.tab].data[a.level].cards[c] == a.cardid) {
            v[a.tab].data[a.level].recharge[c] = a.state;
            break;
          }
        if (2 == a.state)
          for (c = 0; c < v[0].data[1].cards.length; c++)
            if (0 == v[0].data[1].cards[c]) {
              v[0].data[1].cards[c] = a.cardid;
              break;
            }
        for (c = 0; c < B.length; c++)
          if (B[c].id == a.cardid) {
            B[c].charge = a.state;
            break;
          }
        -1 == u ? b(-1) : b(u, A);
      }
    };
    p.setActivate = function (a) {
      a.state && ((v[a.tab].data[a.level].activate = 1), b());
    };
    p.setEnable = function (a) {
      v[0].enable = a.state;
      b();
    };
    p.setList = function () {
      var a = JSON.parse(JSON.stringify(m[e.nid])),
        b;
      for (b in a) v.push(a[b]);
    };
    p.setCards = function () {
      p.ui.find(".content").empty();
      if (0 == u)
        for (
          var a = v[u].data[A].cards, b = v[u].data[A].recharge, c = 0;
          c < a.length;
          c++
        )
          p.addCards(a[c], b[c], A);
      else
        switch (O) {
          case 0:
            for (
              var a = v[u].data, d = Object.keys(v[u].data), c = 0;
              c < d.length;
              c++
            )
              for (
                var e = Object.keys(a[d[c]].cards), f = 0;
                f < e.length;
                f++
              ) {
                var g = a[d[c]].cards[e[f]],
                  b = a[d[c]].recharge[e[f]];
                p.addCards(g, b, d[c]);
              }
            break;
          case 1:
            a = v[u].data;
            d = Object.keys(v[u].data);
            for (c = 0; c < d.length; c++)
              for (e = Object.keys(a[d[c]].cards), f = 0; f < e.length; f++)
                ((g = a[d[c]].cards[e[f]]),
                  (b = a[d[c]].recharge[e[f]]),
                  0 < b && p.addCards(g, b, d[c]));
            break;
          case 2:
            for (
              a = v[u].data, d = Object.keys(v[u].data), c = 0;
              c < d.length;
              c++
            )
              for (e = Object.keys(a[d[c]].cards), f = 0; f < e.length; f++)
                ((g = a[d[c]].cards[e[f]]),
                  (b = a[d[c]].recharge[e[f]]),
                  l.getItemById(g) && 0 == b && p.addCards(g, b, d[c]));
        }
    };
    p.setCards2 = function () {
      p.ui.find(".content").empty();
      for (var a = 0; a < B.length; a++) p.addCards2(B[a]);
    };
    p.addCards = function (a, b, c) {
      if (0 == a) return !1;
      var d = this.ui.find(".content"),
        f = e.getItemInfo(a);
      if (0 == u)
        d.append(
          '\x3cdiv class\x3d"item" data-itid\x3d"' +
            a +
            '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"title"\x3e\x3cdiv class\x3d"name"\x3e' +
            f.identifiedDiSPlayName +
            '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"main" data-itid\x3d"' +
            a +
            '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"detailed"\x3e\x3cbutton class\x3d"cancel" data-itid\x3d"' +
            a +
            '" data-tab\x3d"' +
            u +
            '" data-level\x3d"' +
            c +
            '"\x3e\u53d6\u6d88\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
        );
      else {
        var g = "",
          h = "";
        switch (b) {
          case 0:
            g = "recharge";
            h = "\u5145\u80fd";
            break;
          case 1:
            g = "addmyDeck";
            h = "\u6dfb\u52a0";
            break;
          case 2:
            ((g = "addmyDeckly"), (h = "\u5df2\u6dfb\u52a0"));
        }
        d.append(
          '\x3cdiv class\x3d"item" data-itid\x3d"' +
            a +
            '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"title"\x3e\x3cdiv class\x3d"name"\x3e' +
            f.identifiedDiSPlayName +
            '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"main" data-itid\x3d"' +
            a +
            '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"detailed"\x3e\x3cbutton class\x3d"' +
            g +
            '" data-itid\x3d"' +
            a +
            '" data-tab\x3d"' +
            u +
            '" data-level\x3d"' +
            c +
            '"' +
            ("addmyDeckly" == g ? "disabled" : "") +
            "\x3e" +
            h +
            "\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e",
        );
      }
      k.loadFile(
        e.INTERFACE_PATH + "cardbmp/" + f.illustResourcesName + ".bmp",
        function (b) {
          d.find('.item[data-itid\x3d"' + a + '"] .icon').css(
            "backgroundImage",
            "url(" + b + ")",
          );
        },
      );
    };
    p.addCards2 = function (a) {
      if (0 == a.id) return !1;
      var b = this.ui.find(".content"),
        c = e.getItemInfo(a.id);
      if (-1 == u) {
        var d = "",
          f = "";
        switch (a.charge) {
          case 0:
            d = "recharge";
            f = "\u5145\u80fd";
            break;
          case 1:
            d = "addmyDeck";
            f = "\u6dfb\u52a0";
            break;
          case 2:
            ((d = "addmyDeckly"), (f = "\u5df2\u6dfb\u52a0"));
        }
        b.append(
          '\x3cdiv class\x3d"item" data-itid\x3d"' +
            a.id +
            '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"title"\x3e\x3cdiv class\x3d"name"\x3e' +
            c.identifiedDiSPlayName +
            '\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"main" data-itid\x3d"' +
            a.id +
            '"\x3e\x3cdiv class\x3d"icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"detailed"\x3e\x3cbutton class\x3d"' +
            d +
            '" data-itid\x3d"' +
            a.id +
            '" data-tab\x3d"' +
            a.tab +
            '" data-level\x3d"' +
            a.level +
            '"' +
            ("addmyDeckly" == d ? "disabled" : "") +
            "\x3e" +
            f +
            "\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e",
        );
      }
      k.loadFile(
        e.INTERFACE_PATH + "cardbmp/" + c.illustResourcesName + ".bmp",
        function (c) {
          b.find('.item[data-itid\x3d"' + a.id + '"] .icon').css(
            "backgroundImage",
            "url(" + c + ")",
          );
        },
      );
    };
    p.removeCard = function (a) {
      this.ui
        .find(".content")
        .find('.item[data-itid\x3d"' + a.cardid + '"]')
        .remove();
      for (
        var b = a.tab, c = a.level, d = a.cardid, e = 0;
        e < v[b].data[c].cards.length;
        e++
      )
        if (v[b].data[c].cards[e] == d) {
          v[b].data[c].recharge[e] = a.state;
          break;
        }
      for (b = 0; b < v[0].data[1].cards.length; b++)
        if (v[0].data[1].cards[b] == a.cardid) {
          v[0].data[1].cards[b] = 0;
          break;
        }
      for (e = 0; e < B.length; e++)
        if (B[e].id == a.cardid) {
          B[e].charge = a.state;
          break;
        }
    };
    p.setPage = function () {
      var a = v[u].data[A].effect;
      p.ui.find(".effect .head .lvl").text(A);
      p.ui.find(".effect .bottom p").html(a);
      this.ui.find(".activate").data("tab", u).data("level", A);
      this.ui.find(".enable").data("tab", u).data("level", A);
      this.ui.find(".currentPage").text(A);
      var a = v[u].data[A].activate,
        b = v[u].enable;
      p.ui.find(".effect .head .right button").hide();
      a
        ? b == A
          ? p.ui.find(".effect .head .enabled").show()
          : p.ui.find(".effect .head .enable").show()
        : p.ui.find(".effect .head .activate").show();
      0 < O && p.ui.find(".page").hide();
      p.setCards();
    };
    return g.addComponent(p);
  },
);
