// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('emerald'); // default theme
  
  const themes = {
    emerald: {
      primary: 'bg-emerald-500',
      secondary: 'bg-emerald-600',
      text: 'text-emerald-500',
      hover: 'hover:bg-emerald-600',
      button: 'bg-emerald-500 hover:bg-emerald-600',
      accent: 'bg-amber-400',
    },
    violet: {
      primary: 'bg-violet-500',
      secondary: 'bg-violet-600',
      text: 'text-violet-500',
      hover: 'hover:bg-violet-600',
      button: 'bg-violet-500 hover:bg-violet-600',
      accent: 'bg-yellow-400',
    },
    rose: {
      primary: 'bg-rose-500',
      secondary: 'bg-rose-600',
      text: 'text-rose-500',
      hover: 'hover:bg-rose-600',
      button: 'bg-rose-500 hover:bg-rose-600',
      accent: 'bg-sky-400',
    }
  };

  const toggleTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem('foodAppTheme', newTheme);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('foodAppTheme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme: themes[theme], theme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};