// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CreateMenuItem from './pages/CreateMenuItem';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminDashboard from "./pages/AdminDashboard"
import EditMenuItem from "./pages/EditMenuItem"
import PendingUploads from "./pages/PendingUploads"


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                <Route path="/pending-uploads" element={<PendingUploads />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/edit-menu-item/:id" element={<EditMenuItem />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantPage />} />
                  <Route path="/restaurants/:id" element={<MenuPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
<Route path="/create-menu-item" element={<CreateMenuItem />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;