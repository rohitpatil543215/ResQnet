// TrafficDashboard — Real-time traffic police command center with interactive emergency management
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { trafficAPI, emergencyAPI } from '../api/client';
import { getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import LiveTrackingMap from '../components/LiveTrackingMap';
import {
    Siren, AlertTriangle, MapPin, Users, Clock, Navigation, Phone,
    Shield, Radio, Car, CheckCircle, Activity, Droplets, Timer,
    BadgeCheck, Eye, ExternalLink, ArrowRight, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const SEV_COLORS = { critical: '#ef4444', moderate: '#f59e0b', minor: '#22c55e' };
const SEV_ICONS = { critical: AlertTriangle, moderate: Clock, minor: CheckCircle };

export default function TrafficDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmg, setSelectedEmg] = useState(null);
    const [helperLocations, setHelperLocations] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const res = await trafficAPI.getActive();
            setEmergencies(res.data.emergencies || []);
            const locs = {};
            (res.data.emergencies || []).forEach((emg) => {
                (emg.helperLiveLocations || []).forEach((hl) => {
                    locs[hl._id] = { lat: hl.lat, lng: hl.lng };
                });
            });
            setHelperLocations(locs);
        } catch { setEmergencies([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); const i = setInterval(fetchData, 8000); return () => clearInterval(i); }, [fetchData]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        socket.emit('join:traffic');
        socket.on('helperLocationUpdate', (d) => {
            setHelperLocations(prev => ({ ...prev, [d.helperId]: { lat: d.lat, lng: d.lng } }));
        });
        socket.on('emergencyBroadcast', () => { fetchData(); toast('🚨 New emergency reported!', { icon: '🆕' }); });
        socket.on('emergencyClosed', (d) => {
            setEmergencies(prev => prev.filter(e => e._id !== d.emergencyId));
            if (selectedEmg?._id === d.emergencyId) setSelectedEmg(null);
            toast.success('Emergency resolved');
        });
        return () => { socket.off('helperLocationUpdate'); socket.off('emergencyBroadcast'); socket.off('emergencyClosed'); };
    }, [fetchData, selectedEmg]);

    // Navigate to help an emergency
    async function handleHelp(emg) {
        try {
            let loc = { lat: 19.076, lng: 72.8777 };
            try {
                const pos = await new Promise((r, j) => navigator.geolocation.getCurrentPosition(r, j, { timeout: 5000 }));
                loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch { }
            await emergencyAPI.help(emg._id, loc);
            toast.success('Responding! Navigating to emergency…');
            navigate('/emergency', { state: { emergency: emg, location: loc, isHelper: true } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to respond');
        }
    }

    // Open emergency detail page
    function openEmergency(emg) {
        navigate('/emergency', { state: { emergency: emg, location: emg.victimLocation, isHelper: false } });
    }

    // Open Google Maps navigation to emergency
    function navigateToEmergency(emg) {
        if (emg.victimLocation) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${emg.victimLocation.lat},${emg.victimLocation.lng}&travelmode=driving`, '_blank');
        }
    }

    const stats = {
        total: emergencies.length,
        critical: emergencies.filter(e => e.severity === 'critical').length,
        totalHelpers: emergencies.reduce((a, e) => a + (e.helpers?.length || 0), 0),
        enRoute: emergencies.reduce((a, e) => a + (e.helpers?.filter(h => h.status === 'en_route')?.length || 0), 0),
    };

    const getMapHelpers = () => {
        const target = selectedEmg || emergencies[0];
        if (!target) return [];
        return (target.helpers || []).map(h => {
            const live = helperLocations[h.user?._id];
            return {
                id: h.user?._id || Math.random().toString(), label: h.user?.name?.charAt(0) || 'H',
                lat: live?.lat || h.location?.coordinates?.[1] || 0,
                lng: live?.lng || h.location?.coordinates?.[0] || 0,
                name: h.user?.name, role: h.user?.profession || h.user?.role, eta: h.eta,
            };
        }).filter(h => h.lat && h.lng);
    };

    const mapTarget = selectedEmg || emergencies[0];

    return (
        <div className="page">
            <div className="container container-lg">
                {/* Header */}
                <motion.div className="greeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="traffic-badge">
                        <Siren size={14} />
                        <span>Traffic Command Center</span>
                        <span className="traffic-live-dot" />
                        <span className="traffic-live-text">LIVE</span>
                    </div>
                    <h2 className="greeting-name">Traffic Police Dashboard</h2>
                    <p className="greeting-sub">Real-time emergency monitoring & dispatch</p>
                </motion.div>

                {/* Stats */}
                <motion.div className="stat-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-red"><AlertTriangle size={18} /></div>
                        <p className="stat-big text-accent">{stats.total}</p>
                        <p className="stat-label">Active</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-amber"><Zap size={18} /></div>
                        <p className="stat-big text-amber">{stats.critical}</p>
                        <p className="stat-label">Critical</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-blue"><Users size={18} /></div>
                        <p className="stat-big text-blue">{stats.totalHelpers}</p>
                        <p className="stat-label">Helpers</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-green"><Car size={18} /></div>
                        <p className="stat-big text-green">{stats.enRoute}</p>
                        <p className="stat-label">En Route</p>
                    </div>
                </motion.div>

                {/* Map */}
                {mapTarget && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <LiveTrackingMap emergencyLocation={mapTarget.victimLocation} helpers={getMapHelpers()} severity={mapTarget.severity} height="350px" />
                    </motion.div>
                )}

                {/* Emergency List */}
                <motion.div className="traffic-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="section-header">
                        <Activity size={14} className="text-accent" />
                        <span>Active Emergencies</span>
                        <span className="badge badge-amber">{emergencies.length}</span>
                    </div>

                    {loading ? <div className="loading-spinner" /> : emergencies.length === 0 ? (
                        <div className="card card-center-content">
                            <Radio size={32} className="text-green" />
                            <p className="fw-600">All Clear</p>
                            <p className="text-sm text-muted">No active emergencies</p>
                        </div>
                    ) : (
                        <div className="traffic-emg-list">
                            <AnimatePresence>
                                {emergencies.map((emg, i) => {
                                    const SevIcon = SEV_ICONS[emg.severity] || AlertTriangle;
                                    const sevColor = SEV_COLORS[emg.severity] || '#f59e0b';
                                    const isSelected = selectedEmg?._id === emg._id;
                                    const helpersEnRoute = emg.helpers?.filter(h => h.status === 'en_route') || [];

                                    return (
                                        <motion.div key={emg._id}
                                            className={`traffic-emg-card ${isSelected ? 'traffic-emg-card-selected' : ''}`}
                                            initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + i * 0.05 }}
                                            onClick={() => setSelectedEmg(isSelected ? null : emg)}>

                                            <div className="traffic-emg-severity" style={{ background: sevColor }}>
                                                <SevIcon size={16} color="white" />
                                            </div>

                                            <div className="traffic-emg-info">
                                                <div className="traffic-emg-title-row">
                                                    <span className="traffic-emg-type">{emg.type?.replace('_', ' ')}</span>
                                                    <span className="traffic-emg-sev-badge" style={{ color: sevColor, background: `${sevColor}15` }}>{emg.severity}</span>
                                                </div>

                                                {emg.description && <p className="traffic-emg-meta"><span>{emg.description.slice(0, 80)}</span></p>}

                                                {emg.victimLocation && (
                                                    <div className="traffic-emg-meta">
                                                        <MapPin size={11} />
                                                        <span>{emg.victimLocation.lat.toFixed(4)}, {emg.victimLocation.lng.toFixed(4)}</span>
                                                    </div>
                                                )}

                                                {emg.bloodRequired && (
                                                    <div className="traffic-emg-meta traffic-emg-meta-blood">
                                                        <Droplets size={11} /><span>Blood: <strong>{emg.bloodRequired}</strong></span>
                                                    </div>
                                                )}

                                                <div className="traffic-emg-helpers-row">
                                                    <div className="traffic-emg-meta"><Users size={11} /><span>{emg.helpers?.length || 0} helpers</span></div>
                                                    {helpersEnRoute.length > 0 && (
                                                        <div className="traffic-emg-meta traffic-emg-meta-route"><Car size={11} /><span>{helpersEnRoute.length} en route</span></div>
                                                    )}
                                                </div>

                                                {/* Interactive action buttons */}
                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div className="traffic-emg-expanded"
                                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>

                                                            {/* Action buttons row */}
                                                            <div className="traffic-action-row">
                                                                <button className="btn btn-sm btn-red" onClick={(e) => { e.stopPropagation(); openEmergency(emg); }}>
                                                                    <ExternalLink size={12} /> Open Details
                                                                </button>
                                                                <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); navigateToEmergency(emg); }}>
                                                                    <Navigation size={12} /> Navigate
                                                                </button>
                                                                <button className="btn btn-sm btn-green" onClick={(e) => { e.stopPropagation(); handleHelp(emg); }}>
                                                                    <ArrowRight size={12} /> Respond
                                                                </button>
                                                            </div>

                                                            {/* Helper details */}
                                                            {(emg.helpers || []).map((h, hi) => {
                                                                const u = h.user || {};
                                                                return (
                                                                    <div key={u._id || hi} className="traffic-helper-row">
                                                                        <div className="traffic-helper-id">
                                                                            <span className="traffic-helper-avatar">{u.name?.charAt(0) || 'H'}</span>
                                                                            <div>
                                                                                <p className="traffic-helper-name">
                                                                                    {u.name || 'Helper'}
                                                                                    {u.isVerified && <BadgeCheck size={11} className="text-blue" />}
                                                                                </p>
                                                                                <p className="traffic-helper-role">{u.profession || u.role?.replace('_', ' ')}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="traffic-helper-stats">
                                                                            <span className="traffic-stat-chip"><Navigation size={10} /> {h.distance ? `${h.distance.toFixed(1)}km` : '—'}</span>
                                                                            <span className="traffic-stat-chip traffic-stat-chip-amber"><Timer size={10} /> {h.eta ? `${h.eta}m` : '—'}</span>
                                                                            <span className={`traffic-stat-chip traffic-stat-chip-${h.status === 'arrived' ? 'green' : 'blue'}`}>
                                                                                {h.status === 'arrived' ? '✓ Arrived' : h.status === 'helping' ? '⚕ Helping' : '→ En Route'}
                                                                            </span>
                                                                        </div>
                                                                        {u.phone && (
                                                                            <a href={`tel:${u.phone}`} className="traffic-call-btn" onClick={e => e.stopPropagation()}>
                                                                                <Phone size={12} />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="traffic-emg-eye">
                                                <Eye size={14} className={isSelected ? 'text-accent' : 'text-muted'} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                <motion.div className="traffic-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Siren size={14} />
                    <span>Live updates every <strong>8s</strong> • Socket.io active • {emergencies.length} tracked</span>
                </motion.div>
            </div>
        </div>
    );
}
