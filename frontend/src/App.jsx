import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Analyze from './pages/Analyze';
import Overview from './pages/Overview';
import Home from './pages/Home';
import { LayoutDashboard, FileText, ActivitySquare, BookOpen, Sun, Moon, LogOut } from 'lucide-react';

function PrivateRoute({ children }) {
  const isAuth = !!localStorage.getItem('threxia_auth');
  return isAuth ? children : <Navigate to="/login" />;
}

function Navbar({ toggleTheme, isLight }) {
  const location = useLocation();
  const isAuth = !!localStorage.getItem('threxia_auth');
  const role = localStorage.getItem('threxia_role') || 'employee';

  // Always show Navbar for Theme Toggle and Public Overview access

  const roleConfig = {
    employee: { label: 'EMP', name: 'Employee', links: ['overview', 'dashboard', 'logs', 'analyze'] },
    contractor: { label: 'CTR', name: 'Contractor', links: ['overview', 'dashboard'] },
  };

  const currentRole = roleConfig[role] || roleConfig.employee;

  const handleLogout = () => {
    localStorage.removeItem('threxia_auth');
    localStorage.removeItem('threxia_role');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
        <img 
          src="/logo.png" 
          alt="THREXIA Logo" 
          style={{ 
            width: 44, 
            height: 44, 
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 5px var(--primary-glow))' 
          }} 
        />
        <div>
           <div className="brand-text">THREXIA</div>
           <div className="brand-sub">ANALYTICS ENGINE</div>
        </div>
      </Link>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Home
        </Link>
        <Link to="/overview" className={`nav-link ${location.pathname === '/overview' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Overview
        </Link>
        
        {isAuth && (
          <>
            {currentRole.links.includes('dashboard') && (
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Dashboard
              </Link>
            )}
            {currentRole.links.includes('logs') && (
              <Link to="/logs" className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Logs
              </Link>
            )}
            {currentRole.links.includes('analyze') && (
              <Link to="/analyze" className={`nav-link ${location.pathname === '/analyze' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Analyze
              </Link>
            )}
          </>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isLight ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        {isAuth ? (
          <>
            <div 
              title={`Profile: ${currentRole.name}`}
              style={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--border-highlight)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {currentRole.label}
            </div>
            <button 
              onClick={() => { localStorage.removeItem('threxia_auth'); localStorage.removeItem('threxia_role'); window.location.href = '/'; }} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
              title="Secure Logout"
            >
              <LogOut size={20} color="var(--danger-red)" />
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textDecoration: 'none' }}>LOGIN</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLight]);

  const toggleTheme = () => setIsLight(!isLight);

  return (
    <Router>
      <div className="layout-wrapper">
        <Navbar toggleTheme={toggleTheme} isLight={isLight} />
        <main className="container" style={{ display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
            <Route path="/analyze" element={<PrivateRoute><Analyze /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
