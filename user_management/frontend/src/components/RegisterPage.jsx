import React, { useState } from 'react';
import './Signup.css'; // Include the CSS file

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    contactNumber:'',
    role: 'customer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5002/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (res.ok) {
      alert('Signup successful!');
    } else {
      alert(data.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Signup Form</h2>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="Full name"
            required
            value={formData.fullName}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label>Phone Number</label>
          <input
            type="number"
            name="phoneNumber"
            required
            value={formData.contactNumber}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="deliveryPerson">Delivery Person</option>
            <option value="Resturant Admin">Delivery Person</option>
          </select>

          <button type="submit">SIGN UP</button>
        </form>
        <p>Already a member? <span className="login-link">Login here</span></p>
      </div>
    </div>
  );
};

export default Signup;
