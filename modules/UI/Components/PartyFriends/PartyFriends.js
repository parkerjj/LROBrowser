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
        var a = Math.floor((H.screen.x - c - -20) / 20),
          f = Math.floor((H.screen.y - b - 46) / 20),
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
      M.lock = !M.lock;
      M.save();
      M.lock
        ? (E.ui.find(".lock.on").show(), E.ui.find(".lock.off").hide())
        : (E.ui.find(".lock.on").hide(), E.ui.find(".lock.off").show());
    }
    function e() {
      var a = E.ui;
      M.friend = !M.friend;
      M.save();
      M.friend
        ? (a.find(".friend").show(), a.find(".party").hide())
        : (a.find(".friend").hide(),
          a.find(".party").show(),
          B.hasParty
            ? (a.find(".party.create").hide(),
              B.isPartyLeader || a.find(".party.add").hide())
            : a.find(".party.add, .party.leave").hide());
      a.find(".node").removeClass(".selection");
      L = -1;
    }
    function l() {
      if (!(0 > L || M.lock)) {
        var a = M.friend ? q.getMessage(356) : q.getMessage(363);
        C.showPromptBox(a, "ok", "cancel", function () {
          if (M.friend) E.onRemoveFriend(L);
          else E.onExpelMember(F[L].AID, F[L].characterName);
        });
      }
    }
    function h() {
      0 > L ||
        M.lock ||
        (M.friend
          ? N.ui.find(".username").val(y[L].Name)
          : N.ui.find(".username").val(F[L].characterName),
        N.ui.find(".message").select());
    }
    function r() {
      M.lock ||
        (P.remove(),
        P.append(),
        M.friend
          ? (P.addElement(q.getMessage(360), h),
            y[L].GID !== B.GID && P.addElement(q.getMessage(351), l))
          : (P.addElement(q.getMessage(129), t),
            F[L].GID === B.GID
              ? P.addElement(q.getMessage(2055), n)
              : (P.addElement(q.getMessage(360), h),
                B.isPartyLeader &&
                  (P.addElement(q.getMessage(97), l),
                  P.addElement(q.getMessage(1532), g)))));
    }
    function t() {
      M.lock || C.showMessageBox(q.getMessage(191), "ok");
    }
    function n() {
      M.lock ||
        C.showPromptBox(q.getMessage(357), "ok", "cancel", function () {
          E.onRequestLeave();
        });
    }
    function g() {
      M.lock ||
        C.showPromptBox(q.getMessage(1532), "ok", "cancel", function () {
          E.onRequestChangeLeader(F[L].AID);
        });
    }
    function p(a) {
      E.ui.find(".content .name").removeClass("selection");
      this.classList.add("selection");
      L = E.ui.find(this.parentNode.parentNode).find(".name").index(this);
      var b = J("UI/Components/SkillTargetSelection/SkillTargetSelection");
      if (b.__active && !M.friend) {
        var c = F[L];
        0 === c.state && b.intersectEntityId(c.AID);
        b.remove();
        a.stopImmediatePropagation();
        return !1;
      }
    }
    function k() {
      G.__active && G.getType() === G.Type.CREATE
        ? G.remove()
        : (G.append(), G.setType(G.Type.CREATE));
    }
    function f() {
      G.__active && G.getType() === G.Type.INVITE
        ? G.remove()
        : (G.append(), G.setType(G.Type.INVITE));
    }
    function m() {
      M.friend ||
        (G.__active && G.getType() === G.Type.SETUP
          ? G.remove()
          : (G.append(),
            G.setType(G.Type.SETUP),
            G.setOptions(K, B.isPartyLeader)));
    }
    var q = a("DB/DBManager"),
      v = a("Utils/jquery"),
      u = a("Core/Preferences"),
      A = a("Core/Client"),
      D = a("Renderer/Renderer"),
      B = a("Engine/SessionStorage"),
      H = a("Controls/MouseEventHandler"),
      C = a("UI/UIManager"),
      z = a("UI/UIComponent"),
      G = a("UI/Components/PartyFriends/PartyHelper"),
      P = a("UI/Components/ContextMenu/ContextMenu"),
      N = a("UI/Components/ChatBox/ChatBox"),
      I = a("text!./PartyFriends.html"),
      x = a("text!./PartyFriends.css"),
      J = a,
      E = new z("PartyFriends", I, x),
      L = -1,
      y = [],
      F = [],
      K = { exp_share: 0, item_share: 0, item_sharing_type: 0 },
      M = u.get(
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
      G.prepare();
      this.ui.find(".base").mousedown(function (a) {
        a.stopImmediatePropagation();
        return !1;
      });
      this.ui.find(".close").click(c);
      this.ui.find(".lock").mousedown(d);
      this.ui.find(".switchtab.off").mousedown(e);
      this.ui.find(".remove").mousedown(l);
      this.ui.find(".privatemessage").mousedown(h);
      this.ui.find(".leave").mousedown(n);
      this.ui.find(".resize").mousedown(b);
      this.ui.find(".party.create").mousedown(k);
      this.ui.find(".party.add").mousedown(f);
      this.ui.find(".info").mousedown(m);
      this.ui
        .find(".content")
        .on("contextmenu", ".name", r)
        .on("mousedown", ".name", p);
      this.draggable(this.ui.find(".titlebar"));
    };
    E.onAppend = function () {
      M.friend = !M.friend;
      e();
      M.lock
        ? (this.ui.find(".lock.on").show(), this.ui.find(".lock.off").hide())
        : (this.ui.find(".lock.on").hide(), this.ui.find(".lock.off").show());
      this.resize(M.width, M.height);
      this.ui.css({
        top: Math.min(Math.max(0, M.y), D.height - this.ui.height()),
        left: Math.min(Math.max(0, M.x), D.width - this.ui.width()),
      });
      this.ui.hide();
    };
    E.clean = function () {
      F.length = 0;
      y.length = 0;
      L = -1;
      K.exp_share = 0;
      K.item_share = 0;
      K.item_sharing_type = 0;
      this.ui.find(".partyname").text("");
      this.ui.find(".friendcount").text("0");
      this.ui.find(".content .party, .content .friend").empty();
      M.friend = !M.friend;
      e();
    };
    E.onRemove = function () {
      M.show = this.ui.is(":visible");
      M.y = parseInt(this.ui.css("top"), 10);
      M.x = parseInt(this.ui.css("left"), 10);
      M.save();
    };
    E.onShortCut = function (a) {
      switch (a.cmd) {
        case "FRIEND":
          M.friend ? this.ui.toggle() : ((M.friend = !1), e(), this.ui.show());
          this.ui.is(":visible") && this.focus();
          break;
        case "PARTY":
          (M.friend ? ((M.friend = !0), e(), this.ui.show()) : this.ui.toggle(),
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
    E.updateFriendState = function (a, b) {
      var c = this.ui.find(".content .friend .node:eq(" + a + ")");
      (y[a].State = b)
        ? (c.css("backgroundImage", ""),
          N.addText(q.getMessage(1042).replace("%s", y[a].Name), N.TYPE.BLUE))
        : (N.addText(q.getMessage(1041).replace("%s", y[a].Name), N.TYPE.BLUE),
          A.loadFile(
            q.INTERFACE_PATH + "basic_interface/grp_online.bmp",
            function (a) {
              c.css("backgroundImage", "url(" + a + ")");
            },
          ));
    };
    E.updateFriend = function (a, b) {
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
      A.loadFile(
        q.INTERFACE_PATH + "basic_interface/grp_online.bmp",
        function (a) {
          c.css("backgroundImage", "url(" + a + ")");
        },
      );
    };
    E.removeFriend = function (a) {
      y.splice(a, 1);
      this.ui.find(".content .friend .node:eq(" + a + ")").remove();
      this.ui.find(".friendcount").text(y.length);
      L === a && (L = -1);
    };
    E.setParty = function (a, b) {
      this.ui.find(".curnum").text(b.length);
      a && this.ui.find(".partyname").text("(" + a + ")");
      this.ui.find(".content .party").empty();
      B.isPartyLeader = !1;
      this.ui.find(".party.create").hide();
      this.ui.find(".party.leave").show();
      var c = b.length;
      for (a = F.length = 0; a < c; a++) E.addPartyMember(b[a]);
      L = -1;
    };
    E.addPartyMember = function (a) {
      var b = a.role || a.Role || 0,
        c,
        d = F.length,
        e;
      a.AID === B.AID &&
        ((B.isPartyLeader = 0 === b),
        B.isPartyLeader
          ? this.ui.find(".party.add").show()
          : this.ui.find(".party.add").hide());
      for (
        c = 0;
        c < d && (F[c].AID !== a.AID || F[c].characterName !== a.characterName);
        ++c
      );
      c < d
        ? ((e = this.ui.find(".content .party .node:eq(" + c + ")")),
          e.removeClass("leader online"),
          0 === b && e.addClass("leader"),
          0 === a.state && e.addClass("online"),
          e.css("backgroundImage", ""),
          e.find(".name").text(a.characterName),
          e.find(".map").text("(" + q.getMapName(a.mapName) + ")"))
        : ((a = v.extend({}, a)),
          F.push(a),
          this.ui
            .find(".content .party")
            .append(
              '\x3cdiv class\x3d"node' +
                (0 === b ? " leader" : "") +
                (0 === a.state ? " online" : "") +
                '"\x3e\x3cspan class\x3d"name"\x3e' +
                v.escape(a.characterName) +
                '\x3c/span\x3e\x3cspan class\x3d"map"\x3e(' +
                v.escape(q.getMapName(a.mapName)) +
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
        A.loadFile(q.INTERFACE_PATH + "basic_interface/" + a, function (a) {
          e.css("backgroundImage", "url(" + a + ")");
        });
    };
    E.removePartyMember = function (a, b) {
      if (a === B.AID)
        ((F.length = 0),
          this.ui.find(".curnum").text(0),
          this.ui.find(".content .party").empty(),
          this.ui.find(".partyname").text(""),
          this.ui.find(".party.create").show(),
          this.ui.find(".party.leave, .party.add").hide(),
          N.addText(q.getMessage(84), N.TYPE.BLUE));
      else {
        var c,
          d = F.length;
        for (c = 0; c < d; ++c)
          if (F[c].AID === a && F[c].characterName === b) {
            F.splice(c, 1);
            this.ui.find(".content .party .node:eq(" + c + ")").remove();
            break;
          }
        this.ui.find(".curnum").text(F.length);
      }
    };
    E.resize = function (a, b) {
      a = Math.min(Math.max(a, 12), 13);
      b = Math.min(Math.max(b, 6), 12);
      M.width = a;
      M.height = b;
      M.save();
      this.ui.find(".content").css({ width: 20 * a, height: 20 * b });
    };
    E.updateMemberLife = function (a, b, c, d) {
      var e,
        f = F.length;
      for (e = 0; e < f; ++e)
        if (F[e].AID === a && 0 === F[e].state) {
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
