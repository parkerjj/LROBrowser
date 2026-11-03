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
      m = a("Engine/SessionStorage"),
      h = a("Network/PacketStructure"),
      t = a("Network/NetworkManager"),
      r = a("Preferences/Controls"),
      n = a("Preferences/Audio"),
      g = a("Preferences/Map"),
      p = a("Preferences/Camera");
    return function (l) {
      var f,
        k = l.split(" ")[0];
      switch (k) {
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
          this.addText(b.getMessage(717 + r.noctrl), this.TYPE.INFO);
          r.noctrl = !r.noctrl;
          r.save();
          return;
        case "noshift":
        case "ns":
          this.addText(b.getMessage(701 + r.noshift), this.TYPE.INFO);
          r.noshift = !r.noshift;
          r.save();
          return;
        case "sit":
        case "stand":
          l = new h.CZ.REQUEST_ACT();
          l.action = m.Entity.action === m.Entity.ACTION.SIT ? 3 : 2;
          t.sendPacket(l);
          return;
        case "doridori":
          m.Entity.headDir = 1 === m.Entity.headDir ? 2 : 1;
          l = new h.CZ.CHANGE_DIRECTION();
          l.headDir = m.Entity.headDir;
          l.dir = m.Entity.direction;
          t.sendPacket(l);
          return;
        case "bangbang":
          m.Entity.direction = (m.Entity.direction + 1) % 8;
          l = new h.CZ.CHANGE_DIRECTION();
          l.headDir = m.Entity.headDir;
          l.dir = m.Entity.direction;
          t.sendPacket(l);
          return;
        case "bingbing":
          m.Entity.direction = (m.Entity.direction + 7) % 8;
          l = new h.CZ.CHANGE_DIRECTION();
          l.headDir = m.Entity.headDir;
          l.dir = m.Entity.direction;
          t.sendPacket(l);
          return;
        case "where":
          f = a("Renderer/MapRenderer").currentMap;
          this.addText(
            b.getMapName(f) +
              "(" +
              f +
              ") : " +
              Math.floor(m.Entity.position[0]) +
              ", " +
              Math.floor(m.Entity.position[1]),
            this.TYPE.INFO,
          );
          return;
        case "exall":
          l = new h.CZ.SETTING_WHISPER_STATE();
          l.type = 0;
          t.sendPacket(l);
          return;
        case "inall":
          l = new h.CZ.SETTING_WHISPER_STATE();
          l.type = 1;
          t.sendPacket(l);
          return;
        case "who":
        case "w":
          l = new h.CZ.REQ_USER_COUNT();
          t.sendPacket(l);
          return;
        case "blacksmith":
          l = new h.CZ.REQ_RANKING();
          l.Type = 0;
          t.sendPacket(l);
          return;
        case "alchemist":
          l = new h.CZ.REQ_RANKING();
          l.Type = 1;
          t.sendPacket(l);
          return;
        case "taekwon":
          l = new h.CZ.REQ_RANKING();
          l.Type = 2;
          t.sendPacket(l);
          return;
        case "pk":
          l = new h.CZ.REQ_RANKING();
          l.Type = 3;
          t.sendPacket(l);
          return;
        case "memo":
          l = new h.CZ.REMEMBER_WARPPOINT();
          t.sendPacket(l);
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
          if ((f = l.match(/^invite\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Group").onRequestInvitation(0, f[2]);
            return;
          }
          break;
        case "organize":
          if ((f = l.match(/^organize\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Group").onRequestCreationEasy(f[2]);
            return;
          }
          break;
        case "hi":
          a("Engine/MapEngine/Friends").sayHi();
          return;
        case "guild":
          if ((f = l.match(/^guild\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Guild").createGuild(f[2]);
            return;
          }
          break;
        case "breakguild":
          if ((f = l.match(/^breakguild\s+(")?([^"]+)(")?/)) && f[2]) {
            a("Engine/MapEngine/Guild").breakGuild(f[2]);
            return;
          }
      }
      if ((f = l.match(/^(\w{3})\+ (\d+)$/))) {
        var q = "str agi vit int dex luk".split(" ").indexOf(f[1]);
        if (-1 < q && 0 !== f[2]) {
          l = new h.CZ.STATUS_CHANGE();
          l.statusID = q + 13;
          l.changeAmount = parseInt(f[2], 10);
          t.sendPacket(l);
          return;
        }
      }
      k in c.commands
        ? ((l = new h.CZ.REQ_EMOTION()),
          (l.type = c.commands[k]),
          t.sendPacket(l))
        : this.addText(b.getMessage(95), this.TYPE.INFO);
    };
  },
);
