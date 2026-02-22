import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { emergencyAPI } from '../api/client';
import { Building2, AlertTriangle, Clock, Droplets, Radio, Users, MapPin } from 'lucide-react';

export default function HospitalDashboard() {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await emergencyAPI.getAll({ status: 'active,assigned,in_progress', radius: 15 });
                setEmergencies(res.data.emergencies || []);
            } catch {
                setEmergencies([]);
            } finally { setLoading(false); }
        }
        fetch();
        const i = setInterval(fetch, 15000);
        return () => clearInterval(i);
    }, []);

    if (loading) return <div className="page"><div className="container"><div className="loading-spinner" /></div></div>;

    return (
        <div className="page">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="greeting">
                    <div className="greeting-role"><Building2 size={16} className="text-purple" /><span>Hospital Dashboard</span></div>
                    <h2 className="greeting-name">Incoming Emergencies</h2>
                </motion.div>

                <motion.div className="stat-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="stat-card stat-card-center">
                        <p className="stat-big text-accent">{emergencies.filter((e) => e.severity === 'critical').length}</p>
                        <p className="stat-label">Critical</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <p className="stat-big text-amber">{emergencies.length}</p>
                        <p className="stat-label">Active</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <p className="stat-big text-green">{emergencies.reduce((a, e) => a + (e.helpers?.length || 0), 0)}</p>
                        <p className="stat-label">Helpers</p>
                    </div>
                </motion.div>

                {emergencies.length === 0 ? (
                    <div className="card card-center-content">
                        <Radio size={32} className="text-green" />
                        <p className="fw-600">No incoming patients</p>
                        <p className="text-sm text-muted">All clear in your area</p>
                    </div>
                ) : (
                    <div className="alert-list">
                        {emergencies.map((emg, i) => (
                            <motion.div key={emg._id} className="alert-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                                <div className="alert-header">
                                    <span className={`notif-severity notif-severity-${emg.severity}`}>{emg.severity}</span>
                                    <span className="text-sm text-muted">{emg.status}</span>
                                </div>
                                <div className="alert-body">
                                    <div className="alert-row"><AlertTriangle size={14} /><span>{emg.type?.replace('_', ' ')}</span></div>
                                    {emg.bloodRequired && <div className="alert-row"><Droplets size={14} className="text-accent" /><span>Blood: <strong>{emg.bloodRequired}</strong></span></div>}
                                    <div className="alert-row"><Users size={14} /><span>{emg.helpers?.length || 0} helpers responding</span></div>
                                    <div className="alert-row"><Clock size={14} /><span>{new Date(emg.createdAt).toLocaleTimeString()}</span></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
