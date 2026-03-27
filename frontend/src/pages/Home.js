import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WasteMap from '../components/WasteMap';
import UserHistory from '../components/UserHistory';
import ActionSection from '../components/ActionSection';
import '../global/styles.css';

const Home = () => {
  const [stats, setStats] = useState({ active: 0, cleaned: 0 });
  const [showModal, setShowModal] = useState(false);

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
        <p style={{ opacity: 0.8 }}>Real-time waste monitoring and community action.</p>
      </header>

      {/* Modular Action Section */}
      <ActionSection onReportClick={() => setShowModal(true)} />

      {/* SUBMISSION POPUP MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content light-mode" style={{ maxWidth: '450px', padding: '30px' }}>
            <button className="close-x" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="modal-title">Report Details</h2>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Provide more info to help authorities locate the waste faster.</p>
            
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: '#333', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Waste Type</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option>Plastic / Dry Waste</option>
                <option>Organic / Wet Waste</option>
                <option>Construction Debris</option>
                <option>Other</option>
              </select>

              <label style={{ color: '#333', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Additional Description</label>
              <textarea 
                placeholder="Ex: Near the big banyan tree..." 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', height: '80px' }} 
              />
            </div>

            <button 
              className="upload-trigger" 
              style={{ width: '100%', marginTop: '25px' }}
              onClick={() => {
                alert("Report successfully pinned to map!");
                setShowModal(false);
              }}
            >
              Confirm & Pin to Map
            </button>
          </div>
        </div>
      )}

      <div className="map-wrapper glass-card">
        <WasteMap />
      </div>

      <div className="stat-container" style={{ justifyContent: 'center', display: 'flex', gap: '20px', margin: '40px 0' }}>
        <div className="stat-badge glass-card" style={{ padding: '15px 30px' }}>🔴 Active Issues: {stats.active}</div>
        <div className="stat-badge glass-card" style={{ padding: '15px 30px' }}>🟢 Cleaned Areas: {stats.cleaned}</div>
      </div>

      <UserHistory />
    </div>
  );
};

export default Home;