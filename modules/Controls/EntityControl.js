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
          D.action.active || z.setType(z.ACTION.DEFAULT);
          break;
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if ((!1 === v.SHIFT && !1 === A.noshift) || this === B.Entity) {
            D.action.active || z.setType(z.ACTION.DEFAULT);
            break;
          }
          z.setType(z.ACTION.ATTACK);
          break;
        case a.TYPE_MOB:
        case a.TYPE_ICEWALL:
          z.setType(z.ACTION.ATTACK);
          break;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          z.setType(z.ACTION.TALK, !0);
          break;
        case a.TYPE_WARP:
          z.setType(z.ACTION.WARP);
          return;
        case a.TYPE_ITEM:
          z.setType(z.ACTION.PICK, !0, 0);
      }
      switch (this.display.load) {
        case this.display.TYPE.NONE:
          this.display.load = this.display.TYPE.LOADING;
          a = new C.CZ.REQNAME();
          a.AID = this.GID;
          y.sendPacket(a);
          break;
        case this.display.TYPE.COMPLETE:
          (H.multiply(P, D.projection, this.matrix),
            this.display.render(P),
            this.display.add());
      }
    }
    function c() {
      D.action.active
        ? z.setType(z.ACTION.ROTATE)
        : z.setType(z.ACTION.DEFAULT);
      this !== this.constructor.Manager.getFocusEntity() &&
        ((this.display.display = !1), this.display.remove());
    }
    function d() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_ITEM:
          z.setType(z.ACTION.PICK, !0, 2);
          a = new C.CZ.ITEM_PICKUP();
          a.ITAID = this.GID;
          if (2 < K.distance(B.Entity.position, this.position))
            return (
              (B.moveAction = a),
              (a = new C.CZ.REQUEST_MOVE()),
              (a.dest[0] = u.world.x),
              (a.dest[1] = u.world.y),
              y.sendPacket(a),
              !0
            );
          y.sendPacket(a);
          B.Entity.lookTo(this.position[0], this.position[1]);
          return !0;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          return (
            (a = new C.CZ.CONTACTNPC()),
            (a.NAID = this.GID),
            (a.type = 1),
            y.sendPacket(a),
            B.Entity.lookTo(this.position[0], this.position[1]),
            (a = new C.CZ.CHANGE_DIRECTION()),
            (a.headDir = B.Entity.headDir),
            (a.dir = B.Entity.direction),
            y.sendPacket(a),
            !0
          );
        case a.TYPE_WARP:
        case a.TYPE_EFFECT:
          return (
            (a = new C.CZ.REQUEST_MOVE()),
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
            (L.remove(),
            L.append(),
            L.addElement(p.getMessage(596), x.ui.show.bind(x.ui)),
            L.addElement(p.getMessage(592), x.reqPetFeed),
            L.addElement(p.getMessage(593), x.reqPetAction),
            L.addElement(p.getMessage(595), x.reqUnEquipPet),
            L.addElement(p.getMessage(594), x.reqBackToEgg));
          break;
        case a.TYPE_PC:
          L.remove();
          L.append();
          L.addElement(
            p.getMessage(87).replace("%s", this.display.name),
            function () {
              M.reqExchange(b.GID, b.display.name);
            },
          );
          B.hasGuild &&
            (B.guildRight & 1 &&
              !this.GUID &&
              L.addElement(
                p.getMessage(382).replace("%s", this.display.name),
                function () {
                  G("Engine/MapEngine/Guild").requestPlayerInvitation(b.GID);
                },
              ),
            B.isGuildMaster &&
              this.GUID &&
              B.Entity.GUID !== this.GUID &&
              (L.addElement(
                p.getMessage(399).replace("%s", this.display.name),
                function () {
                  G("Engine/MapEngine/Guild").requestAlliance(b.GID);
                },
              ),
              L.addElement(
                p.getMessage(403).replace("%s", this.display.name),
                function () {
                  G("Engine/MapEngine/Guild").requestHostility(b.GID);
                },
              )));
          B.hasParty &&
            B.isPartyLeader &&
            L.addElement(
              p.getMessage(88).replace("%s", this.display.name),
              function () {
                G("Engine/MapEngine/Group").onRequestInvitation(
                  b.GID,
                  b.display.name,
                );
              },
            );
          O.isFriend(this.display.name) ||
            L.addElement(p.getMessage(358), function () {
              O.addFriend(b.display.name);
            });
          L.addElement(
            "\u67e5\u770b\u8be5\u73a9\u5bb6\u7684\u88c5\u5907",
            function () {
              var a = new C.CZ.EQUIPWIN_MICROSCOPE();
              a.AID = b.GID;
              y.sendPacket(a);
              G("UI/Components/Equipment/Equipment").setCharacter(b);
            },
          );
          L.addElement("\u8ddf\u968f\u76ee\u6807\u5bf9\u8c61", function () {
            "quiz_01.gat" == G("Renderer/MapRenderer").currentMap
              ? E.addText(
                  "\u8be5\u5730\u56fe\u65e0\u6cd5\u4f7f\u7528\u8ddf\u968f\u529f\u80fd",
                  E.TYPE.ERROR,
                )
              : ((A.noshift = !1),
                G("Renderer/EntityManager").setFocusEntity(b));
          });
          L.addElement("\u5bf9\u8bdd", function () {
            E.focus();
            l("#chatbox .battlemode").hide();
            l("#chatbox .input").show();
            l("#chatbox .input .username").val(b.display.name);
            l("#chatbox .input .message").select();
          });
          break;
        case a.TYPE_HOM:
          0 < B.homGID &&
            (L.remove(),
            L.append(),
            L.addElement("\u663e\u793a\u72b6\u6001", function () {
              G("UI/Components/Homunc/HomuncInformations").ui.show();
            }));
          break;
        case a.TYPE_MERC:
          0 < B.mercGID &&
            (L.remove(),
            L.append(),
            L.addElement("\u663e\u793a\u72b6\u6001", function () {
              G("UI/Components/Mercenary/MercenaryInformations").ui.show();
            }));
      }
      return !1;
    }
    function h() {
      var a = this.constructor,
        b = B.Entity,
        c = G("Renderer/EntityManager").getFocusEntity();
      if (S)
        F.showMessageBox("You are temporarily restricted from clicking.", "ok");
      else {
        1 === N &&
          setTimeout(function () {
            N = 0;
          }, 5e3);
        if (30 < N)
          ((S = !0),
            F.showMessageBox(
              "Click limit exceeded. You are restricted for 10s.",
              "ok",
            ),
            setTimeout(function () {
              S = !1;
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
              if (!1 === v.SHIFT && !1 === A.noshift) {
                D.action.active || z.setType(z.ACTION.DEFAULT);
                break;
              }
            case a.TYPE_MOB:
            case a.TYPE_ICEWALL:
              this.attachments.add({
                uid: "lockon",
                spr: "data/sprite/cursors.spr",
                act: "data/sprite/cursors.act",
                frame: z.ACTION.LOCK,
                repeat: !0,
                depth: 10,
              });
              var a = [],
                d = n.search(
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
              if (2 > d) return (y.sendPacket(b), !0);
              if (1 == B.Entity.action && c == this) return !0;
              B.moveAction = b;
              b = new C.CZ.REQUEST_MOVE();
              b.dest[0] = a[2 * (d - 1) + 0];
              b.dest[1] = a[2 * (d - 1) + 1];
              y.sendPacket(b);
              return !0;
          }
        return !1;
      }
    }
    function r() {
      var a = this.constructor,
        b = G("Renderer/EntityManager"),
        c = b.get(B.mercGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === v.SHIFT && !1 === A.noshift) {
            D.action.active || z.setType(z.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          a = [];
          b = n.search(
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
          if (2 > b) return (y.sendPacket(c), !0);
          B.moveAction = c;
          c = new C.CZ.REQUEST_MOVENPC();
          c.GID = B.mercGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          y.sendPacket(c);
          return !0;
      }
      return !1;
    }
    function q() {
      var a = this.constructor,
        b = G("Renderer/EntityManager"),
        c = b.get(B.homGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === v.SHIFT && !1 === A.noshift) {
            D.action.active || z.setType(z.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          this.attachments.add({
            uid: "lockon",
            spr: "data/sprite/cursors.spr",
            act: "data/sprite/cursors.act",
            frame: z.ACTION.TARGET,
            repeat: !0,
            head: !0,
            depth: 10,
          });
          a = [];
          b = n.search(
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
          if (2 > b) return (y.sendPacket(c), !0);
          B.moveAction = c;
          c = new C.CZ.REQUEST_MOVENPC();
          c.GID = B.homGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          y.sendPacket(c);
          return !0;
      }
      return !1;
    }
    function k() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
        case a.TYPE_MOB:
          a.Manager.getFocusEntity() && y.sendPacket(new C.CZ.CANCEL_LOCKON());
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
          y.sendPacket(a);
          break;
        case b.Type.BUY_SHOP:
          592 == this._job
            ? ((b = G("Renderer/EntityManager").get(this.GID)),
              G("Renderer/EntityManager").setOverEntity(b),
              (a = new C.CZ.CONTACTNPC()),
              (a.NAID = this.GID),
              (a.type = 1))
            : ((a = new C.CZ.REQ_BUY_FROMMC()), (a.AID = this.room.id));
          y.sendPacket(a);
          break;
        case b.Type.PUBLIC_CHAT:
          a = new C.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          a.passwd = "";
          y.sendPacket(a);
          I.type = 1;
          I.title = this.room.title;
          I.limit = this.room.limit;
          I.count = this.room.count;
          break;
        case b.Type.PRIVATE_CHAT:
          a = new C.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          J.append();
          J.setType("pass", !1);
          var c = this;
          J.onSubmitRequest = function (b) {
            J.remove();
            a.passwd = b;
            y.sendPacket(a);
            I.type = 0;
            I.title = c.room.title;
            I.limit = c.room.limit;
            I.count = c.room.count;
          };
      }
    }
    function t() {
      N++;
    }
    var l = a("Utils/jquery"),
      f = a("Utils/gl-matrix"),
      n = a("Utils/PathFinding"),
      p = a("DB/DBManager"),
      v = a("Controls/KeyEventHandler"),
      u = a("Controls/MouseEventHandler"),
      A = a("Preferences/Controls"),
      D = a("Renderer/Camera"),
      B = a("Engine/SessionStorage"),
      O = a("Engine/MapEngine/Friends"),
      C = a("Network/PacketStructure"),
      y = a("Network/NetworkManager"),
      z = a("UI/CursorManager"),
      J = a("UI/Components/InputBox/InputBox"),
      I = a("UI/Components/ChatRoom/ChatRoom"),
      L = a("UI/Components/ContextMenu/ContextMenu"),
      x = a("UI/Components/PetInformations/PetInformations"),
      M = a("UI/Components/Trade/Trade"),
      E = a("UI/Components/ChatBox/ChatBox"),
      F = a("UI/UIManager"),
      G = a,
      H = f.mat4,
      K = f.vec2,
      P = H.create(),
      N = 0,
      S = !1;
    return function () {
      this.onAddClickCount = t;
      this.onMouseOver = b;
      this.onMouseOut = c;
      this.onMouseDown = d;
      this.onMouseUp = e;
      this.onFocus = h;
      this.onMercFocus = r;
      this.onHomFocus = q;
      this.onFocusEnd = k;
      this.onRoomEnter = g;
      this.onContextMenu = m;
    };
  },
);
