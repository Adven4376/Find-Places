import { useState } from "react";


const categories = [
  "ALL",
  "PG",
  "RENTAL",
  "RESTAURANT",
  "DUSTBIN",
  "FUNCTION_HALL",
  "CURRY_POINT"
];

export default function CategoryFilter({ onSelect }) {
  const [selected, setSelected] = useState("ALL");

  const handleChange = (category) => {
    setSelected(category);
    onSelect(category);
  };

  return (
    <div className="absolute top-6 left-6 z-[1000] bg-white dark:bg-gray-900 shadow-lg rounded-xl p-3">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}