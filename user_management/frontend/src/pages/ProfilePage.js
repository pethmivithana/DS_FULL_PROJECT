import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginSignup from '../components/LoginForm';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/');
  };
  
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Login or Create Account</h1>
        <LoginSignup onSuccess={handleLogin} />
      </div>
    );
  }

  // Display approval status message for non-customer roles that need approval
  const needsApprovalMessage = (user.role !== 'customer' && !user.isApproved) ? (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
      Your account is pending approval by an administrator.
    </div>
  ) : null;

  // Display role-specific buttons
  const getRoleSpecificButtons = () => {
    switch(user.role) {
      case 'restaurantManager':
        return (
          <button className="flex items-center text-gray-600 hover:text-gray-800" onClick={() => navigate('/restaurant/dashboard')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Restaurant Dashboard
          </button>
        );
      case 'deliveryPerson':
        return (
          <button className="flex items-center text-gray-600 hover:text-gray-800" onClick={() => navigate('/delivery/dashboard')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Delivery Dashboard
          </button>
        );
      case 'admin':
        return (
          <button className="flex items-center text-gray-600 hover:text-gray-800" onClick={() => navigate('/admin')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Dashboard
          </button>
        );
      case 'customer':
      default:
        return (
          <button className="flex items-center text-gray-600 hover:text-gray-800" onClick={() => navigate('/orders')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Order History
          </button>
        );
    }
  };

  // Restaurant information section (only shown for restaurant managers)
  const restaurantInfoSection = user.role === 'restaurantManager' && user.restaurantInfo ? (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Restaurant Information</h3>
      <div className="bg-gray-50 p-4 rounded">
        <p className="font-semibold">Name:</p>
        <p className="mb-2">{user.restaurantInfo.name}</p>
        <p className="font-semibold">Address:</p>
        <p>{user.restaurantInfo.address}</p>
      </div>
    </div>
  ) : null;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Your Profile</h1>
      
      {needsApprovalMessage}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center mb-6">
          <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4 sm:mb-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="ml-0 sm:ml-4 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.contactNumber}</p>
            <p className="text-gray-600 capitalize">
              Role: {user.role}
              {user.role !== 'customer' && (
                <span className={`ml-2 px-2 py-1 text-xs rounded ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {user.isApproved ? 'Approved' : 'Pending'}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Display restaurant information if user is a restaurant manager */}
        {restaurantInfoSection}
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Account Settings</h3>
          
          <div className="space-y-4">
            <button 
              className="flex items-center text-gray-600 hover:text-gray-800"
              onClick={() => navigate('/profile/edit')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>
            
            {user.role === 'customer' && (
              <>
                <button className="flex items-center text-gray-600 hover:text-gray-800">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Methods
                </button>
                
                <button className="flex items-center text-gray-600 hover:text-gray-800">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Saved Addresses
                </button>
              </>
            )}
            
            {getRoleSpecificButtons()}
            
            <button 
              onClick={logout}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;