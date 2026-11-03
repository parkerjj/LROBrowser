define(
  "Controls/ScreenShot",
  "require Core/Client Utils/jquery Utils/html2canvas Controls/KeyEventHandler UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    var b = a("Core/Client"),
      c = a("Utils/jquery"),
      d = a("Utils/html2canvas"),
      e = a("Controls/KeyEventHandler"),
      l = a("UI/Components/ChatBox/ChatBox");
    c(window).keydown(function (a) {
      return e.ALT && a.which === e.P
        ? (h.take(), a.stopImmediatePropagation(), !1)
        : !0;
    });
    var h = {
      take: function () {
        l.ui && d([document.body], { onrendered: this.process });
      },
      process: function (a) {
        var c, d, e, p, k;
        d = new Date();
        e = d.getTimezoneOffset() / 60;
        d = d.toLocaleString() + " (GMT " + (0 < e ? "-" : "+") + e + ")";
        c = a.getContext("2d");
        c.fillStyle = "white";
        c.strokeStyle = "black";
        p = 20;
        k = a.height - 5;
        c.font = "bold 16px serif";
        c.fillText(d, p, k);
        c.strokeText(d, p, k);
        c.fill();
        c.stroke();
        b.loadFile(
          "data/texture/scr_logo.bmp",
          function (b) {
            var e = new Image();
            e.src = b;
            p = a.width - e.width - 20;
            k = a.height - e.height - 5;
            c.drawImage(e, p, k);
            h.display(a, d);
          },
          function () {
            h.display(a, d);
          },
        );
      },
      display: function (a, b) {
        var c, d, e;
        a = atob(a.toDataURL("image/png").replace(/^data[^,]+,/, ""));
        e = a.length;
        c = new Uint8Array(e);
        for (d = 0; d < e; ++d) c[d] = a.charCodeAt(d);
        a = window.URL.createObjectURL(new Blob([c], { type: "image/png" }));
        l.addText(
          "Screenshot " +
            b +
            ' can be saved by \x3ca style\x3d"color:#F88" download\x3d"ScreenShot (' +
            b.replace("/", "-") +
            ').png" href\x3d"' +
            a +
            '" target\x3d"_blank"\x3eclicking here\x3c/a\x3e.',
          l.TYPE.PUBLIC,
          null,
          !0,
        );
      },
    };
    return h;
  },
);
