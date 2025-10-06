import { mailSender } from "./mailsender.js";

 
export const sendVerificationEmail = async (email, otp) => {
  try {
    const html = `
      <h2>Email Verification</h2>
      <p>Use the OTP below to verify your account:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `;

    await mailSender(email, "Verification Email - Milkeyway", html);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("Error occurred while sending verification email:", error);
    throw error;
  }
};
