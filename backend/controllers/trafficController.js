// Controller for traffic police dashboard data
import Emergency from '../models/Emergency.js';
import HelperLocation from '../models/HelperLocation.js';

// GET /api/traffic/active — All active emergencies + helper live locations
export async function getTrafficDashboard(req, res) {
    try {
        // Fetch all non-resolved emergencies
        const emergencies = await Emergency.find({
            status: { $in: ['active', 'assigned', 'in_progress'] },
        })
            .populate('creator', 'name phone')
            .populate('helpers.user', 'name phone role profession bloodGroup trustScore isVerified')
            .populate('assignedResponder', 'name phone role profession')
            .sort({ severity: -1, createdAt: -1 })
            .lean();

        // For each emergency, get latest helper locations
        const enriched = await Promise.all(
            emergencies.map(async (emg) => {
                const helperLocs = await HelperLocation.aggregate([
                    {
                        $match: {
                            emergencyId: emg._id,
                            timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // last 30 min
                        },
                    },
                    { $sort: { timestamp: -1 } },
                    {
                        $group: {
                            _id: '$helperId',
                            lat: { $first: '$lat' },
                            lng: { $first: '$lng' },
                            timestamp: { $first: '$timestamp' },
                        },
                    },
                ]);

                return {
                    ...emg,
                    victimLocation: emg.location?.coordinates
                        ? { lat: emg.location.coordinates[1], lng: emg.location.coordinates[0] }
                        : null,
                    helperLiveLocations: helperLocs,
                };
            })
        );

        res.json({ success: true, emergencies: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
