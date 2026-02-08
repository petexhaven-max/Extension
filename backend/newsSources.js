export default [
  {
    name: "BBC",
    logo: "https://news.files.bbci.co.uk/include/newsspec/19854/assets/app-project-assets/bbc-news.png",
    homepage: "https://bbc.com/news",
    rss: [
      { category: "breaking", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
      { category: "technology", url: "http://feeds.bbci.co.uk/news/technology/rss.xml" },
      { category: "markets", url: "https://feeds.bbci.co.uk/news/business/market_data/rss.xml" },
      { category: "geopolitics", url: "http://feeds.bbci.co.uk/news/world/asia/rss.xml" }
    ]
  },
  {
    name: "Reuters",
    logo: "https://s1.reutersmedia.net/resources_v2/images/favicon/favicon-96x96.png",
    homepage: "https://reuters.com/",
    rss: [
      { category: "breaking", url: "http://feeds.reuters.com/reuters/worldNews" },
      { category: "technology", url: "http://feeds.reuters.com/reuters/technologyNews" },
      { category: "markets", url: "http://feeds.reuters.com/reuters/businessNews" },
      { category: "geopolitics", url: "http://feeds.reuters.com/Reuters/worldNews" }
    ]
  },
  {
    name: "Bloomberg",
    logo: "https://assets.bwbx.io/s3/javelin/public/hub/images/favicon-bb-32.png",
    homepage: "https://bloomberg.com/",
    rss: [
      { category: "breaking", url: "https://www.bloomberg.com/feed/podcast/etf-report.xml" }, // limited free RSS
      { category: "markets", url: "https://www.bloomberg.com/feed/podcast/bloomberg-markets.xml" }
    ]
  },
  {
    name: "Al Jazeera",
    logo: "https://www.aljazeera.com/wp-content/themes/aljazeera/website/images/aljazeera-icon.png",
    homepage: "https://aljazeera.com/",
    rss: [
      { category: "breaking", url: "https://www.aljazeera.com/xml/rss/all.xml" },
      { category: "technology", url: "https://www.aljazeera.com/xml/rss/technology.xml" },
      { category: "markets", url: "https://www.aljazeera.com/xml/rss/economy.xml" }
    ]
  }
];
