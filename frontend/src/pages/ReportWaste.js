import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../global/styles.css';

const ReportWaste = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [status, setStatus] = useState('');

  // Get GPS Location as soon as page opens
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !location.lat) return alert("Please provide an image and location");

    const formData = new FormData();
    formData.append('image', image);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('address', "Current Location Detected");

    try {
      setStatus('Uploading...');
      const res = await axios.post('http://localhost:5000/api/complaint/submit', formData);
      if (res.data.success) {
        setStatus('Success! ✨ Report sent to Municipality.');
        // Add more "sparkle" logic here
      }
    } catch (err) {
      setStatus('Failed to upload. Try again.');
    }
  };

  return (
    <div className="report-container" style={{paddingTop: '100px'}}>
      <div className="glass-card" style={{maxWidth: '500px', margin: 'auto', padding: '30px'}}>
        <h2 style={{color: '#10b981'}}>📸 Report Garbage</h2>
        <p style={{fontSize: '0.8rem', opacity: 0.7}}>Location: {location.lat ? `${location.lat}, ${location.lng}` : 'Detecting GPS...'}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
            {preview ? <img src={preview} alt="Preview" style={{width: '100%', borderRadius: '12px'}} /> : "Click to Snap Photo"}
            <input id="fileInput" type="file" hidden onChange={handleImageChange} accept="image/*" />
          </div>
          
          <button type="submit" className="upload-trigger" style={{width: '100%', marginTop: '20px'}}>
            Submit Report
          </button>
        </form>
        {status && <p style={{marginTop: '15px', textAlign: 'center'}}>{status}</p>}
      </div>
    </div>
  );
};

export default ReportWaste;