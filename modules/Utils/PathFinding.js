define("Utils/PathFinding", [], function () {
  function a(a, b) {
    var c,
      d = a[0]++;
    for (c = (d - 1) >> 1; 0 < d && f[b] < f[a[c + 1]]; c = (d - 1) >> 1)
      ((a[d + 1] = a[c + 1]), (d = c));
    a[d + 1] = b;
  }
  function b(a) {
    var b, c, d, n, e;
    if (0 >= a[0]) return -1;
    d = +a[1];
    n = +a[a[0]--];
    e = f[n];
    c = 0;
    for (b = 2; b < a[0]; b = 2 * b + 2)
      (f[a[b + 1]] > f[a[b]] && b--, (a[c + 1] = +a[b + 1]), (c = b));
    b === a[0] && ((a[c + 1] = +a[b]), (c = b - 1));
    for (b = (c - 1) >> 1; 0 < c && f[a[b + 1]] > e; b = (c - 1) >> 1)
      ((a[c + 1] = a[b + 1]), (c = b));
    a[c + 1] = n;
    return d;
  }
  function c(b, c, d, e, k, h) {
    var t = (c + 512 * d) & 262143;
    if (g[t] === c && u[t] === d) {
      if (l[t] > e) {
        l[t] = e;
        n[t] = k;
        f[t] = h;
        if (p[t]) a(b, t);
        else {
          for (d = 0; d < b[0] && b[d + 1] !== t; ++d);
          if (d === b[0])
            throw Error(
              "PathFinding::update_heap_path() - Error updating head path",
            );
          e = f[t];
          for (c = (d - 1) >> 1; 0 < d && e < f[b[c + 1]]; c = (d - 1) >> 1)
            ((b[d + 1] = b[c + 1]), (d = c));
          b[d + 1] = t;
        }
        p[t] = 0;
      }
      return 0;
    }
    if (g[t] || u[t]) return 1;
    g[t] = c;
    u[t] = d;
    l[t] = e;
    n[t] = k;
    f[t] = h;
    p[t] = 0;
    a(b, t);
    return 0;
  }
  function d(a, b, c, f, n, p, g) {
    var l,
      t,
      k,
      u,
      h,
      v = e.cells,
      m = e.width;
    t = (t = c - a) ? (0 > t ? -1 : 1) : 0;
    k = (k = f - b) ? (0 > k ? -1 : 1) : 0;
    u = a;
    h = b;
    l = 0;
    p[0] = a;
    for (
      p[1] = b;
      512 > l++ &&
      ((u += t),
      (h += k),
      (p[2 * l + 0] = u),
      (p[2 * l + 1] = h),
      u === c && (t = 0),
      h === f && (k = 0),
      (0 !== t || 0 !== k) && 0 !== (v[u + h * m] & g));
    );
    if (u === c && h === f) {
      if (0 < n)
        for (u = 0; u < l; ++u)
          if (
            Math.abs(p[2 * u + 0] - c) <= n &&
            Math.abs(p[2 * u + 1] - f) <= n
          )
            return u + 1;
      return l + 1;
    }
    return 0 < n && ((u = c - a), (h = f - b), Math.sqrt(u * u + h * h) <= n)
      ? d(a, b, c, f, 0, p, e.type.SNIPABLE)
      : 0;
  }
  var e = { width: 0, height: 0, cells: null, type: null },
    m = new Uint32Array(2400),
    h = new Uint32Array(2400),
    q = new Uint16Array(262144),
    r = new Uint8Array(262144),
    k = new Uint8Array(4),
    g = new Uint16Array(262144),
    u = new Uint16Array(262144),
    l = new Uint16Array(262144),
    f = new Uint16Array(262144),
    n = new Uint32Array(262144),
    p = new Uint8Array(262144);
  return {
    search: function (v, t, z, E, C, J) {
      var A,
        B,
        F,
        O,
        M,
        H,
        x,
        I,
        D = e.width;
      F = e.height;
      var L = e.cells,
        y = e.type;
      if ((C = d(v, t, z, E, C, J, y.WALKABLE))) return C;
      m.set(h);
      g.set(q);
      u.set(q);
      l.set(q);
      f.set(q);
      n.set(q);
      p.set(r);
      J[0] = v;
      J[1] = t;
      C = (v + 512 * t) & 262143;
      g[C] = v;
      u[C] = t;
      f[C] = 10 * (Math.abs(z - g[C]) + Math.abs(E - u[C])) + l[C];
      m[0] = 0;
      a(m, C);
      C = D - 1;
      for (O = F - 1; ;) {
        H = M = 0;
        k[0] = 0;
        k[1] = 0;
        k[2] = 0;
        k[3] = 0;
        F = b(m);
        if (0 > F) return 0;
        A = g[F];
        B = u[F];
        x = l[F] + 10;
        I = f[F];
        if (A === z && B === E) break;
        B < O &&
          L[A + 0 + (B + 1) * D] & y.WALKABLE &&
          ((k[0] = B >= E ? 20 : 0),
          (H |= 1),
          (M += c(m, A + 0, B + 1, x, F, I + k[0])));
        0 < A &&
          L[A - 1 + (B + 0) * D] & y.WALKABLE &&
          ((k[1] = A <= z ? 20 : 0),
          (H |= 2),
          (M += c(m, A - 1, B + 0, x, F, I + k[1])));
        0 < B &&
          L[A + 0 + (B - 1) * D] & y.WALKABLE &&
          ((k[2] = B <= E ? 20 : 0),
          (H |= 4),
          (M += c(m, A + 0, B - 1, x, F, I + k[2])));
        A < C &&
          L[A + 1 + (B + 0) * D] & y.WALKABLE &&
          ((k[3] = A >= z ? 20 : 0),
          (H |= 8),
          (M += c(m, A + 1, B + 0, x, F, I + k[3])));
        3 === (H & 3) &&
          L[A - 1 + (B + 1) * D] & y.WALKABLE &&
          (M += c(m, A - 1, B + 1, x + 4, F, I + k[1] + k[0] - 6));
        6 === (H & 6) &&
          L[A - 1 + (B - 1) * D] & y.WALKABLE &&
          (M += c(m, A - 1, B - 1, x + 4, F, I + k[1] + k[2] - 6));
        12 === (H & 12) &&
          L[A + 1 + (B - 1) * D] & y.WALKABLE &&
          (M += c(m, A + 1, B - 1, x + 4, F, I + k[3] + k[2] - 6));
        9 === (H & 9) &&
          L[A + 1 + (B + 1) * D] & y.WALKABLE &&
          (M += c(m, A + 1, B + 1, x + 4, F, I + k[3] + k[0] - 6));
        p[F] = 1;
        if (M || 2395 <= m[0]) return 0;
      }
      z = 0;
      for (C = F; 100 > z && C !== ((v + 512 * t) & 262143); C = n[C], z++);
      C = F;
      for (v = z - 1; 0 <= v; C = n[C], v--)
        ((J[2 * (v + 1) + 0] = g[C]), (J[2 * (v + 1) + 1] = u[C]));
      return z + 1;
    },
    searchLong: d,
    searchNavigate: function (d, t, z, E, C) {
      var v,
        A,
        B,
        F,
        O,
        M,
        H,
        x,
        I,
        D = e.width;
      F = e.height;
      var L = e.cells,
        y = e.type;
      m.set(h);
      g.set(q);
      u.set(q);
      l.set(q);
      f.set(q);
      n.set(q);
      p.set(r);
      C[0] = d;
      C[1] = t;
      B = (d + 512 * t) & 262143;
      g[B] = d;
      u[B] = t;
      f[B] = 10 * (Math.abs(z - g[B]) + Math.abs(E - u[B])) + l[B];
      m[0] = 0;
      a(m, B);
      B = D - 1;
      for (O = F - 1; ;) {
        H = M = 0;
        k[0] = 0;
        k[1] = 0;
        k[2] = 0;
        k[3] = 0;
        F = b(m);
        if (0 > F) return 0;
        v = g[F];
        A = u[F];
        x = l[F] + 10;
        I = f[F];
        if (v === z && A === E) break;
        A < O &&
          L[v + 0 + (A + 1) * D] & y.WALKABLE &&
          ((k[0] = A >= E ? 20 : 0),
          (H |= 1),
          (M += c(m, v + 0, A + 1, x, F, I + k[0])));
        0 < v &&
          L[v - 1 + (A + 0) * D] & y.WALKABLE &&
          ((k[1] = v <= z ? 20 : 0),
          (H |= 2),
          (M += c(m, v - 1, A + 0, x, F, I + k[1])));
        0 < A &&
          L[v + 0 + (A - 1) * D] & y.WALKABLE &&
          ((k[2] = A <= E ? 20 : 0),
          (H |= 4),
          (M += c(m, v + 0, A - 1, x, F, I + k[2])));
        v < B &&
          L[v + 1 + (A + 0) * D] & y.WALKABLE &&
          ((k[3] = v >= z ? 20 : 0),
          (H |= 8),
          (M += c(m, v + 1, A + 0, x, F, I + k[3])));
        3 === (H & 3) &&
          L[v - 1 + (A + 1) * D] & y.WALKABLE &&
          (M += c(m, v - 1, A + 1, x + 4, F, I + k[1] + k[0] - 6));
        6 === (H & 6) &&
          L[v - 1 + (A - 1) * D] & y.WALKABLE &&
          (M += c(m, v - 1, A - 1, x + 4, F, I + k[1] + k[2] - 6));
        12 === (H & 12) &&
          L[v + 1 + (A - 1) * D] & y.WALKABLE &&
          (M += c(m, v + 1, A - 1, x + 4, F, I + k[3] + k[2] - 6));
        9 === (H & 9) &&
          L[v + 1 + (A + 1) * D] & y.WALKABLE &&
          (M += c(m, v + 1, A + 1, x + 4, F, I + k[3] + k[0] - 6));
        p[F] = 1;
        if (M || 2395 <= m[0]) return 0;
      }
      z = 0;
      for (B = F; 2e3 > z && B !== ((d + 512 * t) & 262143); B = n[B], z++);
      B = F;
      for (d = z - 1; 0 <= d; B = n[B], d--)
        ((C[2 * (d + 1) + 0] = g[B]), (C[2 * (d + 1) + 1] = u[B]));
      return z + 1;
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
      function c(a, c, d, f, n, e) {
        var p = (c + 512 * d) & 262143;
        if (T[p] === c && da[p] === d) {
          if (R[p] > f) {
            R[p] = f;
            ea[p] = n;
            fa[p] = e;
            if (ta[p]) b(a, p);
            else {
              for (d = 0; d < a[0] && a[d + 1] !== p; ++d);
              if (d === a[0])
                throw Error(
                  "PathFinding::update_heap_path() - Error updating head path",
                );
              f = fa[p];
              for (
                c = (d - 1) >> 1;
                0 < d && f < fa[a[c + 1]];
                c = (d - 1) >> 1
              )
                ((a[d + 1] = a[c + 1]), (d = c));
              a[d + 1] = p;
            }
            ta[p] = 0;
          }
          return 0;
        }
        if (T[p] || da[p]) return 1;
        T[p] = c;
        da[p] = d;
        R[p] = f;
        ea[p] = n;
        fa[p] = e;
        ta[p] = 0;
        b(a, p);
        return 0;
      }
      function d(a, d, f, n, e) {
        var p,
          g,
          l,
          t,
          k,
          u,
          h,
          v,
          m,
          z,
          C = N.width;
        u = N.height;
        var E = N.cells,
          r = N.type;
        Q.set(W);
        T.set(V);
        da.set(V);
        R.set(V);
        fa.set(V);
        ea.set(V);
        ta.set(ba);
        p = Q;
        e[0] = a;
        e[1] = d;
        t = (a + 512 * d) & 262143;
        T[t] = a;
        da[t] = d;
        fa[t] = 10 * (Math.abs(f - T[t]) + Math.abs(n - da[t])) + R[t];
        p[0] = 0;
        b(p, t);
        t = C - 1;
        for (--u; ;) {
          v = h = 0;
          S[0] = 0;
          S[1] = 0;
          S[2] = 0;
          S[3] = 0;
          k = p;
          var J;
          if (0 >= k[0]) k = -1;
          else {
            l = +k[1];
            m = +k[k[0]--];
            z = fa[m];
            g = 0;
            for (J = 2; J < k[0]; J = 2 * J + 2)
              (fa[k[J + 1]] > fa[k[J]] && J--, (k[g + 1] = +k[J + 1]), (g = J));
            J === k[0] && ((k[g + 1] = +k[J]), (g = J - 1));
            for (J = (g - 1) >> 1; 0 < g && fa[k[J + 1]] > z; J = (g - 1) >> 1)
              ((k[g + 1] = k[J + 1]), (g = J));
            k[g + 1] = m;
            k = l;
          }
          if (0 > k) return 0;
          g = T[k];
          l = da[k];
          m = R[k] + 10;
          z = fa[k];
          if (g === f && l === n) break;
          l < u &&
            E[g + 0 + (l + 1) * C] & r.WALKABLE &&
            ((S[0] = l >= n ? 20 : 0),
            (v |= 1),
            (h += c(p, g + 0, l + 1, m, k, z + S[0])));
          0 < g &&
            E[g - 1 + (l + 0) * C] & r.WALKABLE &&
            ((S[1] = g <= f ? 20 : 0),
            (v |= 2),
            (h += c(p, g - 1, l + 0, m, k, z + S[1])));
          0 < l &&
            E[g + 0 + (l - 1) * C] & r.WALKABLE &&
            ((S[2] = l <= n ? 20 : 0),
            (v |= 4),
            (h += c(p, g + 0, l - 1, m, k, z + S[2])));
          g < t &&
            E[g + 1 + (l + 0) * C] & r.WALKABLE &&
            ((S[3] = g >= f ? 20 : 0),
            (v |= 8),
            (h += c(p, g + 1, l + 0, m, k, z + S[3])));
          3 === (v & 3) &&
            E[g - 1 + (l + 1) * C] & r.WALKABLE &&
            (h += c(p, g - 1, l + 1, m + 4, k, z + S[1] + S[0] - 6));
          6 === (v & 6) &&
            E[g - 1 + (l - 1) * C] & r.WALKABLE &&
            (h += c(p, g - 1, l - 1, m + 4, k, z + S[1] + S[2] - 6));
          12 === (v & 12) &&
            E[g + 1 + (l - 1) * C] & r.WALKABLE &&
            (h += c(p, g + 1, l - 1, m + 4, k, z + S[3] + S[2] - 6));
          9 === (v & 9) &&
            E[g + 1 + (l + 1) * C] & r.WALKABLE &&
            (h += c(p, g + 1, l + 1, m + 4, k, z + S[3] + S[0] - 6));
          ta[k] = 1;
          if (h || 2395 <= p[0]) return 0;
        }
        f = 0;
        for (t = k; 2e3 > f && t !== ((a + 512 * d) & 262143); t = ea[t], f++);
        t = k;
        for (a = f - 1; 0 <= a; t = ea[t], a--)
          ((e[2 * (a + 1) + 0] = T[t]), (e[2 * (a + 1) + 1] = da[t]));
        return f + 1;
      }
      function f(a, b) {
        for (var c in b) if (a[5] == b[c][5]) return c;
        return !1;
      }
      a = a.data;
      var n = a.x,
        e = a.y,
        p = a.type,
        g = a.sx,
        l = a.sy,
        k = a.warps,
        u = a.curMap,
        h = a.nextMap,
        v = [],
        m = 0,
        r = (v = 0),
        q = 0,
        G = [],
        K = {},
        N = { width: a.width, height: a.height, cells: a.cells, type: a.types },
        Q = new Uint32Array(2400),
        W = new Uint32Array(2400),
        V = new Uint16Array(262144),
        ba = new Uint8Array(262144),
        S = new Uint8Array(4),
        T = new Uint16Array(262144),
        da = new Uint16Array(262144),
        R = new Uint16Array(262144),
        fa = new Uint16Array(262144),
        ea = new Uint32Array(262144),
        ta = new Uint8Array(262144),
        pa = [];
      do {
        var la = a.x + r,
          q = a.y + q,
          m = d(g | 0, l | 0, la | 0, q | 0, pa);
        if (0 < m) {
          K = { map: a.map, x: la, y: q };
          break;
        }
        r =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        q =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        v += 1;
      } while (5 > v && 0 == m);
      if (0 < m) (G.push(K), self.postMessage(G));
      else {
        K = [];
        m = JSON.parse(JSON.stringify(k));
        q = 0;
        do
          if (((q += 1), (v = m.shift()), 0 < v.length))
            for (v.push(q), K.push(v), k = 0; k < m.length; k++)
              if (0 < m[k].length) {
                var la = d(v[0] | 0, v[1] | 0, m[k][3] | 0, m[k][4] | 0, 0, pa),
                  ga = d(v[3] | 0, v[4] | 0, m[k][0] | 0, m[k][1] | 0, 0, pa);
                if (la && ga) {
                  m[k].push(q);
                  K.push(m[k]);
                  m[k] = [];
                  break;
                }
              }
        while (0 != m.length);
        for (var ka = [], la = -1, v = [], ga = [], k = 0; k < K.length; k++)
          if (0 < K[k].length) {
            v = m = q = r = 0;
            do
              ((m = g + r),
                (q = l + q),
                (m = d(m | 0, q | 0, K[k][0] | 0, K[k][1] | 0, pa)),
                (r =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (q =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (v += 1));
            while (5 > v && 0 == m);
            0 < m && ((v = K[k]), ga.push(v));
          }
        if (0 < ga.length) {
          do
            if (((g = ga.shift()), 0 < g.length && (g[2] == h || g[2] == u)))
              for (ka.push(g), _sx = g[3], _sy = g[4], k = 0; k < K.length; k++)
                if (
                  ((v = m = q = r = 0),
                  0 < K[k].length && (K[k][2] == h || K[k][2] == u))
                )
                  if (f(K[k], ka)) K[k] = [];
                  else {
                    do
                      ((m = _sx + r),
                        (q = _sy + q),
                        (m = d(m | 0, q | 0, K[k][0] | 0, K[k][1] | 0, pa)),
                        (r =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (q =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (v += 1));
                    while (5 > v && 0 == m);
                    0 < m && ((v = K[k]), (v[6] = g), ga.push(v), (K[k] = []));
                  }
          while (0 != ga.length);
        }
        for (k = 0; k < ka.length; k++)
          if (1 == p) {
            if (
              ((pa = []),
              (m = d(n | 0, e | 0, ka[k][3] | 0, ka[k][4] | 0, pa)),
              0 < m)
            ) {
              la = k;
              break;
            }
          } else if (ka[k][2] == h) {
            la = k;
            break;
          }
        if (0 <= la) {
          n = ka[la];
          do (G.unshift({ map: n[2], x: n[0], y: n[1] }), (n = n[6]));
          while (n);
          0 < G.length &&
            (1 == p && G.push({ map: a.map, x: a.x, y: a.y }),
            self.postMessage(G));
        }
        0 == ga.length && 0 > la && self.postMessage([]);
      }
    },
  };
});
