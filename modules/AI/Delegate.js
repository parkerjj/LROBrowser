define(
  "AI/Delegate",
  "require DB/DBManager DB/logsTable Renderer/MapRenderer Network/PacketStructure Network/NetworkManager Engine/SessionStorage UI/UIManager UI/Components/MiniMap/MiniMap UI/Components/ChatBox/ChatBox UI/Components/WorldMap/WorldMap UI/Components/Inventory/Inventory UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("DB/logsTable"),
      d = a("Renderer/MapRenderer"),
      e = a("Network/PacketStructure"),
      m = a("Network/NetworkManager"),
      h = a("Engine/SessionStorage"),
      r = a("UI/UIManager"),
      q = a("UI/Components/MiniMap/MiniMap");
    a("UI/Components/ChatBox/ChatBox");
    var k = a("UI/Components/WorldMap/WorldMap"),
      g = a("UI/Components/Inventory/Inventory");
    a("UI/Components/ItemObtain/ItemObtain");
    return {
      get_current_weather: function (a) {},
      openBackPack: function (a) {
        g.ui.is(":visible") || (g.append(), g.focus());
      },
      sendMsgTo: function (a) {
        var b = new e.CZ.WHISPER();
        b.receiver = a.cname;
        b.msg = a.msg;
        m.sendPacket(b);
      },
      SearchMob: function (a) {
        k.select();
        k.selectMob(a.cname);
      },
      SearchItem: function (a) {
        k.select();
        k.selectItem(a.cname);
      },
      SearchMap: function (a) {
        k.select();
        a.ename && k.selectMap(a.ename);
      },
      getTrainingRoute: function (a) {
        a = c[b.nid].train;
        for (var d = Object.keys(a), e = "", g = 0; g < d.length; g++)
          ((e += g + 1 + "." + a[d[g]].npc), (e += a[d[g]].desc), (e += ","));
        return (
          e +
          "\u6839\u636e\u4ee5\u4e0a\u63d0\u4f9b\u7684\u5730\u56fe\uff0c\u63a8\u8350\u5176\u4e2d\u4e00\u4e2a\u7ec3\u7ea7\u5730\u56fe\uff0c\u6761\u4ef6\u662f\u7b26\u5408\u89d2\u8272\u7b49\u7ea7\u8303\u56f4\u7684\u5730\u56fe\uff0c\u53e6\u5916\u63d0\u9192\u73a9\u5bb6\u9700\u8981\u53bb\u54ea\u4e2a\u5730\u56fe\uff0c\u53ef\u4ee5\u544a\u8bc9\u6211\u5730\u56fe\u540d\u5b57\u6216\u7f16\u53f7\u3002"
        );
      },
      getMonzyRoute: function (a) {
        a = c[b.nid].makeMonzy;
        for (var d = Object.keys(a), e = "", g = 0; g < d.length; g++)
          ((e += g + 1 + "." + a[d[g]].npc), (e += a[d[g]].desc), (e += ","));
        return (
          e +
          "\u6839\u636e\u4ee5\u4e0a\u63d0\u4f9b\u7684\u5730\u56fe\uff0c\u63a8\u8350\u5176\u4e2d\u4e00\u4e2a\u7ec3\u7ea7\u5730\u56fe\uff0c\u6761\u4ef6\u662f\u7b26\u5408\u89d2\u8272\u7b49\u7ea7\u8303\u56f4\u7684\u5730\u56fe\uff0c\u53e6\u5916\u63d0\u9192\u73a9\u5bb6\u9700\u8981\u53bb\u54ea\u4e2a\u5730\u56fe\uff0c\u53ef\u4ee5\u544a\u8bc9\u6211\u5730\u56fe\u540d\u5b57\u6216\u7f16\u53f7\u3002"
        );
      },
      goToMap: function (a) {
        var c = d.currentMap.replace(/\.gat$/i, "");
        a.ename
          ? c == a.ename && 0 < a.x && 0 < a.y
            ? r.showPromptBox(
                "\u524d\u5f80\u5750\u6807(" + a.x + "," + a.y + ")\u5417?",
                "ok",
                "cancel",
                function () {
                  q.moving(1, c, a.x, a.y);
                },
              )
            : r.showPromptBox(
                "\u5feb\u901f\u524d\u5f80" +
                  b.getMapName(a.ename + ".gat") +
                  "\u5730\u56fe\u5417?",
                "ok",
                "cancel",
                function () {
                  var b = new e.CZ.PRIVATE_AIRSHIP_REQUEST();
                  b.mapname = a.ename;
                  b.x = a.x || 0;
                  b.y = a.y || 0;
                  b.type = 1;
                  b.itemid = 14527;
                  m.sendPacket(b);
                },
                null,
              )
          : 0 < a.x &&
            0 < a.y &&
            r.showPromptBox(
              "\u524d\u5f80\u5750\u6807(" + a.x + "," + a.y + ")\u5417?",
              "ok",
              "cancel",
              function () {
                q.moving(1, c, a.x, a.y);
              },
            );
      },
      SearchNpcShopByItem: function (a) {
        var c = "",
          e = d.currentMap.replace(/\.gat$/i, "");
        a.mapname = e;
        if (a.cname) {
          a = b.SearchNpcShopByItemName(a);
          if (a.length) {
            for (e = 0; e < a.length; e++)
              ((c +=
                e +
                1 +
                "." +
                b.getMapName(a[e].map + ".gat") +
                "(" +
                a[e].map +
                ")\u7684" +
                a[e].name +
                "(\u5750\u6807" +
                a[e].location[0] +
                "," +
                a[e].location[1] +
                ")"),
                (c += ","));
            return (
              c +
              "\u5982\u679c\u4f60\u60f3\u524d\u5f80\u8d2d\u4e70\uff0c\u53ef\u4ee5\u544a\u8bc9\u6211\u51fa\u53d1\u3002"
            );
          }
          return "\u544a\u8bc9\u73a9\u5bb6\u6e38\u620f\u91cc\u6ca1\u6709\u5546\u5e97\u51fa\u552e\u6b64\u7269\u54c1\uff0c\u8ba9\u73a9\u5bb6\u63d0\u4f9b\u9053\u5177\u7684ID\uff0c\u53ef\u4ee5\u7cbe\u51c6\u641c\u7d22";
        }
        if (a.itid) {
          a = b.SearchNpcShopByItemId(a);
          if (a.length) {
            for (e = 0; e < a.length; e++)
              ((c +=
                e +
                1 +
                "." +
                b.getMapName(a[e].map + ".gat") +
                "(" +
                a[e].map +
                ")\u7684" +
                a[e].name +
                "(\u5750\u6807" +
                a[e].location[0] +
                "," +
                a[e].location[1] +
                ")"),
                (c += ","));
            return (
              c +
              "\u5982\u679c\u4f60\u60f3\u524d\u5f80\u8d2d\u4e70\uff0c\u53ef\u4ee5\u544a\u8bc9\u6211\u51fa\u53d1\u3002"
            );
          }
          return "\u544a\u8bc9\u73a9\u5bb6\u6e38\u620f\u91cc\u6ca1\u6709\u5546\u5e97\u51fa\u552e\u6b64\u7269\u54c1\uff0c\u8ba9\u73a9\u5bb6\u63d0\u4f9b\u9053\u5177\u7684ID";
        }
        return "\u544a\u8bc9\u73a9\u5bb6\u7531\u4e8e\u9053\u5177\u79cd\u7c7b\u8f83\u591a\uff0c\u4e0d\u592a\u6e05\u695a\u4f60\u8bf4\u7684\u662f\u54ea\u4e2a\u9053\u5177\uff0c\u8ba9\u73a9\u5bb6\u63d0\u4f9b\u9053\u5177\u7684ID";
      },
      reqPetFeed: function (a) {
        a = new e.CZ.COMMAND_PET();
        a.cSub = 1;
        m.sendPacket(a);
      },
      reqCounterAttack: function (a) {
        h.counterAttack = !h.counterAttack;
        return h.counterAttack
          ? "\u5f00\u542f\u81ea\u52a8\u53cd\u51fb\uff0c\u5982\u679c\u9700\u8981\u5173\u95ed\u8bf7\u544a\u8bc9\u6211"
          : "\u5173\u95ed\u81ea\u52a8\u53cd\u51fb\uff0c\u5982\u679c\u9700\u8981\u5173\u95ed\u8bf7\u544a\u8bc9\u6211";
      },
      SearchNpcByFunc: function (a) {
        if (a.cname) {
          for (
            var d = 0, e = "", g = c[b.nid].guide, h = Object.keys(g), k = 0;
            k < h.length;
            k++
          )
            g[h[k]].desc.includes(a.cname) &&
              ((d = 1),
              (e =
                "NPC\u540d\u5b57\u53eb" +
                g[h[k]].npc +
                "\uff0c\u4f4d\u4e8e\u5730\u56fe" +
                g[h[k]].path[0][0] +
                "\uff0cX\u5750\u6807" +
                g[h[k]].path[0][1] +
                "\uff0cY\u5750\u6807" +
                g[h[k]].path[0][2] +
                "\u662f\u8981\u524d\u5f80\u5417\uff1f"));
          if (1 == d) return e;
        }
      },
      getMobDbByInfo: function (a) {
        if (a.cname && ((a = b.searchMob(a.cname)), 0 < a.length)) {
          var c = new e.CZ.REQUEST_CHAT();
          c.msg = h.Entity.display.name + " : @mi " + a[0].ID;
          m.sendPacket(c);
        }
      },
    };
  },
);
