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

const tick = () => {
  clockEl.textContent = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
tick();
setInterval(tick, 1000);

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
