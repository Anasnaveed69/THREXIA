import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ShieldAlert, Key, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

const SecuritySettings = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        const token = localStorage.getItem('threxia_auth');
        try {
            const response = await fetch('http://localhost:8000/api/user/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    current_password: formData.currentPassword, 
                    new_password: formData.newPassword 
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Your neural passcode has been successfully updated.");
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setError(data.detail || 'Password update failed.');
            }
        } catch (err) {
            setError('Connection to security server failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="security-container">
                <header className="page-header">
                    <div className="justification-label" style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                        <Lock size={14} /> Account Protection
                    </div>
                    <h1 className="page-title">SECURITY SETTINGS</h1>
                    <p className="page-subtitle">Manage your authentication credentials and system clearance.</p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="security-card"
                    >
                        <ShieldCheck className="security-card-bg-icon" />

                        <h2 className="card-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            <Key className="text-blue-500" size={20} /> Update Neural Passcode
                        </h2>

                        <form onSubmit={handleSubmit} className="security-form">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="security-alert alert-error"
                                >
                                    <ShieldAlert size={18} />
                                    {error}
                                </motion.div>
                            )}

                            {message && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="security-alert alert-success"
                                >
                                    <CheckCircle2 size={18} />
                                    {message}
                                </motion.div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Current Passcode</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="admin-input"
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">New Passcode</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="admin-input"
                                        placeholder="••••••••"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Passcode</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="admin-input"
                                        placeholder="••••••••"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ marginTop: '1rem' }}
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        Update Credentials
                                        <ArrowRight size={20} />
                                    </div>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    <div className="security-footer">
                        <div className="admin-avatar" style={{ minWidth: '48px', height: '48px' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <p>
                            <strong>Security Recommendation:</strong> THREXIA recommends using a passphrase of at least 12 characters. 
                            Avoid using common words or repeating patterns. Password changes are logged in the system audit trail.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
