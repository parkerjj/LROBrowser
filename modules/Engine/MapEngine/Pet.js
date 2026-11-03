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
          k.sendPacket(b);
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
            k.sendPacket(b);
          }
        }));
    }
    function e(a) {
      C.append();
      C.setInformations(a);
      if (q.petId) {
        var b = v.get(q.petId);
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
    function l(a) {
      if (a.cRet) {
        a = n.getPetFriendlyState(q.pet.friendly);
        var b = n.getPetHungryState(q.pet.oldHungry),
          c = n.getPetTalkNumber(q.pet.job, p.PM_FEEDING, b, q.Sex),
          b = n.getPetEmotion(b, a, p.PM_FEEDING);
        0 < b &&
          ((a = new f.CZ.PET_ACT()), (a.data = b + "2"), k.sendPacket(a));
        900 < q.pet.friendly &&
          ((a = new f.CZ.PET_ACT()), (a.data = c), k.sendPacket(a));
      } else
        H.addText(
          n
            .getMessage(591)
            .replace("%s", n.getItemInfo(a.ITID).identifiedDiSPlayName),
          H.TYPE.ERROR,
        );
    }
    function h(a) {
      var b = v.get(a.GID),
        c;
      if (b)
        switch (a.type) {
          case 0:
            q.petId = a.GID;
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
            a.data && (c = n.getPetEquipPath(a.data));
            !c &&
              b.files.body.spr &&
              (c = b.files.body.spr.replace(/\.spr$/i, ".act"));
            c &&
              m.loadFile(c, function () {
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
        else if ((b = n.getPetTalk(a.data)))
          ((a = v.get(a.GID)),
            H.addText(a.display.name + " : " + b, H.TYPE.PUBLIC),
            a.dialog.set(b));
    }
    function t(a) {
      switch (a.result) {
        case 0:
        case 1:
        case 2:
        case 3:
          z.setMsg("\u8fdb\u5316\u5931\u8d25");
          break;
        case 4:
          z.setMsg("\u8fdb\u5316\u6750\u6599\u4e0d\u8db3");
          break;
        case 5:
          z.setMsg(
            "\u4eb2\u5bc6\u5ea6\u4e3a\u975e\u5e38\u4eb2\u5bc6\u624d\u80fd\u8fdb\u5316",
          );
          break;
        case 6:
          z.setMsg("\u8fdb\u5316\u6210\u529f");
      }
    }
    var n = a("DB/DBManager"),
      g = a("DB/Emotions"),
      p = a("DB/Pets/PetMessageConst"),
      k = a("Network/NetworkManager"),
      f = a("Network/PacketStructure"),
      m = a("Core/Client"),
      q = a("Engine/SessionStorage"),
      v = a("Renderer/EntityManager"),
      u = a("UI/UIManager"),
      A = a("UI/Components/SlotMachine/SlotMachine"),
      D = a("UI/Components/SkillTargetSelection/SkillTargetSelection"),
      B = a("UI/Components/ItemSelection/ItemSelection"),
      H = a("UI/Components/ChatBox/ChatBox"),
      C = a("UI/Components/PetInformations/PetInformations"),
      z = a("UI/Components/ItemObtain/ItemObtain");
    C.reqPetFeed = function () {
      u.showPromptBox(n.getMessage(601), "ok", "cancel", function () {
        var a = new f.CZ.COMMAND_PET();
        a.cSub = 1;
        k.sendPacket(a);
      });
    };
    C.reqPetAction = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 2;
      k.sendPacket(a);
    };
    C.reqBackToEgg = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 3;
      k.sendPacket(a);
      C.remove();
    };
    C.reqUnEquipPet = function () {
      var a = new f.CZ.COMMAND_PET();
      a.cSub = 4;
      k.sendPacket(a);
    };
    C.reqNameEdit = function (a) {
      var b = new f.CZ.RENAME_PET();
      b.szName = a;
      k.sendPacket(b);
    };
    C.reqEvolution = function (a) {
      var b = new f.CZ.PET_EVOLUTION();
      b.eggID = a;
      k.sendPacket(b);
    };
    return function () {
      k.hookPacket(f.ZC.START_CAPTURE, b);
      k.hookPacket(f.ZC.TRYCAPTURE_MONSTER, c);
      k.hookPacket(f.ZC.PETEGG_LIST, d);
      k.hookPacket(f.ZC.PROPERTY_PET, e);
      k.hookPacket(f.ZC.FEED_PET, l);
      k.hookPacket(f.ZC.CHANGESTATE_PET, h);
      k.hookPacket(f.ZC.PET_ACT, r);
      k.hookPacket(f.ZC.PET_EVOLUTION_RESULT, t);
    };
  },
);
