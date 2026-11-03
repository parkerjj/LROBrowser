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
      l = a("Network/PacketStructure");
    a("DB/Status/StatusInfo");
    var h = a("DB/DBManager"),
      r = a("DB/AgencyTable");
    a("Renderer/Renderer");
    var t = a("UI/UIManager"),
      n = a("UI/UIComponent");
    a("UI/Components/WorldMap/WorldMap");
    a("UI/Components/ItemInfo/ItemInfo");
    var g = a("UI/Components/ItemObtain/ItemObtain"),
      p = a("text!./BookingDescription.html");
    a = a("text!./BookingDescription.css");
    var k = new n("BookingDescription", p, a);
    k.type = 0;
    k.uid = -1;
    k.aid = -1;
    k.cid = -1;
    k.name = "";
    k.state = 0;
    k.title = "";
    k.needFocus = !0;
    k.mapname = "";
    k.onAppend = function () {};
    k.onRemove = function () {};
    k.init = function () {
      this.ui.css({ zIndex: 65 });
      this.ui.on("click", function () {
        k.remove();
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".border").on("click", function () {
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".close").on("click", function () {
        k.remove();
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".join").on("click", function () {
        k.remove();
        event.stopImmediatePropagation();
        if (0 == k.type) {
          if (d.hasParty && d.partyLeaderAID != k.aid)
            return (g.setMsg("\u8bf7\u9000\u51fa\u961f\u4f0d"), !1);
          if (d.hasParty)
            ((a = new l.CZ.PRIVATE_AIRSHIP_REQUEST()),
              (a.mapname = k.mapname),
              (a.itemid = 14527));
          else {
            var a = new l.CZ.PARTY_REQ_MASTER_TO_JOIN();
            a.CID = k.cid;
            a.AID = k.aid;
          }
        } else
          ((a = new l.CZ.REQ_ENTER_INSTANCE()),
            (a.CID = k.cid),
            (a.AID = k.aid),
            (a.instanceName = k.title));
        e.sendPacket(a);
        return !1;
      });
    };
    k.setBook = function (a) {
      k.type = a.Type;
      if (0 == a.Type) {
        k.mapname = a.WorldName;
        var e = UrlTools.decode(a.CharName.replaceAll("%20", " "));
        k.name = e;
        this.ui.find(".containers .content ul").empty();
        this.ui
          .find(".containers .content ul")
          .append("\x3cp\x3e\u62db\u52df\u6761\u4ef6\uff1a\x3c/p\x3e");
        var f = b(a.IID);
        k.title = f;
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
          (k.name = e),
          this.ui.find(".containers .content ul").empty(),
          this.ui
            .find(".containers .content ul")
            .append("\x3cp\x3e\u62db\u52df\u6761\u4ef6\uff1a\x3c/p\x3e"),
          (f = b(a.IID)),
          (k.title = f),
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
    return t.addComponent(k);
  },
);
