import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { emergencyAPI, userAPI } from '../api/client';
import { getSocket } from '../api/socket';
import { HeartHandshake, Shield, Radio, MapPin, Navigation, CheckCircle2, Clock, Users, AlertTriangle, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerDashboard() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isAvailable, setIsAvailable] = useState(user.isAvailable);
    const [emergencies, setEmergencies] = useState([]);
    const [accepting, setAccepting] = useState(null);

    // Fetch nearby emergencies
    useEffect(() => {
        async function fetch() {
            try {
                const res = await emergencyAPI.getAll({ status: 'active,assigned', radius: 10 });
                setEmergencies(res.data.emergencies || []);
            } catch {
                // Demo fallback
                setEmergencies([]);
            }
        }
        fetch();
        const interval = setInterval(fetch, 10000);

        // Socket listener
        const socket = getSocket();
        if (socket) {
            socket.on('emergency:new', (emg) => {
                setEmergencies((prev) => [emg, ...prev.filter((e) => e._id !== emg._id)]);
                toast('🚨 New emergency nearby!', { duration: 5000 });
            });
        }
        return () => { clearInterval(interval); socket?.off('emergency:new'); };
    }, []);

    async function toggleAvail() {
        const next = !isAvailable;
        setIsAvailable(next);
        updateUser({ isAvailable: next });
        try { await userAPI.toggleAvailability(); } catch { }
    }

    async function handleHelp(emg) {
        setAccepting(emg._id);
        try {
            let loc = { lat: 19.076, lng: 72.8777 };
            try {
                const pos = await new Promise((r, j) => navigator.geolocation.getCurrentPosition(r, j, { timeout: 5000 }));
                loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch { }

            await emergencyAPI.help(emg._id, loc);
            toast.success('✅ You accepted! Navigate now.');
            navigate('/emergency', { state: { emergency: emg, location: loc, isHelper: true } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept');
        } finally { setAccepting(null); }
    }

    return (
        <div className="page">
            <div className="container">
                {/* Greeting */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="greeting">
                    <p className="greeting-sub">Welcome back,</p>
                    <h2 className="greeting-name">{user.name}</h2>
                    <div className="greeting-role">
                        <HeartHandshake size={14} className="text-green" />
                        <span>{user.role === 'doctor' ? 'Doctor' : 'NSS Volunteer'}</span>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div className="stat-row stat-row-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="stat-card stat-card-center">
                        <p className="stat-big">{user.rescues || 0}</p>
                        <p className="stat-label">Rescues</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <p className="stat-big text-amber">{user.points || 0}</p>
                        <p className="stat-label">Points</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <p className="stat-big text-green">{isAvailable ? 'ON' : 'OFF'}</p>
                        <p className="stat-label">Status</p>
                    </div>
                </motion.div>

                {/* Availability toggle */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <div className={`stat-icon ${isAvailable ? 'stat-icon-green' : 'stat-icon-gray'}`}>
                                <Shield size={18} />
                            </div>
                            <div>
                                <p className="fw-600">Availability</p>
                                <p className="text-sm text-muted">{isAvailable ? 'Ready to respond' : 'Not accepting'}</p>
                            </div>
                        </div>
                        <div className={`toggle-track ${isAvailable ? 'active' : ''}`} onClick={toggleAvail}>
                            <div className="toggle-thumb" />
                        </div>
                    </div>
                </motion.div>

                {/* Emergency alerts */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="section-header">
                        <Radio size={14} className="text-accent" />
                        <span>Incoming Alerts</span>
                        {emergencies.length > 0 && <span className="badge badge-red">{emergencies.length}</span>}
                    </div>

                    {!isAvailable ? (
                        <div className="card card-center-content">
                            <Shield size={32} className="text-muted" />
                            <p>Turn on availability to receive alerts</p>
                        </div>
                    ) : emergencies.length === 0 ? (
                        <div className="card card-center-content">
                            <Radio size={32} className="text-green" />
                            <p className="fw-600">All Clear</p>
                            <p className="text-sm text-muted">No emergencies in your area</p>
                        </div>
                    ) : (
                        <div className="alert-list">
                            {emergencies.map((emg) => (
                                <motion.div key={emg._id} className="alert-card" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                    <div className="alert-header">
                                        <span className="alert-pulse" />
                                        <span className="alert-label">Emergency</span>
                                        <span className={`notif-severity notif-severity-${emg.severity}`}>{emg.severity}</span>
                                    </div>
                                    <div className="alert-body">
                                        <div className="alert-row">
                                            <AlertTriangle size={14} className="text-accent" />
                                            <span>{emg.type?.replace('_', ' ') || 'Emergency'}</span>
                                        </div>
                                        {emg.bloodRequired && (
                                            <div className="alert-row">
                                                <Droplets size={14} className="text-accent" />
                                                <span>Blood: <strong>{emg.bloodRequired}</strong></span>
                                                {user.bloodGroup === emg.bloodRequired && <span className="notif-blood-badge">Match!</span>}
                                            </div>
                                        )}
                                        <div className="alert-row">
                                            <Clock size={14} className="text-muted" />
                                            <span className="text-sm text-muted">Radius: {emg.currentRadius || 0.5} km</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-green btn-full" onClick={() => handleHelp(emg)} disabled={accepting === emg._id}>
                                        <Navigation size={16} />
                                        {accepting === emg._id ? 'Accepting…' : 'Help Now'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
