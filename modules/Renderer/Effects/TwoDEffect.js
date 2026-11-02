define(
  "Renderer/Effects/TwoDEffect",
  "Utils/WebGL Utils/Texture Utils/gl-matrix Core/Client Renderer/SpriteRenderer Renderer/EntityManager Renderer/Camera".split(
    " ",
  ),
  function (a, b, c, d, e, m, h) {
    function q(a, b) {
      a = Math.ceil(a);
      b = Math.floor(b);
      return Math.floor(Math.random() * (b - a + 1) + a);
    }
    function r(a, b, c) {
      var d = b.position,
        e = b.startTick;
      b = b.endTick;
      this.AID = c.ownerAID;
      this.ownerEntity = c.ownerEntity;
      this.otherEntity = c.otherEntity;
      this.textureName = a.file;
      this.zIndex = a.zIndex ? a.zIndex : 0;
      this.fadeOut = a.fadeOut ? !0 : !1;
      this.fadeIn = a.fadeIn ? !0 : !1;
      this.alphaMax = isNaN(a.alphaMax)
        ? 1
        : Math.max(Math.min(a.alphaMax, 1), 0);
      this.shadowTexture = a.shadowTexture ? !0 : !1;
      this.red = a.red ? a.red : 1;
      this.green = a.green ? a.green : 1;
      this.blue = a.blue ? a.blue : 1;
      this.position = d;
      this.posxStart = a.posxStart ? a.posxStart : 0;
      this.posxEnd = a.posxEnd ? a.posxEnd : 0;
      a.posx && (this.posxEnd = this.posxStart = a.posx);
      a.posxRand &&
        (this.posxEnd = this.posxStart = q(-a.posxRand, a.posxRand));
      a.posxRandDiff &&
        ((this.posxStart = q(-a.posxRandDiff, a.posxRandDiff)),
        (this.posxEnd = q(-a.posxRandDiff, a.posxRandDiff)));
      a.posxStartRand &&
        ((c = a.posxStartRandMiddle ? a.posxStartRandMiddle : 0),
        (this.posxStart = q(c - a.posxStartRand, c + a.posxStartRand)));
      a.posxEndRand &&
        ((c = a.posxEndRandMiddle ? a.posxEndRandMiddle : 0),
        (this.posxEnd = q(c - a.posxEndRand, c + a.posxEndRand)));
      this.posxSmooth = a.posxSmooth ? !0 : !1;
      this.posyStart = a.posyStart ? a.posyStart : 0;
      this.posyEnd = a.posyEnd ? a.posyEnd : 0;
      a.posy && (this.posyEnd = this.posyStart = a.posy);
      a.posyRand &&
        (this.posyEnd = this.posyStart = q(-a.posyRand, a.posyRand));
      a.posyRandDiff &&
        ((this.posyStart = q(-a.posyRandDiff, a.posyRandDiff)),
        (this.posyEnd = q(-a.posyRandDiff, a.posyRandDiff)));
      a.posyStartRand &&
        ((c = a.posyStartRandMiddle ? a.posyStartRandMiddle : 0),
        (this.posyStart = q(c - a.posyStartRand, c + a.posyStartRand)));
      a.posyEndRand &&
        ((c = a.posyEndRandMiddle ? a.posyEndRandMiddle : 0),
        (this.posyEnd = q(c - a.posyEndRand, c + a.posyEndRand)));
      this.posySmooth = a.posySmooth ? !0 : !1;
      this.poszStart = a.poszStart ? a.poszStart : 0;
      this.poszEnd = a.poszEnd ? a.poszEnd : 0;
      a.posz && (this.poszEnd = this.poszStart = a.posz);
      a.poszRand &&
        (this.poszEnd = this.poszStart = q(-a.poszRand, a.poszRand));
      a.poszRandDiff &&
        ((this.poszStart = q(-a.poszRandDiff, a.poszRandDiff)),
        (this.poszEnd = q(-a.poszRandDiff, a.poszRandDiff)));
      a.poszStartRand &&
        ((c = a.poszStartRandMiddle ? a.poszStartRandMiddle : 0),
        (this.poszStart = q(c - a.poszStartRand, c + a.poszStartRand)));
      a.poszEndRand &&
        ((c = a.poszEndRandMiddle ? a.poszEndRandMiddle : 0),
        (this.poszEnd = q(c - a.poszEndRand, c + a.poszEndRand)));
      this.poszSmooth = a.poszSmooth ? !0 : !1;
      this.offsetxStart = a.offsetxStart ? a.offsetxStart : 0;
      this.offsetxEnd = a.offsetxEnd ? a.offsetxEnd : 0;
      a.offsetx && (this.offsetxEnd = this.offsetxStart = a.offsetx);
      a.offsetxRand &&
        (this.offsetxEnd = this.offsetxStart =
          q(-a.offsetxRand, a.offsetxRand));
      a.offsetxRandDiff &&
        ((this.offsetxStart = q(-a.offsetxRandDiff, a.offsetxRandDiff)),
        (this.offsetxEnd = q(-a.offsetxRandDiff, a.offsetxRandDiff)));
      a.offsetxStartRand &&
        ((c = a.offsetxStartRandMiddle ? a.offsetxStartRandMiddle : 0),
        (this.offsetxStart = q(
          c - a.offsetxStartRand,
          c + a.offsetxStartRand,
        )));
      a.offsetxEndRand &&
        ((c = a.offsetxEndRandMiddle ? a.offsetxEndRandMiddle : 0),
        (this.offsetxEnd = q(c - a.offsetxEndRand, c + a.offsetxEndRand)));
      this.offsetxSmooth = a.offsetxSmooth ? !0 : !1;
      this.offsetyStart = a.offsetyStart ? a.offsetyStart : 0;
      this.offsetyEnd = a.offsetyEnd ? a.offsetyEnd : 0;
      a.offsety && (this.offsetyEnd = this.offsetyStart = a.offsety);
      a.offsetyRand &&
        (this.offsetyEnd = this.offsetyStart =
          q(-a.offsetyRand, a.offsetyRand));
      a.offsetyRandDiff &&
        ((this.offsetyStart = q(-a.offsetyRandDiff, a.offsetyRandDiff)),
        (this.offsetyEnd = q(-a.offsetyRandDiff, a.offsetyRandDiff)));
      a.offsetyStartRand &&
        ((c = a.offsetyStartRandMiddle ? a.offsetyStartRandMiddle : 0),
        (this.offsetyStart = q(
          c - a.offsetyStartRand,
          c + a.offsetyStartRand,
        )));
      a.offsetyEndRand &&
        ((c = a.offsetyEndRandMiddle ? a.offsetyEndRandMiddle : 0),
        (this.offsetyEnd = q(c - a.offsetyEndRand, c + a.offsetyEndRand)));
      this.offsetySmooth = a.offsetySmooth ? !0 : !1;
      a.size &&
        (this.sizeEndY =
          this.sizeEndX =
          this.sizeStartY =
          this.sizeStartX =
            a.size);
      a.sizeStart && (this.sizeStartY = this.sizeStartX = a.sizeStart);
      a.sizeEnd && (this.sizeEndY = this.sizeEndX = a.sizeEnd);
      a.sizeX && (this.sizeEndX = this.sizeStartX = a.sizeX);
      a.sizeY && (this.sizeEndY = this.sizeStartY = a.sizeY);
      a.sizeStartX && (this.sizeStartX = a.sizeStartX);
      a.sizeStartY && (this.sizeStartY = a.sizeStartY);
      a.sizeEndX && (this.sizeEndX = a.sizeEndX);
      a.sizeEndY && (this.sizeEndY = a.sizeEndY);
      a.sizeRand &&
        (this.sizeEndY =
          this.sizeEndX =
          this.sizeStartY =
          this.sizeStartX =
            q(-a.sizeRand, a.sizeRand) + 100);
      a.sizeRandX &&
        ((c = a.sizeRandXMiddle ? a.sizeRandXMiddle : 100),
        (this.sizeEndX = this.sizeStartX =
          q(c - a.sizeRandX, c + a.sizeRandX)));
      a.sizeRandY &&
        ((c = a.sizeRandYMiddle ? a.sizeRandYMiddle : 100),
        (this.sizeEndY = this.sizeStartY =
          q(c - a.sizeRandY, c + a.sizeRandY)));
      this.sizeSmooth = a.sizeSmooth ? !0 : !1;
      this.angle = a.angle ? a.angle : 0;
      this.rotate = a.rotate ? !0 : !1;
      this.toAngle = a.toAngle ? a.toAngle : 0;
      a.angleDelta &&
        ((this.angle += a.angleDelta * a.duplicateID),
        (this.toAngle += a.angleDelta * a.duplicateID));
      a.rotateToTarget &&
        ((this.rotateToTarget = !0),
        (this.angle +=
          90 -
          (180 / Math.PI) *
            Math.atan2(
              this.posyEnd - this.posyStart,
              this.posxEnd - this.posxStart,
            )));
      a.angleRand && (this.angle = q(a.angleRand[0], a.angleRand[1]));
      a.circlePattern &&
        ((c = q(a.circleOuterSizeRand[0], a.circleOuterSizeRand[1])),
        (this.posxEnd = Math.sin(((2 * Math.PI) / 360) * this.angle) * c),
        (this.posyEnd = Math.cos(((2 * Math.PI) / 360) * this.angle) * c),
        (this.posxStart =
          Math.sin(((2 * Math.PI) / 360) * this.angle) * a.circleInnerSize),
        (this.posyStart =
          Math.cos(((2 * Math.PI) / 360) * this.angle) * a.circleInnerSize));
      a.sizeRandStartX &&
        (this.sizeStartX = q(a.sizeRandStartX[0], a.sizeRandStartX[1]));
      a.sizeRandStartY &&
        (this.sizeStartY = q(a.sizeRandStartY[0], a.sizeRandStartY[1]));
      a.sizeRandEndY &&
        (this.sizeEndY = q(a.sizeRandEndY[0], a.sizeRandEndY[1]));
      a.sizeRandEndX &&
        (this.sizeEndX = q(a.sizeRandEndX[0], a.sizeRandEndX[1]));
      a.durationRand && (a.duration = q(a.durationRand[0], a.durationRand[1]));
      this.ownerEntity &&
        this.shadowTexture &&
        this.ownerEntity.attachments.add({
          completeFile: "data/sprite/shadow",
          uid: this.spriteName + "-" + this.sizeStartX + "-" + this.rotateLate,
          head: !0,
          direction: !0,
          repeat: !1,
          stopAtEnd: !0,
        });
      this.blendMode = a.blendMode;
      this.startTick = e;
      this.endTick = b;
    }
    c.mat4.create();
    var k = {};
    r.prototype.init = function (b) {
      var c = this;
      d.loadFile("data/texture/" + this.textureName, function (d) {
        a.texture(b, d, function (a) {
          c.texture = a;
          c.ready = !0;
        });
      });
    };
    r.prototype.free = function (a) {
      this.ready = !1;
    };
    r.prototype.render = function (a, b) {
      if (!(this.startTick > b)) {
        var c = b - this.startTick,
          d = this.endTick - this.startTick,
          g = (c / d) * 100;
        100 < g && (g = 100);
        0 < this.blendMode && 16 > this.blendMode
          ? a.blendFunc(a.SRC_ALPHA, k[this.blendMode])
          : a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
        e.image.texture = this.texture;
        e.zIndex = this.zIndex;
        var m = (h.angle[1] * Math.PI) / 180,
          u;
        if (this.posxSmooth)
          if (this.posxStart != this.posxEnd) {
            a = Math.log10(0.09 * g + 1);
            var t = this.posxEnd - this.posxStart,
              c = this.posxStart;
            u = a * t + c;
          } else u = this.posxStart;
        else
          this.posxStart != this.posxEnd
            ? ((t = (this.posxEnd - this.posxStart) / 100),
              (c = this.posxStart),
              (u = g * t + c))
            : (u = this.posxStart);
        this.posySmooth
          ? this.posyStart != this.posyEnd
            ? ((a = Math.log10(0.09 * g + 1)),
              (t = this.posyEnd - this.posyStart),
              (c = this.posyStart),
              (a = a * t + c))
            : (a = this.posyStart)
          : this.posyStart != this.posyEnd
            ? ((t = (this.posyEnd - this.posyStart) / 100),
              (c = this.posyStart),
              (a = g * t + c))
            : (a = this.posyStart);
        e.position[0] = this.position[0] + (u * Math.cos(m) - a * Math.sin(m));
        e.position[1] = this.position[1] + (a * Math.cos(m) + u * Math.sin(m));
        this.poszSmooth
          ? this.poszStart != this.poszEnd
            ? ((a = Math.log10(0.09 * g + 1)),
              (t = this.poszEnd - this.poszStart),
              (c = this.poszStart),
              (a = a * t + c))
            : (a = this.poszStart)
          : this.poszStart != this.poszEnd
            ? ((t = (this.poszEnd - this.poszStart) / 100),
              (c = this.poszStart),
              (a = g * t + c))
            : (a = this.poszStart);
        e.position[2] = this.position[2] + a;
        this.offsetxSmooth
          ? this.offsetxStart != this.offsetxEnd
            ? ((a = Math.log10(0.09 * g + 1)),
              (t = this.offsetxEnd - this.offsetxStart),
              (c = this.offsetxStart),
              (m = a * t + c))
            : (m = this.offsetxStart)
          : this.offsetxStart != this.offsetxEnd
            ? ((t = (this.offsetxEnd - this.offsetxStart) / 100),
              (c = this.offsetxStart),
              (m = g * t + c))
            : (m = this.offsetxStart);
        this.offsetySmooth
          ? this.offsetyStart != this.offsetyEnd
            ? ((a = Math.log10(0.09 * g + 1)),
              (t = this.offsetyEnd - this.offsetyStart),
              (c = this.offsetyStart),
              (a = a * t + c))
            : (a = this.offsetyStart)
          : this.offsetyStart != this.offsetyEnd
            ? ((t = (this.offsetyEnd - this.offsetyStart) / 100),
              (c = this.offsetyStart),
              (a = g * t + c))
            : (a = this.offsetyStart);
        e.offset[0] = m;
        e.offset[1] = a;
        a = this.alphaMax;
        this.fadeIn && c < d / 4
          ? (a = (c * this.alphaMax) / (d / 4))
          : this.fadeOut &&
            c > d / 2 + d / 4 &&
            (a = ((d - c) * this.alphaMax) / (d / 4));
        0 > a ? (a = 0) : 1 < a && (a = 1);
        e.color[3] = a;
        e.color[0] = this.red;
        e.color[1] = this.green;
        e.color[2] = this.blue;
        this.sizeSmooth
          ? (this.sizeEndX != this.sizeStartX
              ? ((a = Math.log10(0.09 * g + 1)),
                (m = this.sizeEndX - this.sizeStartX),
                (c = this.sizeStartX),
                (d = a * m + c))
              : (d = this.sizeStartX),
            this.sizeEndY != this.sizeStartY
              ? ((a = Math.log10(0.09 * g + 1)),
                (m = this.sizeEndY - this.sizeStartY),
                (c = this.sizeStartY),
                (c = a * m + c))
              : (c = this.sizeStartY))
          : (this.sizeEndX != this.sizeStartX
              ? ((a = (this.sizeEndX - this.sizeStartX) / 100),
                (c = this.sizeStartX),
                (d = g * a + c))
              : (d = this.sizeStartX),
            this.sizeEndY != this.sizeStartY
              ? ((a = (this.sizeEndY - this.sizeStartY) / 100),
                (c = this.sizeStartY),
                (c = g * a + c))
              : (c = this.sizeStartY));
        e.size[0] = d;
        e.size[1] = c;
        this.rotate
          ? ((a = (this.toAngle - this.angle) / 100),
            (e.angle = g * a + this.angle))
          : (e.angle = this.angle);
        e.render();
        if (this.ownerEntity)
          if (this.endTick < b)
            this.ownerEntity.attachments.remove(
              this.spriteName + "-" + this.sizeStartX + "-" + this.rotateLate,
            );
          else if (
            (g = this.ownerEntity.attachments.get(
              this.spriteName + "-" + this.sizeStartX + "-" + this.rotateLate,
            ))
          )
            g.position = new Int16Array([e.position[0], e.position[1]]);
        this.needCleanUp = this.endTick < b;
      }
    };
    r.init = function (a) {
      k[1] = a.ZERO;
      k[2] = a.ONE;
      k[3] = a.SRC_COLOR;
      k[4] = a.ONE_MINUS_SRC_COLOR;
      k[5] = a.DST_COLOR;
      k[6] = a.ONE_MINUS_DST_COLOR;
      k[7] = a.SRC_ALPHA;
      k[8] = a.ONE_MINUS_SRC_ALPHA;
      k[9] = a.DST_ALPHA;
      k[10] = a.ONE_MINUS_DST_ALPHA;
      k[11] = a.CONSTANT_COLOR;
      k[12] = a.ONE_MINUS_CONSTANT_COLOR;
      k[13] = a.CONSTANT_ALPHA;
      k[14] = a.ONE_MINUS_CONSTANT_ALPHA;
      k[15] = a.SRC_ALPHA_SATURATE;
      this.ready = !0;
      this.renderBeforeEntities = !1;
    };
    r.free = function (a) {
      this.ready = !1;
    };
    r.beforeRender = function (a, b, c, d, k) {
      e.bind3DContext(a, b, c, d);
      e.shadow = 1;
      e.angle = 0;
      e.size[0] = 100;
      e.size[1] = 100;
      e.offset[0] = 0;
      e.offset[1] = 0;
      e.image.palette = null;
      e.color[0] = 1;
      e.color[1] = 1;
      e.color[2] = 1;
      e.color[3] = 1;
      e.depth = 10;
      e.zIndex = 0;
    };
    r.afterRender = function (a) {
      a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
      e.unbind(a);
    };
    return r;
  },
);
