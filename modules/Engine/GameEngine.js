define(
  "Engine/GameEngine",
  "require Plugins/PluginManager Utils/jquery Utils/Queue AI/Delegate Audio/SoundManager Audio/BGM DB/DBManager Core/Configs Core/Client Core/Thread Core/Context Engine/LoginEngine Network/NetworkManager Renderer/Renderer Renderer/MapRenderer Preferences/Graphics UI/UIManager UI/CursorManager UI/Scrollbar UI/Background UI/Components/Intro/Intro UI/Components/Intro/Particle UI/Components/WinList/WinList AC/CG01".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = new g(),
        b = n.get("remoteClient");
      a.add(function () {
        G
          ? a._next()
          : (v.hook("THREAD_ERROR", h),
            v.hook("THREAD_LOG", r),
            v.hook("THREAD_READY", function () {
              G = !0;
              a._next();
            }),
            v.init());
      });
      a.add(function () {
        q.init();
        B.init();
        a._next();
      });
      a.add(function () {
        p.onFilesLoaded = function (c) {
          b || c || window.requireNode
            ? a._next()
            : (u.Is.APP || alert("No client to initialize roBrowser"),
              L.remove(),
              L.append());
        };
        n.get("skipIntro")
          ? p.init([])
          : ((L.onFilesSubmit = p.init.bind(p)), L.append());
      });
      a.add(function () {
        f.onReady = function () {
          a._next();
        };
        f.onProgress = function (a, b) {
          I.setPercent(Math.floor((a / b) * 100));
        };
        y.removeComponents();
        I.init();
        I.resize(B.width, B.height);
        f.init();
      });
      a.add(function () {
        v.send("CLIENT_FILES_ALIAS", f.mapalias);
        a.next();
      });
      a.add(function () {
        J.init();
        z.init(a.next);
      });
      a.add(function () {
        c();
      });
      u.checkSupport();
      a.run();
    }
    function c() {
      var a = F[0].address.split(".");
      if (3 == a.length) {
        if ("port" != a[0] || "lastro" != a[1] || "cn" != a[2]) return;
      } else if (
        ("45" != a[0] && "103" != a[0] && "127" != a[0]) ||
        ("248" != a[1] && "8" != a[1] && "0" != a[1]) ||
        ("10" != a[2] && "222" != a[2] && "0" != a[2]) ||
        ("247" != a[3] && "164" != a[3] && "1" != a[3])
      )
        return;
      x.init();
      l.setAvailableExtensions(n.get("BGMFileExtension", ["mp3"]));
      l.play("01.mp3");
      y.removeComponents();
      D.close();
      C.playCG
        ? E.setMap()
        : (setTimeout(function () {
            k(".cg").hide();
            $("#loading-cover .logo").removeClass("active");
          }, 500),
          setTimeout(function () {
            $("#loading-cover").removeClass("open");
            $("#RegisterMessage").show();
            d();
          }, 1e3));
    }
    function d() {
      $("#loading-cover").remove();
      var a = Array(F.length),
        c,
        f = a.length;
      if (0 === f)
        y.showMessageBox(
          "\u62b1\u6b49\uff0c\u627e\u4e0d\u5230\u670d\u52a1\u7ebf\u8def\u3002",
          "ok",
          b,
        );
      else if (1 === f && n.get("skipServerList"))
        ((A.onExitRequest = d), A.init(F[0]));
      else {
        for (c = 0; c < f; ++c) a[c] = F[c].display;
        k(".cont").hide();
        M.append();
        M.setList(F, 0);
      }
      B.stop();
      O.free();
      l.play("01.mp3");
      M.onIndexSelected = e;
      M.onExitRequest = m;
    }
    function e(a) {
      t.play("dl.wav");
      M.remove();
      A.onExitRequest = c;
      A.init(F[a]);
    }
    function m() {
      t.stop();
      B.stop();
      y.removeComponents();
      I.remove(b);
    }
    function h(a) {
      console.warn.apply(console, a);
    }
    function r(a) {
      console.log.apply(console, a);
    }
    var q = a("Plugins/PluginManager"),
      k = a("Utils/jquery"),
      g = a("Utils/Queue");
    a("AI/Delegate");
    var t = a("Audio/SoundManager"),
      l = a("Audio/BGM"),
      f = a("DB/DBManager"),
      n = a("Core/Configs"),
      p = a("Core/Client"),
      v = a("Core/Thread"),
      u = a("Core/Context"),
      A = a("Engine/LoginEngine"),
      D = a("Network/NetworkManager"),
      B = a("Renderer/Renderer"),
      O = a("Renderer/MapRenderer"),
      C = a("Preferences/Graphics"),
      y = a("UI/UIManager"),
      z = a("UI/CursorManager"),
      J = a("UI/Scrollbar"),
      I = a("UI/Background"),
      L = a("UI/Components/Intro/Intro"),
      x = a("UI/Components/Intro/Particle"),
      M = a("UI/Components/WinList/WinList"),
      E = a("AC/CG01"),
      F = [];
    (a = n.get("ClientVer")) || (a = 0);
    switch (a) {
      case 0:
        F = [
          {
            display: "\u7535\u4fe1\u7ebf\u8def",
            desc: "",
            address: "192.168.101.89",
            port: 36666,
            version: 45,
            langtype: 3,
            socketProxy: "ws://192.168.101.89:5999/",
            adminList: [2000001],
          },
        ];
        break;
      case 1:
        F = [
          {
            display: "\u7535\u4fe1\u7ebf\u8def",
            desc: "",
            address: "port.lastro.cn",
            port: 38569,
            version: 45,
            langtype: 3,
            socketProxy: "wss://port.lastro.cn/",
            adminList: [2000001],
          },
        ];
        break;
      case 3:
        F = [
          {
            display: "\u7535\u4fe1\u7ebf\u8def",
            desc: "",
            address: "103.8.222.164",
            port: 28569,
            version: 45,
            langtype: 3,
            socketProxy: "wss://port.lastro.cn/",
            adminList: [2000001],
          },
        ];
        break;
      case 4:
        F = [
          {
            display: "\u7535\u4fe1\u7ebf\u8def",
            desc: "",
            address: "port.lastro.cn",
            port: 29569,
            version: 45,
            langtype: 3,
            socketProxy: "wss://port.lastro.cn/",
            adminList: [2000001],
          },
        ];
        break;
      case 5:
        F = [
          {
            display: "\u7535\u4fe1\u7ebf\u8def",
            desc: "",
            address: "103.8.222.164",
            port: 26569,
            version: 45,
            langtype: 3,
            socketProxy: "wss://port.lastro.cn/",
            adminList: [2000001],
          },
        ];
    }
    var G = !1;
    return { init: b, reload: c, goload: d };
  },
);
