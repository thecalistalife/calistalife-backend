"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
router.use(middleware_1.protect);
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Orders endpoint - to be implemented',
        data: []
    });
});
router.post('/create', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Create order endpoint - to be implemented with Stripe'
    });
});
exports.default = router;
//# sourceMappingURL=orders.js.map