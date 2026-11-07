define("Core/Configs", [], function () {
  var a = {},
    b = {};
  (function (b) {
    if ("object" === typeof b) {
      var d = Object.keys(b),
        c,
        m;
      c = 0;
      for (m = d.length; c < m; ++c) a[d[c]] = b[d[c]];
    }
  })(window.ROConfig);
  return {
    get: function (c, d) {
      return c in b ? b[c] : c in a ? a[c] : d;
    },
    set: function (b, d) {
      a[b] = d;
    },
    setServer: function (a) {
      b = a;
    },
  };
});
