import React, { useEffect, useState } from "react";

const preset = [
  { label: "Breaking", value: "breaking" },
  { label: "Technology", value: "technology" },
  { label: "Geopolitics", value: "geopolitics" },
  { label: "Markets", value: "markets" },
  { label: "International", value: "international" }
];

export default function CategoryMenu({ selected, onSelect, apiBase }) {
  // For future, fetch from backend /api/meta if desired
  return (
    <nav className="category-menu">
      {preset.map(cat => (
        <button
          key={cat.value}
          className={selected === cat.value ? "menu-btn selected" : "menu-btn"}
          onClick={() => onSelect(cat.value)}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
