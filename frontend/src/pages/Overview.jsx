import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert, ShieldCheck, BrainCircuit, Clock, Wifi, WifiOff,
  ChevronRight, BarChart2, FileText, Search, Eye, Server,
  Cpu, Database, Zap, Users, Activity, Terminal
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import CyberGrid from '../components/CyberGrid';
import MetricPulse from '../components/MetricPulse';
import Sparklines from '../components/Sparklines';
import DecryptedText from '../components/DecryptedText';
import ShinyText from '../components/ShinyText';
import StarBorder from '../components/StarBorder';

const API = 'http://localhost:8000';

/* ─── Role definitions ──────────────────────────────────────── */
const ALL_MODULES = [
  { key: 'Overview',        label: 'Overview',         icon: <Eye size={18} />,         to: '/overview',  color: '#8B5CF6' },
  { key: 'Dashboard',       label: 'Dashboard',        icon: <BarChart2 size={18} />,    to: '/dashboard', color: '#3B82F6' },
  { key: 'Logs',            label: 'Audit Logs',       icon: <FileText size={18} />,     to: '/logs',      color: '#22d3ee' },
  { key: 'Manual Analysis', label: 'Manual Analysis',  icon: <Search size={18} />,       to: '/analyze',   color: '#a78bfa' },
];

const ROLE_META = {
  'Security Analyst':   { badge: 'FULL ACCESS',     color: 'var(--primary-purple)', summary: 'You have unrestricted platform visibility. All four modules are active under your credentials.' },
  'IT Manager':         { badge: 'EXECUTIVE VIEW',   color: 'var(--primary-blue)',   summary: 'You have access to high-level intelligence summaries and live dashboard metrics. Raw log access is restricted.' },
  'Student/Researcher': { badge: 'RESEARCH ACCESS',  color: '#a78bfa',               summary: 'You can explore the project overview and run manual classifications through the AI engine.' },
};

/* ─── Threat posture label ──────────────────────────────────── */
function postureLabel(rate) {
  if (rate < 2)  return { label: 'NOMINAL',   color: '#22c55e' };
  if (rate < 10) return { label: 'ELEVATED',  color: '#f59e0b' };
  if (rate < 25) return { label: 'HIGH',      color: '#f97316' };
  return              { label: 'CRITICAL',  color: '#ef4444' };
}

