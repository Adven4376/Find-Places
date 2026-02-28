import { useState, useEffect } from "react";

export default function SearchBar({ places, onFiltered }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!query) {
        onFiltered(null);
      } else {
        const filtered = places.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        onFiltered(filtered);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query, places, onFiltered]);

  return (
    <div className="absolute top-6 left-60 z-[1000] bg-white dark:bg-gray-900 shadow-lg rounded-xl p-3">
      <input
        type="text"
        placeholder="Search place name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-56 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}