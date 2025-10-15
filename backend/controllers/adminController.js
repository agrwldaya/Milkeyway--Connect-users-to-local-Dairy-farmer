import { pool } from "../config/database/database.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwtUtils.js";


// Admin Login
export const LoginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM admins WHERE email=$1 AND role=$2", [email, "super_admin"]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
     
    // Generate token
    const accessToken = generateAccessToken(user);

    // Set access token cookie (short-lived)
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 min
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

// Utility function to log admin actions
const logAdminAction = async (adminId, targetId, actionType, reason = null) => {
  await pool.query(
    `INSERT INTO admin_actions (admin_id, target_id, action_type, reason)
     VALUES ($1, $2, $3, $4)`,
    [adminId, targetId, actionType, reason]
  );
};

// ✅ Get all farmers
export const getAllFarmers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.status as user_status, u.created_at as user_created_at,
             fp.id as farmer_profile_id, fp.farm_name, fp.address, fp.latitude, fp.longitude, fp.delivery_radius_km, fp.status as profile_status, fp.created_at as profile_created_at,
             fd.is_doc_verified, fd.created_at as doc_created_at
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN farmer_docs fd ON fp.id = fd.farmer_id
      WHERE u.role = 'farmer'
      ORDER BY fp.created_at DESC;
    `;

    const result = await pool.query(query);

    // Structure the data properly
    const farmers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      user_status: row.user_status,
      user_created_at: row.user_created_at,
      profile: {
        farmer_profile_id: row.farmer_profile_id,
        farm_name: row.farm_name,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        delivery_radius_km: row.delivery_radius_km,
        status: row.profile_status,
        created_at: row.profile_created_at
      },
      documents: {
        is_doc_verified: row.is_doc_verified || false,
        doc_created_at: row.doc_created_at
      }
    }));

    res.status(200).json({
      success: true,
      totalFarmers: farmers.length,
      farmers: farmers,
    });
  } catch (error) {
    console.error("Get Farmers Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// 👁 Get specific farmer details
export const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.phone, u.status as user_status,
             fp.id AS farmer_profile_id, fp.farm_name, fp.address, fp.latitude, fp.longitude, fp.delivery_radius_km, fp.status,
             fd.farm_image_url, fd.farmer_image_url, fd.farmer_proof_doc_url, fd.is_doc_verified, fd.created_at as doc_created_at
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN farmer_docs fd ON fp.id = fd.farmer_id
      WHERE u.role = 'farmer' AND u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    const farmer = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
      user_status: result.rows[0].user_status,
      profile: {
        farmer_profile_id: result.rows[0].farmer_profile_id,
        farm_name: result.rows[0].farm_name,
        address: result.rows[0].address,
        latitude: result.rows[0].latitude,
        longitude: result.rows[0].longitude,
        delivery_radius_km: result.rows[0].delivery_radius_km,
        status: result.rows[0].status,
      },
      documents: result.rows[0].farmer_proof_doc_url ? {
        farm_image_url: result.rows[0].farm_image_url,
        farmer_image_url: result.rows[0].farmer_image_url,
        farmer_proof_doc_url: result.rows[0].farmer_proof_doc_url,
        is_doc_verified: result.rows[0].is_doc_verified,
        doc_created_at: result.rows[0].doc_created_at
      } : null
    };

    res.status(200).json({
      success: true,
      farmer
    });
  } catch (error) {
    console.error("Get Farmer by ID Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Approve Farmer
export const approveFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.user_id;

    const farmer = await pool.query(`
      SELECT * 
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'farmer' AND u.id = $1
    `, [id]);

    if (farmer.rows.length === 0)
      return res.status(404).json({ success: false, message: "Farmer not found" });

    const farmerProfileId = farmer.rows[0].id; // This is the farmer_profiles.id

    await pool.query("UPDATE users SET status = $1 WHERE id = $2", ["active", id]);
    await pool.query("UPDATE farmer_profiles SET status = 'approved' WHERE user_id = $1", [id]);
    await pool.query("UPDATE farmer_docs SET is_doc_verified = $1 WHERE farmer_id = $2", [true, farmerProfileId]);

    await logAdminAction(adminId, id, "APPROVE");

    res.status(200).json({ success: true, message: "Farmer approved successfully" });
  } catch (error) {
    console.error("Approve Farmer Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ❌ Reject Farmer
export const rejectFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.user_id;

    const farmer = await pool.query(`
      SELECT * 
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'farmer' AND u.id = $1
    `, [id]);

    if (farmer.rows.length === 0)
      return res.status(404).json({ success: false, message: "Farmer not found" });

    const farmerProfileId = farmer.rows[0].id; // This is the farmer_profiles.id

    await pool.query("UPDATE users SET status = $1 WHERE id = $2", ["inactive", id]);
    await pool.query("UPDATE farmer_profiles SET status = 'rejected' WHERE user_id = $1", [id]);
    await pool.query("UPDATE farmer_docs SET is_doc_verified = $1 WHERE farmer_id = $2", [false, farmerProfileId]);

    await logAdminAction(adminId, id, "REJECT", reason);

    res.status(200).json({ success: true, message: "Farmer rejected successfully" });
  } catch (error) {
    console.error("Reject Farmer Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 📋 Get Pending Farmers (for approval page)
export const getPendingFarmers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.status as user_status, u.created_at as user_created_at,
             fp.id as farmer_profile_id, fp.farm_name, fp.address, fp.latitude, fp.longitude, fp.delivery_radius_km, fp.status as profile_status, fp.created_at as profile_created_at,
             fd.farm_image_url, fd.farmer_image_url, fd.farmer_proof_doc_url, fd.is_doc_verified, fd.created_at as doc_created_at
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN farmer_docs fd ON fp.id = fd.farmer_id
      WHERE u.role = 'farmer' AND (fp.status = 'draft' OR fp.status = 'rejected' or fp.status = 'pending')
      ORDER BY fp.created_at DESC;
    `;

    const result = await pool.query(query);

    // Structure the data properly
    const farmers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      user_status: row.user_status,
      user_created_at: row.user_created_at,
      profile: {
        farmer_profile_id: row.farmer_profile_id,
        farm_name: row.farm_name,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        delivery_radius_km: row.delivery_radius_km,
        status: row.profile_status,
        created_at: row.profile_created_at
      },
      documents: {
        farm_image_url: row.farm_image_url,
        farmer_image_url: row.farmer_image_url,
        farmer_proof_doc_url: row.farmer_proof_doc_url,
        is_doc_verified: row.is_doc_verified || false,
        doc_created_at: row.doc_created_at
      }
    }));

    res.status(200).json({
      success: true,
      totalFarmers: farmers.length,
      farmers: farmers,
    });
  } catch (error) {
    console.error("Get Pending Farmers Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// // 🔒 Suspend Farmer
// export const suspendFarmer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { reason } = req.body;
//     const adminId = req.body.userId;

//     const farmer = await pool.query("SELECT * FROM farmers WHERE id=$1", [id]);
//     if (farmer.rows.length === 0)
//       return res.status(404).json({ success: false, message: "Farmer not found" });

//     await pool.query("UPDATE farmers SET status='suspended' WHERE id=$1", [id]);
//     await logAdminAction(adminId, id, "SUSPEND", reason);

//     res.status(200).json({ success: true, message: "Farmer suspended successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// // 🔄 Reactivate Farmer
// export const reactivateFarmer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const adminId = req.body.userId;

//     const farmer = await pool.query("SELECT * FROM farmers WHERE id=$1", [id]);
//     if (farmer.rows.length === 0)
//       return res.status(404).json({ success: false, message: "Farmer not found" });

//     await pool.query("UPDATE farmers SET status='approved' WHERE id=$1", [id]);
//     await logAdminAction(adminId, id, "REACTIVATE");

//     res.status(200).json({ success: true, message: "Farmer reactivated successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };
