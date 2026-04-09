// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import '../global/styles.css';

// const ReportWaste = () => {
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [location, setLocation] = useState({ lat: null, lng: null });
//   const [uploadStatus, setUploadStatus] = useState(''); // 'idle', 'uploading', 'analyzing', 'success', 'error'
//   const navigate = useNavigate();

//   // Get GPS Location as soon as page opens
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//         },
//         (err) => {
//           console.error("GPS Denied", err);
//           setUploadStatus('Please allow GPS to report waste.');
//         }
//       );
//     }
//   }, []);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreview(URL.createObjectURL(file));
//       setUploadStatus('idle'); // Reset status on new image
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!image || !location.lat) return alert("Please provide an image and wait for GPS location.");

//     const formData = new FormData();
//     formData.append('image', image);
//     formData.append('latitude', location.lat);
//     formData.append('longitude', location.lng);
//     formData.append('address', "Location Auto-Detected");

//     try {
//       setUploadStatus('uploading');
      
//       // Sending to backend with credentials for the JWT cookie
//       const res = await axios.post('http://localhost:5000/api/complaint/submit', formData, {
//         withCredentials: true,
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       if (res.data.success) {
//         setUploadStatus('analyzing');
        
//         // Artificial delay to make the user feel the "AI Analysis" is happening
//         setTimeout(() => {
//           setUploadStatus('success');
//           // Add your sparkle logic or navigation here
//           setTimeout(() => navigate('/dashboard'), 2000);
//         }, 1500);
//       }
//     } catch (err) {
//       console.error(err);
//       setUploadStatus('error');
//     }
//   };

//   return (
//     <div className="report-container" style={{paddingTop: '100px'}}>
//       <div className="glass-card" style={{maxWidth: '500px', margin: 'auto', padding: '30px'}}>
//         <h2 style={{color: '#000000', marginBottom: '5px'}}>📸 Report Waste</h2>
//         <p style={{fontSize: '0.85rem', opacity: 0.7, marginBottom: '20px'}}>
//           {location.lat ? `📍 GPS Locked: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '🛰️ Detecting GPS...'}
//         </p>
        
//         <form onSubmit={handleSubmit}>
//           {/* Interactive Upload Box */}
//           <div 
//             className={`upload-box ${preview ? 'has-preview' : ''}`} 
//             onClick={() => document.getElementById('fileInput').click()}
//             style={{ 
//                 border: '2px dashed rgba(16, 185, 129, 0.4)', 
//                 minHeight: '200px', 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'center',
//                 borderRadius: '15px',
//                 cursor: 'pointer',
//                 overflow: 'hidden'
//             }}
//           >
//             {preview ? (
//               <img src={preview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
//             ) : (
//               <div style={{textAlign: 'center', opacity: 0.6}}>
//                 <span style={{fontSize: '2.5rem'}}>📷</span>
//                 <p>Click to Snap or Upload</p>
//               </div>
//             )}
//             <input id="fileInput" type="file" hidden onChange={handleImageChange} accept="image/*" />
//           </div>
          
//           <button 
//             type="submit" 
//             className="upload-trigger" 
//             style={{width: '100%', marginTop: '20px'}}
//             disabled={uploadStatus === 'uploading' || uploadStatus === 'analyzing'}
//           >
//             {uploadStatus === 'uploading' ? '📤 Sending...' : 
//              uploadStatus === 'analyzing' ? '🧠 AI Analyzing...' : 
//              'Submit Report'}
//           </button>
//         </form>

//         {/* Dynamic Status Feedback */}
//         {uploadStatus === 'success' && (
//             <div className="status-toast success" style={{marginTop: '20px', color: '#10b981', textAlign: 'center'}}>
//                 ✨ <strong>Success!</strong> Report sent to Municipality.
//             </div>
//         )}
//         {uploadStatus === 'error' && (
//             <div className="status-toast error" style={{marginTop: '20px', color: '#ff4d4d', textAlign: 'center'}}>
//                 ❌ Failed to upload. Please try again.
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReportWaste;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../global/styles.css';
import EXIF from "exifr";

const ReportWaste = () => {
  const [image,        setImage]        = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [gpsInfo,      setGpsInfo]      = useState(null);   // { latitude, longitude } from EXIF
  const [gpsError,     setGpsError]     = useState("");
  const [uploadStatus, setUploadStatus] = useState('');     // 'idle' | 'uploading' | 'analyzing' | 'success' | 'error'
  const [duplicate,    setDuplicate]    = useState(null);   // holds duplicate complaint info on 409
  const navigate = useNavigate();

  // ── Image change: extract EXIF GPS ───────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset state
    setImage(null);
    setPreview(null);
    setGpsInfo(null);
    setGpsError("");
    setDuplicate(null);
    setUploadStatus('');

    // Show preview immediately
    setPreview(URL.createObjectURL(file));

    try {
      const gps = await EXIF.gps(file); // returns { latitude, longitude } or undefined

      if (gps?.latitude && gps?.longitude) {
        setImage(file);
        setGpsInfo({ latitude: gps.latitude, longitude: gps.longitude });
      } else {
        // No EXIF GPS — block the image
        setGpsError(
          "This image has no GPS data. Please use a photo taken with location/GPS enabled on your phone camera."
        );
      }
    } catch (err) {
      console.warn("EXIF read error:", err.message);
      setGpsError(
        "Could not read GPS from this image. Please use a photo taken with location enabled."
      );
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX 1: use gpsInfo (not location) — location was never being set
    if (!image)   return alert("Please select an image.");
    if (!gpsInfo) return alert("No GPS data found. Please use a photo with location enabled.");

    const formData = new FormData();
    formData.append('image',     image);
    formData.append('latitude',  gpsInfo.latitude);   // ✅ FIX 1
    formData.append('longitude', gpsInfo.longitude);  // ✅ FIX 1
    formData.append('address',   "Location Auto-Detected");

    try {
      setUploadStatus('uploading');
      setDuplicate(null);

      const res = await axios.post(
        'http://localhost:5000/api/complaint/submit',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (res.data.success) {
        setUploadStatus('analyzing');

        setTimeout(() => {
          setUploadStatus('success');
          setTimeout(() => navigate('/dashboard'), 2000);
        }, 1500);
      }

    } catch (err) {
      console.error(err);

      // ✅ FIX 2: handle 409 duplicate complaint response
      if (err.response?.status === 409 && err.response?.data?.duplicate) {
        setUploadStatus('');
        setDuplicate(err.response.data);   // contains message + data.userMessage[]
      } else {
        setUploadStatus('error');
      }
    }
  };

  return (
    <div className="report-container" style={{ paddingTop: '100px' }}>
      <div className="glass-card" style={{ maxWidth: '500px', margin: 'auto', padding: '30px' }}>
        <h2 style={{ color: '#000000', marginBottom: '5px' }}>📸 Report Waste</h2>

        {/* ✅ FIX 1: show GPS from gpsInfo instead of location (which was never set) */}
        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '20px' }}>
          {gpsInfo
            ? `📍 GPS Locked: ${gpsInfo.latitude.toFixed(4)}, ${gpsInfo.longitude.toFixed(4)}`
            : '🛰️ Detecting GPS from image...'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Upload Box — no CSS change */}
          <div
            className={`upload-box ${preview ? 'has-preview' : ''}`}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: '2px dashed rgba(16, 185, 129, 0.4)',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '15px',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', opacity: 0.6 }}>
                <span style={{ fontSize: '2.5rem' }}>📷</span>
                <p>Click to Snap or Upload</p>
              </div>
            )}
            <input id="fileInput" type="file" hidden onChange={handleImageChange} accept="image/*" />
          </div>

          {/* GPS error message */}
          {gpsError && (
            <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '10px' }}>
              ❌ {gpsError}
            </p>
          )}

          <button
            type="submit"
            className="upload-trigger"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={
              !image || !gpsInfo ||
              uploadStatus === 'uploading' ||
              uploadStatus === 'analyzing'
            }
          >
            {uploadStatus === 'uploading' ? '📤 Sending...'       :
             uploadStatus === 'analyzing' ? '🧠 AI Analyzing...'  :
             'Submit Report'}
          </button>
        </form>

        {/* Success */}
        {uploadStatus === 'success' && (
          <div className="status-toast success" style={{ marginTop: '20px', color: '#10b981', textAlign: 'center' }}>
            ✨ <strong>Success!</strong> Report sent to Municipality.
          </div>
        )}

        {/* Error */}
        {uploadStatus === 'error' && (
          <div className="status-toast error" style={{ marginTop: '20px', color: '#ff4d4d', textAlign: 'center' }}>
            ❌ Failed to upload. Please try again.
          </div>
        )}

        {/* ✅ FIX 2: Duplicate complaint warning */}
        {duplicate && (
          <div className="status-toast" style={{
            marginTop: '20px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '10px',
            padding: '14px',
            color: '#92400e'
          }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>
              ⚠️ Complaint Already Exists Nearby
            </strong>
            <p style={{ fontSize: '0.82rem', marginBottom: '8px' }}>{duplicate.message}</p>
            {duplicate.data?.userMessage?.map((line, i) => (
              <p key={i} style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{line}</p>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportWaste;