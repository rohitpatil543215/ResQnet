import { formatDistance } from '../utils/helpers';
import { MapPin, Clock, UserCheck } from 'lucide-react';

export default function EmergencyAlert({ emergency, distance, onAccept, isLoading }) {
    return (
        <div className="card animate-slide-in-right" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(26,26,46,0.9))' }}>
            {/* Pulse indicator */}
            <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                    Emergency Alert
                </span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-red-400" />
                    <span className="text-sm font-medium text-white">
                        {distance != null ? formatDistance(distance) : '…'} away
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Radius: {emergency.radiusLevel} km
                    </span>
                </div>
            </div>

            {/* Accept Button */}
            <button
                className="btn btn-green w-full"
                onClick={() => onAccept(emergency)}
                disabled={isLoading}
            >
                <UserCheck size={16} />
                {isLoading ? 'Accepting…' : 'Accept Emergency'}
            </button>
        </div>
    );
}
