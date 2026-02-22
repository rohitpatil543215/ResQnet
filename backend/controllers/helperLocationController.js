// Controller for live helper location tracking
import mongoose from 'mongoose';
import HelperLocation from '../models/HelperLocation.js';
import Emergency from '../models/Emergency.js';

// POST /api/helper-locations — Save a location ping
export async function saveLocation(req, res) {
    try {
        const { emergencyId, lat, lng } = req.body;
        if (!emergencyId || lat == null || lng == null) {
            return res.status(400).json({ success: false, message: 'emergencyId, lat, lng required.' });
        }

        const loc = await HelperLocation.create({
            helperId: req.user._id,
            emergencyId,
            lat,
            lng,
        });

        // Also update the helper's location inside the Emergency.helpers array
        await Emergency.updateOne(
            { _id: emergencyId, 'helpers.user': req.user._id },
            {
                $set: {
                    'helpers.$.location': { type: 'Point', coordinates: [lng, lat] },
                },
            }
        );

        res.json({ success: true, location: loc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/helper-locations/:emergencyId — Get latest location for each helper
export async function getLatestLocations(req, res) {
    try {
        const { emergencyId } = req.params;

        // Aggregate to get the most recent location per helper
        const locations = await HelperLocation.aggregate([
            { $match: { emergencyId: new mongoose.Types.ObjectId(emergencyId) } },
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

        res.json({ success: true, locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/helper-locations/:emergencyId/:helperId/trail — Get location trail (polyline data)
export async function getHelperTrail(req, res) {
    try {
        const { emergencyId, helperId } = req.params;

        const trail = await HelperLocation.find({
            emergencyId,
            helperId,
        })
            .sort({ timestamp: 1 })
            .select('lat lng timestamp')
            .limit(500);

        res.json({ success: true, trail });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
