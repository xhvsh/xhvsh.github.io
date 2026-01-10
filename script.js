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
  links.insertAdjacentHTML(
    "beforeend",
    `
    <a class="media" href="https://${s.link}" target="_blank">
      <img src="./img/${s.name.toLowerCase()}.webp" loading="lazy" />
      <div class="popup">${s.name}</div>
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
