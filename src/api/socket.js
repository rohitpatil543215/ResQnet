import { io } from 'socket.io-client';

const IS_PROD = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const SOCKET_URL = IS_PROD ? 'https://resqnet-ggxs.onrender.com' : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

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
