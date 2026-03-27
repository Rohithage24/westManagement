import React, { useState } from 'react';
import ComplaintDetails from './ComplaintDetails';

const ComplaintCard = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!item) return null;
  const statusClass = item.currentStatus?.toLowerCase() || 'pending';

  return (
    <>
      <div className={`complaint-card ${statusClass}`}>
        <div className="card-header">
          <h3 style={{fontSize: '1.1rem', margin: 0, color: 'white'}}>{item.title}</h3>
          <span className={`status-badge ${statusClass}`}>{item.currentStatus}</span>
        </div>
        
        <p style={{fontSize: '0.8rem', opacity: 0.6, margin: '5px 0'}}>👤 Demo User</p>

        <div className="card-img-container">
          <img src={item.imageUrl} alt="report" />
        </div>

        <div className="card-info" style={{marginTop: '10px'}}>
          <div className="info-item">📍 {item.address}</div>
          <div className="info-item">📅 {new Date(item.createdAt).toLocaleDateString()}</div>
        </div>

        <button className="view-details-btn" onClick={() => setIsModalOpen(true)}>
          View Details
        </button>
      </div>

      {isModalOpen && (
        <ComplaintDetails item={item} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ComplaintCard;