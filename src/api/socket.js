import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://resqnet-ggxs.onrender.com';

let socket = null;

export function connectSocket(userId) {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        if (userId) socket.emit('join', userId);
    });
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) { socket.disconnect(); socket = null; }
}
