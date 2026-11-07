define(
  "Renderer/Effects/ThreeDEffect",
  "Utils/WebGL Core/Client Renderer/SpriteRenderer Renderer/EntityManager Renderer/Map/Altitude Renderer/Camera".split(
    " ",
  ),
  function (a, b, c, d, e, m) {
    function h(a, b) {
      return parseFloat(Math.min(a + Math.random() * (b - a), b).toFixed(3));
    }
    function r(a, b, c) {
      var d = b.position,
        e = b.otherPosition,
        g = b.startTick,
        k = b.endTick;
      this.AID = c.ownerAID;
      this.ownerEntity = c.ownerEntity;
      this.otherEntity = c.otherEntity;
      a.rfile
        ? ((c = a.rand),
          (this.textureName = a.rfile.replace(
            "%d",
            c[Math.floor(Math.random() * c.length)],
          )))
        : (this.textureName = a.file);
      this.textureNameList = Array.isArray(a.fileList) ? a.fileList : [];
      this.frameDelay = isNaN(a.frameDelay) ? 10 : a.frameDelay;
      this.zIndex = a.zIndex ? a.zIndex : 0;
      this.fadeOut = a.fadeOut ? !0 : !1;
      this.fadeIn = a.fadeIn ? !0 : !1;
      this.shadowTexture = a.shadowTexture ? !0 : !1;
      this.spriteName = a.spriteName;
      this.spriteRessource = null;
      this.playSprite = a.playSprite ? !0 : !1;
      this.sprDelay = a.sprDelay ? a.sprDelay : 0;
      this.rotatePosX = 0 < a.rotatePosX ? a.rotatePosX : 0;
      this.rotatePosY = 0 < a.rotatePosY ? a.rotatePosY : 0;
      this.rotatePosZ = 0 < a.rotatePosZ ? a.rotatePosZ : 0;
      this.nbOfRotation = 0 < a.nbOfRotation ? a.nbOfRotation : 1;
      this.rotateLate = 0 < a.rotateLate ? a.rotateLate : 0;
      this.rotateLate += a.rotateLateDelta
        ? a.rotateLateDelta * b.duplicateID
        : 0;
      this.rotationClockwise = a.rotationClockwise ? !0 : !1;
      this.sparkling = a.sparkling ? !0 : !1;
      this.sparkNumber =
        0 < a.sparkNumber
          ? a.sparkNumber
          : a.sparkNumberRand
            ? h(a.sparkNumberRand[0], a.sparkNumberRand[1])
            : 1;
      this.alphaMax = isNaN(a.alphaMax)
        ? 1
        : Math.max(Math.min(a.alphaMax, 1), 0);
      this.alphaMax = Math.max(
        Math.min(
          this.alphaMax +
            (isNaN(a.alphaMaxDelta) ? 0 : a.alphaMaxDelta * b.duplicateID),
          1,
        ),
        0,
      );
      this.red = a.red ? a.red : 1;
      this.green = a.green ? a.green : 1;
      this.blue = a.blue ? a.blue : 1;
      this.position = d;
      this.posxStart = a.posxStart ? a.posxStart : 0;
      this.posxEnd = a.posxEnd ? a.posxEnd : 0;
      a.posx && (this.posxEnd = this.posxStart = a.posx);
      a.posxRand &&
        (this.posxEnd = this.posxStart = h(-a.posxRand, a.posxRand));
      a.posxRandDiff &&
        ((this.posxStart = h(-a.posxRandDiff, a.posxRandDiff)),
        (this.posxEnd = h(-a.posxRandDiff, a.posxRandDiff)));
      a.posxStartRand &&
        ((c = a.posxStartRandMiddle ? a.posxStartRandMiddle : 0),
        (this.posxStart = h(c - a.posxStartRand, c + a.posxStartRand)));
      a.posxEndRand &&
        ((c = a.posxEndRandMiddle ? a.posxEndRandMiddle : 0),
        (this.posxEnd = h(c - a.posxEndRand, c + a.posxEndRand)));
      this.posxSmooth = a.posxSmooth ? !0 : !1;
      this.posyStart = a.posyStart ? a.posyStart : 0;
      this.posyEnd = a.posyEnd ? a.posyEnd : 0;
      a.posy && (this.posyEnd = this.posyStart = a.posy);
      a.posyRand &&
        (this.posyEnd = this.posyStart = h(-a.posyRand, a.posyRand));
      a.posyRandDiff &&
        ((this.posyStart = h(-a.posyRandDiff, a.posyRandDiff)),
        (this.posyEnd = h(-a.posyRandDiff, a.posyRandDiff)));
      a.posyStartRand &&
        ((c = a.posyStartRandMiddle ? a.posyStartRandMiddle : 0),
        (this.posyStart = h(c - a.posyStartRand, c + a.posyStartRand)));
      a.posyEndRand &&
        ((c = a.posyEndRandMiddle ? a.posyEndRandMiddle : 0),
        (this.posyEnd = h(c - a.posyEndRand, c + a.posyEndRand)));
      this.posySmooth = a.posySmooth ? !0 : !1;
      this.poszStart = a.poszStart ? a.poszStart : 0;
      this.poszEnd = a.poszEnd ? a.poszEnd : 0;
      a.posz && (this.poszEnd = this.poszStart = a.posz);
      a.poszRand &&
        ((c = a.poszOffset ? a.poszOffset : 0),
        (this.poszEnd = this.poszStart = h(-a.poszRand, a.poszRand) + c));
      a.poszRandDiff &&
        ((this.poszStart = h(-a.poszRandDiff, a.poszRandDiff)),
        (this.poszEnd = h(-a.poszRandDiff, a.poszRandDiff)));
      a.poszStartRand &&
        ((c = a.poszStartRandMiddle ? a.poszStartRandMiddle : 0),
        (this.poszStart = h(c - a.poszStartRand, c + a.poszStartRand)));
      a.poszEndRand &&
        ((c = a.poszEndRandMiddle ? a.poszEndRandMiddle : 0),
        (this.poszEnd = h(c - a.poszEndRand, c + a.poszEndRand)));
      this.xOffset = isNaN(a.xOffset) ? 0 : a.xOffset;
      this.yOffset = isNaN(a.yOffset) ? 0 : a.yOffset;
      this.zOffset = isNaN(a.zOffset) ? 0 : a.zOffset;
      this.poszSmooth = a.poszSmooth ? !0 : !1;
      this.bezierCurve = a.bezierCurve ? !0 : !1;
      if (a.fromSrc)
        if (this.bezierCurve) {
          this.pos1 = [];
          this.pos2 = [];
          this.pos3 = [];
          this.pos1[0] = d[0];
          this.pos1[1] = d[1] + 3;
          this.pos1[2] = d[2];
          switch (this.otherEntity.direction) {
            case 0:
              c = [h(-5, 5), h(8, 10), 0];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2];
              break;
            case 1:
              c = [h(5, 8), h(8, 10), h(-5, 5)];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2] + c[2];
              break;
            case 2:
              c = [h(5, 8), h(8, 10), h(-5, 5)];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2] + c[2];
              break;
            case 3:
              c = [h(5, 10), h(8, 10), h(-5, 0)];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2] + c[2];
              break;
            case 4:
              c = [h(-5, 5), h(8, 10), h(-3, -5)];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2] + c[2];
              break;
            case 5:
              c = [h(-10, -5), h(8, 10), h(-5, 0)];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2] + c[2];
              break;
            case 6:
              c = [h(-10, -5), h(8, 10), h(-5, 5)];
              this.pos2[0] = d[0] + c[0];
              this.pos2[1] = d[1] + c[1];
              this.pos2[2] = d[2] + c[2];
              break;
            case 7:
              ((c = [h(-10, -5), h(8, 10), h(-5, 5)]),
                (this.pos2[0] = d[0] + c[0]),
                (this.pos2[1] = d[1] + c[1]),
                (this.pos2[2] = d[2] + c[2]));
          }
          this.pos3[0] = e[0];
          this.pos3[1] = e[1] + 3;
          this.pos3[2] = e[2];
        } else {
          c = [
            a.posxStartRand ? h(-a.posxStartRand, a.posxStartRand) : 0,
            a.posyStartRand ? h(-a.posyStartRand, a.posyStartRand) : 0,
            a.poszStartRand ? h(-a.poszStartRand, a.poszStartRand) : 0,
          ];
          var m = [
            a.posxEndRand ? h(-a.posxEndRand, a.posxEndRand) : 0,
            a.posyEndRand ? h(-a.posyEndRand, a.posyEndRand) : 0,
            a.poszEndRand ? h(-a.poszEndRand, a.poszEndRand) : 0,
          ];
          this.posxStart = 0 + this.xOffset + c[0];
          this.posxEnd = e[0] - d[0] + this.xOffset + m[0];
          this.posyStart = 0 + this.yOffset + c[1];
          this.posyEnd = e[1] - d[1] + this.yOffset + m[1];
          this.poszStart = 0 + this.zOffset + c[2];
          this.poszEnd = e[2] - d[2] + this.zOffset + m[2];
        }
      if (a.toSrc)
        if (this.bezierCurve) {
          this.pos1 = [];
          this.pos2 = [];
          this.pos3 = [];
          this.pos1[0] = e[0];
          this.pos1[1] = e[1] + 3;
          this.pos1[2] = e[2];
          switch (this.otherEntity.direction) {
            case 0:
              c = [h(-5, 5), h(8, 10), 0];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2];
              break;
            case 1:
              c = [h(5, 8), h(8, 10), h(-5, 5)];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2] + c[2];
              break;
            case 2:
              c = [h(5, 8), h(8, 10), h(-5, 5)];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2] + c[2];
              break;
            case 3:
              c = [h(5, 10), h(8, 10), h(-5, 0)];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2] + c[2];
              break;
            case 4:
              c = [h(-5, 5), h(8, 10), h(-3, -5)];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2] + c[2];
              break;
            case 5:
              c = [h(-10, -5), h(8, 10), h(-5, 0)];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2] + c[2];
              break;
            case 6:
              c = [h(-10, -5), h(8, 10), h(-5, 5)];
              this.pos2[0] = e[0] + c[0];
              this.pos2[1] = e[1] + c[1];
              this.pos2[2] = e[2] + c[2];
              break;
            case 7:
              ((c = [h(-10, -5), h(8, 10), h(-5, 5)]),
                (this.pos2[0] = e[0] + c[0]),
                (this.pos2[1] = e[1] + c[1]),
                (this.pos2[2] = e[2] + c[2]));
          }
          this.pos3[0] = d[0];
          this.pos3[1] = d[1] + 3;
          this.pos3[2] = d[2];
        } else
          ((c = [
            a.posxStartRand ? h(-a.posxStartRand, a.posxStartRand) : 0,
            a.posyStartRand ? h(-a.posyStartRand, a.posyStartRand) : 0,
            a.poszStartRand ? h(-a.poszStartRand, a.poszStartRand) : 0,
          ]),
            (m = [
              a.posxEndRand ? h(-a.posxEndRand, a.posxEndRand) : 0,
              a.posyEndRand ? h(-a.posyEndRand, a.posyEndRand) : 0,
              a.poszEndRand ? h(-a.poszEndRand, a.poszEndRand) : 0,
            ]),
            (this.posxStart = e[0] - d[0] + this.xOffset + c[0]),
            (this.posxEnd = 0 + this.xOffset + m[0]),
            (this.posyStart = e[1] - d[1] + this.yOffset + c[1]),
            (this.posyEnd = 0 + this.yOffset + m[1]),
            (this.poszStart = e[2] - d[2] + this.zOffset + c[2]),
            (this.poszEnd = 0 + this.zOffset + m[2]));
      this.sizeEndY = a.size
        ? (this.sizeEndX = this.sizeStartY = this.sizeStartX = a.size)
        : (this.sizeEndX = this.sizeStartY = this.sizeStartX = 1);
      a.sizeDelta &&
        ((this.sizeStartX += a.sizeDelta * b.duplicateID),
        (this.sizeStartY += a.sizeDelta * b.duplicateID),
        (this.sizeEndX += a.sizeDelta * b.duplicateID),
        (this.sizeEndY += a.sizeDelta * b.duplicateID));
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
            a.size + h(-a.sizeRand, a.sizeRand));
      a.sizeRandX &&
        ((b = a.sizeRandXMiddle ? a.sizeRandXMiddle : 100),
        (this.sizeEndX = this.sizeStartX =
          h(b - a.sizeRandX, b + a.sizeRandX)));
      a.sizeRandY &&
        ((b = a.sizeRandYMiddle ? a.sizeRandYMiddle : 100),
        (this.sizeEndY = this.sizeStartY =
          h(b - a.sizeRandY, b + a.sizeRandY)));
      this.sizeSmooth = a.sizeSmooth ? !0 : !1;
      this.angle = a.angle ? a.angle : 0;
      this.rotate = a.rotate ? !0 : !1;
      this.toAngle = a.toAngle ? a.toAngle : 0;
      this.startTick = g;
      this.endTick = k;
      this.blendMode = a.blendMode;
      a.rotateToTarget &&
        ((this.rotateToTarget = !0),
        (this.angle +=
          90 -
          (180 / Math.PI) *
            Math.atan2(
              this.posyEnd - this.posyStart,
              this.posxEnd - this.posxStart,
            )));
      this.rotateWithCamera = a.rotateWithCamera ? !0 : !1;
      this.noLifeTime = a.noLifeTime;
    }
    var q = {};
    r.prototype.init = function (c) {
      this.loadedTextures = 0;
      this.textureList = [];
      var d = this;
      if (0 < this.textureNameList.length)
        for (
          var e = this.textureNameList.length, l = { i: 0 };
          l.i < e;
          l = { i: l.i }, l.i++
        )
          b.loadFile(
            "data/texture/" + this.textureNameList[l.i],
            (function (b) {
              return function (f) {
                a.texture(c, f, function (a) {
                  d.textureList[b.i] = a;
                  d.loadedTextures++;
                  d.loadedTextures == e && (d.ready = !0);
                });
              };
            })(l),
          );
      else
        this.textureName
          ? b.loadFile("data/texture/" + this.textureName, function (b) {
              a.texture(c, b, function (a) {
                d.texture = a;
                d.ready = !0;
              });
            })
          : (d.ready = !0);
    };
    r.prototype.free = function (a) {
      this.ready = !1;
    };
    r.prototype.render = function (a, g) {
      if (!(this.startTick > g)) {
        0 < this.blendMode && 16 > this.blendMode
          ? a.blendFunc(a.SRC_ALPHA, q[this.blendMode])
          : a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
        a = g - this.startTick;
        var h = this.endTick - this.startTick;
        if (this.noLifeTime) var l = g / 120;
        else ((l = (a / h) * 100), 100 < l && (l = 100));
        this.spriteRessource ||
          (this.shadowTexture
            ? ((this.spriteRessource = b.loadFile("data/sprite/shadow.spr")),
              (this.actRessource = b.loadFile("data/sprite/shadow.act")))
            : this.spriteName &&
              ((this.spriteRessource = b.loadFile(
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/" +
                  this.spriteName +
                  ".spr",
              )),
              (this.actRessource = b.loadFile(
                "data/sprite/\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae/" +
                  this.spriteName +
                  ".act",
              ))));
        this.spriteRessource &&
          (this.texture = this.spriteRessource.frames[0].texture);
        0 < this.textureList.length &&
          (this.texture =
            this.textureList[
              Math.floor((g - this.startTick) / this.frameDelay) %
                this.textureList.length
            ]);
        c.image.texture = this.texture;
        c.zIndex = this.zIndex;
        if (this.bezierCurve) {
          var f = this.pos1,
            k = this.pos2,
            p = this.pos3,
            r = l / 100,
            f = new Float32Array([
              Math.pow(1 - r, 2) * f[0] +
                2 * (1 - r) * r * k[0] +
                Math.pow(r, 2) * p[0],
              Math.pow(1 - r, 2) * f[1] +
                2 * (1 - r) * r * k[1] +
                Math.pow(r, 2) * p[1],
              Math.pow(1 - r, 2) * f[2] +
                2 * (1 - r) * r * k[2] +
                Math.pow(r, 2) * p[2],
            ]);
          c.position = new Float32Array(f);
        } else
          (0 < this.rotatePosX
            ? ((f =
                this.rotatePosX *
                Math.cos(
                  (3.5 * l * this.nbOfRotation * Math.PI) / 180 -
                    (this.rotateLate * Math.PI) / 2,
                )),
              this.rotationClockwise && (f *= -1))
            : this.posxSmooth
              ? this.posxStart != this.posxEnd
                ? ((f = Math.log10(0.09 * l + 1)),
                  (k = this.posxEnd - this.posxStart),
                  (p = this.posxStart),
                  (f = f * k + p))
                : (f = this.posxStart)
              : this.posxStart != this.posxEnd
                ? ((k = (this.posxEnd - this.posxStart) / 100),
                  (p = this.posxStart),
                  (f = l * k + p))
                : (f = this.posxStart),
            (c.position[0] = this.position[0] + f),
            0 < this.rotatePosY
              ? (f =
                  this.rotatePosY *
                  Math.sin(
                    (3.5 * l * this.nbOfRotation * Math.PI) / 180 -
                      (this.rotateLate * Math.PI) / 2,
                  ))
              : this.posySmooth
                ? this.posyStart != this.posyEnd
                  ? ((f = Math.log10(0.09 * l + 1)),
                    (k = this.posyEnd - this.posyStart),
                    (p = this.posyStart),
                    (f = f * k + p))
                  : (f = this.posyStart)
                : this.posyStart != this.posyEnd
                  ? ((k = (this.posyEnd - this.posyStart) / 100),
                    (p = this.posyStart),
                    (f = l * k + p))
                  : (f = this.posyStart),
            (c.position[1] = this.position[1] + f),
            this.poszSmooth
              ? this.poszStart != this.poszEnd
                ? ((f = Math.log10(0.09 * l + 1)),
                  (k = this.poszEnd - this.poszStart),
                  (p = this.poszStart),
                  (f = f * k + p))
                : (f = this.poszStart)
              : this.poszStart != this.poszEnd
                ? ((k = (this.poszEnd - this.poszStart) / 100),
                  (p = this.poszStart),
                  (f = l * k + p))
                : (f = this.poszStart),
            (c.position[2] = this.position[2] + f));
        this.shadowTexture &&
          (c.position[2] = e.getCellHeight(c.position[0], c.position[0]));
        f = this.alphaMax;
        this.fadeIn && a < h / 4
          ? (f = (a * this.alphaMax) / (h / 4))
          : this.fadeOut && a > h / 2 + h / 4
            ? (f = ((h - a) * this.alphaMax) / (h / 4))
            : this.sparkling &&
              (f =
                ((Math.cos((11 * l * this.sparkNumber * Math.PI) / 180) + 1) /
                  2) *
                this.alphaMax);
        0 > f ? (f = 0) : 1 < f && (f = 1);
        c.color[3] = f;
        c.color[0] = this.red;
        c.color[1] = this.green;
        c.color[2] = this.blue;
        this.sizeSmooth
          ? (this.sizeEndX != this.sizeStartX
              ? ((f = Math.log10(0.09 * l + 1)),
                (k = this.sizeEndX - this.sizeStartX),
                (p = this.sizeStartX),
                (a = f * k + p))
              : (a = this.sizeStartX),
            this.sizeEndY != this.sizeStartY
              ? ((h = this.sizeEndY - this.sizeStartY),
                (f = this.sizeStartY),
                (h = Math.log10(0.09 * l + 1) * h + f))
              : (h = this.sizeStartY))
          : (this.sizeEndX != this.sizeStartX
              ? ((k = (this.sizeEndX - this.sizeStartX) / 100),
                (p = this.sizeStartX),
                (a = l * k + p))
              : (a = this.sizeStartX),
            this.sizeEndY != this.sizeStartY
              ? ((h = (this.sizeEndY - this.sizeStartY) / 100),
                (f = this.sizeStartY),
                (h = l * h + f))
              : (h = this.sizeStartY));
        c.size[0] = a;
        c.size[1] = h;
        this.rotate
          ? ((l = ((this.toAngle - this.angle) / 100) * l + this.angle),
            (c.angle = this.rotateWithCamera ? l + m.angle[1] : l))
          : (c.angle = this.rotateWithCamera
              ? this.angle + m.angle[1]
              : this.angle);
        if (this.actRessource && this.spriteRessource) {
          if (
            ((l = this.ownerEntity),
            !l && (l = d.get(this.AID)) && (this.ownerEntity = l),
            l)
          ) {
            l =
              this.actRessource.actions[
                (8 * l.action + ((m.direction + l.direction + 8) % 8)) %
                  this.actRessource.actions.length
              ];
            f = this.sprDelay || l.delay;
            l = this.playSprite
              ? l.animations[
                  Math.floor((g - this.startTick) / f) % l.animations.length
                ]
              : l.animations[0];
            f = l.layers;
            k = 0;
            p = f.length;
            do {
              var r = 0 == k ? c : Object.assign({}, c),
                u = f[k],
                A = new Int16Array(2);
              A[0] = 0;
              A[1] = 0;
              l.pos.length &&
                ((A[0] = this.position[0] - l.pos[0].x),
                (A[1] = this.position[1] - l.pos[0].y));
              r.image.texture = this.spriteRessource.frames[u.index].texture;
              r.image.palette = null;
              r.sprite = this.spriteRessource.frames[u.index];
              r.palette = this.spriteRessource.palette;
              var D = u.index + 0;
              1 !== u.spr_type && 0 !== this.spriteRessource.rgba_index
                ? ((r.image.palette = this.spriteRessource.texture),
                  (r.image.size[0] = this.spriteRessource.frames[D].width),
                  (r.image.size[1] = this.spriteRessource.frames[D].height))
                : 1 === u.spr_type &&
                  (D += this.spriteRessource.old_rgba_index);
              var B = this.spriteRessource.frames[D],
                D = B.width,
                B = B.height,
                D = (u.scale[0] / 100) * D * a,
                B = (u.scale[1] / 100) * B * h;
              u.is_mirror && (D = -D);
              r.color[0] *= u.color[0];
              r.color[1] *= u.color[1];
              r.color[2] *= u.color[2];
              r.color[3] *= u.color[3];
              this.rotateToTarget || (r.angle += u.angle);
              r.offset[0] = u.pos[0] + A[0];
              r.offset[1] = u.pos[1] + A[1];
              r.size[0] = D;
              r.size[1] = B;
              r.render();
              ++k;
            } while (k < p);
          }
        } else c.render();
        this.noLifeTime || (this.needCleanUp = this.endTick < g);
      }
    };
    r.init = function (a) {
      q[1] = a.ZERO;
      q[2] = a.ONE;
      q[3] = a.SRC_COLOR;
      q[4] = a.ONE_MINUS_SRC_COLOR;
      q[5] = a.DST_COLOR;
      q[6] = a.ONE_MINUS_DST_COLOR;
      q[7] = a.SRC_ALPHA;
      q[8] = a.ONE_MINUS_SRC_ALPHA;
      q[9] = a.DST_ALPHA;
      q[10] = a.ONE_MINUS_DST_ALPHA;
      q[11] = a.CONSTANT_COLOR;
      q[12] = a.ONE_MINUS_CONSTANT_COLOR;
      q[13] = a.CONSTANT_ALPHA;
      q[14] = a.ONE_MINUS_CONSTANT_ALPHA;
      q[15] = a.SRC_ALPHA_SATURATE;
      this.ready = !0;
      this.renderBeforeEntities = !1;
    };
    r.free = function (a) {
      this.ready = !1;
    };
    r.beforeRender = function (a, b, d, e, f) {
      a.depthMask(!1);
      e.use = !1;
      c.bind3DContext(a, b, d, e);
      c.shadow = 1;
      c.angle = 0;
      c.size[0] = 100;
      c.size[1] = 100;
      c.offset[0] = 0;
      c.offset[1] = 0;
      c.image.palette = null;
      c.color[0] = 1;
      c.color[1] = 1;
      c.color[2] = 1;
      c.color[3] = 1;
      c.depth = 0;
      c.zIndex = 0;
    };
    r.afterRender = function (a) {
      c.ufog = !0;
      a.depthMask(!0);
      a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
      c.unbind(a);
    };
    return r;
  },
);
