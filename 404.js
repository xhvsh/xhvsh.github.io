const columns = document.querySelectorAll(".column");
const counts = [30, 50, 70];
const target = [24, 40, 64];
const step = "clamp(4rem, 40vw, 12rem)";

columns.forEach((col, index) => {
  const totalSpans = counts[index];

  for (let i = 0; i < totalSpans; i++) {
    const span = document.createElement("span");
    span.innerHTML = i % 10;
    col.appendChild(span);
  }

  col.offsetHeight;

  setTimeout(() => {
    col.style.transform = `translateY(calc(-${target[index]} * ${step}))`;
    col.style.opacity = "1";
  }, index * 300);
});
