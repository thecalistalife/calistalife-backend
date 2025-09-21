"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieOptions = exports.getRefreshCookieOptions = exports.getAccessCookieOptions = exports.generateRefreshToken = exports.verifyToken = exports.generateToken = exports.verifyAccessToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    const secret = (process.env.JWT_SECRET || 'dev_secret');
    const expires = process.env.JWT_EXPIRE || '15m';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expires });
};
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (token) => {
    const secret = (process.env.JWT_SECRET || 'dev_secret');
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyAccessToken = verifyAccessToken;
exports.generateToken = exports.generateAccessToken;
exports.verifyToken = exports.verifyAccessToken;
const generateRefreshToken = () => {
    const token = crypto_1.default.randomBytes(48).toString('hex');
    const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const days = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '30', 10);
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return { token, hash, expires };
};
exports.generateRefreshToken = generateRefreshToken;
const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    expires: new Date(Date.now() + 15 * 60 * 1000)
});
exports.getAccessCookieOptions = getAccessCookieOptions;
const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    expires: new Date(Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRE || '30', 10) * 24 * 60 * 60 * 1000))
});
exports.getRefreshCookieOptions = getRefreshCookieOptions;
exports.getCookieOptions = exports.getAccessCookieOptions;
//# sourceMappingURL=auth.js.map