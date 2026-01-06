async function getData() {
  try {
    const response = await fetch(
      "https://api.lanyard.rest/v1/users/1301345826143997954"
    );
    const data = await response.json();

    const dc = data.data.discord_user;
    const activities = data.data.activities;
    const copyid = document.querySelector(".copyid");
    const id = "1301345826143997954";

    document.querySelector(".imgpfp").src = document.querySelector(
      ".discordpfp"
    ).src = `https://cdn.discordapp.com/avatars/1301345826143997954/${dc.avatar}`;
    document.querySelector(".imgdec").src = document.querySelector(
      ".discorddec"
    ).src = `https://cdn.discordapp.com/avatar-decoration-presets/${dc.avatar_decoration_data.asset}.png`;

    if (data.data.discord_user.display_name == null) {
      document.querySelector(".displayname").innerHTML =
        data.data.discord_user.username;
    } else {
      document.querySelector(".displayname").innerHTML =
        data.data.discord_user.display_name;
    }

    document.querySelector(
      ".guild"
    ).innerHTML = `<img src='https://cdn.discordapp.com/clan-badges/955489230828748880/${data.data.discord_user.primary_guild.badge}.png' /><span>${data.data.discord_user.primary_guild.tag}</span>`;

    const statusIndex = activities.findIndex((item) => item.id === "custom");

    if (statusIndex !== -1) {
      document.querySelector(".status").innerHTML =
        data.data.activities[statusIndex].state;
    }

    copyid.innerHTML = `<img class='id' src='./img/id.png' /> Copy User ID`;
    copyid.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(id);
        alert("ID copied");
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    });
    document.querySelector(".copy").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.data.discord_user.username);
        alert("Discord username copied");
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

getData();

document.querySelector(".media").onmousemove = (e) => {
  for (const card of document.querySelectorAll(".card")) {
    const rect = card.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }
};

const urls = [
  "https://www.instagram.com/xxhvsh/",
  "https://medal.tv/u/xhvsh/?invite=ur-MSx6Nk4sMTk4ODYxMDk0",
  "https://www.youtube.com/@xhvsh",
  "https://www.twitch.tv/xhvsh_/about",
  "https://github.com/xhvsh",
  "https://t.me/xxhvsh",
  "https://steamcommunity.com/id/xhvsh/",
  "https://open.spotify.com/user/31eexkmyghhfiomdqy7ejvuchkqa?si=14c1428f332240cc",
  "https://www.tiktok.com/@xhvsh_",
  "https://namemc.com/profile/xhvsh",
];

document.querySelectorAll(".card").forEach((card, index) => {
  if (urls[index]) {
    card.addEventListener("click", () => {
      window.open(urls[index], "_blank");
    });
  }
});
