import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../global/styles.css';

const ReportWaste = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [uploadStatus, setUploadStatus] = useState(''); // 'idle', 'uploading', 'analyzing', 'success', 'error'
  const navigate = useNavigate();

  // Get GPS Location as soon as page opens
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("GPS Denied", err);
          setUploadStatus('Please allow GPS to report waste.');
        }
      );
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setUploadStatus('idle'); // Reset status on new image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !location.lat) return alert("Please provide an image and wait for GPS location.");

    const formData = new FormData();
    formData.append('image', image);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('address', "Location Auto-Detected");

    try {
      setUploadStatus('uploading');
      
      // Sending to backend with credentials for the JWT cookie
      const res = await axios.post('http://localhost:5000/api/complaint/submit', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUploadStatus('analyzing');
        
        // Artificial delay to make the user feel the "AI Analysis" is happening
        setTimeout(() => {
          setUploadStatus('success');
          // Add your sparkle logic or navigation here
          setTimeout(() => navigate('/dashboard'), 2000);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
    }
  };

  return (
    <div className="report-container" style={{paddingTop: '100px'}}>
      <div className="glass-card" style={{maxWidth: '500px', margin: 'auto', padding: '30px'}}>
        <h2 style={{color: '#000000', marginBottom: '5px'}}>📸 Report Waste</h2>
        <p style={{fontSize: '0.85rem', opacity: 0.7, marginBottom: '20px'}}>
          {location.lat ? `📍 GPS Locked: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '🛰️ Detecting GPS...'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Interactive Upload Box */}
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
              <img src={preview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <div style={{textAlign: 'center', opacity: 0.6}}>
                <span style={{fontSize: '2.5rem'}}>📷</span>
                <p>Click to Snap or Upload</p>
              </div>
            )}
            <input id="fileInput" type="file" hidden onChange={handleImageChange} accept="image/*" />
          </div>
          
          <button 
            type="submit" 
            className="upload-trigger" 
            style={{width: '100%', marginTop: '20px'}}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'analyzing'}
          >
            {uploadStatus === 'uploading' ? '📤 Sending...' : 
             uploadStatus === 'analyzing' ? '🧠 AI Analyzing...' : 
             'Submit Report'}
          </button>
        </form>

        {/* Dynamic Status Feedback */}
        {uploadStatus === 'success' && (
            <div className="status-toast success" style={{marginTop: '20px', color: '#10b981', textAlign: 'center'}}>
                ✨ <strong>Success!</strong> Report sent to Municipality.
            </div>
        )}
        {uploadStatus === 'error' && (
            <div className="status-toast error" style={{marginTop: '20px', color: '#ff4d4d', textAlign: 'center'}}>
                ❌ Failed to upload. Please try again.
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportWaste;