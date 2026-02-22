import Emergency from '../models/Emergency.js';
import User from '../models/User.js';
import AnalyticsLog from '../models/AnalyticsLog.js';
import { getIO } from '../config/socket.js';
import { classifySeverity, getFirstAidInstructions } from '../services/aiService.js';
import { sendEmergencySMS } from '../services/smsService.js';
import { haversineDistance } from '../utils/haversine.js';

// Priority notification tiers — who gets alerted first
const PRIORITY_TIERS = [
    { keywords: ['doctor', 'surgeon', 'cardiologist', 'nurse', 'paramedic', 'emt'], roles: ['doctor'], delayMs: 0, label: 'Medical' },
    { keywords: ['firefighter', 'fire fighter', 'fire brigade'], roles: [], delayMs: 5000, label: 'Fire' },
    { keywords: ['police', 'police officer'], roles: ['traffic'], delayMs: 10000, label: 'Police' },
    { keywords: [], roles: [], delayMs: 15000, label: 'All Citizens' },
];

// POST /api/emergencies
export async function createEmergency(req, res) {
    try {
        const { lat, lng, type, severity: userSeverity, description, bloodRequired, images } = req.body;

        if (lat == null || lng == null) {
            return res.status(400).json({ success: false, message: 'Location (lat, lng) is required.' });
        }

        // Use user-chosen severity if valid, else AI classifies
        const validSeverities = ['minor', 'moderate', 'critical'];
        const severity = validSeverities.includes(userSeverity)
            ? userSeverity
            : classifySeverity(type || 'other', description || '');

        const emergency = await Emergency.create({
            creator: req.user._id,
            type: type || 'other',
            severity,
            description: description || '',
            bloodRequired: bloodRequired || '',
            images: images || [],
            location: { type: 'Point', coordinates: [lng, lat] },
            currentRadius: 0.5,
            radiusLevel: 0,
        });

        await AnalyticsLog.create({
            type: 'emergency_created',
            emergency: emergency._id,
            user: req.user._id,
            location: emergency.location,
            metadata: { severity, emergencyType: type },
        });

        if (severity === 'critical') {
            emergency.authoritiesNotified = true;
            await emergency.save();
        }

        // === PRIORITY NOTIFICATION SYSTEM ===
        try {
            const io = getIO();

            // Find all available users within 10km
            const nearbyUsers = await User.find({
                _id: { $ne: req.user._id },
                isAvailable: true,
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [lng, lat] },
                        $maxDistance: 10000,
                    },
                },
            }).select('_id role profession bloodGroup location').lean();

            // Add distance to each user
            const usersWithDist = nearbyUsers.map(u => ({
                ...u,
                dist: haversineDistance(lat, lng, u.location.coordinates[1], u.location.coordinates[0]),
                prof: (u.profession || '').toLowerCase(),
            }));

            const emgPayload = {
                _id: emergency._id,
                type: emergency.type,
                severity,
                location: { lat, lng },
                currentRadius: emergency.currentRadius,
                bloodRequired: emergency.bloodRequired,
                description: emergency.description,
                createdAt: emergency.createdAt,
                creatorName: req.user.name,
            };

            // Broadcast to all (generic alert)
            io.emit('emergency:new', emgPayload);
            io.to('traffic-dashboard').emit('emergencyBroadcast', emgPayload);

            // Tiered priority alerts within 500m first
            const within500m = usersWithDist.filter(u => u.dist <= 0.5);
            for (const tier of PRIORITY_TIERS) {
                setTimeout(() => {
                    const targets = tier.keywords.length === 0 && tier.roles.length === 0
                        ? within500m // last tier = everyone
                        : within500m.filter(u =>
                            tier.keywords.some(k => u.prof.includes(k)) ||
                            tier.roles.includes(u.role)
                        );
                    targets.forEach(u => {
                        io.to(u._id.toString()).emit('emergency:priority', {
                            ...emgPayload, priorityTier: tier.label,
                            distance: Math.round(u.dist * 100) / 100,
                        });
                    });
                }, tier.delayMs);
            }

            // Blood group specific alert
            if (bloodRequired) {
                const bloodMatches = usersWithDist.filter(u => u.bloodGroup === bloodRequired);
                bloodMatches.forEach(u => {
                    io.to(u._id.toString()).emit('emergency:blood', {
                        ...emgPayload,
                        matchedBloodGroup: bloodRequired,
                        distance: Math.round(u.dist * 100) / 100,
                    });
                });
            }

            // Wider radius waves
            const widerWaves = [
                { max: 2, delay: 20000 },
                { max: 5, delay: 40000 },
                { max: 10, delay: 60000 },
            ];
            for (const wave of widerWaves) {
                const users = usersWithDist.filter(u => u.dist > (wave.max === 2 ? 0.5 : wave.max === 5 ? 2 : 5) && u.dist <= wave.max);
                setTimeout(() => {
                    users.forEach(u => {
                        io.to(u._id.toString()).emit('emergency:priority', {
                            ...emgPayload, priorityTier: `Radius ${wave.max}km`,
                            distance: Math.round(u.dist * 100) / 100,
                        });
                    });
                }, wave.delay);
            }
        } catch (se) {
            console.error('Socket notification error:', se.message);
        }

        const populated = await Emergency.findById(emergency._id).populate('creator', 'name phone bloodGroup');
        res.status(201).json({ success: true, emergency: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/emergencies
export async function getEmergencies(req, res) {
    try {
        const { status = 'active', lat, lng, radius = 10 } = req.query;
        const query = {};
        if (status === 'all') { /* admin */ } else { query.status = { $in: status.split(',') }; }
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000,
                },
            };
        }
        const emergencies = await Emergency.find(query)
            .populate('creator', 'name phone bloodGroup profilePhoto')
            .populate('helpers.user', 'name phone role profession bloodGroup trustScore isVerified')
            .populate('assignedResponder', 'name phone role profession')
            .sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, emergencies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/emergencies/:id
export async function getEmergency(req, res) {
    try {
        const emergency = await Emergency.findById(req.params.id)
            .populate('creator', 'name phone bloodGroup profilePhoto emergencyContacts')
            .populate('helpers.user', 'name phone role profilePhoto profession bloodGroup trustScore isVerified')
            .populate('assignedResponder', 'name phone role profilePhoto profession bloodGroup trustScore isVerified');
        if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found.' });
        res.json({ success: true, emergency });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/emergencies/:id/help
export async function helpEmergency(req, res) {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found.' });

        const alreadyHelping = emergency.helpers.find(h => h.user.toString() === req.user._id.toString());
        if (alreadyHelping) return res.status(400).json({ success: false, message: 'Already responding.' });

        const { lat, lng } = req.body;
        if (lat == null || lng == null) return res.status(400).json({ success: false, message: 'Your location is required to help.' });

        const [eLng, eLat] = emergency.location.coordinates;
        const distKm = haversineDistance(lat, lng, eLat, eLng);

        if (distKm > 10) {
            return res.status(400).json({ success: false, message: `You are ${distKm.toFixed(1)} km away. Only helpers within 10 km can respond.` });
        }

        const etaMinutes = Math.max(1, Math.round((distKm / 30) * 60) + 2);

        emergency.helpers.push({
            user: req.user._id, status: 'en_route',
            eta: etaMinutes, distance: Math.round(distKm * 100) / 100,
            location: { type: 'Point', coordinates: [lng, lat] },
        });

        if (!emergency.assignedResponder) {
            emergency.assignedResponder = req.user._id;
            emergency.status = 'assigned';
            emergency.responseTime = Math.floor((Date.now() - emergency.createdAt) / 1000);
        } else if (emergency.status === 'active') {
            emergency.status = 'in_progress';
        }

        await emergency.save();

        await AnalyticsLog.create({
            type: 'helper_joined', emergency: emergency._id, user: req.user._id,
            location: { type: 'Point', coordinates: [lng, lat] }, responseTime: emergency.responseTime,
        });

        try {
            const io = getIO();
            io.to(emergency._id.toString()).emit('emergency:updated', { helpers: emergency.helpers.length, status: emergency.status });
            io.to(emergency.creator.toString()).emit('helper:accepted', { helperId: req.user._id, name: req.user.name, profession: req.user.profession, eta: etaMinutes, distance: distKm.toFixed(1) });
        } catch { }

        const populated = await Emergency.findById(emergency._id)
            .populate('helpers.user', 'name phone role profession bloodGroup trustScore isVerified')
            .populate('creator', 'name phone bloodGroup');
        res.json({ success: true, emergency: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/emergencies/:id/resolve
export async function resolveEmergency(req, res) {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found.' });

        emergency.status = 'resolved';
        emergency.resolvedAt = new Date();
        await emergency.save();

        for (const helper of emergency.helpers) {
            await User.findByIdAndUpdate(helper.user, { $inc: { points: 10, rescues: 1, trustScore: 2 } });
        }

        await AnalyticsLog.create({ type: 'emergency_resolved', emergency: emergency._id, user: req.user._id, responseTime: emergency.responseTime });

        try {
            const io = getIO();
            io.to(emergency._id.toString()).emit('emergency:resolved', { _id: emergency._id });
            io.to('traffic-dashboard').emit('emergencyClosed', { emergencyId: emergency._id });
        } catch { }

        res.json({ success: true, message: 'Emergency resolved. Points awarded.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/emergencies/:id/images — Add images to an existing emergency
export async function addImages(req, res) {
    try {
        const { images } = req.body;
        if (!images || !images.length) return res.status(400).json({ success: false, message: 'No images provided.' });

        const emergency = await Emergency.findByIdAndUpdate(
            req.params.id,
            { $push: { images: { $each: images } } },
            { new: true }
        );
        if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found.' });

        try {
            const io = getIO();
            io.to(emergency._id.toString()).emit('emergency:updated', { images: emergency.images });
        } catch { }

        res.json({ success: true, images: emergency.images });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/emergencies/:id/radius
export async function expandRadius(req, res) {
    try {
        const { radius, radiusLevel } = req.body;
        const emergency = await Emergency.findByIdAndUpdate(req.params.id, { currentRadius: radius, radiusLevel }, { new: true });
        try { const io = getIO(); io.emit('emergency:radius', { _id: emergency._id, currentRadius: radius, radiusLevel }); } catch { }
        res.json({ success: true, emergency });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// PUT /api/emergencies/:id/false-alarm
export async function markFalseAlarm(req, res) {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) return res.status(404).json({ success: false, message: 'Not found.' });
        emergency.status = 'false_alarm';
        await emergency.save();
        await User.findByIdAndUpdate(emergency.creator, { $inc: { trustScore: -5 } });
        await AnalyticsLog.create({ type: 'false_alarm', emergency: emergency._id, user: emergency.creator });
        res.json({ success: true, message: 'Marked as false alarm.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/emergencies/:id/first-aid
export async function getFirstAid(req, res) {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) return res.status(404).json({ success: false, message: 'Not found.' });
        res.json({ success: true, type: emergency.type, instructions: getFirstAidInstructions(emergency.type) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// POST /api/emergencies/offline-sos
export async function offlineSOS(req, res) {
    try {
        const { lat, lng } = req.body;
        const result = await sendEmergencySMS(req.user, { lat, lng });
        await AnalyticsLog.create({ type: 'sms_sent', user: req.user._id, location: { type: 'Point', coordinates: [lng, lat] } });
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
