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
    var v = (c + 512 * d) & 262143;
    if (g[v] === c && t[v] === d) {
      if (l[v] > e) {
        l[v] = e;
        n[v] = k;
        f[v] = h;
        if (p[v]) a(b, v);
        else {
          for (d = 0; d < b[0] && b[d + 1] !== v; ++d);
          if (d === b[0])
            throw Error(
              "PathFinding::update_heap_path() - Error updating head path",
            );
          e = f[v];
          for (c = (d - 1) >> 1; 0 < d && e < f[b[c + 1]]; c = (d - 1) >> 1)
            ((b[d + 1] = b[c + 1]), (d = c));
          b[d + 1] = v;
        }
        p[v] = 0;
      }
      return 0;
    }
    if (g[v] || t[v]) return 1;
    g[v] = c;
    t[v] = d;
    l[v] = e;
    n[v] = k;
    f[v] = h;
    p[v] = 0;
    a(b, v);
    return 0;
  }
  function d(a, b, c, f, n, p, g) {
    var l,
      k,
      t,
      v,
      u,
      h = e.cells,
      m = e.width;
    k = (k = c - a) ? (0 > k ? -1 : 1) : 0;
    t = (t = f - b) ? (0 > t ? -1 : 1) : 0;
    v = a;
    u = b;
    l = 0;
    p[0] = a;
    for (
      p[1] = b;
      512 > l++ &&
      ((v += k),
      (u += t),
      (p[2 * l + 0] = v),
      (p[2 * l + 1] = u),
      v === c && (k = 0),
      u === f && (t = 0),
      (0 !== k || 0 !== t) && 0 !== (h[v + u * m] & g));
    );
    if (v === c && u === f) {
      if (0 < n)
        for (v = 0; v < l; ++v)
          if (
            Math.abs(p[2 * v + 0] - c) <= n &&
            Math.abs(p[2 * v + 1] - f) <= n
          )
            return v + 1;
      return l + 1;
    }
    return 0 < n && ((v = c - a), (u = f - b), Math.sqrt(v * v + u * u) <= n)
      ? d(a, b, c, f, 0, p, e.type.SNIPABLE)
      : 0;
  }
  var e = { width: 0, height: 0, cells: null, type: null },
    m = new Uint32Array(2400),
    h = new Uint32Array(2400),
    r = new Uint16Array(262144),
    q = new Uint8Array(262144),
    k = new Uint8Array(4),
    g = new Uint16Array(262144),
    t = new Uint16Array(262144),
    l = new Uint16Array(262144),
    f = new Uint16Array(262144),
    n = new Uint32Array(262144),
    p = new Uint8Array(262144);
  return {
    search: function (v, u, A, D, B, O) {
      var C,
        y,
        z,
        J,
        I,
        L,
        x,
        M,
        E = e.width;
      z = e.height;
      var F = e.cells,
        G = e.type;
      if ((B = d(v, u, A, D, B, O, G.WALKABLE))) return B;
      m.set(h);
      g.set(r);
      t.set(r);
      l.set(r);
      f.set(r);
      n.set(r);
      p.set(q);
      O[0] = v;
      O[1] = u;
      B = (v + 512 * u) & 262143;
      g[B] = v;
      t[B] = u;
      f[B] = 10 * (Math.abs(A - g[B]) + Math.abs(D - t[B])) + l[B];
      m[0] = 0;
      a(m, B);
      B = E - 1;
      for (J = z - 1; ;) {
        L = I = 0;
        k[0] = 0;
        k[1] = 0;
        k[2] = 0;
        k[3] = 0;
        z = b(m);
        if (0 > z) return 0;
        C = g[z];
        y = t[z];
        x = l[z] + 10;
        M = f[z];
        if (C === A && y === D) break;
        y < J &&
          F[C + 0 + (y + 1) * E] & G.WALKABLE &&
          ((k[0] = y >= D ? 20 : 0),
          (L |= 1),
          (I += c(m, C + 0, y + 1, x, z, M + k[0])));
        0 < C &&
          F[C - 1 + (y + 0) * E] & G.WALKABLE &&
          ((k[1] = C <= A ? 20 : 0),
          (L |= 2),
          (I += c(m, C - 1, y + 0, x, z, M + k[1])));
        0 < y &&
          F[C + 0 + (y - 1) * E] & G.WALKABLE &&
          ((k[2] = y <= D ? 20 : 0),
          (L |= 4),
          (I += c(m, C + 0, y - 1, x, z, M + k[2])));
        C < B &&
          F[C + 1 + (y + 0) * E] & G.WALKABLE &&
          ((k[3] = C >= A ? 20 : 0),
          (L |= 8),
          (I += c(m, C + 1, y + 0, x, z, M + k[3])));
        3 === (L & 3) &&
          F[C - 1 + (y + 1) * E] & G.WALKABLE &&
          (I += c(m, C - 1, y + 1, x + 4, z, M + k[1] + k[0] - 6));
        6 === (L & 6) &&
          F[C - 1 + (y - 1) * E] & G.WALKABLE &&
          (I += c(m, C - 1, y - 1, x + 4, z, M + k[1] + k[2] - 6));
        12 === (L & 12) &&
          F[C + 1 + (y - 1) * E] & G.WALKABLE &&
          (I += c(m, C + 1, y - 1, x + 4, z, M + k[3] + k[2] - 6));
        9 === (L & 9) &&
          F[C + 1 + (y + 1) * E] & G.WALKABLE &&
          (I += c(m, C + 1, y + 1, x + 4, z, M + k[3] + k[0] - 6));
        p[z] = 1;
        if (I || 2395 <= m[0]) return 0;
      }
      A = 0;
      for (B = z; 100 > A && B !== ((v + 512 * u) & 262143); B = n[B], A++);
      B = z;
      for (v = A - 1; 0 <= v; B = n[B], v--)
        ((O[2 * (v + 1) + 0] = g[B]), (O[2 * (v + 1) + 1] = t[B]));
      return A + 1;
    },
    searchLong: d,
    searchNavigate: function (d, u, A, D, B) {
      var v,
        C,
        y,
        z,
        J,
        I,
        L,
        x,
        M,
        E = e.width;
      z = e.height;
      var F = e.cells,
        G = e.type;
      m.set(h);
      g.set(r);
      t.set(r);
      l.set(r);
      f.set(r);
      n.set(r);
      p.set(q);
      B[0] = d;
      B[1] = u;
      y = (d + 512 * u) & 262143;
      g[y] = d;
      t[y] = u;
      f[y] = 10 * (Math.abs(A - g[y]) + Math.abs(D - t[y])) + l[y];
      m[0] = 0;
      a(m, y);
      y = E - 1;
      for (J = z - 1; ;) {
        L = I = 0;
        k[0] = 0;
        k[1] = 0;
        k[2] = 0;
        k[3] = 0;
        z = b(m);
        if (0 > z) return 0;
        v = g[z];
        C = t[z];
        x = l[z] + 10;
        M = f[z];
        if (v === A && C === D) break;
        C < J &&
          F[v + 0 + (C + 1) * E] & G.WALKABLE &&
          ((k[0] = C >= D ? 20 : 0),
          (L |= 1),
          (I += c(m, v + 0, C + 1, x, z, M + k[0])));
        0 < v &&
          F[v - 1 + (C + 0) * E] & G.WALKABLE &&
          ((k[1] = v <= A ? 20 : 0),
          (L |= 2),
          (I += c(m, v - 1, C + 0, x, z, M + k[1])));
        0 < C &&
          F[v + 0 + (C - 1) * E] & G.WALKABLE &&
          ((k[2] = C <= D ? 20 : 0),
          (L |= 4),
          (I += c(m, v + 0, C - 1, x, z, M + k[2])));
        v < y &&
          F[v + 1 + (C + 0) * E] & G.WALKABLE &&
          ((k[3] = v >= A ? 20 : 0),
          (L |= 8),
          (I += c(m, v + 1, C + 0, x, z, M + k[3])));
        3 === (L & 3) &&
          F[v - 1 + (C + 1) * E] & G.WALKABLE &&
          (I += c(m, v - 1, C + 1, x + 4, z, M + k[1] + k[0] - 6));
        6 === (L & 6) &&
          F[v - 1 + (C - 1) * E] & G.WALKABLE &&
          (I += c(m, v - 1, C - 1, x + 4, z, M + k[1] + k[2] - 6));
        12 === (L & 12) &&
          F[v + 1 + (C - 1) * E] & G.WALKABLE &&
          (I += c(m, v + 1, C - 1, x + 4, z, M + k[3] + k[2] - 6));
        9 === (L & 9) &&
          F[v + 1 + (C + 1) * E] & G.WALKABLE &&
          (I += c(m, v + 1, C + 1, x + 4, z, M + k[3] + k[0] - 6));
        p[z] = 1;
        if (I || 2395 <= m[0]) return 0;
      }
      A = 0;
      for (y = z; 2e3 > A && y !== ((d + 512 * u) & 262143); y = n[y], A++);
      y = z;
      for (d = A - 1; 0 <= d; y = n[y], d--)
        ((B[2 * (d + 1) + 0] = g[y]), (B[2 * (d + 1) + 1] = t[y]));
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
      function c(a, c, d, f, n, e) {
        var p = (c + 512 * d) & 262143;
        if (V[p] === c && ca[p] === d) {
          if (T[p] > f) {
            T[p] = f;
            da[p] = n;
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
        if (V[p] || ca[p]) return 1;
        V[p] = c;
        ca[p] = d;
        T[p] = f;
        da[p] = n;
        fa[p] = e;
        ta[p] = 0;
        b(a, p);
        return 0;
      }
      function d(a, d, f, n, e) {
        var p,
          g,
          l,
          k,
          t,
          v,
          h,
          u,
          m,
          D,
          B = P.width;
        v = P.height;
        var A = P.cells,
          q = P.type;
        N.set(S);
        V.set(R);
        ca.set(R);
        T.set(R);
        fa.set(R);
        da.set(R);
        ta.set(ea);
        p = N;
        e[0] = a;
        e[1] = d;
        k = (a + 512 * d) & 262143;
        V[k] = a;
        ca[k] = d;
        fa[k] = 10 * (Math.abs(f - V[k]) + Math.abs(n - ca[k])) + T[k];
        p[0] = 0;
        b(p, k);
        k = B - 1;
        for (--v; ;) {
          u = h = 0;
          U[0] = 0;
          U[1] = 0;
          U[2] = 0;
          U[3] = 0;
          t = p;
          var z;
          if (0 >= t[0]) t = -1;
          else {
            l = +t[1];
            m = +t[t[0]--];
            D = fa[m];
            g = 0;
            for (z = 2; z < t[0]; z = 2 * z + 2)
              (fa[t[z + 1]] > fa[t[z]] && z--, (t[g + 1] = +t[z + 1]), (g = z));
            z === t[0] && ((t[g + 1] = +t[z]), (g = z - 1));
            for (z = (g - 1) >> 1; 0 < g && fa[t[z + 1]] > D; z = (g - 1) >> 1)
              ((t[g + 1] = t[z + 1]), (g = z));
            t[g + 1] = m;
            t = l;
          }
          if (0 > t) return 0;
          g = V[t];
          l = ca[t];
          m = T[t] + 10;
          D = fa[t];
          if (g === f && l === n) break;
          l < v &&
            A[g + 0 + (l + 1) * B] & q.WALKABLE &&
            ((U[0] = l >= n ? 20 : 0),
            (u |= 1),
            (h += c(p, g + 0, l + 1, m, t, D + U[0])));
          0 < g &&
            A[g - 1 + (l + 0) * B] & q.WALKABLE &&
            ((U[1] = g <= f ? 20 : 0),
            (u |= 2),
            (h += c(p, g - 1, l + 0, m, t, D + U[1])));
          0 < l &&
            A[g + 0 + (l - 1) * B] & q.WALKABLE &&
            ((U[2] = l <= n ? 20 : 0),
            (u |= 4),
            (h += c(p, g + 0, l - 1, m, t, D + U[2])));
          g < k &&
            A[g + 1 + (l + 0) * B] & q.WALKABLE &&
            ((U[3] = g >= f ? 20 : 0),
            (u |= 8),
            (h += c(p, g + 1, l + 0, m, t, D + U[3])));
          3 === (u & 3) &&
            A[g - 1 + (l + 1) * B] & q.WALKABLE &&
            (h += c(p, g - 1, l + 1, m + 4, t, D + U[1] + U[0] - 6));
          6 === (u & 6) &&
            A[g - 1 + (l - 1) * B] & q.WALKABLE &&
            (h += c(p, g - 1, l - 1, m + 4, t, D + U[1] + U[2] - 6));
          12 === (u & 12) &&
            A[g + 1 + (l - 1) * B] & q.WALKABLE &&
            (h += c(p, g + 1, l - 1, m + 4, t, D + U[3] + U[2] - 6));
          9 === (u & 9) &&
            A[g + 1 + (l + 1) * B] & q.WALKABLE &&
            (h += c(p, g + 1, l + 1, m + 4, t, D + U[3] + U[0] - 6));
          ta[t] = 1;
          if (h || 2395 <= p[0]) return 0;
        }
        f = 0;
        for (k = t; 2e3 > f && k !== ((a + 512 * d) & 262143); k = da[k], f++);
        k = t;
        for (a = f - 1; 0 <= a; k = da[k], a--)
          ((e[2 * (a + 1) + 0] = V[k]), (e[2 * (a + 1) + 1] = ca[k]));
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
        t = a.curMap,
        v = a.nextMap,
        h = [],
        m = 0,
        q = (h = 0),
        r = 0,
        H = [],
        K = {},
        P = { width: a.width, height: a.height, cells: a.cells, type: a.types },
        N = new Uint32Array(2400),
        S = new Uint32Array(2400),
        R = new Uint16Array(262144),
        ea = new Uint8Array(262144),
        U = new Uint8Array(4),
        V = new Uint16Array(262144),
        ca = new Uint16Array(262144),
        T = new Uint16Array(262144),
        fa = new Uint16Array(262144),
        da = new Uint32Array(262144),
        ta = new Uint8Array(262144),
        ka = [];
      do {
        var oa = a.x + q,
          r = a.y + r,
          m = d(g | 0, l | 0, oa | 0, r | 0, ka);
        if (0 < m) {
          K = { map: a.map, x: oa, y: r };
          break;
        }
        q =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        r =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        h += 1;
      } while (5 > h && 0 == m);
      if (0 < m) (H.push(K), self.postMessage(H));
      else {
        K = [];
        m = JSON.parse(JSON.stringify(k));
        r = 0;
        do
          if (((r += 1), (h = m.shift()), 0 < h.length))
            for (h.push(r), K.push(h), k = 0; k < m.length; k++)
              if (0 < m[k].length) {
                var oa = d(h[0] | 0, h[1] | 0, m[k][3] | 0, m[k][4] | 0, 0, ka),
                  ga = d(h[3] | 0, h[4] | 0, m[k][0] | 0, m[k][1] | 0, 0, ka);
                if (oa && ga) {
                  m[k].push(r);
                  K.push(m[k]);
                  m[k] = [];
                  break;
                }
              }
        while (0 != m.length);
        for (var la = [], oa = -1, h = [], ga = [], k = 0; k < K.length; k++)
          if (0 < K[k].length) {
            h = m = r = q = 0;
            do
              ((m = g + q),
                (r = l + r),
                (m = d(m | 0, r | 0, K[k][0] | 0, K[k][1] | 0, ka)),
                (q =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (r =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (h += 1));
            while (5 > h && 0 == m);
            0 < m && ((h = K[k]), ga.push(h));
          }
        if (0 < ga.length) {
          do
            if (((g = ga.shift()), 0 < g.length && (g[2] == v || g[2] == t)))
              for (la.push(g), _sx = g[3], _sy = g[4], k = 0; k < K.length; k++)
                if (
                  ((h = m = r = q = 0),
                  0 < K[k].length && (K[k][2] == v || K[k][2] == t))
                )
                  if (f(K[k], la)) K[k] = [];
                  else {
                    do
                      ((m = _sx + q),
                        (r = _sy + r),
                        (m = d(m | 0, r | 0, K[k][0] | 0, K[k][1] | 0, ka)),
                        (q =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (r =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (h += 1));
                    while (5 > h && 0 == m);
                    0 < m && ((h = K[k]), (h[6] = g), ga.push(h), (K[k] = []));
                  }
          while (0 != ga.length);
        }
        for (k = 0; k < la.length; k++)
          if (1 == p) {
            if (
              ((ka = []),
              (m = d(n | 0, e | 0, la[k][3] | 0, la[k][4] | 0, ka)),
              0 < m)
            ) {
              oa = k;
              break;
            }
          } else if (la[k][2] == v) {
            oa = k;
            break;
          }
        if (0 <= oa) {
          n = la[oa];
          do (H.unshift({ map: n[2], x: n[0], y: n[1] }), (n = n[6]));
          while (n);
          0 < H.length &&
            (1 == p && H.push({ map: a.map, x: a.x, y: a.y }),
            self.postMessage(H));
        }
        0 == ga.length && 0 > oa && self.postMessage([]);
      }
    },
  };
});
