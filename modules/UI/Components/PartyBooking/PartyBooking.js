define(
  "UI/Components/PartyBooking/PartyBooking",
  "require DB/DBManager DB/AgencyTable Utils/jquery Renderer/MapRenderer Engine/SessionStorage Network/NetworkManager Network/PacketStructure Core/Client UI/UIManager UI/UIComponent UI/Components/PartyBookingReg/PartyBookingReg UI/Components/BookingDescription/BookingDescription UI/Components/ItemObtain/ItemObtain text!./PartyBooking.html text!./PartyBooking.css".split(
    " ",
  ),
  function (a) {
    function b(a) {
      for (var b = Object.keys(d[c.nid]), e = 0; e < b.length; e++)
        for (var f = Object.keys(d[c.nid][e].nav), g = 0; g < f.length; g++)
          if (a == d[c.nid][e].nav[g].id) return d[c.nid][e].nav[g].name;
    }
    var c = a("DB/DBManager"),
      d = a("DB/AgencyTable"),
      e = a("Utils/jquery");
    a("Renderer/MapRenderer");
    var m = a("Engine/SessionStorage");
    a("Network/NetworkManager");
    a("Network/PacketStructure");
    var h = a("Core/Client"),
      r = a("UI/UIManager"),
      q = a("UI/UIComponent"),
      k = a("UI/Components/PartyBookingReg/PartyBookingReg"),
      g = a("UI/Components/BookingDescription/BookingDescription"),
      t = a("UI/Components/ItemObtain/ItemObtain"),
      l = a("text!./PartyBooking.html");
    a = a("text!./PartyBooking.css");
    var f = new q("PartyBooking", l, a),
      n = [],
      p = [],
      v = 0,
      u = 1,
      A = 1,
      D = !1;
    f.init = function () {
      this.ui.on("click", function () {
        event.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".titlebar .close").on("click", function () {
        f.ui.hide();
      });
      this.ui.find(".page .prev").on("click", function () {
        --u;
        0 >= u && (u = 1);
        f.setBooks();
      });
      this.ui.find(".page .next").on("click", function () {
        u += 1;
        u > A && (u = A);
        f.setBooks();
      });
      this.ui.find(".titlebar .tabs").on("click", "button", function () {
        e(".titlebar .tabs button.sd").removeClass("sd");
        e(this).addClass("sd");
        v = e(this).index();
        var a = new FormData();
        a.append("AuthToken", m.AuthToken);
        a.append("AID", m.Entity.GID);
        a.append("GDID", m.Entity.GUID);
        a.append("WorldName", "lastro");
        $.ajax({
          url: "https://game.lastro.cn/" + c.webpath + "/party/list",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {
            f.setList(a);
          })
          .fail(function (a) {
            r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
          });
      });
      this.ui.find(".footer .signin").on("click", function () {
        t.setMsg("\u65e0\u6cd5\u4f7f\u7528");
      });
      this.ui.find(".footer .signinstance").on("click", function () {
        m.hasParty
          ? m.isPartyLeader
            ? (k.setType(1), k.append())
            : t.setMsg("\u53ea\u6709\u961f\u957f\u80fd\u767b\u8bb0")
          : t.setMsg("\u8bf7\u521b\u5efa\u961f\u4f0d");
      });
      this.ui.find(".footer .edit").on("click", function () {
        var a = new FormData();
        a.append("AuthToken", m.AuthToken);
        a.append("AID", m.Entity.GID);
        a.append("GDID", m.Entity.GUID);
        a.append("WorldName", "lastro");
        $.ajax({
          url: "https://game.lastro.cn/" + c.webpath + "/party/get",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {
            k.setType(a.data.Type);
            k.append();
            k.onUpdate(a.data);
          })
          .fail(function (a) {
            r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
          });
      });
      this.ui.find(".content").on("click", ".book", function () {
        var a = parseInt(this.getAttribute("data-aid"), 10),
          b = parseInt(this.getAttribute("data-gid"), 10);
        if (a) {
          var d = new FormData();
          d.append("AuthToken", m.AuthToken);
          d.append("AID", m.Entity.GID);
          d.append("GDID", m.Entity.GUID);
          d.append("QueryAID", a);
          d.append("WorldName", "lastro");
          $.ajax({
            url: "https://game.lastro.cn/" + c.webpath + "/party/info",
            type: "POST",
            cache: !1,
            data: d,
            processData: !1,
            contentType: !1,
          })
            .done(function (c) {
              g.remove();
              g.append();
              g.aid = a;
              g.cid = b;
              g.setBook(c.data);
            })
            .fail(function (a) {
              r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
            });
        } else r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
      });
      this.ui.find(".seachBooking").on("change", function () {
        var a = new FormData();
        a.append("AuthToken", m.AuthToken);
        a.append("AID", m.AID);
        a.append("GDID", m.Entity.GUID);
        a.append("GID", m.GID);
        a.append("WorldName", "lastro");
        a.append("Assist", 1);
        a.append("Dealer", 1);
        a.append("Healer", 1);
        a.append("Tanker", 1);
        a.append("MinLV", 1);
        a.append("MaxLV", 200);
        a.append("Memo", UrlTools.encode(e(this).val()));
        $.ajax({
          url: "https://game.lastro.cn/" + c.webpath + "/party/search",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {
            f.setList(a);
          })
          .fail(function (a) {
            r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
          });
      });
    };
    f.onAppend = function () {};
    f.onRemove = function () {
      this.ui.find(".titlebar .seachBooking").val("");
      this.ui.hide();
    };
    f.toggle = function () {};
    f.clean = function () {};
    f.setList = function (a) {
      this.ui.is(":visible") || this.ui.show();
      this.getMyBook();
      this.focus();
      var b = m.Entity;
      this.ui.find(".titlebar .left span.level").text(b.clevel);
      n = [];
      n = a.data;
      f.setBooks();
    };
    f.getMyBook = function () {
      var a = new FormData();
      a.append("AuthToken", m.AuthToken);
      a.append("AID", m.Entity.GID);
      a.append("GDID", m.Entity.GUID);
      a.append("WorldName", "lastro");
      $.ajax({
        url: "https://game.lastro.cn/" + c.webpath + "/party/get",
        type: "POST",
        cache: !1,
        data: a,
        processData: !1,
        contentType: !1,
      })
        .done(function (a) {
          a.data
            ? ((D = !0),
              f.ui.find(".footer .signinstance").hide(),
              f.ui.find(".footer .edit").show())
            : ((D = !1),
              f.ui.find(".footer .signinstance").show(),
              f.ui.find(".footer .edit").hide());
        })
        .fail(function (a) {
          r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
        });
    };
    f.setBooks = function () {
      p = [];
      f.ui.find(".container .content").empty();
      0 == u && (u = 1);
      switch (v) {
        case 0:
          for (var a = 0; a < n.length; a++)
            n[a] && 0 == n[a].ISTATE && p.push(n[a]);
          break;
        case 1:
          for (a = 0; a < n.length; a++)
            n[a] && 1 == n[a].ISTATE && p.push(n[a]);
          break;
        case 2:
          for (a = 0; a < n.length; a++)
            !n[a] ||
              (n[a].AID != m.AID && n[a].AID != m.partyLeaderAID) ||
              p.push(n[a]);
      }
      for (a = 10 * (u - 1); a < 10 * (u - 1) + 10; a++)
        p[a] && f.addBook(p[a]);
      this.setPage();
    };
    f.setPage = function () {
      A = Math.ceil(p.length / 10);
      u > A && (u = A);
      this.ui.find(".currentPage").text(u);
      this.ui.find(".totalPages").text(A);
      this.ui.find(".page").show();
    };
    f.addBook = function (a) {
      if (0 == a.Type)
        var d = a.AID == m.AID ? "myself" : "",
          g = e(
            '\x3cdiv class\x3d"book ' +
              d +
              '" data-aid\x3d"' +
              a.AID +
              '" data-gid\x3d"' +
              a.GID +
              '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"head"\x3e\x3cdiv class\x3d"left"\x3e\x3cdiv class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"38" height\x3d"32" /\x3e\x3c/div\x3e\x3cp class\x3d"title"\x3e' +
              UrlTools.decode(a.Memo.replaceAll("%20", " ")) +
              '\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cp class\x3d"rewardPoint"\x3e' +
              a.MinLV +
              " ~ " +
              a.MaxLV +
              '\x3c/p\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cdiv class\x3d"left"\x3e\x3cp class\x3d"shortdesc"\x3e\u961f\u957f\u540d\u79f0\uff1a' +
              UrlTools.decode(a.CharName.replaceAll("%20", " ")) +
              "\x3c/p\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e",
          );
      else
        var k = b(a.IID),
          d = a.AID == m.AID ? "myself" : "",
          g = e(
            '\x3cdiv class\x3d"book ' +
              d +
              '" data-aid\x3d"' +
              a.AID +
              '" data-gid\x3d"' +
              a.GID +
              '"\x3e\x3cdiv class\x3d"border"\x3e\x3cdiv class\x3d"head"\x3e\x3cdiv class\x3d"left"\x3e\x3cdiv class\x3d"icon"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" width\x3d"38" height\x3d"32" /\x3e\x3c/div\x3e\x3cp class\x3d"title"\x3e\u3010' +
              UrlTools.decode(a.CharName.replaceAll("%20", " ")) +
              "\u3011 " +
              k +
              '\u526f\u672c\x3c/p\x3e\x3c/div\x3e\x3cdiv class\x3d"right"\x3e\x3cp class\x3d"rewardPoint"\x3e' +
              a.MinLV +
              " ~ " +
              a.MaxLV +
              '\x3c/p\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"bottom"\x3e\x3cdiv class\x3d"left"\x3e\x3cp class\x3d"shortdesc"\x3e' +
              UrlTools.decode(a.Memo.replaceAll("%20", " ")) +
              "\x3c/p\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e",
          );
      f.ui.find(".container .content").append(g);
      h.loadFile(
        c.INTERFACE_PATH + "achievement_re/icon_add_friend.bmp",
        function (a) {
          g.find(".head .left .icon img").attr("src", a);
        },
      );
    };
    f.reload = function () {
      var a = new FormData();
      a.append("AuthToken", m.AuthToken);
      a.append("AID", m.Entity.GID);
      a.append("GDID", m.Entity.GUID);
      a.append("WorldName", "lastro");
      $.ajax({
        url: "https://game.lastro.cn/" + c.webpath + "/party/list",
        type: "POST",
        cache: !1,
        data: a,
        processData: !1,
        contentType: !1,
      })
        .done(function (a) {
          f.ui.find(".titlebar .seachBooking").val("");
          f.setList(a);
        })
        .fail(function (a) {
          r.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
        });
    };
    f.clear = function () {
      if (D) {
        var a = new FormData();
        a.append("AuthToken", m.AuthToken);
        a.append("AID", m.Entity.GID);
        a.append("GDID", m.Entity.GUID);
        a.append("WorldName", "lastro");
        $.ajax({
          url: "https://game.lastro.cn/" + c.webpath + "/party/del",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {})
          .fail(function (a) {});
      }
    };
    return r.addComponent(f);
  },
);
