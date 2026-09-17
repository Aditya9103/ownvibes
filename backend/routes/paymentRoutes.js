import express from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    handleWebhook,
    initiateRefund,
    getAllPayments,
    getPaymentById
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer Endpoints
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);

// Webhook (Requires raw body + webhook signature, no JWT token)
router.post('/webhook', handleWebhook);

// Admin Payment & Refund Management Endpoints
router.post('/refund', protect, admin, initiateRefund);
router.get('/', protect, admin, getAllPayments);
router.get('/:id', protect, admin, getPaymentById);

export default router;
