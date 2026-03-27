import React from 'react';
import '../global/styles.css'; // Make sure the path points to your global CSS
import Dashboard from '../pages/Dashboard';
const Navbar = () => {
  return (
    <nav className="sidebar-nav">
      <div className="nav-logo">♻️</div>
      
      <a href="/" className="nav-item">
        <span className="nav-icon">🏠</span>
        <span className="nav-text">Home</span>
      </a>

      <a href="/about" className="nav-item">
        <span className="nav-icon">🌿</span>
        <span className="nav-text">About Project</span>
      </a>
      <a href="/dashboard" className="nav-item">
        <span className="nav-icon">📊</span>
        <span className="nav-text">My Dashboard</span>
      </a>

      <a href="/contact" className="nav-item">
        <span className="nav-icon">📞</span>
        <span className="nav-text">Contact Munsi</span>
      </a>

      <div style={{ marginTop: 'auto', marginBottom: '30px' }} className="nav-item">
        <span className="nav-icon">⚙️</span>
        <span className="nav-text">Settings</span>
      </div>
      
    </nav>
  );
};

export default Navbar;