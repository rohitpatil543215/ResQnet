import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { emergencyAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket } from '../api/socket';
import MapView from '../components/MapView';
import FirstAidCard from '../components/FirstAidCard';
import RadiusIndicator from '../components/RadiusIndicator';
import toast from 'react-hot-toast';
import {
    Navigation, Phone, Clock, MapPin, Users, Shield, CheckCircle, XCircle,
    AlertTriangle, Droplets, Radio, Stethoscope, Heart, BadgeCheck,
    Car, Timer, Route, Siren, ArrowRight, UserCheck, Activity
} from 'lucide-react';

const ROLE_LABELS = {
    citizen: 'Citizen',
    doctor: 'Doctor',
    nss_volunteer: 'NSS Volunteer',
    admin: 'Admin',
    hospital: 'Hospital Staff',
};

const ROLE_ICONS = {
    doctor: Stethoscope,
    nss_volunteer: Shield,
    citizen: UserCheck,
    admin: Shield,
    hospital: Activity,
};

const STATUS_LABELS = {
    en_route: { label: 'En Route', color: '#f59e0b', icon: Car },
    arrived: { label: 'Arrived', color: '#22c55e', icon: CheckCircle },
    helping: { label: 'Helping', color: '#3b82f6', icon: Heart },
};

