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
        f.Is.APP ? C : D.isSupported() ? D : y.isSupported() ? y : g ? J : B
      )(a, b, g);
      e.isZone = !!d;
      e.onClose = r;
      e.onComplete = function (a) {
        a &&
          (O && O.ping && clearInterval(O.ping),
          (e.onMessage = t),
          N.push((O = e)),
          d && A.init());
        c.call(this, a);
      };
    }
    function d(a) {
      a = a.build();
      O && O.isZone && A.process(a.view);
      e(a.buffer);
    }
    function e(a) {
      O && O.send(a);
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
    function t(a) {
      var c, d, f, e;
      I
        ? ((f = new Uint8Array(I.length + a.byteLength)),
          f.set(I, 0),
          f.set(new Uint8Array(a), I.length),
          (e = f.buffer))
        : (e = a);
      a = new k(e);
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
    function r() {
      var a = N.indexOf(this);
      this === O &&
        (console.warn(
          "[Network] \u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ),
        O.ping && clearInterval(O.ping),
        H("UI/UIManager").showErrorBox(
          "\u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ));
      -1 !== a && N.splice(a, 1);
    }
    function n() {
      var a;
      O &&
        (O.close(),
        O.izZone && A.reset(),
        O.ping && clearInterval(O.ping),
        (a = N.indexOf(O)),
        (O = null),
        -1 !== a && N.splice(a, 1));
    }
    function g(a) {
      if (O)
        for (
          O.ping && clearInterval(O.ping), O.ping = setInterval(a, 15e3);
          1 < N.length;
        )
          O !== N[0] && (N[0].close(), N.splice(0, 1));
    }
    function p(a) {
      var b = new ArrayBuffer(4),
        c = new Uint8Array(b);
      new Uint32Array(b)[0] = a;
      return Array.prototype.join.call(c, ".");
    }
    var l = a("Core/Configs"),
      f = a("Core/Context"),
      k = a("Utils/BinaryReader"),
      q = a("./PacketVerManager"),
      u = a("./PacketVersions"),
      v = a("./PacketRegister"),
      A = a("./PacketCrypt"),
      C = a("./SocketHelpers/ChromeSocket"),
      B = a("./SocketHelpers/JavaSocket"),
      J = a("./SocketHelpers/WebSocket"),
      D = a("./SocketHelpers/TCPSocket"),
      y = a("./SocketHelpers/NodeSocket"),
      H = a,
      N = [],
      O = null,
      I = null;
    b.list = [];
    h.callback = null;
    return (function () {
      var a, f, k;
      a = Object.keys(u);
      k = a.length;
      for (f = 0; f < k; ++f) q.addSupport(a[f], u[a[f]]);
      a = Object.keys(v);
      k = a.length;
      for (f = 0; f < k; ++f) {
        var l = a[f],
          C = v[a[f]];
        C.id = l;
        b.list[l] = new b(C.name, C, C.size);
      }
      return {
        sendPacket: d,
        send: e,
        setPing: g,
        connect: c,
        hookPacket: m,
        close: n,
        read: h,
        utils: { longToIP: p },
      };
    })();
  },
);
