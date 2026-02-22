import User from '../models/User.js';
import Emergency from '../models/Emergency.js';
import AnalyticsLog from '../models/AnalyticsLog.js';

// GET /api/users/profile
export async function getProfile(req, res) {
    res.json({ success: true, user: req.user });
}

// PUT /api/users/profile
export async function updateProfile(req, res) {
    try {
        const allowed = ['name', 'phone', 'bloodGroup', 'address', 'profilePhoto', 'profession', 'age', 'gender', 'emergencyContacts', 'isAvailable', 'darkMode', 'fcmToken'];
        const updates = {};
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/users/location
export async function updateLocation(req, res) {
    try {
        const { lat, lng } = req.body;
        if (lat == null || lng == null) {
            return res.status(400).json({ success: false, message: 'lat and lng are required.' });
        }

        await User.findByIdAndUpdate(req.user._id, {
            location: { type: 'Point', coordinates: [lng, lat] },
        });
        res.json({ success: true, message: 'Location updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/users/availability
export async function toggleAvailability(req, res) {
    try {
        const user = await User.findById(req.user._id);
        user.isAvailable = !user.isAvailable;
        await user.save();
        res.json({ success: true, isAvailable: user.isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/users/leaderboard
export async function getLeaderboard(req, res) {
    try {
        const leaders = await User.find({ role: { $ne: 'admin' }, points: { $gt: 0 } })
            .sort({ points: -1 })
            .limit(10)
            .select('name role points rescues trustScore profilePhoto isVerified');
        res.json({ success: true, leaders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/users/heroes — Daily Hero Citizens
export async function getDailyHeroes(req, res) {
    try {
        const { period = 'today' } = req.query;

        // Calculate time range
        const now = new Date();
        let startDate;
        if (period === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Today
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
        }

        // Find all helper_joined logs in the time range
        const helperLogs = await AnalyticsLog.find({
            type: 'helper_joined',
            createdAt: { $gte: startDate },
            user: { $ne: null },
        }).populate('user', 'name role bloodGroup profilePhoto trustScore points rescues isVerified profession')
            .populate('emergency', 'type severity status')
            .sort({ createdAt: -1 });

        // Group by user and aggregate their hero stats
        const heroMap = new Map();

        for (const log of helperLogs) {
            if (!log.user) continue;
            const uid = log.user._id.toString();

            if (!heroMap.has(uid)) {
                heroMap.set(uid, {
                    user: {
                        _id: log.user._id,
                        name: log.user.name,
                        role: log.user.role,
                        bloodGroup: log.user.bloodGroup,
                        profilePhoto: log.user.profilePhoto,
                        trustScore: log.user.trustScore,
                        points: log.user.points,
                        rescues: log.user.rescues,
                        isVerified: log.user.isVerified,
                        profession: log.user.profession,
                    },
                    helpCount: 0,
                    emergencyTypes: [],
                    fastestResponse: null,
                    latestHelpAt: log.createdAt,
                });
            }

            const hero = heroMap.get(uid);
            hero.helpCount += 1;

            if (log.emergency?.type && !hero.emergencyTypes.includes(log.emergency.type)) {
                hero.emergencyTypes.push(log.emergency.type);
            }

            if (log.responseTime && (hero.fastestResponse === null || log.responseTime < hero.fastestResponse)) {
                hero.fastestResponse = log.responseTime;
            }
        }

        // Convert to array, sort by helpCount (most helps first)
        const heroes = Array.from(heroMap.values())
            .sort((a, b) => b.helpCount - a.helpCount);

        // Also get all-time top hero (most rescues ever)
        const allTimeHero = await User.findOne({ role: { $ne: 'admin' }, rescues: { $gt: 0 } })
            .sort({ rescues: -1 })
            .select('name role rescues points trustScore profilePhoto isVerified profession');

        // Stats for the period
        const totalHelpsToday = helperLogs.length;
        const totalResolvedToday = await Emergency.countDocuments({
            status: 'resolved',
            resolvedAt: { $gte: startDate },
        });

        res.json({
            success: true,
            period,
            heroes,
            allTimeHero,
            stats: {
                totalHelps: totalHelpsToday,
                totalResolved: totalResolvedToday,
                uniqueHeroes: heroes.length,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/users/nearby-donors?bloodGroup=A+&lat=19.07&lng=72.87&radius=5
export async function getNearbyDonors(req, res) {
    try {
        const { bloodGroup, lat, lng, radius = 5 } = req.query;
        const query = {
            isAvailable: true,
            role: { $ne: 'hospital' },
        };
        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000,
                },
            };
        }

        const donors = await User.find(query)
            .limit(20)
            .select('name bloodGroup phone location role trustScore');
        res.json({ success: true, donors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
