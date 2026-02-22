import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userAPI } from '../api/client';
import { Trophy, Medal, Award, Heart, Star, BadgeCheck, Shield } from 'lucide-react';

const ICONS = [Trophy, Medal, Award, Heart, Star];
const COLORS = ['#f59e0b', '#94a3b8', '#cd7f32', '#ef4444', '#ec4899'];

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await userAPI.getLeaderboard();
                setLeaders(res.data.leaders || []);
            } catch {
                setLeaders([]);
            } finally { setLoading(false); }
        }
        fetch();
    }, []);

    return (
        <div className="page">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="greeting">
                    <h2 className="greeting-name">Leaderboard</h2>
                    <p className="greeting-sub">Top ResQNet Responders</p>
                </motion.div>

                {loading ? <div className="loading-spinner" /> : leaders.length === 0 ? (
                    <div className="card card-center-content">
                        <Trophy size={32} className="text-amber" />
                        <p className="fw-600">No responders yet</p>
                        <p className="text-sm text-muted">Be the first to help and earn points!</p>
                    </div>
                ) : (
                    <div className="leader-list">
                        {leaders.map((l, i) => {
                            const Icon = ICONS[Math.min(i, ICONS.length - 1)];
                            const color = COLORS[Math.min(i, COLORS.length - 1)];
                            return (
                                <motion.div key={l._id} className={`leader-card ${i === 0 ? 'leader-card-gold' : ''}`}
                                    initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                    <div className="leader-rank" style={{ background: `${color}15`, color }}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="leader-info">
                                        <div className="leader-name">
                                            {l.name}
                                            {i === 0 && <span className="leader-badge">#1</span>}
                                            {l.isVerified && <BadgeCheck size={14} className="text-blue" />}
                                        </div>
                                        <div className="leader-meta">
                                            <span className="capitalize">{l.role?.replace('_', ' ')}</span>
                                            <span>•</span>
                                            <span>{l.rescues} rescues</span>
                                            <span>•</span>
                                            <span><Shield size={10} /> {l.trustScore}</span>
                                        </div>
                                    </div>
                                    <div className="leader-points">
                                        <span className="leader-pts-value" style={{ color }}>{l.points}</span>
                                        <span className="leader-pts-label">PTS</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <motion.div className="card card-center-content mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <p className="text-sm">Earn <strong className="text-accent">10 points</strong> for every completed rescue</p>
                </motion.div>
            </div>
        </div>
    );
}
