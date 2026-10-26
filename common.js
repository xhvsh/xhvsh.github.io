const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// start at the top on reload, but keep #section deep links working
if (!location.hash) {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

const year = String(new Date().getFullYear());
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = year;
});

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("tab-hidden", document.hidden);
});

// clock

const clockEl = document.getElementById("clock");
if (clockEl) {
  const pre = clockEl.appendChild(document.createElement("span"));
  pre.className = "clock-side";
  pre.textContent = "it's";
  const strip = clockEl.appendChild(document.createElement("span"));
  strip.className = "digit-strip";
  const tz = clockEl.appendChild(document.createElement("span"));
  tz.className = "clock-side clock-tz";
  const post = clockEl.appendChild(document.createElement("span"));
  post.className = "clock-side";
  post.textContent = "for me";

  const digits = [];
  for (let i = 0; i < 8; i++) {
    const slot = strip.appendChild(document.createElement("span"));
    slot.className = "digit-slot";
    const reel = document.createElement("span");
    reel.className = "digit-reel";
    const cur = document.createElement("span");
    const next = document.createElement("span");
    reel.append(cur, next);
    slot.append(reel);
    digits.push({ cur, next, reel, anim: null });
  }

  const format = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Warsaw",
    timeZoneName: "short",
  });

  const setDigit = (d, ch, animate) => {
    if (d.cur.textContent === ch) return;
    if (d.anim) d.anim.finish();
    if (animate && !reducedMotion) {
      d.next.textContent = ch;
      d.anim = d.reel.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-1em)" }],
        { duration: 340, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
      );
      d.anim.onfinish = () => {
        d.cur.textContent = d.next.textContent;
        d.next.textContent = "";
        d.anim = null;
      };
    } else {
      d.cur.textContent = ch;
    }
  };

  const setTime = (animate) => {
    const parts = format.formatToParts(new Date());
    const time = parts
      .filter((p) => p.type === "hour" || p.type === "minute" || p.type === "second" || p.value === ":")
      .map((p) => p.value)
      .join("");
    const zone = parts.find((p) => p.type === "timeZoneName");
    tz.textContent = zone ? zone.value : "";
    time.split("").forEach((ch, i) => setDigit(digits[i], ch, animate));
  };

  setTime(false);
  setInterval(() => setTime(true), 1000);
}

// text scramble: the real text stays in an sr-only span so screen readers never read the noise

const CIPHER = "01<>/\\[]{}#$%&*+-=~?";
const scrambleTargets = new WeakMap();

function scrambleTarget(el) {
  let visual = scrambleTargets.get(el);
  if (visual) return visual;
  const text = el.textContent.trim().replace(/\s+/g, " ");
  const real = document.createElement("span");
  real.className = "sr-only";
  real.textContent = text;
  visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");
  visual.textContent = text;
  el.replaceChildren(real, visual);
  scrambleTargets.set(el, visual);
  return visual;
}

function scrambleText(el, duration) {
  if (!el || reducedMotion || el.dataset.scrambling === "1") return;
  const visual = scrambleTarget(el);
  el.dataset.scrambling = "1";
  const final = Array.from(visual.textContent);
  const start = performance.now();
  const run = (now) => {
    const t = (now - start) / duration;
    if (t >= 1) {
      visual.textContent = final.join("");
      el.removeAttribute("data-scrambling");
      return;
    }
    const reveal = Math.floor(t * final.length);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      out += i < reveal || ch === " " ? ch : CIPHER[(Math.random() * CIPHER.length) | 0];
    }
    visual.textContent = out;
    requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

// glitch

document.querySelectorAll(".glitch-title").forEach((el) => {
  el.dataset.text = el.textContent;
});

function burstTitle(el) {
  if (!el) return;
  el.classList.add("burst");
  setTimeout(() => el.classList.remove("burst"), 560);
}

function scheduleGlitch(fire) {
  if (reducedMotion) return;
  const next = () =>
    setTimeout(() => {
      if (!document.hidden) fire();
      next();
    }, 3500 + Math.random() * 4500);
  next();
}

// grain

function buildGrainTile() {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 128;
  const ctx = tile.getContext("2d");
  const data = ctx.createImageData(128, 128);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    px[i] = px[i + 1] = px[i + 2] = 255;
    px[i + 3] = Math.random() < 0.85 ? 0 : 14 + Math.random() * 40;
  }
  ctx.putImageData(data, 0, 0);
  return tile.toDataURL();
}

const grain = document.createElement("div");
grain.className = "grain";
grain.setAttribute("aria-hidden", "true");
grain.style.backgroundImage = `url(${buildGrainTile()})`;
document.body.appendChild(grain);
