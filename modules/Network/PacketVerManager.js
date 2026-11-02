define("Network/PacketVerManager", ["Core/Configs"], function (a) {
  function b() {
    var a = this.versions,
      b,
      m = a.length;
    for (b = 0; b < m - 1 && !(c < a[b + 1][0]); ++b);
    return a[b];
  }
  var c = 0;
  return {
    get value() {
      return c;
    },
    set value(a) {
      a !== c && (c = a);
    },
    addSupport: function (a, c) {
      var d,
        e,
        q,
        r = c.length;
      for (q = 0; q < r; ++q)
        ((e = c[q]),
          (d = e[0]),
          (e[0] = a),
          d.prototype.versions || (d.prototype.versions = []),
          d.prototype.versions.push(c[q]),
          (d.prototype.getPacketVersion = b));
    },
    parseCharInfo: function (d, b) {
      b || (b = d.length);
      var c,
        e = [];
      a.get("ClientVer");
      var q = 175,
        r = b - d.tell();
      if (0 >= r) return e;
      if (!q || r % q) {
        console.error(
          'CHARACTER_INFO size error!! blockSize : "' +
            q +
            '", list length: ' +
            r +
            ", auto-detect...",
        );
        var k = [
            106, 108, 112, 116, 124, 128, 132, 136, 140, 144, 145, 147, 155,
            175,
          ],
          g = [];
        b = 0;
        for (c = k.length; b < c; ++b) 0 === r % k[b] && g.push(k[b]);
        if (1 !== g.length)
          return (
            require("UI/UIManager").showErrorBox(
              'CHARACTER_INFO size error!! blockSize : "' +
                q +
                '", list length: ' +
                r +
                ", auto-detect...",
            ),
            e
          );
        q = g[0];
      }
      b = 0;
      for (c = r / q; b < c; ++b)
        ((e[b] = {}),
          (e[b].GID = d.readULong()),
          (e[b].exp = 155 > q ? d.readLong() : d.getUint64()),
          (e[b].money = d.readLong()),
          (e[b].jobexp = 155 > q ? d.readLong() : d.getUint64()),
          (e[b].joblevel = d.readLong()),
          (e[b].bodyState = d.readLong()),
          (e[b].healthState = d.readLong()),
          (e[b].effectState = d.readLong()),
          (e[b].virtue = d.readLong()),
          (e[b].honor = d.readLong()),
          (e[b].jobpoint = d.readShort()),
          112 > q
            ? ((e[b].hp = d.readShort()), (e[b].maxhp = d.readShort()))
            : 175 > q
              ? ((e[b].hp = d.readLong()), (e[b].maxhp = d.readLong()))
              : ((e[b].hp = d.getUint64()), (e[b].maxhp = d.getUint64())),
          175 > q
            ? ((e[b].sp = d.readShort()), (e[b].maxsp = d.readShort()))
            : ((e[b].sp = d.getUint64()), (e[b].maxsp = d.getUint64())),
          (e[b].speed = d.readShort()),
          (e[b].job = d.readShort()),
          (e[b].head = d.readShort()),
          147 <= q && (e[b].body = d.readShort()),
          (e[b].weapon = d.readShort()),
          (e[b].level = d.readShort()),
          (e[b].sppoint = d.readShort()),
          (e[b].accessory = d.readShort()),
          (e[b].shield = d.readShort()),
          (e[b].accessory2 = d.readShort()),
          (e[b].accessory3 = d.readShort()),
          (e[b].headpalette = d.readShort()),
          (e[b].bodypalette = d.readShort()),
          (e[b].name = d.readString(24)),
          (e[b].Str = d.readUChar()),
          (e[b].Agi = d.readUChar()),
          (e[b].Vit = d.readUChar()),
          (e[b].Int = d.readUChar()),
          (e[b].Dex = d.readUChar()),
          (e[b].Luk = d.readUChar()),
          108 > q
            ? (e[b].CharNum = d.readUShort())
            : 124 > q
              ? ((e[b].CharNum = d.readUShort()),
                (e[b].haircolor = d.readUShort()))
              : ((e[b].CharNum = d.readUChar()),
                (e[b].haircolor = d.readUChar())),
          116 === q && d.seek(4, SEEK_CUR),
          124 <= q &&
            ((e[b].bIsChangedCharName = d.readShort()),
            (e[b].lastMap = d.readBinaryString(124 === q ? 12 : 16))),
          132 <= q && (e[b].DeleteDate = d.readLong()),
          136 <= q && (e[b].Robe = d.readLong()),
          140 <= q && (e[b].SlotAddon = d.readLong()),
          144 <= q && (e[b].RenameAddon = d.readLong()),
          145 <= q && (e[b].sex = d.readUChar()));
      return e;
    },
  };
});
