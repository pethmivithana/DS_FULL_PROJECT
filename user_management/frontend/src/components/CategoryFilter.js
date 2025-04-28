// src/components/CategoryFilter.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }) => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'all'
              ? `${currentTheme.primary} text-white`
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === category
                ? `${currentTheme.primary} text-white`
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;