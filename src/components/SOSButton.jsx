import { motion } from 'framer-motion';

export default function SOSButton({ onClick, loading }) {
    return (
        <div className="sos-container">
            {/* Pulse rings */}
            <div className="sos-ring sos-ring-1" />
            <div className="sos-ring sos-ring-2" />
            <div className="sos-ring sos-ring-3" />

            <motion.button
                id="sos-button"
                className="sos-btn"
                onClick={onClick}
                disabled={loading}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
            >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="sos-text">SOS</span>
            </motion.button>

            <p className="sos-label">Press in Emergency</p>
            <p className="sos-sublabel">Alerts nearby volunteers instantly</p>
        </div>
    );
}
