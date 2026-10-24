document.documentElement.classList.add("js");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const columns = [...document.querySelectorAll(".column")];
const slot = document.querySelector(".slot");
const pathEl = document.getElementById("path");
const respin = document.getElementById("respin");
const clockEl = document.getElementById("clock");
let spinUntil = 0;

pathEl.textContent = location.pathname === "/" ? "/lost-page/" : location.pathname;
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const reducedClock = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    if (animate && !reducedClock) {
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

function spin() {
  spinUntil = performance.now() + 3100;
  slot.classList.remove("glitch-on");
  columns.forEach((column, index) => {
    const count = Number(column.dataset.count);
    const show = count - 1;

    column.style.transition = "none";
    column.style.opacity = "0";
    column.style.transform = "translateY(0)";
    column.textContent = "";

    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.textContent = i === show ? column.dataset.digit : String(Math.floor(Math.random() * 10));
      column.appendChild(span);
    }

    column.offsetHeight;

    setTimeout(() => {
      column.style.transition = "";
      column.style.opacity = "1";
      column.style.transform = `translateY(calc(-${show} * 1em))`;
    }, 80 + index * 280);
  });
}

respin.addEventListener("click", spin);
spin();

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

[
  [document.querySelector(".kicker"), 380],
  [document.querySelector(".lede"), 620],
].forEach(([el, delay]) => {
  setTimeout(() => scrambleText(el, !reducedClock, 850), delay);
});

setInterval(() => {
  scrambleText(document.querySelector(".kicker"), !reducedClock, 450);
}, 10000);

const missingTitle = document.getElementById("missing-title");

function fireTitleBurst() {
  if (!missingTitle) return;
  missingTitle.classList.add("burst");
  setTimeout(() => missingTitle.classList.remove("burst"), 560);
}

function fireSlotBurst() {
  const settled = performance.now() >= spinUntil;
  slot.classList.remove("glitch-on");
  void slot.offsetWidth;
  slot.classList.add("burst");
  if (settled) slot.classList.add("glitch-on");
  setTimeout(() => slot.classList.remove("burst", "glitch-on"), 560);
}

function scheduleGlitch() {
  setTimeout(() => {
    fireTitleBurst();
    fireSlotBurst();
    scheduleGlitch();
  }, 1800 + Math.random() * 1600);
}
if (!reducedClock) scheduleGlitch();

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
