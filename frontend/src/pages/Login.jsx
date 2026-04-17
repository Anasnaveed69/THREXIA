import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('analyst');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('threxia_auth', 'active');
    localStorage.setItem('threxia_role', role);
    navigate('/dashboard');
  };

  return (
    <div className="login-bg">
      <div className="login-box">
        <div className="cyber-status">NEURAL LINK: ESTABLISHED // ENCRYPTION: ACTIVE</div>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', background: 'radial-gradient(circle, var(--primary-purple) 0%, transparent 70%)', opacity: 0.3, zIndex: 0 }}></div>
          <img 
            src="/logo.png" 
            alt="THREXIA Logo" 
            style={{ 
              width: '72px', 
              height: '72px', 
              objectFit: 'contain', 
              marginBottom: '1rem', 
              filter: 'drop-shadow(0 0 15px var(--primary-glow)) drop-shadow(0 0 5px var(--primary-glow))',
              position: 'relative',
              zIndex: 1
            }} 
          />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.25em', color: 'var(--text-strong)', textShadow: '0 0 20px var(--primary-glow)', margin: 0 }}>THREXIA</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ width: '30px', height: '1px', background: 'var(--primary-purple)' }}></div>
            <p style={{ color: 'var(--primary-purple)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600 }}>Advanced Threat Intelligence</p>
            <div style={{ width: '30px', height: '1px', background: 'var(--primary-purple)' }}></div>
          </div>
        </div>
        
        <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <User size={11} /> Operator Identifier
            </label>
            <input type="text" className="login-input" placeholder="Enter credentials..." required defaultValue="admin@threxia.internal" />
          </div>
          
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <ShieldCheck size={11} /> Access Clearance Level
            </label>
            <select 
              className="login-input" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="analyst">Security Analyst [L4]</option>
              <option value="manager">IT Operations Manager [L3]</option>
              <option value="admin">System Administrator [L5]</option>
              <option value="researcher">Neural Researcher [L2]</option>
            </select>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Lock size={11} /> Neural Passcode
            </label>
            <input type="password" className="login-input" placeholder="••••••••" required defaultValue="password123" />
          </div>
          
          <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '0.85rem', letterSpacing: '0.2em' }}>
            INITIALIZE ENCRYPTED UPLINK
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textDecoration: 'none', transition: 'all 0.3s', letterSpacing: '0.1em', textTransform: 'uppercase' }} onMouseOver={e => e.target.style.color = 'var(--primary-purple)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>
            Request Emergency Bypass Protocol
          </a>
        </div>
      </div>
    </div>
  );
}
