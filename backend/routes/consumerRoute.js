import express from "express";
import {
  registerConsumer,
  completeConsumerProfile,
  loginConsumer,
  getNearbyFarmers,
  getFarmerDetails,
  getCategories,
  getFarmersByCategory,
  getConsumerProfile,
  getConsumerConnectionData,
} from "../controllers/consumerController.js";
import { verifyOtp } from "../controllers/autocontroller.js";
import { authMiddleware, verifyConsumer } from "../middleware/authMiddleWare.js";

const consumerRouter = express.Router();

// STEP 1 - Register basic consumer info (email + phone)
consumerRouter.post("/register", registerConsumer);

// STEP 2 - Verify OTP / email
consumerRouter.post("/verify", verifyOtp);

// STEP 3 - Complete consumer profile (personal + farm details)
consumerRouter.post("/profile/:user_id", completeConsumerProfile);

// // STEP 4 - Upload documents (variation docs, ID proof, etc.)
// consumerRouter.post("/upload-docs/:user_id", uploadDocuments);

//login consumer
consumerRouter.post("/login", loginConsumer);

// Get nearby farmers based on location
consumerRouter.get("/nearby-farmers", getNearbyFarmers);

// Get specific farmer details with products
consumerRouter.get("/farmer/:farmerId", authMiddleware, verifyConsumer, getFarmerDetails);

 

// Get all categories
consumerRouter.get("/categories", getCategories);

// Get farmers by category
consumerRouter.get("/farmers-by-category", getFarmersByCategory);

// Get consumer profile
consumerRouter.get("/profile", authMiddleware, verifyConsumer, getConsumerProfile);

// get consumers connection data for dashboard
consumerRouter.get("/connection-data", authMiddleware, verifyConsumer, getConsumerConnectionData);

export default consumerRouter;
