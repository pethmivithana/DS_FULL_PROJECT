// src/pages/MenuPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MenuItemCard from '../components/MenuItemCard';
import CategoryFilter from '../components/CategoryFilter';

// Mock data - replace with API calls
import { restaurants, menuItems } from '../data/mockData';

const MenuPage = () => {
  const { id } = useParams();
  const { currentTheme } = useTheme();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    // Find restaurant by ID
    const foundRestaurant = restaurants.find(r => r.id === parseInt(id));
    setRestaurant(foundRestaurant);
    
    // Get menu items for this restaurant
    const restaurantItems = menuItems.filter(item => item.restaurantId === parseInt(id));
    setItems(restaurantItems);
    setFilteredItems(restaurantItems);
  }, [id]);
  
  // Extract unique categories from menu items
  const categories = items.length > 0 
    ? [...new Set(items.map(item => item.category))]
    : [];
  
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);
  
  if (!restaurant) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center mb-2">
              <span className="mr-2">{restaurant.rating} ★</span>
              <span className="mr-2">•</span>
              <span>{restaurant.cuisine}</span>
            </div>
            <p className="text-sm">{restaurant.address}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-3/4">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          
          {filteredItems.length > 0 ? (
            <div className="space-y-6">
              {filteredItems.map(item => (
                <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No items found in this category.</p>
            </div>
          )}
        </div>
        
        <div className="md:w-1/4 mt-6 md:mt-0">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-4">
            <h3 className="font-bold text-gray-800 mb-2">Restaurant Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {restaurant.deliveryTime} min delivery time
              </p>
              <p>
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {restaurant.deliveryFee} delivery fee
              </p>
              <p>
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {restaurant.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;