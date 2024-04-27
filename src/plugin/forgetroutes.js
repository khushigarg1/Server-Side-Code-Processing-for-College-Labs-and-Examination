"use strict";
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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailService_1 = require("../services/emailService"); // Assuming you have an email service
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
function ForgetRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        // Endpoint for requesting password reset
        server.post("/user/forgot-password", (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, testId } = req.body;
            const user = yield prisma.user.findUnique({
                where: { UniqueEmailTestId: { email, testId } },
            });
            if (!user) {
                return reply.code(404).send({
                    message: "User not found",
                });
            }
            // Generate a one-time reset token
            const resetToken = bcrypt_1.default.genSaltSync(10);
            // Send reset email with the token
            try {
                yield (0, emailService_1.sendResetEmail)(email, resetToken);
                reply.send({ message: "Reset email sent successfully" });
            }
            catch (error) {
                console.error("Error sending reset email:", error);
                reply.code(500).send({ message: "Failed to send reset email" });
            }
        }));
        // Endpoint to handle password reset
        server.post("/user/reset-password", (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, resetToken, newPassword } = req.body;
            // Validate the reset token (in this case, we're not storing it in the database)
            // You can add additional validation logic here if needed
            // Find user by email
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user) {
                return reply.code(404).send({
                    message: "User not found",
                });
            }
            // Hash the new password
            const hash = yield bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
            // Update user's password
            yield prisma.user.update({
                where: { id: user.id },
                data: { password: hash },
            });
            reply.send({ message: "Password reset successful" });
        }));
    });
}
exports.default = ForgetRoutes;
