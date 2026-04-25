import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis, BarChart, Bar } from 'recharts';
import { 
  ShieldAlert, TrendingUp, Users, Server, 
  Download, FileText, RefreshCw, CheckCircle, 
  AlertTriangle, BookOpen, ShieldCheck, Activity,
  Clock, Zap, BarChart2, Lock
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

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
  CRITICAL: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: ShieldAlert,     border: 'rgba(239,68,68,0.25)' },
  HIGH:     { color: '#F97316', bg: 'rgba(249,115,22,0.08)', icon: AlertTriangle,   border: 'rgba(249,115,22,0.25)' },
  LOW:      { color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle,     border: 'rgba(16,185,129,0.25)' },
  ROUTINE:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', icon: BookOpen,        border: 'rgba(139,92,246,0.25)' },
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
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
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
  });

  const [report, setReport]         = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'report'

  const role = localStorage.getItem('threxia_role') || 'User';
  const isManager   = role === 'IT Manager';
  const isAdmin     = role === 'System Administrator';
  const isAnalyst   = role === 'Security Analyst';
  const isManagerOrAdmin = isManager || isAdmin || isAnalyst;

  // ── Fetch live dashboard state every 3s ──────────────────────────────────
  useEffect(() => {
    const fetchState = () => {
      const token = localStorage.getItem('threxia_auth');
      fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setDashState(data))
        .catch((err) => console.error(err));
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
      const res  = await fetch(`${API_BASE_URL}/api/intelligence/report`, {
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
      const res  = await fetch(`${API_BASE_URL}/api/intelligence/export-csv`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.csv_data) {
        const blob = new Blob([data.csv_data], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
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
    const integrityColor  = integrityColors[s.integrity_score] || '#8B5CF6';

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
            { label: 'Integrity Score',      value: s.integrity_score,        color: integrityColor, sub: 'live threat grade' },
            { label: 'Neutralization Rate',  value: `${s.neutralization_rate}%`, color: '#10B981',   sub: 'events handled safely' },
            { label: 'Total Logs',           value: s.total_logs_analyzed.toLocaleString(), color: 'var(--primary-blue)', sub: 'analyzed by AI' },
            { label: 'Anomalies Detected',   value: s.total_anomalies.toLocaleString(),     color: 'var(--danger-red)',   sub: 'flagged incidents' },
            { label: 'Anomaly Rate',         value: `${s.anomaly_rate_pct}%`,               color: '#F97316',             sub: 'of all activity' },
            { label: 'Peak Threat Hour',     value: s.peak_threat_hour,                     color: '#A78BFA',             sub: 'highest risk window' },
            { label: 'Active Personnel',     value: s.active_users,                         color: 'var(--primary-purple)', sub: 'cleared users' },
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
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="rThreat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="Normal"     dataKey="normal_activity"     stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#rNorm)" />
                  <Area type="monotone" name="Suspicious" dataKey="suspicious_activity"  stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#rThreat)" />
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
                      <div className="threat-time">{t.time?.split(' ')[1] || t.time}</div>
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
          <div className="metric-value">{(dashState?.total_logs || 0).toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Anomalous Behaviors Detected</div>
          <div className="metric-value danger">{(dashState?.total_anomalies || 0).toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Current Threat Risk Indicator</div>
          <div className="metric-value">{anomalyPct}%</div>
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
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time"             stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis                            stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Normal Activity"       dataKey="normal_activity"    stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorNormal)" />
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
                      <div className="alert-time">{alert.time.split(' ')[1]}</div>
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
    </div>
  );
}
