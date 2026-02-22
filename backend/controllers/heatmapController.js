// Controller for emergency heatmap data
import Emergency from '../models/Emergency.js';

// GET /api/heatmap — Returns [{lat, lng}] for heatmap layer
export async function getHeatmapData(req, res) {
    try {
        const { period = 'all' } = req.query;
        const query = {};

        // Time-range filters
        const now = new Date();
        if (period === 'hour') {
            query.createdAt = { $gte: new Date(now - 60 * 60 * 1000) };
        } else if (period === '24h') {
            query.createdAt = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
        } else if (period === 'week') {
            query.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        }
        // 'all' — no filter

        const emergencies = await Emergency.find(query)
            .select('location severity createdAt')
            .lean();

        // Transform to heatmap format: [{lat, lng, weight}]
        const points = emergencies
            .filter((e) => e.location?.coordinates?.length === 2)
            .map((e) => ({
                lat: e.location.coordinates[1],
                lng: e.location.coordinates[0],
                // Weight by severity for visual emphasis
                weight: e.severity === 'critical' ? 3 : e.severity === 'moderate' ? 2 : 1,
            }));

        res.json({
            success: true,
            count: points.length,
            period,
            points,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
