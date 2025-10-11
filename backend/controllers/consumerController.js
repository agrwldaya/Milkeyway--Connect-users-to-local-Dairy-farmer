import { pool } from "../config/database/database.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { uploadFiles } from "../utils/fileupload.js";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";


// Register Consumer
export const registerConsumer = async (req, res) => {
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
    let newConsumer = null;

   let consumerId;
if (existing.rows.length > 0 && !existing.rows[0].is_verified) {
  await pool.query(
    `UPDATE users 
     SET name=$1, email=$2, phone=$3, password=$4, role=$5, status=$6 
     WHERE id=$7`,
    [name, email, phone, hashedPassword, "consumer", "draft", existing.rows[0].id]
  );
  consumerId = existing.rows[0].id;
} else {
  const insertResult = await pool.query(
    `INSERT INTO users (name, email, phone, password, role, status) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, name, email, phone, role, status, created_at`,
    [name, email, phone, hashedPassword, "consumer", "draft"]
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
// Upload Consumer Documents
// export const uploadDocuments = async (req, res) => {
//   try {
//     const { user_id } = req.params;

    
//    //console.log(req.files);

//     if (!user_id) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }
//     // Check if farmer exists
//     const user = await pool.query("SELECT * FROM users WHERE id = $1 AND role = $2", [user_id, "farmer"]);
//     if (user.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "user not found" });
//     }

//     const farmer = await pool.query("SELECT * FROM farmer_profiles WHERE user_id=$1", [user_id]);
//     if (farmer.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Farmer profile not found" });
//     }
//     const farmer_id = farmer.rows[0].id;

//     // Check if files exist
//     if (!req.files || !req.files.farmer_doc) {
//       return res.status(400).json({ success: false, message: "No documents uploaded" });
//     }

//     // Upload files to Cloudinary
//     const { uploadedUrls, errors } = await uploadFiles(req.files,"farmer_doc" );
//     console.log("Uploaded URLs:", uploadedUrls);

//     let doc_type = 'unknown'; 
//     // Save file URLs into farmer_documents table
//     if (uploadedUrls.length > 0) {
//        doc_type = uploadedUrls.length > 0 ? uploadedUrls[0].split('.').pop() :'unknown';

//       const insertQuery = `
//         INSERT INTO documents (farmer_id, file_url, uploaded_at, doc_type)
//         VALUES ($1, $2, NOW(), $3)
//         RETURNING *;
//       `;

//       for (const url of uploadedUrls) {
//         await pool.query(insertQuery, [farmer_id, url,  doc_type]);
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Documents processed",
//       uploaded: uploadedUrls,
//       doc_type
//     });
//   } catch (error) {
//     console.error("Upload Documents Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

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

// Get nearby farmers based on consumer location
export const getNearbyFarmers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
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

// Get farmer details with products
export const getFarmerDetails = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!farmerId) {
      return res.status(400).json({ message: "Farmer ID is required" });
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
        p.product_name,
        p.description,
        p.price,
        p.unit,
        p.stock_quantity,
        p.product_image,
        c.category_name,
        mc.milk_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN milk_categories mc ON p.milk_category_id = mc.id
      WHERE p.farmer_id = $1
      ORDER BY p.created_at DESC
    `;

    const productsResult = await pool.query(productsQuery, [farmerId]);

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
        name: product.product_name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        stock: product.stock_quantity,
        image: product.product_image,
        category: product.category_name,
        milkCategory: product.milk_category_name
      }))
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


