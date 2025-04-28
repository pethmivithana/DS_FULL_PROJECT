import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in local storage
    const token = localStorage.getItem('foodAppToken');
    
    if (token) {
      // For now, just use mock data. In real app, validate token with backend
      setUser({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login - replace with actual API call
    try {
      // const response = await fetch('api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // Mock successful response
      const mockData = {
        token: 'mock-token-123',
        user: {
          id: '1',
          name: 'John Doe',
          email: email,
        }
      };
      
      localStorage.setItem('foodAppToken', mockData.token);
      setUser(mockData.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('foodAppToken');
    setUser(null);
  };

  const register = async (name, email, password) => {
    // Mock registration - replace with actual API call
    try {
      // const response = await fetch('api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // });
      // const data = await response.json();
      
      // Mock successful response
      const mockData = {
        token: 'mock-token-123',
        user: {
          id: '1',
          name: name,
          email: email,
        }
      };
      
      localStorage.setItem('foodAppToken', mockData.token);
      setUser(mockData.user);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};