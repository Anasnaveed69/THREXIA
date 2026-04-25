import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Radio, Activity, Terminal, CheckCircle2, ArrowUpCircle, Shield } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import StarBorder from '../components/StarBorder';

export default function Logs() {
  const [allLogs, setAllLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [incidentActions, setIncidentActions] = useState({}); // { [logId]: 'resolved' | 'escalated' }
  const itemsPerPage = 50;

  const isAnalyst = (localStorage.getItem('threxia_role') || '') === 'Security Analyst';

  const handleAction = (logId, action) => {
    setIncidentActions(prev => ({ ...prev, [logId]: action }));
  };

  const FEATURE_LABELS = [
    { label: "Contractor Status", icon: <Radio size={12} /> },
    { label: "Employee Class", icon: <Activity size={12} /> },
    { label: "Foreign National", icon: <Radio size={12} /> },
    { label: "Criminal Record", icon: <AlertCircle size={12} /> },
    { label: "Medical History", icon: <Activity size={12} /> },
    { label: "Docs Printed", icon: <Terminal size={12} /> },
    { label: "Off-hours Printing", icon: <Terminal size={12} /> },
    { label: "USB Transfer", icon: <Terminal size={12} /> },
    { label: "Other Media", icon: <Terminal size={12} /> },
    { label: "Travel Abroad", icon: <Activity size={12} /> },
    { label: "Hostility Index", icon: <AlertCircle size={12} /> },
    { label: "Access Frequency", icon: <Activity size={12} /> },
    { label: "Location Count", icon: <Radio size={12} /> },
    { label: "Late Night Access", icon: <Radio size={12} /> }
  ];

  useEffect(() => {
    const fetchLogs = () => {
      const token = localStorage.getItem('threxia_auth');
      fetch(`${API_BASE_URL}/api/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setAllLogs(data);
          setLoading(false);
        })
        .catch(err => console.error(err));
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredLogs = allLogs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const role = localStorage.getItem('threxia_role') || 'User';
  const escalatedCount = Object.values(incidentActions).filter(v => v === 'escalated').length;
  const resolvedCount  = Object.values(incidentActions).filter(v => v === 'resolved').length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Comprehensive Audit Trail</h1>
          <p className="page-subtitle">
            <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>{role.toUpperCase()} VIEW</span> • A real-time registry of system baseline activity and detected anomalies.
          </p>
        </div>
        {isAnalyst && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="analyst-stat-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#10B981' }}>
              <CheckCircle2 size={14} /> {resolvedCount} Resolved
            </div>
            <div className="analyst-stat-pill" style={{ borderColor: 'rgba(249,115,22,0.3)', color: '#F97316' }}>
              <ArrowUpCircle size={14} /> {escalatedCount} Escalated
            </div>
          </div>
        )}
      </div>

      <div className="logs-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Filter Navigation Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--panel-bg)', padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', flex: '1', minWidth: '280px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', background: filter === 'all' ? 'var(--primary-purple)' : 'transparent', color: filter === 'all' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, transition: '0.3s' }}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter('threat')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', background: filter === 'threat' ? 'var(--danger-red)' : 'transparent', color: filter === 'threat' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, transition: '0.3s' }}
          >
            THREATS
          </button>
          <button
            onClick={() => setFilter('safe')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', background: filter === 'safe' ? 'var(--success-green)' : 'transparent', color: filter === 'safe' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, transition: '0.3s' }}
          >
            SAFE
          </button>
        </div>

        {/* Top Info */}
        <div className="logs-info" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 500 }}>
          {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} OF {filteredLogs.length} ENTRIES
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading telemetry databases...</div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found in this category.</div>
        ) : (
          <>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>TIME STAMP</th>
                <th>INCIDENT ID</th>
                <th>ENTITY PROFILE</th>
                <th>AI CONFIDENCE</th>
                <th>BEHAVIORAL AUDIT</th>
                <th>STATUS</th>
                {isAnalyst && <th>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((log, idx) => (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    style={{ 
                      opacity: log.type === 'safe' ? 0.8 : 1, 
                      cursor: 'pointer',
                      background: expandedId === log.id ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                      transition: '0.2s'
                    }}
                    className="log-row"
                  >
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {log.time}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: log.type === 'threat' ? 'var(--danger-red)' : 'var(--primary-blue)' }}>{log.id}</td>
                    <td>{log.user}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="confidence-bar-bg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="confidence-bar-fill"
                            style={{
                              width: `${log.confidence_score}%`,
                              backgroundColor: log.type === 'threat' ? 'var(--danger-red)' : 'var(--success-green)',
                              boxShadow: `0 0 10px ${log.type === 'threat' ? 'var(--danger-red)' : 'var(--success-green)'}`
                            }}
                          ></div>
                        </div>
                        <span style={{ fontWeight: 600 }}>{log.confidence_score}%</span>
                      </div>
                    </td>
                    <td>
                      {log.explanations.map((exp, i) => (
                        <div key={i} style={{ marginBottom: log.explanations.length > 1 ? '0.25rem' : '0', fontSize: '0.85rem' }}>• {exp}</div>
                      ))}
                    </td>
                    <td>
                      {incidentActions[log.id] === 'resolved' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={13} /> Resolved
                        </span>
                      ) : incidentActions[log.id] === 'escalated' ? (
                        <span className="badge badge-warning">
                          <ArrowUpCircle size={13} /> Escalated
                        </span>
                      ) : (
                        <span className={`badge ${log.type === 'threat' ? 'badge-danger' : 'badge-success'}`}>
                          {log.type === 'threat' ? <AlertCircle size={13} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />}
                          {log.status}
                        </span>
                      )}
                    </td>

                    {isAnalyst && (
                      <td onClick={e => e.stopPropagation()}>
                        {log.type === 'threat' && !incidentActions[log.id] ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleAction(log.id, 'resolved')} className="incident-btn incident-btn-resolve" title="Mark as Resolved">
                              <CheckCircle2 size={13} /> Resolve
                            </button>
                            <button onClick={() => handleAction(log.id, 'escalated')} className="incident-btn incident-btn-escalate" title="Escalate to Manager">
                              <ArrowUpCircle size={13} /> Escalate
                            </button>
                          </div>
                        ) : incidentActions[log.id] ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Action taken</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.4 }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                  
                  <AnimatePresence>
                    {expandedId === log.id && (
                      <tr className="desktop-expanded-row">
                        <td colSpan="6" style={{ padding: 0, borderBottom: '1px solid var(--border-color)' }}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}
                          >
                            <div style={{ padding: '1.5rem 2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-purple)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                                  <Activity size={16} /> BEHAVIORAL PATTERN ANALYSIS
                                </div>
                                {isAnalyst && log.type === 'threat' && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!incidentActions[log.id] ? (
                                      <>
                                        <button onClick={() => handleAction(log.id, 'resolved')} className="incident-btn-lg incident-btn-resolve">
                                          <CheckCircle2 size={14} /> Mark as Resolved
                                        </button>
                                        <button onClick={() => handleAction(log.id, 'escalated')} className="incident-btn-lg incident-btn-escalate">
                                          <ArrowUpCircle size={14} /> Escalate to Manager
                                        </button>
                                      </>
                                    ) : (
                                      <span style={{ fontSize: '0.8rem', color: incidentActions[log.id] === 'resolved' ? '#10B981' : '#F97316', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {incidentActions[log.id] === 'resolved' ? <><CheckCircle2 size={14}/> Marked Resolved</> : <><ArrowUpCircle size={14}/> Escalated to Manager</>}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {log.features && log.features.map((val, fIdx) => (
                                  <div key={fIdx} style={{ padding: '0.75rem', borderRadius: '6px', background: 'var(--card-inner-bg)', border: '1px solid var(--item-border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                      {FEATURE_LABELS[fIdx]?.icon} {FEATURE_LABELS[fIdx]?.label}
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: (val > 0 && [3,6,7,10,13].includes(fIdx)) || (val > 10 && [5,11].includes(fIdx)) ? 'var(--danger-red)' : 'var(--text-strong)' }}>
                                      {val}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                * Highlighted values indicate deviations from established user baseline.
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-log-list">
          {currentItems.map((log, idx) => (
            <div key={idx} className={`log-card ${expandedId === log.id ? 'expanded' : ''}`} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
              <div className="log-card-accent" style={{ background: log.type === 'threat' ? 'var(--danger-red)' : 'var(--success-green)' }}></div>
              <div className="log-card-header">
                <div className="log-card-id" style={{ color: log.type === 'threat' ? 'var(--danger-red)' : 'var(--primary-blue)' }}>{log.id}</div>
                <div className="log-card-time">{log.time}</div>
              </div>
              <div className="log-card-body">
                <div>
                  <div className="log-card-label">User</div>
                  <div className="log-card-value">{log.user}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="log-card-label">Confidence</div>
                  <div className="log-card-value">{log.confidence_score}%</div>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span className={`badge ${log.type === 'threat' ? 'badge-danger' : 'badge-success'}`}>
                  {log.status}
                </span>

              </div>

              <AnimatePresence>
                {expandedId === log.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-purple)', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Activity size={14} /> PATTERN ANALYSIS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      {log.features && log.features.map((val, fIdx) => (
                        <div key={fIdx} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.55rem', color: 'rgba(148, 163, 184, 0.6)', textTransform: 'uppercase', marginBottom: '0.1rem', fontWeight: 700 }}>{FEATURE_LABELS[fIdx]?.label}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: (val > 0 && [3,6,7,10,13].includes(fIdx)) || (val > 10 && [5,11].includes(fIdx)) ? 'var(--danger-red)' : 'var(--text-strong)' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                {expandedId === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          ))}
        </div>

            {/* Pagination Footer */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <StarBorder
                as="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                color="rgba(255,255,255,0.4)"
                innerStyle={{ padding: '0.6rem 1.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'white', cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: '0.3s' }}
              >
                PREVIOUS
              </StarBorder>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                PAGE {currentPage} OF {totalPages || 1}
              </div>
              <StarBorder
                as="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                color="rgba(255,255,255,0.4)"
                innerStyle={{ padding: '0.6rem 1.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: (currentPage === totalPages || totalPages === 0) ? 'rgba(255,255,255,0.1)' : 'white', cursor: (currentPage === totalPages || totalPages === 0) ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: '0.3s' }}
              >
                NEXT
              </StarBorder>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
