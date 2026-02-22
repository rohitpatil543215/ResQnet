import { useState, useEffect, useRef, useCallback } from 'react';
import { RADIUS_LEVELS, RADIUS_INTERVAL_MS, haversineDistance } from '../utils/helpers';

/**
 * Smart Expanding Radius Engine
 *
 * Starts at 0.5 km, expands to 1 → 2 → 5 km every 15 seconds.
 * Stops when a responder accepts or max radius is reached.
 */
export function useRadiusEngine(emergency, onRadiusChange) {
    const [currentRadius, setCurrentRadius] = useState(RADIUS_LEVELS[0]);
    const [radiusIndex, setRadiusIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const timerRef = useRef(null);

    const startSearch = useCallback(() => {
        setCurrentRadius(RADIUS_LEVELS[0]);
        setRadiusIndex(0);
        setIsSearching(true);
    }, []);

    const stopSearch = useCallback(() => {
        setIsSearching(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isSearching) return;

        timerRef.current = setInterval(() => {
            setRadiusIndex((prev) => {
                const next = prev + 1;
                if (next >= RADIUS_LEVELS.length) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return prev;
                }
                const newRadius = RADIUS_LEVELS[next];
                setCurrentRadius(newRadius);
                if (onRadiusChange) onRadiusChange(newRadius);
                return next;
            });
        }, RADIUS_INTERVAL_MS);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isSearching, onRadiusChange]);

    // Stop when emergency is no longer searching
    useEffect(() => {
        if (emergency && emergency.status !== 'searching') {
            stopSearch();
        }
    }, [emergency?.status, stopSearch]);

    return { currentRadius, isSearching, startSearch, stopSearch, radiusIndex };
}

/**
 * Hook to filter volunteers within a given radius of an emergency location.
 */
export function useNearbyVolunteers(volunteers, emergencyLocation, radiusKm) {
    const [nearby, setNearby] = useState([]);

    useEffect(() => {
        if (!emergencyLocation || !volunteers.length) {
            setNearby([]);
            return;
        }

        const filtered = volunteers
            .filter((v) => v.isAvailable && v.location)
            .map((v) => {
                const distance = haversineDistance(
                    emergencyLocation.lat,
                    emergencyLocation.lng,
                    v.location.lat,
                    v.location.lng
                );
                return { ...v, distance };
            })
            .filter((v) => v.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);

        setNearby(filtered);
    }, [volunteers, emergencyLocation, radiusKm]);

    return nearby;
}
