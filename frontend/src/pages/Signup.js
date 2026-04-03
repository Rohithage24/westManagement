import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gmail: '',
    password: '',
    phone: '',
    adminSecret: '' // Added for Admin security
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Creating account...' });

    const endpoint = isAdmin ? '/api/admin/register' : '/api/user/register';

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);

      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Account created! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || "Registration failed. Check your details." 
      });
    }
  };

  return (
    <div className="contact-container" style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        <h2 className="hero-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>
          Join CleanCity
        </h2>
        <p style={{ opacity: 0.7, marginBottom: '25px' }}>Help us make Akola cleaner and greener.</p>

        {/* ROLE TOGGLE */}
        <div className="role-toggle-wrapper">
          <button type="button" className={`toggle-option ${!isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(false)}>Citizen</button>
          <button type="button" className={`toggle-option ${isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(true)}>Municipality</button>
        </div>

        {status.msg && (
          <p style={{ 
            color: status.type === 'error' ? '#ff4d4d' : '#10b981', 
            fontSize: '0.9rem', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>{status.msg}</p>
        )}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="John Doe" onChange={handleChange} />
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Gmail Address</label>
            <input type="email" name="gmail" required placeholder="name@gmail.com" onChange={handleChange} />
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Phone Number</label>
            <input type="text" name="phone" required placeholder="9876543210" onChange={handleChange} />
          </div>

          {/* SECRET ADMIN FIELD - Only shows if isAdmin is true */}
          {isAdmin && (
            <div className="input-group" style={{ marginTop: '15px', border: '1px solid #3b82f6', padding: '10px', borderRadius: '8px' }}>
              <label style={{ color: '#3b82f6' }}>Admin Secret Key 🔐</label>
              <input 
                type="password" 
                name="adminSecret" 
                required 
                placeholder="Enter Municipality Code" 
                onChange={handleChange} 
                style={{ background: 'rgba(59, 130, 246, 0.05)' }}
              />
            </div>
          )}
          
          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••" onChange={handleChange} />
          </div>

          <button type="submit" className="upload-trigger" style={{ width: '100%', marginTop: '30px' }}>
            {isAdmin ? "Register Admin Account" : "Create Citizen Account"}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#000000', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;