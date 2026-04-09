import React, { useState, useEffect } from 'react';
import ComplaintDetails from './ComplaintDetails';

// ── Reverse geocode lat/lng → human address (free, no API key) ───────────────
const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    // Build a short readable address from the response
    const { road, suburb, city, town, village, state, country } = data.address || {};
    const parts = [road, suburb, city || town || village, state, country].filter(Boolean);
    return parts.slice(0, 3).join(', ') || data.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;  // fallback to coords if request fails
  }
};

const ComplaintCard = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState(item.address || '');  // show existing address first
  // console.log(item);

  // ── Fetch real address from lat/lng on mount ──────────────────────────────
  useEffect(() => {
    if (item.latitude && item.longitude) {
      getAddressFromCoords(item.latitude, item.longitude)
        .then(addr => setResolvedAddress(addr));
    }
  }, [item.latitude, item.longitude]);

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
          <img src={`http://localhost:5000${item.imageUrl}`} alt="report" />
        </div>

        <div className="card-info" style={{marginTop: '10px'}}>
          {/* ── Only this line changed: resolvedAddress instead of item.address ── */}
          <div className="info-item">📍 {resolvedAddress || item.address}</div>
          <div className="info-item">📅 {new Date(item.createdAt).toLocaleDateString()}</div>
        </div>

        <button className="view-details-btn" onClick={() => setIsModalOpen(true)}>
          View Details
        </button>
      </div>

      {isModalOpen && (
        <ComplaintDetails item={{ ...item, address: resolvedAddress || item.address }} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ComplaintCard;


// import React, { useState } from 'react';
// import ComplaintDetails from './ComplaintDetails';

// const ComplaintCard = ({ item }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   // console.log(item);
  

//   if (!item) return null;
//   const statusClass = item.currentStatus?.toLowerCase() || 'pending';

//   return (
//     <>
//       <div className={`complaint-card ${statusClass}`}>
//         <div className="card-header">
//           <h3 style={{fontSize: '1.1rem', margin: 0, color: 'white'}}>{item.title}</h3>
//           <span className={`status-badge ${statusClass}`}>{item.currentStatus}</span>
//         </div>
        
//         <p style={{fontSize: '0.8rem', opacity: 0.6, margin: '5px 0'}}>👤 Demo User</p>

//         <div className="card-img-container">
//           {/* <img src={item.imageUrl} alt="report" /> */}
//           <img src={`http://localhost:5000${item.imageUrl}`} alt="report" />
//         </div>

//         <div className="card-info" style={{marginTop: '10px'}}>
//           <div className="info-item">📍 {item.address}</div>
//           <div className="info-item">📅 {new Date(item.createdAt).toLocaleDateString()}</div>
//         </div>

//         <button className="view-details-btn" onClick={() => setIsModalOpen(true)}>
//           View Details
//         </button>
//       </div>

//       {isModalOpen && (
//         <ComplaintDetails item={item} onClose={() => setIsModalOpen(false)} />
//       )}
//     </>
//   );
// };

// export default ComplaintCard;