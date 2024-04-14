// services/emailService.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // Configure your email provider here
  service: "Gmail",
  auth: {
    user: "khushigarg.64901@gmail.com",
    pass: "Khushigarg100#",
  },
});

export async function sendResetEmail(email, resetToken) {
  const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}`; // Frontend reset password page URL
  const mailOptions = {
    from: "khushigarg.64901@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Hello,</p><p>You have requested to reset your password. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset email sent successfully");
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Failed to send reset email");
  }
}
