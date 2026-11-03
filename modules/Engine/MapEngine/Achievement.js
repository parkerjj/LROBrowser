define(
  "Engine/MapEngine/Achievement",
  "require DB/DBManager Engine/SessionStorage Network/NetworkManager Network/PacketStructure Renderer/EntityManager Renderer/EffectManager UI/UIManager UI/Components/Achievement/Achievement UI/Components/ItemObtain/ItemObtain UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      h.setAchList(a);
    }
    function c(a) {
      h.updateAch(a);
    }
    function d(a) {
      a.result
        ? (t.setMsg("\u5df2\u9886\u53d6\u6210\u5c31\u5956\u52b1"),
          r.addText("\u5df2\u9886\u53d6\u6210\u5c31\u5956\u52b1", r.TYPE.SELF))
        : (t.setMsg("\u9886\u53d6\u5931\u8d25"),
          r.addText("\u9886\u53d6\u5931\u8d25", r.TYPE.SELF));
    }
    a("DB/DBManager");
    a("Engine/SessionStorage");
    var e = a("Network/NetworkManager"),
      m = a("Network/PacketStructure");
    a("Renderer/EntityManager");
    a("Renderer/EffectManager");
    a("UI/UIManager");
    var h = a("UI/Components/Achievement/Achievement"),
      t = a("UI/Components/ItemObtain/ItemObtain"),
      r = a("UI/Components/ChatBox/ChatBox");
    return function () {
      e.hookPacket(m.ZC.ALL_ACH_LIST, b);
      e.hookPacket(m.ZC.ACH_UPDATE, c);
      e.hookPacket(m.ZC.REQ_ACH_REWARD_ACK, d);
    };
  },
);
