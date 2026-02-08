import React from "react";

export default function NewsCard({ news, onTitleClick }) {
  return (
    <div className="news-card">
      <div className="logo-wrap">
        <a href={news.sourceHome} target="_blank" rel="noopener">
          <img className="source-logo" src={news.sourceLogo} alt={news.source} />
        </a>
      </div>
      <div className="news-content">
        <a
          className="news-title"
          href="#"
          onClick={e => {
            e.preventDefault();
            onTitleClick(news);
          }}
        >
          {news.title}
        </a>
        {news.image && (
          <img className="news-image" src={news.image} alt={news.title} loading="lazy" />
        )}
      </div>
    </div>
  );
}
