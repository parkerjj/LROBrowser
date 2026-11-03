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
    var l = a("Utils/jquery"),
      h = a("Core/Context"),
      r = a("Core/Events"),
      t = a("Renderer/Camera"),
      n = a("Controls/MouseEventHandler"),
      g = a("Controls/KeyEventHandler"),
      p = {},
      k = !1,
      f,
      m,
      q,
      v,
      u,
      A = -1;
    p.init = function () {};
    var D = (function () {
      var a = !1;
      return function () {
        a ||
          ((l.fn.focus = function () {}),
          (l.fn.select = function () {}),
          (a = !0));
      };
    })();
    a = (function () {
      function a() {
        if (!k) {
          A = -1;
          if (p.onTouchStart) p.onTouchStart();
          if (!u && p.onTouchEnd) p.onTouchEnd();
          n.intersect = u;
        }
      }
      return function (d) {
        D();
        v = d.originalEvent.touches;
        d.stopImmediatePropagation();
        -1 < A && (r.clearTimeout(A), (A = -1));
        if (1 < v.length)
          return ((f = b(v)), (m = c(v)), (q = t.angle[1]), (k = !0), !1);
        n.screen.x = v[0].pageX;
        n.screen.y = v[0].pageY;
        u = n.intersect = !0;
        A = r.setTimeout(a, 200);
        return !1;
      };
    })();
    if (800 >= Math.max(screen.availHeight, screen.availWidth))
      if (h.Is.APP) h.requestFullScreen();
      else
        l(window).on("click", function () {
          h.isFullScreen() || h.requestFullScreen();
        });
    l(window)
      .on("touchstart", a)
      .on("touchend", function (a) {
        if (k) ((k = !1), (g.SHIFT = !1), t.rotate(!1), t.save());
        else if (-1 < A) u = !1;
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
        if (k) {
          a = b(p) - f;
          var h = c(p) - m + q,
            l = Math.abs(d(v, p)),
            p = Math.abs(e(v, p));
          !t.action.active && (10 < l || 10 < p)
            ? ((g.SHIFT = p > l), t.rotate(!0))
            : (10 < Math.abs(a) &&
                ((t.zoomFinal += 0.1 * a),
                (t.zoomFinal = Math.min(
                  t.zoomFinal,
                  Math.abs(t.altitudeTo - t.altitudeFrom) * t.MAX_ZOOM,
                )),
                (t.zoomFinal = Math.max(t.zoomFinal, 2))),
              h && (t.angleFinal[1] = h));
        }
      });
    return p;
  },
);
