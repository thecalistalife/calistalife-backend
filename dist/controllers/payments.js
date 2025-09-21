"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new stripe_1.default(stripeSecret) : null;
const createPaymentIntent = async (req, res, next) => {
    try {
        if (!stripe) {
            res.status(500).json({ success: false, message: 'Stripe secret key is not configured' });
            return;
        }
        const { amount, currency = 'usd', metadata = {} } = req.body;
        if (amount < 50) {
            res.status(400).json({ success: false, message: 'Amount must be at least 50 cents' });
            return;
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                ...metadata,
                userId: req.user?._id?.toString() || 'guest',
            },
            automatic_payment_methods: { enabled: true },
        });
        res.status(200).json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createPaymentIntent = createPaymentIntent;
const handleStripeWebhook = async (req, res, next) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripe || !webhookSecret) {
            res.status(500).json({ success: false, message: 'Stripe not configured' });
            return;
        }
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                break;
            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (err) {
        next(err);
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
//# sourceMappingURL=payments.js.map