
import express from "express";
import cors from "cors";
import FeedParser from "feedparser";
import axios from "axios";
import { generateId, summarize } from "./utils.js";
import sources from "./newsSources.js";

const app = express();
app.use(cors());

// Helper: return all sources & categories
app.get("/api/meta", (req, res) => {
  const meta = sources.map(src => ({
    name: src.name,
    logo: src.logo,
    homepage: src.homepage,
    categories: src.rss.map(r => r.category)
  }));
  res.json(meta);
});

// Breaking news (HOME FEED)
app.get("/api/breaking", async (req, res) => {
  try {
    const results = await fetchAllFeeds("breaking", 15);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch breaking news." });
  }
});

// Category feed
app.get("/api/category/:cat", async (req, res) => {
  try {
    const results = await fetchAllFeeds(req.params.cat, 20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category news." });
  }
});

// Single article summary (matches feed entry)
app.get("/api/article", async (req, res) => {
  const { link, source } = req.query;
  if (!link || !source) return res.status(400).json({ error: "Missing params" });

  const src = sources.find(s => s.name === source);
  if (!src) return res.status(404).json({ error: "Source not found" });

  // Uses first matching feed
  const feedConfig = src.rss[0]; // always has at least one RSS
  const articles = await fetchRss(feedConfig.url);
  const article = articles.find(a => a.link === link);

  if (!article) return res.status(404).json({ error: "Article not found" });

  res.json({
    ...article,
    summary: summarize(article.summary || article.description || "", 400)
  });
});

// ---- Core RSS Parsing ----
async function fetchAllFeeds(category, limit = 10) {
  const articles = [];

  await Promise.all(
    sources.map(async (src) => {
      const matchRss = src.rss.find(r => r.category === category);
      if (!matchRss) return;
      const entries = await fetchRss(matchRss.url);
      entries.forEach(e => {
        const singleImg = extractImage(e);
        articles.push({
          id: generateId(e.title, e.link),
          source: src.name,
          sourceLogo: src.logo,
          sourceHome: src.homepage,
          title: formatHookTitle(e.title),
          summary: summarize(e.summary || e.description || "", 200),
          image: singleImg,
          link: e.link
        });
      });
    })
  );

  // Remove dups & sort by recent (pubDate, fallback to order)
  const unique = {};
  articles.forEach(a => unique[a.id] = a);
  return Object.values(unique)
    .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
    .slice(0, limit);
}

// Fetch & parse a single RSS feed URL
async function fetchRss(url) {
  const items = [];
  const response = await axios.get(url, { responseType: "stream" });
  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser();
    response.data.pipe(feedparser);

    feedparser.on("error", reject);
    feedparser.on("readable", function () {
      let item;
      while ((item = this.read())) items.push(item);
    });
    feedparser.on("end", () => resolve(items));
  });
}

function extractImage(entry) {
  // Scan various fields for one usable image URL
  const candidates = [
    entry.image && entry.image.url,
    entry.enclosures && entry.enclosures.length && entry.enclosures[0].url,
    entry['media:content'] && entry['media:content']['@'] && entry['media:content']['@'].url
  ].concat(extractImagesFromDescription(entry.description || ""));

  return (candidates.find(Boolean) || "");
}

function extractImagesFromDescription(desc) {
  const imgRegex = /<img[^>]+src="([^">]+)"/gi;
  const matches = [];
  let m;
  while ((m = imgRegex.exec(desc))) {
    matches.push(m[1]);
  }
  return matches;
}

// Title -> high-impact, concise, "doomscroll" hook
function formatHookTitle(raw) {
  // For MVP: just trim and upper/lowercase. Can prepend emojis, detectors etc. if desired.
  return (raw || "").trim();
}

// ----------

const PORT = process.env.PORT || 5032;
app.listen(PORT, () => console.log(`News backend running at http://localhost:${PORT}`));
