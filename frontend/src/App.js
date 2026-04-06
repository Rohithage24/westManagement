import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components & Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard'; // User Dashboard
import AdminDashboard from './pages/AdminDashboard'; // You'll create this next
import ReportWaste from './pages/ReportWaste';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './global/styles.css';

// Important: Global Axios setting for Cookies
axios.defaults.withCredentials = true;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'user', 'admin', or null
  const [loading, setLoading] = useState(true);

  // Check authentication status on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Try checking Admin profile
        const adminRes = await axios.get('http://localhost:5000/api/admin/me');
        setCurrentUser(adminRes.data.data.admin);
        setRole('admin');
      } catch (err) {
        try {
          // 2. If not admin, check if it's a regular user
          const userRes = await axios.get('http://localhost:5000/api/user/me');
          setCurrentUser(userRes.data.data.user);
          setRole('user');
        } catch (e) {
          // 3. Not logged in at all
          setCurrentUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    const endpoint = role === 'admin' ? '/api/admin/logout' : '/api/user/logout';
    await axios.post(`http://localhost:5000${endpoint}`);
    setCurrentUser(null);
    setRole(null);
    window.location.href = '/login';
  };

  if (loading) return <div className="loader">Initializing CleanCity...</div>;

  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Pass user/role to Navbar if you want to show Logout button there */}
        <Navbar user={currentUser} role={role} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/report" element={<ReportWaste />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* LOGIN PAGE */}
          <Route 
            path="/login" 
            element={
              !currentUser ? (
                <Login onAuthSuccess={(data, r) => {
                  setCurrentUser(data);
                  setRole(r);
                }} />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />

          {/* DYNAMIC DASHBOARD */}
          <Route 
            path="/dashboard" 
            element={
              role === 'admin' ? <AdminDashboard /> : 
              role === 'user' ? <Dashboard /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;