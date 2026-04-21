import { Link } from 'react-router-dom';
import {
  BookOpen, Shield, BrainCircuit, Users, Key, ChevronRight,
  Lock, Eye, BarChart2, Search, FileText, AlertTriangle,
  CheckCircle, Server, Cpu, Globe, Zap, Settings, ShieldAlert
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import CyberGrid from '../components/CyberGrid';
import StarBorder from '../components/StarBorder';
import MetricPulse from '../components/MetricPulse';
import Sparklines from '../components/Sparklines';

/* ─── Role definitions for public display ─── */
const ROLES = [
  {
    name: 'Security Analyst',
    badge: 'ANA',
    color: 'var(--primary-purple)',
    glow: 'rgba(139,92,246,0.18)',
    icon: <ShieldAlert size={20} />,
    access: ['Overview', 'Dashboard', 'Logs', 'Manual Analysis'],
    description: 'Full platform access. Monitors live threats, investigates logs, runs manual anomaly scans.',
  },
  {
    name: 'IT Manager',
    badge: 'MGR',
    color: 'var(--primary-blue)',
    glow: 'rgba(59,130,246,0.18)',
    icon: <BarChart2 size={20} />,
    access: ['Overview', 'Dashboard'],
    description: 'Access to high-level summaries and executive dashboards. No raw log exposure.',
  },
  {
    name: 'System Administrator',
    badge: 'ADM',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.12)',
    icon: <Key size={20} />,
    access: ['Dashboard', 'Logs'],
    description: 'Operational access to infrastructure monitoring logs and system activity records.',
  },
  {
    name: 'Student / Researcher',
    badge: 'RES',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.12)',
    icon: <Search size={20} />,
    access: ['Overview', 'Manual Analysis'],
    description: 'Explore the project overview and run manual classifications through the AI engine.',
  },
];

const ACCESS_ICON_MAP = {
  Overview:         <Eye size={11} />,
  Dashboard:        <BarChart2 size={11} />,
  Logs:             <FileText size={11} />,
  'Manual Analysis':<BrainCircuit size={11} />,
};

const ARCHITECTURE = [
  { step: '01', title: 'Log Ingestion', icon: <Server size={14} /> },
  { step: '02', title: 'Preprocessing', icon: <Settings size={14} /> },
  { step: '03', title: 'AI Analysis', icon: <Zap size={14} /> },
  { step: '04', title: 'Intelligence UI', icon: <Eye size={14} /> },
];

