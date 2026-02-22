import { Router } from 'express';
import { getProfile, updateProfile, updateLocation, toggleAvailability, getLeaderboard, getNearbyDonors, getDailyHeroes } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/location', protect, updateLocation);
router.put('/availability', protect, toggleAvailability);
router.get('/leaderboard', getLeaderboard);
router.get('/heroes', getDailyHeroes);
router.get('/nearby-donors', protect, getNearbyDonors);

export default router;
