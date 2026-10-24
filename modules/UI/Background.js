define("UI/Background", [
  "require",
  "DB/DBManager",
  "Utils/jquery",
  "Core/Client",
], function (a) {
  function b(a, b, c, d, e, f, g) {
    if (2 * f > d || 2 * f > e) return !1;
    a.save();
    a.translate(b, c);
    a.beginPath(0);
    a.arc(d - f, e - f, f, 0, Math.PI / 2);
    a.lineTo(f, e);
    a.arc(f, e - f, f, Math.PI / 2, Math.PI);
    a.lineTo(0, f);
    a.arc(f, f, f, Math.PI, (3 * Math.PI) / 2);
    a.lineTo(d - f, 0);
    a.arc(d - f, f, f, (3 * Math.PI) / 2, 2 * Math.PI);
    a.lineTo(d, e - f);
    a.closePath();
    a.fillStyle = g || "#000";
    a.fill();
    a.restore();
  }
  function c() {
    l.complete && l.width
      ? k.drawImage(l, 0, 0, q[0].width, q[0].height)
      : ((k.fillStyle = "#000"), k.fillRect(0, 0, q[0].width, q[0].height));
    -1 < t && r.setPercent(t);
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
    r = {},
    q = m("\x3ccanvas/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 5,
    }),
    k = q[0].getContext("2d"),
    g = m("\x3cdiv/\x3e").css({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1e3,
      backgroundColor: "black",
      opacity: 0,
    }),
    t = -1,
    l = new Image(),
    f = [],
    n = window.devicePixelRatio;
  r.init = function (a) {
    t = 0;
    q.css("zIndex", 0);
    c();
    if (a) f = a;
    else
      for (a = 11; 19 >= a; ++a)
        f[a - 1] = "loading" + (19 > a ? a : a - 1) + ".jpg";
  };
  r.resize = function (a, b) {
    q[0].width = a * n;
    q[0].height = b * n;
    q[0].style.width = a + "px";
    q[0].style.height = b + "px";
    g.css({ width: a * n, height: b * n });
    k.fillStyle = "black";
    k.fillRect(0, 0, a * n, b * n);
    c();
  };
  r.setImage = function (a, b) {
    var f = !!q[0].parentNode;
    t = -1;
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
        q.appendTo("body");
        b && b();
      });
  };
  r.reload = function (a) {
    var b = !!q[0].parentNode;
    t = -1;
    b ||
      d(function () {
        a && a();
      });
  };
  r.setLoading = function (a) {
    r.setImage(
      f[Math.floor(Math.random() * f.length) + 10] || "loading11.jpg",
      function () {
        q.css("zIndex", 39);
        r.setPercent(0);
        a && a();
      },
    );
  };
  r.remove = function (a) {
    d(function () {
      q.css("zIndex", 0);
      q.remove();
      a && a();
    });
  };
  r.setPercent = function (a) {
    var c, d, e, f;
    t = Math.min(Math.floor(a), 100);
    e = 300 * n;
    f = 7 * n;
    c = Math.floor(0.5 * (q[0].width - e));
    d = Math.floor(0.75 * q[0].height);
    k.clearRect(0, 0, q[0].width, q[0].height);
    if (l.complete && l.width) {
      var g = q[0].height / l.height;
      g * l.width > q[0].width
        ? k.drawImage(
            l,
            -(g * l.width - q[0].width) / 2,
            0,
            g * l.width,
            q[0].height,
          )
        : k.drawImage(l, 0, 0, q[0].width, q[0].height);
    } else ((k.fillStyle = "#000"), k.fillRect(0, 0, q[0].width, q[0].height));
    k.shadowColor = "#333";
    k.shadowOffsetX = 0;
    k.shadowOffsetY = 0;
    k.shadowBlur = 5;
    k.font = "bold " + 14 * n + "px Arial";
    k.fillStyle = "#ffffff";
    k.fillText(
      a + "%",
      Math.floor(0.5 * (q[0].width - k.measureText(a + "%").width)),
      d + f / 2 - 15,
    );
    k.shadowColor = "#555";
    k.shadowBlur = 0;
    b(k, c, d, e, f, f / 2, "rgba(0,0,0,0.5)");
    k.shadowBlur = 0;
    b(k, c, d, Math.floor(a * e * 0.01), f, f / 2, "#a3e3ff");
  };
  return r;
});
