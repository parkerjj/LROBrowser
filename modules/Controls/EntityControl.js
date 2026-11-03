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
          D.action.active || G.setType(G.ACTION.DEFAULT);
          break;
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if ((!1 === v.SHIFT && !1 === A.noshift) || this === B.Entity) {
            D.action.active || G.setType(G.ACTION.DEFAULT);
            break;
          }
          G.setType(G.ACTION.ATTACK);
          break;
        case a.TYPE_MOB:
        case a.TYPE_ICEWALL:
          G.setType(G.ACTION.ATTACK);
          break;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          G.setType(G.ACTION.TALK, !0);
          break;
        case a.TYPE_WARP:
          G.setType(G.ACTION.WARP);
          return;
        case a.TYPE_ITEM:
          G.setType(G.ACTION.PICK, !0, 0);
      }
      switch (this.display.load) {
        case this.display.TYPE.NONE:
          this.display.load = this.display.TYPE.LOADING;
          a = new C.CZ.REQNAME();
          a.AID = this.GID;
          z.sendPacket(a);
          break;
        case this.display.TYPE.COMPLETE:
          (F.multiply(M, D.projection, this.matrix),
            this.display.render(M),
            this.display.add());
      }
    }
    function c() {
      D.action.active
        ? G.setType(G.ACTION.ROTATE)
        : G.setType(G.ACTION.DEFAULT);
      this !== this.constructor.Manager.getFocusEntity() &&
        ((this.display.display = !1), this.display.remove());
    }
    function d() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_ITEM:
          G.setType(G.ACTION.PICK, !0, 2);
          a = new C.CZ.ITEM_PICKUP();
          a.ITAID = this.GID;
          if (2 < K.distance(B.Entity.position, this.position))
            return (
              (B.moveAction = a),
              (a = new C.CZ.REQUEST_MOVE()),
              (a.dest[0] = u.world.x),
              (a.dest[1] = u.world.y),
              z.sendPacket(a),
              !0
            );
          z.sendPacket(a);
          B.Entity.lookTo(this.position[0], this.position[1]);
          return !0;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          return (
            (a = new C.CZ.CONTACTNPC()),
            (a.NAID = this.GID),
            (a.type = 1),
            z.sendPacket(a),
            B.Entity.lookTo(this.position[0], this.position[1]),
            (a = new C.CZ.CHANGE_DIRECTION()),
            (a.headDir = B.Entity.headDir),
            (a.dir = B.Entity.direction),
            z.sendPacket(a),
            !0
          );
        case a.TYPE_WARP:
        case a.TYPE_EFFECT:
          return (
            (a = new C.CZ.REQUEST_MOVE()),
            (a.dest[0] = this.position[0]),
            (a.dest[1] = this.position[1]),
            z.sendPacket(a),
            !0
          );
      }
      return !1;
    }
    function e() {}
    function l() {
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
              J.reqExchange(b.GID, b.display.name);
            },
          );
          B.hasGuild &&
            (B.guildRight & 1 &&
              !this.GUID &&
              I.addElement(
                q.getMessage(382).replace("%s", this.display.name),
                function () {
                  y("Engine/MapEngine/Guild").requestPlayerInvitation(b.GID);
                },
              ),
            B.isGuildMaster &&
              this.GUID &&
              B.Entity.GUID !== this.GUID &&
              (I.addElement(
                q.getMessage(399).replace("%s", this.display.name),
                function () {
                  y("Engine/MapEngine/Guild").requestAlliance(b.GID);
                },
              ),
              I.addElement(
                q.getMessage(403).replace("%s", this.display.name),
                function () {
                  y("Engine/MapEngine/Guild").requestHostility(b.GID);
                },
              )));
          B.hasParty &&
            B.isPartyLeader &&
            I.addElement(
              q.getMessage(88).replace("%s", this.display.name),
              function () {
                y("Engine/MapEngine/Group").onRequestInvitation(
                  b.GID,
                  b.display.name,
                );
              },
            );
          H.isFriend(this.display.name) ||
            I.addElement(q.getMessage(358), function () {
              H.addFriend(b.display.name);
            });
          I.addElement(
            "\u67e5\u770b\u8be5\u73a9\u5bb6\u7684\u88c5\u5907",
            function () {
              var a = new C.CZ.EQUIPWIN_MICROSCOPE();
              a.AID = b.GID;
              z.sendPacket(a);
              y("UI/Components/Equipment/Equipment").setCharacter(b);
            },
          );
          I.addElement("\u8ddf\u968f\u76ee\u6807\u5bf9\u8c61", function () {
            "quiz_01.gat" == y("Renderer/MapRenderer").currentMap
              ? E.addText(
                  "\u8be5\u5730\u56fe\u65e0\u6cd5\u4f7f\u7528\u8ddf\u968f\u529f\u80fd",
                  E.TYPE.ERROR,
                )
              : ((A.noshift = !1),
                y("Renderer/EntityManager").setFocusEntity(b));
          });
          I.addElement("\u5bf9\u8bdd", function () {
            E.focus();
            k("#chatbox .battlemode").hide();
            k("#chatbox .input").show();
            k("#chatbox .input .username").val(b.display.name);
            k("#chatbox .input .message").select();
          });
          B.Entity.isAdmin &&
            I.addElement("\u5254\u9664", function () {
              var a = new C.CZ.WHISPER();
              a.receiver = "";
              a.msg = "@kick " + b.display.name;
              z.sendPacket(a);
            });
          break;
        case a.TYPE_HOM:
          0 < B.homGID &&
            (I.remove(),
            I.append(),
            I.addElement("\u663e\u793a\u72b6\u6001", function () {
              y("UI/Components/Homunc/HomuncInformations").ui.show();
            }));
          break;
        case a.TYPE_MERC:
          0 < B.mercGID &&
            (I.remove(),
            I.append(),
            I.addElement("\u663e\u793a\u72b6\u6001", function () {
              y("UI/Components/Mercenary/MercenaryInformations").ui.show();
            }));
      }
      return !1;
    }
    function h() {
      var a = this.constructor,
        b = B.Entity,
        c = y("Renderer/EntityManager").getFocusEntity();
      if (W)
        L.showMessageBox("You are temporarily restricted from clicking.", "ok");
      else {
        1 === Q &&
          setTimeout(function () {
            Q = 0;
          }, 5e3);
        if (30 < Q)
          ((W = !0),
            L.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              W = !1;
              L.showMessageBox(
                "Restriction lifted. You can click again.",
                "ok",
              );
            }, 1e4));
        else
          switch (this.objecttype) {
            case a.TYPE_PC:
            case a.TYPE_ELEM:
            case a.TYPE_HOM:
              if (!1 === v.SHIFT && !1 === A.noshift) {
                D.action.active || G.setType(G.ACTION.DEFAULT);
                break;
              }
            case a.TYPE_MOB:
            case a.TYPE_ICEWALL:
              this.attachments.add({
                uid: "lockon",
                spr: "data/sprite/cursors.spr",
                act: "data/sprite/cursors.act",
                frame: G.ACTION.LOCK,
                repeat: !0,
                depth: 10,
              });
              var a = [],
                d = m.search(
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
              b = new C.CZ.REQUEST_ACT();
              b.action = A.noctrl ? 7 : 0;
              b.targetGID = this.GID;
              if (2 > d) return (z.sendPacket(b), !0);
              if (1 == B.Entity.action && c == this) return !0;
              B.moveAction = b;
              b = new C.CZ.REQUEST_MOVE();
              b.dest[0] = a[2 * (d - 1) + 0];
              b.dest[1] = a[2 * (d - 1) + 1];
              z.sendPacket(b);
              return !0;
          }
        return !1;
      }
    }
    function r() {
      var a = this.constructor,
        b = y("Renderer/EntityManager"),
        c = b.get(B.mercGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === v.SHIFT && !1 === A.noshift) {
            D.action.active || G.setType(G.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          a = [];
          b = m.search(
            c.position[0] | 0,
            c.position[1] | 0,
            this.position[0] | 0,
            this.position[1] | 0,
            c.attack_range,
            a,
          );
          if (!b) return !0;
          c = new C.CZ.REQUEST_ACTNPC();
          c.GID = B.mercGID;
          c.action = 1;
          c.targetGID = this.GID;
          if (2 > b) return (z.sendPacket(c), !0);
          B.moveAction = c;
          c = new C.CZ.REQUEST_MOVENPC();
          c.GID = B.mercGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          z.sendPacket(c);
          return !0;
      }
      return !1;
    }
    function t() {
      var a = this.constructor,
        b = y("Renderer/EntityManager"),
        c = b.get(B.homGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === v.SHIFT && !1 === A.noshift) {
            D.action.active || G.setType(G.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          this.attachments.add({
            uid: "lockon",
            spr: "data/sprite/cursors.spr",
            act: "data/sprite/cursors.act",
            frame: G.ACTION.TARGET,
            repeat: !0,
            head: !0,
            depth: 10,
          });
          a = [];
          b = m.search(
            c.position[0] | 0,
            c.position[1] | 0,
            this.position[0] | 0,
            this.position[1] | 0,
            c.attack_range,
            a,
          );
          if (!b) return !0;
          c = new C.CZ.REQUEST_ACTNPC();
          c.GID = B.homGID;
          c.action = 1;
          c.targetGID = this.GID;
          if (2 > b) return (z.sendPacket(c), !0);
          B.moveAction = c;
          c = new C.CZ.REQUEST_MOVENPC();
          c.GID = B.homGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          z.sendPacket(c);
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
          a.Manager.getFocusEntity() && z.sendPacket(new C.CZ.CANCEL_LOCKON());
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
          a = new C.CZ.REQ_CLICK_TO_BUYING_STORE();
          a.makerAID = this.room.id;
          z.sendPacket(a);
          break;
        case b.Type.BUY_SHOP:
          592 == this._job
            ? ((b = y("Renderer/EntityManager").get(this.GID)),
              y("Renderer/EntityManager").setOverEntity(b),
              (a = new C.CZ.CONTACTNPC()),
              (a.NAID = this.GID),
              (a.type = 1))
            : ((a = new C.CZ.REQ_BUY_FROMMC()), (a.AID = this.room.id));
          z.sendPacket(a);
          break;
        case b.Type.PUBLIC_CHAT:
          a = new C.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          a.passwd = "";
          z.sendPacket(a);
          N.type = 1;
          N.title = this.room.title;
          N.limit = this.room.limit;
          N.count = this.room.count;
          break;
        case b.Type.PRIVATE_CHAT:
          a = new C.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          P.append();
          P.setType("pass", !1);
          var c = this;
          P.onSubmitRequest = function (b) {
            P.remove();
            a.passwd = b;
            z.sendPacket(a);
            N.type = 0;
            N.title = c.room.title;
            N.limit = c.room.limit;
            N.count = c.room.count;
          };
      }
    }
    function p() {
      Q++;
    }
    var k = a("Utils/jquery"),
      f = a("Utils/gl-matrix"),
      m = a("Utils/PathFinding"),
      q = a("DB/DBManager"),
      v = a("Controls/KeyEventHandler"),
      u = a("Controls/MouseEventHandler"),
      A = a("Preferences/Controls"),
      D = a("Renderer/Camera"),
      B = a("Engine/SessionStorage"),
      H = a("Engine/MapEngine/Friends"),
      C = a("Network/PacketStructure"),
      z = a("Network/NetworkManager"),
      G = a("UI/CursorManager"),
      P = a("UI/Components/InputBox/InputBox"),
      N = a("UI/Components/ChatRoom/ChatRoom"),
      I = a("UI/Components/ContextMenu/ContextMenu"),
      x = a("UI/Components/PetInformations/PetInformations"),
      J = a("UI/Components/Trade/Trade"),
      E = a("UI/Components/ChatBox/ChatBox"),
      L = a("UI/UIManager"),
      y = a,
      F = f.mat4,
      K = f.vec2,
      M = F.create(),
      Q = 0,
      W = !1;
    return function () {
      this.onAddClickCount = p;
      this.onMouseOver = b;
      this.onMouseOut = c;
      this.onMouseDown = d;
      this.onMouseUp = e;
      this.onFocus = h;
      this.onMercFocus = r;
      this.onHomFocus = t;
      this.onFocusEnd = n;
      this.onRoomEnter = g;
      this.onContextMenu = l;
    };
  },
);
