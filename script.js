const year = String(new Date().getFullYear());
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = year;
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clockEl = document.getElementById("clock");
if (clockEl) {
  const clockSpans = [];
  for (let i = 0; i < 8; i++) clockSpans.push(clockEl.appendChild(document.createElement("span")));

  const timeChars = () =>
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).split("");

  const setTime = (chars, animate) => {
    chars.forEach((ch, i) => {
      if (clockSpans[i].textContent === ch) return;
      clockSpans[i].textContent = ch;
      if (animate && !reducedMotion) {
        clockSpans[i].animate(
          [
            { transform: "translateY(0.32em)", opacity: 0.25 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          { duration: 320, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
        );
      }
    });
  };

  setTime(timeChars(), false);
  setInterval(() => setTime(timeChars(), true), 1000);
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
