import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.detail || 'Request failed.');
      }
    } catch {
      setError('Connection to security server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-box" style={{ maxWidth: '450px' }}>
        <div className="cyber-status">SECURITY PROTOCOL: RESET REQUEST // STAGE 1</div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="p-3 bg-purple-600/20 rounded-xl inline-block mb-4">
             <ShieldCheck className="text-primary-purple" size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-strong)', textShadow: '0 0 20px var(--primary-glow)', margin: 0 }}>FORGOT PASSCODE</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Submit your registered neural identifier (email) to request a password reset from the System Administrator.
          </p>
        </div>

        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-emerald-400 font-bold mb-2">REQUEST LOGGED</h3>
            <p className="text-slate-300 text-sm mb-6">{message}</p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '0.75rem 1.5rem' }}>
              RETURN TO LOGIN
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {error && (
              <div style={{
                padding: '0.85rem 1rem', borderRadius: 6, marginBottom: '1.25rem',
                fontSize: '0.8rem', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger-red)'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Mail size={11} /> Registered Email Address
              </label>
              <input 
                type="email" 
                className="login-input" 
                placeholder="operator@threxia.io" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem' }}>
              {loading ? 'TRANSMITTING...' : 'REQUEST SYSTEM RESET'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link
                to="/login"
                style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
