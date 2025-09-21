"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = exports.corsOptions = exports.requestLogger = exports.generalRateLimit = exports.authRateLimit = exports.createRateLimit = exports.handleValidationErrors = exports.notFound = exports.errorHandler = void 0;
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error(err);
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = { message, statusCode: 400 };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const createRateLimit = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            message
        }
    });
};
exports.createRateLimit = createRateLimit;
exports.authRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later');
exports.generalRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later');
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
};
exports.requestLogger = requestLogger;
exports.corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        // Allow multiple origins via CORS_ORIGIN (comma-separated) or single CLIENT_URL
        const fromEnv = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
        const allowedOrigins = [
            ...fromEnv,
            'http://localhost:3000',
            'http://localhost:5173'
        ];
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
var auth_1 = require("./auth");
Object.defineProperty(exports, "protect", { enumerable: true, get: function () { return auth_1.protect; } });
Object.defineProperty(exports, "restrictTo", { enumerable: true, get: function () { return auth_1.restrictTo; } });
Object.defineProperty(exports, "optionalAuth", { enumerable: true, get: function () { return auth_1.optionalAuth; } });
//# sourceMappingURL=index.js.map