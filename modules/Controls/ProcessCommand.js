define(
  "Controls/ProcessCommand",
  "require DB/DBManager DB/Emotions Audio/BGM Audio/SoundManager Engine/SessionStorage Network/PacketStructure Network/NetworkManager Preferences/Controls Preferences/Audio Preferences/Map Preferences/Camera".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("DB/Emotions"),
      d = a("Audio/BGM"),
      e = a("Audio/SoundManager"),
      l = a("Engine/SessionStorage"),
      h = a("Network/PacketStructure"),
      r = a("Network/NetworkManager"),
      t = a("Preferences/Controls"),
      n = a("Preferences/Audio"),
      g = a("Preferences/Map"),
      p = a("Preferences/Camera");
    return function (k) {
      var f,
        m = k.split(" ")[0];
      switch (m) {
        case "sound":
          this.addText(b.getMessage(27 + n.Sound.play), this.TYPE.INFO);
          n.Sound.play = !n.Sound.play;
          n.save();
          n.Sound.play && e.stop();
          return;
        case "bgm":
          this.addText(b.getMessage(31 + n.BGM.play), this.TYPE.INFO);
          n.BGM.play = !n.BGM.play;
          n.save();
          n.BGM.play ? d.play(d.filename) : d.stop();
          return;
        case "effect":
          this.addText(b.getMessage(23 + g.effect), this.TYPE.INFO);
          g.effect = !g.effect;
          g.save();
          return;
        case "mineffect":
          this.addText(b.getMessage(687 + g.mineffect), this.TYPE.INFO);
          g.mineffect = !g.mineffect;
          g.save();
          return;
        case "miss":
          this.addText(b.getMessage(317 + g.miss), this.TYPE.INFO);
          g.miss = !g.miss;
          g.save();
          return;
        case "camera":
          this.addText(b.getMessage(319 + p.smooth), this.TYPE.INFO);
          p.smooth = !p.smooth;
          p.save();
          return;
        case "fog":
          g.fog = !g.fog;
          this.addText("fog " + (g.fog ? "on" : "off"), this.TYPE.INFO);
          g.save();
          return;
        case "lightmap":
          g.lightmap = !g.lightmap;
          g.save();
          return;
        case "noctrl":
        case "nc":
          this.addText(b.getMessage(717 + t.noctrl), this.TYPE.INFO);
          t.noctrl = !t.noctrl;
          t.save();
          return;
        case "noshift":
        case "ns":
          this.addText(b.getMessage(701 + t.noshift), this.TYPE.INFO);
          t.noshift = !t.noshift;
          t.save();
          return;
        case "sit":
        case "stand":
          k = new h.CZ.REQUEST_ACT();
          k.action = l.Entity.action === l.Entity.ACTION.SIT ? 3 : 2;
          r.sendPacket(k);
          return;
        case "doridori":
          l.Entity.headDir = 1 === l.Entity.headDir ? 2 : 1;
          k = new h.CZ.CHANGE_DIRECTION();
          k.headDir = l.Entity.headDir;
          k.dir = l.Entity.direction;
          r.sendPacket(k);
          return;
        case "bangbang":
          l.Entity.direction = (l.Entity.direction + 1) % 8;
          k = new h.CZ.CHANGE_DIRECTION();
          k.headDir = l.Entity.headDir;
          k.dir = l.Entity.direction;
          r.sendPacket(k);
          return;
        case "bingbing":
          l.Entity.direction = (l.Entity.direction + 7) % 8;
          k = new h.CZ.CHANGE_DIRECTION();
          k.headDir = l.Entity.headDir;
          k.dir = l.Entity.direction;
          r.sendPacket(k);
          return;
        case "where":
          f = a("Renderer/MapRenderer").currentMap;
          this.addText(
            b.getMapName(f) +
              "(" +
              f +
              ") : " +
              Math.floor(l.Entity.position[0]) +
              ", " +
              Math.floor(l.Entity.position[1]),
            this.TYPE.INFO,
          );
          return;
        case "exall":
          k = new h.CZ.SETTING_WHISPER_STATE();
          k.type = 0;
          r.sendPacket(k);
          return;
        case "inall":
          k = new h.CZ.SETTING_WHISPER_STATE();
          k.type = 1;
          r.sendPacket(k);
          return;
        case "who":
        case "w":
          k = new h.CZ.REQ_USER_COUNT();
          r.sendPacket(k);
          return;
        case "blacksmith":
          k = new h.CZ.REQ_RANKING();
          k.Type = 0;
          r.sendPacket(k);
          return;
        case "alchemist":
          k = new h.CZ.REQ_RANKING();
          k.Type = 1;
          r.sendPacket(k);
          return;
        case "taekwon":
          k = new h.CZ.REQ_RANKING();
          k.Type = 2;
          r.sendPacket(k);
          return;
        case "pk":
          k = new h.CZ.REQ_RANKING();
          k.Type = 3;
          r.sendPacket(k);
          return;
        case "memo":
          k = new h.CZ.REMEMBER_WARPPOINT();
          r.sendPacket(k);
          return;
        case "chat":
          a("UI/Components/ChatRoomCreate/ChatRoomCreate").show();
          return;
        case "q":
          a("UI/Components/ChatRoom/ChatRoom").remove();
          return;
        case "leave":
          a("Engine/MapEngine/Group").onRequestLeave();
          return;
        case "invite":
          if ((f = k.match(/^invite\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Group").onRequestInvitation(0, f[2]);
            return;
          }
          break;
        case "organize":
          if ((f = k.match(/^organize\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Group").onRequestCreationEasy(f[2]);
            return;
          }
          break;
        case "hi":
          a("Engine/MapEngine/Friends").sayHi();
          return;
        case "guild":
          if ((f = k.match(/^guild\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Guild").createGuild(f[2]);
            return;
          }
          break;
        case "breakguild":
          if ((f = k.match(/^breakguild\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Guild").breakGuild(f[2]);
            return;
          }
      }
      if ((f = k.match(/^(\w{3})\+ (\d+)$/))) {
        var q = "str agi vit int dex luk".split(" ").indexOf(f[1]);
        if (-1 < q && 0 !== f[2]) {
          k = new h.CZ.STATUS_CHANGE();
          k.statusID = q + 13;
          k.changeAmount = parseInt(f[2], 10);
          r.sendPacket(k);
          return;
        }
      }
      m in c.commands
        ? ((k = new h.CZ.REQ_EMOTION()),
          (k.type = c.commands[m]),
          r.sendPacket(k))
        : this.addText(b.getMessage(95), this.TYPE.INFO);
    };
  },
);
