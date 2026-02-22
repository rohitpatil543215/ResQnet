import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, Trophy, MapPin, User, LogOut, Sun, Moon, Menu, X, Activity, Heart, Flame } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!user) return null;

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/nearby', label: 'Nearby', icon: MapPin },
        { to: '/heroes', label: 'Heroes', icon: Flame },
        { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { to: '/profile', label: 'Profile', icon: User },
    ];
    if (user.role === 'admin') navItems.push({ to: '/admin', label: 'Admin', icon: Activity });
    // Heatmap for admin and traffic
    if (user.role === 'admin' || user.role === 'traffic') navItems.push({ to: '/admin/heatmap', label: 'Heatmap', icon: Flame });
    // Traffic dashboard
    if (user.role === 'traffic' || user.role === 'admin') navItems.push({ to: '/traffic-dashboard', label: 'Traffic', icon: Activity });

    return (
        <>
            <nav className="nav-glass">
                <div className="nav-inner">
                    <Link to="/dashboard" className="nav-brand">
                        <div className="nav-logo"><Shield size={18} /></div>
                        <span className="nav-title">Res<span className="text-accent">QNet</span></span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="nav-links-desktop">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to}
                                className={`nav-link ${location.pathname === to ? 'nav-link-active' : ''}`}>
                                <Icon size={14} /><span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="nav-right">
                        <button onClick={toggleDarkMode} className="nav-icon-btn" title="Toggle theme">
                            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button onClick={logout} className="nav-icon-btn nav-logout" title="Logout">
                            <LogOut size={16} />
                        </button>
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-mobile-btn">
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="nav-mobile-menu">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                                className={`nav-mobile-link ${location.pathname === to ? 'nav-link-active' : ''}`}>
                                <Icon size={16} /><span>{label}</span>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </nav>

            {/* Floating First Aid Chatbot Button */}
            <Link
                to="/first-aid"
                className="first-aid-fab"
                title="First Aid Chatbot"
                style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999,
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
                    fontSize: '1.2rem', transition: 'transform 0.2s',
                    textDecoration: 'none',
                    animation: location.pathname === '/first-aid' ? 'none' : 'pulse-ring 2s infinite',
                }}
            >
                <Heart size={22} />
            </Link>
        </>
    );
}
