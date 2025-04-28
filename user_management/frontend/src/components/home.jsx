// Home.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#63b0c9]">MyApp</h1>
        <div className="space-x-4">
          <Link to="/" className="text-gray-700 hover:text-[#63b0c9]">Home</Link>
          <Link to="/login" className="text-gray-700 hover:text-[#63b0c9]">Login</Link>
          <Link to="/register" className="text-gray-700 hover:text-[#63b0c9]">Sign Up</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-3xl font-semibold mb-4">Welcome to MyApp!</h2>
        <p className="text-lg text-center max-w-xl">
          This is a simple homepage. Use the navigation above to login or sign up and explore the system.
        </p>
      </main>
    </div>
  );
};

export default Home;
