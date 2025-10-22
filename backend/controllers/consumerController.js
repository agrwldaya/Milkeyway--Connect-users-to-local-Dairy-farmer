import { pool } from "../config/database/database.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { uploadFiles } from "../utils/fileupload.js";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";
// Note: Activity tracking moved to connectionController.js


// Register Consumer
export const registerConsumer = async (req, res) => {
  try {
    const { name, email, phone, password,pincode,country,state,city} = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !pincode || !country || !state || !city) {
      return res
        .status(400)
        .json({ message: "Name, email, phone, password, pincode, country, state and city are required" });
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
    let newConsumer = null;

   let consumerId;
if (existing.rows.length > 0 && !existing.rows[0].is_verified) {
  await pool.query(
    `UPDATE users 
     SET name=$1, email=$2, phone=$3, password=$4, role=$5, status=$6, pincode=$7, country=$8, state=$9, city=$10 
     WHERE id=$7`,
    [name, email, phone, hashedPassword, "consumer", "draft", existing.rows[0].id, pincode, country, state, city]
  );
  consumerId = existing.rows[0].id;
} else {
  const insertResult = await pool.query(
    `INSERT INTO users (name, email, phone, password, role, status, pincode, country, state, city) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
     RETURNING id, name, email, phone, role, status, pincode, country, state, city, created_at`,
    [name, email, phone, hashedPassword, "consumer", "draft", pincode, country, state, city]
  );
  consumerId = insertResult.rows[0].id;
}
    newConsumer = await pool.query("SELECT * FROM users WHERE id = $1", [consumerId]);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO user_verifications (user_id, otp, expires_at) 
       VALUES ($1, $2, $3)`,
      [consumerId, otp, expiresAt]
    );

    // Send email
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      message: "User registered. OTP sent to email.",
      userId: consumerId,
    });
  } catch (error) {
    console.error("Register Consumer Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete Consumer Profile
export const completeConsumerProfile = async (req, res) => {
  try {
    const {user_id} = req.params;
    const {
      address,
      latitude,
      longitude,
      preferred_radius_km,
    } = req.body;

    // Validate input
    if (!user_id || !address || !latitude || !longitude || !preferred_radius_km) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if consumer user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [user_id, "consumer"]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Consumer not found, create account" });
    }
    if (user.rows.length>0 && !user.rows[0].is_verified) {
      return res.status(404).json({ message: "Consumer not verified" });
    }

    // Check if consumer profile already exists
    const existingProfileCheck = await pool.query(
      "SELECT * FROM consumer_profiles  WHERE user_id = $1",
      [user_id]
    );
    if (existingProfileCheck.rows.length > 0) {
       //update existing profile
       await pool.query(
        `UPDATE consumer_profiles
         SET address=$1, preferred_radius_km=$2, latitude=$3, longitude=$4, status=$5
         WHERE user_id=$6`,
        [address, preferred_radius_km, latitude, longitude, "draft", user_id]
       );
    }
    else {
    // Insert new profile
    await pool.query(
      `INSERT INTO consumer_profiles (user_id, address, preferred_radius_km, latitude, longitude, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, address, preferred_radius_km, latitude, longitude, "active"]
    );
}
    await pool.query("update users set status = $1 where id=$2", ["active", user_id]);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refreshToken in DB
    await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [refreshToken, user_id]);

    // Set access token cookie (short-lived)
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
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
      message: "Profile completed successfully",
      user: {
        id: user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Complete Consumer Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Consumer Login
export const loginConsumer = async (req, res) => {  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email=$1 AND role=$2", [email, "consumer"]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Consumer not found" });
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
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
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

