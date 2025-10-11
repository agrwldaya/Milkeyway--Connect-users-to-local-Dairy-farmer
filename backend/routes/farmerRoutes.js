import express from "express";
import {
  registerFarmer,
  completeFarmerProfile,
  uploadDocuments,
  loginFarmer,
  addProducts,
  getFarmerProducts,
  updateProducts,
  showcategories,
  getFarmerProfile,
  updateFarmerImage,
  updateFarmCover,
} from "../controllers/farmerController.js";
import { verifyOtp } from "../controllers/autocontroller.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";

const farmerRouter = express.Router();

// STEP 1 - Register basic farmer info (email + phone)
farmerRouter.post("/register", registerFarmer);

// STEP 2 - Verify OTP / email
farmerRouter.post("/verify", verifyOtp);

// STEP 3 - Complete farmer profile (personal + farm details)
farmerRouter.post("/profile/:user_id", completeFarmerProfile);

// STEP 4 - Upload documents (variation docs, ID proof, etc.)
farmerRouter.post("/upload-docs/:user_id", uploadDocuments);

farmerRouter.post("/addproducts/:category_id/:milk_category_id", authMiddleware , addProducts);

farmerRouter.get("/products", authMiddleware, getFarmerProducts);

farmerRouter.put("/products/:product_id", authMiddleware, updateProducts);

farmerRouter.get("/showcategories", showcategories);
// login farmer
farmerRouter.post("/login", loginFarmer);

farmerRouter.get("/profile", authMiddleware, getFarmerProfile)

farmerRouter.post("/update-farmer-image", authMiddleware, updateFarmerImage);
farmerRouter.post("/update-farm-cover", authMiddleware, updateFarmCover);

export default farmerRouter;
