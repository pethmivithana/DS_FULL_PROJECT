// src/components/MenuItemCard.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const MenuItemCard = ({ item, restaurant }) => {
  const { currentTheme } = useTheme();
  const { addToCart } = useCart();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-1/3 h-48 md:h-auto">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-4 md:w-2/3 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-gray-800">${item.price.toFixed(2)}</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(item, restaurant);
            }} 
            className={`${currentTheme.button} text-white px-4 py-2 rounded-full text-sm transition-colors duration-300`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;