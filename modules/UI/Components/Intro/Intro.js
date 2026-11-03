define(
  "UI/Components/Intro/Intro",
  "require Utils/jquery Controls/KeyEventHandler UI/UIManager UI/UIComponent text!./Intro.html text!./Intro.css Core/Context Core/Configs ./Particle ./Preferences ./FileSystem".split(
    " ",
  ),
  function (a) {
    function b(a) {
      function b(a) {
        a.length &&
          (f.files.push.apply(f.files, a),
          f.ui.find(".msg").text(f.files.length + " files selected"));
      }
      function d(a, c) {
        a.isFile
          ? (++k,
            a.file(function (d) {
              d.fullPath = a.fullPath.substr(c);
              n.push(d);
              ++m === k && h === g && b(n);
            }))
          : a.isDirectory &&
            (++g,
            a.createReader().readEntries(function (a) {
              for (var e = 0, f = a.length; e < f; ++e) d(a[e], c);
              ++h === g && m === k && b(n);
            }));
      }
      var e,
        g = 0,
        h = 0,
        k = 0,
        m = 0,
        n = [];
      a.stopImmediatePropagation();
      c(this).removeClass("over");
      if ("files" in this) {
        if (this.files.length) {
          var l =
            "webkitRelativePath" in this.files[0]
              ? "webkitRelativePath"
              : "relativePath" in this.files[0]
                ? "relativePath"
                : null;
          if (l) {
            e = this.files.length;
            var p = /^[^(\/|\\)]+(\/|\\)/;
            for (a = 0; a < e; ++a)
              this.files[a].fullPath = this.files[a][l].replace(p, "");
          }
        }
        b(this.files);
        return !1;
      }
      if (a.originalEvent.dataTransfer) {
        l = a.originalEvent.dataTransfer;
        if (l.items && l.items.length && l.items[0].webkitGetAsEntry) {
          p = 1;
          a = l.items[0].webkitGetAsEntry();
          1 === l.items.length &&
            a.isDirectory &&
            (p = a.fullPath.split("/")[1].length + 2);
          a = 0;
          for (e = l.items.length; a < e; ++a)
            d(l.items[a].webkitGetAsEntry(), p);
          return !1;
        }
        if (l.files) return (b(l.files), !1);
      }
      b(n);
      return !1;
    }
    var c = a("Utils/jquery"),
      d = a("Controls/KeyEventHandler"),
      e = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      h = a("text!./Intro.html"),
      r = a("text!./Intro.css"),
      t = a("Core/Context"),
      n = a("Core/Configs"),
      g = a("./Particle"),
      p = a("./Preferences"),
      k = a("./FileSystem"),
      f = new l("Intro", h, r);
    f.files = [];
    f.onKeyDown = function (a) {
      return a.which === d.ESCAPE
        ? (t.isFullScreen() && t.cancelFullScreen(),
          a.stopImmediatePropagation(),
          !1)
        : !0;
    };
    f.init = function () {
      n.get("servers") || n.set("_serverEditMode", !0);
      var d = this.ui;
      c("style:first").append(
        [
          "#intro .intro { background-image:url(" +
            a.toUrl("./images/background.jpg") +
            "); }",
          "#intro .ribbon { background-image:url(" +
            a.toUrl("./images/ribbon.png") +
            "); }",
          "#intro .box { background-image:url(" +
            a.toUrl("./images/box.jpg") +
            "); }",
          "#intro .btn_play { background-image:url(" +
            a.toUrl("./images/play.png") +
            "); }",
          "#intro .btn_play:hover { background-image:url(" +
            a.toUrl("./images/play-down.png") +
            "); }",
          "#intro .btn_add { background-image:url(" +
            a.toUrl("./images/add-server.jpg") +
            "); }",
          "#intro .btn_save { background-image:url(" +
            a.toUrl("./images/save.jpg") +
            "); }",
          "#intro .btn_delete { background-image:url(" +
            a.toUrl("./images/delete.png") +
            "); }",
        ].join("\n"),
      );
      f.ui.find(".icon img").attr("src", a.toUrl("./images/icon.png"));
      f.ui.find(".btn_about img").attr("src", a.toUrl("./images/about.png"));
      f.ui
        .find(".btn_settings img")
        .attr("src", a.toUrl("./images/settings.png"));
      new Image().src = a.toUrl("./images/play-down.png");
      d.find(".btn_about").mousedown(function () {
        var a = d.find(".overlay.about");
        a.show()
          .animate({ opacity: 1 }, 200)
          .click(function () {
            a.animate({ opacity: 0 }, 200, function () {
              a.hide();
            });
          });
      });
      d.find(".btn_settings").mousedown(function () {
        p.load(d);
        d.find(".overlay.settings").show().animate({ opacity: 1 }, 200);
      });
      d.find(".box")
        .mouseover(function () {
          c(this).addClass("over");
        })
        .mouseout(function () {
          c(this).removeClass("over");
        })
        .click(function () {
          d.find('input[type\x3d"file"]').click();
        })
        .on("drop", b)
        .on("dragover", function () {
          c(this).addClass("over");
          return !1;
        })
        .on("dragleave", function () {
          c(this).removeClass("over");
          return !1;
        });
      d.find('input[type\x3d"file"]').on("change", b);
      d.find(".quality").on("change", function () {
        d.find(".quality_result").text(this.value + "%");
      });
      d.find(".clean").click(function () {
        var b = c(this).hide().parent();
        b.append(
          '\x3cspan\x3e\x3cimg src\x3d"' +
            a.toUrl("./images/loading.gif") +
            '"/\x3e \x3ci\x3eCleaning cache...\x3c/i\x3e\x3c/span\x3e',
        );
        k.cleanup(function () {
          b.find("span").remove();
          f.ui.find(".msg").text("");
        });
      });
      d.find(".overlay").on(
        "click",
        'input[type\x3d"text"], a, button',
        function (a) {
          "INPUT" === this.nodeName && this.select();
          a.stopImmediatePropagation();
        },
      );
      n.get("_serverEditMode") || d.find(".serveredit").hide();
      d.find(".bgmvol").on("change", function () {
        d.find(".bgmvol_result").text(this.value + "%");
      });
      d.find(".soundvol").on("change", function () {
        d.find(".soundvol_result").text(this.value + "%");
      });
      d.find(".btn_add").on("click", function () {
        var a = d.find(".servers"),
          b = a.find("tr").length;
        a.append(
          '\x3ctr\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"display" value\x3d"Server ' +
            b +
            '"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"address" value\x3d"127.0.0.1:6900"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"version"value\x3d"22"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"langtype" value\x3d"12"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cinput type\x3d"text" class\x3d"packetver"value\x3d"auto"/\x3e\x3c/td\x3e\t\x3ctd\x3e\x3cbutton class\x3d"btn_delete"\x3e\x3c/button\x3e\x3c/td\x3e\x3c/tr\x3e',
        );
        a.find("tr :eq(" + b + ") input:first").focus();
      });
      d.find(".btn_save").on("click", function () {
        p.save(d);
        d.find(".overlay").animate({ opacity: 0 }, 200, function () {
          d.find(".overlay").hide();
        });
      });
      d.find(".serverlist tbody").on("click", ".btn_delete", function () {
        c(this).parent().parent().remove();
      });
      d.find(".btn_play").click(function () {
        d.find(".overlay.loading").show().animate({ opacity: 1 }, 200);
        f.onFilesSubmit(f.files);
      });
    };
    f.onAppend = function () {
      t.Is.POPUP || this.ui.find(".resolution").hide();
      this.ui.find(".clean").hide();
      k.getSize(
        function (a) {
          a &&
            ((a =
              1073741824 < a
                ? (a / 1024 / 1024 / 1024).toFixed(2) + " Go saved"
                : 1048576 < a
                  ? (a / 1024 / 1024).toFixed(2) + " Mo saved"
                  : (a / 1024).toFixed(2) + " Mo saved"),
            this.ui.find(".msg").text(a),
            this.ui.find(".clean").show());
        }.bind(this),
      );
      var a = c(window),
        b = this.ui.find(".intro");
      a.on("resize.intro", function () {
        b.css(
          "transform",
          "scale(" +
            a.width() / b.width() +
            "," +
            a.height() / b.height() +
            ")",
        );
      });
      a.trigger("resize.intro");
      g.init(100, this.ui.find("canvas")[0]);
    };
    f.onRemove = function () {
      c(window).off("resize.intro");
      g.stop();
      this.ui.find(".overlay").hide();
    };
    f.onFilesSubmit = function () {};
    return e.addComponent(f);
  },
);
