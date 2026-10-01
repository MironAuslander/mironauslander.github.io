/**
 * Hero orb ("eclipse" panel behind the hero text)
 * Plain WebGL port of the Gradient Orb component: one fragment shader on a
 * fullscreen triangle. Pauses when the hero is off screen, the tab is hidden
 * or the showreel modal is open.
 */

const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float rot;
  uniform float noiseScale;
  uniform float innerRadius;
  uniform vec3 color0In;
  uniform vec3 color1In;
  uniform vec3 color2In;

  varying vec2 vUv;

  // --- YIQ color space hue rotation ---

  vec3 rgb2yiq(vec3 c) {
    return vec3(
      dot(c, vec3(0.299, 0.587, 0.114)),
      dot(c, vec3(0.596, -0.274, -0.322)),
      dot(c, vec3(0.211, -0.523, 0.312))
    );
  }

  vec3 yiq2rgb(vec3 c) {
    return vec3(
      c.x + 0.956 * c.y + 0.621 * c.z,
      c.x - 0.272 * c.y - 0.647 * c.z,
      c.x - 1.106 * c.y + 1.703 * c.z
    );
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = radians(hueDeg);
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    yiq.yz = vec2(yiq.y * cosA - yiq.z * sinA, yiq.y * sinA + yiq.z * cosA);
    return yiq2rgb(yiq);
  }

  // --- 3D simplex noise (hash-based) ---

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  // --- Orb rendering ---

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  const vec3 baseColor3 = vec3(0.0, 0.0, 0.0);

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }

  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec4 draw(vec2 uv) {
    vec3 color0 = adjustHue(color0In, hue);
    vec3 color1 = adjustHue(color1In, hue);
    vec3 color2 = adjustHue(color2In, hue);
    vec3 color3 = adjustHue(baseColor3, hue);

    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;

    float pulse = sin(iTime * 1.5) * 0.02;

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;

    float r0 = mix(mix(innerRadius + pulse, 1.0, 0.4), mix(innerRadius + pulse, 1.0, 0.6), n0);

    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);
    v0 *= smoothstep(r0 * 1.05, r0, len);
    float cl = cos(atan(uv.y, uv.x) + iTime * 2.0) * 0.5 + 0.5;

    float a = iTime * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 col = mix(color1, color2, cl);
    col = mix(col, color0, n0);
    col = mix(color3, col, v0);
    col = (col + v1) * v2 * v3;
    col = clamp(col, 0.0, 1.0);

    return extractAlpha(col);
  }

  void main() {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (vUv * iResolution.xy - center) / size * 2.0;

    float s = sin(rot);
    float c = cos(rot);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    vec4 col = draw(uv);
    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export function createGradientOrb(container, {
  colors = ['#3d5aff', '#9d00ff', '#ff5f1f'],
  hue = 0,
  rotationSpeed = 0.3,
  timeScale = 1,
  noiseScale = 0.65,
  innerRadius = 0.1
} = {}) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const u = name => gl.getUniformLocation(program, name);
  const uTime = u('iTime');
  const uResolution = u('iResolution');
  const uRot = u('rot');
  gl.uniform1f(u('hue'), hue);
  gl.uniform1f(u('noiseScale'), noiseScale);
  gl.uniform1f(u('innerRadius'), innerRadius);
  ['color0In', 'color1In', 'color2In'].forEach((name, i) => {
    gl.uniform3fv(u(name), hexToRgb(colors[i] || colors[0]));
  });

  gl.clearColor(0, 0, 0, 0);
  container.appendChild(canvas);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3f(uResolution, canvas.width, canvas.height, canvas.width / canvas.height);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let rafId = null;
  let running = false;
  let time = 0;
  let rot = 0;
  let last = 0;

  function frame(now) {
    if (!running) return;
    // Clamp long gaps (tab switches) so the orb does not jump
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt * timeScale;
    rot += dt * rotationSpeed;
    gl.uniform1f(uTime, time);
    gl.uniform1f(uRot, rot);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    rafId = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    },
    pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    dispose() {
      this.pause();
      ro.disconnect();
      canvas.remove();
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  };
}