export default function Overview() {
  const role    = localStorage.getItem('threxia_role') || '';
  const access  = JSON.parse(localStorage.getItem('threxia_access') || '[]');
  const token   = localStorage.getItem('threxia_auth');
  const meta    = ROLE_META[role] || ROLE_META['Security Analyst'];

  const [data,        setData]   = useState(null);
  const [online,      setOnline] = useState(true);
  const [lastUpdated, setLast]   = useState(null);
  const [anomalyHist, setHist]   = useState([]);
  const intervalRef = useRef(null);

  async function fetchData() {
    try {
      const res = await fetch(`${API}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
      setOnline(true);
      setLast(new Date());
      setHist(prev => [...prev, json.total_anomalies].slice(-12));
    } catch {
      setOnline(false);
    }
  }

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 6000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const total     = data?.total_logs      ?? 0;
  const anomalies = data?.total_anomalies ?? 0;
  const rate      = total > 0 ? +((anomalies / total) * 100).toFixed(1) : 0;
  const posture   = postureLabel(rate);
  const modelOk   = data?.status?.includes('Running') ?? false;

  /* modules this user can access */
  const myModules = ALL_MODULES.filter(m => access.includes(m.key));

  /* ─── Animation Variants ───────────────────────────────────── */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 4rem', position: 'relative' }}
    >
      {/* Background Decorative Element */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, var(--primary-purple) 0%, transparent 70%)',
        opacity: 0.05,
        filter: 'blur(60px)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* ── Header ──────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ marginBottom: '3rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <h1 className="page-title" style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Comprehensive Audit Trail
          </h1>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em',
              color: online ? '#22c55e' : '#ef4444',
              background: online ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${online ? '#22c55e44' : '#ef444444'}`,
              borderRadius: '20px', padding: '4px 12px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ 
              width: 6, height: 6, borderRadius: '50%', 
              background: online ? '#22c55e' : '#ef4444',
              boxShadow: `0 0 8px ${online ? '#22c55e' : '#ef4444'}`,
              animation: online ? 'pulse-dot 2s infinite' : 'none'
            }} />
            <ShinyText text={online ? 'NETWORK LIVE' : 'SYSTEM OFFLINE'} speed={3} />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Role Identity ───────────────────────────── */}
      <motion.div variants={itemVariants} style={{ 
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '10px',
            background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: meta.color, boxShadow: `0 0 15px ${meta.color}10`
          }}>
            <Terminal size={20} />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: meta.color, letterSpacing: '0.12em' }}>
                {meta.badge}
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-secondary)', opacity: 0.4 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ROLE: {role}</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, opacity: 0.9 }}>
              {meta.summary}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Core Intelligence Grid ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Threat Posture Card */}
        <motion.div variants={itemVariants}>
          <StarBorder color={posture.color} speed="4s" thickness={1.5} className="w-full" style={{ borderRadius: '16px' }}>
            <div style={{ padding: '1.75rem', background: 'var(--panel-bg)', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>
              <CyberGrid opacity={0.06} size={15} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                    THREAT POSTURE
                  </div>
                  <div style={{ fontSize: '2.8rem', fontWeight: 950, color: posture.color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {posture.label}
                  </div>
                </div>
                <div style={{ 
                  padding: '8px', borderRadius: '8px', background: `${posture.color}15`, 
                  border: `1px solid ${posture.color}30`, color: posture.color 
                }}>
                  <ShieldAlert size={20} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>ANOMALY RATE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-strong)' }}>{rate}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>IDENTIFIED</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-strong)' }}>{anomalies.toLocaleString()}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rate * 4, 100)}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${posture.color}, #fff)`, boxShadow: `0 0 10px ${posture.color}` }} 
                />
              </div>
            </div>
          </StarBorder>
        </motion.div>

        {/* AI Engine Intelligence */}
        <motion.div variants={itemVariants}>
          <StarBorder color={modelOk ? 'var(--primary-purple)' : 'var(--danger-red)'} speed="5s" thickness={1.5} style={{ borderRadius: '16px' }}>
            <div style={{ padding: '1.75rem', background: 'var(--panel-bg)', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>
              <CyberGrid opacity={0.06} size={15} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                    AI ENGINE STATUS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: modelOk ? 'var(--primary-purple)' : 'var(--danger-red)', lineHeight: 1 }}>
                      {modelOk ? 'ACTIVE' : 'OFFLINE'}
                    </div>
                  </div>
                </div>
                <div style={{ 
                   padding: '10px', borderRadius: '50%', background: modelOk ? 'rgba(139,92,246,0.1)' : 'rgba(239,68,68,0.1)', 
                   border: `1px solid ${modelOk ? 'rgba(139,92,246,0.2)' : 'rgba(239,68,68,0.2)'}`,
                   animation: modelOk ? 'pulse-glow 3s infinite' : 'none'
                }}>
                  <BrainCircuit size={22} color={modelOk ? 'var(--primary-purple)' : 'var(--danger-red)'} />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>NEURAL CONFIDENCE</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-purple)' }}>93.62%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '93.62%' }}
                    transition={{ duration: 2, delay: 0.5 }}
                    style={{ height: '100%', background: 'var(--primary-purple)', boxShadow: '0 0 8px var(--primary-purple)' }} 
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>One-Class SVM</span> heuristic active. Trained on baseline corporate behavior patterns. Real-time telemetry ingestion active.
              </div>
            </div>
          </StarBorder>
        </motion.div>
      </div>

      {/* ── Detailed Analytics Grid ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Infrastructure Module */}
        <motion.div variants={itemVariants}>
          <SpotlightCard className="card" spotlightColor="rgba(34,211,238,0.12)" style={{ padding: '1.5rem 1.75rem' }}>
            <CyberGrid opacity={0.03} size={25} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Server size={18} color="#22d3ee" /> INFRASTRUCTURE HEALTH
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.6 }}>SYSTEM TELEMETRY v2.4</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: '0.2rem' }}>
              {[
                { label: 'Backend API Gateway', icon: <Server size={14} />, detail: 'FastAPI Node · Port 8000', ok: online },
                { label: 'Neural AI Core',      icon: <Cpu size={14} />,    detail: 'SVM Classifier v1.2',  ok: modelOk },
                { label: 'Distributed Database', icon: <Database size={14} />, detail: 'MongoDB Cluster0',    ok: online },
                { label: 'Real-time Ingest',    icon: <Zap size={14} />,    detail: 'Async Event Stream',   ok: online },
              ].map((s, idx) => (
                <motion.div 
                  key={s.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.85rem 1rem', borderRadius: '10px',
                    background: 'var(--item-bg)',
                    border: '1px solid var(--item-border)',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ color: s.ok ? '#22d3ee' : 'var(--danger-red)', opacity: 0.8 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-strong)', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{s.detail}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.65rem', fontWeight: 800, color: s.ok ? '#22c55e' : '#ef4444', 
                      letterSpacing: '0.05em', marginBottom: '2px' 
                    }}>
                      {s.ok ? 'OPERATIONAL' : 'OFFLINE'}
                    </div>
                    <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden', marginLeft: 'auto' }}>
                      <div style={{ width: s.ok ? '100%' : '0%', height: '100%', background: s.ok ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {lastUpdated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem', fontSize: '0.68rem', color: 'var(--text-secondary)', fontPadding: '0 0.5rem' }}>
                <Clock size={12} /> <span style={{ opacity: 0.7 }}>Last sync:</span> <span style={{ color: 'var(--text-strong)' }}>{lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </SpotlightCard>
        </motion.div>

        {/* Model Performance Module */}
        <motion.div variants={itemVariants}>
          <SpotlightCard className="card" spotlightColor="rgba(139,92,246,0.12)" style={{ padding: '1.5rem 1.75rem' }}>
            <CyberGrid opacity={0.03} size={25} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BrainCircuit size={18} color="var(--primary-purple)" /> ANALYTIC PERFORMANCE
              </div>
              <Sparklines data={anomalyHist.length ? anomalyHist : [0,0,0]} color="var(--primary-purple)" width={60} height={20} />
            </div>

            <div style={{ background: 'var(--card-inner-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--item-border)' }}>
              <MetricPulse label="Neural Accuracy (Global)" value={93.62} color="var(--primary-purple)" height="8px" />
              <div style={{ height: '1rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <MetricPulse label="Precision" value={40.30} color="#22d3ee" height="4px" />
                <MetricPulse label="F1-Score"  value={39.31} color="#f59e0b" height="4px" />
              </div>
              <div style={{ height: '0.75rem' }} />
              <MetricPulse label="Recall Coverage" value={38.37} color="#a78bfa" height="4px" />
            </div>

            <div style={{ marginTop: '1.2rem', padding: '0.8rem', background: 'rgba(139,92,246,0.05)', borderLeft: '2px solid var(--primary-purple)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-purple)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>MODEL INSIGHT</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', opacity: 0.8, lineHeight: 1.4 }}>
                One-Class SVM demonstrates superior performance in high-noise environments compared to traditional Forest heuristics.
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* ── Module Access Map ────────────────────────── */}
      <motion.div variants={itemVariants}>
        <SpotlightCard className="card" spotlightColor="rgba(139,92,246,0.08)" style={{ padding: '1.5rem 1.75rem' }}>
          <CyberGrid opacity={0.02} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={18} color="#8B5CF6" /> SYSTEM ACCESS MAP
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', padding: '2px 8px', border: '1px solid currentColor', borderRadius: '4px', opacity: 0.5 }}>AUTHORIZATION v4</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {ALL_MODULES.map((m) => {
              const hasAccess = access.includes(m.key);
              const cardColor = m.color;
              
              return (
                <motion.div 
                  key={m.key}
                  whileHover={hasAccess ? { y: -3, scale: 1.01 } : {}}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem',
                    background: hasAccess ? `${cardColor}12` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hasAccess ? `${cardColor}40` : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                    boxShadow: hasAccess ? `0 0 20px ${cardColor}10` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: hasAccess ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '10px', 
                      background: hasAccess ? `${cardColor}18` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${hasAccess ? `${cardColor}30` : 'rgba(255,255,255,0.05)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: hasAccess ? cardColor : 'var(--text-secondary)',
                      boxShadow: hasAccess ? `0 0 15px ${cardColor}20` : 'none'
                    }}>
                      {m.icon}
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: hasAccess ? 'var(--text-strong)' : 'var(--text-secondary)' }}>
                      {m.label}
                    </span>
                  </div>
                  {hasAccess ? (
                    <Link to={m.to} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.72rem', fontWeight: 800, color: cardColor,
                      textDecoration: 'none', letterSpacing: '0.05em',
                    }}>
                      SECURE LINK <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      <WifiOff size={10} /> LOCK
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </SpotlightCard>
      </motion.div>


      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 25px rgba(139,92,246,0.3); }
        }
      `}</style>
    </motion.div>
  );
}
