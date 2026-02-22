import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { userAPI } from '../api/client';
import { User, Mail, Phone, MapPin, Droplets, Shield, Plus, Trash2, Save, Moon, Sun, BadgeCheck, Power, Radio } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [form, setForm] = useState({
        name: user.name || '', phone: user.phone || '', address: user.address || '',
        bloodGroup: user.bloodGroup || '', profession: user.profession || '',
        age: user.age || '', gender: user.gender || '',
        emergencyContacts: user.emergencyContacts || [],
    });
    const [saving, setSaving] = useState(false);
    const [isAvailable, setIsAvailable] = useState(user.isAvailable !== false);

    const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    function addContact() {
        setForm((p) => ({ ...p, emergencyContacts: [...p.emergencyContacts, { name: '', phone: '', relation: '' }] }));
    }
    function removeContact(i) {
        setForm((p) => ({ ...p, emergencyContacts: p.emergencyContacts.filter((_, j) => j !== i) }));
    }
    function updateContact(i, k, v) {
        setForm((p) => {
            const c = [...p.emergencyContacts];
            c[i] = { ...c[i], [k]: v };
            return { ...p, emergencyContacts: c };
        });
    }

    async function handleSave() {
        setSaving(true);
        try {
            await userAPI.updateProfile({ ...form, isAvailable });
            updateUser({ ...form, isAvailable });
            toast.success('Profile updated!');
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    }

    const BG = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="page">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Profile header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="greeting-name">{user.name}</h2>
                            <div className="greeting-role">
                                <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                                {user.isVerified && <BadgeCheck size={14} className="text-blue" />}
                            </div>
                            <div className="profile-meta">
                                <span>Trust: {user.trustScore}</span>
                                <span>Points: {user.points}</span>
                                <span>Rescues: {user.rescues}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Edit form */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="card-header"><User size={14} /><span>Personal Info</span></div>
                    <div className="form-stack">
                        <div className="input-group"><User size={16} className="input-icon" /><input placeholder="Name" value={form.name} onChange={set('name')} /></div>
                        <div className="input-group"><Mail size={16} className="input-icon" /><input value={user.email} disabled className="input-disabled" /></div>
                        <div className="input-group"><Phone size={16} className="input-icon" /><input placeholder="Phone" value={form.phone} onChange={set('phone')} /></div>
                        <div className="input-group"><MapPin size={16} className="input-icon" /><input placeholder="Address" value={form.address} onChange={set('address')} /></div>
                        <div className="input-group"><Shield size={16} className="input-icon" /><input placeholder="Profession (e.g. Doctor, Student)" value={form.profession} onChange={set('profession')} /></div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div className="input-group" style={{ flex: 1 }}><input type="number" placeholder="Age" value={form.age} onChange={set('age')} /></div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <select value={form.gender} onChange={set('gender')} style={{ background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.6rem 1rem', width: '100%', fontSize: '0.9rem' }}>
                                    <option value="">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <label className="form-label mt-4">Blood Group</label>
                    <div className="blood-grid">
                        {BG.map((b) => (
                            <button key={b} type="button" className={`blood-btn ${form.bloodGroup === b ? 'blood-btn-active' : ''}`}
                                onClick={() => setForm((p) => ({ ...p, bloodGroup: b }))}>{b}</button>
                        ))}
                    </div>
                </motion.div>

                {/* Emergency contacts */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="card-header"><Phone size={14} /><span>Emergency Contacts</span></div>
                    {form.emergencyContacts.map((c, i) => (
                        <div key={i} className="contact-row">
                            <input placeholder="Name" value={c.name} onChange={(e) => updateContact(i, 'name', e.target.value)} className="contact-input" />
                            <input placeholder="Phone" value={c.phone} onChange={(e) => updateContact(i, 'phone', e.target.value)} className="contact-input" />
                            <input placeholder="Relation" value={c.relation} onChange={(e) => updateContact(i, 'relation', e.target.value)} className="contact-input" />
                            <button className="btn btn-icon btn-ghost" onClick={() => removeContact(i)}><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={addContact}><Plus size={14} /> Add Contact</button>
                </motion.div>

                {/* Availability Toggle */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <div className={`stat-icon ${isAvailable ? 'stat-icon-green' : 'stat-icon-red'}`}>{isAvailable ? <Radio size={18} /> : <Power size={18} />}</div>
                            <div><p className="fw-600">{isAvailable ? 'Active' : 'Non-Active'}</p><p className="text-sm text-muted">{isAvailable ? 'You will receive emergency alerts' : 'You will NOT receive alerts'}</p></div>
                        </div>
                        <div className={`toggle-track ${isAvailable ? 'active' : ''}`} onClick={() => setIsAvailable(!isAvailable)}>
                            <div className="toggle-thumb" />
                        </div>
                    </div>
                </motion.div>

                {/* Theme */}
                <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <div className="stat-icon stat-icon-amber">{darkMode ? <Moon size={18} /> : <Sun size={18} />}</div>
                            <div><p className="fw-600">Dark Mode</p><p className="text-sm text-muted">{darkMode ? 'Enabled' : 'Disabled'}</p></div>
                        </div>
                        <div className={`toggle-track ${darkMode ? 'active' : ''}`} onClick={toggleDarkMode}>
                            <div className="toggle-thumb" />
                        </div>
                    </div>
                </motion.div>

                {/* Save */}
                <motion.button className="btn btn-red btn-full mt-4" onClick={handleSave} disabled={saving}
                    whileTap={{ scale: 0.97 }}>
                    <Save size={16} /> {saving ? 'Saving…' : 'Save Profile'}
                </motion.button>
            </div>
        </div>
    );
}
