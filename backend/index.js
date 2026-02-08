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
    if (!results.length) {
      console.error("[ERROR] All feeds empty or unreachable for 'breaking' news.");
      return res.status(500).json({ error: "Failed to fetch breaking news." });
    }
    res.json(results);
  } catch (err) {
    console.error("[FATAL] Fetching breaking news failed:", err.message || err);
    res.status(500).json({ error: "Failed to fetch breaking news." });
  }
});

// Category feed
app.get("/api/category/:cat", async (req, res) => {
  try {
    const results = await fetchAllFeeds(req.params.cat, 20);
    if (!results.length) {
      console.error(`[ERROR] All feeds empty or unreachable for category '${req.params.cat}'.`);
      return res.status(500).json({ error: "Failed to fetch category news." });
    }
    res.json(results);
  } catch (err) {
    console.error(`[FATAL] Fetching news for category '${req.params.cat}' failed:`, err.message || err);
    res.status(500).json({ error: "Failed to fetch category news." });
  }
});

// Single article summary (matches feed entry)
app.get("/api/article", async (req, res) => {
  const { link, source } = req.query;
  if (!link || !source) return res.status(400).json({ error: "Missing params" });

  const src = sources.find(s => s.name === source);
  if (!src) return res.status(404).json({ error: "Source not found" });

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
      if (!matchRss) {
        console.warn(`[WARN] Source "${src.name}" does not provide "${category}" category RSS`);
        return;
      }
      try {
        const entries = await fetchRss(matchRss.url);
        if (!entries.length) {
          console.error(`[WARN] No entries fetched for '${src.name}' / '${category}' from ${matchRss.url}`);
        }
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
      } catch (err) {
        console.error(`[ERROR] Failed to fetch from ${src.name} (${matchRss.url}): ${err.message || err}`);
      }
    })
  );
  // Remove dups & sort by most recent pubDate (fallback to insertion order)
  const unique = {};
  articles.forEach(a => unique[a.id] = a);
  return Object.values(unique)
    .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
    .slice(0, limit);
}

async function fetchRss(url) {
  const items = [];
  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 12000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SuperNewsBot/1.0)' }
    });
    return await new Promise((resolve, reject) => {
      const feedparser = new FeedParser();
      response.data.pipe(feedparser);

      feedparser.on("error", reject);
      feedparser.on("readable", function () {
        let item;
        while ((item = this.read())) items.push(item);
      });
      feedparser.on("end", () => resolve(items));
    });
  } catch (err) {
    console.error(`[ERROR] Unable to fetch or parse RSS url: ${url} — ${err.message || err}`);
    return [];
  }
}

function extractImage(entry) {
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

function formatHookTitle(raw) {
  return (raw || "").trim();
}

// ----------

const PORT = process.env.PORT || 5032;
app.listen(PORT, () => console.log(`News backend running at http://localhost:${PORT}`));
