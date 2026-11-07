define(
  "UI/Components/PartyBookingReg/PartyBookingReg",
  "require Utils/jquery Renderer/MapRenderer Engine/SessionStorage DB/DBManager DB/AgencyTable Network/PacketStructure Network/NetworkManager Controls/KeyEventHandler Renderer/Renderer Core/Preferences UI/UIManager UI/UIComponent UI/Components/ItemObtain/ItemObtain text!./PartyBookingReg.html text!./PartyBookingReg.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = u.ui.find(".container .itype option:selected").data("index"),
        b = u.ui.find(".container .iid"),
        c = Object.keys(m[e.nid][a].nav);
      b.empty();
      for (var d = 0; d < c.length; d++)
        b.append(
          "\x3coption data-index\x3d" +
            d +
            " data-id\x3d" +
            m[e.nid][a].nav[d].id +
            "\x3e" +
            m[e.nid][a].nav[d].name +
            "\x3c/option\x3e",
        );
    }
    function c(a) {
      a.stopImmediatePropagation();
      return !1;
    }
    function d() {
      if ("" == u.ui.find(".container .memo").val())
        return (f.setMsg("\u5907\u6ce8\u5185\u5bb9\u4e0d\u4e3a\u7a7a"), !1);
      if (0 == this.type) {
        var a = new FormData();
        a.append("AuthToken", k.AuthToken);
        a.append("AID", k.AID);
        a.append("GDID", k.Entity.GUID);
        a.append("GID", k.GID);
        a.append(
          "WorldName",
          UrlTools.encode(u.ui.find(".container .mapname").text()),
        );
        a.append(
          "CharName",
          UrlTools.encode(u.ui.find(".container .name").text()),
        );
        a.append("IID", 0);
        a.append("Type", 0);
        a.append("Assist", 1);
        a.append("Dealer", 1);
        a.append("Healer", 1);
        a.append("Tanker", 1);
        a.append("MinLV", u.ui.find(".container .minlvl").val());
        a.append("MaxLV", u.ui.find(".container .maxlvl").val());
        a.append("Memo", UrlTools.encode(u.ui.find(".container .memo").val()));
        a.append("ISTATE", 0);
        $.ajax({
          url: "https://game.lastro.cn/" + e.webpath + "/party/add",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {
            1 == a.Type
              ? (f.setMsg("\u62db\u52df\u4fe1\u606f\u6dfb\u52a0\u6210\u529f"),
                v("UI/Components/PartyBooking/PartyBooking").reload())
              : f.setMsg("\u62db\u52df\u4fe1\u606f\u6dfb\u52a0\u5931\u8d25");
          })
          .fail(function (a) {
            t.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
          });
        this.remove();
      } else {
        var a = u.ui.find(".container .iid").val(),
          b = new h.CZ.REQ_CREATE_INSTANCE();
        b.instanceName = a;
        r.sendPacket(b);
        return !1;
      }
    }
    a("Utils/jquery");
    var e = a("DB/DBManager"),
      m = a("DB/AgencyTable"),
      h = a("Network/PacketStructure"),
      r = a("Network/NetworkManager"),
      q = a("Renderer/MapRenderer"),
      k = a("Engine/SessionStorage");
    a("Controls/KeyEventHandler");
    a("Renderer/Renderer");
    var g = a("Core/Preferences"),
      t = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("UI/Components/ItemObtain/ItemObtain"),
      n = a("text!./PartyBookingReg.html"),
      p = a("text!./PartyBookingReg.css"),
      v = a,
      u = new l("PartyBookingReg", n, p);
    u.title = "";
    u.limit = 20;
    u.type = 0;
    u.password = "";
    var A = g.get("PartyBookingReg", { x: 480, y: 260, show: !1 }, 1);
    u.init = function () {
      this.ui
        .find(".close, .cancel")
        .mousedown(c)
        .click(this.remove.bind(this));
      this.ui.find(".ok").on("click", d.bind(this));
      this.ui.find(".update").on("click", function () {
        u.onUpdateBookingLog();
      });
      this.ui.find(".container .itype").change(b);
      this.draggable(this.ui.find(".titlebar"));
      this.ui.find(".del").on("click", function () {
        0 == u.type
          ? t.showPromptBox(
              "\u786e\u5b9a\u5220\u9664\u62db\u52df\u4fe1\u606f\u5417?",
              "ok",
              "cancel",
              function () {
                var a = new FormData();
                a.append("AuthToken", k.AuthToken);
                a.append("AID", k.Entity.GID);
                a.append("GDID", k.Entity.GUID);
                a.append("WorldName", "lastro");
                $.ajax({
                  url: "https://game.lastro.cn/" + e.webpath + "/party/del",
                  type: "POST",
                  cache: !1,
                  data: a,
                  processData: !1,
                  contentType: !1,
                })
                  .done(function (a) {
                    u.remove();
                    f.setMsg(
                      "\u62db\u52df\u4fe1\u606f\u5220\u9664\u6210\u529f",
                    );
                    v("UI/Components/PartyBooking/PartyBooking").reload();
                  })
                  .fail(function (a) {
                    t.showMessageBox(
                      "\u6570\u636e\u52a0\u8f7d\u5931\u8d25",
                      "ok",
                    );
                  });
              },
              null,
            )
          : t.showPromptBox(
              "\u786e\u5b9a\u5173\u95ed\u526f\u672c\u5417?",
              "ok",
              "cancel",
              function () {
                var a = new h.CZ.REQ_DEL_INSTANCE();
                r.sendPacket(a);
              },
              null,
            );
      });
    };
    u.setType = function (a) {
      this.type = a;
    };
    u.onAppend = function () {
      var a = k.Entity;
      u.ui.find(".container .name").text(a.display.name);
      a = "";
      u.ui.find(".container .memo").val(a);
      if (0 == this.type)
        (this.ui
          .find(".titlebar p")
          .text("\u521b\u5efa\u5192\u9669\u5bb6\u52df\u96c6"),
          u.ui.find(".container .mapinfo").show(),
          u.ui.find(".container .instance").hide(),
          (a = q.currentMap),
          this.ui.find(".mapinfo .mapname").text(a),
          (a = "[ " + e.getMapName(a) + " ] "),
          this.ui.find(".container .memo").val(a));
      else {
        this.ui
          .find(".titlebar p")
          .text("\u521b\u5efa\u6e38\u620f\u526f\u672c");
        u.ui.find(".container .mapinfo").hide();
        u.ui.find(".container .instance").show();
        var b = Object.keys(m[e.nid]),
          c = u.ui.find(".container .itype"),
          a = u.ui.find(".container .iid");
        c.empty();
        for (var d = 0; d < b.length; d++)
          c.append(
            "\x3coption data-index\x3d" +
              d +
              "\x3e" +
              m[e.nid][d].name +
              "\x3c/option\x3e",
          );
        b = Object.keys(m[e.nid][0].nav);
        a.empty();
        for (d = 0; d < b.length; d++)
          a.append(
            "\x3coption data-index\x3d" +
              d +
              " data-id\x3d" +
              m[e.nid][0].nav[d].id +
              "\x3e" +
              m[e.nid][0].nav[d].name +
              "\x3c/option\x3e",
          );
        this.ui.find(".container .memo").val("\u65e0");
      }
      this.ui.find(".container .itype").attr("disabled", !1);
      this.ui.find(".container .iid").attr("disabled", !1);
      this.ui.find(".btns .okbtn").show();
      this.ui.find(".btns .upbtn").hide();
      this.ui.find(".btns .delbtn").removeClass("alive");
    };
    u.onRemove = function () {
      this.ui.find(".titlebar p").text("\u521b\u5efa\u6e38\u620f\u526f\u672c");
      this.ui.find(".btns .delbtn").removeClass("alive");
      this.ui.find(".container .name").text("");
      this.ui.find(".container .minlvl").val("1");
      this.ui.find(".container .maxlvl").val("200");
      this.ui.find(".container .mapname").text("");
      this.ui.find(".container .memo").text("");
    };
    u.show = function () {
      this.ui.show();
      this.ui.find(".title").focus();
      A.show = !0;
    };
    u.hide = function () {
      this.ui.hide();
      A.show = !1;
    };
    u.toggle = function () {
      this.ui.is(":visible")
        ? (this.remove(), (A.show = !1))
        : (this.append(), this.focus(), (A.show = !0));
    };
    u.resetpos = function () {
      this.ui.css("top", "");
      this.ui.css("left", "");
    };
    u.onShortCut = function (a) {
      switch (a.cmd) {
        case "TOGGLE":
          this.toggle();
      }
    };
    u.onUpdate = function (a) {
      if (0 == a.Type)
        (this.ui.find(".btns .okbtn").hide(),
          this.ui.find(".btns .upbtn").show(),
          this.ui.find(".btns .delbtn").addClass("alive"),
          this.ui
            .find(".container .name")
            .text(UrlTools.decode(a.CharName.replaceAll("%20", " "))),
          this.ui.find(".container .minlvl").val(a.MinLV),
          this.ui.find(".container .maxlvl").val(a.MaxLV),
          this.ui
            .find(".container .mapname")
            .text(UrlTools.decode(a.WorldName.replaceAll("%20", " "))));
      else {
        for (
          var b = 0, c = 0, d = Object.keys(m[e.nid]), f = 0;
          f < d.length;
          f++
        )
          for (var g = Object.keys(m[e.nid][f].nav), h = 0; h < g.length; h++)
            if (a.IID == m[e.nid][f].nav[h].id) {
              b = f;
              c = h;
              break;
            }
        this.ui
          .find(".container .itype option[data-index\x3d" + b + "]")
          .prop("selected", "selected");
        g = Object.keys(m[e.nid][b].nav);
        d = u.ui.find(".container .iid");
        d.empty();
        for (f = 0; f < g.length; f++)
          d.append(
            "\x3coption data-index\x3d" +
              f +
              " data-id\x3d" +
              m[e.nid][b].nav[f].id +
              "\x3e" +
              m[e.nid][b].nav[f].name +
              "\x3c/option\x3e",
          );
        this.ui
          .find(".container .iid option[data-index\x3d" + c + "]")
          .prop("selected", "selected")
          .attr("disabled", !0);
        this.ui.find(".container .itype").attr("disabled", !0);
        this.ui.find(".container .iid").attr("disabled", !0);
        this.ui.find(".btns .okbtn").hide();
        this.ui.find(".btns .upbtn").show();
        this.ui.find(".btns .delbtn").addClass("alive");
        this.ui
          .find(".container .name")
          .text(UrlTools.decode(a.CharName.replaceAll("%20", " ")));
        this.ui.find(".container .minlvl").val(a.MinLV);
        this.ui.find(".container .maxlvl").val(a.MaxLV);
        this.ui.find(".container .istate").val(a.ISTATE);
      }
      this.ui
        .find(".container .memo")
        .val(UrlTools.decode(a.Memo.replaceAll("%20", " ")));
    };
    u.onCreateBookingLog = function (a) {
      1 == a.rs &&
        ((a = new FormData()),
        a.append("AuthToken", k.AuthToken),
        a.append("AID", k.AID),
        a.append("GDID", k.Entity.GUID),
        a.append("GID", k.GID),
        a.append("WorldName", "lastro"),
        a.append(
          "CharName",
          UrlTools.encode(u.ui.find(".container .name").text()),
        ),
        a.append(
          "IID",
          u.ui.find(".container .iid option:selected").data("id"),
        ),
        a.append("Type", 1),
        a.append("Assist", 1),
        a.append("Dealer", 1),
        a.append("Healer", 1),
        a.append("Tanker", 1),
        a.append("MinLV", u.ui.find(".container .minlvl").val()),
        a.append("MaxLV", u.ui.find(".container .maxlvl").val()),
        a.append("Memo", UrlTools.encode(u.ui.find(".container .memo").val())),
        a.append("ISTATE", 0),
        $.ajax({
          url: "https://game.lastro.cn/" + e.webpath + "/party/add",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {
            1 == a.Type
              ? (f.setMsg("\u526f\u672c\u6570\u636e\u6dfb\u52a0\u6210\u529f"),
                v("UI/Components/PartyBooking/PartyBooking").reload())
              : f.setMsg("\u526f\u672c\u6570\u636e\u6dfb\u52a0\u5931\u8d25");
          })
          .fail(function (a) {
            t.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
          }),
        this.remove());
    };
    u.onDelBookingLog = function (a) {
      1 == a.rs
        ? ((a = new FormData()),
          a.append("AuthToken", k.AuthToken),
          a.append("AID", k.Entity.GID),
          a.append("GDID", k.Entity.GUID),
          a.append("WorldName", "lastro"),
          $.ajax({
            url: "https://game.lastro.cn/" + e.webpath + "/party/del",
            type: "POST",
            cache: !1,
            data: a,
            processData: !1,
            contentType: !1,
          })
            .done(function (a) {
              1 == a.Type &&
                (u.remove(),
                f.setMsg("\u526f\u672c\u6570\u636e\u5220\u9664\u6210\u529f"),
                v("UI/Components/PartyBooking/PartyBooking").reload());
            })
            .fail(function (a) {
              t.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
            }))
        : 2 == a.rs &&
          (u.remove(),
          f.setMsg("\u526f\u672c\u6570\u636e\u5220\u9664\u6210\u529f"),
          v("UI/Components/PartyBooking/PartyBooking").reload());
    };
    u.onUpdateBookingLog = function () {
      if ("" == u.ui.find(".container .memo").val())
        return (f.setMsg("\u5907\u6ce8\u5185\u5bb9\u4e0d\u4e3a\u7a7a"), !1);
      if (0 == this.type) {
        var a = new FormData();
        a.append("AuthToken", k.AuthToken);
        a.append("AID", k.AID);
        a.append("GDID", k.Entity.GUID);
        a.append("GID", k.GID);
        a.append(
          "WorldName",
          UrlTools.encode(u.ui.find(".container .mapname").text()),
        );
        a.append(
          "CharName",
          UrlTools.encode(u.ui.find(".container .name").text()),
        );
        a.append("IID", 0);
        a.append("Type", 0);
        a.append("Assist", 1);
        a.append("Dealer", 1);
        a.append("Healer", 1);
        a.append("Tanker", 1);
        a.append("MinLV", u.ui.find(".container .minlvl").val());
        a.append("MaxLV", u.ui.find(".container .maxlvl").val());
        a.append("Memo", UrlTools.encode(u.ui.find(".container .memo").val()));
        a.append("ISTATE", 0);
        $.ajax({
          url: "https://game.lastro.cn/" + e.webpath + "/party/add",
          type: "POST",
          cache: !1,
          data: a,
          processData: !1,
          contentType: !1,
        })
          .done(function (a) {
            1 == a.Type
              ? (f.setMsg("\u62db\u52df\u4fe1\u606f\u4fee\u6539\u6210\u529f"),
                v("UI/Components/PartyBooking/PartyBooking").reload())
              : f.setMsg("\u62db\u52df\u4fe1\u606f\u4fee\u6539\u5931\u8d25");
          })
          .fail(function (a) {
            t.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
          });
      } else
        ((a = new FormData()),
          a.append("AuthToken", k.AuthToken),
          a.append("AID", k.AID),
          a.append("GDID", k.Entity.GUID),
          a.append("GID", k.GID),
          a.append("WorldName", "lastro"),
          a.append(
            "CharName",
            UrlTools.encode(u.ui.find(".container .name").text()),
          ),
          a.append(
            "IID",
            u.ui.find(".container .iid option:selected").data("id"),
          ),
          a.append("Type", 1),
          a.append("Assist", 1),
          a.append("Dealer", 1),
          a.append("Healer", 1),
          a.append("Tanker", 1),
          a.append("MinLV", u.ui.find(".container .minlvl").val()),
          a.append("MaxLV", u.ui.find(".container .maxlvl").val()),
          a.append(
            "Memo",
            UrlTools.encode(u.ui.find(".container .memo").val()),
          ),
          a.append("ISTATE", u.ui.find(".container .istate").val()),
          $.ajax({
            url: "https://game.lastro.cn/" + e.webpath + "/party/add",
            type: "POST",
            cache: !1,
            data: a,
            processData: !1,
            contentType: !1,
          })
            .done(function (a) {
              1 == a.Type
                ? (f.setMsg("\u526f\u672c\u6570\u636e\u4fee\u6539\u6210\u529f"),
                  v("UI/Components/PartyBooking/PartyBooking").reload())
                : f.setMsg("\u526f\u672c\u6570\u636e\u4fee\u6539\u5931\u8d25");
            })
            .fail(function (a) {
              t.showMessageBox("\u6570\u636e\u52a0\u8f7d\u5931\u8d25", "ok");
            }));
      this.remove();
    };
    return t.addComponent(u);
  },
);
