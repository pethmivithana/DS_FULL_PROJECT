// src/pages/CheckoutPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderSummary from '../components/OrderSummary';

const CheckoutPage = () => {
  const { currentTheme } = useTheme();
  const { cart, restaurant, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect to login if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/profile');
    }
    if (cart.length === 0) {
      navigate('/restaurants');
    }
  }, [user, cart, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      // Reset cart and navigate to orders page
      clearCart();
      navigate('/orders');
    }, 2000);
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Delivery Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRing: currentTheme.primary }}
                  rows="3"
                  placeholder="Enter your full address"
                  required
                ></textarea>
              </div>
              
              <h2 className="text-xl font-bold mb-6 text-gray-800">Payment Information</h2>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <input
                    id="card"
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="h-4 w-4"
                  />
                 <label htmlFor="card" className="ml-2 text-gray-700">
                    Credit/Debit Card
                  </label>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    id="cash"
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="cash" className="ml-2 text-gray-700">
                    Cash on Delivery
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="mb-8 space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ focusRing: currentTheme.primary }}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiry">
                        Expiry Date
                      </label>
                      <input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ focusRing: currentTheme.primary }}
                        required
                      />
                    </div>
                    
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cvv">
                        CVV
                      </label>
                      <input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ focusRing: currentTheme.primary }}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isProcessing || deliveryAddress === ''}
                className={`w-full py-3 rounded-lg text-white font-medium ${
                  isProcessing || deliveryAddress === '' ? 'bg-gray-400 cursor-not-allowed' : currentTheme.button
                }`}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <OrderSummary showCheckoutButton={false} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;