const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendVerificationEmail = async (userEmail, verificationCode) => {
  try {
    const mailOptions = {
      from: '"RecipeShare App" <from@example.com>',
      to: userEmail,
      subject: "Your Account Verification Code",

      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Welcome to RecipeShare!</h2>
          <p>Thank you for registering. Please use the following code to verify your account:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
            ${verificationCode}
          </p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail} (captured by Mailtrap)`);
  } catch (error) {
    console.error(`Error sending verification email to ${userEmail}:`, error);

    throw new Error("Could not send verification email.");
  }
};

const sendPasswordResetEmail = async (userEmail, userId, token) => {
  try {
    const frontendUrl = process.env.NODE_ENV === "production" ? "https://your-live-frontend-url.com" : "http://localhost:5173";

    const resetLink = `${frontendUrl}/reset-password/${userId}/${token}`;

    const mailOptions = {
      from: '"Habit Tracker App" <from@example.com>',
      to: userEmail,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Please click the link below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${userEmail}:`, error);
    throw new Error("Could not send password reset email.");
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
