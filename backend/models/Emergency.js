import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['road_accident', 'medical', 'fire', 'natural_disaster', 'violence', 'other'],
        default: 'other',
    },
    severity: {
        type: String,
        enum: ['minor', 'moderate', 'critical'],
        default: 'moderate',
    },
    status: {
        type: String,
        enum: ['active', 'assigned', 'in_progress', 'resolved', 'false_alarm'],
        default: 'active',
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
        address: { type: String, default: '' },
    },
    description: { type: String, default: '' },
    bloodRequired: { type: String, default: '' },
    currentRadius: { type: Number, default: 0.5 }, // km
    radiusLevel: { type: Number, default: 0 }, // 0=0.5km, 1=2km, 2=5km, 3=10km

    // Media
    images: [{ type: String }],
    streamUrl: { type: String, default: '' },

    // Helpers
    helpers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['en_route', 'arrived', 'helping'], default: 'en_route' },
        eta: { type: Number, default: 0 }, // minutes
        distance: { type: Number, default: 0 }, // km
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        joinedAt: { type: Date, default: Date.now },
    }],

    // Assigned primary responder
    assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Authorities notified
    authoritiesNotified: { type: Boolean, default: false },
    hospitalNotified: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },

    // First aid
    firstAidProvided: { type: Boolean, default: false },

    resolvedAt: { type: Date, default: null },
    responseTime: { type: Number, default: null }, // seconds from creation to first helper
}, { timestamps: true });

// Geo index
emergencySchema.index({ location: '2dsphere' });
emergencySchema.index({ status: 1 });
emergencySchema.index({ createdAt: -1 });

export default mongoose.model('Emergency', emergencySchema);
