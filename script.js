const year = String(new Date().getFullYear());
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = year;
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });
});

const spyLinks = Array.from(document.querySelectorAll(".site-nav a"));
const spySections = spyLinks
  .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  .filter(Boolean);

if ("IntersectionObserver" in window && spySections.length) {
  const visible = new Set();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const current = spySections.find((section) => visible.has(section.id));
      spyLinks.forEach((l) => {
        l.classList.toggle(
          "active",
          Boolean(current) && l.getAttribute("href") === `#${current.id}`,
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  spySections.forEach((section) => spy.observe(section));
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
