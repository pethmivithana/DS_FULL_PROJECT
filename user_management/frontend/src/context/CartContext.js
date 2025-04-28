// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('foodAppCart');
    const savedRestaurant = localStorage.getItem('foodAppRestaurant');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedRestaurant) setRestaurant(JSON.parse(savedRestaurant));
  }, []);

  useEffect(() => {
    localStorage.setItem('foodAppCart', JSON.stringify(cart));
    if (restaurant) localStorage.setItem('foodAppRestaurant', JSON.stringify(restaurant));
  }, [cart, restaurant]);

  const addToCart = (item, restaurantInfo) => {
    if (restaurant && restaurantInfo.id !== restaurant.id) {
      if (window.confirm('Adding items from a new restaurant will clear your current cart. Continue?')) {
        setCart([{ ...item, quantity: 1 }]);
        setRestaurant(restaurantInfo);
      }
    } else {
      const exists = cart.find(cartItem => cartItem.id === item.id);
      
      if (exists) {
        setCart(cart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        ));
      } else {
        setCart([...cart, { ...item, quantity: 1 }]);
        setRestaurant(restaurantInfo);
      }
    }
  };

  const removeFromCart = (id) => {
    const exists = cart.find(item => item.id === id);
    
    if (exists.quantity === 1) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
    
    if (cart.length === 1 && cart[0].quantity === 1) {
      setRestaurant(null);
    }
  };

  const clearCart = () => {
    setCart([]);
    setRestaurant(null);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      restaurant, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      getTotalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};