import express from "express";
import {
  registerConsumer,
  completeConsumerProfile,
  loginConsumer,
} from "../controllers/consumerController.js";
import { verifyOtp } from "../controllers/autocontroller.js";

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


export default consumerRouter;
