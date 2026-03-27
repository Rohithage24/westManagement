import React from 'react';

const ComplaintDetails = ({ item, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content light-mode" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <div className="modal-inner">
          <h2 className="modal-title">{item.title}</h2>
          
          <div className="badge-row">
            <span className={`status-badge ${item.currentStatus.toLowerCase()}`}>
              {item.currentStatus}
            </span>
            <span className="status-badge priority-badge">Medium Priority</span>
          </div>

          <div className="modal-image-box">
            <img src={item.imageUrl} alt="Complaint" />
          </div>

          <div className="modal-text-content">
            <h4 style={{marginTop: '15px', marginBottom: '5px'}}>Description</h4>
            <p style={{fontSize: '0.9rem', color: '#444'}}>
              The waste report has been noted. Community action or municipal cleaning is required at this specific location.
            </p>
            
            <div className="details-grid">
              <div className="detail-column">
                <span>👤 Reported by</span>
                <strong>Demo User</strong>
                <span>📍 Location</span>
                <strong>{item.address}</strong>
              </div>
              <div className="detail-column">
                <span>🟢 Resolved on</span>
                <strong className={item.currentStatus === 'Complete' ? 'success-text' : ''}>
                    {item.currentStatus === 'Complete' ? '3/23/2026, 6:25:25 PM' : 'TBD'}
                </strong>
                <span>📅 Submitted on</span>
                <strong>{new Date(item.createdAt).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="timeline-container-light">
            <h4 style={{marginTop: '20px', marginBottom: '10px'}}>📈 Activity Timeline</h4>
            <div className="timeline-flow">
              <div className="time-step">
                <div className="step-dot"></div>
                <div className="step-text">
                  <p>Complaint submitted successfully</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              </div>
              <div className="time-step">
                <div className="step-dot"></div>
                <div className="step-text">
                  <p>Status changed to {item.currentStatus}</p>
                  <small>Recent Update</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;