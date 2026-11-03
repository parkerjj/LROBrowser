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
      t = a("Core/Events"),
      r = a("Renderer/Camera"),
      n = a("Controls/MouseEventHandler"),
      g = a("Controls/KeyEventHandler"),
      p = {},
      l = !1,
      f,
      k,
      q,
      u,
      v,
      A = -1;
    p.init = function () {};
    var C = (function () {
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
          if (p.onTouchStart) p.onTouchStart();
          if (!v && p.onTouchEnd) p.onTouchEnd();
          n.intersect = v;
        }
      }
      return function (d) {
        C();
        u = d.originalEvent.touches;
        d.stopImmediatePropagation();
        -1 < A && (t.clearTimeout(A), (A = -1));
        if (1 < u.length)
          return ((f = b(u)), (k = c(u)), (q = r.angle[1]), (l = !0), !1);
        n.screen.x = u[0].pageX;
        n.screen.y = u[0].pageY;
        v = n.intersect = !0;
        A = t.setTimeout(a, 200);
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
        else if (-1 < A) v = !1;
        else {
          if (p.onTouchEnd) p.onTouchEnd();
          n.intersect = !1;
        }
      })
      .on("touchmove", function (a) {
        a.stopImmediatePropagation();
        var p = a.originalEvent.touches;
        n.screen.x = p[0].pageX;
        n.screen.y = p[0].pageY;
        if (l) {
          a = b(p) - f;
          var h = c(p) - k + q,
            m = Math.abs(d(u, p)),
            p = Math.abs(e(u, p));
          !r.action.active && (10 < m || 10 < p)
            ? ((g.SHIFT = p > m), r.rotate(!0))
            : (10 < Math.abs(a) &&
                ((r.zoomFinal += 0.1 * a),
                (r.zoomFinal = Math.min(
                  r.zoomFinal,
                  Math.abs(r.altitudeTo - r.altitudeFrom) * r.MAX_ZOOM,
                )),
                (r.zoomFinal = Math.max(r.zoomFinal, 2))),
              h && (r.angleFinal[1] = h));
        }
      });
    return p;
  },
);
