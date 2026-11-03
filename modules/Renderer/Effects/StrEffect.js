define("Renderer/Effects/StrEffect", [
  "Utils/WebGL",
  "Utils/gl-matrix",
  "Core/Client",
], function (a, b, c) {
  function d(a, b, d, e, g) {
    this.filename = a;
    this.startTick = d;
    this.position = b;
    this.posYoffset = e;
    this.noLifeTime = g;
    c.loadFile(
      this.filename,
      null,
      function () {
        this.needCleanUp = !0;
      }.bind(this),
    );
  }
  var e = b.mat4,
    l = {},
    h = null,
    r = null,
    t = new Float32Array(16),
    n = e.create(),
    g = -1;
  d.prototype.init = function (a) {
    this.ready = !0;
  };
  d.prototype.free = function (a) {
    this.ready = !1;
  };
  d.prototype.render = (function () {
    var a = {
      frame: 0,
      type: 0,
      aniframe: 0,
      anitype: 0,
      srcalpha: 1,
      destalpha: 1,
      mtpreset: 0,
      delay: 0,
      angle: 0,
      color: new Float32Array(4),
      pos: new Float32Array(2),
      uv: new Float32Array(8),
      xy: new Float32Array(8),
    };
    return function (b, d) {
      var e, f, g;
      e = c.loadFile(this.filename);
      if (null !== e) {
        g = this.noLifeTime
          ? (((d - this.startTick) / 1e3) * e.fps) % e.maxKey
          : ((d - this.startTick) / 1e3) * e.fps;
        for (f = 0; f < e.layernum; f++)
          if (((d = e.layers[f]), d.materials.length)) {
            var k;
            k = d;
            var h = a,
              n,
              p,
              l,
              t = (l = 0),
              r = -1,
              G = -1;
            p = k.animations;
            for (n = 0; n < k.anikeynum; ++n)
              (p[n].frame <= g &&
                (0 === p[n].type && (r = n), 1 === p[n].type && (G = n)),
                (l = Math.max(l, p[n].frame)),
                0 === p[n].type && (t = Math.max(t, p[n].frame)));
            if (0 > r || (0 > G && l < g)) k = !1;
            else if (
              ((n = p[r]),
              (l = p[G]),
              (p = g - n.frame),
              (h.srcalpha = n.srcalpha),
              (h.destalpha = n.destalpha),
              G !== r + 1 || l.frame !== n.frame)
            )
              l && t <= n.frame
                ? (k = !1)
                : ((h.angle = n.angle),
                  (h.aniframe = n.aniframe),
                  h.color.set(n.color),
                  h.pos.set(n.pos),
                  h.uv.set(n.uv),
                  h.xy.set(n.xy),
                  (k = !0));
            else {
              h.color[0] = n.color[0] + l.color[0] * p;
              h.color[1] = n.color[1] + l.color[1] * p;
              h.color[2] = n.color[2] + l.color[2] * p;
              h.color[3] = n.color[3] + l.color[3] * p;
              h.uv[0] = n.uv[0] + l.uv[0] * p;
              h.uv[1] = n.uv[1] + l.uv[1] * p;
              h.uv[2] = n.uv[2] + l.uv[2] * p;
              h.uv[3] = n.uv[3] + l.uv[3] * p;
              h.uv[4] = n.uv[4] + l.uv[4] * p;
              h.uv[5] = n.uv[5] + l.uv[5] * p;
              h.uv[6] = n.uv[6] + l.uv[6] * p;
              h.uv[7] = n.uv[7] + l.uv[7] * p;
              h.xy[0] = n.xy[0] + l.xy[0] * p;
              h.xy[1] = n.xy[1] + l.xy[1] * p;
              h.xy[2] = n.xy[2] + l.xy[2] * p;
              h.xy[3] = n.xy[3] + l.xy[3] * p;
              h.xy[4] = n.xy[4] + l.xy[4] * p;
              h.xy[5] = n.xy[5] + l.xy[5] * p;
              h.xy[6] = n.xy[6] + l.xy[6] * p;
              h.xy[7] = n.xy[7] + l.xy[7] * p;
              h.angle = n.angle + l.angle * p;
              h.pos[0] = n.pos[0] + l.pos[0] * p;
              h.pos[1] = n.pos[1] + l.pos[1] * p;
              switch (l.anitype) {
                default:
                  h.aniframe = 0;
                  break;
                case 1:
                  h.aniframe = n.aniframe + l.aniframe * p;
                  break;
                case 2:
                  h.aniframe = Math.min(n.aniframe + l.delay * p, k.texcnt - 1);
                  break;
                case 3:
                  h.aniframe = (n.aniframe + l.delay * p) % k.texcnt;
                  break;
                case 4:
                  h.aniframe = (n.aniframe - l.delay * p) % k.texcnt;
              }
              k = !0;
            }
            k &&
              d.materials[a.aniframe | 0] &&
              this.renderAnimation(b, d.materials[a.aniframe | 0], a);
          }
        g >= e.maxKey && (this.needCleanUp = !0);
      }
    };
  })();
  d.prototype.renderAnimation = function (a, b, c) {
    var d = h.uniform,
      f = h.attribute;
    t[0] = c.xy[0];
    t[1] = c.xy[4];
    t[2] = 0;
    t[3] = 0;
    t[4] = c.xy[1];
    t[5] = c.xy[5];
    t[6] = 1;
    t[7] = 0;
    t[8] = c.xy[3];
    t[9] = c.xy[7];
    t[10] = 0;
    t[11] = 1;
    t[12] = c.xy[2];
    t[13] = c.xy[6];
    t[14] = 1;
    t[15] = 1;
    c.angle !== g &&
      (e.identity(n),
      e.rotateZ(n, n, (-c.angle / 180) * Math.PI),
      (g = c.angle));
    c.pos[0] -= 320;
    c.pos[1] -= 320 + (this.posYoffset ? this.posYoffset : 0);
    a.uniform4fv(d.uSpriteColor, c.color);
    a.uniform2fv(d.uSpriteOffset, c.pos);
    a.uniform3fv(d.uSpritePosition, this.position);
    a.uniformMatrix4fv(d.uSpriteAngle, !1, n);
    a.bindBuffer(a.ARRAY_BUFFER, r);
    a.vertexAttribPointer(f.aPosition, 2, a.FLOAT, !1, 16, 0);
    a.vertexAttribPointer(f.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    a.bufferData(a.ARRAY_BUFFER, t, a.STREAM_DRAW);
    a.blendFunc(l[c.srcalpha], l[c.destalpha]);
    a.bindTexture(a.TEXTURE_2D, b);
    a.drawArrays(a.TRIANGLE_STRIP, 0, 4);
  };
  d.init = function (b) {
    r || (r = b.createBuffer());
    h ||
      (h = a.createShaderProgram(
        b,
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tuniform mat4 uSpriteAngle;\n\t\tuniform vec3 uSpritePosition;\n\t\tuniform vec2 uSpriteOffset;\n\n\t\tconst float pixelRatio \x3d 1.0 / 35.0;\n\n\t\tmat4 Project( mat4 mat, vec3 pos) {\n\n\t\t\t// xyz \x3d x(-z)y + middle of cell (0.5)\n\t\t\tfloat x \x3d  pos.x + 0.5;\n\t\t\tfloat y \x3d -pos.z;\n\t\t\tfloat z \x3d  pos.y + 0.5;\n\n\t\t\t// Matrix translation\n\t\t\tmat[3].x +\x3d mat[0].x * x + mat[1].x * y + mat[2].x * z;\n\t\t\tmat[3].y +\x3d mat[0].y * x + mat[1].y * y + mat[2].y * z;\n\t\t\tmat[3].z +\x3d mat[0].z * x + mat[1].z * y + mat[2].z * z;\n\t\t\tmat[3].w +\x3d mat[0].w * x + mat[1].w * y + mat[2].w * z;\n\n\t\t\t// Spherical billboard\n\t\t\tmat[0].xyz \x3d vec3( 1.0, 0.0, 0.0 );\n\t\t\tmat[1].xyz \x3d vec3( 0.0, 1.0, 0.0 );\n\t\t\tmat[2].xyz \x3d vec3( 0.0, 0.0, 1.0 );\n\n\t\t\treturn mat;\n\t\t}\n\n\t\tvoid main(void) {\n\t\t\tvTextureCoord \x3d aTextureCoord;\n\n\t\t\t// Calculate position base on angle and sprite offset/size\n\t\t\tvec4 position \x3d uSpriteAngle * vec4( aPosition.x * pixelRatio, -aPosition.y * pixelRatio, 0.0, 1.0 );\n\t\t\tposition.x   +\x3d uSpriteOffset.x * pixelRatio;\n\t\t\tposition.y   -\x3d uSpriteOffset.y * pixelRatio;\n\n\t\t\t// Project to camera plane\n\t\t\tgl_Position    \x3d uProjectionMat * Project(uModelViewMat, uSpritePosition) * position;\n\t\t\tgl_Position.z -\x3d 1.0;\n\t\t}\n\t",
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform vec4 uSpriteColor;\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\tgl_FragColor \x3d texture2D( uDiffuse, vTextureCoord.st ) * uSpriteColor;\n\t\t\tif ( gl_FragColor.a \x3d\x3d 0.0 || (gl_FragColor.r \x3d\x3d 0.0 \x26\x26 gl_FragColor.g \x3d\x3d 0.0 \x26\x26 gl_FragColor.b \x3d\x3d 0.0) ) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tif ( uFogUse ) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      ));
    l[1] = b.ZERO;
    l[2] = b.ONE;
    l[3] = b.SRC_COLOR;
    l[4] = b.ONE_MINUS_SRC_COLOR;
    l[5] = b.SRC_ALPHA;
    l[6] = b.ONE_MINUS_SRC_ALPHA;
    l[7] = b.DST_ALPHA;
    l[8] = b.ONE_MINUS_DST_ALPHA;
    l[9] = b.DST_COLOR;
    l[10] = b.ONE_MINUS_DST_COLOR;
    l[11] = b.SRC_ALPHA_SATURATE;
    l[14] = b.CONSTANT_COLOR;
    l[15] = b.ONE_MINUS_CONSTANT_ALPHA;
    this.ready = !0;
  };
  d.free = function (a) {
    h && (a.deleteProgram(h), (h = null));
    r && (a.deleteBuffer(r), (r = null));
    this.ready = !1;
  };
  d.beforeRender = function (a, b, c, d, e) {
    e = h.uniform;
    var f = h.attribute;
    a.depthMask(!1);
    a.useProgram(h);
    a.uniformMatrix4fv(e.uModelViewMat, !1, b);
    a.uniformMatrix4fv(e.uProjectionMat, !1, c);
    a.uniform1f(e.uFogNear, 100 * d.near);
    a.uniform1f(e.uFogFar, 150 * d.far);
    a.uniform3fv(e.uFogColor, d.color);
    a.uniform1i(e.uDiffuse, 0);
    a.enableVertexAttribArray(f.aPosition);
    a.enableVertexAttribArray(f.aTextureCoord);
    a.activeTexture(a.TEXTURE0);
  };
  d.afterRender = function (a) {
    a.depthMask(!0);
    a.disableVertexAttribArray(h.attribute.aPosition);
    a.disableVertexAttribArray(h.attribute.aTextureCoord);
    a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
  };
  return d;
});
