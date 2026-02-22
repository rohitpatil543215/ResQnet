// LiveTrackingMap — Google Maps with live helper markers, route polylines, and smooth animation
// Used by: ActiveEmergencyPage, TrafficDashboard
import { useEffect, useRef, useState } from 'react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

// Severity color coding
const SEVERITY_COLORS = {
    critical: '#ef4444',  // Red
    moderate: '#f59e0b',  // Yellow
    minor: '#22c55e',     // Green
};

// Marker SVGs
function createMarkerIcon(color, label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
        <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${label}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function LiveTrackingMap({
    emergencyLocation,   // { lat, lng }
    helpers = [],         // [{ id, lat, lng, name, severity, label }]
    severity = 'moderate',
    routePoints = [],     // [ [lat,lng], [lat,lng], ... ] for polyline
    height = '400px',
    showDirections = false,
    className = '',
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef({});
    const polylineRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);

    // Load Google Maps script
    useEffect(() => {
        if (window.google?.maps) {
            setMapReady(true);
            return;
        }
        if (!MAPS_KEY) {
            setMapReady(false);
            return;
        }
        // Check if script already loading
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            const check = setInterval(() => {
                if (window.google?.maps) { setMapReady(true); clearInterval(check); }
            }, 200);
            return () => clearInterval(check);
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=visualization,geometry`;
        script.async = true;
        script.onload = () => setMapReady(true);
        document.head.appendChild(script);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapReady || !mapRef.current || !emergencyLocation) return;

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: emergencyLocation,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#212121' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
            ],
        });

        // Emergency location marker (pulsing red)
        const emgColor = SEVERITY_COLORS[severity] || '#ef4444';
        new window.google.maps.Marker({
            position: emergencyLocation,
            map: mapInstance.current,
            icon: {
                url: createMarkerIcon(emgColor, 'SOS'),
                scaledSize: new window.google.maps.Size(36, 46),
                anchor: new window.google.maps.Point(18, 46),
            },
            title: 'Emergency Location',
            zIndex: 100,
        });
    }, [mapReady, emergencyLocation, severity]);

    // Update helper markers with smooth animation
    useEffect(() => {
        if (!mapInstance.current || !mapReady) return;

        helpers.forEach((helper) => {
            const pos = new window.google.maps.LatLng(helper.lat, helper.lng);

            if (markersRef.current[helper.id]) {
                // Animate existing marker to new position
                animateMarker(markersRef.current[helper.id], pos);
            } else {
                // Create new marker
                const marker = new window.google.maps.Marker({
                    position: pos,
                    map: mapInstance.current,
                    icon: {
                        url: createMarkerIcon('#3b82f6', helper.label || 'H'),
                        scaledSize: new window.google.maps.Size(28, 38),
                        anchor: new window.google.maps.Point(14, 38),
                    },
                    title: helper.name || 'Helper',
                    zIndex: 50,
                });

                // Info window
                const info = new window.google.maps.InfoWindow({
                    content: `<div style="color:#000;font-size:12px;padding:4px">
                        <strong>${helper.name || 'Helper'}</strong><br/>
                        ${helper.role || ''} ${helper.eta ? `• ETA: ${helper.eta} min` : ''}
                    </div>`,
                });
                marker.addListener('click', () => info.open(mapInstance.current, marker));

                markersRef.current[helper.id] = marker;
            }
        });

        // Remove markers for helpers no longer present
        const currentIds = helpers.map((h) => h.id);
        Object.keys(markersRef.current).forEach((id) => {
            if (!currentIds.includes(id)) {
                markersRef.current[id].setMap(null);
                delete markersRef.current[id];
            }
        });
    }, [helpers, mapReady]);

    // Draw route polyline
    useEffect(() => {
        if (!mapInstance.current || !mapReady) return;
        // Remove old polyline
        if (polylineRef.current) polylineRef.current.setMap(null);

        if (routePoints.length > 1) {
            polylineRef.current = new window.google.maps.Polyline({
                path: routePoints.map(([lat, lng]) => ({ lat, lng })),
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: mapInstance.current,
            });
        }
    }, [routePoints, mapReady]);

    // Smooth marker animation
    function animateMarker(marker, newPos) {
        const start = marker.getPosition();
        const steps = 30;
        let step = 0;
        const dlat = (newPos.lat() - start.lat()) / steps;
        const dlng = (newPos.lng() - start.lng()) / steps;

        function move() {
            step++;
            marker.setPosition(new window.google.maps.LatLng(
                start.lat() + dlat * step,
                start.lng() + dlng * step
            ));
            if (step < steps) requestAnimationFrame(move);
        }
        requestAnimationFrame(move);
    }

    // Fallback when no Maps key
    if (!MAPS_KEY) {
        return (
            <div className={`live-map-fallback ${className}`} style={{ height }}>
                <div className="live-map-fallback-inner">
                    <span className="live-map-marker">📍</span>
                    <p>Live Tracking Active</p>
                    <p className="text-sm text-muted">Add Google Maps API key for live map</p>
                    {helpers.length > 0 && (
                        <div className="live-map-dots">
                            <span className="live-map-dot live-map-dot-red">SOS</span>
                            {helpers.map((h) => (
                                <span key={h.id} className="live-map-dot live-map-dot-blue">{h.label || 'H'}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return <div ref={mapRef} className={`live-map ${className}`} style={{ height, borderRadius: 'var(--radius)' }} />;
}
