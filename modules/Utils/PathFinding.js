define("Utils/PathFinding", [], function () {
  function a(a, b) {
    var c,
      d = a[0]++;
    for (c = (d - 1) >> 1; 0 < d && f[b] < f[a[c + 1]]; c = (d - 1) >> 1)
      ((a[d + 1] = a[c + 1]), (d = c));
    a[d + 1] = b;
  }
  function b(a) {
    var b, c, d, m, e;
    if (0 >= a[0]) return -1;
    d = +a[1];
    m = +a[a[0]--];
    e = f[m];
    c = 0;
    for (b = 2; b < a[0]; b = 2 * b + 2)
      (f[a[b + 1]] > f[a[b]] && b--, (a[c + 1] = +a[b + 1]), (c = b));
    b === a[0] && ((a[c + 1] = +a[b]), (c = b - 1));
    for (b = (c - 1) >> 1; 0 < c && f[a[b + 1]] > e; b = (c - 1) >> 1)
      ((a[c + 1] = a[b + 1]), (c = b));
    a[c + 1] = m;
    return d;
  }
  function c(b, c, d, e, n, h) {
    var v = (c + 512 * d) & 262143;
    if (g[v] === c && p[v] === d) {
      if (k[v] > e) {
        k[v] = e;
        m[v] = n;
        f[v] = h;
        if (q[v]) a(b, v);
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
        q[v] = 0;
      }
      return 0;
    }
    if (g[v] || p[v]) return 1;
    g[v] = c;
    p[v] = d;
    k[v] = e;
    m[v] = n;
    f[v] = h;
    q[v] = 0;
    a(b, v);
    return 0;
  }
  function d(a, b, c, f, m, q, g) {
    var k,
      p,
      n,
      v,
      h,
      u = e.cells,
      D = e.width;
    p = (p = c - a) ? (0 > p ? -1 : 1) : 0;
    n = (n = f - b) ? (0 > n ? -1 : 1) : 0;
    v = a;
    h = b;
    k = 0;
    q[0] = a;
    for (
      q[1] = b;
      512 > k++ &&
      ((v += p),
      (h += n),
      (q[2 * k + 0] = v),
      (q[2 * k + 1] = h),
      v === c && (p = 0),
      h === f && (n = 0),
      (0 !== p || 0 !== n) && 0 !== (u[v + h * D] & g));
    );
    if (v === c && h === f) {
      if (0 < m)
        for (v = 0; v < k; ++v)
          if (
            Math.abs(q[2 * v + 0] - c) <= m &&
            Math.abs(q[2 * v + 1] - f) <= m
          )
            return v + 1;
      return k + 1;
    }
    return 0 < m && ((v = c - a), (h = f - b), Math.sqrt(v * v + h * h) <= m)
      ? d(a, b, c, f, 0, q, e.type.SNIPABLE)
      : 0;
  }
  var e = { width: 0, height: 0, cells: null, type: null },
    l = new Uint32Array(2400),
    h = new Uint32Array(2400),
    r = new Uint16Array(262144),
    t = new Uint8Array(262144),
    n = new Uint8Array(4),
    g = new Uint16Array(262144),
    p = new Uint16Array(262144),
    k = new Uint16Array(262144),
    f = new Uint16Array(262144),
    m = new Uint32Array(262144),
    q = new Uint8Array(262144);
  return {
    search: function (v, u, A, D, B, H) {
      var C,
        z,
        G,
        P,
        N,
        I,
        x,
        J,
        E = e.width;
      G = e.height;
      var L = e.cells,
        y = e.type;
      if ((B = d(v, u, A, D, B, H, y.WALKABLE))) return B;
      l.set(h);
      g.set(r);
      p.set(r);
      k.set(r);
      f.set(r);
      m.set(r);
      q.set(t);
      H[0] = v;
      H[1] = u;
      B = (v + 512 * u) & 262143;
      g[B] = v;
      p[B] = u;
      f[B] = 10 * (Math.abs(A - g[B]) + Math.abs(D - p[B])) + k[B];
      l[0] = 0;
      a(l, B);
      B = E - 1;
      for (P = G - 1; ;) {
        I = N = 0;
        n[0] = 0;
        n[1] = 0;
        n[2] = 0;
        n[3] = 0;
        G = b(l);
        if (0 > G) return 0;
        C = g[G];
        z = p[G];
        x = k[G] + 10;
        J = f[G];
        if (C === A && z === D) break;
        z < P &&
          L[C + 0 + (z + 1) * E] & y.WALKABLE &&
          ((n[0] = z >= D ? 20 : 0),
          (I |= 1),
          (N += c(l, C + 0, z + 1, x, G, J + n[0])));
        0 < C &&
          L[C - 1 + (z + 0) * E] & y.WALKABLE &&
          ((n[1] = C <= A ? 20 : 0),
          (I |= 2),
          (N += c(l, C - 1, z + 0, x, G, J + n[1])));
        0 < z &&
          L[C + 0 + (z - 1) * E] & y.WALKABLE &&
          ((n[2] = z <= D ? 20 : 0),
          (I |= 4),
          (N += c(l, C + 0, z - 1, x, G, J + n[2])));
        C < B &&
          L[C + 1 + (z + 0) * E] & y.WALKABLE &&
          ((n[3] = C >= A ? 20 : 0),
          (I |= 8),
          (N += c(l, C + 1, z + 0, x, G, J + n[3])));
        3 === (I & 3) &&
          L[C - 1 + (z + 1) * E] & y.WALKABLE &&
          (N += c(l, C - 1, z + 1, x + 4, G, J + n[1] + n[0] - 6));
        6 === (I & 6) &&
          L[C - 1 + (z - 1) * E] & y.WALKABLE &&
          (N += c(l, C - 1, z - 1, x + 4, G, J + n[1] + n[2] - 6));
        12 === (I & 12) &&
          L[C + 1 + (z - 1) * E] & y.WALKABLE &&
          (N += c(l, C + 1, z - 1, x + 4, G, J + n[3] + n[2] - 6));
        9 === (I & 9) &&
          L[C + 1 + (z + 1) * E] & y.WALKABLE &&
          (N += c(l, C + 1, z + 1, x + 4, G, J + n[3] + n[0] - 6));
        q[G] = 1;
        if (N || 2395 <= l[0]) return 0;
      }
      A = 0;
      for (B = G; 100 > A && B !== ((v + 512 * u) & 262143); B = m[B], A++);
      B = G;
      for (v = A - 1; 0 <= v; B = m[B], v--)
        ((H[2 * (v + 1) + 0] = g[B]), (H[2 * (v + 1) + 1] = p[B]));
      return A + 1;
    },
    searchLong: d,
    searchNavigate: function (d, u, A, D, B) {
      var v,
        C,
        z,
        G,
        P,
        N,
        I,
        x,
        J,
        E = e.width;
      G = e.height;
      var L = e.cells,
        y = e.type;
      l.set(h);
      g.set(r);
      p.set(r);
      k.set(r);
      f.set(r);
      m.set(r);
      q.set(t);
      B[0] = d;
      B[1] = u;
      z = (d + 512 * u) & 262143;
      g[z] = d;
      p[z] = u;
      f[z] = 10 * (Math.abs(A - g[z]) + Math.abs(D - p[z])) + k[z];
      l[0] = 0;
      a(l, z);
      z = E - 1;
      for (P = G - 1; ;) {
        I = N = 0;
        n[0] = 0;
        n[1] = 0;
        n[2] = 0;
        n[3] = 0;
        G = b(l);
        if (0 > G) return 0;
        v = g[G];
        C = p[G];
        x = k[G] + 10;
        J = f[G];
        if (v === A && C === D) break;
        C < P &&
          L[v + 0 + (C + 1) * E] & y.WALKABLE &&
          ((n[0] = C >= D ? 20 : 0),
          (I |= 1),
          (N += c(l, v + 0, C + 1, x, G, J + n[0])));
        0 < v &&
          L[v - 1 + (C + 0) * E] & y.WALKABLE &&
          ((n[1] = v <= A ? 20 : 0),
          (I |= 2),
          (N += c(l, v - 1, C + 0, x, G, J + n[1])));
        0 < C &&
          L[v + 0 + (C - 1) * E] & y.WALKABLE &&
          ((n[2] = C <= D ? 20 : 0),
          (I |= 4),
          (N += c(l, v + 0, C - 1, x, G, J + n[2])));
        v < z &&
          L[v + 1 + (C + 0) * E] & y.WALKABLE &&
          ((n[3] = v >= A ? 20 : 0),
          (I |= 8),
          (N += c(l, v + 1, C + 0, x, G, J + n[3])));
        3 === (I & 3) &&
          L[v - 1 + (C + 1) * E] & y.WALKABLE &&
          (N += c(l, v - 1, C + 1, x + 4, G, J + n[1] + n[0] - 6));
        6 === (I & 6) &&
          L[v - 1 + (C - 1) * E] & y.WALKABLE &&
          (N += c(l, v - 1, C - 1, x + 4, G, J + n[1] + n[2] - 6));
        12 === (I & 12) &&
          L[v + 1 + (C - 1) * E] & y.WALKABLE &&
          (N += c(l, v + 1, C - 1, x + 4, G, J + n[3] + n[2] - 6));
        9 === (I & 9) &&
          L[v + 1 + (C + 1) * E] & y.WALKABLE &&
          (N += c(l, v + 1, C + 1, x + 4, G, J + n[3] + n[0] - 6));
        q[G] = 1;
        if (N || 2395 <= l[0]) return 0;
      }
      A = 0;
      for (z = G; 2e3 > A && z !== ((d + 512 * u) & 262143); z = m[z], A++);
      z = G;
      for (d = A - 1; 0 <= d; z = m[z], d--)
        ((B[2 * (d + 1) + 0] = g[z]), (B[2 * (d + 1) + 1] = p[z]));
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
      function c(a, c, d, f, m, e) {
        var q = (c + 512 * d) & 262143;
        if (T[q] === c && da[q] === d) {
          if (R[q] > f) {
            R[q] = f;
            ea[q] = m;
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
        ea[q] = m;
        fa[q] = e;
        ta[q] = 0;
        b(a, q);
        return 0;
      }
      function d(a, d, f, m, e) {
        var q,
          g,
          k,
          p,
          n,
          v,
          h,
          u,
          l,
          D,
          B = M.width;
        v = M.height;
        var A = M.cells,
          t = M.type;
        Q.set(W);
        T.set(V);
        da.set(V);
        R.set(V);
        fa.set(V);
        ea.set(V);
        ta.set(ba);
        q = Q;
        e[0] = a;
        e[1] = d;
        p = (a + 512 * d) & 262143;
        T[p] = a;
        da[p] = d;
        fa[p] = 10 * (Math.abs(f - T[p]) + Math.abs(m - da[p])) + R[p];
        q[0] = 0;
        b(q, p);
        p = B - 1;
        for (--v; ;) {
          u = h = 0;
          S[0] = 0;
          S[1] = 0;
          S[2] = 0;
          S[3] = 0;
          n = q;
          var H;
          if (0 >= n[0]) n = -1;
          else {
            k = +n[1];
            l = +n[n[0]--];
            D = fa[l];
            g = 0;
            for (H = 2; H < n[0]; H = 2 * H + 2)
              (fa[n[H + 1]] > fa[n[H]] && H--, (n[g + 1] = +n[H + 1]), (g = H));
            H === n[0] && ((n[g + 1] = +n[H]), (g = H - 1));
            for (H = (g - 1) >> 1; 0 < g && fa[n[H + 1]] > D; H = (g - 1) >> 1)
              ((n[g + 1] = n[H + 1]), (g = H));
            n[g + 1] = l;
            n = k;
          }
          if (0 > n) return 0;
          g = T[n];
          k = da[n];
          l = R[n] + 10;
          D = fa[n];
          if (g === f && k === m) break;
          k < v &&
            A[g + 0 + (k + 1) * B] & t.WALKABLE &&
            ((S[0] = k >= m ? 20 : 0),
            (u |= 1),
            (h += c(q, g + 0, k + 1, l, n, D + S[0])));
          0 < g &&
            A[g - 1 + (k + 0) * B] & t.WALKABLE &&
            ((S[1] = g <= f ? 20 : 0),
            (u |= 2),
            (h += c(q, g - 1, k + 0, l, n, D + S[1])));
          0 < k &&
            A[g + 0 + (k - 1) * B] & t.WALKABLE &&
            ((S[2] = k <= m ? 20 : 0),
            (u |= 4),
            (h += c(q, g + 0, k - 1, l, n, D + S[2])));
          g < p &&
            A[g + 1 + (k + 0) * B] & t.WALKABLE &&
            ((S[3] = g >= f ? 20 : 0),
            (u |= 8),
            (h += c(q, g + 1, k + 0, l, n, D + S[3])));
          3 === (u & 3) &&
            A[g - 1 + (k + 1) * B] & t.WALKABLE &&
            (h += c(q, g - 1, k + 1, l + 4, n, D + S[1] + S[0] - 6));
          6 === (u & 6) &&
            A[g - 1 + (k - 1) * B] & t.WALKABLE &&
            (h += c(q, g - 1, k - 1, l + 4, n, D + S[1] + S[2] - 6));
          12 === (u & 12) &&
            A[g + 1 + (k - 1) * B] & t.WALKABLE &&
            (h += c(q, g + 1, k - 1, l + 4, n, D + S[3] + S[2] - 6));
          9 === (u & 9) &&
            A[g + 1 + (k + 1) * B] & t.WALKABLE &&
            (h += c(q, g + 1, k + 1, l + 4, n, D + S[3] + S[0] - 6));
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
      var m = a.x,
        e = a.y,
        q = a.type,
        g = a.sx,
        k = a.sy,
        p = a.warps,
        n = a.curMap,
        h = a.nextMap,
        v = [],
        l = 0,
        t = (v = 0),
        r = 0,
        F = [],
        K = {},
        M = { width: a.width, height: a.height, cells: a.cells, type: a.types },
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
        oa = [];
      do {
        var la = a.x + t,
          r = a.y + r,
          l = d(g | 0, k | 0, la | 0, r | 0, oa);
        if (0 < l) {
          K = { map: a.map, x: la, y: r };
          break;
        }
        t =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        r =
          Math.floor(3 * Math.random()) *
          (0 == Math.floor(Math.random()) % 2 ? -1 : 1);
        v += 1;
      } while (5 > v && 0 == l);
      if (0 < l) (F.push(K), self.postMessage(F));
      else {
        K = [];
        l = JSON.parse(JSON.stringify(p));
        r = 0;
        do
          if (((r += 1), (v = l.shift()), 0 < v.length))
            for (v.push(r), K.push(v), p = 0; p < l.length; p++)
              if (0 < l[p].length) {
                var la = d(v[0] | 0, v[1] | 0, l[p][3] | 0, l[p][4] | 0, 0, oa),
                  ga = d(v[3] | 0, v[4] | 0, l[p][0] | 0, l[p][1] | 0, 0, oa);
                if (la && ga) {
                  l[p].push(r);
                  K.push(l[p]);
                  l[p] = [];
                  break;
                }
              }
        while (0 != l.length);
        for (var ka = [], la = -1, v = [], ga = [], p = 0; p < K.length; p++)
          if (0 < K[p].length) {
            v = l = r = t = 0;
            do
              ((l = g + t),
                (r = k + r),
                (l = d(l | 0, r | 0, K[p][0] | 0, K[p][1] | 0, oa)),
                (t =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (r =
                  Math.floor(3 * Math.random()) *
                  (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                (v += 1));
            while (5 > v && 0 == l);
            0 < l && ((v = K[p]), ga.push(v));
          }
        if (0 < ga.length) {
          do
            if (((g = ga.shift()), 0 < g.length && (g[2] == h || g[2] == n)))
              for (ka.push(g), _sx = g[3], _sy = g[4], p = 0; p < K.length; p++)
                if (
                  ((v = l = r = t = 0),
                  0 < K[p].length && (K[p][2] == h || K[p][2] == n))
                )
                  if (f(K[p], ka)) K[p] = [];
                  else {
                    do
                      ((l = _sx + t),
                        (r = _sy + r),
                        (l = d(l | 0, r | 0, K[p][0] | 0, K[p][1] | 0, oa)),
                        (t =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (r =
                          Math.floor(3 * Math.random()) *
                          (0 == Math.floor(Math.random()) % 2 ? -1 : 1)),
                        (v += 1));
                    while (5 > v && 0 == l);
                    0 < l && ((v = K[p]), (v[6] = g), ga.push(v), (K[p] = []));
                  }
          while (0 != ga.length);
        }
        for (p = 0; p < ka.length; p++)
          if (1 == q) {
            if (
              ((oa = []),
              (l = d(m | 0, e | 0, ka[p][3] | 0, ka[p][4] | 0, oa)),
              0 < l)
            ) {
              la = p;
              break;
            }
          } else if (ka[p][2] == h) {
            la = p;
            break;
          }
        if (0 <= la) {
          m = ka[la];
          do (F.unshift({ map: m[2], x: m[0], y: m[1] }), (m = m[6]));
          while (m);
          0 < F.length &&
            (1 == q && F.push({ map: a.map, x: a.x, y: a.y }),
            self.postMessage(F));
        }
        0 == ga.length && 0 > la && self.postMessage([]);
      }
    },
  };
});
