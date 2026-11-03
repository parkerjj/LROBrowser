define("Core/Events", [], function () {
  function a() {}
  var b = [],
    c = 0,
    d = 0;
  a.setTimeout = function (a, m) {
    var e, t;
    m = c + m;
    t = { callback: a, tick: m, uid: d++ };
    a = 0;
    for (e = b.length; a < e; ++a)
      if (m < b[a].tick) return (b.splice(a, 0, t), t.uid);
    b.push(t);
    return t.uid;
  };
  a.clearTimeout = function (a) {
    var d,
      c = b.length;
    for (d = 0; d < c; ++d)
      if (b[d].uid === a) {
        b.splice(d, 1);
        break;
      }
  };
  a.process = function (a) {
    for (var d = b.length; 0 < d && !(b[0].tick > a);)
      (b.shift().callback(), d--);
    c = a;
  };
  a.free = function () {
    b.length = 0;
  };
  return a;
});
