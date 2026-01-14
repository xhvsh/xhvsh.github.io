let socials = [
  { name: "Discord", link: "discord.com/users/1301345826143997954" },
  { name: "Instagram", link: "instagram.com/xxhvsh" },
  { name: "Medal", link: "medal.tv/u/xhvsh" },
  { name: "YouTube", link: "youtube.com/@xhvsh" },
  { name: "Twitch", link: "twitch.tv/xhvsh_/about" },
  { name: "GitHub", link: "github.com/xhvsh" },
  { name: "Telegram", link: "t.me/xxhvsh" },
  { name: "Steam", link: "steamcommunity.com/id/xhvsh" },
  { name: "Spotify", link: "open.spotify.com/user/31eexkmyghhfiomdqy7ejvuchkqa" },
  { name: "TikTok", link: "tiktok.com/@xhvsh_" },
  { name: "NameMC", link: "namemc.com/xhvsh" },
];

const links = document.querySelector(".links");
socials.forEach((s) => {
  const lightVar = `--${s.name.toLowerCase()}-light`;
  const darkVar = `--${s.name.toLowerCase()}-dark`;
  const extraVar = s.name === "TikTok" || s.name === "Instagram" ? `--${s.name.toLowerCase()}-extra` : "";

  links.insertAdjacentHTML(
    "beforeend",
    `
    <a class="media" href="https://${s.link}" target="_blank" data-light="${lightVar}" data-dark="${darkVar}" ${extraVar ? `data-extra="${extraVar}"` : ""}}>
      <img src="./img/${s.name.toLowerCase()}.webp" loading="lazy" />
      <div class="popup">${s.name}</div>
      <img class="arrow" src="./img/arrow.webp" loading="lazy" />
    </a>
    `
  );
});

const elements = [document.querySelector(".profile"), ...document.querySelectorAll(".media")];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const ratio = entry.intersectionRatio;

      if (ratio > 0) {
        entry.target.classList.add("show");
        entry.target.style.opacity = ratio.toFixed(2);
      } else {
        entry.target.classList.remove("show");
        entry.target.style.opacity = 0;
      }
    });
  },
  {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100),
  }
);

requestAnimationFrame(() => {
  elements.forEach((el) => observer.observe(el));
});

// mouse trailer that jumps onto elements when you hover them

const trailer = document.querySelector(".trailer");
const mediaEls = document.querySelectorAll(".media");

let mouseX = 0;
let mouseY = 0;
let hoveredMedia = null;

// tracking the mouse

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// basically checking what element is targetted by cursor

mediaEls.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    hoveredMedia = el;

    const lightColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.light).trim();
    const darkColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.dark).trim();

    let gradient;

    if (el.dataset.extra) {
      const extraColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.extra).trim();
      gradient = `linear-gradient(135deg, ${lightColor} 0%, ${extraColor} 50%, ${darkColor} 100%)`;
    } else {
      gradient = `linear-gradient(135deg, ${lightColor} 0%, ${darkColor} 100%)`;
    }

    trailer.style.background = gradient;
  });

  el.addEventListener("mouseleave", () => {
    hoveredMedia = null;

    trailer.style.background = `linear-gradient(135deg, #fff, #fff)`;
  });
});

// looping the animation

function updateTrailer() {
  let x, y;

  if (hoveredMedia) {
    const rect = hoveredMedia.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = mouseX - cx;
    const dy = mouseY - cy;

    const len = Math.hypot(dx, dy) || 1;

    const offset = 4; // distance from center
    const ox = (dx / len) * offset;
    const oy = (dy / len) * offset;

    x = cx + ox - trailer.offsetWidth / 2;
    y = cy + oy - trailer.offsetHeight / 2;

    trailer.classList.add("hovering");
  } else {
    x = mouseX - trailer.offsetWidth / 2;
    y = mouseY - trailer.offsetHeight / 2;

    trailer.classList.remove("hovering");
  }

  trailer.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(updateTrailer);
}

requestAnimationFrame(updateTrailer);

// smaller screens handling

const mediaQuery = window.matchMedia("(max-width: 420px)");

function updateMediaBackgrounds(e) {
  document.querySelectorAll(".media").forEach((el) => {
    if (e.matches) {
      const lightColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.light).trim();
      const darkColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.dark).trim();

      let gradient;
      if (el.dataset.extra) {
        const extraColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.extra).trim();
        gradient = `linear-gradient(135deg, ${lightColor} 0%, ${extraColor} 50%, ${darkColor} 100%)`;
      } else {
        gradient = `linear-gradient(135deg, ${lightColor} 0%, ${darkColor} 100%)`;
      }

      el.style.background = gradient;
    } else {
      el.style.background = "transparent";
    }
  });
}

updateMediaBackgrounds(mediaQuery);
mediaQuery.addEventListener("change", updateMediaBackgrounds);
