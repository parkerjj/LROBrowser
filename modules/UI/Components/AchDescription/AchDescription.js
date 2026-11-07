define(
  "UI/Components/AchDescription/AchDescription",
  "require Utils/jquery Core/Client Network/NetworkManager Network/PacketStructure DB/Status/StatusInfo DB/DBManager Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/WorldMap/WorldMap UI/Components/ItemInfo/ItemInfo text!./AchDescription.html text!./AchDescription.css".split(
    " ",
  ),
  function (a) {
    var b = a("Utils/jquery");
    a("Core/Client");
    var c = a("Network/NetworkManager"),
      d = a("Network/PacketStructure"),
      e = a("DB/Status/StatusInfo"),
      m = a("DB/DBManager");
    a("Renderer/Renderer");
    var h = a("UI/UIManager"),
      r = a("UI/UIComponent"),
      q = a("UI/Components/WorldMap/WorldMap"),
      k = a("UI/Components/ItemInfo/ItemInfo"),
      g = a("text!./AchDescription.html");
    a = a("text!./AchDescription.css");
    var t = new r("AchDescription", g, a);
    t.uid = -1;
    t.needFocus = !0;
    t.onAppend = function () {};
    t.onRemove = function () {};
    t.init = function () {
      this.ui.css({ zIndex: 65 });
      this.ui.on("click", function () {
        t.remove();
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".border").on("click", function () {
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".close").on("click", function () {
        t.remove();
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".btns .raward").on("click", function () {
        var a = new d.CZ.REQ_ACH_REWARD();
        a.achievementID = t.uid;
        c.sendPacket(a);
        t.remove();
      });
      this.ui.find(".border").on("click", ".goto", function () {
        q.select();
        q.selectMap(b(this).text());
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".border").on("click", ".smob", function () {
        q.select();
        q.selectMob(b(this).text());
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".border").on("click", ".sitem", function () {
        q.select();
        q.selectItem(b(this).text());
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".border").on("click", ".item", function () {
        var a = parseInt(this.getAttribute("data-itid"), 10),
          b = m.getItemInfo(a);
        b &&
          (k.uid != a
            ? (k.append(),
              (b.ITID = a),
              (b.IsIdentified = 1),
              (k.uid = a),
              (k.item_ = b),
              (k.type = "AchDescription"),
              k.setItem(b))
            : k.remove());
      });
    };
    t.setAch = function (a) {
      var c =
        a.title +
        (a.Completed ? "(\u5df2\u8fbe\u6210)" : "(\u672a\u8fbe\u6210)");
      t.ui.find(".titlebar .text").text(c);
      t.ui.find(".containers .details").html(a.content[0].details);
      c = Object.keys(a.resource[0]);
      t.ui.find(".containers .content ul").empty();
      t.ui
        .find(".containers .content ul")
        .append("\x3cp\x3e\u6761\u4ef6\uff1a\x3c/p\x3e");
      for (var d = 0; d < c.length; d++) {
        var g = c[d],
          g = b(
            (a.resource[0][g].mlv
              ? "\x3cli\x3e\u89d2\u8272\u7b49\u7ea7" +
                a.resource[0][g].mlv +
                "\u4ee5\u4e0a\x3c/li\x3e"
              : "") +
              "\x3cli\x3e" +
              a.resource[0][g].text +
              "\x3c/li\x3e",
          );
        t.ui.find(".containers .content ul").append(g);
      }
      a.reward[0] &&
        (Object.keys(a.reward),
        t.ui
          .find(".containers .content ul")
          .append("\x3cp\x3e\u5956\u52b1\uff1a\x3c/p\x3e"),
        a.reward[0].buff &&
          ((g = b(
            "\x3cli\x3e\u72b6\u6001\uff1a" +
              e[a.reward[0].buff].descript[0][0] +
              "\x3c/li\x3e",
          )),
          t.ui.find(".containers .content ul").append(g)),
        a.reward[0].item &&
          (c = m.getItemInfo(a.reward[0].item)) &&
          "Unknown Item" != c.identifiedDiSPlayName &&
          ((g = b(
            '\x3cli\x3e\u9053\u5177\uff1a\x3cspan class\x3d"item" data-itid\x3d"' +
              a.reward[0].item +
              '"\x3e' +
              c.identifiedDiSPlayName +
              "\x3c/span\x3e\x3c/li\x3e",
          )),
          t.ui.find(".containers .content ul").append(g)));
      a.Completed && 0 < a.reward.length && 0 == a.rewarded
        ? t.ui.find(".btns .raward").show()
        : t.ui.find(".btns .raward").hide();
    };
    return h.addComponent(t);
  },
);
