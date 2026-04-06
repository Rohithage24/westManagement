import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import WasteMap from '../components/WasteMap';
import UserHistory from '../components/UserHistory';
import ActionSection from '../components/ActionSection';
import '../global/styles.css';

const Home = () => {
  const [stats, setStats] = useState({ active: 0, cleaned: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/map/all');
        const allData = res.data.data;
        const active = allData.filter(item => item.state !== 'Complete').length;
        const cleaned = allData.filter(item => item.state === 'Complete').length;
        setStats({ active, cleaned });
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title">CleanCity Akola</h1>
        <p style={{ opacity: 5, marginBottom: '30px', color:'ButtonShadow'}}>Real-time waste monitoring and community action.</p>
        
        {/* NEW: QUICK LOGIN OPTIONS */}
        <div className="home-auth-grid" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
          <button className="glass-card auth-btn" onClick={() => navigate('/login')}>
             <span style={{fontSize: '1.5rem'}}>👤</span> Citizen Login
          </button>
          <button className="glass-card auth-btn admin-theme" onClick={() => navigate('/login')}>
             <span style={{fontSize: '1.5rem'}}>🏛️</span> Municipality Login
          </button>
        </div>
      </header>

      {/* Stats shown early to build trust */}
      <div className="stat-container" style={{ justifyContent: 'center', display: 'flex', gap: '20px', margin: '20px 0' }}>
        <div className="stat-badge glass-card">🔴 Active: {stats.active}</div>
        <div className="stat-badge glass-card">🟢 Cleaned: {stats.cleaned}</div>
      </div>

      <ActionSection onReportClick={() => navigate('/report')} />

      <div className="map-wrapper glass-card">
        <WasteMap />
      </div>

      <UserHistory />
    </div>
  );
};

export default Home;