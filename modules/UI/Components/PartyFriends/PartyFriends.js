define(
  "UI/Components/PartyFriends/PartyFriends",
  "require DB/DBManager Utils/jquery Core/Preferences Core/Client Renderer/Renderer Engine/SessionStorage Controls/MouseEventHandler UI/UIManager UI/UIComponent UI/Components/PartyFriends/PartyHelper UI/Components/ContextMenu/ContextMenu UI/Components/ChatBox/ChatBox text!./PartyFriends.html text!./PartyFriends.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = E.ui,
        b = a.position().top,
        c = a.position().left,
        d = 0,
        e = 0,
        f;
      f = setInterval(function () {
        var a = Math.floor((O.screen.x - c - -20) / 20),
          f = Math.floor((O.screen.y - b - 46) / 20),
          a = Math.min(Math.max(a, 12), 13),
          f = Math.min(Math.max(f, 6), 12);
        if (a !== d || f !== e) (E.resize(a, f), (d = a), (e = f));
      }, 30);
      v(window).on("mouseup.resize", function (a) {
        1 === a.which && (clearInterval(f), v(window).off("mouseup.resize"));
      });
    }
    function c() {
      E.ui.hide();
    }
    function d() {
      P.lock = !P.lock;
      P.save();
      P.lock
        ? (E.ui.find(".lock.on").show(), E.ui.find(".lock.off").hide())
        : (E.ui.find(".lock.on").hide(), E.ui.find(".lock.off").show());
    }
    function e() {
      var a = E.ui;
      P.friend = !P.friend;
      P.save();
      P.friend
        ? (a.find(".friend").show(), a.find(".party").hide())
        : (a.find(".friend").hide(),
          a.find(".party").show(),
          B.hasParty
            ? (a.find(".party.create").hide(),
              B.isPartyLeader || a.find(".party.add").hide())
            : a.find(".party.add, .party.leave").hide());
      a.find(".node").removeClass(".selection");
      F = -1;
    }
    function m() {
      if (!(0 > F || P.lock)) {
        var a = P.friend ? p.getMessage(356) : p.getMessage(363);
        C.showPromptBox(a, "ok", "cancel", function () {
          if (P.friend) E.onRemoveFriend(F);
          else E.onExpelMember(H[F].AID, H[F].characterName);
        });
      }
    }
    function h() {
      0 > F ||
        P.lock ||
        (P.friend
          ? I.ui.find(".username").val(G[F].Name)
          : I.ui.find(".username").val(H[F].characterName),
        I.ui.find(".message").select());
    }
    function r() {
      P.lock ||
        (J.remove(),
        J.append(),
        P.friend
          ? (J.addElement(p.getMessage(360), h),
            G[F].GID !== B.GID && J.addElement(p.getMessage(351), m))
          : (J.addElement(p.getMessage(129), q),
            H[F].GID === B.GID
              ? J.addElement(p.getMessage(2055), k)
              : (J.addElement(p.getMessage(360), h),
                B.isPartyLeader &&
                  (J.addElement(p.getMessage(97), m),
                  J.addElement(p.getMessage(1532), g)))));
    }
    function q() {
      P.lock || C.showMessageBox(p.getMessage(191), "ok");
    }
    function k() {
      P.lock ||
        C.showPromptBox(p.getMessage(357), "ok", "cancel", function () {
          E.onRequestLeave();
        });
    }
    function g() {
      P.lock ||
        C.showPromptBox(p.getMessage(1532), "ok", "cancel", function () {
          E.onRequestChangeLeader(H[F].AID);
        });
    }
    function t(a) {
      E.ui.find(".content .name").removeClass("selection");
      this.classList.add("selection");
      F = E.ui.find(this.parentNode.parentNode).find(".name").index(this);
      var b = M("UI/Components/SkillTargetSelection/SkillTargetSelection");
      if (b.__active && !P.friend) {
        var c = H[F];
        0 === c.state && b.intersectEntityId(c.AID);
        b.remove();
        a.stopImmediatePropagation();
        return !1;
      }
    }
    function l() {
      z.__active && z.getType() === z.Type.CREATE
        ? z.remove()
        : (z.append(), z.setType(z.Type.CREATE));
    }
    function f() {
      z.__active && z.getType() === z.Type.INVITE
        ? z.remove()
        : (z.append(), z.setType(z.Type.INVITE));
    }
    function n() {
      P.friend ||
        (z.__active && z.getType() === z.Type.SETUP
          ? z.remove()
          : (z.append(),
            z.setType(z.Type.SETUP),
            z.setOptions(K, B.isPartyLeader)));
    }
    var p = a("DB/DBManager"),
      v = a("Utils/jquery"),
      u = a("Core/Preferences"),
      A = a("Core/Client"),
      D = a("Renderer/Renderer"),
      B = a("Engine/SessionStorage"),
      O = a("Controls/MouseEventHandler"),
      C = a("UI/UIManager"),
      y = a("UI/UIComponent"),
      z = a("UI/Components/PartyFriends/PartyHelper"),
      J = a("UI/Components/ContextMenu/ContextMenu"),
      I = a("UI/Components/ChatBox/ChatBox"),
      L = a("text!./PartyFriends.html"),
      x = a("text!./PartyFriends.css"),
      M = a,
      E = new y("PartyFriends", L, x),
      F = -1,
      G = [],
      H = [],
      K = { exp_share: 0, item_share: 0, item_sharing_type: 0 },
      P = u.get(
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
    E.init = function () {
      z.prepare();
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
        .on("contextmenu", ".name", r)
        .on("mousedown", ".name", t);
      this.draggable(this.ui.find(".titlebar"));
    };
    E.onAppend = function () {
      P.friend = !P.friend;
      e();
      P.lock
        ? (this.ui.find(".lock.on").show(), this.ui.find(".lock.off").hide())
        : (this.ui.find(".lock.on").hide(), this.ui.find(".lock.off").show());
      this.resize(P.width, P.height);
      this.ui.css({
        top: Math.min(Math.max(0, P.y), D.height - this.ui.height()),
        left: Math.min(Math.max(0, P.x), D.width - this.ui.width()),
      });
      this.ui.hide();
    };
    E.clean = function () {
      H.length = 0;
      G.length = 0;
      F = -1;
      K.exp_share = 0;
      K.item_share = 0;
      K.item_sharing_type = 0;
      this.ui.find(".partyname").text("");
      this.ui.find(".friendcount").text("0");
      this.ui.find(".content .party, .content .friend").empty();
      P.friend = !P.friend;
      e();
    };
    E.onRemove = function () {
      P.show = this.ui.is(":visible");
      P.y = parseInt(this.ui.css("top"), 10);
      P.x = parseInt(this.ui.css("left"), 10);
      P.save();
    };
    E.onShortCut = function (a) {
      switch (a.cmd) {
        case "FRIEND":
          P.friend ? this.ui.toggle() : ((P.friend = !1), e(), this.ui.show());
          this.ui.is(":visible") && this.focus();
          break;
        case "PARTY":
          (P.friend ? ((P.friend = !0), e(), this.ui.show()) : this.ui.toggle(),
            this.ui.is(":visible") && this.focus());
      }
    };
    E.toggle = function () {
      this.ui.toggle();
      this.ui.is(":visible") && this.focus();
    };
    E.setFriends = function (a) {
      var b,
        c = a.length,
        d = this.ui.find(".content .friend");
      G.length = a.length;
      d.empty();
      for (b = 0; b < c; b++)
        ((G[b] = a[b]),
          d.append(
            '\x3cdiv class\x3d"node' +
              (0 === a[b].State ? " online" : "") +
              '"\x3e\x3cspan class\x3d"name"\x3e' +
              v.escape(a[b].Name) +
              "\x3c/span\x3e\x3c/div\x3e",
          ));
      this.ui.find(".friendcount").text(c);
      F = -1;
    };
    E.updateFriendState = function (a, b) {
      var c = this.ui.find(".content .friend .node:eq(" + a + ")");
      (G[a].State = b)
        ? (c.css("backgroundImage", ""),
          I.addText(p.getMessage(1042).replace("%s", G[a].Name), I.TYPE.BLUE))
        : (I.addText(p.getMessage(1041).replace("%s", G[a].Name), I.TYPE.BLUE),
          A.loadFile(
            p.INTERFACE_PATH + "basic_interface/grp_online.bmp",
            function (a) {
              c.css("backgroundImage", "url(" + a + ")");
            },
          ));
    };
    E.updateFriend = function (a, b) {
      G[a] ||
        ((G[a] = {}),
        this.ui
          .find(".content .friend")
          .append(
            '\x3cdiv class\x3d"node"\x3e\x3cspan class\x3d"name"\x3e\x3c/span\x3e\x3c/div\x3e',
          ),
        this.ui.find(".friendcount").text(G.length));
      G[a].Name = b.Name;
      G[a].GID = b.GID;
      G[a].AID = b.AID;
      G[a].State = b.State || 0;
      var c = this.ui.find(".content .friend .node:eq(" + a + ")");
      c.find(".name").text(b.Name);
      A.loadFile(
        p.INTERFACE_PATH + "basic_interface/grp_online.bmp",
        function (a) {
          c.css("backgroundImage", "url(" + a + ")");
        },
      );
    };
    E.removeFriend = function (a) {
      G.splice(a, 1);
      this.ui.find(".content .friend .node:eq(" + a + ")").remove();
      this.ui.find(".friendcount").text(G.length);
      F === a && (F = -1);
    };
    E.setParty = function (a, b) {
      this.ui.find(".curnum").text(b.length);
      a && this.ui.find(".partyname").text("(" + a + ")");
      this.ui.find(".content .party").empty();
      B.isPartyLeader = !1;
      this.ui.find(".party.create").hide();
      this.ui.find(".party.leave").show();
      var c = b.length;
      for (a = H.length = 0; a < c; a++) E.addPartyMember(b[a]);
      F = -1;
    };
    E.addPartyMember = function (a) {
      var b = a.role || a.Role || 0,
        c,
        d = H.length,
        e;
      a.AID === B.AID &&
        ((B.isPartyLeader = 0 === b),
        B.isPartyLeader
          ? this.ui.find(".party.add").show()
          : this.ui.find(".party.add").hide());
      for (
        c = 0;
        c < d && (H[c].AID !== a.AID || H[c].characterName !== a.characterName);
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
          H.push(a),
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
        A.loadFile(p.INTERFACE_PATH + "basic_interface/" + a, function (a) {
          e.css("backgroundImage", "url(" + a + ")");
        });
    };
    E.removePartyMember = function (a, b) {
      if (a === B.AID)
        ((H.length = 0),
          this.ui.find(".curnum").text(0),
          this.ui.find(".content .party").empty(),
          this.ui.find(".partyname").text(""),
          this.ui.find(".party.create").show(),
          this.ui.find(".party.leave, .party.add").hide(),
          I.addText(p.getMessage(84), I.TYPE.BLUE));
      else {
        var c,
          d = H.length;
        for (c = 0; c < d; ++c)
          if (H[c].AID === a && H[c].characterName === b) {
            H.splice(c, 1);
            this.ui.find(".content .party .node:eq(" + c + ")").remove();
            break;
          }
        this.ui.find(".curnum").text(H.length);
      }
    };
    E.resize = function (a, b) {
      a = Math.min(Math.max(a, 12), 13);
      b = Math.min(Math.max(b, 6), 12);
      P.width = a;
      P.height = b;
      P.save();
      this.ui.find(".content").css({ width: 20 * a, height: 20 * b });
    };
    E.updateMemberLife = function (a, b, c, d) {
      var e,
        f = H.length;
      for (e = 0; e < f; ++e)
        if (H[e].AID === a && 0 === H[e].state) {
          a = this.ui.find(".content .party .node:eq(" + e + ")");
          e = a.find("canvas").get(0).getContext("2d");
          e.drawImage(b, 0, 0, 60, 5, 0, 0, 60, 5);
          a.find(".hp").text(c + "/" + d);
          break;
        }
    };
    E.setOptions = function (a, b, c) {
      K.exp_share = a;
      K.item_share = b;
      K.item_sharing_type = c;
    };
    E.onRemoveFriend = function () {};
    E.onRequestLeave = function () {};
    E.onExpelMember = function () {};
    E.onRequestChangeLeader = function () {};
    E.onRequestAddingMember = function () {};
    E.onRequestPartyCreation = function () {};
    E.onRequestSettingUpdate = function () {};
    return C.addComponent(E);
  },
);
