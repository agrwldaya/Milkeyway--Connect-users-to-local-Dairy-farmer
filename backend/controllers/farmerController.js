import { pool } from "../config/database/database.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { uploadFiles } from "../utils/fileupload.js";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";
// Note: Activity tracking moved to connectionController.js
 


// Register Farmer
export const registerFarmer = async (req, res) => {
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
    let newFarmer = null;

   let farmerId;
if (existing.rows.length > 0 && !existing.rows[0].is_verified) {
  await pool.query(
    `UPDATE users 
     SET name=$1, email=$2, phone=$3, password=$4, role=$5, status=$6, pincode=$7, country=$8, state=$9, city=$10 
     WHERE id=$7`,
    [name, email, phone, hashedPassword, "farmer", "draft", existing.rows[0].id, pincode, country, state, city]
  );
  farmerId = existing.rows[0].id;
} else {
  const insertResult = await pool.query(
    `INSERT INTO users (name, email, phone, password, role, status, pincode, country, state, city) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
     RETURNING id, name, email, phone, role, status, pincode, country, state, city, created_at`,
    [name, email, phone, hashedPassword, "farmer", "draft", pincode, country, state, city]
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
    if (!req.files) {
      return res.status(400).json({ success: false, message: "No documents uploaded" });
    }

    const { farm_image, farmer_image, farmer_proof_doc } = req.files;
    
    // At least farmer_proof_doc is required
    if (!farmer_proof_doc) {
      return res.status(400).json({ success: false, message: "Farmer proof document is required" });
    }

    let farm_image_url = null;
    let farmer_image_url = null;
    let farmer_proof_doc_url = null;

    // Upload farm image if provided
    if (farm_image) {
      const { uploadedUrls } = await uploadFiles({ farmer_doc: farm_image }, "farmer_doc");
      if (uploadedUrls.length > 0) {
        farm_image_url = uploadedUrls[0];
      }
    }

    // Upload farmer image if provided
    if (farmer_image) {
      const { uploadedUrls } = await uploadFiles({ farmer_doc: farmer_image }, "farmer_doc");
      if (uploadedUrls.length > 0) {
        farmer_image_url = uploadedUrls[0];
      }
    }

    // Upload farmer proof document (required)
    const { uploadedUrls } = await uploadFiles({ farmer_doc: farmer_proof_doc }, "farmer_doc");
    if (uploadedUrls.length > 0) {
      farmer_proof_doc_url = uploadedUrls[0];
    }

    // Check if farmer_docs record already exists
    const existingDocs = await pool.query("SELECT * FROM farmer_docs WHERE farmer_id = $1", [farmer_id]);
    
    if (existingDocs.rows.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE farmer_docs 
         SET farm_image_url=$1, farmer_image_url=$2, farmer_proof_doc_url=$3, updated_at=NOW()
         WHERE farmer_id=$4`,
        [farm_image_url, farmer_image_url, farmer_proof_doc_url, farmer_id]
      );
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO farmer_docs (farmer_id, farm_image_url, farmer_image_url, farmer_proof_doc_url)
         VALUES ($1, $2, $3, $4)`,
        [farmer_id, farm_image_url, farmer_image_url, farmer_proof_doc_url]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      uploaded: {
        farm_image_url,
        farmer_image_url,
        farmer_proof_doc_url
      }
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
    console.log(email, password);

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
      maxAge: 60 * 60 * 1000, // 60 min
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

// getfarmerprofile for dashboard
export const getFarmerProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const user = await pool.query("SELECT * FROM users WHERE id = $1 AND role = $2", [user_id, "farmer"]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    const farmInfo = await pool.query("select * from farmer_profiles where user_id=$1",[user_id]);
    if (farmInfo.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }
    const documents = await pool.query("select * from farmer_docs where farmer_id =$1",[farmInfo.rows[0].id]);

    const farmerProfile = {
      name: user.rows[0].name,
      email: user.rows[0].email,
      phone: user.rows[0].phone,
      farmName: farmInfo.rows[0].farm_name,
      address: farmInfo.rows[0].address,
      deliveryRadius: farmInfo.rows[0].delivery_radius_km,
      coordinates: {latitude: farmInfo.rows[0].latitude, longitude: farmInfo.rows[0].longitude},
      farmerStatus: farmInfo.rows[0].status,
      createdAt: farmInfo.rows[0].created_at,
      documents: documents.rows.length > 0 ? {
        farm_image_url: documents.rows[0].farm_image_url,
        farmer_image_url: documents.rows[0].farmer_image_url,
        farmer_proof_doc_url: documents.rows[0].farmer_proof_doc_url,
        is_doc_verified: documents.rows[0].is_doc_verified
      } : null
    }
    res.status(200).json({ message: "Farmer profile fetched successfully", farmerProfile });
  } catch (error) {
    console.error("Get Farmer Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const showcategories = async (req, res) => {
  try {
    // Fetch both category lists
    const categoriesResult = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    const milkCategoriesResult = await pool.query("SELECT * FROM milk_categories ORDER BY id ASC");

    // Send the clean data only (not query metadata)
    res.status(200).json({
      success: true,
      message: "Available product categories fetched successfully",
      categories: categoriesResult.rows,
      milkCategories: milkCategoriesResult.rows,
    });

  } catch (error) {
    console.error("Get showing product categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching product categories",
      error: error.message,
    });
  }
};

export const addProducts = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.body.userId; // prefer auth middleware
    const { category_id, milk_category_id } = req.params;
    const { unit,price_per_unit, description } = req.body;

    if (!category_id || !unit||  !price_per_unit || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // 1️⃣ Check user
    const user = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [userId, "farmer"]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    // 2️⃣ Check farmer profile
    const farmer = await pool.query(
      "SELECT * FROM farmer_profiles WHERE user_id = $1",
      [userId]
    );
    if (farmer.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }
    // 3️⃣ Get category name
    const categoryRes = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [category_id]
    );
    if (categoryRes.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    let productName = categoryRes.rows[0].name;

    // 4️⃣ Handle milk subcategory
    if (categoryRes.rows[0].name.toLowerCase() === "milk") {
      if (!milk_category_id) {
        return res.status(400).json({ message: "Milk type is required" });
      }
      const milkCatRes = await pool.query(
        "SELECT * FROM milk_categories WHERE id = $1",
        [milk_category_id]
      );
      if (milkCatRes.rows.length === 0) {
        return res.status(404).json({ message: "Milk category not found" });
      }
      productName = `${milkCatRes.rows[0].milk_cattle} Milk`;
    }

    // 5️⃣ Insert product
    const farmerId = farmer.rows[0].id;
    await pool.query(
      `INSERT INTO products 
        (farmer_id, category_id, name, description, price_per_unit,unit, is_available) 
       VALUES ($1, $2, $3, $4, $5, $6,$7)`,
      [farmerId, category_id, productName, description, price_per_unit,unit, true]
    );

    res.status(201).json({ success: true, message: "Product added successfully!" });

  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding product",
      error: error.message,
    });
  }
};

export const getFarmerProducts = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.body.userId; // prefer auth middleware

    // 1️⃣ Verify user role
    const user = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [userId, "farmer"]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // 2️⃣ Get farmer profile
    const farmerProfile = await pool.query(
      "SELECT * FROM farmer_profiles WHERE user_id = $1",
      [userId]
    );

    if (farmerProfile.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    const farmerId = farmerProfile.rows[0].id;

    // 3️⃣ Get all products of this farmer
    const products = await pool.query(
      `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price_per_unit,
          p.unit,
          p.is_available,
          p.created_at,
          c.name AS category_name,
          c.imageurl AS image_url,
          mc.milk_cattle AS milk_type
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN milk_categories mc ON p.name ILIKE CONCAT('%', mc.milk_cattle, '%')
        WHERE p.farmer_id = $1
        ORDER BY p.created_at DESC
      `,
      [farmerId]
    );

    if (products.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products added yet.",
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Farmer products fetched successfully",
      products: products.rows,
    });

  } catch (error) {
    console.error("Get Farmer Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching products",
      error: error.message,
    });
  }
};

