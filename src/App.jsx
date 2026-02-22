import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ActiveEmergencyPage from './pages/ActiveEmergencyPage';
import NearbyEmergencies from './pages/NearbyEmergencies';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import HeroCitizenPage from './pages/HeroCitizenPage';
import AdminDashboard from './pages/AdminDashboard';
import HeatmapPage from './pages/HeatmapPage';
import TrafficDashboard from './pages/TrafficDashboard';
import FirstAidChat from './pages/FirstAidChat';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

// Role-based route guard for traffic police and admin pages
function RoleRoute({ children, roles }) {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
    return children;
}

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/emergency" element={<ProtectedRoute><ActiveEmergencyPage /></ProtectedRoute>} />
                <Route path="/nearby" element={<ProtectedRoute><NearbyEmergencies /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                <Route path="/heroes" element={<ProtectedRoute><HeroCitizenPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/heatmap" element={<RoleRoute roles={['admin', 'traffic']}><HeatmapPage /></RoleRoute>} />
                <Route path="/traffic-dashboard" element={<RoleRoute roles={['traffic', 'admin']}><TrafficDashboard /></RoleRoute>} />
                <Route path="/first-aid" element={<FirstAidChat />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster position="top-right" toastOptions={{
                style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px' },
            }} />
        </>
    );
}

export default function App() {
    return <AppRoutes />;
}
