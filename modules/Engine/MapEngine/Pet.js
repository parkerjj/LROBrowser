define(
  "Engine/MapEngine/Pet",
  "require DB/DBManager DB/Emotions DB/Pets/PetMessageConst Network/NetworkManager Network/PacketStructure Core/Client Engine/SessionStorage Renderer/EntityManager UI/UIManager UI/Components/SlotMachine/SlotMachine UI/Components/SkillTargetSelection/SkillTargetSelection UI/Components/ItemSelection/ItemSelection UI/Components/ChatBox/ChatBox UI/Components/PetInformations/PetInformations UI/Components/ItemObtain/ItemObtain".split(
    " ",
  ),
  function (a) {
    function b() {
      D.append();
      D.set({ SKID: -10, level: 0 }, D.TYPE.PET, "\u6355\u6349\u9b54\u7269");
      D.onPetSelected = function (a) {
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
        B.setTitle(k.getMessage(599)),
        (B.onIndexSelected = function (a) {
          if (-1 < a) {
            var b = new f.CZ.SELECT_PETEGG();
            b.index = a;
            l.sendPacket(b);
          }
        }));
    }
    function e(a) {
      C.append();
      C.setInformations(a);
      if (p.petId) {
        var b = v.get(p.petId);
        if (b) {
          var c = p.pet.hungry || a.nFullness;
          p.pet.job = a.job;
          p.pet.clevel = a.nLevel;
          p.pet.name = a.szName;
          p.pet.friendly = a.nRelationship;
          p.pet.oldHungry = c;
          p.pet.hungry = a.nFullness;
          b.life.hp = a.nFullness;
          b.life.hp_max = 100;
          b.life.update();
        }
      }
    }
    function m(a) {
      if (a.cRet) {
        a = k.getPetFriendlyState(p.pet.friendly);
        var b = k.getPetHungryState(p.pet.oldHungry),
          c = k.getPetTalkNumber(p.pet.job, t.PM_FEEDING, b, p.Sex),
          b = k.getPetEmotion(b, a, t.PM_FEEDING);
        0 < b &&
          ((a = new f.CZ.PET_ACT()), (a.data = b + "2"), l.sendPacket(a));
        900 < p.pet.friendly &&
          ((a = new f.CZ.PET_ACT()), (a.data = c), l.sendPacket(a));
      } else
        O.addText(
          k
            .getMessage(591)
            .replace("%s", k.getItemInfo(a.ITID).identifiedDiSPlayName),
          O.TYPE.ERROR,
        );
    }
    function h(a) {
      var b = v.get(a.GID),
        c;
      if (b)
        switch (a.type) {
          case 0:
            p.petId = a.GID;
            break;
          case 1:
            C.setIntimacy(a.data);
            break;
          case 2:
            C.setHunger(a.data);
            b.life.hp = a.data;
            b.life.hp_max = 100;
            b.life.update();
            break;
          case 3:
            a.data && (c = k.getPetEquipPath(a.data));
            !c &&
              b.files.body.spr &&
              (c = b.files.body.spr.replace(/\.spr$/i, ".act"));
            c &&
              n.loadFile(c, function () {
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
    function r(a) {
      var b = v.get(a.GID);
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
        else if ((b = k.getPetTalk(a.data)))
          ((a = v.get(a.GID)),
            O.addText(a.display.name + " : " + b, O.TYPE.PUBLIC),
            a.dialog.set(b));
    }
    function q(a) {
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
    var k = a("DB/DBManager"),
      g = a("DB/Emotions"),
      t = a("DB/Pets/PetMessageConst"),
      l = a("Network/NetworkManager"),
      f = a("Network/PacketStructure"),
      n = a("Core/Client"),
      p = a("Engine/SessionStorage"),
      v = a("Renderer/EntityManager"),
      u = a("UI/UIManager"),
      A = a("UI/Components/SlotMachine/SlotMachine"),
      D = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      B = a("UI/Components/ItemSelection/ItemSelection"),
      O = a("UI/Components/ChatBox/ChatBox"),
      C = a("UI/Components/PetInformations/PetInformations"),
      y = a("UI/Components/ItemObtain/ItemObtain");
    C.reqPetFeed = function () {
      u.showPromptBox(k.getMessage(601), "ok", "cancel", function () {
        var a = new f.CZ.COMMAND_PET();
        a.cSub = 1;
        l.sendPacket(a);
      });
    };
    C.reqPetAction = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 2;
      l.sendPacket(a);
    };
    C.reqBackToEgg = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 3;
      l.sendPacket(a);
      C.remove();
    };
    C.reqUnEquipPet = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 4;
      l.sendPacket(a);
    };
    C.reqNameEdit = function (a) {
      var b = new f.CZ.RENAME_PET();
      b.szName = a;
      l.sendPacket(b);
    };
    C.reqEvolution = function (a) {
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
      l.hookPacket(f.ZC.PET_ACT, r);
      l.hookPacket(f.ZC.PET_EVOLUTION_RESULT, q);
    };
  },
);
