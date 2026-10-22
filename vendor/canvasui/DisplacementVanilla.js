const canvasDimensionLimits = /* @__PURE__ */ new WeakMap();
function getCanvasPixelRatio(element, context) {
  const scale = window.visualViewport?.scale || 1;
  const requested = Math.min(window.devicePixelRatio || 1, 2) * scale;
  const width = Math.max(element.clientWidth, 1);
  const height = Math.max(element.clientHeight, 1);
  let maxDimension = 8192;
  if (context) {
    let limit = canvasDimensionLimits.get(context);
    if (limit === void 0) {
      limit = Math.min(
        maxDimension,
        context.getParameter(context.MAX_TEXTURE_SIZE),
        context.getParameter(context.MAX_RENDERBUFFER_SIZE)
      );
      canvasDimensionLimits.set(context, limit);
    }
    maxDimension = limit;
  }
  return Math.min(
    requested,
    maxDimension / Math.max(width, height),
    Math.sqrt(16777216 / (width * height))
  );
}
function createCanvasResizeObserver(onResize) {
  const viewport = window.visualViewport;
  let frame = 0;
  let disconnected = false;
  const schedule = () => {
    if (frame || disconnected) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      onResize();
    });
  };
  const observer = new ResizeObserver(schedule);
  window.addEventListener("resize", schedule, { passive: true });
  viewport?.addEventListener("resize", schedule, { passive: true });
  return {
    observe(element, options) {
      observer.observe(element, options);
    },
    unobserve(element) {
      observer.unobserve(element);
    },
    disconnect() {
      disconnected = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
    }
  };
}
function prepareHtmlInCanvas(source, content) {
  if ("content" in source) {
    source.setAttribute("content", "drawable");
    content.setAttribute("drawable", "");
  } else {
    source.setAttribute("layoutsubtree", "");
  }
}
function drawHtmlInCanvas(source, context, content) {
  const transform = context.drawElementImage(content, 0, 0);
  const canvas = source;
  if (transform && typeof canvas.updateElementGeometry === "function") {
    canvas.updateElementGeometry(content, { canvasTransform: transform });
  }
}
function createRectCache(element) {
  let current = element.getBoundingClientRect();
  const refresh = () => {
    current = element.getBoundingClientRect();
  };
  const observer = new ResizeObserver(refresh);
  observer.observe(element);
  window.addEventListener("resize", refresh, { passive: true });
  window.addEventListener("scroll", refresh, {
    capture: true,
    passive: true
  });
  return {
    get current() {
      return current;
    },
    destroy() {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    }
  };
}
const DEFAULTS = {
  grid: 50,
  cellAspect: 1,
  radius: 0.1,
  strength: 0.1,
  threshold: 1e3,
  relaxation: 0.9,
  shift: 1,
  aberration: 1.5,
  grain: 0.1,
  grainSize: 1,
  grainSpeed: 1,
  scramble: 1
};
const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uField;
uniform vec2 uResolution;
uniform float uShift;
uniform float uAberration;
uniform float uGrain;
uniform float uGrainPx;
uniform float uGrainTick;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main () {
  vec2 cuv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 offset = texture(uField, cuv).rg;
  vec2 push = offset * 0.02 * uShift;
  float ab = uAberration * 0.08;
  vec2 lo = vec2(0.001);
  vec2 hi = vec2(0.999);
  vec4 cr = texture(uContent, clamp(cuv - push * (1.0 + ab), lo, hi));
  vec4 cg = texture(uContent, clamp(cuv - push, lo, hi));
  vec4 cb = texture(uContent, clamp(cuv - push * (1.0 - ab), lo, hi));
  float alpha = (cr.a + cg.a + cb.a) / 3.0;
  vec3 col = vec3(cr.r * cr.a, cg.g * cg.a, cb.b * cb.a);
  col = min(col, vec3(alpha));
  float pushPx = length(push * uResolution);
  float gate = smoothstep(1.5, 18.0, pushPx);
  vec2 cell = floor(gl_FragCoord.xy / max(uGrainPx, 1.0));
  float gn = hash(cell + vec2(uGrainTick * 0.37, uGrainTick * 0.113));
  col += (gn - 0.5) * 0.3 * uGrain * gate * alpha;
  col = clamp(col, vec3(0.0), vec3(alpha));
  outColor = vec4(col, alpha);
}`;
function supportsHtmlInCanvas() {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("canvas");
  const ctx = probe.getContext("2d");
  return Boolean(
    ctx && typeof ctx.drawElementImage === "function" && typeof probe.requestPaint === "function"
  );
}
function createDisplacement(elements, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const { source, content, output } = elements;
  const gl = output.getContext("webgl2", {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true
  });
  if (!gl || gl.isContextLost()) return null;
  const sourceCtx = source.getContext("2d");
  const paintable = source;
  const htmlInCanvas = Boolean(
    sourceCtx && typeof sourceCtx.drawElementImage === "function" && typeof paintable.requestPaint === "function"
  );
  if (htmlInCanvas) prepareHtmlInCanvas(source, content);
  let contentDirty = false;
  let wake = () => {
  };
  if (htmlInCanvas) {
    paintable.onpaint = () => {
      try {
        sourceCtx.reset();
        drawHtmlInCanvas(source, sourceCtx, content);
        contentDirty = true;
        wake();
      } catch {
      }
    };
  }
  function compile(type, text) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Displacement shader error:", gl.getShaderInfoLog(shader));
    }
    return shader;
  }
  const vertexShader = compile(gl.VERTEX_SHADER, VERT);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const contentTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, contentTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0])
  );
  const fieldTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  let cols = 0;
  let rows = 0;
  let rowScale = 1;
  let outW = 1;
  let outH = 1;
  let scrambled = false;
  let field = new Float32Array(0);
  let fieldDirty = false;
  function syncGrid() {
    const nextCols = Math.round(Math.min(Math.max(config.grid, 4), 100));
    const aspect = Math.min(Math.max(config.cellAspect, 0.25), 4);
    const nextRows = Math.max(
      2,
      Math.min(Math.round(nextCols * outH * aspect / outW), 200)
    );
    if (nextCols === cols && nextRows === rows) {
      rowScale = outH * cols / (outW * rows);
      return;
    }
    cols = nextCols;
    rows = nextRows;
    rowScale = outH * cols / (outW * rows);
    field = new Float32Array(cols * rows * 2);
    if (!scrambled && !reducedMotion && config.scramble > 0) {
      const amp = 40 * Math.min(config.scramble, 3);
      for (let i = 0; i < field.length; i++) {
        field[i] = (Math.random() * 2 - 1) * amp;
      }
    }
    scrambled = true;
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RG32F,
      cols,
      rows,
      0,
      gl.RG,
      gl.FLOAT,
      field
    );
    fieldDirty = false;
  }
  let dpr = 1;
  function syncCanvasSize() {
    dpr = getCanvasPixelRatio(output, gl);
    outW = Math.max(1, output.clientWidth);
    outH = Math.max(1, output.clientHeight);
    const width = Math.max(1, Math.round(outW * dpr));
    const height = Math.max(1, Math.round(outH * dpr));
    if (output.width !== width || output.height !== height) {
      output.width = width;
      output.height = height;
    }
    if (htmlInCanvas) {
      const sourceWidth = Math.max(1, Math.round(source.clientWidth * dpr));
      const sourceHeight = Math.max(1, Math.round(source.clientHeight * dpr));
      if (source.width !== sourceWidth || source.height !== sourceHeight) {
        source.width = sourceWidth;
        source.height = sourceHeight;
      }
      paintable.requestPaint();
    }
    syncGrid();
  }
  syncCanvasSize();
  function uploadContent() {
    if (!htmlInCanvas || !contentDirty) return;
    contentDirty = false;
    gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source
    );
    sourceCtx.clearRect(0, 0, source.width, source.height);
  }
  function uploadField() {
    if (!fieldDirty) return;
    fieldDirty = false;
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      cols,
      rows,
      gl.RG,
      gl.FLOAT,
      field
    );
  }
  const mouse = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vX: 0,
    vY: 0,
    speed: 0,
    gate: 0,
    lastT: 0
  };
  let tracking = false;
  function stepSimulation(delta) {
    const relaxation = Math.min(Math.max(config.relaxation, 0.5), 0.995);
    const decay = Math.pow(relaxation, delta * 60);
    let maxAbs = 0;
    for (let i = 0; i < field.length; i++) {
      const value = field[i] * decay;
      field[i] = value;
      const abs = Math.abs(value);
      if (abs > maxAbs) maxAbs = abs;
    }
    const injecting = tracking && (mouse.vX !== 0 || mouse.vY !== 0);
    if (injecting) {
      const gridX = mouse.x * cols;
      const gridY = mouse.y * rows;
      const maxDist = cols * Math.min(Math.max(config.radius, 0.02), 1);
      const maxSq = maxDist * maxDist;
      const gain = Math.min(Math.max(config.strength, 0), 1) * 100 * mouse.gate;
      for (let j = 0; j < rows; j++) {
        const dy = (gridY - j) * rowScale;
        for (let i = 0; i < cols; i++) {
          const dx = gridX - i;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxSq) {
            const power = Math.min(maxDist / Math.sqrt(distSq), 10);
            const idx = 2 * (i + cols * j);
            field[idx] += gain * mouse.vX * power;
            field[idx + 1] += gain * mouse.vY * power;
          }
        }
      }
    }
    const vDecay = Math.pow(0.9, delta * 60);
    mouse.vX *= vDecay;
    mouse.vY *= vDecay;
    if (Math.abs(mouse.vX) < 1e-4) mouse.vX = 0;
    if (Math.abs(mouse.vY) < 1e-4) mouse.vY = 0;
    fieldDirty = true;
    const alive = injecting || mouse.vX !== 0 || mouse.vY !== 0 || maxAbs > 0.03;
    if (!alive && maxAbs > 0) field.fill(0);
    return alive;
  }
  let time = 0;
  function render() {
    uploadContent();
    uploadField();
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.uniform1i(uniforms.uContent, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.uniform1i(uniforms.uField, 1);
    gl.uniform2f(uniforms.uResolution, output.width, output.height);
    gl.uniform1f(uniforms.uShift, Math.min(Math.max(config.shift, 0), 4));
    gl.uniform1f(
      uniforms.uAberration,
      Math.min(Math.max(config.aberration, 0), 3)
    );
    gl.uniform1f(uniforms.uGrain, Math.min(Math.max(config.grain, 0), 1));
    gl.uniform1f(
      uniforms.uGrainPx,
      Math.max(1, Math.min(Math.max(config.grainSize, 0.5), 4) * dpr * 1.5)
    );
    gl.uniform1f(
      uniforms.uGrainTick,
      Math.floor(time * Math.min(Math.max(config.grainSpeed, 0), 4) * 18)
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, output.width, output.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  let raf = 0;
  let lastTime = performance.now();
  let destroyed = false;
  let running = false;
  let visible = true;
  function frame(now) {
    if (destroyed) return;
    if (!visible) {
      running = false;
      return;
    }
    const delta = Math.min((now - lastTime) / 1e3, 1 / 30);
    lastTime = now;
    time += delta;
    let alive = false;
    if (!reducedMotion) alive = stepSimulation(delta);
    render();
    if (!alive && !contentDirty) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (destroyed || running || !visible) return;
    running = true;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }
  wake = start;
  start();
  function onMotionChange() {
    reducedMotion = motionQuery.matches;
    if (reducedMotion) {
      field.fill(0);
      mouse.vX = 0;
      mouse.vY = 0;
      fieldDirty = true;
    }
    start();
  }
  motionQuery.addEventListener("change", onMotionChange);
  const pointerHost = output.parentElement ?? output;
  const rectCache = createRectCache(output);
  function onPointerMove(event) {
    if (reducedMotion) return;
    const box = rectCache.current;
    if (box.width < 1 || box.height < 1) return;
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    const now = performance.now();
    if (!tracking) {
      tracking = true;
      mouse.prevX = x;
      mouse.prevY = y;
      mouse.speed = 0;
      mouse.gate = 0;
      mouse.lastT = now;
    }
    mouse.vX = x - mouse.prevX;
    mouse.vY = y - mouse.prevY;
    const dt = Math.max((now - mouse.lastT) / 1e3, 1e-3);
    mouse.lastT = now;
    const distPx = Math.hypot(mouse.vX * box.width, mouse.vY * box.height);
    const instSpeed = distPx / dt;
    mouse.speed += (instSpeed - mouse.speed) * Math.min(dt * 25, 1);
    const threshold = Math.max(config.threshold, 0);
    if (threshold <= 0) {
      mouse.gate = 1;
    } else {
      const ramp = (mouse.speed - threshold) / threshold;
      const step = Math.min(Math.max(ramp, 0), 1);
      mouse.gate = step * step * (3 - 2 * step);
    }
    mouse.prevX = x;
    mouse.prevY = y;
    mouse.x = x;
    mouse.y = y;
    start();
  }
  function onPointerLeave() {
    tracking = false;
    mouse.vX = 0;
    mouse.vY = 0;
    mouse.speed = 0;
    mouse.gate = 0;
  }
  pointerHost.addEventListener("pointermove", onPointerMove, { passive: true });
  pointerHost.addEventListener("pointerleave", onPointerLeave, { passive: true });
  pointerHost.addEventListener("pointercancel", onPointerLeave, { passive: true });
  const observer = createCanvasResizeObserver(() => {
    syncCanvasSize();
    start();
  });
  observer.observe(output);
  observer.observe(content);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1]?.isIntersecting ?? true;
    if (visible) start();
  });
  intersection.observe(output);
  return {
    setOptions(next) {
      let changed = false;
      for (const [key, value] of Object.entries(next)) {
        const prev = config[key];
        if (prev !== value) {
          changed = true;
          break;
        }
      }
      Object.assign(config, next);
      if (!changed) return;
      syncGrid();
      syncCanvasSize();
      start();
    },
    resize() {
      syncCanvasSize();
      start();
    },
    destroy() {
      destroyed = true;
      rectCache.destroy();
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      pointerHost.removeEventListener("pointermove", onPointerMove);
      pointerHost.removeEventListener("pointerleave", onPointerLeave);
      pointerHost.removeEventListener("pointercancel", onPointerLeave);
      gl.deleteTexture(contentTexture);
      gl.deleteTexture(fieldTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(quad);
      if (htmlInCanvas) paintable.onpaint = null;
    }
  };
}
export {
  createDisplacement,
  supportsHtmlInCanvas
};
