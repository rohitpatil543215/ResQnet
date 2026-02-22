import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Droplets, X, Navigation } from 'lucide-react';

export default function NotificationPopup({ emergency, distance, onHelp, onIgnore, isBloodMatch }) {
    if (!emergency) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="notif-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="notif-card"
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                >
                    {/* Header */}
                    <div className="notif-header">
                        <span className="notif-pulse" />
                        <AlertTriangle size={18} className="text-accent" />
                        <span className="notif-title">Emergency Alert</span>
                        <button onClick={onIgnore} className="notif-close"><X size={16} /></button>
                    </div>

                    {/* Body */}
                    <div className="notif-body">
                        <div className="notif-row">
                            <AlertTriangle size={14} className="text-accent" />
                            <span className="notif-type">{emergency.type?.replace('_', ' ') || 'Emergency'}</span>
                            <span className={`notif-severity notif-severity-${emergency.severity}`}>
                                {emergency.severity}
                            </span>
                        </div>
                        <div className="notif-row">
                            <MapPin size={14} className="text-blue" />
                            <span>{distance != null ? `${distance.toFixed(1)} km away` : 'Nearby'}</span>
                        </div>
                        {emergency.bloodRequired && (
                            <div className="notif-row">
                                <Droplets size={14} className="text-accent" />
                                <span>Blood needed: <strong>{emergency.bloodRequired}</strong></span>
                                {isBloodMatch && <span className="notif-blood-badge">Your Match!</span>}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="notif-actions">
                        <motion.button whileTap={{ scale: 0.95 }} className="btn btn-green notif-help" onClick={onHelp}>
                            <Navigation size={16} /> Help Now
                        </motion.button>
                        <button className="btn btn-ghost" onClick={onIgnore}>Ignore</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
