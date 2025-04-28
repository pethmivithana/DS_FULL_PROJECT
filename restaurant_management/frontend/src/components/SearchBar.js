// src/components/SearchBar.js
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const { currentTheme } = useTheme();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search restaurants or cuisines..."
        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
        style={{ focusRing: currentTheme.text }}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 px-4 text-white rounded-r-lg"
        style={{ background: currentTheme.primary }}
      >
        Search
      </button>
      <svg
        className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </form>
  );
};

export default SearchBar;