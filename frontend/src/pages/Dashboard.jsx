import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts';
import { ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const [state, setState] = useState({
    status: "Loading...",
    total_logs: 0,
    total_anomalies: 0,
    chart_data: [],
    latest_alerts: []
  });

  useEffect(() => {
    const fetchState = () => {
      fetch('http://localhost:8000/api/dashboard')
        .then(res => res.json())
        .then(data => setState(data))
        .catch(err => console.error(err));
    };
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const anomalyPercentage = state.total_logs > 0 ? ((state.total_anomalies / state.total_logs) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Threat Intelligence Dashboard</h1>
        <p className="page-subtitle">Real-time monitoring of user behaviour and system activity anomalies.</p>
      </div>

      <div className="grid-cards">
        <div className="card">
          <div className="card-title">Total System Logs Analyzed</div>
          <div className="metric-value">{state.total_logs.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Anomalous Behaviors Detected</div>
          <div className="metric-value danger">{state.total_anomalies.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Current Threat Risk Indicator</div>
          <div className="metric-value">{anomalyPercentage}%</div>
        </div>
      </div>

      <div className="grid-dashboard">
        {/* System Activity Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div className="card-title">System Activity Baseline & Deviations (24h)</div>
          <div style={{ flex: 1, width: '100%', marginTop: '1rem', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.chart_data}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" name="Normal Activity" dataKey="normal_activity" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorNormal)" />
                <Area type="monotone" name="Suspicious Deviations" dataKey="suspicious_activity" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Threat Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <ShieldAlert size={16} color="var(--danger-red)" />
            Recent Security Incidents
          </div>
          
          <div style={{ paddingRight: '0.5rem', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {state.latest_alerts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem' }}>No recent threats detected.</div>
            ) : (
              state.latest_alerts.map((alert, idx) => (
                <div key={idx} className="alert-item">
                  <div className="alert-header">
                    <div className="alert-user">{alert.user}</div>
                    <div className="alert-time">{alert.time.split(' ')[1]}</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {alert.id} • AI Confidence: {alert.confidence_score}%</div>
                  {alert.explanations.map((exp, i) => (
                    <div key={i} className="alert-desc">{exp}</div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
