import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPayments,
  getPayment,
  requestRefund,
  processRefund,
  handleStripeWebhook,
  getPaymentAnalytics,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Stripe webhook (no auth required)
router.post('/webhook', handleStripeWebhook);

// Create payment intent (authenticated)
router.post('/create-intent', authenticate, createPaymentIntent);

// Confirm payment (authenticated)
router.post('/:id/confirm', authenticate, confirmPayment);

// Get payments (authenticated)
router.get('/', authenticate, getPayments);

// Get payment analytics (authenticated)
router.get('/analytics', authenticate, getPaymentAnalytics);

// Get single payment (authenticated)
router.get('/:id', authenticate, getPayment);

// Request refund (authenticated)
router.post('/:id/refund', authenticate, requestRefund);

// Process refund (admin only)
router.post('/:id/process-refund', authenticate, authorize('super_admin'), processRefund);

export default router;
