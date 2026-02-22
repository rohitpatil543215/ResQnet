import Emergency from '../models/Emergency.js';
import User from '../models/User.js';
import AnalyticsLog from '../models/AnalyticsLog.js';

// GET /api/analytics/dashboard
export async function getDashboardStats(req, res) {
    try {
        const totalEmergencies = await Emergency.countDocuments();
        const activeEmergencies = await Emergency.countDocuments({ status: { $in: ['active', 'assigned', 'in_progress'] } });
        const resolvedEmergencies = await Emergency.countDocuments({ status: 'resolved' });
        const falseAlarms = await Emergency.countDocuments({ status: 'false_alarm' });
        const totalUsers = await User.countDocuments();
        const totalVolunteers = await User.countDocuments({ role: { $in: ['doctor', 'nss_volunteer'] } });

        // Average response time
        const avgResponse = await Emergency.aggregate([
            { $match: { responseTime: { $ne: null } } },
            { $group: { _id: null, avg: { $avg: '$responseTime' } } },
        ]);

        // Severity distribution
        const severityDist = await Emergency.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]);

        // Recent emergencies for the map
        const recentEmergencies = await Emergency.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .select('location severity type status createdAt');

        // Heatmap data (all emergency locations)
        const heatmapData = await AnalyticsLog.find({ type: 'emergency_created' })
            .select('location createdAt')
            .sort({ createdAt: -1 })
            .limit(500);

        res.json({
            success: true,
            stats: {
                totalEmergencies,
                activeEmergencies,
                resolvedEmergencies,
                falseAlarms,
                totalUsers,
                totalVolunteers,
                avgResponseTime: avgResponse[0]?.avg ? Math.round(avgResponse[0].avg) : 0,
                severityDistribution: severityDist,
                recentEmergencies,
                heatmapData,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/analytics/trust-rankings
export async function getTrustRankings(req, res) {
    try {
        const rankings = await User.find({ role: { $ne: 'admin' } })
            .sort({ trustScore: -1 })
            .limit(20)
            .select('name role trustScore points rescues isVerified');
        res.json({ success: true, rankings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
