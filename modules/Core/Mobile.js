define(
  "Core/Mobile",
  "require Utils/jquery Core/Context Core/Events Renderer/Camera Controls/MouseEventHandler Controls/KeyEventHandler".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = a[0].pageX - a[1].pageX;
      a = a[0].pageY - a[1].pageY;
      return Math.sqrt(b * b + a * a);
    }
    function c(a) {
      return (
        (360 *
          Math.atan((a[0].pageY - a[1].pageY) / (a[0].pageX - a[1].pageX))) /
        Math.PI
      );
    }
    function d(a, b) {
      var c = b[0].pageX - a[0].pageX;
      a = b[1].pageX - a[1].pageX;
      return c && a && 0 > c === 0 > a && 0.25 > Math.abs(1 - c / a)
        ? (c + a) >> 1
        : 0;
    }
    function e(a, b) {
      var c = b[0].pageY - a[0].pageY;
      a = b[1].pageY - a[1].pageY;
      return c && a && 0 > c === 0 > a && 0.25 > Math.abs(1 - c / a)
        ? (c + a) >> 1
        : 0;
    }
    var m = a("Utils/jquery"),
      h = a("Core/Context"),
      q = a("Core/Events"),
      r = a("Renderer/Camera"),
      k = a("Controls/MouseEventHandler"),
      g = a("Controls/KeyEventHandler"),
      u = {},
      l = !1,
      f,
      n,
      p,
      v,
      t,
      z = -1;
    u.init = function () {};
    var E = (function () {
      var a = !1;
      return function () {
        a ||
          ((m.fn.focus = function () {}),
          (m.fn.select = function () {}),
          (a = !0));
      };
    })();
    a = (function () {
      function a() {
        if (!l) {
          z = -1;
          if (u.onTouchStart) u.onTouchStart();
          if (!t && u.onTouchEnd) u.onTouchEnd();
          k.intersect = t;
        }
      }
      return function (d) {
        E();
        v = d.originalEvent.touches;
        d.stopImmediatePropagation();
        -1 < z && (q.clearTimeout(z), (z = -1));
        if (1 < v.length)
          return ((f = b(v)), (n = c(v)), (p = r.angle[1]), (l = !0), !1);
        k.screen.x = v[0].pageX;
        k.screen.y = v[0].pageY;
        t = k.intersect = !0;
        z = q.setTimeout(a, 200);
        return !1;
      };
    })();
    if (800 >= Math.max(screen.availHeight, screen.availWidth))
      if (h.Is.APP) h.requestFullScreen();
      else
        m(window).on("click", function () {
          h.isFullScreen() || h.requestFullScreen();
        });
    m(window)
      .on("touchstart", a)
      .on("touchend", function (a) {
        if (l) ((l = !1), (g.SHIFT = !1), r.rotate(!1), r.save());
        else if (-1 < z) t = !1;
        else {
          if (u.onTouchEnd) u.onTouchEnd();
          k.intersect = !1;
        }
      })
      .on("touchmove", function (a) {
        a.stopImmediatePropagation();
        var h = a.originalEvent.touches;
        k.screen.x = h[0].pageX;
        k.screen.y = h[0].pageY;
        if (l) {
          a = b(h) - f;
          var u = c(h) - n + p,
            t = Math.abs(d(v, h)),
            h = Math.abs(e(v, h));
          !r.action.active && (10 < t || 10 < h)
            ? ((g.SHIFT = h > t), r.rotate(!0))
            : (10 < Math.abs(a) &&
                ((r.zoomFinal += 0.1 * a),
                (r.zoomFinal = Math.min(
                  r.zoomFinal,
                  Math.abs(r.altitudeTo - r.altitudeFrom) * r.MAX_ZOOM,
                )),
                (r.zoomFinal = Math.max(r.zoomFinal, 2))),
              u && (r.angleFinal[1] = u));
        }
      });
    return u;
  },
);
