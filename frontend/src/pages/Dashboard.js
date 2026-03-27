import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../global/styles.css';
import UserHistory from '../components/UserHistory';

const Dashboard = () => {
  const [myComplaints, setMyComplaints] = useState([]);

  // In a real scenario, this hits /api/complaint/my
  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaint/my');
        setMyComplaints(res.data.data);
      } catch (err) {
        // Mock data for design purposes while backend is "resting"
        setMyComplaints([
          { _id: '1', wasteType: 'Plastic', currentStatus: 'Pending', createdAt: '2026-03-25' },
          { _id: '2', wasteType: 'Organic', currentStatus: 'Complete', createdAt: '2026-03-20' },
        ]);
      }
    };
    fetchMyData();
  }, []);

  return (
    <div className="dashboard-container" style={{ paddingTop: '100px', paddingInline: '5vw' }}>
      <h1 className="hero-title" style={{ fontSize: '2.5rem', textAlign: 'left' }}>My Activity</h1>
      
      <div className="dashboard-grid">
        {/* Stat Card 1 */}
        <div className="glass-card stat-item">
          <h3>Total Reports</h3>
          <p className="stat-number">{myComplaints.length}</p>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-card stat-item">
          <h3>Resolved</h3>
          <p className="stat-number" style={{ color: '#10b981' }}>
            {myComplaints.filter(c => c.currentStatus === 'Complete').length}
          </p>
        </div>

        {/* Complaints Table/List */}
        <div className="glass-card list-item">
          <h3>Recent Submissions</h3>
          <div className="complaint-list">
            {myComplaints.map(report => (
              <div key={report._id} className="report-row">
                <span>{report.wasteType} Waste</span>
                <span className={`status-pill ${report.currentStatus.toLowerCase()}`}>
                  {report.currentStatus}
                </span>
                <span style={{ opacity: 0.5 }}>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
      <UserHistory />
    </div>
    
  );
};

export default Dashboard;