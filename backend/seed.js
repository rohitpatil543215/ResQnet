/**
 * ResQNet Database Seeder
 * Auto-called by server.js on startup if DB is empty
 * Standalone: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Emergency from './models/Emergency.js';
import Hospital from './models/Hospital.js';
import AnalyticsLog from './models/AnalyticsLog.js';

const MUMBAI = { lat: 19.076, lng: 72.8777 };
function roff(base, km = 3) { return base + (Math.random() - 0.5) * 2 * (km / 111); }

// Named demo users with specific professions for demo showcase
const DEMO_USERS = [
    { name: 'Aarav Sharma', email: 'aarav@resqnet.com', role: 'citizen', profession: 'Software Engineer', bloodGroup: 'A+', phone: '9800000001' },
    { name: 'Priya Patel', email: 'priya@resqnet.com', role: 'doctor', profession: 'Cardiologist', bloodGroup: 'B+', phone: '9800000002' },
    { name: 'Arjun Singh', email: 'arjun@resqnet.com', role: 'nss_volunteer', profession: 'NSS Volunteer', bloodGroup: 'O+', phone: '9800000003' },
    { name: 'Sneha Desai', email: 'sneha@resqnet.com', role: 'doctor', profession: 'Surgeon', bloodGroup: 'AB-', phone: '9800000004' },
    { name: 'Ravi Kumar', email: 'ravi@resqnet.com', role: 'citizen', profession: 'Firefighter', bloodGroup: 'O-', phone: '9800000005' },
    { name: 'Ananya Gupta', email: 'ananya@resqnet.com', role: 'citizen', profession: 'Nurse', bloodGroup: 'A-', phone: '9800000006' },
    { name: 'Vikram Joshi', email: 'vikram@resqnet.com', role: 'citizen', profession: 'Police Officer', bloodGroup: 'B-', phone: '9800000007' },
    { name: 'Meera Nair', email: 'meera@resqnet.com', role: 'citizen', profession: 'Teacher', bloodGroup: 'AB+', phone: '9800000008' },
    { name: 'Kiran Reddy', email: 'kiran@resqnet.com', role: 'nss_volunteer', profession: 'Paramedic', bloodGroup: 'O+', phone: '9800000009' },
    { name: 'Rohan Mehta', email: 'rohan@resqnet.com', role: 'citizen', profession: 'Student', bloodGroup: 'A+', phone: '9800000010' },
];

const HOSPITAL_DATA = [
    { name: 'Lilavati Hospital', phone: '022-26751000', address: 'Bandra West, Mumbai', type: 'hospital', services: ['emergency', 'icu', 'trauma', 'blood_bank'], bedsAvailable: 15 },
    { name: 'KEM Hospital', phone: '022-24136051', address: 'Parel, Mumbai', type: 'hospital', services: ['emergency', 'icu', 'trauma'], bedsAvailable: 30 },
    { name: 'Hinduja Hospital', phone: '022-24451515', address: 'Mahim, Mumbai', type: 'hospital', services: ['emergency', 'icu', 'blood_bank'], bedsAvailable: 20 },
    { name: 'Mumbai Fire Brigade HQ', phone: '101', address: 'Byculla, Mumbai', type: 'fire_department', services: ['fire_rescue'], bedsAvailable: 0 },
    { name: 'Ambulance Service Mumbai', phone: '108', address: 'Central Mumbai', type: 'ambulance', services: ['emergency_transport'], bedsAvailable: 0 },
];

async function seedData() {
    console.log('🌱 Seeding database...');

    // Admin
    await User.create({
        name: 'Admin ResQNet', email: 'admin@resqnet.com', password: 'admin123',
        phone: '9999999999', role: 'admin', bloodGroup: 'O+',
        isVerified: true, trustScore: 100, points: 500, rescues: 50,
        profession: 'System Administrator', address: 'Mumbai, Maharashtra',
        location: { type: 'Point', coordinates: [MUMBAI.lng, MUMBAI.lat] },
    });
    console.log('   👑 Admin:   admin@resqnet.com / admin123');

    // Traffic Police
    await User.create({
        name: 'Traffic Control Mumbai', email: 'traffic@resqnet.com', password: 'traffic123',
        phone: '9888888888', role: 'traffic', bloodGroup: 'O+',
        isVerified: true, trustScore: 100, points: 0,
        profession: 'Traffic Police', address: 'Traffic HQ, Mumbai',
        location: { type: 'Point', coordinates: [MUMBAI.lng, MUMBAI.lat] },
    });
    console.log('   🚔 Traffic: traffic@resqnet.com / traffic123');

    // Demo users
    for (const u of DEMO_USERS) {
        await User.create({
            ...u, password: 'pass123',
            isAvailable: true, isVerified: true,
            trustScore: 50 + Math.floor(Math.random() * 50),
            points: Math.floor(Math.random() * 100),
            rescues: Math.floor(Math.random() * 10),
            address: 'Mumbai, Maharashtra',
            location: { type: 'Point', coordinates: [roff(MUMBAI.lng, 4), roff(MUMBAI.lat, 4)] },
        });
    }
    console.log(`   👤 Created ${DEMO_USERS.length} demo users (password: pass123)`);

    // Hospitals
    for (const h of HOSPITAL_DATA) {
        await Hospital.create({ ...h, location: { type: 'Point', coordinates: [roff(MUMBAI.lng, 5), roff(MUMBAI.lat, 5)] } });
    }
    console.log(`   🏥 Created ${HOSPITAL_DATA.length} hospitals`);

    // NO emergencies — clean slate for demo
    console.log('   ✅ Zero emergencies — ready for live demo!');
    console.log('\n📧 Login credentials:');
    console.log('   admin@resqnet.com   / admin123');
    console.log('   traffic@resqnet.com / traffic123');
    DEMO_USERS.forEach(u => console.log(`   ${u.email.padEnd(22)} / pass123  (${u.profession})`));
    console.log('');
}

export async function autoSeed() {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            await seedData();
        } else {
            // Always clear emergencies on restart for clean demo
            await Emergency.deleteMany({});
            await AnalyticsLog.deleteMany({ type: { $in: ['emergency_created', 'emergency_resolved', 'helper_joined'] } });
            console.log('🧹 Cleared old emergencies — clean slate for demo.');
            console.log(`📊 Database has ${count} users.`);
        }
    } catch (error) {
        console.error('⚠️ Auto-seed error:', error.message);
    }
}

async function standaloneSeed() {
    try {
        const { default: connectDB } = await import('./config/db.js');
        await connectDB();
        console.log('🗑  Clearing all data...');
        await User.deleteMany({});
        await Emergency.deleteMany({});
        await Hospital.deleteMany({});
        await AnalyticsLog.deleteMany({});
        await seedData();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

if (process.argv[1]?.endsWith('seed.js')) standaloneSeed();
