import { pool } from "../config/database/database.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { uploadFiles } from "../utils/fileupload.js";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";


// Register Farmer
export const registerFarmer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, phone and password are required" });
    }

    // Check if email/phone already exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $2",
      [email, phone]
    );

    if (existing.rows.length > 0 && existing.rows[0].is_verified){
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert into users table
    let newFarmer = null;

   let farmerId;
if (existing.rows.length > 0 && !existing.rows[0].is_verified) {
  await pool.query(
    `UPDATE users 
     SET name=$1, email=$2, phone=$3, password=$4, role=$5, status=$6 
     WHERE id=$7`,
    [name, email, phone, hashedPassword, "farmer", "draft", existing.rows[0].id]
  );
  farmerId = existing.rows[0].id;
} else {
  const insertResult = await pool.query(
    `INSERT INTO users (name, email, phone, password, role, status) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, name, email, phone, role, status, created_at`,
    [name, email, phone, hashedPassword, "farmer", "draft"]
  );
  farmerId = insertResult.rows[0].id;
}
    newFarmer = await pool.query("SELECT * FROM users WHERE id = $1", [farmerId]);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO user_verifications (user_id, otp, expires_at) 
       VALUES ($1, $2, $3)`,
      [farmerId, otp, expiresAt]
    );

    // Send email
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      message: "Farmer registered. OTP sent to email.",
      userId: farmerId,
    });
  } catch (error) {
    console.error("Register Farmer Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete Farmer Profile
export const completeFarmerProfile = async (req, res) => {
  try {
    const {user_id} = req.params;
    const {
      farm_name,
      address,
      latitude,
      longitude,
      delivery_radius_km,
    } = req.body;

    // Validate input
    if (!user_id || !farm_name || !address || !latitude || !longitude || !delivery_radius_km) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if farmer user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [user_id, "farmer"]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found, create account" });
    }
    if (user.rows.length>0 && !user.rows[0].is_verified) {
      return res.status(404).json({ message: "Farmer not verified" });
    }
    
    // Check if farmer profile already exists
    const existingProfileCheck = await pool.query(
      "SELECT * FROM farmer_profiles WHERE user_id = $1",
      [user_id]
    );
    if (existingProfileCheck.rows.length > 0) {
       //update existing profile
       await pool.query(
        `UPDATE farmer_profiles 
         SET farm_name=$1, address=$2, delivery_radius_km=$3, latitude=$4, longitude=$5, status=$6
         WHERE user_id=$7`,
        [farm_name, address, delivery_radius_km, latitude, longitude, "draft", user_id]
       );
    }
    else {
    // Insert new profile
    await pool.query(
      `INSERT INTO farmer_profiles 
        (user_id, farm_name, address, delivery_radius_km, latitude, longitude, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user_id, farm_name, address, delivery_radius_km, latitude, longitude, "draft"]
    );
}

    res.status(201).json({ message: "Farmer profile created successfully" });
  } catch (error) {
    console.error("Complete Farmer Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Upload Farmer Documents
export const uploadDocuments = async (req, res) => {
  try {
    const { user_id } = req.params;

    
   //console.log(req.files);

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    // Check if farmer exists
    const user = await pool.query("SELECT * FROM users WHERE id = $1 AND role = $2", [user_id, "farmer"]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "user not found" });
    }

    const farmer = await pool.query("SELECT * FROM farmer_profiles WHERE user_id=$1", [user_id]);
    if (farmer.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Farmer profile not found" });
    }
    const farmer_id = farmer.rows[0].id;

    // Check if files exist
    if (!req.files || !req.files.farmer_doc) {
      return res.status(400).json({ success: false, message: "No documents uploaded" });
    }

    // Upload files to Cloudinary
    const { uploadedUrls, errors } = await uploadFiles(req.files,"farmer_doc" );
    console.log("Uploaded URLs:", uploadedUrls);

    let doc_type = 'unknown'; 
    // Save file URLs into farmer_documents table
    if (uploadedUrls.length > 0) {
       doc_type = uploadedUrls.length > 0 ? uploadedUrls[0].split('.').pop() :'unknown';

      const insertQuery = `
        INSERT INTO documents (farmer_id, file_url, uploaded_at, doc_type)
        VALUES ($1, $2, NOW(), $3)
        RETURNING *;
      `;

      for (const url of uploadedUrls) {
        await pool.query(insertQuery, [farmer_id, url,  doc_type]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Documents processed",
      uploaded: uploadedUrls,
      doc_type
    });
  } catch (error) {
    console.error("Upload Documents Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Farmer Login
export const loginFarmer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email=$1 AND role=$2", [email, "farmer"]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if verified and approved
    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email before login" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: "Your account is not approved yet" });
    }

    

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refreshToken in DB
    await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [refreshToken, user.id]);

    // Set access token cookie (short-lived)
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    // Set refresh token cookie (long-lived, scoped to refresh endpoint)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

