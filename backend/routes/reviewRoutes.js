import express from "express";
import {
  addReview,
  getFarmerReviews,
  getConsumerReviews,
  addFarmerResponse,
  markReviewHelpful,
  getTopRatedFarmers,
  updateReview,
  deleteReview,
  getFarmerReviewStats
} from "../controllers/reviewController.js";
import { authMiddleware, verifyFarmer, verifyConsumer } from "../middleware/authMiddleWare.js";

const router = express.Router();

// Add a new review (Consumer only)
router.post("/", authMiddleware, verifyConsumer, addReview);

// Get reviews for a specific farmer (Public)
router.get("/farmer/:farmerId", getFarmerReviews);

// Get reviews written by a specific consumer (Consumer only)
router.get("/consumer/my-reviews", authMiddleware, verifyConsumer, getConsumerReviews);

// Add farmer response to a review (Farmer only)
router.post("/:reviewId/response", authMiddleware, verifyFarmer, addFarmerResponse);

// Mark review as helpful/unhelpful (Consumer only)
router.post("/:reviewId/helpful", authMiddleware, verifyConsumer, markReviewHelpful);

// Get top-rated farmers (Public)
router.get("/top-rated", getTopRatedFarmers);

// Update a review (Consumer only)
router.put("/:reviewId", authMiddleware, verifyConsumer, updateReview);

// Delete a review (Consumer only)
router.delete("/:reviewId", authMiddleware, verifyConsumer, deleteReview);

// Get farmer review statistics (Public)
router.get("/farmer/:farmerId/stats", getFarmerReviewStats);

export default router;
