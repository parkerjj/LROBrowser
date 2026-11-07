define("Renderer/Map/GridSelector", [
  "Renderer/Map/Altitude",
  "Core/Client",
  "Utils/WebGL",
  "Utils/Texture",
], function (a, b, c, d) {
  var e = null,
    m = null,
    h = null,
    r = null,
    q = new Float32Array([
      0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1,
    ]);
  return {
    init: function (a) {
      b.loadFile("data/texture/grid.tga", function (b) {
        d.load(b, function (b) {
          if (b) {
            b = document.createElement("canvas");
            var d = b.getContext("2d");
            b.width = c.toPowerOfTwo(this.width);
            b.height = c.toPowerOfTwo(this.height);
            d.globalAlpha = 0.6;
            d.drawImage(this, 0, 0, b.width, b.height);
            d.fillStyle = "rgb( 50, 240, 160)";
            d.globalCompositeOperation = "source-atop";
            d.fillRect(0, 0, b.width, b.height);
            h = a.createTexture();
            a.bindTexture(a.TEXTURE_2D, h);
            a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, b);
            a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
            a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
          }
        });
      });
      m = a.createBuffer();
      e = c.createShaderProgram(
        a,
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : vert\n\t\tprecision highp float;\n\n\t\tattribute vec3 aPosition;\n\t\tattribute vec2 aTextCoord;\n\n\t\tvarying vec2 vTextureCoord;\n\n\t\tuniform mat4 uModelViewMat;\n\t\tuniform mat4 uProjectionMat;\n\n\t\tvoid main(void) {\n\t\t\tvec3 position \x3d aPosition;\n\t\t\tposition.y    -\x3d 0.1;\n\t\t\t\n\t\t\tgl_Position    \x3d uProjectionMat * uModelViewMat * vec4( position.xyz, 1.0) ;\n\t\t\tvTextureCoord  \x3d aTextCoord;\n\t\t}\n\t",
        "\n\t\t#version 100\n\t\t#pragma vscode_glsllint_stage : frag\n\t\tprecision highp float;\n\n\t\tvarying vec2 vTextureCoord;\n\t\tuniform sampler2D uDiffuse;\n\n\t\tuniform bool  uFogUse;\n\t\tuniform float uFogNear;\n\t\tuniform float uFogFar;\n\t\tuniform vec3  uFogColor;\n\n\t\tvoid main(void) {\n\t\t\t\n\t\t\tvec4 texture \x3d texture2D( uDiffuse, vTextureCoord.st);\n\t\t\t\n\t\t\tif (texture.a \x3d\x3d 0.0) {\n\t\t\t\tdiscard;\n\t\t\t}\n\t\t\t\n\t\t\tgl_FragColor \x3d texture;\n\n\t\t\tif (uFogUse) {\n\t\t\t\tfloat depth     \x3d gl_FragCoord.z / gl_FragCoord.w;\n\t\t\t\tfloat fogFactor \x3d smoothstep( uFogNear, uFogFar, depth );\n\t\t\t\tgl_FragColor    \x3d mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );\n\t\t\t}\n\t\t}\n\t",
      );
      a.bindBuffer(a.ARRAY_BUFFER, m);
    },
    free: function (a) {
      m && (a.deleteBuffer(m), (m = null));
      h && (a.deleteTexture(h), (h = null));
      e && (a.deleteProgram(e), (e = null));
    },
    render: function (b, c, d, l, f, n) {
      if (h) {
        var g = e.uniform,
          k = e.attribute;
        b.useProgram(e);
        b.uniformMatrix4fv(g.uModelViewMat, !1, c);
        b.uniformMatrix4fv(g.uProjectionMat, !1, d);
        b.uniform1i(g.uFogUse, l.use && l.exist);
        b.uniform1f(g.uFogNear, l.near);
        b.uniform1f(g.uFogFar, l.far);
        b.uniform3fv(g.uFogColor, l.color);
        b.enableVertexAttribArray(k.aPosition);
        b.enableVertexAttribArray(k.aTextCoord);
        b.bindBuffer(b.ARRAY_BUFFER, m);
        b.vertexAttribPointer(k.aPosition, 3, b.FLOAT, !1, 20, 0);
        b.vertexAttribPointer(k.aTextCoord, 2, b.FLOAT, !1, 20, 12);
        b.activeTexture(b.TEXTURE0);
        b.uniform1i(g.uDiffuse, 0);
        r !== f + "" + n &&
          ((r = f + "" + n),
          (c = a.getCell(f, n)),
          (q[0] = q[10] = f + 0),
          (q[2] = q[7] = n + 0),
          (q[5] = q[15] = f + 1),
          (q[12] = q[17] = n + 1),
          (q[1] = c[0]),
          (q[6] = c[1]),
          (q[11] = c[2]),
          (q[16] = c[3]),
          b.bufferData(b.ARRAY_BUFFER, q, b.STREAM_DRAW));
        b.bindTexture(b.TEXTURE_2D, h);
        b.drawArrays(b.TRIANGLE_STRIP, 0, 4);
        b.disableVertexAttribArray(k.aPosition);
        b.disableVertexAttribArray(k.aTextCoord);
      }
    },
  };
});
