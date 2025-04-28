// src/pages/OrdersPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Mock data
const mockOrders = [
  {
    id: 1,
    restaurantName: 'Burger Palace',
    restaurantImage: 'https://source.unsplash.com/FoyCKrXWQvc/800x800',
    items: [
      { name: 'Cheeseburger', quantity: 2 },
      { name: 'French Fries', quantity: 1 }
    ],
    total: 25.98,
    status: 'delivered',
    date: '2025-04-25T14:30:00',
    address: '123 Main St, Apt 4B, Cityville'
  },
  {
    id: 2,
    restaurantName: 'Pizza Planet',
    restaurantImage: 'https://source.unsplash.com/MQUqbmszGGM/800x800',
    items: [
      { name: 'Pepperoni Pizza', quantity: 1 },
      { name: 'Garlic Knots', quantity: 1 }
    ],
    total: 21.45,
    status: 'in-transit',
    date: '2025-04-26T12:15:00',
    address: '456 Oak Avenue, Townsburg'
  },
  {
    id: 3,
    restaurantName: 'Thai Delight',
    restaurantImage: 'https://source.unsplash.com/IGfIGP5ONV0/800x800',
    items: [
      { name: 'Pad Thai', quantity: 1 },
      { name: 'Spring Rolls', quantity: 2 }
    ],
    total: 32.50,
    status: 'preparing',
    date: '2025-04-26T13:45:00',
    address: '789 Pine Street, Villageton'
  }
];

const OrdersPage = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/profile');
      return;
    }
    
    // Simulate API call
    setOrders(mockOrders);
  }, [user, navigate]);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Preparing
          </span>
        );
      case 'in-transit':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Delivered
          </span>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <p className="text-xl font-medium text-gray-800 mb-2">No orders yet</p>
          <p className="text-gray-600 mb-6">When you place orders, they will appear here</p>
          <button 
            onClick={() => navigate('/restaurants')}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-36 md:h-auto">
                  <img 
                    src={order.restaurantImage} 
                    alt={order.restaurantName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-6 md:w-3/4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{order.restaurantName}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Items:</h4>
                    <ul className="text-sm text-gray-600">
                      {order.items.map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="text-sm text-gray-600 mb-2 md:mb-0">
                      <strong>Delivered to:</strong> {order.address}
                    </div>
                    <div className="font-bold text-gray-800">
                      Total: ${order.total.toFixed(2)}
                    </div>
                  </div>
                  
                  {order.status === 'delivered' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className={`px-4 py-2 rounded-full text-white text-sm ${currentTheme.button}`}>
                        Reorder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;