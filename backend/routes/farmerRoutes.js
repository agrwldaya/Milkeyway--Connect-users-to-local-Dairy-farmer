import express from "express";
import {
  registerFarmer,
  completeFarmerProfile,
  uploadDocuments,
  loginFarmer,
} from "../controllers/farmerController.js";
import { verifyOtp } from "../controllers/autocontroller.js";

const farmerRouter = express.Router();

// STEP 1 - Register basic farmer info (email + phone)
farmerRouter.post("/register", registerFarmer);

// STEP 2 - Verify OTP / email
farmerRouter.post("/verify", verifyOtp);

// STEP 3 - Complete farmer profile (personal + farm details)
farmerRouter.post("/profile/:user_id", completeFarmerProfile);

// STEP 4 - Upload documents (variation docs, ID proof, etc.)
farmerRouter.post("/upload-docs/:user_id", uploadDocuments);

// // GET - Get single farmer by id
// farmerRouter.get("/:farmerId", getFarmerById);

// // PUT - Update farmer info
// farmerRouter.put("/:farmerId", updateFarmer);

// // GET - Get all farmers (admin use case)
// farmerRouter.get("/", getAllFarmers);

// // DELETE - Delete farmer (admin use case)
// farmerRouter.delete("/:farmerId", deleteFarmer);

// login farmer
farmerRouter.post("/login", loginFarmer);

export default farmerRouter;