/**
 * Warp text as if printed on a glass sphere.
 * Each letter becomes a span. Its flat position is mapped onto a sphere
 * (longitude = x / R, latitude = y / R) and projected with a slight
 * perspective; the span gets the local scale of that mapping, so letters
 * narrow toward the edges and the outer lines arch. Static lines only re-run
 * on resize and font load. Screen readers get the original text.
 *
 * Optional band: line `bandLine` becomes a ring of text around the sphere at
 * that line's latitude, scrolling right to left. Its items (split at "•") are
 * repeated around the band (as many copies as fit at the target gap, at least
 * two) with a bullet centered in each gap, so the front face is never empty.
 * Only the front face is visible.
 * Returns { start, pause } for the band (no-ops without one).
 */
export function warpTextOntoSphere(textEl, sphereEl, {
  radius = () => sphereEl.getBoundingClientRect().width / 2,
  distance = 4,        // camera distance in sphere radii (lower = more perspective)
  minAlpha = 0.65,     // brightness at the sphere's limb, for depth
  bandLine = -1,       // index of the line that scrolls around the sphere
  bandSpeed = 50,      // px/s at the front of the sphere
  bandClip = null,     // () => [fadeStart, fadeEnd] screen radius where band letters fade out
  bandGap = 2.5        // target gap between items, in em
} = {}) {
  const NBSP = ' ';
  let bandEl = null;
  let bandItems = [];
  const bandCopies = []; // each copy: [{ chars, bullet }] per item
  let makeChar = null;

  if (!textEl.dataset.warped) {
    // Lines split at <br>, read as text (so entities like &amp; come out as "&")
    const lines = [''];
    textEl.childNodes.forEach(node => {
      if (node.nodeName === 'BR') lines.push('');
      else lines[lines.length - 1] += node.textContent;
    });
    for (let i = 0; i < lines.length; i++) lines[i] = lines[i].replace(/\s+/g, ' ').trim();
    for (let i = lines.length - 1; i >= 0; i--) if (!lines[i]) lines.splice(i, 1);

    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = lines.join(' ');

    makeChar = ch => {
      const span = document.createElement('span');
      span.className = 'warp-ch';
      span.textContent = ch === ' ' ? NBSP : ch;
      return span;
    };

    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    lines.forEach((line, i) => {
      if (i) visual.appendChild(document.createElement('br'));
      if (i === bandLine) {
        // Keeps the line's height in the flow; the band itself is drawn around the sphere
        const slot = document.createElement('span');
        slot.className = 'warp-band-slot';
        slot.textContent = NBSP;
        visual.appendChild(slot);
        return;
      }
      for (const ch of line) visual.appendChild(makeChar(ch));
    });

    if (bandLine >= 0 && lines[bandLine]) {
      bandItems = lines[bandLine].split('•').map(t => t.trim()).filter(Boolean);
      bandEl = document.createElement('div');
      bandEl.className = 'hero-subtitle warp-band';
      bandEl.setAttribute('aria-hidden', 'true');
      sphereEl.appendChild(bandEl);
      addBandCopy();
    }

    textEl.replaceChildren(srText, visual);
    textEl.dataset.warped = '1';
  }

  // One copy of the band's items (letters + a bullet after each item)
  function addBandCopy() {
    const copy = bandItems.map(item => {
      const word = [...item].map(makeChar);
      word.forEach(c => bandEl.appendChild(c));
      const bullet = makeChar('•');
      bandEl.appendChild(bullet);
      return { chars: word, bullet };
    });
    bandCopies.push(copy);
    return copy;
  }

  const chars = [...textEl.querySelectorAll('.warp-ch')];
  const slot = textEl.querySelector('.warp-band-slot');

  const smoothstep = (e0, e1, x) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  // Sphere point at (lon, lat) projected with perspective; returns [X, Y, facing]
  function projectLL(lon, lat, R) {
    const px = R * Math.cos(lat) * Math.sin(lon);
    const py = R * Math.sin(lat);
    const pz = R * Math.cos(lat) * Math.cos(lon);
    const s = (distance * R - R) / (distance * R - pz); // 1 at the front point
    return [px * s, py * s, Math.cos(lat) * Math.cos(lon)];
  }

  // Per-letter transform: local scale only. The shear/rotation terms are left
  // out on purpose: slanted glyphs render with jagged edges, upright ones stay
  // crisp, and the curve still reads from positions and narrowing.
  function place(el, lon, lat, R, arcRadius, offsetX, offsetY) {
    const h = 1;
    const [X, Y, facing] = projectLL(lon, lat, R);
    const [Xx] = projectLL(lon + h / arcRadius, lat, R);
    const [, Yy] = projectLL(lon, lat + h / R, R);
    const a = (Xx - X) / h;
    const d = (Yy - Y) / h;
    el.style.transform =
      `matrix(${a.toFixed(4)}, 0, 0, ${d.toFixed(4)}, ${(X - offsetX).toFixed(2)}, ${(Y - offsetY).toFixed(2)})`;
    return facing;
  }

  // Band geometry, recomputed on resize
  let band = null;

  function layout() {
    // Static lines: measure the flat layout first (reads), then transform (writes)
    chars.forEach(c => { c.style.transform = ''; c.style.opacity = ''; });
    const box = sphereEl.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const R = radius();
    if (!R) return;
    const centers = chars.map(c => {
      const r = c.getBoundingClientRect();
      return [r.left + r.width / 2 - cx, r.top + r.height / 2 - cy];
    });
    centers.forEach(([x, y], i) => {
      const facing = place(chars[i], x / R, y / R, R, R, x, y);
      chars[i].style.opacity = (minAlpha + (1 - minAlpha) * facing).toFixed(3);
    });

    if (bandEl && slot) {
      const sr = slot.getBoundingClientRect();
      const lat = (sr.top + sr.height / 2 - cy) / R;
      const ringR = R * Math.cos(lat);
      const C = 2 * Math.PI * ringR;
      const fontSize = parseFloat(getComputedStyle(bandEl).fontSize) || 16;
      const first = bandCopies[0];
      const itemsW = first.reduce((sum, w) => sum + w.chars.reduce((t, c) => t + c.offsetWidth, 0), 0);
      // As many copies as fit around the band at the target gap (at least 2,
      // so the front is never empty); leftover space is shared evenly
      const target = fontSize * bandGap;
      const copies = Math.max(2, Math.floor(C / (itemsW + target * first.length)));
      while (bandCopies.length < copies) addBandCopy();
      const gap = (C / copies - itemsW) / first.length;
      const letters = [];
      // Start every letter hidden; drawBand shows the ones on the front face
      bandCopies.forEach(copy => copy.forEach(w => [...w.chars, w.bullet].forEach(c => {
        c.style.visibility = 'hidden';
      })));
      bandCopies.forEach((copy, k) => {
        if (k >= copies) return; // spare copies from a larger layout stay hidden
        let arc = k * C / copies;
        copy.forEach(w => {
          w.chars.forEach(c => {
            const cw = c.offsetWidth;
            letters.push({ el: c, base: (arc + cw / 2) / ringR, w: cw, h: c.offsetHeight });
            arc += cw;
          });
          letters.push({
            el: w.bullet,
            base: (arc + gap / 2) / ringR,
            w: w.bullet.offsetWidth,
            h: w.bullet.offsetHeight
          });
          arc += gap;
        });
      });
      band = { R, lat, ringR, letters, omega: bandSpeed / ringR, clip: bandClip ? bandClip() : null };
      drawBand();
    }
  }

  // Band animation state
  let angle = 0;
  let running = false;
  let rafId = null;
  let last = 0;

  function drawBand() {
    if (!band) return;
    const { R, lat, ringR, letters, clip } = band;
    const TAU = 2 * Math.PI;
    for (const L of letters) {
      let lon = (L.base + angle) % TAU;
      if (lon > Math.PI) lon -= TAU;
      if (lon < -Math.PI) lon += TAU;
      const front = Math.cos(lon);
      // Strong, smooth fade toward the sphere's sides: full brightness only
      // around the middle of the front face, gone well before the limb. This
      // also keeps letters hidden while they're squeezed to near-zero width,
      // which flickered on mobile.
      let alpha = smoothstep(0.1, 0.9, front);
      if (alpha > 0 && clip) {
        // The printed sphere is larger than the visible orb: fade out well
        // inside the ring, as if curving away behind its edge
        const [X, Y] = projectLL(lon, lat, R);
        alpha *= 1 - smoothstep(clip[0], clip[1], Math.hypot(X, Y));
      }
      if (alpha < 0.01) {
        if (L.shown) {
          L.el.style.visibility = 'hidden';
          L.shown = false;
        }
        continue;
      }
      const facing = place(L.el, lon, lat, R, ringR, L.w / 2, L.h / 2);
      alpha *= minAlpha + (1 - minAlpha) * facing;
      L.el.style.opacity = alpha.toFixed(2);
      if (!L.shown) {
        L.el.style.visibility = 'visible';
        L.shown = true;
      }
    }
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (band) angle -= band.omega * dt; // right to left
    drawBand();
    rafId = requestAnimationFrame(frame);
  }

  let raf = null;
  const schedule = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  };
  new ResizeObserver(schedule).observe(sphereEl);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  layout();

  return {
    start() {
      if (running || !bandEl) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    },
    pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

// Homepage hero bootstrap
const modal = document.getElementById('showreel-modal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const eclipse = document.querySelector('.hero-eclipse');
const subtitle = document.querySelector('.hero-eclipse .hero-subtitle');
const container = document.getElementById('hero-orb');

// Everything animated in the hero runs only while the hero is on screen, the
// tab is visible and the showreel modal is closed
const animations = [];
let heroVisible = true;
const modalOpen = () => !!(modal && modal.classList.contains('active'));
const canRun = () => heroVisible && !document.hidden && !modalOpen();
const sync = () => animations.forEach(a => (canRun() ? a.start() : a.pause()));

if (subtitle && eclipse) {
  // Mapping radius relative to the orb ring's inner edge (orb canvas is 1.4x
  // the eclipse box, ring starts at ~0.61 of the orb radius). Phones: 1.35x,
  // edge letters about 70% width. Desktop text is ~20% larger, so its sphere
  // is ~20% bigger too: same gentle curve over a larger printed area.
  const desktop = window.matchMedia('(min-width: 601px)');
  animations.push(warpTextOntoSphere(subtitle, eclipse, {
    radius: () => eclipse.getBoundingClientRect().width * 1.4 / 2 * 0.61 *
      (desktop.matches ? 1.62 : 1.35),
    // First line ("AI • Visual Effects • Motion Graphics") scrolls around the sphere
    bandLine: 0,
    // Reduced motion: slower, not frozen
    bandSpeed: reduceMotion ? 25 : 50,
    // Fade the band out gradually from about a third of the way to the ring
    bandClip: () => {
      const orbR = eclipse.getBoundingClientRect().width * 1.4 / 2;
      return [0.35 * orbR, 0.72 * orbR];
    }
  }));
}

if (container) {
  try {
    const orb = createGradientOrb(container, {
      colors: ['#2a4ce7', '#955bcf', '#B497CF'],
      innerRadius: 0.35,
      noiseScale: 0.65,
      // Reduced motion: slower and calmer, not frozen
      rotationSpeed: reduceMotion ? 0.15 : 0.3,
      timeScale: reduceMotion ? 0.5 : 1
    });
    if (orb) animations.push(orb);
  } catch (e) {
    // Shader or WebGL failure: keep the CSS dark disc behind the text
    container.querySelectorAll('canvas').forEach(c => c.remove());
  }
}

const watched = container || eclipse;
if (watched && animations.length) {
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    sync();
  }).observe(watched);

  document.addEventListener('visibilitychange', sync);

  if (modal) {
    new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  sync();
}
