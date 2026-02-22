import Hospital from '../models/Hospital.js';

// GET /api/hospitals?lat=19.07&lng=72.87&radius=10&type=hospital
export async function getNearbyHospitals(req, res) {
    try {
        const { lat, lng, radius = 10, type } = req.query;
        const query = { isActive: true };
        if (type) query.type = type;

        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000,
                },
            };
        }

        const hospitals = await Hospital.find(query).limit(20);
        res.json({ success: true, hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// GET /api/hospitals/:id
export async function getHospital(req, res) {
    try {
        const hospital = await Hospital.findById(req.params.id).populate('managedBy', 'name email');
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found.' });
        res.json({ success: true, hospital });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// POST /api/hospitals (Admin only)
export async function createHospital(req, res) {
    try {
        const { name, phone, address, lat, lng, type, services, bedsAvailable } = req.body;
        const hospital = await Hospital.create({
            name, phone, address, type,
            services: services || [],
            bedsAvailable: bedsAvailable || 0,
            location: { type: 'Point', coordinates: [lng, lat] },
        });
        res.status(201).json({ success: true, hospital });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
