define(
  "Engine/MapEngine/Main",
  "require Utils/jquery DB/DBManager DB/Status/StatusProperty DB/Effects/EffectConst Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager Renderer/EffectManager Renderer/Renderer Renderer/Effects/Damage Preferences/Controls UI/UIManager UI/Components/ChatBox/ChatBox UI/Components/ChatRoom/ChatRoom UI/Components/BasicInfo/BasicInfo UI/Components/WinStats/WinStats UI/Components/Announce/Announce UI/Components/Equipment/Equipment UI/Components/SkillList/SkillList UI/Components/PartyFriends/PartyFriends UI/Components/OnPushCart/OnPushCart UI/Components/NpcStore/NpcStore UI/Components/Mercenary/MercenaryInformations UI/Components/MiniMap/MiniMap UI/Components/vbk/vbk UI/Components/Attendance/Attendance UI/Components/RefineUI/RefineUI UI/Components/CardConnection/CardConnection2 UI/Components/PartyBooking/PartyBooking UI/Components/StatusIcons/StatusIcons UI/Components/ItemObtain/ItemObtain UI/Components/ItemReform/ItemReform UI/Components/LaphineSynthesis/LaphineSynthesis UI/Components/LaphineUpgrade/LaphineUpgrade".split(
    " ",
  ),
  function (a) {
    function b(a) {
      ha.Entity.walkTo(
        a.MoveData[0],
        a.MoveData[1],
        a.MoveData[2],
        a.MoveData[3],
      );
    }
    function c(a) {
      var b = a.msg.split("\x3cmsg\x3e");
      if (3 == b.length && "" == b[0] && "" != b[1] && "" == b[2])
        return (va.setMsg(b[1]), !1);
      if (
        "\u60a8\u73b0\u5728\u4f7f\u7528\u7684\u662f:99MaxEathena v8.9.0" !=
          a.msg &&
        "\u9690\u5f62\u6a21\u5f0f: \u5f00\u542f" != a.msg &&
        "\u9690\u5f62\u6a21\u5f0f: \u5173\u95ed" != a.msg &&
        "\u62a4\u536b\u751f\u6210\u4e86" != a.msg
      )
        if ("[Rodex]\u90ae\u7bb1\u7a7a\u95f4\u5df2\u6ee1" == a.msg)
          (Y.addText("\u90ae\u7bb1\u7a7a\u95f4\u5df2\u6ee1", Y.TYPE.SELF),
            ha.Entity &&
              ha.Entity.dialog.set("\u90ae\u7bb1\u7a7a\u95f4\u5df2\u6ee1"));
        else {
          if (
            "\u5df2\u5173\u95ed\u81ea\u52a8\u6218\u6597" == a.msg ||
            "@autoattack \u6267\u884c\u5931\u8d25" == a.msg
          )
            Q.autoattack = !1;
          "[ \u79ef\u5206 ]" == a.msg
            ? xa.setType_(1)
            : "[ \u5546\u57ce ]" == a.msg
              ? xa.setType_(2)
              : a.msg == "[ " + ha.Entity.GID + "\u5145\u503c ]"
                ? ((a = navigator.userAgent.toLowerCase()),
                  /micromessenger/.test(a)
                    ? alert(
                        "\u62b1\u6b49\uff0c\u8bf7\u4f7f\u7528\u975e\u5fae\u4fe1\u6d4f\u89c8\u5668\u8fdb\u884c\u5145\u503c\u3002",
                      )
                    : (window.location.href =
                        "http://game.lastro.cn?r\x3dpay/index"))
                : ((b = a.msg.split(" ")),
                  3 == b.length && "\u9501\u5b9a\u5750\u6807" == b[0]
                    ? Ba.addDestination(b[1], b[2])
                    : ra.isOpen
                      ? ra.message(a.msg)
                      : (Y.addText(a.msg, Y.TYPE.PUBLIC | Y.TYPE.SELF),
                        ha.Entity && ha.Entity.dialog.set(a.msg)));
        }
    }
    function d(a) {
      Y.addText(ka.getMessage(a.msg).replace("%d", a.value), Y.TYPE.PUBLIC);
      ha.Entity &&
        ha.Entity.dialog.set(ka.getMessage(a.msg).replace("%d", a.value));
    }
    function e(a) {
      var b = qa.get(a.targetAID);
      b && b.dialog.set(a.msg);
    }
    function m(a) {
      if ((a = qa.get(a.targetAID))) a.onFocus();
    }
    function h(a) {
      ha.Entity.attack_range = a.currentAttRange;
    }
    function r(a) {
      aa.update("str", a.str);
      aa.update("agi", a.agi);
      aa.update("vit", a.vit);
      aa.update("int", a.Int);
      aa.update("dex", a.dex);
      aa.update("luk", a.luk);
      aa.update("str3", a.standardStr);
      aa.update("agi3", a.standardAgi);
      aa.update("vit3", a.standardVit);
      aa.update("int3", a.standardInt);
      aa.update("dex3", a.standardDex);
      aa.update("luk3", a.standardLuk);
      aa.update("aspd", (a.ASPD + a.plusASPD) / 4);
      aa.update("atak", 2 * a.attPower);
      aa.update("atak2", a.refiningPower);
      aa.update("matak", a.min_mattPower);
      aa.update("matak2", a.max_mattPower);
      aa.update("flee", a.avoidSuccessValue);
      aa.update("flee2", a.plusAvoidSuccessValue);
      aa.update("critical", a.criticalSuccessValue);
      aa.update("hit", a.hitSuccessValue);
      aa.update("def", a.itemdefPower);
      aa.update("def2", a.plusdefPower);
      aa.update("mdef", a.mdefPower);
      aa.update("mdef2", a.plusmdefPower);
      aa.update("statuspoint", a.point);
    }
    function q(a) {
      if (a.result)
        switch (a.statusID) {
          case ga.STR:
            aa.update("str", a.value);
            break;
          case ga.AGI:
            aa.update("agi", a.value);
            break;
          case ga.VIT:
            aa.update("vit", a.value);
            break;
          case ga.INT:
            aa.update("int", a.value);
            break;
          case ga.DEX:
            aa.update("dex", a.value);
            break;
          case ga.LUK:
            aa.update("luk", a.value);
        }
    }
    function k(a) {
      var b = 0,
        c,
        d = [];
      c = a.hasOwnProperty("varID")
        ? a.varID
        : a.hasOwnProperty("statusType")
          ? a.statusType
          : a.hasOwnProperty("statusID")
            ? a.statusID
            : a.hasOwnProperty("type")
              ? a.type
              : a.hasOwnProperty("curCount") &
                  a.hasOwnProperty("maxCount") &
                  a.hasOwnProperty("curWeight") &
                  a.hasOwnProperty("maxWeight")
                ? na
                : -1;
      a.hasOwnProperty("amount")
        ? (b = a.amount)
        : a.hasOwnProperty("count")
          ? (b = a.count)
          : a.hasOwnProperty("value")
            ? (b = a.value)
            : a.hasOwnProperty("curCount") &
                a.hasOwnProperty("maxCount") &
                a.hasOwnProperty("curWeight") &
                a.hasOwnProperty("maxWeight") &&
              ((d[0] = a.curCount),
              (d[1] = a.maxCount),
              (d[2] = a.curWeight),
              (d[3] = a.maxWeight));
      switch (c) {
        case ga.SPEED:
          ha.Entity.walk.speed = b;
          break;
        case ga.EXP:
          W.base_exp = b;
          W.base_exp_next && W.update("bexp", W.base_exp, W.base_exp_next);
          break;
        case ga.JOBEXP:
          W.job_exp = b;
          W.job_exp_next && W.update("jexp", W.job_exp, W.job_exp_next);
          break;
        case ga.HP:
          ha.Entity.life.hp = b;
          ha.Entity.life.update();
          -1 < ha.Entity.life.hp_max &&
            (W.update("hp", ha.Entity.life.hp, ha.Entity.life.hp_max),
            ha.hasParty &&
              ia.updateMemberLife(
                ha.AID,
                ha.Entity.life.canvas,
                ha.Entity.life.hp,
                ha.Entity.life.hp_max,
              ));
          break;
        case ga.MAXHP:
          ha.Entity.life.hp_max = b;
          ha.Entity.life.update();
          -1 < ha.Entity.life.hp &&
            (W.update("hp", ha.Entity.life.hp, ha.Entity.life.hp_max),
            ha.hasParty &&
              ia.updateMemberLife(
                ha.AID,
                ha.Entity.life.canvas,
                ha.Entity.life.hp,
                ha.Entity.life.hp_max,
              ));
          break;
        case ga.SP:
          ha.Entity.life.sp = b;
          ha.Entity.life.update();
          -1 < ha.Entity.life.sp_max &&
            W.update("sp", ha.Entity.life.sp, ha.Entity.life.sp_max);
          break;
        case ga.MAXSP:
          ha.Entity.life.sp_max = b;
          ha.Entity.life.update();
          -1 < ha.Entity.life.sp &&
            W.update("sp", ha.Entity.life.sp, ha.Entity.life.sp_max);
          break;
        case ga.POINT:
          aa.update("statuspoint", b);
          break;
        case ga.CLEVEL:
          ha.Entity.clevel = b;
          W.update("blvl", b);
          ma.onLevelUp();
          break;
        case ga.SKPOINT:
          ja.setPoints(b);
          break;
        case ga.STR:
          aa.update("str", a.defaultStatus);
          aa.update("str2", a.plusStatus);
          break;
        case ga.AGI:
          aa.update("agi", a.defaultStatus);
          aa.update("agi2", a.plusStatus);
          break;
        case ga.VIT:
          aa.update("vit", a.defaultStatus);
          aa.update("vit2", a.plusStatus);
          break;
        case ga.INT:
          aa.update("int", a.defaultStatus);
          aa.update("int2", a.plusStatus);
          break;
        case ga.DEX:
          aa.update("dex", a.defaultStatus);
          aa.update("dex2", a.plusStatus);
          break;
        case ga.LUK:
          aa.update("luk", a.defaultStatus);
          aa.update("luk2", a.plusStatus);
          break;
        case ga.MONEY:
          W.update("zeny", b);
          break;
        case ga.MAXEXP:
          W.base_exp_next = b;
          -1 < W.base_exp && W.update("bexp", W.base_exp, W.base_exp_next);
          break;
        case ga.MAXJOBEXP:
          W.job_exp_next = b;
          -1 < W.job_exp && W.update("jexp", W.job_exp, W.job_exp_next);
          break;
        case ga.WEIGHT:
          W.weight = b;
          -1 < W.weight_max && W.update("weight", W.weight, W.weight_max);
          break;
        case ga.MAXWEIGHT:
          W.weight_max = b;
          -1 < W.weight && W.update("weight", W.weight, W.weight_max);
          break;
        case ga.STANDARD_STR:
          aa.update("str3", b);
          break;
        case ga.STANDARD_AGI:
          aa.update("agi3", b);
          break;
        case ga.STANDARD_VIT:
          aa.update("vit3", b);
          break;
        case ga.STANDARD_INT:
          aa.update("int3", b);
          break;
        case ga.STANDARD_DEX:
          aa.update("dex3", b);
          break;
        case ga.STANDARD_LUK:
          aa.update("luk3", b);
          break;
        case ga.ATTPOWER:
          aa.update("atak", 2 * b);
          break;
        case ga.REFININGPOWER:
          aa.update("atak2", b);
          break;
        case ga.MIN_MATTPOWER:
          aa.update("matak", b);
          break;
        case ga.MAX_MATTPOWER:
          aa.update("matak2", b);
          break;
        case ga.ITEMDEFPOWER:
          aa.update("def", b);
          break;
        case ga.PLUSDEFPOWER:
          aa.update("def2", b);
          break;
        case ga.MDEFPOWER:
          aa.update("mdef", b);
          break;
        case ga.PLUSMDEFPOWER:
          aa.update("mdef2", b);
          break;
        case ga.HITSUCCESSVALUE:
          aa.update("hit", b);
          break;
        case ga.AVOIDSUCCESSVALUE:
          aa.update("flee", b);
          break;
        case ga.PLUSAVOIDSUCCESSVALUE:
          aa.update("flee2", b);
          break;
        case ga.CRITICALSUCCESSVALUE:
          aa.update("critical", b);
          break;
        case ga.ASPD:
          aa.update("aspd", b);
          break;
        case ga.JOBLEVEL:
          W.update("jlvl", b);
          ja.onLevelUp();
          break;
        case na:
          na.update(d);
          break;
        case ga.BPOWER:
          Ja.update2(2e3, 1, 0, b);
      }
    }
    function g(a) {
      var b = 0,
        c,
        d;
      d = qa.get(ha.mercGID);
      c = a.hasOwnProperty("varID")
        ? a.varID
        : a.hasOwnProperty("param")
          ? a.param
          : a.hasOwnProperty("statusType")
            ? a.statusType
            : a.hasOwnProperty("statusID")
              ? a.statusID
              : a.hasOwnProperty("curCount") &
                  a.hasOwnProperty("maxCount") &
                  a.hasOwnProperty("curWeight") &
                  a.hasOwnProperty("maxWeight")
                ? na
                : -1;
      a.hasOwnProperty("amount")
        ? (b = a.amount)
        : a.hasOwnProperty("count")
          ? (b = a.count)
          : a.hasOwnProperty("value")
            ? (b = a.value)
            : (a.hasOwnProperty("curCount"),
              a.hasOwnProperty("maxCount"),
              a.hasOwnProperty("curWeight"),
              a.hasOwnProperty("maxWeight"));
      switch (c) {
        case ga.HP:
          d && ((d.life.hp = b), d.life.update());
          ua.update("hp", b);
          break;
        case ga.MAXHP:
          d && ((d.life.hp_max = b), d.life.update());
          ua.update("maxhp", b);
          break;
        case ga.SP:
          d && ((d.life.sp = b), d.life.update());
          ua.update("sp", b);
          break;
        case ga.MAXSP:
          d && ((d.life.sp_max = b), d.life.update());
          ua.update("maxsp", b);
          break;
        case ga.ATTPOWER:
          ua.update("atak", b);
          break;
        case ga.MAX_MATTPOWER:
          ua.update("matak", b);
          break;
        case ga.ITEMDEFPOWER:
          ua.update("def", b);
          break;
        case ga.MDEFPOWER:
          ua.update("mdef", b);
          break;
        case ga.HITSUCCESSVALUE:
          ua.update("hit", b);
          break;
        case ga.CRITICALSUCCESSVALUE:
          ua.update("critical", b);
          break;
        case ga.ASPD:
          ua.update("aspd", b);
          break;
        case ga.BASICAVOIDANCE:
          ua.update("flee", b);
          break;
        case ga.MER_KILLCOUNT:
          ua.update("killNum", b);
          break;
        case ga.MER_FAITH:
          ua.update("faith", b);
      }
    }
    function t(a) {
      var b;
      a.fontColor
        ? (b =
            "rgb(" +
            [
              (a.fontColor & 16711680) >> 16,
              (a.fontColor & 65280) >> 8,
              a.fontColor & 255,
            ].join() +
            ")")
        : a.msg.match(/^blue/)
          ? ((b = "#00FFFF"), (a.msg = a.msg.substr(4)))
          : a.msg.match(/^ssss/)
            ? ((b = "#FFFF00"), (a.msg = a.msg.substr(4)))
            : (b = "#FFFF00");
      Y.addText2(a.msg, Y.TYPE.ANNOUNCE, b);
      sa.append();
      a = a.msg.replace(/<[^>]*>/g, "");
      sa.set(a, b);
    }
    function l(a) {
      var b = ka.getItemInfo(a.itemID);
      a =
        0 < a.status
          ? "[" +
            a.name +
            "]\u7cbe\u70bc\u6210\u529f\uff0c\u83b7\u5f97[+" +
            a.refine_level +
            " " +
            b.identifiedDiSPlayName +
            "]"
          : "[" +
            a.name +
            "]\u7cbe\u70bc[+" +
            a.refine_level +
            " " +
            b.identifiedDiSPlayName +
            "]\u5931\u8d25";
      Y.addText2(a, Y.TYPE.ANNOUNCE, "#FFFF00");
      sa.append();
      a = a.replace(/<[^>]*>/g, "");
      sa.set(a, "#FFFF00");
    }
    function f(a) {
      Y.addText(ka.getMessage(178).replace("%d", a.count), Y.TYPE.INFO);
    }
    function n(a) {
      switch (a.Config) {
        case 0:
          (ma.setEquipConfig(a.Value),
            Y.addText(ka.getMessage(1358 + (a.Value ? 1 : 0)), Y.TYPE.INFO));
      }
    }
    function p(a) {
      switch (a.errorCode) {
        case 0:
          ha.Entity.onAddClickCount();
          Y.addText(ka.getMessage(242), Y.TYPE.ERROR);
          break;
        case 1:
          ha.Entity.onAddClickCount();
          Y.addText(ka.getMessage(243), Y.TYPE.ERROR);
          break;
        case 2:
          ha.Entity.onAddClickCount();
          Y.addText(ka.getMessage(244), Y.TYPE.ERROR);
          break;
        case 3:
          (ha.Entity.onAddClickCount(),
            Y.addText(ka.getMessage(245), Y.TYPE.BLUE));
      }
    }
    function v(a) {
      Y.addText(ka.getMessage(a.msg), Y.TYPE.PUBLIC);
    }
    function u(a) {
      switch (a.varID) {
        case ga.HP:
          ba.add(a.amount, ha.Entity, w.tick, null, ba.TYPE.HEAL);
          var b = { effectId: la.EF_HPTIME, ownerAID: ha.Entity.GID };
          pa.spam(b);
          ha.Entity.life.hp += a.amount;
          ha.Entity.life.update();
          -1 < ha.Entity.life.hp_max &&
            W.update("hp", ha.Entity.life.hp, ha.Entity.life.hp_max);
          break;
        case ga.SP:
          (ba.add(a.amount, ha.Entity, w.tick, null, ba.TYPE.HEAL | ba.TYPE.SP),
            (b = { effectId: la.EF_SPTIME, ownerAID: ha.Entity.GID }),
            pa.spam(b),
            (ha.Entity.life.sp += a.amount),
            ha.Entity.life.update(),
            -1 < ha.Entity.life.sp_max &&
              W.update("sp", ha.Entity.life.sp, ha.Entity.life.sp_max));
      }
    }
    function A(a) {
      na.addItem(oa.extend({}, a));
    }
    function D(a) {
      na.removeItem(a.index, a.count);
    }
    function B(a) {
      var b = "";
      switch (a.Type) {
        case 0:
          b = "\u953b\u9020\u6392\u540d";
          break;
        case 1:
          b = "\u914d\u836f\u6392\u540d";
          break;
        case 2:
          b = "\u8dc6\u62f3\u9053\u6392\u540d";
          break;
        case 3:
          b = "PVP\u6392\u540d";
      }
      Y.addText("------------" + b + "------------", Y.TYPE.SELF);
      for (b = 0; 10 > b; b++)
        Y.addText(
          "[ " + b + " ] " + a.Name[b] + " : " + a.Point[b] + " \u70b9",
          Y.TYPE.SELF,
        );
      Y.addText("-----------------------------------", Y.TYPE.SELF);
      Y.addText("MyPoint   " + a.myPoint + " \u70b9", Y.TYPE.SELF);
      Y.addText("-----------------------------------", Y.TYPE.SELF);
    }
    function O(a) {
      Y.addText(
        "\u592a\u62f3\u4efb\u52a1\uff1a\u51fb\u6740" +
          a.mapName +
          " (" +
          a.star +
          "/" +
          a.result +
          ")",
        Y.TYPE.SELF,
      );
    }
    function C(a) {
      if (0 == a.DestroyDate && a.EnterTimeOutDate) {
        var b, c, d, e, f;
        b = new Date(1e3 * a.EnterTimeOutDate);
        b.getFullYear();
        c =
          (10 > b.getMonth() + 1
            ? "0" + (b.getMonth() + 1)
            : b.getMonth() + 1) + "\u6708";
        d = b.getDate() + "\u65e5";
        e = b.getHours() + "\u65f6";
        f = b.getMinutes() + "\u5206";
        b = b.getSeconds() + "\u79d2";
        Y.addText(
          "[" +
            a.MemorialDungeonName +
            "] \u526f\u672c\u8d85\u8fc7 " +
            c +
            d +
            e +
            f +
            b +
            " \u5185\u672a\u8fdb\u5165\u7684\u8bdd\uff0c\u526f\u672c\u5c06\u88ab\u5220\u9664",
          Y.TYPE.SELF,
        );
      }
      a.DestroyDate &&
        a.EnterTimeOutDate &&
        ((b = new Date(1e3 * a.DestroyDate)),
        b.getFullYear(),
        (c =
          (10 > b.getMonth() + 1
            ? "0" + (b.getMonth() + 1)
            : b.getMonth() + 1) + "\u6708"),
        (d = b.getDate() + "\u65e5"),
        (e = b.getHours() + "\u65f6"),
        (f = b.getMinutes() + "\u5206"),
        (b = b.getSeconds() + "\u79d2"),
        Y.addText(
          "[" +
            a.MemorialDungeonName +
            "] \u526f\u672c\u9650\u5236\u65f6\u95f4\u4e3a " +
            c +
            d +
            e +
            f +
            b,
          Y.TYPE.SELF,
        ));
    }
    function y(a) {
      for (
        var b = ha.AID.toString().slice(-4),
          c = a.pincode,
          d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          e = 1;
        10 > e;
        e++
      ) {
        var f,
          c = 4 + 2 * c;
        f = c % (e + 1);
        e != f && ((d[e] ^= d[f]), (d[f] ^= d[e]), (d[e] ^= d[f]));
      }
      c = b.toString().split("");
      b = "";
      for (e = 0; e < c.length; e++)
        for (f = 0; f < d.length; f++) c[e] == d[f] && (b += f);
      d = new Z.CZ.CHECK_BIN();
      d.AID = a.AID;
      d.pinCode = b;
      X.sendPacket(d);
    }
    function z(a) {
      Aa.setloadInfo(a);
    }
    function J(a) {
      Aa.setReloadInfo(a);
    }
    function I(a) {
      Aa.setTarget(a);
    }
    function L(a) {
      if (a.op) {
        Y.addText(
          "\u79bb\u7ebf\u65f6\u957f\uff1a" + x(a.time, a.endtime),
          Y.TYPE.SELF,
        );
        var b;
        switch (a.feedback) {
          case 1:
            b =
              "\u80cc\u5305\u4e2d\u627e\u4e0d\u5230\u9b54\u7269\u9972\u6599\uff0c\u907f\u514d\u5ba0\u7269\u4e22\u5931\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 2:
            b =
              "\u89d2\u8272\u5df2\u6b7b\u4ea1\uff0c\u907f\u514d\u5361\u53f7\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 3:
            b =
              "\u5728\u5371\u53ca\u60c5\u51b5\u65f6\uff0c\u65e0\u6cd5\u4f7f\u7528\u77ac\u95f4\u79fb\u52a8\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 4:
            b =
              "\u8840\u91cf\u5c11\u4e8e\u6307\u5b9a\u503c\uff0c\u5f3a\u5236\u4e0b\u7ebf\u3002";
            break;
          case 5:
            b =
              "\u8840\u91cf\u6216\u6c14\u91cf\u8fc7\u4f4e\uff0c\u65e0\u6cd5\u4f7f\u7528\u77ac\u95f4\u79fb\u52a8\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 6:
            b =
              "\u8d1f\u91cd\u8d85\u8fc790%\u65f6\uff0c\u65e0\u6cd5\u653b\u51fb\u548c\u4f7f\u7528\u6280\u80fd\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 7:
            b =
              "\u627e\u4e0d\u5230\u7bad\u77e2\u548c\u7bad\u77e2\u6876\uff0c\u65e0\u6cd5\u6b63\u5e38\u653b\u51fb\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 8:
            b =
              "\u65e0\u6cd5\u77ac\u79fb\uff0c\u53d6\u6d88\u8ddf\u968f\u72b6\u6001\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 9:
            b =
              "\u627e\u4e0d\u5230\u8ddf\u968f\u76ee\u6807\uff0c\u53d6\u6d88\u8ddf\u968f\u72b6\u6001\u5e76\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 10:
            b =
              "\u89d2\u8272\u5df2\u6b7b\u4ea1\uff0c\u65e0\u6cd5\u8ddf\u968f\u76ee\u6807\u5e76\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 11:
            b =
              "\u8ddf\u968f\u72b6\u6001\u4e2d\uff0c\u8840\u91cf\u8fc7\u4f4e\u4fdd\u62a4\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 12:
            b =
              "\u8d1f\u91cd\u8d85\u8fc750%\uff0cSP\u4e0d\u8db3\uff0c\u65e0\u6cd5\u4f7f\u7528\u4e3b\u52a8\u6280\u80fd\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 13:
            b =
              "\u627e\u4e0d\u5230\u6280\u80fd\u6240\u9700\u7684\u50ac\u5316\u5242\uff0c\u65e0\u6cd5\u4f7f\u7528\u4e3b\u52a8\u6280\u80fd\uff0c\u81ea\u52a8\u4e0b\u7ebf\u3002";
            break;
          case 14:
            b = "\u81ea\u52a8\u6218\u6597\u65f6\u95f4\u7ed3\u675f";
            break;
          default:
            b = "\u6b63\u5e38";
        }
        Y.addText("\u79bb\u7ebf\u53cd\u9988\uff1a" + b, Y.TYPE.SELF);
        a.baselv &&
          Y.addText(
            "\u7b49\u7ea7\u63d0\u5347\uff1a" + a.baselv + "\u7ea7",
            Y.TYPE.SELF,
          );
        a.joblv &&
          Y.addText(
            "\u804c\u4e1a\u7b49\u7ea7\u63d0\u5347\uff1a" + a.joblv + "\u7ea7",
            Y.TYPE.SELF,
          );
        a.zeny &&
          Y.addText(
            "\u83b7\u5f97\u6e38\u620f\u5e01\uff1a" + a.zeny + "Zeny",
            Y.TYPE.SELF,
          );
        a.cash && Y.addText("\u83b7\u5f97C\u70b9\uff1a" + a.cash, Y.TYPE.SELF);
        a.equipCount &&
          Y.addText(
            "\u83b7\u5f97\u88c5\u5907\uff1ax" + a.equipCount,
            Y.TYPE.SELF,
          );
        a.cardCount &&
          Y.addText(
            "\u83b7\u5f97\u5361\u7247\uff1ax" + a.cardCount,
            Y.TYPE.SELF,
          );
        a.bpower &&
          Y.addText("\u83b7\u5f97\u7535\u91cf\uff1a" + a.bpower, Y.TYPE.SELF);
        a.brepower &&
          Y.addText("\u6d88\u8017\u7535\u91cf\uff1a" + a.brepower, Y.TYPE.SELF);
      }
    }
    function x(a, b) {
      b || (b = new Date().getTime() / 1e3);
      var c = "";
      b = 1e3 * b - 1e3 * a;
      a = Math.floor(b / 864e5);
      var d = b % 864e5;
      b = Math.floor(d / 36e5);
      var e = d % 36e5,
        d = Math.floor(e / 6e4),
        e = Math.round((e % 6e4) / 1e3);
      0 < a && (c = c + a + "\u5929");
      0 < b && (c = c + b + "\u5c0f\u65f6");
      0 < d && (c = c + d + "\u5206\u949f");
      0 < e && (c = c + e + "\u79d2");
      return c;
    }
    function M(a) {
      switch (a.ui_type) {
        case 7:
          wa.setData(a.data);
      }
    }
    function E(a) {
      wa.getreward(a.data);
    }
    function F(a) {
      ya.append();
      ya.toggle();
    }
    function G(a) {
      ya.setData(a);
    }
    function H(a) {
      switch (a.response) {
        case 2:
          va.setMsg(
            "\u80cc\u5305\u4e2d\u627e\u4e0d\u5230\u4f20\u9001\u5377\u8f74\u6216\u4f1a\u5458\u5361",
          );
          Y.addText(
            "\u80cc\u5305\u4e2d\u627e\u4e0d\u5230\u4f20\u9001\u5377\u8f74\u6216\u4f1a\u5458\u5361",
            Y.TYPE.SELF,
          );
          break;
        case 3:
          va.setMsg(
            "\u8be5\u5730\u56fe\u4e0d\u652f\u6301\u4f20\u9001\u529f\u80fd",
          );
          Y.addText(
            "\u8be5\u5730\u56fe\u4e0d\u652f\u6301\u4f20\u9001\u529f\u80fd",
            Y.TYPE.SELF,
          );
          break;
        case 4:
          (va.setMsg("\u672a\u77e5\u5730\u56fe"),
            Y.addText("\u672a\u77e5\u5730\u56fe", Y.TYPE.SELF));
      }
    }
    function K(a) {
      za.rechargeList(a);
    }
    function P(a) {
      za.updateList(a);
    }
    function N(a) {
      za.setActivate(a);
    }
    function S(a) {
      za.setEnable(a);
    }
    function R(a) {
      za.removeCard(a);
    }
    function ea(a) {
      W.setGoldPccafe(a);
    }
    function U(a) {
      a = new Z.CZ.CONTACTNPC();
      a.NAID = ha.goldpcid;
      a.type = 1;
      X.sendPacket(a);
    }
    function V(a) {
      Ha.append();
      Ha.setData(a.ITID);
    }
    function ca(a) {
      Ha.remove();
    }
    function T(a) {
      Ca.append();
      Ca.setData(a.ITID);
    }
    function fa(a) {
      switch (a.result) {
        case 0:
          a = new Z.CZ.RANDOM_COMBINE_ITEM_UI_CLOSE();
          X.sendPacket(a);
          Ca.remove();
          break;
        case 5:
          va.setMsg("\u6750\u6599\u6570\u91cf\u4e0d\u8db3");
          break;
        case 7:
          va.setMsg("\u6750\u6599\u4e0d\u7b26\u5408");
      }
    }
    function da(a) {
      Fa.append();
      Fa.setData(a.ITID);
    }
    function ta(a) {
      a = new Z.CZ.RANDOM_UPGRADE_ITEM_UI_CLOSE();
      X.sendPacket(a);
      Fa.remove();
    }
    var ka = a("DB/DBManager"),
      oa = a("Utils/jquery"),
      ga = a("DB/Status/StatusProperty"),
      la = a("DB/Effects/EffectConst"),
      ha = a("Engine/SessionStorage"),
      X = a("Network/NetworkManager"),
      Z = a("Network/PacketStructure"),
      qa = a("Renderer/EntityManager"),
      pa = a("Renderer/EffectManager"),
      w = a("Renderer/Renderer"),
      ba = a("Renderer/Effects/Damage"),
      Q = a("Preferences/Controls");
    a("UI/UIManager");
    var Y = a("UI/Components/ChatBox/ChatBox"),
      ra = a("UI/Components/ChatRoom/ChatRoom"),
      W = a("UI/Components/BasicInfo/BasicInfo"),
      aa = a("UI/Components/WinStats/WinStats"),
      sa = a("UI/Components/Announce/Announce"),
      ma = a("UI/Components/Equipment/Equipment"),
      ja = a("UI/Components/SkillList/SkillList"),
      ia = a("UI/Components/PartyFriends/PartyFriends"),
      na = a("UI/Components/OnPushCart/OnPushCart"),
      xa = a("UI/Components/NpcStore/NpcStore"),
      ua = a("UI/Components/Mercenary/MercenaryInformations"),
      Ba = a("UI/Components/MiniMap/MiniMap"),
      Aa = a("UI/Components/vbk/vbk"),
      wa = a("UI/Components/Attendance/Attendance"),
      ya = a("UI/Components/RefineUI/RefineUI"),
      za = a("UI/Components/CardConnection/CardConnection2");
    a("UI/Components/PartyBooking/PartyBooking");
    var Ja = a("UI/Components/StatusIcons/StatusIcons"),
      va = a("UI/Components/ItemObtain/ItemObtain"),
      Ha = a("UI/Components/ItemReform/ItemReform"),
      Ca = a("UI/Components/LaphineSynthesis/LaphineSynthesis"),
      Fa = a("UI/Components/LaphineUpgrade/LaphineUpgrade");
    return function () {
      X.hookPacket(Z.ZC.ACK_RANKING, B);
      X.hookPacket(Z.ZC.STARSKILL, O);
      X.hookPacket(Z.ZC.ADD_ITEM_TO_CART, A);
      X.hookPacket(Z.ZC.ADD_ITEM_TO_CART2, A);
      X.hookPacket(Z.ZC.ADD_ITEM_TO_CART3, A);
      X.hookPacket(Z.ZC.ADD_ITEM_TO_CART4, A);
      X.hookPacket(Z.ZC.DELETE_ITEM_FROM_CART, D);
      X.hookPacket(Z.ZC.NOTIFY_PLAYERMOVE, b);
      X.hookPacket(Z.ZC.PAR_CHANGE, k);
      X.hookPacket(Z.ZC.LONGPAR_CHANGE, k);
      X.hookPacket(Z.ZC.STATUS_CHANGE, k);
      X.hookPacket(Z.ZC.MER_PAR_CHANGE, g);
      X.hookPacket(Z.ZC.NOTIFY_CARTITEM_COUNTINFO, k);
      X.hookPacket(Z.ZC.COUPLESTATUS, k);
      X.hookPacket(Z.ZC.UPDATE_EXP, k);
      X.hookPacket(Z.ZC.NOTIFY_EXP, k);
      X.hookPacket(Z.ZC.STATUS, r);
      X.hookPacket(Z.ZC.STATUS_CHANGE_ACK, q);
      X.hookPacket(Z.ZC.ATTACK_RANGE, h);
      X.hookPacket(Z.ZC.BROADCAST, t);
      X.hookPacket(Z.ZC.BROADCAST2, t);
      X.hookPacket(Z.ZC.BROADCAST_ITEMREFINING_RESULT, l);
      X.hookPacket(Z.ZC.USER_COUNT, f);
      X.hookPacket(Z.ZC.NOTIFY_PLAYERCHAT, c);
      X.hookPacket(Z.ZC.MSG_VALUE, d);
      X.hookPacket(Z.ZC.SHOWSCRIPT, e);
      X.hookPacket(Z.ZC.ATTACK_FAILURE_FOR_DISTANCE, m);
      X.hookPacket(Z.ZC.CONFIG, n);
      X.hookPacket(Z.ZC.ACTION_FAILURE, p);
      X.hookPacket(Z.ZC.MSG, v);
      X.hookPacket(Z.ZC.MSG_COLOR, v);
      X.hookPacket(Z.ZC.RECOVERY, u);
      X.hookPacket(Z.ZC.RECOVERY2, u);
      X.hookPacket(Z.ZC.MEMORIALDUNGEON_INFO, C);
      X.hookPacket(Z.ZC.SECOND_CHECK, y);
      X.hookPacket(Z.ZC.NOTIFY_LOADINFO, z);
      X.hookPacket(Z.ZC.NOTIFY_OFFLINEMSG, L);
      X.hookPacket(Z.ZC.NOTIFY_RELOADINFOS, J);
      X.hookPacket(Z.ZC.NOTIFY_SETTARGET, I);
      X.hookPacket(Z.ZC.UI_OPEN, M);
      X.hookPacket(Z.ZC.NOTIFY_ATTENDANCE, E);
      X.hookPacket(Z.ZC.REFINE_OPEN_WINDOW, F);
      X.hookPacket(Z.ZC.REFINE_ADD_ITEM, G);
      X.hookPacket(Z.ZC.PRIVATE_AIRSHIP_RESPONSE, H);
      X.hookPacket(Z.ZC.CARDCONNECTION_RECHARGE_LIST, K);
      X.hookPacket(Z.ZC.CARDCONNECTION_RECHARGE_UPDATE, P);
      X.hookPacket(Z.ZC.CARDCONNECTION_ACTIVATE_UPDATE, N);
      X.hookPacket(Z.ZC.CARDCONNECTION_ENABLE_UPDATE, S);
      X.hookPacket(Z.ZC.CARDCONNECTION_CANCEL_UPDATE, R);
      X.hookPacket(Z.ZC.GOLDPCCAFE_POINT, ea);
      X.hookPacket(Z.ZC.DYNAMICNPC_CREATE_RESULT, U);
      X.hookPacket(Z.ZC.OPEN_REFORM_UI, V);
      X.hookPacket(Z.ZC.ITEM_REFORM_ACK, ca);
      X.hookPacket(Z.ZC.RANDOM_COMBINE_ITEM_UI_OPEN, T);
      X.hookPacket(Z.ZC.ACK_RANDOM_COMBINE_ITEM, fa);
      X.hookPacket(Z.ZC.RANDOM_UPGRADE_ITEM_UI_OPEN, da);
      X.hookPacket(Z.ZC.ACK_RANDOM_UPGRADE_ITEM, ta);
    };
  },
);
