window.addEventListener("pageshow", (event) => {
  if (event.persisted && !location.hash) window.scrollTo(0, 0);
});

// section links scroll without putting #projects / #socials in the url
document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });
});

// deep links (e.g. /#projects from the 404 page) still land on the section, then the hash is dropped
if (location.hash) {
  window.addEventListener("load", () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({ behavior: "instant" });
    history.replaceState(null, "", location.pathname + location.search);
  });
}

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

[...document.querySelectorAll(".hero-lede, .section-kicker")].forEach((el, i) => {
  setTimeout(() => scrambleText(el, 900), 420 + i * 150);
});

setInterval(() => {
  if (document.hidden) return;
  const kickers = document.querySelectorAll(".section-kicker");
  scrambleText(kickers[(Math.random() * kickers.length) | 0], 520);
}, 11000);

const heroTitle = document.querySelector(".hero h1");

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
    if (!channels.length) return;
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
  };

  return burst;
}

const avatarBurst = avatarGlitch();

scheduleGlitch(() => {
  burstTitle(heroTitle);
  if (avatarBurst) avatarBurst();
});
