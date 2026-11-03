define("Utils/Texture", ["Loaders/Targa"], function (a) {
  var b = {
    load: function (c, d) {
      var e = Array.prototype.slice.call(arguments, 2);
      if (c)
        if (c instanceof ArrayBuffer)
          try {
            var l = new a();
            l.load(new Uint8Array(c));
            e.unshift(!0);
            d.apply(l.getCanvas(), e);
          } catch (h) {
            (console.error(h.message), e.unshift(!1), d.apply(null, e));
          }
        else
          ((l = new Image()),
            (l.src = c),
            (l.onload = function () {
              c.match(/^blob\:/) && URL.revokeObjectURL(c);
              var a = document.createElement("canvas"),
                l = a.getContext("2d", { willReadFrequently: !0 });
              a.width = this.width;
              a.height = this.height;
              l.drawImage(this, 0, 0, this.width, this.height);
              b.removeMagenta(a);
              e.unshift(!0);
              d.apply(a, e);
            }));
      else (e.unshift(!1), d.apply(null, e));
    },
    removeMagenta: function (a) {
      var b, c, l, h;
      b = a.getContext("2d");
      a = b.getImageData(0, 0, a.width, a.height);
      c = a.data;
      l = c.length;
      for (h = 0; h < l; h += 4)
        230 < c[h + 0] &&
          20 > c[h + 1] &&
          230 < c[h + 2] &&
          (c[h + 0] = c[h + 1] = c[h + 2] = c[h + 3] = 0);
      b.putImageData(a, 0, 0);
    },
  };
  return b;
});
