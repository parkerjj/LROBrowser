define("UI/Background", [
  "require",
  "DB/DBManager",
  "Utils/jquery",
  "Core/Client",
], function (a) {
  function b(a, b, c, d, f, e, g) {
    if (2 * e > d || 2 * e > f) return !1;
    a.save();
    a.translate(b, c);
    a.beginPath(0);
    a.arc(d - e, f - e, e, 0, Math.PI / 2);
    a.lineTo(e, f);
    a.arc(e, f - e, e, Math.PI / 2, Math.PI);
    a.lineTo(0, e);
    a.arc(e, e, e, Math.PI, (3 * Math.PI) / 2);
    a.lineTo(d - e, 0);
    a.arc(d - e, e, e, (3 * Math.PI) / 2, 2 * Math.PI);
    a.lineTo(d, f - e);
    a.closePath();
    a.fillStyle = g || "#000";
    a.fill();
    a.restore();
  }
  function c() {
    k.complete && k.width
      ? n.drawImage(k, 0, 0, t[0].width, t[0].height)
      : ((n.fillStyle = "#000"), n.fillRect(0, 0, t[0].width, t[0].height));
    -1 < p && r.setPercent(p);
  }
  function d(a) {
    g.stop()
      .css("opacity", 0.01)
      .appendTo("body")
      .animate({ opacity: 1 }, 500, function () {
        a();
        g.stop().animate({ opacity: 0.01 }, 500, function () {
          g.remove();
        });
      });
  }
  var e = a("DB/DBManager"),
    l = a("Utils/jquery"),
    h = a("Core/Client"),
    r = {},
    t = l("\x3ccanvas/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 5,
    }),
    n = t[0].getContext("2d"),
    g = l("\x3cdiv/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1e3,
      backgroundColor: "black",
      opacity: 0,
    }),
    p = -1,
    k = new Image(),
    f = [],
    m = window.devicePixelRatio;
  r.init = function (a) {
    p = 0;
    t.css("zIndex", 0);
    c();
    if (a) f = a;
    else
      for (a = 11; 19 >= a; ++a)
        f[a - 1] = "loading" + (19 > a ? a : a - 1) + ".jpg";
  };
  r.resize = function (a, b) {
    t[0].width = a * m;
    t[0].height = b * m;
    t[0].style.width = a + "px";
    t[0].style.height = b + "px";
    g.css({ width: a * m, height: b * m });
    n.fillStyle = "black";
    n.fillRect(0, 0, a * m, b * m);
    c();
  };
  r.setImage = function (a, b) {
    var f = !!t[0].parentNode;
    p = -1;
    c();
    h.loadFile(
      e.INTERFACE_PATH + a,
      function (a) {
        a !== k.src && ((k.src = a), (k.onload = c));
        f && b && b();
      },
      function () {
        f && b && b();
      },
    );
    f ||
      d(function () {
        t.appendTo("body");
        b && b();
      });
  };
  r.reload = function (a) {
    var b = !!t[0].parentNode;
    p = -1;
    b ||
      d(function () {
        a && a();
      });
  };
  r.setLoading = function (a) {
    r.setImage(
      f[Math.floor(Math.random() * f.length) + 10] || "loading11.jpg",
      function () {
        t.css("zIndex", 39);
        r.setPercent(0);
        a && a();
      },
    );
  };
  r.remove = function (a) {
    d(function () {
      t.css("zIndex", 0);
      t.remove();
      a && a();
    });
  };
  r.setPercent = function (a) {
    var c, d, f, e;
    p = Math.min(Math.floor(a), 100);
    f = 300 * m;
    e = 7 * m;
    c = Math.floor(0.5 * (t[0].width - f));
    d = Math.floor(0.75 * t[0].height);
    n.clearRect(0, 0, t[0].width, t[0].height);
    if (k.complete && k.width) {
      var g = t[0].height / k.height;
      g * k.width > t[0].width
        ? n.drawImage(
            k,
            -(g * k.width - t[0].width) / 2,
            0,
            g * k.width,
            t[0].height,
          )
        : n.drawImage(k, 0, 0, t[0].width, t[0].height);
    } else ((n.fillStyle = "#000"), n.fillRect(0, 0, t[0].width, t[0].height));
    n.shadowColor = "#333";
    n.shadowOffsetX = 0;
    n.shadowOffsetY = 0;
    n.shadowBlur = 5;
    n.font = "bold " + 14 * m + "px Arial";
    n.fillStyle = "#ffffff";
    n.fillText(
      a + "%",
      Math.floor(0.5 * (t[0].width - n.measureText(a + "%").width)),
      d + e / 2 - 15,
    );
    n.shadowColor = "#555";
    n.shadowBlur = 0;
    b(n, c, d, f, e, e / 2, "rgba(0,0,0,0.5)");
    n.shadowBlur = 0;
    b(n, c, d, Math.floor(a * f * 0.01), e, e / 2, "#a3e3ff");
  };
  return r;
});
