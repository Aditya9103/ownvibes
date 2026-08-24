import express from 'express';
import { adminLogin, verifyAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/verify', verifyAdmin);

export default router;
