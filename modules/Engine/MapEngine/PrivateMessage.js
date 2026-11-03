define(
  "Engine/MapEngine/PrivateMessage",
  "require DB/DBManager Engine/MapEngine/Friends Network/NetworkManager Network/PacketStructure UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = e.isFriend(a.sender) ? d.getMessage(102) : "From";
      t.addText(
        "[ " + b + " " + a.sender + " ] : " + a.msg.replace(/\|\d{2}/, ""),
        t.TYPE.PRIVATE,
      );
      t.saveNickName(a.sender);
    }
    function c(a) {
      var b = t.PrivateMessageStorage.nick,
        c = t.PrivateMessageStorage.msg;
      0 === a.result
        ? b && c && t.addText("[ To " + b + " ] : " + c, t.TYPE.PRIVATE)
        : t.addText(
            "(" + b + ") : " + d.getMessage(147 + a.result),
            t.TYPE.PRIVATE,
          );
      t.PrivateMessageStorage.nick = "";
      t.PrivateMessageStorage.msg = "";
    }
    var d = a("DB/DBManager"),
      e = a("Engine/MapEngine/Friends"),
      m = a("Network/NetworkManager"),
      h = a("Network/PacketStructure"),
      t = a("UI/Components/ChatBox/ChatBox");
    return function () {
      m.hookPacket(h.ZC.WHISPER, b);
      m.hookPacket(h.ZC.ACK_WHISPER, c);
      m.hookPacket(h.ZC.ACK_WHISPER2, c);
    };
  },
);
