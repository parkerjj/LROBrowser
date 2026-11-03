define("Utils/PathFinding", [], function () {
  function a(a, b) {
    var c,
      d = a[0]++;
    for (c = (d - 1) >> 1; 0 < d && f[b] < f[a[c + 1]]; c = (d - 1) >> 1)
      ((a[d + 1] = a[c + 1]), (d = c));
    a[d + 1] = b;
  }
  function b(a) {
    var b, c, d, k, e;
    if (0 >= a[0]) return -1;
    d = +a[1];
    k = +a[a[0]--];
    e = f[k];
    c = 0;
    for (b = 2; b < a[0]; b = 2 * b + 2)
      (f[a[b + 1]] > f[a[b]] && b--, (a[c + 1] = +a[b + 1]), (c = b));
    b === a[0] && ((a[c + 1] = +a[b]), (c = b - 1));
    for (b = (c - 1) >> 1; 0 < c && f[a[b + 1]] > e; b = (c - 1) >> 1)
      ((a[c + 1] = a[b + 1]), (c = b));
    a[c + 1] = k;
    return d;
  }
  function c(b, c, d, e, n, h) {
    var u = (c + 512 * d) & 262143;
    if (g[u] === c && p[u] === d) {
      if (l[u] > e) {
        l[u] = e;
        k[u] = n;
        f[u] = h;
        if (q[u]) a(b, u);
        else {
          for (d = 0; d < b[0] && b[d + 1] !== u; ++d);
          if (d === b[0])
            throw Error(
              "PathFinding::update_heap_path() - Error updating head path",
            );
          e = f[u];
          for (c = (d - 1) >> 1; 0 < d && e < f[b[c + 1]]; c = (d - 1) >> 1)
            ((b[d + 1] = b[c + 1]), (d = c));
          b[d + 1] = u;
        }
        q[u] = 0;
      }
      return 0;
    }
    if (g[u] || p[u]) return 1;
    g[u] = c;
    p[u] = d;
    l[u] = e;
    k[u] = n;
    f[u] = h;
    q[u] = 0;
    a(b, u);
    return 0;
  }
  function d(a, b, c, f, k, q, g) {
    var l,
      p,
      n,
      u,
      h,
      v = e.cells,
      C = e.width;
    p = (p = c - a) ? (0 > p ? -1 : 1) : 0;
    n = (n = f - b) ? (0 > n ? -1 : 1) : 0;
    u = a;
    h = b;
    l = 0;
    q[0] = a;
    for (
      q[1] = b;
      512 > l++ &&
      ((u += p),
      (h += n),
      (q[2 * l + 0] = u),
      (q[2 * l + 1] = h),
      u === c && (p = 0),
      h === f && (n = 0),
      (0 !== p || 0 !== n) && 0 !== (v[u + h * C] & g));
    );
    if (u === c && h === f) {
      if (0 < k)
        for (u = 0; u < l; ++u)
          if (
            Math.abs(q[2 * u + 0] - c) <= k &&
            Math.abs(q[2 * u + 1] - f) <= k
          )
            return u + 1;
      return l + 1;
    }
    return 0 < k && ((u = c - a), (h = f - b), Math.sqrt(u * u + h * h) <= k)
      ? d(a, b, c, f, 0, q, e.type.SNIPABLE)
      : 0;
  }
  var e = { width: 0, height: 0, cells: null, type: null },
    m = new Uint32Array(2400),
    h = new Uint32Array(2400),
    t = new Uint16Array(262144),
    r = new Uint8Array(262144),
    n = new Uint8Array(4),
    g = new Uint16Array(262144),
    p = new Uint16Array(262144),
    l = new Uint16Array(262144),
    f = new Uint16Array(262144),
    k = new Uint32Array(262144),
    q = new Uint8Array(262144);
  return {
    search: function (u, v, A, C, B, J) {
      var D,
        y,
        H,
        N,
        O,
        I,
        x,
        K,
        E = e.width;
      H = e.height;
      var F = e.cells,
        z = e.type;
      if ((B = d(u, v, A, C, B, J, z.WALKABLE))) return B;
      m.set(h);
      g.set(t);
      p.set(t);
      l.set(t);
      f.set(t);
      k.set(t);
      q.set(r);
      J[0] = u;
      J[1] = v;
      B = (u + 512 * v) & 262143;
      g[B] = u;
      p[B] = v;
      f[B] = 10 * (Math.abs(A - g[B]) + Math.abs(C - p[B])) + l[B];
      m[0] = 0;
      a(m, B);
      B = E - 1;
      for (N = H - 1; ;) {
        I = O = 0;
        n[0] = 0;
        n[1] = 0;
        n[2] = 0;
        n[3] = 0;
        H = b(m);
        if (0 > H) return 0;
        D = g[H];
        y = p[H];
        x = l[H] + 10;
        K = f[H];
        if (D === A && y === C) break;
        y < N &&
          F[D + 0 + (y + 1) * E] & z.WALKABLE &&
          ((n[0] = y >= C ? 20 : 0),
          (I |= 1),
          (O += c(m, D + 0, y + 1, x, H, K + n[0])));
        0 < D &&
          F[D - 1 + (y + 0) * E] & z.WALKABLE &&
          ((n[1] = D <= A ? 20 : 0),
          (I |= 2),
          (O += c(m, D - 1, y + 0, x, H, K + n[1])));
        0 < y &&
          F[D + 0 + (y - 1) * E] & z.WALKABLE &&
          ((n[2] = y <= C ? 20 : 0),
          (I |= 4),
          (O += c(m, D + 0, y - 1, x, H, K + n[2])));
        D < B &&
          F[D + 1 + (y + 0) * E] & z.WALKABLE &&
          ((n[3] = D >= A ? 20 : 0),
          (I |= 8),
          (O += c(m, D + 1, y + 0, x, H, K + n[3])));
        3 === (I & 3) &&
          F[D - 1 + (y + 1) * E] & z.WALKABLE &&
          (O += c(m, D - 1, y + 1, x + 4, H, K + n[1] + n[0] - 6));
        6 === (I & 6) &&
          F[D - 1 + (y - 1) * E] & z.WALKABLE &&
          (O += c(m, D - 1, y - 1, x + 4, H, K + n[1] + n[2] - 6));
        12 === (I & 12) &&
          F[D + 1 + (y - 1) * E] & z.WALKABLE &&
          (O += c(m, D + 1, y - 1, x + 4, H, K + n[3] + n[2] - 6));
        9 === (I & 9) &&
          F[D + 1 + (y + 1) * E] & z.WALKABLE &&
          (O += c(m, D + 1, y + 1, x + 4, H, K + n[3] + n[0] - 6));
        q[H] = 1;
        if (O || 2395 <= m[0]) return 0;
      }
      A = 0;
      for (B = H; 100 > A && B !== ((u + 512 * v) & 262143); B = k[B], A++);
      B = H;
      for (u = A - 1; 0 <= u; B = k[B], u--)
        ((J[2 * (u + 1) + 0] = g[B]), (J[2 * (u + 1) + 1] = p[B]));
      return A + 1;
    },
    searchLong: d,
    searchNavigate: function (d, v, A, C, B) {
      var u,
        D,
        y,
        H,
        N,
        O,
        I,
        x,
        K,
        E = e.width;
      H = e.height;
      var F = e.cells,
        z = e.type;
      m.set(h);
      g.set(t);
      p.set(t);
      l.set(t);
      f.set(t);
      k.set(t);
      q.set(r);
      B[0] = d;
      B[1] = v;
      y = (d + 512 * v) & 262143;
      g[y] = d;
      p[y] = v;
      f[y] = 10 * (Math.abs(A - g[y]) + Math.abs(C - p[y])) + l[y];
      m[0] = 0;
      a(m, y);
      y = E - 1;
      for (N = H - 1; ;) {
        I = O = 0;
        n[0] = 0;
        n[1] = 0;
        n[2] = 0;
        n[3] = 0;
        H = b(m);
        if (0 > H) return 0;
        u = g[H];
        D = p[H];
        x = l[H] + 10;
        K = f[H];
        if (u === A && D === C) break;
        D < N &&
          F[u + 0 + (D + 1) * E] & z.WALKABLE &&
          ((n[0] = D >= C ? 20 : 0),
          (I |= 1),
          (O += c(m, u + 0, D + 1, x, H, K + n[0])));
        0 < u &&
          F[u - 1 + (D + 0) * E] & z.WALKABLE &&
          ((n[1] = u <= A ? 20 : 0),
          (I |= 2),
          (O += c(m, u - 1, D + 0, x, H, K + n[1])));
        0 < D &&
          F[u + 0 + (D - 1) * E] & z.WALKABLE &&
          ((n[2] = D <= C ? 20 : 0),
          (I |= 4),
          (O += c(m, u + 0, D - 1, x, H, K + n[2])));
        u < y &&
          F[u + 1 + (D + 0) * E] & z.WALKABLE &&
          ((n[3] = u >= A ? 20 : 0),
          (I |= 8),
          (O += c(m, u + 1, D + 0, x, H, K + n[3])));
        3 === (I & 3) &&
          F[u - 1 + (D + 1) * E] & z.WALKABLE &&
          (O += c(m, u - 1, D + 1, x + 4, H, K + n[1] + n[0] - 6));
        6 === (I & 6) &&
          F[u - 1 + (D - 1) * E] & z.WALKABLE &&
          (O += c(m, u - 1, D - 1, x + 4, H, K + n[1] + n[2] - 6));
        12 === (I & 12) &&
          F[u + 1 + (D - 1) * E] & z.WALKABLE &&
          (O += c(m, u + 1, D - 1, x + 4, H, K + n[3] + n[2] - 6));
        9 === (I & 9) &&
          F[u + 1 + (D + 1) * E] & z.WALKABLE &&
          (O += c(m, u + 1, D + 1, x + 4, H, K + n[3] + n[0] - 6));
        q[H] = 1;
        if (O || 2395 <= m[0]) return 0;
      }
      A = 0;
      for (y = H; 2e3 > A && y !== ((d + 512 * v) & 262143); y = k[y], A++);
      y = H;
      for (d = A - 1; 0 <= d; y = k[y], d--)
        ((B[2 * (d + 1) + 0] = g[y]), (B[2 * (d + 1) + 1] = p[y]));
      return A + 1;
    },
    setGat: function (a) {
      e.width = a.width;
      e.height = a.height;
      e.cells = a.cells;
      e.type = a.types;
    },
    calculate: function (a) {
      function b(a, b) {
        var c,
          d = a[0]++;
        for (c = (d - 1) >> 1; 0 < d && fa[b] < fa[a[c + 1]]; c = (d - 1) >> 1)
          ((a[d + 1] = a[c + 1]), (d = c));
        a[d + 1] = b;
      }
      function c(a, c, d, f, k, e) {
        var q = (c + 512 * d) & 262143;
        if (T[q] === c && da[q] === d) {
          if (R[q] > f) {
            R[q] = f;
            ea[q] = k;
            fa[q] = e;
            if (ta[q]) b(a, q);
            else {
              for (d = 0; d < a[0] && a[d + 1] !== q; ++d);
              if (d === a[0])
                throw Error(
                  "PathFinding::update_heap_path() - Error updating head path",
                );
              f = fa[q];
              for (
                c = (d - 1) >> 1;
                0 < d && f < fa[a[c + 1]];
                c = (d - 1) >> 1
              )
                ((a[d + 1] = a[c + 1]), (d = c));
              a[d + 1] = q;
            }
            ta[q] = 0;
          }
          return 0;
        }
        if (T[q] || da[q]) return 1;
        T[q] = c;
        da[q] = d;
        R[q] = f;
        ea[q] = k;
        fa[q] = e;
        ta[q] = 0;
        b(a, q);
        return 0;
      }
      function d(a, d, f, k, e) {
        var q,
          g,
          l,
          p,
          n,
          u,
          h,
          v,
          C,
          m,
          B = M.width;
        u = M.height;
        var A = M.cells,
          r = M.type;
        Q.set(V);
        T.set(W);
        da.set(W);
        R.set(W);
        fa.set(W);
        ea.set(W);
        ta.set(ba);
        q = Q;
        e[0] = a;
        e[1] = d;
        p = (a + 512 * d) & 262143;
        T[p] = a;
        da[p] = d;
        fa[p] = 10 * (Math.abs(f - T[p]) + Math.abs(k - da[p])) + R[p];
        q[0] = 0;
        b(q, p);
        p = B - 1;
        for (--u; ;) {
          v = h = 0;
          S[0] = 0;
          S[1] = 0;
          S[2] = 0;
          S[3] = 0;
          n = q;
          var J;
          if (0 >= n[0]) n = -1;
          else {
            l = +n[1];
            C = +n[n[0]--];
            m = fa[C];
            g = 0;
            for (J = 2; J < n[0]; J = 2 * J + 2)
              (fa[n[J + 1]] > fa[n[J]] && J--, (n[g + 1] = +n[J + 1]), (g = J));
            J === n[0] && ((n[g + 1] = +n[J]), (g = J - 1));
            for (J = (g - 1) >> 1; 0 < g && fa[n[J + 1]] > m; J = (g - 1) >> 1)
              ((n[g + 1] = n[J + 1]), (g = J));
            n[g + 1] = C;
            n = l;
          }
          if (0 > n) return 0;
          g = T[n];
          l = da[n];
          C = R[n] + 10;
          m = fa[n];
          if (g === f && l === k) break;
          l < u &&
            A[g + 0 + (l + 1) * B] & r.WALKABLE &&
            ((S[0] = l >= k ? 20 : 0),
            (v |= 1),
            (h += c(q, g + 0, l + 1, C, n, m + S[0])));
          0 < g &&
            A[g - 1 + (l + 0) * B] & r.WALKABLE &&
            ((S[1] = g <= f ? 20 : 0),
            (v |= 2),
            (h += c(q, g - 1, l + 0, C, n, m + S[1])));
          0 < l &&
            A[g + 0 + (l - 1) * B] & r.WALKABLE &&
            ((S[2] = l <= k ? 20 : 0),
            (v |= 4),
            (h += c(q, g + 0, l - 1, C, n, m + S[2])));
          g < p &&
            A[g + 1 + (l + 0) * B] & r.WALKABLE &&
            ((S[3] = g >= f ? 20 : 0),
            (v |= 8),
            (h += c(q, g + 1, l + 0, C, n, m + S[3])));
          3 === (v & 3) &&
            A[g - 1 + (l + 1) * B] & r.WALKABLE &&
            (h += c(q, g - 1, l + 1, C + 4, n, m + S[1] + S[0] - 6));
          6 === (v & 6) &&
            A[g - 1 + (l - 1) * B] & r.WALKABLE &&
            (h += c(q, g - 1, l - 1, C + 4, n, m + S[1] + S[2] - 6));
          12 === (v & 12) &&
            A[g + 1 + (l - 1) * B] & r.WALKABLE &&
            (h += c(q, g + 1, l - 1, C + 4, n, m + S[3] + S[2] - 6));
          9 === (v & 9) &&
            A[g + 1 + (l + 1) * B] & r.WALKABLE &&
            (h += c(q, g + 1, l + 1, C + 4, n, m + S[3] + S[0] - 6));
          ta[n] = 1;
          if (h || 2395 <= q[0]) return 0;
        }
        f = 0;
        for (p = n; 2e3 > f && p !== ((a + 512 * d) & 262143); p = ea[p], f++);
        p = n;
        for (a = f - 1; 0 <= a; p = ea[p], a--)
          ((e[2 * (a + 1) + 0] = T[p]), (e[2 * (a + 1) + 1] = da[p]));
        return f + 1;
      }
      function f(a, b) {
        for (var c in b) if (a[5] == b[c][5]) return c;
        return !1;
      }
      a = a.data;
      var k = a.x,
        e = a.y,
        q = a.type,
        g = a.sx,
        l = a.sy,
        p = a.warps,
        n = a.curMap,
        u = a.nextMap,
        h = [],
        m = 0,
        r = (h = 0),
        t = 0,
        G = [],
        L = {},
        M = { width: a.width, height: a.height, cells: a.cells, type: a.types },
        Q = new Uint32Array(2400),
        V = new Uint32Array(2400),
        W = new Uint16Array(262144),
        ba = new Uint8Array(262144),
        S = new Uint8Array(4),
        T = new Uint16Array(262144),
        da = new Uint16Array(262144),
        R = new Uint16Array(262144),
        fa = new Uint16Array(262144),
        ea = new Uint32Array(262144),
        ta = new Uint8Array(262144),
        oa = [];
      do {
        var ka = a.x + r,
          t = a.y + t,
          m = d(g | 0, l | 0, ka | 0, t | 0, oa);
        if (0 < m) {
          L = { map: a.map, x: ka, y: t };
          break;
        }
        r =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        t =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        h += 1;
      } while (5 > h && 0 == m);
      if (0 < m) (G.push(L), self.postMessage(G));
      else {
        L = [];
        m = JSON.parse(JSON.stringify(p));
        t = 0;
        do
          if (((t += 1), (h = m.shift()), 0 < h.length))
            for (h.push(t), L.push(h), p = 0; p < m.length; p++)
              if (0 < m[p].length) {
                var ka = d(h[0] | 0, h[1] | 0, m[p][3] | 0, m[p][4] | 0, 0, oa),
                  ga = d(h[3] | 0, h[4] | 0, m[p][0] | 0, m[p][1] | 0, 0, oa);
                if (ka && ga) {
                  m[p].push(t);
                  L.push(m[p]);
                  m[p] = [];
                  break;
                }
              }
        while (0 != m.length);
        for (var la = [], ka = -1, h = [], ga = [], p = 0; p < L.length; p++)
          if (0 < L[p].length) {
            h = m = t = r = 0;
            do
              ((m = g + r),
                (t = l + t),
                (m = d(m | 0, t | 0, L[p][0] | 0, L[p][1] | 0, oa)),
                (r =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (t =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (h += 1));
            while (5 > h && 0 == m);
            0 < m && ((h = L[p]), ga.push(h));
          }
        if (0 < ga.length) {
          do
            if (((g = ga.shift()), 0 < g.length && (g[2] == u || g[2] == n)))
              for (la.push(g), _sx = g[3], _sy = g[4], p = 0; p < L.length; p++)
                if (
                  ((h = m = t = r = 0),
                  0 < L[p].length && (L[p][2] == u || L[p][2] == n))
                )
                  if (f(L[p], la)) L[p] = [];
                  else {
                    do
                      ((m = _sx + r),
                        (t = _sy + t),
                        (m = d(m | 0, t | 0, L[p][0] | 0, L[p][1] | 0, oa)),
                        (r =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (t =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (h += 1));
                    while (5 > h && 0 == m);
                    0 < m && ((h = L[p]), (h[6] = g), ga.push(h), (L[p] = []));
                  }
          while (0 != ga.length);
        }
        for (p = 0; p < la.length; p++)
          if (1 == q) {
            if (
              ((oa = []),
              (m = d(k | 0, e | 0, la[p][3] | 0, la[p][4] | 0, oa)),
              0 < m)
            ) {
              ka = p;
              break;
            }
          } else if (la[p][2] == u) {
            ka = p;
            break;
          }
        if (0 <= ka) {
          k = la[ka];
          do (G.unshift({ map: k[2], x: k[0], y: k[1] }), (k = k[6]));
          while (k);
          0 < G.length &&
            (1 == q && G.push({ map: a.map, x: a.x, y: a.y }),
            self.postMessage(G));
        }
        0 == ga.length && 0 > ka && self.postMessage([]);
      }
    },
  };
});
