let socials = [
  { name: "Discord", link: "discord.com/users/1301345826143997954" },
  { name: "Instagram", link: "instagram.com/xxhvsh" },
  { name: "Medal", link: "medal.tv/u/xhvsh" },
  { name: "YouTube", link: "youtube.com/@xhvsh" },
  { name: "Twitch", link: "twitch.tv/xhvsh_" },
  { name: "GitHub", link: "github.com/xhvsh" },
  { name: "Telegram", link: "t.me/xxhvsh" },
  { name: "Steam", link: "steamcommunity.com/id/xhvsh" },
  { name: "Spotify", link: "open.spotify.com/user/31eexkmyghhfiomdqy7ejvuchkqa" },
  { name: "TikTok", link: "tiktok.com/@xhvsh_" },
  { name: "NameMC", link: "namemc.com/xhvsh" },
  { name: "Modrinth", link: "modrinth.com/user/xhvsh" },
];

const links = document.querySelector(".links");
socials.forEach((s) => {
  const lightVar = `--${s.name.toLowerCase()}-light`;
  const darkVar = `--${s.name.toLowerCase()}-dark`;
  const extraVar = s.name === "TikTok" || s.name === "Instagram" ? `--${s.name.toLowerCase()}-extra` : "";

  links.insertAdjacentHTML(
    "beforeend",
    `
    <a class="media" href="https://${s.link}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}" data-light="${lightVar}" data-dark="${darkVar}" ${extraVar ? `data-extra="${extraVar}"` : ""} style="--media-light: var(${lightVar}); --media-dark: var(${darkVar});">
      <img src="./img/${s.name.toLowerCase()}.webp" alt="" aria-hidden="true" loading="lazy" />
      <div class="popup">${s.name}</div>
      <img class="arrow" src="./img/arrow.webp" alt="" aria-hidden="true" loading="lazy" />
    </a>
    `,
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
  },
);

requestAnimationFrame(() => {
  elements.forEach((el) => observer.observe(el));
});

const mediaQuery = window.matchMedia("(max-width: 520px)");

function getMediaGradient(el) {
  const lightColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.light).trim();
  const darkColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.dark).trim();

  if (el.dataset.extra) {
    const extraColor = getComputedStyle(document.documentElement).getPropertyValue(el.dataset.extra).trim();
    return `linear-gradient(135deg, ${lightColor} 0%, ${extraColor} 50%, ${darkColor} 100%)`;
  }

  return `linear-gradient(135deg, ${lightColor} 0%, ${darkColor} 100%)`;
}

function updateMediaBackgrounds(e) {
  document.querySelectorAll(".media").forEach((el) => {
    el.style.background = e.matches ? getMediaGradient(el) : "";
  });
}

updateMediaBackgrounds(mediaQuery);
mediaQuery.addEventListener("change", updateMediaBackgrounds);
