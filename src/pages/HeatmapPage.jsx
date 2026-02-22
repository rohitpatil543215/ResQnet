// HeatmapPage — Emergency heatmap visualization for admin
// Route: /admin/heatmap
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { heatmapAPI } from '../api/client';
import { Flame, Clock, Calendar, History, BarChart3, MapPin, AlertTriangle } from 'lucide-react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const PERIOD_OPTIONS = [
    { key: 'hour', label: 'Last Hour', icon: Clock },
    { key: '24h', label: 'Last 24h', icon: Clock },
    { key: 'week', label: 'Last Week', icon: Calendar },
    { key: 'all', label: 'All Time', icon: History },
];

export default function HeatmapPage() {
    const [period, setPeriod] = useState('all');
    const [data, setData] = useState({ points: [], count: 0 });
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const heatmapLayer = useRef(null);
    const [mapReady, setMapReady] = useState(false);

    // Load heatmap data
    useEffect(() => {
        async function fetch() {
            setLoading(true);
            try {
                const res = await heatmapAPI.getData({ period });
                setData(res.data);
            } catch {
                setData({ points: [], count: 0 });
            } finally { setLoading(false); }
        }
        fetch();
    }, [period]);

    // Load Google Maps
    useEffect(() => {
        if (window.google?.maps) { setMapReady(true); return; }
        if (!MAPS_KEY) return;
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            const check = setInterval(() => {
                if (window.google?.maps) { setMapReady(true); clearInterval(check); }
            }, 200);
            return () => clearInterval(check);
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=visualization`;
        script.async = true;
        script.onload = () => setMapReady(true);
        document.head.appendChild(script);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 19.076, lng: 72.8777 }, // Mumbai
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#212121' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
            ],
        });
    }, [mapReady]);

    // Update heatmap layer
    useEffect(() => {
        if (!mapInstance.current || !mapReady || !window.google?.maps?.visualization) return;

        // Remove existing heatmap
        if (heatmapLayer.current) heatmapLayer.current.setMap(null);

        if (data.points.length === 0) return;

        const heatmapData = data.points.map((p) =>
            ({ location: new window.google.maps.LatLng(p.lat, p.lng), weight: p.weight || 1 })
        );

        heatmapLayer.current = new window.google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: mapInstance.current,
            radius: 40,
            opacity: 0.7,
            gradient: [
                'rgba(0, 255, 0, 0)',
                'rgba(0, 255, 0, 0.6)',
                'rgba(255, 255, 0, 0.8)',
                'rgba(255, 165, 0, 0.9)',
                'rgba(255, 0, 0, 1)',
            ],
        });
    }, [data, mapReady]);

    return (
        <div className="page">
            <div className="container container-lg">
                <motion.div className="greeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="hero-page-badge">
                        <Flame size={14} />
                        <span>Admin Analytics</span>
                    </div>
                    <h2 className="greeting-name">Emergency Heatmap</h2>
                    <p className="greeting-sub">Visualize incident hotspots across the city</p>
                </motion.div>

                {/* Period filter tabs */}
                <motion.div className="hero-period-tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    {PERIOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            className={`hero-period-tab ${period === opt.key ? 'hero-period-tab-active' : ''}`}
                            onClick={() => setPeriod(opt.key)}
                        >
                            <opt.icon size={13} />
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Stats bar */}
                <motion.div className="stat-row stat-row-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-red"><AlertTriangle size={18} /></div>
                        <p className="stat-big text-accent">{data.count}</p>
                        <p className="stat-label">Incidents</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-amber"><MapPin size={18} /></div>
                        <p className="stat-big text-amber">{data.points?.filter(p => p.weight >= 3).length || 0}</p>
                        <p className="stat-label">Critical</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-green"><BarChart3 size={18} /></div>
                        <p className="stat-big text-green">{period === 'hour' ? '1h' : period === '24h' ? '24h' : period === 'week' ? '7d' : '∞'}</p>
                        <p className="stat-label">Period</p>
                    </div>
                </motion.div>

                {/* Map */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {loading ? (
                        <div className="card card-center-content"><div className="loading-spinner" /></div>
                    ) : !MAPS_KEY ? (
                        <div className="heatmap-fallback">
                            <div className="heatmap-fallback-grid">
                                {data.points.map((p, i) => (
                                    <div key={i} className="heatmap-dot" style={{
                                        left: `${((p.lng - 72.8) / 0.2) * 100}%`,
                                        top: `${((19.15 - p.lat) / 0.2) * 100}%`,
                                        background: p.weight >= 3 ? '#ef4444' : p.weight >= 2 ? '#f59e0b' : '#22c55e',
                                        opacity: 0.4 + p.weight * 0.2,
                                        width: `${8 + p.weight * 4}px`,
                                        height: `${8 + p.weight * 4}px`,
                                    }} />
                                ))}
                            </div>
                            <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
                                Add Google Maps API key for interactive heatmap • {data.count} incidents plotted
                            </p>
                        </div>
                    ) : (
                        <div ref={mapRef} style={{ height: '500px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }} />
                    )}
                </motion.div>

                {/* Legend */}
                <motion.div className="heatmap-legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#22c55e' }} />Minor</span>
                    <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#f59e0b' }} />Moderate</span>
                    <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#ef4444' }} />Critical</span>
                </motion.div>
            </div>
        </div>
    );
}
