import { useState, useEffect } from "react";

export default function SearchBar({ places, onFiltered, onGlobalLocation }) {

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ---------------- LOCAL DB SEARCH ---------------- */

  useEffect(() => {

    const delay = setTimeout(() => {

      if (!query) {
        onFiltered(null);
        setSuggestions([]);
        return;
      }

      const filtered = places.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );

      onFiltered(filtered);

    }, 300);

    return () => clearTimeout(delay);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, places]);

  /* ---------------- GLOBAL AUTOCOMPLETE ---------------- */

  useEffect(() => {

    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const abortController = new AbortController();

    const fetchSuggestions = async () => {

      try {

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
          { signal: abortController.signal }
        );

        const data = await res.json();

        setSuggestions(data.slice(0, 5));

      } catch (err) {

        if (err.name !== "AbortError") {
          console.error("Autocomplete error", err);
        }

      }

    };

    const delay = setTimeout(fetchSuggestions, 500);

    return () => {
      clearTimeout(delay);
      abortController.abort();
    };

  }, [query]);

  return (

    <div className="absolute top-6 left-60 z-[1000] bg-white dark:bg-gray-900 shadow-lg rounded-xl p-3 w-72">

      <input
        type="text"
        placeholder="Search any place..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full dark:bg-gray-800 dark:text-white"
      />

      {suggestions.length > 0 && (

        <div className="mt-2 bg-white dark:bg-gray-800 rounded shadow max-h-48 overflow-y-auto">

          {suggestions.map((s, i) => (

            <div
              key={i}
              className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              onClick={() => {

                const lat = parseFloat(s.lat);
                const lon = parseFloat(s.lon);

                onGlobalLocation({
                  lat,
                  lng: lon,
                  name: s.display_name
                });

                setQuery(s.display_name);
                setSuggestions([]);

              }}
            >
              📍 {s.display_name}
            </div>

          ))}

        </div>

      )}

    </div>

  );
}