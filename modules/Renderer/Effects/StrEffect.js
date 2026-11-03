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
    m = {},
    h = null,
    t = null,
    r = new Float32Array(16),
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
            var l;
            l = d;
            var h = a,
              p,
              n,
              m,
              r = (m = 0),
              t = -1,
              H = -1;
            n = l.animations;
            for (p = 0; p < l.anikeynum; ++p)
              (n[p].frame <= g &&
                (0 === n[p].type && (t = p), 1 === n[p].type && (H = p)),
                (m = Math.max(m, n[p].frame)),
                0 === n[p].type && (r = Math.max(r, n[p].frame)));
            if (0 > t || (0 > H && m < g)) l = !1;
            else if (
              ((p = n[t]),
              (m = n[H]),
              (n = g - p.frame),
              (h.srcalpha = p.srcalpha),
              (h.destalpha = p.destalpha),
              H !== t + 1 || m.frame !== p.frame)
            )
              m && r <= p.frame
                ? (l = !1)
                : ((h.angle = p.angle),
                  (h.aniframe = p.aniframe),
                  h.color.set(p.color),
                  h.pos.set(p.pos),
                  h.uv.set(p.uv),
                  h.xy.set(p.xy),
                  (l = !0));
            else {
              h.color[0] = p.color[0] + m.color[0] * n;
              h.color[1] = p.color[1] + m.color[1] * n;
              h.color[2] = p.color[2] + m.color[2] * n;
              h.color[3] = p.color[3] + m.color[3] * n;
              h.uv[0] = p.uv[0] + m.uv[0] * n;
              h.uv[1] = p.uv[1] + m.uv[1] * n;
              h.uv[2] = p.uv[2] + m.uv[2] * n;
              h.uv[3] = p.uv[3] + m.uv[3] * n;
              h.uv[4] = p.uv[4] + m.uv[4] * n;
              h.uv[5] = p.uv[5] + m.uv[5] * n;
              h.uv[6] = p.uv[6] + m.uv[6] * n;
              h.uv[7] = p.uv[7] + m.uv[7] * n;
              h.xy[0] = p.xy[0] + m.xy[0] * n;
              h.xy[1] = p.xy[1] + m.xy[1] * n;
              h.xy[2] = p.xy[2] + m.xy[2] * n;
              h.xy[3] = p.xy[3] + m.xy[3] * n;
              h.xy[4] = p.xy[4] + m.xy[4] * n;
              h.xy[5] = p.xy[5] + m.xy[5] * n;
              h.xy[6] = p.xy[6] + m.xy[6] * n;
              h.xy[7] = p.xy[7] + m.xy[7] * n;
              h.angle = p.angle + m.angle * n;
              h.pos[0] = p.pos[0] + m.pos[0] * n;
              h.pos[1] = p.pos[1] + m.pos[1] * n;
              switch (m.anitype) {
                default:
                  h.aniframe = 0;
                  break;
                case 1:
                  h.aniframe = p.aniframe + m.aniframe * n;
                  break;
                case 2:
                  h.aniframe = Math.min(p.aniframe + m.delay * n, l.texcnt - 1);
                  break;
                case 3:
                  h.aniframe = (p.aniframe + m.delay * n) % l.texcnt;
                  break;
                case 4:
                  h.aniframe = (p.aniframe - m.delay * n) % l.texcnt;
              }
              l = !0;
            }
            l &&
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
    r[0] = c.xy[0];
    r[1] = c.xy[4];
    r[2] = 0;
    r[3] = 0;
    r[4] = c.xy[1];
    r[5] = c.xy[5];
    r[6] = 1;
    r[7] = 0;
    r[8] = c.xy[3];
    r[9] = c.xy[7];
    r[10] = 0;
    r[11] = 1;
    r[12] = c.xy[2];
    r[13] = c.xy[6];
    r[14] = 1;
    r[15] = 1;
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
    a.bindBuffer(a.ARRAY_BUFFER, t);
    a.vertexAttribPointer(f.aPosition, 2, a.FLOAT, !1, 16, 0);
    a.vertexAttribPointer(f.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    a.bufferData(a.ARRAY_BUFFER, r, a.STREAM_DRAW);
    a.blendFunc(m[c.srcalpha], m[c.destalpha]);
    a.bindTexture(a.TEXTURE_2D, b);
    a.drawArrays(a.TRIANGLE_STRIP, 0, 4);
  };
  d.init = function (b) {
    t || (t = b.createBuffer());
    h ||
      (h = a.createShaderProgram(
        b,
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tuniform mat4 uSpriteAngle;\n\t\tuniform vec3 uSpritePosition;\n\t\tuniform vec2 uSpriteOffset;\n\n\t\tconst float pixelRatio \x3d 1.0 / 35.0;\n\n\t\tmat4 Project( mat4 mat, vec3 pos) {\n\n\t\t\t// xyz \x3d x(-z)y + middle of cell (0.5)\n\t\t\tfloat x \x3d  pos.x + 0.5;\n\t\t\tfloat y \x3d -pos.z;\n\t\t\tfloat z \x3d  pos.y + 0.5;\n\n\t\t\t// Matrix translation\n\t\t\tmat[3].x +\x3d mat[0].x * x + mat[1].x * y + mat[2].x * z;\n\t\t\tmat[3].y +\x3d mat[0].y * x + mat[1].y * y + mat[2].y * z;\n\t\t\tmat[3].z +\x3d mat[0].z * x + mat[1].z * y + mat[2].z * z;\n\t\t\tmat[3].w +\x3d mat[0].w * x + mat[1].w * y + mat[2].w * z;\n\n\t\t\t// Spherical billboard\n\t\t\tmat[0].xyz \x3d vec3( 1.0, 0.0, 0.0 );\n\t\t\tmat[1].xyz \x3d vec3( 0.0, 1.0, 0.0 );\n\t\t\tmat[2].xyz \x3d vec3( 0.0, 0.0, 1.0 );\n\n\t\t\treturn mat;\n\t\t}\n\n\t\tvoid main(void) {\n\t\t\tvTextureCoord \x3d aTextureCoord;\n\n\t\t\t// Calculate position base on angle and sprite offset/size\n\t\t\tvec4 position \x3d uSpriteAngle * vec4( aPosition.x * pixelRatio, -aPosition.y * pixelRatio, 0.0, 1.0 );\n\t\t\tposition.x   +\x3d uSpriteOffset.x * pixelRatio;\n\t\t\tposition.y   -\x3d uSpriteOffset.y * pixelRatio;\n\n\t\t\t// Project to camera plane\n\t\t\tgl_Position    \x3d uProjectionMat * Project(uModelViewMat, uSpritePosition) * position;\n\t\t\tgl_Position.z -\x3d 1.0;\n\t\t}\n\t",
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform vec4 uSpriteColor;\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\tgl_FragColor \x3d texture2D( uDiffuse, vTextureCoord.st ) * uSpriteColor;\n\t\t\tif ( gl_FragColor.a \x3d\x3d 0.0 || (gl_FragColor.r \x3d\x3d 0.0 \x26\x26 gl_FragColor.g \x3d\x3d 0.0 \x26\x26 gl_FragColor.b \x3d\x3d 0.0) ) {\n\t\t\t\tdiscard;\n\t\t\t}\n\n\t\t\tif ( uFogUse ) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      ));
    m[1] = b.ZERO;
    m[2] = b.ONE;
    m[3] = b.SRC_COLOR;
    m[4] = b.ONE_MINUS_SRC_COLOR;
    m[5] = b.SRC_ALPHA;
    m[6] = b.ONE_MINUS_SRC_ALPHA;
    m[7] = b.DST_ALPHA;
    m[8] = b.ONE_MINUS_DST_ALPHA;
    m[9] = b.DST_COLOR;
    m[10] = b.ONE_MINUS_DST_COLOR;
    m[11] = b.SRC_ALPHA_SATURATE;
    m[14] = b.CONSTANT_COLOR;
    m[15] = b.ONE_MINUS_CONSTANT_ALPHA;
    this.ready = !0;
  };
  d.free = function (a) {
    h && (a.deleteProgram(h), (h = null));
    t && (a.deleteBuffer(t), (t = null));
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