/* ─── Component ─── */
export default function Docs() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '2rem', mb: '4rem' }}>
        <h1 style={{ 
          fontSize: '2.4rem', 
          fontWeight: 800, 
          color: 'var(--text-strong)', 
          letterSpacing: '0.02em',
          marginBottom: '0.5rem'
        }}>
          Project Documentation
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1rem',
          fontWeight: 400,
          opacity: 0.8
        }}>
          Understanding the foundation and objectives of the THREXIA Intelligence Dashboard.
        </p>

        {/* Status Banner inspired by screenshot */}
        <div style={{ 
          marginTop: '2rem', 
          marginBottom: '3rem', 
          padding: '1rem 1.4rem', 
          background: 'var(--primary-glow)', 
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '0.6rem',
            fontWeight: 800,
            background: 'var(--primary-purple)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '2px',
            letterSpacing: '0.1em'
          }}>PUBLIC ACCESS</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-strong)', margin: 0, opacity: 0.9 }}>
            <strong>DESIGNATED DOCS ACTIVE:</strong> This interface is optimized to guide users through the THREXIA intelligence scope.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* ── 1. Problem Definition ────────────────────── */}
        <section>
          <SectionLabel icon={<Zap size={18} />} num="1" title="PROBLEM DEFINITION" />
          <SpotlightCard className="card" spotlightColor="rgba(139,92,246,0.12)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.025} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
                Modern organizations generate massive amounts of system logs from user activities such as logins, file access, device usage, and network activity. Manually monitoring these logs to detect suspicious behaviour is difficult and time-consuming for security analysts. Traditional enterprise tools often have complex interfaces and steep learning curves, making them difficult for students and beginners to understand.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
                The objective of the <strong style={{ color: 'var(--text-strong)' }}>THREXIA</strong> project is to develop an AI-based threat intelligence dashboard that detects anomalies in user behaviour logs and presents them through a simple and intuitive interface. The system will analyse user activity patterns and automatically identify suspicious behaviour such as unusual login times, abnormal access patterns, or deviations from normal activity.
              </p>
            </div>
          </SpotlightCard>
        </section>

        {/* ── 2. Project Scope & Stakeholders ─────────── */}
        <section>
          <SectionLabel icon={<Users size={18} />} num="2" title="PROJECT SCOPE & STAKEHOLDERS" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Domain Context */}
            <SpotlightCard className="card" spotlightColor="rgba(59,130,246,0.1)" style={{ position: 'relative' }}>
              <CyberGrid opacity={0.03} size={20} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--primary-blue)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                <Shield size={14} /> DOMAIN CONTEXT
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                The project belongs to the cybersecurity and user behaviour analytics (UEBA) domain. It focuses on detecting insider threats and abnormal system activities using advanced machine learning techniques.
              </p>
              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontWeight: 800, fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                  <Zap size={12} /> ULTIMATE GOAL
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-strong)', margin: 0, lineHeight: 1.5 }}>
                  To build an end-to-end AI solution that performs anomaly detection on system logs and displays results through an interactive web dashboard.
                </p>
              </div>
            </SpotlightCard>

            {/* Stakeholders */}
            <SpotlightCard className="card" spotlightColor="rgba(139,92,246,0.1)" style={{ position: 'relative' }}>
              <CyberGrid opacity={0.03} size={25} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--primary-purple)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                <Users size={14} /> PRIMARY STAKEHOLDERS
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {ROLES.map((r, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: '8px', 
                      background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: r.color, flexShrink: 0 
                    }}>
                      {r.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-strong)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </div>
        </section>

        {/* ── 3. System Architecture ──────────────────── */}
        <section>
          <SectionLabel icon={<Server size={18} />} num="3" title="SYSTEM ARCHITECTURE" />
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1rem',
            background: 'rgba(255,255,255,0.02)',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CyberGrid opacity={0.015} />
            {ARCHITECTURE.map((node, i) => (
              <div key={i} style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ 
                  background: 'var(--bg-color)', 
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '6px',
                  padding: '1.25rem 0.5rem',
                  zIndex: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary-purple)', letterSpacing: '0.1em' }}>NODE {node.step}</div>
                  <div style={{ color: 'var(--text-strong)', fontWeight: 700, fontSize: '0.85rem' }}>{node.title}</div>
                </div>
                {i < ARCHITECTURE.length - 1 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    right: '-0.6rem', 
                    width: '1rem', 
                    height: '1px', 
                    background: 'rgba(139, 92, 246, 0.3)',
                    zIndex: 1
                  }} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. ML Performance Analysis ──────────────── */}
        <section>
          <SectionLabel icon={<BrainCircuit size={18} />} num="4" title="ML PERFORMANCE ANALYSIS" />
          <SpotlightCard className="card" spotlightColor="rgba(139,92,246,0.12)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.03} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Isolation Forest Module */}
              <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>ISOLATION FOREST</h3>
                  <Sparklines data={[20, 45, 28, 60, 42, 70, 55]} color="var(--primary-blue)" width={80} />
                </div>
                <MetricPulse label="Accuracy" value={92.07} color="var(--primary-blue)" />
                <MetricPulse label="Precision" value={25.65} color="var(--primary-blue)" />
                <MetricPulse label="Recall" value={24.90} color="var(--primary-blue)" />
                <MetricPulse label="F1-Score" value={25.27} color="var(--primary-blue)" />
              </div>

              {/* One-Class SVM Module */}
              <div style={{ background: 'var(--primary-glow)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--primary-purple)', boxShadow: '0 0 15px var(--primary-glow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>ONE-CLASS SVM (PRIMARY)</h3>
                  <Sparklines data={[30, 50, 45, 80, 65, 95, 90]} color="var(--primary-purple)" width={80} />
                </div>
                <MetricPulse label="Accuracy" value={93.62} color="var(--primary-purple)" />
                <MetricPulse label="Precision" value={40.30} color="var(--primary-purple)" />
                <MetricPulse label="Recall" value={38.37} color="var(--primary-purple)" />
                <MetricPulse label="F1-Score" value={39.31} color="var(--primary-purple)" />
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem', textAlign: 'center', padding: '1.5rem 1rem 0.5rem', borderTop: '1px solid var(--border-color)' }}>
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'var(--panel-bg)', padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--border-highlight)', fontWeight: 700, letterSpacing: '0.05em', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                 <CheckCircle size={12} color="var(--success-green)" /> CROSS-VALIDATION STATUS: <strong style={{ color: 'var(--text-strong)' }}>VERIFIED (5-FOLD)</strong>
               </div>
            </div>
          </SpotlightCard>
        </section>

        {/* ── Role Access Map ─────────────────────────── */}
        <section>
          <SectionLabel icon={<Key size={18} />} num="5" title="ROLE ACCESS MAP" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', opacity: 0.8 }}>
            THREXIA enforces strict permission boundaries. The interface adapts dynamically based on the assigned role's intelligence clearance.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {ROLES.map((r) => (
              <SpotlightCard key={r.name} className="card" spotlightColor={r.glow} style={{ position: 'relative' }}>
                <CyberGrid opacity={0.04} size={20} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: '10px', 
                    background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: r.color, flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-strong)' }}>{r.name}</div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: r.color, background: `${r.color}15`, padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.1em' }}>{r.badge}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {r.access.map((a) => (
                    <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: r.color, opacity: 0.8, fontWeight: 600 }}>
                      {ACCESS_ICON_MAP[a]} {a}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* ── Getting Started ─────────────────────────── */}
        <section>
          <SectionLabel icon={<Lock size={18} />} num="6" title="GETTING STARTED" />
          <SpotlightCard className="card" spotlightColor="rgba(255,255,255,0.02)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { icon: <CheckCircle size={16} color="var(--success-green)" />, title: 'Request Authorization', text: 'Contact your System Administrator and specify which role you need (Analyst, Manager, Administrator, or Researcher).' },
                { icon: <CheckCircle size={16} color="var(--success-green)" />, title: 'Initialize Terminal', text: 'Log in via the Initialize Gateway button. Your dashboard will auto-configure based on your intelligence clearance.' },
                { icon: <AlertTriangle size={16} color="#f59e0b" />, title: 'Security Protocol', text: 'Do not share credentials. Each session is authenticated and access violations are logged.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ marginTop: '3px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: '0.2rem' }}>{item.title}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center', pt: '2rem' }}>
          {(() => {
            const isAuth = !!localStorage.getItem('threxia_auth');
            const access = JSON.parse(localStorage.getItem('threxia_access') || '[]');
            
            let targetPath = '/login';
            if (isAuth) {
              if (access.includes('Overview')) targetPath = '/overview';
              else if (access.includes('Dashboard')) targetPath = '/dashboard';
              else if (access.includes('Manual Analysis')) targetPath = '/analyze';
              else targetPath = '/';
            }

            return (
              <StarBorder as={Link} to={targetPath} innerClassName="btn-glowing" color="var(--primary-glow)" speed="4s">
                INITIALIZE GATEWAY <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
              </StarBorder>
            );
          })()}
        </div>

      </div>
    </div>
  );
}

/* ─── Section label helper ─── */
function SectionLabel({ icon, num, title }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      marginBottom: '1.8rem',
    }}>
      <div style={{ 
        color: 'var(--primary-purple)',
        filter: 'drop-shadow(0 0 5px var(--primary-glow))'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '1.1rem',
        fontWeight: 800,
        color: 'var(--text-strong)',
        letterSpacing: '0.08em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>{num}.</span>
        {title}
      </div>
    </div>
  );
}
