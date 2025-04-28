
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Home from "./components/home";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} /> {/* New route for user login */}
                  <Route path="/register" element={<RegisterPage />} /> {/* New route for user signup */}
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;