import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Logs() {
  const [allLogs, setAllLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, threat, safe
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchLogs = () => {
      fetch('http://localhost:8000/api/logs')
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Comprehensive Audit Trail</h1>
        <p className="page-subtitle">A real-time registry of system baseline activity and detected anomalies.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Filter Navigation Bar */}
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--panel-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
          <button
            onClick={() => setFilter('all')}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', border: 'none', background: filter === 'all' ? 'var(--primary-purple)' : 'transparent', color: filter === 'all' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: '0.3s' }}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter('threat')}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', border: 'none', background: filter === 'threat' ? 'var(--danger-red)' : 'transparent', color: filter === 'threat' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: '0.3s' }}
          >
            THREATS
          </button>
          <button
            onClick={() => setFilter('safe')}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', border: 'none', background: filter === 'safe' ? 'var(--success-green)' : 'transparent', color: filter === 'safe' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: '0.3s' }}
          >
            SAFE
          </button>
        </div>

        {/* Top Info */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          SHOWING {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} OF {filteredLogs.length} ENTRIES
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading telemetry databases...</div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found in this category.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>TIME STAMP</th>
                  <th>INCIDENT ID</th>
                  <th>ENTITY PROFILE</th>
                  <th>AI CONFIDENCE</th>
                  <th>BEHAVIORAL AUDIT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((log, idx) => (
                  <tr key={idx} style={{ opacity: log.type === 'safe' ? 0.8 : 1 }}>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.time}</td>
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
                      <span className={`badge ${log.type === 'threat' ? 'badge-danger' : ''}`} style={{
                        backgroundColor: log.type === 'safe' ? 'var(--success-green)' : '',
                        color: log.type === 'safe' ? 'white' : '',
                        border: log.type === 'safe' ? 'none' : ''
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {log.type === 'threat' ? <AlertCircle size={12} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                          {log.status}
                        </div>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'white', cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: '0.3s' }}
              >
                PREVIOUS
              </button>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                PAGE {currentPage} OF {totalPages || 1}
              </div>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: (currentPage === totalPages || totalPages === 0) ? 'rgba(255,255,255,0.1)' : 'white', cursor: (currentPage === totalPages || totalPages === 0) ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: '0.3s' }}
              >
                NEXT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
