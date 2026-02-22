import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
}

// POST /api/auth/register
export async function register(req, res) {
    try {
        const { name, email, password, phone, role, bloodGroup } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const user = await User.create({
            name, email, password, phone,
            role: role || 'citizen',
            bloodGroup: bloodGroup || '',
        });

        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                bloodGroup: user.bloodGroup,
                isAvailable: user.isAvailable,
                trustScore: user.trustScore,
                points: user.points,
                rescues: user.rescues,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// POST /api/auth/login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = signToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                bloodGroup: user.bloodGroup,
                address: user.address,
                profilePhoto: user.profilePhoto,
                isAvailable: user.isAvailable,
                isVerified: user.isVerified,
                trustScore: user.trustScore,
                points: user.points,
                rescues: user.rescues,
                emergencyContacts: user.emergencyContacts,
                location: user.location,
                darkMode: user.darkMode,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/auth/me
export async function getMe(req, res) {
    res.json({ success: true, user: req.user });
}
