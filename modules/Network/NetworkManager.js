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
        g = l.get("socketProxy", null);
      e = new (
        f.Is.APP ? D : C.isSupported() ? C : y.isSupported() ? y : g ? O : B
      )(a, b, g);
      e.isZone = !!d;
      e.onClose = q;
      e.onComplete = function (a) {
        a &&
          (I && I.ping && clearInterval(I.ping),
          (e.onMessage = r),
          J.push((I = e)),
          d && A.init());
        c.call(this, a);
      };
    }
    function d(a) {
      a = a.build();
      I && I.isZone && A.process(a.view);
      e(a.buffer);
    }
    function e(a) {
      I && I.send(a);
    }
    function m(a, c) {
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
      L
        ? ((f = new Uint8Array(L.length + a.byteLength)),
          f.set(L, 0),
          f.set(new Uint8Array(a), L.length),
          (e = f.buffer))
        : (e = a);
      a = new n(e);
      h.callback && (h.callback(a), (h.callback = null));
      for (; a.tell() < a.length;) {
        f = a.tell();
        if (f + 2 > a.length) {
          L = new Uint8Array(e, f, a.length - f);
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
            L = new Uint8Array(e, f, a.length - f);
            return;
          }
          d = a.readUShort();
        } else d = c.size;
        f += d;
        if (f > a.length) {
          f = a.tell() - (0 > c.size ? 4 : 2);
          L = new Uint8Array(e, f, a.length - f);
          return;
        }
        c.instance
          ? c.Struct.call(c.instance, a, f)
          : (c.instance = new c.Struct(a, f));
        d && a.seek(f, SEEK_SET);
        c.callback && c.callback(c.instance);
      }
      L = null;
    }
    function q() {
      var a = J.indexOf(this);
      this === I &&
        (console.warn(
          "[Network] \u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ),
        I.ping && clearInterval(I.ping),
        z("UI/UIManager").showErrorBox(
          "\u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ));
      -1 !== a && J.splice(a, 1);
    }
    function k() {
      var a;
      I &&
        (I.close(),
        I.izZone && A.reset(),
        I.ping && clearInterval(I.ping),
        (a = J.indexOf(I)),
        (I = null),
        -1 !== a && J.splice(a, 1));
    }
    function g(a) {
      if (I)
        for (
          I.ping && clearInterval(I.ping), I.ping = setInterval(a, 15e3);
          1 < J.length;
        )
          I !== J[0] && (J[0].close(), J.splice(0, 1));
    }
    function t(a) {
      var b = new ArrayBuffer(4),
        c = new Uint8Array(b);
      new Uint32Array(b)[0] = a;
      return Array.prototype.join.call(c, ".");
    }
    var l = a("Core/Configs"),
      f = a("Core/Context"),
      n = a("Utils/BinaryReader"),
      p = a("./PacketVerManager"),
      v = a("./PacketVersions"),
      u = a("./PacketRegister"),
      A = a("./PacketCrypt"),
      D = a("./SocketHelpers/ChromeSocket"),
      B = a("./SocketHelpers/JavaSocket"),
      O = a("./SocketHelpers/WebSocket"),
      C = a("./SocketHelpers/TCPSocket"),
      y = a("./SocketHelpers/NodeSocket"),
      z = a,
      J = [],
      I = null,
      L = null;
    b.list = [];
    h.callback = null;
    return (function () {
      var a, f, l;
      a = Object.keys(v);
      l = a.length;
      for (f = 0; f < l; ++f) p.addSupport(a[f], v[a[f]]);
      a = Object.keys(u);
      l = a.length;
      for (f = 0; f < l; ++f) {
        var n = a[f],
          q = u[a[f]];
        q.id = n;
        b.list[n] = new b(q.name, q, q.size);
      }
      return {
        sendPacket: d,
        send: e,
        setPing: g,
        connect: c,
        hookPacket: m,
        close: k,
        read: h,
        utils: { longToIP: t },
      };
    })();
  },
);
