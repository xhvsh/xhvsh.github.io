import { createGlitch } from "./GlitchVanilla.js";
import { createDisplacement } from "./DisplacementVanilla.js";
import { createRetroDither } from "./RetroDitherVanilla.js";
import { createDecryptReveal } from "./DecryptRevealVanilla.js";

function supported() {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("canvas");
  const ctx = probe.getContext("2d");
  const gl = document.createElement("canvas").getContext("webgl2");
  return Boolean(
    ctx &&
      typeof ctx.drawElementImage === "function" &&
      typeof probe.requestPaint === "function" &&
      gl,
  );
}

function mount(element) {
  const parent = element.parentNode;
  const anchor = element.nextSibling;
  const host = document.createElement("div");
  host.className = "fx-host";
  const source = document.createElement("canvas");
  source.className = "fx-source";
  const content = document.createElement("div");
  content.className = "fx-content";
  content.append(element);
  source.append(content);
  const output = document.createElement("canvas");
  output.className = "fx-output";
  output.setAttribute("aria-hidden", "true");
  host.append(source, output);
  parent.insertBefore(host, anchor);
  const timer = setInterval(() => {
    const height = Math.ceil(content.scrollHeight);
    if (height && host.style.height !== `${height}px`) {
      host.style.height = `${height}px`;
    }
  }, 250);
  return { elements: { source, content, output }, cleanup: () => { clearInterval(timer); unmount(host, content, parent, anchor); } };
}

function unmount(host, content, parent, anchor) {
  content.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  const first = content.firstElementChild;
  if (first) {
    if (parent) parent.insertBefore(first, anchor);
    else document.body.insertBefore(first, host);
  }
  host.remove();
}

function activate(builder, element, options) {
  if (!supported()) return null;
  const mounted = mount(element);
  let instance = null;
  try {
    instance = builder(mounted.elements, options);
  } catch {
    instance = null;
  }
  if (!instance) {
    mounted.cleanup();
    return null;
  }
  document.documentElement.classList.add("fx-canvas");
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => instance.resize());
  }
  return instance;
}

const is404 = Boolean(document.querySelector(".missing"));
const canHover = window.matchMedia("(hover: hover)").matches;

if (is404) {
  const main = document.getElementById("main");
  if (main && canHover) {
    activate(
      createDecryptReveal,
      main,
      {
        radius: 340,
        softness: 0.4,
        cell: 9,
        aspect: 0.8,
        colored: 0.85,
        color: "#b06bff",
        brightness: 1.1,
        legibility: 1,
        contrast: 1.1,
        exposure: 1.05,
        scramble: 0.08,
        scrambleSpeed: 7,
        edgeWidth: 0.2,
        edgeFlicker: 0.9,
        edgeGlow: 1.7,
        edgeTint: 0.65,
        aberration: 6,
        passthrough: 0.32,
        threshold: 0.03,
        background: "#000000",
        smoothing: 0.22,
      },
    );
  }
} else {
  const hero = document.querySelector(".hero");
  if (hero && canHover) {
    activate(
      createRetroDither,
      hero,
      {
        radius: 0.32,
        softness: 0.75,
        pixelSize: 3,
        levels: 4,
        darkColor: [0.03, 0.03, 0.05],
        lightColor: [0.71, 0.27, 1.0],
        colorize: 0.9,
        contrast: 1.15,
        brightness: 0,
        strength: 1,
        baseStrength: 0.05,
        invert: 0,
        scanlines: 0.25,
        pattern: "bayer",
        trail: 0.3,
        degauss: 0.6,
        followSpeed: 0.2,
      },
    );
  }

  const projects = document.getElementById("projects");
  if (projects) {
    activate(
      createDisplacement,
      projects,
      {
        grid: 56,
        cellAspect: 1,
        radius: 0.14,
        strength: 0.28,
        threshold: 800,
        relaxation: 0.92,
        shift: 1,
        aberration: 1.2,
        grain: 0.08,
        grainSize: 1.2,
        grainSpeed: 1.2,
        scramble: 1.8,
      },
    );
  }

  const socials = document.getElementById("socials");
  if (socials) {
    activate(
      createGlitch,
      socials,
      {
        intensity: 1,
        interval: 2.6,
        duration: 0.5,
        slices: 26,
        shift: 24,
        rgbShift: 5,
        blocks: 0.5,
        noise: 0.3,
      },
    );
  }
}
