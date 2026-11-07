define("Renderer/Entity/EntityAttachments", [
  "Core/Client",
  "Renderer/Renderer",
  "Renderer/SpriteRenderer",
  "Renderer/Camera",
], function (a, b, c, d) {
  function e(a) {
    this.list = [];
    this.entity = a;
  }
  e.prototype.add = function (c) {
    c.uid && this.remove(c.uid);
    c.startTick = b.tick;
    c.opacity = isNaN(c.opacity) ? 1 : c.opacity;
    c.direction = c.hasOwnProperty("frame") ? !1 : !0;
    c.frame = c.frame || 0;
    c.depth = c.depth || 0;
    c.head = c.head || !1;
    c.position = !1;
    if (c.yOffset || c.xOffset) c.position = new Int16Array(2);
    c.xOffset && (c.position[0] = c.xOffset);
    c.yOffset && (c.position[1] = c.yOffset);
    c.repeat = c.repeat || !1;
    c.duplicate = c.duplicate || 0;
    c.stopAtEnd = c.stopAtEnd || !1;
    c.delay = c.delay || !1;
    c.completeFile
      ? ((c.spr = c.completeFile + ".spr"), (c.act = c.completeFile + ".act"))
      : c.file &&
        ((c.spr =
          "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/" +
          c.file +
          ".spr"),
        (c.act =
          "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/" +
          c.file +
          ".act"));
    a.loadFile(
      c.spr,
      function () {
        this.list.push(c);
      }.bind(this),
      null,
      { to_rgba: !0 },
    );
  };
  e.prototype.get = function (a) {
    var b,
      c = this.list.length;
    for (b = 0; b < c; ++b) if (this.list[b].uid == a) return this.list[b];
    return null;
  };
  e.prototype.remove = function (a) {
    var b, c, d;
    d = this.list;
    c = d.length;
    for (b = 0; b < c; ++b) d[b].uid === a && (this.removeIndex(b), b--, c--);
  };
  e.prototype.removeIndex = function (a) {
    this.list.splice(a, 1);
    0 === this.list.length &&
      this.entity.objecttype === this.entity.constructor.TYPE_EFFECT &&
      this.entity.remove();
  };
  e.prototype.render = (function () {
    var a = new Float32Array(4),
      b = new Float32Array([1, 1, 1, 1]);
    return function (d) {
      var e, k;
      k = this.list.length;
      a.set(this.entity.effectColor);
      this.entity.effectColor.set(b);
      for (e = 0; e < k; ++e)
        this.renderAttachment(this.list[e], d) &&
          (this.removeIndex(e), e--, k--);
      c.depth = 0;
      this.entity.effectColor.set(a);
    };
  })();
  e.prototype.renderAttachment = (function () {
    var b = new Int16Array(2);
    return function (e, m) {
      if (!(e.startTick > m)) {
        var h,
          k,
          g,
          t,
          l = !1;
        k = a.loadFile(e.spr);
        g = a.loadFile(e.act);
        if (!k || !g) return l;
        this.entity.effectColor[3] = e.opacity;
        e.position
          ? e.position && (b = e.position)
          : (b[1] = e.head ? -100 : 0);
        t = e.direction
          ? (d.direction + this.entity.direction + 8) % 8
          : e.frame;
        t %= g.actions.length;
        h = g.actions[t].animations;
        g = e.delay || g.actions[t].delay;
        c.depth = e.depth;
        "animationId" in e
          ? (m = h[e.animationId].layers)
          : e.repeat
            ? (m = h[Math.floor((m - e.startTick) / g) % h.length].layers)
            : 0 < e.duplicate
              ? ((g = Math.floor((m - e.startTick) / g) % h.length),
                (m = h[g].layers),
                g == h.length - 1 && e.duplicate--)
              : ((g = Math.min(
                  Math.floor((m - e.startTick) / g),
                  h.length - 1,
                )),
                (m = h[g].layers),
                g !== h.length - 1 || e.stopAtEnd || (l = !0));
        e = 0;
        for (h = m.length; e < h; ++e)
          this.entity.renderLayer(m[e], k, k, 1, b, !1);
        return l;
      }
    };
  })();
  return function () {
    this.attachments = new e(this);
  };
});
