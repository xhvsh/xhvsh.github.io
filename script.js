if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("pageshow", () => window.scrollTo(0, 0));

const year = String(new Date().getFullYear());
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = year;
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const workshopTag = document.getElementById("workshop-tag");
const workshopCount = document.getElementById("workshop-count");
if (workshopTag && workshopCount) {
  fetch("/api/workshop")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data || typeof data.subscribers !== "number") return;
      workshopCount.textContent = data.subscribers.toLocaleString("en-US");
      workshopTag.hidden = false;
    })
    .catch(() => {});
}

const vsStats = document.getElementById("vs-stats");
const vsAccounts = document.getElementById("vs-accounts");
if (vsStats && vsAccounts) {
  fetch("/valorant-shop/api/stats")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data || !data.ok) return;
      if (typeof data.accounts === "number") vsAccounts.textContent = data.accounts.toLocaleString("en-US");
      vsStats.hidden = false;
    })
    .catch(() => {});
}

const clockEl = document.getElementById("clock");
if (clockEl) {
  const pre = clockEl.appendChild(document.createElement("span"));
  pre.className = "clock-side";
  pre.textContent = "it's";
  const strip = clockEl.appendChild(document.createElement("span"));
  strip.className = "digit-strip";
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

  const timeChars = () =>
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Warsaw",
    }).split("");

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
    const chars = timeChars();
    chars.forEach((ch, i) => setDigit(digits[i], ch, animate));
  };

  setTime(false);
  setInterval(() => setTime(true), 1000);
}

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

const CIPHER = "01<>/\\[]{}#$%&*+-=~?";

function scrambleText(el, motionOK, duration) {
  if (!el || !motionOK || el.dataset.scrambling === "1") return;
  el.dataset.scrambling = "1";
  const final = Array.from(el.textContent);
  const start = performance.now();
  const run = (now) => {
    const t = (now - start) / duration;
    if (t >= 1) {
      el.textContent = final.join("");
      el.removeAttribute("data-scrambling");
      return;
    }
    const reveal = Math.floor(t * final.length);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      out += i < reveal || ch === " " ? ch : CIPHER[(Math.random() * CIPHER.length) | 0];
    }
    el.textContent = out;
    requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

[...document.querySelectorAll(".hero-lede, .section-kicker")].forEach((el, i) => {
  setTimeout(() => scrambleText(el, !reducedMotion, 900), 420 + i * 150);
});

setInterval(() => {
  const kickers = document.querySelectorAll(".section-kicker");
  scrambleText(kickers[(Math.random() * kickers.length) | 0], !reducedMotion, 520);
}, 11000);

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

const heroTitle = document.querySelector(".hero h1");
if (heroTitle) heroTitle.dataset.text = heroTitle.textContent;


function fireTitleBurst() {
  if (!heroTitle) return;
  heroTitle.classList.add("burst");
  setTimeout(() => heroTitle.classList.remove("burst"), 560);
}

function avatarGlitch() {
  const holder = document.querySelector(".hero-avatar");
  const img = holder && holder.querySelector("img");
  if (!holder || !img || reducedMotion) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "avatar-fx";
  canvas.setAttribute("aria-hidden", "true");
  holder.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const frame = document.createElement("canvas");
  const fctx = frame.getContext("2d");
  let channels = [];

  const build = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(img.clientWidth * dpr));
    const h = Math.max(1, Math.round(img.clientHeight * dpr));
    if (!w || !h) return false;
    canvas.width = frame.width = w;
    canvas.height = frame.height = h;
    for (let i = channels.length; i < 3; i++) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      channels.push(c);
    }
    const paints = ["#ff0000", "#00ff00", "#0000ff"];
    channels.forEach((c, i) => {
      c.width = w;
      c.height = h;
      const cx = c.getContext("2d");
      cx.globalCompositeOperation = "source-over";
      cx.clearRect(0, 0, w, h);
      cx.drawImage(img, 0, 0, w, h);
      cx.globalCompositeOperation = "multiply";
      cx.fillStyle = paints[i];
      cx.fillRect(0, 0, w, h);
      cx.globalCompositeOperation = "destination-in";
      cx.drawImage(img, 0, 0, w, h);
    });
    return true;
  };

  if (img.complete && img.naturalWidth) {
    build();
  } else {
    img.addEventListener("load", () => build(), { once: true });
  }

  const resizeDebounced = (() => {
    let t = 0;
    return () => {
      clearTimeout(t);
      t = setTimeout(build, 240);
    };
  })();
  window.addEventListener("resize", resizeDebounced);

  const burst = () => {
    if (!channels.length) {
      setTimeout(burst, 900);
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    const start = performance.now();
    const duration = 520;
    const run = (now) => {
      const e = Math.max(0, 1 - (now - start) / duration);
      if (e <= 0 || !w || !h) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const jy = () => (Math.random() - 0.5) * e * h * 0.025;
      const split = e * w * (0.018 + Math.random() * 0.02);
      fctx.globalCompositeOperation = "lighter";
      fctx.clearRect(0, 0, w, h);
      fctx.drawImage(channels[0], -split, jy());
      fctx.globalAlpha = 0.65;
      fctx.drawImage(channels[2], -split * 0.55, jy());
      fctx.globalAlpha = 1;
      fctx.drawImage(channels[1], 0, 0);
      fctx.drawImage(channels[2], split, jy());
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(frame, 0, 0);
      const tears = 2 + ((Math.random() * 4) | 0);
      for (let i = 0; i < tears; i++) {
        const sy = (Math.random() * (h - 4)) | 0;
        const sh = Math.max(2, Math.random() * h * 0.08);
        const dx = (Math.random() - 0.5) * w * 0.16 * e;
        ctx.drawImage(frame, 0, sy, w, sh, dx, sy, w, sh);
      }
      if (Math.random() < 0.6) {
        const bw = w * (0.12 + Math.random() * 0.18);
        const bh = h * (0.08 + Math.random() * 0.12);
        const sx = Math.random() * Math.max(1, w - bw);
        const sy = Math.random() * Math.max(1, h - bh);
        ctx.drawImage(
          frame,
          sx,
          sy,
          bw,
          bh,
          sx + (Math.random() - 0.5) * w * 0.12,
          sy + jy(),
          bw,
          bh,
        );
      }
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
    return true;
  };

  return burst;
}

const avatarBurst = avatarGlitch();

function scheduleGlitch() {
  setTimeout(() => {
    fireTitleBurst();
    if (avatarBurst && !reducedMotion) avatarBurst();
    scheduleGlitch();
  }, 1800 + Math.random() * 1600);
}
if (heroTitle || avatarBurst) {
  scheduleGlitch();
}
