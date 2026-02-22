import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { emergencyAPI } from '../api/client';
import { getSocket } from '../api/socket';
import SOSButton from '../components/SOSButton';
import {
    MapPin, Activity, Phone, Shield, Clock, AlertTriangle, Wifi, WifiOff,
    Camera, Droplets, Flame, Heart, Users, ArrowRight, Navigation, Siren, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [emergencyType, setEmergencyType] = useState('road_accident');
    const [severity, setSeverity] = useState('');
    const [description, setDescription] = useState('');
    const [bloodReq, setBloodReq] = useState('');
    const [images, setImages] = useState([]);

    // Incoming notification popups
    const [priorityAlert, setPriorityAlert] = useState(null);
    const [bloodAlert, setBloodAlert] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    // Socket listeners for priority notifications & blood alerts
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // Priority emergency notification (tiered by profession)
        socket.on('emergency:priority', (data) => {
            setPriorityAlert(data);
            // Auto-dismiss after 20s
            setTimeout(() => setPriorityAlert(prev => prev?._id === data._id ? null : prev), 20000);
        });

        // Blood group specific alert
        socket.on('emergency:blood', (data) => {
            setBloodAlert(data);
            setTimeout(() => setBloodAlert(prev => prev?._id === data._id ? null : prev), 30000);
        });

        // Generic new emergency — add to recent activity
        socket.on('emergency:new', (data) => {
            setRecentActivity(prev => [data, ...prev].slice(0, 5));
        });

        // Helper accepted your emergency
        socket.on('helper:accepted', (data) => {
            toast(`${data.name} (${data.profession || 'Citizen'}) is coming to help!\nETA: ${data.eta} min • ${data.distance} km away`, {
                duration: 8000, icon: '🏃',
            });
        });

        return () => {
            socket.off('emergency:priority');
            socket.off('emergency:blood');
            socket.off('emergency:new');
            socket.off('helper:accepted');
        };
    }, []);

    function handleSOSClick() { setShowSOSModal(true); }

    async function triggerSOS() {
        setLoading(true);
        try {
            let loc = { lat: 19.076, lng: 72.8777 };
            try {
                const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 }));
                loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch { toast('Using default location', { icon: '📍' }); }

            if (!isOnline) {
                try { await emergencyAPI.offlineSOS({ lat: loc.lat, lng: loc.lng }); } catch { }
                toast('📵 Offline — SMS sent to 112', { duration: 5000 });
                setShowSOSModal(false); setLoading(false); return;
            }

            const res = await emergencyAPI.create({
                lat: loc.lat, lng: loc.lng,
                type: emergencyType,
                severity: severity || undefined,
                description,
                bloodRequired: bloodReq,
            });
            toast.success('🚨 SOS sent! Help is on the way');
            navigate('/emergency', { state: { emergency: res.data.emergency, location: loc } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'SOS failed');
        } finally { setLoading(false); setShowSOSModal(false); }
    }

    async function respondToEmergency(emg) {
        try {
            let loc = { lat: 19.076, lng: 72.8777 };
            try {
                const pos = await new Promise((r, j) => navigator.geolocation.getCurrentPosition(r, j, { timeout: 5000 }));
                loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch { }
            await emergencyAPI.help(emg._id, loc);
            toast.success('Accepted! Navigating…');
            navigate('/emergency', { state: { emergency: emg, location: loc, isHelper: true } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to respond');
        }
    }

    const TYPES = [
        { value: 'road_accident', label: '🚗 Road Accident' },
        { value: 'medical', label: '🏥 Medical' },
        { value: 'fire', label: '🔥 Fire' },
        { value: 'natural_disaster', label: '🌊 Disaster' },
        { value: 'violence', label: '⚠️ Violence' },
        { value: 'other', label: '🆘 Other' },
    ];

    const SEVERITIES = [
        { value: 'minor', label: 'Minor', color: '#22c55e', icon: '🟢' },
        { value: 'moderate', label: 'Moderate', color: '#f59e0b', icon: '🟡' },
        { value: 'critical', label: 'Critical', color: '#ef4444', icon: '🔴' },
    ];

    return (
        <div className="page">
            <div className="container">
                {/* Greeting */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="greeting">
                    <p className="greeting-sub">Welcome back,</p>
                    <h2 className="greeting-name">{user.name}</h2>
                    <div className="greeting-role">
                        <span className="status-dot status-dot-green" />
                        <span>{user.profession || 'Citizen'} • {isOnline ? 'Online' : 'Offline'}</span>
                        {!isOnline && <WifiOff size={14} className="text-accent" />}
                    </div>
                </motion.div>

                {/* SOS */}
                <SOSButton onClick={handleSOSClick} loading={loading} />

                {/* Quick Stats */}
                <motion.div className="stat-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-blue"><MapPin size={18} /></div>
                        <div><p className="stat-label">GPS</p><p className="stat-value">Active</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-green"><Activity size={18} /></div>
                        <div><p className="stat-label">Rescues</p><p className="stat-value">{user.rescues || 0}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-amber"><Shield size={18} /></div>
                        <div><p className="stat-label">Trust</p><p className="stat-value">{user.trustScore || 50}</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-red"><Heart size={18} /></div>
                        <div><p className="stat-label">Points</p><p className="stat-value">{user.points || 0}</p></div>
                    </div>
                </motion.div>

                {/* Quick Actions (fills the empty space) */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                    <div className="card-header"><Flame size={14} className="text-accent" /><span>Quick Actions</span></div>
                    <div className="quick-actions-grid">
                        <button className="quick-action-btn" onClick={() => navigate('/nearby')}>
                            <div className="qa-icon qa-icon-red"><MapPin size={18} /></div>
                            <span>Nearby Emergencies</span>
                            <ArrowRight size={14} className="text-muted" />
                        </button>
                        <button className="quick-action-btn" onClick={() => navigate('/heroes')}>
                            <div className="qa-icon qa-icon-amber"><Users size={18} /></div>
                            <span>Today's Heroes</span>
                            <ArrowRight size={14} className="text-muted" />
                        </button>
                        <button className="quick-action-btn" onClick={() => navigate('/first-aid')}>
                            <div className="qa-icon qa-icon-green"><Heart size={18} /></div>
                            <span>First Aid Guide</span>
                            <ArrowRight size={14} className="text-muted" />
                        </button>
                        <button className="quick-action-btn" onClick={() => navigate('/leaderboard')}>
                            <div className="qa-icon qa-icon-blue"><Shield size={18} /></div>
                            <span>Leaderboard</span>
                            <ArrowRight size={14} className="text-muted" />
                        </button>
                    </div>
                </motion.div>

                {/* Live Activity Feed */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="card-header"><Activity size={14} className="text-green" /><span>Live Activity</span></div>
                    {recentActivity.length === 0 ? (
                        <div className="card-center-content">
                            <p className="text-sm text-muted">No recent emergencies in your area</p>
                            <p className="text-xs text-muted">You'll see real-time alerts here</p>
                        </div>
                    ) : (
                        <div className="activity-feed">
                            {recentActivity.map((a, i) => (
                                <div key={a._id || i} className="activity-item">
                                    <div className={`activity-dot activity-dot-${a.severity || 'moderate'}`} />
                                    <div className="activity-info">
                                        <p className="activity-type">{a.type?.replace('_', ' ') || 'Emergency'}</p>
                                        <p className="activity-time">{a.severity} • {a.distance ? `${a.distance} km` : 'near you'}</p>
                                    </div>
                                    <button className="btn btn-sm btn-red" onClick={() => respondToEmergency(a)}>Help</button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Emergency Numbers */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                    <div className="card-header"><Phone size={14} /><span>Emergency Numbers</span></div>
                    <div className="phone-row">
                        <a href="tel:112" className="phone-btn phone-btn-red">112</a>
                        <a href="tel:108" className="phone-btn phone-btn-blue">108</a>
                        <a href="tel:101" className="phone-btn phone-btn-amber">101</a>
                        <a href="tel:100" className="phone-btn phone-btn-green">100</a>
                    </div>
                </motion.div>
            </div>

            {/* SOS Type Modal */}
            <AnimatePresence>
                {showSOSModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-card" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}>
                            <h3 className="modal-title"><AlertTriangle size={20} className="text-accent" /> Emergency Details</h3>

                            <label className="form-label">Type of Emergency</label>
                            <div className="type-grid">
                                {TYPES.map((t) => (
                                    <button key={t.value} type="button"
                                        className={`type-btn ${emergencyType === t.value ? 'type-btn-active' : ''}`}
                                        onClick={() => setEmergencyType(t.value)}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <label className="form-label">How Serious?</label>
                            <div className="severity-grid">
                                {SEVERITIES.map((s) => (
                                    <button key={s.value} type="button"
                                        className={`severity-btn ${severity === s.value ? 'severity-btn-active' : ''}`}
                                        style={severity === s.value ? { borderColor: s.color, background: `${s.color}15` } : {}}
                                        onClick={() => setSeverity(s.value)}>
                                        <span>{s.icon}</span>
                                        <span>{s.label}</span>
                                    </button>
                                ))}
                            </div>

                            <label className="form-label">Upload Images (optional)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                                    <Camera size={14} /> Add Photo
                                    <input type="file" accept="image/*" multiple hidden onChange={(e) => setImages([...images, ...Array.from(e.target.files).slice(0, 3)])} />
                                </label>
                                {images.map((f, i) => (
                                    <span key={i} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--bg-2)', borderRadius: '0.25rem' }}>
                                        📷 {f.name?.slice(0, 15)}
                                        <button onClick={() => setImages(images.filter((_, j) => j !== i))} style={{ marginLeft: '4px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                                    </span>
                                ))}
                            </div>

                            <label className="form-label">Description (optional)</label>
                            <textarea className="input-textarea" placeholder="Describe the situation..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />

                            <label className="form-label">Blood Required? (optional)</label>
                            <div className="blood-grid">
                                {['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                    <button key={bg || 'none'} type="button"
                                        className={`blood-btn ${bloodReq === bg ? 'blood-btn-active' : ''}`}
                                        onClick={() => setBloodReq(bg)}>
                                        {bg || 'None'}
                                    </button>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-red btn-full" onClick={triggerSOS} disabled={loading}>
                                    {loading ? 'Sending SOS…' : '🚨 Send SOS Now'}
                                </button>
                                <button className="btn btn-ghost btn-full" onClick={() => setShowSOSModal(false)}>Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Priority Emergency Alert Popup */}
            <AnimatePresence>
                {priorityAlert && (
                    <motion.div className="priority-alert-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="priority-alert-card" initial={{ scale: 0.85, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 50 }}>
                            <button className="priority-alert-close" onClick={() => setPriorityAlert(null)}><X size={18} /></button>
                            <div className="priority-alert-header">
                                <Siren size={28} className="text-accent" />
                                <div>
                                    <p className="priority-alert-tier">{priorityAlert.priorityTier} Priority</p>
                                    <p className="priority-alert-type">{priorityAlert.type?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="priority-alert-body">
                                <div className="priority-alert-stat">
                                    <AlertTriangle size={14} style={{ color: priorityAlert.severity === 'critical' ? '#ef4444' : '#f59e0b' }} />
                                    <span>{priorityAlert.severity?.toUpperCase()}</span>
                                </div>
                                <div className="priority-alert-stat">
                                    <Navigation size={14} />
                                    <span>{priorityAlert.distance} km away</span>
                                </div>
                                {priorityAlert.description && <p className="priority-alert-desc">{priorityAlert.description}</p>}
                            </div>
                            <div className="priority-alert-actions">
                                <button className="btn btn-red btn-full" onClick={() => { respondToEmergency(priorityAlert); setPriorityAlert(null); }}>🏃 Respond Now</button>
                                <button className="btn btn-ghost btn-full" onClick={() => setPriorityAlert(null)}>Dismiss</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Blood Group Alert Popup */}
            <AnimatePresence>
                {bloodAlert && (
                    <motion.div className="priority-alert-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="blood-alert-card" initial={{ scale: 0.85, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 50 }}>
                            <button className="priority-alert-close" onClick={() => setBloodAlert(null)}><X size={18} /></button>
                            <div className="blood-alert-header">
                                <Droplets size={32} className="text-accent" />
                                <h3>🩸 Blood Needed!</h3>
                            </div>
                            <div className="blood-alert-body">
                                <div className="blood-alert-group">{bloodAlert.matchedBloodGroup}</div>
                                <p>Someone {bloodAlert.distance} km from you urgently needs <strong>{bloodAlert.matchedBloodGroup}</strong> blood</p>
                                <p className="text-sm text-muted">{bloodAlert.type?.replace('_', ' ')} — {bloodAlert.severity}</p>
                            </div>
                            <div className="priority-alert-actions">
                                <button className="btn btn-red btn-full" onClick={() => { respondToEmergency(bloodAlert); setBloodAlert(null); }}>🩸 I Can Help</button>
                                <button className="btn btn-ghost btn-full" onClick={() => setBloodAlert(null)}>Not Now</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
