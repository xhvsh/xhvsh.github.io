const year = String(new Date().getFullYear());
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = year;
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
