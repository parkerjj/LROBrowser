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
        f.Is.APP ? E : A.isSupported() ? A : B.isSupported() ? B : g ? J : C
      )(a, b, g);
      e.isZone = !!d;
      e.onClose = r;
      e.onComplete = function (a) {
        a &&
          (M && M.ping && clearInterval(M.ping),
          (e.onMessage = q),
          O.push((M = e)),
          d && z.init());
        c.call(this, a);
      };
    }
    function d(a) {
      a = a.build();
      M && M.isZone && z.process(a.view);
      e(a.buffer);
    }
    function e(a) {
      M && M.send(a);
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
    function q(a) {
      var c, d, f, e;
      H
        ? ((f = new Uint8Array(H.length + a.byteLength)),
          f.set(H, 0),
          f.set(new Uint8Array(a), H.length),
          (e = f.buffer))
        : (e = a);
      a = new n(e);
      h.callback && (h.callback(a), (h.callback = null));
      for (; a.tell() < a.length;) {
        f = a.tell();
        if (f + 2 > a.length) {
          H = new Uint8Array(e, f, a.length - f);
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
            H = new Uint8Array(e, f, a.length - f);
            return;
          }
          d = a.readUShort();
        } else d = c.size;
        f += d;
        if (f > a.length) {
          f = a.tell() - (0 > c.size ? 4 : 2);
          H = new Uint8Array(e, f, a.length - f);
          return;
        }
        c.instance
          ? c.Struct.call(c.instance, a, f)
          : (c.instance = new c.Struct(a, f));
        d && a.seek(f, SEEK_SET);
        c.callback && c.callback(c.instance);
      }
      H = null;
    }
    function r() {
      var a = O.indexOf(this);
      this === M &&
        (console.warn(
          "[Network] \u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ),
        M.ping && clearInterval(M.ping),
        F("UI/UIManager").showErrorBox(
          "\u4e0e\u670d\u52a1\u5668\u65ad\u5f00\u8fde\u63a5",
        ));
      -1 !== a && O.splice(a, 1);
    }
    function k() {
      var a;
      M &&
        (M.close(),
        M.izZone && z.reset(),
        M.ping && clearInterval(M.ping),
        (a = O.indexOf(M)),
        (M = null),
        -1 !== a && O.splice(a, 1));
    }
    function g(a) {
      if (M)
        for (
          M.ping && clearInterval(M.ping), M.ping = setInterval(a, 15e3);
          1 < O.length;
        )
          M !== O[0] && (O[0].close(), O.splice(0, 1));
    }
    function u(a) {
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
      t = a("./PacketRegister"),
      z = a("./PacketCrypt"),
      E = a("./SocketHelpers/ChromeSocket"),
      C = a("./SocketHelpers/JavaSocket"),
      J = a("./SocketHelpers/WebSocket"),
      A = a("./SocketHelpers/TCPSocket"),
      B = a("./SocketHelpers/NodeSocket"),
      F = a,
      O = [],
      M = null,
      H = null;
    b.list = [];
    h.callback = null;
    return (function () {
      var a, f, l;
      a = Object.keys(v);
      l = a.length;
      for (f = 0; f < l; ++f) p.addSupport(a[f], v[a[f]]);
      a = Object.keys(t);
      l = a.length;
      for (f = 0; f < l; ++f) {
        var n = a[f],
          r = t[a[f]];
        r.id = n;
        b.list[n] = new b(r.name, r, r.size);
      }
      return {
        sendPacket: d,
        send: e,
        setPing: g,
        connect: c,
        hookPacket: m,
        close: k,
        read: h,
        utils: { longToIP: u },
      };
    })();
  },
);
