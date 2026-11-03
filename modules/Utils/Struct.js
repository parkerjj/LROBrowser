define("Utils/Struct", [], function () {
  return function () {
    var a,
      b,
      c,
      d = 0,
      e,
      m,
      h,
      t,
      r = {};
    m = arguments.length;
    for (c = 0; c < m; ++c) {
      a = arguments[c].match(
        /(unsigned\s)?(bool|char|short|int|long|float|double)\s([a-zA-Z0-9_-]+)(\[(\d+)\])?;?/,
      );
      b = !!a[1];
      e = a[2].toLowerCase();
      h = a[3];
      a = a[5] ? parseInt(a[5], 10) : 1;
      switch (e) {
        case "bool":
          e = 1;
          t = "int8";
          break;
        case "char":
          e = 1;
          t = "int8";
          break;
        case "short":
          e = 2;
          t = "int16";
          break;
        case "int":
          e = 4;
          t = "int32";
          break;
        case "long":
          e = 4;
          t = "int32";
          break;
        case "float":
          e = 4;
          t = "float32";
          break;
        case "double":
          e = 8;
          t = "float64";
          break;
        default:
          throw Error("Struct() - Undefined type '" + e + "'.");
      }
      t = "get" + (b ? "U" + t : t.charAt(0).toUpperCase() + t.substr(1));
      d += e * a;
      r[h] = { func: t, count: a };
    }
    this._list = r;
    this.size = d;
  };
});
