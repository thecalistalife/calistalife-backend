"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const payments_1 = require("../controllers/payments");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.post('/webhook', payments_1.handleStripeWebhook);
const createIntentValidation = [
    (0, express_validator_1.body)('amount').isInt({ min: 50 }).withMessage('Amount (in cents) must be >= 50'),
    (0, express_validator_1.body)('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object'),
];
router.post('/intent', middleware_1.optionalAuth, createIntentValidation, middleware_1.handleValidationErrors, payments_1.createPaymentIntent);
exports.default = router;
//# sourceMappingURL=payments.js.map