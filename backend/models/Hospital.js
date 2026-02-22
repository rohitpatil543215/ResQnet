import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    type: {
        type: String,
        enum: ['hospital', 'ambulance', 'police', 'fire_department'],
        default: 'hospital',
    },
    services: [{ type: String }], // ['emergency', 'icu', 'trauma', 'blood_bank']
    bedsAvailable: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });

export default mongoose.model('Hospital', hospitalSchema);
