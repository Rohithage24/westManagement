import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../global/styles.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Navbar = ({ user, role, onLogout }) => {
  const location = useLocation();
  const isAdmin = role === 'admin';

  // --- Style for the icons to keep them bright/neon ---
  const iconStyle = {
    color: '#288a47', 
    textShadow: '0 0 10px rgba(7, 41, 19, 0.6)',
    fontSize: '1.2rem'
  };

  // --- ADMIN VIEW (ONLY LOGOUT IN TOP RIGHT) ---
  if (user && isAdmin) {
    return (
      <div className="admin-top-nav">
        <div className="admin-badge">Admin Mode 🛠️</div>
        <div className="nav-item logout-btn top-right" onClick={onLogout}>
          <span className="nav-icon">
            <i className="bi bi-box-arrow-left" style={iconStyle}> </i>
          </span>
          <span className="nav-text">Logout</span>
        </div>
      </div>
    );
  }

  // --- REGULAR USER VIEW (FULL SIDEBAR) ---
  return (
    <nav className="sidebar-nav">
      <div className="nav-logo">
        <i className="bi bi-recycle" style={{ ...iconStyle, fontSize: '1.8rem', color: '#39ff14' }}></i>
      </div>
      
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <span className="nav-icon">
          <i className="bi bi-house-fill" style={iconStyle}></i>
        </span>
        <span className="nav-text">Home</span>
      </Link>

      <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
        <span className="nav-icon">
          <i className="bi bi-file-earmark-person-fill" style={iconStyle}></i>
        </span>
        <span className="nav-text">About</span>
      </Link>

      <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <span className="nav-icon">
          <i className="bi bi-door-open-fill" style={iconStyle}></i>
        </span>
        <span className="nav-text">My Dashboard</span>
      </Link>

      <Link to="/contact" className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
        <span className="nav-icon">
          <i className="bi bi-person-lines-fill" style={iconStyle}></i>
        </span>
        <span className="nav-text">Contact</span>
      </Link>

      <Link to="/signup" className={`nav-item ${location.pathname === '/signup' ? 'active' : ''}`}>
        <span className="nav-icon">
          <i className="bi bi-arrow-down-right-square-fill" style={iconStyle}></i>
        </span>
        <span className="nav-text">Signup</span>
      </Link>

      <div style={{ marginTop: 'auto', marginBottom: '30px' }}>
        {user ? (
          <div className="nav-item logout-btn" onClick={onLogout} style={{ cursor: 'pointer' }}>
            <span className="nav-icon">
              <i className="bi bi-box-arrow-left" style={{ ...iconStyle, color: '#ff4d4d', textShadow: '0 0 10px rgba(255, 77, 77, 0.5)' }}></i>
            </span>
            <span className="nav-text" style={{ color: '#ff4d4d' }}>Logout</span>
          </div>
        ) : (
          <Link to="/login" className="nav-item">
            <span className="nav-icon">
              <i className="bi bi-box-arrow-in-right" style={iconStyle}></i>
            </span>
            <span className="nav-text">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;