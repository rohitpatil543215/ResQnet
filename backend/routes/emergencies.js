import { Router } from 'express';
import {
    createEmergency, getEmergencies, getEmergency, helpEmergency,
    resolveEmergency, expandRadius, markFalseAlarm, getFirstAid, offlineSOS, addImages,
} from '../controllers/emergencyController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { sosLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/', protect, sosLimiter, createEmergency);
router.get('/', protect, getEmergencies);
router.get('/:id', protect, getEmergency);
router.put('/:id/help', protect, helpEmergency);
router.put('/:id/resolve', protect, resolveEmergency);
router.put('/:id/radius', protect, expandRadius);
router.put('/:id/images', protect, addImages);
router.put('/:id/false-alarm', protect, authorize('admin'), markFalseAlarm);
router.get('/:id/first-aid', protect, getFirstAid);
router.post('/offline-sos', protect, offlineSOS);

export default router;
