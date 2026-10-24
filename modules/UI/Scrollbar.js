define("UI/Scrollbar", [
  "Utils/jquery",
  "Utils/Texture",
  "DB/DBManager",
  "Core/Client",
], function (a, b, c, d) {
  var e = {
    complete: !1,
    init: function () {
      e.complete ||
        d.loadFiles(
          [
            c.INTERFACE_PATH + "scroll0down.bmp",
            c.INTERFACE_PATH + "scroll0mid.bmp",
            c.INTERFACE_PATH + "scroll0up.bmp",
            c.INTERFACE_PATH + "scroll0bar_down.bmp",
            c.INTERFACE_PATH + "scroll0bar_mid.bmp",
            c.INTERFACE_PATH + "scroll0bar_up.bmp",
          ],
          function (c, d, r, q, k, g) {
            b.load(q, function () {
              var h = this;
              b.load(k, function () {
                var l = this;
                b.load(g, function () {
                  var b = document.createElement("canvas"),
                    g = b.getContext("2d");
                  b.width = this.width;
                  b.height = this.height + l.height + h.height;
                  g.drawImage(this, 0, 0);
                  g.drawImage(l, 0, this.height);
                  g.drawImage(h, 0, this.height + l.height);
                  a("style:first").append(
                    [
                      "::-webkit-scrollbar { width: 13px; height: 12px; }\n::-webkit-scrollbar-button:vertical:start:increment,\n::-webkit-scrollbar-button:vertical:end:decrement { display: none;}\n::-webkit-scrollbar-button:start:decrement,\n::-webkit-scrollbar-button:end:increment { display: block; }\n::-webkit-scrollbar-corner:vertical {display:none;}\n::-webkit-scrollbar-resizer:vertical {display:none;}\n::-webkit-scrollbar-button:vertical:increment { background-repeat:no-repeat; height:13px;}\n::-webkit-scrollbar-button:vertical:decrement { background-repeat:no-repeat; height:12px;}\n::-webkit-scrollbar-track-piece:vertical {background-repeat:repeat-y;}\n::-webkit-scrollbar-thumb:vertical{border-color: transparent;border-width: 4px 0;min-height: 6px;}",
                      "::-webkit-scrollbar-button:vertical:increment { background-image: url(" +
                        c +
                        ");}",
                      "::-webkit-scrollbar-button:vertical:decrement { background-image: url(" +
                        r +
                        ");}",
                      "::-webkit-scrollbar-track-piece:vertical { background-image: url(" +
                        d +
                        ");}",
                      "::-webkit-scrollbar-thumb:vertical{ -webkit-border-image: url(" +
                        b.toDataURL() +
                        ") 4 0 4 0;}",
                    ].join("\n"),
                  );
                  e.complete = !0;
                });
              });
            });
          },
        );
    },
  };
  return e;
});
