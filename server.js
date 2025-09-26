const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Scrape product from Taobao/1688
app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing product URL" });

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    // Basic selectors — may need adjusting per site
    const title = $("title").text().trim();
    const images = [];
    $("img").each((i, el) => {
      let src = $(el).attr("src");
      if (src && !src.startsWith("data:")) images.push(src);
    });

    res.json({
      title,
      images: [...new Set(images)].slice(0, 10),
      source: url,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Scraping failed", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Taobao/1688 Scraper is running!");
});

app.listen(PORT, () => {
  console.log(`Scraper running on port ${PORT}`);
});
