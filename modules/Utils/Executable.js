define("Utils/Executable", ["./BinaryReader"], function (a) {
  var b;
  return {
    getDate: function (c, d) {
      var e = new FileReader();
      e.onload = function (c) {
        b = new a(c.target.result);
        if (!b)
          throw Error(
            "Executable::getDate() - Executable is not loaded yet, or not specified",
          );
        b.seek(60, SEEK_SET);
        c = b.readULong();
        if (c > b.length)
          throw Error("Executable::getDate() - Invalid executable specified.");
        b.seek(c, SEEK_SET);
        if ("PE" !== b.readString(4))
          throw Error("Executable::getDate() - Invalid executable specified.");
        b.seek(4, SEEK_CUR);
        c = new Date(1e3 * b.readULong());
        c = 1e4 * c.getFullYear() + 100 * (c.getMonth() + 1) + c.getDate();
        d(c);
      };
      e.readAsArrayBuffer(c);
    },
    isROExec: function (a) {
      return !a.name.match(/\.exe$/i) || 3145728 > a.size || 7340032 < a.size
        ? !1
        : !0;
    },
  };
});
