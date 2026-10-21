document.documentElement.classList.add("js");

const columns = [...document.querySelectorAll(".column")];
const pathEl = document.getElementById("path");
const yearEl = document.getElementById("year");
const respin = document.getElementById("respin");

pathEl.textContent = location.pathname === "/" ? "/lost-page/" : location.pathname;
yearEl.textContent = new Date().getFullYear();

function spin() {
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
