import React, { useEffect, useState } from 'react';
import '../global/complentDetial.css';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = {
  Pending:  '#f59e0b',
  Accept:   '#3b82f6',
  Working:  '#f97316',
  Complete: '#22c55e',
  Waste:    '#ef4444',
};

const ComplaintDetails = ({ item, onClose }) => {
  // console.log(item);

  const [statusData, setStatusData] = useState(null);
  const user = useAuth()
  console.log(user);
  

  // ── Fetch status history for this complaint ──────────────────────────────
  useEffect(() => {
    fetch(`http://localhost:5000/api/status/${item._id}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatusData(data.data);
      })
      .catch((err) => console.warn('Status fetch error:', err));
  }, [item._id]);

  // ✅ FIX 1: item has no 'title' field — build one from wasteType + address
  const title = item.title
    || `${item.wasteType || 'Waste'} — ${item.address || 'Unknown Location'}`;

  // ✅ FIX 2: safe toLowerCase — won't crash if currentStatus is undefined
  const statusClass = item.currentStatus?.toLowerCase() || 'pending';

  // ✅ FIX 3: use real updatedAt for resolved date, not a hardcoded string
  const resolvedDate = item.currentStatus === 'Complete'
    ? new Date(item.updatedAt).toLocaleString()
    : 'TBD';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content light-mode" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>&times;</button>

        <div className="modal-inner">
          {/* ✅ FIX 1: computed title */}
          <h2 className="modal-title">{title}</h2>

          <div className="badge-row">
            {/* ✅ FIX 2: safe statusClass */}
            <span className={`status-badge ${statusClass}`}>
              {item.currentStatus}
            </span>
            <span className="status-badge priority-badge">Medium Priority</span>
          </div>

          <div className="modal-image-box">
            <img src={`http://localhost:5000${item.imageUrl}`} alt="Complaint" />
          </div>

          <div className="modal-text-content">
            <h4 style={{ marginTop: '15px', marginBottom: '5px' }}>Description</h4>
            <p style={{ fontSize: '0.9rem', color: '#444' }}>
              The waste report has been noted. Community action or municipal cleaning is required at this specific location.
            </p>

            <div className="details-grid">
              <div className="detail-column">
                <span>👤 Reported by</span>
                <strong>{user.user.name}</strong>
                <span>📍 Location</span>
                <strong>{item.address}</strong>
              </div>
              <div className="detail-column">
                <span>🟢 Resolved on</span>
                {/* ✅ FIX 3: real date from updatedAt */}
                <strong className={item.currentStatus === 'Complete' ? 'success-text' : ''}>
                  {resolvedDate}
                </strong>
                <span>📅 Submitted on</span>
                <strong>{new Date(item.createdAt).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* ── Activity Timeline ── */}
          <div className="timeline-container-light">
            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>📈 Activity Timeline</h4>
            <div className="timeline-flow">

              {/* Static first step */}
              <div className="time-step">
                <div className="step-dot" style={{ background: '#ef4444' }}></div>
                <div className="step-text">
                  <p>Complaint submitted successfully</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              </div>

              {/* Dynamic status history from API */}
              {statusData?.statusHistory?.length > 0
                ? statusData.statusHistory.map((h, i) => (
                    <div className="time-step" key={i}>
                      <div
                        className="step-dot"
                        style={{ background: STATUS_COLOR[h.status] || '#888' }}
                      ></div>
                      <div className="step-text">
                        <p>
                          Status changed to{' '}
                          <strong style={{ color: STATUS_COLOR[h.status] || '#888' }}>
                            {h.status}
                          </strong>
                        </p>
                        {h.note && (
                          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>
                            📝 {h.note}
                          </p>
                        )}
                        <small>{new Date(h.changedAt).toLocaleString()}</small>
                      </div>
                    </div>
                  ))
                : !statusData && (
                    <div className="time-step">
                      <div className="step-dot"></div>
                      <div className="step-text">
                        <p>Status changed to {item.currentStatus}</p>
                        <small>Recent Update</small>
                      </div>
                    </div>
                  )}

              {/* Current status at end of chain */}
              {statusData && (
                <div className="time-step">
                  <div
                    className="step-dot"
                    style={{
                      background: STATUS_COLOR[statusData.status] || '#888',
                      boxShadow: `0 0 0 3px ${STATUS_COLOR[statusData.status] || '#888'}30`,
                    }}
                  ></div>
                  <div className="step-text">
                    <p>
                      Current status:{' '}
                      <strong style={{ color: STATUS_COLOR[statusData.status] || '#888' }}>
                        {statusData.status}
                      </strong>
                    </p>
                    <small>Latest</small>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;

// import React from 'react';

// const ComplaintDetails = ({ item, onClose }) => {
//   console.log(item);
  
//   return (
    
    
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content light-mode" onClick={(e) => e.stopPropagation()}>
//         <button className="close-x" onClick={onClose}>&times;</button>
        
//         <div className="modal-inner">
//           <h2 className="modal-title">{item.title}</h2>
          
//           <div className="badge-row">
//             <span className={`status-badge ${item.currentStatus.toLowerCase()}`}>
//               {item.currentStatus}
//             </span>
//             <span className="status-badge priority-badge">Medium Priority</span>
//           </div>

//           <div className="modal-image-box">
//             <img src={item.imageUrl} alt="Complaint" />
//           </div>

//           <div className="modal-text-content">
//             <h4 style={{marginTop: '15px', marginBottom: '5px'}}>Description</h4>
//             <p style={{fontSize: '0.9rem', color: '#444'}}>
//               The waste report has been noted. Community action or municipal cleaning is required at this specific location.
//             </p>
            
//             <div className="details-grid">
//               <div className="detail-column">
//                 <span>👤 Reported by</span>
//                 <strong>Demo User</strong>
//                 <span>📍 Location</span>
//                 <strong>{item.address}</strong>
//               </div>
//               <div className="detail-column">
//                 <span>🟢 Resolved on</span>
//                 <strong className={item.currentStatus === 'Complete' ? 'success-text' : ''}>
//                     {item.currentStatus === 'Complete' ? '3/23/2026, 6:25:25 PM' : 'TBD'}
//                 </strong>
//                 <span>📅 Submitted on</span>
//                 <strong>{new Date(item.createdAt).toLocaleString()}</strong>
//               </div>
//             </div>
//           </div>

//           <div className="timeline-container-light">
//             <h4 style={{marginTop: '20px', marginBottom: '10px'}}>📈 Activity Timeline</h4>
//             <div className="timeline-flow">
//               <div className="time-step">
//                 <div className="step-dot"></div>
//                 <div className="step-text">
//                   <p>Complaint submitted successfully</p>
//                   <small>{new Date(item.createdAt).toLocaleString()}</small>
//                 </div>
//               </div>
//               <div className="time-step">
//                 <div className="step-dot"></div>
//                 <div className="step-text">
//                   <p>Status changed to {item.currentStatus}</p>
//                   <small>Recent Update</small>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ComplaintDetails;