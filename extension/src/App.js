import React, { useState, useEffect } from "react";
import Feed from "./Feed.js";
import CategoryMenu from "./CategoryMenu.js";
import SummaryPage from "./SummaryPage.js";

const API_BASE = "https://extension-1-ejo1.onrender.com/api"; // <-- your backend URL

export default function App() {
  const [view, setView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("breaking");
  const [summaryNews, setSummaryNews] = useState(null);

  function handleTitleClick(news) {
    setSummaryNews(news);
    setView("summary");
  }

  function handleCategoryClick(category) {
    setSelectedCategory(category);
    setView(category === "breaking" ? "home" : "category");
  }

  function handleBack() {
    setView("home");
    setSummaryNews(null);
    setSelectedCategory("breaking");
  }

  return (
    <div className="fullscreen">
      <CategoryMenu
        selected={selectedCategory}
        onSelect={handleCategoryClick}
        apiBase={API_BASE}
      />
      {view === "home" && (
        <Feed
          apiBase={API_BASE}
          endpoint="breaking"
          onTitleClick={handleTitleClick}
        />
      )}
      {view === "category" && (
        <Feed
          apiBase={API_BASE}
          endpoint={`category/${selectedCategory}`}
          onTitleClick={handleTitleClick}
        />
      )}
      {view === "summary" && summaryNews && (
        <SummaryPage news={summaryNews} onBack={handleBack} />
      )}
    </div>
  );
}
