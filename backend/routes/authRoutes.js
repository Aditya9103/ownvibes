import express from 'express';
import { authUser, registerUser, getUserProfile, adminLogin, passwordlessLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/passwordless-login', passwordlessLogin);
router.post('/register', registerUser);
router.route('/profile').get(protect, getUserProfile);

// This matches /api/admin/login if mounted at /api/admin
router.post('/admin-login-internal', adminLogin); // Internal helper

export default router;
