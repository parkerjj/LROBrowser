define(
  "UI/Components/Intro/Preferences",
  "Utils/jquery Core/Configs Core/Context Core/Preferences Preferences/Audio Preferences/Graphics".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    function h() {
      var a = c.isFullScreen();
      "full" === m.screensize
        ? a || c.requestFullScreen()
        : (a && c.cancelFullScreen(),
          c.Is.POPUP &&
            ((a = m.screensize.split("x")),
            a[0] != window.innerWidth &&
              a[1] != window.innerHeight &&
              (window.resizeTo(a[0], a[1]),
              window.moveTo(
                (screen.availWidth - a[0]) / 2,
                (screen.availHeight - a[1]) / 2,
              ))));
      b.get("_serverEditMode") &&
        ("serverlist" === r.serverdef
          ? b.set("servers", r.serverlist)
          : b.set("servers", "data/" + r.serverfile));
      b.set("saveFiles", r.saveFiles);
      b.set("quality", m.quality);
    }
    var r = d.get(
      "Window",
      {
        serverfile: "clientinfo.xml",
        serverlist: [],
        serverdef: "serverfile",
        save: !0,
      },
      1.1,
    );
    return {
      save: function (a) {
        m.screensize = a.find(".screensize").val();
        m.quality = a.find(".quality").val();
        m.cursor = a.find(".cursor:checked").length ? !0 : !1;
        r.saveFiles = a.find(".save:checked").length ? !0 : !1;
        var c = a.find(".servers"),
          d,
          t = c.find("tr").length,
          l;
        if (b.get("_serverEditMode"))
          for (
            r.serverdef = a.find(".serverdef:checked").val(),
              r.serverfile = a.find(".clientinfo").val(),
              r.serverlist = [],
              d = 0;
            d < t;
            ++d
          )
            ((l = c.find("tr:eq(" + d + ")")),
              r.serverlist.push({
                display: l.find(".display").val(),
                address: l.find(".address").val().split(":")[0],
                port: parseInt(l.find(".address").val().split(":")[1], 10),
                version: l.find(".version").val(),
                langtype: l.find(".langtype").val(),
                packetver: l.find(".packetver").val(),
              }));
        e.BGM.volume = a.find(".bgmvol").val() / 100;
        e.BGM.play = 0 < e.BGM.volume ? !0 : !1;
        e.Sound.volume = a.find(".soundvol").val() / 100;
        e.Sound.play = 0 < e.Sound.volume ? !0 : !1;
        e.save();
        m.save();
        r.save();
        h();
      },
      load: function (d) {
        "full" !== m.screensize ||
          c.isFullScreen() ||
          (m.screensize = "800x600");
        d.find(".screensize").val(m.screensize);
        d.find(".quality").val(m.quality).trigger("change");
        d.find(".serverdef").attr("checked", !1);
        d.find(".cursor").attr("checked", m.cursor);
        d.find('.serverdef[value\x3d"' + r.serverdef + '"]')
          .attr("checked", "true")
          .trigger("click");
        d.find(".clientinfo").val(r.serverfile);
        d.find(".bgmvol")
          .val(100 * e.BGM.volume)
          .trigger("change");
        d.find(".soundvol")
          .val(100 * e.Sound.volume)
          .trigger("change");
        window.requestFileSystem || window.webkitRequestFileSystem
          ? b.get("saveFiles")
            ? d.find(".save").attr("checked", r.saveFiles ? "checked" : !1)
            : d.find(".save").attr("disabled", "disabled")
          : (b.set("saveFiles", !1),
            d.find(".save").attr("disabled", "disabled"));
        var k,
          g = r.serverlist,
          t = d.find(".servers").empty(),
          l = a(
            '\x3ctr\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"display"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"address"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"version"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"langtype"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"packetver"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cbutton class\x3d"btn_delete"\x3e\x3c/button\x3e\x3c/td\x3e\x3c/tr\x3e',
          );
        d = 0;
        for (k = g.length; d < k; ++d) {
          var f = l.clone();
          f.find(".display").val(g[d].display);
          f.find(".address").val(g[d].address + ":" + g[d].port);
          f.find(".version").val(g[d].version);
          f.find(".langtype").val(g[d].langtype);
          f.find(".packetver").val(g[d].packetver);
          t.append(f);
        }
        h();
      },
    };
  },
);