export default function ActiveEmergencyPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { emergency: passedEmergency, isHelper } = location.state || {};

    const [emergency, setEmergency] = useState(passedEmergency || null);
    const [firstAid, setFirstAid] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    // Poll for emergency updates
    useEffect(() => {
        if (!emergency?._id) return;
        async function poll() {
            try {
                const res = await emergencyAPI.getById(emergency._id);
                setEmergency(res.data.emergency);
            } catch { }
        }
        poll();
        const i = setInterval(poll, 5000);
        return () => clearInterval(i);
    }, [emergency?._id]);

    // Load first aid
    useEffect(() => {
        if (!emergency?._id) return;
        async function load() {
            try {
                const res = await emergencyAPI.getFirstAid(emergency._id);
                setFirstAid(res.data);
            } catch { }
        }
        load();
    }, [emergency?._id]);

    // Elapsed timer
    useEffect(() => {
        if (!emergency?.createdAt) return;
        const tick = () => setElapsed(Math.floor((Date.now() - new Date(emergency.createdAt)) / 1000));
        tick();
        const i = setInterval(tick, 1000);
        return () => clearInterval(i);
    }, [emergency?.createdAt]);

    // Socket
    useEffect(() => {
        if (!emergency?._id) return;
        const socket = getSocket();
        if (socket) {
            socket.emit('join:emergency', emergency._id);
            socket.on('emergency:updated', (data) => {
                setEmergency((prev) => ({ ...prev, ...data }));
            });
            socket.on('emergency:resolved', () => {
                toast.success('Emergency resolved!');
                navigate('/dashboard');
            });
        }
        return () => {
            if (socket) {
                socket.off('emergency:updated');
                socket.off('emergency:resolved');
            }
        };
    }, [emergency?._id, navigate]);

    async function handleResolve() {
        setResolving(true);
        try {
            await emergencyAPI.resolve(emergency._id);
            toast.success('Emergency resolved! Points awarded to all helpers.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally { setResolving(false); }
    }

    if (!emergency) {
        return (
            <div className="page">
                <div className="container card-center-content">
                    <AlertTriangle size={48} className="text-accent" />
                    <p className="fw-600">No active emergency</p>
                    <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const emgLat = emergency.location?.coordinates?.[1];
    const emgLng = emergency.location?.coordinates?.[0];

    // Build map markers
    const markers = [
        { id: 'emergency', lat: emgLat, lng: emgLng, type: 'emergency' },
        ...(emergency.helpers || []).filter(h => h.location?.coordinates?.[0] && h.location?.coordinates?.[1]).map((h, i) => ({
            id: h.user?._id || `helper-${i}`,
            lat: h.location.coordinates[1],
            lng: h.location.coordinates[0],
            type: 'volunteer',
            label: h.user?.name?.charAt(0) || 'H',
        })),
    ];

    const helpers = emergency.helpers || [];
    const isCreator = emergency.creator?._id === user?._id;
    const isResolved = emergency.status === 'resolved';

    return (
        <div className="page">
            <div className="container container-lg">
                {/* Emergency Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="emg-header">
                    <div className="emg-header-top">
                        <div className="emg-header-status">
                            <span className="emg-pulse" />
                            <span className={`notif-severity notif-severity-${emergency.severity}`}>{emergency.severity}</span>
                            <span className="emg-status-badge">{emergency.status?.replace('_', ' ')}</span>
                        </div>
                        <div className="emg-timer">
                            <Timer size={14} />
                            <span>{formatTime(elapsed)}</span>
                        </div>
                    </div>
                    <h2 className="emg-type">{emergency.type?.replace('_', ' ')}</h2>
                    {emergency.description && <p className="emg-desc">{emergency.description}</p>}
                    {emergency.bloodRequired && (
                        <div className="emg-blood">
                            <Droplets size={14} />
                            <span>Blood Required: <strong>{emergency.bloodRequired}</strong></span>
                        </div>
                    )}
                </motion.div>

                {/* Map */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="emg-map-wrap">
                    <MapView center={{ lat: emgLat, lng: emgLng }} markers={markers} height="280px" />
                </motion.div>

                {/* Helpers En Route — THE KEY SECTION */}
                <motion.div className="helpers-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="helpers-header">
                        <div className="helpers-title">
                            <Siren size={16} className="text-accent" />
                            <h3>Responders En Route</h3>
                            <span className="helpers-count">{helpers.length}</span>
                        </div>
                        <p className="helpers-subtitle">
                            {helpers.length === 0 ? 'Searching for nearby volunteers…' : 'Live tracking of helpers heading to scene'}
                        </p>
                    </div>

                    {helpers.length === 0 ? (
                        <div className="helper-empty">
                            <Radio size={28} className="text-amber" />
                            <p>Broadcasting SOS to nearby volunteers</p>
                            <p className="text-sm text-muted">Radius: {emergency.currentRadius} km</p>
                        </div>
                    ) : (
                        <div className="helper-list">
                            {helpers.map((h, i) => {
                                const u = h.user || {};
                                const RoleIcon = ROLE_ICONS[u.role] || UserCheck;
                                const status = STATUS_LABELS[h.status] || STATUS_LABELS.en_route;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.div
                                        key={u._id || i}
                                        className={`helper-card ${i === 0 ? 'helper-card-primary' : ''}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                    >
                                        {/* Helper identity */}
                                        <div className="helper-top">
                                            <div className="helper-avatar">
                                                {u.profilePhoto ? (
                                                    <img src={u.profilePhoto} alt={u.name} />
                                                ) : (
                                                    <span>{u.name?.charAt(0)?.toUpperCase() || 'H'}</span>
                                                )}
                                                <div className="helper-status-dot" style={{ background: status.color }} />
                                            </div>
                                            <div className="helper-identity">
                                                <div className="helper-name">
                                                    {u.name || 'Volunteer'}
                                                    {u.isVerified && <BadgeCheck size={13} className="text-blue" />}
                                                    {i === 0 && <span className="helper-primary-badge">Lead</span>}
                                                </div>
                                                <div className="helper-role">
                                                    <RoleIcon size={12} />
                                                    <span>{u.profession || ROLE_LABELS[u.role] || u.role}</span>
                                                    {u.bloodGroup && (
                                                        <>
                                                            <span className="helper-divider">|</span>
                                                            <Droplets size={10} />
                                                            <span>{u.bloodGroup}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="helper-eta-box">
                                                <StatusIcon size={14} style={{ color: status.color }} />
                                                <span className="helper-eta-status" style={{ color: status.color }}>{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Route details — for traffic police */}
                                        <div className="helper-route">
                                            <div className="helper-route-item">
                                                <div className="helper-route-icon"><Navigation size={13} /></div>
                                                <div>
                                                    <p className="helper-route-label">Distance</p>
                                                    <p className="helper-route-value">{h.distance ? `${h.distance.toFixed(1)} km` : '—'}</p>
                                                </div>
                                            </div>
                                            <div className="helper-route-item">
                                                <div className="helper-route-icon helper-route-icon-amber"><Clock size={13} /></div>
                                                <div>
                                                    <p className="helper-route-label">ETA</p>
                                                    <p className="helper-route-value">{h.eta ? `${h.eta} min` : '—'}</p>
                                                </div>
                                            </div>
                                            <div className="helper-route-item">
                                                <div className="helper-route-icon helper-route-icon-green"><Route size={13} /></div>
                                                <div>
                                                    <p className="helper-route-label">Route</p>
                                                    <p className="helper-route-value">{h.status === 'arrived' ? 'On scene' : 'Active'}</p>
                                                </div>
                                            </div>
                                            <div className="helper-route-item">
                                                <div className="helper-route-icon helper-route-icon-blue"><Shield size={13} /></div>
                                                <div>
                                                    <p className="helper-route-label">Trust</p>
                                                    <p className="helper-route-value">{u.trustScore || '—'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact for traffic coordination */}
                                        {u.phone && (
                                            <a href={`tel:${u.phone}`} className="helper-call-btn">
                                                <Phone size={14} />
                                                <span>Call {u.name?.split(' ')[0]}</span>
                                                <ArrowRight size={12} />
                                            </a>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Traffic police alert bar */}
                    {helpers.filter(h => h.status === 'en_route').length > 0 && (
                        <motion.div className="traffic-alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <Siren size={16} />
                            <div>
                                <p className="traffic-alert-title">{helpers.filter(h => h.status === 'en_route').length} responder(s) en route</p>
                                <p className="traffic-alert-sub">Traffic police: Please clear way for emergency responders</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Radius indicator */}
                {emergency.status !== 'resolved' && (
                    <RadiusIndicator
                        currentRadius={emergency.currentRadius}
                        radiusIndex={emergency.radiusLevel}
                        isSearching={helpers.length === 0}
                    />
                )}

                {/* First Aid Guide */}
                {firstAid?.instructions && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        <FirstAidCard instructions={firstAid.instructions} type={emergency.type} />
                    </motion.div>
                )}

                {/* Action buttons */}
                {!isResolved && (
                    <motion.div className="emg-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        {isCreator && (
                            <button className="btn btn-green btn-full" onClick={handleResolve} disabled={resolving}>
                                <CheckCircle size={16} /> {resolving ? 'Resolving…' : 'Mark as Resolved'}
                            </button>
                        )}
                        <a href="tel:112" className="btn btn-red btn-full">
                            <Phone size={16} /> Call Emergency (112)
                        </a>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
