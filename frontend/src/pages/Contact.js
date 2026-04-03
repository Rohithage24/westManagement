import React, { useState } from 'react';
import '../global/styles.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log("Form Data:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contact-container" style={{ paddingTop: '100px', paddingInline: '8vw' }}>
      <div className="hero-section">
        <h1 className="hero-title" style={{ fontSize: '3rem' }}>Get In Touch</h1>
        <p style={{ opacity: 0.8 }}>Have a question or need technical support? We're here to help.</p>
      </div>

      <div className="contact-grid">
        {/* LEFT SIDE: THE FORM */}
        <div className="glass-card contact-form-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                required 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Subject</label>
              <select onChange={(e) => setFormData({...formData, subject: e.target.value})}>
                <option>General Inquiry</option>
                <option>Report a Bug</option>
                <option>Municipal Partnership</option>
                <option>Urgent Waste Issue</option>
              </select>
            </div>

            <div className="input-group">
              <label>Message</label>
              <textarea 
                rows="5" 
                placeholder="How can we help you?" 
                required
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="upload-trigger" style={{ width: '100%', marginTop: '10px' }}>
              {submitted ? "✅ Message Sent!" : "Send Message"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: INFO CARDS */}
        <div className="contact-info-column">
          <div className="glass-card info-mini-card">
            <div className="info-icon">📞</div>
            <div>
              <h4>Emergency Helpline</h4>
              <p>+91 724 243 4000 (24/7)</p>
            </div>
          </div>

          <div className="glass-card info-mini-card">
            <div className="info-icon">🏢</div>
            <div>
              <h4>Municipal Office</h4>
              <p>Akola Municipal Corporation, Main Road, Akola, Maharashtra 444001</p>
            </div>
          </div>

          <div className="glass-card info-mini-card">
            <div className="info-icon">📧</div>
            <div>
              <h4>Support Email</h4>
              <p>support@cleancityakola.in</p>
            </div>
          </div>

          <div className="social-connect glass-card">
            <h4>Follow Our Progress</h4>
            <div className="social-icons">
              <span>Twitter</span>
              <span>Instagram</span>
              <span>Facebook</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;