// Get nearby farmers based on consumer location
export const getNearbyFarmers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 20 } = req.query;
    
    console.log(latitude, longitude, radius);

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Convert to numbers
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    // SQL query to find farmers within radius using Haversine formula
    const query = `
      SELECT 
        f.id as farmer_id,
        u.name as farmer_name,
        u.email,
        u.phone,
        f.farm_name,
        f.address,
        f.latitude,
        f.longitude,
        f.delivery_radius_km,
        u.is_verified,
        f.status,
        fd.farm_image_url,
        fd.farmer_image_url,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(f.latitude)) * 
            cos(radians(f.longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(f.latitude))
          )
        ) AS distance_km,
        COUNT(p.id) as product_count
      FROM farmer_profiles f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN farmer_docs fd ON f.id = fd.farmer_id
      LEFT JOIN products p ON f.id = p.farmer_id
      WHERE f.status = 'approved' 
        AND f.latitude IS NOT NULL 
        AND f.longitude IS NOT NULL
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(f.latitude)) * 
            cos(radians(f.longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(f.latitude))
          )
        ) <= $3
      GROUP BY f.id, u.name, u.email, u.phone, f.farm_name, f.address, 
               f.latitude, f.longitude, f.delivery_radius_km, u.is_verified, f.status,
               fd.farm_image_url, fd.farmer_image_url
      ORDER BY distance_km ASC
    `;

    const result = await pool.query(query, [userLat, userLng, searchRadius]);

    // Format the response
    const farmers = result.rows.map(farmer => ({
      id: farmer.farmer_id,
      name: farmer.farm_name,
      owner: farmer.farmer_name,
      email: farmer.email,
      phone: farmer.phone,
      address: farmer.address,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      image: farmer.farm_image_url,
      coverImage: farmer.farmer_image_url,
      description: "Fresh dairy products from a trusted local farmer.",
      rating: 4.5, // Default rating since it's not in the current schema
      reviews: 0, // Default reviews since it's not in the current schema
      products: farmer.product_count || 0,
      distance: `${farmer.distance_km.toFixed(1)} km`,
      verified: farmer.is_verified,
      status: farmer.status,
      deliveryRadius: farmer.delivery_radius_km
    }));

    res.status(200).json({
      success: true,
      message: `Found ${farmers.length} farmers within ${searchRadius}km`,
      farmers,
      searchParams: {
        latitude: userLat,
        longitude: userLng,
        radius: searchRadius
      }
    });

  } catch (error) {
    console.error("Get Nearby Farmers Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const query = `
      SELECT id, name, imageurl 
      FROM categories 
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: result.rows
    });
    
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Get farmers by category
export const getFarmersByCategory = async (req, res) => {
  try {
    const { categoryId, latitude, longitude, radius = 10 } = req.query;
    
    //console.log("Received query params:", { categoryId, latitude, longitude, radius });

    if (!categoryId || !latitude || !longitude) {
      console.log("Missing required parameters:", { categoryId, latitude, longitude });
      return res.status(400).json({ 
        success: false, 
        message: "Category ID, latitude, and longitude are required" 
      });
    }

    // Convert to numbers
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    // Simple test query first
    const query = `
    SELECT 
      f.id AS farmer_id,
      u.name AS farmer_name,
      f.farm_name,
      f.address,
      f.latitude,
      f.longitude,
      p.name AS product_name,
      p.price_per_unit AS price_per_unit
    FROM farmer_profiles f
    JOIN users u ON f.user_id = u.id
    JOIN products p ON f.id = p.farmer_id
    WHERE f.status = 'approved'
      AND f.latitude IS NOT NULL
      AND f.longitude IS NOT NULL
      AND p.is_available = true
      AND p.category_id = $1
    LIMIT 10
  `;
  

    //console.log("Executing query with categoryId:", parseInt(categoryId));
    const result = await pool.query(query, [parseInt(categoryId)]);
    //console.log("Query result:", result.rows.length, "farmers found");
    
    // Format the response
    const farmers = result.rows.map(farmer => ({
      id: farmer.farmer_id,
      name: farmer.farm_name,
      owner: farmer.farmer_name,
      address: farmer.address,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      description: "Fresh dairy products from a trusted local farmer.",
      rating: 4.5, // Default rating
      reviews: 0, // Default reviews
      products: [{name: farmer.product_name, price: farmer.price_per_unit}], // Empty for now
      price: `₹${farmer.price_per_unit}`,
      distance: "0.0 km", // Default distance
      verified: false, // Default
      status: "approved"
    }));

    res.status(200).json({
      success: true,
      message: `Found ${farmers.length} farmers selling products in this category within ${searchRadius}km`,
      farmers,
      searchParams: {
        categoryId,
        latitude: userLat,
        longitude: userLng,
        radius: searchRadius
      }
    });

  } catch (error) {
    console.error("Get Farmers by Product Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Get farmer details with products
export const getFarmerDetails = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const consumerId = req.user.user_id;
     

    if (!farmerId || !consumerId) {
      return res.status(400).json({ message: "Farmer ID and consumer ID are required" });
    }

    // Get farmer profile
    const farmerQuery = `
      SELECT 
        f.id as farmer_id,
        u.name as farmer_name,
        u.email,
        u.phone,
        f.farm_name,
        f.address,
        f.latitude,
        f.longitude,
        f.delivery_radius_km,
        u.is_verified,
        f.status,
        fd.farm_image_url,
        fd.farmer_image_url,
        fd.farmer_proof_doc_url,
        fd.is_doc_verified
      FROM farmer_profiles f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN farmer_docs fd ON f.id = fd.farmer_id
      WHERE f.id = $1 AND f.status = 'approved'
    `;

    const farmerResult = await pool.query(farmerQuery, [farmerId]);

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farmer = farmerResult.rows[0];

    // Get farmer's products
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price_per_unit,
        p.unit,
        p.stock_quantity,
        c.imageurl as category_image,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.farmer_id = $1
      ORDER BY p.created_at DESC
    `;

    const productsResult = await pool.query(productsQuery, [farmerId]);

    const existingConnection = await pool.query("SELECT * FROM farmer_requests WHERE farmer_id = $1 AND consumer_id = $2", [farmerId, consumerId]);
    const existingConnectionStatus = existingConnection.rows.length > 0 ? existingConnection.rows[0].status : null;

     

    // Format the response
    const farmerData = {
      id: farmer.farmer_id,
      name: farmer.farm_name,
      owner: farmer.farmer_name,
      email: farmer.email,
      phone: farmer.phone,
      address: farmer.address,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      image: farmer.farm_image_url,
      coverImage: farmer.farmer_image_url,
      description: farmer.farm_description || "Fresh dairy products from a trusted local farmer.",
      rating: farmer.rating || 0,
      reviews: farmer.total_reviews || 0,
      deliveryRadius: farmer.delivery_radius_km,
      verified: farmer.is_verified,
      status: farmer.status,
      documents: farmer.farmer_proof_doc_url ? {
        farm_image_url: farmer.farm_image_url,
        farmer_image_url: farmer.farmer_image_url,
        farmer_proof_doc_url: farmer.farmer_proof_doc_url,
        is_doc_verified: farmer.is_doc_verified
      } : null,
      products: productsResult.rows.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price_per_unit,
        unit: product.unit,
        stock: product.stock_quantity,
        image: product.category_image,
        category: product.category_name
      })),
      existingConnectionStatus
    };

    res.status(200).json({
      success: true,
      farmer: farmerData
    });

  } catch (error) {
    console.error("Get Farmer Details Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// get consumer profile
export const getConsumerProfile = async (req, res) => {
  try {
    const consumerId = req.user.user_id;
    if(!consumerId) {
      return res.status(400).json({ message: "Consumer ID is required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE id = $1 AND role = $2", [consumerId, "consumer"]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    const consumerProfile = await pool.query("SELECT * FROM consumer_profiles WHERE user_id = $1", [consumerId]);
    if (consumerProfile.rows.length === 0) {
      return res.status(404).json({ message: "Consumer profile not found" });
    }
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${consumerProfile.rows[0].latitude}&lon=${consumerProfile.rows[0].longitude}&format=json`);
    const data = await response.json();

    console.log(data);
    const consumerProfileData = {
      name: user.rows[0].name,
      email: user.rows[0].email,
      phone: user.rows[0].phone,
      address: data.display_name,
      latitude: consumerProfile.rows[0].latitude,
      longitude: consumerProfile.rows[0].longitude,
      image: consumerProfile.rows[0].profile_image_url,
      preferredRadius: consumerProfile.rows[0].preferred_radius_km,
      status: user.rows[0].status,
      country: user.rows[0].country || data.address.country || null,
      state: user.rows[0].state || data.address.state || null,
      city: user.rows[0].city || data.address.state_district || null,
      pincode: user.rows[0].pincode || data.address.postcode || null,
      landmark: consumerProfile.rows[0].landmark || null,
      createdAt: user.rows[0].created_at
    };

    res.status(200).json({ message: "Consumer profile fetched successfully", consumerProfile: consumerProfileData });
  } catch (error) {
    console.error("Get Consumer Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get consumer connection data for dashboard
export const getConsumerConnectionData = async (req, res) => {
  try {
    const consumerId = req.user.user_id;
    if(!consumerId) {
      return res.status(400).json({ message: "Consumer ID is required" });
    }
    const connectionData = await pool.query("SELECT * FROM consumer_activity_summary WHERE consumer_id = $1", [consumerId]);
    const response = {
      totalRequests: connectionData.rows[0].total_requests_sent,
      totalActiveConnections: connectionData.rows[0].active_connections,
      totalAcceptedRequests: connectionData.rows[0].accepted_requests,
      totalRejectedRequests: connectionData.rows[0].rejected_requests,
      totalPendingRequests: connectionData.rows[0].pending_requests,
      requestSuccessRate: connectionData.rows[0].request_success_rate
    };
    res.status(200).json({ message: "Consumer connection data fetched successfully", connectionData: response });
  }
  catch (error) {
    console.error("Get Consumer Connection Data Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
