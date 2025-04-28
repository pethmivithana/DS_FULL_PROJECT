// src/pages/RestaurantPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import CategoryFilter from '../components/CategoryFilter';

// Mock data - replace with API calls
import { restaurants } from '../data/mockData';

const RestaurantPage = () => {
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  
  // Extract unique categories
  const categories = [...new Set(restaurants.map(restaurant => restaurant.cuisine))];
  
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants(
        restaurants.filter(restaurant => restaurant.cuisine === selectedCategory)
      );
    }
  }, [selectedCategory]);
  
  const handleSearch = (query) => {
    const lowercaseQuery = query.toLowerCase();
    
    if (!query) {
      // If search is cleared, respect the category filter
      if (selectedCategory === 'all') {
        setFilteredRestaurants(restaurants);
      } else {
        setFilteredRestaurants(
          restaurants.filter(restaurant => restaurant.cuisine === selectedCategory)
        );
      }
      return;
    }
    
    // Filter by search query AND category if one is selected
    setFilteredRestaurants(
      restaurants.filter(restaurant => {
        const matchesSearch = 
          restaurant.name.toLowerCase().includes(lowercaseQuery) ||
          restaurant.cuisine.toLowerCase().includes(lowercaseQuery);
          
        const matchesCategory = 
          selectedCategory === 'all' || restaurant.cuisine === selectedCategory;
          
        return matchesSearch && matchesCategory;
      })
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">All Restaurants</h1>
      
      <SearchBar onSearch={handleSearch} />
      
      <CategoryFilter 
        categories={categories} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No restaurants found. Try another search term.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;