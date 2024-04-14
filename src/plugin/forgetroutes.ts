import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CreateUser, CreateAdmin, LoginUser } from "../schema/authSchema";
import bcrypt from "bcrypt";
import { sendResetEmail } from "../services/emailService"; // Assuming you have an email service

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

export default async function ForgetRoutes(server: FastifyInstance) {
  // Endpoint for requesting password reset
  server.post<{ Body: { email: string; testId: number } }>(
    "/user/forgot-password",
    async (req, reply) => {
      const { email, testId } = req.body;

      const user = await prisma.user.findUnique({
        where: { UniqueEmailTestId: { email, testId } },
      });

      if (!user) {
        return reply.code(404).send({
          message: "User not found",
        });
      }

      // Generate a one-time reset token
      const resetToken = bcrypt.genSaltSync(10);

      // Send reset email with the token
      try {
        await sendResetEmail(email, resetToken);
        reply.send({ message: "Reset email sent successfully" });
      } catch (error) {
        console.error("Error sending reset email:", error);
        reply.code(500).send({ message: "Failed to send reset email" });
      }
    }
  );

  // Endpoint to handle password reset
  server.post<{
    Body: { email: string; resetToken: string; newPassword: string };
  }>("/user/reset-password", async (req, reply) => {
    const { email, resetToken, newPassword } = req.body;

    // Validate the reset token (in this case, we're not storing it in the database)
    // You can add additional validation logic here if needed

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return reply.code(404).send({
        message: "User not found",
      });
    }

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    reply.send({ message: "Password reset successful" });
  });
}
