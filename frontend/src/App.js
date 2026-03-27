import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
// import AuthHeader from './components/AuthHeader'; // The Login/Signup buttons
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ReportWaste from './pages/ReportWaste';
import './global/styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* These stay visible on EVERY page */}
        <Navbar />
        {/* <AuthHeader /> */}

        {/* This section changes based on the URL */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<ReportWaste />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;