import mongoose from 'mongoose';

const analyticsLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['emergency_created', 'emergency_resolved', 'helper_joined', 'false_alarm', 'sms_sent', 'authority_notified'],
        required: true,
    },
    emergency: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    responseTime: { type: Number, default: null }, // seconds
}, { timestamps: true });

analyticsLogSchema.index({ location: '2dsphere' });
analyticsLogSchema.index({ type: 1 });
analyticsLogSchema.index({ createdAt: -1 });

export default mongoose.model('AnalyticsLog', analyticsLogSchema);
