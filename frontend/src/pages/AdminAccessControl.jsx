import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Key, CheckCircle, XCircle, Clock, Shield, Mail, 
  MessageSquare, ShieldAlert, RefreshCw, Search, ShieldCheck, 
  User, Monitor, LogOut, Activity, Wifi
} from 'lucide-react';

const ROLE_COLORS = {
  'Security Analyst':   { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  'IT Manager':         { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  'System Administrator': { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  'Student/Researcher': { color: '#F97316', bg: 'rgba(249,115,22,0.1)'  },
};

const AdminAccessControl = () => {
    const [activeTab, setActiveTab]       = useState('access');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [resetRequests, setResetRequests] = useState([]);
    const [sessions, setSessions]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [processing, setProcessing]     = useState(null);
    const [searchQuery, setSearchQuery]   = useState('');

    const getToken = () => localStorage.getItem('threxia_auth');

    const fetchData = async () => {
        setLoading(true);
        const token = getToken();
        try {
            const [accessRes, resetRes] = await Promise.all([
                fetch('http://localhost:8000/api/admin/pending',       { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8000/api/admin/reset-requests',{ headers: { 'Authorization': `Bearer ${token}` } }),
            ]);
            const [accessData, resetData] = await Promise.all([accessRes.json(), resetRes.json()]);
            setPendingUsers(accessData.pending   || []);
            setResetRequests(resetData.requests  || []);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = useCallback(async () => {
        setSessionsLoading(true);
        const token = getToken();
        try {
            const res  = await fetch('http://localhost:8000/api/admin/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchSessions();
            const interval = setInterval(fetchSessions, 10000); // refresh every 10s
            return () => clearInterval(interval);
        }
    }, [activeTab, fetchSessions]);

    const handleApproveAccess = async (username) => {
        setProcessing(username);
        const token = getToken();
        try {
            const res = await fetch('http://localhost:8000/api/admin/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ username })
            });
            if (res.ok) setPendingUsers(prev => prev.filter(u => u.username !== username));
        } catch (err) { console.error(err); }
        finally { setProcessing(null); }
    };

    const handleRejectAccess = async (username) => {
        setProcessing(username);
        const token = getToken();
        try {
            const res = await fetch('http://localhost:8000/api/admin/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ username, reason: "Request declined by administrator." })
            });
            if (res.ok) setPendingUsers(prev => prev.filter(u => u.username !== username));
        } catch (err) { console.error(err); }
        finally { setProcessing(null); }
    };

    const handleResetPassword = async (username) => {
        setProcessing(username);
        const token = getToken();
        try {
            const res  = await fetch('http://localhost:8000/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`SUCCESS: Password reset for ${username}.\nTemporary Password: ${data.temp_pass}`);
                setResetRequests(prev => prev.filter(u => u.username !== username));
            }
        } catch (err) { console.error(err); }
        finally { setProcessing(null); }
    };

    const handleTerminateSession = async (username) => {
        if (!window.confirm(`Terminate the active session for "${username}"? They will be logged out on their next request.`)) return;
        setProcessing(username);
        const token = getToken();
        try {
            const res = await fetch('http://localhost:8000/api/admin/sessions/terminate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ username })
            });
            if (res.ok) setSessions(prev => prev.filter(s => s.username !== username));
        } catch (err) { console.error(err); }
        finally { setProcessing(null); }
    };

    const renderContent = () => {
        if (loading && activeTab !== 'sessions') {
            return (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '80px 0' }}>
                    <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--primary-purple)', opacity: 0.5 }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Synchronizing security feeds...</p>
                </motion.div>
            );
        }

        // ── Access Requests Tab ──────────────────────────────────────────────
        if (activeTab === 'access') {
            const filtered = pendingUsers.filter(u =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            if (filtered.length === 0) {
                return (
                    <motion.div key="access-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                        <div className="empty-icon"><ShieldCheck size={48} /></div>
                        <h3>Queue Clear</h3>
                        <p>No pending access requests detected in the system logs.</p>
                    </motion.div>
                );
            }
            return filtered.map((user) => (
                <motion.div key={user.username} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} className="admin-card">
                    <div className="admin-user-info">
                        <div className="admin-avatar"><User size={32} /></div>
                        <div className="admin-user-details">
                            <h3>{user.full_name}</h3>
                            <div className="admin-user-meta">
                                <span className="meta-item"><Shield size={12} /> {user.username}</span>
                                <span className="meta-item"><Mail size={12} /> {user.email}</span>
                                <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', borderColor: 'rgba(59,130,246,0.2)' }}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="admin-justification">
                        <div className="justification-label"><MessageSquare size={12} /> Justification</div>
                        <p className="justification-text">"{user.reason}"</p>
                    </div>
                    <div className="admin-actions">
                        <button onClick={() => handleRejectAccess(user.username)} disabled={processing === user.username} className="btn-admin btn-reject">
                            <XCircle size={18} /> Reject
                        </button>
                        <button onClick={() => handleApproveAccess(user.username)} disabled={processing === user.username} className="btn-admin btn-approve">
                            {processing === user.username ? <RefreshCw size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Grant Access</>}
                        </button>
                    </div>
                </motion.div>
            ));
        }

        // ── Password Resets Tab ──────────────────────────────────────────────
        if (activeTab === 'passwords') {
            const filtered = resetRequests.filter(req =>
                req.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) {
                return (
                    <motion.div key="pass-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                        <div className="empty-icon"><Key size={48} /></div>
                        <h3>Security Intact</h3>
                        <p>No password reset requests require your attention at this time.</p>
                    </motion.div>
                );
            }
            return filtered.map((req) => (
                <motion.div key={req.username} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} className="admin-card">
                    <div className="admin-user-info">
                        <div className="admin-avatar" style={{ color: 'var(--primary-purple)', background: 'rgba(139,92,246,0.1)' }}>
                            <ShieldAlert size={32} />
                        </div>
                        <div className="admin-user-details">
                            <h3>{req.username}</h3>
                            <div className="admin-user-meta">
                                <span className="meta-item"><Mail size={12} /> {req.email}</span>
                                <span className="meta-item"><Clock size={12} /> {new Date(req.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="admin-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleResetPassword(req.username)} disabled={processing === req.username}
                            className="btn-admin" style={{ background: 'var(--primary-purple)', color: 'white', width: '100%' }}>
                            {processing === req.username ? <RefreshCw size={18} className="animate-spin" /> : <><RefreshCw size={18} /> Reset Passcode & Notify</>}
                        </button>
                    </div>
                </motion.div>
            ));
        }

        // ── Session Monitor Tab ──────────────────────────────────────────────
        if (activeTab === 'sessions') {
            const myUsername = (() => {
                try {
                    const token = getToken();
                    if (!token) return '';
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.sub || '';
                } catch { return ''; }
            })();

            const filtered = sessions.filter(s =>
                s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.role.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (sessionsLoading && sessions.length === 0) {
                return (
                    <motion.div key="sess-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '80px 0' }}>
                        <Wifi size={40} className="animate-spin" style={{ color: 'var(--primary-purple)', opacity: 0.5 }} />
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Scanning active connections...</p>
                    </motion.div>
                );
            }

            if (filtered.length === 0) {
                return (
                    <motion.div key="sess-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                        <div className="empty-icon"><Monitor size={48} /></div>
                        <h3>No Active Sessions</h3>
                        <p>No users are currently logged in, or no sessions have been recorded since server start.</p>
                    </motion.div>
                );
            }

            return (
                <div className="session-table-wrapper">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--success-green)', fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-green)', display: 'inline-block', boxShadow: '0 0 6px var(--success-green)', animation: 'pulse 2s infinite' }} />
                            {filtered.length} ACTIVE SESSION{filtered.length !== 1 ? 'S' : ''}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            Auto-refreshes every 10s
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>USER</th>
                                    <th>ROLE</th>
                                    <th>SESSION STARTED</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((session) => {
                                    const roleStyle = ROLE_COLORS[session.role] || { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' };
                                    const isMe = session.username === myUsername;
                                    return (
                                        <tr key={session.username} className="log-row">
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: roleStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleStyle.color }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: '0.9rem' }}>{session.full_name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>@{session.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: roleStyle.bg, color: roleStyle.color, borderColor: `${roleStyle.color}40` }}>
                                                    {session.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                                    <Clock size={13} /> {session.login_time}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-green)', display: 'inline-block', boxShadow: '0 0 6px var(--success-green)' }} />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-green)' }}>
                                                        {isMe ? 'ACTIVE (YOU)' : 'ACTIVE'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {isMe ? (
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.5 }}>—</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleTerminateSession(session.username)}
                                                        disabled={processing === session.username}
                                                        className="incident-btn incident-btn-escalate"
                                                        style={{ gap: '0.4rem' }}
                                                    >
                                                        {processing === session.username
                                                            ? <RefreshCw size={12} className="animate-spin" />
                                                            : <LogOut size={12} />
                                                        }
                                                        Terminate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="container">
            <header className="admin-header">
                <div>
                    <div className="justification-label" style={{ color: 'var(--primary-purple)', marginBottom: '0.5rem' }}>
                        <Shield size={14} /> System Command
                    </div>
                    <h1 className="page-title">ACCESS CONTROL</h1>
                </div>

                <div className="admin-tabs">
                    <button onClick={() => setActiveTab('access')}
                        className={`admin-tab ${activeTab === 'access' ? 'active-access' : ''}`}>
                        <Users size={16} /> Access Requests
                        {pendingUsers.length > 0 && <span style={{ marginLeft: '6px', opacity: 0.8 }}>({pendingUsers.length})</span>}
                    </button>
                    <button onClick={() => setActiveTab('passwords')}
                        className={`admin-tab ${activeTab === 'passwords' ? 'active-passwords' : ''}`}>
                        <Key size={16} /> Password Resets
                        {resetRequests.length > 0 && <span style={{ marginLeft: '6px', opacity: 0.8 }}>({resetRequests.length})</span>}
                    </button>
                    <button onClick={() => setActiveTab('sessions')}
                        className={`admin-tab ${activeTab === 'sessions' ? 'active-sessions' : ''}`}>
                        <Monitor size={16} /> Session Monitor
                        {sessions.length > 0 && activeTab !== 'sessions' && (
                            <span style={{ marginLeft: '6px', width: 8, height: 8, borderRadius: '50%', background: 'var(--success-green)', display: 'inline-block', boxShadow: '0 0 6px var(--success-green)' }} />
                        )}
                    </button>
                </div>
            </header>

            <div className="admin-search-bar">
                <div className="admin-input-container">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'access' ? 'pending users' : activeTab === 'passwords' ? 'reset requests' : 'active sessions'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-input"
                    />
                </div>
                <button
                    onClick={activeTab === 'sessions' ? fetchSessions : fetchData}
                    className="logout-btn"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={(loading || sessionsLoading) ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="admin-content-grid">
                <AnimatePresence mode="popLayout">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminAccessControl;
