import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Analyze from './pages/Analyze';
import Overview from './pages/Overview';
import Home from './pages/Home';
import { LayoutDashboard, FileText, ActivitySquare, BookOpen, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import StarBorder from './components/StarBorder';

function PrivateRoute({ children }) {
  const isAuth = !!localStorage.getItem('threxia_auth');
  return isAuth ? children : <Navigate to="/login" />;
}

function Navbar({ toggleTheme, isLight }) {
  const location = useLocation();
  const isAuth = !!localStorage.getItem('threxia_auth');
  const role = localStorage.getItem('threxia_role') || 'employee';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const roleConfig = {
    employee: { label: 'EMP', name: 'Employee', links: ['overview', 'dashboard', 'logs', 'analyze'] },
    contractor: { label: 'CTR', name: 'Contractor', links: ['overview', 'dashboard'] },
  };

  const currentRole = roleConfig[role] || roleConfig.employee;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  return (
    <nav className="navbar" style={isMenuOpen ? { backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundColor: isLight ? '#F8FAFC' : '#05050A' } : {}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleMenu} className="mobile-menu-toggle">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link to="/" className="brand" style={{ textDecoration: 'none' }} onClick={closeMenu}>
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
          <div className="brand-labels">
             <div className="brand-text">THREXIA</div>
             <div className="brand-sub">ANALYTICS ENGINE</div>
          </div>
        </Link>
      </div>
      
      <div 
        className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}
        style={isMenuOpen ? { 
          backgroundColor: isLight ? '#F8FAFC' : '#05050A', 
          opacity: 1,
          backdropFilter: 'none'
        } : {}}
      >
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>
          Home
        </Link>
        <Link to="/overview" className={`nav-link ${location.pathname === '/overview' ? 'active' : ''}`} onClick={closeMenu}>
          Overview
        </Link>
        
        {isAuth && (
          <>
            {currentRole.links.includes('dashboard') && (
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMenu}>
                Dashboard
              </Link>
            )}
            {currentRole.links.includes('logs') && (
              <Link to="/logs" className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`} onClick={closeMenu}>
                Logs
              </Link>
            )}
            {currentRole.links.includes('analyze') && (
              <Link to="/analyze" className={`nav-link ${location.pathname === '/analyze' ? 'active' : ''}`} onClick={closeMenu}>
                Analyze
              </Link>
            )}
          </>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleTheme} className="theme-toggle">
          {isLight ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        {isAuth ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              title={`Profile: ${currentRole.name}`}
              className="profile-badge">
              {currentRole.label}
            </div>
            <button 
              onClick={() => { localStorage.removeItem('threxia_auth'); localStorage.removeItem('threxia_role'); window.location.href = '/'; }} 
              className="logout-btn"
              title="Secure Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <StarBorder as={Link} to="/login" innerClassName="btn-primary" color="var(--primary-glow)" speed="4s" innerStyle={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', textDecoration: 'none', width: 'auto' }}>
            LOGIN
          </StarBorder>
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
