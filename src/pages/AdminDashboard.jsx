import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../api/client';
import { Activity, AlertTriangle, Users, Clock, BarChart3, MapPin, TrendingUp, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await analyticsAPI.getDashboard();
                setStats(res.data.stats);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard data');
            }
        }
        fetch();
    }, []);

    if (error) return (
        <div className="page"><div className="container card-center-content">
            <ShieldAlert size={48} className="text-accent" />
            <p className="fw-600">{error}</p>
            <p className="text-sm text-muted">Admin access required</p>
        </div></div>
    );

    if (!stats) return <div className="page"><div className="container"><div className="loading-spinner" /></div></div>;

    const cards = [
        { label: 'Total Emergencies', value: stats.totalEmergencies, icon: AlertTriangle, color: '#ef4444' },
        { label: 'Active Now', value: stats.activeEmergencies, icon: Activity, color: '#f59e0b' },
        { label: 'Resolved', value: stats.resolvedEmergencies, icon: ShieldAlert, color: '#22c55e' },
        { label: 'False Alarms', value: stats.falseAlarms, icon: ShieldAlert, color: '#6b7280' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3b82f6' },
        { label: 'Volunteers', value: stats.totalVolunteers, icon: Users, color: '#8b5cf6' },
        { label: 'Avg Response', value: `${stats.avgResponseTime}s`, icon: Clock, color: '#ec4899' },
    ];

    return (
        <div className="page">
            <div className="container container-lg">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="greeting">
                    <h2 className="greeting-name">Admin Dashboard</h2>
                    <p className="greeting-sub">ResQNet Analytics & Management</p>
                </motion.div>

                {/* Stat cards */}
                <div className="admin-grid">
                    {cards.map((c, i) => (
                        <motion.div key={c.label} className="admin-stat" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="admin-stat-icon" style={{ background: `${c.color}15`, color: c.color }}>
                                <c.icon size={20} />
                            </div>
                            <div>
                                <p className="admin-stat-value">{c.value}</p>
                                <p className="admin-stat-label">{c.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Severity distribution */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="card-header"><BarChart3 size={16} /><span>Severity Distribution</span></div>
                    <div className="severity-bars">
                        {(stats.severityDistribution || []).map((s) => {
                            const total = stats.totalEmergencies || 1;
                            const pct = Math.round((s.count / total) * 100);
                            const colors = { minor: '#22c55e', moderate: '#f59e0b', critical: '#ef4444' };
                            return (
                                <div key={s._id} className="severity-bar-row">
                                    <span className="severity-label">{s._id}</span>
                                    <div className="severity-track">
                                        <motion.div className="severity-fill" style={{ background: colors[s._id] }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.8 }} />
                                    </div>
                                    <span className="severity-count">{s.count} ({pct}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Heatmap placeholder */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <div className="card-header"><MapPin size={16} /><span>Incident Heatmap</span></div>
                    <div className="heatmap-placeholder">
                        <TrendingUp size={48} className="text-muted" />
                        <p>Heatmap visualization active with Google Maps API key</p>
                        <p className="text-sm">Showing data from {stats.totalEmergencies} recorded incidents</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
