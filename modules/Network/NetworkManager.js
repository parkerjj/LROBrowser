define(
  "Network/NetworkManager",
  "require Core/Configs Core/Context Utils/BinaryReader ./PacketVerManager ./PacketVersions ./PacketRegister ./PacketCrypt ./SocketHelpers/ChromeSocket ./SocketHelpers/JavaSocket ./SocketHelpers/WebSocket ./SocketHelpers/TCPSocket ./SocketHelpers/NodeSocket".split(
    " ",
  ),
  function (a) {
    function b(a, b, c) {
      this.name = a;
      this.Struct = b;
      this.size = c;
      this.callback = null;
    }
    function c(a, b, c, d) {
      var e,
        g = k.get("socketProxy", null);
      e = new (
        f.Is.APP ? D : C.isSupported() ? C : z.isSupported() ? z : g ? H : B
      )(a, b, g);
      e.isZone = !!d;
      e.onClose = t;
      e.onComplete = function (a) {
        a &&
          (N && N.ping && clearInterval(N.ping),
          (e.onMessage = r),
          P.push((N = e)),
          d && A.init());
        c.call(this, a);
      };
    }
    function d(a) {
      a = a.build();
      N && N.isZone && A.process(a.view);
      e(a.buffer);
    }
    function e(a) {
      N && N.send(a);
    }
    function l(a, c) {
      if (!a.id)
        throw Error(
          'NetworkManager::HookPacket() - Packet not yet register "' +
            a.name +
            '"',
        );
      b.list[a.id].callback = c;
    }
    function h(a) {
      h.callback = a;
    }
    function r(a) {
      var c, d, f, e;
      I
        ? ((f = new Uint8Array(I.length + a.byteLength)),
          f.set(I, 0),
          f.set(new Uint8Array(a), I.length),
          (e = f.buffer))
        : (e = a);
      a = new m(e);
      h.callback && (h.callback(a), (h.callback = null));
      for (; a.tell() < a.length;) {
        f = a.tell();
        if (f + 2 > a.length) {
          I = new Uint8Array(e, f, a.length - f);
          return;
        }
        c = a.readUShort();
        if (!b.list[c]) {
          console.error(
            '[Network] Packet "%c0x%s%c" not register, skipping %d bytes.',
            "font-weight:bold",
            c.toString(16),
            "font-weight:normal",
            a.length - a.tell(),
          );
          break;
        }
        c = b.list[c];
        if (0 > c.size) {
          if (f + 4 >= a.length) {
            I = new Uint8Array(e, f, a.length - f);
            return;
          }
          d = a.readUShort();
        } else d = c.size;
        f += d;
        if (f > a.length) {
          f = a.tell() - (0 > c.size ? 4 : 2);
          I = new Uint8Array(e, f, a.length - f);
          return;
        }
        c.instance
          ? c.Struct.call(c.instance, a, f)
          : (c.instance = new c.Struct(a, f));
        d && a.seek(f, SEEK_SET);
        c.callback && c.callback(c.instance);
      }
      I = null;
    }
    function t() {
      var a = P.indexOf(this);
      this === N &&
        (console.warn(
          "[Network] \u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ),
        N.ping && clearInterval(N.ping),
        G("UI/UIManager").showErrorBox(
          "\u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ));
      -1 !== a && P.splice(a, 1);
    }
    function n() {
      var a;
      N &&
        (N.close(),
        N.izZone && A.reset(),
        N.ping && clearInterval(N.ping),
        (a = P.indexOf(N)),
        (N = null),
        -1 !== a && P.splice(a, 1));
    }
    function g(a) {
      if (N)
        for (
          N.ping && clearInterval(N.ping), N.ping = setInterval(a, 15e3);
          1 < P.length;
        )
          N !== P[0] && (P[0].close(), P.splice(0, 1));
    }
    function p(a) {
      var b = new ArrayBuffer(4),
        c = new Uint8Array(b);
      new Uint32Array(b)[0] = a;
      return Array.prototype.join.call(c, ".");
    }
    var k = a("Core/Configs"),
      f = a("Core/Context"),
      m = a("Utils/BinaryReader"),
      q = a("./PacketVerManager"),
      v = a("./PacketVersions"),
      u = a("./PacketRegister"),
      A = a("./PacketCrypt"),
      D = a("./SocketHelpers/ChromeSocket"),
      B = a("./SocketHelpers/JavaSocket"),
      H = a("./SocketHelpers/WebSocket"),
      C = a("./SocketHelpers/TCPSocket"),
      z = a("./SocketHelpers/NodeSocket"),
      G = a,
      P = [],
      N = null,
      I = null;
    b.list = [];
    h.callback = null;
    return (function () {
      var a, f, k;
      a = Object.keys(v);
      k = a.length;
      for (f = 0; f < k; ++f) q.addSupport(a[f], v[a[f]]);
      a = Object.keys(u);
      k = a.length;
      for (f = 0; f < k; ++f) {
        var m = a[f],
          B = u[a[f]];
        B.id = m;
        b.list[m] = new b(B.name, B, B.size);
      }
      return {
        sendPacket: d,
        send: e,
        setPing: g,
        connect: c,
        hookPacket: l,
        close: n,
        read: h,
        utils: { longToIP: p },
      };
    })();
  },
);
