import type { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      res.status(500).json({ success: false, message: 'Stripe secret key is not configured' });
      return;
    }

    const { amount, currency = 'usd', metadata = {} } = req.body as {
      amount: number; currency?: string; metadata?: Record<string, string>;
    };

    // Optional: basic sanity checks
    if (amount < 50) {
      res.status(400).json({ success: false, message: 'Amount too low' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        ...metadata,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ success: true, data: { clientSecret: paymentIntent.client_secret } });
  } catch (err) {
    next(err);
  }
};