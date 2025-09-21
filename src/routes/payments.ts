import { Router } from 'express';
import { body } from 'express-validator';
import { createPaymentIntent, handleStripeWebhook } from '../controllers/payments';
import { handleValidationErrors, optionalAuth } from '../middleware';

const router = Router();

// Stripe webhook (no auth required, raw body)
router.post('/webhook', handleStripeWebhook);

// Create payment intent (optional auth - can be used by guests or authenticated users)
const createIntentValidation = [
  body('amount').isInt({ min: 50 }).withMessage('Amount (in cents) must be >= 50'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

router.post('/intent', optionalAuth, createIntentValidation, handleValidationErrors, createPaymentIntent);

export default router;