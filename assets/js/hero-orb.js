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

// Homepage hero bootstrap
const container = document.getElementById('hero-orb');

if (container) {
  const modal = document.getElementById('showreel-modal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroVisible = true;
  const modalOpen = () => !!(modal && modal.classList.contains('active'));
  const canRun = () => heroVisible && !document.hidden && !modalOpen();

  try {
    const orb = createGradientOrb(container, {
      colors: ['#2a4ce7', '#955bcf', '#B497CF'],
      innerRadius: 0.35,
      noiseScale: 0.65,
      // Reduced motion: slower and calmer, not frozen
      rotationSpeed: reduceMotion ? 0.15 : 0.3,
      timeScale: reduceMotion ? 0.5 : 1
    });

    if (orb) {
      const sync = () => (canRun() ? orb.start() : orb.pause());

      new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        sync();
      }).observe(container);

      document.addEventListener('visibilitychange', sync);

      if (modal) {
        new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ['class'] });
      }

      sync();
    }
  } catch (e) {
    // Shader or WebGL failure: keep the CSS dark disc behind the text
    container.querySelectorAll('canvas').forEach(c => c.remove());
  }
}
