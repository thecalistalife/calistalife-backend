"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../controllers/auth");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Token is required'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];
const verifyEmailValidation = [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required')
];
const googleLoginValidation = [
    (0, express_validator_1.body)('idToken').notEmpty().withMessage('Google idToken is required')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(/^\+?[\d\s-()]+$/)
        .withMessage('Please provide a valid phone number')
];
const changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];
const addressValidation = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must not exceed 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must not exceed 50 characters'),
    (0, express_validator_1.body)('address1')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Address is required and must not exceed 100 characters'),
    (0, express_validator_1.body)('city')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('City is required and must not exceed 50 characters'),
    (0, express_validator_1.body)('state')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('State is required and must not exceed 50 characters'),
    (0, express_validator_1.body)('zipCode')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('ZIP code is required and must be between 3 and 20 characters'),
    (0, express_validator_1.body)('country')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Country is required and must not exceed 50 characters')
];
router.post('/register', middleware_1.authRateLimit, registerValidation, middleware_1.handleValidationErrors, auth_1.register);
router.post('/login', middleware_1.authRateLimit, loginValidation, middleware_1.handleValidationErrors, auth_1.login);
router.post('/logout', auth_1.logout);
router.post('/refresh', auth_1.refreshToken);
router.post('/password/forgot', middleware_1.authRateLimit, forgotPasswordValidation, middleware_1.handleValidationErrors, auth_1.forgotPassword);
router.post('/password/reset', middleware_1.authRateLimit, resetPasswordValidation, middleware_1.handleValidationErrors, auth_1.resetPassword);
router.post('/verify/confirm', verifyEmailValidation, middleware_1.handleValidationErrors, auth_1.verifyEmail);
router.post('/google', googleLoginValidation, middleware_1.handleValidationErrors, auth_1.googleLogin);
router.use(middleware_1.protect);
router.post('/verify/request', auth_1.requestEmailVerification);
router.get('/me', auth_1.getMe);
router.put('/profile', updateProfileValidation, middleware_1.handleValidationErrors, auth_1.updateProfile);
router.put('/password', changePasswordValidation, middleware_1.handleValidationErrors, auth_1.changePassword);
router.post('/addresses', addressValidation, middleware_1.handleValidationErrors, auth_1.addAddress);
router.put('/addresses/:addressId', addressValidation, middleware_1.handleValidationErrors, auth_1.updateAddress);
router.delete('/addresses/:addressId', auth_1.deleteAddress);
exports.default = router;
//# sourceMappingURL=auth.js.map