import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertTriangle, Clock, ShieldX } from 'lucide-react';
import PrismaticBurst from '../components/PrismaticBurst';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,     setError]     = useState('');
  const [errorType, setErrorType] = useState(''); // '' | 'pending' | 'rejected' | 'invalid'

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = data.detail || 'Authentication failed.';
        if (detail.toLowerCase().includes('pending')) {
          setErrorType('pending');
        } else if (detail.toLowerCase().includes('declined')) {
          setErrorType('rejected');
        } else {
          setErrorType('invalid');
        }
        setError(detail);
        return;
      }
      localStorage.setItem('threxia_auth',     data.access_token);
      localStorage.setItem('threxia_role',     data.role);
      localStorage.setItem('threxia_access',   JSON.stringify(data.access_level));
      localStorage.setItem('threxia_name',     data.full_name || username);
      // Redirect to the first page the user has access to
      const access = data.access_level || [];
      if (access.includes('Dashboard'))       navigate('/dashboard');
      else if (access.includes('Overview'))   navigate('/overview');
      else if (access.includes('Logs'))       navigate('/logs');
      else                                    navigate('/analyze');
    } catch {
      setErrorType('invalid');
      setError('Connection to the THREXIA security server failed.');
    }
  };

  return (
    <div className="login-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Prismatic Burst Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <PrismaticBurst
          intensity={1.2}
          speed={0.15}
          animationType="rotate3d"
          colors={['#8B5CF6', '#3B82F6', '#1E1B4B', '#0F172A', '#05050A']}
          distort={0.15}
          rayCount={0}
          mixBlendMode="lighten"
        />
      </div>

      <div className="login-box" style={{ position: 'relative', zIndex: 10 }}>
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
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              padding: '0.85rem 1rem', borderRadius: 6, marginBottom: '1.25rem',
              fontSize: '0.8rem', lineHeight: 1.5,
              background: errorType === 'pending'  ? 'rgba(245,158,11,0.08)'
                         : errorType === 'rejected' ? 'rgba(239,68,68,0.08)'
                         :                           'rgba(239,68,68,0.08)',
              border: errorType === 'pending'  ? '1px solid rgba(245,158,11,0.3)'
                     : errorType === 'rejected' ? '1px solid rgba(239,68,68,0.3)'
                     :                           '1px solid rgba(239,68,68,0.3)',
              color: errorType === 'pending' ? '#F59E0B' : 'var(--danger-red)',
            }}>
              {errorType === 'pending'  ? <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              : errorType === 'rejected'? <ShieldX size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              :                          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
              {error}
            </div>
          )}
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <User size={11} /> Operator Identifier
            </label>
            <input type="text" className="login-input" placeholder="Enter username..." required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Lock size={11} /> Neural Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  top: '40%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '0.85rem', letterSpacing: '0.2em' }}>
            INITIALIZE ENCRYPTED UPLINK
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <Link
            to="/register"
            style={{ color: 'var(--primary-purple)', fontSize: '0.72rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, transition: 'all 0.3s' }}
            onMouseOver={e => e.currentTarget.style.textShadow = '0 0 8px var(--primary-glow)'}
            onMouseOut={e  => e.currentTarget.style.textShadow = 'none'}
          >
            Request Access Clearance →
          </Link>
          <Link
            to="/forgot-password"
            style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, opacity: 0.6, marginTop: '0.2rem' }}
          >
            Forgot Neural Passcode?
          </Link>
        </div>
      </div>
    </div>


  );
}