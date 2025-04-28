// src/pages/CartPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';

const CartPage = () => {
  const { cart, restaurant, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (!user) {
      navigate('/profile');
    } else {
      navigate('/checkout');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p className="text-xl font-medium text-gray-800 mb-2">Your cart is empty</p>
          <p className="text-gray-600 mb-6">Add items to your cart to see them here</p>
          <button 
            onClick={() => navigate('/restaurants')}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {restaurant?.name} ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </h2>
                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </button>
              </div>
              
              <div className="divide-y">
                {cart.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <OrderSummary onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;