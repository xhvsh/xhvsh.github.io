document.documentElement.classList.add("js");

const columns = [...document.querySelectorAll(".column")];
const slot = document.querySelector(".slot");
const pathEl = document.getElementById("path");
const yearEl = document.getElementById("year");
const respin = document.getElementById("respin");
const clockEl = document.getElementById("clock");
let glitchTimer = 0;

pathEl.textContent = location.pathname === "/" ? "/lost-page/" : location.pathname;
yearEl.textContent = new Date().getFullYear();

const reducedClock = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (clockEl) {
  const digits = [];
  for (let i = 0; i < 8; i++) {
    const slot = clockEl.appendChild(document.createElement("span"));
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
  clearTimeout(glitchTimer);
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

  glitchTimer = setTimeout(() => slot.classList.add("glitch-on"), 3800);
}

respin.addEventListener("click", spin);
spin();