export const updateProducts = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.body.userId; // prefer auth middleware
    const { product_id } = req.params;
    const { unit, price_per_unit, description, is_available } = req.body;

    if (!product_id || !unit || !price_per_unit || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Check user
    const user = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [userId, "farmer"]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // 2️⃣ Check farmer profile
    const farmer = await pool.query(
      "SELECT * FROM farmer_profiles WHERE user_id = $1",
      [userId]
    );
    if (farmer.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    const farmerId = farmer.rows[0].id;

    // 3️⃣ Check if product belongs to this farmer
    const productCheck = await pool.query(
      "SELECT * FROM products WHERE id = $1 AND farmer_id = $2",
      [product_id, farmerId]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: "Product not found or access denied" });
    }

    // 4️⃣ Update product
    await pool.query(
      `UPDATE products 
       SET unit=$1, price_per_unit=$2, description=$3, is_available=$4, updated_at=NOW()
       WHERE id=$5 AND farmer_id=$6`,
      [unit, price_per_unit, description, is_available !== undefined ? is_available : true, product_id, farmerId]
    );

    res.status(200).json({ success: true, message: "Product updated successfully!" });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating product",
      error: error.message,
    });
  }
};

export const updateFarmerImage = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.body.userId; // prefer auth middleware
    // const {profile_image} = req.files;
    console.log("UserID:", userId);
    // console.log("File:", req.files.profile_image);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    const farmer = await pool.query("SELECT * FROM farmer_profiles WHERE user_id=$1", [userId]);
    if (farmer.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }
    const farmer_id = farmer.rows[0].id;
    const farmer_docs = await pool.query("SELECT * FROM farmer_docs WHERE farmer_id=$1", [farmer_id]);
    if (farmer_docs.rows.length === 0) {
      return res.status(404).json({ message: "Farmer documents not found, upload documents first" });
    }
      // Check if file is present 
    if (!req.files || !req.files.profile_image) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
     
    const { uploadedUrls } = await uploadFiles({ farmer_doc: req.files.profile_image }, "farmer_doc");
    if (uploadedUrls.length === 0) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    // Save the uploaded image URLs to the database
    await pool.query(
      "UPDATE farmer_docs SET farmer_image_url = $1 WHERE farmer_id = $2",
      [uploadedUrls[0], farmer_id]  
    );
    res.status(200).json({ message: "Farmer image updated successfully", imageUrl: uploadedUrls[0] }); 

  } catch (error) {
    console.error("Update Farmer Image Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const updateFarmCover = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.body.userId; // prefer auth middleware
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // console.log("UserID:", userId);
    //console.log("File:", req.files.cover_image);
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }
   // console.log("users:", user.rows[0]);
    const farmer = await pool.query("SELECT * FROM farmer_profiles WHERE user_id=$1", [userId]);
    if (farmer.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }
    //console.log("farmer:", farmer.rows[0]);
    const farmer_id = farmer.rows[0].id;
    const farmer_docs = await pool.query("SELECT * FROM farmer_docs WHERE farmer_id=$1", [farmer_id]);
    if (farmer_docs.rows.length === 0) {
      return res.status(404).json({ message: "Farmer documents not found, upload documents first" });
    }
    //console.log("farmer_docs:", farmer_docs.rows[0]);

      // Check if file is present 

    if (!req.files || !req.files.cover_image) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const { uploadedUrls } = await uploadFiles({ farmer_doc: req.files.cover_image }, "farmer_doc");

    if (uploadedUrls.length === 0) {
      return res.status(500).json({ message: "Image upload failed" });
    }
    //console.log("Uploaded URLs:", uploadedUrls);
    // Save the uploaded image URLs to the database
    await pool.query(
      "UPDATE farmer_docs SET farm_image_url = $1 WHERE farmer_id = $2",
      [uploadedUrls[0], farmer_id]  
    );
    //console.log("Farmer image URL updated in DB");
    res.status(200).json({ message: "Farmer image updated successfully", imageUrl: uploadedUrls[0] }); 

  } catch (error) {
    console.error("Update Farmer Image Error:", error);
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Note: getFarmerRequests and respondToRequest functions moved to connectionController.js
// Use: 
// - GET /api/v1/connections/farmer/requests
// - POST /api/v1/connections/farmer/requests/:requestId/respond




