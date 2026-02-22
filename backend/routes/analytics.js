import { Router } from 'express';
import { getDashboardStats, getTrustRankings } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/trust-rankings', protect, authorize('admin'), getTrustRankings);

export default router;
