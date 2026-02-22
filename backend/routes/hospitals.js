import { Router } from 'express';
import { getNearbyHospitals, getHospital, createHospital } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', protect, getNearbyHospitals);
router.get('/:id', protect, getHospital);
router.post('/', protect, authorize('admin', 'hospital'), createHospital);

export default router;
