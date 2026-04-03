import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../global/styles.css';

const Dashboard = () => {
  const [myComplaints, setMyComplaints] = useState([]);
  const [userPoints, setUserPoints] = useState(450); // Mock points

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaint/my');
        setMyComplaints(res.data.data);
      } catch (err) {
        setMyComplaints([
          { _id: '1', wasteType: 'Plastic', currentStatus: 'Pending', createdAt: '2026-03-25', location: 'Civil Lines' },
          { _id: '2', wasteType: 'Organic', currentStatus: 'Complete', createdAt: '2026-03-20', location: 'Tajnapeth' },
          { _id: '3', wasteType: 'Electronic', currentStatus: 'Processing', createdAt: '2026-03-28', location: 'Ram Nagar' },
        ]);
      }
    };
    fetchMyData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '5px' }}>
            Citizen Dashboard
          </h1>
          <p style={{ opacity: 0.7 }}>Welcome back! Here is your community impact summary.</p>
        </div>
        <div className="glass-card points-badge">
          <span className="coin-icon">⭐</span>
          <div>
            <small>Community Points</small>
            <strong>{userPoints} XP</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* STATS CARDS */}
        <div className="glass-card stat-item card-hover">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>📁</div>
          <div>
            <h3>Total Reports</h3>
            <p className="stat-number">{myComplaints.length}</p>
          </div>
        </div>

        <div className="glass-card stat-item card-hover">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>✅</div>
          <div>
            <h3>Resolved</h3>
            <p className="stat-number" style={{ color: '#10b981' }}>
              {myComplaints.filter(c => c.currentStatus === 'Complete').length}
            </p>
          </div>
        </div>

        <div className="glass-card stat-item card-hover">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>⏳</div>
          <div>
            <h3>In Progress</h3>
            <p className="stat-number" style={{ color: '#f59e0b' }}>
              {myComplaints.filter(c => c.currentStatus !== 'Complete').length}
            </p>
          </div>
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <div className="glass-card list-item main-activity">
          <div className="card-header-flex">
            <h3>Recent Submissions</h3>
            <button className="view-all-btn">Export PDF</button>
          </div>
          
          <div className="complaint-list">
            <div className="list-header">
              <span>Category</span>
              <span>Location</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {myComplaints.map(report => (
              <div key={report._id} className="report-row-v2">
                <div className="type-col">
                  <div className={`dot ${report.wasteType.toLowerCase()}`}></div>
                  <strong>{report.wasteType}</strong>
                </div>
                <span>{report.location || 'Unknown'}</span>
                <div>
                  <span className={`status-pill ${report.currentStatus.toLowerCase()}`}>
                    {report.currentStatus}
                  </span>
                </div>
                <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS SIDEBAR */}
        <div className="glass-card quick-actions">
          <h3>Quick Actions</h3>
          <button className="action-btn-outline">Track Nearby Trucks</button>
          <button className="action-btn-outline">View Reward Catalog</button>
          <button className="action-btn-outline">Contact Ward Officer</button>
          
          <div className="impact-box">
            <h4>Your Impact</h4>
            <p>You helped divert <strong>12kg</strong> of plastic from landfills this month! 🌱</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;