import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Use Link for SPA feel
import '../global/styles.css';

const Navbar = ({ user, role, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="sidebar-nav">
      <div className="nav-logo">♻️</div>
      
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-text">Home</span>
      </Link>

      <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
        <span className="nav-icon">🌿</span>
        <span className="nav-text">About</span>
      </Link>

      {/* DYNAMIC DASHBOARD LINK */}
      <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <span className="nav-icon">📊</span>
        <span className="nav-text">{role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</span>
      </Link>

      <Link to="/contact" className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
        <span className="nav-icon">📞</span>
        <span className="nav-text">Contact</span>
      </Link>

      <Link to="/signup" className={`nav-item ${location.pathname === '/singup' ? 'active' : ''}`}>
        <span className="nav-icon">✍🏻</span>
        <span className="nav-text">Singup</span>
      </Link>


      {/* DYNAMIC LOGIN/LOGOUT SECTION */}
      <div style={{ marginTop: 'auto', marginBottom: '30px' }}>
        {user ? (
          <div className="nav-item logout-btn" onClick={onLogout} style={{ cursor: 'pointer', color: '#ff4d4d' }}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </div>
        ) : (
          <Link to="/login" className="nav-item">
            <span className="nav-icon">🔑</span>
            <span className="nav-text">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;