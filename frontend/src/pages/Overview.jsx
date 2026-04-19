import { Info, Target, Users, Shield, Zap, Activity } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MetricPulse from '../components/MetricPulse';
import CyberGrid from '../components/CyberGrid';
import Sparklines from '../components/Sparklines';

export default function Overview() {
  const role = localStorage.getItem('threxia_role') || 'analyst';

  const roleNames = {
    analyst: 'Security Analyst',
    manager: 'IT Manager',
    admin: 'System Administrator',
    researcher: 'Researcher'
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Project Overview</h1>
        <p className="page-subtitle">Understanding the foundation and objectives of the THREXIA Intelligence Dashboard.</p>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '4px solid var(--primary-purple)', borderRadius: '4px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-strong)' }}>
          <strong>DESIGNATED VIEW ACTIVE:</strong> You are currently logged in with <strong>{roleNames[role]}</strong> privileges. The interface has been optimized to display logs and modules relevant to your professional scope.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

        {/* Problem Definition */}
        <SpotlightCard className="card" spotlightColor="rgba(139, 92, 246, 0.2)" style={{ position: 'relative' }}>
          <CyberGrid opacity={0.03} />
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-strong)', letterSpacing: '0.1em' }}>
            <Zap size={24} color="var(--primary-purple)" />
            1. PROBLEM DEFINITION
          </div>

          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Modern organizations generate massive amounts of system logs from user activities such as logins, file access, device usage, and network activity. Manually monitoring these logs to detect suspicious behaviour is difficult and time-consuming for security analysts. Traditional enterprise tools often have complex interfaces and steep learning curves, making them difficult for students and beginners to understand.
            </p>
            <p>
              The objective of the <strong>THREXIA</strong> project is to develop an AI-based threat intelligence dashboard that detects anomalies in user behaviour logs and presents them through a simple and intuitive interface. The system will analyse user activity patterns and automatically identify suspicious behaviour such as unusual login times, abnormal access patterns, or deviations from normal activity.
            </p>
          </div>
        </SpotlightCard>

        {/* Project Scope & Stakeholders */}
        <section style={{ marginTop: '1rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-strong)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--primary-purple)" /> 2. PROJECT SCOPE & STAKEHOLDERS
            </h2>
          </div>
          <div className="overview-grid">
            {/* Domain & Focus */}
            <SpotlightCard className="card" spotlightColor="rgba(59, 130, 246, 0.2)" style={{ position: 'relative' }}>
              <CyberGrid opacity={0.05} size={15} />
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} /> Domain Context
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>
              The project belongs to the cybersecurity and user behaviour analytics (UEBA) domain. It focuses on detecting insider threats and abnormal system activities using advanced machine learning techniques.
            </p>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <Target size={14} /> Ultimate Goal
              </div>
              <p style={{ color: 'var(--text-strong)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                To build an end-to-end AI solution that performs anomaly detection on system logs and displays results through an interactive web dashboard.
              </p>
            </div>
          </SpotlightCard>

          {/* Stakeholders */}
          <SpotlightCard className="card" spotlightColor="rgba(139, 92, 246, 0.2)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.05} size={25} />
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> Primary Stakeholders
            </div>

            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.9rem', paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <li><strong style={{ color: 'var(--text-strong)' }}>Security Analysts</strong> who monitor and investigate suspicious activities.</li>
              <li><strong style={{ color: 'var(--text-strong)' }}>System Administrators</strong> who manage system access and user permissions.</li>
              <li><strong style={{ color: 'var(--text-strong)' }}>IT Managers</strong> who need summarized reports of security risks.</li>
              <li><strong style={{ color: 'var(--text-strong)' }}>Students and Researchers</strong> who want to understand how AI can be used for threat detection.</li>
            </ul>
          </SpotlightCard>
        </div>
      </section>

        {/* System Architecture Roadmap */}
        <section style={{ marginTop: '2rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-strong)', letterSpacing: '0.1em' }}>3. SYSTEM ARCHITECTURE</h2>
          </div>
          <div className="card" style={{ padding: '2rem', background: 'var(--panel-bg)', opacity: 0.9, position: 'relative', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 4px 20px var(--card-shadow)' }}>
            <CyberGrid opacity={0.02} />
            <div className="signal-path-viz" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { step: "01", title: "Log Ingestion" },
                { step: "02", title: "Preprocessing" },
                { step: "03", title: "AI Analysis" },
                { step: "04", title: "Intelligence UI" }
              ].map((node, i) => (
                <div key={i} style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                  <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative', zIndex: 1, textAlign: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--primary-purple)', fontWeight: 800, marginBottom: '0.4rem' }}>NODE {node.step}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-strong)' }}>{node.title}</div>
                  </div>
                  {i < 3 && (
                    <div className="path-line" style={{ position: 'absolute', top: '50%', right: '-1rem', width: '2rem', height: '1px', background: 'linear-gradient(90deg, var(--primary-purple), transparent)', opacity: 0.5, zIndex: 0 }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ML Model Comparison */}
        <section style={{ marginTop: '3rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-strong)', letterSpacing: '0.1em' }}>4. ML PERFORMANCE ANALYSIS</h2>
          </div>
          <SpotlightCard className="card" spotlightColor="rgba(139, 92, 246, 0.1)" style={{ position: 'relative' }}>
            <CyberGrid opacity={0.04} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '1rem' }}>
              
              {/* Isolation Forest Module */}
              <div style={{ background: 'var(--bg-color)', opacity: 0.8, padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 700 }}>ISOLATION FOREST</h3>
                  <Sparklines data={[20, 45, 28, 60, 42, 70, 55]} color="var(--primary-blue)" width={80} />
                </div>
                <MetricPulse label="Accuracy" value={92.07} color="var(--primary-blue)" />
                <MetricPulse label="Precision" value={25.65} color="var(--primary-blue)" />
                <MetricPulse label="Recall" value={24.90} color="var(--primary-blue)" />
                <MetricPulse label="F1-Score" value={25.27} color="var(--primary-blue)" />
              </div>

              {/* One-Class SVM Module (High Confidence) */}
              <div style={{ background: 'var(--bg-color)', opacity: 0.9, padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--primary-purple)', boxShadow: '0 0 15px var(--primary-glow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--primary-purple)', fontWeight: 800 }}>ONE-CLASS SVM (PRIMARY)</h3>
                  <Sparklines data={[30, 50, 45, 80, 65, 95, 90]} color="var(--primary-purple)" width={80} />
                </div>
                <MetricPulse label="Accuracy" value={93.62} color="var(--primary-purple)" />
                <MetricPulse label="Precision" value={40.30} color="var(--primary-purple)" />
                <MetricPulse label="Recall" value={38.37} color="var(--primary-purple)" />
                <MetricPulse label="F1-Score" value={39.31} color="var(--primary-purple)" />
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                 <Activity size={14} /> CROSS-VALIDATION STATUS: <strong>VERIFIED (5-FOLD)</strong>
               </div>
            </div>
          </SpotlightCard>
        </section>

      </div>
    </div>
  );
}
