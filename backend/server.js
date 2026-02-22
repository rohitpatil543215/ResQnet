import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { getFirstAidInstructions } from './services/aiService.js';
import { autoSeed } from './seed.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import emergencyRoutes from './routes/emergencies.js';
import hospitalRoutes from './routes/hospitals.js';
import analyticsRoutes from './routes/analytics.js';
// New feature routes
import helperLocationRoutes from './routes/helperLocations.js';
import heatmapRoutes from './routes/heatmap.js';
import trafficRoutes from './routes/traffic.js';

const app = express();
const httpServer = createServer(app);

// CORS — allow frontend origins
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow ALL Vercel preview/production URLs
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // In development, allow all
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/analytics', analyticsRoutes);
// New feature routes
app.use('/api/helper-locations', helperLocationRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/traffic', trafficRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'ResQNet API is running 🚨', timestamp: new Date(), env: process.env.NODE_ENV || 'development' });
});

// First-aid instructions (public, no auth)
app.get('/api/first-aid/:type', (req, res) => {
    const instructions = getFirstAidInstructions(req.params.type);
    res.json({ success: true, type: req.params.type, instructions });
});

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(err.status || 500).json({
        success: false,
        message: isDev ? err.message : 'Internal server error.',
        ...(isDev && { stack: err.stack }),
    });
});

// Start server
async function start() {
    await connectDB();
    initSocket(httpServer);
    await autoSeed();

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`\n🚨 ResQNet API running on port ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Health: http://localhost:${PORT}/api/health`);
        console.log(`\n📧 Demo credentials:`);
        console.log(`   Admin:   admin@resqnet.com / admin123`);
        console.log(`   Traffic: traffic@resqnet.com / traffic123`);
        console.log(`   Users:   aarav@resqnet.com / pass123 (and 9 more)\n`);
    });
}

start().catch((err) => {
    console.error('❌ Failed to start:', err);
    process.exit(1);
});
