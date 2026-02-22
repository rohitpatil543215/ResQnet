import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, Droplets, ArrowRight, UserPlus, Stethoscope, HeartHandshake, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
    { value: 'citizen', label: 'Citizen', icon: User, color: '#3b82f6' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#22c55e' },
    { value: 'nss_volunteer', label: 'NSS Volunteer', icon: HeartHandshake, color: '#f59e0b' },
    { value: 'hospital', label: 'Hospital', icon: Building2, color: '#8b5cf6' },
];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'citizen', bloodGroup: '' });
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target?.value ?? e }));

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.phone) return toast.error('Fill all required fields');
        if (form.password.length < 6) return toast.error('Password must be 6+ characters');
        try {
            await register(form);
            toast.success('Account created!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <motion.div className="auth-container auth-container-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="auth-logo">
                    <div className="nav-logo nav-logo-lg"><Shield size={32} /></div>
                    <h1>Join Res<span className="text-accent">QNet</span></h1>
                    <p>Create your emergency network account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="input-group">
                            <User size={16} className="input-icon" />
                            <input placeholder="Full Name *" value={form.name} onChange={set('name')} />
                        </div>
                        <div className="input-group">
                            <Phone size={16} className="input-icon" />
                            <input placeholder="Phone *" value={form.phone} onChange={set('phone')} />
                        </div>
                    </div>
                    <div className="input-group">
                        <Mail size={16} className="input-icon" />
                        <input type="email" placeholder="Email *" value={form.email} onChange={set('email')} />
                    </div>
                    <div className="input-group">
                        <Lock size={16} className="input-icon" />
                        <input type="password" placeholder="Password * (min 6 chars)" value={form.password} onChange={set('password')} />
                    </div>

                    {/* Role selection */}
                    <label className="form-label">Select Role</label>
                    <div className="role-grid">
                        {ROLES.map((r) => (
                            <button key={r.value} type="button"
                                className={`role-btn ${form.role === r.value ? 'role-btn-active' : ''}`}
                                style={{ '--role-color': r.color }}
                                onClick={() => setForm((p) => ({ ...p, role: r.value }))}>
                                <r.icon size={20} /><span>{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Blood group */}
                    <label className="form-label">Blood Group</label>
                    <div className="blood-grid">
                        {BLOOD_GROUPS.map((bg) => (
                            <button key={bg} type="button"
                                className={`blood-btn ${form.bloodGroup === bg ? 'blood-btn-active' : ''}`}
                                onClick={() => setForm((p) => ({ ...p, bloodGroup: bg }))}>
                                {bg}
                            </button>
                        ))}
                    </div>

                    <button type="submit" className="btn btn-red btn-full" disabled={loading}>
                        {loading ? 'Creating…' : 'Create Account'} <ArrowRight size={16} />
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
}
