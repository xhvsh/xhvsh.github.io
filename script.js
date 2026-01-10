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

for (let i = 0; i < socials.length; i++) {
  document.querySelector(".links").innerHTML += `
    <a class='media' href='https://${socials[i].link}' target='_blank'>
      <img src='./img/${socials[i].name.toLowerCase()}.webp' loading="lazy" />
      <div class='popup'>${socials[i].name}</div>
    </a>
  `;
}

document.querySelector('.profile').classList.add('show')

const items = document.querySelectorAll('.media')
items.forEach((e,index) => {
  setTimeout(() => {
    e.classList.add('show')
  }, index * 100 + 100);
})