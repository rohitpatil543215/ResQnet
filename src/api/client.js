import axios from 'axios';

// Production: always use Render backend when deployed on Vercel
const IS_PROD = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const API_URL = IS_PROD ? 'https://resqnet-ggxs.onrender.com/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('resqnet_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle errors
api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Auto-redirect to login on 401 (expired/invalid token)
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('resqnet_token');
            localStorage.removeItem('resqnet_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== AUTH ==========
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// ========== USERS ==========
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    updateLocation: (lat, lng) => api.put('/users/location', { lat, lng }),
    toggleAvailability: () => api.put('/users/availability'),
    getLeaderboard: () => api.get('/users/leaderboard'),
    getHeroes: (params) => api.get('/users/heroes', { params }),
    getNearbyDonors: (params) => api.get('/users/nearby-donors', { params }),
};

// ========== EMERGENCIES ==========
export const emergencyAPI = {
    create: (data) => api.post('/emergencies', data),
    getAll: (params) => api.get('/emergencies', { params }),
    getById: (id) => api.get(`/emergencies/${id}`),
    help: (id, data) => api.put(`/emergencies/${id}/help`, data),
    resolve: (id) => api.put(`/emergencies/${id}/resolve`),
    expandRadius: (id, data) => api.put(`/emergencies/${id}/radius`, data),
    addImages: (id, images) => api.put(`/emergencies/${id}/images`, { images }),
    getFirstAid: (id) => api.get(`/emergencies/${id}/first-aid`),
    offlineSOS: (data) => api.post('/emergencies/offline-sos', data),
};

// ========== HOSPITALS ==========
export const hospitalAPI = {
    getNearby: (params) => api.get('/hospitals', { params }),
    getById: (id) => api.get(`/hospitals/${id}`),
};

// ========== ANALYTICS ==========
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getTrustRankings: () => api.get('/analytics/trust-rankings'),
};

// ========== HELPER LOCATIONS (Live Tracking) ==========
export const helperLocationAPI = {
    save: (data) => api.post('/helper-locations', data),
    getLatest: (emergencyId) => api.get(`/helper-locations/${emergencyId}`),
    getTrail: (emergencyId, helperId) => api.get(`/helper-locations/${emergencyId}/${helperId}/trail`),
};

// ========== HEATMAP ==========
export const heatmapAPI = {
    getData: (params) => api.get('/heatmap', { params }),
};

// ========== TRAFFIC DASHBOARD ==========
export const trafficAPI = {
    getActive: () => api.get('/traffic/active'),
};

export default api;
