define(
  "Controls/EntityControl",
  "require Utils/jquery Utils/gl-matrix Utils/PathFinding DB/DBManager Controls/KeyEventHandler Controls/MouseEventHandler Preferences/Controls Renderer/Camera Engine/SessionStorage Engine/MapEngine/Friends Network/PacketStructure Network/NetworkManager UI/CursorManager UI/Components/InputBox/InputBox UI/Components/ChatRoom/ChatRoom UI/Components/ContextMenu/ContextMenu UI/Components/PetInformations/PetInformations UI/Components/Trade/Trade UI/Components/ChatBox/ChatBox UI/UIManager".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_PET:
          C.action.active || H.setType(H.ACTION.DEFAULT);
          break;
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if ((!1 === u.SHIFT && !1 === A.noshift) || this === B.Entity) {
            C.action.active || H.setType(H.ACTION.DEFAULT);
            break;
          }
          H.setType(H.ACTION.ATTACK);
          break;
        case a.TYPE_MOB:
        case a.TYPE_ICEWALL:
          H.setType(H.ACTION.ATTACK);
          break;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          H.setType(H.ACTION.TALK, !0);
          break;
        case a.TYPE_WARP:
          H.setType(H.ACTION.WARP);
          return;
        case a.TYPE_ITEM:
          H.setType(H.ACTION.PICK, !0, 0);
      }
      switch (this.display.load) {
        case this.display.TYPE.NONE:
          this.display.load = this.display.TYPE.LOADING;
          a = new D.CZ.REQNAME();
          a.AID = this.GID;
          y.sendPacket(a);
          break;
        case this.display.TYPE.COMPLETE:
          (G.multiply(M, C.projection, this.matrix),
            this.display.render(M),
            this.display.add());
      }
    }
    function c() {
      C.action.active
        ? H.setType(H.ACTION.ROTATE)
        : H.setType(H.ACTION.DEFAULT);
      this !== this.constructor.Manager.getFocusEntity() &&
        ((this.display.display = !1), this.display.remove());
    }
    function d() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_ITEM:
          H.setType(H.ACTION.PICK, !0, 2);
          a = new D.CZ.ITEM_PICKUP();
          a.ITAID = this.GID;
          if (2 < L.distance(B.Entity.position, this.position))
            return (
              (B.moveAction = a),
              (a = new D.CZ.REQUEST_MOVE()),
              (a.dest[0] = v.world.x),
              (a.dest[1] = v.world.y),
              y.sendPacket(a),
              !0
            );
          y.sendPacket(a);
          B.Entity.lookTo(this.position[0], this.position[1]);
          return !0;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          return (
            (a = new D.CZ.CONTACTNPC()),
            (a.NAID = this.GID),
            (a.type = 1),
            y.sendPacket(a),
            B.Entity.lookTo(this.position[0], this.position[1]),
            (a = new D.CZ.CHANGE_DIRECTION()),
            (a.headDir = B.Entity.headDir),
            (a.dir = B.Entity.direction),
            y.sendPacket(a),
            !0
          );
        case a.TYPE_WARP:
        case a.TYPE_EFFECT:
          return (
            (a = new D.CZ.REQUEST_MOVE()),
            (a.dest[0] = this.position[0]),
            (a.dest[1] = this.position[1]),
            y.sendPacket(a),
            !0
          );
      }
      return !1;
    }
    function e() {}
    function m() {
      var a = this.constructor,
        b = this;
      switch (this.objecttype) {
        case a.TYPE_PET:
          B.petId === this.GID &&
            (I.remove(),
            I.append(),
            I.addElement(q.getMessage(596), x.ui.show.bind(x.ui)),
            I.addElement(q.getMessage(592), x.reqPetFeed),
            I.addElement(q.getMessage(593), x.reqPetAction),
            I.addElement(q.getMessage(595), x.reqUnEquipPet),
            I.addElement(q.getMessage(594), x.reqBackToEgg));
          break;
        case a.TYPE_PC:
          I.remove();
          I.append();
          I.addElement(
            q.getMessage(87).replace("%s", this.display.name),
            function () {
              K.reqExchange(b.GID, b.display.name);
            },
          );
          B.hasGuild &&
            (B.guildRight & 1 &&
              !this.GUID &&
              I.addElement(
                q.getMessage(382).replace("%s", this.display.name),
                function () {
                  z("Engine/MapEngine/Guild").requestPlayerInvitation(b.GID);
                },
              ),
            B.isGuildMaster &&
              this.GUID &&
              B.Entity.GUID !== this.GUID &&
              (I.addElement(
                q.getMessage(399).replace("%s", this.display.name),
                function () {
                  z("Engine/MapEngine/Guild").requestAlliance(b.GID);
                },
              ),
              I.addElement(
                q.getMessage(403).replace("%s", this.display.name),
                function () {
                  z("Engine/MapEngine/Guild").requestHostility(b.GID);
                },
              )));
          B.hasParty &&
            B.isPartyLeader &&
            I.addElement(
              q.getMessage(88).replace("%s", this.display.name),
              function () {
                z("Engine/MapEngine/Group").onRequestInvitation(
                  b.GID,
                  b.display.name,
                );
              },
            );
          J.isFriend(this.display.name) ||
            I.addElement(q.getMessage(358), function () {
              J.addFriend(b.display.name);
            });
          I.addElement(
            "\u67e5\u770b\u8be5\u73a9\u5bb6\u7684\u88c5\u5907",
            function () {
              var a = new D.CZ.EQUIPWIN_MICROSCOPE();
              a.AID = b.GID;
              y.sendPacket(a);
              z("UI/Components/Equipment/Equipment").setCharacter(b);
            },
          );
          I.addElement("\u8ddf\u968f\u76ee\u6807\u5bf9\u8c61", function () {
            "quiz_01.gat" == z("Renderer/MapRenderer").currentMap
              ? E.addText(
                  "\u8be5\u5730\u56fe\u65e0\u6cd5\u4f7f\u7528\u8ddf\u968f\u529f\u80fd",
                  E.TYPE.ERROR,
                )
              : ((A.noshift = !1),
                z("Renderer/EntityManager").setFocusEntity(b));
          });
          I.addElement("\u5bf9\u8bdd", function () {
            E.focus();
            l("#chatbox .battlemode").hide();
            l("#chatbox .input").show();
            l("#chatbox .input .username").val(b.display.name);
            l("#chatbox .input .message").select();
          });
          B.Entity.isAdmin &&
            I.addElement("\u5254\u9664", function () {
              var a = new D.CZ.WHISPER();
              a.receiver = "";
              a.msg = "@kick " + b.display.name;
              y.sendPacket(a);
            });
          break;
        case a.TYPE_HOM:
          0 < B.homGID &&
            (I.remove(),
            I.append(),
            I.addElement("\u663e\u793a\u72b6\u6001", function () {
              z("UI/Components/Homunc/HomuncInformations").ui.show();
            }));
          break;
        case a.TYPE_MERC:
          0 < B.mercGID &&
            (I.remove(),
            I.append(),
            I.addElement("\u663e\u793a\u72b6\u6001", function () {
              z("UI/Components/Mercenary/MercenaryInformations").ui.show();
            }));
      }
      return !1;
    }
    function h() {
      var a = this.constructor,
        b = B.Entity,
        c = z("Renderer/EntityManager").getFocusEntity();
      if (V)
        F.showMessageBox("You are temporarily restricted from clicking.", "ok");
      else {
        1 === Q &&
          setTimeout(function () {
            Q = 0;
          }, 5e3);
        if (30 < Q)
          ((V = !0),
            F.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              V = !1;
              F.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else
          switch (this.objecttype) {
            case a.TYPE_PC:
            case a.TYPE_ELEM:
            case a.TYPE_HOM:
              if (!1 === u.SHIFT && !1 === A.noshift) {
                C.action.active || H.setType(H.ACTION.DEFAULT);
                break;
              }
            case a.TYPE_MOB:
            case a.TYPE_ICEWALL:
              this.attachments.add({
                uid: "lockon",
                spr: "data/sprite/cursors.spr",
                act: "data/sprite/cursors.act",
                frame: H.ACTION.LOCK,
                repeat: !0,
                depth: 10,
              });
              var a = [],
                d = k.search(
                  b.position[0] | 0,
                  b.position[1] | 0,
                  this.position[0] | 0,
                  this.position[1] | 0,
                  b.attack_range,
                  a,
                );
              if (
                !d ||
                ((5 == B.Entity.action ||
                  10 == B.Entity.action ||
                  11 == B.Entity.action) &&
                  c == this)
              )
                return !0;
              b = new D.CZ.REQUEST_ACT();
              b.action = A.noctrl ? 7 : 0;
              b.targetGID = this.GID;
              if (2 > d) return (y.sendPacket(b), !0);
              if (1 == B.Entity.action && c == this) return !0;
              B.moveAction = b;
              b = new D.CZ.REQUEST_MOVE();
              b.dest[0] = a[2 * (d - 1) + 0];
              b.dest[1] = a[2 * (d - 1) + 1];
              y.sendPacket(b);
              return !0;
          }
        return !1;
      }
    }
    function t() {
      var a = this.constructor,
        b = z("Renderer/EntityManager"),
        c = b.get(B.mercGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === u.SHIFT && !1 === A.noshift) {
            C.action.active || H.setType(H.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          a = [];
          b = k.search(
            c.position[0] | 0,
            c.position[1] | 0,
            this.position[0] | 0,
            this.position[1] | 0,
            c.attack_range,
            a,
          );
          if (!b) return !0;
          c = new D.CZ.REQUEST_ACTNPC();
          c.GID = B.mercGID;
          c.action = 1;
          c.targetGID = this.GID;
          if (2 > b) return (y.sendPacket(c), !0);
          B.moveAction = c;
          c = new D.CZ.REQUEST_MOVENPC();
          c.GID = B.mercGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          y.sendPacket(c);
          return !0;
      }
      return !1;
    }
    function r() {
      var a = this.constructor,
        b = z("Renderer/EntityManager"),
        c = b.get(B.homGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === u.SHIFT && !1 === A.noshift) {
            C.action.active || H.setType(H.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          this.attachments.add({
            uid: "lockon",
            spr: "data/sprite/cursors.spr",
            act: "data/sprite/cursors.act",
            frame: H.ACTION.TARGET,
            repeat: !0,
            head: !0,
            depth: 10,
          });
          a = [];
          b = k.search(
            c.position[0] | 0,
            c.position[1] | 0,
            this.position[0] | 0,
            this.position[1] | 0,
            c.attack_range,
            a,
          );
          if (!b) return !0;
          c = new D.CZ.REQUEST_ACTNPC();
          c.GID = B.homGID;
          c.action = 1;
          c.targetGID = this.GID;
          if (2 > b) return (y.sendPacket(c), !0);
          B.moveAction = c;
          c = new D.CZ.REQUEST_MOVENPC();
          c.GID = B.homGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          y.sendPacket(c);
          return !0;
      }
      return !1;
    }
    function n() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
        case a.TYPE_MOB:
          a.Manager.getFocusEntity() && y.sendPacket(new D.CZ.CANCEL_LOCKON());
      }
      this.display.display = !1;
      this.display.remove();
      this.attachments.remove("lockon");
    }
    function g() {
      var a,
        b = this.room.constructor;
      switch (this.room.type) {
        case b.Type.SELL_SHOP:
          a = new D.CZ.REQ_CLICK_TO_BUYING_STORE();
          a.makerAID = this.room.id;
          y.sendPacket(a);
          break;
        case b.Type.BUY_SHOP:
          592 == this._job
            ? ((b = z("Renderer/EntityManager").get(this.GID)),
              z("Renderer/EntityManager").setOverEntity(b),
              (a = new D.CZ.CONTACTNPC()),
              (a.NAID = this.GID),
              (a.type = 1))
            : ((a = new D.CZ.REQ_BUY_FROMMC()), (a.AID = this.room.id));
          y.sendPacket(a);
          break;
        case b.Type.PUBLIC_CHAT:
          a = new D.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          a.passwd = "";
          y.sendPacket(a);
          O.type = 1;
          O.title = this.room.title;
          O.limit = this.room.limit;
          O.count = this.room.count;
          break;
        case b.Type.PRIVATE_CHAT:
          a = new D.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          N.append();
          N.setType("pass", !1);
          var c = this;
          N.onSubmitRequest = function (b) {
            N.remove();
            a.passwd = b;
            y.sendPacket(a);
            O.type = 0;
            O.title = c.room.title;
            O.limit = c.room.limit;
            O.count = c.room.count;
          };
      }
    }
    function p() {
      Q++;
    }
    var l = a("Utils/jquery"),
      f = a("Utils/gl-matrix"),
      k = a("Utils/PathFinding"),
      q = a("DB/DBManager"),
      u = a("Controls/KeyEventHandler"),
      v = a("Controls/MouseEventHandler"),
      A = a("Preferences/Controls"),
      C = a("Renderer/Camera"),
      B = a("Engine/SessionStorage"),
      J = a("Engine/MapEngine/Friends"),
      D = a("Network/PacketStructure"),
      y = a("Network/NetworkManager"),
      H = a("UI/CursorManager"),
      N = a("UI/Components/InputBox/InputBox"),
      O = a("UI/Components/ChatRoom/ChatRoom"),
      I = a("UI/Components/ContextMenu/ContextMenu"),
      x = a("UI/Components/PetInformations/PetInformations"),
      K = a("UI/Components/Trade/Trade"),
      E = a("UI/Components/ChatBox/ChatBox"),
      F = a("UI/UIManager"),
      z = a,
      G = f.mat4,
      L = f.vec2,
      M = G.create(),
      Q = 0,
      V = !1;
    return function () {
      this.onAddClickCount = p;
      this.onMouseOver = b;
      this.onMouseOut = c;
      this.onMouseDown = d;
      this.onMouseUp = e;
      this.onFocus = h;
      this.onMercFocus = t;
      this.onHomFocus = r;
      this.onFocusEnd = n;
      this.onRoomEnter = g;
      this.onContextMenu = m;
    };
  },
);
