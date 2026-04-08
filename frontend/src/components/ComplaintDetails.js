import React, { useEffect, useState } from 'react';

const STATUS_COLOR = {
  Pending:  '#f59e0b',
  Accept:   '#3b82f6',
  Working:  '#f97316',
  Complete: '#22c55e',
  Waste:    '#ef4444',
};

const ComplaintDetails = ({ item, onClose }) => {
  console.log(item);

  const [statusData, setStatusData] = useState(null);

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

          {/* ── Activity Timeline ── */}
          <div className="timeline-container-light">
            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>📈 Activity Timeline</h4>
            <div className="timeline-flow">

              {/* ── Static first step: complaint submitted ── */}
              <div className="time-step">
                <div className="step-dot" style={{ background: '#ef4444' }}></div>
                <div className="step-text">
                  <p>Complaint submitted successfully</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              </div>

              {/* ── Dynamic status history from API ── */}
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
                : /* fallback if API not loaded yet */
                  !statusData && (
                    <div className="time-step">
                      <div className="step-dot"></div>
                      <div className="step-text">
                        <p>Status changed to {item.currentStatus}</p>
                        <small>Recent Update</small>
                      </div>
                    </div>
                  )}

              {/* ── Current status badge at end of chain ── */}
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