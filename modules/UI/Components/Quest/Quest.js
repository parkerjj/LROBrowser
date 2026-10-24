define(
  "UI/Components/Quest/Quest",
  "require Network/NetworkManager Network/PacketStructure DB/DBManager DB/Items/ItemType Utils/jquery Utils/PathFinding Core/Client Core/Preferences Renderer/Renderer Renderer/MapRenderer Renderer/EntityManager Controls/MouseEventHandler Engine/SessionStorage UI/UIManager UI/UIComponent UI/Components/MiniMap/MiniMap UI/Components/Inventory/Inventory UI/Components/InputBox/InputBox UI/Components/ItemInfo/ItemInfo UI/Components/ChatBox/ChatBox UI/Components/ItemObtain/ItemObtain UI/Components/WorldMap/WorldMap AC/CG02 text!./Quest.html text!./Quest.css".split(
    " ",
  ),
  function (a) {
    function b() {
      event.stopImmediatePropagation();
    }
    var c = a("DB/DBManager"),
      d = a("Network/NetworkManager"),
      e = a("Network/PacketStructure");
    a("DB/Items/ItemType");
    var m = a("Utils/jquery"),
      h = a("Utils/PathFinding");
    a("Core/Client");
    var r = a("Core/Preferences");
    a("Renderer/Renderer");
    var q = a("Renderer/MapRenderer"),
      k = a("Renderer/EntityManager");
    a("Controls/MouseEventHandler");
    var g = a("Engine/SessionStorage"),
      t = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("UI/Components/MiniMap/MiniMap"),
      n = a("UI/Components/Inventory/Inventory");
    a("UI/Components/InputBox/InputBox");
    a("UI/Components/ItemInfo/ItemInfo");
    a("UI/Components/ChatBox/ChatBox");
    var p = a("UI/Components/ItemObtain/ItemObtain"),
      v = a("UI/Components/WorldMap/WorldMap"),
      u = a("AC/CG02"),
      A = a("text!./Quest.html"),
      D = a("text!./Quest.css"),
      B = new l("Quest", A, D);
    B.TAB = { Received: 0, QuestList: 1 };
    B.list = [];
    var O;
    B.ready = 0;
    var C = r.get(
      "Quest",
      {
        x: 200,
        y: 300,
        width: 6,
        height: 9,
        show: !0,
        reduce: !1,
        tab: B.TAB.Received,
        noshow: [],
      },
      1.1,
    );
    B.init = function () {
      this.ui.find(".tabs button").on("click", function () {
        B.SwitchTab(m(this).index());
        event.stopImmediatePropagation();
      });
      this.ui.find(".titlebar .close").on("click", function () {
        B.toggle();
        event.stopImmediatePropagation();
      });
      this.ui.find(".inbox").on("click", "li", b);
      C.tab = 0;
      this.ui.find(".menus").on("click", function () {
        m("#basicbutton").addClass("open").show();
      });
      this.ui.find(".container").on("click", ".task .show_quest", function (b) {
        b = m(this).data("questid");
        var d = c.getQuestInfo(b);
        if (!d) return !1;
        if (m(this).prop("checked")) {
          d.show = !0;
          p.setMsg("\u663e\u793a\u4efb\u52a1");
          for (var d = C.noshow, e = 0; e < d.length; e++)
            d[e] == b && d.splice(e, 1);
        } else
          ((d.show = !1),
            p.setMsg("\u9690\u85cf\u4efb\u52a1"),
            C.noshow.push(b));
        C.save();
        a("UI/Components/miniQuest/miniQuest").updateQList();
      });
      this.ui.find(".container").on("click", ".task .gotask", function (a) {
        for (
          var b = -1, d = m(this).data("questid"), e = 0;
          e < B.list.length;
          e++
        )
          if (B.list[e].questID == d) {
            b = e;
            break;
          }
        if (0 <= b) {
          var f = c.getQuestInfo(d);
          if (f && 0 < f.path.length)
            return (
              (a = q.currentMap.replace(/\.gat$/i, "")),
              f.outset[0] != a
                ? t.showPromptBox(
                    "\u786e\u5b9a\u524d\u5f80\u4efb\u52a1\u5730\u56fe\u5417\uff1f",
                    "ok",
                    "cancel",
                    function () {
                      B.run(f, d);
                      B.ui.hide();
                    },
                    null,
                  )
                : (B.run(f, d), B.ui.hide()),
              !1
            );
        }
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".container").on("click", ".task .smob", function () {
        v.select();
        v.selectMob(m(this).text());
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".container").on("click", ".task .sitem", function () {
        v.select();
        v.selectItem(m(this).text());
        event.stopImmediatePropagation();
        return !1;
      });
    };
    B.run = function (b, l) {
      function m() {
        var a = q.currentMap,
          c = C.noMapsame,
          a = a.replace(/\.gat$/i, "");
        if (
          a == D[P - 1][0] &&
          g.Entity.position[0] == D[P - 1][1] &&
          g.Entity.position[1] == D[P - 1][2]
        ) {
          clearInterval(O);
          if (b.npc) {
            a = C.getObjList(b.npc);
            if (null == a) return !1;
            if (k.getFocusEntity()) k.getFocusEntity().onFocusEnd();
            k.setFocusEntity(a);
            a.onFocus();
            a.onMouseDown();
          }
          return !1;
        }
        if ((a == r && 0 == c && B.changePos) || S) {
          S = 0;
          B.changePos = !1;
          f.moving(1, r, u, v);
          if (t >= D.length - 1) return ((r = ""), !1);
          t += 1;
          r = D[t][0];
          u = D[t][1];
          v = D[t][2];
        }
      }
      var r = "",
        t = -1,
        u = 0,
        v = 0;
      event.stopImmediatePropagation();
      clearInterval(O);
      if (
        (l = (function (a) {
          for (var b = 0; b < B.list.length; b++)
            if (B.list[b].questID == a) return B.list[b];
        })(l))
      ) {
        for (var y = 0; y < l.count; y++)
          if (l.hunt[y].huntCount < l.hunt[y].maxCount)
            return (
              p.setMsg(
                "\u6d88\u706d " +
                  l.hunt[y].mobName +
                  " [ " +
                  l.hunt[y].huntCount +
                  " / " +
                  l.hunt[y].maxCount +
                  " ]",
              ),
              this.ui.is(":visible") ||
                (this.append(), this.focus(), this.reloadList()),
              !1
            );
        l = b.lv;
        if (g.Entity.clevel < l)
          return (
            p.setMsg(
              "\u4efb\u52a1\u6761\u4ef6\u89d2\u8272\u7b49\u7ea7\u5927\u4e8e" +
                l +
                "\u7ea7",
            ),
            this.ui.is(":visible") ||
              (this.append(), this.focus(), this.reloadList()),
            !1
          );
        l = b.jlv;
        if (g.Character.joblevel < l)
          return (
            p.setMsg(
              "\u4efb\u52a1\u6761\u4ef6\u804c\u4e1a\u7b49\u7ea7\u5927\u4e8e" +
                l +
                "\u7ea7",
            ),
            this.ui.is(":visible") ||
              (this.append(), this.focus(), this.reloadList()),
            !1
          );
        l = b.items;
        y = 0;
        if (0 < l.length)
          for (var z = 0; z < l.length; z++) {
            var y = 0,
              A = n.getItemById(l[z][0]);
            A &&
              (4 == A.type || 5 == A.type
                ? (y = 1)
                : A.count >= l[z][1] && (y = 1));
            if (0 == y)
              return (
                (y = c.getItemInfo(l[z][0])),
                p.setMsg(
                  "\u9700\u8981\u6536\u96c6" +
                    l[z][1] +
                    " \u4e2a " +
                    y.identifiedDiSPlayName,
                ),
                this.ui.is(":visible") ||
                  (this.append(), this.focus(), this.reloadList()),
                !1
              );
          }
        if (g.zeny < b.zeny)
          return (
            p.setMsg(
              "\u9700\u8981\u51c6\u5907 " + b.zeny + " \u6e38\u620f\u5e01 ",
            ),
            this.ui.is(":visible") ||
              (this.append(), this.focus(), this.reloadList()),
            !1
          );
      }
      var C = a("UI/Components/vbk/vbk");
      l = q.currentMap.replace(/\.gat$/i, "");
      var D = b.path,
        P = D.length,
        z = JSON.parse(JSON.stringify(D)),
        N = (y = 0),
        S = 0;
      if (0 < P) {
        if (b.breakpoint) {
          do {
            y = 0;
            A = z.shift();
            if (
              l == A[0] &&
              ((t = N),
              (r = A[0]),
              (u = A[1]),
              (v = A[2]),
              0 <
                h.searchNavigate(
                  g.Entity.position[0] | 0,
                  g.Entity.position[1] | 0,
                  u | 0,
                  v | 0,
                  [],
                ))
            ) {
              y = 1;
              break;
            }
            N += 1;
          } while (0 != z.length);
        } else
          for (z = 0; z < D.length; z++)
            if (l == D[z][0]) {
              y = 1;
              t = z;
              break;
            }
        if (y)
          ((r = D[t][0]),
            (u = D[t][1]),
            (v = D[t][2]),
            l == r && (S = 1),
            (O = setInterval(m, 200)));
        else {
          y = b.position;
          for (z = 0; z < y.length; z++) if (y[z] == l) return !1;
          b.outset.length &&
            ((y = new e.CZ.PRIVATE_AIRSHIP_REQUEST()),
            (y.mapname = b.outset[0]),
            (y.x = b.outset[1]),
            (y.y = b.outset[2]),
            (y.type = 1),
            (y.itemid = 14527),
            d.sendPacket(y),
            (t = 0),
            (r = D[t][0]),
            (u = D[t][1]),
            (v = D[t][2]),
            l == r && (S = 1),
            (O = setInterval(m, 200)));
        }
      }
      return !1;
    };
    B.onAppend = function () {
      B.ready = 1;
      B.changePos = !0;
      this.SwitchTab(0);
    };
    B.clean = function () {
      B.ready = 0;
      this.ui.find(".container .content").empty();
      this.ui.find(".notask").show();
    };
    B.onRemove = function () {
      this.ui.hide();
    };
    B.clearWalk = function () {
      clearInterval(O);
    };
    B.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && (this.focus(), B.reloadList());
    };
    B.resetpos = function () {
      this.ui.css("top", "");
      this.ui.css("left", "");
    };
    B.setList = function (a) {
      this.list.length = 0;
      this.ui.find(".container .content").empty();
      this.list = a.QuestList;
      if (0 < B.list.length)
        for (B.ui.find(".notask").hide(), a = 0; a < B.list.length; a++)
          B.addQuest(B.list[a]);
      else B.ui.find(".notask").show();
    };
    B.reloadList = function () {
      for (var a = 0; a < B.list.length; a++) {
        var b = B.list[a],
          d = c.getQuestInfo(b.questID);
        if (d && 0 < d.items.length)
          for (var d = d.items, e = 0; e < d.length; e++) {
            var f = n.getItemById(d[e][0]);
            f &&
              B.ui
                .find(
                  '.task[data-questID\x3d"' +
                    b.questID +
                    '"] .itemnum[data-itemID\x3d"' +
                    d[e][0] +
                    '"]',
                )
                .text(
                  " [ " +
                    f.count +
                    " / " +
                    d[e][1] +
                    " ] " +
                    (f.count == d[e][1] ? "[\u5b8c\u6210]" : ""),
                );
          }
      }
    };
    B.addList = function (a) {
      for (var b = 0; b < B.list.length; b++)
        if (B.list[b].questID == a.questID) return !1;
      this.list.push(a);
      B.addQuest(a);
      0 < B.list.length
        ? B.ui.find(".notask").hide()
        : B.ui.find(".notask").show();
    };
    B.addQuest = function (a) {
      var b, d, e, f, g, h;
      e = q.currentMap.replace(/\.gat$/i, "");
      b = c.getQuestInfo(a.questID);
      if (!b || !b.display) return !1;
      B.ready && b && b.cg && b.questPos[0] == e && u.render(a.questID);
      if (b) {
        e = "";
        switch (b.type) {
          case 1:
            e = "[\u5267\u60c5]";
            break;
          case 2:
            e = "[\u652f\u7ebf]";
            break;
          case 3:
            e = "[\u6307\u5f15]";
            break;
          case 4:
            e = "[\u526f\u672c]";
            break;
          case 5:
            e = "[\u804c\u4e1a]";
            break;
          case 6:
            e = "[\u59d4\u6258]";
            break;
          case 7:
            e = "[\u8d4f\u91d1]";
        }
        f = !1;
        g = !0;
        if ((h = c.getQuestInfo(a.questID))) {
          0 < h.path.length && (f = !0);
          var k;
          a: {
            k = C.noshow;
            for (d = 0; d < k.length; d++)
              if (k[d] == a.questID) {
                k = !0;
                break a;
              }
            k = !1;
          }
          k && ((g = !1), (h.show = !1));
        }
        this.ui
          .find(".container .content")
          .append(
            '\x3cdiv class\x3d"task" data-questid\x3d"' +
              a.questID +
              '"\x3e\x3cdiv class\x3d"head"\x3e\x3cdiv class\x3d"left"\x3e\x3cinput class\x3d"show_quest" type\x3d"checkbox" data-questid\x3d"' +
              a.questID +
              '" ' +
              (1 == g ? "checked" : "") +
              "/\x3e\x3cp\x3e" +
              e +
              "[" +
              b.name +
              ']\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cbutton class\x3d"gotask ' +
              (0 == f ? "off" : "on") +
              '" data-questid\x3d"' +
              a.questID +
              '" ' +
              (0 == f ? "disabled" : "") +
              '\x3e\u524d\u5f80\x3c/button\x3e\x3cbutton class\x3d"cancel" data-questid\x3d"' +
              a.questID +
              '" style\x3d"display:none"\x3e\u53d6\u6d88\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cp\x3e' +
              b.desc +
              '\x3c/p\x3e\x3cdiv class\x3d"mob"\x3e\x3c/div\x3e\x3cdiv class\x3d"items"\x3e\x3c/div\x3e\x3cdiv class\x3d"datetime"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
          );
        for (e = 0; e < a.count; e++)
          ((f = a.hunt[e].mobName),
            B.ui
              .find('.task[data-questID\x3d"' + a.questID + '"] .mob')
              .append(
                '\x3cp\x3e\x3cspan class\x3d"mobname"\x3e\u6d88\u706d \x3cspan class\x3d"smob"\x3e' +
                  f +
                  '\x3c/span\x3e\x3c/span\x3e\x3cspan class\x3d"mobnum"\x3e [ ' +
                  a.hunt[e].huntCount +
                  " / " +
                  a.hunt[e].maxCount +
                  " ] " +
                  (a.hunt[e].huntCount == a.hunt[e].maxCount
                    ? "[\u5b8c\u6210]"
                    : "") +
                  "\x3c/span\x3e\x3c/p\x3e",
              ));
        b = b.items;
        for (e = 0; e < b.length; e++)
          ((f = n.getItemById(b[e][0])),
            (g = c.getItemInfo(b[e][0])),
            f
              ? B.ui
                  .find('.task[data-questID\x3d"' + a.questID + '"] .items')
                  .append(
                    '\x3cp\x3e\x3cspan class\x3d"itemname"\x3e\u6536\u96c6 \x3cspan class\x3d"sitem"\x3e' +
                      g.identifiedDiSPlayName +
                      '\x3c/span\x3e\x3c/span\x3e\x3cspan data-itemID \x3d "' +
                      b[e][0] +
                      '" class\x3d"itemnum"\x3e [ ' +
                      f.count +
                      " / " +
                      b[e][1] +
                      " ] " +
                      (f.count == b[e][1] ? "[\u5b8c\u6210]" : "") +
                      "\x3c/span\x3e\x3c/p\x3e",
                  )
              : B.ui
                  .find('.task[data-questID\x3d"' + a.questID + '"] .items')
                  .append(
                    '\x3cp\x3e\x3cspan class\x3d"itemname"\x3e\u6536\u96c6 \x3cspan class\x3d"sitem"\x3e' +
                      g.identifiedDiSPlayName +
                      '\x3c/span\x3e\x3c/span\x3e\x3cspan data-itemID \x3d "' +
                      b[e][0] +
                      '" class\x3d"itemnum"\x3e [ 0 / ' +
                      b[e][1] +
                      " ] \x3c/span\x3e\x3c/p\x3e",
                  ));
        0 < a.quest_endTime &&
          ((k = new Date().getTime()),
          (d = new Date(1e3 * a.quest_endTime)),
          (b = d.getFullYear() + "\u5e74"),
          (e =
            (10 > d.getMonth() + 1
              ? "0" + (d.getMonth() + 1)
              : d.getMonth() + 1) + "\u6708"),
          (f = d.getDate() + "\u65e5"),
          (g = d.getHours() + "\u65f6"),
          (h = d.getMinutes() + "\u5206"),
          (d = d.getSeconds() + "\u79d2\u524d\u63d0\u4ea4\u4efb\u52a1"),
          k > 1e3 * a.quest_endTime
            ? B.ui
                .find('.task[data-questID\x3d"' + a.questID + '"] .datetime')
                .text(
                  "\u4efb\u52a1\u5df2\u8d85\u65f6\uff0c\u8bf7\u91cd\u65b0\u9886\u53d6\u4efb\u52a1",
                )
            : B.ui
                .find('.task[data-questID\x3d"' + a.questID + '"] .datetime')
                .text(
                  "\u6709\u6548\u65f6\u95f4\uff1a" + b + e + f + g + h + d,
                ));
        p.setMsg(
          "\u4efb\u52a1" +
            B.ui.find('.task[data-questID\x3d"' + a.questID + '"] h1').text(),
        );
      }
    };
    B.updateQuest = function (a) {
      for (var b, c, d = 0; d < B.list.length; d++)
        if (((b = B.list[d]), b.questID == a.questID))
          for (var e = 0; e < b.hunt.length; e++)
            b.hunt[e].QID == a.QID &&
              ((b.hunt[e].huntCount = a.count),
              (b.hunt[e].maxCount = a.maxCount),
              (c = B.ui.find('.task[data-questID\x3d"' + b.questID + '"]')),
              c
                .find(".mobnum")
                .text(
                  " [ " +
                    b.hunt[e].huntCount +
                    " / " +
                    b.hunt[e].maxCount +
                    " ] " +
                    (b.hunt[e].huntCount == b.hunt[e].maxCount
                      ? "[\u5b8c\u6210]"
                      : ""),
                ),
              p.setMsg(c.find(".mobname").text() + c.find(".mobnum").text()));
    };
    B.delQuest = function (a) {
      for (var b = 0; b < B.list.length; b++)
        B.list[b].questID == a &&
          (B.list.splice(b, 1),
          B.ui.find('.task[data-questID\x3d"' + a + '"]').remove());
      0 < B.list.length
        ? B.ui.find(".notask").hide()
        : B.ui.find(".notask").show();
    };
    B.SwitchTab = function (a) {
      C.tab = parseInt(a, 10);
      m("#Quest .tabs button.sd").removeClass("sd");
      m("#Quest .tabs button").eq(a).addClass("sd");
      this.ui.find(".container").hide().eq(a).show();
    };
    B.onShortCut = function (a) {
      if (this.ui)
        switch (a.cmd) {
          case "TOGGLE":
            (this.ui.toggle(), this.ui.is(":visible") && this.focus());
        }
    };
    return t.addComponent(B);
  },
);
