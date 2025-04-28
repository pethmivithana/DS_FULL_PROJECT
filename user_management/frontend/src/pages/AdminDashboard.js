import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState('');

  // Fetch token from MongoDB (you'll need to implement this API endpoint)
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('foodAppToken');
      const response = await axios.get('http://localhost:5002/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
    }
  };

  // Approve a user
  const approveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) return;
    try {
      const token = localStorage.getItem('foodAppToken');
      const response = await axios.put(
        `http://localhost:5002/api/users/${userId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log('User approved:', response.data);
      fetchUsers(); // Refresh the list after approval
    } catch (error) {
      console.error('Error approving user:', error.response?.data || error.message);
    }
  };

  // Delete a user
  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5002/api/users/${id}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Full Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Contact Number</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Approved</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{user.fullName}</td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">{user.contactNumber}</td>
                  <td className="py-3 px-6 text-left capitalize">{user.role}</td>
                  <td className="py-3 px-6 text-left">
                    {user.isApproved ? (
                      <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs">
                        Yes
                      </span>
                    ) : (
                      <span className="bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center flex justify-center space-x-2">
                    {!user.isApproved &&
                      (user.role === 'restaurantManager' || user.role === 'deliveryPerson') && (
                        <button
                          onClick={() => approveUser(user._id)}
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded text-sm"
                        >
                          Approve
                        </button>
                      )}
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
