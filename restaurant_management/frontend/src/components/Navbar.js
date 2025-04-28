// src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentTheme, toggleTheme, theme } = useTheme();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className={`${currentTheme.primary} text-white shadow-md`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-lg md:text-xl">FoodExpress</Link>
            </div>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-opacity-80">Home</Link>
            <Link to="/restaurants" className="px-3 py-2 rounded-md hover:bg-opacity-80">Restaurants</Link>
            
            <div className="relative">
              <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="px-3 py-2 rounded-md hover:bg-opacity-80 flex items-center">
                Theme
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isThemeOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button onClick={() => { toggleTheme('emerald'); setIsThemeOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Emerald</button>
                  <button onClick={() => { toggleTheme('violet'); setIsThemeOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Violet</button>
                  <button onClick={() => { toggleTheme('rose'); setIsThemeOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Rose</button>
                </div>
              )}
            </div>
            
            <Link to="/cart" className="px-3 py-2 rounded-md hover:bg-opacity-80 flex items-center">
              Cart
              {cartItemsCount > 0 && (
                <span className={`ml-1 ${currentTheme.accent} text-white px-2 py-1 rounded-full text-xs`}>
                  {cartItemsCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center">
                  <span className="mr-1">{user.name}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-opacity-80">Login</Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="mr-4 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cartItemsCount > 0 && (
                <span className={`absolute -top-2 -right-2 ${currentTheme.accent} text-white px-2 py-1 rounded-full text-xs`}>
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-opacity-80 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-white hover:bg-opacity-80" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/restaurants" className="block px-3 py-2 rounded-md text-white hover:bg-opacity-80" onClick={() => setIsMenuOpen(false)}>Restaurants</Link>
            <Link to="/profile" className="block px-3 py-2 rounded-md text-white hover:bg-opacity-80" onClick={() => setIsMenuOpen(false)}>
              {user ? 'Profile' : 'Login'}
            </Link>
            {user && (
              <>
                <Link to="/orders" className="block px-3 py-2 rounded-md text-white hover:bg-opacity-80" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-white hover:bg-opacity-80">Logout</button>
              </>
            )}
            <div className="pt-4 pb-3 border-t border-white border-opacity-20">
              <div className="px-3">
                <p className="text-sm">Theme:</p>
                <div className="mt-1 flex space-x-2">
                  <button onClick={() => toggleTheme('emerald')} className={`w-8 h-8 rounded-full bg-emerald-500 ${theme === 'emerald' ? 'ring-2 ring-white' : ''}`}></button>
                  <button onClick={() => toggleTheme('violet')} className={`w-8 h-8 rounded-full bg-violet-500 ${theme === 'violet' ? 'ring-2 ring-white' : ''}`}></button>
                  <button onClick={() => toggleTheme('rose')} className={`w-8 h-8 rounded-full bg-rose-500 ${theme === 'rose' ? 'ring-2 ring-white' : ''}`}></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;