import { Link } from 'react-router-dom';
import { Shield, BrainCircuit, Users, ChevronRight, BookOpen } from 'lucide-react';
import DecryptedText from '../components/DecryptedText';
import ThrexiaScanner from '../components/ThrexiaScanner';

export default function Home() {
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
      </div>

      <div className="home-container">
        {/* Header / Hero */}
        <section className="hero-section">
          <div className="hero-badge">Advanced Neural Detection</div>
          <h1 className="hero-title">
            <DecryptedText 
              text="THREXIA" 
              speed={60} 
              maxIterations={20} 
              characters="ABCDEF012345!@#$"
              style={{ letterSpacing: '0.15em' }}
            />
          </h1>
          <p className="hero-subtitle">
            A state-of-the-art AI Anomaly Detection engine designed to monitor system logs, 
            identify suspicious user behavior, and protect corporate assets from insider threats.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <Link to="/login" className="btn-glowing">
              Initialize Gateway <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link to="/overview" className="btn-secondary" style={{ padding: '1rem 2rem', textDecoration: 'none', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-strong)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--panel-bg)', backdropFilter: 'blur(5px)' }}>
              Read Documentation <BookOpen size={18} />
            </Link>
          </div>
        </section>

        {/* Features */}
        <div className="feature-grid">
          <div className="home-card">
            <div className="icon-box">
              <BrainCircuit size={28} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-strong)' }}>Neural Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Utilizes a pre-trained OneClassSVM model tuned on 14 critical activity features 
              to identify behavioral deviations with high precision.
            </p>
          </div>

          <div className="home-card">
            <div className="icon-box">
              <Shield size={28} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-strong)' }}>Insider Shield</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Real-time monitoring of file access, device connections, and login patterns 
              to detect anomalies before they become security breaches.
            </p>
          </div>

          <div className="home-card">
            <div className="icon-box">
              <Users size={28} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-strong)' }}>Role Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Tailored reporting structures for Security Analysts, IT Managers, 
              and System Administrators based on corporate hierarchy.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5, fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
          SECURE TERMINAL // V1.0.4 ACTIVE // NETWORK: ENCRYPTED
        </div>
      </div>
    </div>
  );
}
