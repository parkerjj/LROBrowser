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
          E.action.active || F.setType(F.ACTION.DEFAULT);
          break;
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if ((!1 === v.SHIFT && !1 === z.noshift) || this === C.Entity) {
            E.action.active || F.setType(F.ACTION.DEFAULT);
            break;
          }
          F.setType(F.ACTION.ATTACK);
          break;
        case a.TYPE_MOB:
        case a.TYPE_ICEWALL:
          F.setType(F.ACTION.ATTACK);
          break;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          F.setType(F.ACTION.TALK, !0);
          break;
        case a.TYPE_WARP:
          F.setType(F.ACTION.WARP);
          return;
        case a.TYPE_ITEM:
          F.setType(F.ACTION.PICK, !0, 0);
      }
      switch (this.display.load) {
        case this.display.TYPE.NONE:
          this.display.load = this.display.TYPE.LOADING;
          a = new A.CZ.REQNAME();
          a.AID = this.GID;
          B.sendPacket(a);
          break;
        case this.display.TYPE.COMPLETE:
          (G.multiply(N, E.projection, this.matrix),
            this.display.render(N),
            this.display.add());
      }
    }
    function c() {
      E.action.active
        ? F.setType(F.ACTION.ROTATE)
        : F.setType(F.ACTION.DEFAULT);
      this !== this.constructor.Manager.getFocusEntity() &&
        ((this.display.display = !1), this.display.remove());
    }
    function d() {
      var a = this.constructor;
      switch (this.objecttype) {
        case a.TYPE_ITEM:
          F.setType(F.ACTION.PICK, !0, 2);
          a = new A.CZ.ITEM_PICKUP();
          a.ITAID = this.GID;
          if (2 < K.distance(C.Entity.position, this.position))
            return (
              (C.moveAction = a),
              (a = new A.CZ.REQUEST_MOVE()),
              (a.dest[0] = t.world.x),
              (a.dest[1] = t.world.y),
              B.sendPacket(a),
              !0
            );
          B.sendPacket(a);
          C.Entity.lookTo(this.position[0], this.position[1]);
          return !0;
        case a.TYPE_NPC:
        case a.TYPE_NPC2:
          return (
            (a = new A.CZ.CONTACTNPC()),
            (a.NAID = this.GID),
            (a.type = 1),
            B.sendPacket(a),
            C.Entity.lookTo(this.position[0], this.position[1]),
            (a = new A.CZ.CHANGE_DIRECTION()),
            (a.headDir = C.Entity.headDir),
            (a.dir = C.Entity.direction),
            B.sendPacket(a),
            !0
          );
        case a.TYPE_WARP:
        case a.TYPE_EFFECT:
          return (
            (a = new A.CZ.REQUEST_MOVE()),
            (a.dest[0] = this.position[0]),
            (a.dest[1] = this.position[1]),
            B.sendPacket(a),
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
          C.petId === this.GID &&
            (H.remove(),
            H.append(),
            H.addElement(p.getMessage(596), x.ui.show.bind(x.ui)),
            H.addElement(p.getMessage(592), x.reqPetFeed),
            H.addElement(p.getMessage(593), x.reqPetAction),
            H.addElement(p.getMessage(595), x.reqUnEquipPet),
            H.addElement(p.getMessage(594), x.reqBackToEgg));
          break;
        case a.TYPE_PC:
          H.remove();
          H.append();
          H.addElement(
            p.getMessage(87).replace("%s", this.display.name),
            function () {
              I.reqExchange(b.GID, b.display.name);
            },
          );
          C.hasGuild &&
            (C.guildRight & 1 &&
              !this.GUID &&
              H.addElement(
                p.getMessage(382).replace("%s", this.display.name),
                function () {
                  y("Engine/MapEngine/Guild").requestPlayerInvitation(b.GID);
                },
              ),
            C.isGuildMaster &&
              this.GUID &&
              C.Entity.GUID !== this.GUID &&
              (H.addElement(
                p.getMessage(399).replace("%s", this.display.name),
                function () {
                  y("Engine/MapEngine/Guild").requestAlliance(b.GID);
                },
              ),
              H.addElement(
                p.getMessage(403).replace("%s", this.display.name),
                function () {
                  y("Engine/MapEngine/Guild").requestHostility(b.GID);
                },
              )));
          C.hasParty &&
            C.isPartyLeader &&
            H.addElement(
              p.getMessage(88).replace("%s", this.display.name),
              function () {
                y("Engine/MapEngine/Group").onRequestInvitation(
                  b.GID,
                  b.display.name,
                );
              },
            );
          J.isFriend(this.display.name) ||
            H.addElement(p.getMessage(358), function () {
              J.addFriend(b.display.name);
            });
          H.addElement(
            "\u67e5\u770b\u8be5\u73a9\u5bb6\u7684\u88c5\u5907",
            function () {
              var a = new A.CZ.EQUIPWIN_MICROSCOPE();
              a.AID = b.GID;
              B.sendPacket(a);
              y("UI/Components/Equipment/Equipment").setCharacter(b);
            },
          );
          H.addElement("\u8ddf\u968f\u76ee\u6807\u5bf9\u8c61", function () {
            "quiz_01.gat" == y("Renderer/MapRenderer").currentMap
              ? D.addText(
                  "\u8be5\u5730\u56fe\u65e0\u6cd5\u4f7f\u7528\u8ddf\u968f\u529f\u80fd",
                  D.TYPE.ERROR,
                )
              : ((z.noshift = !1),
                y("Renderer/EntityManager").setFocusEntity(b));
          });
          H.addElement("\u5bf9\u8bdd", function () {
            D.focus();
            l("#chatbox .battlemode").hide();
            l("#chatbox .input").show();
            l("#chatbox .input .username").val(b.display.name);
            l("#chatbox .input .message").select();
          });
          C.Entity.isAdmin &&
            H.addElement("\u5254\u9664", function () {
              var a = new A.CZ.WHISPER();
              a.receiver = "";
              a.msg = "@kick " + b.display.name;
              B.sendPacket(a);
            });
          break;
        case a.TYPE_HOM:
          0 < C.homGID &&
            (H.remove(),
            H.append(),
            H.addElement("\u663e\u793a\u72b6\u6001", function () {
              y("UI/Components/Homunc/HomuncInformations").ui.show();
            }));
          break;
        case a.TYPE_MERC:
          0 < C.mercGID &&
            (H.remove(),
            H.append(),
            H.addElement("\u663e\u793a\u72b6\u6001", function () {
              y("UI/Components/Mercenary/MercenaryInformations").ui.show();
            }));
      }
      return !1;
    }
    function h() {
      var a = this.constructor,
        b = C.Entity,
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
              if (!1 === v.SHIFT && !1 === z.noshift) {
                E.action.active || F.setType(F.ACTION.DEFAULT);
                break;
              }
            case a.TYPE_MOB:
            case a.TYPE_ICEWALL:
              this.attachments.add({
                uid: "lockon",
                spr: "data/sprite/cursors.spr",
                act: "data/sprite/cursors.act",
                frame: F.ACTION.LOCK,
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
                ((5 == C.Entity.action ||
                  10 == C.Entity.action ||
                  11 == C.Entity.action) &&
                  c == this)
              )
                return !0;
              b = new A.CZ.REQUEST_ACT();
              b.action = z.noctrl ? 7 : 0;
              b.targetGID = this.GID;
              if (2 > d) return (B.sendPacket(b), !0);
              if (1 == C.Entity.action && c == this) return !0;
              C.moveAction = b;
              b = new A.CZ.REQUEST_MOVE();
              b.dest[0] = a[2 * (d - 1) + 0];
              b.dest[1] = a[2 * (d - 1) + 1];
              B.sendPacket(b);
              return !0;
          }
        return !1;
      }
    }
    function q() {
      var a = this.constructor,
        b = y("Renderer/EntityManager"),
        c = b.get(C.mercGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === v.SHIFT && !1 === z.noshift) {
            E.action.active || F.setType(F.ACTION.DEFAULT);
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
          c = new A.CZ.REQUEST_ACTNPC();
          c.GID = C.mercGID;
          c.action = 1;
          c.targetGID = this.GID;
          if (2 > b) return (B.sendPacket(c), !0);
          C.moveAction = c;
          c = new A.CZ.REQUEST_MOVENPC();
          c.GID = C.mercGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          B.sendPacket(c);
          return !0;
      }
      return !1;
    }
    function r() {
      var a = this.constructor,
        b = y("Renderer/EntityManager"),
        c = b.get(C.homGID);
      b.getFocusEntity();
      switch (this.objecttype) {
        case a.TYPE_PC:
        case a.TYPE_ELEM:
        case a.TYPE_HOM:
          if (!1 === v.SHIFT && !1 === z.noshift) {
            E.action.active || F.setType(F.ACTION.DEFAULT);
            break;
          }
        case a.TYPE_MOB:
          this.attachments.add({
            uid: "lockon",
            spr: "data/sprite/cursors.spr",
            act: "data/sprite/cursors.act",
            frame: F.ACTION.TARGET,
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
          c = new A.CZ.REQUEST_ACTNPC();
          c.GID = C.homGID;
          c.action = 1;
          c.targetGID = this.GID;
          if (2 > b) return (B.sendPacket(c), !0);
          C.moveAction = c;
          c = new A.CZ.REQUEST_MOVENPC();
          c.GID = C.homGID;
          c.dest[0] = a[2 * (b - 1) + 0];
          c.dest[1] = a[2 * (b - 1) + 1];
          B.sendPacket(c);
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
          a.Manager.getFocusEntity() && B.sendPacket(new A.CZ.CANCEL_LOCKON());
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
          a = new A.CZ.REQ_CLICK_TO_BUYING_STORE();
          a.makerAID = this.room.id;
          B.sendPacket(a);
          break;
        case b.Type.BUY_SHOP:
          592 == this._job
            ? ((b = y("Renderer/EntityManager").get(this.GID)),
              y("Renderer/EntityManager").setOverEntity(b),
              (a = new A.CZ.CONTACTNPC()),
              (a.NAID = this.GID),
              (a.type = 1))
            : ((a = new A.CZ.REQ_BUY_FROMMC()), (a.AID = this.room.id));
          B.sendPacket(a);
          break;
        case b.Type.PUBLIC_CHAT:
          a = new A.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          a.passwd = "";
          B.sendPacket(a);
          M.type = 1;
          M.title = this.room.title;
          M.limit = this.room.limit;
          M.count = this.room.count;
          break;
        case b.Type.PRIVATE_CHAT:
          a = new A.CZ.REQ_ENTER_ROOM();
          a.roomID = this.room.id;
          O.append();
          O.setType("pass", !1);
          var c = this;
          O.onSubmitRequest = function (b) {
            O.remove();
            a.passwd = b;
            B.sendPacket(a);
            M.type = 0;
            M.title = c.room.title;
            M.limit = c.room.limit;
            M.count = c.room.count;
          };
      }
    }
    function u() {
      Q++;
    }
    var l = a("Utils/jquery"),
      f = a("Utils/gl-matrix"),
      n = a("Utils/PathFinding"),
      p = a("DB/DBManager"),
      v = a("Controls/KeyEventHandler"),
      t = a("Controls/MouseEventHandler"),
      z = a("Preferences/Controls"),
      E = a("Renderer/Camera"),
      C = a("Engine/SessionStorage"),
      J = a("Engine/MapEngine/Friends"),
      A = a("Network/PacketStructure"),
      B = a("Network/NetworkManager"),
      F = a("UI/CursorManager"),
      O = a("UI/Components/InputBox/InputBox"),
      M = a("UI/Components/ChatRoom/ChatRoom"),
      H = a("UI/Components/ContextMenu/ContextMenu"),
      x = a("UI/Components/PetInformations/PetInformations"),
      I = a("UI/Components/Trade/Trade"),
      D = a("UI/Components/ChatBox/ChatBox"),
      L = a("UI/UIManager"),
      y = a,
      G = f.mat4,
      K = f.vec2,
      N = G.create(),
      Q = 0,
      W = !1;
    return function () {
      this.onAddClickCount = u;
      this.onMouseOver = b;
      this.onMouseOut = c;
      this.onMouseDown = d;
      this.onMouseUp = e;
      this.onFocus = h;
      this.onMercFocus = q;
      this.onHomFocus = r;
      this.onFocusEnd = k;
      this.onRoomEnter = g;
      this.onContextMenu = m;
    };
  },
);
