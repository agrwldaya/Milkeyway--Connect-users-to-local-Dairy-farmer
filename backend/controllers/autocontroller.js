 
import { pool } from "../config/database/database.js";



// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { user_id, otp } = req.body;
    if (!user_id || !otp) {
      return res.status(400).json({ message: "userId and otp are required" });
    }
    // Fetch latest OTP record
    const result = await pool.query(
      `SELECT * FROM user_verifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [user_id]
    );
    console.log(result.rows);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "OTP not found or already used" });
    }

    const record = result.rows[0];
    const now = new Date();

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    console.log(record.expires_at, now);
    
    if (record.expires_at < now) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check if user already verified
    const userCheck = await pool.query(
      "SELECT is_verified FROM users WHERE id=$1",
      [user_id]
    );

    if (userCheck.rows.length > 0 && userCheck.rows[0].is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Update user as verified
    await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
      user_id,
    ]);

    // Delete OTP so it can’t be reused
    await pool.query("DELETE FROM user_verifications WHERE user_id = $1", [
      user_id,
    ]);

    res.status(200).json({ message: "Email Verified Successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

