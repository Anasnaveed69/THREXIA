import { Info, Target, Users, Shield } from 'lucide-react';

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
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-strong)' }}>
            <Info size={20} color="var(--primary-purple)" />
            1. Problem Definition
          </div>
          
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Modern organizations generate massive amounts of system logs from user activities such as logins, file access, device usage, and network activity. Manually monitoring these logs to detect suspicious behaviour is difficult and time-consuming for security analysts. Traditional enterprise tools often have complex interfaces and steep learning curves, making them difficult for students and beginners to understand.
            </p>
            <p>
              The objective of the <strong>THREXIA</strong> project is to develop an AI-based threat intelligence dashboard that detects anomalies in user behaviour logs and presents them through a simple and intuitive interface. The system will analyse user activity patterns and automatically identify suspicious behaviour such as unusual login times, abnormal access patterns, or deviations from normal activity.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Domain & Focus */}
          <div className="card">
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
          </div>

          {/* Stakeholders */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> Primary Stakeholders
            </div>
            
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.9rem', paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <li><strong style={{ color: 'var(--text-strong)' }}>Security Analysts</strong> who monitor and investigate suspicious activities.</li>
              <li><strong style={{ color: 'var(--text-strong)' }}>System Administrators</strong> who manage system access and user permissions.</li>
              <li><strong style={{ color: 'var(--text-strong)' }}>IT Managers</strong> who need summarized reports of security risks.</li>
              <li><strong style={{ color: 'var(--text-strong)' }}>Students and Researchers</strong> who want to understand how AI can be used for threat detection.</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
}
