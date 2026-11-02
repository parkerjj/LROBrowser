define(
  "Engine/MapEngine/PrivateMessage",
  "require DB/DBManager Engine/MapEngine/Friends Network/NetworkManager Network/PacketStructure UI/Components/ChatBox/ChatBox".split(
    " ",
  ),
  function (a) {
    function b(a) {
      var b = e.isFriend(a.sender) ? d.getMessage(102) : "From";
      q.addText(
        "[ " + b + " " + a.sender + " ] : " + a.msg.replace(/\|\d{2}/, ""),
        q.TYPE.PRIVATE,
      );
      q.saveNickName(a.sender);
    }
    function c(a) {
      var b = q.PrivateMessageStorage.nick,
        c = q.PrivateMessageStorage.msg;
      0 === a.result
        ? b && c && q.addText("[ To " + b + " ] : " + c, q.TYPE.PRIVATE)
        : q.addText(
            "(" + b + ") : " + d.getMessage(147 + a.result),
            q.TYPE.PRIVATE,
          );
      q.PrivateMessageStorage.nick = "";
      q.PrivateMessageStorage.msg = "";
    }
    var d = a("DB/DBManager"),
      e = a("Engine/MapEngine/Friends"),
      m = a("Network/NetworkManager"),
      h = a("Network/PacketStructure"),
      q = a("UI/Components/ChatBox/ChatBox");
    return function () {
      m.hookPacket(h.ZC.WHISPER, b);
      m.hookPacket(h.ZC.ACK_WHISPER, c);
      m.hookPacket(h.ZC.ACK_WHISPER2, c);
    };
  },
);
