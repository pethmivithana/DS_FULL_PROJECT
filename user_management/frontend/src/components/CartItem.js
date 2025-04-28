// src/components/CartItem.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { currentTheme } = useTheme();
  const { addToCart, removeFromCart, restaurant } = useCart();
  
  return (
    <div className="flex items-center py-4 border-b">
      <div className="w-16 h-16 mr-4">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
      </div>
      <div className="flex-grow">
        <h3 className="font-medium text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => removeFromCart(item.id)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </button>
        <span className="mx-3 text-gray-700">{item.quantity}</span>
        <button
          onClick={() => addToCart(item, restaurant)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${currentTheme.button}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;