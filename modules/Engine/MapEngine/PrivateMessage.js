define(
  "Engine/MapEngine/PrivateMessage",
  "require DB/DBManager Engine/MapEngine/Friends Network/NetworkManager Network/PacketStructure UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = e.isFriend(a.sender) ? d.getMessage(102) : "From";
      r.addText(
        "[ " + b + " " + a.sender + " ] : " + a.msg.replace(/\|\d{2}/, ""),
        r.TYPE.PRIVATE,
      );
      r.saveNickName(a.sender);
    }
    function c(a) {
      var b = r.PrivateMessageStorage.nick,
        c = r.PrivateMessageStorage.msg;
      0 === a.result
        ? b && c && r.addText("[ To " + b + " ] : " + c, r.TYPE.PRIVATE)
        : r.addText(
            "(" + b + ") : " + d.getMessage(147 + a.result),
            r.TYPE.PRIVATE,
          );
      r.PrivateMessageStorage.nick = "";
      r.PrivateMessageStorage.msg = "";
    }
    var d = a("DB/DBManager"),
      e = a("Engine/MapEngine/Friends"),
      m = a("Network/NetworkManager"),
      h = a("Network/PacketStructure"),
      r = a("UI/Components/ChatBox/ChatBox");
    return function () {
      m.hookPacket(h.ZC.WHISPER, b);
      m.hookPacket(h.ZC.ACK_WHISPER, c);
      m.hookPacket(h.ZC.ACK_WHISPER2, c);
    };
  },
);
