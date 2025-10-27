import express from "express";
import {
  registerFarmer,
  completeFarmerProfile,
  updateFarmerLocation,
  uploadDocuments,
  submitProofDocuments,
  getFarmerDashboardStatus,
  loginFarmer,
  addProducts,
  getFarmerProducts,
  updateProducts,
  showcategories,
  getFarmerProfile,
  updateFarmerImage,
  updateFarmCover,
  getFarmerDashboardData,
} from "../controllers/farmerController.js";
import { verifyOtp } from "../controllers/autocontroller.js";
import { authMiddleware, verifyFarmer } from "../middleware/authMiddleWare.js";

const farmerRouter = express.Router();

// STEP 1 - Register basic farmer info (email + phone)
farmerRouter.post("/register", registerFarmer);

// STEP 2 - Verify OTP / email
farmerRouter.post("/verify", verifyOtp);

// STEP 3 - Complete farmer profile (personal + farm details)
farmerRouter.post("/profile/:user_id", completeFarmerProfile);

// STEP 3.5 - Update farmer location (latitude/longitude)
farmerRouter.post("/location/:user_id", updateFarmerLocation);

// STEP 4 - Upload documents (variation docs, ID proof, etc.)
farmerRouter.post("/upload-docs/:user_id", uploadDocuments);

// Submit proof documents (for farmers who haven't submitted yet)
farmerRouter.post("/submit-proof-docs/:user_id", authMiddleware, verifyFarmer, submitProofDocuments);

farmerRouter.post("/addproducts/:category_id/:milk_category_id", authMiddleware, verifyFarmer, addProducts);

farmerRouter.get("/products", authMiddleware, verifyFarmer, getFarmerProducts);

farmerRouter.put("/products/:product_id", authMiddleware, verifyFarmer, updateProducts);

farmerRouter.get("/showcategories", showcategories);
// login farmer
farmerRouter.post("/login", loginFarmer);

farmerRouter.get("/profile", authMiddleware, verifyFarmer, getFarmerProfile)

// Get farmer dashboard status and restrictions
farmerRouter.get("/dashboard-status", authMiddleware, verifyFarmer, getFarmerDashboardStatus);

// Get farmer dashboard data
farmerRouter.get("/dashboard", authMiddleware, verifyFarmer, getFarmerDashboardData);

farmerRouter.post("/update-farmer-image", authMiddleware, verifyFarmer, updateFarmerImage);
farmerRouter.post("/update-farm-cover", authMiddleware, verifyFarmer, updateFarmCover);

// Note: Request management functionality moved to connectionController.js
// Use: 
// - GET /api/v1/connections/farmer/requests
// - POST /api/v1/connections/farmer/requests/:requestId/respond

export default farmerRouter;
