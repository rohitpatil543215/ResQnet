import { useAuth } from '../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import VolunteerDashboard from './VolunteerDashboard';
import AdminDashboard from './AdminDashboard';
import HospitalDashboard from './HospitalDashboard';
import TrafficDashboard from './TrafficDashboard';

export default function Dashboard() {
    const { user } = useAuth();
    if (!user) return null;
    if (user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'traffic') return <TrafficDashboard />;
    if (user.role === 'hospital') return <HospitalDashboard />;
    if (user.role === 'doctor' || user.role === 'nss_volunteer') return <VolunteerDashboard />;
    return <CitizenDashboard />;
}
