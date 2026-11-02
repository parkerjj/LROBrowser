define(
  "UI/Components/PartyFriends/PartyFriends",
  "require DB/DBManager Utils/jquery Core/Preferences Core/Client Renderer/Renderer Engine/SessionStorage Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/PartyFriends/PartyHelper UI/Components/ContextMenu/ContextMenu UI/Components/ChatBox/ChatBox text!./PartyFriends.html text!./PartyFriends.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = D.ui,
        b = a.position().top,
        c = a.position().left,
        d = 0,
        e = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((J.screen.x - c - -20) / 20),
          f = Math.floor((J.screen.y - b - 46) / 20),
          a = Math.min(Math.max(a, 12), 13),
          f = Math.min(Math.max(f, 6), 12);
        if (a !== d || f !== e) (D.resize(a, f), (d = a), (e = f));
      }, 30);
      v(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), v(window).off("mouseup.resize"));
      });
    }
    function c() {
      D.ui.hide();
    }
    function d() {
      N.lock = !N.lock;
      N.save();
      N.lock
        ? (D.ui.find(".lock.on").show(), D.ui.find(".lock.off").hide())
        : (D.ui.find(".lock.on").hide(), D.ui.find(".lock.off").show());
    }
    function e() {
      var a = D.ui;
      N.friend = !N.friend;
      N.save();
      N.friend
        ? (a.find(".friend").show(), a.find(".party").hide())
        : (a.find(".friend").hide(),
          a.find(".party").show(),
          C.hasParty
            ? (a.find(".party.create").hide(),
              C.isPartyLeader || a.find(".party.add").hide())
            : a.find(".party.add, .party.leave").hide());
      a.find(".node").removeClass(".selection");
      L = -1;
    }
    function m() {
      if (!(0 > L || N.lock)) {
        var a = N.friend ? p.getMessage(356) : p.getMessage(363);
        A.showPromptBox(a, "ok", "cancel", function () {
          if (N.friend) D.onRemoveFriend(L);
          else D.onExpelMember(G[L].AID, G[L].characterName);
        });
      }
    }
    function h() {
      0 > L ||
        N.lock ||
        (N.friend
          ? M.ui.find(".username").val(y[L].Name)
          : M.ui.find(".username").val(G[L].characterName),
        M.ui.find(".message").select());
    }
    function q() {
      N.lock ||
        (O.remove(),
        O.append(),
        N.friend
          ? (O.addElement(p.getMessage(360), h),
            y[L].GID !== C.GID && O.addElement(p.getMessage(351), m))
          : (O.addElement(p.getMessage(129), r),
            G[L].GID === C.GID
              ? O.addElement(p.getMessage(2055), k)
              : (O.addElement(p.getMessage(360), h),
                C.isPartyLeader &&
                  (O.addElement(p.getMessage(97), m),
                  O.addElement(p.getMessage(1532), g)))));
    }
    function r() {
      N.lock || A.showMessageBox(p.getMessage(191), "ok");
    }
    function k() {
      N.lock ||
        A.showPromptBox(p.getMessage(357), "ok", "cancel", function () {
          D.onRequestLeave();
        });
    }
    function g() {
      N.lock ||
        A.showPromptBox(p.getMessage(1532), "ok", "cancel", function () {
          D.onRequestChangeLeader(G[L].AID);
        });
    }
    function u(a) {
      D.ui.find(".content .name").removeClass("selection");
      this.classList.add("selection");
      L = D.ui.find(this.parentNode.parentNode).find(".name").index(this);
      var b = I("UI/Components/SkillTargetSelection/SkillTargetSelection");
      if (b.__active && !N.friend) {
        var c = G[L];
        0 === c.state && b.intersectEntityId(c.AID);
        b.remove();
        a.stopImmediatePropagation();
        return !1;
      }
    }
    function l() {
      F.__active && F.getType() === F.Type.CREATE
        ? F.remove()
        : (F.append(), F.setType(F.Type.CREATE));
    }
    function f() {
      F.__active && F.getType() === F.Type.INVITE
        ? F.remove()
        : (F.append(), F.setType(F.Type.INVITE));
    }
    function n() {
      N.friend ||
        (F.__active && F.getType() === F.Type.SETUP
          ? F.remove()
          : (F.append(),
            F.setType(F.Type.SETUP),
            F.setOptions(K, C.isPartyLeader)));
    }
    var p = a("DB/DBManager"),
      v = a("Utils/jquery"),
      t = a("Core/Preferences"),
      z = a("Core/Client"),
      E = a("Renderer/Renderer"),
      C = a("Engine/SessionStorage"),
      J = a("Controls/MouseEventHandler"),
      A = a("UI/UIManager"),
      B = a("UI/UIComponent"),
      F = a("UI/Components/PartyFriends/PartyHelper"),
      O = a("UI/Components/ContextMenu/ContextMenu"),
      M = a("UI/Components/ChatBox/ChatBox"),
      H = a("text!./PartyFriends.html"),
      x = a("text!./PartyFriends.css"),
      I = a,
      D = new B("PartyFriends", H, x),
      L = -1,
      y = [],
      G = [],
      K = { exp_share: 0, item_share: 0, item_sharing_type: 0 },
      N = t.get(
        "PartyFriends",
        {
          x: 200,
          y: 200,
          width: 12,
          height: 10,
          show: !1,
          friend: !0,
          lock: !1,
        },
        1.2,
      );
    D.init = function () {
      F.prepare();
      this.ui.find(".base").mousedown(function (a) {
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".close").click(c);
      this.ui.find(".lock").mousedown(d);
      this.ui.find(".switchtab.off").mousedown(e);
      this.ui.find(".remove").mousedown(m);
      this.ui.find(".privatemessage").mousedown(h);
      this.ui.find(".leave").mousedown(k);
      this.ui.find(".resize").mousedown(b);
      this.ui.find(".party.create").mousedown(l);
      this.ui.find(".party.add").mousedown(f);
      this.ui.find(".info").mousedown(n);
      this.ui
        .find(".content")
        .on("contextmenu", ".name", q)
        .on("mousedown", ".name", u);
      this.draggable(this.ui.find(".titlebar"));
    };
    D.onAppend = function () {
      N.friend = !N.friend;
      e();
      N.lock
        ? (this.ui.find(".lock.on").show(), this.ui.find(".lock.off").hide())
        : (this.ui.find(".lock.on").hide(), this.ui.find(".lock.off").show());
      this.resize(N.width, N.height);
      this.ui.css({
        top: Math.min(Math.max(0, N.y), E.height - this.ui.height()),
        left: Math.min(Math.max(0, N.x), E.width - this.ui.width()),
      });
      this.ui.hide();
    };
    D.clean = function () {
      G.length = 0;
      y.length = 0;
      L = -1;
      K.exp_share = 0;
      K.item_share = 0;
      K.item_sharing_type = 0;
      this.ui.find(".partyname").text("");
      this.ui.find(".friendcount").text("0");
      this.ui.find(".content .party, .content .friend").empty();
      N.friend = !N.friend;
      e();
    };
    D.onRemove = function () {
      N.show = this.ui.is(":visible");
      N.y = parseInt(this.ui.css("top"), 10);
      N.x = parseInt(this.ui.css("left"), 10);
      N.save();
    };
    D.onShortCut = function (a) {
      switch (a.cmd) {
        case "FRIEND":
          N.friend ? this.ui.toggle() : ((N.friend = !1), e(), this.ui.show());
          this.ui.is(":visible") && this.focus();
          break;
        case "PARTY":
          (N.friend ? ((N.friend = !0), e(), this.ui.show()) : this.ui.toggle(),
            this.ui.is(":visible") && this.focus());
      }
    };
    D.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && this.focus();
    };
    D.setFriends = function (a) {
      var b,
        c = a.length,
        d = this.ui.find(".content .friend");
      y.length = a.length;
      d.empty();
      for (b = 0; b < c; b++)
        ((y[b] = a[b]),
          d.append(
            '\x3cdiv class\x3d"node' +
              (0 === a[b].State ? " online" : "") +
              '"\x3e\x3cspan class\x3d"name"\x3e' +
              v.escape(a[b].Name) +
              "\x3c/span\x3e\x3c/div\x3e",
          ));
      this.ui.find(".friendcount").text(c);
      L = -1;
    };
    D.updateFriendState = function (a, b) {
      var c = this.ui.find(".content .friend .node:eq(" + a + ")");
      (y[a].State = b)
        ? (c.css("backgroundImage", ""),
          M.addText(p.getMessage(1042).replace("%s", y[a].Name), M.TYPE.BLUE))
        : (M.addText(p.getMessage(1041).replace("%s", y[a].Name), M.TYPE.BLUE),
          z.loadFile(
            p.INTERFACE_PATH + "basic_interface/grp_online.bmp",
            function (a) {
              c.css("backgroundImage", "url(" + a + ")");
            },
          ));
    };
    D.updateFriend = function (a, b) {
      y[a] ||
        ((y[a] = {}),
        this.ui
          .find(".content .friend")
          .append(
            '\x3cdiv class\x3d"node"\x3e\x3cspan class\x3d"name"\x3e\x3c/span\x3e\x3c/div\x3e',
          ),
        this.ui.find(".friendcount").text(y.length));
      y[a].Name = b.Name;
      y[a].GID = b.GID;
      y[a].AID = b.AID;
      y[a].State = b.State || 0;
      var c = this.ui.find(".content .friend .node:eq(" + a + ")");
      c.find(".name").text(b.Name);
      z.loadFile(
        p.INTERFACE_PATH + "basic_interface/grp_online.bmp",
        function (a) {
          c.css("backgroundImage", "url(" + a + ")");
        },
      );
    };
    D.removeFriend = function (a) {
      y.splice(a, 1);
      this.ui.find(".content .friend .node:eq(" + a + ")").remove();
      this.ui.find(".friendcount").text(y.length);
      L === a && (L = -1);
    };
    D.setParty = function (a, b) {
      this.ui.find(".curnum").text(b.length);
      a && this.ui.find(".partyname").text("(" + a + ")");
      this.ui.find(".content .party").empty();
      C.isPartyLeader = !1;
      this.ui.find(".party.create").hide();
      this.ui.find(".party.leave").show();
      var c = b.length;
      for (a = G.length = 0; a < c; a++) D.addPartyMember(b[a]);
      L = -1;
    };
    D.addPartyMember = function (a) {
      var b = a.role || a.Role || 0,
        c,
        d = G.length,
        e;
      a.AID === C.AID &&
        ((C.isPartyLeader = 0 === b),
        C.isPartyLeader
          ? this.ui.find(".party.add").show()
          : this.ui.find(".party.add").hide());
      for (
        c = 0;
        c < d && (G[c].AID !== a.AID || G[c].characterName !== a.characterName);
        ++c
      );
      c < d
        ? ((e = this.ui.find(".content .party .node:eq(" + c + ")")),
          e.removeClass("leader online"),
          0 === b && e.addClass("leader"),
          0 === a.state && e.addClass("online"),
          e.css("backgroundImage", ""),
          e.find(".name").text(a.characterName),
          e.find(".map").text("(" + p.getMapName(a.mapName) + ")"))
        : ((a = v.extend({}, a)),
          G.push(a),
          this.ui
            .find(".content .party")
            .append(
              '\x3cdiv class\x3d"node' +
                (0 === b ? " leader" : "") +
                (0 === a.state ? " online" : "") +
                '"\x3e\x3cspan class\x3d"name"\x3e' +
                v.escape(a.characterName) +
                '\x3c/span\x3e\x3cspan class\x3d"map"\x3e(' +
                v.escape(p.getMapName(a.mapName)) +
                ')\x3c/span\x3e\x3ccanvas class\x3d"life" width\x3d"60" height\x3d"5"\x3e\x3c/canvas\x3e \x3cspan class\x3d"hp"\x3e\x3c/span\x3e\x3c/div\x3e',
            ),
          (e = this.ui.find(".content .party .node:eq(" + c + ")")));
      c = e.find("canvas").get(0).getContext("2d");
      c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      e.find(".hp").text("");
      a.life &&
        a.life.display &&
        (c.drawImage(a.life.canvas, 0, 0, 60, 5, 0, 0, 60, 5),
        e.find(".hp").text(a.life.hp + "/" + a.life.hp_max));
      (a =
        0 === b && 0 === a.state
          ? "grp_leader.bmp"
          : 0 === a.state
            ? "grp_online.bmp"
            : "") &&
        z.loadFile(p.INTERFACE_PATH + "basic_interface/" + a, function (a) {
          e.css("backgroundImage", "url(" + a + ")");
        });
    };
    D.removePartyMember = function (a, b) {
      if (a === C.AID)
        ((G.length = 0),
          this.ui.find(".curnum").text(0),
          this.ui.find(".content .party").empty(),
          this.ui.find(".partyname").text(""),
          this.ui.find(".party.create").show(),
          this.ui.find(".party.leave, .party.add").hide(),
          M.addText(p.getMessage(84), M.TYPE.BLUE));
      else {
        var c,
          d = G.length;
        for (c = 0; c < d; ++c)
          if (G[c].AID === a && G[c].characterName === b) {
            G.splice(c, 1);
            this.ui.find(".content .party .node:eq(" + c + ")").remove();
            break;
          }
        this.ui.find(".curnum").text(G.length);
      }
    };
    D.resize = function (a, b) {
      a = Math.min(Math.max(a, 12), 13);
      b = Math.min(Math.max(b, 6), 12);
      N.width = a;
      N.height = b;
      N.save();
      this.ui.find(".content").css({ width: 20 * a, height: 20 * b });
    };
    D.updateMemberLife = function (a, b, c, d) {
      var e,
        f = G.length;
      for (e = 0; e < f; ++e)
        if (G[e].AID === a && 0 === G[e].state) {
          a = this.ui.find(".content .party .node:eq(" + e + ")");
          e = a.find("canvas").get(0).getContext("2d");
          e.drawImage(b, 0, 0, 60, 5, 0, 0, 60, 5);
          a.find(".hp").text(c + "/" + d);
          break;
        }
    };
    D.setOptions = function (a, b, c) {
      K.exp_share = a;
      K.item_share = b;
      K.item_sharing_type = c;
    };
    D.onRemoveFriend = function () {};
    D.onRequestLeave = function () {};
    D.onExpelMember = function () {};
    D.onRequestChangeLeader = function () {};
    D.onRequestAddingMember = function () {};
    D.onRequestPartyCreation = function () {};
    D.onRequestSettingUpdate = function () {};
    return A.addComponent(D);
  },
);
