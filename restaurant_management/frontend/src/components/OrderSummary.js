// src/components/OrderSummary.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const OrderSummary = ({ showCheckoutButton = true, onCheckout = () => {} }) => {
  const { currentTheme } = useTheme();
  const { cart, getTotalPrice, restaurant } = useCart();
  
  const deliveryFee = restaurant ? parseFloat(restaurant.deliveryFee.replace('$', '')) : 0;
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + deliveryFee + tax;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      
      {restaurant && (
        <div className="mb-4 pb-4 border-b">
          <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
          <p className="text-sm text-gray-600">{restaurant.address}</p>
        </div>
      )}
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between font-bold text-lg text-gray-800 border-t pt-4">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      
      {showCheckoutButton && (
        <button 
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-full mt-6 py-3 rounded-lg text-white font-medium ${
            cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : currentTheme.button
          }`}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default OrderSummary;