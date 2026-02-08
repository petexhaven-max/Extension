import React from "react";

export default function SummaryPage({ news, onBack }) {
  return (
    <div className="summary-page">
      <button className="back-btn" onClick={onBack}>← Back to Feed</button>
      <div className="summary-header">
        <a href={news.sourceHome} target="_blank">
          <img src={news.sourceLogo} alt={news.source} className="source-logo" />
        </a>
        <span className="source-name">{news.source}</span>
        <a href={news.link} target="_blank" className="read-link">Read Original</a>
      </div>
      {news.image && (
        <img className="summary-image" src={news.image} alt={news.title} loading="lazy" />
      )}
      <div className="summary-title">{news.title}</div>
      <div className="summary-text">{news.summary}</div>
    </div>
  );
}
