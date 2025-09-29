import express from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import { initiatePayment, verifyPayment } from '../../controller/payment/paymentController.js';

const router = express.Router();

// POST /api/v1/payments/initiate
router.post('/initiate', authenticate, authorizeRoles('customer'), initiatePayment);

// POST /api/v1/payments/verify
router.post('/verify', authenticate, authorizeRoles('customer'), verifyPayment);

export default router;
