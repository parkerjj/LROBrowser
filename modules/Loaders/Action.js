define("Loaders/Action", ["Utils/BinaryReader"], function (a) {
  function b(a) {
    this.fp = null;
    this.versions = 0;
    this.actions = [];
    this.sounds = [];
    a && this.load(a);
  }
  b.prototype.load = function (b) {
    var d;
    this.fp = new a(b);
    this.header = this.fp.readBinaryString(2);
    if ("AC" !== this.header)
      throw Error(
        'ACT::load() - Incorrect header "' + this.header + '", must be "AC"',
      );
    this.version = this.fp.readUByte() / 10 + this.fp.readUByte();
    this.readActions();
    if (2.1 <= this.version) {
      d = this.fp.readLong();
      this.sounds.length = d;
      for (b = 0; b < d; ++b) this.sounds[b] = this.fp.readBinaryString(40);
      if (2.2 <= this.version)
        for (b = 0, d = this.actions.length; b < d; ++b)
          this.actions[b].delay = 25 * this.fp.readFloat();
    }
  };
  b.prototype.readActions = function () {
    var a,
      d = this.fp.readUShort(),
      b = this.actions;
    this.fp.seek(10, SEEK_CUR);
    b.length = d;
    for (a = 0; a < d; ++a)
      b[a] = { animations: this.readAnimations(), delay: 150 };
  };
  b.prototype.readAnimations = function () {
    var a = this.fp,
      d,
      b = a.readULong(),
      l = Array(b);
    for (d = 0; d < b; ++d) (a.seek(32, SEEK_CUR), (l[d] = this.readLayers()));
    return l;
  };
  b.prototype.readLayers = function () {
    var a = this.fp,
      d = a.readULong(),
      b = Array(d),
      l,
      h = this.version,
      r,
      t;
    for (r = 0; r < d; ++r)
      ((l = b[r] =
        {
          pos: [a.readLong(), a.readLong()],
          index: a.readLong(),
          is_mirror: a.readLong(),
          scale: [1, 1],
          color: [1, 1, 1, 1],
          angle: 0,
          spr_type: 0,
          width: 0,
          height: 0,
        }),
        2 <= h &&
          ((l.color[0] = a.readUByte() / 255),
          (l.color[1] = a.readUByte() / 255),
          (l.color[2] = a.readUByte() / 255),
          (l.color[3] = a.readUByte() / 255),
          (l.scale[0] = a.readFloat()),
          (l.scale[1] = 2.3 >= h ? l.scale[0] : a.readFloat()),
          (l.angle = a.readLong()),
          (l.spr_type = a.readLong()),
          2.5 <= h && ((l.width = a.readLong()), (l.height = a.readLong()))));
    l = 2 <= h ? a.readLong() : -1;
    t = [];
    if (2.3 <= h)
      for (d = a.readLong(), t.length = d, r = 0; r < d; ++r)
        (a.seek(4, SEEK_CUR),
          (t[r] = { x: a.readLong(), y: a.readLong() }),
          a.seek(4, SEEK_CUR));
    return { layers: b, sound: l, pos: t };
  };
  b.prototype.compile = function () {
    return { actions: this.actions, sounds: this.sounds };
  };
  return b;
});
