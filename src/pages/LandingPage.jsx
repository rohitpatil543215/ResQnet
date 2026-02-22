import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, MapPin, Users, Heart, Clock, ArrowRight, Radio } from 'lucide-react';

const features = [
    { icon: Zap, title: 'Instant SOS', desc: 'One tap sends alert to every nearby volunteer within seconds', color: '#ef4444' },
    { icon: Radio, title: 'Smart Radius', desc: 'Auto-expands search from 0.5km → 10km until help arrives', color: '#f59e0b' },
    { icon: MapPin, title: 'Live Tracking', desc: 'Real-time GPS tracking of helpers navigating to you', color: '#3b82f6' },
    { icon: Heart, title: 'Blood Match', desc: 'Priority alerts to matching blood group donors nearby', color: '#ec4899' },
    { icon: Users, title: 'Community Power', desc: 'Doctors, NSS volunteers & citizens — all on one network', color: '#22c55e' },
    { icon: Clock, title: 'AI Severity', desc: 'Auto-classifies emergency severity for faster escalation', color: '#8b5cf6' },
];

const stats = [
    { value: '< 30s', label: 'Avg Response' },
    { value: '10km', label: 'Max Radius' },
    { value: '5', label: 'User Roles' },
    { value: '24/7', label: 'Always On' },
];

export default function LandingPage() {
    return (
        <div className="landing">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" />
                <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="hero-badge">
                        <Shield size={14} /> Emergency Response Network
                    </div>
                    <h1 className="hero-title">
                        Every Second<br />
                        <span className="text-accent">Saves a Life</span>
                    </h1>
                    <p className="hero-subtitle">
                        ResQNet connects citizens, doctors & volunteers in real-time during emergencies.
                        When you press SOS, nearby helpers are alerted instantly.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-red btn-lg">
                            Join ResQNet <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-ghost btn-lg">
                            Sign In
                        </Link>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div className="hero-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                    {stats.map((s) => (
                        <div key={s.label} className="hero-stat">
                            <span className="hero-stat-value">{s.value}</span>
                            <span className="hero-stat-label">{s.label}</span>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Features */}
            <section className="features-section">
                <motion.h2 className="section-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    How ResQNet Works
                </motion.h2>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <motion.div key={f.title} className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                            <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                                <f.icon size={24} />
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <motion.div className="cta-card" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                    <h2>Ready to Make a Difference?</h2>
                    <p>Join thousands of citizens and volunteers on the ResQNet emergency network.</p>
                    <Link to="/register" className="btn btn-red btn-lg">
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="nav-brand">
                        <div className="nav-logo"><Shield size={16} /></div>
                        <span className="nav-title">Res<span className="text-accent">QNet</span></span>
                    </div>
                    <p>ResQNet activates nearby citizens before official responders arrive.</p>
                    <p className="landing-copy">© {new Date().getFullYear()} ResQNet — Emergency Response Network</p>
                </div>
            </footer>
        </div>
    );
}
