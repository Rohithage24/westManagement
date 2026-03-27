import React from 'react';
import '../global/styles.css';

const About = () => {
  const steps = [
    {
      title: "1. Capture & AI Analysis",
      desc: "User snaps a photo. Our integrated ML model analyzes the waste type (Plastic, Organic, etc.) and calculates severity instantly.",
      icon: "📸"
    },
    {
      title: "2. Geo-Tagging",
      desc: "Precise GPS coordinates are attached to the report, creating a live 'Red' pin on the city's waste map.",
      icon: "📍"
    },
    {
      title: "3. Municipal Action",
      desc: "Authorities receive the alert in real-time. A team is dispatched, and the pin turns 'Yellow' (Pending).",
      icon: "🚛"
    },
    {
      title: "4. A Cleaner City",
      desc: "Once cleared, the status is updated to 'Complete'. The pin turns 'Green', and the user earns community points.",
      icon: "✨"
    }
  ];

  return (
    <div className="about-container" style={{ paddingTop: '100px', paddingInline: '10vw' }}>
      <div className="hero-section">
        <h1 className="hero-title" style={{ fontSize: '3rem' }}>The Mission</h1>
        <p style={{ maxWidth: '700px', margin: 'auto', opacity: 0.8 }}>
          CleanCity Akola is more than just a website; it's a bridge between responsible citizens and 
          efficient municipal action, powered by Artificial Intelligence.
        </p>
      </div>

      <div className="timeline-container">
        {steps.map((step, index) => (
          <div key={index} className="timeline-step glass-card">
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass-card" style={{marginTop: '50px', padding: '40px', textAlign: 'center'}}>
        <h2>Built with Modern Tech</h2>
        <div className="tech-stack">
          <span>React 18</span>
          <span>Node.js</span>
          <span>MongoDB</span>
          <span>TensorFlow AI</span>
          <span>Leaflet Maps</span>
        </div>
      </div>
    </div>
  );
};

export default About;