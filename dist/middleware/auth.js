"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = void 0;
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
            return;
        }
        try {
            const decoded = (0, auth_1.verifyToken)(token);
            const user = await models_1.User.findById(decoded.id).select('+password');
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'No user found with this token'
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authentication middleware'
        });
        return;
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        if (token) {
            try {
                const decoded = (0, auth_1.verifyToken)(token);
                const user = await models_1.User.findById(decoded.id);
                if (user) {
                    req.user = user;
                }
            }
            catch (error) {
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map