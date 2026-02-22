import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true },
    role: {
        type: String,
        enum: ['citizen', 'doctor', 'nss_volunteer', 'hospital', 'admin', 'traffic'],
        default: 'citizen',
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: '',
    },
    address: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    profession: { type: String, default: '' },
    age: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    emergencyContacts: [{
        name: String,
        phone: String,
        relation: String,
    }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    points: { type: Number, default: 0 },
    rescues: { type: Number, default: 0 },
    fcmToken: { type: String, default: '' },
    darkMode: { type: Boolean, default: true },
}, { timestamps: true });

// Geo index for location queries
userSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.model('User', userSchema);
