export async function webglBench() {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 600;
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2');
  if (!gl) return { webgl2: false, fpsAvg: 0 };
  const vs = `#version 300 es
in vec2 p; uniform float t; void main(){ gl_Position = vec4(p + vec2(sin(t+float(gl_InstanceID)),cos(t*0.7+float(gl_InstanceID)))*0.8, 0, 1); gl_PointSize = 8.0; }`;
  const fs = `#version 300 es
precision mediump float; out vec4 o; void main(){ o = vec4(0.2,0.6,1.0,0.5); }`;
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-.1,-.1, .1,-.1, 0,.1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const tLoc = gl.getUniformLocation(prog, 't');
  return new Promise((resolve) => {
    const start = performance.now(); let frames = 0;
    const tick = (now) => {
      gl.uniform1f(tLoc, now / 1000);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 2000);
      frames++;
      if (now - start < 5000) requestAnimationFrame(tick);
      else { canvas.remove(); resolve({ webgl2: true, fpsAvg: Math.round(frames / ((now - start) / 1000)) }); }
    };
    requestAnimationFrame(tick);
  });
}
