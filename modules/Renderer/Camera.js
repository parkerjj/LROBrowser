define(
  "Renderer/Camera",
  "require DB/DBManager Controls/KeyEventHandler Controls/MouseEventHandler Core/Events Core/Configs Preferences/Camera Utils/gl-matrix".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("Controls/KeyEventHandler"),
      d = a("Controls/MouseEventHandler"),
      e = a("Core/Events"),
      m = a("Core/Configs"),
      h = a("Preferences/Camera"),
      r = a("Utils/gl-matrix"),
      q = r.mat4,
      k = r.mat3,
      g = r.vec2,
      r = r.vec3,
      t = r.create(),
      l = {};
    l.projection = q.create();
    l.modelView = q.create();
    l.normalMat = k.create();
    l.zoom = h.zoom;
    l.zoomFinal = h.zoom;
    l.angle = g.create();
    l.angleFinal = g.create();
    l.position = r.create();
    l.target = null;
    l.lastTick = 0;
    l.MAX_ZOOM = 15;
    l.quakes = [];
    l.direction = 0;
    l.altitudeFrom = -70;
    l.altitudeTo = -80;
    l.rotationFrom = -360;
    l.rotationTo = 360;
    l.range = 220;
    l.zoomFrom = 190;
    l.zoomTo = 270;
    l.currentMap = "";
    l.MAX_ZOOM_INDOOR = 8;
    l.inRotationFrom = -60;
    l.inRotationTo = -25;
    l.inRange = 240;
    l.inZoomFrom = 220;
    l.inZoomTo = 240;
    l.TOUCHTYPE = { NOTHING: 0, ZOOM: 1, ROTATE: 2, INCLINE: 3 };
    l.action = {
      active: !1,
      touchType: l.TOUCHTYPE.NOTHING,
      tick: 0,
      x: 0,
      y: 0,
    };
    l.setTarget = function (a) {
      this.target = a;
    };
    l.getLatitude = function () {
      return this.angle[0] - 180;
    };
    l.init = function () {
      this.lastTick = Date.now();
      this.angle[0] = 220;
      this.angle[1] = this.rotationFrom % 360;
      this.angleFinal[0] = this.range % 360;
      this.angleFinal[1] = this.rotationFrom % 360;
      this.position[0] = -this.target.position[0];
      this.position[1] = -this.target.position[1];
      this.position[2] = this.target.position[2];
      this.currentMap = a("Renderer/MapRenderer").currentMap;
      b.isIndoor(this.currentMap)
        ? (l.setZoom(1), (l.angleFinal[0] = 230), (l.angleFinal[1] = -40))
        : ((l.zoomFinal = h.zoom),
          (l.angleFinal[0] = h.height),
          (l.angleFinal[1] = h.rotation));
    };
    l.save = (function () {
      function a() {
        b.isIndoor(l.currentMap) ||
          ((c = !1), (h.zoom = l.zoomFinal), h.save());
      }
      var c = !1;
      return function () {
        c || (e.setTimeout(a, 3e3), (c = !0));
      };
    })();
    l.rotate = function (a) {
      var f = this.action,
        e = Date.now();
      a
        ? (f.tick + 500 > e &&
            10 > Math.abs(f.x - d.screen.x) &&
            10 > Math.abs(f.y - d.screen.y) &&
            (c.SHIFT &&
              (b.isIndoor(this.currentMap)
                ? (this.angleFinal[0] = +this.inRange)
                : (this.angleFinal[0] = +this.range)),
            c.CTRL
              ? (this.zoomFinal = 100)
              : b.isIndoor(this.currentMap)
                ? (this.angleFinal[1] = this.inRotationTo)
                : (this.angleFinal[1] = 0)),
          (f.x = d.screen.x),
          (f.y = d.screen.y),
          (f.tick = e),
          (f.active = !0))
        : (f.active = !1);
    };
    l.processMouseAction = function () {
      c.SHIFT
        ? ((this.angleFinal[0] +=
            ((d.screen.y - this.action.y) / d.screen.height) * 300),
          b.isIndoor(this.currentMap)
            ? ((this.angleFinal[0] = Math.max(
                this.angleFinal[0],
                this.inZoomFrom,
              )),
              (this.angleFinal[0] = Math.min(
                this.angleFinal[0],
                this.inZoomTo,
              )))
            : ((this.angleFinal[0] = Math.max(
                this.angleFinal[0],
                this.zoomFrom,
              )),
              (this.angleFinal[0] = Math.min(this.angleFinal[0], this.zoomTo))))
        : c.CTRL
          ? ((this.zoomFinal -=
              ((d.screen.y - this.action.y) / d.screen.height) * 150),
            b.isIndoor(this.currentMap)
              ? (this.zoomFinal = Math.min(
                  this.zoomFinal,
                  Math.abs(this.altitudeTo - this.altitudeFrom) *
                    this.MAX_ZOOM_INDOOR *
                    (m.get("mobile") ? 1.45 : 1),
                ))
              : (this.zoomFinal = Math.min(
                  this.zoomFinal,
                  Math.abs(this.altitudeTo - this.altitudeFrom) *
                    this.MAX_ZOOM *
                    (m.get("mobile") ? 1.45 : 1),
                )),
            (this.zoomFinal = Math.trunc(Math.max(this.zoomFinal, 10))))
          : ((this.angleFinal[1] -=
              ((d.screen.x - this.action.x) / d.screen.width) * 720),
            180 < this.angle[1] && 180 < this.angleFinal[1]
              ? ((this.angle[1] -= 360), (this.angleFinal[1] -= 360))
              : -180 > this.angle[1] &&
                -180 > this.angleFinal[1] &&
                ((this.angle[1] += 360), (this.angleFinal[1] += 360)),
            b.isIndoor(this.currentMap)
              ? ((this.angleFinal[1] = Math.max(
                  this.angleFinal[1],
                  this.inRotationFrom,
                )),
                (this.angleFinal[1] = Math.min(
                  this.angleFinal[1],
                  this.inRotationTo,
                )))
              : ((this.angleFinal[1] = Math.max(
                  this.angleFinal[1],
                  this.rotationFrom,
                )),
                (this.angleFinal[1] = Math.min(
                  this.angleFinal[1],
                  this.rotationTo,
                ))));
      this.action.x = +d.screen.x;
      this.action.y = +d.screen.y;
      this.save();
    };
    l.setZoom = function (a) {
      this.zoomFinal += 15 * a;
      b.isIndoor(this.currentMap)
        ? (this.zoomFinal = Math.min(
            this.zoomFinal,
            Math.abs(this.altitudeTo - this.altitudeFrom) *
              this.MAX_ZOOM_INDOOR *
              (m.get("mobile") ? 1.45 : 1),
          ))
        : (this.zoomFinal = Math.min(
            this.zoomFinal,
            Math.abs(this.altitudeTo - this.altitudeFrom) *
              this.MAX_ZOOM *
              (m.get("mobile") ? 1.45 : 1),
          ));
      this.zoomFinal = Math.trunc(Math.max(this.zoomFinal, 10));
      this.save();
    };
    l.setQuake = function (a, b, c, d, e) {
      var f = {};
      f.startTick = a;
      f.duration = b || 650;
      f.sideQuake = c || 1;
      f.latitudeQuake = d || 0.2;
      f.zoomQuake = e || 0.24;
      f.active = !0;
      this.quakes.push(f);
    };
    l.processQuake = function (a) {
      for (var b = 0; b < this.quakes.length; b++)
        this.quakes[b].active
          ? this.quakes[b].startTick <= a &&
            (this.quakes[b].startTick + this.quakes[b].duration > a
              ? ((this.position[0] +=
                  ((5 * Math.random() - 2.5) / 10 + this.quakes[b].sideQuake) *
                  Math.cos((Math.PI / 180) * this.angle[1]) *
                  0.1),
                (this.position[1] +=
                  ((5 * Math.random() - 2.5) / 10 + this.quakes[b].sideQuake) *
                  -Math.sin((Math.PI / 180) * this.angle[1]) *
                  0.1),
                (this.quakes[b].sideQuake *= -1),
                (this.zoom +=
                  0.1 *
                  ((5 * Math.random() - 2.5) / 10 + this.quakes[b].zoomQuake)),
                (this.quakes[b].zoomQuake *= -1),
                (this.angle[0] +=
                  0.1 *
                  ((5 * Math.random() - 2.5) / 15 +
                    this.quakes[b].latitudeQuake)),
                (this.quakes[b].latitudeQuake *= -1))
              : (this.quakes[b].active = !1))
          : this.quakes.splice(b, 1);
    };
    l.update = function (a) {
      var b = Math.min(0.006 * (a - this.lastTick), 1);
      this.lastTick = a;
      -1 !== this.action.x &&
        -1 !== this.action.y &&
        this.action.active &&
        this.processMouseAction();
      this.processQuake(a);
      h.smooth
        ? ((this.position[0] +=
            (-this.target.position[0] - this.position[0]) * b),
          (this.position[1] +=
            (-this.target.position[1] - this.position[1]) * b),
          (this.position[2] +=
            (this.target.position[2] - this.position[2]) * b))
        : ((this.position[0] = -this.target.position[0]),
          (this.position[1] = -this.target.position[1]),
          (this.position[2] = this.target.position[2]));
      this.zoom += (this.zoomFinal - this.zoom) * b * 1.2;
      this.angle[0] += (this.angleFinal[0] - this.angle[0]) * b * 1.2;
      this.angle[1] += (this.angleFinal[1] - this.angle[1]) * b * 1.2;
      this.angle[0] %= 360;
      this.angle[1] %= 360;
      this.direction = Math.floor((this.angle[1] + 22.5) / 45) % 8;
      a = this.modelView;
      q.identity(a);
      q.translateZ(a, (this.altitudeFrom - this.zoom) / 2);
      q.rotateX(a, a, (this.angle[0] / 180) * Math.PI);
      q.rotateY(a, a, (this.angle[1] / 180) * Math.PI);
      t[0] = this.position[0] - 0.5;
      t[1] = this.position[2];
      t[2] = this.position[1] - 0.5;
      q.translate(a, a, t);
      q.toInverseMat3(a, this.normalMat);
      k.transpose(this.normalMat, this.normalMat);
    };
    return l;
  },
);
