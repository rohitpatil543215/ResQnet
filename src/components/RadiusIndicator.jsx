export default function RadiusIndicator({ currentRadius, radiusIndex, isSearching }) {
    const levels = [0.5, 1, 2, 5];

    return (
        <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    Search Radius
                </span>
                {isSearching && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Expanding…
                    </span>
                )}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-3">
                {levels.map((level, i) => (
                    <div key={level} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                            className="w-full h-1.5 rounded-full transition-all duration-500"
                            style={{
                                background:
                                    i <= radiusIndex
                                        ? i === radiusIndex
                                            ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                                            : 'var(--accent-red)'
                                        : 'rgba(255,255,255,0.06)',
                            }}
                        />
                        <span
                            className="text-[10px] font-medium transition-colors"
                            style={{
                                color: i <= radiusIndex ? '#fff' : 'var(--text-secondary)',
                            }}
                        >
                            {level} km
                        </span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                Currently searching within <strong className="text-white">{currentRadius} km</strong>
            </p>
        </div>
    );
}
