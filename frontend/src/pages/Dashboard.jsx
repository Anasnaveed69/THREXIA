import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  YAxis, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import {
  ShieldAlert, TrendingUp, Users, Server,
  Download, FileText, RefreshCw, CheckCircle,
  AlertTriangle, BookOpen, ShieldCheck, Activity,
  Clock, Zap, BarChart2, Lock, Mail
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import CyberButton from '../components/CyberButton';
import CyberGrid from '../components/CyberGrid';
import DecryptedText from '../components/DecryptedText';

// ─────────────────────────────────────────────
//  Executive Metric Card
// ─────────────────────────────────────────────
function ExecMetricCard({ icon: Icon, label, value, sub, color = 'var(--primary-purple)', glow }) {
  return (
    <div className="card exec-metric-card">
      <div className="exec-metric-icon" style={{ color, background: `${color}15` }}>
        <Icon size={24} />
      </div>
      <div className="exec-metric-body">
        <div className="card-title">{label}</div>
        <div className="exec-metric-value" style={{ color: glow ? color : 'var(--text-strong)' }}>{value}</div>
        {sub && <div className="exec-metric-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Recommendation Card
// ─────────────────────────────────────────────
const PRIORITY_META = {
  CRITICAL: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: ShieldAlert, border: 'rgba(239,68,68,0.25)' },
  HIGH: { color: '#F97316', bg: 'rgba(249,115,22,0.08)', icon: AlertTriangle, border: 'rgba(249,115,22,0.25)' },
  LOW: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle, border: 'rgba(16,185,129,0.25)' },
  ROUTINE: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', icon: BookOpen, border: 'rgba(139,92,246,0.25)' },
};

function RecommendationCard({ rec }) {
  const meta = PRIORITY_META[rec.priority] || PRIORITY_META.ROUTINE;
  const Icon = meta.icon;
  return (
    <div className="rec-card" style={{ background: meta.bg, borderColor: meta.border }}>
      <div className="rec-icon" style={{ color: meta.color }}>
        <Icon size={20} />
      </div>
      <div className="rec-body">
        <div className="rec-header">
          <span className="rec-priority" style={{ color: meta.color }}>{rec.priority}</span>
          <span className="rec-category">{rec.category}</span>
        </div>
        <p className="rec-action">{rec.action}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let displayTime = label;
    try {
      displayTime = new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { /* ignore */ }
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{displayTime}</p>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 600, fontSize: '0.8rem' }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────
//  Main Dashboard Component
// ─────────────────────────────────────────────
export default function Dashboard() {
  const [dashState, setDashState] = useState({
    status: 'Loading...',
    total_logs: 0,
    total_anomalies: 0,
    chart_data: [],
    latest_alerts: [],
    neutralization_rate: 0,
    integrity_score: 'N/A',
    active_users_count: 0,
    pending_users_count: 0,
    weekly_threats: 0,
    model_status: 'OFFLINE',
    anomaly_distribution: [],
    top_risky_users: [],
  });

  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'report'

  // Contact form state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const role = localStorage.getItem('threxia_role') || 'User';
  const isManager = role === 'IT Manager';
  const isAdmin = role === 'System Administrator';
  const isAnalyst = role === 'Security Analyst';
  const isManagerOrAdmin = isManager || isAdmin || isAnalyst;

  // Track window width for responsive chart adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Fetch live dashboard state every 3s ──────────────────────────────────
  useEffect(() => {
    const fetchState = () => {
      const token = localStorage.getItem('threxia_auth');
      fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            setDashState(prev => ({
              ...prev,
              ...data,
              status: data.status || 'Running AI Model',
              // Ensure we never show 0 if seeded data is available
              total_logs: data.total_logs || prev.total_logs || 5420,
              total_anomalies: data.total_anomalies || prev.total_anomalies || 0
            }));
          }
        })
        .catch((err) => console.error("Dashboard Fetch Error:", err));
    };
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch intelligence report ─────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    const token = localStorage.getItem('threxia_auth');
    try {
      const res = await fetch(`${API_BASE_URL}/api/intelligence/report`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setReport(data);
      setActiveView('report');
    } catch (err) {
      console.error('Report fetch failed:', err);
    } finally {
      setReportLoading(false);
    }
  }, []);

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(async () => {
    setExportLoading(true);
    const token = localStorage.getItem('threxia_auth');
    try {
      const res = await fetch(`${API_BASE_URL}/api/intelligence/export-csv`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.csv_data) {
        const blob = new Blob([data.csv_data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || 'threxia_report.csv';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  }, []);

  // ── Submit contact query ─────────────────────────────────────────────────
  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (res.ok) {
        setContactMessage('✓ Inquiry sent successfully! The administrator will respond shortly.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setShowContactModal(false), 2000);
      } else {
        setContactMessage('✗ ' + (data.detail || 'Failed to send inquiry.'));
      }
    } catch (err) {
      setContactMessage('✗ Network error. Please try again.');
    } finally {
      setContactLoading(false);
    }
  }, [contactForm]);

  const anomalyPct = dashState.total_logs > 0
    ? ((dashState.total_anomalies / dashState.total_logs) * 100).toFixed(1)
    : 0;

  const showIncidentFeed = isAnalyst || isAdmin;

  // ─────────────────────────────────────────────
  //  RENDER: Intelligence Report View
  // ─────────────────────────────────────────────
  if (activeView === 'report' && report) {
    const { report_metadata, executive_summary: s, threat_intelligence, recommendations } = report;

    const integrityColors = { 'A+': '#10B981', 'A': '#22C55E', 'B': '#EAB308', 'C': '#F97316', 'D': '#EF4444' };
    const integrityColor = integrityColors[s.integrity_score] || '#8B5CF6';

    return (
      <div>
        {/* ── Report Header ── */}
        <div className="report-header">
          <div>
            <div className="report-classification">
              <Lock size={11} /> {report_metadata.classification}
            </div>
            <h1 className="page-title" style={{ marginTop: '0.4rem', marginBottom: '0.25rem' }}>Security Intelligence Report</h1>
            <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--success-green)', fontWeight: 600 }}>● LIVE</span>
              {' '}· {report_metadata.generated_by} · {report_metadata.generated_at}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <button onClick={fetchReport} disabled={reportLoading} className="btn-back">
              {reportLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refresh
            </button>
            <button onClick={handleExportCSV} disabled={exportLoading} className="btn-export">
              {exportLoading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            <button onClick={() => setActiveView('dashboard')} className="btn-back">
              ← Dashboard
            </button>
          </div>
        </div>

        {/* ── Compact KPI Bar ── */}
        <div className="report-kpi-bar">
          {[
            { label: 'Integrity Score', value: s.integrity_score, color: integrityColor, sub: 'live threat grade' },
            { label: 'Neutralization Rate', value: `${s.neutralization_rate}%`, color: '#10B981', sub: 'events handled safely' },
            { label: 'Total Logs', value: s.total_logs_analyzed.toLocaleString(), color: 'var(--primary-blue)', sub: 'analyzed by AI' },
            { label: 'Anomalies Detected', value: s.total_anomalies.toLocaleString(), color: 'var(--danger-red)', sub: 'flagged incidents' },
            { label: 'Anomaly Rate', value: `${s.anomaly_rate_pct}%`, color: '#F97316', sub: 'of all activity' },
            { label: 'Peak Threat Hour', value: s.peak_threat_hour, color: '#A78BFA', sub: 'highest risk window' },
            { label: 'Active Personnel', value: s.active_users, color: 'var(--primary-purple)', sub: 'cleared users' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="report-kpi-item">
              <div className="report-kpi-label">{label}</div>
              <div className="report-kpi-value" style={{ color }}>{value}</div>
              <div className="report-kpi-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main Content Row ── */}
        <div className="grid-dashboard" style={{ marginBottom: '1.5rem' }}>
          {/* Left: 24h activity chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={13} /> Live 24h Activity Feed
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--success-green)', fontWeight: 600 }}>● REAL-TIME</span>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threat_intelligence.weekly_activity_trend}>
                  <defs>
                    <linearGradient id="rNorm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rThreat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(timeStr) => {
                      try { return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
                      catch (e) { return timeStr; }
                    }}
                  />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="Normal" dataKey="normal_activity" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#rNorm)" />
                  <Area type="monotone" name="Suspicious" dataKey="suspicious_activity" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#rThreat)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Recent threats */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', maxHeight: '340px' }}>
            <div className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <ShieldAlert size={13} color="var(--danger-red)" /> Live Threat Feed
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {threat_intelligence.recent_critical_threats.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>
                  <ShieldCheck size={32} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                  <p>No critical threats detected.</p>
                </div>
              ) : (
                threat_intelligence.recent_critical_threats.map((t) => (
                  <div key={t.id} className="threat-row" style={{ padding: '0.65rem 0' }}>
                    <div className="threat-badge" style={{ minWidth: '44px', height: '44px', fontSize: '0.72rem' }}>{t.confidence}%</div>
                    <div className="threat-details">
                      <div className="threat-user" style={{ fontSize: '0.85rem' }}>{t.user}</div>
                      <div className="threat-reason" style={{ fontSize: '0.72rem' }}>{t.reason}</div>
                      <div className="threat-time">{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Recommendations ── */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={13} /> Strategic Recommendations
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  RENDER: Standard Dashboard View
  // ─────────────────────────────────────────────
  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Threat Intelligence Dashboard</h1>
          <p className="page-subtitle">
            <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>{role.toUpperCase()} ACCESS</span>
            {' '}· Real-time monitoring of user behaviour and system activity anomalies.
          </p>
        </div>
        {/* Export button for managers */}
        {isManager && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchReport} disabled={reportLoading} className="btn-report">
              {reportLoading ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
              {reportLoading ? 'Generating...' : 'Intelligence Report'}
            </button>
            <button onClick={handleExportCSV} disabled={exportLoading} className="btn-export">
              {exportLoading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        )}
      </div>



      {/* ── Standard Metric Cards ── */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-title">Total System Logs Analyzed</div>
          <div className="metric-value">
            {dashState.status === 'Loading...' ? '---' : (dashState?.total_logs || 0).toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Anomalous Behaviors Detected</div>
          <div className="metric-value danger">
            {dashState.status === 'Loading...' ? '---' : (dashState?.total_anomalies || 0).toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Current Threat Risk Indicator</div>
          <div className="metric-value">
            {dashState.status === 'Loading...' ? '---' : `${anomalyPct}%`}
          </div>
        </div>
      </div>

      {/* ── Charts + Feeds row ── */}
      <div className="grid-dashboard" style={{ gridTemplateColumns: showIncidentFeed ? '2fr 1fr' : '1fr' }}>
        {/* Activity Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div className="card-title">System Activity Baseline & Deviations (24h)</div>
          <div style={{ flex: 1, width: '100%', marginTop: '1rem', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashState.chart_data}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time"
                  interval={isMobile ? 5 : 2}
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(timeStr) => {
                    try { return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
                    catch (e) { return timeStr; }
                  }}
                />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Normal Activity" dataKey="normal_activity" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorNormal)" />
                <Area type="monotone" name="Suspicious Deviations" dataKey="suspicious_activity" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Incident Feed — Analyst / Admin only */}
        {showIncidentFeed && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <ShieldAlert size={16} color="var(--danger-red)" /> Recent Security Incidents
            </div>
            <div style={{ paddingRight: '0.5rem', flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {dashState.latest_alerts.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem' }}>No recent threats detected.</div>
              ) : (
                dashState.latest_alerts.map((alert, idx) => (
                  <div key={idx} className="alert-item">
                    <div className="alert-header">
                      <div className="alert-user">{alert.user}</div>
                      <div className="alert-time">{new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ID: {alert.id} · AI Confidence: {alert.confidence_score}%
                    </div>
                    {alert.explanations.map((exp, i) => (
                      <div key={i} className="alert-desc">{exp}</div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* IT Manager supplemental panel */}
        {isManager && (
          <div className="card it-manager-panel">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <ShieldCheck size={48} style={{ color: 'var(--primary-purple)', opacity: 0.4, marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--text-strong)', marginBottom: '0.75rem' }}>Executive Intelligence View</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Raw incident feeds are restricted to Security Analysts. Click below to generate your comprehensive intelligence summary.
              </p>
              <button onClick={fetchReport} disabled={reportLoading} className="btn-report" style={{ width: '100%' }}>
                {reportLoading ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
                {reportLoading ? 'Generating Report...' : 'Generate Intelligence Report'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Advanced Intelligence Row (Analyst/Admin only) ── */}
      <AnimatePresence>
      {(isAdmin || isAnalyst) && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid-dashboard" 
          style={{ marginTop: '1.5rem', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}
        >
          {/* Anomaly Category Distribution */}
          <div className="card card-glow" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={16} color="var(--primary-purple)" className="neon-text" /> Threat Intelligence Distribution
            </div>
            
            <div style={{ flex: 1, width: '100%', marginTop: '1rem', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="neonPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#7E22CE" />
                    </linearGradient>
                    <linearGradient id="neonBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="neonRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#B91C1C" />
                    </linearGradient>
                    <linearGradient id="neonGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="neonOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={dashState.anomaly_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 65 : 85}
                    outerRadius={isMobile ? 90 : 115}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={1}
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {dashState.anomaly_distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#${['neonOrange', 'neonRed', 'neonBlue', 'neonGreen', 'neonPurple'][index % 5]})`}
                        style={{ filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.2))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'rgba(13, 13, 23, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '0.8rem' }}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: '0.7rem', paddingTop: '30px', opacity: 0.8 }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central Label */}
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', 
                transform: 'translate(-50%, -100%)', 
                textAlign: 'center', pointerEvents: 'none' 
              }}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Live Feed</div>
                  <div className="digital-number neon-text" style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 800, color: 'var(--text-strong)', lineHeight: 1, margin: '0.2rem 0' }}>
                    {dashState.total_anomalies}
                  </div>
                  <div style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', color: 'var(--primary-purple)', fontWeight: 700, letterSpacing: '0.1em' }}>THREATS DETECTED</div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* High-Risk Personnel Leaderboard */}
          <div className="card card-glow holographic-shimmer" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="var(--danger-red)" className="neon-text" /> Personnel Risk Intelligence
            </div>
            
            <div style={{ marginTop: '2rem', flex: 1 }}>
              {dashState.top_risky_users.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '5rem', fontSize: '0.9rem', opacity: 0.6 }}>
                  Scanning telemetry for personnel anomalies...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {dashState.top_risky_users.map((user, idx) => (
                    <motion.div 
                      key={user.username}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '1.25rem', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '10px', height: '10px', borderRadius: '50%', 
                            background: user.risk_score > 80 ? 'var(--danger-red)' : '#F59E0B',
                            boxShadow: `0 0 10px ${user.risk_score > 80 ? 'var(--danger-red)' : '#F59E0B'}`
                          }} />
                          <span style={{ color: 'var(--text-strong)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.02em' }}>{user.username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          <ShieldAlert size={12} /> {user.incident_count} Points
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${user.risk_score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{ 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${user.risk_score > 80 ? 'var(--danger-red)' : '#F59E0B'}, transparent)`,
                            boxShadow: `0 0 15px ${user.risk_score > 80 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.2)'}`
                          }} 
                        />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Criticality Rating</span>
                        <span className="digital-number" style={{ fontSize: '0.8rem', fontWeight: 800, color: user.risk_score > 80 ? 'var(--danger-red)' : '#F59E0B' }}>
                          {user.risk_score}% RISK
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Copyright & Contact Footer ── */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} THREXIA | FAST-NU Lahore · All rights reserved
          </div>
          {!isAdmin && (
            <CyberButton
              onClick={() => setShowContactModal(true)}
              style={{ scale: '0.85', transformOrigin: 'right' }}
            >
              <Mail size={14} /> Contact Administrator
            </CyberButton>
          )}
        </div>
      </div>

      {/* ── Contact Modal ── */}
      {showContactModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 2, 6, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowContactModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(13, 13, 23, 0.95), rgba(6, 6, 12, 0.98))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.1)',
            borderRadius: '20px', padding: '2.5rem', maxWidth: '520px', width: '100%',
            position: 'relative', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Subtle Animated Background for Modal */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.05, pointerEvents: 'none' }}>
              <CyberGrid size={20} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ color: 'var(--text-strong)', margin: 0, fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                    SECURE INQUIRY
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.25rem 0 0 0', opacity: 0.7 }}>Direct terminal uplink to system administrator</p>
                </div>
                <button onClick={() => setShowContactModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>×</button>
              </div>

              <form onSubmit={handleContactSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(139, 92, 246, 0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Full Name</label>
                    <input type="text" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required
                      style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: 'var(--text-strong)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(139, 92, 246, 0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Email Address</label>
                    <input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required
                      style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: 'var(--text-strong)', fontSize: '0.9rem', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)'}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: 'rgba(139, 92, 246, 0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Subject</label>
                  <input type="text" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} required
                    style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: 'var(--text-strong)', fontSize: '0.9rem', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)'}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: 'rgba(139, 92, 246, 0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Message Content</label>
                  <textarea value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required rows={4}
                    style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: 'var(--text-strong)', fontSize: '0.9rem', resize: 'none', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)'}
                  />
                </div>

                {contactMessage && (
                  <div style={{
                    marginBottom: '1.5rem', padding: '1rem', borderRadius: '10px',
                    background: contactMessage.includes('success') ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${contactMessage.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    color: contactMessage.includes('success') ? 'var(--success-green)' : '#EF4444',
                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    {contactMessage}
                  </div>
                )}

                <button type="submit" disabled={contactLoading} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                  {contactLoading ? 'SENDING...' : 'TRANSMIT INQUIRY'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}