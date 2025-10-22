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
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
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

// ==================== CONSUMER MANAGEMENT ====================

// ✅ Get all consumers
export const getAllConsumers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.status as user_status, u.created_at as user_created_at,
             u.country, u.state, u.city, u.pincode,
             cp.id as consumer_profile_id, cp.address, cp.latitude, cp.longitude, cp.preferred_radius_km, cp.status as profile_status, cp.created_at as profile_created_at
      FROM users u
      LEFT JOIN consumer_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'consumer'
      ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query);

    // Structure the data properly
    const consumers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      user_status: row.user_status,
      user_created_at: row.user_created_at,
      location: {
        country: row.country,
        state: row.state,
        city: row.city,
        pincode: row.pincode
      },
      profile: row.consumer_profile_id ? {
        consumer_profile_id: row.consumer_profile_id,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        preferred_radius_km: row.preferred_radius_km,
        status: row.profile_status,
        created_at: row.profile_created_at
      } : null
    }));

    res.status(200).json({
      success: true,
      totalConsumers: consumers.length,
      consumers: consumers,
    });
  } catch (error) {
    console.error("Get Consumers Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 👁 Get specific consumer details
export const getConsumerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.phone, u.status as user_status, u.created_at as user_created_at,
             u.country, u.state, u.city, u.pincode,
             cp.id AS consumer_profile_id, cp.address, cp.latitude, cp.longitude, cp.preferred_radius_km, cp.status as profile_status,
             cp.profile_image_url, cp.landmark
      FROM users u
      LEFT JOIN consumer_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'consumer' AND u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Consumer not found" });
    }

    const consumer = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
      user_status: result.rows[0].user_status,
      user_created_at: result.rows[0].user_created_at,
      location: {
        country: result.rows[0].country,
        state: result.rows[0].state,
        city: result.rows[0].city,
        pincode: result.rows[0].pincode
      },
      profile: result.rows[0].consumer_profile_id ? {
        consumer_profile_id: result.rows[0].consumer_profile_id,
        address: result.rows[0].address,
        latitude: result.rows[0].latitude,
        longitude: result.rows[0].longitude,
        preferred_radius_km: result.rows[0].preferred_radius_km,
        status: result.rows[0].profile_status,
        profile_image_url: result.rows[0].profile_image_url,
        landmark: result.rows[0].landmark
      } : null
    };

    res.status(200).json({
      success: true,
      consumer
    });
  } catch (error) {
    console.error("Get Consumer by ID Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Activate Consumer
export const activateConsumer = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.user_id;

    const consumer = await pool.query(
      "SELECT * FROM users WHERE role = 'consumer' AND id = $1",
      [id]
    );

    if (consumer.rows.length === 0)
      return res.status(404).json({ success: false, message: "Consumer not found" });

    await pool.query("UPDATE users SET status = $1 WHERE id = $2", ["active", id]);
    if (consumer.rows[0].consumer_profile_id) {
      await pool.query("UPDATE consumer_profiles SET status = 'active' WHERE user_id = $1", [id]);
    }

    await logAdminAction(adminId, id, "ACTIVATE_CONSUMER");

    res.status(200).json({ success: true, message: "Consumer activated successfully" });
  } catch (error) {
    console.error("Activate Consumer Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ❌ Deactivate Consumer
export const deactivateConsumer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.user_id;

    const consumer = await pool.query(
      "SELECT * FROM users WHERE role = 'consumer' AND id = $1",
      [id]
    );

    if (consumer.rows.length === 0)
      return res.status(404).json({ success: false, message: "Consumer not found" });

    await pool.query("UPDATE users SET status = $1 WHERE id = $2", ["inactive", id]);
    if (consumer.rows[0].consumer_profile_id) {
      await pool.query("UPDATE consumer_profiles SET status = 'inactive' WHERE user_id = $1", [id]);
    }

    await logAdminAction(adminId, id, "DEACTIVATE_CONSUMER", reason);

    res.status(200).json({ success: true, message: "Consumer deactivated successfully" });
  } catch (error) {
    console.error("Deactivate Consumer Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 📊 Get Consumer Statistics
export const getConsumerStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_consumers,
        COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_consumers,
        COUNT(CASE WHEN u.status = 'inactive' THEN 1 END) as inactive_consumers,
        COUNT(CASE WHEN u.status = 'draft' THEN 1 END) as draft_consumers,
        COUNT(CASE WHEN cp.id IS NOT NULL THEN 1 END) as consumers_with_profiles
      FROM users u
      LEFT JOIN consumer_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'consumer'
    `);

    const recentConsumers = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at
      FROM users u
      WHERE u.role = 'consumer'
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      stats: stats.rows[0],
      recentConsumers: recentConsumers.rows
    });
  } catch (error) {
    console.error("Get Consumer Stats Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==================== CONNECTION MANAGEMENT ====================

// ✅ Get all connections
export const getAllConnections = async (req, res) => {
  try {
    const query = `
      SELECT 
        ac.id as connection_id,
        ac.connected_at,
        ac.last_interaction_at,
        ac.connection_notes,
        ac.is_active,
        ac.created_at as connection_created_at,
        
        -- Consumer info
        cu.id as consumer_id,
        cu.name as consumer_name,
        cu.email as consumer_email,
        cu.phone as consumer_phone,
        cu.status as consumer_status,
        
        -- Farmer info
        fu.id as farmer_id,
        fu.name as farmer_name,
        fu.email as farmer_email,
        fu.phone as farmer_phone,
        fu.status as farmer_status,
        fp.farm_name,
        fp.address as farm_address,
        
        -- Request info
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message as request_message,
        fr.status as request_status,
        fr.created_at as request_created_at
      FROM active_connections ac
      JOIN users cu ON ac.consumer_id = cu.id
      JOIN users fu ON ac.farmer_id = fu.id
      JOIN farmer_profiles fp ON ac.farmer_id = fp.id
       LEFT JOIN farmer_requests fr ON ac.farmer_request_id = fr.id
      ORDER BY ac.connected_at DESC;
    `;

    const result = await pool.query(query);

    // Structure the data properly
    const connections = result.rows.map(row => ({
      connection_id: row.connection_id,
      connected_at: row.connected_at,
      last_interaction_at: row.last_interaction_at,
      connection_notes: row.connection_notes,
      is_active: row.is_active,
      connection_created_at: row.connection_created_at,
      consumer: {
        id: row.consumer_id,
        name: row.consumer_name,
        email: row.consumer_email,
        phone: row.consumer_phone,
        status: row.consumer_status
      },
      farmer: {
        id: row.farmer_id,
        name: row.farmer_name,
        email: row.farmer_email,
        phone: row.farmer_phone,
        status: row.farmer_status,
        farm_name: row.farm_name,
        farm_address: row.farm_address
      },
      request: {
        product_interest: row.product_interest,
        quantity: row.quantity,
        preferred_time: row.preferred_time,
        contact_method: row.contact_method,
        message: row.request_message,
        status: row.request_status,
        created_at: row.request_created_at
      }
    }));

    res.status(200).json({
      success: true,
      totalConnections: connections.length,
      connections: connections,
    });
  } catch (error) {
    console.error("Get All Connections Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 👁 Get specific connection details
export const getConnectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        ac.id as connection_id,
        ac.connected_at,
        ac.last_interaction_at,
        ac.connection_notes,
        ac.is_active,
        ac.created_at as connection_created_at,
        
        -- Consumer info
        cu.id as consumer_id,
        cu.name as consumer_name,
        cu.email as consumer_email,
        cu.phone as consumer_phone,
        cu.status as consumer_status,
        
        -- Farmer info
        fu.id as farmer_id,
        fu.name as farmer_name,
        fu.email as farmer_email,
        fu.phone as farmer_phone,
        fu.status as farmer_status,
        fp.farm_name,
        fp.address as farm_address,
        
        -- Request info
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message as request_message,
        fr.status as request_status,
        fr.created_at as request_created_at
      FROM active_connections ac
      JOIN users cu ON ac.consumer_id = cu.id
      JOIN users fu ON ac.farmer_id = fu.id
      JOIN farmer_profiles fp ON ac.farmer_id = fp.id
      LEFT JOIN farmer_requests fr ON ac.farmer_request_id = fr.id
      WHERE ac.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Connection not found" });
    }

    const row = result.rows[0];
    const connection = {
      connection_id: row.connection_id,
      connected_at: row.connected_at,
      last_interaction_at: row.last_interaction_at,
      connection_notes: row.connection_notes,
      is_active: row.is_active,
      connection_created_at: row.connection_created_at,
      consumer: {
        id: row.consumer_id,
        name: row.consumer_name,
        email: row.consumer_email,
        phone: row.consumer_phone,
        status: row.consumer_status
      },
      farmer: {
        id: row.farmer_id,
        name: row.farmer_name,
        email: row.farmer_email,
        phone: row.farmer_phone,
        status: row.farmer_status,
        farm_name: row.farm_name,
        farm_address: row.farm_address
      },
      request: {
        product_interest: row.product_interest,
        quantity: row.quantity,
        preferred_time: row.preferred_time,
        contact_method: row.contact_method,
        message: row.request_message,
        status: row.request_status,
        created_at: row.request_created_at
      }
    };

    res.status(200).json({
      success: true,
      connection
    });
  } catch (error) {
    console.error("Get Connection by ID Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ❌ Deactivate Connection
export const deactivateConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.user_id;

    const connection = await pool.query(
      "SELECT * FROM active_connections WHERE id = $1",
      [id]
    );

    if (connection.rows.length === 0)
      return res.status(404).json({ success: false, message: "Connection not found" });

    await pool.query("UPDATE active_connections SET is_active = false WHERE id = $1", [id]);

    await logAdminAction(adminId, id, "DEACTIVATE_CONNECTION", reason);

    res.status(200).json({ success: true, message: "Connection deactivated successfully" });
  } catch (error) {
    console.error("Deactivate Connection Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 📊 Get Connection Statistics
export const getConnectionStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_connections,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_connections,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_connections,
        COUNT(CASE WHEN connected_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as connections_this_week,
        COUNT(CASE WHEN connected_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as connections_this_month
      FROM active_connections
    `);

    const recentConnections = await pool.query(`
      SELECT 
        ac.id,
        ac.connected_at,
        cu.name as consumer_name,
        fp.farm_name,
        fr.product_interest
      FROM active_connections ac
      JOIN users cu ON ac.consumer_id = cu.id
      JOIN farmer_profiles fp ON ac.farmer_id = fp.id
       LEFT JOIN farmer_requests fr ON ac.farmer_request_id = fr.id
      ORDER BY ac.connected_at DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      stats: stats.rows[0],
      recentConnections: recentConnections.rows
    });
  } catch (error) {
    console.error("Get Connection Stats Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// =====================================================
// REQUEST MANAGEMENT FUNCTIONS
// =====================================================

// Get all requests with filtering and pagination
export const getAllRequests = async (req, res) => {
  try {
    const { 
      status = '', 
      search = '', 
      limit = 20, 
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Build WHERE clause
    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND fr.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (cu.name ILIKE $${paramCount} OR fu.name ILIKE $${paramCount} OR fr.product_interest ILIKE $${paramCount} OR fr.message ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validate sort parameters
    const validSortColumns = ['created_at', 'status', 'product_interest', 'consumer_name', 'farmer_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const requestsQuery = `
      SELECT 
        fr.id as request_id,
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message,
        fr.status,
        fr.created_at,
        fr.farmer_response,
        fr.response_at,
        
        -- Consumer info
        cu.id as consumer_id,
        cu.name as consumer_name,
        cu.email as consumer_email,
        cu.phone as consumer_phone,
        cu.status as consumer_status,
        
        -- Farmer info
        fu.id as farmer_id,
        fu.name as farmer_name,
        fu.email as farmer_email,
        fu.phone as farmer_phone,
        fu.status as farmer_status,
        fp.farm_name,
        fp.address as farm_address
      FROM farmer_requests fr
      JOIN users cu ON fr.consumer_id = cu.id
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE 1=1 ${whereClause}
      ORDER BY fr.${sortColumn} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(requestsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM farmer_requests fr
      JOIN users cu ON fr.consumer_id = cu.id
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE 1=1 ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.status(200).json({
      success: true,
      requests: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get request by ID
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const requestQuery = `
      SELECT 
        fr.id as request_id,
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message,
        fr.status,
        fr.created_at,
        fr.farmer_response,
        fr.response_at,
        
        -- Consumer info
        cu.id as consumer_id,
        cu.name as consumer_name,
        cu.email as consumer_email,
        cu.phone as consumer_phone,
        cu.status as consumer_status,
        
        -- Farmer info
        fu.id as farmer_id,
        fu.name as farmer_name,
        fu.email as farmer_email,
        fu.phone as farmer_phone,
        fu.status as farmer_status,
        fp.farm_name,
        fp.address as farm_address
      FROM farmer_requests fr
      JOIN users cu ON fr.consumer_id = cu.id
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE fr.id = $1
    `;

    const result = await pool.query(requestQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    res.status(200).json({
      success: true,
      request: result.rows[0]
    });

  } catch (error) {
    console.error("Get Request by ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update request status (admin override)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, accepted, rejected, or completed"
      });
    }

    // Check if request exists
    const requestCheck = await pool.query(
      "SELECT * FROM farmer_requests WHERE id = $1",
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Update request status
    await pool.query(
      "UPDATE farmer_requests SET status = $1, farmer_response = $2, response_at = NOW() WHERE id = $3",
      [status, admin_notes || null, id]
    );

    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      requestId: id,
      status: status
    });

  } catch (error) {
    console.error("Update Request Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete request
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const requestCheck = await pool.query(
      "SELECT * FROM farmer_requests WHERE id = $1",
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Delete request
    await pool.query(
      "DELETE FROM farmer_requests WHERE id = $1",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
      requestId: id
    });

  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get request statistics
export const getRequestStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_requests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as requests_this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as requests_this_month,
        ROUND(
          (COUNT(CASE WHEN status = 'accepted' THEN 1 END)::DECIMAL / 
           NULLIF(COUNT(*), 0)) * 100, 2
        ) as acceptance_rate
      FROM farmer_requests
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      stats: {
        total_requests: parseInt(stats.total_requests),
        pending_requests: parseInt(stats.pending_requests),
        accepted_requests: parseInt(stats.accepted_requests),
        rejected_requests: parseInt(stats.rejected_requests),
        completed_requests: parseInt(stats.completed_requests),
        requests_this_week: parseInt(stats.requests_this_week),
        requests_this_month: parseInt(stats.requests_this_month),
        acceptance_rate: parseFloat(stats.acceptance_rate) || 0
      }
    });

  } catch (error) {
    console.error("Get Request Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// DASHBOARD STATISTICS FUNCTIONS
// =====================================================

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get all statistics in parallel
    const [
      farmerStats,
      consumerStats,
      connectionStats,
      requestStats,
      pendingFarmers,
      recentActivity
    ] = await Promise.all([
      // Farmer statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_farmers,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as active_farmers,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_farmers,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as farmers_this_month,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as farmers_this_week
        FROM farmer_profiles
      `),
      
      // Consumer statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_consumers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_consumers,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_consumers,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as consumers_this_month,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as consumers_this_week
        FROM users 
        WHERE role = 'consumer'
      `),
      
      // Connection statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_connections,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_connections,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_connections,
          COUNT(CASE WHEN connected_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as connections_this_month,
          COUNT(CASE WHEN connected_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as connections_this_week
        FROM active_connections
      `),
      
      // Request statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_requests,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as requests_this_month,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as requests_this_week,
          ROUND(
            (COUNT(CASE WHEN status = 'accepted' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 2
          ) as acceptance_rate
        FROM farmer_requests
      `),
      
      // Pending farmers for approval
      pool.query(`
        SELECT 
          fp.id,
          fp.farm_name,
          fp.address,
          fp.created_at,
          u.name as farmer_name,
          u.email,
          u.phone
        FROM farmer_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.status = 'pending'
        ORDER BY fp.created_at DESC
        LIMIT 5
      `),
      
      // Recent activity
      pool.query(`
        SELECT 
          'farmer_registration' as activity_type,
          fp.created_at as activity_date,
          u.name as actor_name,
          fp.farm_name as description,
          'farmer' as actor_type
        FROM farmer_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.created_at >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'consumer_registration' as activity_type,
          u.created_at as activity_date,
          u.name as actor_name,
          'New consumer registered' as description,
          'consumer' as actor_type
        FROM users u
        WHERE u.role = 'consumer' AND u.created_at >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'connection_established' as activity_type,
          ac.connected_at as activity_date,
          CONCAT(cu.name, ' connected to ', fu.name) as actor_name,
          'New connection established' as description,
          'system' as actor_type
        FROM active_connections ac
        JOIN users cu ON ac.consumer_id = cu.id
        JOIN farmer_profiles fp ON ac.farmer_id = fp.id
        JOIN users fu ON fp.user_id = fu.id
        WHERE ac.connected_at >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'request_sent' as activity_type,
          fr.created_at as activity_date,
          cu.name as actor_name,
          CONCAT('Request for ', fr.product_interest) as description,
          'consumer' as actor_type
        FROM farmer_requests fr
        JOIN users cu ON fr.consumer_id = cu.id
        WHERE fr.created_at >= CURRENT_DATE - INTERVAL '7 days'
        
        ORDER BY activity_date DESC
        LIMIT 10
      `)
    ]);

    // Calculate growth rates
    const farmerGrowth = farmerStats.rows[0].farmers_this_month > 0 ? 
      Math.round((farmerStats.rows[0].farmers_this_week / farmerStats.rows[0].farmers_this_month) * 100) : 0;
    
    const consumerGrowth = consumerStats.rows[0].consumers_this_month > 0 ? 
      Math.round((consumerStats.rows[0].consumers_this_week / consumerStats.rows[0].consumers_this_month) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        farmers: {
          total: parseInt(farmerStats.rows[0].total_farmers),
          active: parseInt(farmerStats.rows[0].active_farmers),
          pending: parseInt(farmerStats.rows[0].pending_farmers),
          this_month: parseInt(farmerStats.rows[0].farmers_this_month),
          this_week: parseInt(farmerStats.rows[0].farmers_this_week),
          growth_rate: farmerGrowth
        },
        consumers: {
          total: parseInt(consumerStats.rows[0].total_consumers),
          active: parseInt(consumerStats.rows[0].active_consumers),
          inactive: parseInt(consumerStats.rows[0].inactive_consumers),
          this_month: parseInt(consumerStats.rows[0].consumers_this_month),
          this_week: parseInt(consumerStats.rows[0].consumers_this_week),
          growth_rate: consumerGrowth
        },
        connections: {
          total: parseInt(connectionStats.rows[0].total_connections),
          active: parseInt(connectionStats.rows[0].active_connections),
          inactive: parseInt(connectionStats.rows[0].inactive_connections),
          this_month: parseInt(connectionStats.rows[0].connections_this_month),
          this_week: parseInt(connectionStats.rows[0].connections_this_week)
        },
        requests: {
          total: parseInt(requestStats.rows[0].total_requests),
          pending: parseInt(requestStats.rows[0].pending_requests),
          accepted: parseInt(requestStats.rows[0].accepted_requests),
          rejected: parseInt(requestStats.rows[0].rejected_requests),
          this_month: parseInt(requestStats.rows[0].requests_this_month),
          this_week: parseInt(requestStats.rows[0].requests_this_week),
          acceptance_rate: parseFloat(requestStats.rows[0].acceptance_rate) || 0
        },
        pending_farmers: pendingFarmers.rows,
        recent_activity: recentActivity.rows
      }
    });

  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get platform overview statistics
export const getPlatformOverview = async (req, res) => {
  try {
    const overviewQuery = `
      SELECT 
        -- Platform health metrics
        (SELECT COUNT(*) FROM farmer_profiles WHERE status = 'approved') as active_farmers,
        (SELECT COUNT(*) FROM users WHERE role = 'consumer' AND status = 'active') as active_consumers,
        (SELECT COUNT(*) FROM active_connections WHERE is_active = true) as active_connections,
        
        -- Performance metrics
        ROUND(
          (SELECT COUNT(*) FROM farmer_requests WHERE status = 'accepted')::DECIMAL / 
          NULLIF((SELECT COUNT(*) FROM farmer_requests), 0) * 100, 2
        ) as request_success_rate,
        
        -- Recent activity
        (SELECT COUNT(*) FROM farmer_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_farmers_week,
        (SELECT COUNT(*) FROM users WHERE role = 'consumer' AND created_at >= CURRENT_DATE - INTERVAL '7 days') as new_consumers_week,
        (SELECT COUNT(*) FROM active_connections WHERE connected_at >= CURRENT_DATE - INTERVAL '7 days') as new_connections_week,
        (SELECT COUNT(*) FROM farmer_requests WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_requests_week
    `;

    const result = await pool.query(overviewQuery);
    const overview = result.rows[0];

    res.status(200).json({
      success: true,
      overview: {
        active_farmers: parseInt(overview.active_farmers),
        active_consumers: parseInt(overview.active_consumers),
        active_connections: parseInt(overview.active_connections),
        request_success_rate: parseFloat(overview.request_success_rate) || 0,
        new_farmers_week: parseInt(overview.new_farmers_week),
        new_consumers_week: parseInt(overview.new_consumers_week),
        new_connections_week: parseInt(overview.new_connections_week),
        new_requests_week: parseInt(overview.new_requests_week)
      }
    });

  } catch (error) {
    console.error("Get Platform Overview Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// ACTIVITY TRACKING FUNCTIONS
// =====================================================

// Get comprehensive activity log
export const getAllActivity = async (req, res) => {
  try {
    const { 
      activity_type = '', 
      date_from = '', 
      date_to = '', 
      limit = 50, 
      offset = 0,
      sort_by = 'activity_date',
      sort_order = 'DESC'
    } = req.query;

    // Build WHERE clause
    let whereClause = '';
    let queryParams = [];
    let paramCount = 0;

    if (activity_type) {
      paramCount++;
      whereClause += ` AND activity_type = $${paramCount}`;
      queryParams.push(activity_type);
    }

    if (date_from) {
      paramCount++;
      whereClause += ` AND activity_date >= $${paramCount}`;
      queryParams.push(date_from);
    }

    if (date_to) {
      paramCount++;
      whereClause += ` AND activity_date <= $${paramCount}`;
      queryParams.push(date_to);
    }

    // Validate sort parameters
    const validSortColumns = ['activity_date', 'activity_type', 'actor_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'activity_date';
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const activityQuery = `
      SELECT 
        'farmer_registration' as activity_type,
        fp.created_at as activity_date,
        u.name as actor_name,
        fp.farm_name as description,
        'farmer' as actor_type,
        u.email as actor_email,
        u.phone as actor_phone,
        fp.address as location
      FROM farmer_profiles fp
      JOIN users u ON fp.user_id = u.id
      WHERE 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'consumer_registration' as activity_type,
        u.created_at as activity_date,
        u.name as actor_name,
        'New consumer registered' as description,
        'consumer' as actor_type,
        u.email as actor_email,
        u.phone as actor_phone,
        NULL as location
      FROM users u
      WHERE u.role = 'consumer' AND 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'connection_established' as activity_type,
        ac.connected_at as activity_date,
        CONCAT(cu.name, ' connected to ', fu.name) as actor_name,
        'New connection established' as description,
        'system' as actor_type,
        cu.email as actor_email,
        cu.phone as actor_phone,
        fp.address as location
      FROM active_connections ac
      JOIN users cu ON ac.consumer_id = cu.id
      JOIN farmer_profiles fp ON ac.farmer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'request_sent' as activity_type,
        fr.created_at as activity_date,
        cu.name as actor_name,
        CONCAT('Request for ', fr.product_interest) as description,
        'consumer' as actor_type,
        cu.email as actor_email,
        cu.phone as actor_phone,
        fp.address as location
      FROM farmer_requests fr
      JOIN users cu ON fr.consumer_id = cu.id
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      WHERE 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'request_accepted' as activity_type,
        fr.response_at as activity_date,
        fu.name as actor_name,
        CONCAT('Accepted request for ', fr.product_interest) as description,
        'farmer' as actor_type,
        fu.email as actor_email,
        fu.phone as actor_phone,
        fp.address as location
      FROM farmer_requests fr
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE fr.status = 'accepted' AND fr.response_at IS NOT NULL AND 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'request_rejected' as activity_type,
        fr.response_at as activity_date,
        fu.name as actor_name,
        CONCAT('Rejected request for ', fr.product_interest) as description,
        'farmer' as actor_type,
        fu.email as actor_email,
        fu.phone as actor_phone,
        fp.address as location
      FROM farmer_requests fr
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      JOIN users fu ON fp.user_id = fu.id
      WHERE fr.status = 'rejected' AND fr.response_at IS NOT NULL AND 1=1 ${whereClause}
      
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(activityQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT fp.created_at as activity_date, 'farmer_registration' as activity_type
        FROM farmer_profiles fp
        WHERE 1=1 ${whereClause}
        
        UNION ALL
        
        SELECT u.created_at as activity_date, 'consumer_registration' as activity_type
        FROM users u
        WHERE u.role = 'consumer' AND 1=1 ${whereClause}
        
        UNION ALL
        
        SELECT ac.connected_at as activity_date, 'connection_established' as activity_type
        FROM active_connections ac
        WHERE 1=1 ${whereClause}
        
        UNION ALL
        
        SELECT fr.created_at as activity_date, 'request_sent' as activity_type
        FROM farmer_requests fr
        WHERE 1=1 ${whereClause}
        
        UNION ALL
        
        SELECT fr.response_at as activity_date, 'request_accepted' as activity_type
        FROM farmer_requests fr
        WHERE fr.status = 'accepted' AND fr.response_at IS NOT NULL AND 1=1 ${whereClause}
        
        UNION ALL
        
        SELECT fr.response_at as activity_date, 'request_rejected' as activity_type
        FROM farmer_requests fr
        WHERE fr.status = 'rejected' AND fr.response_at IS NOT NULL AND 1=1 ${whereClause}
      ) as activity_count
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.status(200).json({
      success: true,
      activities: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error("Get All Activity Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get activity statistics
export const getActivityStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const statsQuery = `
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN activity_type = 'farmer_registration' THEN 1 END) as farmer_registrations,
        COUNT(CASE WHEN activity_type = 'consumer_registration' THEN 1 END) as consumer_registrations,
        COUNT(CASE WHEN activity_type = 'connection_established' THEN 1 END) as connections_established,
        COUNT(CASE WHEN activity_type = 'request_sent' THEN 1 END) as requests_sent,
        COUNT(CASE WHEN activity_type = 'request_accepted' THEN 1 END) as requests_accepted,
        COUNT(CASE WHEN activity_type = 'request_rejected' THEN 1 END) as requests_rejected,
        COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as activities_this_week,
        COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as activities_this_month
      FROM (
        SELECT 'farmer_registration' as activity_type, fp.created_at as activity_date
        FROM farmer_profiles fp
        WHERE fp.created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        
        UNION ALL
        
        SELECT 'consumer_registration' as activity_type, u.created_at as activity_date
        FROM users u
        WHERE u.role = 'consumer' AND u.created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        
        UNION ALL
        
        SELECT 'connection_established' as activity_type, ac.connected_at as activity_date
        FROM active_connections ac
        WHERE ac.connected_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        
        UNION ALL
        
        SELECT 'request_sent' as activity_type, fr.created_at as activity_date
        FROM farmer_requests fr
        WHERE fr.created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        
        UNION ALL
        
        SELECT 'request_accepted' as activity_type, fr.response_at as activity_date
        FROM farmer_requests fr
        WHERE fr.status = 'accepted' AND fr.response_at IS NOT NULL 
        AND fr.response_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        
        UNION ALL
        
        SELECT 'request_rejected' as activity_type, fr.response_at as activity_date
        FROM farmer_requests fr
        WHERE fr.status = 'rejected' AND fr.response_at IS NOT NULL 
        AND fr.response_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
      ) as activity_data
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      stats: {
        total_activities: parseInt(stats.total_activities),
        farmer_registrations: parseInt(stats.farmer_registrations),
        consumer_registrations: parseInt(stats.consumer_registrations),
        connections_established: parseInt(stats.connections_established),
        requests_sent: parseInt(stats.requests_sent),
        requests_accepted: parseInt(stats.requests_accepted),
        requests_rejected: parseInt(stats.requests_rejected),
        activities_this_week: parseInt(stats.activities_this_week),
        activities_this_month: parseInt(stats.activities_this_month)
      }
    });

  } catch (error) {
    console.error("Get Activity Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get activity by type
export const getActivityByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const validTypes = [
      'farmer_registration',
      'consumer_registration', 
      'connection_established',
      'request_sent',
      'request_accepted',
      'request_rejected'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity type"
      });
    }

    let activityQuery = '';
    let countQuery = '';

    switch (type) {
      case 'farmer_registration':
        activityQuery = `
          SELECT 
            'farmer_registration' as activity_type,
            fp.created_at as activity_date,
            u.name as actor_name,
            fp.farm_name as description,
            'farmer' as actor_type,
            u.email as actor_email,
            u.phone as actor_phone,
            fp.address as location
          FROM farmer_profiles fp
          JOIN users u ON fp.user_id = u.id
          ORDER BY fp.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) as total FROM farmer_profiles`;
        break;
        
      case 'consumer_registration':
        activityQuery = `
          SELECT 
            'consumer_registration' as activity_type,
            u.created_at as activity_date,
            u.name as actor_name,
            'New consumer registered' as description,
            'consumer' as actor_type,
            u.email as actor_email,
            u.phone as actor_phone,
            NULL as location
          FROM users u
          WHERE u.role = 'consumer'
          ORDER BY u.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) as total FROM users WHERE role = 'consumer'`;
        break;
        
      case 'connection_established':
        activityQuery = `
          SELECT 
            'connection_established' as activity_type,
            ac.connected_at as activity_date,
            CONCAT(cu.name, ' connected to ', fu.name) as actor_name,
            'New connection established' as description,
            'system' as actor_type,
            cu.email as actor_email,
            cu.phone as actor_phone,
            fp.address as location
          FROM active_connections ac
          JOIN users cu ON ac.consumer_id = cu.id
          JOIN farmer_profiles fp ON ac.farmer_id = fp.id
          JOIN users fu ON fp.user_id = fu.id
          ORDER BY ac.connected_at DESC
          LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) as total FROM active_connections`;
        break;
        
      case 'request_sent':
        activityQuery = `
          SELECT 
            'request_sent' as activity_type,
            fr.created_at as activity_date,
            cu.name as actor_name,
            CONCAT('Request for ', fr.product_interest) as description,
            'consumer' as actor_type,
            cu.email as actor_email,
            cu.phone as actor_phone,
            fp.address as location
          FROM farmer_requests fr
          JOIN users cu ON fr.consumer_id = cu.id
          JOIN farmer_profiles fp ON fr.farmer_id = fp.id
          ORDER BY fr.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) as total FROM farmer_requests`;
        break;
        
      case 'request_accepted':
        activityQuery = `
          SELECT 
            'request_accepted' as activity_type,
            fr.response_at as activity_date,
            fu.name as actor_name,
            CONCAT('Accepted request for ', fr.product_interest) as description,
            'farmer' as actor_type,
            fu.email as actor_email,
            fu.phone as actor_phone,
            fp.address as location
          FROM farmer_requests fr
          JOIN farmer_profiles fp ON fr.farmer_id = fp.id
          JOIN users fu ON fp.user_id = fu.id
          WHERE fr.status = 'accepted' AND fr.response_at IS NOT NULL
          ORDER BY fr.response_at DESC
          LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) as total FROM farmer_requests WHERE status = 'accepted' AND response_at IS NOT NULL`;
        break;
        
      case 'request_rejected':
        activityQuery = `
          SELECT 
            'request_rejected' as activity_type,
            fr.response_at as activity_date,
            fu.name as actor_name,
            CONCAT('Rejected request for ', fr.product_interest) as description,
            'farmer' as actor_type,
            fu.email as actor_email,
            fu.phone as actor_phone,
            fp.address as location
          FROM farmer_requests fr
          JOIN farmer_profiles fp ON fr.farmer_id = fp.id
          JOIN users fu ON fp.user_id = fu.id
          WHERE fr.status = 'rejected' AND fr.response_at IS NOT NULL
          ORDER BY fr.response_at DESC
          LIMIT $1 OFFSET $2
        `;
        countQuery = `SELECT COUNT(*) as total FROM farmer_requests WHERE status = 'rejected' AND response_at IS NOT NULL`;
        break;
    }

    const [activitiesResult, countResult] = await Promise.all([
      pool.query(activityQuery, [parseInt(limit), parseInt(offset)]),
      pool.query(countQuery)
    ]);

    const total = parseInt(countResult.rows[0].total);

    res.status(200).json({
      success: true,
      activities: activitiesResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error("Get Activity By Type Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN SETTINGS FUNCTIONS
// =====================================================

// Get admin profile information
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    console.log(adminId);

    const adminQuery = `
      SELECT 
        a.id,
        a.name,
        a.email,
        a.role,
        a.status,
        a.created_at,
        a.last_login_at,
        a.phone,
        a.profile_image_url
      FROM admins a
      WHERE a.id = $1
    `;

    const result = await pool.query(adminQuery, [adminId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    res.status(200).json({
      success: true,
      admin: result.rows[0]
    });

  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const { 
      name, 
      email, 
      phone, 
      profile_image_url 
    } = req.body;

    // Check if email is already taken by another admin
    if (email) {
      const emailCheck = await pool.query(
        "SELECT id FROM admins WHERE email = $1 AND id != $2",
        [email, adminId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    // Update admin profile
    const updateQuery = `
      UPDATE admins SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        profile_image_url = COALESCE($4, profile_image_url),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      name, email, phone, profile_image_url, adminId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: result.rows[0]
    });

  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Change admin password
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get current password hash
    const adminCheck = await pool.query(
      "SELECT password FROM admins WHERE id = $1",
      [adminId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, adminCheck.rows[0].password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await pool.query(
      "UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedNewPassword, adminId]
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change Admin Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get platform settings
export const getPlatformSettings = async (req, res) => {
  try {
    const settingsQuery = `
      SELECT 
        setting_key,
        setting_value,
        setting_type,
        description,
        is_public,
        created_at,
        updated_at
      FROM platform_settings
      ORDER BY setting_key
    `;

    const result = await pool.query(settingsQuery);
    
    // Convert database rows to settings object
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Convert value based on type
      switch (row.setting_type) {
        case 'number':
          value = parseInt(value) || 0;
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = value;
          }
          break;
        default:
          value = value;
      }
      
      settings[row.setting_key] = value;
    });

    res.status(200).json({
      success: true,
      settings
    });

  } catch (error) {
    console.error("Get Platform Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update platform settings
export const updatePlatformSettings = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      platform_name,
      platform_description,
      contact_email,
      contact_phone,
      support_email,
      max_farmers,
      max_consumers,
      farmer_approval_required,
      consumer_verification_required,
      email_notifications_enabled,
      sms_notifications_enabled,
      maintenance_mode,
      registration_enabled,
      terms_and_conditions,
      privacy_policy
    } = req.body;

    // Validate required fields
    if (!platform_name || !contact_email) {
      return res.status(400).json({
        success: false,
        message: "Platform name and contact email are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact email format"
      });
    }

    if (support_email && !emailRegex.test(support_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid support email format"
      });
    }

    // Validate numeric fields
    if (max_farmers && (isNaN(max_farmers) || max_farmers < 0)) {
      return res.status(400).json({
        success: false,
        message: "Max farmers must be a positive number"
      });
    }

    if (max_consumers && (isNaN(max_consumers) || max_consumers < 0)) {
      return res.status(400).json({
        success: false,
        message: "Max consumers must be a positive number"
      });
    }

    // Define settings to update with validation
    const settingsToUpdate = {
      platform_name,
      platform_description,
      contact_email,
      contact_phone,
      support_email,
      max_farmers,
      max_consumers,
      farmer_approval_required,
      consumer_verification_required,
      email_notifications_enabled,
      sms_notifications_enabled,
      maintenance_mode,
      registration_enabled,
      terms_and_conditions,
      privacy_policy
    };

    // Update settings in batch using a single query
    const updateValues = [];
    const updateKeys = [];
    const updateTypes = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(settingsToUpdate)) {
      if (value !== undefined && value !== null) {
        let settingValue = value;
        let settingType = 'string';
        
        // Determine type and convert value
        if (typeof value === 'boolean') {
          settingValue = value.toString();
          settingType = 'boolean';
        } else if (typeof value === 'number') {
          settingValue = value.toString();
          settingType = 'number';
        }
        
        updateValues.push(settingValue);
        updateTypes.push(settingType);
        updateKeys.push(key);
        paramCount += 3;
      }
    }

    if (updateKeys.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings to update"
      });
    }

    // Build dynamic update query
    const updateQuery = `
      UPDATE platform_settings 
      SET setting_value = CASE setting_key
        ${updateKeys.map((_, index) => 
          `WHEN $${index * 3 + 2} THEN $${index * 3 + 1}`
        ).join(' ')}
        END,
      setting_type = CASE setting_key
        ${updateKeys.map((_, index) => 
          `WHEN $${index * 3 + 2} THEN $${index * 3 + 3}`
        ).join(' ')}
        END,
      updated_at = NOW()
      WHERE setting_key = ANY($${paramCount + 1})
    `;

    const queryParams = [];
    for (let i = 0; i < updateKeys.length; i++) {
      queryParams.push(updateValues[i], updateKeys[i], updateTypes[i]);
    }
    queryParams.push(updateKeys);

    await client.query(updateQuery, queryParams);

    // Get updated settings
    const settingsQuery = `
      SELECT 
        setting_key,
        setting_value,
        setting_type,
        description,
        is_public,
        updated_at
      FROM platform_settings
      WHERE setting_key = ANY($1)
      ORDER BY setting_key
    `;

    const result = await client.query(settingsQuery, [updateKeys]);
    
    // Convert database rows to settings object
    const updatedSettings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Convert value based on type
      switch (row.setting_type) {
        case 'number':
          value = parseInt(value) || 0;
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = value;
          }
          break;
        default:
          value = value;
      }
      
      updatedSettings[row.setting_key] = value;
    });

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Platform settings updated successfully",
      settings: updatedSettings,
      updated_count: result.rows.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Update Platform Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Get public platform settings (for non-admin users)
export const getPublicPlatformSettings = async (req, res) => {
  try {
    const settingsQuery = `
      SELECT 
        setting_key,
        setting_value,
        setting_type,
        description
      FROM platform_settings
      WHERE is_public = true
      ORDER BY setting_key
    `;

    const result = await pool.query(settingsQuery);
    
    // Convert database rows to settings object
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Convert value based on type
      switch (row.setting_type) {
        case 'number':
          value = parseInt(value) || 0;
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = value;
          }
          break;
        default:
          value = value;
      }
      
      settings[row.setting_key] = value;
    });

    res.status(200).json({
      success: true,
      settings
    });

  } catch (error) {
    console.error("Get Public Platform Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Initialize platform settings (run this once to set up default settings)
export const initializePlatformSettings = async (req, res) => {
  try {
    const defaultSettings = [
      { key: 'platform_name', value: 'Milkeyway', type: 'string', description: 'Platform name', is_public: true },
      { key: 'platform_description', value: 'Connecting farmers and consumers for fresh dairy products', type: 'string', description: 'Platform description', is_public: true },
      { key: 'contact_email', value: 'admin@milkeyway.com', type: 'string', description: 'Contact email address', is_public: true },
      { key: 'contact_phone', value: '+91-9876543210', type: 'string', description: 'Contact phone number', is_public: true },
      { key: 'support_email', value: 'support@milkeyway.com', type: 'string', description: 'Support email address', is_public: true },
      { key: 'max_farmers', value: '1000', type: 'number', description: 'Maximum number of farmers allowed', is_public: false },
      { key: 'max_consumers', value: '10000', type: 'number', description: 'Maximum number of consumers allowed', is_public: false },
      { key: 'farmer_approval_required', value: 'true', type: 'boolean', description: 'Require admin approval for new farmers', is_public: false },
      { key: 'consumer_verification_required', value: 'false', type: 'boolean', description: 'Require verification for new consumers', is_public: false },
      { key: 'email_notifications_enabled', value: 'true', type: 'boolean', description: 'Enable email notifications', is_public: false },
      { key: 'sms_notifications_enabled', value: 'true', type: 'boolean', description: 'Enable SMS notifications', is_public: false },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Put platform in maintenance mode', is_public: true },
      { key: 'registration_enabled', value: 'true', type: 'boolean', description: 'Allow new user registrations', is_public: true },
      { key: 'terms_and_conditions', value: 'https://milkeyway.com/terms', type: 'string', description: 'Terms and conditions URL', is_public: true },
      { key: 'privacy_policy', value: 'https://milkeyway.com/privacy', type: 'string', description: 'Privacy policy URL', is_public: true }
    ];

    const insertPromises = defaultSettings.map(async (setting) => {
      const insertQuery = `
        INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, is_public)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (setting_key) DO UPDATE SET
          setting_value = EXCLUDED.setting_value,
          setting_type = EXCLUDED.setting_type,
          description = EXCLUDED.description,
          is_public = EXCLUDED.is_public,
          updated_at = NOW()
      `;
      
      await pool.query(insertQuery, [
        setting.key,
        setting.value,
        setting.type,
        setting.description,
        setting.is_public
      ]);
    });

    await Promise.all(insertPromises);

    res.status(200).json({
      success: true,
      message: "Platform settings initialized successfully"
    });

  } catch (error) {
    console.error("Initialize Platform Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get admin dashboard preferences
export const getAdminPreferences = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    // For now, return default preferences
    // In a real application, these would be stored in a user_preferences table
    const preferences = {
      theme: "light",
      language: "en",
      timezone: "Asia/Kolkata",
      date_format: "DD/MM/YYYY",
      time_format: "24h",
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      dashboard: {
        default_view: "overview",
        widgets: ["stats", "recent_activity", "pending_approvals"],
        refresh_interval: 30
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error("Get Admin Preferences Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update admin preferences
export const updateAdminPreferences = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const { theme, language, timezone, date_format, time_format, notifications, dashboard } = req.body;

    // In a real application, these would be stored in a user_preferences table
    const updatedPreferences = {
      theme: theme || "light",
      language: language || "en",
      timezone: timezone || "Asia/Kolkata",
      date_format: date_format || "DD/MM/YYYY",
      time_format: time_format || "24h",
      notifications: {
        email: notifications?.email !== undefined ? notifications.email : true,
        sms: notifications?.sms !== undefined ? notifications.sms : false,
        push: notifications?.push !== undefined ? notifications.push : true
      },
      dashboard: {
        default_view: dashboard?.default_view || "overview",
        widgets: dashboard?.widgets || ["stats", "recent_activity", "pending_approvals"],
        refresh_interval: dashboard?.refresh_interval || 30
      },
      updated_at: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error("Update Admin Preferences Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

