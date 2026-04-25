import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Briefcase, MessageSquare, ArrowRight, CheckCircle, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const ROLES = [
  {
    value:       'Security Analyst',
    label:       'Security Analyst',
    description: 'Full investigation access — monitor alerts, analyze threats, and manage logs.',
    badge:       'ANA',
  },
  {
    value:       'IT Manager',
    label:       'IT Manager',
    description: 'Executive dashboard access — high-level summaries and security reports.',
    badge:       'MGR',
  },
  {
    value:       'Student/Researcher',
    label:       'Student / Researcher',
    description: 'Sandbox environment — explore AI threat detection in a controlled academic mode.',
    badge:       'RES',
  },
];

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username:  '',
    full_name: '',
    email:     '',
    role:      'Student/Researcher',
    reason:    '',
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [touched,  setTouched]  = useState({});

  const selectedRole = ROLES.find(r => r.value === formData.role);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const touch = key => setTouched(prev => ({ ...prev, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.reason.trim().length < 20) {
      setError('Business justification must be at least 20 characters.');
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`${API_BASE_URL}/api/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Connection to the THREXIA security server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="login-bg" style={{ alignItems: 'center' }}>
        <div className="register-success-box">
          <div className="register-success-icon">
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.75rem' }}>
            Request Submitted
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Your access request for <strong style={{ color: 'var(--success-green)' }}>{formData.role}</strong> clearance
            has been forwarded to the System Administrator for review.
          </p>
          <div className="register-info-box" style={{ marginBottom: '1.5rem' }}>
            <div className="register-info-row">
              <span className="register-info-label"><Clock size={13} /> Typical response</span>
              <span className="register-info-value">Within 24 hours</span>
            </div>
            <div className="register-info-row">
              <span className="register-info-label"><Mail size={13} /> Notification sent to</span>
              <span className="register-info-value" style={{ color: 'var(--primary-blue)' }}>{formData.email}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Once approved, you will receive your credentials via email. Do not attempt to log in until you receive that notification.
          </p>
          <button className="btn-primary" onClick={() => navigate('/login')} style={{ fontSize: '0.8rem', letterSpacing: '0.15em' }}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Registration Form ───────────────────────────────────────────────────────
  return (
    <div className="login-bg" style={{ alignItems: 'flex-start', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="cyber-status">REGISTRATION PORTAL // CLEARANCE: OPEN</div>

      <div className="register-box">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, var(--primary-purple) 0%, transparent 70%)', opacity: 0.25, borderRadius: '50%' }} />
            <img src="/logo.png" alt="THREXIA" style={{ width: 64, height: 64, objectFit: 'contain', filter: 'drop-shadow(0 0 12px var(--primary-glow))', position: 'relative' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-strong)', textShadow: '0 0 20px var(--primary-glow)', margin: 0 }}>
            THREXIA
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
            <div style={{ width: 28, height: 1, background: 'var(--primary-purple)' }} />
            <span style={{ color: 'var(--primary-purple)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600 }}>
              Access Clearance Request
            </span>
            <div style={{ width: 28, height: 1, background: 'var(--primary-purple)' }} />
          </div>
        </div>

        {/* Notice banner */}
        <div className="register-notice">
          <Shield size={14} />
          All access requests are reviewed by a System Administrator. You will be notified via email once your clearance status is determined.
        </div>

        {/* Error */}
        {error && (
          <div className="register-error">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Full Name + Email */}
          <div className="register-grid">
            <div className="register-field">
              <label className="register-label"><User size={11} /> Full Name</label>
              <input
                type="text"
                className="login-input"
                placeholder="Anas Naveed"
                required
                value={formData.full_name}
                onBlur={() => touch('full_name')}
                onChange={e => set('full_name', e.target.value)}
              />
            </div>
            <div className="register-field">
              <label className="register-label"><Mail size={11} /> Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="you@example.com"
                required
                value={formData.email}
                onBlur={() => touch('email')}
                onChange={e => set('email', e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Username */}
          <div className="register-field" style={{ marginBottom: '1.25rem' }}>
            <label className="register-label"><User size={11} /> Desired Username</label>
            <input
              type="text"
              className="login-input"
              placeholder="analyst_01"
              required
              minLength={3}
              value={formData.username}
              onBlur={() => touch('username')}
              onChange={e => set('username', e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
              Lowercase letters, numbers, and underscores only.
            </span>
          </div>

          {/* Row 3: Role selection */}
          <div className="register-field" style={{ marginBottom: '1.25rem' }}>
            <label className="register-label"><Briefcase size={11} /> Requested Operational Role</label>
            <div style={{ position: 'relative' }}>
              <select
                className="login-input"
                value={formData.role}
                onChange={e => set('role', e.target.value)}
                style={{ marginBottom: 0, paddingRight: '2.5rem' }}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-purple)', pointerEvents: 'none' }} />
            </div>
            {selectedRole && (
              <div className="register-role-desc">
                <span className="register-role-badge">{selectedRole.badge}</span>
                {selectedRole.description}
              </div>
            )}
          </div>

          {/* Row 4: Justification */}
          <div className="register-field" style={{ marginBottom: '1.75rem' }}>
            <label className="register-label">
              <MessageSquare size={11} /> Business Justification
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.5rem', letterSpacing: 0 }}>
                ({formData.reason.length}/20 min)
              </span>
            </label>
            <textarea
              className="login-input"
              placeholder="Briefly describe why you need access to the THREXIA platform and how you will use it..."
              required
              minLength={20}
              rows={4}
              value={formData.reason}
              onBlur={() => touch('reason')}
              onChange={e => set('reason', e.target.value)}
              style={{ resize: 'vertical', marginBottom: 0 }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ padding: '1rem', fontSize: '0.8rem', letterSpacing: '0.18em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
          >
            {loading ? (
              <>
                <span className="register-spinner" />
                SUBMITTING REQUEST...
              </>
            ) : (
              <>
                SUBMIT ACCESS REQUEST
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link
              to="/login"
              style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.3s' }}
              onMouseOver={e => e.target.style.color = 'var(--primary-purple)'}
              onMouseOut={e  => e.target.style.color = 'var(--text-secondary)'}
            >
              Already have clearance? Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
