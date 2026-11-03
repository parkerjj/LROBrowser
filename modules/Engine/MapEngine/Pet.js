define(
  "Engine/MapEngine/Pet",
  "require DB/DBManager DB/Emotions DB/Pets/PetMessageConst Network/NetworkManager Network/PacketStructure Core/Client Engine/SessionStorage Renderer/EntityManager UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/PetInformations/PetInformations UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b() {
      C.append();
      C.set({ SKID: -10, level: 0 }, C.TYPE.PET, "\u6355\u6349\u9b54\u7269");
      C.onPetSelected = function (a) {
        A.append();
        A.onTry = function () {
          var b = new f.CZ.TRYCAPTURE_MONSTER();
          b.targetAID = a;
          l.sendPacket(b);
        };
      };
    }
    function c(a) {
      A.setResult(a.result);
    }
    function d(a) {
      a.eggList.length &&
        (B.append(),
        B.setList(a.eggList),
        B.setTitle(n.getMessage(599)),
        (B.onIndexSelected = function (a) {
          if (-1 < a) {
            var b = new f.CZ.SELECT_PETEGG();
            b.index = a;
            l.sendPacket(b);
          }
        }));
    }
    function e(a) {
      D.append();
      D.setInformations(a);
      if (q.petId) {
        var b = u.get(q.petId);
        if (b) {
          var c = q.pet.hungry || a.nFullness;
          q.pet.job = a.job;
          q.pet.clevel = a.nLevel;
          q.pet.name = a.szName;
          q.pet.friendly = a.nRelationship;
          q.pet.oldHungry = c;
          q.pet.hungry = a.nFullness;
          b.life.hp = a.nFullness;
          b.life.hp_max = 100;
          b.life.update();
        }
      }
    }
    function m(a) {
      if (a.cRet) {
        a = n.getPetFriendlyState(q.pet.friendly);
        var b = n.getPetHungryState(q.pet.oldHungry),
          c = n.getPetTalkNumber(q.pet.job, p.PM_FEEDING, b, q.Sex),
          b = n.getPetEmotion(b, a, p.PM_FEEDING);
        0 < b &&
          ((a = new f.CZ.PET_ACT()), (a.data = b + "2"), l.sendPacket(a));
        900 < q.pet.friendly &&
          ((a = new f.CZ.PET_ACT()), (a.data = c), l.sendPacket(a));
      } else
        J.addText(
          n
            .getMessage(591)
            .replace("%s", n.getItemInfo(a.ITID).identifiedDiSPlayName),
          J.TYPE.ERROR,
        );
    }
    function h(a) {
      var b = u.get(a.GID),
        c;
      if (b)
        switch (a.type) {
          case 0:
            q.petId = a.GID;
            break;
          case 1:
            D.setIntimacy(a.data);
            break;
          case 2:
            D.setHunger(a.data);
            b.life.hp = a.data;
            b.life.hp_max = 100;
            b.life.update();
            break;
          case 3:
            a.data && (c = n.getPetEquipPath(a.data));
            !c &&
              b.files.body.spr &&
              (c = b.files.body.spr.replace(/\.spr$/i, ".act"));
            c &&
              k.loadFile(c, function () {
                b.files.body.act = c;
              });
            break;
          case 4:
            var d = [
              b.ACTION.PERF1,
              b.ACTION.PERF2,
              b.ACTION.PERF3,
              b.ACTION.SPECIAL,
            ];
            b.setAction({
              action: d[(a.data - 1 + d.length) % d.length],
              frame: 0,
              repeat: !1,
              play: !0,
              next: {
                action: b.ACTION.IDLE,
                frame: 0,
                repeat: !0,
                play: !0,
                next: !1,
              },
            });
        }
    }
    function t(a) {
      var b = u.get(a.GID);
      if (b)
        if (5e3 > a.data)
          ((a = parseInt(a.data / 10)),
            b.attachments.add({
              frame: g.indexes[a],
              file: "emotion",
              play: !0,
              head: !0,
              repeat: !1,
              depth: 5,
            }));
        else if ((b = n.getPetTalk(a.data)))
          ((a = u.get(a.GID)),
            J.addText(a.display.name + " : " + b, J.TYPE.PUBLIC),
            a.dialog.set(b));
    }
    function r(a) {
      switch (a.result) {
        case 0:
        case 1:
        case 2:
        case 3:
          y.setMsg("\u8fdb\u5316\u5931\u8d25");
          break;
        case 4:
          y.setMsg("\u8fdb\u5316\u6750\u6599\u4e0d\u8db3");
          break;
        case 5:
          y.setMsg(
            "\u4eb2\u5bc6\u5ea6\u4e3a\u975e\u5e38\u4eb2\u5bc6\u624d\u80fd\u8fdb\u5316",
          );
          break;
        case 6:
          y.setMsg("\u8fdb\u5316\u6210\u529f");
      }
    }
    var n = a("DB/DBManager"),
      g = a("DB/Emotions"),
      p = a("DB/Pets/PetMessageConst"),
      l = a("Network/NetworkManager"),
      f = a("Network/PacketStructure"),
      k = a("Core/Client"),
      q = a("Engine/SessionStorage"),
      u = a("Renderer/EntityManager"),
      v = a("UI/UIManager"),
      A = a("UI/Components/SlotMachine/SlotMachine"),
      C = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      B = a("UI/Components/ItemSelection/ItemSelection"),
      J = a("UI/Components/ChatBox/ChatBox"),
      D = a("UI/Components/PetInformations/PetInformations"),
      y = a("UI/Components/ItemObtain/ItemObtain");
    D.reqPetFeed = function () {
      v.showPromptBox(n.getMessage(601), "ok", "cancel", function () {
        var a = new f.CZ.COMMAND_PET();
        a.cSub = 1;
        l.sendPacket(a);
      });
    };
    D.reqPetAction = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 2;
      l.sendPacket(a);
    };
    D.reqBackToEgg = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 3;
      l.sendPacket(a);
      D.remove();
    };
    D.reqUnEquipPet = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 4;
      l.sendPacket(a);
    };
    D.reqNameEdit = function (a) {
      var b = new f.CZ.RENAME_PET();
      b.szName = a;
      l.sendPacket(b);
    };
    D.reqEvolution = function (a) {
      var b = new f.CZ.PET_EVOLUTION();
      b.eggID = a;
      l.sendPacket(b);
    };
    return function () {
      l.hookPacket(f.ZC.START_CAPTURE, b);
      l.hookPacket(f.ZC.TRYCAPTURE_MONSTER, c);
      l.hookPacket(f.ZC.PETEGG_LIST, d);
      l.hookPacket(f.ZC.PROPERTY_PET, e);
      l.hookPacket(f.ZC.FEED_PET, m);
      l.hookPacket(f.ZC.CHANGESTATE_PET, h);
      l.hookPacket(f.ZC.PET_ACT, t);
      l.hookPacket(f.ZC.PET_EVOLUTION_RESULT, r);
    };
  },
);
