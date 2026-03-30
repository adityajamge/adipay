import { Router } from 'express';
import { signup, login, getMe, updateProfile, changePassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public Routes
router.post('/signup', signup);
router.post('/login', login);

// Protected Routes (requires Bearer token via protect middleware)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
