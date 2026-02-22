import { useState, useEffect } from 'react';
import { getCurrentLocation } from '../utils/helpers';

/**
 * Hook to track the user's live geolocation.
 */
export function useGeolocation(watch = false) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let watchId;

        getCurrentLocation()
            .then((loc) => {
                setLocation(loc);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Failed to get location');
                setLoading(false);
            });

        if (watch && navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                (err) => {
                    setError(err.message);
                },
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watch]);

    return { location, error, loading };
}
