module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400");

  try {
    const steam = await fetch("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "itemcount=1&publishedfileids[0]=3738413378"
    });
    const json = await steam.json();
    const file = json.response.publishedfiledetails[0];
    if (!file || file.result !== 1) throw new Error("steam error");
    res.status(200).json({ subscribers: file.subscriptions, lifetime: file.lifetime_subscriptions, favorited: file.favorited });
  } catch (e) {
    res.status(502).json({ error: "steam unavailable" });
  }
};
