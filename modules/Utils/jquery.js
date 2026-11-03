define("Utils/jquery", ["jquery", "DB/DBManager"], function (a, b) {
  a.fn.text = function (c) {
    return a.access(
      this,
      function (c) {
        if (void 0 === c) return a.text(this);
        var d, l;
        c = String(c);
        d = a.escape(c);
        for (c = /\^([a-fA-F0-9]{6})/; (l = c.exec(d));)
          d =
            d.replace(l[0], '\x3cspan style\x3d"color:#' + l[1] + '"\x3e') +
            "\x3c/span\x3e";
        for (c = /\^nItemID\^(\d+)/g; (l = c.exec(d));)
          d = d.replace(l[0], b.getItemInfo(l[1]).identifiedDiSPlayName);
        for (c = /\^nMapName\^([\w]*$)/g; (l = c.exec(d));)
          d = d.replace(
            l[0],
            '\x3cspan class\x3d"smap"\x3e' + l[1] + "\x3c/span\x3e",
          );
        d = d.replace(/\n/g, "\x3cbr/\x3e");
        return a(this).html(d);
      },
      null,
      c,
      arguments.length,
    );
  };
  a.escape = (function () {
    var a = document.createElement("div");
    return function (b) {
      a.textContent = b;
      return a.innerHTML;
    };
  })();
  return a.noConflict(!0);
});
