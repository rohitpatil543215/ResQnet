// Routes for live helper location tracking
import { Router } from 'express';
import { saveLocation, getLatestLocations, getHelperTrail } from '../controllers/helperLocationController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

// Save a location ping (authenticated helper)
router.post('/', protect, saveLocation);

// Get latest locations for all helpers on an emergency
router.get('/:emergencyId', protect, getLatestLocations);

// Get trail for a specific helper
router.get('/:emergencyId/:helperId/trail', protect, getHelperTrail);

export default router;
