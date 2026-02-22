/**
 * Haversine formula — calculates the great-circle distance between two
 * latitude/longitude points in kilometres.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const toRad = (v) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Returns the current geolocation coordinates as { lat, lng }.
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

/**
 * Generate a simple unique ID (for demo/offline use).
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Format a distance number (in km) to a friendly string.
 */
export function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

/**
 * Radius expansion schedule.
 */
export const RADIUS_LEVELS = [0.5, 1, 2, 5];
export const RADIUS_INTERVAL_MS = 15000; // 15 seconds
