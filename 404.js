const columns = [...document.querySelectorAll(".column")];
const slotEl = document.querySelector(".slot");
const pathEl = document.getElementById("path");
const respin = document.getElementById("respin");
let spinUntil = 0;

pathEl.textContent = location.pathname === "/" ? "/lost-page/" : location.pathname;

function spin() {
  spinUntil = performance.now() + 3100;
  slotEl.classList.remove("glitch-on");
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

[
  [document.querySelector(".kicker"), 380],
  [document.querySelector(".lede"), 620],
].forEach(([el, delay]) => {
  setTimeout(() => scrambleText(el, 850), delay);
});

setInterval(() => {
  if (!document.hidden) scrambleText(document.querySelector(".kicker"), 450);
}, 10000);

const missingTitle = document.getElementById("missing-title");

function fireSlotBurst() {
  const settled = performance.now() >= spinUntil;
  slotEl.classList.remove("glitch-on");
  void slotEl.offsetWidth;
  slotEl.classList.add("burst");
  if (settled) slotEl.classList.add("glitch-on");
  setTimeout(() => slotEl.classList.remove("burst", "glitch-on"), 560);
}

scheduleGlitch(() => {
  burstTitle(missingTitle);
  fireSlotBurst();
});
