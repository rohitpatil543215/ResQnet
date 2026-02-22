/**
 * Haversine formula — great-circle distance between two geo coordinates.
 * Returns distance in kilometres.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Radius escalation schedule.
 * Each level: { radius (km), timeoutSec, label }
 */
export const RADIUS_SCHEDULE = [
    { radius: 0.5, timeoutSec: 20, label: '500m', level: 0 },
    { radius: 2, timeoutSec: 20, label: '2 km', level: 1 },
    { radius: 5, timeoutSec: 20, label: '5 km', level: 2 },
    { radius: 10, timeoutSec: 0, label: '10 km', level: 3 }, // critical only
];

/**
 * Get the appropriate radius level based on elapsed seconds and severity.
 */
export function getRadiusForTime(elapsedSec, severity) {
    if (severity === 'critical') {
        if (elapsedSec >= 40) return RADIUS_SCHEDULE[3];
        if (elapsedSec >= 20) return RADIUS_SCHEDULE[2];
        if (elapsedSec >= 0) return RADIUS_SCHEDULE[1];
    }
    if (elapsedSec >= 40) return RADIUS_SCHEDULE[2];
    if (elapsedSec >= 20) return RADIUS_SCHEDULE[1];
    return RADIUS_SCHEDULE[0];
}
