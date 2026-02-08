import React, { useEffect, useState, useRef } from "react";
import NewsCard from "./NewsCard.js";

export default function Feed({ apiBase, endpoint, onTitleClick }) {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);

  useEffect(() => {
    setNews([]);
    setPage(1);
    loadMore();
    // eslint-disable-next-line
  }, [endpoint]);

  function loadMore() {
    if (loading) return;
    setLoading(true);
    fetch(`${apiBase}/${endpoint}?page=${page}`)
      .then(r => r.json())
      .then(data => {
        setNews(n => [...n, ...data]);
        setPage(p => p + 1);
        setLoading(false);
      });
  }

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom) loadMore();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [news, loading]);

  return (
    <div className="feed">
      {news.map(item => (
        <NewsCard key={item.id} news={item} onTitleClick={onTitleClick} />
      ))}
      <div ref={loader}>{loading && <div className="loader">Loading...</div>}</div>
    </div>
  );
}
