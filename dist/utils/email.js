"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = async ({ to, subject, html, text }) => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || user || 'no-reply@thecalista.com';
    if (!host || !user || !pass) {
        console.log('Email (dev fallback):', { to, subject, html, text });
        return;
    }
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
    await transporter.sendMail({ from, to, subject, html, text });
};
exports.sendMail = sendMail;
//# sourceMappingURL=email.js.map