define("Network/PacketStructure", [
  "Utils/BinaryWriter",
  "./PacketVerManager",
], function (a, b) {
  var c = {
    CA: {},
    AC: {},
    CH: {},
    HC: {},
    CZ: {},
    ZC: {},
    CS: {},
    SC: {},
    ZH: {},
    AHC: {},
    CAH: {},
  };
  c.CA.LOGIN = function () {
    this.Version = 0;
    this.Passwd = this.ID = "";
    this.clienttype = 0;
  };
  c.CA.LOGIN.prototype.build = function () {
    var d = new a(55);
    d.writeShort(100);
    d.writeULong(this.Version);
    d.writeString(this.ID, 24);
    d.writeString(this.Passwd, 24);
    d.writeUChar(this.clienttype);
    return d;
  };
  c.CH.ENTER = function () {
    this.Sex = this.clientType = this.userLevel = this.AuthCode = this.AID = 0;
  };
  c.CH.ENTER.prototype.build = function () {
    var d = new a(17);
    d.writeShort(101);
    d.writeULong(this.AID);
    d.writeULong(this.AuthCode);
    d.writeULong(this.userLevel);
    d.writeUShort(this.clientType);
    d.writeUChar(this.Sex);
    return d;
  };
  c.CH.SELECT_CHAR = function () {
    this.CharNum = 0;
  };
  c.CH.SELECT_CHAR.prototype.build = function () {
    var d = new a(3);
    d.writeShort(102);
    d.writeUChar(this.CharNum);
    return d;
  };
  c.CH.MAKE_CHAR = function () {
    this.name = "";
    this.head =
      this.headPal =
      this.CharNum =
      this.Luk =
      this.Dex =
      this.Int =
      this.Vit =
      this.Agi =
      this.Str =
        0;
  };
  c.CH.MAKE_CHAR.prototype.build = function () {
    var d = new a(37);
    d.writeShort(103);
    d.writeString(this.name, 24);
    d.writeUChar(this.Str);
    d.writeUChar(this.Agi);
    d.writeUChar(this.Vit);
    d.writeUChar(this.Int);
    d.writeUChar(this.Dex);
    d.writeUChar(this.Luk);
    d.writeUChar(this.CharNum);
    d.writeShort(this.headPal);
    d.writeShort(this.head);
    return d;
  };
  c.CH.DELETE_CHAR = function () {
    this.GID = 0;
    this.key = "";
  };
  c.CH.DELETE_CHAR.prototype.build = function () {
    var d = new a(46);
    d.writeShort(104);
    d.writeULong(this.GID);
    d.writeString(this.key, 40);
    return d;
  };
  c.CZ.ENTER = function () {
    this.Sex = this.clientTime = this.AuthCode = this.GID = this.AID = 0;
  };
  c.CZ.ENTER.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.AID, !0);
    b.view.setUint32(d[4], this.GID, !0);
    b.view.setUint32(d[5], this.AuthCode, !0);
    b.view.setUint32(d[6], this.ClientTime, !0);
    b.view.setUint8(d[7], this.Sex, !0);
    return b;
  };
  c.CZ.NOTIFY_ACTORINIT = function () {};
  c.CZ.NOTIFY_ACTORINIT.prototype.build = function () {
    var d = new a(2);
    d.writeShort(125);
    return d;
  };
  c.CZ.REQUEST_CARDCONNECTION_RECHARGE = function () {
    this.cardid = this.level = this.tab = 0;
  };
  c.CZ.REQUEST_CARDCONNECTION_RECHARGE.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2775);
    d.writeUChar(this.tab);
    d.writeUChar(this.level);
    d.writeULong(this.cardid);
    return d;
  };
  c.CZ.REQUEST_CARDCONNECTION_ADDMYDECK = function () {
    this.cardid = this.level = this.tab = 0;
  };
  c.CZ.REQUEST_CARDCONNECTION_ADDMYDECK.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2785);
    d.writeUChar(this.tab);
    d.writeUChar(this.level);
    d.writeULong(this.cardid);
    return d;
  };
  c.CZ.REQUEST_CARDCONNECTION_CANCEL = function () {
    this.cardid = this.level = this.tab = 0;
  };
  c.CZ.REQUEST_CARDCONNECTION_CANCEL.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2787);
    d.writeUChar(this.tab);
    d.writeUChar(this.level);
    d.writeULong(this.cardid);
    return d;
  };
  c.CZ.REQUEST_CARDCONNECTION_ACTIVATE = function () {
    this.level = this.tab = 0;
  };
  c.CZ.REQUEST_CARDCONNECTION_ACTIVATE.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2777);
    d.writeUChar(this.tab);
    d.writeUChar(this.level);
    return d;
  };
  c.CZ.REQUEST_CARDCONNECTION_ENABLE = function () {
    this.level = this.tab = 0;
  };
  c.CZ.REQUEST_CARDCONNECTION_ENABLE.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2779);
    d.writeUChar(this.tab);
    d.writeUChar(this.level);
    return d;
  };
  c.CZ.NOTIFY_LOADINFO = function () {};
  c.CZ.NOTIFY_LOADINFO.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2815);
    return d;
  };
  c.CZ.NOTIFY_UPDATEINFO = function () {
    this.value = this.id = 0;
  };
  c.CZ.NOTIFY_UPDATEINFO.prototype.build = function () {
    var d = new a(7);
    d.writeShort(2814);
    d.writeUChar(this.id);
    d.writeLong(this.value);
    return d;
  };
  c.CZ.NOTIFY_ONLYTARGET = function () {
    this.value = this.id = 0;
  };
  c.CZ.NOTIFY_ONLYTARGET.prototype.build = function () {
    var d = new a(7);
    d.writeShort(2813);
    d.writeLong(this.id);
    d.writeUChar(this.value);
    return d;
  };
  c.CZ.CHECK_BIN = function () {
    this.pinCode = this.AID = 0;
  };
  c.CZ.CHECK_BIN.prototype.build = function () {
    var d = new a(10);
    d.writeShort(2810);
    d.writeULong(this.AID);
    d.writeBinaryString(this.pinCode, 4);
    return d;
  };
  c.CZ.REQUEST_TIME = function () {
    this.clientTime = 0;
  };
  c.CZ.REQUEST_TIME.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.clientTime, !0);
    return b;
  };
  c.CZ.REQUEST_QUIT = function () {};
  c.CZ.REQUEST_QUIT.prototype.build = function () {
    var d = new a(2);
    d.writeShort(130);
    return d;
  };
  c.CZ.REQUEST_MOVE = function () {
    this.dest = [0, 0];
  };
  c.CZ.REQUEST_MOVE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setPos(d[3], this.dest, !0);
    return b;
  };
  c.CZ.REQUEST_ACT = function () {
    this.action = this.targetGID = 0;
  };
  c.CZ.REQUEST_ACT.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.targetGID, !0);
    b.view.setUint8(d[4], this.action, !0);
    return b;
  };
  c.CZ.REQUEST_CHAT = function () {
    this.msg = "";
  };
  c.CZ.REQUEST_CHAT.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = 4 + this.msg.length + 1,
      c = new a(b);
    c.writeShort(d[1]);
    c.writeShort(b);
    c.writeString(this.msg);
    return c;
  };
  c.CZ.CONTACTNPC = function () {
    this.type = this.NAID = 0;
  };
  c.CZ.CONTACTNPC.prototype.build = function () {
    var d = new a(7);
    d.writeShort(144);
    d.writeULong(this.NAID);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.REQNAME = function () {
    this.AID = 0;
  };
  c.CZ.REQNAME.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.AID, !0);
    return b;
  };
  c.CZ.WHISPER = function () {
    this.msg = this.receiver = "";
  };
  c.CZ.WHISPER.prototype.build = function () {
    var d = 28 + this.msg.length + 1,
      b = new a(d);
    b.writeShort(150);
    b.writeShort(d);
    b.writeString(this.receiver, 24);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.BROADCAST = function () {
    this.msg = "";
  };
  c.CZ.BROADCAST.prototype.build = function () {
    var d = 4 + this.msg.length + 1,
      b = new a(d);
    b.writeShort(153);
    b.writeShort(d);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.CHANGE_DIRECTION = function () {
    this.dir = this.headDir = 0;
  };
  c.CZ.CHANGE_DIRECTION.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.headDir, !0);
    b.view.setUint8(d[4], [4, 3, 2, 1, 0, 7, 6, 5][(this.dir + 8) % 8], !0);
    return b;
  };
  c.CZ.ITEM_PICKUP = function () {
    this.ITAID = 0;
  };
  c.CZ.ITEM_PICKUP.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.ITAID, !0);
    return b;
  };
  c.CZ.ITEM_THROW = function () {
    this.count = this.Index = 0;
  };
  c.CZ.ITEM_THROW.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint16(d[3], this.Index, !0);
    b.view.setInt16(d[4], this.count, !0);
    return b;
  };
  c.CZ.USE_ITEM = function () {
    this.AID = this.index = 0;
  };
  c.CZ.USE_ITEM.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint16(d[3], this.index, !0);
    b.view.setUint32(d[4], this.AID, !0);
    return b;
  };
  c.CZ.REQ_WEAR_EQUIP = function () {
    this.wearLocation = this.index = 0;
  };
  c.CZ.REQ_WEAR_EQUIP.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint16(d[3], this.index, !0);
    b.view.setUint32(d[4], this.wearLocation, !0);
    return b;
  };
  c.CZ.REQ_TAKEOFF_EQUIP = function () {
    this.index = 0;
  };
  c.CZ.REQ_TAKEOFF_EQUIP.prototype.build = function () {
    var d = new a(4);
    d.writeShort(171);
    d.writeUShort(this.index);
    return d;
  };
  c.CZ.RESTART = function () {
    this.type = 0;
  };
  c.CZ.RESTART.prototype.build = function () {
    var d = new a(3);
    d.writeShort(178);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.CHOOSE_MENU = function () {
    this.num = this.NAID = 0;
  };
  c.CZ.CHOOSE_MENU.prototype.build = function () {
    var d = new a(7);
    d.writeShort(184);
    d.writeULong(this.NAID);
    d.writeUChar(this.num);
    return d;
  };
  c.CZ.REQ_NEXT_SCRIPT = function () {
    this.NAID = 0;
  };
  c.CZ.REQ_NEXT_SCRIPT.prototype.build = function () {
    var d = new a(6);
    d.writeShort(185);
    d.writeULong(this.NAID);
    return d;
  };
  c.CZ.REQ_STATUS = function () {};
  c.CZ.REQ_STATUS.prototype.build = function () {
    var d = new a(2);
    d.writeShort(186);
    return d;
  };
  c.CZ.STATUS_CHANGE = function () {
    this.changeAmount = this.statusID = 0;
  };
  c.CZ.STATUS_CHANGE.prototype.build = function () {
    var d = new a(5);
    d.writeShort(187);
    d.writeUShort(this.statusID);
    d.writeUChar(this.changeAmount);
    return d;
  };
  c.CZ.REQ_EMOTION = function () {
    this.type = 0;
  };
  c.CZ.REQ_EMOTION.prototype.build = function () {
    var d = new a(3);
    d.writeShort(191);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.REQ_USER_COUNT = function () {};
  c.CZ.REQ_USER_COUNT.prototype.build = function () {
    var d = new a(2);
    d.writeShort(193);
    return d;
  };
  c.CZ.ACK_SELECT_DEALTYPE = function () {
    this.type = this.NAID = 0;
  };
  c.CZ.ACK_SELECT_DEALTYPE.prototype.build = function () {
    var d = new a(7);
    d.writeShort(197);
    d.writeULong(this.NAID);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.PC_PURCHASE_ITEMLIST = function () {
    this.itemList = [];
  };
  c.CZ.PC_PURCHASE_ITEMLIST.prototype.build = function () {
    if (20180704 <= b.value) {
      var d = 4 + 6 * this.itemList.length,
        c = new a(d);
      c.writeShort(200);
      c.writeShort(d);
      var m,
        d = 0;
      for (m = this.itemList.length; d < m; ++d)
        (c.writeShort(this.itemList[d].count),
          c.writeULong(this.itemList[d].ITID));
    } else
      for (
        d = 4 + 4 * this.itemList.length,
          c = new a(d),
          c.writeShort(200),
          c.writeShort(d),
          d = 0,
          m = this.itemList.length;
        d < m;
        ++d
      )
        (c.writeShort(this.itemList[d].count),
          c.writeUShort(this.itemList[d].ITID));
    return c;
  };
  c.CZ.PC_SELL_ITEMLIST = function () {
    this.itemList = [];
  };
  c.CZ.PC_SELL_ITEMLIST.prototype.build = function () {
    var d = 4 + 4 * this.itemList.length,
      b = new a(d);
    b.writeShort(201);
    b.writeShort(d);
    var c,
      d = 0;
    for (c = this.itemList.length; d < c; ++d)
      (b.writeShort(this.itemList[d].index),
        b.writeShort(this.itemList[d].count));
    return b;
  };
  c.CZ.DISCONNECT_CHARACTER = function () {
    this.AID = 0;
  };
  c.CZ.DISCONNECT_CHARACTER.prototype.build = function () {
    var d = new a(6);
    d.writeShort(204);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.DISCONNECT_ALL_CHARACTER = function () {};
  c.CZ.DISCONNECT_ALL_CHARACTER.prototype.build = function () {
    var d = new a(2);
    d.writeShort(206);
    return d;
  };
  c.CZ.SETTING_WHISPER_PC = function () {
    this.name = "";
    this.type = 0;
  };
  c.CZ.SETTING_WHISPER_PC.prototype.build = function () {
    var d = new a(27);
    d.writeShort(207);
    d.writeString(this.name, 24);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.SETTING_WHISPER_STATE = function () {
    this.type = 0;
  };
  c.CZ.SETTING_WHISPER_STATE.prototype.build = function () {
    var d = new a(3);
    d.writeShort(208);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.REQ_WHISPER_LIST = function () {};
  c.CZ.REQ_WHISPER_LIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(211);
    return d;
  };
  c.CZ.CREATE_CHATROOM = function () {
    this.type = this.size = 0;
    this.title = this.passwd = "";
  };
  c.CZ.CREATE_CHATROOM.prototype.build = function () {
    var d = 15 + this.title.length,
      b = new a(d);
    b.writeShort(213);
    b.writeShort(d);
    b.writeShort(this.size);
    b.writeUChar(this.type);
    b.writeString(this.passwd, 8);
    b.writeString(this.title);
    return b;
  };
  c.CZ.REQ_ENTER_ROOM = function () {
    this.roomID = 0;
    this.passwd = "";
  };
  c.CZ.REQ_ENTER_ROOM.prototype.build = function () {
    var d = new a(14);
    d.writeShort(217);
    d.writeULong(this.roomID);
    d.writeString(this.passwd, 8);
    return d;
  };
  c.CZ.CHANGE_CHATROOM = function () {
    this.type = this.size = 0;
    this.title = this.passwd = "";
  };
  c.CZ.CHANGE_CHATROOM.prototype.build = function () {
    var d = 15 + this.title.length,
      b = new a(d);
    b.writeShort(222);
    b.writeShort(d);
    b.writeShort(this.size);
    b.writeUChar(this.type);
    b.writeString(this.passwd, 8);
    b.writeString(this.title);
    return b;
  };
  c.CZ.REQ_ROLE_CHANGE = function () {
    this.role = 0;
    this.name = "";
  };
  c.CZ.REQ_ROLE_CHANGE.prototype.build = function () {
    var d = new a(30);
    d.writeShort(224);
    d.writeULong(this.role);
    d.writeString(this.name, 24);
    return d;
  };
  c.CZ.REQ_EXPEL_MEMBER = function () {
    this.name = "";
  };
  c.CZ.REQ_EXPEL_MEMBER.prototype.build = function () {
    var d = new a(26);
    d.writeShort(226);
    d.writeString(this.name, 24);
    return d;
  };
  c.CZ.EXIT_ROOM = function () {};
  c.CZ.EXIT_ROOM.prototype.build = function () {
    var d = new a(2);
    d.writeShort(227);
    return d;
  };
  c.CZ.REQ_EXCHANGE_ITEM = function () {
    this.AID = 0;
  };
  c.CZ.REQ_EXCHANGE_ITEM.prototype.build = function () {
    var d = new a(6);
    d.writeShort(228);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.ACK_EXCHANGE_ITEM = function () {
    this.result = 0;
  };
  c.CZ.ACK_EXCHANGE_ITEM.prototype.build = function () {
    var d = new a(3);
    d.writeShort(230);
    d.writeUChar(this.result);
    return d;
  };
  c.CZ.ADD_EXCHANGE_ITEM = function () {
    this.count = this.index = 0;
  };
  c.CZ.ADD_EXCHANGE_ITEM.prototype.build = function () {
    var d = new a(8);
    d.writeShort(232);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.CONCLUDE_EXCHANGE_ITEM = function () {};
  c.CZ.CONCLUDE_EXCHANGE_ITEM.prototype.build = function () {
    var d = new a(2);
    d.writeShort(235);
    return d;
  };
  c.CZ.CANCEL_EXCHANGE_ITEM = function () {};
  c.CZ.CANCEL_EXCHANGE_ITEM.prototype.build = function () {
    var d = new a(2);
    d.writeShort(237);
    return d;
  };
  c.CZ.EXEC_EXCHANGE_ITEM = function () {};
  c.CZ.EXEC_EXCHANGE_ITEM.prototype.build = function () {
    var d = new a(2);
    d.writeShort(239);
    return d;
  };
  c.CZ.MOVE_ITEM_FROM_BODY_TO_STORE = function () {
    this.count = this.index = 0;
  };
  c.CZ.MOVE_ITEM_FROM_BODY_TO_STORE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.index, !0);
    b.view.setInt32(d[4], this.count, !0);
    return b;
  };
  c.CZ.MOVE_ITEM_FROM_STORE_TO_BODY = function () {
    this.count = this.index = 0;
  };
  c.CZ.MOVE_ITEM_FROM_STORE_TO_BODY.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.index, !0);
    b.view.setInt32(d[4], this.count, !0);
    return b;
  };
  c.CZ.CLOSE_STORE = function () {};
  c.CZ.CLOSE_STORE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    return b;
  };
  c.CZ.MAKE_GROUP = function () {
    this.groupName = "";
  };
  c.CZ.MAKE_GROUP.prototype.build = function () {
    var d = new a(26);
    d.writeShort(249);
    d.writeString(this.groupName, 24);
    return d;
  };
  c.CZ.REQ_JOIN_GROUP = function () {
    this.AID = 0;
    this.CharName = "";
  };
  c.CZ.REQ_JOIN_GROUP.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    26 === d[2]
      ? b.view.setString(d[3], this.CharName, 24)
      : b.view.setInt32(d[3], this.AID, !0);
    return b;
  };
  c.CZ.JOIN_GROUP = function () {
    this.answer = this.GRID = 0;
  };
  c.CZ.JOIN_GROUP.prototype.build = function () {
    var d = new a(10);
    d.writeShort(255);
    d.writeULong(this.GRID);
    d.writeLong(this.answer);
    return d;
  };
  c.CZ.REQ_LEAVE_GROUP = function () {};
  c.CZ.REQ_LEAVE_GROUP.prototype.build = function () {
    var d = new a(2);
    d.writeShort(256);
    return d;
  };
  c.CZ.CHANGE_GROUPEXPOPTION = function () {
    this.expOption = 0;
  };
  c.CZ.CHANGE_GROUPEXPOPTION.prototype.build = function () {
    var d = new a(6);
    d.writeShort(258);
    d.writeULong(this.expOption);
    return d;
  };
  c.CZ.REQ_EXPEL_GROUP_MEMBER = function () {
    this.AID = 0;
    this.characterName = "";
  };
  c.CZ.REQ_EXPEL_GROUP_MEMBER.prototype.build = function () {
    var d = new a(30);
    d.writeShort(259);
    d.writeULong(this.AID);
    d.writeString(this.characterName, 24);
    return d;
  };
  c.CZ.REQUEST_CHAT_PARTY = function () {
    this.msg = "";
  };
  c.CZ.REQUEST_CHAT_PARTY.prototype.build = function () {
    var d = 4 + this.msg.length + 1,
      b = new a(d);
    b.writeShort(264);
    b.writeShort(d);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.UPGRADE_SKILLLEVEL = function () {
    this.SKID = 0;
  };
  c.CZ.UPGRADE_SKILLLEVEL.prototype.build = function () {
    var d = new a(4);
    d.writeShort(274);
    d.writeUShort(this.SKID);
    return d;
  };
  c.CZ.USE_SKILL = function () {
    this.targetID = this.SKID = this.selectedLevel = 0;
  };
  c.CZ.USE_SKILL.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.selectedLevel, !0);
    b.view.setUint16(d[4], this.SKID, !0);
    b.view.setUint32(d[5], this.targetID, !0);
    return b;
  };
  c.CZ.USE_SKILL_START = function () {
    this.targetID = this.selectedLevel = this.SKID = 0;
  };
  c.CZ.USE_SKILL_START.prototype.build = function () {
    var d = new a(10);
    d.writeShort(2832);
    d.writeShort(this.SKID);
    d.writeShort(this.selectedLevel);
    d.writeULong(this.targetID);
    return d;
  };
  c.CZ.USE_SKILL_END = function () {
    this.SKID = 0;
  };
  c.CZ.USE_SKILL_END.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2833);
    d.writeShort(this.SKID);
    return d;
  };
  c.CZ.NPC_BARTER_MARKET_CLOSE = function () {};
  c.CZ.NPC_BARTER_MARKET_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2834);
    return d;
  };
  c.CZ.NPC_MARKET_CLOSE = function () {};
  c.CZ.NPC_MARKET_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2520);
    return d;
  };
  c.CZ.NPC_EXPANDED_BARTER_MARKET_PURCHASE = function () {
    this.itemList = [];
  };
  c.CZ.NPC_EXPANDED_BARTER_MARKET_PURCHASE.prototype.build = function () {
    var d = 4 + 12 * this.itemList.length,
      b = new a(d);
    b.writeShort(2903);
    b.writeShort(d);
    var c,
      d = 0;
    for (c = this.itemList.length; d < c; ++d)
      (b.writeLong(this.itemList[d].ITID),
        b.writeLong(this.itemList[d].shopIndex),
        b.writeLong(this.itemList[d].amount));
    return b;
  };
  c.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE = function () {};
  c.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2904);
    return d;
  };
  c.CZ.NPC_BARTER_MARKET_PURCHASE = function () {
    this.itemList = [];
  };
  c.CZ.NPC_BARTER_MARKET_PURCHASE.prototype.build = function () {
    var d = 4 + 14 * this.itemList.length,
      b = new a(d);
    b.writeShort(2831);
    b.writeShort(d);
    var c,
      d = 0;
    for (c = this.itemList.length; d < c; ++d)
      (b.writeLong(this.itemList[d].ITID),
        b.writeLong(this.itemList[d].amount),
        b.writeShort(this.itemList[d].invIndex),
        b.writeLong(this.itemList[d].shopIndex));
    return b;
  };
  c.CZ.CLOSE_REFORM_UI = function () {};
  c.CZ.CLOSE_REFORM_UI.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2960);
    return d;
  };
  c.CZ.ITEM_REFORM = function () {
    this.index = this.ITID = 0;
  };
  c.CZ.ITEM_REFORM.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2961);
    d.writeLong(this.ITID);
    d.writeUShort(this.index);
    return d;
  };
  c.CZ.NPC_MARKET_PURCHASE = function () {
    this.itemList = [];
  };
  c.CZ.NPC_MARKET_PURCHASE.prototype.build = function () {
    var d = 4 + 8 * this.itemList.length,
      b = new a(d);
    b.writeShort(2518);
    b.writeShort(d);
    var c,
      d = 0;
    for (c = this.itemList.length; d < c; ++d)
      (b.writeLong(this.itemList[d].ITID),
        b.writeLong(this.itemList[d].amount));
    return b;
  };
  c.CZ.USE_SKILL_TOGROUND = function () {
    this.yPos = this.xPos = this.SKID = this.selectedLevel = 0;
  };
  c.CZ.USE_SKILL_TOGROUND.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.selectedLevel, !0);
    b.view.setInt16(d[4], this.SKID, !0);
    b.view.setInt16(d[5], this.xPos, !0);
    b.view.setInt16(d[6], this.yPos, !0);
    return b;
  };
  c.CZ.CANCEL_LOCKON = function () {};
  c.CZ.CANCEL_LOCKON.prototype.build = function () {
    var d = new a(2);
    d.writeShort(280);
    return d;
  };
  c.CZ.SELECT_WARPPOINT = function () {
    this.SKID = 0;
    this.mapName = "";
  };
  c.CZ.SELECT_WARPPOINT.prototype.build = function () {
    var d = new a(20);
    d.writeShort(283);
    d.writeUShort(this.SKID);
    d.writeString(this.mapName, 16);
    return d;
  };
  c.CZ.REMEMBER_WARPPOINT = function () {};
  c.CZ.REMEMBER_WARPPOINT.prototype.build = function () {
    var d = new a(2);
    d.writeShort(285);
    return d;
  };
  c.CZ.MOVE_ITEM_FROM_BODY_TO_CART = function () {
    this.count = this.index = 0;
  };
  c.CZ.MOVE_ITEM_FROM_BODY_TO_CART.prototype.build = function () {
    var d = new a(8);
    d.writeShort(294);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.MOVE_ITEM_FROM_CART_TO_BODY = function () {
    this.count = this.index = 0;
  };
  c.CZ.MOVE_ITEM_FROM_CART_TO_BODY.prototype.build = function () {
    var d = new a(8);
    d.writeShort(295);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.MOVE_ITEM_FROM_STORE_TO_CART = function () {
    this.count = this.index = 0;
  };
  c.CZ.MOVE_ITEM_FROM_STORE_TO_CART.prototype.build = function () {
    var d = new a(8);
    d.writeShort(296);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.MOVE_ITEM_FROM_CART_TO_STORE = function () {
    this.count = this.index = 0;
  };
  c.CZ.MOVE_ITEM_FROM_CART_TO_STORE.prototype.build = function () {
    var d = new a(8);
    d.writeShort(297);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.REQ_CARTOFF = function () {};
  c.CZ.REQ_CARTOFF.prototype.build = function () {
    var d = new a(2);
    d.writeShort(298);
    return d;
  };
  c.CZ.REQ_CLOSESTORE = function () {};
  c.CZ.REQ_CLOSESTORE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(302);
    return d;
  };
  c.CZ.REQ_OPENSTORE = function () {
    this.storeName = "";
    this.storeList = [];
  };
  c.CZ.REQ_OPENSTORE.prototype.build = function () {
    var d, b;
    d = 84 + 8 * this.storeList.length;
    var c = new a(d);
    c.writeShort(303);
    c.writeShort(d);
    c.writeString(this.storeName, 80);
    d = 0;
    for (b = this.storeList.length; d < b; ++d)
      (c.writeShort(this.storeList[d].index),
        c.writeShort(this.storeList[d].count),
        c.writeLong(this.storeList[d].Price));
    return c;
  };
  c.CZ.REQ_BUY_FROMMC = function () {
    this.AID = 0;
  };
  c.CZ.REQ_BUY_FROMMC.prototype.build = function () {
    var d = new a(6);
    d.writeShort(304);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.PC_PURCHASE_ITEMLIST_FROMMC = function () {
    this.AID = 0;
    this.itemList = [];
  };
  c.CZ.PC_PURCHASE_ITEMLIST_FROMMC.prototype.build = function () {
    var d, b;
    d = 8 + 4 * this.itemList.length;
    var c = new a(d);
    c.writeShort(308);
    c.writeShort(d);
    c.writeULong(this.AID);
    d = 0;
    for (b = this.itemList.length; d < b; ++d)
      (c.writeShort(this.itemList[d].count),
        c.writeShort(this.itemList[d].index));
    return c;
  };
  c.CZ.PKMODE_CHANGE = function () {
    this.isTurnOn = 0;
  };
  c.CZ.PKMODE_CHANGE.prototype.build = function () {
    var d = new a(3);
    d.writeShort(312);
    d.writeUChar(this.isTurnOn);
    return d;
  };
  c.CZ.ITEM_CREATE = function () {
    this.itemName = "";
  };
  c.CZ.ITEM_CREATE.prototype.build = function () {
    var d = new a(26);
    d.writeShort(319);
    d.writeString(this.itemName, 24);
    return d;
  };
  c.CZ.MOVETO_MAP = function () {
    this.mapName = "";
    this.yPos = this.xPos = 0;
  };
  c.CZ.MOVETO_MAP.prototype.build = function () {
    var d = new a(22);
    d.writeShort(320);
    d.writeBinaryString(this.mapName, 16);
    d.writeShort(this.xPos);
    d.writeShort(this.yPos);
    return d;
  };
  c.CZ.INPUT_EDITDLG = function () {
    this.value = this.NAID = 0;
  };
  c.CZ.INPUT_EDITDLG.prototype.build = function () {
    var d = new a(10);
    d.writeShort(323);
    d.writeULong(this.NAID);
    d.writeULong(this.value);
    return d;
  };
  c.CZ.CLOSE_DIALOG = function () {
    this.NAID = 0;
  };
  c.CZ.CLOSE_DIALOG.prototype.build = function () {
    var d = new a(6);
    d.writeShort(326);
    d.writeULong(this.NAID);
    return d;
  };
  c.CZ.REQ_GIVE_MANNER_POINT = function () {
    this.point = this.type = this.otherAID = 0;
  };
  c.CZ.REQ_GIVE_MANNER_POINT.prototype.build = function () {
    var d = new a(9);
    d.writeShort(329);
    d.writeULong(this.otherAID);
    d.writeUChar(this.type);
    d.writeShort(this.point);
    return d;
  };
  c.CZ.REQ_GUILD_MENUINTERFACE = function () {};
  c.CZ.REQ_GUILD_MENUINTERFACE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(333);
    return d;
  };
  c.CZ.REQ_GUILD_MENU = function () {
    this.Type = 0;
  };
  c.CZ.REQ_GUILD_MENU.prototype.build = function () {
    var d = new a(6);
    d.writeShort(335);
    d.writeLong(this.Type);
    return d;
  };
  c.CZ.REQ_GUILD_EMBLEM_IMG = function () {
    this.GDID = 0;
  };
  c.CZ.REQ_GUILD_EMBLEM_IMG.prototype.build = function () {
    var d = new a(6);
    d.writeShort(337);
    d.writeLong(this.GDID);
    return d;
  };
  c.CZ.REGISTER_GUILD_EMBLEM_IMG = function () {
    this.img;
  };
  c.CZ.REGISTER_GUILD_EMBLEM_IMG.prototype.build = function () {
    var d = 4 + this.img.byteLength,
      b = new a(d);
    b.writeShort(339);
    b.writeShort(d);
    b.writeBuffer(this.img);
    window.buffer = b.buffer;
    return b;
  };
  c.CZ.REQ_CHANGE_MEMBERPOS = function () {
    this.memberInfo = [];
  };
  c.CZ.REQ_CHANGE_MEMBERPOS.prototype.build = function () {
    var d, b;
    d = 4 + 12 * this.memberInfo.length;
    var c = new a(d);
    c.writeShort(341);
    c.writeShort(d);
    d = 0;
    for (b = this.memberInfo.length; d < b; ++d)
      (c.writeLong(this.memberInfo[d].AID),
        c.writeLong(this.memberInfo[d].GID),
        c.writeLong(this.memberInfo[d].positionID));
    return c;
  };
  c.CZ.REQ_OPEN_MEMBER_INFO = function () {
    this.AID = 0;
  };
  c.CZ.REQ_OPEN_MEMBER_INFO.prototype.build = function () {
    var d = new a(6);
    d.writeShort(343);
    d.writeLong(this.AID);
    return d;
  };
  c.CZ.REQ_LEAVE_GUILD = function () {
    this.GID = this.AID = this.GDID = 0;
    this.reasonDesc = "";
  };
  c.CZ.REQ_LEAVE_GUILD.prototype.build = function () {
    var d = new a(54);
    d.writeShort(345);
    d.writeULong(this.GDID);
    d.writeLong(this.AID);
    d.writeLong(this.GID);
    d.writeString(this.reasonDesc, 40);
    return d;
  };
  c.CZ.REQ_BAN_GUILD = function () {
    this.GID = this.AID = this.GDID = 0;
    this.reasonDesc = "";
  };
  c.CZ.REQ_BAN_GUILD.prototype.build = function () {
    var d = new a(54);
    d.writeShort(347);
    d.writeULong(this.GDID);
    d.writeLong(this.AID);
    d.writeLong(this.GID);
    d.writeString(this.reasonDesc, 40);
    return d;
  };
  c.CZ.REQ_DISORGANIZE_GUILD = function () {
    this.key = "";
  };
  c.CZ.REQ_DISORGANIZE_GUILD.prototype.build = function () {
    var d = new a(42);
    d.writeShort(349);
    d.writeString(this.key, 40);
    return d;
  };
  c.CZ.REG_CHANGE_GUILD_POSITIONINFO = function () {
    this.memberList = [];
  };
  c.CZ.REG_CHANGE_GUILD_POSITIONINFO.prototype.build = function () {
    var d, b;
    d = 4 + 40 * this.memberList.length;
    var c = new a(d);
    c.writeShort(353);
    c.writeShort(d);
    d = 0;
    for (b = this.memberList.length; d < b; ++d)
      (c.writeLong(this.memberList[d].positionID),
        c.writeLong(this.memberList[d].right),
        c.writeLong(this.memberList[d].ranking),
        c.writeLong(this.memberList[d].payRate),
        c.writeString(this.memberList[d].posName, 24));
    return c;
  };
  c.CZ.REQ_MAKE_GUILD = function () {
    this.GID = 0;
    this.GName = "";
  };
  c.CZ.REQ_MAKE_GUILD.prototype.build = function () {
    var d = new a(30);
    d.writeShort(357);
    d.writeULong(this.GID);
    d.writeString(this.GName, 24);
    return d;
  };
  c.CZ.REQ_JOIN_GUILD = function () {
    this.MyGID = this.MyAID = this.AID = 0;
  };
  c.CZ.REQ_JOIN_GUILD.prototype.build = function () {
    var d = new a(14);
    d.writeShort(360);
    d.writeULong(this.AID);
    d.writeULong(this.MyAID);
    d.writeULong(this.MyGID);
    return d;
  };
  c.CZ.JOIN_GUILD = function () {
    this.answer = this.GDID = 0;
  };
  c.CZ.JOIN_GUILD.prototype.build = function () {
    var d = new a(10);
    d.writeShort(363);
    d.writeULong(this.GDID);
    d.writeLong(this.answer);
    return d;
  };
  c.CZ.GUILD_NOTICE = function () {
    this.GDID = 0;
    this.notice = this.subject = "";
  };
  c.CZ.GUILD_NOTICE.prototype.build = function () {
    var d = new a(186);
    d.writeShort(366);
    d.writeULong(this.GDID);
    d.writeString(this.subject, 60);
    d.writeString(this.notice, 120);
    return d;
  };
  c.CZ.REQ_ALLY_GUILD = function () {
    this.MyGID = this.MyAID = this.AID = 0;
  };
  c.CZ.REQ_ALLY_GUILD.prototype.build = function () {
    var d = new a(14);
    d.writeShort(368);
    d.writeULong(this.AID);
    d.writeULong(this.MyAID);
    d.writeULong(this.MyGID);
    return d;
  };
  c.CZ.ALLY_GUILD = function () {
    this.answer = this.otherAID = 0;
  };
  c.CZ.ALLY_GUILD.prototype.build = function () {
    var d = new a(10);
    d.writeShort(370);
    d.writeULong(this.otherAID);
    d.writeLong(this.answer);
    return d;
  };
  c.CZ.REQ_GUILD_MEMBER_INFO = function () {
    this.GID = 0;
  };
  c.CZ.REQ_GUILD_MEMBER_INFO.prototype.build = function () {
    var d = new a(6);
    d.writeShort(373);
    d.writeLong(this.GID);
    return d;
  };
  c.CZ.REQ_ITEMIDENTIFY = function () {
    this.index = 0;
  };
  c.CZ.REQ_ITEMIDENTIFY.prototype.build = function () {
    var d = new a(4);
    d.writeShort(376);
    d.writeShort(this.index);
    return d;
  };
  c.CZ.REQ_ITEMCOMPOSITION_LIST = function () {
    this.cardIndex = 0;
  };
  c.CZ.REQ_ITEMCOMPOSITION_LIST.prototype.build = function () {
    var d = new a(4);
    d.writeShort(378);
    d.writeShort(this.cardIndex);
    return d;
  };
  c.CZ.REQ_ITEMCOMPOSITION = function () {
    this.equipIndex = this.cardIndex = 0;
  };
  c.CZ.REQ_ITEMCOMPOSITION.prototype.build = function () {
    var d = new a(6);
    d.writeShort(380);
    d.writeShort(this.cardIndex);
    d.writeShort(this.equipIndex);
    return d;
  };
  c.CZ.GUILD_CHAT = function () {
    this.msg = "";
  };
  c.CZ.GUILD_CHAT.prototype.build = function () {
    var d = 4 + this.msg.length + 1,
      b = new a(d);
    b.writeShort(382);
    b.writeShort(d);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.REQ_HOSTILE_GUILD = function () {
    this.AID = 0;
  };
  c.CZ.REQ_HOSTILE_GUILD.prototype.build = function () {
    var d = new a(6);
    d.writeShort(384);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.REQ_DELETE_RELATED_GUILD = function () {
    this.Relation = this.OpponentGDID = 0;
  };
  c.CZ.REQ_DELETE_RELATED_GUILD.prototype.build = function () {
    var d = new a(10);
    d.writeShort(387);
    d.writeULong(this.OpponentGDID);
    d.writeLong(this.Relation);
    return d;
  };
  c.CZ.PING = function () {
    this.AID = 0;
  };
  c.CZ.PING.prototype.build = function () {
    var d = new a(6);
    d.writeShort(391);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.REQ_DISCONNECT = function () {
    this.type = 0;
  };
  c.CZ.REQ_DISCONNECT.prototype.build = function () {
    var d = new a(4);
    d.writeShort(394);
    d.writeShort(this.type);
    return d;
  };
  c.CZ.REQMAKINGITEM = function () {
    this.info = {};
  };
  c.CZ.REQMAKINGITEM.prototype.build = function () {
    if (20180704 <= b.value) {
      var d = new a(18);
      d.writeShort(398);
      d.writeULong(this.info.ITID);
      d.writeULong(this.info.material_ID[0]);
      d.writeULong(this.info.material_ID[1]);
      d.writeULong(this.info.material_ID[2]);
    } else
      ((d = new a(10)),
        d.writeShort(398),
        d.writeUShort(this.info.ITID),
        d.writeUShort(this.info.material_ID[0]),
        d.writeUShort(this.info.material_ID[1]),
        d.writeUShort(this.info.material_ID[2]));
    return d;
  };
  c.CZ.USE_SKILL_TOGROUNDMoreInfo = function () {
    this.yPos = this.xPos = this.SKID = this.selectedLevel = 0;
    this.contents = "";
  };
  c.CZ.USE_SKILL_TOGROUNDMoreInfo.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.selectedLevel, !0);
    b.view.setUint16(d[4], this.SKID, !0);
    b.view.setInt16(d[5], this.xPos, !0);
    b.view.setInt16(d[6], this.yPos, !0);
    b.view.setString(d[7], this.contents, 80);
    return b;
  };
  c.CZ.REQNAME_BYGID = function () {
    this.GID = 0;
  };
  c.CZ.REQNAME_BYGID.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.GID, !0);
    return b;
  };
  c.CZ.RESET = function () {
    this.type = 0;
  };
  c.CZ.RESET.prototype.build = function () {
    var d = new a(4);
    d.writeShort(407);
    d.writeShort(this.type);
    return d;
  };
  c.CZ.CHANGE_MAPTYPE = function () {
    this.type = this.yPos = this.xPos = 0;
  };
  c.CZ.CHANGE_MAPTYPE.prototype.build = function () {
    var d = new a(8);
    d.writeShort(408);
    d.writeShort(this.xPos);
    d.writeShort(this.yPos);
    d.writeShort(this.type);
    return d;
  };
  c.CZ.LOCALBROADCAST = function () {
    this.msg = "";
  };
  c.CZ.LOCALBROADCAST.prototype.build = function () {
    var d = 4 + this.msg.length + 1,
      b = new a(d);
    b.writeShort(412);
    b.writeShort(d);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.CHANGE_EFFECTSTATE = function () {
    this.EffectState = 0;
  };
  c.CZ.CHANGE_EFFECTSTATE.prototype.build = function () {
    var d = new a(6);
    d.writeShort(413);
    d.writeLong(this.EffectState);
    return d;
  };
  c.CZ.TRYCAPTURE_MONSTER = function () {
    this.targetAID = 0;
  };
  c.CZ.TRYCAPTURE_MONSTER.prototype.build = function () {
    var d = new a(6);
    d.writeShort(415);
    d.writeULong(this.targetAID);
    return d;
  };
  c.CZ.COMMAND_PET = function () {
    this.cSub = 0;
  };
  c.CZ.COMMAND_PET.prototype.build = function () {
    var d = new a(3);
    d.writeShort(417);
    d.writeChar(this.cSub);
    return d;
  };
  c.CZ.RENAME_PET = function () {
    this.szName = "";
  };
  c.CZ.RENAME_PET.prototype.build = function () {
    var d = new a(26);
    d.writeShort(421);
    d.writeString(this.szName, 24);
    return d;
  };
  c.CZ.SELECT_PETEGG = function () {
    this.index = 0;
  };
  c.CZ.SELECT_PETEGG.prototype.build = function () {
    var d = new a(4);
    d.writeShort(423);
    d.writeShort(this.index);
    return d;
  };
  c.CZ.PETEGG_INFO = function () {
    this.index = 0;
  };
  c.CZ.PETEGG_INFO.prototype.build = function () {
    var d = new a(4);
    d.writeShort(424);
    d.writeShort(this.index);
    return d;
  };
  c.CZ.PET_ACT = function () {
    this.data = 0;
  };
  c.CZ.PET_ACT.prototype.build = function () {
    var d = new a(6);
    d.writeShort(425);
    d.writeLong(this.data);
    return d;
  };
  c.CZ.REQ_MAKINGARROW = function () {
    this.id = 0;
  };
  c.CZ.REQ_MAKINGARROW.prototype.build = function () {
    var d = new a(6);
    d.writeShort(430);
    d.writeLong(this.id);
    return d;
  };
  c.CZ.REQ_CHANGECART = function () {
    this.num = 0;
  };
  c.CZ.REQ_CHANGECART.prototype.build = function () {
    var d = new a(4);
    d.writeShort(431);
    d.writeShort(this.num);
    return d;
  };
  c.CZ.REQ_OPENSTORE2 = function () {
    this.storeName = "";
    this.result = 0;
    this.storeList = [];
  };
  c.CZ.REQ_OPENSTORE2.prototype.build = function () {
    var d = 85 + 8 * this.storeList.length,
      b = new a(d),
      c;
    b.writeShort(434);
    b.writeShort(d);
    b.writeString(this.storeName, 80);
    b.writeUChar(this.result);
    d = 0;
    for (c = this.storeList.length; d < c; ++d)
      (b.writeShort(this.storeList[d].index),
        b.writeShort(this.storeList[d].count),
        b.writeLong(this.storeList[d].Price));
    return b;
  };
  c.CZ.GUILD_ZENY = function () {
    this.zeny = 0;
  };
  c.CZ.GUILD_ZENY.prototype.build = function () {
    var d = new a(6);
    d.writeShort(439);
    d.writeLong(this.zeny);
    return d;
  };
  c.CZ.REMOVE_AID = function () {
    this.AccountName = "";
  };
  c.CZ.REMOVE_AID.prototype.build = function () {
    var d = new a(26);
    d.writeShort(442);
    d.writeString(this.AccountName, 24);
    return d;
  };
  c.CZ.SHIFT = function () {
    this.CharacterName = "";
  };
  c.CZ.SHIFT.prototype.build = function () {
    var d = new a(26);
    d.writeShort(443);
    d.writeString(this.CharacterName, 24);
    return d;
  };
  c.CZ.RECALL = function () {
    this.AccountName = "";
  };
  c.CZ.RECALL.prototype.build = function () {
    var d = new a(26);
    d.writeShort(444);
    d.writeString(this.AccountName, 24);
    return d;
  };
  c.CZ.RECALL_GID = function () {
    this.CharacterName = "";
  };
  c.CZ.RECALL_GID.prototype.build = function () {
    var d = new a(26);
    d.writeShort(445);
    d.writeString(this.CharacterName, 24);
    return d;
  };
  c.CA.REPLY_PNGAMEROOM = function () {
    this.Permission = 0;
  };
  c.CA.REPLY_PNGAMEROOM.prototype.build = function () {
    var d = new a(3);
    d.writeShort(447);
    d.writeUChar(this.Permission);
    return d;
  };
  c.CZ.REQ_REMAINTIME = function () {};
  c.CZ.REQ_REMAINTIME.prototype.build = function () {
    var d = new a(2);
    d.writeShort(448);
    return d;
  };
  c.CS.REQ_ENCRYPTION = function () {
    this.decCount = this.encCount = 0;
  };
  c.CS.REQ_ENCRYPTION.prototype.build = function () {
    var d = new a(4);
    d.writeShort(454);
    d.writeChar(this.encCount);
    d.writeChar(this.decCount);
    return d;
  };
  c.CZ.REQMAKINGHOMUN = function () {
    this.result = 0;
  };
  c.CZ.REQMAKINGHOMUN.prototype.build = function () {
    var d = new a(3);
    d.writeShort(458);
    d.writeUChar(this.result);
    return d;
  };
  c.CZ.MONSTER_TALK = function () {
    this.arg1 = this.skillId = this.stateId = this.GID = 0;
  };
  c.CZ.MONSTER_TALK.prototype.build = function () {
    var d = new a(9);
    d.writeShort(459);
    d.writeULong(this.GID);
    d.writeUChar(this.stateId);
    d.writeUChar(this.skillId);
    d.writeUChar(this.arg1);
    return d;
  };
  c.CZ.SELECTAUTOSPELL = function () {
    this.SKID = 0;
  };
  c.CZ.SELECTAUTOSPELL.prototype.build = function () {
    var d = new a(6);
    d.writeShort(462);
    d.writeLong(this.SKID);
    return d;
  };
  c.CZ.INPUT_EDITDLGSTR = function () {
    this.NAID = 0;
    this.msg = "";
  };
  c.CZ.INPUT_EDITDLGSTR.prototype.build = function () {
    var d = 8 + this.msg.length + 1,
      b = new a(d);
    b.writeShort(469);
    b.writeShort(d);
    b.writeULong(this.NAID);
    b.writeString(this.msg);
    return b;
  };
  c.CA.REQ_HASH = function () {};
  c.CA.REQ_HASH.prototype.build = function () {
    var d = new a(2);
    d.writeShort(475);
    return d;
  };
  c.CA.LOGIN2 = function () {
    this.Version = 0;
    this.PasswdMD5 = this.ID = "";
    this.clienttype = 0;
  };
  c.CA.LOGIN2.prototype.build = function () {
    var d = new a(47);
    d.writeShort(477);
    d.writeULong(this.Version);
    d.writeString(this.ID, 24);
    d.writeString(this.PasswdMD5, 16);
    d.writeUChar(this.clienttype);
    return d;
  };
  c.CZ.REQ_ACCOUNTNAME = function () {
    this.AID = 0;
  };
  c.CZ.REQ_ACCOUNTNAME.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.AID, !0);
    return b;
  };
  c.CZ.JOIN_COUPLE = function () {
    this.answer = this.GID = this.AID = 0;
  };
  c.CZ.JOIN_COUPLE.prototype.build = function () {
    var d = new a(14);
    d.writeShort(483);
    d.writeULong(this.AID);
    d.writeULong(this.GID);
    d.writeLong(this.answer);
    return d;
  };
  c.CZ.REQ_JOIN_COUPLE = function () {
    this.AID = 0;
  };
  c.CZ.REQ_JOIN_COUPLE.prototype.build = function () {
    var d = new a(6);
    d.writeShort(485);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.DORIDORI = function () {};
  c.CZ.DORIDORI.prototype.build = function () {
    var d = new a(2);
    d.writeShort(487);
    return d;
  };
  c.CZ.MAKE_GROUP2 = function () {
    this.groupName = "";
    this.ItemDivisionRule = this.ItemPickupRule = 0;
  };
  c.CZ.MAKE_GROUP2.prototype.build = function () {
    var d = new a(28);
    d.writeShort(488);
    d.writeString(this.groupName, 24);
    d.writeUChar(this.ItemPickupRule);
    d.writeUChar(this.ItemDivisionRule);
    return d;
  };
  c.CZ.CHOPOKGI = function () {};
  c.CZ.CHOPOKGI.prototype.build = function () {
    var d = new a(2);
    d.writeShort(493);
    return d;
  };
  c.CZ.JOIN_BABY = function () {
    this.answer = this.GID = this.AID = 0;
  };
  c.CZ.JOIN_BABY.prototype.build = function () {
    var d = new a(14);
    d.writeShort(503);
    d.writeULong(this.AID);
    d.writeULong(this.GID);
    d.writeLong(this.answer);
    return d;
  };
  c.CZ.REQ_JOIN_BABY = function () {
    this.AID = 0;
  };
  c.CZ.REQ_JOIN_BABY.prototype.build = function () {
    var d = new a(6);
    d.writeShort(505);
    d.writeULong(this.AID);
    return d;
  };
  c.CA.LOGIN3 = function () {
    this.Version = 0;
    this.PasswdMD5 = this.ID = "";
    this.ClientInfo = this.clienttype = 0;
  };
  c.CA.LOGIN3.prototype.build = function () {
    var d = new a(48);
    d.writeShort(506);
    d.writeULong(this.Version);
    d.writeString(this.ID, 24);
    d.writeString(this.PasswdMD5, 16);
    d.writeUChar(this.clienttype);
    d.writeUChar(this.ClientInfo);
    return d;
  };
  c.CH.DELETE_CHAR2 = function () {
    this.GID = 0;
    this.key = "";
  };
  c.CH.DELETE_CHAR2.prototype.build = function () {
    var d = new a(56);
    d.writeShort(507);
    d.writeULong(this.GID);
    d.writeString(this.key, 50);
    return d;
  };
  c.CZ.REQ_ITEMREPAIR = function () {
    this.TargetItemInfo = {};
  };
  c.CZ.REQ_ITEMREPAIR.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]),
      c = d[3];
    b.writeShort(d[1]);
    b.view.setInt16(c + 0, this.TargetItemInfo.index, !0);
    return b;
  };
  c.CA.CONNECT_INFO_CHANGED = function () {
    this.ID = "";
  };
  c.CA.CONNECT_INFO_CHANGED.prototype.build = function () {
    var d = new a(26);
    d.writeShort(512);
    d.writeString(this.ID, 24);
    return d;
  };
  c.CZ.ADD_FRIENDS = function () {
    this.name = "";
  };
  c.CZ.ADD_FRIENDS.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setString(d[3], this.name, 24);
    return b;
  };
  c.CZ.DELETE_FRIENDS = function () {
    this.GID = this.AID = 0;
  };
  c.CZ.DELETE_FRIENDS.prototype.build = function () {
    var d = new a(10);
    d.writeShort(515);
    d.writeULong(this.AID);
    d.writeULong(this.GID);
    return d;
  };
  c.CA.EXE_HASHCHECK = function () {
    this.HashValue = "";
  };
  c.CA.EXE_HASHCHECK.prototype.build = function () {
    var d = new a(18);
    d.writeShort(516);
    d.writeBinaryString(this.HashValue, 16);
    return d;
  };
  c.CZ.ACK_REQ_ADD_FRIENDS = function () {
    this.Result = this.ReqGID = this.ReqAID = 0;
  };
  c.CZ.ACK_REQ_ADD_FRIENDS.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.ReqAID, !0);
    b.view.setUint32(d[4], this.ReqGID, !0);
    11 === d[2]
      ? b.view.setInt8(d[5], this.Result, !0)
      : b.view.setInt32(d[5], this.Result, !0);
    return b;
  };
  c.CH.EXE_HASHCHECK = function () {
    this.ClientType = 0;
    this.HashValue = "";
  };
  c.CH.EXE_HASHCHECK.prototype.build = function () {
    var d = new a(19);
    d.writeShort(523);
    d.writeUChar(this.ClientType);
    d.writeBinaryString(this.HashValue, 16);
    return d;
  };
  c.CZ.EXE_HASHCHECK = function () {
    this.ClientType = 0;
    this.HashValue = "";
  };
  c.CZ.EXE_HASHCHECK.prototype.build = function () {
    var d = new a(19);
    d.writeShort(524);
    d.writeUChar(this.ClientType);
    d.writeBinaryString(this.HashValue, 16);
    return d;
  };
  c.CZ.REQ_PVPPOINT = function () {
    this.GID = this.AID = 0;
  };
  c.CZ.REQ_PVPPOINT.prototype.build = function () {
    var d = new a(10);
    d.writeShort(527);
    d.writeULong(this.AID);
    d.writeULong(this.GID);
    return d;
  };
  c.CZ.REQ_GIVE_MANNER_BYNAME = function () {
    this.CharName = "";
  };
  c.CZ.REQ_GIVE_MANNER_BYNAME.prototype.build = function () {
    var d = new a(26);
    d.writeShort(530);
    d.writeString(this.CharName, 24);
    return d;
  };
  c.CZ.REQ_STATUS_GM = function () {
    this.CharName = "";
  };
  c.CZ.REQ_STATUS_GM.prototype.build = function () {
    var d = new a(26);
    d.writeShort(531);
    d.writeString(this.CharName, 24);
    return d;
  };
  c.CZ.BLACKSMITH_RANK = function () {};
  c.CZ.BLACKSMITH_RANK.prototype.build = function () {
    var d = new a(2);
    d.writeShort(535);
    return d;
  };
  c.CZ.ALCHEMIST_RANK = function () {};
  c.CZ.ALCHEMIST_RANK.prototype.build = function () {
    var d = new a(2);
    d.writeShort(536);
    return d;
  };
  c.CZ.LESSEFFECT = function () {
    this.isLess = 0;
  };
  c.CZ.LESSEFFECT.prototype.build = function () {
    var d = new a(6);
    d.writeShort(541);
    d.writeLong(this.isLess);
    return d;
  };
  c.CZ.REQ_WEAPONREFINE = function () {
    this.Index = 0;
  };
  c.CZ.REQ_WEAPONREFINE.prototype.build = function () {
    var d = new a(6);
    d.writeShort(546);
    d.writeLong(this.Index);
    return d;
  };
  c.CZ.TAEKWON_RANK = function () {};
  c.CZ.TAEKWON_RANK.prototype.build = function () {
    var d = new a(2);
    d.writeShort(549);
    return d;
  };
  c.CZ.ACK_GAME_GUARD = function () {
    this.AuthData = 0;
  };
  c.CZ.ACK_GAME_GUARD.prototype.build = function () {
    var d = new a(18);
    d.writeShort(552);
    d.writeULong(this.AuthData[0]);
    d.writeULong(this.AuthData[1]);
    d.writeULong(this.AuthData[2]);
    d.writeULong(this.AuthData[3]);
    return d;
  };
  c.CZ.COMMAND_MER = function () {
    this.command = this.type = 0;
  };
  c.CZ.COMMAND_MER.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.type, !0);
    b.view.setInt8(d[4], this.command, !0);
    return b;
  };
  c.CZ.RENAME_MER = function () {
    this.name = "";
  };
  c.CZ.RENAME_MER.prototype.build = function () {
    var d = new a(26);
    d.writeShort(561);
    d.writeString(this.name, 24);
    return d;
  };
  c.CZ.REQUEST_MOVENPC = function () {
    this.GID = 0;
    this.dest = [0, 0];
  };
  c.CZ.REQUEST_MOVENPC.prototype.build = function () {
    var d = new a(9);
    d.writeShort(562);
    d.writeULong(this.GID);
    d.writePos(this.dest);
    return d;
  };
  c.CZ.REQUEST_ACTNPC = function () {
    this.action = this.targetGID = this.GID = 0;
  };
  c.CZ.REQUEST_ACTNPC.prototype.build = function () {
    var d = new a(11);
    d.writeShort(563);
    d.writeULong(this.GID);
    d.writeULong(this.targetGID);
    d.writeUChar(this.action);
    return d;
  };
  c.CZ.REQUEST_MOVETOOWNER = function () {
    this.GID = 0;
  };
  c.CZ.REQUEST_MOVETOOWNER.prototype.build = function () {
    var d = new a(6);
    d.writeShort(564);
    d.writeULong(this.GID);
    return d;
  };
  c.CZ.RANKING_PK = function () {};
  c.CZ.RANKING_PK.prototype.build = function () {
    var d = new a(2);
    d.writeShort(567);
    return d;
  };
  c.CZ.ACK_STORE_PASSWORD = function () {
    this.Type = 0;
    this.NewPassword = this.Password = "";
  };
  c.CZ.ACK_STORE_PASSWORD.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setInt16(d[3], this.Type, !0);
    b.view.setString(d[4], this.Password, 16);
    b.view.setString(d[5], this.NewPassword, 16);
    return b;
  };
  c.CZ.REQ_RANKING = function () {
    this.Type = 0;
  };
  c.CZ.REQ_RANKING.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2428);
    d.writeShort(this.Type);
    return d;
  };
  c.CZ.MAIL_GET_LIST = function () {};
  c.CZ.MAIL_GET_LIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(575);
    return d;
  };
  c.CZ.MAIL_OPEN = function () {
    this.MailID = 0;
  };
  c.CZ.MAIL_OPEN.prototype.build = function () {
    var d = new a(6);
    d.writeShort(577);
    d.writeLong(this.MailID);
    return d;
  };
  c.CZ.MAIL_DELETE = function () {
    this.MailID = 0;
  };
  c.CZ.MAIL_DELETE.prototype.build = function () {
    var d = new a(6);
    d.writeShort(579);
    d.writeLong(this.MailID);
    return d;
  };
  c.CZ.MAIL_GET_ITEM = function () {
    this.MailID = 0;
  };
  c.CZ.MAIL_GET_ITEM.prototype.build = function () {
    var d = new a(6);
    d.writeShort(580);
    d.writeLong(this.MailID);
    return d;
  };
  c.CZ.MAIL_RESET_ITEM = function () {
    this.Type = 0;
  };
  c.CZ.MAIL_RESET_ITEM.prototype.build = function () {
    var d = new a(4);
    d.writeShort(582);
    d.writeShort(this.Type);
    return d;
  };
  c.CZ.MAIL_ADD_ITEM = function () {
    this.count = this.index = 0;
  };
  c.CZ.MAIL_ADD_ITEM.prototype.build = function () {
    var d = new a(8);
    d.writeShort(583);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.MAIL_SEND = function () {
    this.msg = this.Header = this.ReceiveName = "";
    this.msg_len = 0;
  };
  c.CZ.MAIL_SEND.prototype.build = function () {
    var d = 72 + this.msg.length,
      b = new a(d);
    b.writeShort(584);
    b.writeShort(d);
    b.writeString(this.ReceiveName, 24);
    b.writeString(this.Header, 40);
    b.writeString(this.msg);
    b.writeULong(this.msg.length);
    return b;
  };
  c.CZ.REQ_DEL_QUEST = function () {
    this.Qid = 0;
  };
  c.CZ.REQ_DEL_QUEST.prototype.build = function () {
    var d = new a(6);
    d.writeShort(702);
    d.writeLong(this.Qid);
    return d;
  };
  c.CZ.OPEN_MAILBOX = function () {
    this.MailID = this.MailTAB = 0;
  };
  c.CZ.OPEN_MAILBOX.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2536);
    d.writeUChar(this.MailTAB);
    d.writeQLong(this.MailID);
    return d;
  };
  c.CZ.CLOSE_MAILBOX = function () {};
  c.CZ.CLOSE_MAILBOX.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2537);
    return d;
  };
  c.CZ.REQ_READ_MAIL = function () {
    this.MailID = this.MailTAB = 0;
  };
  c.CZ.REQ_READ_MAIL.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2538);
    d.writeUChar(this.MailTAB);
    d.writeQLong(this.MailID);
    return d;
  };
  c.CZ.REQ_WRITE_MAIL = function () {
    this.msg =
      this.Header =
      this.BodySize =
      this.HeaderSize =
      this.Zeny =
      this.ToName =
      this.ReceiveName =
        "";
  };
  c.CZ.REQ_WRITE_MAIL.prototype.build = function () {
    var d = 64 + this.Header.length + this.msg.length,
      b = new a(d);
    b.writeShort(2540);
    b.writeShort(d);
    b.writeString(this.ReceiveName, 24);
    b.writeString(this.ToName, 24);
    b.writeQLong(this.Zeny);
    b.writeShort(this.HeaderSize);
    b.writeShort(this.BodySize);
    b.writeString(this.Header);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.REQ_WRITE_MAIL2 = function () {
    this.msg =
      this.Header =
      this.CharId =
      this.BodySize =
      this.HeaderSize =
      this.Zeny =
      this.ToName =
      this.ReceiveName =
        "";
  };
  c.CZ.REQ_WRITE_MAIL2.prototype.build = function () {
    var d = 68 + this.Header.length + this.msg.length,
      b = new a(d);
    b.writeShort(2540);
    b.writeShort(d);
    b.writeString(this.ReceiveName, 24);
    b.writeString(this.ToName, 24);
    b.writeQLong(this.Zeny);
    b.writeShort(this.HeaderSize);
    b.writeShort(this.BodySize);
    b.writeLong(this.CharId);
    b.writeString(this.Header);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.REQ_NEXT_MAIL_LIST = function () {
    this.MailID = this.MailTAB = 0;
  };
  c.CZ.REQ_NEXT_MAIL_LIST.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2542);
    d.writeUChar(this.MailTAB);
    d.writeQLong(this.MailID);
    return d;
  };
  c.CZ.REQ_REFRESH_MAIL_LIST = function () {
    this.MailID = this.MailTAB = 0;
  };
  c.CZ.REQ_REFRESH_MAIL_LIST.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2543);
    d.writeUChar(this.MailTAB);
    d.writeQLong(this.MailID);
    return d;
  };
  c.CZ.REQ_ZENY_FROM_MAIL = function () {
    this.MailTAB = this.MailID = 0;
  };
  c.CZ.REQ_ZENY_FROM_MAIL.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2545);
    d.writeQLong(this.MailID);
    d.writeUChar(this.MailTAB);
    return d;
  };
  c.CZ.REQ_ITEM_FROM_MAIL = function () {
    this.MailTAB = this.MailID = 0;
  };
  c.CZ.REQ_ITEM_FROM_MAIL.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2547);
    d.writeQLong(this.MailID);
    d.writeUChar(this.MailTAB);
    return d;
  };
  c.CZ.REQ_DELETE_MAIL = function () {
    this.MailID = this.MailTAB = 0;
  };
  c.CZ.REQ_DELETE_MAIL.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2549);
    d.writeUChar(this.MailTAB);
    d.writeQLong(this.MailID);
    return d;
  };
  c.CZ.REQ_CANCEL_WRITE_MAIL = function () {};
  c.CZ.REQ_CANCEL_WRITE_MAIL.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2563);
    return d;
  };
  c.CZ.REQ_ADD_ITEM_TO_MAIL = function () {
    this.count = this.index = 0;
  };
  c.CZ.REQ_ADD_ITEM_TO_MAIL.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2564);
    d.writeShort(this.index);
    d.writeShort(this.count);
    return d;
  };
  c.CZ.REQ_REMOVE_ITEM_MAIL = function () {
    this.count = this.index = 0;
  };
  c.CZ.REQ_REMOVE_ITEM_MAIL.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2566);
    d.writeShort(this.index);
    d.writeShort(this.count);
    return d;
  };
  c.CZ.REQ_OPEN_WRITE_MAIL = function () {
    this.ReceiveName = "";
  };
  c.CZ.REQ_OPEN_WRITE_MAIL.prototype.build = function () {
    var d = new a(26);
    d.writeShort(2568);
    d.writeString(this.ReceiveName, 24);
    return d;
  };
  c.CZ.CHECK_RECEIVE_CHARACTER_NAME = function () {
    this.name = "";
  };
  c.CZ.CHECK_RECEIVE_CHARACTER_NAME.prototype.build = function () {
    var d = new a(26);
    d.writeShort(2579);
    d.writeString(this.name, 24);
    return d;
  };
  c.CZ.REQ_ONECLICK_ITEMIDENTIFY = function () {
    this.result = "";
  };
  c.CZ.REQ_ONECLICK_ITEMIDENTIFY.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2613);
    d.writeShort(this.result);
    return d;
  };
  c.CZ.REQ_ACH_REWARD = function () {
    this.achievementID = "";
  };
  c.CZ.REQ_ACH_REWARD.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2597);
    d.writeLong(this.achievementID);
    return d;
  };
  c.CZ.RANDOM_COMBINE_ITEM_UI_CLOSE = function () {};
  c.CZ.RANDOM_COMBINE_ITEM_UI_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2672);
    return d;
  };
  c.CZ.RANDOM_UPGRADE_ITEM_UI_CLOSE = function () {};
  c.CZ.RANDOM_UPGRADE_ITEM_UI_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2741);
    return d;
  };
  c.CZ.REQ_RANDOM_UPGRADE_ITEM = function () {
    this.ITID = 0;
    this.index = -1;
  };
  c.CZ.REQ_RANDOM_UPGRADE_ITEM.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2742);
    d.writeLong(this.ITID);
    d.writeShort(this.index);
    return d;
  };
  c.CZ.REQ_RANDOM_COMBINE_ITEM = function () {
    this.ITID = 0;
    this.list = [];
  };
  c.CZ.REQ_RANDOM_COMBINE_ITEM.prototype.build = function () {
    var d = new a(8 + 4 * this.list.length);
    d.writeShort(2639);
    d.writeShort(8 + 4 * this.list.length);
    d.writeLong(this.ITID);
    var b,
      c = this.list.length;
    for (b = 0; b < c; ++b)
      (d.writeShort(this.list[b].index), d.writeShort(this.list[b].count));
    return d;
  };
  c.CZ.REQ_CHANGE_TITLE = function () {
    this.title_id = "";
  };
  c.CZ.REQ_CHANGE_TITLE.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2606);
    d.writeLong(this.title_id);
    return d;
  };
  c.CZ.AUCTION_CLOSE = function () {};
  c.CZ.AUCTION_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2765);
    return d;
  };
  c.CZ.AUCTION_CREATE = function () {
    this.Type = 0;
  };
  c.CZ.AUCTION_CREATE.prototype.build = function () {
    var d = new a(4);
    d.writeShort(587);
    d.writeShort(this.Type);
    return d;
  };
  c.CZ.AUCTION_ADD_ITEM = function () {
    this.count = this.index = 0;
  };
  c.CZ.AUCTION_ADD_ITEM.prototype.build = function () {
    var d = new a(8);
    d.writeShort(588);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.AUCTION_ADD = function () {
    this.DeleteHour = this.MaxMoney = this.NowMoney = 0;
  };
  c.CZ.AUCTION_ADD.prototype.build = function () {
    var d = new a(12);
    d.writeShort(589);
    d.writeULong(this.NowMoney);
    d.writeULong(this.MaxMoney);
    d.writeShort(this.DeleteHour);
    return d;
  };
  c.CZ.AUCTION_ADD_CANCEL = function () {
    this.AuctionID = 0;
  };
  c.CZ.AUCTION_ADD_CANCEL.prototype.build = function () {
    var d = new a(6);
    d.writeShort(590);
    d.writeULong(this.AuctionID);
    return d;
  };
  c.CZ.AUCTION_BUY = function () {
    this.Money = this.AuctionID = 0;
  };
  c.CZ.AUCTION_BUY.prototype.build = function () {
    var d = new a(10);
    d.writeShort(591);
    d.writeULong(this.AuctionID);
    d.writeULong(this.Money);
    return d;
  };
  c.CZ.AUCTION_ITEM_SEARCH = function () {
    this.AuctionID = this.Type = 0;
    this.Name = "";
    this.Page = 0;
  };
  c.CZ.AUCTION_ITEM_SEARCH.prototype.build = function () {
    var d = new a(34);
    d.writeShort(593);
    d.writeShort(this.Type);
    d.writeULong(this.AuctionID);
    d.writeString(this.Name, 24);
    d.writeUShort(this.Page);
    return d;
  };
  c.CZ.AGREE_STARPLACE = function () {
    this.which = 0;
  };
  c.CZ.AGREE_STARPLACE.prototype.build = function () {
    var d = new a(3);
    d.writeShort(596);
    d.writeChar(this.which);
    return d;
  };
  c.CA.REQ_GAME_GUARD_CHECK = function () {};
  c.CA.REQ_GAME_GUARD_CHECK.prototype.build = function () {
    var d = new a(2);
    d.writeShort(600);
    return d;
  };
  c.CZ.REQ_MAKINGITEM = function () {
    this.id = this.mkType = 0;
  };
  c.CZ.REQ_MAKINGITEM.prototype.build = function () {
    var d = new a(8);
    d.writeShort(603);
    d.writeShort(this.mkType);
    d.writeLong(this.id);
    return d;
  };
  c.CZ.AUCTION_REQ_MY_INFO = function () {
    this.Type = 0;
  };
  c.CZ.AUCTION_REQ_MY_INFO.prototype.build = function () {
    var d = new a(4);
    d.writeShort(604);
    d.writeShort(this.Type);
    return d;
  };
  c.CZ.AUCTION_REQ_MY_SELL_STOP = function () {
    this.AuctionID = 0;
  };
  c.CZ.AUCTION_REQ_MY_SELL_STOP.prototype.build = function () {
    var d = new a(6);
    d.writeShort(605);
    d.writeULong(this.AuctionID);
    return d;
  };
  c.CA.ACK_LOGIN_OLDEKEY = function () {
    this.m_EKey = this.m_SeedValue = "";
  };
  c.CA.ACK_LOGIN_OLDEKEY.prototype.build = function () {
    var d = new a(20);
    d.writeShort(612);
    d.writeBinaryString(this.m_SeedValue, 9);
    d.writeBinaryString(this.m_EKey, 9);
    return d;
  };
  c.CA.ACK_LOGIN_NEWEKEY = function () {
    this.m_EKey = this.m_SeedValue = "";
  };
  c.CA.ACK_LOGIN_NEWEKEY.prototype.build = function () {
    var d = new a(20);
    d.writeShort(613);
    d.writeBinaryString(this.m_SeedValue, 9);
    d.writeBinaryString(this.m_EKey, 9);
    return d;
  };
  c.CA.ACK_LOGIN_CARDPASS = function () {
    this.m_cardPass = "";
  };
  c.CA.ACK_LOGIN_CARDPASS.prototype.build = function () {
    var d = new a(30);
    d.writeShort(614);
    d.writeString(this.m_cardPass, 28);
    return d;
  };
  c.CA.ACK_LOGIN_ACCOUNT_INFO = function () {
    this.bPoint = this.sex = 0;
    this.E_mail = "";
  };
  c.CA.ACK_LOGIN_ACCOUNT_INFO.prototype.build = function () {
    var d = new a(40);
    d.writeShort(625);
    d.writeShort(this.sex);
    d.writeShort(this.bPoint);
    d.writeString(this.E_mail, 34);
    return d;
  };
  c.CZ.REQ_MAIL_RETURN = function () {
    this.MailID = 0;
    this.ReceiveName = "";
  };
  c.CZ.REQ_MAIL_RETURN.prototype.build = function () {
    var d = new a(30);
    d.writeShort(627);
    d.writeLong(this.MailID);
    d.writeString(this.ReceiveName, 24);
    return d;
  };
  c.CH.ENTER2 = function () {
    this.Sex = this.clientType = this.userLevel = this.AuthCode = this.AID = 0;
    this.macData = "";
    this.iAccountSID = 0;
  };
  c.CH.ENTER2.prototype.build = function () {
    var d = new a(37);
    d.writeShort(629);
    d.writeULong(this.AID);
    d.writeULong(this.AuthCode);
    d.writeULong(this.userLevel);
    d.writeUShort(this.clientType);
    d.writeUChar(this.Sex);
    d.writeBinaryString(this.macData, 16);
    d.writeLong(this.iAccountSID);
    return d;
  };
  c.CA.LOGIN_PCBANG = function () {
    this.Version = 0;
    this.Passwd = this.ID = "";
    this.clienttype = 0;
    this.MacAdress = this.IP = "";
  };
  c.CA.LOGIN_PCBANG.prototype.build = function () {
    var d = new a(84);
    d.writeShort(631);
    d.writeULong(this.Version);
    d.writeString(this.ID, 24);
    d.writeString(this.Passwd, 24);
    d.writeUChar(this.clienttype);
    d.writeBinaryString(this.IP, 16);
    d.writeBinaryString(this.MacAdress, 13);
    return d;
  };
  c.CZ.HUNTINGLIST = function () {};
  c.CZ.HUNTINGLIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(633);
    return d;
  };
  c.CA.LOGIN4 = function () {
    this.Version = 0;
    this.PasswdMD5 = this.ID = "";
    this.clienttype = 0;
    this.macData = "";
  };
  c.CA.LOGIN4.prototype.build = function () {
    var d = new a(60);
    d.writeShort(636);
    d.writeULong(this.Version);
    d.writeString(this.ID, 24);
    d.writeString(this.PasswdMD5, 16);
    d.writeUChar(this.clienttype);
    d.writeBinaryString(this.macData, 13);
    return d;
  };
  c.CA.CLIENT_TYPE = function () {
    this.nVer = this.ClientType = 0;
  };
  c.CA.CLIENT_TYPE.prototype.build = function () {
    var d = new a(8);
    d.writeShort(639);
    d.writeShort(this.ClientType);
    d.writeLong(this.nVer);
    return d;
  };
  c.CZ.GANGSI_RANK = function () {
    this.PacketSwitch = 0;
  };
  c.CZ.GANGSI_RANK.prototype.build = function () {
    var d = new a(4);
    d.writeShort(641);
    d.writeShort(this.PacketSwitch);
    return d;
  };
  c.CZ.DEATH_QUESTION = function () {
    this.Qanswer = 0;
  };
  c.CZ.DEATH_QUESTION.prototype.build = function () {
    var d = new a(4);
    d.writeShort(646);
    d.writeShort(this.Qanswer);
    return d;
  };
  c.CZ.PC_BUY_CASH_POINT_ITEM = function () {
    this.list = [];
    this.kafrapts = 0;
  };
  c.CZ.PC_BUY_CASH_POINT_ITEM.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    switch (d[2]) {
      case 6:
        b.view.setUint16(d[3], this.list[0].id, !0);
        b.view.setInt16(d[4], this.list[0].count, !0);
        break;
      case 10:
        b.view.setUint16(d[3], this.list[0].id, !0);
        b.view.setInt16(d[4], this.list[0].count, !0);
        b.view.setInt32(d[5], this.kafrapts, !0);
        break;
      case -1:
        b.writeShort(10 + 4 * this.list.length);
        b.view.setInt32(d[3], this.kafrapts, !0);
        b.view.setInt16(d[4], this.list.length, !0);
        var d = d[4] + 2,
          c,
          h = this.list.length;
        for (c = 0; c < h; ++c)
          (b.view.setUint16(d + 0, this.list[c].id, !0),
            b.view.setInt16(d + 2, this.list[c].count, !0),
            (d += 4));
    }
    return b;
  };
  c.CH.SELECT_CHAR_GOINGTOBEUSED = function () {
    this.ardwSelectedGID = this.nCountSelectedChar = this.dwAID = 0;
  };
  c.CH.SELECT_CHAR_GOINGTOBEUSED.prototype.build = function () {
    var d = new a(46);
    d.writeShort(652);
    d.writeULong(this.dwAID);
    d.writeLong(this.nCountSelectedChar);
    d.writeULong(this.ardwSelectedGID[0]);
    d.writeULong(this.ardwSelectedGID[1]);
    d.writeULong(this.ardwSelectedGID[2]);
    d.writeULong(this.ardwSelectedGID[3]);
    return d;
  };
  c.CH.REQ_IS_VALID_CHARNAME = function () {
    this.dwGID = this.dwAID = 0;
    this.szCharName = "";
  };
  c.CH.REQ_IS_VALID_CHARNAME.prototype.build = function () {
    var d = new a(34);
    d.writeShort(653);
    d.writeULong(this.dwAID);
    d.writeULong(this.dwGID);
    d.writeString(this.szCharName, 24);
    return d;
  };
  c.CH.REQ_CHANGE_CHARNAME = function () {
    this.dwGID = 0;
  };
  c.CH.REQ_CHANGE_CHARNAME.prototype.build = function () {
    var d = new a(6);
    d.writeShort(655);
    d.writeULong(this.dwGID);
    return d;
  };
  c.CZ.STANDING_RESURRECTION = function () {};
  c.CZ.STANDING_RESURRECTION.prototype.build = function () {
    var d = new a(2);
    d.writeShort(658);
    return d;
  };
  c.CZ.MER_COMMAND = function () {
    this.command = 0;
  };
  c.CZ.MER_COMMAND.prototype.build = function () {
    var d = new a(3);
    d.writeShort(671);
    d.writeChar(this.command);
    return d;
  };
  c.CZ.MER_USE_SKILL = function () {
    this.targetID = this.SKID = this.selectedLevel = 0;
  };
  c.CZ.MER_USE_SKILL.prototype.build = function () {
    var d = new a(10);
    d.writeShort(672);
    d.writeShort(this.selectedLevel);
    d.writeUShort(this.SKID);
    d.writeULong(this.targetID);
    return d;
  };
  c.CZ.MER_UPGRADE_SKILLLEVEL = function () {
    this.SKID = 0;
  };
  c.CZ.MER_UPGRADE_SKILLLEVEL.prototype.build = function () {
    var d = new a(4);
    d.writeShort(673);
    d.writeUShort(this.SKID);
    return d;
  };
  c.CZ.KSY_EVENT = function () {
    this.count = this.index = 0;
  };
  c.CZ.KSY_EVENT.prototype.build = function () {
    var d = new a(8);
    d.writeShort(677);
    d.writeShort(this.index);
    d.writeLong(this.count);
    return d;
  };
  c.CZ.ACK_CASH_PASSWORD = function () {
    this.Type = 0;
    this.NewPassword = this.Password = "";
  };
  c.CZ.ACK_CASH_PASSWORD.prototype.build = function () {
    var d = new a(36);
    d.writeShort(683);
    d.writeShort(this.Type);
    d.writeString(this.Password, 16);
    d.writeString(this.NewPassword, 16);
    return d;
  };
  c.CA.LOGIN_HAN = function () {
    this.Version = 0;
    this.Passwd = this.ID = "";
    this.clienttype = 0;
    this.m_szMacAddr = this.m_szIP = "";
    this.isHanGameUser = 0;
  };
  c.CA.LOGIN_HAN.prototype.build = function () {
    var d = new a(85);
    d.writeShort(688);
    d.writeULong(this.Version);
    d.writeString(this.ID, 24);
    d.writeBinaryString(this.Passwd, 24);
    d.writeUChar(this.clienttype);
    d.writeBinaryString(this.m_szIP, 16);
    d.writeBinaryString(this.m_szMacAddr, 13);
    d.writeUChar(this.isHanGameUser);
    return d;
  };
  c.CZ.ACTIVE_QUEST = function () {
    this.active = this.questID = 0;
  };
  c.CZ.ACTIVE_QUEST.prototype.build = function () {
    var d = new a(7);
    d.writeShort(694);
    d.writeULong(this.questID);
    d.writeUChar(this.active);
    return d;
  };
  c.CZ.SHORTCUT_KEY_CHANGE = function () {
    20180704 <= b.value && (this.tab = 0);
    this.Index = 0;
    this.ShortCutKey = {};
  };
  c.CZ.SHORTCUT_KEY_CHANGE.prototype.build = function () {
    if (20180704 <= b.value) {
      var d = new a(13);
      d.writeShort(2849);
      d.writeUShort(this.tab);
    } else ((d = new a(11)), d.writeShort(698));
    d.writeUShort(this.Index);
    d.writeChar(this.ShortCutKey.isSkill);
    d.writeULong(this.ShortCutKey.ID);
    d.writeShort(this.ShortCutKey.count);
    return d;
  };
  c.CZ.SRPACKETR2_START = function () {
    this.ProtectFactor = 0;
  };
  c.CZ.SRPACKETR2_START.prototype.build = function () {
    var d = new a(4);
    d.writeShort(704);
    d.writeUShort(this.ProtectFactor);
    return d;
  };
  c.CZ.PARTY_JOIN_REQ = function () {
    this.characterName = "";
  };
  c.CZ.PARTY_JOIN_REQ.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.writeString(this.characterName, 24);
    return b;
  };
  c.CZ.PARTY_JOIN_REQ_ACK = function () {
    this.bAccept = this.GRID = 0;
  };
  c.CZ.PARTY_JOIN_REQ_ACK.prototype.build = function () {
    var d = new a(7);
    d.writeShort(711);
    d.writeULong(this.GRID);
    d.writeUChar(this.bAccept);
    return d;
  };
  c.CZ.PARTY_CONFIG = function () {
    this.bRefuseJoinMsg = 0;
  };
  c.CZ.PARTY_CONFIG.prototype.build = function () {
    var d = new a(3);
    d.writeShort(712);
    d.writeUChar(this.bRefuseJoinMsg);
    return d;
  };
  c.CZ.MEMORIALDUNGEON_COMMAND = function () {
    this.Command = 0;
  };
  c.CZ.MEMORIALDUNGEON_COMMAND.prototype.build = function () {
    var d = new a(6);
    d.writeShort(719);
    d.writeLong(this.Command);
    return d;
  };
  c.CZ.EQUIPWIN_MICROSCOPE = function () {
    this.AID = 0;
  };
  c.CZ.EQUIPWIN_MICROSCOPE.prototype.build = function () {
    var d = new a(6);
    d.writeShort(726);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.CONFIG = function () {
    this.Value = this.Config = 0;
  };
  c.CZ.CONFIG.prototype.build = function () {
    var d = new a(10);
    d.writeShort(728);
    d.writeLong(this.Config);
    d.writeLong(this.Value);
    return d;
  };
  c.CZ.BATTLEFIELD_CHAT = function () {
    this.msg = "";
  };
  c.CZ.BATTLEFIELD_CHAT.prototype.build = function () {
    var d = 4 + this.msg.length,
      b = new a(d);
    b.writeShort(731);
    b.writeShort(d);
    b.writeString(this.msg);
    return b;
  };
  c.CZ.BOT_CHECK = function () {
    this.IsBot = 0;
  };
  c.CZ.BOT_CHECK.prototype.build = function () {
    var d = new a(6);
    d.writeShort(742);
    d.writeLong(this.IsBot);
    return d;
  };
  c.CZ.PROGRESS = function () {};
  c.CZ.PROGRESS.prototype.build = function () {
    var d = new a(2);
    d.writeShort(753);
    return d;
  };
  c.CZ.OPEN_SIMPLE_CASHSHOP_ITEMLIST = function () {};
  c.CZ.OPEN_SIMPLE_CASHSHOP_ITEMLIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(860);
    return d;
  };
  c.CZ.CLOSE_WINDOW = function () {};
  c.CZ.CLOSE_WINDOW.prototype.build = function () {
    var d = new a(2);
    d.writeShort(862);
    return d;
  };
  c.CZ.REQUEST_MOVE2 = function () {
    this.dest = [0, 0];
  };
  c.CZ.REQUEST_MOVE2.prototype.build = function () {
    var d = new a(5);
    d.writeShort(863);
    d.writePos(this.dest);
    return d;
  };
  c.CZ.ENTER2 = function () {
    this.Sex = this.clientTime = this.AuthCode = this.GID = this.AID = 0;
  };
  c.CZ.ENTER2.prototype.build = function () {
    var d = new a(19);
    d.writeShort(1078);
    d.writeULong(this.AID);
    d.writeULong(this.GID);
    d.writeULong(this.AuthCode);
    d.writeULong(this.clientTime);
    d.writeUChar(this.Sex);
    return d;
  };
  c.CZ.REQUEST_ACT2 = function () {
    this.action = this.targetGID = 0;
  };
  c.CZ.REQUEST_ACT2.prototype.build = function () {
    var d = new a(7);
    d.writeShort(1079);
    d.writeULong(this.targetGID);
    d.writeUChar(this.action);
    return d;
  };
  c.CZ.USE_SKILL2 = function () {
    this.targetID = this.SKID = this.selectedLevel = 0;
  };
  c.CZ.USE_SKILL2.prototype.build = function () {
    var d = new a(10);
    d.writeShort(1080);
    d.writeShort(this.selectedLevel);
    d.writeUShort(this.SKID);
    d.writeULong(this.targetID);
    return d;
  };
  c.CZ.USE_ITEM2 = function () {
    this.AID = this.index = 0;
  };
  c.CZ.USE_ITEM2.prototype.build = function () {
    var d = new a(8);
    d.writeShort(1081);
    d.writeUShort(this.index);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.SKILL_SELECT_RESPONSE = function () {
    this.SKID = this.why = 0;
  };
  c.CZ.SKILL_SELECT_RESPONSE.prototype.build = function () {
    var d = new a(8);
    d.writeShort(1091);
    d.writeLong(this.why);
    d.writeUShort(this.SKID);
    return d;
  };
  c.CZ.SIMPLE_BUY_CASH_POINT_ITEM = function () {
    this.count = this.ITID = 0;
  };
  c.CZ.SIMPLE_BUY_CASH_POINT_ITEM.prototype.build = function () {
    var d = new a(6);
    d.writeShort(1093);
    d.writeUShort(this.ITID);
    d.writeShort(this.count);
    return d;
  };
  c.CZ.BLOCKING_PLAY_CANCEL = function () {};
  c.CZ.BLOCKING_PLAY_CANCEL.prototype.build = function () {
    var d = new a(2);
    d.writeShort(1095);
    return d;
  };
  c.CZ.CLIENT_VERSION = function () {
    this.clientVer = 0;
  };
  c.CZ.CLIENT_VERSION.prototype.build = function () {
    var d = new a(6);
    d.writeShort(1098);
    d.writeLong(this.clientVer);
    return d;
  };
  c.CZ.CLOSE_SIMPLECASH_SHOP = function () {};
  c.CZ.CLOSE_SIMPLECASH_SHOP.prototype.build = function () {
    var d = new a(2);
    d.writeShort(1099);
    return d;
  };
  c.CZ.ES_GET_LIST = function () {};
  c.CZ.ES_GET_LIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2001);
    return d;
  };
  c.CZ.ES_CHOOSE = function () {
    this.esNo = 0;
  };
  c.CZ.ES_CHOOSE.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2003);
    d.writeShort(this.esNo);
    return d;
  };
  c.CZ.ES_CANCEL = function () {
    this.esNo = 0;
  };
  c.CZ.ES_CANCEL.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2004);
    d.writeShort(this.esNo);
    return d;
  };
  c.CZ.GROUPINFO_CHANGE_V2 = function () {
    this.ItemDivisionRule = this.ItemPickupRule = this.expOption = 0;
  };
  c.CZ.GROUPINFO_CHANGE_V2.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2007);
    d.writeULong(this.expOption);
    d.writeUChar(this.ItemPickupRule);
    d.writeUChar(this.ItemDivisionRule);
    return d;
  };
  c.CZ.CHANGE_GROUP_MASTER = function () {
    this.AID = 0;
  };
  c.CZ.CHANGE_GROUP_MASTER.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2010);
    d.writeULong(this.AID);
    return d;
  };
  c.CZ.SEEK_PARTY = function () {
    this.Option = 0;
  };
  c.CZ.SEEK_PARTY.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2012);
    d.writeULong(this.Option);
    return d;
  };
  c.CZ.SEEK_PARTY_MEMBER = function () {
    this.Level = this.Job = 0;
    this.mapName = "";
    this.Option = 0;
  };
  c.CZ.SEEK_PARTY_MEMBER.prototype.build = function () {
    var d = new a(30);
    d.writeShort(2014);
    d.writeULong(this.Job);
    d.writeULong(this.Level);
    d.writeString(this.mapName, 16);
    d.writeULong(this.Option);
    return d;
  };
  c.CZ.ITEMLISTWIN_RES = function () {
    this.Action = this.Type = 0;
    this.MaterialList = [];
  };
  c.CZ.ITEMLISTWIN_RES.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = 12 + 4 * this.MaterialList.length,
      c = new a(b);
    c.writeShort(d[1]);
    c.writeShort(b);
    c.writeULong(this.Type);
    c.writeULong(this.Action);
    d = 0;
    for (b = this.MaterialList.length; d < b; ++d)
      (c.writeShort(this.MaterialList[d].id),
        c.writeShort(this.MaterialList[d].count));
    return c;
  };
  c.CH.ENTER_CHECKBOT = function () {
    this.dwAID = 0;
    this.szStringInfo = "";
  };
  c.CH.ENTER_CHECKBOT.prototype.build = function () {
    var d = 8 + this.szStringInfo.length,
      b = new a(d);
    b.writeShort(2021);
    b.writeShort(d);
    b.writeULong(this.dwAID);
    b.writeString(this.szStringInfo);
    return b;
  };
  c.CH.CHECKBOT = function () {
    this.dwAID = 0;
    this.szStringInfo = "";
  };
  c.CH.CHECKBOT.prototype.build = function () {
    var d = new a(32);
    d.writeShort(2023);
    d.writeShort(32);
    d.writeULong(this.dwAID);
    d.writeString(this.szStringInfo, 24);
    return d;
  };
  c.CZ.BATTLE_FIELD_LIST = function () {};
  c.CZ.BATTLE_FIELD_LIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2026);
    return d;
  };
  c.CZ.JOIN_BATTLE_FIELD = function () {
    this.JoinTeam = this.BFNO = 0;
  };
  c.CZ.JOIN_BATTLE_FIELD.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2028);
    d.writeULong(this.BFNO);
    d.writeShort(this.JoinTeam);
    return d;
  };
  c.CZ.CANCEL_BATTLE_FIELD = function () {
    this.BFNO = 0;
  };
  c.CZ.CANCEL_BATTLE_FIELD.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2030);
    d.writeULong(this.BFNO);
    return d;
  };
  c.CZ.REQ_BATTLE_STATE_MONITOR = function () {
    this.PowerSwitch = this.BFNO = 0;
  };
  c.CZ.REQ_BATTLE_STATE_MONITOR.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2032);
    d.writeULong(this.BFNO);
    d.writeShort(this.PowerSwitch);
    return d;
  };
  c.CZ.GM_FULLSTRIP = function () {
    this.TargetAID = 0;
  };
  c.CZ.GM_FULLSTRIP.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2037);
    d.writeULong(this.TargetAID);
    return d;
  };
  c.CZ.PC_PURCHASE_ITEMLIST_FROMMC2 = function () {
    this.UniqueID = this.AID = 0;
    this.itemList = [];
  };
  c.CZ.PC_PURCHASE_ITEMLIST_FROMMC2.prototype.build = function () {
    var d = 12 + 4 * this.itemList.length,
      b = new a(d),
      c;
    b.writeShort(2049);
    b.writeShort(d);
    b.writeULong(this.AID);
    b.writeULong(this.UniqueID);
    d = 0;
    for (c = this.itemList.length; d < c; ++d)
      (b.writeShort(this.itemList[d].count),
        b.writeShort(this.itemList[d].index));
    return b;
  };
  c.CZ.PARTY_BOOKING_REQ_REGISTER = function () {
    this.RegisterInfo = {};
  };
  c.CZ.PARTY_BOOKING_REQ_REGISTER.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    if (18 === d[2])
      for (
        b.writeShort(this.RegisterInfo.Level),
          b.writeShort(this.RegisterInfo.MapID),
          d = 0;
        6 > d;
        ++d
      )
        b.writeShort(this.RegisterInfo.Job[d]);
    else
      (b.writeShort(this.RegisterInfo.Level),
        b.writeString(this.RegisterInfo.Notice, 37));
    return b;
  };
  c.CZ.PARTY_BOOKING_REQ_SEARCH = function () {
    this.ResultCount = this.LastIndex = this.Job = this.MapID = this.Level = 0;
  };
  c.CZ.PARTY_BOOKING_REQ_SEARCH.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.writeShort(this.Level);
    b.writeShort(this.MapID);
    12 < d[2] && b.writeShort(this.Job);
    b.writeULong(this.LastIndex);
    b.writeShort(this.ResultCount);
    return b;
  };
  c.CZ.PARTY_BOOKING_REQ_DELETE = function () {};
  c.CZ.PARTY_BOOKING_REQ_DELETE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    return b;
  };
  c.CZ.PARTY_BOOKING_REQ_UPDATE = function () {
    this.Job = 0;
  };
  c.CZ.PARTY_BOOKING_REQ_UPDATE.prototype.build = function () {
    var d = new a(14);
    d.writeShort(2056);
    d.writeShort(this.Job[0]);
    d.writeShort(this.Job[1]);
    return d;
  };
  c.CZ.SIMPLE_CASH_BTNSHOW = function () {};
  c.CZ.SIMPLE_CASH_BTNSHOW.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2060);
    return d;
  };
  c.CZ.REQ_OPEN_BUYING_STORE = function () {
    this.result = this.LimitZeny = 0;
    this.storeName = "";
    this.ItemList = [];
  };
  c.CZ.REQ_OPEN_BUYING_STORE.prototype.build = function () {
    if (20180704 <= b.value) {
      var d, c, m;
      d = this.getPacketVersion();
      var h = 89 + 10 * this.ItemList.length,
        h = new a(h);
      h.writeShort(d[1]);
      h.view.setInt16(d[3], 89 + 10 * this.ItemList.length, !0);
      h.view.setUint32(d[4], this.LimitZeny, !0);
      h.view.setUint8(d[5], this.result, !0);
      h.view.setString(d[6], this.storeName, 80);
      m = d[7];
      d = 0;
      for (c = this.ItemList.length; d < c; ++d)
        (h.view.setUint32(m, this.ItemList[d]._id, !0),
          (m += 4),
          h.view.setInt16(m, this.ItemList[d]._count, !0),
          (m += 2),
          h.view.setInt32(m, this.ItemList[d]._price, !0),
          (m += 4));
    } else
      for (
        d = this.getPacketVersion(),
          h = 89 + 8 * this.ItemList.length,
          h = new a(h),
          h.writeShort(d[1]),
          h.view.setInt16(d[3], 89 + 8 * this.ItemList.length, !0),
          h.view.setUint32(d[4], this.LimitZeny, !0),
          h.view.setUint8(d[5], this.result, !0),
          h.view.setString(d[6], this.storeName, 80),
          m = d[7],
          d = 0,
          c = this.ItemList.length;
        d < c;
        ++d
      )
        (h.view.setUint16(m, this.ItemList[d]._id, !0),
          (m += 2),
          h.view.setInt16(m, this.ItemList[d]._count, !0),
          (m += 2),
          h.view.setInt32(m, this.ItemList[d]._price, !0),
          (m += 4));
    return h;
  };
  c.CZ.REQ_CLOSE_BUYING_STORE = function () {};
  c.CZ.REQ_CLOSE_BUYING_STORE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    return b;
  };
  c.CZ.REQ_CLICK_TO_BUYING_STORE = function () {
    this.makerAID = 0;
  };
  c.CZ.REQ_CLICK_TO_BUYING_STORE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.makerAID, !0);
    return b;
  };
  c.CZ.REQ_TRADE_BUYING_STORE = function () {
    this.StoreID = this.makerAID = 0;
    this.ItemList = [];
  };
  c.CZ.REQ_TRADE_BUYING_STORE.prototype.build = function () {
    if (20180704 <= b.value) {
      var d, c, m;
      d = this.getPacketVersion();
      var h = 12 + 8 * this.ItemList.length,
        h = new a(h);
      h.writeShort(d[1]);
      h.view.setInt16(d[3], 12 + 8 * this.ItemList.length, !0);
      h.view.setUint32(d[4], this.makerAID, !0);
      h.view.setUint32(d[5], this.StoreID, !0);
      m = d[6];
      d = 0;
      for (c = this.ItemList.length; d < c; ++d)
        (h.view.setUint16(m, this.ItemList[d].index, !0),
          (m += 2),
          h.view.setUint32(m, this.ItemList[d].id, !0),
          (m += 4),
          h.view.setInt16(m, this.ItemList[d].count, !0),
          (m += 2));
    } else
      for (
        d = this.getPacketVersion(),
          h = 12 + 6 * this.ItemList.length,
          h = new a(h),
          h.writeShort(d[1]),
          h.view.setInt16(d[3], 12 + 6 * this.ItemList.length, !0),
          h.view.setUint32(d[4], this.makerAID, !0),
          h.view.setUint32(d[5], this.StoreID, !0),
          m = d[6],
          d = 0,
          c = this.ItemList.length;
        d < c;
        ++d
      )
        (h.view.setUint16(m, this.ItemList[d].index, !0),
          (m += 2),
          h.view.setUint16(m, this.ItemList[d].id, !0),
          (m += 2),
          h.view.setInt16(m, this.ItemList[d].count, !0),
          (m += 2));
    return h;
  };
  c.CA.OTP_AUTH_REQ = function () {
    this.OTPCode = "";
  };
  c.CA.OTP_AUTH_REQ.prototype.build = function () {
    var d = new a(9);
    d.writeShort(2082);
    d.writeString(this.OTPCode, 7);
    return d;
  };
  c.CA.SSO_LOGIN_REQa = function () {
    this.clienttype = this.Version = 0;
    this.t1 = this.IpAddr = this.MacAddr = this.ID = "";
  };
  c.CA.SSO_LOGIN_REQa.prototype.build = function () {
    var d = 65 + this.t1.length,
      b = new a(d);
    b.writeShort(33370);
    b.writeShort(d);
    b.writeULong(this.Version);
    b.writeUChar(this.clienttype);
    b.writeString(this.ID, 24);
    b.writeBinaryString(this.MacAddr, 17);
    b.writeBinaryString(this.IpAddr, 15);
    b.writeBinaryString(this.t1);
    return b;
  };
  c.CA.SSO_LOGIN_REQ = function () {
    this.clienttype = this.Version = 0;
    this.t1 = this.IP = this.MacAdress = this.Passwd = this.ID = "";
  };
  c.CA.SSO_LOGIN_REQ.prototype.build = function () {
    var d = 92 + this.t1.length,
      b = new a(d);
    b.writeShort(2085);
    b.writeShort(d);
    b.writeULong(this.Version);
    b.writeUChar(this.clienttype);
    b.writeString(this.ID, 24);
    b.writeString(this.Passwd, 27);
    b.writeBinaryString(this.MacAdress, 17);
    b.writeBinaryString(this.IP, 15);
    b.writeBinaryString(this.t1);
    return b;
  };
  c.CH.DELETE_CHAR3_RESERVED = function () {
    this.GID = 0;
  };
  c.CH.DELETE_CHAR3_RESERVED.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2087);
    d.writeULong(this.GID);
    return d;
  };
  c.CH.DELETE_CHAR3 = function () {
    this.GID = 0;
    this.Birth = "";
  };
  c.CH.DELETE_CHAR3.prototype.build = function () {
    var d = new a(12);
    d.writeShort(2089);
    d.writeULong(this.GID);
    d.writeString(this.Birth, 6);
    return d;
  };
  c.CH.DELETE_CHAR3_CANCEL = function () {
    this.GID = 0;
  };
  c.CH.DELETE_CHAR3_CANCEL.prototype.build = function () {
    var d = new a(6);
    d.writeShort(2091);
    d.writeULong(this.GID);
    return d;
  };
  c.CZ.SEARCH_STORE_INFO = function () {
    this.CardIDList =
      this.ItemIDList =
      this.minPrice =
      this.maxPrice =
      this.StoreType =
        0;
  };
  c.CZ.SEARCH_STORE_INFO.prototype.build = function () {
    var d, b, c;
    d = this.getPacketVersion();
    var h = new a(d[2]);
    h.writeShort(d[1]);
    h.view.setInt16(
      d[3],
      15 + 2 * this.ItemIDList.length + 2 * this.CardIDList.length,
      !0,
    );
    h.view.setUint8(d[4], this.StoreType, !0);
    h.view.setUint32(d[5], this.maxPrice, !0);
    h.view.setUint32(d[6], this.minPrice, !0);
    h.view.setUint8(d[7], this.ItemIDList.length, !0);
    h.view.setUint8(d[8], this.CardIDList.length, !0);
    c = d[9];
    d = 0;
    for (b = this.ItemIDList.length; d < b; ++d)
      (h.view.setUint16(c, this.ItemIDList[d], !0), (c += 2));
    d = 0;
    for (b = this.CardIDList.length; d < b; ++d)
      (h.view.setUint16(c, this.CardIDList[d], !0), (c += 2));
    return h;
  };
  c.CZ.SEARCH_STORE_INFO_NEXT_PAGE = function () {};
  c.CZ.SEARCH_STORE_INFO_NEXT_PAGE.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    return b;
  };
  c.CZ.CLOSE_SEARCH_STORE_INFO = function () {};
  c.CZ.CLOSE_SEARCH_STORE_INFO.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    return b;
  };
  c.CZ.SSILIST_ITEM_CLICK = function () {
    this.ITID = this.SSI_ID = this.AID = 0;
  };
  c.CZ.SSILIST_ITEM_CLICK.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.AID, !0);
    b.view.setULong(d[4], this.SSI_ID, !0);
    b.view.setUShort(d[5], this.ITID, !0);
    return b;
  };
  c.CH.SELECT_ACCESSIBLE_MAPNAME = function () {
    this.mapListNum = this.CharNum = 0;
  };
  c.CH.SELECT_ACCESSIBLE_MAPNAME.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2113);
    d.writeUChar(this.CharNum);
    d.writeUChar(this.mapListNum);
    return d;
  };
  c.CZ.REMOVE_AID_SSO = function () {
    this.AID = "";
  };
  c.CZ.REMOVE_AID_SSO.prototype.build = function () {
    var d = this.getPacketVersion(),
      b = new a(d[2]);
    b.writeShort(d[1]);
    b.view.setUint32(d[3], this.AID, !0);
  };
  c.CZ.REQ_CASHSHOP_OPEN = function () {};
  c.CZ.REQ_CASHSHOP_OPEN.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2116);
    return d;
  };
  c.CZ.REQ_CASHSHOP_TAB = function () {
    this.tab = "";
  };
  c.CZ.REQ_CASHSHOP_TAB.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2118);
    d.writeShort(this.tab);
    return d;
  };
  c.CZ.REQ_CASHSHOP_BUY = function () {
    this.list = [];
    this.kafrapts = 0;
  };
  c.CZ.REQ_CASHSHOP_BUY.prototype.build = function () {
    var d = new a(10 + 10 * this.list.length);
    d.writeShort(2120);
    d.writeShort(10 + 10 * this.list.length);
    d.writeShort(this.list.length);
    d.writeLong(this.kafrapts);
    var b,
      c = this.list.length;
    for (b = 0; b < c; ++b)
      (d.writeLong(this.list[b].id),
        d.writeLong(this.list[b].count),
        d.writeShort(this.list[b].tab));
    return d;
  };
  c.CZ.REQ_CASHSHOP_CLOSE = function () {};
  c.CZ.REQ_CASHSHOP_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2122);
    return d;
  };
  c.CZ.REQ_CASHSHOP_LIST = function () {};
  c.CZ.REQ_CASHSHOP_LIST.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2249);
    return d;
  };
  c.CZ.SELECTCART = function () {
    this.type = this.AID = 0;
  };
  c.CZ.SELECTCART.prototype.build = function () {
    var d = new a(7);
    d.writeShort(2432);
    d.writeLong(this.AID);
    d.writeUChar(this.type);
    return d;
  };
  c.CZ.PET_EVOLUTION = function () {
    this.eggID = 0;
  };
  c.CZ.PET_EVOLUTION.prototype.build = function () {
    var d = new a(8);
    d.writeShort(2555);
    d.writeShort(8);
    d.writeLong(this.eggID);
    return d;
  };
  c.CZ.REQ_OPEN_UI = function () {
    this.uid = 0;
  };
  c.CZ.REQ_OPEN_UI.prototype.build = function () {
    var d = new a(3);
    d.writeShort(2664);
    d.writeUChar(this.uid);
    return d;
  };
  c.CZ.REQ_ATTENDANCE = function () {};
  c.CZ.REQ_ATTENDANCE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2799);
    return d;
  };
  c.CZ.PRIVATE_AIRSHIP_REQUEST = function () {
    this.itemid = this.type = this.y = this.x = this.mapname = 0;
  };
  c.CZ.PRIVATE_AIRSHIP_REQUEST.prototype.build = function () {
    if (20180704 <= b.value) {
      var d = new a(34);
      d.writeShort(2633);
      d.writeBinaryString(this.mapname, 16);
      d.writeULong(this.x);
      d.writeULong(this.y);
      d.writeULong(this.type);
      d.writeULong(this.itemid);
    } else
      ((d = new a(26)),
        d.writeShort(2633),
        d.writeBinaryString(this.mapname, 16),
        d.writeUShort(this.x),
        d.writeUShort(this.y),
        d.writeUShort(this.type),
        d.writeUShort(this.itemid));
    return d;
  };
  c.CZ.REFINE_ADD_ITEM = function () {
    this.index = 0;
  };
  c.CZ.REFINE_ADD_ITEM.prototype.build = function () {
    var d = new a(4);
    d.writeShort(2721);
    d.writeShort(this.index);
    return d;
  };
  c.CZ.REFINE_ITEM_REQUEST = function () {
    this.catalyst = this.material = this.index = 0;
  };
  c.CZ.REFINE_ITEM_REQUEST.prototype.build = function () {
    if (20180704 <= b.value) {
      var d = new a(9);
      d.writeShort(2723);
      d.writeShort(this.index);
      d.writeULong(this.material);
    } else
      ((d = new a(7)),
        d.writeShort(2723),
        d.writeShort(this.index),
        d.writeShort(this.material));
    d.writeUChar(this.catalyst);
    return d;
  };
  c.CZ.REFINE_WINDOW_CLOSE = function () {};
  c.CZ.REFINE_WINDOW_CLOSE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(2724);
    return d;
  };
  c.CZ.PARTY_REQ_MASTER_TO_JOIN = function () {
    this.AID = this.CID = 0;
  };
  c.CZ.PARTY_REQ_MASTER_TO_JOIN.prototype.build = function () {
    var d = new a(10);
    d.writeShort(2790);
    d.writeLong(this.CID);
    d.writeLong(this.AID);
    return d;
  };
  c.CZ.PARTY_REQ_ACK_MASTER_TO_JOIN = function () {
    this.accept = this.AID = this.CID = 0;
  };
  c.CZ.PARTY_REQ_ACK_MASTER_TO_JOIN.prototype.build = function () {
    var d = new a(11);
    d.writeShort(2808);
    d.writeLong(this.CID);
    d.writeLong(this.AID);
    d.writeUChar(this.accept);
    return d;
  };
  c.CZ.DYNAMICNPC_CREATE_REQUEST = function () {
    this.name = "";
  };
  c.CZ.DYNAMICNPC_CREATE_REQUEST.prototype.build = function () {
    var d = new a(26);
    d.writeShort(2582);
    d.writeString(this.name, 24);
    return d;
  };
  c.CH.CHECK_PIN = function () {
    this.pinCode = this.AID = 0;
  };
  c.CH.CHECK_PIN.prototype.build = function () {
    var d = new a(10);
    d.writeShort(2232);
    d.writeULong(this.AID);
    d.writeBinaryString(this.pinCode, 4);
    return d;
  };
  c.CH.REQ_PIN_BUTTON = function () {
    this.pinCode = this.AID = 0;
  };
  c.CH.REQ_PIN_BUTTON.prototype.build = function () {
    var d = new a(10);
    d.writeShort(2245);
    d.writeULong(this.AID);
    d.writeBinaryString(this.pinCode, 4);
    return d;
  };
  c.CH.CHANGE_PIN = function () {
    this.new_pinCode = this.old_pinCode = this.AID = 0;
  };
  c.CH.CHANGE_PIN.prototype.build = function () {
    var d = new a(14);
    d.writeShort(2238);
    d.writeULong(this.AID);
    d.writeBinaryString(this.old_pinCode, 4);
    d.writeBinaryString(this.new_pinCode, 4);
    return d;
  };
  c.CH.CREATE_NEW_PIN = function () {
    this.pinCode = this.AID = 0;
  };
  c.CH.CREATE_NEW_PIN.prototype.build = function () {
    var d = new a(10);
    d.writeShort(2234);
    d.writeULong(this.AID);
    d.writeBinaryString(this.pinCode, 4);
    return d;
  };
  c.CH.MAKE_CHAR2 = function () {
    this.name = "";
    this.head = this.headPal = this.CharNum = 0;
  };
  c.CH.MAKE_CHAR2.prototype.build = function () {
    var d = new a(31);
    d.writeShort(2416);
    d.writeString(this.name, 24);
    d.writeUChar(this.CharNum);
    d.writeShort(this.headPal);
    d.writeShort(this.head);
    return d;
  };
  c.CH.MAKE_CHAR3 = function () {
    this.name = "";
    this.job = this.sex = this.head = this.headPal = this.CharNum = 0;
  };
  c.CH.MAKE_CHAR3.prototype.build = function () {
    var d = new a(36);
    d.writeShort(2617);
    d.writeString(this.name, 24);
    d.writeUChar(this.CharNum);
    d.writeShort(this.headPal);
    d.writeShort(this.head);
    d.writeShort(this.job);
    d.writeShort(0);
    d.writeUChar(this.sex);
    return d;
  };
  c.CH.MAKE_CHAR3 = function () {
    this.name = "";
    this.job = this.sex = this.head = this.headPal = this.CharNum = 0;
  };
  c.CH.MAKE_CHAR3.prototype.build = function () {
    var d = new a(36);
    d.writeShort(2617);
    d.writeString(this.name, 24);
    d.writeUChar(this.CharNum);
    d.writeShort(this.headPal);
    d.writeShort(this.head);
    d.writeShort(this.job);
    d.writeShort(0);
    d.writeUChar(this.sex);
    return d;
  };
  c.CZ.REQ_CREATE_INSTANCE = function () {
    this.instanceName = "";
  };
  c.CZ.REQ_CREATE_INSTANCE.prototype.build = function () {
    var d = 4 + this.instanceName.length + 1,
      b = new a(d);
    b.writeShort(3057);
    b.writeShort(d);
    b.writeString(this.instanceName);
    return b;
  };
  c.ZC.RS_CREATE_INSTANCE = function (a, b) {
    this.rs = a.readUChar();
  };
  c.ZC.RS_CREATE_INSTANCE.size = 3;
  c.CZ.REQ_DEL_INSTANCE = function () {};
  c.CZ.REQ_DEL_INSTANCE.prototype.build = function () {
    var d = new a(2);
    d.writeShort(3059);
    return d;
  };
  c.ZC.RS_DEL_INSTANCE = function (a, b) {
    this.rs = a.readUChar();
  };
  c.ZC.RS_DEL_INSTANCE.size = 3;
  c.CZ.REQ_ENTER_INSTANCE = function () {
    this.AID = this.CID = 0;
    this.instanceName = "";
  };
  c.CZ.REQ_ENTER_INSTANCE.prototype.build = function () {
    var d = 12 + this.instanceName.length + 1,
      b = new a(d);
    b.writeShort(3061);
    b.writeShort(d);
    b.writeLong(this.CID);
    b.writeLong(this.AID);
    b.writeString(this.instanceName);
    return b;
  };
  c.ZC.RS_ENTER_INSTANCE = function (a, b) {
    this.rs = a.readUChar();
  };
  c.ZC.RS_ENTER_INSTANCE.size = 3;
  c.ZC.NPC_MARKET_OPEN = function (a, b) {
    var d = ((b - a.tell()) / 19) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].ITID = a.readULong()),
        (c[b].type = a.readUChar()),
        (c[b].price = a.readULong()),
        (c[b].qty = a.readULong()),
        (c[b].weight = a.readUShort()),
        (c[b].location = a.readULong()));
    this.itemList = c;
  };
  c.ZC.NPC_MARKET_OPEN.size = -1;
  c.ZC.NPC_MARKET_PURCHASE_RESULT = function (a, b) {
    this.rs = a.readUShort();
    var d = ((b - a.tell()) / 10) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].ITID = a.readULong()),
        (c[b].qty = a.readUShort()),
        (c[b].price = a.readULong()));
    this.itemList = c;
  };
  c.ZC.NPC_MARKET_PURCHASE_RESULT.size = -1;
  c.ZC.NPC_EXPANDED_BARTER_MARKET_ITEMINFO = function (a, b) {
    b = this.count = a.readULong();
    var d,
      c = Array(b);
    for (d = 0; d < b; ++d) {
      c[d] = {};
      c[d].ITID = a.readULong();
      c[d].type = a.readShort();
      c[d].amount = a.readULong();
      c[d].weight = a.readULong();
      c[d].index = a.readULong();
      c[d].price = a.readULong();
      c[d].wItemSpriteNumber = a.readShort();
      c[d].location = a.readULong();
      c[d].currency_count = a.readULong();
      var e = c[d],
        q = c[d].currency_count,
        k,
        g = Array(q);
      for (k = 0; k < q; ++k)
        ((g[k] = {}),
          (g[k].ITID = a.readULong()),
          (g[k].refine_level = a.readUShort()),
          (g[k].amount = a.readULong()),
          (g[k].type = a.readUShort()));
      e.currency_itemList = g;
    }
    this.itemList = c;
  };
  c.ZC.NPC_EXPANDED_BARTER_MARKET_ITEMINFO.size = -1;
  c.ZC.OPEN_REFORM_UI = function (a, b) {
    this.ITID = a.readULong();
  };
  c.ZC.OPEN_REFORM_UI.size = 6;
  c.ZC.ITEM_REFORM_ACK = function (a, b) {
    this.index = a.readUShort();
    this.result = a.readUChar();
  };
  c.ZC.ITEM_REFORM_ACK.size = 5;
  c.ZC.ADD_MEMBER_TO_GROUP3 = function (a, b) {
    this.AID = a.readULong();
    this.Role = a.readULong();
    this.Job = a.readShort();
    this.Level = a.readShort();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.state = a.readUChar();
    this.groupName = a.readString(24);
    this.characterName = a.readString(24);
    this.mapName = a.readBinaryString(16);
    this.ItemPickupRule = a.readUChar();
    this.ItemDivisionRule = a.readUChar();
  };
  c.ZC.ADD_MEMBER_TO_GROUP3.size = 85;
  c.ZC.ADD_MEMBER_TO_GROUP4 = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.Role = a.readULong();
    this.Job = a.readShort();
    this.Level = a.readShort();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.state = a.readUChar();
    this.groupName = a.readString(24);
    this.characterName = a.readString(24);
    this.mapName = a.readBinaryString(16);
    this.ItemPickupRule = a.readUChar();
    this.ItemDivisionRule = a.readUChar();
  };
  c.ZC.ADD_MEMBER_TO_GROUP4.size = 89;
  c.ZC.GROUP_LIST2 = function (a, b) {
    this.groupName = a.readString(24);
    var d = ((b - a.tell()) / 50) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].characterName = a.readString(24)),
        (c[b].mapName = a.readBinaryString(16)),
        (c[b].role = a.readUChar()),
        (c[b].state = a.readUChar()),
        (c[b].Job = a.readUShort()),
        (c[b].Level = a.readUShort()));
    this.groupInfo = c;
  };
  c.ZC.GROUP_LIST2.size = -1;
  c.ZC.GROUP_LIST3 = function (a, b) {
    this.groupName = a.readString(24);
    var d = ((b - a.tell()) / 54) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].GID = a.readULong()),
        (c[b].characterName = a.readString(24)),
        (c[b].mapName = a.readBinaryString(16)),
        (c[b].role = a.readUChar()),
        (c[b].state = a.readUChar()),
        (c[b].Job = a.readUShort()),
        (c[b].Level = a.readUShort()));
    this.groupInfo = c;
  };
  c.ZC.GROUP_LIST3.size = -1;
  c.ZC.PARTY_REQ_MASTER_TO_JOIN = function (a, b) {
    this.CID = a.readULong();
    this.AID = a.readULong();
    this.name = a.readString(24);
    this.xPos = a.readShort();
    this.yPos = a.readShort();
  };
  c.ZC.PARTY_REQ_MASTER_TO_JOIN.size = 38;
  c.ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER = function (a, b) {
    this.player_name = a.readString(24);
    this.party_name = a.readString(24);
    this.AID = a.readULong();
    this.refused = a.readULong();
  };
  c.ZC.PARTY_JOIN_REQ_ACK_FROM_MASTER.size = 58;
  c.ZC.GUILD_INFO3 = function (a, b) {
    this.GDID = a.readLong();
    this.level = a.readLong();
    this.userNum = a.readLong();
    this.maxUserNum = a.readLong();
    this.userAverageLevel = a.readLong();
    this.exp = a.readLong();
    this.maxExp = a.readLong();
    this.point = a.readLong();
    this.honor = a.readLong();
    this.virtue = a.readLong();
    this.emblemVersion = a.readLong();
    this.guildname = a.readString(24);
    this.manageLand = a.readString(16);
    this.zeny = a.readLong();
    this.master_char_id = a.readULong();
  };
  c.ZC.GUILD_INFO3.size = 94;
  c.ZC.GUILD_INFO4 = function (a, b) {
    this.GDID = a.readLong();
    this.level = a.readLong();
    this.userNum = a.readLong();
    this.maxUserNum = a.readLong();
    this.userAverageLevel = a.readLong();
    this.exp = a.readLong();
    this.maxExp = a.readLong();
    this.point = a.readLong();
    this.honor = a.readLong();
    this.virtue = a.readLong();
    this.emblemVersion = a.readLong();
    this.guildname = a.readString(24);
    this.manageLand = a.readString(16);
    this.zeny = a.readLong();
    this.master_char_id = a.readULong();
    this.master_char_name = a.readString(24);
  };
  c.ZC.GUILD_INFO4.size = 118;
  c.ZC.PKT_MC_GUILDMEMBERLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 108) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].GID = a.readULong()),
        (c[b].HeadType = a.readShort()),
        (c[b].HeadPalette = a.readShort()),
        (c[b].Sex = a.readShort()),
        (c[b].Job = a.readShort()),
        (c[b].Level = a.readShort()),
        (c[b].MemberExp = a.readLong()),
        (c[b].CurrentState = a.readLong()),
        (c[b].GPositionID = a.readLong()),
        (c[b].LastLogin = a.readULong()),
        (c[b].Memo = a.readString(50)),
        (c[b].CharName = a.readString(24)));
    this.memberInfo = c;
  };
  c.ZC.PKT_MC_GUILDMEMBERLIST2.size = -1;
  c.ZC.PARTY_JOB_AND_LEVEL = function (a, b) {
    this.AID = a.readLong();
    this.Job = a.readUShort();
    this.Level = a.readUShort();
  };
  c.ZC.PARTY_JOB_AND_LEVEL.size = 10;
  c.AC.ACCEPT_LOGIN = function (a, b) {
    this.AuthCode = a.readLong();
    this.AID = a.readULong();
    this.userLevel = a.readULong();
    this.lastLoginIP = a.readULong();
    this.lastLoginTime = a.readBinaryString(26);
    this.Sex = a.readUChar();
    var d = ((b - a.tell()) / 32) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].ip = a.readULong()),
        (c[b].port = a.readUShort()),
        (c[b].name = a.readString(20)),
        (c[b].usercount = a.readUShort()),
        (c[b].state = a.readUShort()),
        (c[b].property = a.readUShort()));
    this.ServerList = c;
  };
  c.AC.ACCEPT_LOGIN.size = -1;
  c.AC.REFUSE_LOGIN = function (a, b) {
    this.ErrorCode = a.readUChar();
    this.blockDate = a.readBinaryString(20);
  };
  c.AC.REFUSE_LOGIN.size = 23;
  c.HC.ACCEPT_ENTER_NEO_UNION = function (a, c) {
    20100413 <= b.value &&
      ((this.TotalSlotNum = a.readUChar()),
      (this.PremiumStartSlot = a.readUChar()),
      (this.PremiumEndSlot = a.readUChar()));
    this.dummy1_beginbilling = a.readChar();
    this.code = a.readLong();
    this.time1 = a.readULong();
    this.time2 = a.readULong();
    this.dummy2_endbilling = a.readBinaryString(7);
    this.charInfo = b.parseCharInfo(a, c);
  };
  c.HC.ACCEPT_ENTER_NEO_UNION.size = -1;
  c.HC.ACCEPT_ENTER_NEO_UNION2 = function (a, c) {
    20100413 <= b.value &&
      ((this.TotalSlotNum = a.readUChar()),
      (this.PremiumStartSlot = a.readUChar()),
      (this.PremiumEndSlot = a.readUChar()));
    this.dummy1_beginbilling = a.readChar();
    this.code = a.readLong();
    this.time1 = a.readULong();
    this.time2 = a.readULong();
    this.dummy2_endbilling = a.readBinaryString(7);
    this.charInfo = b.parseCharInfo(a, c);
  };
  c.HC.ACCEPT_ENTER_NEO_UNION2.size = -1;
  c.HC.REFUSE_ENTER = function (a, b) {
    this.ErrorCode = a.readUChar();
  };
  c.HC.REFUSE_ENTER.size = 3;
  c.HC.ACCEPT_MAKECHAR_NEO_UNION = function (a, c) {
    this.charinfo = b.parseCharInfo(a, c)[0];
  };
  c.HC.ACCEPT_MAKECHAR_NEO_UNION.size = 0;
  c.HC.REFUSE_MAKECHAR = function (a, b) {
    this.ErrorCode = a.readUChar();
  };
  c.HC.REFUSE_MAKECHAR.size = 3;
  c.HC.ACCEPT_DELETECHAR = function (a, b) {};
  c.HC.ACCEPT_DELETECHAR.size = 2;
  c.HC.REFUSE_DELETECHAR = function (a, b) {
    this.ErrorCode = a.readUChar();
  };
  c.HC.REFUSE_DELETECHAR.size = 3;
  c.HC.NOTIFY_ZONESVR = function (a, b) {
    this.GID = a.readULong();
    this.mapName = a.readBinaryString(16);
    this.addr = {};
    this.addr.ip = a.readULong();
    this.addr.port = a.readUShort();
  };
  c.HC.NOTIFY_ZONESVR.size = 28;
  c.HC.NOTIFY_ZONESVR2 = function (a, b) {
    this.GID = a.readULong();
    this.mapName = a.readBinaryString(16);
    this.addr = {};
    this.addr.ip = a.readULong();
    this.addr.port = a.readUShort();
    this.Unknown = a.readBinaryString(128);
  };
  c.HC.NOTIFY_ZONESVR2.size = 156;
  c.ZC.REFINE_OPEN_WINDOW = function (a, b) {};
  c.ZC.REFINE_OPEN_WINDOW.size = 2;
  c.ZC.REFINE_ADD_ITEM = function (a, c) {
    20180704 <= b.value
      ? ((this.index = a.readUShort()),
        (this.count = a.readChar()),
        (this.items = (function () {
          for (
            var d = ((c - a.tell()) / 9) | 0, b = Array(d), e = 0;
            e < d;
            ++e
          )
            ((b[e] = {}),
              (b[e].itemId = a.readULong()),
              (b[e].chance = a.readUChar()),
              (b[e].zeny = a.readULong()));
          return b;
        })()))
      : ((this.index = a.readUShort()),
        (this.count = a.readChar()),
        (this.items = (function () {
          for (
            var d = ((c - a.tell()) / 7) | 0, b = Array(d), e = 0;
            e < d;
            ++e
          )
            ((b[e] = {}),
              (b[e].itemId = a.readUShort()),
              (b[e].chance = a.readUChar()),
              (b[e].zeny = a.readULong()));
          return b;
        })()));
  };
  c.ZC.REFINE_ADD_ITEM.size = -1;
  c.ZC.UPDATE_EXP = function (a, b) {
    this.type = a.readUShort();
    this.value = a.getUint64();
  };
  c.ZC.UPDATE_EXP.size = 12;
  c.ZC.NOTIFY_EXP2 = function (a, b) {
    this.AID = a.readULong();
    this.amount = a.readLong();
    a.seek(4, SEEK_CUR);
    this.varID = a.readUShort();
    this.expType = a.readShort();
  };
  c.ZC.NOTIFY_EXP2.size = 18;
  c.ZC.ITEM_FALL_ENTRY3 = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 24),
        (this.ITAID = a.readULong()),
        (this.ITID = a.readULong()),
        (this.type = a.readUShort()),
        (this.IsIdentified = a.readUChar()),
        (this.xPos = a.readShort()),
        (this.yPos = a.readShort()),
        (this.subX = a.readUChar()),
        (this.subY = a.readUChar()),
        (this.count = a.readShort()),
        (this.canShowEffect = a.readUChar()),
        (this.dropEffect = a.readShort()))
      : ((this.size = 22),
        (this.ITAID = a.readULong()),
        (this.ITID = a.readUShort()),
        (this.type = a.readUShort()),
        (this.IsIdentified = a.readUChar()),
        (this.xPos = a.readShort()),
        (this.yPos = a.readShort()),
        (this.subX = a.readUChar()),
        (this.subY = a.readUChar()),
        (this.count = a.readShort()),
        (this.canShowEffect = a.readShort()),
        (this.dropEffect = a.getInt8()));
  };
  c.ZC.WEIGHT_LIMIT = function (a, b) {
    this.weight_rate = a.readULong();
  };
  c.ZC.WEIGHT_LIMIT.size = 6;
  c.ZC.CAMERA_INFO = function (a, b) {
    this.show = a.getInt8();
    this.range = a.readULong();
    this.rotation = a.readULong();
    this.latitude = a.readULong();
  };
  c.ZC.CAMERA_INFO.size = 15;
  c.ZC.EQUIPSWITCH_REMOVE = function (a, b) {
    this.index = a.readShort();
    this.pos = a.readULong();
    this.failed = a.readShort();
  };
  c.ZC.EQUIPSWITCH_REMOVE.size = 10;
  c.ZC.EQUIPSWITCH_LIST = function (a, b) {
    this.count = a.readShort();
    b = ((b - a.tell()) / 6) | 0;
    for (var d = Array(b), c = 0; c < b; ++c)
      ((d[c].index = a.readUShort()), (d[c].item = a.readULong()));
    this.equipswitch = d;
  };
  c.ZC.EQUIPSWITCH_LIST.size = -1;
  c.ZC.PARTY_DEAD = function (a, b) {
    this.account_id = a.readULong();
    this.isdead = a.readUChar();
  };
  c.ZC.PARTY_DEAD.size = 7;
  c.ZC.ACK_REQNAME3 = function (a, b) {
    this.AID = a.readULong();
    this.group_id = a.readULong();
    this.CName = a.readString(24);
    this.title_id = a.readString(24);
  };
  c.ZC.ACK_REQNAME3.size = 58;
  c.ZC.UI_OPEN = function (a, b) {
    this.ui_type = a.readUChar();
    this.data = a.readULong();
  };
  c.ZC.UI_OPEN.size = 7;
  c.ZC.NOTIFY_ATTENDANCE = function (a, b) {
    this.unknown = a.readULong();
    this.data = a.readULong();
  };
  c.ZC.NOTIFY_ATTENDANCE.size = 10;
  c.ZC.ACCEPT_ENTER = function (a, b) {
    this.startTime = a.readULong();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
  };
  c.ZC.ACCEPT_ENTER.size = 11;
  c.ZC.REFUSE_ENTER = function (a, b) {
    this.ErrorCode = a.readUChar();
  };
  c.ZC.REFUSE_ENTER.size = 3;
  c.ZC.NOTIFY_INITCHAR = function (a, b) {
    this.GID = a.readULong();
    this.Style = a.readShort();
    this.Item = a.readUChar();
  };
  c.ZC.NOTIFY_INITCHAR.size = 11;
  c.ZC.NOTIFY_UPDATECHAR = function (a, b) {
    this.GID = a.readULong();
    this.Style = a.readShort();
    this.Item = a.readUChar();
  };
  c.ZC.NOTIFY_UPDATECHAR.size = 9;
  c.ZC.NOTIFY_UPDATEPLAYER = function (a, b) {
    this.Style = a.readShort();
    this.Item = a.readUChar();
  };
  c.ZC.NOTIFY_UPDATEPLAYER.size = 5;
  c.ZC.NOTIFY_STANDENTRY = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readShort();
    this.accessory = a.readShort();
    this.shield = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.spr_idx = a.readShort();
    this.effect_idx = a.readShort();
    this.scale = a.readUChar();
  };
  c.ZC.NOTIFY_STANDENTRY.size = 58;
  c.ZC.NOTIFY_NEWENTRY = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readShort();
    this.accessory = a.readShort();
    this.shield = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_NEWENTRY.size = 53;
  c.ZC.NOTIFY_ACTENTRY = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readShort();
    this.accessory = a.readShort();
    this.shield = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.action = a.readUChar();
    this.actStartTime = a.readULong();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_ACTENTRY.size = 58;
  c.ZC.NOTIFY_MOVEENTRY = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readShort();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.shield = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_MOVEENTRY.size = 60;
  c.ZC.NOTIFY_STANDENTRY_NPC = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readShort();
    this.accessory = a.readShort();
    this.job = a.readShort();
    this.shield = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
  };
  c.ZC.NOTIFY_STANDENTRY_NPC.size = 42;
  c.ZC.NOTIFY_TIME = function (a, b) {
    this.time = a.readULong();
  };
  c.ZC.NOTIFY_TIME.size = 6;
  c.ZC.NOTIFY_VANISH = function (a, b) {
    this.GID = a.readULong();
    this.type = a.readUChar();
  };
  c.ZC.NOTIFY_VANISH.size = 7;
  c.SC.NOTIFY_BAN = function (a, b) {
    this.ErrorCode = a.readUChar();
  };
  c.SC.NOTIFY_BAN.size = 3;
  c.ZC.ACCEPT_QUIT = function (a, b) {};
  c.ZC.ACCEPT_QUIT.size = 2;
  c.ZC.REFUSE_QUIT = function (a, b) {};
  c.ZC.REFUSE_QUIT.size = 2;
  c.ZC.NOTIFY_MOVE = function (a, b) {
    this.GID = a.readULong();
    this.MoveData = a.readPos2();
    this.moveStartTime = a.readULong();
  };
  c.ZC.NOTIFY_MOVE.size = 16;
  c.ZC.NOTIFY_PLAYERMOVE = function (a, b) {
    this.moveStartTime = a.readULong();
    this.MoveData = a.readPos2();
  };
  c.ZC.NOTIFY_PLAYERMOVE.size = 12;
  c.ZC.STOPMOVE = function (a, b) {
    this.AID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
  };
  c.ZC.STOPMOVE.size = 10;
  c.ZC.NOTIFY_ACT = function (a, b) {
    this.GID = a.readULong();
    this.targetGID = a.readULong();
    this.startTime = a.readULong();
    this.attackMT = a.readLong();
    this.attackedMT = a.readLong();
    this.damage = a.readShort();
    this.count = a.readShort();
    this.action = a.readUChar();
    this.leftDamage = a.readShort();
  };
  c.ZC.NOTIFY_ACT.size = 29;
  c.ZC.NOTIFY_ACT_POSITION = function (a, b) {
    this.GID = a.readULong();
    this.targetGID = a.readULong();
    this.startTime = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.damage = a.readShort();
    this.count = a.readShort();
    this.action = a.readUChar();
  };
  c.ZC.NOTIFY_ACT_POSITION.size = 23;
  c.ZC.NOTIFY_CHAT = function (a, b) {
    this.GID = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_CHAT.size = -1;
  c.ZC.NOTIFY_PLAYERCHAT = function (a, b) {
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_PLAYERCHAT.size = -1;
  c.ZC.ENTRY_ACK = function (a, b) {
    this.Header = a.readShort();
    this.AID = a.readLong();
  };
  c.ZC.ENTRY_ACK.size = 6;
  c.ZC.NPCACK_MAPMOVE = function (a, b) {
    this.mapName = a.readBinaryString(16);
    this.xPos = a.readShort();
    this.yPos = a.readShort();
  };
  c.ZC.NPCACK_MAPMOVE.size = 22;
  c.ZC.NPCACK_SERVERMOVE = function (a, b) {
    this.mapName = a.readBinaryString(16);
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.addr = {};
    this.addr.ip = a.readULong();
    this.addr.port = a.readUShort();
  };
  c.ZC.NPCACK_SERVERMOVE.size = 28;
  c.ZC.NPCACK_ENABLE = function (a, b) {};
  c.ZC.NPCACK_ENABLE.size = 2;
  c.ZC.ACK_REQNAME = function (a, b) {
    this.AID = a.readULong();
    this.CName = a.readString(24);
  };
  c.ZC.ACK_REQNAME.size = 30;
  c.ZC.UNK1 = function (a, b) {
    this.unk = a.readUShort();
  };
  c.ZC.UNK1.size = 4;
  c.ZC.WHISPER = function (a, b) {
    this.sGID = a.readULong();
    this.sender = a.readString(24);
    this.isAdmin = a.readUChar();
    0 !== this.isAdmin && 1 !== this.isAdmin && a.seek(-4, SEEK_CUR);
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.WHISPER.size = -1;
  c.ZC.ACK_WHISPER = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_WHISPER.size = 3;
  c.ZC.BROADCAST = function (a, b) {
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.BROADCAST.size = -1;
  c.ZC.CHANGE_DIRECTION = function (a, b) {
    this.AID = a.readULong();
    this.headDir = a.readShort();
    this.dir = a.readUChar();
  };
  c.ZC.CHANGE_DIRECTION.size = 9;
  c.ZC.ITEM_ENTRY = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 19),
        (this.ITAID = a.readULong()),
        (this.ITID = a.readULong()))
      : ((this.size = 17),
        (this.ITAID = a.readULong()),
        (this.ITID = a.readUShort()));
    this.IsIdentified = a.readUChar();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.count = a.readShort();
    this.subX = a.readUChar();
    this.subY = a.readUChar();
  };
  c.ZC.ITEM_FALL_ENTRY = function (a, b) {
    this.ITAID = a.readULong();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.subX = a.readUChar();
    this.subY = a.readUChar();
    this.count = a.readShort();
  };
  c.ZC.ITEM_FALL_ENTRY.size = 17;
  c.ZC.ITEM_PICKUP_ACK = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readUShort();
    this.type = a.readUChar();
    this.result = a.readUChar();
  };
  c.ZC.ITEM_PICKUP_ACK.size = 23;
  c.ZC.ITEM_DISAPPEAR = function (a, b) {
    this.ITAID = a.readULong();
  };
  c.ZC.ITEM_DISAPPEAR.size = 6;
  c.ZC.NORMAL_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 10) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()));
    this.itemInfo = c;
  };
  c.ZC.NORMAL_ITEMLIST.size = -1;
  c.ZC.EQUIPMENT_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 20) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.itemInfo = c;
  };
  c.ZC.EQUIPMENT_ITEMLIST.size = -1;
  c.ZC.STORE_NORMAL_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 10) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()));
    this.itemInfo = c;
  };
  c.ZC.STORE_NORMAL_ITEMLIST.size = -1;
  c.ZC.STORE_EQUIPMENT_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 20) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.itemInfo = c;
  };
  c.ZC.STORE_EQUIPMENT_ITEMLIST.size = -1;
  c.ZC.USE_ITEM_ACK = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.USE_ITEM_ACK.size = 7;
  c.ZC.REQ_WEAR_EQUIP_ACK = function (a, c) {
    this.index = a.readUShort();
    this.wearLocation = a.readUShort();
    20100629 <= b.value && (this.viewid = a.readUShort());
    this.result = a.readUChar();
  };
  c.ZC.REQ_WEAR_EQUIP_ACK.size = 0;
  c.ZC.REQ_TAKEOFF_EQUIP_ACK = function (a, b) {
    this.index = a.readUShort();
    this.wearLocation = a.readUShort();
    this.result = a.readUChar();
  };
  c.ZC.REQ_TAKEOFF_EQUIP_ACK.size = 7;
  c.ZC.ITEM_THROW_ACK = function (a, b) {
    this.Index = a.readUShort();
    this.count = a.readShort();
  };
  c.ZC.ITEM_THROW_ACK.size = 6;
  c.ZC.PAR_CHANGE = function (a, b) {
    this.varID = a.readUShort();
    this.count = a.readLong();
  };
  c.ZC.PAR_CHANGE.size = 8;
  c.ZC.LONGPAR_CHANGE = function (a, b) {
    this.varID = a.readUShort();
    this.amount = a.readLong();
  };
  c.ZC.LONGPAR_CHANGE.size = 8;
  c.ZC.RESTART_ACK = function (a, b) {
    this.type = a.readUChar();
  };
  c.ZC.RESTART_ACK.size = 3;
  c.ZC.SAY_DIALOG = function (a, b) {
    this.NAID = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.SAY_DIALOG.size = -1;
  c.ZC.WAIT_DIALOG = function (a, b) {
    this.NAID = a.readULong();
  };
  c.ZC.WAIT_DIALOG.size = 6;
  c.ZC.CLOSE_DIALOG = function (a, b) {
    this.NAID = a.readULong();
  };
  c.ZC.CLOSE_DIALOG.size = 6;
  c.ZC.MENU_LIST = function (a, b) {
    this.NAID = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.MENU_LIST.size = -1;
  c.ZC.STATUS_CHANGE_ACK = function (a, b) {
    this.statusID = a.readUShort();
    this.result = a.readUChar();
    this.value = a.readUChar();
  };
  c.ZC.STATUS_CHANGE_ACK.size = 6;
  c.ZC.STATUS = function (a, b) {
    this.point = a.readShort();
    this.str = a.readUChar();
    this.standardStr = a.readUChar();
    this.agi = a.readUChar();
    this.standardAgi = a.readUChar();
    this.vit = a.readUChar();
    this.standardVit = a.readUChar();
    this.Int = a.readUChar();
    this.standardInt = a.readUChar();
    this.dex = a.readUChar();
    this.standardDex = a.readUChar();
    this.luk = a.readUChar();
    this.standardLuk = a.readUChar();
    this.attPower = a.readShort();
    this.refiningPower = a.readShort();
    this.max_mattPower = a.readShort();
    this.min_mattPower = a.readShort();
    this.itemdefPower = a.readShort();
    this.plusdefPower = a.readShort();
    this.mdefPower = a.readShort();
    this.plusmdefPower = a.readShort();
    this.hitSuccessValue = a.readShort();
    this.avoidSuccessValue = a.readShort();
    this.plusAvoidSuccessValue = a.readShort();
    this.criticalSuccessValue = a.readShort();
    this.ASPD = a.readShort();
    this.plusASPD = a.readShort();
  };
  c.ZC.STATUS.size = 44;
  c.ZC.STATUS_CHANGE = function (a, b) {
    this.statusID = a.readUShort();
    this.value = a.readUChar();
  };
  c.ZC.STATUS_CHANGE.size = 5;
  c.ZC.EMOTION = function (a, b) {
    this.GID = a.readULong();
    this.type = a.readUChar();
  };
  c.ZC.EMOTION.size = 7;
  c.ZC.USER_COUNT = function (a, b) {
    this.count = a.readLong();
  };
  c.ZC.USER_COUNT.size = 6;
  c.ZC.SPRITE_CHANGE = function (a, b) {
    this.GID = a.readULong();
    this.type = a.readUChar();
    this.value = a.readUChar();
  };
  c.ZC.SPRITE_CHANGE.size = 8;
  c.ZC.SELECT_DEALTYPE = function (a, b) {
    this.NAID = a.readULong();
  };
  c.ZC.SELECT_DEALTYPE.size = 6;
  c.ZC.PC_PURCHASE_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 11) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].discountprice = a.readLong()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readUShort()));
    this.itemList = c;
  };
  c.ZC.PC_PURCHASE_ITEMLIST.size = -1;
  c.ZC.PC_SELL_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 10) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].price = a.readLong()),
        (c[b].overchargeprice = a.readLong()));
    this.itemList = c;
  };
  c.ZC.PC_SELL_ITEMLIST.size = -1;
  c.ZC.PC_PURCHASE_RESULT = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.PC_PURCHASE_RESULT.size = 3;
  c.ZC.PC_SELL_RESULT = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.PC_SELL_RESULT.size = 3;
  c.ZC.ACK_DISCONNECT_CHARACTER = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_DISCONNECT_CHARACTER.size = 3;
  c.ZC.SETTING_WHISPER_PC = function (a, b) {
    this.type = a.readUChar();
    this.result = a.readUChar();
  };
  c.ZC.SETTING_WHISPER_PC.size = 4;
  c.ZC.SETTING_WHISPER_STATE = function (a, b) {
    this.type = a.readUChar();
    this.result = a.readUChar();
  };
  c.ZC.SETTING_WHISPER_STATE.size = 4;
  c.ZC.WHISPER_LIST = function (a, b) {
    var d = ((b - a.tell()) / 24) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b) ((c[b] = {}), (c[b].name = a.readString(24)));
    this.wisperList = c;
  };
  c.ZC.WHISPER_LIST.size = -1;
  c.ZC.ACK_CREATE_CHATROOM = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_CREATE_CHATROOM.size = 3;
  c.ZC.ROOM_NEWENTRY = function (a, b) {
    this.AID = a.readULong();
    this.roomID = a.readULong();
    this.maxcount = a.readShort();
    this.curcount = a.readShort();
    this.type = a.readUChar();
    this.title = a.readString(b - a.tell());
  };
  c.ZC.ROOM_NEWENTRY.size = -1;
  c.ZC.DESTROY_ROOM = function (a, b) {
    this.roomID = a.readULong();
  };
  c.ZC.DESTROY_ROOM.size = 6;
  c.ZC.REFUSE_ENTER_ROOM = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.REFUSE_ENTER_ROOM.size = 3;
  c.ZC.ENTER_ROOM = function (a, b) {
    this.roomID = a.readULong();
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].role = a.readULong()),
        (c[b].name = a.readString(24)));
    this.memberList = c;
  };
  c.ZC.ENTER_ROOM.size = -1;
  c.ZC.MEMBER_NEWENTRY = function (a, b) {
    this.curcount = a.readShort();
    this.name = a.readString(24);
  };
  c.ZC.MEMBER_NEWENTRY.size = 28;
  c.ZC.MEMBER_EXIT = function (a, b) {
    this.curcount = a.readShort();
    this.name = a.readString(24);
    this.type = a.readUChar();
  };
  c.ZC.MEMBER_EXIT.size = 29;
  c.ZC.CHANGE_CHATROOM = function (a, b) {
    this.AID = a.readULong();
    this.roomID = a.readULong();
    this.maxcount = a.readShort();
    this.curcount = a.readShort();
    this.type = a.readUChar();
    this.title = a.readString(b - a.tell());
  };
  c.ZC.CHANGE_CHATROOM.size = -1;
  c.ZC.ROLE_CHANGE = function (a, b) {
    this.role = a.readULong();
    this.name = a.readString(24);
  };
  c.ZC.ROLE_CHANGE.size = 30;
  c.ZC.REQ_EXCHANGE_ITEM = function (a, b) {
    this.name = a.readString(24);
  };
  c.ZC.REQ_EXCHANGE_ITEM.size = 26;
  c.ZC.ACK_EXCHANGE_ITEM = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_EXCHANGE_ITEM.size = 3;
  c.ZC.ADD_EXCHANGE_ITEM = function (a, b) {
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
  };
  c.ZC.ADD_EXCHANGE_ITEM.size = 19;
  c.ZC.ACK_ADD_EXCHANGE_ITEM = function (a, b) {
    this.Index = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.ACK_ADD_EXCHANGE_ITEM.size = 5;
  c.ZC.CONCLUDE_EXCHANGE_ITEM = function (a, b) {
    this.who = a.readUChar();
  };
  c.ZC.CONCLUDE_EXCHANGE_ITEM.size = 3;
  c.ZC.CANCEL_EXCHANGE_ITEM = function (a, b) {};
  c.ZC.CANCEL_EXCHANGE_ITEM.size = 2;
  c.ZC.EXEC_EXCHANGE_ITEM = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.EXEC_EXCHANGE_ITEM.size = 3;
  c.ZC.EXCHANGEITEM_UNDO = function (a, b) {};
  c.ZC.EXCHANGEITEM_UNDO.size = 2;
  c.ZC.NOTIFY_STOREITEM_COUNTINFO = function (a, b) {
    this.curCount = a.readShort();
    this.maxCount = a.readShort();
  };
  c.ZC.NOTIFY_STOREITEM_COUNTINFO.size = 6;
  c.ZC.ADD_ITEM_TO_STORE = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
  };
  c.ZC.ADD_ITEM_TO_STORE.size = 21;
  c.ZC.DELETE_ITEM_FROM_STORE = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
  };
  c.ZC.DELETE_ITEM_FROM_STORE.size = 8;
  c.ZC.CLOSE_STORE = function (a, b) {};
  c.ZC.CLOSE_STORE.size = 2;
  c.ZC.ACK_MAKE_GROUP = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_MAKE_GROUP.size = 3;
  c.ZC.GROUP_LIST = function (a, b) {
    this.groupName = a.readString(24);
    var d = ((b - a.tell()) / 46) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].characterName = a.readString(24)),
        (c[b].mapName = a.readBinaryString(16)),
        (c[b].role = a.readUChar()),
        (c[b].state = a.readUChar()));
    this.groupInfo = c;
  };
  c.ZC.GROUP_LIST.size = -1;
  c.ZC.ACK_REQ_JOIN_GROUP = function (a, b) {
    this.characterName = a.readString(24);
    this.answer = a.readUChar();
  };
  c.ZC.ACK_REQ_JOIN_GROUP.size = 27;
  c.ZC.REQ_JOIN_GROUP = function (a, b) {
    this.GRID = a.readULong();
    this.groupName = a.readString(24);
  };
  c.ZC.REQ_JOIN_GROUP.size = 30;
  c.ZC.GROUPINFO_CHANGE = function (a, b) {
    this.expOption = a.readULong();
  };
  c.ZC.GROUPINFO_CHANGE.size = 6;
  c.ZC.ADD_MEMBER_TO_GROUP = function (a, b) {
    this.AID = a.readULong();
    this.Role = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.state = a.readUChar();
    this.groupName = a.readString(24);
    this.characterName = a.readString(24);
    this.mapName = a.readBinaryString(16);
  };
  c.ZC.ADD_MEMBER_TO_GROUP.size = 79;
  c.ZC.DELETE_MEMBER_FROM_GROUP = function (a, b) {
    this.AID = a.readULong();
    this.characterName = a.readString(24);
    this.result = a.readUChar();
  };
  c.ZC.DELETE_MEMBER_FROM_GROUP.size = 31;
  c.ZC.NOTIFY_HP_TO_GROUPM = function (a, b) {
    this.AID = a.readULong();
    this.hp = a.readShort();
    this.maxhp = a.readShort();
  };
  c.ZC.NOTIFY_HP_TO_GROUPM.size = 10;
  c.ZC.NOTIFY_POSITION_TO_GROUPM = function (a, b) {
    this.AID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
  };
  c.ZC.NOTIFY_POSITION_TO_GROUPM.size = 10;
  c.ZC.NOTIFY_CHAT_PARTY = function (a, b) {
    this.AID = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_CHAT_PARTY.size = -1;
  c.ZC.MVP_GETTING_ITEM = function (a, b) {
    this.ITID = a.readULong();
  };
  c.ZC.MVP_GETTING_ITEM.size = 6;
  c.ZC.MVP_GETTING_SPECIAL_EXP = function (a, b) {
    this.exp = a.readULong();
  };
  c.ZC.MVP_GETTING_SPECIAL_EXP.size = 6;
  c.ZC.MVP = function (a, b) {
    this.AID = a.readULong();
  };
  c.ZC.MVP.size = 6;
  c.ZC.THROW_MVPITEM = function (a, b) {};
  c.ZC.THROW_MVPITEM.size = 2;
  c.ZC.SKILLINFO_UPDATE = function (a, b) {
    this.SKID = a.readUShort();
    this.level = a.readShort();
    this.spcost = a.readShort();
    this.attackRange = a.readShort();
    this.upgradable = a.readUChar();
  };
  c.ZC.SKILLINFO_UPDATE.size = 11;
  c.ZC.SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.SKILLINFO_LIST.size = -1;
  c.ZC.ATTACK_SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.ATTACK_SKILLINFO_LIST.size = -1;
  c.ZC.ADDIS_SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.ADDIS_SKILLINFO_LIST.size = -1;
  c.ZC.TOUCH_SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.TOUCH_SKILLINFO_LIST.size = -1;
  c.ZC.QOATTACK_SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.QOATTACK_SKILLINFO_LIST.size = -1;
  c.ZC.SECOND_CHECK = function (a, b) {
    this.pincode = a.readULong();
    this.AID = a.readULong();
  };
  c.ZC.SECOND_CHECK.size = 10;
  c.ZC.CARDCONNECTION_RECHARGE_LIST = function (a, c) {
    if (20180704 <= b.value) {
      var d = (this.classNum = a.readChar());
      this.classInfos = (function () {
        for (var b = [], c = 0; c < d; c++) {
          b[c] = {};
          b[c].level = a.readChar();
          b[c].enable = a.readChar();
          b[c].data = [];
          for (var e = 0; e < b[c].level; e++)
            ((b[c].data[e] = {}),
              (b[c].data[e].activate = a.readChar()),
              (b[c].data[e].recharge0 = a.readULong()),
              (b[c].data[e].recharge1 = a.readULong()),
              (b[c].data[e].recharge2 = a.readULong()),
              (b[c].data[e].recharge3 = a.readULong()),
              (b[c].data[e].recharge4 = a.readULong()),
              (b[c].data[e].recharge5 = a.readULong()),
              (b[c].data[e].recharge6 = a.readULong()),
              (b[c].data[e].recharge7 = a.readULong()));
        }
        return b;
      })();
    } else
      ((d = this.classNum = a.readChar()),
        (this.classInfos = (function () {
          for (var b = [], c = 0; c < d; c++) {
            b[c] = {};
            b[c].level = a.readChar();
            b[c].enable = a.readChar();
            b[c].data = [];
            for (var e = 0; e < b[c].level; e++)
              ((b[c].data[e] = {}),
                (b[c].data[e].activate = a.readChar()),
                (b[c].data[e].recharge0 = a.readChar()),
                (b[c].data[e].recharge1 = a.readChar()),
                (b[c].data[e].recharge2 = a.readChar()),
                (b[c].data[e].recharge3 = a.readChar()),
                (b[c].data[e].recharge4 = a.readChar()),
                (b[c].data[e].recharge5 = a.readChar()),
                (b[c].data[e].recharge6 = a.readChar()),
                (b[c].data[e].recharge7 = a.readChar()));
          }
          return b;
        })()));
  };
  c.ZC.CARDCONNECTION_RECHARGE_LIST.size = -1;
  c.ZC.CARDCONNECTION_RECHARGE_UPDATE = function (a, b) {
    this.tab = a.readChar();
    this.level = a.readChar();
    this.cardid = a.readULong();
    this.state = a.readChar();
  };
  c.ZC.CARDCONNECTION_RECHARGE_UPDATE.size = 9;
  c.ZC.BROADCAST_ITEMREFINING_RESULT = function (a, b) {
    this.name = a.readString(24);
    this.itemID = a.readULong();
    this.refine_level = a.readChar();
    this.status = a.readChar();
  };
  c.ZC.BROADCAST_ITEMREFINING_RESULT.size = 32;
  c.ZC.CARDCONNECTION_ACTIVATE_UPDATE = function (a, b) {
    this.tab = a.readChar();
    this.level = a.readChar();
    this.state = a.readChar();
  };
  c.ZC.CARDCONNECTION_ACTIVATE_UPDATE.size = 5;
  c.ZC.CARDCONNECTION_ENABLE_UPDATE = function (a, b) {
    this.tab = a.readChar();
    this.enable = a.readChar();
    this.state = a.readChar();
  };
  c.ZC.CARDCONNECTION_ENABLE_UPDATE.size = 5;
  c.ZC.CARDCONNECTION_CANCEL_UPDATE = function (a, b) {
    this.tab = a.readChar();
    this.level = a.readChar();
    this.cardid = a.readULong();
    this.state = a.readChar();
  };
  c.ZC.CARDCONNECTION_CANCEL_UPDATE.size = 9;
  c.ZC.ACK_TOUSESKILL = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 14),
        (this.SKID = a.readUShort()),
        (this.btype = a.readLong()),
        (this.itemId = a.readULong()))
      : ((this.size = 10),
        (this.SKID = a.readUShort()),
        (this.NUM = a.readULong()));
    this.result = a.readUChar();
    this.cause = a.readUChar();
  };
  c.ZC.ADD_SKILL = function (a, b) {
    this.data = {};
    this.data.SKID = a.readUShort();
    this.data.type = a.readLong();
    this.data.level = a.readShort();
    this.data.spcost = a.readShort();
    this.data.attackRange = a.readShort();
    this.data.skillName = a.readBinaryString(24);
    this.data.upgradable = a.readUChar();
  };
  c.ZC.ADD_SKILL.size = 39;
  c.ZC.ADD_SKILL2 = function (a, b) {
    this.data = {};
    this.data.SKID = a.readUShort();
    this.data.type = a.readLong();
    this.data.level = a.readShort();
    this.data.spcost = a.readShort();
    this.data.attackRange = a.readShort();
    this.data.upgradable = a.readUChar();
    this.data.level2 = a.readShort();
  };
  c.ZC.ADD_SKILL2.size = 17;
  c.ZC.NOTIFY_SKILL = function (a, b) {
    this.SKID = a.readUShort();
    this.AID = a.readULong();
    this.targetID = a.readULong();
    this.startTime = a.readULong();
    this.attackMT = a.readLong();
    this.attackedMT = a.readLong();
    this.damage = a.readShort();
    this.level = a.readShort();
    this.count = a.readShort();
    this.action = a.readUChar();
  };
  c.ZC.NOTIFY_SKILL.size = 31;
  c.ZC.NOTIFY_SKILL_POSITION = function (a, b) {
    this.SKID = a.readUShort();
    this.AID = a.readULong();
    this.targetID = a.readULong();
    this.startTime = a.readULong();
    this.attackMT = a.readLong();
    this.attackedMT = a.readLong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.damage = a.readShort();
    this.level = a.readShort();
    this.count = a.readShort();
    this.action = a.readUChar();
  };
  c.ZC.NOTIFY_SKILL_POSITION.size = 35;
  c.ZC.NOTIFY_GROUNDSKILL = function (a, b) {
    this.SKID = a.readUShort();
    this.AID = a.readULong();
    this.level = a.readShort();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.startTime = a.readULong();
  };
  c.ZC.NOTIFY_GROUNDSKILL.size = 18;
  c.ZC.STATE_CHANGE = function (a, b) {
    this.AID = a.readULong();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.isPKModeON = a.readUChar();
  };
  c.ZC.STATE_CHANGE.size = 13;
  c.ZC.USE_SKILL = function (a, b) {
    this.SKID = a.readUShort();
    this.level = a.readShort();
    this.targetAID = a.readULong();
    this.srcAID = a.readULong();
    this.result = a.readUChar();
  };
  c.ZC.USE_SKILL.size = 15;
  c.ZC.USE_SKILL2 = function (a, b) {
    this.SKID = a.readUShort();
    this.level = a.readLong();
    this.targetAID = a.readULong();
    this.srcAID = a.readULong();
    this.result = a.readUChar();
  };
  c.ZC.USE_SKILL.size = 17;
  c.ZC.WARPLIST = function (a, b) {
    this.SKID = a.readUShort();
    b = Array(4);
    for (var d = 0; 4 > d; ++d) b[d] = a.readBinaryString(16);
    this.mapName = b;
  };
  c.ZC.WARPLIST.size = 68;
  c.ZC.WARPLIST2 = function (a, b) {
    this.SKID = a.readUShort();
    b = (b - a.tell()) / 16;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readBinaryString(16);
    this.mapName = d;
  };
  c.ZC.WARPLIST2.size = -1;
  c.ZC.ACK_REMEMBER_WARPPOINT = function (a, b) {
    this.errorCode = a.readUChar();
  };
  c.ZC.ACK_REMEMBER_WARPPOINT.size = 3;
  c.ZC.SKILL_ENTRY = function (a, b) {
    this.AID = a.readULong();
    this.creatorAID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.job = a.readUChar();
    this.isVisible = a.readUChar();
  };
  c.ZC.SKILL_ENTRY.size = 16;
  c.ZC.SKILL_DISAPPEAR = function (a, b) {
    this.AID = a.readULong();
  };
  c.ZC.SKILL_DISAPPEAR.size = 6;
  c.ZC.NOTIFY_CARTITEM_COUNTINFO = function (a, b) {
    this.curCount = a.readShort();
    this.maxCount = a.readShort();
    this.curWeight = a.readLong();
    this.maxWeight = a.readLong();
  };
  c.ZC.NOTIFY_CARTITEM_COUNTINFO.size = 14;
  c.ZC.CART_EQUIPMENT_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 20) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.itemInfo = c;
  };
  c.ZC.CART_EQUIPMENT_ITEMLIST.size = -1;
  c.ZC.CART_NORMAL_ITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 10) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()));
    this.itemInfo = c;
  };
  c.ZC.CART_NORMAL_ITEMLIST.size = -1;
  c.ZC.ADD_ITEM_TO_CART = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
  };
  c.ZC.ADD_ITEM_TO_CART.size = 21;
  c.ZC.DELETE_ITEM_FROM_CART = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
  };
  c.ZC.DELETE_ITEM_FROM_CART.size = 8;
  c.ZC.CARTOFF = function (a, b) {};
  c.ZC.CARTOFF.size = 2;
  c.ZC.ACK_ADDITEM_TO_CART = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_ADDITEM_TO_CART.size = 3;
  c.ZC.OPENSTORE = function (a, b) {
    this.itemcount = a.readShort();
  };
  c.ZC.OPENSTORE.size = 4;
  c.ZC.OPENSTORE2 = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.OPENSTORE2.size = 3;
  c.ZC.STORE_ENTRY = function (a, b) {
    this.makerAID = a.readULong();
    this.storeName = a.readString(80);
  };
  c.ZC.STORE_ENTRY.size = 86;
  c.ZC.DISAPPEAR_ENTRY = function (a, b) {
    this.makerAID = a.readULong();
  };
  c.ZC.DISAPPEAR_ENTRY.size = 6;
  c.ZC.PC_PURCHASE_ITEMLIST_FROMMC = function (a, b) {
    this.AID = a.readULong();
    var d = ((b - a.tell()) / 22) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].count = a.readShort()),
        (c[b].index = a.readShort()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readUShort()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.itemList = c;
  };
  c.ZC.PC_PURCHASE_ITEMLIST_FROMMC.size = -1;
  c.ZC.PC_PURCHASE_RESULT_FROMMC = function (a, b) {
    this.index = a.readShort();
    this.curcount = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.PC_PURCHASE_RESULT_FROMMC.size = 7;
  c.ZC.PC_PURCHASE_MYITEMLIST = function (a, b) {
    this.AID = a.readULong();
    var d = ((b - a.tell()) / 47) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].index = a.readShort()),
        (c[b].count = a.readShort()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readUShort()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].options = {}),
        (c[b].options.Index0 = a.readUShort()),
        (c[b].options.Value0 = a.readUShort()),
        (c[b].options.Param0 = a.readUChar()),
        (c[b].options.Index1 = a.readUShort()),
        (c[b].options.Value1 = a.readUShort()),
        (c[b].options.Param1 = a.readUChar()),
        (c[b].options.Index2 = a.readUShort()),
        (c[b].options.Value2 = a.readUShort()),
        (c[b].options.Param2 = a.readUChar()),
        (c[b].options.Index3 = a.readUShort()),
        (c[b].options.Value3 = a.readUShort()),
        (c[b].options.Param3 = a.readUChar()),
        (c[b].options.Index4 = a.readUShort()),
        (c[b].options.Value4 = a.readUShort()),
        (c[b].options.Param4 = a.readUChar()));
    this.itemList = c;
  };
  c.ZC.PC_PURCHASE_MYITEMLIST.size = -1;
  c.ZC.PC_PURCHASE_MYITEMLIST2 = function (a, b) {
    this.AID = a.readULong();
    var d = ((b - a.tell()) / 58) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readULong()),
        (c[b].index = a.readShort()),
        (c[b].count = a.readShort()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readLong()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readLong()),
        (c[b].slot.card2 = a.readLong()),
        (c[b].slot.card3 = a.readLong()),
        (c[b].slot.card4 = a.readLong()),
        (c[b].options = {}),
        (c[b].options.Index0 = a.readUShort()),
        (c[b].options.Value0 = a.readUShort()),
        (c[b].options.Param0 = a.readUChar()),
        (c[b].options.Index1 = a.readUShort()),
        (c[b].options.Value1 = a.readUShort()),
        (c[b].options.Param1 = a.readUChar()),
        (c[b].options.Index2 = a.readUShort()),
        (c[b].options.Value2 = a.readUShort()),
        (c[b].options.Param2 = a.readUChar()),
        (c[b].options.Index3 = a.readUShort()),
        (c[b].options.Value3 = a.readUShort()),
        (c[b].options.Param3 = a.readUChar()),
        (c[b].options.Index4 = a.readUShort()),
        (c[b].options.Value4 = a.readUShort()),
        (c[b].options.Param4 = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].enchantgrade = a.readUChar()));
    this.itemList = c;
  };
  c.ZC.PC_PURCHASE_MYITEMLIST2.size = -1;
  c.ZC.DELETEITEM_FROM_MCSTORE = function (a, b) {
    this.index = a.readShort();
    this.count = a.readShort();
  };
  c.ZC.DELETEITEM_FROM_MCSTORE.size = 6;
  c.ZC.DELETEITEM_FROM_MCSTORE2 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readShort();
    this.GID = a.readULong();
    this.Date = a.readULong();
    this.zeny = a.readLong();
  };
  c.ZC.DELETEITEM_FROM_MCSTORE2.size = 18;
  c.ZC.ATTACK_FAILURE_FOR_DISTANCE = function (a, b) {
    this.targetAID = a.readULong();
    this.targetXPos = a.readShort();
    this.targetYPos = a.readShort();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.currentAttRange = a.readShort();
  };
  c.ZC.ATTACK_FAILURE_FOR_DISTANCE.size = 16;
  c.ZC.ATTACK_RANGE = function (a, b) {
    this.currentAttRange = a.readShort();
  };
  c.ZC.ATTACK_RANGE.size = 4;
  c.ZC.ACTION_FAILURE = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.ZC.ACTION_FAILURE.size = 4;
  c.ZC.EQUIP_ARROW = function (a, b) {
    this.index = a.readShort();
  };
  c.ZC.EQUIP_ARROW.size = 4;
  c.ZC.RECOVERY = function (a, b) {
    this.varID = a.readShort();
    this.amount = a.readShort();
  };
  c.ZC.RECOVERY.size = 6;
  c.ZC.RECOVERY2 = function (a, b) {
    this.varID = a.readShort();
    this.amount = a.readLong();
  };
  c.ZC.RECOVERY2.size = 8;
  c.ZC.USESKILL_ACK = function (a, b) {
    this.AID = a.readULong();
    this.targetID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.SKID = a.readUShort();
    this.property = a.readULong();
    this.delayTime = a.readULong();
  };
  c.ZC.USESKILL_ACK.size = 24;
  c.ZC.COUPLESTATUS = function (a, b) {
    this.statusType = a.readULong();
    this.defaultStatus = a.readLong();
    this.plusStatus = a.readLong();
  };
  c.ZC.COUPLESTATUS.size = 14;
  c.ZC.OPEN_EDITDLG = function (a, b) {
    this.NAID = a.readULong();
  };
  c.ZC.OPEN_EDITDLG.size = 6;
  c.ZC.COMPASS = function (a, b) {
    this.NAID = a.readULong();
    this.type = a.readLong();
    this.xPos = a.readLong();
    this.yPos = a.readLong();
    this.id = a.readUChar();
    this.color = a.readULong();
  };
  c.ZC.COMPASS.size = 23;
  c.ZC.SHOW_IMAGE = function (a, b) {
    this.imageName = a.readBinaryString(16);
    this.type = a.readUChar();
  };
  c.ZC.SHOW_IMAGE.size = 19;
  c.ZC.AUTORUN_SKILL = function (a, b) {
    this.data = {};
    this.data.SKID = a.readUShort();
    this.data.type = a.readLong();
    this.data.level = a.readShort();
    this.data.spcost = a.readShort();
    this.data.attackRange = a.readShort();
    this.data.skillName = a.readBinaryString(24);
    this.data.upgradable = a.readUChar();
  };
  c.ZC.AUTORUN_SKILL.size = 39;
  c.ZC.RESURRECTION = function (a, b) {
    this.AID = a.readULong();
    this.type = a.readShort();
  };
  c.ZC.RESURRECTION.size = 8;
  c.ZC.ACK_GIVE_MANNER_POINT = function (a, b) {
    this.result = a.readULong();
  };
  c.ZC.ACK_GIVE_MANNER_POINT.size = 6;
  c.ZC.NOTIFY_MANNER_POINT_GIVEN = function (a, b) {
    this.type = a.readUChar();
    this.otherCharName = a.readString(24);
  };
  c.ZC.NOTIFY_MANNER_POINT_GIVEN.size = 27;
  c.ZC.MYGUILD_BASIC_INFO = function (a, b) {
    var d = ((b - a.tell()) / 32) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].relation = a.readLong()),
        (c[b].GDID = a.readLong()),
        (c[b].guildName = a.readString(24)));
    this.relatedGuildList = c;
  };
  c.ZC.MYGUILD_BASIC_INFO.size = -1;
  c.ZC.ACK_GUILD_MENUINTERFACE = function (a, b) {
    this.guildMemuFlag = a.readLong();
  };
  c.ZC.ACK_GUILD_MENUINTERFACE.size = 6;
  c.ZC.GUILD_INFO = function (a, b) {
    this.GDID = a.readLong();
    this.level = a.readLong();
    this.userNum = a.readLong();
    this.maxUserNum = a.readLong();
    this.userAverageLevel = a.readLong();
    this.exp = a.readLong();
    this.maxExp = a.readLong();
    this.point = a.readLong();
    this.honor = a.readLong();
    this.virtue = a.readLong();
    this.emblemVersion = a.readLong();
    this.guildname = a.readString(24);
    this.masterName = a.readString(24);
    this.manageLand = a.readBinaryString(16);
  };
  c.ZC.GUILD_INFO.size = 110;
  c.ZC.GUILD_EMBLEM_IMG = function (a, b) {
    this.GDID = a.readLong();
    this.emblemVersion = a.readLong();
    this.img = new Uint8Array(a.buffer, a.offset, b - a.offset);
  };
  c.ZC.GUILD_EMBLEM_IMG.size = -1;
  c.ZC.MEMBERMGR_INFO = function (a, b) {
    var d = ((b - a.tell()) / 104) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].GID = a.readULong()),
        (c[b].HeadType = a.readShort()),
        (c[b].HeadPalette = a.readShort()),
        (c[b].Sex = a.readShort()),
        (c[b].Job = a.readShort()),
        (c[b].Level = a.readShort()),
        (c[b].MemberExp = a.readLong()),
        (c[b].CurrentState = a.readLong()),
        (c[b].GPositionID = a.readLong()),
        (c[b].Memo = a.readString(50)),
        (c[b].CharName = a.readString(24)));
    this.memberInfo = c;
  };
  c.ZC.MEMBERMGR_INFO.size = -1;
  c.ZC.MEMBERMGR_INFO2 = function (a, b) {
    var d = ((b - a.tell()) / 58) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].GID = a.readULong()),
        (c[b].HeadType = a.readShort()),
        (c[b].HeadPalette = a.readShort()),
        (c[b].Sex = a.readShort()),
        (c[b].Job = a.readShort()),
        (c[b].Level = a.readShort()),
        (c[b].MemberExp = a.readLong()),
        (c[b].CurrentState = a.readLong()),
        (c[b].GPositionID = a.readLong()),
        (c[b].lastLoginTime = a.readULong()),
        (c[b].CharName = a.readString(24)));
    this.memberInfo = c;
  };
  c.ZC.MEMBERMGR_INFO2.size = -1;
  c.ZC.ACK_REQ_CHANGE_MEMBERS = function (a, b) {
    var d = ((b - a.tell()) / 12) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readLong()),
        (c[b].GID = a.readLong()),
        (c[b].positionID = a.readLong()));
    this.memberInfo = c;
  };
  c.ZC.ACK_REQ_CHANGE_MEMBERS.size = -1;
  c.ZC.ACK_OPEN_MEMBER_INFO = function (a, b) {};
  c.ZC.ACK_OPEN_MEMBER_INFO.size = 2;
  c.ZC.ACK_LEAVE_GUILD = function (a, b) {
    this.charName = a.readString(24);
    this.reasonDesc = a.readString(40);
  };
  c.ZC.ACK_LEAVE_GUILD.size = 66;
  c.ZC.ACK_LEAVE_GUILD2 = function (a, b) {
    this.charID = a.readLong();
    this.reasonDesc = a.readString(40);
  };
  c.ZC.ACK_LEAVE_GUILD2.size = 46;
  c.ZC.ACK_BAN_GUILD = function (a, b) {
    this.charName = a.readString(24);
    this.reasonDesc = a.readString(40);
    this.account = a.readString(24);
  };
  c.ZC.ACK_BAN_GUILD.size = 90;
  c.ZC.ACK_DISORGANIZE_GUILD_RESULT = function (a, b) {
    this.reason = a.readLong();
  };
  c.ZC.ACK_DISORGANIZE_GUILD_RESULT.size = 6;
  c.ZC.ACK_DISORGANIZE_GUILD = function (a, b) {
    this.reasonDesc = a.readString(40);
  };
  c.ZC.ACK_DISORGANIZE_GUILD.size = 42;
  c.ZC.POSITION_INFO = function (a, b) {
    var d = ((b - a.tell()) / 16) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].positionID = a.readLong()),
        (c[b].right = a.readLong()),
        (c[b].ranking = a.readLong()),
        (c[b].payRate = a.readLong()));
    this.memberInfo = c;
  };
  c.ZC.POSITION_INFO.size = -1;
  c.ZC.GUILD_SKILLINFO = function (a, b) {
    this.skillPoint = a.readShort();
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readUShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.GUILD_SKILLINFO.size = -1;
  c.ZC.BAN_LIST = function (a, b) {
    var d = ((b - a.tell()) / 68) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readLong()),
        (c[b].reason = a.readString(40)),
        (c[b].charname = a.readString(24)));
    this.banList = c;
  };
  c.ZC.BAN_LIST.size = -1;
  c.ZC.OTHER_GUILD_LIST = function (a, b) {
    var d = ((b - a.tell()) / 36) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].guildname = a.readString(24)),
        (c[b].guildLevel = a.readLong()),
        (c[b].guildMemberSize = a.readLong()),
        (c[b].guildRanking = a.readLong()));
    this.guildList = c;
  };
  c.ZC.OTHER_GUILD_LIST.size = -1;
  c.ZC.POSITION_ID_NAME_INFO = function (a, b) {
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].positionID = a.readLong()),
        (c[b].posName = a.readString(24)));
    this.memberList = c;
  };
  c.ZC.POSITION_ID_NAME_INFO.size = -1;
  c.ZC.RESULT_MAKE_GUILD = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.RESULT_MAKE_GUILD.size = 3;
  c.ZC.ACK_REQ_JOIN_GUILD = function (a, b) {
    this.answer = a.readUChar();
  };
  c.ZC.ACK_REQ_JOIN_GUILD.size = 3;
  c.ZC.REQ_JOIN_GUILD = function (a, b) {
    this.GDID = a.readULong();
    this.guildName = a.readString(24);
  };
  c.ZC.REQ_JOIN_GUILD.size = 30;
  c.ZC.UPDATE_GDID = function (a, b) {
    this.GDID = a.readULong();
    this.emblemVersion = a.readLong();
    this.right = a.readLong();
    this.isMaster = a.readUChar();
    this.InterSID = a.readLong();
    this.GName = a.readString(24);
  };
  c.ZC.UPDATE_GDID.size = 43;
  c.ZC.UPDATE_CHARSTAT = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.status = a.readLong();
  };
  c.ZC.UPDATE_CHARSTAT.size = 14;
  c.ZC.GUILD_NOTICE = function (a, b) {
    this.subject = a.readString(60);
    this.notice = a.readString(120);
  };
  c.ZC.GUILD_NOTICE.size = 182;
  c.ZC.REQ_ALLY_GUILD = function (a, b) {
    this.otherAID = a.readULong();
    this.guildName = a.readString(24);
  };
  c.ZC.REQ_ALLY_GUILD.size = 30;
  c.ZC.ACK_REQ_ALLY_GUILD = function (a, b) {
    this.answer = a.readUChar();
  };
  c.ZC.ACK_REQ_ALLY_GUILD.size = 3;
  c.ZC.ACK_CHANGE_GUILD_POSITIONINFO = function (a, b) {
    var d = ((b - a.tell()) / 40) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].positionID = a.readLong()),
        (c[b].right = a.readLong()),
        (c[b].ranking = a.readLong()),
        (c[b].payRate = a.readLong()),
        (c[b].posName = a.readString(24)));
    this.memberList = c;
  };
  c.ZC.ACK_CHANGE_GUILD_POSITIONINFO.size = -1;
  c.ZC.ACK_GUILD_MEMBER_INFO = function (a, b) {
    this.Info = {};
    this.Info.AID = a.readLong();
    this.Info.GID = a.readLong();
    this.Info.HeadType = a.readShort();
    this.Info.HeadPalette = a.readShort();
    this.Info.Sex = a.readShort();
    this.Info.Job = a.readShort();
    this.Info.Level = a.readShort();
    this.Info.MemberExp = a.readLong();
    this.Info.CurrentState = a.readLong();
    this.Info.GPositionID = a.readLong();
    this.Info.Memo = a.readString(50);
    this.Info.CharName = a.readString(24);
  };
  c.ZC.ACK_GUILD_MEMBER_INFO.size = 106;
  c.ZC.ITEMIDENTIFY_LIST = function (a, b) {
    b = ((b - a.tell()) / 2) | 0;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readUShort();
    this.ITIDList = d;
  };
  c.ZC.ITEMIDENTIFY_LIST.size = -1;
  c.ZC.ACK_ITEMIDENTIFY = function (a, b) {
    this.index = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.ACK_ITEMIDENTIFY.size = 5;
  c.ZC.ITEMCOMPOSITION_LIST = function (a, b) {
    b = ((b - a.tell()) / 2) | 0;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readUShort();
    this.ITIDList = d;
  };
  c.ZC.ITEMCOMPOSITION_LIST.size = -1;
  c.ZC.ACK_ITEMCOMPOSITION = function (a, b) {
    this.equipIndex = a.readShort();
    this.cardIndex = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.ACK_ITEMCOMPOSITION.size = 7;
  c.ZC.GUILD_CHAT = function (a, b) {
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.GUILD_CHAT.size = -1;
  c.ZC.ACK_REQ_HOSTILE_GUILD = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_REQ_HOSTILE_GUILD.size = 3;
  c.ZC.MEMBER_ADD = function (a, b) {
    this.Info = {};
    this.Info.AID = a.readLong();
    this.Info.GID = a.readLong();
    this.Info.head = a.readShort();
    this.Info.headPalette = a.readShort();
    this.Info.sex = a.readShort();
    this.Info.job = a.readShort();
    this.Info.level = a.readShort();
    this.Info.contributionExp = a.readLong();
    this.Info.currentState = a.readLong();
    this.Info.positionID = a.readLong();
    this.Info.intro = a.readString(50);
    this.Info.charname = a.readString(24);
  };
  c.ZC.MEMBER_ADD.size = 106;
  c.ZC.DELETE_RELATED_GUILD = function (a, b) {
    this.OpponentGDID = a.readULong();
    this.Relation = a.readLong();
  };
  c.ZC.DELETE_RELATED_GUILD.size = 10;
  c.ZC.ADD_RELATED_GUILD = function (a, b) {
    this.Info = {};
    this.Info.relation = a.readLong();
    this.Info.GDID = a.readLong();
    this.Info.guildname = a.readString(24);
  };
  c.ZC.ADD_RELATED_GUILD.size = 34;
  c.ZC.COLLECTORDEAD = function (a, b) {
    this.ServerID = a.readULong();
  };
  c.ZC.COLLECTORDEAD.size = 6;
  c.HC.PING = function (a, b) {
    this.AID = a.readULong();
  };
  c.HC.PING.size = 6;
  c.ZC.ACK_ITEMREFINING = function (a, b) {
    this.result = a.readShort();
    this.itemIndex = a.readShort();
    this.RefiningLevel = a.readShort();
  };
  c.ZC.ACK_ITEMREFINING.size = 8;
  c.ZC.NOTIFY_MAPINFO = function (a, b) {
    this.type = a.readShort();
  };
  c.ZC.NOTIFY_MAPINFO.size = 4;
  c.ZC.ACK_REQ_DISCONNECT = function (a, b) {
    this.result = a.readShort();
  };
  c.ZC.ACK_REQ_DISCONNECT.size = 4;
  c.ZC.MONSTER_INFO = function (a, b) {
    this.job = a.readShort();
    this.level = a.readShort();
    this.size = a.readShort();
    this.hp = a.readLong();
    this.def = a.readShort();
    this.raceType = a.readShort();
    this.mdefPower = a.readShort();
    this.property = a.readShort();
    this.propertyTable = {};
    this.propertyTable.water = a.readUChar();
    this.propertyTable.earth = a.readUChar();
    this.propertyTable.fire = a.readUChar();
    this.propertyTable.wind = a.readUChar();
    this.propertyTable.poison = a.readUChar();
    this.propertyTable.saint = a.readUChar();
    this.propertyTable.dark = a.readUChar();
    this.propertyTable.mental = a.readUChar();
    this.propertyTable.undead = a.readUChar();
  };
  c.ZC.MONSTER_INFO.size = 29;
  c.ZC.MAKABLEITEMLIST = function (a, c) {
    this.info =
      20180704 <= b.value
        ? (function () {
            var d,
              b = ((c - a.tell()) / 16) | 0,
              e = Array(b);
            for (d = 0; d < b; d++)
              ((e[d] = {}),
                (e[d].ITID = a.readULong()),
                (e[d].unknown1 = a.readULong()),
                (e[d].unknown2 = a.readULong()),
                (e[d].unknown3 = a.readULong()));
            return e;
          })()
        : (function () {
            var d,
              b = ((c - a.tell()) / 8) | 0,
              e = Array(b);
            for (d = 0; d < b; d++)
              ((e[d] = {}),
                (e[d].ITID = a.readUShort()),
                (e[d].unknown1 = a.readUShort()),
                (e[d].unknown2 = a.readUShort()),
                (e[d].unknown3 = a.readUShort()));
            return e;
          })();
  };
  c.ZC.MAKABLEITEMLIST.size = -1;
  c.ZC.ACK_REQMAKINGITEM = function (a, c) {
    this.result = a.readShort();
    20180704 <= b.value
      ? ((this.size = 8), (this.ITID = a.readULong()))
      : ((this.size = 6), (this.ITID = a.readUShort()));
  };
  c.ZC.TALKBOX_CHATCONTENTS = function (a, b) {
    this.AID = a.readULong();
    this.contents = a.readBinaryString(80);
  };
  c.ZC.TALKBOX_CHATCONTENTS.size = 86;
  c.ZC.UPDATE_MAPINFO = function (a, b) {
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.type = a.readShort();
    this.mapName = a.readBinaryString(16);
  };
  c.ZC.UPDATE_MAPINFO.size = 24;
  c.ZC.ACK_REQNAME_BYGID = function (a, b) {
    this.GID = a.readULong();
    this.CName = a.readString(24);
  };
  c.ZC.ACK_REQNAME_BYGID.size = 30;
  c.ZC.ACK_REQNAME_BYGID2 = function (a, b) {
    this.flag = a.readShort();
    this.GID = a.readULong();
    this.CName = a.readString(24);
  };
  c.ZC.ACK_REQNAME_BYGID2.size = 32;
  c.ZC.INVENTORY_START = function (a, b) {
    this.invType = a.readUChar();
    this.name = a.readBinaryString(b - a.tell());
  };
  c.ZC.INVENTORY_START.size = -1;
  c.ZC.INVENTORY_ITEMLIST = function (a, b) {
    this.type = a.readUChar();
    var d = ((b - a.tell()) / 34) | 0,
      c = Array(d),
      e;
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readULong()),
        (c[b].type = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readULong()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readULong()),
        (c[b].slot.card2 = a.readULong()),
        (c[b].slot.card3 = a.readULong()),
        (c[b].slot.card4 = a.readULong()),
        (c[b].HireExpireDate = a.readLong()),
        (e = a.readUChar()),
        (c[b].IsIdentified = e & 1),
        (c[b].PlaceETCTab = e & 2),
        (c[b].SpareBits = e & 4));
    this.ItemInfo = c;
  };
  c.ZC.INVENTORY_ITEMLIST.size = -1;
  c.ZC.INVENTORY_ITEMLIST_EQUIP = function (a, b) {
    this.type = a.readUChar();
    var d = ((b - a.tell()) / 68) | 0,
      c = Array(d),
      e;
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readULong()),
        (c[b].type = a.readUChar()),
        (c[b].location = a.readULong()),
        (c[b].WearState = a.readULong()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readULong()),
        (c[b].slot.card2 = a.readULong()),
        (c[b].slot.card3 = a.readULong()),
        (c[b].slot.card4 = a.readULong()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()),
        (c[b].nRandomOptionCnt = a.readUChar()),
        (c[b].options = {}),
        (c[b].options.Index0 = a.readShort()),
        (c[b].options.Value0 = a.readShort()),
        (c[b].options.Param0 = a.readUChar()),
        (c[b].options.Index1 = a.readShort()),
        (c[b].options.Value1 = a.readShort()),
        (c[b].options.Param1 = a.readUChar()),
        (c[b].options.Index2 = a.readShort()),
        (c[b].options.Value2 = a.readShort()),
        (c[b].options.Param2 = a.readUChar()),
        (c[b].options.Index3 = a.readShort()),
        (c[b].options.Value3 = a.readShort()),
        (c[b].options.Param3 = a.readUChar()),
        (c[b].options.Index4 = a.readShort()),
        (c[b].options.Value4 = a.readShort()),
        (c[b].options.Param4 = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].enchantgrade = a.readUChar()),
        (e = a.readUChar()),
        (c[b].IsIdentified = e & 1),
        (c[b].IsDamaged = e & 2),
        (c[b].PlaceETCTab = e & 4),
        (c[b].SpareBits = e & 8));
    this.ItemInfo = c;
  };
  c.ZC.INVENTORY_ITEMLIST_EQUIP.size = -1;
  c.ZC.INVENTORY_END = function (a, b) {
    this.invType = a.readUChar();
    this.flag = a.readUChar();
  };
  c.ZC.INVENTORY_END.size = 4;
  c.ZC.PING_LIVE = function (a, b) {};
  c.ZC.PING_LIVE.size = 2;
  c.ZC.NOTIFY_ACTORINIT = function (a, b) {};
  c.ZC.NOTIFY_ACTORINIT.size = 2;
  c.ZC.ACK_OPEN_MSGBOX_EXTEND_BODYITEM_SIZE = function (a, b) {
    this.result = a.readUChar();
    this.itemId = a.readULong();
  };
  c.ZC.ACK_OPEN_MSGBOX_EXTEND_BODYITEM_SIZE.size = 7;
  c.ZC.ACK_EXTEND_BODYITEM_SIZE = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.ACK_EXTEND_BODYITEM_SIZE.size = 3;
  c.ZC.EXTEND_BODYITEM_SIZE = function (a, b) {
    this.expansionSize = a.readShort();
  };
  c.ZC.EXTEND_BODYITEM_SIZE.size = 4;
  c.ZC.HORTCUT_KEY_LIST = function (a, b) {
    this.rotate = a.readUChar();
    this.tab = a.readShort();
    var d = Array(38);
    for (b = 0; 38 > b; ++b)
      ((d[b] = {}),
        (d[b].isSkill = a.readChar()),
        (d[b].ID = a.readULong()),
        (d[b].count = a.readShort()));
    this.ShortCutKey = d;
  };
  c.ZC.HORTCUT_KEY_LIST.size = 271;
  c.HC.ACCEPT_MAKECHAR = function (a, c) {
    this.charinfo = b.parseCharInfo(a, c)[0];
  };
  c.HC.ACCEPT_MAKECHAR.size = 0;
  c.ZC.REPUTE_INFO = function (a, b) {
    this.success = a.readUChar();
    var d = ((b - a.tell()) / 16) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}), (c[b].type = a.readQLong()), (c[b].points = a.readQLong()));
    this.list = c;
  };
  c.ZC.REPUTE_INFO.size = -1;
  c.ZC.SE_CASHSHOP_OPEN = function (a, b) {
    this.cashPoints = a.readULong();
    this.kafraPoints = a.readULong();
    this.tab = a.readULong();
  };
  c.ZC.SE_CASHSHOP_OPEN.size = 14;
  c.ZC.ITEM_PICKUP_ACK_V8 = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readULong();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.location = a.readULong();
    this.type = a.readUChar();
    this.result = a.readUChar();
    this.HireExpireDate = a.readLong();
    this.bindOnEquipType = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.favorite = a.readUChar();
    this.look = a.readUShort();
    this.RefiningLevel = a.readUChar();
    this.grade = a.readUChar();
  };
  c.ZC.ITEM_PICKUP_ACK_V8.size = 70;
  c.ZC.ADD_EXCHANGE_ITEM4 = function (a, b) {
    this.ITID = a.readULong();
    this.type = a.readUChar();
    this.count = a.readLong();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.location = a.readULong();
    this.wItemSpriteNumber = a.readUShort();
    this.RefiningLevel = a.readUChar();
    this.grade = a.readUChar();
  };
  c.ZC.ADD_EXCHANGE_ITEM4.size = 62;
  c.ZC.ADD_ITEM_TO_STORE4 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readULong();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.enchantgrade = a.readUChar();
  };
  c.ZC.ADD_ITEM_TO_STORE4.size = 58;
  c.ZC.ADD_ITEM_TO_CART4 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readULong();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.grade = a.readUChar();
  };
  c.ZC.ADD_ITEM_TO_CART4.size = 58;
  c.ZC.ACK_READ_RODEX = function (a, b) {
    this.MailTAB = a.readChar();
    this.MailID = a.readQLong();
    b = a.readShort();
    this.Zeny = a.readQLong();
    this.itemCount = a.readChar();
    this.msg = a.readString(b);
    b = this.itemCount;
    var d,
      c = Array(b);
    for (d = 0; d < b; ++d)
      ((c[d] = {}),
        (c[d].count = a.readShort()),
        (c[d].ITID = a.readULong()),
        (c[d].IsIdentified = a.readUChar()),
        (c[d].IsDamaged = a.readUChar()),
        (c[d].slot = {}),
        (c[d].slot.card1 = a.readULong()),
        (c[d].slot.card2 = a.readULong()),
        (c[d].slot.card3 = a.readULong()),
        (c[d].slot.card4 = a.readULong()),
        (c[d].location = a.readLong()),
        (c[d].type = a.readUChar()),
        (c[d].wItemSpriteNumber = a.readUShort()),
        (c[d].bindOnEquipType = a.readUShort()),
        (c[d].options = {}),
        (c[d].options.Index0 = a.readUShort()),
        (c[d].options.Value0 = a.readUShort()),
        (c[d].options.Param0 = a.readUChar()),
        (c[d].options.Index1 = a.readUShort()),
        (c[d].options.Value1 = a.readUShort()),
        (c[d].options.Param1 = a.readUChar()),
        (c[d].options.Index2 = a.readUShort()),
        (c[d].options.Value2 = a.readUShort()),
        (c[d].options.Param2 = a.readUChar()),
        (c[d].options.Index3 = a.readUShort()),
        (c[d].options.Value3 = a.readUShort()),
        (c[d].options.Param3 = a.readUChar()),
        (c[d].options.Index4 = a.readUShort()),
        (c[d].options.Value4 = a.readUShort()),
        (c[d].options.Param4 = a.readUChar()),
        (c[d].RefiningLevel = a.readUChar()),
        (c[d].grade = a.readUChar()));
    this.itemList = c;
  };
  c.ZC.ACK_READ_RODEX.size = -1;
  c.ZC.PROPERTY_HOMUN4 = function (a, b) {
    this.szName = a.readString(24);
    this.bModified = a.readUChar();
    this.nLevel = a.readShort();
    this.nFullness = a.readShort();
    this.nRelationship = a.readShort();
    this.atk = a.readShort();
    this.Matk = a.readShort();
    this.hit = a.readShort();
    this.critical = a.readShort();
    this.def = a.readShort();
    this.Mdef = a.readShort();
    this.flee = a.readShort();
    this.aspd = a.readShort();
    this.hp = a.readLong();
    this.maxHP = a.readLong();
    this.sp = a.readLong();
    this.maxSP = a.readLong();
    this.exp = a.readQLong();
    this.maxEXP = a.readQLong();
    this.SKPoint = a.readShort();
    this.ATKRange = a.readShort();
  };
  c.ZC.PROPERTY_HOMUN4.size = 85;
  c.ZC.PC_PURCHASE_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 19) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].ITID = a.readULong()),
        (c[b].price = a.readULong()),
        (c[b].discountprice = a.readULong()),
        (c[b].type = a.readUChar()),
        (c[b].WearState = a.readUShort()),
        (c[b].location = a.readULong()));
    this.itemList = c;
  };
  c.ZC.PC_PURCHASE_ITEMLIST2.size = -1;
  c.ZC.NPC_BARTER_MARKET_ITEMINFO = function (a, b) {
    var d = ((b - a.tell()) / 31) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].ITID = a.readULong()),
        (c[b].type = a.readUChar()),
        (c[b].amount = a.readULong()),
        (c[b].currencyNameid = a.readULong()),
        (c[b].currencyAmount = a.readULong()),
        (c[b].weight = a.readULong()),
        (c[b].index = a.readULong()),
        (c[b].WearState = a.readUShort()),
        (c[b].location = a.readULong()));
    this.itemList = c;
  };
  c.ZC.NPC_BARTER_MARKET_ITEMINFO.size = -1;
  c.ZC.ACK_REQNAMEALL = function (a, b) {
    this.AID = a.readULong();
    this.CName = a.readString(24);
    this.PName = a.readString(24);
    this.GName = a.readString(24);
    this.RName = a.readString(24);
  };
  c.ZC.ACK_REQNAMEALL.size = 102;
  c.ZC.MSG_STATE_CHANGE = function (a, b) {
    this.index = a.readShort();
    this.AID = a.readULong();
    this.state = a.readUChar();
  };
  c.ZC.MSG_STATE_CHANGE.size = 9;
  c.ZC.NOTIFY_MAPPROPERTY = function (a, b) {
    this.type = a.readShort();
  };
  c.ZC.NOTIFY_MAPPROPERTY.size = 4;
  c.ZC.NOTIFY_RANKING = function (a, b) {
    this.AID = a.readULong();
    this.ranking = a.readLong();
    this.total = a.readLong();
  };
  c.ZC.NOTIFY_RANKING.size = 14;
  c.ZC.NOTIFY_EFFECT = function (a, b) {
    this.AID = a.readULong();
    this.effectID = a.readLong();
  };
  c.ZC.NOTIFY_EFFECT.size = 10;
  c.ZC.START_CAPTURE = function (a, b) {};
  c.ZC.START_CAPTURE.size = 2;
  c.ZC.TRYCAPTURE_MONSTER = function (a, b) {
    this.result = a.readUChar();
  };
  c.ZC.TRYCAPTURE_MONSTER.size = 3;
  c.ZC.PROPERTY_PET = function (a, b) {
    this.szName = a.readString(24);
    this.bModified = a.readUChar();
    this.nLevel = a.readShort();
    this.nFullness = a.readShort();
    this.nRelationship = a.readShort();
    this.ITID = a.readUShort();
    this.job = a.readShort();
  };
  c.ZC.PROPERTY_PET.size = 37;
  c.ZC.FEED_PET = function (a, b) {
    this.cRet = a.readChar();
    this.ITID = a.readLong();
  };
  c.ZC.FEED_PET.size = 7;
  c.ZC.CHANGESTATE_PET = function (a, b) {
    this.type = a.readChar();
    this.GID = a.readLong();
    this.data = a.readLong();
  };
  c.ZC.CHANGESTATE_PET.size = 11;
  c.ZC.PETEGG_LIST = function (a, b) {
    var d = ((b - a.tell()) / 2) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b) c[b] = a.readShort();
    this.eggList = c;
  };
  c.ZC.PETEGG_LIST.size = -1;
  c.ZC.PET_ACT = function (a, b) {
    this.GID = a.readLong();
    this.data = a.readLong();
  };
  c.ZC.PET_ACT.size = 10;
  c.ZC.PAR_CHANGE_USER = function (a, b) {
    this.AID = a.readULong();
    this.varID = a.readUShort();
    this.count = a.readLong();
  };
  c.ZC.PAR_CHANGE_USER.size = 12;
  c.ZC.SKILL_UPDATE = function (a, b) {
    this.AID = a.readULong();
  };
  c.ZC.SKILL_UPDATE.size = 6;
  c.ZC.MAKINGARROW_LIST = function (a, b) {
    var d = ((b - a.tell()) / 4) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b) ((c[b] = {}), (c[b].ITID = a.readULong()));
    this.arrowList = c;
  };
  c.ZC.MAKINGARROW_LIST.size = -1;
  c.ZC.NPCSPRITE_CHANGE = function (a, b) {
    this.GID = a.readULong();
    this.type = a.readUChar();
    this.value = a.readULong();
  };
  c.ZC.NPCSPRITE_CHANGE.size = 11;
  c.ZC.SHOWDIGIT = function (a, b) {
    this.type = a.readUChar();
    this.value = a.readLong();
  };
  c.ZC.SHOWDIGIT.size = 7;
  c.ZC.SHOW_IMAGE2 = function (a, b) {
    this.imageName = a.readBinaryString(64);
    this.type = a.readUChar();
  };
  c.ZC.SHOW_IMAGE2.size = 67;
  c.ZC.CHANGE_GUILD = function (a, b) {
    this.AID = a.readULong();
    this.GDID = a.readULong();
    this.emblemVersion = a.readShort();
  };
  c.ZC.CHANGE_GUILD.size = 12;
  c.ZC.CHANGE_GUILD2 = function (a, b) {
    this.GDID = a.readLong();
    this.emblemVersion = a.readULong();
    this.AID = a.readULong();
  };
  c.ZC.CHANGE_GUILD2.size = 14;
  c.SC.BILLING_INFO = function (a, b) {
    this.dwAmountRemain = a.readULong();
    this.dwQuantityRemain = a.readULong();
    this.dwReserved1 = a.readULong();
    this.dwReserved2 = a.readULong();
  };
  c.SC.BILLING_INFO.size = 18;
  c.ZC.GUILD_INFO2 = function (a, b) {
    this.GDID = a.readLong();
    this.level = a.readLong();
    this.userNum = a.readLong();
    this.maxUserNum = a.readLong();
    this.userAverageLevel = a.readLong();
    this.exp = a.readLong();
    this.maxExp = a.readLong();
    this.point = a.readLong();
    this.honor = a.readLong();
    this.virtue = a.readLong();
    this.emblemVersion = a.readLong();
    this.guildname = a.readString(24);
    this.masterName = a.readString(24);
    this.manageLand = a.readBinaryString(16);
    this.zeny = a.readLong();
  };
  c.ZC.GUILD_INFO2.size = 114;
  c.ZC.GUILD_ZENY_ACK = function (a, b) {
    this.ret = a.readUChar();
  };
  c.ZC.GUILD_ZENY_ACK.size = 3;
  c.ZC.DISPEL = function (a, b) {
    this.AID = a.readULong();
  };
  c.ZC.DISPEL.size = 6;
  c.AC.ASK_PNGAMEROOM = function (a, b) {};
  c.AC.ASK_PNGAMEROOM.size = 2;
  c.ZC.REPLY_REMAINTIME = function (a, b) {
    this.Result = a.readLong();
    this.ExpirationDate = a.readLong();
    this.RemainTime = a.readLong();
  };
  c.ZC.REPLY_REMAINTIME.size = 14;
  c.ZC.INFO_REMAINTIME = function (a, b) {
    this.Type = a.readLong();
    this.RemainTime = a.readLong();
  };
  c.ZC.INFO_REMAINTIME.size = 10;
  c.ZC.BROADCAST2 = function (a, b) {
    this.fontColor = a.readULong();
    this.fontType = a.readShort();
    this.fontSize = a.readShort();
    this.fontAlign = a.readShort();
    this.fontY = a.readShort();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.BROADCAST2.size = -1;
  c.ZC.ADD_ITEM_TO_STORE2 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
  };
  c.ZC.ADD_ITEM_TO_STORE2.size = 22;
  c.ZC.ADD_ITEM_TO_STORE3 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
  };
  c.ZC.ADD_ITEM_TO_STORE3.size = 47;
  c.ZC.ADD_ITEM_TO_CART2 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
  };
  c.ZC.ADD_ITEM_TO_CART2.size = 22;
  c.ZC.ADD_ITEM_TO_CART3 = function (a, b) {
    this.index = a.readShort();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
  };
  c.ZC.ADD_ITEM_TO_CART3.size = 47;
  c.SC.ACK_ENCRYPTION = function (a, b) {};
  c.SC.ACK_ENCRYPTION.size = 2;
  c.ZC.USE_ITEM_ACK2 = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 15),
        (this.index = a.readUShort()),
        (this.id = a.readULong()))
      : ((this.size = 13),
        (this.index = a.readUShort()),
        (this.id = a.readUShort()));
    this.AID = a.readULong();
    this.count = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.SKILL_ENTRY2 = function (a, b) {
    this.AID = a.readULong();
    this.creatorAID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.job = a.readUChar();
    this.isVisible = a.readUChar();
    this.isContens = a.readUChar();
    this.msg = a.readString(80);
  };
  c.ZC.SKILL_ENTRY2.size = 97;
  c.ZC.MONSTER_TALK = function (a, b) {
    this.GID = a.readULong();
    this.stateId = a.readUChar();
    this.skillId = a.readUChar();
    this.arg1 = a.readUChar();
  };
  c.ZC.MONSTER_TALK.size = 9;
  c.ZC.AUTOSPELLLIST = function (a, b) {
    b = Array(7);
    for (var d = 0; 7 > d; ++d) b[d] = a.readLong();
    this.SKID = b;
  };
  c.ZC.AUTOSPELLLIST.size = 30;
  c.ZC.AUTOSPELLLIST2 = function (a, b) {
    b = (b - a.tell()) / 4;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readLong();
    this.SKID = d;
  };
  c.ZC.AUTOSPELLLIST2.size = -1;
  c.ZC.DEVOTIONLIST = function (a, b) {
    this.myAID = a.readULong();
    b = Array(5);
    for (var d = 0; 5 > d; ++d) b[d] = a.readULong();
    this.AID = b;
    this.range = a.readShort();
  };
  c.ZC.DEVOTIONLIST.size = 28;
  c.ZC.SPIRITS = function (a, b) {
    this.AID = a.readULong();
    this.num = a.readShort();
  };
  c.ZC.SPIRITS.size = 8;
  c.ZC.BLADESTOP = function (a, b) {
    this.srcAID = a.readULong();
    this.destAID = a.readULong();
    this.flag = a.readLong();
  };
  c.ZC.BLADESTOP.size = 14;
  c.ZC.COMBODELAY = function (a, b) {
    this.AID = a.readULong();
    this.delayTime = a.readULong();
  };
  c.ZC.COMBODELAY.size = 10;
  c.ZC.SOUND = function (a, b) {
    this.fileName = a.readBinaryString(24);
    this.act = a.readUChar();
    this.term = a.readULong();
    this.NAID = a.readULong();
  };
  c.ZC.SOUND.size = 35;
  c.ZC.OPEN_EDITDLGSTR = function (a, b) {
    this.NAID = a.readULong();
  };
  c.ZC.OPEN_EDITDLGSTR.size = 6;
  c.ZC.NOTIFY_MAPPROPERTY2 = function (a, b) {
    this.type = a.readShort();
  };
  c.ZC.NOTIFY_MAPPROPERTY2.size = 4;
  c.ZC.SPRITE_CHANGE2 = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 15),
        (this.GID = a.readULong()),
        (this.type = a.readUChar()),
        (this.value = a.readLong()),
        (this.value1 = a.readLong()))
      : ((this.size = 11),
        (this.GID = a.readULong()),
        (this.type = a.readUChar()),
        (this.value = a.readShort()),
        (this.value1 = a.readShort()));
  };
  c.ZC.NOTIFY_STANDENTRY2 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_STANDENTRY2.size = 54;
  c.ZC.NOTIFY_NEWENTRY2 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_NEWENTRY2.size = 53;
  c.ZC.NOTIFY_MOVEENTRY2 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readShort();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readShort();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_MOVEENTRY2.size = 60;
  c.AC.ACK_HASH = function (a, b) {
    this.secret = a.readBinaryString(b - a.tell());
  };
  c.AC.ACK_HASH.size = -1;
  c.ZC.NOTIFY_SKILL2 = function (a, b) {
    this.SKID = a.readUShort();
    this.AID = a.readULong();
    this.targetID = a.readULong();
    this.startTime = a.readULong();
    this.attackMT = a.readLong();
    this.attackedMT = a.readLong();
    this.damage = a.readLong();
    this.level = a.readShort();
    this.count = a.readShort();
    this.action = a.readUChar();
  };
  c.ZC.NOTIFY_SKILL2.size = 33;
  c.ZC.ACK_ACCOUNTNAME = function (a, b) {
    this.AID = a.readULong();
    this.name = a.readString(24);
  };
  c.ZC.ACK_ACCOUNTNAME.size = 30;
  c.ZC.SPIRITS2 = function (a, b) {
    this.AID = a.readULong();
    this.num = a.readShort();
  };
  c.ZC.SPIRITS2.size = 8;
  c.ZC.REQ_COUPLE = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.name = a.readString(24);
  };
  c.ZC.REQ_COUPLE.size = 34;
  c.ZC.START_COUPLE = function (a, b) {};
  c.ZC.START_COUPLE.size = 2;
  c.ZC.COUPLENAME = function (a, b) {
    this.CoupleName = a.readString(24);
  };
  c.ZC.COUPLENAME.size = 26;
  c.ZC.ADD_MEMBER_TO_GROUP2 = function (a, b) {
    this.AID = a.readULong();
    this.Role = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.state = a.readUChar();
    this.groupName = a.readString(24);
    this.characterName = a.readString(24);
    this.mapName = a.readBinaryString(16);
    this.ItemPickupRule = a.readUChar();
    this.ItemDivisionRule = a.readUChar();
  };
  c.ZC.ADD_MEMBER_TO_GROUP2.size = 81;
  c.ZC.CONGRATULATION = function (a, b) {
    this.AID = a.readULong();
  };
  c.ZC.CONGRATULATION.size = 6;
  c.ZC.NOTIFY_POSITION_TO_GUILDM = function (a, b) {
    this.AID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
  };
  c.ZC.NOTIFY_POSITION_TO_GUILDM.size = 10;
  c.ZC.GUILD_MEMBER_MAP_CHANGE = function (a, b) {
    this.GDID = a.readULong();
    this.AID = a.readULong();
    this.mapName = a.readBinaryString(16);
  };
  c.ZC.GUILD_MEMBER_MAP_CHANGE.size = 26;
  c.ZC.NORMAL_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 18) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.NORMAL_ITEMLIST2.size = -1;
  c.ZC.CART_NORMAL_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 18) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.CART_NORMAL_ITEMLIST2.size = -1;
  c.ZC.STORE_NORMAL_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 18) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.STORE_NORMAL_ITEMLIST2.size = -1;
  c.AC.NOTIFY_ERROR = function (a, b) {
    this.msg = a.readString(b - a.tell());
  };
  c.AC.NOTIFY_ERROR.size = -1;
  c.ZC.UPDATE_CHARSTAT2 = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.status = a.readLong();
    this.sex = a.readShort();
    this.head = a.readShort();
    this.headPalette = a.readShort();
  };
  c.ZC.UPDATE_CHARSTAT2.size = 20;
  c.ZC.NOTIFY_EFFECT2 = function (a, b) {
    this.AID = a.readULong();
    this.effectID = a.readLong();
  };
  c.ZC.NOTIFY_EFFECT2.size = 10;
  c.ZC.REQ_EXCHANGE_ITEM2 = function (a, b) {
    this.name = a.readString(24);
    this.GID = a.readULong();
    this.level = a.readShort();
  };
  c.ZC.REQ_EXCHANGE_ITEM2.size = 32;
  c.ZC.ACK_EXCHANGE_ITEM2 = function (a, b) {
    this.result = a.readUChar();
    this.GID = a.readULong();
    this.level = a.readShort();
  };
  c.ZC.ACK_EXCHANGE_ITEM2.size = 9;
  c.ZC.REQ_BABY = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.name = a.readString(24);
  };
  c.ZC.REQ_BABY.size = 34;
  c.ZC.START_BABY = function (a, b) {};
  c.ZC.START_BABY.size = 2;
  c.ZC.REPAIRITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 13) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()));
    this.itemList = c;
  };
  c.ZC.REPAIRITEMLIST.size = -1;
  c.ZC.ACK_ITEMREPAIR = function (a, b) {
    this.index = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.ACK_ITEMREPAIR.size = 5;
  c.ZC.HIGHJUMP = function (a, b) {
    this.AID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
  };
  c.ZC.HIGHJUMP.size = 10;
  c.ZC.FRIENDS_LIST = function (a, b) {
    var d = ((b - a.tell()) / 32) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].AID = a.readULong()),
        (c[b].GID = a.readULong()),
        (c[b].Name = a.readString(24)));
    this.friendList = c;
  };
  c.ZC.FRIENDS_LIST.size = -1;
  c.ZC.DIVORCE = function (a, b) {
    this.name = a.readString(24);
  };
  c.ZC.DIVORCE.size = 26;
  c.ZC.FRIENDS_STATE = function (a, c) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.State = a.readUChar();
    20180221 <= b.value && (this.Name = a.readString(24));
  };
  c.ZC.FRIENDS_STATE.size = 35;
  c.ZC.REQ_ADD_FRIENDS = function (a, b) {
    this.ReqAID = a.readULong();
    this.ReqGID = a.readULong();
    this.Name = a.readString(24);
  };
  c.ZC.REQ_ADD_FRIENDS.size = 34;
  c.ZC.ADD_FRIENDS_LIST = function (a, b) {
    this.Result = a.readShort();
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.Name = a.readString(24);
  };
  c.ZC.ADD_FRIENDS_LIST.size = 36;
  c.ZC.DELETE_FRIENDS = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
  };
  c.ZC.DELETE_FRIENDS.size = 10;
  c.HC.BLOCK_CHARACTER = function (a, b) {
    var d = ((b - a.tell()) / 24) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].GID = a.readULong()),
        (c[b].szExpireDate = a.readBinaryString(20)));
    this.characterList = c;
  };
  c.HC.BLOCK_CHARACTER.size = -1;
  c.ZC.STARSKILL = function (a, b) {
    this.mapName = a.readString(24);
    this.monsterID = a.readLong();
    this.star = a.readUChar();
    this.result = a.readUChar();
  };
  c.ZC.STARSKILL.size = 32;
  c.ZC.ACK_PVPPOINT = function (a, b) {
    this.AID = a.readULong();
    this.GID = a.readULong();
    this.PVP = {};
    this.PVP.WinPoint = a.readLong();
    this.PVP.LosePoint = a.readLong();
    this.PVP.Point = a.readLong();
  };
  c.ZC.ACK_PVPPOINT.size = 22;
  c.ZH.MOVE_PVPWORLD = function (a, b) {
    this.GID = a.readULong();
  };
  c.ZH.MOVE_PVPWORLD.size = 6;
  c.ZC.ACK_STATUS_GM = function (a, b) {
    this.str = a.readUChar();
    this.standardStr = a.readUChar();
    this.agi = a.readUChar();
    this.standardAgi = a.readUChar();
    this.vit = a.readUChar();
    this.standardVit = a.readUChar();
    this.Int = a.readUChar();
    this.standardInt = a.readUChar();
    this.dex = a.readUChar();
    this.standardDex = a.readUChar();
    this.luk = a.readUChar();
    this.standardLuk = a.readUChar();
    this.attPower = a.readShort();
    this.refiningPower = a.readShort();
    this.max_mattPower = a.readShort();
    this.min_mattPower = a.readShort();
    this.itemdefPower = a.readShort();
    this.plusdefPower = a.readShort();
    this.mdefPower = a.readShort();
    this.plusmdefPower = a.readShort();
    this.hitSuccessValue = a.readShort();
    this.avoidSuccessValue = a.readShort();
    this.plusAvoidSuccessValue = a.readShort();
    this.criticalSuccessValue = a.readShort();
    this.ASPD = a.readShort();
    this.plusASPD = a.readShort();
  };
  c.ZC.ACK_STATUS_GM.size = 42;
  c.ZC.SKILLMSG = function (a, b) {
    this.MsgNo = a.readLong();
  };
  c.ZC.SKILLMSG.size = 6;
  c.ZC.BABYMSG = function (a, b) {
    this.MsgNo = a.readLong();
  };
  c.ZC.BABYMSG.size = 6;
  c.ZC.BLACKSMITH_RANK = function (a, b) {
    this.Name = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readString(24);
      return d;
    })();
    this.Point = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readLong();
      return d;
    })();
  };
  c.ZC.BLACKSMITH_RANK.size = 282;
  c.ZC.ALCHEMIST_RANK = function (a, b) {
    this.Name = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readString(24);
      return d;
    })();
    this.Point = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readLong();
      return d;
    })();
  };
  c.ZC.ALCHEMIST_RANK.size = 282;
  c.ZC.BLACKSMITH_POINT = function (a, b) {
    this.Point = a.readLong();
    this.TotalPoint = a.readLong();
  };
  c.ZC.BLACKSMITH_POINT.size = 10;
  c.ZC.ALCHEMIST_POINT = function (a, b) {
    this.Point = a.readLong();
    this.TotalPoint = a.readLong();
  };
  c.ZC.ALCHEMIST_POINT.size = 10;
  c.ZC.LESSEFFECT = function (a, b) {
    this.isLess = a.readLong();
  };
  c.ZC.LESSEFFECT.size = 6;
  c.ZC.NOTIFY_PKINFO = function (a, b) {
    this.winPoint = a.readLong();
    this.losePoint = a.readLong();
    this.killName = a.readString(24);
    this.killedName = a.readString(24);
    this.expireTime = {};
    this.expireTime.dwLowDateTime = a.readULong();
    this.expireTime.dwHighDateTime = a.readULong();
  };
  c.ZC.NOTIFY_PKINFO.size = 66;
  c.ZC.NOTIFY_CRAZYKILLER = function (a, b) {
    this.AID = a.readULong();
    this.isCrazyKiller = a.readLong();
  };
  c.ZC.NOTIFY_CRAZYKILLER.size = 10;
  c.ZC.NOTIFY_WEAPONITEMLIST = function (a, b) {
    var d = ((b - a.tell()) / 23) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readULong()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readULong()),
        (c[b].slot.card2 = a.readULong()),
        (c[b].slot.card3 = a.readULong()),
        (c[b].slot.card4 = a.readULong()));
    this.itemList = c;
  };
  c.ZC.NOTIFY_WEAPONITEMLIST.size = -1;
  c.ZC.ACK_WEAPONREFINE = function (a, b) {
    this.msg = a.readLong();
    this.ITID = a.readUShort();
  };
  c.ZC.ACK_WEAPONREFINE.size = 8;
  c.ZC.TAEKWON_POINT = function (a, b) {
    this.Point = a.readLong();
    this.TotalPoint = a.readLong();
  };
  c.ZC.TAEKWON_POINT.size = 10;
  c.ZC.TAEKWON_RANK = function (a, b) {
    this.Name = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readString(24);
      return d;
    })();
    this.Point = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readLong();
      return d;
    })();
  };
  c.ZC.TAEKWON_RANK.size = 282;
  c.ZC.GAME_GUARD = function (a, b) {
    b = Array(4);
    for (var d = 0; 4 > d; ++d) b[d] = a.readULong();
    this.AuthData = b;
  };
  c.ZC.GAME_GUARD.size = 18;
  c.ZC.STATE_CHANGE3 = function (a, b) {
    this.AID = a.readULong();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.isPKModeON = a.readUChar();
  };
  c.ZC.STATE_CHANGE3.size = 15;
  c.ZC.NOTIFY_STANDENTRY3 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_STANDENTRY3.size = 58;
  c.ZC.NOTIFY_NEWENTRY3 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_NEWENTRY3.size = 57;
  c.ZC.NOTIFY_MOVEENTRY3 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
  };
  c.ZC.NOTIFY_MOVEENTRY3.size = 65;
  c.ZC.PROPERTY_HOMUN = function (a, b) {
    this.szName = a.readString(24);
    this.bModified = a.readUChar();
    this.nLevel = a.readShort();
    this.nFullness = a.readShort();
    this.nRelationship = a.readShort();
    this.ITID = a.readUShort();
    this.atk = a.readShort();
    this.Matk = a.readShort();
    this.hit = a.readShort();
    this.critical = a.readShort();
    this.def = a.readShort();
    this.Mdef = a.readShort();
    this.flee = a.readShort();
    this.aspd = a.readShort();
    this.hp = a.readShort();
    this.maxHP = a.readShort();
    this.sp = a.readShort();
    this.maxSP = a.readShort();
    this.exp = a.readLong();
    this.maxEXP = a.readLong();
    this.SKPoint = a.readShort();
    this.ATKRange = a.readShort();
  };
  c.ZC.PROPERTY_HOMUN.size = 71;
  c.ZC.FEED_HOM = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 7),
        (this.cRet = a.readChar()),
        (this.ITID = a.readULong()))
      : ((this.size = 5),
        (this.cRet = a.readChar()),
        (this.ITID = a.readUShort()));
  };
  c.ZC.CHANGESTATE_MER = function (a, b) {
    this.type = a.readChar();
    this.state = a.readChar();
    this.GID = a.readLong();
    this.data = a.readLong();
  };
  c.ZC.CHANGESTATE_MER.size = 12;
  c.ZC.HOM_SKILLINFO_UPDATE = function (a, b) {
    this.SKID = a.readUShort();
    this.level = a.readShort();
    this.spcost = a.readShort();
    this.attackRange = a.readShort();
    this.upgradable = a.readUChar();
  };
  c.ZC.HOM_SKILLINFO_UPDATE.size = 11;
  c.ZC.REQ_STORE_PASSWORD = function (a, b) {
    this.Info = a.readShort();
  };
  c.ZC.REQ_STORE_PASSWORD.size = 4;
  c.ZC.RESULT_STORE_PASSWORD = function (a, b) {
    this.Result = a.readShort();
    this.ErrorCount = a.readShort();
  };
  c.ZC.RESULT_STORE_PASSWORD.size = 6;
  c.AC.EVENT_RESULT = function (a, b) {
    this.EventItemCount = a.readULong();
  };
  c.AC.EVENT_RESULT.size = 6;
  c.HC.REQUEST_CHARACTER_PASSWORD = function (a, b) {
    this.Result = a.readShort();
    this.dummyValue = a.readULong();
  };
  c.HC.REQUEST_CHARACTER_PASSWORD.size = 8;
  c.ZC.MAIL_REQ_GET_LIST = function (a, b) {
    this.MailNumber = a.readLong();
    var d = ((b - a.tell()) / 73) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].MailID = a.readULong()),
        (c[b].HEADER = a.readString(40)),
        (c[b].isOpen = a.readChar()),
        (c[b].FromName = a.readString(24)),
        (c[b].DeleteTime = a.readLong()));
    this.mailList = c;
  };
  c.ZC.MAIL_REQ_GET_LIST.size = -1;
  c.ZC.MAIL_REQ_OPEN = function (a, b) {
    this.MailID = a.readLong();
    this.Header = a.readString(40);
    this.FromName = a.readString(24);
    this.DeleteTime = a.readLong();
    this.Money = a.readULong();
    this.count = a.readLong();
    this.ITID = a.readUShort();
    this.Type = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.msg_len = a.readUChar();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.MAIL_REQ_OPEN.size = -1;
  c.ZC.MAIL_REQ_GET_ITEM = function (a, b) {
    this.Result = a.readChar();
  };
  c.ZC.MAIL_REQ_GET_ITEM.size = 3;
  c.ZC.MAIL_REQ_SEND = function (a, b) {
    this.Result = a.readChar();
  };
  c.ZC.MAIL_REQ_SEND.size = 3;
  c.ZC.MAIL_RECEIVE = function (a, b) {
    this.MailID = a.readULong();
    this.Header = a.readString(40);
    this.FromName = a.readString(24);
  };
  c.ZC.MAIL_RECEIVE.size = 70;
  c.ZC.NOTIFY_UNREADMAIL = function (a, b) {
    this.unread = a.readChar();
  };
  c.ZC.NOTIFY_UNREADMAIL.size = 3;
  c.ZC.ACK_READ_MAIL = function (a, b) {
    this.MailTAB = a.readChar();
    this.MailID = a.readQLong();
    b = a.readShort();
    this.Zeny = a.readQLong();
    this.itemCount = a.readChar();
    this.msg = a.readString(b);
    b = this.itemCount;
    var d,
      c = Array(b);
    for (d = 0; d < b; ++d)
      ((c[d] = {}),
        (c[d].count = a.readShort()),
        (c[d].ITID = a.readUShort()),
        (c[d].IsIdentified = a.readUChar()),
        (c[d].IsDamaged = a.readUChar()),
        (c[d].RefiningLevel = a.readUChar()),
        (c[d].slot = {}),
        (c[d].slot.card1 = a.readUShort()),
        (c[d].slot.card2 = a.readUShort()),
        (c[d].slot.card3 = a.readUShort()),
        (c[d].slot.card4 = a.readUShort()),
        (c[d].location = a.readLong()),
        (c[d].type = a.readUChar()),
        (c[d].wItemSpriteNumber = a.readUShort()),
        (c[d].bindOnEquipType = a.readUShort()),
        (c[d].options = {}),
        (c[d].options.Index0 = a.readUShort()),
        (c[d].options.Value0 = a.readUShort()),
        (c[d].options.Param0 = a.readUChar()),
        (c[d].options.Index1 = a.readUShort()),
        (c[d].options.Value1 = a.readUShort()),
        (c[d].options.Param1 = a.readUChar()),
        (c[d].options.Index2 = a.readUShort()),
        (c[d].options.Value2 = a.readUShort()),
        (c[d].options.Param2 = a.readUChar()),
        (c[d].options.Index3 = a.readUShort()),
        (c[d].options.Value3 = a.readUShort()),
        (c[d].options.Param3 = a.readUChar()),
        (c[d].options.Index4 = a.readUShort()),
        (c[d].options.Value4 = a.readUShort()),
        (c[d].options.Param4 = a.readUChar()));
    this.itemList = c;
  };
  c.ZC.ACK_READ_MAIL.size = -1;
  c.ZC.ACK_WRITE_MAIL = function (a, b) {
    this.Result = a.readChar();
  };
  c.ZC.ACK_WRITE_MAIL.size = 3;
  c.ZC.ACK_MAIL_LIST = function (a, b) {
    this.type = a.readChar();
    this.count = a.readChar();
    this.last_page = a.readChar();
    b = this.count;
    var d,
      c = Array(b);
    for (d = 0; d < b; ++d) {
      c[d] = {};
      c[d].MailID = a.readQLong();
      c[d].isOpen = a.readChar();
      c[d].type = a.readChar();
      c[d].FromName = a.readString(24);
      c[d].received = a.readLong();
      c[d].DeleteTime = a.readLong();
      var e = a.readShort();
      c[d].title = a.readString(e);
    }
    this.mailList = c;
  };
  c.ZC.ACK_MAIL_LIST.size = -1;
  c.ZC.ACK_MAIL_LIST3 = function (a, b) {
    this.unknown = a.readChar();
    var d = 0;
    b -= a.tell();
    for (var c = []; b;) {
      c[d] = {};
      c[d].type = a.readChar();
      c[d].MailID = a.readQLong();
      c[d].isOpen = a.readChar();
      c[d].type = a.readChar();
      c[d].FromName = a.readString(24);
      c[d].DeleteTime = a.readLong();
      var e = a.readShort();
      c[d].title = a.readString(e);
      b = b - 1 - 8 - 1 - 1 - 24 - 4 - 2 - e;
      d++;
    }
    this.mailList = c;
  };
  c.ZC.ACK_MAIL_LIST3.size = -1;
  c.ZC.ACK_ZENY_FROM_MAIL = function (a, b) {
    this.MailID = a.readQLong();
    this.MailTAB = a.readChar();
    this.Result = a.readChar();
  };
  c.ZC.ACK_ZENY_FROM_MAIL.size = 12;
  c.ZC.ACK_ITEM_FROM_MAIL = function (a, b) {
    this.MailID = a.readQLong();
    this.MailTAB = a.readChar();
    this.Result = a.readChar();
  };
  c.ZC.ACK_ITEM_FROM_MAIL.size = 12;
  c.ZC.ACK_DELETE_MAIL = function (a, b) {
    this.MailTAB = a.readChar();
    this.MailID = a.readQLong();
  };
  c.ZC.ACK_DELETE_MAIL.size = 11;
  c.ZC.PROPERTY_HOMUN_2 = function (a, b) {
    this.szName = a.readString(24);
    this.bModified = a.readUChar();
    this.nLevel = a.readShort();
    this.nFullness = a.readShort();
    this.nRelationship = a.readShort();
    this.ITID = a.readUShort();
    this.atk = a.readShort();
    this.Matk = a.readShort();
    this.hit = a.readShort();
    this.critical = a.readShort();
    this.def = a.readShort();
    this.Mdef = a.readShort();
    this.flee = a.readShort();
    this.aspd = a.readShort();
    this.hp = a.readLong();
    this.maxHP = a.readLong();
    this.sp = a.readShort();
    this.maxSP = a.readShort();
    this.exp = a.readLong();
    this.maxEXP = a.readLong();
    this.SKPoint = a.readShort();
    this.ATKRange = a.readShort();
  };
  c.ZC.PROPERTY_HOMUN_2.size = 75;
  c.ZC.ACK_ADD_ITEM_TO_MAIL = function (a, b) {
    this.result = a.readChar();
    this.index = a.readShort();
    this.count = a.readShort();
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
  };
  c.ZC.ACK_ADD_ITEM_TO_MAIL.size = 53;
  c.ZC.ACK_ADD_ITEM_RODEX = function (a, b) {
    this.result = a.readChar();
    this.index = a.readShort();
    this.count = a.readShort();
    this.ITID = a.readULong();
    this.type = a.readUChar();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.weight = a.readUShort();
    this.favorite = a.readUChar();
    this.location = a.readULong();
    this.RefiningLevel = a.readUChar();
    this.grade = a.readUChar();
  };
  c.ZC.ACK_ADD_ITEM_RODEX.size = 64;
  c.ZC.ACK_REMOVE_ITEM_MAIL = function (a, b) {
    this.success = a.readChar();
    this.index = a.readShort();
    this.count = a.readShort();
    this.weight = a.readShort();
  };
  c.ZC.ACK_REMOVE_ITEM_MAIL.size = 9;
  c.ZC.ACK_OPEN_WRITE_MAIL = function (a, b) {
    this.receiver = a.readString(24);
    this.success = a.readChar();
  };
  c.ZC.ACK_OPEN_WRITE_MAIL.size = 27;
  c.ZC.CHECK_RECEIVE_CHARACTER_NAME = function (a, b) {
    this.GID = a.readULong();
    this.job = a.readShort();
    this.clevel = a.readShort();
  };
  c.ZC.CHECK_RECEIVE_CHARACTER_NAME.size = 10;
  c.ZC.SKILL_SCALE = function (a, b) {
    this.AID = a.readULong();
    this.SkillId = a.readShort();
    this.SkillLv = a.readShort();
    this.posX = a.readShort();
    this.posY = a.readShort();
    this.castTime = a.readULong();
  };
  c.ZC.SKILL_SCALE.size = 18;
  c.ZC.CHECK_RECEIVE_CHARACTER_NAME2 = function (a, b) {
    this.GID = a.readULong();
    this.job = a.readShort();
    this.clevel = a.readShort();
    this.name = a.readString(24);
  };
  c.ZC.CHECK_RECEIVE_CHARACTER_NAME2.size = 34;
  c.ZC.ALL_ACH_LIST = function (a, b) {
    this.ACHCount = a.readLong();
    this.ACHPoint = a.readLong();
    this.clevel = a.readShort();
    this.ACHEXP = a.readLong();
    this.ACHEXPTNL = a.readLong();
    b = this.ACHCount;
    var d,
      c = Array(b);
    for (d = 0; d < b; ++d) {
      c[d] = {};
      c[d].AID = a.readULong();
      c[d].Completed = a.readChar();
      for (var e = c[d], q = Array(10), k = 0; 10 > k; ++k) q[k] = a.readLong();
      e.Objectives = q;
      c[d].endtime = a.readULong();
      c[d].rewarded = a.readChar();
    }
    this.ACHList = c;
  };
  c.ZC.ALL_ACH_LIST.size = -1;
  c.ZC.ACH_UPDATE = function (a, b) {
    this.ACHPoint = a.readLong();
    this.ACHLevel = a.readShort();
    this.ACHEXP = a.readLong();
    this.ACHEXPTNL = a.readLong();
    var d = (b - a.tell()) / 50,
      c = Array(d);
    for (b = 0; b < d; ++b) {
      c[b] = {};
      c[b].AID = a.readULong();
      c[b].Completed = a.readChar();
      for (var e = c[b], q = Array(10), k = 0; 10 > k; ++k) q[k] = a.readLong();
      e.Objectives = q;
      c[b].endtime = a.readULong();
      c[b].rewarded = a.readChar();
    }
    this.Achievement = c;
  };
  c.ZC.ACH_UPDATE.size = 66;
  c.ZC.REQ_ACH_REWARD_ACK = function (a, b) {
    this.result = a.readChar();
    this.ACHID = a.readLong();
  };
  c.ZC.REQ_ACH_REWARD_ACK.size = 7;
  c.ZC.ACK_CHANGE_TITLE = function (a, b) {
    this.result = a.readChar();
    this.ACHID = a.readLong();
  };
  c.ZC.ACK_CHANGE_TITLE.size = 7;
  c.ZC.ACK_REQNAMEALL2 = function (a, b) {
    this.AID = a.readULong();
    this.CName = a.readString(24);
    this.PName = a.readString(24);
    this.GName = a.readString(24);
    this.RName = a.readString(24);
    this.titleId = a.readLong();
  };
  c.ZC.ACK_REQNAMEALL2.size = 106;
  c.ZC.OPEN_RODEX_THROUGH_NPC_ONLY = function (a, b) {};
  c.ZC.OPEN_RODEX_THROUGH_NPC_ONLY.size = 2;
  c.ZC.PRIVATE_AIRSHIP_RESPONSE = function (a, b) {
    this.response = a.readLong();
  };
  c.ZC.PRIVATE_AIRSHIP_RESPONSE.size = 6;
  c.ZC.RANDOM_COMBINE_ITEM_UI_OPEN = function (a, b) {
    this.ITID = a.readLong();
  };
  c.ZC.RANDOM_COMBINE_ITEM_UI_OPEN.size = 6;
  c.ZC.ACK_RANDOM_COMBINE_ITEM = function (a, b) {
    this.result = a.readUShort();
  };
  c.ZC.ACK_RANDOM_COMBINE_ITEM.size = 4;
  c.ZC.NOTIFY_LOADINFO = function (a, b) {
    this.pmdis = a.readUChar();
    this.mgdis = a.readUChar();
    this.AutoUseWing_time = a.readUChar();
    this.usehpConversion = a.readUChar();
    this.AutoSeeBoss = a.readUChar();
    this.qomobnumMin = a.readUChar();
    this.qomobnum = a.readUChar();
    this.usealheal = a.readUChar();
    this.qo_AutoUseSkillid = a.readUShort();
    this.qo_AutoUseSkilllv = a.readUChar();
    this.MinHpValFly = a.readUChar();
    this.MinSpValFly = a.readUChar();
    this.MinHpVal = a.readUChar();
    this.useBoarding = a.readUChar();
    this.petTurnEgg = a.readUChar();
    this.autoloot = a.readLong();
    this.AutoUseItem_reHpVal = a.readUChar();
    this.AutoUseItem_reSpVal = a.readUChar();
    this.AutoUseItem_jsys = a.readUChar();
    this.AutoUseItem_Elemental = a.readUChar();
    this.AutoUseItem_Panacea = a.readUChar();
    this.useSiegfried = a.readUChar();
    this.AutoAttackstatus = a.readUChar();
    this.AutofollowMode = a.readUChar();
    this.disTarget = a.readUChar();
    this.addisTarget = a.readUChar();
    this.aidddis_reHpVal = a.readUChar();
    this.aidddis_reSpVal = a.readUChar();
    this.AutoUseSit = a.readUChar();
    this.AutoUseSit_reHpVal = a.readUChar();
    this.AutoUseSit_reSpVal = a.readUChar();
    this.AutoUseSit_reHpUpVal = a.readUChar();
    this.AutoUseSit_reSpUpVal = a.readUChar();
    this.AutoUseSit_xw = a.readUChar();
    this.onlynoattack = a.readUChar();
    this.AutoUseItem_Protection = a.readUChar();
    this.startAutoAtk = a.readUChar();
    this.startAutoLoot = a.readUChar();
    this.startAutopots = a.readUChar();
    this.startAutofollow = a.readUChar();
    this.searchMode = a.readUChar();
    this.AutoUseSkillid = a.readUShort();
    this.AutoUseSkilllv = a.readUChar();
    this.useSkill_pro = a.readUChar();
    this.AutoUseItem_Elementalid = a.readUShort();
    this.ProtectTeam = a.readUChar();
    this.keepwayOp = a.readUChar();
    this.useManuals = a.readUChar();
    this.useBubbles = a.readUChar();
    this.useAspersio = a.readUChar();
  };
  c.ZC.NOTIFY_LOADINFO.size = 58;
  c.ZC.NOTIFY_OFFLINEMSG = function (a, b) {
    this.op = a.readUChar();
    this.endtime = a.readLong();
    this.time = a.readLong();
    this.cash = a.readUShort();
    this.baselv = a.readUShort();
    this.joblv = a.readUShort();
    this.zeny = a.readLong();
    this.equipCount = a.readUShort();
    this.cardCount = a.readUShort();
    this.bpower = a.readUShort();
    this.brepower = a.readUShort();
    this.feedback = a.readUChar();
  };
  c.ZC.NOTIFY_OFFLINEMSG.size = 30;
  c.ZC.NOTIFY_RELOADINFOS = function (a, b) {
    this.id = a.readUChar();
    this.value = a.readLong();
  };
  c.ZC.NOTIFY_RELOADINFOS.size = 7;
  c.ZC.NOTIFY_SETTARGET = function (a, b) {
    this.mobid = a.readLong();
    this.value = a.readUChar();
  };
  c.ZC.NOTIFY_SETTARGET.size = 7;
  c.ZC.NOTIFY_SETTARGET2 = function (a, b) {
    this.mobid = a.readLong();
    this.value = a.readUChar();
  };
  c.ZC.NOTIFY_SETTARGET2.size = 7;
  c.ZC.AUCTION_RESULT = function (a, b) {
    this.Result = a.readChar();
  };
  c.ZC.AUCTION_RESULT.size = 3;
  c.ZC.AUCTION_ITEM_REQ_SEARCH = function (a, c) {
    20180704 <= b.value
      ? ((this.MaxPage = a.readLong()),
        (this.Number = a.readLong()),
        (this.auctionItemList = (function () {
          var d,
            b = ((c - a.tell()) / 118) | 0,
            e = Array(b);
          for (d = 0; d < b; ++d)
            ((e[d] = {}),
              (e[d].AuctionID = a.readULong()),
              (e[d].SellerName = a.readString(24)),
              (e[d].ITID = a.readULong()),
              (e[d].Type = a.readLong()),
              (e[d].count = a.readShort()),
              (e[d].IsIdentified = a.readUChar()),
              (e[d].IsDamaged = a.readUChar()),
              (e[d].RefiningLevel = a.readUChar()),
              (e[d].slot = {}),
              (e[d].slot.card1 = a.readULong()),
              (e[d].slot.card2 = a.readULong()),
              (e[d].slot.card3 = a.readULong()),
              (e[d].slot.card4 = a.readULong()),
              (e[d].NowPrice = a.readLong()),
              (e[d].MaxPrice = a.readLong()),
              (e[d].BuyerName = a.readString(24)),
              (e[d].DeleteTime = a.readLong()),
              (e[d].options = {}),
              (e[d].options.Index0 = a.readUShort()),
              (e[d].options.Value0 = a.readUShort()),
              (e[d].options.Param0 = a.readUChar()),
              (e[d].options.Index1 = a.readUShort()),
              (e[d].options.Value1 = a.readUShort()),
              (e[d].options.Param1 = a.readUChar()),
              (e[d].options.Index2 = a.readUShort()),
              (e[d].options.Value2 = a.readUShort()),
              (e[d].options.Param2 = a.readUChar()),
              (e[d].options.Index3 = a.readUShort()),
              (e[d].options.Value3 = a.readUShort()),
              (e[d].options.Param3 = a.readUChar()),
              (e[d].options.Index4 = a.readUShort()),
              (e[d].options.Value4 = a.readUShort()),
              (e[d].options.Param4 = a.readUChar()));
          return e;
        })()))
      : ((this.MaxPage = a.readLong()),
        (this.Number = a.readLong()),
        (this.auctionItemList = (function () {
          var d,
            b = ((c - a.tell()) / 108) | 0,
            e = Array(b);
          for (d = 0; d < b; ++d)
            ((e[d] = {}),
              (e[d].AuctionID = a.readULong()),
              (e[d].SellerName = a.readString(24)),
              (e[d].ITID = a.readUShort()),
              (e[d].Type = a.readLong()),
              (e[d].count = a.readShort()),
              (e[d].IsIdentified = a.readUChar()),
              (e[d].IsDamaged = a.readUChar()),
              (e[d].RefiningLevel = a.readUChar()),
              (e[d].slot = {}),
              (e[d].slot.card1 = a.readUShort()),
              (e[d].slot.card2 = a.readUShort()),
              (e[d].slot.card3 = a.readUShort()),
              (e[d].slot.card4 = a.readUShort()),
              (e[d].NowPrice = a.readLong()),
              (e[d].MaxPrice = a.readLong()),
              (e[d].BuyerName = a.readString(24)),
              (e[d].DeleteTime = a.readLong()),
              (e[d].options = {}),
              (e[d].options.Index0 = a.readUShort()),
              (e[d].options.Value0 = a.readUShort()),
              (e[d].options.Param0 = a.readUChar()),
              (e[d].options.Index1 = a.readUShort()),
              (e[d].options.Value1 = a.readUShort()),
              (e[d].options.Param1 = a.readUChar()),
              (e[d].options.Index2 = a.readUShort()),
              (e[d].options.Value2 = a.readUShort()),
              (e[d].options.Param2 = a.readUChar()),
              (e[d].options.Index3 = a.readUShort()),
              (e[d].options.Value3 = a.readUShort()),
              (e[d].options.Param3 = a.readUChar()),
              (e[d].options.Index4 = a.readUShort()),
              (e[d].options.Value4 = a.readUShort()),
              (e[d].options.Param4 = a.readUChar()));
          return e;
        })()));
  };
  c.ZC.AUCTION_ITEM_REQ_SEARCH.size = -1;
  c.ZC.STARPLACE = function (a, b) {
    this.which = a.readChar();
  };
  c.ZC.STARPLACE.size = 3;
  c.ZC.ACK_MAIL_ADD_ITEM = function (a, b) {
    this.Index = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.ACK_MAIL_ADD_ITEM.size = 5;
  c.ZC.ACK_AUCTION_ADD_ITEM = function (a, b) {
    this.Index = a.readShort();
    this.result = a.readUChar();
  };
  c.ZC.ACK_AUCTION_ADD_ITEM.size = 5;
  c.ZC.ACK_MAIL_DELETE = function (a, b) {
    this.MailID = a.readLong();
    this.Result = a.readUShort();
  };
  c.ZC.ACK_MAIL_DELETE.size = 8;
  c.AC.ACK_GAME_GUARD = function (a, b) {
    this.ucAnswer = a.readUChar();
  };
  c.AC.ACK_GAME_GUARD.size = 3;
  c.ZC.MAKINGITEM_LIST = function (a, b) {
    this.type = a.readUShort();
    b = ((b - a.tell()) / 4) | 0;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readLong();
    this.idList = d;
  };
  c.ZC.MAKINGITEM_LIST.size = -1;
  c.ZC.AUCTION_ACK_MY_SELL_STOP = function (a, b) {
    this.Result = a.readShort();
  };
  c.ZC.AUCTION_ACK_MY_SELL_STOP.size = 4;
  c.ZC.AUCTION_WINDOWS = function (a, b) {
    this.Type = a.readLong();
  };
  c.ZC.AUCTION_WINDOWS.size = 6;
  c.ZC.MAIL_WINDOWS = function (a, b) {
    this.Type = a.readLong();
  };
  c.ZC.MAIL_WINDOWS.size = 6;
  c.AC.REQ_LOGIN_OLDEKEY = function (a, b) {
    this.m_SeedValue = a.readBinaryString(9);
  };
  c.AC.REQ_LOGIN_OLDEKEY.size = 11;
  c.AC.REQ_LOGIN_NEWEKEY = function (a, b) {
    this.m_SeedValue = a.readBinaryString(9);
  };
  c.AC.REQ_LOGIN_NEWEKEY.size = 11;
  c.AC.REQ_LOGIN_CARDPASS = function (a, b) {
    this.m_SeedValue = a.readBinaryString(9);
  };
  c.AC.REQ_LOGIN_CARDPASS.size = 11;
  c.AC.ACK_EKEY_FAIL_NOTEXIST = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_NOTEXIST.size = 4;
  c.AC.ACK_EKEY_FAIL_NOTUSESEKEY = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_NOTUSESEKEY.size = 4;
  c.AC.ACK_EKEY_FAIL_NOTUSEDEKEY = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_NOTUSEDEKEY.size = 4;
  c.AC.ACK_EKEY_FAIL_AUTHREFUSE = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_AUTHREFUSE.size = 4;
  c.AC.ACK_EKEY_FAIL_INPUTEKEY = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_INPUTEKEY.size = 4;
  c.AC.ACK_EKEY_FAIL_NOTICE = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_NOTICE.size = 4;
  c.AC.ACK_EKEY_FAIL_NEEDCARDPASS = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_EKEY_FAIL_NEEDCARDPASS.size = 4;
  c.AC.ACK_AUTHEKEY_FAIL_NOTMATCHCARDPASS = function (a, b) {
    this.errorCode = a.readShort();
  };
  c.AC.ACK_AUTHEKEY_FAIL_NOTMATCHCARDPASS.size = 4;
  c.AC.ACK_FIRST_LOGIN = function (a, b) {};
  c.AC.ACK_FIRST_LOGIN.size = 2;
  c.AC.REQ_LOGIN_ACCOUNT_INFO = function (a, b) {};
  c.AC.REQ_LOGIN_ACCOUNT_INFO.size = 2;
  c.AC.ACK_PT_ID_INFO = function (a, b) {
    this.szPTID = a.readBinaryString(21);
    this.szPTNumID = a.readBinaryString(21);
  };
  c.AC.ACK_PT_ID_INFO.size = 44;
  c.ZC.ACK_MAIL_RETURN = function (a, b) {
    this.MailID = a.readLong();
    this.Result = a.readShort();
  };
  c.ZC.ACK_MAIL_RETURN.size = 8;
  c.AC.ACCEPT_LOGIN2 = function (a, b) {
    this.AuthCode = a.readLong();
    this.AID = a.readULong();
    this.userLevel = a.readULong();
    this.lastLoginIP = a.readULong();
    this.lastLoginTime = a.readBinaryString(26);
    this.Sex = a.readUChar();
    this.iAccountSID = a.readLong();
  };
  c.AC.ACCEPT_LOGIN2.size = 51;
  c.ZC.NOTIFY_PCBANG = function (a, b) {};
  c.ZC.NOTIFY_PCBANG.size = 2;
  c.ZC.HUNTINGLIST = function (a, b) {
    var d = ((b - a.tell()) / 12) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].questID = a.readULong()),
        (c[b].mobGID = a.readULong()),
        (c[b].maxCount = a.readShort()),
        (c[b].count = a.readShort()));
    this.HuntingList = c;
  };
  c.ZC.HUNTINGLIST.size = -1;
  c.ZC.PCBANG_EFFECT = function (a, b) {
    this.ExpFactor = a.readLong();
    this.ExpFactor2 = a.readLong();
    this.DropFactor = a.readLong();
  };
  c.ZC.PCBANG_EFFECT.size = 14;
  c.ZC.PROPERTY_MERCE = function (a, b) {
    this.name = a.readString(24);
    this.level = a.readShort();
    this.faith = a.readShort();
    this.summonCount = a.readShort();
    this.atk = a.readShort();
    this.Matk = a.readShort();
    this.hit = a.readShort();
    this.critical = a.readShort();
    this.def = a.readShort();
    this.Mdef = a.readShort();
    this.flee = a.readShort();
    this.aspd = a.readShort();
    this.hp = a.readShort();
    this.maxHP = a.readShort();
    this.sp = a.readShort();
    this.maxSP = a.readShort();
    this.ATKRange = a.readShort();
    this.exp = a.readLong();
  };
  c.ZC.PROPERTY_MERCE.size = 62;
  c.ZC.SHANDA_PROTECT = function (a, b) {
    this.CodeLen = a.readShort();
    this.Code = a.readBinaryString(b - a.tell());
  };
  c.ZC.SHANDA_PROTECT.size = -1;
  c.ZC.GANGSI_POINT = function (a, b) {
    this.Point = a.readLong();
    this.TotalPoint = a.readLong();
    this.PacketSwitch = a.readShort();
  };
  c.ZC.GANGSI_POINT.size = 12;
  c.ZC.GANGSI_RANK = function (a, b) {
    this.Name = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readString(24);
      return d;
    })();
    this.Point = (function () {
      for (var d = Array(10), b = 0; 10 > b; ++b) d[b] = a.readLong();
      return d;
    })();
    this.PacketSwitch = a.readShort();
  };
  c.ZC.GANGSI_RANK.size = 284;
  c.ZC.AID = function (a, b) {
    this.AID = a.readULong();
  };
  c.ZC.AID.size = 6;
  c.ZC.NOTIFY_EFFECT3 = function (a, b) {
    this.AID = a.readULong();
    this.effectID = a.readLong();
    this.numdata = a.readLong();
  };
  c.ZC.NOTIFY_EFFECT3.size = 14;
  c.ZC.DEATH_QUESTION = function (a, b) {
    this.Qcategory = a.readShort();
    this.Qnum = a.readShort();
  };
  c.ZC.DEATH_QUESTION.size = 6;
  c.ZC.PC_CASH_POINT_ITEMLIST = function (a, b) {
    this.CashPoint = a.readULong();
    this.md_itemcount = a.readShort();
    this.md_itemSize = a.readShort();
    var d = ((b - a.tell()) / 11) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].discountprice = a.readLong()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readUShort()));
    this.ItemList = c;
  };
  c.ZC.PC_CASH_POINT_ITEMLIST.size = -1;
  c.ZC.PC_CASH_POINT_UPDATE = function (a, b) {
    this.CashPoint = a.readULong();
    this.kafraPoint = a.readULong();
    this.Error = a.readShort();
  };
  c.ZC.PC_CASH_POINT_UPDATE.size = 12;
  c.ZC.NPC_SHOWEFST_UPDATE = function (a, b) {
    this.AID = a.readULong();
    this.effectState = a.readLong();
    this.clevel = a.readLong();
    this.showEFST = a.readLong();
  };
  c.ZC.NPC_SHOWEFST_UPDATE.size = 18;
  c.HC.ACK_IS_VALID_CHARNAME = function (a, b) {
    this.sResult = a.readShort();
  };
  c.HC.ACK_IS_VALID_CHARNAME.size = 4;
  c.HC.ACK_CHANGE_CHARNAME = function (a, b) {
    this.sResult = a.readShort();
  };
  c.HC.ACK_CHANGE_CHARNAME.size = 4;
  c.ZC.MSG = function (a, b) {
    this.msg = a.readUShort();
  };
  c.ZC.MSG.size = 4;
  c.ZC.BOSS_INFO = function (a, b) {
    this.infoType = a.readUChar();
    this.xPos = a.readLong();
    this.yPos = a.readLong();
    this.minHour = a.readUShort();
    this.minMinute = a.readUShort();
    this.maxHour = a.readUShort();
    this.maxMinute = a.readUShort();
    this.name = a.readString(51);
  };
  c.ZC.BOSS_INFO.size = 70;
  c.ZC.READ_BOOK = function (a, b) {
    this.bookID = a.readULong();
    this.page = a.readULong();
  };
  c.ZC.READ_BOOK.size = 10;
  c.ZC.EQUIPMENT_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 24) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()));
    this.ItemInfo = c;
  };
  c.ZC.EQUIPMENT_ITEMLIST2.size = -1;
  c.ZC.STORE_EQUIPMENT_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 24) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()));
    this.ItemInfo = c;
  };
  c.ZC.STORE_EQUIPMENT_ITEMLIST2.size = -1;
  c.ZC.CART_EQUIPMENT_ITEMLIST2 = function (a, b) {
    var d = ((b - a.tell()) / 24) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()));
    this.ItemInfo = c;
  };
  c.ZC.CART_EQUIPMENT_ITEMLIST2.size = -1;
  c.ZC.CASH_TIME_COUNTER = function (a, b) {
    this.ITID = a.readULong();
    this.RemainSecond = a.readULong();
  };
  c.ZC.CASH_TIME_COUNTER.size = 10;
  c.ZC.CASH_ITEM_DELETE = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 8),
        (this.index = a.readShort()),
        (this.ITID = a.readULong()))
      : ((this.size = 6),
        (this.index = a.readShort()),
        (this.ITID = a.readUShort()));
  };
  c.ZC.ITEM_PICKUP_ACK2 = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readUShort();
    this.type = a.readUChar();
    this.result = a.readUChar();
    this.HireExpireDate = a.readLong();
  };
  c.ZC.ITEM_PICKUP_ACK2.size = 27;
  c.ZC.MER_INIT = function (a, b) {
    this.AID = a.readLong();
    this.atk = a.readShort();
    this.Matk = a.readShort();
    this.hit = a.readShort();
    this.critical = a.readShort();
    this.def = a.readShort();
    this.Mdef = a.readShort();
    this.flee = a.readShort();
    this.aspd = a.readShort();
    this.name = a.readString(24);
    this.level = a.readShort();
    this.hp = a.readLong();
    this.maxHP = a.readLong();
    this.sp = a.readLong();
    this.maxSP = a.readLong();
    this.ExpireDate = a.readLong();
    this.faith = a.readShort();
    this.toal_call_num = a.readLong();
    this.approval_monster_kill_counter = a.readLong();
    this.ATKRange = a.readShort();
  };
  c.ZC.MER_INIT.size = 80;
  c.ZC.MER_PROPERTY = function (a, b) {
    this.atk = a.readShort();
    this.Matk = a.readShort();
    this.hit = a.readShort();
    this.critical = a.readShort();
    this.def = a.readShort();
    this.Mdef = a.readShort();
    this.flee = a.readShort();
    this.aspd = a.readShort();
    this.name = a.readString(24);
    this.level = a.readShort();
    this.hp = a.readShort();
    this.maxHP = a.readShort();
    this.sp = a.readShort();
    this.maxSP = a.readShort();
    this.ExpireDate = a.readLong();
    this.faith = a.readShort();
    this.toal_call_num = a.readLong();
    this.approval_monster_kill_counter = a.readLong();
  };
  c.ZC.MER_PROPERTY.size = 66;
  c.ZC.HOM_SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.HOM_SKILLINFO_LIST.size = -1;
  c.ZC.MER_SKILLINFO_LIST = function (a, b) {
    var d = ((b - a.tell()) / 37) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readShort()),
        (c[b].type = a.readLong()),
        (c[b].level = a.readShort()),
        (c[b].spcost = a.readShort()),
        (c[b].attackRange = a.readShort()),
        (c[b].skillName = a.readBinaryString(24)),
        (c[b].upgradable = a.readChar()));
    this.skillList = c;
  };
  c.ZC.MER_SKILLINFO_LIST.size = -1;
  c.ZC.MER_SKILLINFO_UPDATE = function (a, b) {
    this.SKID = a.readUShort();
    this.level = a.readShort();
    this.spcost = a.readShort();
    this.attackRange = a.readShort();
    this.upgradable = a.readUChar();
  };
  c.ZC.MER_SKILLINFO_UPDATE.size = 11;
  c.ZC.MER_PAR_CHANGE = function (a, b) {
    this.param = a.readUShort();
    this.value = a.readLong();
  };
  c.ZC.MER_PAR_CHANGE.size = 8;
  c.ZC.GAMEGUARD_LINGO_KEY = function (a, b) {
    this.packetType = a.readShort();
    this.lingoKey = {};
    this.lingoKey.dwAlgNum = a.readULong();
    this.lingoKey.dwAlgKey1 = a.readULong();
    this.lingoKey.dwAlgKey2 = a.readULong();
    this.lingoKey.dwSeed = a.readULong();
  };
  c.ZC.GAMEGUARD_LINGO_KEY.size = 18;
  c.ZC.REQ_CASH_PASSWORD = function (a, b) {
    this.Info = a.readShort();
  };
  c.ZC.REQ_CASH_PASSWORD.size = 4;
  c.ZC.RESULT_CASH_PASSWORD = function (a, b) {
    this.Result = a.readShort();
    this.ErrorCount = a.readShort();
  };
  c.ZC.RESULT_CASH_PASSWORD.size = 6;
  c.AC.REQUEST_SECOND_PASSWORD = function (a, b) {
    this.Result = a.readShort();
    this.dwSeed = a.readULong();
  };
  c.AC.REQUEST_SECOND_PASSWORD.size = 8;
  c.ZC.ALL_QUEST_LIST = function (a, b) {
    this.questCount = a.readLong();
    var d = ((b - a.tell()) / 5) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].questID = a.readULong()),
        (c[b].active = a.readUChar()));
    this.QuestList = c;
  };
  c.ZC.ALL_QUEST_LIST.size = -1;
  c.ZC.ALL_QUEST_MISSION = function (a, b) {
    this.count = a.readLong();
    var d = ((b - a.tell()) / 104) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b) {
      c[b] = {};
      c[b].questID = a.readULong();
      c[b].quest_svrTime = a.readLong();
      c[b].quest_endTime = a.readLong();
      c[b].count = a.readShort();
      var e = c[b],
        q,
        k = Array(3);
      for (q = 0; 3 > q; ++q)
        ((k[q] = {}),
          (k[q].mobGID = a.readULong()),
          (k[q].huntCount = a.readShort()),
          (k[q].mobName = a.readString(24)));
      e.hunt = k;
    }
    this.QuestMissionList = c;
  };
  c.ZC.ALL_QUEST_MISSION.size = -1;
  c.ZC.ADD_QUEST = function (a, b) {
    this.questID = a.readULong();
    this.active = a.readUChar();
    this.quest_svrTime = a.readLong();
    this.quest_endTime = a.readLong();
    this.count = a.readShort();
    var d = Array(3);
    for (b = 0; 3 > b; ++b)
      ((d[b] = {}),
        (d[b].mobGID = a.readULong()),
        (d[b].huntCount = a.readShort()),
        (d[b].mobName = a.readString(24)));
    this.hunt = d;
  };
  c.ZC.ADD_QUEST.size = 107;
  c.ZC.DEL_QUEST = function (a, b) {
    this.questID = a.readULong();
  };
  c.ZC.DEL_QUEST.size = 6;
  c.ZC.HUNTING_QUEST_INFO = function (a, b) {
    var d = ((b - a.tell()) / 12) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].questID = a.readULong()),
        (c[b].mobGID = a.readULong()),
        (c[b].maxCount = a.readShort()),
        (c[b].count = a.readShort()));
    this.MobHuntList = c;
  };
  c.ZC.HUNTING_QUEST_INFO.size = -1;
  c.ZC.UPDATE_MISSION_HUNT = function (a, b) {
    this.count = a.readShort();
    var d = ((b - a.tell()) / 12) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].questID = a.readULong()),
        (c[b].mobGID = a.readULong()),
        (c[b].maxCount = a.readShort()),
        (c[b].count = a.readShort()));
    this.MobHuntList = c;
  };
  c.ZC.UPDATE_MISSION_HUNT.size = -1;
  c.ZC.UPDATE_MISSION_HUNT_EX = function (a, b) {
    this.count = a.readShort();
    var d = ((b - a.tell()) / 12) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].questID = a.readULong()),
        (c[b].QID = a.readULong()),
        (c[b].maxCount = a.readShort()),
        (c[b].count = a.readShort()));
    this.MobHuntList = c;
  };
  c.ZC.UPDATE_MISSION_HUNT_EX.size = -1;
  c.ZC.ACTIVE_QUEST = function (a, b) {
    this.questID = a.readULong();
    this.active = a.readUChar();
  };
  c.ZC.ACTIVE_QUEST.size = 7;
  c.ZC.ITEM_PICKUP_PARTY = function (a, b) {
    this.accountID = a.readULong();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readUShort();
    this.type = a.readUChar();
  };
  c.ZC.ITEM_PICKUP_PARTY.size = 22;
  c.ZC.ITEM_PICKUP_PARTY2 = function (a, b) {
    this.accountID = a.readULong();
    this.ITID = a.readULong();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.location = a.readUShort();
    this.type = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.grade = a.readUChar();
  };
  c.ZC.ITEM_PICKUP_PARTY2.size = 33;
  c.ZC.SHORTCUT_KEY_LIST = function (a, b) {
    var d = Array(27);
    for (b = 0; 27 > b; ++b)
      ((d[b] = {}),
        (d[b].isSkill = a.readChar()),
        (d[b].ID = a.readULong()),
        (d[b].count = a.readShort()));
    this.ShortCutKey = d;
  };
  c.ZC.SHORTCUT_KEY_LIST.size = 191;
  c.ZC.EQUIPITEM_DAMAGED = function (a, b) {
    this.wearLocation = a.readUShort();
    this.accountID = a.readULong();
  };
  c.ZC.EQUIPITEM_DAMAGED.size = 8;
  c.ZC.NOTIFY_PCBANG_PLAYING_TIME = function (a, b) {
    this.TimeMinute = a.readLong();
  };
  c.ZC.NOTIFY_PCBANG_PLAYING_TIME.size = 6;
  c.ZC.SRPACKETR2_INIT = function (a, b) {
    this.ProtectFactor = a.readUShort();
    this.DeformSeedFactor = a.readULong();
    this.DeformAddFactor = a.readULong();
  };
  c.ZC.SRPACKETR2_INIT.size = 12;
  c.ZC.NPC_CHAT = function (a, b) {
    this.accountID = a.readULong();
    this.color = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.NPC_CHAT.size = -1;
  c.ZC.FORMATSTRING_MSG = function (a, b) {
    this.msg = a.readUShort();
    this.value = a.readString(b - a.tell());
  };
  c.ZC.FORMATSTRING_MSG.size = -1;
  c.ZC.PARTY_JOIN_REQ_ACK = function (a, b) {
    this.characterName = a.readString(24);
    this.answer = a.readLong();
  };
  c.ZC.PARTY_JOIN_REQ_ACK.size = 30;
  c.ZC.PARTY_JOIN_REQ = function (a, b) {
    this.GRID = a.readULong();
    this.groupName = a.readString(24);
  };
  c.ZC.PARTY_JOIN_REQ.size = 30;
  c.ZC.PARTY_CONFIG = function (a, b) {
    this.bRefuseJoinMsg = a.readUChar();
  };
  c.ZC.PARTY_CONFIG.size = 3;
  c.HC.REFUSE_SELECTCHAR = function (a, b) {
    this.ErrorCode = a.readUChar();
  };
  c.HC.REFUSE_SELECTCHAR.size = 3;
  c.ZC.MEMORIALDUNGEON_SUBSCRIPTION_INFO = function (a, b) {
    this.MemorialDungeonName = a.readString(61);
    this.PriorityOrderNum = a.readShort();
  };
  c.ZC.MEMORIALDUNGEON_SUBSCRIPTION_INFO.size = 65;
  c.ZC.MEMORIALDUNGEON_SUBSCRIPTION_NOTIFY = function (a, b) {
    this.PriorityOrderNum = a.readShort();
  };
  c.ZC.MEMORIALDUNGEON_SUBSCRIPTION_NOTIFY.size = 4;
  c.ZC.MEMORIALDUNGEON_INFO = function (a, b) {
    this.MemorialDungeonName = a.readString(61);
    this.DestroyDate = a.readULong();
    this.EnterTimeOutDate = a.readULong();
  };
  c.ZC.MEMORIALDUNGEON_INFO.size = 71;
  c.ZC.MEMORIALDUNGEON_NOTIFY = function (a, b) {
    this.Type = a.readLong();
    this.EnterLimitDate = a.readULong();
  };
  c.ZC.MEMORIALDUNGEON_NOTIFY.size = 10;
  c.ZC.EQUIPMENT_ITEMLIST3 = function (a, b) {
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.EQUIPMENT_ITEMLIST3.size = -1;
  c.ZC.STORE_EQUIPMENT_ITEMLIST3 = function (a, b) {
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.STORE_EQUIPMENT_ITEMLIST3.size = -1;
  c.ZC.CART_EQUIPMENT_ITEMLIST3 = function (a, b) {
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.CART_EQUIPMENT_ITEMLIST3.size = -1;
  c.ZC.NOTIFY_BIND_ON_EQUIP = function (a, b) {
    this.index = a.readUShort();
  };
  c.ZC.NOTIFY_BIND_ON_EQUIP.size = 4;
  c.ZC.ITEM_PICKUP_ACK3 = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readUShort();
    this.type = a.readUChar();
    this.result = a.readUChar();
    this.HireExpireDate = a.readLong();
    this.bindOnEquipType = a.readUShort();
  };
  c.ZC.ITEM_PICKUP_ACK3.size = 29;
  c.ZC.ISVR_DISCONNECT = function (a, b) {};
  c.ZC.ISVR_DISCONNECT.size = 2;
  c.ZC.EQUIPWIN_MICROSCOPE = function (a, b) {
    this.characterName = a.readString(24);
    this.job = a.readShort();
    this.head = a.readShort();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.sex = a.readUChar();
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.EQUIPWIN_MICROSCOPE.size = -1;
  c.ZC.EQUIPWIN_MICROSCOPE3 = function (a, b) {
    this.characterName = a.readString(24);
    this.job = a.readShort();
    this.head = a.readShort();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.robe = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.body2 = a.readShort();
    this.sex = a.readUChar();
    var d = ((b - a.tell()) / 68) | 0,
      c = Array(d),
      e;
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readULong()),
        (c[b].type = a.readUChar()),
        (c[b].location = a.readULong()),
        (c[b].WearState = a.readULong()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readULong()),
        (c[b].slot.card2 = a.readULong()),
        (c[b].slot.card3 = a.readULong()),
        (c[b].slot.card4 = a.readULong()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()),
        (c[b].nRandomOptionCnt = a.readUChar()),
        (c[b].options = {}),
        (c[b].options.Index0 = a.readShort()),
        (c[b].options.Value0 = a.readShort()),
        (c[b].options.Param0 = a.readUChar()),
        (c[b].options.Index1 = a.readShort()),
        (c[b].options.Value1 = a.readShort()),
        (c[b].options.Param1 = a.readUChar()),
        (c[b].options.Index2 = a.readShort()),
        (c[b].options.Value2 = a.readShort()),
        (c[b].options.Param2 = a.readUChar()),
        (c[b].options.Index3 = a.readShort()),
        (c[b].options.Value3 = a.readShort()),
        (c[b].options.Param3 = a.readUChar()),
        (c[b].options.Index4 = a.readShort()),
        (c[b].options.Value4 = a.readShort()),
        (c[b].options.Param4 = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].enchantgrade = a.readUChar()),
        (e = a.readUChar()),
        (c[b].IsIdentified = e & 1),
        (c[b].IsDamaged = e & 2),
        (c[b].PlaceETCTab = e & 4),
        (c[b].SpareBits = e & 8));
    this.ItemInfo = c;
  };
  c.ZC.EQUIPWIN_MICROSCOPE3.size = -1;
  c.ZC.CONFIG = function (a, b) {
    this.Config = a.readLong();
    this.Value = a.readLong();
  };
  c.ZC.CONFIG.size = 10;
  c.ZC.CONFIG_NOTIFY = function (a, b) {
    this.bOpenEquipmentWin = a.readUChar();
  };
  c.ZC.CONFIG_NOTIFY.size = 3;
  c.ZC.BATTLEFIELD_CHAT = function (a, b) {
    this.accountID = a.readULong();
    this.name = a.readString(24);
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.BATTLEFIELD_CHAT.size = -1;
  c.ZC.BATTLEFIELD_NOTIFY_CAMPINFO = function (a, b) {
    this.accountID = a.readULong();
    this.name = a.readString(24);
    this.camp = a.readShort();
  };
  c.ZC.BATTLEFIELD_NOTIFY_CAMPINFO.size = 32;
  c.ZC.BATTLEFIELD_NOTIFY_POINT = function (a, b) {
    this.pointCampA = a.readShort();
    this.pointCampB = a.readShort();
  };
  c.ZC.BATTLEFIELD_NOTIFY_POINT.size = 6;
  c.ZC.BATTLEFIELD_NOTIFY_POSITION = function (a, b) {
    this.accountID = a.readULong();
    this.name = a.readString(24);
    this.job = a.readUShort();
    this.x = a.readShort();
    this.y = a.readShort();
  };
  c.ZC.BATTLEFIELD_NOTIFY_POSITION.size = 36;
  c.ZC.BATTLEFIELD_NOTIFY_HP = function (a, b) {
    this.accountID = a.readULong();
    this.name = a.readString(24);
    this.hp = a.readShort();
    this.maxHp = a.readShort();
  };
  c.ZC.BATTLEFIELD_NOTIFY_HP.size = 34;
  c.ZC.NOTIFY_ACT2 = function (a, b) {
    this.GID = a.readULong();
    this.targetGID = a.readULong();
    this.startTime = a.readULong();
    this.attackMT = a.readLong();
    this.attackedMT = a.readLong();
    this.damage = a.readLong();
    this.count = a.readShort();
    this.action = a.readUChar();
    this.leftDamage = a.readLong();
  };
  c.ZC.NOTIFY_ACT2.size = 33;
  c.ZC.MAPPROPERTY = function (a, b) {
    this.type = a.readShort();
    b = ((b - a.tell()) / 4) | 0;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readLong();
    this.mapInfoTable = d;
  };
  c.ZC.MAPPROPERTY.size = -1;
  c.ZC.NORMAL_ITEMLIST3 = function (a, b) {
    var d = ((b - a.tell()) / 22) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()));
    this.ItemInfo = c;
  };
  c.ZC.NORMAL_ITEMLIST3.size = -1;
  c.ZC.CART_NORMAL_ITEMLIST3 = function (a, b) {
    var d = ((b - a.tell()) / 22) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()));
    this.ItemInfo = c;
  };
  c.ZC.CART_NORMAL_ITEMLIST3.size = -1;
  c.ZC.STORE_NORMAL_ITEMLIST3 = function (a, b) {
    var d = ((b - a.tell()) / 22) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].count = a.readShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()));
    this.ItemInfo = c;
  };
  c.ZC.STORE_NORMAL_ITEMLIST3.size = -1;
  c.ZC.ACCEPT_ENTER2 = function (a, b) {
    this.startTime = a.readULong();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.font = a.readShort();
  };
  c.ZC.ACCEPT_ENTER2.size = 13;
  c.ZC.NOTIFY_MOVEENTRY4 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
  };
  c.ZC.NOTIFY_MOVEENTRY4.size = 67;
  c.ZC.NOTIFY_NEWENTRY4 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
  };
  c.ZC.NOTIFY_NEWENTRY4.size = 59;
  c.ZC.NOTIFY_STANDENTRY4 = function (a, b) {
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
  };
  c.ZC.NOTIFY_STANDENTRY4.size = 60;
  c.ZC.NOTIFY_FONT = function (a, b) {
    this.AID = a.readULong();
    this.font = a.readShort();
  };
  c.ZC.NOTIFY_FONT.size = 8;
  c.ZC.PROGRESS = function (a, b) {
    this.color = a.readULong();
    this.time = a.readULong();
  };
  c.ZC.PROGRESS.size = 10;
  c.ZC.PROGRESS_CANCEL = function (a, b) {};
  c.ZC.PROGRESS_CANCEL.size = 2;
  c.ZC.SIMPLE_CASHSHOP_POINT_ITEMLIST = function (a, b) {
    this.CashPoint = a.readULong();
    this.md_itemcount = a.readShort();
    this.md_itemSize = a.readShort();
    this.best_itemcount = a.readShort();
    this.best_itemsize = a.readShort();
    var d = ((b - a.tell()) / 11) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].discountprice = a.readLong()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readUShort()));
    this.ItemList = c;
  };
  c.ZC.SIMPLE_CASHSHOP_POINT_ITEMLIST.size = -1;
  c.AHC.GAME_GUARD = function (a, b) {
    b = Array(4);
    for (var d = 0; 4 > d; ++d) b[d] = a.readULong();
    this.AuthData = b;
  };
  c.AHC.GAME_GUARD.size = 18;
  c.CAH.ACK_GAME_GUARD = function (a, b) {
    b = Array(4);
    for (var d = 0; 4 > d; ++d) b[d] = a.readULong();
    this.AuthData = b;
  };
  c.CAH.ACK_GAME_GUARD.size = 18;
  c.ZC.SKILL_POSTDELAY = function (a, b) {
    this.SKID = a.readUShort();
    this.DelayTM = a.readULong();
  };
  c.ZC.SKILL_POSTDELAY.size = 8;
  c.ZC.SKILL_POSTDELAY_LIST = function (a, b) {
    var d = ((b - a.tell()) / 6) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SKID = a.readUShort()),
        (c[b].DelayTM = a.readULong()));
    this.delayList = c;
  };
  c.ZC.SKILL_POSTDELAY_LIST.size = -1;
  c.ZC.MSG_STATE_CHANGE2 = function (a, b) {
    this.index = a.readShort();
    this.AID = a.readULong();
    this.state = a.readUChar();
    this.RemainMS = a.readULong();
    b = Array(3);
    for (var d = 0; 3 > d; ++d) b[d] = a.readLong();
    this.val = b;
  };
  c.ZC.MSG_STATE_CHANGE2.size = 25;
  c.ZC.MILLENNIUMSHIELD = function (a, b) {
    this.AID = a.readULong();
    this.num = a.readShort();
    this.state = a.readShort();
  };
  c.ZC.MILLENNIUMSHIELD.size = 10;
  c.ZC.SKILLINFO_DELETE = function (a, b) {
    this.SKID = a.readUShort();
  };
  c.ZC.SKILLINFO_DELETE.size = 4;
  c.ZC.SKILL_SELECT_REQUEST = function (a, b) {
    this.why = a.readLong();
    b = ((b - a.tell()) / 2) | 0;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readUShort();
    this.SKID = d;
  };
  c.ZC.SKILL_SELECT_REQUEST.size = -1;
  c.ZC.SKILL_AUTOSHADOWSPELL = function (a, b) {
    this.why = a.readLong();
    b = ((b - a.tell()) / 2) | 0;
    for (var d = Array(b), c = 0; c < b; ++c) d[c] = a.readUShort();
    this.SKID = d;
  };
  c.ZC.SKILL_AUTOSHADOWSPELL.size = -1;
  c.ZC.SIMPLE_CASH_POINT_ITEMLIST = function (a, b) {
    this.CashPoint = a.readULong();
    var d = ((b - a.tell()) / 11) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].discountprice = a.readLong()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readUShort()));
    this.ItemList = c;
  };
  c.ZC.SIMPLE_CASH_POINT_ITEMLIST.size = -1;
  c.ZC.QUEST_NOTIFY_EFFECT = function (a, b) {
    this.npcID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.effect = a.readShort();
    this.color = a.readShort();
  };
  c.ZC.QUEST_NOTIFY_EFFECT.size = 14;
  c.HC.CHARACTER_LIST = function (a, b) {
    var d = ((b - a.tell()) / 5) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].dwGID = a.readULong()),
        (c[b].SlotIdx = a.readUChar()));
    this.CharacterList = c;
  };
  c.HC.CHARACTER_LIST.size = -1;
  c.ZC.HACKSH_ERROR_MSG = function (a, b) {
    this.ErrorID = a.readShort();
  };
  c.ZC.HACKSH_ERROR_MSG.size = 4;
  c.ZC.ES_RESULT = function (a, b) {
    this.esNo = a.readShort();
    this.esMsg = a.readShort();
  };
  c.ZC.ES_RESULT.size = 6;
  c.ZC.ES_LIST = function (a, b) {
    this.Count = a.readShort();
  };
  c.ZC.ES_LIST.size = 6;
  c.ZC.ES_READY = function (a, b) {
    this.esNo = a.readShort();
  };
  c.ZC.ES_READY.size = 4;
  c.ZC.ES_GOTO = function (a, b) {
    this.esNo = a.readShort();
  };
  c.ZC.ES_GOTO.size = 4;
  c.ZC.REQ_GROUPINFO_CHANGE_V2 = function (a, b) {
    this.expOption = a.readULong();
    this.ItemPickupRule = a.readUChar();
    this.ItemDivisionRule = a.readUChar();
  };
  c.ZC.REQ_GROUPINFO_CHANGE_V2.size = 8;
  c.ZC.SHORTCUT_KEY_LIST_V2 = function (a, b) {
    var d = Array(38);
    for (b = 0; 38 > b; ++b)
      ((d[b] = {}),
        (d[b].isSkill = a.readChar()),
        (d[b].ID = a.readULong()),
        (d[b].count = a.readShort()));
    this.ShortCutKey = d;
  };
  c.ZC.SHORTCUT_KEY_LIST_V2.size = 268;
  c.ZC.HO_PAR_CHANGE = function (a, b) {
    this.param = a.readUShort();
    this.value = a.readLong();
  };
  c.ZC.HO_PAR_CHANGE.size = 8;
  c.ZC.HO_PAR_CHANGE2 = function (a, b) {
    this.param = a.readUShort();
    this.value = a.readQLong();
  };
  c.ZC.HO_PAR_CHANGE2.size = 12;
  c.ZC.SEEK_PARTY = function (a, b) {
    this.Name = a.readString(24);
    this.Job = a.readULong();
    this.Level = a.readULong();
    this.mapName = a.readBinaryString(16);
    this.Option = a.readULong();
  };
  c.ZC.SEEK_PARTY.size = 54;
  c.ZC.SEEK_PARTY_MEMBER = function (a, b) {
    this.Name = a.readString(24);
    this.Job = a.readULong();
    this.Level = a.readULong();
    this.mapName = a.readBinaryString(16);
    this.Option = a.readULong();
  };
  c.ZC.SEEK_PARTY_MEMBER.size = 54;
  c.ZC.ES_NOTI_MYINFO = function (a, b) {
    this.esNo = a.readShort();
    this.esname = a.readString(54);
  };
  c.ZC.ES_NOTI_MYINFO.size = 58;
  c.ZC.SKILLINFO_UPDATE2 = function (a, b) {
    this.SKID = a.readUShort();
    this.type = a.readLong();
    this.level = a.readShort();
    this.spcost = a.readShort();
    this.attackRange = a.readShort();
    this.upgradable = a.readUChar();
  };
  c.ZC.SKILLINFO_UPDATE2.size = 15;
  c.ZC.SKILLINFO_UPDATE3 = function (a, b) {
    this.SKID = a.readUShort();
    this.type = a.readLong();
    this.level = a.readShort();
    this.spcost = a.readShort();
    this.attackRange = a.readShort();
    this.upgradable = a.readUChar();
    this.level2 = a.readShort();
  };
  c.ZC.SKILLINFO_UPDATE3.size = 17;
  c.ZC.MSG_VALUE = function (a, b) {
    this.msg = a.readUShort();
    this.value = a.readLong();
  };
  c.ZC.MSG_VALUE.size = 8;
  c.ZC.ITEMLISTWIN_OPEN = function (a, b) {
    this.Type = a.readLong();
  };
  c.ZC.ITEMLISTWIN_OPEN.size = 6;
  c.ZC.MSG_SKILL = function (a, b) {
    this.SKID = a.readUShort();
    this.MSGID = a.readLong();
  };
  c.ZC.MSG_SKILL.size = 8;
  c.ZC.MSG_COLOR = function (a, b) {
    this.msg = a.readUShort();
    this.color = a.readLong();
  };
  c.ZC.MSG_COLOR.size = 8;
  c.HC.CHECKBOT = function (a, b) {
    this.img = a.readBinaryString(b - a.tell());
  };
  c.HC.CHECKBOT.size = -1;
  c.HC.CHECKBOT_RESULT = function (a, b) {
    this.Result = a.readUChar();
  };
  c.HC.CHECKBOT_RESULT.size = 5;
  c.ZC.BATTLE_FIELD_LIST = function (a, b) {
    this.Count = a.readShort();
    this.ack_type = a.readShort();
    var d = ((b - a.tell()) / 62) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].BFNO = a.readULong()),
        (c[b].BattleFieldName = a.readString(56)),
        (c[b].JoinTeam = a.readShort()));
    this.InfoList = c;
  };
  c.ZC.BATTLE_FIELD_LIST.size = -1;
  c.ZC.JOIN_BATTLE_FIELD = function (a, b) {
    this.BFNO = a.readULong();
    this.JoinTeam = a.readShort();
    this.Result = a.readShort();
  };
  c.ZC.JOIN_BATTLE_FIELD.size = 10;
  c.ZC.CANCEL_BATTLE_FIELD = function (a, b) {
    this.BFNO = a.readULong();
    this.Result = a.readShort();
  };
  c.ZC.CANCEL_BATTLE_FIELD.size = 8;
  c.ZC.ACK_BATTLE_STATE_MONITOR = function (a, b) {
    this.BFNO = a.readULong();
    this.PlayCount = a.readShort();
    this.BattleState = a.readShort();
    this.TeamCount_A = a.readShort();
    this.TeamCount_B = a.readShort();
    this.MyCount = a.readShort();
    this.JoinTeam = a.readShort();
  };
  c.ZC.ACK_BATTLE_STATE_MONITOR.size = 18;
  c.ZC.BATTLE_NOTI_START_STEP = function (a, b) {
    this.BFNO = a.readULong();
    this.Result = a.readShort();
  };
  c.ZC.BATTLE_NOTI_START_STEP.size = 8;
  c.ZC.BATTLE_JOIN_NOTI_DEFER = function (a, b) {
    this.BFNO = a.readULong();
  };
  c.ZC.BATTLE_JOIN_NOTI_DEFER.size = 6;
  c.ZC.BATTLE_JOIN_DISABLE_STATE = function (a, b) {
    this.Enable = a.readUChar();
  };
  c.ZC.BATTLE_JOIN_DISABLE_STATE.size = 3;
  c.ZC.NOTIFY_EXP = function (a, b) {
    this.AID = a.readULong();
    this.amount = a.readLong();
    this.varID = a.readUShort();
    this.expType = a.readShort();
  };
  c.ZC.NOTIFY_EXP.size = 14;
  c.ZC.NOTIFY_MOVEENTRY5 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_MOVEENTRY5.size = -1;
  c.ZC.NOTIFY_NEWENTRY5 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_NEWENTRY5.size = -1;
  c.ZC.NOTIFY_STANDENTRY5 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_STANDENTRY5.size = -1;
  c.ZC.DELETE_ITEM_FROM_BODY = function (a, b) {
    this.DeleteType = a.readShort();
    this.Index = a.readUShort();
    this.Count = a.readShort();
  };
  c.ZC.DELETE_ITEM_FROM_BODY.size = 8;
  c.ZC.USESKILL_ACK2 = function (a, b) {
    this.AID = a.readULong();
    this.targetID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.SKID = a.readUShort();
    this.property = a.readULong();
    this.delayTime = a.readULong();
    this.isDisposable = a.readUChar();
  };
  c.ZC.USESKILL_ACK2.size = 25;
  c.ZC.USESKILL_ACK3 = function (a, b) {
    this.AID = a.readULong();
    this.targetID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.SKID = a.readUShort();
    this.property = a.readULong();
    this.delayTime = a.readULong();
    this.isDisposable = a.readUChar();
    this.attackMT = a.readULong();
  };
  c.ZC.USESKILL_ACK3.size = 29;
  c.ZC.CHANGE_GROUP_MASTER = function (a, b) {
    this.OldMasterAID = a.readULong();
    this.NewMasterAID = a.readULong();
  };
  c.ZC.CHANGE_GROUP_MASTER.size = 10;
  c.ZC.PLAY_NPC_BGM = function (a, b) {
    this.Bgm = a.readBinaryString(24);
  };
  c.ZC.PLAY_NPC_BGM.size = 26;
  c.ZC.DEFINE_CHECK = function (a, b) {
    this.Result = a.readLong();
  };
  c.ZC.DEFINE_CHECK.size = 8;
  c.ZC.PC_PURCHASE_ITEMLIST_FROMMC2 = function (a, c) {
    20160921 <= b.value
      ? ((this.AID = a.readULong()),
        (this.UniqueID = a.readULong()),
        (this.itemList = (function () {
          var b,
            d = ((c - a.tell()) / 53) | 0,
            e = Array(d);
          for (b = 0; b < d; ++b)
            ((e[b] = {}),
              (e[b].price = a.readLong()),
              (e[b].count = a.readShort()),
              (e[b].index = a.readShort()),
              (e[b].type = a.readUChar()),
              (e[b].ITID = a.readUShort()),
              (e[b].IsIdentified = a.readUChar()),
              (e[b].IsDamaged = a.readUChar()),
              (e[b].RefiningLevel = a.readUChar()),
              (e[b].slot = {}),
              (e[b].slot.card1 = a.readUShort()),
              (e[b].slot.card2 = a.readUShort()),
              (e[b].slot.card3 = a.readUShort()),
              (e[b].slot.card4 = a.readUShort()),
              (e[b].options = {}),
              (e[b].options.Index0 = a.readUShort()),
              (e[b].options.Value0 = a.readUShort()),
              (e[b].options.Param0 = a.readUChar()),
              (e[b].options.Index1 = a.readUShort()),
              (e[b].options.Value1 = a.readUShort()),
              (e[b].options.Param1 = a.readUChar()),
              (e[b].options.Index2 = a.readUShort()),
              (e[b].options.Value2 = a.readUShort()),
              (e[b].options.Param2 = a.readUChar()),
              (e[b].options.Index3 = a.readUShort()),
              (e[b].options.Value3 = a.readUShort()),
              (e[b].options.Param3 = a.readUChar()),
              (e[b].options.Index4 = a.readUShort()),
              (e[b].options.Value4 = a.readUShort()),
              (e[b].options.Param4 = a.readUChar()),
              (e[b].location = a.readLong()),
              (e[b].WearState = a.readUShort()));
          return e;
        })()))
      : ((this.AID = a.readULong()),
        (this.UniqueID = a.readULong()),
        (this.itemList = (function () {
          var b,
            d = ((c - a.tell()) / 47) | 0,
            e = Array(d);
          for (b = 0; b < d; ++b)
            ((e[b] = {}),
              (e[b].price = a.readLong()),
              (e[b].count = a.readShort()),
              (e[b].index = a.readShort()),
              (e[b].type = a.readUChar()),
              (e[b].ITID = a.readUShort()),
              (e[b].IsIdentified = a.readUChar()),
              (e[b].IsDamaged = a.readUChar()),
              (e[b].RefiningLevel = a.readUChar()),
              (e[b].slot = {}),
              (e[b].slot.card1 = a.readUShort()),
              (e[b].slot.card2 = a.readUShort()),
              (e[b].slot.card3 = a.readUShort()),
              (e[b].slot.card4 = a.readUShort()),
              (e[b].options = {}),
              (e[b].options.Index0 = a.readUShort()),
              (e[b].options.Value0 = a.readUShort()),
              (e[b].options.Param0 = a.readUChar()),
              (e[b].options.Index1 = a.readUShort()),
              (e[b].options.Value1 = a.readUShort()),
              (e[b].options.Param1 = a.readUChar()),
              (e[b].options.Index2 = a.readUShort()),
              (e[b].options.Value2 = a.readUShort()),
              (e[b].options.Param2 = a.readUChar()),
              (e[b].options.Index3 = a.readUShort()),
              (e[b].options.Value3 = a.readUShort()),
              (e[b].options.Param3 = a.readUChar()),
              (e[b].options.Index4 = a.readUShort()),
              (e[b].options.Value4 = a.readUShort()),
              (e[b].options.Param4 = a.readUChar()),
              (e[b].location = a.readLong()),
              (e[b].WearState = a.readUShort()));
          return e;
        })()));
  };
  c.ZC.PC_PURCHASE_ITEMLIST_FROMMC2.size = -1;
  c.ZC.PC_PURCHASE_ITEMLIST_FROMMC3 = function (a, b) {
    this.AID = a.readULong();
    this.UniqueID = a.readULong();
    var d = ((b - a.tell()) / 64) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readULong()),
        (c[b].count = a.readShort()),
        (c[b].index = a.readShort()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readULong()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readULong()),
        (c[b].slot.card2 = a.readULong()),
        (c[b].slot.card3 = a.readULong()),
        (c[b].slot.card4 = a.readULong()),
        (c[b].options = {}),
        (c[b].options.Index0 = a.readUShort()),
        (c[b].options.Value0 = a.readUShort()),
        (c[b].options.Param0 = a.readUChar()),
        (c[b].options.Index1 = a.readUShort()),
        (c[b].options.Value1 = a.readUShort()),
        (c[b].options.Param1 = a.readUChar()),
        (c[b].options.Index2 = a.readUShort()),
        (c[b].options.Value2 = a.readUShort()),
        (c[b].options.Param2 = a.readUChar()),
        (c[b].options.Index3 = a.readUShort()),
        (c[b].options.Value3 = a.readUShort()),
        (c[b].options.Param3 = a.readUChar()),
        (c[b].options.Index4 = a.readUShort()),
        (c[b].options.Value4 = a.readUShort()),
        (c[b].options.Param4 = a.readUChar()),
        (c[b].location = a.readLong()),
        (c[b].WearState = a.readUShort()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].enchantgrade = a.readUChar()));
    this.itemList = c;
  };
  c.ZC.PC_PURCHASE_ITEMLIST_FROMMC3.size = -1;
  c.ZC.PARTY_BOOKING_ACK_REGISTER = function (a, b) {
    this.Result = a.readShort();
  };
  c.ZC.PARTY_BOOKING_ACK_REGISTER.size = 4;
  c.ZC.PARTY_BOOKING_ACK_SEARCH = function (a, b) {
    this.IsExistMoreResult = a.readUChar();
    var d = ((b - a.tell()) / 48) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b) {
      c[b] = {};
      c[b].Index = a.readULong();
      c[b].CharName = a.readString(24);
      c[b].ExpireTime = a.readLong();
      c[b].Detail = {};
      c[b].Detail.Level = a.readShort();
      c[b].Detail.MapID = a.readShort();
      for (var e = c[b].Detail, q = Array(6), k = 0; 6 > k; ++k)
        q[k] = a.readShort();
      e.Job = q;
    }
    this.Info = c;
  };
  c.ZC.PARTY_BOOKING_ACK_SEARCH.size = -1;
  c.ZC.PARTY_BOOKING_ACK_DELETE = function (a, b) {
    this.Result = a.readShort();
  };
  c.ZC.PARTY_BOOKING_ACK_DELETE.size = 4;
  c.ZC.PARTY_BOOKING_NOTIFY_INSERT = function (a, b) {
    this.Info = {};
    this.Info.Index = a.readULong();
    this.Info.CharName = a.readString(24);
    this.Info.ExpireTime = a.readLong();
    this.Info.Detail = {};
    this.Info.Detail.Level = a.readShort();
    this.Info.Detail.MapID = a.readShort();
    this.Info.Detail.Job1 = a.readShort();
    this.Info.Detail.Job2 = a.readShort();
    this.Info.Detail.Job3 = a.readShort();
    this.Info.Detail.Job4 = a.readShort();
    this.Info.Detail.Job5 = a.readShort();
    this.Info.Detail.Job6 = a.readShort();
  };
  c.ZC.PARTY_BOOKING_NOTIFY_INSERT.size = 50;
  c.ZC.PARTY_BOOKING_NOTIFY_UPDATE = function (a, b) {
    this.Index = a.readULong();
    this.Job1 = a.readShort();
    this.Job2 = a.readShort();
    this.Job3 = a.readShort();
    this.Job4 = a.readShort();
    this.Job5 = a.readShort();
    this.Job6 = a.readShort();
  };
  c.ZC.PARTY_BOOKING_NOTIFY_UPDATE.size = 18;
  c.ZC.PARTY_BOOKING_NOTIFY_DELETE = function (a, b) {
    this.Index = a.readULong();
  };
  c.ZC.PARTY_BOOKING_NOTIFY_DELETE.size = 6;
  c.ZC.SIMPLE_CASH_BTNSHOW = function (a, b) {
    this.show = a.readUChar();
  };
  c.ZC.SIMPLE_CASH_BTNSHOW.size = 3;
  c.ZC.NOTIFY_HP_TO_GROUPM_R2 = function (a, b) {
    this.AID = a.readULong();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
  };
  c.ZC.NOTIFY_HP_TO_GROUPM_R2.size = 14;
  c.ZC.ADD_EXCHANGE_ITEM2 = function (a, b) {
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.count = a.readLong();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
  };
  c.ZC.ADD_EXCHANGE_ITEM2.size = 20;
  c.ZC.ADD_EXCHANGE_ITEM3 = function (a, b) {
    this.ITID = a.readUShort();
    this.type = a.readUChar();
    this.count = a.readLong();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
  };
  c.ZC.ADD_EXCHANGE_ITEM3.size = 45;
  c.ZC.OPEN_BUYING_STORE = function (a, b) {
    this.count = a.readUChar();
  };
  c.ZC.OPEN_BUYING_STORE.size = 3;
  c.ZC.FAILED_OPEN_BUYING_STORE_TO_BUYER = function (a, b) {
    this.Result = a.readShort();
    this.total_weight = a.readLong();
  };
  c.ZC.FAILED_OPEN_BUYING_STORE_TO_BUYER.size = 8;
  c.ZC.MYITEMLIST_BUYING_STORE = function (a, b) {
    this.AID = a.readULong();
    this.limitZeny = a.readLong();
    var d = ((b - a.tell()) / 11) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].count = a.readShort()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readLong()));
    this.ItemList = c;
  };
  c.ZC.MYITEMLIST_BUYING_STORE.size = -1;
  c.ZC.BUYING_STORE_ENTRY = function (a, b) {
    this.makerAID = a.readULong();
    this.storeName = a.readString(80);
  };
  c.ZC.BUYING_STORE_ENTRY.size = 86;
  c.ZC.DISAPPEAR_BUYING_STORE_ENTRY = function (a, b) {
    this.makerAID = a.readULong();
  };
  c.ZC.DISAPPEAR_BUYING_STORE_ENTRY.size = 6;
  c.ZC.ACK_ITEMLIST_BUYING_STORE = function (a, b) {
    this.makerAID = a.readULong();
    this.StoreID = a.readULong();
    this.limitZeny = a.readLong();
    var d = ((b - a.tell()) / 11) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].price = a.readLong()),
        (c[b].count = a.readShort()),
        (c[b].type = a.readUChar()),
        (c[b].ITID = a.readLong()));
    this.ItemList = c;
  };
  c.ZC.ACK_ITEMLIST_BUYING_STORE.size = -1;
  c.ZC.FAILED_TRADE_BUYING_STORE_TO_BUYER = function (a, b) {
    this.Result = a.readShort();
  };
  c.ZC.FAILED_TRADE_BUYING_STORE_TO_BUYER.size = 4;
  c.ZC.UPDATE_ITEM_FROM_BUYING_STORE = function (a, b) {
    this.ITID = a.readUShort();
    this.count = a.readShort();
    this.limitZeny = a.readLong();
  };
  c.ZC.UPDATE_ITEM_FROM_BUYING_STORE.size = 10;
  c.ZC.UPDATE_ITEM_FROM_BUYING_STORE2 = function (a, c) {
    20180704 <= b.value
      ? ((this.size = 24), (this.ITID = a.readULong()))
      : ((this.size = 22), (this.ITID = a.readUShort()));
    this.count = a.readShort();
    this.Zeny = a.readLong();
    this.limitZeny = a.readLong();
    this.GID = a.readULong();
    this.Date = a.readULong();
  };
  c.ZC.ITEM_DELETE_BUYING_STORE = function (a, b) {
    this.index = a.readShort();
    this.count = a.readShort();
    this.zeny = a.readLong();
  };
  c.ZC.ITEM_DELETE_BUYING_STORE.size = 10;
  c.ZC.EL_INIT = function (a, b) {
    this.AID = a.readLong();
    this.hp = a.readLong();
    this.maxHP = a.readLong();
    this.sp = a.readLong();
    this.maxSP = a.readLong();
  };
  c.ZC.EL_INIT.size = 22;
  c.ZC.EL_PAR_CHANGE = function (a, b) {
    this.param = a.readUShort();
    this.value = a.readLong();
  };
  c.ZC.EL_PAR_CHANGE.size = 8;
  c.ZC.BROADCAST4 = function (a, b) {
    this.PakcetType = a.readShort();
    this.Msgtype = a.readUChar();
    this.ColorRGB = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.BROADCAST4.size = -1;
  c.ZC.COSTUME_SPRITE_CHANGE = function (a, b) {
    this.GID = a.readULong();
    this.type = a.readUChar();
    this.value = a.readLong();
  };
  c.ZC.COSTUME_SPRITE_CHANGE.size = 11;
  c.AC.OTP_USER = function (a, b) {};
  c.AC.OTP_USER.size = 2;
  c.AC.OTP_AUTH_ACK = function (a, b) {
    this.LoginResult = a.readUShort();
  };
  c.AC.OTP_AUTH_ACK.size = 6;
  c.ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER = function (a, b) {
    this.Result = a.readShort();
    this.ITID = a.readLong();
  };
  c.ZC.FAILED_TRADE_BUYING_STORE_TO_SELLER.size = 8;
  c.AC.SSO_LOGIN_ACK = function (a, b) {
    this.Result = a.readUShort();
  };
  c.AC.SSO_LOGIN_ACK.size = 4;
  c.HC.DELETE_CHAR3_RESERVED = function (a, b) {
    this.GID = a.readULong();
    this.Result = a.readLong();
    this.DeleteReservedDate = a.readLong();
  };
  c.HC.DELETE_CHAR3_RESERVED.size = 14;
  c.HC.DELETE_CHAR3 = function (a, b) {
    this.GID = a.readULong();
    this.Result = a.readLong();
  };
  c.HC.DELETE_CHAR3.size = 10;
  c.HC.ACCEPT_ENTER_NEO_UNION_HEADER = function (a, c) {
    this.TotalSlotNum = a.readUChar();
    this.PremiumStartSlot = a.readUChar();
    this.PremiumEndSlot = a.readUChar();
    this.dummy1_beginbilling = a.readChar();
    this.code = a.readChar();
    a.seek(20, SEEK_CUR);
    this.charInfo = b.parseCharInfo(a, c);
  };
  c.HC.ACCEPT_ENTER_NEO_UNION_HEADER.size = -1;
  c.HC.DELETE_CHAR3_CANCEL = function (a, b) {
    this.GID = a.readULong();
    this.Result = a.readLong();
  };
  c.HC.DELETE_CHAR3_CANCEL.size = 10;
  c.ZC.SEARCH_STORE_INFO_ACK = function (a, b) {
    this.IsFirstPage = a.readUChar();
    this.IsNexPage = a.readUChar();
    this.RemainedSearchCnt = a.readUChar();
    var d = ((b - a.tell()) / 106) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].SSI_ID = a.readULong()),
        (c[b].AID = a.readULong()),
        (c[b].StoreName = a.readString(80)),
        (c[b].ITID = a.readUShort()),
        (c[b].ItemType = a.readUChar()),
        (c[b].price = a.readLong()),
        (c[b].count = a.readUShort()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].card1 = a.readUShort()),
        (c[b].card2 = a.readUShort()),
        (c[b].card3 = a.readUShort()),
        (c[b].card4 = a.readUShort()));
    this.SSI_List = c;
  };
  c.ZC.SEARCH_STORE_INFO_ACK.size = -1;
  c.ZC.SEARCH_STORE_INFO_FAILED = function (a, b) {
    this.Reason = a.readUChar();
  };
  c.ZC.SEARCH_STORE_INFO_FAILED.size = 3;
  c.ZC.ACK_BAN_GUILD_SSO = function (a, b) {
    this.charName = a.readString(24);
    this.reasonDesc = a.readString(40);
  };
  c.ZC.ACK_BAN_GUILD_SSO.size = 66;
  c.ZC.ACK_BAN_GUILD_SSO2 = function (a, b) {
    this.charID = a.readLong();
    this.reasonDesc = a.readString(40);
  };
  c.ZC.ACK_BAN_GUILD_SSO2.size = 46;
  c.ZC.OPEN_SEARCH_STORE_INFO = function (a, b) {
    this.OpenType = a.readShort();
    this.SearchCntMax = a.readUChar();
  };
  c.ZC.OPEN_SEARCH_STORE_INFO.size = 5;
  c.ZC.SSILIST_ITEM_CLICK_ACK = function (a, b) {
    this.x = a.readShort();
    this.y = a.readShort();
  };
  c.ZC.SSILIST_ITEM_CLICK_ACK.size = 6;
  c.AC.REFUSE_LOGIN_R2 = function (a, b) {
    this.ErrorCode = a.readULong();
    this.blockDate = a.readBinaryString(20);
  };
  c.AC.REFUSE_LOGIN_R2.size = 26;
  c.HC.NOTIFY_ACCESSIBLE_MAPNAME = function (a, b) {};
  c.HC.NOTIFY_ACCESSIBLE_MAPNAME.size = -1;
  c.ZC.OPEN_CASHSHOP_RESULT = function (a, b) {
    this.cashPoints = a.readULong();
    this.kafraPoints = a.readULong();
  };
  c.ZC.OPEN_CASHSHOP_RESULT.size = 10;
  c.ZC.OPEN_CASHSHOP_RESULT2 = function (a, b) {
    this.ITID = a.readULong();
    this.result = a.readUShort();
    this.cashPoints = a.readULong();
    this.kafraPoints = a.readULong();
  };
  c.ZC.OPEN_CASHSHOP_RESULT2.size = 16;
  c.ZC.ACK_SE_CASH_ITEM_LIST2 = function (a, b) {
    this.tab = a.readULong();
    this.count = a.readUShort();
    var d = ((b - a.tell()) / 6) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}), (c[b].ITID = a.readUShort()), (c[b].price = a.readLong()));
    this.itemList = c;
  };
  c.ZC.ACK_SE_CASH_ITEM_LIST2.size = -1;
  c.ZC.ZC_ACK_SCHEDULER_CASHITEM = function (a, c) {
    20180704 <= b.value
      ? ((this.count = a.readUShort()),
        (this.tab = a.readUShort()),
        (this.itemList = (function () {
          var b,
            d = ((c - a.tell()) / 8) | 0,
            e = Array(d);
          for (b = 0; b < d; ++b)
            ((e[b] = {}),
              (e[b].ITID = a.readLong()),
              (e[b].price = a.readLong()));
          return e;
        })()))
      : ((this.count = a.readUShort()),
        (this.tab = a.readUShort()),
        (this.itemList = (function () {
          var b,
            d = ((c - a.tell()) / 6) | 0,
            e = Array(d);
          for (b = 0; b < d; ++b)
            ((e[b] = {}),
              (e[b].ITID = a.readUShort()),
              (e[b].price = a.readLong()));
          return e;
        })()));
  };
  c.ZC.ZC_ACK_SCHEDULER_CASHITEM.size = -1;
  c.ZC.ITEM_FALL_ENTRY2 = function (a, b) {
    this.ITAID = a.readULong();
    this.ITID = a.readUShort();
    this.type = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.subX = a.readUChar();
    this.subY = a.readUChar();
    this.count = a.readShort();
  };
  c.ZC.ITEM_FALL_ENTRY2.size = 19;
  c.ZC.NOTIFY_MOVEENTRY6 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.name = a.readString(24);
  };
  c.ZC.NOTIFY_MOVEENTRY6.size = -1;
  c.ZC.NOTIFY_STANDENTRY6 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_STANDENTRY6.size = -1;
  c.ZC.NOTIFY_NEWENTRY6 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_NEWENTRY6.size = -1;
  c.ZC.EQUIPWIN_MICROSCOPE2 = function (a, b) {
    this.characterName = a.readString(24);
    this.job = a.readShort();
    this.head = a.readShort();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.Robe = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.sex = a.readUChar();
    var d = ((b - a.tell()) / 28) | 0,
      c = Array(d);
    for (b = 0; b < d; ++b)
      ((c[b] = {}),
        (c[b].index = a.readShort()),
        (c[b].ITID = a.readUShort()),
        (c[b].type = a.readUChar()),
        (c[b].IsIdentified = a.readUChar()),
        (c[b].location = a.readUShort()),
        (c[b].WearState = a.readUShort()),
        (c[b].IsDamaged = a.readUChar()),
        (c[b].RefiningLevel = a.readUChar()),
        (c[b].slot = {}),
        (c[b].slot.card1 = a.readUShort()),
        (c[b].slot.card2 = a.readUShort()),
        (c[b].slot.card3 = a.readUShort()),
        (c[b].slot.card4 = a.readUShort()),
        (c[b].HireExpireDate = a.readLong()),
        (c[b].bindOnEquipType = a.readUShort()),
        (c[b].wItemSpriteNumber = a.readUShort()));
    this.ItemInfo = c;
  };
  c.ZC.EQUIPWIN_MICROSCOPE2.size = -1;
  c.ZC.SHOWSCRIPT = function (a, b) {
    this.AID = a.readULong();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.SHOWSCRIPT.size = -1;
  c.ZC.SKILL_ENTRY3 = function (a, b) {
    this.AID = a.readULong();
    this.creatorAID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.job = a.readUChar();
    this.range = a.readShort();
    this.isVisible = a.readUChar();
    this.isContens = a.readUChar();
    this.msg = a.readString(80);
  };
  c.ZC.SKILL_ENTRY3.size = -1;
  c.ZC.NOTIFY_ACT3 = function (a, b) {
    this.GID = a.readULong();
    this.targetGID = a.readULong();
    this.startTime = a.readULong();
    this.attackMT = a.readLong();
    this.attackedMT = a.readLong();
    this.damage = a.readLong();
    a.seek(1, SEEK_CUR);
    this.count = a.readShort();
    this.action = a.readUChar();
    this.leftDamage = a.readLong();
  };
  c.ZC.NOTIFY_ACT3.size = 34;
  c.ZC.REQ_WEAR_EQUIP_ACK2 = function (a, b) {
    this.index = a.readUShort();
    this.wearLocation = a.readUShort();
    this.viewid = a.readUShort();
    this.result = !a.readUChar();
  };
  c.ZC.REQ_WEAR_EQUIP_ACK2.size = 9;
  c.ZC.REQ_TAKEOFF_EQUIP_ACK2 = function (a, b) {
    this.index = a.readUShort();
    this.wearLocation = a.readUShort();
    this.result = !a.readUChar();
  };
  c.ZC.REQ_TAKEOFF_EQUIP_ACK2.size = 7;
  c.ZC.CLOSE_SCRIPT = function (a, b) {
    this.NAID = a.readULong();
  };
  c.ZC.CLOSE_SCRIPT.size = 6;
  c.ZC.FASTMOVE = function (a, b) {
    this.AID = a.readULong();
    this.targetXpos = a.readShort();
    this.targetYpos = a.readShort();
  };
  c.ZC.FASTMOVE.size = 10;
  c.ZC.NAVIGATETO = function (a, b) {
    this.type = a.readUChar();
    this.flag = a.readUChar();
    this.noshow = a.readUChar();
    this.mapname = a.readString(16);
    this.x = a.readShort();
    this.y = a.readShort();
    this.mobid = a.readShort();
  };
  c.ZC.NAVIGATETO.size = 27;
  c.ZC.MSG_STATE_CHANGE3 = function (a, b) {
    this.AID = a.readULong();
    this.index = a.readShort();
    this.RemainMS = a.readULong();
    b = Array(3);
    for (var d = 0; 3 > d; ++d) b[d] = a.readLong();
    this.val = b;
  };
  c.ZC.MSG_STATE_CHANGE3.size = 24;
  c.HC.SECOND_PASSWD_LOGIN = function (a, b) {
    this.pincode = a.readULong();
    this.AID = a.readULong();
    this.state = a.readUShort();
  };
  c.HC.SECOND_PASSWD_LOGIN.size = 12;
  c.ZC.ITEM_FAVORITE = function (a, b) {
    this.index = a.readUShort();
    this.favorite = a.readUChar();
  };
  c.ZC.ITEM_FAVORITE.size = 5;
  c.ZC.NOTIFY_STANDENTRY7 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_STANDENTRY7.size = -1;
  c.ZC.NOTIFY_MOVEENTRY7 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.name = a.readString(24);
  };
  c.ZC.NOTIFY_MOVEENTRY7.size = -1;
  c.ZC.NOTIFY_NEWENTRY7 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_NEWENTRY7.size = -1;
  c.ZC.NOTIFY_MONSTER_HP = function (a, b) {
    this.AID = a.readULong();
    this.hp = a.readULong();
    this.maxhp = a.readULong();
  };
  c.ZC.NOTIFY_MONSTER_HP.size = 14;
  c.ZC.ALL_QUEST_LIST_V2 = function (a, b) {
    this.questCount = a.readLong();
    var c = ((b - a.tell()) / 15) | 0,
      d = Array(c);
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].questID = a.readULong()),
        (d[b].active = a.readUChar()),
        (d[b]._time = a.readULong()),
        (d[b].time = a.readULong()),
        (d[b].count = a.readShort()));
    this.QuestList = d;
  };
  c.ZC.ALL_QUEST_LIST_V2.size = -1;
  c.ZC.ACK_RANKING = function (a, b) {
    this.Type = a.readShort();
    this.Name = (function () {
      for (var b = Array(10), c = 0; 10 > c; ++c) b[c] = a.readString(24);
      return b;
    })();
    this.Point = (function () {
      for (var b = Array(10), c = 0; 10 > c; ++c) b[c] = a.readLong();
      return b;
    })();
    this.myPoint = a.readLong();
  };
  c.ZC.ACK_RANKING.size = 288;
  c.ZC.UPDATE_RANKING_POINT = function (a, b) {
    this.Type = a.readShort();
    this.Point = a.readLong();
    this.TotalPoint = a.readLong();
  };
  c.ZC.UPDATE_RANKING_POINT.size = 12;
  c.ZC.SELECTCART = function (a, b) {
    this.identity = a.readShort();
    this.AID = a.readLong();
    b = Array(3);
    for (var c = 0; 3 > c; ++c) b[c] = a.readUChar();
    this.CartList = b;
  };
  c.ZC.SELECTCART.size = 11;
  c.ZC.ALL_QUEST_LIST_V3 = function (a, b) {
    b = this.questCount = a.readLong();
    var c,
      d = Array(b);
    for (c = 0; c < b; ++c) {
      d[c] = {};
      d[c].questID = a.readULong();
      d[c].active = a.readUChar();
      d[c].quest_svrTime = a.readLong();
      d[c].quest_endTime = a.readLong();
      d[c].count = a.readShort();
      var e = d[c],
        q = d[c].count,
        k,
        g = Array(q);
      for (k = 0; k < q; ++k)
        ((g[k] = {}),
          (g[k].QID = a.readULong()),
          (g[k].mobType = a.readULong()),
          (g[k].mobGID = a.readULong()),
          (g[k].levelMin = a.readShort()),
          (g[k].levelMax = a.readShort()),
          (g[k].huntCount = a.readShort()),
          (g[k].maxCount = a.readShort()),
          (g[k].mobName = a.readString(24)));
      e.hunt = g;
    }
    this.QuestList = d;
  };
  c.ZC.ALL_QUEST_LIST_V3.size = -1;
  c.ZC.ADD_QUEST_EX = function (a, b) {
    this.questID = a.readULong();
    this.active = a.readUChar();
    this.quest_svrTime = a.readLong();
    this.quest_endTime = a.readLong();
    b = this.count = a.readShort();
    var c,
      d = Array(b);
    for (c = 0; c < b; ++c)
      ((d[c] = {}),
        (d[c].QID = a.readULong()),
        (d[c].mobType = a.readULong()),
        (d[c].mobGID = a.readULong()),
        (d[c].levelMin = a.readShort()),
        (d[c].levelMax = a.readShort()),
        (d[c].huntCount = a.readShort()),
        (d[c].mobName = a.readString(24)));
    this.hunt = d;
  };
  c.ZC.ADD_QUEST_EX.size = 143;
  c.ZC.MSG_STATE_CHANGE4 = function (a, b) {
    this.index = a.readShort();
    this.AID = a.readULong();
    this.state = a.readUChar();
    this.TotalMS = a.readULong();
    this.RemainMS = a.readULong();
    b = Array(3);
    for (var c = 0; 3 > c; ++c) b[c] = a.readLong();
    this.val = b;
  };
  c.ZC.MSG_STATE_CHANGE4.size = 29;
  c.ZC.MSG_STATE_CHANGE5 = function (a, b) {
    this.AID = a.readULong();
    this.index = a.readShort();
    this.TotalMS = a.readULong();
    this.RemainMS = a.readULong();
    b = Array(3);
    for (var c = 0; 3 > c; ++c) b[c] = a.readLong();
    this.val = b;
  };
  c.ZC.MSG_STATE_CHANGE5.size = 28;
  c.ZC.ITEM_PICKUP_ACK5 = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readLong();
    this.type = a.readUChar();
    this.result = a.readUChar();
    this.HireExpireDate = a.readLong();
    this.bindOnEquipType = a.readUShort();
  };
  c.ZC.ITEM_PICKUP_ACK5.size = 31;
  c.ZC.NORMAL_ITEMLIST4 = function (a, b) {
    var c = ((b - a.tell()) / 24) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].count = a.readShort()),
        (d[b].WearState = a.readULong()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].PlaceETCTab = e & 2));
    this.ItemInfo = d;
  };
  c.ZC.NORMAL_ITEMLIST4.size = -1;
  c.ZC.EQUIPMENT_ITEMLIST4 = function (a, b) {
    var c = ((b - a.tell()) / 31) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.EQUIPMENT_ITEMLIST4.size = -1;
  c.ZC.CART_NORMAL_ITEMLIST4 = function (a, b) {
    var c = ((b - a.tell()) / 24) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].count = a.readShort()),
        (d[b].WearState = a.readULong()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].PlaceETCTab = e & 2));
    this.ItemInfo = d;
  };
  c.ZC.CART_NORMAL_ITEMLIST4.size = -1;
  c.ZC.CART_EQUIPMENT_ITEMLIST4 = function (a, b) {
    var c = ((b - a.tell()) / 31) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.CART_EQUIPMENT_ITEMLIST4.size = -1;
  c.ZC.PET_EVOLUTION_RESULT = function (a, b) {
    this.result = a.readULong();
  };
  c.ZC.PET_EVOLUTION_RESULT.size = 6;
  c.ZC.CART_EQUIPMENT_ITEMLIST5 = function (a, b) {
    var c = ((b - a.tell()) / 57) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (d[b].nRandomOptionCnt = a.readUChar()),
        (d[b].options = {}),
        (d[b].options.Index0 = a.readUShort()),
        (d[b].options.Value0 = a.readUShort()),
        (d[b].options.Param0 = a.readUChar()),
        (d[b].options.Index1 = a.readUShort()),
        (d[b].options.Value1 = a.readUShort()),
        (d[b].options.Param1 = a.readUChar()),
        (d[b].options.Index2 = a.readUShort()),
        (d[b].options.Value2 = a.readUShort()),
        (d[b].options.Param2 = a.readUChar()),
        (d[b].options.Index3 = a.readUShort()),
        (d[b].options.Value3 = a.readUShort()),
        (d[b].options.Param3 = a.readUChar()),
        (d[b].options.Index4 = a.readUShort()),
        (d[b].options.Value4 = a.readUShort()),
        (d[b].options.Param4 = a.readUChar()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.CART_EQUIPMENT_ITEMLIST5.size = -1;
  c.ZC.STORE_NORMAL_ITEMLIST4 = function (a, b) {
    this.Name = a.readString(24);
    var c = ((b - a.tell()) / 24) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].count = a.readShort()),
        (d[b].WearState = a.readULong()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].PlaceETCTab = e & 2));
    this.ItemInfo = d;
  };
  c.ZC.STORE_NORMAL_ITEMLIST4.size = -1;
  c.ZC.STORE_EQUIPMENT_ITEMLIST4 = function (a, b) {
    this.Name = a.readString(24);
    var c = ((b - a.tell()) / 31) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.STORE_EQUIPMENT_ITEMLIST4.size = -1;
  c.HC.ACCEPT_ENTER2 = function (a, b) {
    b = {};
    b.GID = a.readULong();
    b.exp = a.getUint64();
    b.money = a.readLong();
    b.jobexp = a.getUint64();
    b.joblevel = a.readLong();
    b.bodyState = a.readLong();
    b.healthState = a.readLong();
    b.effectState = a.readLong();
    b.virtue = a.readLong();
    b.honor = a.readLong();
    b.jobpoint = a.readShort();
    b.hp = a.getUint64();
    b.maxhp = a.getUint64();
    b.sp = a.getUint64();
    b.maxsp = a.getUint64();
    b.speed = a.readShort();
    b.job = a.readShort();
    b.head = a.readShort();
    b.body = a.readShort();
    b.weapon = a.readShort();
    b.level = a.readShort();
    b.sppoint = a.readShort();
    b.accessory = a.readShort();
    b.shield = a.readShort();
    b.accessory2 = a.readShort();
    b.accessory3 = a.readShort();
    b.headpalette = a.readShort();
    b.bodypalette = a.readShort();
    b.name = a.readString(24);
    b.Str = a.readUChar();
    b.Agi = a.readUChar();
    b.Vit = a.readUChar();
    b.Int = a.readUChar();
    b.Dex = a.readUChar();
    b.Luk = a.readUChar();
    b.CharNum = a.readUChar();
    b.haircolor = a.readUChar();
    b.bIsChangedCharName = a.readShort();
    b.lastMap = a.readBinaryString(16);
    b.DeleteDate = a.readLong();
    b.Robe = a.readLong();
    b.SlotAddon = a.readLong();
    b.RenameAddon = a.readLong();
    b.sex = a.readUChar();
    this.entity = b;
  };
  c.HC.ACCEPT_ENTER2.size = -1;
  c.ZC.STORE_EQUIPMENT_ITEMLIST5 = function (a, b) {
    this.Name = a.readString(24);
    var c = ((b - a.tell()) / 57) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (d[b].nRandomOptionCnt = a.readUChar()),
        (d[b].options = {}),
        (d[b].options.Index0 = a.readUShort()),
        (d[b].options.Value0 = a.readUShort()),
        (d[b].options.Param0 = a.readUChar()),
        (d[b].options.Index1 = a.readUShort()),
        (d[b].options.Value1 = a.readUShort()),
        (d[b].options.Param1 = a.readUChar()),
        (d[b].options.Index2 = a.readUShort()),
        (d[b].options.Value2 = a.readUShort()),
        (d[b].options.Param2 = a.readUChar()),
        (d[b].options.Index3 = a.readUShort()),
        (d[b].options.Value3 = a.readUShort()),
        (d[b].options.Param3 = a.readUChar()),
        (d[b].options.Index4 = a.readUShort()),
        (d[b].options.Value4 = a.readUShort()),
        (d[b].options.Param4 = a.readUChar()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.STORE_EQUIPMENT_ITEMLIST5.size = -1;
  c.ZC.EQUIPWIN_MICROSCOPE_V5 = function (a, b) {
    this.characterName = a.readString(24);
    this.job = a.readShort();
    this.head = a.readShort();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.Robe = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.sex = a.readUChar();
    var c = ((b - a.tell()) / 31) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.EQUIPWIN_MICROSCOPE_V5.size = -1;
  c.ZC.EQUIPWIN_MICROSCOPE_V6 = function (a, b) {
    this.characterName = a.readString(24);
    this.job = a.readShort();
    this.head = a.readShort();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.Robe = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.sex = a.readUChar();
    var c = ((b - a.tell()) / 57) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (d[b].nRandomOptionCnt = a.readUChar()),
        (d[b].options = {}),
        (d[b].options.Index0 = a.readUShort()),
        (d[b].options.Value0 = a.readUShort()),
        (d[b].options.Param0 = a.readUChar()),
        (d[b].options.Index1 = a.readUShort()),
        (d[b].options.Value1 = a.readUShort()),
        (d[b].options.Param1 = a.readUChar()),
        (d[b].options.Index2 = a.readUShort()),
        (d[b].options.Value2 = a.readUShort()),
        (d[b].options.Param2 = a.readUChar()),
        (d[b].options.Index3 = a.readUShort()),
        (d[b].options.Value3 = a.readUShort()),
        (d[b].options.Param3 = a.readUChar()),
        (d[b].options.Index4 = a.readUShort()),
        (d[b].options.Value4 = a.readUShort()),
        (d[b].options.Param4 = a.readUChar()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.EQUIPWIN_MICROSCOPE_V6.size = -1;
  c.ZC.ACK_WEAR_EQUIP_V5 = function (a, b) {
    this.index = a.readUShort();
    this.wearLocation = a.readULong();
    this.viewid = a.readUShort();
    this.result = !a.readUChar();
  };
  c.ZC.ACK_WEAR_EQUIP_V5.size = 0;
  c.ZC.ACK_TAKEOFF_EQUIP_V5 = function (a, b) {
    this.index = a.readUShort();
    this.wearLocation = a.readULong();
    this.result = !a.readUChar();
  };
  c.ZC.ACK_TAKEOFF_EQUIP_V5.size = 9;
  c.ZC.NOTIFY_MAPPROPERTY2 = function (a, b) {
    this.type = a.readShort();
    this.flag = a.readLong();
  };
  c.ZC.NOTIFY_MAPPROPERTY2.size = 8;
  c.HC.ACCEPT_ENTER_NEO_UNION_LIST = function (a, c) {
    this.charInfo = b.parseCharInfo(a, c);
  };
  c.HC.ACCEPT_ENTER_NEO_UNION_LIST.size = -1;
  c.ZC.SKILL_ENTRY4 = function (a, b) {
    this.AID = a.readULong();
    this.creatorAID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.job = a.readULong();
    this.range = a.readChar();
    this.isVisible = a.readUChar();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.SKILL_ENTRY4.size = -1;
  c.HC.CHARLIST_NOTIFY = function (a, c) {
    this.TotalCnt = a.readLong();
    20151001 <= b.value && (this.charSlots = a.readLong());
  };
  c.HC.CHARLIST_NOTIFY.size = 20151001 <= b.value ? 10 : 6;
  c.ZC.SKILL_ENTRY5 = function (a, b) {
    this.AID = a.readULong();
    this.creatorAID = a.readULong();
    this.xPos = a.readShort();
    this.yPos = a.readShort();
    this.job = a.readULong();
    this.range = a.readChar();
    this.isVisible = a.readUChar();
    this.level = a.readUChar();
    this.msg = a.readString(b - a.tell());
  };
  c.ZC.SKILL_ENTRY5.size = -1;
  c.ZC.NOTIFY_MOVEENTRY8 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.AID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.name = a.readString(24);
  };
  c.ZC.NOTIFY_MOVEENTRY8.size = -1;
  c.ZC.NOTIFY_STANDENTRY8 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.AID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readLong();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_STANDENTRY8.size = -1;
  c.ZC.NOTIFY_NEWENTRY8 = function (a, b) {
    this.objecttype = a.readUChar();
    this.GID = a.readULong();
    this.AID = a.readULong();
    this.speed = a.readShort();
    this.bodyState = a.readShort();
    this.healthState = a.readShort();
    this.effectState = a.readLong();
    this.job = a.readShort();
    this.head = a.readShort();
    this.weapon = a.readShort();
    this.shield = a.readShort();
    this.accessory = a.readShort();
    this.accessory2 = a.readShort();
    this.accessory3 = a.readShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.name = a.readString(b - a.tell());
  };
  c.ZC.NOTIFY_NEWENTRY8.size = -1;
  c.ZC.ACK_WHISPER2 = function (a, b) {
    this.result = a.readUChar();
    this.unknown = a.readULong();
  };
  c.ZC.ACK_WHISPER2.size = 7;
  c.ZC.NOTIFY_MOVEENTRY9 = function (a, c) {
    20180704 <= b.value
      ? ((this.objecttype = a.readUChar()),
        (this.GID = a.readULong()),
        (this.AID = a.readULong()),
        (this.speed = a.readShort()),
        (this.bodyState = a.readShort()),
        (this.healthState = a.readShort()),
        (this.effectState = a.readLong()),
        (this.job = a.readShort()),
        (this.head = a.readUShort()),
        (this.weapon = a.readULong()),
        (this.shield = a.readULong()))
      : ((this.objecttype = a.readUChar()),
        (this.GID = a.readULong()),
        (this.AID = a.readULong()),
        (this.speed = a.readShort()),
        (this.bodyState = a.readShort()),
        (this.healthState = a.readShort()),
        (this.effectState = a.readLong()),
        (this.job = a.readShort()),
        (this.head = a.readUShort()),
        (this.weapon = a.readShort()),
        (this.shield = a.readShort()));
    this.accessory = a.readUShort();
    this.moveStartTime = a.readULong();
    this.accessory2 = a.readUShort();
    this.accessory3 = a.readUShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readUShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.MoveData = a.readPos2();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.body = a.readUShort();
    this.name = a.readString(c - a.tell());
  };
  c.ZC.NOTIFY_MOVEENTRY9.size = -1;
  c.ZC.NOTIFY_STANDENTRY9 = function (a, c) {
    20180704 <= b.value
      ? ((this.objecttype = a.readUChar()),
        (this.GID = a.readULong()),
        (this.AID = a.readULong()),
        (this.speed = a.readShort()),
        (this.bodyState = a.readShort()),
        (this.healthState = a.readShort()),
        (this.effectState = a.readLong()),
        (this.job = a.readShort()),
        (this.head = a.readUShort()),
        (this.weapon = a.readULong()),
        (this.shield = a.readULong()),
        (this.accessory = a.readShort()),
        (this.accessory2 = a.readShort()),
        (this.accessory3 = a.readShort()),
        (this.headpalette = a.readShort()),
        (this.bodypalette = a.readShort()),
        (this.headDir = a.readShort()),
        (this.Robe = a.readUShort()))
      : ((this.objecttype = a.readUChar()),
        (this.GID = a.readULong()),
        (this.AID = a.readULong()),
        (this.speed = a.readShort()),
        (this.bodyState = a.readShort()),
        (this.healthState = a.readShort()),
        (this.effectState = a.readLong()),
        (this.job = a.readShort()),
        (this.head = a.readUShort()),
        (this.weapon = a.readShort()),
        (this.shield = a.readShort()),
        (this.accessory = a.readShort()),
        (this.accessory2 = a.readShort()),
        (this.accessory3 = a.readShort()),
        (this.headpalette = a.readShort()),
        (this.bodypalette = a.readShort()),
        (this.headDir = a.readShort()),
        (this.Robe = a.readShort()));
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.hp = a.readLong();
    this.maxhp = a.readLong();
    this.isBoss = a.readUChar();
    this.body = a.readShort();
    this.name = a.readString(c - a.tell());
  };
  c.ZC.NOTIFY_STANDENTRY9.size = -1;
  c.ZC.NOTIFY_NEWENTRY9 = function (a, c) {
    20180704 <= b.value
      ? ((this.objecttype = a.readUChar()),
        (this.GID = a.readULong()),
        (this.AID = a.readULong()),
        (this.speed = a.readShort()),
        (this.bodyState = a.readShort()),
        (this.healthState = a.readShort()),
        (this.effectState = a.readLong()),
        (this.job = a.readShort()),
        (this.head = a.readShort()),
        (this.weapon = a.readULong()),
        (this.shield = a.readULong()),
        (this.accessory = a.readUShort()))
      : ((this.objecttype = a.readUChar()),
        (this.GID = a.readULong()),
        (this.AID = a.readULong()),
        (this.speed = a.readShort()),
        (this.bodyState = a.readShort()),
        (this.healthState = a.readShort()),
        (this.effectState = a.readLong()),
        (this.job = a.readShort()),
        (this.head = a.readShort()),
        (this.weapon = a.readShort()),
        (this.accessory = a.readUShort()),
        (this.shield = a.readShort()));
    this.accessory2 = a.readUShort();
    this.accessory3 = a.readUShort();
    this.headpalette = a.readShort();
    this.bodypalette = a.readShort();
    this.headDir = a.readShort();
    this.Robe = a.readShort();
    this.GUID = a.readULong();
    this.GEmblemVer = a.readShort();
    this.honor = a.readShort();
    this.virtue = a.readLong();
    this.isPKModeON = a.readUChar();
    this.sex = a.readUChar();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.state = a.readUChar();
    this.clevel = a.readShort();
    this.font = a.readShort();
    this.maxhp = a.readLong();
    this.hp = a.readLong();
    this.isBoss = a.readUChar();
    this.body = a.readShort();
    this.name = a.readString(24);
  };
  c.ZC.NOTIFY_NEWENTRY9.size = -1;
  c.ZC.SHORTCUT_KEY_LIST_V3 = function (a, b) {
    a.seek(1, SEEK_CUR);
    var c = Array(38);
    for (b = 0; 38 > b; ++b)
      ((c[b] = {}),
        (c[b].isSkill = a.readChar()),
        (c[b].ID = a.readULong()),
        (c[b].count = a.readShort()));
    this.ShortCutKey = c;
  };
  c.ZC.SHORTCUT_KEY_LIST_V3.size = 269;
  c.ZC.ACCEPT_ENTER3 = function (a, b) {
    this.startTime = a.readULong();
    this.PosDir = a.readPos();
    this.xSize = a.readUChar();
    this.ySize = a.readUChar();
    this.font = a.readShort();
    this.sex = a.readUChar();
  };
  c.ZC.ACCEPT_ENTER3.size = 14;
  c.AC.ACCEPT_LOGIN3 = function (a, b) {
    this.AuthCode = a.readULong();
    this.AID = a.readULong();
    this.userLevel = a.readULong();
    this.lastLoginIP = a.readULong();
    this.lastLoginTime = a.readBinaryString(24);
    this.unknown = a.readShort();
    this.Sex = a.readUChar();
    this.AuthToken = a.readBinaryString(17);
    var c = ((b - a.tell()) / 160) | 0,
      d = Array(c);
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].ip = a.readULong()),
        (d[b].port = a.readUShort()),
        (d[b].name = a.readString(20)),
        (d[b].usercount = a.readUShort()),
        (d[b].state = a.readUShort()),
        (d[b].property = a.readUShort()),
        (d[b].unknown = a.readBinaryString(128)));
    this.ServerList = d;
  };
  c.AC.ACCEPT_LOGIN3.size = -1;
  c.ZC.HAT_EFFECT = function (a, b) {
    this.GID = a.readULong();
    this.enabled = a.readChar();
    var c = ((b - a.tell()) / 2) | 0,
      d = Array(c);
    for (b = 0; b < c; ++b) d[b] = a.readShort();
    this.hatEffectIDs = d;
  };
  c.ZC.HAT_EFFECT.size = -1;
  c.ZC.ITEM_PICKUP_ACK_V7 = function (a, c) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readULong();
    this.type = a.readUChar();
    this.result = a.readUChar();
    this.HireExpireDate = a.readLong();
    this.bindOnEquipType = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.favorite = a.readUChar();
    20170628 <= b.value && (this.look = a.readUShort());
  };
  c.ZC.ITEM_PICKUP_ACK_V7.size = 59;
  c.ZC.ACK_REQNAMEALL2 = function (a, b) {
    this.AID = a.readULong();
    this.CName = a.readString(24);
    this.PName = a.readString(24);
    this.GName = a.readString(24);
    this.RName = a.readString(24);
    this.TitleID = a.readULong();
  };
  c.ZC.ACK_REQNAMEALL2.size = 106;
  c.ZC.EQUIPMENT_ITEMLIST5 = function (a, b) {
    var c = ((b - a.tell()) / 57) | 0,
      d = Array(c),
      e;
    for (b = 0; b < c; ++b)
      ((d[b] = {}),
        (d[b].index = a.readShort()),
        (d[b].ITID = a.readUShort()),
        (d[b].type = a.readUChar()),
        (d[b].location = a.readULong()),
        (d[b].WearState = a.readULong()),
        (d[b].RefiningLevel = a.readUChar()),
        (d[b].slot = {}),
        (d[b].slot.card1 = a.readUShort()),
        (d[b].slot.card2 = a.readUShort()),
        (d[b].slot.card3 = a.readUShort()),
        (d[b].slot.card4 = a.readUShort()),
        (d[b].HireExpireDate = a.readLong()),
        (d[b].bindOnEquipType = a.readUShort()),
        (d[b].wItemSpriteNumber = a.readUShort()),
        (d[b].nRandomOptionCnt = a.readUChar()),
        (d[b].options = {}),
        (d[b].options.Index0 = a.readUShort()),
        (d[b].options.Value0 = a.readUShort()),
        (d[b].options.Param0 = a.readUChar()),
        (d[b].options.Index1 = a.readUShort()),
        (d[b].options.Value1 = a.readUShort()),
        (d[b].options.Param1 = a.readUChar()),
        (d[b].options.Index2 = a.readUShort()),
        (d[b].options.Value2 = a.readUShort()),
        (d[b].options.Param2 = a.readUChar()),
        (d[b].options.Index3 = a.readUShort()),
        (d[b].options.Value3 = a.readUShort()),
        (d[b].options.Param3 = a.readUChar()),
        (d[b].options.Index4 = a.readUShort()),
        (d[b].options.Value4 = a.readUShort()),
        (d[b].options.Param4 = a.readUChar()),
        (e = a.readUChar()),
        (d[b].IsIdentified = e & 1),
        (d[b].IsDamaged = e & 2),
        (d[b].PlaceETCTab = e & 4));
    this.ItemInfo = d;
  };
  c.ZC.EQUIPMENT_ITEMLIST5.size = -1;
  c.ZC.ITEM_PICKUP_ACK6 = function (a, b) {
    this.index = a.readUShort();
    this.count = a.readUShort();
    this.ITID = a.readUShort();
    this.IsIdentified = a.readUChar();
    this.IsDamaged = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readUShort();
    this.slot.card2 = a.readUShort();
    this.slot.card3 = a.readUShort();
    this.slot.card4 = a.readUShort();
    this.location = a.readLong();
    this.type = a.readUChar();
    this.result = a.readUChar();
    this.HireExpireDate = a.readLong();
    this.bindOnEquipType = a.readUShort();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
  };
  c.ZC.ITEM_PICKUP_ACK6.size = 56;
  c.ZC.GOLDPCCAFE_POINT = function (a, b) {
    this.isActive = a.readUChar();
    this.mode = a.readUChar();
    this.point = a.readULong();
    this.playedTime = a.readULong();
  };
  c.ZC.GOLDPCCAFE_POINT.size = 12;
  c.ZC.DYNAMICNPC_CREATE_RESULT = function (a, b) {
    this.result = a.readULong();
  };
  c.ZC.DYNAMICNPC_CREATE_RESULT.size = 6;
  c.ZC.RANDOM_UPGRADE_ITEM_UI_OPEN = function (a, b) {
    this.ITID = a.readULong();
  };
  c.ZC.RANDOM_UPGRADE_ITEM_UI_OPEN.size = 6;
  c.ZC.ACK_RANDOM_UPGRADE_ITEM = function (a, b) {
    this.result = a.readUShort();
  };
  c.ZC.ACK_RANDOM_UPGRADE_ITEM.size = 4;
  c.ZC.CHANGE_ITEM_OPTION = function (a, b) {
    this.index = a.readUShort();
    this.isDamaged = a.readUChar();
    this.slot = {};
    this.slot.card1 = a.readULong();
    this.slot.card2 = a.readULong();
    this.slot.card3 = a.readULong();
    this.slot.card4 = a.readULong();
    this.options = {};
    this.options.Index0 = a.readUShort();
    this.options.Value0 = a.readUShort();
    this.options.Param0 = a.readUChar();
    this.options.Index1 = a.readUShort();
    this.options.Value1 = a.readUShort();
    this.options.Param1 = a.readUChar();
    this.options.Index2 = a.readUShort();
    this.options.Value2 = a.readUShort();
    this.options.Param2 = a.readUChar();
    this.options.Index3 = a.readUShort();
    this.options.Value3 = a.readUShort();
    this.options.Param3 = a.readUChar();
    this.options.Index4 = a.readUShort();
    this.options.Value4 = a.readUShort();
    this.options.Param4 = a.readUChar();
    this.RefiningLevel = a.readUChar();
    this.enchantgrade = a.readUChar();
  };
  c.ZC.CHANGE_ITEM_OPTION.size = 48;
  return c;
});
