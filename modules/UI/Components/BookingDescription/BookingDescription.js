define(
  "UI/Components/BookingDescription/BookingDescription",
  "require Utils/jquery Core/Client Engine/SessionStorage Network/NetworkManager Network/PacketStructure DB/Status/StatusInfo DB/DBManager DB/AgencyTable Renderer/Renderer UI/UIManager UI/UIComponent UI/Components/WorldMap/WorldMap UI/Components/ItemInfo/ItemInfo UI/Components/ItemObtain/ItemObtain text!./BookingDescription.html text!./BookingDescription.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      for (var b = Object.keys(r[h.nid]), c = 0; c < b.length; c++)
        for (var d = Object.keys(r[h.nid][c].nav), e = 0; e < d.length; e++)
          if (a == r[h.nid][c].nav[e].id) return r[h.nid][c].nav[e].name;
    }
    var c = a("Utils/jquery");
    a("Core/Client");
    var d = a("Engine/SessionStorage"),
      e = a("Network/NetworkManager"),
      m = a("Network/PacketStructure");
    a("DB/Status/StatusInfo");
    var h = a("DB/DBManager"),
      r = a("DB/AgencyTable");
    a("Renderer/Renderer");
    var q = a("UI/UIManager"),
      k = a("UI/UIComponent");
    a("UI/Components/WorldMap/WorldMap");
    a("UI/Components/ItemInfo/ItemInfo");
    var g = a("UI/Components/ItemObtain/ItemObtain"),
      t = a("text!./BookingDescription.html");
    a = a("text!./BookingDescription.css");
    var l = new k("BookingDescription", t, a);
    l.type = 0;
    l.uid = -1;
    l.aid = -1;
    l.cid = -1;
    l.name = "";
    l.state = 0;
    l.title = "";
    l.needFocus = !0;
    l.mapname = "";
    l.onAppend = function () {};
    l.onRemove = function () {};
    l.init = function () {
      this.ui.css({ zIndex: 65 });
      this.ui.on("click", function () {
        l.remove();
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".border").on("click", function () {
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".close").on("click", function () {
        l.remove();
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".join").on("click", function () {
        l.remove();
        event.stopImmediatePropagation();
        if (0 == l.type) {
          if (d.hasParty && d.partyLeaderAID != l.aid)
            return (g.setMsg("\u8bf7\u9000\u51fa\u961f\u4f0d"), !1);
          if (d.hasParty)
            ((a = new m.CZ.PRIVATE_AIRSHIP_REQUEST()),
              (a.mapname = l.mapname),
              (a.itemid = 14527));
          else {
            var a = new m.CZ.PARTY_REQ_MASTER_TO_JOIN();
            a.CID = l.cid;
            a.AID = l.aid;
          }
        } else
          ((a = new m.CZ.REQ_ENTER_INSTANCE()),
            (a.CID = l.cid),
            (a.AID = l.aid),
            (a.instanceName = l.title));
        e.sendPacket(a);
        return !1;
      });
    };
    l.setBook = function (a) {
      l.type = a.Type;
      if (0 == a.Type) {
        l.mapname = a.WorldName;
        var e = UrlTools.decode(a.CharName.replaceAll("%20", " "));
        l.name = e;
        this.ui.find(".containers .content ul").empty();
        this.ui
          .find(".containers .content ul")
          .append("\x3cp\x3e\u62db\u52df\u6761\u4ef6\uff1a\x3c/p\x3e");
        var f = b(a.IID);
        l.title = f;
        e = c(
          "\x3cli\x3e\u961f\u957f\u540d\u79f0\uff1a" +
            e +
            "\x3c/li\x3e\x3cli\x3e\u7b49\u7ea7\u8303\u56f4\uff1a" +
            a.MinLV +
            " ~ " +
            a.MaxLV +
            "\x3c/li\x3e\x3cli\x3e\u76ee\u6807\u5730\u56fe\uff1a" +
            UrlTools.decode(a.WorldName.replaceAll("%20", " ")) +
            "\x3c/li\x3e\x3cli\x3e\u5907\u6ce8\u5185\u5bb9\uff1a" +
            UrlTools.decode(a.Memo.replaceAll("%20", " ")) +
            "\x3c/li\x3e",
        );
        this.ui.find(".containers .content ul").append(e);
        this.ui.find(".btns .btn.join").hide();
        (!d.hasParty || (d.hasParty && d.partyLeaderAID != a.AID)) &&
          this.ui
            .find(".btns .btn.join")
            .show()
            .text("\u52a0\u5165\u961f\u4f0d");
        d.partyLeaderAID == a.AID &&
          (d.AID == a.AID ? d.GID == a.GID : 1) &&
          this.ui
            .find(".btns .btn.join")
            .show()
            .text("\u524d\u5f80\u5730\u56fe");
      } else
        ((e = UrlTools.decode(a.CharName.replaceAll("%20", " "))),
          (l.name = e),
          this.ui.find(".containers .content ul").empty(),
          this.ui
            .find(".containers .content ul")
            .append("\x3cp\x3e\u62db\u52df\u6761\u4ef6\uff1a\x3c/p\x3e"),
          (f = b(a.IID)),
          (l.title = f),
          (e = c(
            "\x3cli\x3e\u961f\u957f\u540d\u79f0\uff1a" +
              e +
              "\x3c/li\x3e\x3cli\x3e\u526f\u672c\u73a9\u6cd5\uff1a" +
              f +
              "\x3c/li\x3e\x3cli\x3e\u7b49\u7ea7\u8303\u56f4\uff1a" +
              a.MinLV +
              " ~ " +
              a.MaxLV +
              "\x3c/li\x3e\x3cli\x3e\u5907\u6ce8\u5185\u5bb9\uff1a" +
              UrlTools.decode(a.Memo.replaceAll("%20", " ")) +
              "\x3c/li\x3e",
          )),
          this.ui.find(".containers .content ul").append(e),
          this.ui.find(".btns .btn.join").hide(),
          0 == a.ISTATE &&
            this.ui
              .find(".btns .btn.join")
              .show()
              .text("\u52a0\u5165\u961f\u4f0d"),
          d.partyLeaderAID == a.AID &&
            (d.AID == a.AID ? d.GID == a.GID : 1) &&
            this.ui
              .find(".btns .btn.join")
              .show()
              .text("\u8fdb\u5165\u526f\u672c"));
    };
    return q.addComponent(l);
  },
);
