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
    l.complete && l.width
      ? n.drawImage(l, 0, 0, r[0].width, r[0].height)
      : ((n.fillStyle = "#000"), n.fillRect(0, 0, r[0].width, r[0].height));
    -1 < p && t.setPercent(p);
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
    m = a("Utils/jquery"),
    h = a("Core/Client"),
    t = {},
    r = m("\x3ccanvas/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 5,
    }),
    n = r[0].getContext("2d"),
    g = m("\x3cdiv/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1e3,
      backgroundColor: "black",
      opacity: 0,
    }),
    p = -1,
    l = new Image(),
    f = [],
    k = window.devicePixelRatio;
  t.init = function (a) {
    p = 0;
    r.css("zIndex", 0);
    c();
    if (a) f = a;
    else
      for (a = 11; 19 >= a; ++a)
        f[a - 1] = "loading" + (19 > a ? a : a - 1) + ".jpg";
  };
  t.resize = function (a, b) {
    r[0].width = a * k;
    r[0].height = b * k;
    r[0].style.width = a + "px";
    r[0].style.height = b + "px";
    g.css({ width: a * k, height: b * k });
    n.fillStyle = "black";
    n.fillRect(0, 0, a * k, b * k);
    c();
  };
  t.setImage = function (a, b) {
    var f = !!r[0].parentNode;
    p = -1;
    c();
    h.loadFile(
      e.INTERFACE_PATH + a,
      function (a) {
        a !== l.src && ((l.src = a), (l.onload = c));
        f && b && b();
      },
      function () {
        f && b && b();
      },
    );
    f ||
      d(function () {
        r.appendTo("body");
        b && b();
      });
  };
  t.reload = function (a) {
    var b = !!r[0].parentNode;
    p = -1;
    b ||
      d(function () {
        a && a();
      });
  };
  t.setLoading = function (a) {
    t.setImage(
      f[Math.floor(Math.random() * f.length) + 10] || "loading11.jpg",
      function () {
        r.css("zIndex", 39);
        t.setPercent(0);
        a && a();
      },
    );
  };
  t.remove = function (a) {
    d(function () {
      r.css("zIndex", 0);
      r.remove();
      a && a();
    });
  };
  t.setPercent = function (a) {
    var c, d, f, e;
    p = Math.min(Math.floor(a), 100);
    f = 300 * k;
    e = 7 * k;
    c = Math.floor(0.5 * (r[0].width - f));
    d = Math.floor(0.75 * r[0].height);
    n.clearRect(0, 0, r[0].width, r[0].height);
    if (l.complete && l.width) {
      var g = r[0].height / l.height;
      g * l.width > r[0].width
        ? n.drawImage(
            l,
            -(g * l.width - r[0].width) / 2,
            0,
            g * l.width,
            r[0].height,
          )
        : n.drawImage(l, 0, 0, r[0].width, r[0].height);
    } else ((n.fillStyle = "#000"), n.fillRect(0, 0, r[0].width, r[0].height));
    n.shadowColor = "#333";
    n.shadowOffsetX = 0;
    n.shadowOffsetY = 0;
    n.shadowBlur = 5;
    n.font = "bold " + 14 * k + "px Arial";
    n.fillStyle = "#ffffff";
    n.fillText(
      a + "%",
      Math.floor(0.5 * (r[0].width - n.measureText(a + "%").width)),
      d + e / 2 - 15,
    );
    n.shadowColor = "#555";
    n.shadowBlur = 0;
    b(n, c, d, f, e, e / 2, "rgba(0,0,0,0.5)");
    n.shadowBlur = 0;
    b(n, c, d, Math.floor(a * f * 0.01), e, e / 2, "#a3e3ff");
  };
  return t;
});
