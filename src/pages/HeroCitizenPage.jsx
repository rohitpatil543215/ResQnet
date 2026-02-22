import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../api/client';
import { Flame, Crown, Star, Heart, Shield, Clock, Zap, Award, BadgeCheck, HeartHandshake, Sparkles, TrendingUp, Calendar } from 'lucide-react';

const TYPE_LABELS = {
    road_accident: '🚗 Road Accident',
    medical: '🏥 Medical',
    fire: '🔥 Fire',
    natural_disaster: '🌊 Disaster',
    violence: '⚠️ Violence',
    other: '🆘 Other',
};

const PERIOD_TABS = [
    { key: 'today', label: 'Today', icon: Flame },
    { key: 'week', label: 'This Week', icon: Calendar },
    { key: 'month', label: 'This Month', icon: TrendingUp },
];

function HeroBadge({ rank }) {
    if (rank === 0) return <span className="hero-rank-badge hero-rank-gold"><Crown size={14} /> Hero of the Day</span>;
    if (rank === 1) return <span className="hero-rank-badge hero-rank-silver"><Star size={14} /> Silver Hero</span>;
    if (rank === 2) return <span className="hero-rank-badge hero-rank-bronze"><Award size={14} /> Bronze Hero</span>;
    return <span className="hero-rank-badge hero-rank-default"><HeartHandshake size={14} /> Helper</span>;
}

