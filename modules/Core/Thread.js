define("Core/Thread", ["require", "Core/Configs"], function (a, b) {
  function c(a) {
    var b = a.data.uid,
      c = a.data.type;
    b in d && (d[b].apply(null, a.data.arguments), delete d[b]);
    c && e[c] && e[c].call(null, a.data.data);
  }
  var d = {},
    e = {},
    m = 0,
    h = [],
    q = null;
  return {
    send: (function () {
      var a = { type: "", data: null, uid: 0 };
      return function (b, c, e) {
        var g = 0;
        e && ((g = ++m), (d[g] = e));
        a.type = b;
        a.data = c;
        a.uid = g;
        q.postMessage(a, h);
      };
    })(),
    hook: function (a, d) {
      e[a] = d;
    },
    init: function () {
      if (document.title != wybt) return !1;
      var d = window.location.host.split(".");
      "game" == d[0] &&
        "lastro" == d[1] &&
        "cn" == d[2] &&
        (q ||
          ((d = b.get("development")
            ? "./ThreadEventHandler.js"
            : "/ro/ThreadEventHandler.js"),
          (q = new Worker(a.toUrl(d) + "?" + b.get("version", "")))),
        q instanceof Worker
          ? q.addEventListener("message", c, !1)
          : (window.addEventListener("message", c, !1),
            q.postMessage({ type: "SYNC" }, h)));
    },
    delegate: function (a, d) {
      q = a;
      h = d;
    },
  };
});
