import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { emergencyAPI } from '../api/client';
import { MapPin, AlertTriangle, Clock, Users, Droplets, Navigation, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function NearbyEmergencies() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [emergencies, setEmergencies] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await emergencyAPI.getAll({ status: 'active,assigned,in_progress', radius: 10 });
                setEmergencies(res.data.emergencies || []);
            } catch {
                setEmergencies([]);
            } finally { setLoading(false); }
        }
        fetch();
    }, []);

    const filtered = filter === 'all' ? emergencies : emergencies.filter((e) => e.severity === filter);

    async function handleHelp(emg) {
        try {
            let loc = { lat: 19.076, lng: 72.8777 };
            try {
                const pos = await new Promise((r, j) => navigator.geolocation.getCurrentPosition(r, j, { timeout: 5000 }));
                loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch { }
            await emergencyAPI.help(emg._id, loc);
            toast.success('Accepted! Navigating…');
            navigate('/emergency', { state: { emergency: emg, location: loc, isHelper: true } });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    }

    return (
        <div className="page">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="greeting">
                    <h2 className="greeting-name">Nearby Emergencies</h2>
                    <p className="greeting-sub">Active emergencies within 10 km</p>
                </motion.div>

                {/* Filter */}
                <div className="filter-row">
                    <Filter size={14} />
                    {['all', 'critical', 'moderate', 'minor'].map((f) => (
                        <button key={f} className={`filter-btn ${filter === f ? 'filter-btn-active' : ''}`} onClick={() => setFilter(f)}>
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? <div className="loading-spinner" /> : filtered.length === 0 ? (
                    <div className="card card-center-content">
                        <MapPin size={32} className="text-green" />
                        <p className="fw-600">All Clear</p>
                        <p className="text-sm text-muted">No emergencies nearby</p>
                    </div>
                ) : (
                    <div className="alert-list">
                        {filtered.map((emg, i) => (
                            <motion.div key={emg._id} className="alert-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                <div className="alert-header">
                                    <span className="alert-pulse" />
                                    <span className="alert-label">{emg.type?.replace('_', ' ')}</span>
                                    <span className={`notif-severity notif-severity-${emg.severity}`}>{emg.severity}</span>
                                </div>
                                <div className="alert-body">
                                    <div className="alert-row"><Clock size={14} /><span>{new Date(emg.createdAt).toLocaleTimeString()}</span></div>
                                    <div className="alert-row"><Users size={14} /><span>{emg.helpers?.length || 0} helpers</span></div>
                                    {emg.bloodRequired && (
                                        <div className="alert-row"><Droplets size={14} className="text-accent" /><span>Blood: <strong>{emg.bloodRequired}</strong></span>
                                            {user.bloodGroup === emg.bloodRequired && <span className="notif-blood-badge">Your Match!</span>}
                                        </div>
                                    )}
                                </div>
                                {(user.role === 'doctor' || user.role === 'nss_volunteer' || user.role === 'citizen') && (
                                    <button className="btn btn-green btn-full" onClick={() => handleHelp(emg)}>
                                        <Navigation size={16} /> Help Now
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
