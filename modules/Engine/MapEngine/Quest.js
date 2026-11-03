define(
  "Engine/MapEngine/Quest",
  "require DB/DBManager UI/Components/ChatBox/ChatBox Network/NetworkManager Network/PacketStructure Engine/SessionStorage UI/Components/Quest/Quest".split(
    " ",
  ),
  function (a) {
    function b(a) {
      0 >= a.questCount || (r.setList(a), t.updateQList());
    }
    function c(a) {
      r.addList({
        active: a.active,
        count: a.count,
        hunt: a.hunt,
        questID: a.questID,
        quest_endTime: a.quest_endTime,
        quest_svrTime: a.quest_svrTime,
      });
      t.updateQList();
    }
    function d(a) {
      r.delQuest(a.questID);
      t.updateQList();
    }
    function e(a) {
      if (0 == a.count) return !1;
      for (var b = 0; b < a.count; b++) r.updateQuest(a.MobHuntList[b]);
      t.updateQList();
    }
    a("DB/DBManager");
    a("UI/Components/ChatBox/ChatBox");
    var l = a("Network/NetworkManager"),
      h = a("Network/PacketStructure");
    a("Engine/SessionStorage");
    var r = a("UI/Components/Quest/Quest"),
      t = a("UI/Components/miniQuest/miniQuest");
    r.requestChangeQuestState = function (a, b) {
      var c = new h.CZ.ACTIVE_QUEST();
      c.questID = a;
      c.active = b;
      l.sendPacket(c);
    };
    return function () {
      l.hookPacket(h.ZC.ALL_QUEST_LIST_V3, b);
      l.hookPacket(h.ZC.ADD_QUEST, c);
      l.hookPacket(h.ZC.ADD_QUEST_EX, c);
      l.hookPacket(h.ZC.DEL_QUEST, d);
      l.hookPacket(h.ZC.UPDATE_MISSION_HUNT, e);
      l.hookPacket(h.ZC.UPDATE_MISSION_HUNT_EX, e);
    };
  },
);
