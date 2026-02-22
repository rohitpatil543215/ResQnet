// Routes for emergency heatmap
import { Router } from 'express';
import { getHeatmapData } from '../controllers/heatmapController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

// Heatmap data — admin and traffic roles only
router.get('/', protect, authorize('admin', 'traffic'), getHeatmapData);

export default router;
