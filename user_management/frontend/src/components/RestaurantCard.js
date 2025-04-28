// src/components/RestaurantCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const RestaurantCard = ({ restaurant }) => {
  const { currentTheme } = useTheme();
  
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-48 overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
            <span className={`${currentTheme.primary} text-white text-sm px-2 py-1 rounded-full`}>
              {restaurant.rating} ★
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{restaurant.deliveryTime} min</span>
            <span className="text-gray-500">{restaurant.deliveryFee}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;