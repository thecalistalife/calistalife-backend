"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const cart_1 = require("@/controllers/cart");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
const addToCartValidation = [
    (0, express_validator_1.body)('productId')
        .notEmpty()
        .isMongoId()
        .withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('size')
        .notEmpty()
        .withMessage('Size is required'),
    (0, express_validator_1.body)('color')
        .notEmpty()
        .withMessage('Color is required'),
    (0, express_validator_1.body)('quantity')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10')
];
const updateCartValidation = [
    (0, express_validator_1.body)('productId')
        .notEmpty()
        .isMongoId()
        .withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('size')
        .notEmpty()
        .withMessage('Size is required'),
    (0, express_validator_1.body)('color')
        .notEmpty()
        .withMessage('Color is required'),
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10')
];
const removeFromCartValidation = [
    (0, express_validator_1.body)('productId')
        .notEmpty()
        .isMongoId()
        .withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('size')
        .notEmpty()
        .withMessage('Size is required'),
    (0, express_validator_1.body)('color')
        .notEmpty()
        .withMessage('Color is required')
];
const wishlistValidation = [
    (0, express_validator_1.body)('productId')
        .notEmpty()
        .isMongoId()
        .withMessage('Valid product ID is required')
];
router.use(middleware_1.protect);
router.get('/', cart_1.getCart);
router.post('/add', addToCartValidation, middleware_1.handleValidationErrors, cart_1.addToCart);
router.put('/update', updateCartValidation, middleware_1.handleValidationErrors, cart_1.updateCartItem);
router.delete('/remove', removeFromCartValidation, middleware_1.handleValidationErrors, cart_1.removeFromCart);
router.delete('/clear', cart_1.clearCart);
router.get('/wishlist', cart_1.getWishlist);
router.post('/wishlist/add', wishlistValidation, middleware_1.handleValidationErrors, cart_1.addToWishlist);
router.delete('/wishlist/remove', wishlistValidation, middleware_1.handleValidationErrors, cart_1.removeFromWishlist);
router.post('/wishlist/toggle', wishlistValidation, middleware_1.handleValidationErrors, cart_1.toggleWishlistItem);
exports.default = router;
//# sourceMappingURL=cart.js.map