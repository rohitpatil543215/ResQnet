// HelperLocation — stores real-time GPS pings from helpers en route
import mongoose from 'mongoose';

const helperLocationSchema = new mongoose.Schema({
    helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency', required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

// Index for fast lookups by emergency + helper
helperLocationSchema.index({ emergencyId: 1, helperId: 1 });
// Index for time-range queries (heatmap)
helperLocationSchema.index({ timestamp: 1 });
// TTL — auto-delete entries older than 24 hours
helperLocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('HelperLocation', helperLocationSchema);
