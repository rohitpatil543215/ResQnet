// Routes for traffic police dashboard
import { Router } from 'express';
import { getTrafficDashboard } from '../controllers/trafficController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

// Traffic dashboard data — traffic and admin roles
router.get('/active', protect, authorize('traffic', 'admin'), getTrafficDashboard);

export default router;
