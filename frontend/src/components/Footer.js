import React from 'react';

const Footer = () => {
  const isDesktop = window.innerWidth > 640;
  
  const iconStyle = {
    color: '#22c55e',
    textShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
    fontSize: '1.5rem',
    cursor: 'pointer'
  };

  return (
    <footer style={{
      /* 1. Force Full Width & Bottom Sticky */
      position: 'relative',
      width: '100vw',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      
      /* 2. Glass Aesthetic */
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(5, 8, 15, 1) 100%)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      
      /* 3. Spacing */
      padding: '60px 0 30px 0',
      marginTop: '100px',
      boxSizing: 'border-box',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap', 
        gap: '40px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        /* Align content to the right of your sidebar */
        paddingLeft: isDesktop ? '350px' : '40px',
        paddingRight: '40px'
      }}>
        
        {/* Left Side: MISSION & BRAND */}
        <div style={{ flex: '1.5', minWidth: '300px' }}>
          <h3 style={{ 
            color: '#22c55e', 
            fontFamily: 'Syne', 
            fontSize: '1.8rem', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="bi bi-recycle" style={{...iconStyle, fontSize: '2rem'}}></i> 
            Live Truck Tracking
          </h3>
          <p style={{ color: 'rgba(241, 245, 249, 0.7)', lineHeight: '1.7', fontSize: '1rem', maxWidth: '500px' }}>
            Transforming urban landscapes through smart technology. Our platform empowers 
            All City communities to report waste, monitor collection, and build a sustainable 
            environment through real-time data reporting.
          </p>
        </div>

        {/* Center Section: QUICK RESOURCES */}
        <div style={{ flex: '0.8', minWidth: '150px' }}>
          <h4 style={{ color: '#22c55e', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Resources</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(241, 245, 249, 0.5)', fontSize: '0.95rem', lineHeight: '2.5' }}>
            <li>Robo Flow</li>
            <li>Web Scraping</li>
            <li>YOLO V8</li>
          </ul>
        </div>

        {/* Right Side: CONTACT & CONNECT */}
        <div style={{ flex: '1', textAlign: isDesktop ? 'right' : 'left', minWidth: '200px' }}>
          <h4 style={{ color: '#22c55e', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Help Desk</h4>
          <p style={{ color: 'rgba(241, 245, 249, 0.6)', fontSize: '1rem', marginBottom: '15px' }}>
            Questions? Reach us at:<br/>
            <strong style={{ color: '#f1f5f9' }}>support@purewaste.gov.in</strong> 
            
            
          </p>
         <div style={{ 
  display: 'flex', 
  gap: '25px', 
  justifyContent: isDesktop ? 'flex-end' : 'flex-start' 
}}>
  {/* GitHub - Official Website */}
  <a 
    href="https://github.com" 
    target="_blank" 
    rel="noopener noreferrer" 
    style={{ textDecoration: 'none' }}
  >
    <i className="bi bi-github" title="Github" style={iconStyle}></i>
  </a>

  {/* LinkedIn - Your Personal Profile */}
  <a 
    href="https://www.linkedin.com/in/sahitya-baman-599203301" 
    target="_blank" 
    rel="noopener noreferrer" 
    style={{ textDecoration: 'none' }}
  >
    <i className="bi bi-linkedin" title="LinkedIn" style={iconStyle}></i>
  </a>

  {/* Email - Your Personal Gmail */}
  <a 
    href="mailto:sahityabaman2512@gmail.com" 
    style={{ textDecoration: 'none' }}
  >
    <i className="bi bi-envelope-at-fill" title="Email Me" style={iconStyle}></i>
  </a>
</div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '50px', 
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: 'rgba(241, 245, 249, 0.3)', 
        fontSize: '0.85rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></span>
            SYSTEM STATUS: ONLINE
        </div>
        © 2026 PUREWASTE SYSTEMS • DESIGNED FOR SMART CITIES
      </div>
    </footer>
  );
};

export default Footer;