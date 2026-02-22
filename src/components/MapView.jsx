import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useCallback, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
};

const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0f' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b80' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#22223a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a45' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#16162a' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#16162a' }] },
];

const defaultCenter = { lat: 19.076, lng: 72.8777 };

// Check if a real API key is configured (not placeholder)
function hasValidApiKey() {
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
    return key && key !== 'placeholder' && key.startsWith('AIza');
}

/**
 * Fallback map placeholder with a styled dark card showing coordinates
 * and marker pins — used when Google Maps API key is missing.
 */
function MapPlaceholder({ center, markers, height }) {
    const loc = center || defaultCenter;
    return (
        <div
            className="relative overflow-hidden flex flex-col items-center justify-center"
            style={{
                height,
                borderRadius: '16px',
                background: 'linear-gradient(145deg, #0e0e1a 0%, #1a1a2e 50%, #12121f 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Grid pattern background */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Radar circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-red-500/10" />
                <div className="absolute w-52 h-52 rounded-full border border-red-500/5" />
                <div className="absolute w-72 h-72 rounded-full border border-red-500/[0.03]" />
            </div>

            {/* Center pin */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                    <MapPin size={24} className="text-red-400" />
                </div>
                <p className="text-xs font-medium text-white">Location Tracked</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E
                </p>
            </div>

            {/* Marker pins */}
            {markers && markers.length > 0 && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    {markers.map((m, i) => (
                        <span
                            key={m.id || i}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
                            style={{
                                background: m.type === 'emergency' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                                color: m.type === 'emergency' ? '#ef4444' : '#22c55e',
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.type === 'emergency' ? '#ef4444' : '#22c55e' }} />
                            {m.type === 'emergency' ? 'SOS' : 'Vol'}
                        </span>
                    ))}
                </div>
            )}

            {/* API key notice */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <Navigation size={10} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                    Add Maps API key for live map
                </span>
            </div>
        </div>
    );
}

export default function MapView({
    center,
    markers = [],
    showDirections = false,
    origin,
    destination,
    onDirectionsReady,
    height = '300px',
}) {
    // If no valid API key, show beautiful placeholder
    if (!hasValidApiKey()) {
        return <MapPlaceholder center={center} markers={markers} height={height} />;
    }

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
        libraries: ['places'],
    });

    const [directionsResult, setDirectionsResult] = useState(null);

    const onMapLoad = useCallback((map) => {
        // Map is loaded
    }, []);

    // Fetch directions
    useEffect(() => {
        if (!showDirections || !origin || !destination || !isLoaded) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                destination: new window.google.maps.LatLng(destination.lat, destination.lng),
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === 'OK') {
                    setDirectionsResult(result);
                    if (onDirectionsReady) {
                        const route = result.routes[0].legs[0];
                        onDirectionsReady({
                            distance: route.distance.text,
                            duration: route.duration.text,
                        });
                    }
                }
            }
        );
    }, [showDirections, origin, destination, isLoaded, onDirectionsReady]);

    if (loadError) {
        return <MapPlaceholder center={center} markers={markers} height={height} />;
    }

    if (!isLoaded) {
        return (
            <div className="card flex items-center justify-center" style={{ height }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading map…</p>
            </div>
        );
    }

    return (
        <div style={{ height, borderRadius: '16px', overflow: 'hidden' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center || defaultCenter}
                zoom={14}
                onLoad={onMapLoad}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                }}
            >
                {markers.map((marker, i) => (
                    <Marker
                        key={marker.id || i}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        label={marker.label || undefined}
                        icon={
                            marker.type === 'emergency'
                                ? {
                                    url: 'data:image/svg+xml,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
                        <text x="16" y="21" text-anchor="middle" font-size="16" font-weight="bold" fill="white">!</text>
                      </svg>
                    `),
                                    scaledSize: new window.google.maps.Size(32, 32),
                                }
                                : marker.type === 'volunteer'
                                    ? {
                                        url: 'data:image/svg+xml,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="12" fill="#22c55e" stroke="#fff" stroke-width="2"/>
                        <text x="14" y="19" text-anchor="middle" font-size="14" font-weight="bold" fill="white">V</text>
                      </svg>
                    `),
                                        scaledSize: new window.google.maps.Size(28, 28),
                                    }
                                    : undefined
                        }
                    />
                ))}

                {directionsResult && (
                    <DirectionsRenderer
                        directions={directionsResult}
                        options={{
                            polylineOptions: {
                                strokeColor: '#ef4444',
                                strokeWeight: 4,
                                strokeOpacity: 0.8,
                            },
                            suppressMarkers: false,
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
}
