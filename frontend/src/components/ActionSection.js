import React from 'react';

const ActionSection = ({ onReportClick }) => {
  return (
    <div className="action-section">
      {/* Left Side: Guidelines */}
      <div className="guidelines-left">
        <h3>How to Report Waste</h3>
        <ul className="guideline-list">
          <li><span>1</span> Take a clear photo of the waste area.</li>
          <li><span>2</span> Ensure your GPS/Location is turned on.</li>
          <li><span>3</span> Upload the photo to pin it on the map.</li>
          <li><span>4</span> Our team/community will be notified for action.</li>
        </ul>
      </div>

      {/* Right Side: Upload Box */}
      <div className="upload-right">
        <div className="glass-card upload-container">
          <h3>Report New Issue</h3>
          <div className="upload-box">
            <input type="file" id="file-upload" hidden />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📸</div>
              <p style={{ fontWeight: '600' }}>Click to upload photo</p>
              <small style={{ opacity: 0.6 }}>JPG or PNG supported</small>
            </label>
          </div>
          <button 
            className="upload-trigger" 
            style={{ marginTop: "20px", width: "100%" }}
            onClick={onReportClick}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionSection;