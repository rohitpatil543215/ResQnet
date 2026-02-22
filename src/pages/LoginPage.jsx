import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email || !password) return toast.error('All fields required');
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <motion.div className="auth-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Logo */}
                <div className="auth-logo">
                    <div className="nav-logo nav-logo-lg"><Shield size={32} /></div>
                    <h1>Res<span className="text-accent">QNet</span></h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <Mail size={16} className="input-icon" />
                        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <Lock size={16} className="input-icon" />
                        <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <button type="submit" className="btn btn-red btn-full" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'} <ArrowRight size={16} />
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </motion.div>
        </div>
    );
}
