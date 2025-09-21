"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.changePassword = exports.googleLogin = exports.verifyEmail = exports.requestEmailVerification = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await models_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
            return;
        }
        const user = await models_1.User.create({
            name,
            email,
            password
        });
        const accessToken = (0, auth_1.generateAccessToken)(user);
        const { token: refreshToken, hash, expires } = (0, auth_1.generateRefreshToken)();
        user.refreshTokenHash = hash;
        user.refreshTokenExpires = expires;
        await user.save();
        res.cookie('token', accessToken, (0, auth_1.getAccessCookieOptions)());
        res.cookie('refresh_token', refreshToken, (0, auth_1.getRefreshCookieOptions)());
        const response = {
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token: accessToken
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }
        const user = await models_1.User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        const accessToken = (0, auth_1.generateAccessToken)(user);
        const { token: refreshToken, hash, expires } = (0, auth_1.generateRefreshToken)();
        user.refreshTokenHash = hash;
        user.refreshTokenExpires = expires;
        await user.save();
        res.cookie('token', accessToken, (0, auth_1.getAccessCookieOptions)());
        res.cookie('refresh_token', refreshToken, (0, auth_1.getRefreshCookieOptions)());
        const userResponse = user.toJSON();
        const response = {
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token: accessToken
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const rt = req.cookies?.refresh_token;
        if (rt) {
            const hash = crypto_1.default.createHash('sha256').update(rt).digest('hex');
            await models_1.User.updateOne({ refreshTokenHash: hash }, { $set: { refreshTokenHash: null, refreshTokenExpires: null } });
        }
        res.cookie('token', '', { expires: new Date(0), httpOnly: true });
        res.cookie('refresh_token', '', { expires: new Date(0), httpOnly: true });
        const response = {
            success: true,
            message: 'Logged out successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        const response = {
            success: true,
            message: 'User retrieved successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.user._id;
        const fieldsToUpdate = {};
        if (name)
            fieldsToUpdate.name = name;
        if (email)
            fieldsToUpdate.email = email;
        if (phone)
            fieldsToUpdate.phone = phone;
        const user = await models_1.User.findByIdAndUpdate(userId, fieldsToUpdate, {
            new: true,
            runValidators: true
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const response = {
            success: true,
            message: 'Profile updated successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const refreshToken = async (req, res, next) => {
    try {
        const rt = req.cookies?.refresh_token;
        if (!rt) {
            res.status(401).json({ success: false, message: 'No refresh token provided' });
            return;
        }
        const hash = crypto_1.default.createHash('sha256').update(rt).digest('hex');
        const user = await models_1.User.findOne({ refreshTokenHash: hash }).select('+password');
        if (!user || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
            res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
            return;
        }
        const { token: newRt, hash: newHash, expires } = (0, auth_1.generateRefreshToken)();
        user.refreshTokenHash = newHash;
        user.refreshTokenExpires = expires;
        await user.save();
        const access = (0, auth_1.generateAccessToken)(user);
        res.cookie('token', access, (0, auth_1.getAccessCookieOptions)());
        res.cookie('refresh_token', newRt, (0, auth_1.getRefreshCookieOptions)());
        res.status(200).json({ success: true, message: 'Token refreshed', data: { token: access } });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await models_1.User.findOne({ email });
        if (!user) {
            res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetHash = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetToken = resetHash;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        await (0, email_1.sendMail)({
            to: email,
            subject: 'Reset your password',
            html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 1 hour.</p>`
        });
        res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, email, newPassword } = req.body;
        if (!token || !email || !newPassword) {
            res.status(400).json({ success: false, message: 'Missing fields' });
            return;
        }
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await models_1.User.findOne({ email, passwordResetToken: hash, passwordResetExpires: { $gt: new Date() } }).select('+password');
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            return;
        }
        user.password = newPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successful' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const requestEmailVerification = async (req, res, next) => {
    try {
        const user = await models_1.User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.emailVerified) {
            res.status(200).json({ success: true, message: 'Email already verified' });
            return;
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        user.emailVerificationToken = hash;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
        await (0, email_1.sendMail)({
            to: user.email,
            subject: 'Verify your email',
            html: `<p>Welcome!</p><p>Click <a href="${verifyUrl}">here</a> to verify your email (expires in 24 hours).</p>`
        });
        res.status(200).json({ success: true, message: 'Verification email sent' });
    }
    catch (error) {
        next(error);
    }
};
exports.requestEmailVerification = requestEmailVerification;
const verifyEmail = async (req, res, next) => {
    try {
        const { token, email } = req.body;
        if (!token || !email) {
            res.status(400).json({ success: false, message: 'Missing token or email' });
            return;
        }
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await models_1.User.findOne({ email, emailVerificationToken: hash, emailVerificationExpires: { $gt: new Date() } });
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
            return;
        }
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ success: false, message: 'Missing idToken' });
            return;
        }
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            res.status(500).json({ success: false, message: 'Google client not configured' });
            return;
        }
        const { OAuth2Client } = await Promise.resolve().then(() => __importStar(require('google-auth-library')));
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({ idToken, audience: clientId });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ success: false, message: 'Invalid Google token' });
            return;
        }
        const email = payload.email.toLowerCase();
        const name = payload.name || email.split('@')[0];
        const googleId = payload.sub;
        let user = await models_1.User.findOne({ email });
        if (!user) {
            user = await models_1.User.create({ name, email, password: crypto_1.default.randomBytes(16).toString('hex'), googleId, emailVerified: true, avatar: payload.picture || null });
        }
        else {
            if (!user.googleId)
                user.googleId = googleId;
            if (!user.emailVerified)
                user.emailVerified = true;
            await user.save();
        }
        const accessToken = (0, auth_1.generateAccessToken)(user);
        const { token: refreshToken, hash, expires } = (0, auth_1.generateRefreshToken)();
        user.refreshTokenHash = hash;
        user.refreshTokenExpires = expires;
        await user.save();
        res.cookie('token', accessToken, (0, auth_1.getAccessCookieOptions)());
        res.cookie('refresh_token', refreshToken, (0, auth_1.getRefreshCookieOptions)());
        res.status(200).json({ success: true, message: 'Login successful', data: { user: user.toJSON(), token: accessToken } });
    }
    catch (error) {
        next(error);
    }
};
exports.googleLogin = googleLogin;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        const user = await models_1.User.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (!(await user.comparePassword(currentPassword))) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }
        user.password = newPassword;
        await user.save();
        const response = {
            success: true,
            message: 'Password changed successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const addAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const addressData = req.body;
        const user = await models_1.User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user.addresses.length === 0) {
            addressData.isDefault = true;
        }
        if (addressData.isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }
        user.addresses.push(addressData);
        await user.save();
        const response = {
            success: true,
            message: 'Address added successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.addAddress = addAddress;
const updateAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;
        const addressData = req.body;
        const user = await models_1.User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const address = user.addresses.find(a => a._id?.toString() === addressId);
        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found'
            });
            return;
        }
        if (addressData.isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id?.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }
        Object.assign(address, addressData);
        await user.save();
        const response = {
            success: true,
            message: 'Address updated successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;
        const user = await models_1.User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const address = user.addresses.find(a => a._id?.toString() === addressId);
        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found'
            });
            return;
        }
        const wasDefault = address.isDefault;
        user.addresses = user.addresses.filter(a => a._id?.toString() !== addressId);
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        await user.save();
        const response = {
            success: true,
            message: 'Address deleted successfully',
            data: user
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
//# sourceMappingURL=auth.js.map