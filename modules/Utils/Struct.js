define("Utils/Struct", [], function () {
  return function () {
    var a,
      b,
      c,
      d = 0,
      e,
      m,
      h,
      r,
      q = {};
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
          r = "int8";
          break;
        case "char":
          e = 1;
          r = "int8";
          break;
        case "short":
          e = 2;
          r = "int16";
          break;
        case "int":
          e = 4;
          r = "int32";
          break;
        case "long":
          e = 4;
          r = "int32";
          break;
        case "float":
          e = 4;
          r = "float32";
          break;
        case "double":
          e = 8;
          r = "float64";
          break;
        default:
          throw Error("Struct() - Undefined type '" + e + "'.");
      }
      r = "get" + (b ? "U" + r : r.charAt(0).toUpperCase() + r.substr(1));
      d += e * a;
      q[h] = { func: r, count: a };
    }
    this._list = q;
    this.size = d;
  };
});
