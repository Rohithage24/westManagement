import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../global/styles.css';

const Navbar = ({ user, role, onLogout }) => {
  const location = useLocation();
  const isAdmin = role === 'admin';

  // --- ADMIN VIEW (ONLY LOGOUT IN TOP RIGHT) ---
  if (user && isAdmin) {
    return (
      <div className="admin-top-nav">
        <div className="admin-badge">Admin Mode 🛠️</div>
        <div className="nav-item logout-btn top-right" onClick={onLogout}>
          <span className="nav-icon">Logout</span>
          <span className="nav-text">Logout</span>
        </div>
      </div>
    );
  }

  // --- REGULAR USER VIEW (FULL SIDEBAR) ---
  return (
    <nav className="sidebar-nav">
      <div className="nav-logo">♻️</div>
      
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <span className="nav-icon"></span>
        <span className="nav-text">Home</span>
      </Link>

      <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
        <span className="nav-icon"></span>
        <span className="nav-text">About</span>
      </Link>

      <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <span className="nav-icon"></span>
        <span className="nav-text">My Dashboard</span>
      </Link>

      <Link to="/contact" className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
        <span className="nav-icon"></span>
        <span className="nav-text">Contact</span>
      </Link>

      {user ?"":(<Link to="/signup" className={`nav-item ${location.pathname === '/signup' ? 'active' : ''}`}>
        <span className="nav-icon"></span>
        <span className="nav-text">Signup</span>
      </Link>)}

      <div style={{ marginTop: 'auto', marginBottom: '30px' }}>
        {user ? (
          <div className="nav-item logout-btn" onClick={onLogout} style={{ cursor: 'pointer', color: '#ff4d4d' }}>
            <span className="nav-icon"></span>
            <span className="nav-text">Logout</span>
          </div>
        ) : (
          <Link to="/login" className="nav-item">
            <span className="nav-icon"></span>
            <span className="nav-text">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;