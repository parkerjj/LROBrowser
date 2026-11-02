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
    q = null,
    r = new Float32Array(16),
    k = e.create(),
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
            var k = a,
              h,
              m,
              u,
              r = (u = 0),
              q = -1,
              F = -1;
            m = l.animations;
            for (h = 0; h < l.anikeynum; ++h)
              (m[h].frame <= g &&
                (0 === m[h].type && (q = h), 1 === m[h].type && (F = h)),
                (u = Math.max(u, m[h].frame)),
                0 === m[h].type && (r = Math.max(r, m[h].frame)));
            if (0 > q || (0 > F && u < g)) l = !1;
            else if (
              ((h = m[q]),
              (u = m[F]),
              (m = g - h.frame),
              (k.srcalpha = h.srcalpha),
              (k.destalpha = h.destalpha),
              F !== q + 1 || u.frame !== h.frame)
            )
              u && r <= h.frame
                ? (l = !1)
                : ((k.angle = h.angle),
                  (k.aniframe = h.aniframe),
                  k.color.set(h.color),
                  k.pos.set(h.pos),
                  k.uv.set(h.uv),
                  k.xy.set(h.xy),
                  (l = !0));
            else {
              k.color[0] = h.color[0] + u.color[0] * m;
              k.color[1] = h.color[1] + u.color[1] * m;
              k.color[2] = h.color[2] + u.color[2] * m;
              k.color[3] = h.color[3] + u.color[3] * m;
              k.uv[0] = h.uv[0] + u.uv[0] * m;
              k.uv[1] = h.uv[1] + u.uv[1] * m;
              k.uv[2] = h.uv[2] + u.uv[2] * m;
              k.uv[3] = h.uv[3] + u.uv[3] * m;
              k.uv[4] = h.uv[4] + u.uv[4] * m;
              k.uv[5] = h.uv[5] + u.uv[5] * m;
              k.uv[6] = h.uv[6] + u.uv[6] * m;
              k.uv[7] = h.uv[7] + u.uv[7] * m;
              k.xy[0] = h.xy[0] + u.xy[0] * m;
              k.xy[1] = h.xy[1] + u.xy[1] * m;
              k.xy[2] = h.xy[2] + u.xy[2] * m;
              k.xy[3] = h.xy[3] + u.xy[3] * m;
              k.xy[4] = h.xy[4] + u.xy[4] * m;
              k.xy[5] = h.xy[5] + u.xy[5] * m;
              k.xy[6] = h.xy[6] + u.xy[6] * m;
              k.xy[7] = h.xy[7] + u.xy[7] * m;
              k.angle = h.angle + u.angle * m;
              k.pos[0] = h.pos[0] + u.pos[0] * m;
              k.pos[1] = h.pos[1] + u.pos[1] * m;
              switch (u.anitype) {
                default:
                  k.aniframe = 0;
                  break;
                case 1:
                  k.aniframe = h.aniframe + u.aniframe * m;
                  break;
                case 2:
                  k.aniframe = Math.min(h.aniframe + u.delay * m, l.texcnt - 1);
                  break;
                case 3:
                  k.aniframe = (h.aniframe + u.delay * m) % l.texcnt;
                  break;
                case 4:
                  k.aniframe = (h.aniframe - u.delay * m) % l.texcnt;
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
      (e.identity(k),
      e.rotateZ(k, k, (-c.angle / 180) * Math.PI),
      (g = c.angle));
    c.pos[0] -= 320;
    c.pos[1] -= 320 + (this.posYoffset ? this.posYoffset : 0);
    a.uniform4fv(d.uSpriteColor, c.color);
    a.uniform2fv(d.uSpriteOffset, c.pos);
    a.uniform3fv(d.uSpritePosition, this.position);
    a.uniformMatrix4fv(d.uSpriteAngle, !1, k);
    a.bindBuffer(a.ARRAY_BUFFER, q);
    a.vertexAttribPointer(f.aPosition, 2, a.FLOAT, !1, 16, 0);
    a.vertexAttribPointer(f.aTextureCoord, 2, a.FLOAT, !1, 16, 8);
    a.bufferData(a.ARRAY_BUFFER, r, a.STREAM_DRAW);
    a.blendFunc(m[c.srcalpha], m[c.destalpha]);
    a.bindTexture(a.TEXTURE_2D, b);
    a.drawArrays(a.TRIANGLE_STRIP, 0, 4);
  };
  d.init = function (b) {
    q || (q = b.createBuffer());
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
    q && (a.deleteBuffer(q), (q = null));
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
