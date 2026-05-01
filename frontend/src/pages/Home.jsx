import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, BrainCircuit, Users, ChevronRight, BookOpen, Activity, Mail } from 'lucide-react';
import DecryptedText from '../components/DecryptedText';
import ThrexiaScanner from '../components/ThrexiaScanner';
import StarBorder from '../components/StarBorder';
import SpotlightCard from '../components/SpotlightCard';
import MetricPulse from '../components/MetricPulse';
import Sparklines from '../components/Sparklines';
import CyberGrid from '../components/CyberGrid';
import ShinyText from '../components/ShinyText';
import BlurText from '../components/BlurText';

export default function Home() {
  // Contact form state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Submit contact query
  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage('');
    try {
      const res = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (res.ok) {
        setContactMessage('✓ Inquiry sent successfully! The administrator will respond shortly.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setShowContactModal(false), 2000);
      } else {
        setContactMessage('✗ ' + (data.detail || 'Failed to send inquiry.'));
      }
    } catch (err) {
      setContactMessage('✗ Network error. Please try again.');
    } finally {
      setContactLoading(false);
    }
  }, [contactForm]);

  
  return (
    <div className="login-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Tactical Scanner Background (High-Visibility Dark Mode Tune) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.7 }}>
        <ThrexiaScanner
          speed={0.4}
          scale={0.9}
          ringCount={10}
          spokeCount={12}
          ringThickness={0.015}
          spokeThickness={0.005}
          sweepSpeed={0.4}
          sweepWidth={2.0}
          brightness={1.5}
          falloff={2.5}
        />
        <CyberGrid opacity={0.05} size={30} />
      </div>

      <div className="home-container">
        {/* Header / Hero */}
        <section className="hero-section">
          <div className="hero-badge">
            <ShinyText text="Advanced Neural Detection" speed={3} />
          </div>
          <h1 className="hero-title">
            <DecryptedText
              text="THREXIA"
              speed={60}
              maxIterations={20}
              characters="ABCDEF012345!@#$"
              style={{ letterSpacing: '0.15em' }}
            />
          </h1>
          <BlurText
            text="A state-of-the-art AI Anomaly Detection engine designed to monitor system logs, identify suspicious user behavior, and protect corporate assets from insider threats."
            delay={0.03}
            animateBy="words"
            direction="bottom"
            className="hero-subtitle"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <StarBorder as={Link} to="/login" innerClassName="btn-glowing" color="var(--primary-glow)" speed="4s">
              Initialize Gateway <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
            </StarBorder>
            <StarBorder as={Link} to="/docs" innerClassName="btn-secondary" color="rgba(255,255,255,0.4)" innerStyle={{ padding: '1rem 2rem', textDecoration: 'none', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-strong)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--panel-bg)', backdropFilter: 'blur(5px)' }}>
              Read Documentation <BookOpen size={18} />
            </StarBorder>
          </div>
        </section>

        {/* Global Performance Metrics Bar */}
        <div className="metrics-bar" style={{ position: 'relative' }}>
          <CyberGrid opacity={0.02} size={15} />
          <div className="metric-item">
            <span className="metric-label">SVM ACCURACY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="metric-value">93.62%</span>
              <Sparklines data={[88, 92, 90, 93.62]} color="var(--primary-purple)" width={40} height={15} />
            </div>
            <MetricPulse value={93.62} showLabel={false} height="3px" color="var(--primary-purple)" />
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-label">DETECTION RECALL</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="metric-value">38.4%</span>
              <Sparklines data={[30, 35, 32, 38.4]} color="var(--primary-blue)" width={40} height={15} />
            </div>
            <MetricPulse value={38.4} showLabel={false} height="3px" color="var(--primary-blue)" />
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-label">FEATURE VECTORS</span>
            <span className="metric-value">14 UNIT</span>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>ACTIVE FEED</div>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-label">PROCESSING</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="metric-value">&lt;50MS</span>
              <Activity size={14} color="var(--success-green)" />
            </div>
            <div style={{ width: '40px', height: '3px', background: 'var(--success-green)', opacity: 0.3, borderRadius: '2px' }}></div>
          </div>
        </div>

        {/* Features */}
        <div className="feature-grid">
          <SpotlightCard className="home-card" spotlightColor="rgba(139, 92, 246, 0.2)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.03} />
            <div className="icon-box">
              <BrainCircuit size={28} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-strong)' }}>Neural Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Utilizes a pre-trained OneClassSVM model tuned on 14 critical activity features
              to identify behavioral deviations with high precision.
            </p>
          </SpotlightCard>

          <SpotlightCard className="home-card" spotlightColor="rgba(59, 130, 246, 0.2)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.03} />
            <div className="icon-box">
              <Shield size={28} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-strong)' }}>Insider Shield</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Real-time monitoring of file access, device connections, and login patterns
              to detect anomalies before they become security breaches.
            </p>
          </SpotlightCard>

          <SpotlightCard className="home-card" spotlightColor="rgba(168, 85, 247, 0.2)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.03} />
            <div className="icon-box">
              <Users size={28} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-strong)' }}>Role Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Tailored reporting structures for Security Analysts, IT Managers,
              and System Administrators based on corporate hierarchy.
            </p>
          </SpotlightCard>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5, fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
          SECURE TERMINAL // V1.0.4 ACTIVE // NETWORK: ENCRYPTED
        </div>

        {/* ── Copyright & Contact Footer ── */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} THREXIA — FAST-NU Lahore · All rights reserved
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(139,92,246,0.3)',
                color: 'var(--primary-purple)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Mail size={14} /> Contact Administrator
            </button>
          </div>
        </div>

        {/* ── Contact Modal ── */}
        {showContactModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }} onClick={() => setShowContactModal(false)}>
            <div style={{
              background: 'var(--card-bg)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-strong)', margin: 0 }}>Contact Administrator</h3>
                <button onClick={() => setShowContactModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
              </div>
              <form onSubmit={handleContactSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Name</label>
                  <input type="text" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: 'var(--text-strong)', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} required
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: 'var(--text-strong)', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Subject</label>
                  <input type="text" value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} required
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: 'var(--text-strong)', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Message</label>
                  <textarea value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} required rows={4}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', color: 'var(--text-strong)', fontSize: '0.9rem', resize: 'vertical' }} />
                </div>
                {contactMessage && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', background: contactMessage.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: contactMessage.includes('success') ? 'var(--success-green)' : 'var(--danger-red)', fontSize: '0.85rem' }}>
                    {contactMessage}
                  </div>
                )}
                <button type="submit" disabled={contactLoading} style={{
                  width: '100%', padding: '0.875rem', background: 'linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)',
                  border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: contactLoading ? 'not-allowed' : 'pointer', opacity: contactLoading ? 0.7 : 1,
                }}>
                  {contactLoading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
