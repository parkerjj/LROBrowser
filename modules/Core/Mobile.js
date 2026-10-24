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
      r = a("Core/Events"),
      q = a("Renderer/Camera"),
      k = a("Controls/MouseEventHandler"),
      g = a("Controls/KeyEventHandler"),
      t = {},
      l = !1,
      f,
      n,
      p,
      v,
      u,
      A = -1;
    t.init = function () {};
    var D = (function () {
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
          A = -1;
          if (t.onTouchStart) t.onTouchStart();
          if (!u && t.onTouchEnd) t.onTouchEnd();
          k.intersect = u;
        }
      }
      return function (d) {
        D();
        v = d.originalEvent.touches;
        d.stopImmediatePropagation();
        -1 < A && (r.clearTimeout(A), (A = -1));
        if (1 < v.length)
          return ((f = b(v)), (n = c(v)), (p = q.angle[1]), (l = !0), !1);
        k.screen.x = v[0].pageX;
        k.screen.y = v[0].pageY;
        u = k.intersect = !0;
        A = r.setTimeout(a, 200);
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
        if (l) ((l = !1), (g.SHIFT = !1), q.rotate(!1), q.save());
        else if (-1 < A) u = !1;
        else {
          if (t.onTouchEnd) t.onTouchEnd();
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
          var t = c(h) - n + p,
            m = Math.abs(d(v, h)),
            h = Math.abs(e(v, h));
          !q.action.active && (10 < m || 10 < h)
            ? ((g.SHIFT = h > m), q.rotate(!0))
            : (10 < Math.abs(a) &&
                ((q.zoomFinal += 0.1 * a),
                (q.zoomFinal = Math.min(
                  q.zoomFinal,
                  Math.abs(q.altitudeTo - q.altitudeFrom) * q.MAX_ZOOM,
                )),
                (q.zoomFinal = Math.max(q.zoomFinal, 2))),
              t && (q.angleFinal[1] = t));
        }
      });
    return t;
  },
);
