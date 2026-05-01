import { Link } from 'react-router-dom';
import {
  BookOpen, Shield, BrainCircuit, Users, Key, ChevronRight,
  Lock, Eye, BarChart2, Search, FileText, AlertTriangle,
  CheckCircle, Server, Cpu, Globe, Zap, Settings, ShieldAlert, Monitor
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
    description: 'Monitors live telemetry, investigates behavioral anomalies, and executes incident resolution (Resolve/Escalate) workflows.',
  },
  {
    name: 'IT Manager',
    badge: 'MGR',
    color: 'var(--primary-blue)',
    glow: 'rgba(59,130,246,0.18)',
    icon: <BarChart2 size={20} />,
    access: ['Overview', 'Dashboard', 'Intelligence Reports'],
    description: 'Strategic oversight. Reviews executive intelligence reports, trends, and security recommendations. No raw log exposure.',
  },
  {
    name: 'System Administrator',
    badge: 'ADM',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.12)',
    icon: <Key size={20} />,
    access: ['Dashboard', 'Logs', 'Access Control', 'Session Monitor'],
    description: 'Platform management. Handles user approvals, password resets, and real-time session monitoring.',
  },
  {
    name: 'Student / Researcher',
    badge: 'RES',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.12)',
    icon: <Search size={20} />,
    access: ['Overview', 'Manual Analysis'],
    description: 'Explores THREXIA capabilities and runs manual behaviour classifications through the AI engine.',
  },
];

const ACCESS_ICON_MAP = {
  Overview: <Eye size={11} />,
  Dashboard: <BarChart2 size={11} />,
  Logs: <FileText size={11} />,
  'Manual Analysis': <BrainCircuit size={11} />,
  'Intelligence Reports': <FileText size={11} />,
  'Access Control': <Shield size={11} />,
  'Session Monitor': <Monitor size={11} />,
};

const ARCHITECTURE = [
  { step: '01', title: 'MongoDB Persistence', icon: <Server size={14} /> },
  { step: '02', title: 'ML In-Memory Engine', icon: <Cpu size={14} /> },
  { step: '03', title: 'Real-time Analytics', icon: <Zap size={14} /> },
  { step: '04', title: 'Command Interface', icon: <Eye size={14} /> },
];

/* ─── Component ─── */
export default function Docs() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem', marginBottom: '4rem' }}>
        <h1 className="page-title">
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

        {/* Status Banner */}
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
          }}>V1.0.4</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-strong)', margin: 0, opacity: 0.9 }}>
            <strong>DESIGNATED DOCS ACTIVE:</strong> This interface is optimized for Version 1.0.4 with full persistence and executive reporting.
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
                Modern organizations are under constant threat from insider activities whether malicious or accidental. Traditional enterprise tools often bombard analysts with raw data without providing clear, actionable intelligence.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
                <strong style={{ color: 'var(--text-strong)' }}>THREXIA</strong> bridges this gap by combining an <strong style={{ color: 'var(--primary-purple)' }}>AI-powered behavioral engine</strong> with a role-optimized command center. It doesn't just show data; it provides Intelligence categorizing risks, suggesting actions, and providing executives with the "Health Score" of their digital perimeter.
              </p>
            </div>
          </SpotlightCard>
        </section>

        {/* ── 2. Intelligence Modules ──────────────────── */}
        <section>
          <SectionLabel icon={<BrainCircuit size={18} />} num="2" title="INTELLIGENCE MODULES" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

            <SpotlightCard className="card" spotlightColor="rgba(16,185,129,0.1)" style={{ position: 'relative' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--success-green)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '0.1em' }}>EXECUTIVE REPORTING</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The IT Manager view aggregates live telemetry into a high-density intelligence report. It calculates System Integrity Scores, neutralisation rates, and generates priority-coded strategic recommendations.
              </p>
            </SpotlightCard>

            <SpotlightCard className="card" spotlightColor="rgba(59,130,246,0.1)" style={{ position: 'relative' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '0.1em' }}>INCIDENT RESOLUTION</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Security Analysts can interact with the live threat feed. Incidents can be Resolved (closed as safe) or Escalated to management, ensuring a clear chain of custody for every system deviation.
              </p>
            </SpotlightCard>

            <SpotlightCard className="card" spotlightColor="rgba(34,211,238,0.1)" style={{ position: 'relative' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 800, marginBottom: '1rem', letterSpacing: '0.1em' }}>ACCESS GOVERNANCE</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                System Administrators manage the "Human Firewall." This includes approving new clearance requests, resetting credentials, and terminating active sessions in real-time to mitigate immediate threats.
              </p>
            </SpotlightCard>
          </div>
        </section>

        {/* ── 3. ML Performance ───────────────────────── */}
        <section>
          <SectionLabel icon={<Zap size={18} />} num="3" title="ML PERFORMANCE" />
          <SpotlightCard className="card" spotlightColor="rgba(139,92,246,0.12)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.03} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 800, margin: 0 }}>ISOLATION FOREST</h3>
                  <Sparklines data={[20, 45, 28, 60, 42, 70, 55]} color="var(--primary-blue)" width={80} />
                </div>
                <MetricPulse label="Accuracy" value={92.07} color="var(--primary-blue)" />
                <MetricPulse label="F1-Score" value={25.27} color="var(--primary-blue)" />
              </div>
              <div style={{ background: 'var(--primary-glow)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--primary-purple)', boxShadow: '0 0 15px var(--primary-glow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: 800, margin: 0 }}>ONE-CLASS SVM (PRIMARY)</h3>
                  <Sparklines data={[30, 50, 45, 80, 65, 95, 90]} color="var(--primary-purple)" width={80} />
                </div>
                <MetricPulse label="Accuracy" value={93.62} color="var(--primary-purple)" />
                <MetricPulse label="F1-Score" value={39.31} color="var(--primary-purple)" />
              </div>
            </div>
          </SpotlightCard>
        </section>

        {/* ── 4. Role Access Map ─────────────────────────── */}
        <section>
          <SectionLabel icon={<Key size={18} />} num="4" title="ROLE ACCESS MAP" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {ROLES.map((r) => (
              <SpotlightCard key={r.name} className="card" spotlightColor={r.glow} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '10px',
                    background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: r.color, flexShrink: 0
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-strong)' }}>{r.name}</div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: r.color, background: `${r.color}15`, padding: '1px 6px', borderRadius: '4px' }}>{r.badge}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {r.access.map((a) => (
                    <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: r.color, opacity: 0.8, fontWeight: 600 }}>
                      {ACCESS_ICON_MAP[a] || <ChevronRight size={10} />} {a}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* ── Getting Started ─────────────────────────── */}
        <section>
          <SectionLabel icon={<Lock size={18} />} num="5" title="GETTING STARTED" />
          <SpotlightCard className="card" spotlightColor="rgba(255,255,255,0.02)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { icon: <CheckCircle size={16} color="var(--success-green)" />, title: 'Request Clearance', text: 'Register through the gateway. Specify your organizational role for appropriate intelligence access.' },
                { icon: <CheckCircle size={16} color="var(--success-green)" />, title: 'Dashboard Sync', text: 'Once approved by the Admin, log in to view your role-specific telemetry feeds and command tools.' },
                { icon: <Shield size={16} color="var(--primary-blue)" />, title: 'Real-time Persistence', text: 'All system metrics are processed live. Persistent data (Users/Logs) is secured in MongoDB.' },
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
        <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <StarBorder as={Link} to="/login" innerClassName="btn-glowing" color="var(--primary-glow)" speed="4s">
            INITIALIZE GATEWAY <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
          </StarBorder>
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
