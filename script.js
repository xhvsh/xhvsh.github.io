const projects = [
  {
    title: "Valorant Shop",
    url: "https://xhv.sh/valorant-shop",
    icon: '<img src="https://xhv.sh/valorant-shop/logo.png" alt="" aria-hidden="true" loading="lazy" />',
    status: "Live",
    description:
      "Discord app for your daily shop. Link a Riot account, see every shop in one place and get DM alerts for the night market, new bundles and wishlisted items.",
    tags: ["Discord app", "Valorant"],
  },
  {
    title: "Miaucraft",
    url: "https://miaucraft.vercel.app",
    icon: '<img src="https://miaucraft.vercel.app/img/icon.webp" alt="" aria-hidden="true" loading="lazy" />',
    status: "Live",
    description:
      "Live map and waypoint tool for the Miaucraft Minecraft server, with shared waypoints, screenshots and team access.",
    tags: ["Minecraft", "Live map"],
  },
  {
    title: "xhv.sh",
    url: "https://xhv.sh",
    icon: '<img src="./img/pfp.webp" alt="" aria-hidden="true" />',
    status: "Live",
    description: "This site. Every project and profile of mine, collected in one place.",
    tags: ["Website"],
  },
];

const socials = [
  { name: "Discord", link: "discord.com/users/1301345826143997954" },
  { name: "Instagram", link: "instagram.com/xxhvsh", extra: true },
  { name: "Medal", link: "medal.tv/u/xhvsh" },
  { name: "YouTube", link: "youtube.com/@xhvsh" },
  { name: "Twitch", link: "twitch.tv/xhvsh_" },
  { name: "GitHub", link: "github.com/xhvsh" },
  { name: "Telegram", link: "t.me/xxhvsh" },
  { name: "Steam", link: "steamcommunity.com/id/xhvsh" },
  { name: "Spotify", link: "open.spotify.com/user/31eexkmyghhfiomdqy7ejvuchkqa" },
  {
    name: "TikTok",
    link: "tiktok.com/@xhvsh_",
    gradient:
      "linear-gradient(120deg, rgba(0, 242, 234, 0.95) 0%, rgba(0, 242, 234, 0.3) 30%, rgba(0, 0, 0, 0) 55%, rgba(254, 44, 85, 0.3) 72%, rgba(254, 44, 85, 0.95) 100%), linear-gradient(#0d0d11, #0d0d11)",
  },
  { name: "NameMC", link: "namemc.com/xhvsh" },
  { name: "Modrinth", link: "modrinth.com/user/xhvsh" },
];

const projectGrid = document.getElementById("project-grid");
projects.forEach((p) => {
  projectGrid.insertAdjacentHTML(
    "beforeend",
    `
    <a class="project reveal" href="${p.url}" target="_blank" rel="noopener noreferrer">
      <div class="project-head">
        <span class="project-icon">${p.icon}</span>
        <i class="fa-solid fa-arrow-up-right-from-square project-arrow" aria-hidden="true"></i>
      </div>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.description}</p>
      <div class="project-meta">
        <span class="status"><span class="status-dot" aria-hidden="true"></span>${p.status}</span>
        <span class="tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</span>
      </div>
    </a>
    `,
  );
});

const linksGrid = document.getElementById("links-grid");
socials.forEach((s) => {
  const key = s.name.toLowerCase();
  const mediaBg =
    s.gradient ??
    `linear-gradient(135deg, ${
      s.extra
        ? `var(--${key}-light) 0%, var(--${key}-extra) 50%, var(--${key}-dark) 100%`
        : `var(--${key}-light) 0%, var(--${key}-dark) 100%`
    })`;

  linksGrid.insertAdjacentHTML(
    "beforeend",
    `
    <a class="media reveal" href="https://${s.link}" target="_blank" rel="noopener noreferrer"
       aria-label="${s.name}" style="--media-bg: ${mediaBg};">
      <img src="./img/${key}.webp" alt="" aria-hidden="true" loading="lazy" />
      <span class="media-name">${s.name}</span>
    </a>
    `,
  );
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
