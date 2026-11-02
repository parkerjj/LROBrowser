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
      ? k.drawImage(l, 0, 0, r[0].width, r[0].height)
      : ((k.fillStyle = "#000"), k.fillRect(0, 0, r[0].width, r[0].height));
    -1 < u && q.setPercent(u);
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
    q = {},
    r = m("\x3ccanvas/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 5,
    }),
    k = r[0].getContext("2d"),
    g = m("\x3cdiv/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1e3,
      backgroundColor: "black",
      opacity: 0,
    }),
    u = -1,
    l = new Image(),
    f = [],
    n = window.devicePixelRatio;
  q.init = function (a) {
    u = 0;
    r.css("zIndex", 0);
    c();
    if (a) f = a;
    else
      for (a = 11; 19 >= a; ++a)
        f[a - 1] = "loading" + (19 > a ? a : a - 1) + ".jpg";
  };
  q.resize = function (a, b) {
    r[0].width = a * n;
    r[0].height = b * n;
    r[0].style.width = a + "px";
    r[0].style.height = b + "px";
    g.css({ width: a * n, height: b * n });
    k.fillStyle = "black";
    k.fillRect(0, 0, a * n, b * n);
    c();
  };
  q.setImage = function (a, b) {
    var f = !!r[0].parentNode;
    u = -1;
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
  q.reload = function (a) {
    var b = !!r[0].parentNode;
    u = -1;
    b ||
      d(function () {
        a && a();
      });
  };
  q.setLoading = function (a) {
    q.setImage(
      f[Math.floor(Math.random() * f.length) + 10] || "loading11.jpg",
      function () {
        r.css("zIndex", 39);
        q.setPercent(0);
        a && a();
      },
    );
  };
  q.remove = function (a) {
    d(function () {
      r.css("zIndex", 0);
      r.remove();
      a && a();
    });
  };
  q.setPercent = function (a) {
    var c, d, f, e;
    u = Math.min(Math.floor(a), 100);
    f = 300 * n;
    e = 7 * n;
    c = Math.floor(0.5 * (r[0].width - f));
    d = Math.floor(0.75 * r[0].height);
    k.clearRect(0, 0, r[0].width, r[0].height);
    if (l.complete && l.width) {
      var g = r[0].height / l.height;
      g * l.width > r[0].width
        ? k.drawImage(
            l,
            -(g * l.width - r[0].width) / 2,
            0,
            g * l.width,
            r[0].height,
          )
        : k.drawImage(l, 0, 0, r[0].width, r[0].height);
    } else ((k.fillStyle = "#000"), k.fillRect(0, 0, r[0].width, r[0].height));
    k.shadowColor = "#333";
    k.shadowOffsetX = 0;
    k.shadowOffsetY = 0;
    k.shadowBlur = 5;
    k.font = "bold " + 14 * n + "px Arial";
    k.fillStyle = "#ffffff";
    k.fillText(
      a + "%",
      Math.floor(0.5 * (r[0].width - k.measureText(a + "%").width)),
      d + e / 2 - 15,
    );
    k.shadowColor = "#555";
    k.shadowBlur = 0;
    b(k, c, d, f, e, e / 2, "rgba(0,0,0,0.5)");
    k.shadowBlur = 0;
    b(k, c, d, Math.floor(a * f * 0.01), e, e / 2, "#a3e3ff");
  };
  return q;
});
