"use strict";
// services/emailService.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    // Configure your email provider here
    service: "Gmail",
    auth: {
        user: "khushigarg.64901@gmail.com",
        pass: "Khushigarg100#",
    },
});
function sendResetEmail(email, resetToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}`; // Frontend reset password page URL
        const mailOptions = {
            from: "khushigarg.64901@gmail.com",
            to: email,
            subject: "Reset Your Password",
            html: `<p>Hello,</p><p>You have requested to reset your password. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        };
        try {
            yield transporter.sendMail(mailOptions);
            console.log("Reset email sent successfully");
        }
        catch (error) {
            console.error("Error sending reset email:", error);
            throw new Error("Failed to send reset email");
        }
    });
}
exports.sendResetEmail = sendResetEmail;
