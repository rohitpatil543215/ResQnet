import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
    const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ].filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // User joins their personal room
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`👤 User ${userId} joined room`);
        });

        // User updates their live location
        socket.on('location:update', (data) => {
            // { userId, lat, lng, emergencyId }
            socket.to(data.emergencyId).emit('helper:location', {
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
            });
        });

        // Helper joins an emergency room for live tracking
        socket.on('emergency:join', (emergencyId) => {
            socket.join(emergencyId);
            console.log(`🚨 Socket ${socket.id} joined emergency ${emergencyId}`);
        });

        // Emergency status broadcast
        socket.on('emergency:status', (data) => {
            io.to(data.emergencyId).emit('emergency:updated', data);
        });

        // ===== NEW SOCKET EVENTS (Feature 1, 2, 3) =====

        // Live helper location update — broadcasts to emergency room + traffic dashboard
        socket.on('helperLocationUpdate', (data) => {
            // data: { helperId, emergencyId, lat, lng }
            // Broadcast to everyone watching this emergency
            socket.to(data.emergencyId).emit('helperLocationUpdate', {
                helperId: data.helperId,
                lat: data.lat,
                lng: data.lng,
                timestamp: Date.now(),
            });
            // Also broadcast to traffic dashboard room
            io.to('traffic-dashboard').emit('helperLocationUpdate', {
                helperId: data.helperId,
                emergencyId: data.emergencyId,
                lat: data.lat,
                lng: data.lng,
                timestamp: Date.now(),
            });
        });

        // Emergency broadcast — notifies traffic dashboard of new emergencies
        socket.on('emergencyBroadcast', (data) => {
            // data: { emergencyId, type, severity, lat, lng }
            io.to('traffic-dashboard').emit('emergencyBroadcast', data);
        });

        // Emergency closed — notifies all watchers
        socket.on('emergencyClosed', (data) => {
            // data: { emergencyId }
            io.to(data.emergencyId).emit('emergencyClosed', data);
            io.to('traffic-dashboard').emit('emergencyClosed', data);
        });

        // Traffic dashboard room join
        socket.on('join:traffic', () => {
            socket.join('traffic-dashboard');
            console.log(`🚔 Socket ${socket.id} joined traffic-dashboard room`);
        });

        // ===== END NEW EVENTS =====

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
}
