import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress
} from '@/controllers/auth';
import { protect, handleValidationErrors, authRateLimit } from '@/middleware';

const router = Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const addressValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must not exceed 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must not exceed 50 characters'),
  body('address1')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Address is required and must not exceed 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required and must not exceed 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State is required and must not exceed 50 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('ZIP code is required and must be between 3 and 20 characters'),
  body('country')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country is required and must not exceed 50 characters')
];

// Public routes (with rate limiting)
router.post('/register', authRateLimit, registerValidation, handleValidationErrors, register);
router.post('/login', authRateLimit, loginValidation, handleValidationErrors, login);
router.post('/logout', logout);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfileValidation, handleValidationErrors, updateProfile);
router.put('/password', changePasswordValidation, handleValidationErrors, changePassword);

// Address management
router.post('/addresses', addressValidation, handleValidationErrors, addAddress);
router.put('/addresses/:addressId', addressValidation, handleValidationErrors, updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;