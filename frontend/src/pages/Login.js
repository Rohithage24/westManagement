import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onAuthSuccess }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log(email,password);
    
    // Choose endpoint based on toggle
    const endpoint = isAdmin ? '/api/admin/login ' : '/api/user/login';
    
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        email: email,
        password: password
      });
      
      if (res.data.success) {
        // Update global state in App.js
        const userData = res.data.data.user || res.data.data.admin;
        onAuthSuccess(userData, isAdmin ? 'admin' : 'user');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="contact-container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        <h2 className="hero-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>
          {isAdmin ? "Municipality Login" : "Citizen Login"}
        </h2>
        <p style={{ opacity: 0.7, marginBottom: '30px' }}>
          {isAdmin ? "Access administrative waste management controls." : "Report waste and track your community impact."}
        </p>

        {/* ROLE TOGGLE */}
        <div className="role-toggle-wrapper">
          <button 
            className={`toggle-option ${!isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin(false)}
          >
            Citizen
          </button>
          <button 
            className={`toggle-option ${isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin(true)}
          >
            Municipality
          </button>
        </div>

        {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Gmail Address</label>
            <input 
              type="email" 
              required 
              placeholder="name@gmail.com"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="input-group" style={{ marginTop: '20px' }}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit" className="upload-trigger" style={{ width: '100%', marginTop: '30px' }}>
            Login to Dashboard
          </button>
        </form>

        {!isAdmin && (
          <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
            Don't have an account? <Link to="/signup" style={{ color: '#000000', fontWeight: 'bold' }}>Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;