define(
  "UI/Components/ItemObtain/ItemObtain",
  "require DB/DBManager Utils/jquery Core/Client Core/Events Renderer/Renderer UI/UIManager UI/UIComponent text!./ItemObtain.html text!./ItemObtain.css".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("Utils/jquery"),
      d = a("Core/Client"),
      e = a("Core/Events");
    a("Renderer/Renderer");
    var m = a("UI/UIManager"),
      h = a("UI/UIComponent"),
      r = a("text!./ItemObtain.html");
    a = a("text!./ItemObtain.css");
    var q = new h("ItemObtain", r, a);
    q.mouseMode = h.MouseMode.CROSS;
    q.needFocus = !1;
    var k = 0,
      g = 0;
    q.ready = 0;
    q.parReady = 0;
    q.init = function () {
      this.ui.css("zIndex", 38);
    };
    q.onAppend = function () {};
    q.onRemove = function () {
      k && (e.clearTimeout(k), (k = 0));
    };
    q.clean = function () {
      q.ready = 0;
      q.parReady = 0;
    };
    q.timeEnd = function () {
      this.remove();
    };
    q.set = function (a) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        g += 1;
        var h = b.getItemInfo(a.ITID),
          f = b.getItemName(a),
          h = a.IsIdentified
            ? h.identifiedResourceName
            : h.unidentifiedResourceName,
          k = c(
            '\x3cdiv class\x3d"msg item show"\x3e\x3cimg src\x3d"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw\x3d\x3d" class\x3d"' +
              a.ITID +
              '" width\x3d"21" height\x3d"21" /\x3e ' +
              c.escape(
                f + " " + b.getMessage(696).replace("%d", a.count || 1),
              ) +
              "\x3c/div\x3e",
          );
        d.loadFile(
          b.INTERFACE_PATH + "item/" + h + ".bmp",
          function (b) {
            k.find("img." + a.ITID).attr("src", b);
          }.bind(this),
        );
        this.ui.find(".content").append(k);
        e.setTimeout(
          function () {
            k.removeClass("show").addClass("out");
          },
          2e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            k.remove();
            --g;
            0 == g && (q.ui.css("zIndex", 40), q.remove());
          },
          2500 + 300 * g,
        );
      }
    };
    q.setZeny = function (a) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        var b;
        g += 1;
        0 < a
          ? (b = c(
              '\x3cdiv class\x3d"msg show"\x3e\u83b7\u5f97' +
                Math.abs(a) +
                "Z\x3c/div\x3e",
            ))
          : 0 > a &&
            (b = c(
              '\x3cdiv class\x3d"msg show"\x3e\u652f\u4ed8\u4e86' +
                Math.abs(a) +
                "Z\x3c/div\x3e",
            ));
        this.ui.find(".content").append(b);
        e.setTimeout(
          function () {
            b.removeClass("show").addClass("out");
          },
          2e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            b.remove();
            --g;
            0 == g && (q.ui.css("zIndex", 40), q.remove());
          },
          2500 + 300 * g,
        );
      }
    };
    q.setExp = function (a, b, d, h) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        var f;
        b = ((100 * a) / b).toFixed(2);
        g += 1;
        switch (d) {
          case 1:
            f =
              0 < a
                ? c(
                    '\x3cdiv class\x3d"msg show"\x3e\u83b7\u5f97 ' +
                      a +
                      " (" +
                      b +
                      "%) \u57fa\u7840\u7ecf\u9a8c\x3c/div\x3e",
                  )
                : c(
                    '\x3cdiv class\x3d"msg show"\x3e\u5931\u53bb ' +
                      a +
                      " (" +
                      b +
                      "%) \u57fa\u7840\u7ecf\u9a8c\x3c/div\x3e",
                  );
            break;
          case 2:
            f =
              0 < a
                ? c(
                    '\x3cdiv class\x3d"msg show"\x3e\u83b7\u5f97 ' +
                      a +
                      " (" +
                      b +
                      "%) \u804c\u4e1a\u7ecf\u9a8c\x3c/div\x3e",
                  )
                : c(
                    '\x3cdiv class\x3d"msg show"\x3e\u5931\u53bb ' +
                      a +
                      " (" +
                      b +
                      "%) \u804c\u4e1a\u7ecf\u9a8c\x3c/div\x3e",
                  );
        }
        this.ui.find(".content").append(f);
        e.setTimeout(
          function () {
            f.removeClass("show").addClass("out");
          },
          2e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            f.remove();
            --g;
            0 == g && q.remove();
          },
          2500 + 300 * g,
        );
      }
    };
    q.setMsg = function (a) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        g += 1;
        var b = c(
          '\x3cdiv class\x3d"msg show"\x3e' + c.escape(a) + "\x3c/div\x3e",
        );
        this.ui.find(".content").append(b);
        e.setTimeout(
          function () {
            b.removeClass("show").addClass("out");
          },
          2e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            b.remove();
            --g;
            0 == g && (q.ui.css("zIndex", 40), q.remove());
          },
          2500 + 300 * g,
        );
      }
    };
    q.setMapname = function (a) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        g += 1;
        var b = c(
          '\x3cdiv class\x3d"msg mapname show"\x3e' +
            c.escape(a) +
            "\x3c/div\x3e",
        );
        this.ui.find(".content").append(b);
        e.setTimeout(
          function () {
            b.removeClass("show").addClass("out");
          },
          3e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            b.remove();
            --g;
            0 == g && q.remove();
          },
          3500 + 300 * g,
        );
      }
    };
    q.setParMsg = function (a, b) {
      if (q.parReady) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        g += 1;
        var d = !1;
        switch (a) {
          case "def":
            a = "\u7269\u9632Def";
            d = !0;
            break;
          case "critical":
            a = "\u66b4\u51fb\u7387Cri";
            d = !0;
            break;
          case "flee2":
            a = "\u95ea\u907fFlee2";
            break;
          case "atak":
            a = "\u653b\u51fb\u529bAtk";
            break;
          case "matak":
            a = "\u9b54\u529bMatk";
            break;
          case "mdef":
            a = "\u9b54\u9632MDef";
            d = !0;
            break;
          case "hit":
            a = "\u547d\u4e2dHit";
            break;
          case "flee":
            a = "\u56de\u907fFlee";
            break;
          case "def2":
            a = "\u9632\u5fa1Def2";
            break;
          case "aspd":
            a = "\u653b\u901fAspd";
            break;
          case "matak2":
            a = "\u9b54\u529bMatk2";
            break;
          case "atak2":
            a = "\u6700\u5927\u653b\u51fb\u529bAtk2";
            break;
          case "mdef2":
            a = "\u9b54\u9632Mdef2";
            break;
          case "maxhp":
            a = "\u8840\u91cfHP";
            break;
          case "maxsp":
            a = "\u6c14\u91cfSP";
            break;
          case "maxweight":
            a = "\u8d1f\u91cdWeight";
            break;
          default:
            return !1;
        }
        var h = d
          ? 0 < b
            ? c(
                '\x3cdiv class\x3d"msg Parchange show"\x3e\x3cspan class\x3d"title"\x3e' +
                  a +
                  '\x3c/span\x3e\x3cspan class\x3d"increase"\x3e + ' +
                  b +
                  "%\x3c/span\x3e\x3c/div\x3e",
              )
            : c(
                '\x3cdiv class\x3d"msg Parchange show"\x3e\x3cspan class\x3d"title"\x3e' +
                  a +
                  '\x3c/span\x3e\x3cspan class\x3d"decrease"\x3e - ' +
                  -b +
                  "%\x3c/span\x3e\x3c/div\x3e",
              )
          : 0 < b
            ? c(
                '\x3cdiv class\x3d"msg Parchange show"\x3e\x3cspan class\x3d"title"\x3e' +
                  a +
                  '\x3c/span\x3e\x3cspan class\x3d"increase"\x3e + ' +
                  b +
                  "\x3c/span\x3e\x3c/div\x3e",
              )
            : c(
                '\x3cdiv class\x3d"msg Parchange show"\x3e\x3cspan class\x3d"title"\x3e' +
                  a +
                  '\x3c/span\x3e\x3cspan class\x3d"decrease"\x3e - ' +
                  -b +
                  "\x3c/span\x3e\x3c/div\x3e",
              );
        this.ui.find(".content").append(h);
        e.setTimeout(
          function () {
            h.removeClass("show").addClass("out");
          },
          2e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            h.remove();
            --g;
            0 == g && (q.ui.css("zIndex", 40), q.remove());
          },
          2500 + 300 * g,
        );
      }
    };
    q.setNavigate = function (a) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        g += 1;
        var b = c(
          '\x3cdiv class\x3d"msg nav show"\x3e' + c.escape(a) + "\x3c/div\x3e",
        );
        this.ui.find(".content").append(b);
        e.setTimeout(
          function () {
            b.removeClass("show").addClass("out");
          },
          2e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            b.remove();
            --g;
            0 == g && (q.ui.css("zIndex", 40), q.remove());
          },
          2500 + 300 * g,
        );
      }
    };
    q.setOfflineMsg = function (a) {
      if (q.ready) {
        this.ui.is(":visible") || this.append();
        this.ui.css("zIndex", 99);
        g += 1;
        var b = c(
          '\x3cdiv class\x3d"msg show"\x3e' + c.escape(a) + "\x3c/div\x3e",
        );
        this.ui.find(".content").append(b);
        e.setTimeout(
          function () {
            b.removeClass("show").addClass("out");
          },
          3e3 + 300 * g,
        );
        e.setTimeout(
          function () {
            b.remove();
            --g;
            0 == g && q.remove();
          },
          3500 + 300 * g,
        );
      }
    };
    return m.addComponent(q);
  },
);
