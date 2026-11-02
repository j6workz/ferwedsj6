// Lake ripple drawn with WebGL on the GPU. Replaces the SVG displacement filter (.opening .water),
// which WebKit repaints on the CPU every frame. Same picture and cover-fit as `.opening .slide`
// (assets/bg-cover.webp, center 30% / cover); only the water band of the picture is drawn.
// No WebGL → nothing changes: Chrome keeps the SVG ripple, WebKit keeps a still lake.
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const opening = document.querySelector('.opening'), scene = opening && opening.querySelector('.scene');
  if (!scene) return;

  const IMG_W = 1024, IMG_H = 1536, WATER = [0.37, 0.578];   // keep in sync with app.js
  const canvas = document.createElement('canvas');
  canvas.className = 'water-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return;

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = [
    'precision mediump float;',
    'uniform sampler2D tex;',
    'uniform vec2 size;',      // canvas size, CSS px
    'uniform float top;',      // canvas top inside .opening, CSS px
    'uniform vec4 img;',       // picture origin (xy) and size (zw) inside .opening, CSS px
    'uniform float dpr, t;',
    'void main(){',
    '  vec2 c = gl_FragCoord.xy / dpr;',
    '  vec2 q = vec2(c.x, size.y - c.y + top);',                       // CSS px inside .opening, y down
    '  float k = mix(0.65, 1.35, clamp((q.y - top) / size.y, 0., 1.));',  // nearer water: bigger, slower waves
    '  float y = q.y / k, x = q.x / k;',
    '  float a = sin(y*0.55 + t*1.6 + 2.0*sin(x*0.018 + t*0.35));',
    '  float b = sin(y*0.31 - t*1.1 + x*0.011 + 1.7*sin(x*0.007 - t*0.2));',
    '  float d = sin(y*0.83 + t*2.3 - x*0.013);',
    '  vec2 off = vec2(a*0.55 + b*0.45, (b + d) * 0.3) * 4.5 * k;',
    '  vec3 col = texture2D(tex, (q + off - img.xy) / img.zw).rgb;',
    '  col += 0.035 * max(0., a*d);',                                    // faint glints on the crests
    '  gl_FragColor = vec4(col, 1.);',
    '}'
  ].join('\n');
  function sh(type, src){ const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['size', 'top', 'img', 'dpr', 't'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  let dpr = 1, ready = false, running = false, raf = 0;
  function layout(){
    const w = opening.clientWidth, h = opening.clientHeight;
    const s = Math.max(w / IMG_W, h / IMG_H), iw = IMG_W * s, ih = IMG_H * s;
    const ox = (w - iw) * 0.5, oy = (h - ih) * 0.30;
    const top = Math.floor(oy + WATER[0] * ih), bot = Math.ceil(oy + WATER[1] * ih), bh = Math.max(1, bot - top);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.top = top + 'px'; canvas.style.height = bh + 'px';
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(bh * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.size, w, bh); gl.uniform1f(U.top, top); gl.uniform4f(U.img, ox, oy, iw, ih); gl.uniform1f(U.dpr, dpr);
  }
  function draw(now){
    gl.uniform1f(U.t, (now / 1000) % 3600);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = running ? requestAnimationFrame(draw) : 0;
  }
  function setRunning(on){
    running = on && ready && !document.hidden;
    if (running && !raf) raf = requestAnimationFrame(draw);
  }

  const im = new Image();
  im.onload = () => {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    scene.appendChild(canvas);
    layout();
    document.documentElement.classList.add('gl-water');   // hides the SVG-filter layer
    ready = true; setRunning(visible);
  };
  im.src = 'assets/bg-cover.webp';

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; setRunning(visible); }).observe(opening);
  document.addEventListener('visibilitychange', () => setRunning(visible));
  window.addEventListener('resize', () => { if (ready) layout(); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); ready = false; running = false; canvas.remove(); document.documentElement.classList.remove('gl-water'); });
})();