export default function HeroCitizenPage() {
    const [heroes, setHeroes] = useState([]);
    const [allTimeHero, setAllTimeHero] = useState(null);
    const [stats, setStats] = useState({ totalHelps: 0, totalResolved: 0, uniqueHeroes: 0 });
    const [period, setPeriod] = useState('today');
    const [loading, setLoading] = useState(true);
    const [expandedHero, setExpandedHero] = useState(null);

    useEffect(() => {
        async function fetchHeroes() {
            setLoading(true);
            try {
                const res = await userAPI.getHeroes({ period });
                setHeroes(res.data.heroes || []);
                setAllTimeHero(res.data.allTimeHero || null);
                setStats(res.data.stats || { totalHelps: 0, totalResolved: 0, uniqueHeroes: 0 });
            } catch {
                setHeroes([]);
            } finally { setLoading(false); }
        }
        fetchHeroes();
    }, [period]);

    const topHero = heroes.length > 0 ? heroes[0] : null;

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <motion.div className="greeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="hero-page-badge">
                        <Sparkles size={16} />
                        <span>Recognition Wall</span>
                    </div>
                    <h2 className="greeting-name">Daily Hero Citizens</h2>
                    <p className="greeting-sub">Recognizing those who make a difference</p>
                </motion.div>

                {/* Period tabs */}
                <motion.div className="hero-period-tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    {PERIOD_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`hero-period-tab ${period === tab.key ? 'hero-period-tab-active' : ''}`}
                            onClick={() => setPeriod(tab.key)}
                        >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Stats row */}
                <motion.div className="stat-row stat-row-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-amber"><Zap size={18} /></div>
                        <p className="stat-big text-amber">{stats.totalHelps}</p>
                        <p className="stat-label">Helps Given</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-green"><Shield size={18} /></div>
                        <p className="stat-big text-green">{stats.totalResolved}</p>
                        <p className="stat-label">Resolved</p>
                    </div>
                    <div className="stat-card stat-card-center">
                        <div className="stat-icon stat-icon-blue"><Heart size={18} /></div>
                        <p className="stat-big text-blue">{stats.uniqueHeroes}</p>
                        <p className="stat-label">Heroes</p>
                    </div>
                </motion.div>

                {/* Featured Hero of the Day */}
                {topHero && (
                    <motion.div
                        className="hero-spotlight"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="hero-spotlight-glow" />
                        <div className="hero-spotlight-content">
                            <div className="hero-spotlight-crown">
                                <Crown size={24} />
                            </div>
                            <div className="hero-spotlight-avatar">
                                {topHero.user.profilePhoto ? (
                                    <img src={topHero.user.profilePhoto} alt={topHero.user.name} />
                                ) : (
                                    <span>{topHero.user.name?.charAt(0)?.toUpperCase()}</span>
                                )}
                            </div>
                            <h3 className="hero-spotlight-name">
                                {topHero.user.name}
                                {topHero.user.isVerified && <BadgeCheck size={16} className="text-blue" />}
                            </h3>
                            <p className="hero-spotlight-role">{topHero.user.profession || topHero.user.role?.replace('_', ' ')}</p>
                            <div className="hero-spotlight-stats">
                                <div className="hero-spotlight-stat">
                                    <Zap size={14} />
                                    <span><strong>{topHero.helpCount}</strong> helps {period === 'today' ? 'today' : period === 'week' ? 'this week' : 'this month'}</span>
                                </div>
                                <div className="hero-spotlight-stat">
                                    <Shield size={14} />
                                    <span>Trust: <strong>{topHero.user.trustScore}</strong></span>
                                </div>
                                {topHero.fastestResponse && (
                                    <div className="hero-spotlight-stat">
                                        <Clock size={14} />
                                        <span>Fastest: <strong>{topHero.fastestResponse}s</strong></span>
                                    </div>
                                )}
                            </div>
                            <div className="hero-spotlight-types">
                                {topHero.emergencyTypes.map((t) => (
                                    <span key={t} className="hero-type-badge">{TYPE_LABELS[t] || t}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Heroes list */}
                {loading ? (
                    <div className="loading-spinner" />
                ) : heroes.length === 0 ? (
                    <motion.div className="card card-center-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <HeartHandshake size={48} className="text-muted" style={{ opacity: 0.5 }} />
                        <p className="fw-600">No heroes yet {period === 'today' ? 'today' : period === 'week' ? 'this week' : 'this month'}</p>
                        <p className="text-sm text-muted">Be the first to respond to an emergency and get recognized!</p>
                    </motion.div>
                ) : (
                    <div className="hero-list">
                        <div className="section-header">
                            <Award size={14} className="text-amber" />
                            <span>All Heroes</span>
                            <span className="badge badge-amber">{heroes.length}</span>
                        </div>
                        <AnimatePresence>
                            {heroes.map((hero, i) => (
                                <motion.div
                                    key={hero.user._id}
                                    className={`hero-card ${i === 0 ? 'hero-card-featured' : ''}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + i * 0.06 }}
                                    onClick={() => setExpandedHero(expandedHero === hero.user._id ? null : hero.user._id)}
                                >
                                    <div className="hero-card-main">
                                        <div className="hero-card-rank">
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                        </div>
                                        <div className="hero-card-avatar">
                                            {hero.user.profilePhoto ? (
                                                <img src={hero.user.profilePhoto} alt={hero.user.name} />
                                            ) : (
                                                <span>{hero.user.name?.charAt(0)?.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="hero-card-info">
                                            <div className="hero-card-name">
                                                {hero.user.name}
                                                {hero.user.isVerified && <BadgeCheck size={12} className="text-blue" />}
                                            </div>
                                            <div className="hero-card-meta">
                                                <span className="capitalize">{hero.user.role?.replace('_', ' ')}</span>
                                                <span>•</span>
                                                <HeroBadge rank={i} />
                                            </div>
                                        </div>
                                        <div className="hero-card-score">
                                            <span className="hero-card-helps">{hero.helpCount}</span>
                                            <span className="hero-card-helps-label">helps</span>
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    <AnimatePresence>
                                        {expandedHero === hero.user._id && (
                                            <motion.div
                                                className="hero-card-details"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="hero-detail-grid">
                                                    <div className="hero-detail-item">
                                                        <Shield size={14} />
                                                        <span>Trust: {hero.user.trustScore}</span>
                                                    </div>
                                                    <div className="hero-detail-item">
                                                        <Star size={14} />
                                                        <span>Points: {hero.user.points}</span>
                                                    </div>
                                                    <div className="hero-detail-item">
                                                        <Heart size={14} />
                                                        <span>Total Rescues: {hero.user.rescues}</span>
                                                    </div>
                                                    {hero.fastestResponse && (
                                                        <div className="hero-detail-item">
                                                            <Clock size={14} />
                                                            <span>Fastest: {hero.fastestResponse}s</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="hero-detail-types">
                                                    {hero.emergencyTypes.map((t) => (
                                                        <span key={t} className="hero-type-badge">{TYPE_LABELS[t] || t}</span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* All-time hero */}
                {allTimeHero && (
                    <motion.div className="hero-alltime" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <div className="hero-alltime-header">
                            <Flame size={16} />
                            <span>All-Time Legend</span>
                        </div>
                        <div className="hero-alltime-content">
                            <div className="hero-alltime-avatar">
                                <span>{allTimeHero.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="hero-alltime-info">
                                <p className="hero-alltime-name">
                                    {allTimeHero.name}
                                    {allTimeHero.isVerified && <BadgeCheck size={14} className="text-blue" />}
                                </p>
                                <p className="hero-alltime-meta capitalize">{allTimeHero.role?.replace('_', ' ')} • {allTimeHero.rescues} total rescues • {allTimeHero.points} points</p>
                            </div>
                            <div className="hero-alltime-score">
                                <Crown size={18} className="text-amber" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Motivational footer */}
                <motion.div className="hero-motivation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Sparkles size={16} className="text-amber" />
                    <p>Every help you give earns you <strong className="text-accent">recognition</strong> and <strong className="text-amber">10 points</strong>. Respond to emergencies to become today's Hero Citizen!</p>
                </motion.div>
            </div>
        </div>
    );
}
